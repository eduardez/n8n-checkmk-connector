#!/usr/bin/env bash
# preflight — crash sweep + fleet reconciliation. Safe to run on every tick, before any phase.
# BT-02: verifies state labels exist; creates missing ones WITH a notice (never silent).
# shellcheck shell=bash
set -u
BULLET_HOME="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
. "$BULLET_HOME/lib/config.sh"
. "$BULLET_HOME/lib/forge.sh"
. "$BULLET_HOME/lib/tmux.sh"
. "$BULLET_HOME/lib/agent.sh"
. "$BULLET_HOME/lib/verdict.sh"
. "$BULLET_HOME/lib/state.sh"

bullet_load_config "${1:?usage: preflight <target-repo-dir>}"
require_deps

# 0. labels present? missing ones are created after an explicit notice (BT-02)
bullet_ensure_labels
if [[ -n ${BULLET_UNATTENDED:-} ]] && [[ -n ${_BULLET_LABELS_CREATED:-} ]]; then
  first=$(forge_list_issues "bullet:queued" | jq -r '.[0].number // ""')
  [[ -n $first ]] && forge_comment "$first" \
    "bullet: first run on this repo — created the state labels (\`bullet:queued running review done blocked\`). Queue issues by adding \`bullet:queued\`."
fi

# 1. dead tmux session but no transcript progress → clean stale session records
for s in $(tmux ls 2>/dev/null | cut -d: -f1 | grep -E '^bullet-' || true); do
  [[ $s =~ ^bullet-.*-[crfix]-[0-9]+$ ]] || continue
  n=${s##*-}
  # if issue no longer carries running/review label, the phase is over — kill the session
  case ",$(st_issue_labels "$n")," in
    *bullet:running*|*bullet:review*) : ;;
    *) tmux kill-session -t "$s" 2>/dev/null || true ;;
  esac
done

# 2. stalled agents: stall → nudge once; kill → kill session + blocked label
for s in $(tmux ls 2>/dev/null | cut -d: -f1 | grep -E '^bullet-' || true); do
  [[ $s =~ ^bullet-.*-[crfix]-[0-9]+$ ]] || continue
  n=${s##*-}
  age=$(tmux_mtime "$s"); [[ -n $age ]] || continue
  if (( age > KILL_MIN * 60 )); then
    tmux kill-session -t "$s" 2>/dev/null || true
    st_to_blocked "$n"
    st_to_blocked_r "$n"
    forge_comment "$n" "bullet: session stalled > ${KILL_MIN}m — killed, marked blocked. Requeue by removing \`bullet:blocked\`."
  elif (( age > STALL_MIN * 60 )); then
    tmux send-keys -t "$s" Enter 2>/dev/null || true
  fi
done

# 2.5 DEAD session on a live issue: the stall loop above only sees LIVE sessions, so a coder
# whose tmux died (crash, OOM, kill) would sit in bullet:running forever.
# FLEET T4 (incident #35): if the dead coder left a FINAL report (meta/issue-N.report.md
# outcome DONE/PARTIAL — report.md is the durable verdict record, the transcript is gone),
# the work is finished: treat the report as the coder's last word and hand off to review.
# Relaunching would redo the work and re-burn the session budget. BLOCKED still parks.
for n in $(forge_list_issues "bullet:running" | jq -r '.[].number'); do
  s=$(session_for coder "$n")
  if ! tmux_has "$s"; then
    report="$RUN_DIR/meta/issue-$n.report.md"
    outcome=""
    if [[ -f $report ]]; then
      outcome=$(verdict_normalize "$(cat "$report")" | grep -oE '(DONE|PARTIAL|BLOCKED)' | head -1)
    fi
    if [[ $outcome == DONE || $outcome == PARTIAL ]]; then
      st_to_review "$n"
      forge_comment "$n" "bullet: coder session died but report.md records outcome \`$outcome\` — treating as complete, moving to review."
      echo "preflight: #$n dead coder + final report → review"
      continue
    fi
    if [[ $outcome =~ ^(Outcome: )?BLOCKED ]]; then
      st_to_blocked "$n"
      forge_comment "$n" "bullet: coder session died; report.md records BLOCKED — parked. Remove \`bullet:blocked\` to requeue."
      echo "preflight: #$n dead coder + BLOCKED report → blocked"
      continue
    fi
    title=$(forge_issue "$n" | jq -r '.title')
    wt=$(agent_ensure_worktree "$n" "$title") || { echo "preflight: #$n worktree missing"; continue; }
    branch=$(git -C "$wt" branch --show-current)
    prompt=$(agent_compose coder "$n" "$title" "$(forge_issue "$n" | jq -r '.body // ""')" "$wt" "$branch") || continue
    if agent_spawn "$s" "$wt" "$CODER_MODEL" "$prompt"; then
      forge_comment "$n" "bullet: coder session died — relaunched from committed state (branch \`$branch\`)."
      echo "preflight: #$n coder relaunched (session was dead)"
    fi
  fi
done

# 3.5 human requeue sweep: an issue that lost `bullet:blocked` without the fleet moving it
# is a manual requeue — reset its fixer budget (the ONLY re-arm path; see STATE-MACHINE.md)
for f in "$RUN_DIR"/state/issue-*.json; do
  [[ -f $f ]] || continue
  n=${f##*/}; n=${n#issue-}; n=${n%.json}
  case ",$(st_issue_labels "$n")," in
    *bullet:blocked*|*bullet:queued*|*bullet:running*|*bullet:review*|*bullet:done*) : ;;
    *) st_budget_reset "$n"
       forge_comment "$n" "bullet: requeued by human — fixer budget reset, coder will start fresh." ;;
  esac
done

# 3. orphan worktrees (no matching label) — remove, branch stays on the forge
for d in "$RUN_DIR"/worktrees/issue-*; do
  [[ -d $d ]] || continue
  n=${d##*-}
  case ",$(st_issue_labels "$n")," in
    *bullet:running*|*bullet:review*) : ;;
    *) git -C "$TARGET" worktree remove --force "$d" 2>/dev/null || true ;;
  esac
done

echo "preflight ok: $(tmux ls 2>/dev/null | grep -c '^bullet-' || true) agent session(s) live"
