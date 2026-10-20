#!/usr/bin/env bash
# monitor — advance running/review issues by reading the issue threads (agents comment; the forge
# is the state store, so monitoring = reading comments, not scraping panes). One action per tick.
# shellcheck shell=bash
set -u
BULLET_HOME="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
. "$BULLET_HOME/lib/config.sh"
. "$BULLET_HOME/lib/forge.sh"
. "$BULLET_HOME/lib/tmux.sh"
. "$BULLET_HOME/lib/agent.sh"
. "$BULLET_HOME/lib/verdict.sh"
. "$BULLET_HOME/lib/state.sh"

bullet_load_config "${1:?usage: monitor <target-repo-dir>}"
require_deps

acted=0

# --- running -> review (coder posted DONE/PARTIAL) or -> blocked (BLOCKED) ---
for n in $(forge_list_issues "bullet:running" | jq -r '.[].number'); do
  (( acted )) && break
  s=$(session_for coder "$n")
  last=$(last_verdict "$n")
  case $last in
    BLOCKED*)
      acted=1
      tmux kill-session -t "$s" 2>/dev/null || true
      st_to_blocked "$n"
      forge_comment "$n" "bullet: coder reported BLOCKED — parked. Remove \`bullet:blocked\` to requeue." ;;
    DONE*|PARTIAL*)
      acted=1
      tmux kill-session "$s" 2>/dev/null || true
      st_to_review "$n"
      forge_comment "$n" "bullet: implementation finished ($last) — moving to review." ;;
    *)
      : ;;  # no verdict yet — preflight handles stalls
  esac
done

# --- review -> done (CLEAN) / blocked (NEEDS-DECISION) / fixer (FIXED n) ---
for n in $(forge_list_issues "bullet:review" | jq -r '.[].number'); do
  (( acted )) && break
  rs=$(session_for reviewer "$n")
  # verdict routing (lib/verdict.sh — unit-tested): verdicts are reports; comment-ID freshness
  # decides whether a FIXED verdict still maps to a fixer round or to a fresh reviewer
  comments=$(forge_comments "$n" 30 | jq -r '.[] | "\(.id)\t\(.body)"' 2>/dev/null)
  # verdicts arrive markdown-decorated (report.md renders `**Verdict:** \`REVIEW: …\``):
  # normalize each body to its protocol line BEFORE matching (lib/verdict.sh, fleet fix T1)
  norm=""
  while IFS= read -r line; do
    [[ $line == *$'\t'* ]] || continue
    norm+="${line%%$'\t'*}"$'\t'"$(verdict_normalize "${line#*$'\t'}")"$'\n'
  done <<<"$comments"
  v_line=$(printf '%s\n' "$norm" | grep -E $'\t''REVIEW: ' | tail -1)
  [[ -n $v_line ]] || continue
  v_id=$(printf '%s' "$v_line" | cut -f1); v_body=$(printf '%s' "$v_line" | cut -f2-)
  f_id=$(printf '%s\n' "$norm" | grep -E $'\t''FIXED:' | tail -1 | cut -f1)
  route=$(verdict_route "$v_body" "$v_id" "$f_id")
  # verdicts bind to the commit they examined (reviewer-law) — ALL kinds, not just CLEAN:
  # a verdict over an old commit routes to a fresh review of the current head
  if [[ $route == clean || $route == fixed || $route == needs_decision ]]; then
    if wt=$(agent_ensure_worktree "$n" "$(forge_issue "$n" | jq -r '.title')"); then
      head=$(git -C "$wt" rev-parse --short HEAD 2>/dev/null || true)
      vsha=$(printf '%s' "$v_body" | grep -oE 'commit [0-9a-f]{7,40}' | head -1 | cut -d' ' -f2)
      [[ -n $vsha && -n $head && $head != "$vsha" ]] && { route=fresh_review; echo "monitor: #$n verdict was for $vsha, head is $head — re-review"; }
    fi
  fi
  case $route in
    "") continue ;;
    needs_decision)
      tmux kill-session -t "$rs" 2>/dev/null || true
      st_to_blocked_r "$n"
      forge_comment "$n" "bullet: review needs a decision — parked. Remove \`bullet:blocked\` to requeue."
      acted=1; break ;;
    clean)
      tmux kill-session -t "$rs" 2>/dev/null || true
      st_to_done "$n"
      forge_comment "$n" "bullet: review CLEAN — ready to publish."
      acted=1; break ;;
    fresh_review)
      # FRESHNESS PING-PONG GUARD (fleet T2, incident #41): a reviewer verdict over a sha the
      # fixer never moved makes every fresh-review relaunch "verify" an unchanged tree —
      # churn until both fixer rounds are burned. If (a) a FINAL verdict in meta review.md
      # binds the CURRENT head, (b) the head is unchanged since the PREVIOUS fresh-review
      # tick (settle_head checkpoint), and (c) both fixer rounds are spent, the verdict is
      # SETTLED: transition per the state machine instead of relaunching.
      if ! tmux_has "$rs" && [[ -n ${head:-} ]] \
         && [[ $(st_get "$n" settle_head) == "${head:-}" ]] && (( $(st_get "$n" fixer_rounds) >= 2 )); then
        rsha=$(review_verdict_sha "$RUN_DIR/meta/issue-$n.review.md")
        if [[ -n $rsha && $rsha == "$head" ]]; then
          tmux kill-session -t "$rs" 2>/dev/null || true
          st_to_done "$n"
          st_write "$n" settle_head ""
          forge_comment "$n" "bullet: verdict over commit \`$rsha\` re-confirmed with head unchanged across fixer rounds — settled as review-complete. Human: if more work is needed, requeue (remove \`bullet:done\`, add \`bullet:queued\`)."
          echo "monitor: #$n freshness ping-pong — verdict settled (head $head unchanged)"
          acted=1; break
        fi
      fi
      [[ -n ${head:-} ]] && st_write "$n" settle_head "${head:-}"   # checkpoint for the next fresh-review tick
      # fixer applied its round — fresh reviewer session, independent eyes on the result
      if ! tmux_has "$rs" && (( $(role_free reviewer) > 0 )); then
        title=$(forge_issue "$n" | jq -r '.title')
        wt=$(agent_ensure_worktree "$n" "$title") || { echo "monitor: #$n worktree missing"; continue; }
        prompt=$(agent_compose reviewer "$n" "$title" "$(forge_issue "$n" | jq -r '.body // ""')" "$wt" "$(git -C "$wt" branch --show-current)") || continue
        agent_spawn "$rs" "$wt" "$REVIEWER_MODEL" "$prompt" && { acted=1; forge_comment "$n" "bullet: fixer round done — fresh reviewer re-checking."; echo "monitor: #$n fresh reviewer round"; }
      fi
      # can't act (reviewer live / no slot)? move on — one wedged issue must not starve the rest
      (( acted )) && break ;;
    fixed)
      # verdict newer than any fixer report — ONE fixer round per verdict, then re-route
      fs=$(session_for fixer "$n")
      tmux_has "$fs" && continue
      wt=$(agent_ensure_worktree "$n" "$(forge_issue "$n" | jq -r '.title')") || wt=""
      head=$(git -C "$wt" rev-parse --short HEAD 2>/dev/null || true)
      rounds=$(st_get "$n" fixer_rounds); rounds=${rounds:-0}
      # FRESHNESS PING-PONG GUARD (fleet T2, incident #41): a reviewer verdict over a sha the
      # fixer never moved makes every relaunch "verify" an unchanged tree and burns both fixer
      # rounds. If (a) a FINAL verdict in meta review.md binds the CURRENT head, (b) the head
      # is unchanged since the PREVIOUS fixed-route tick (settle_head checkpoint), and (c) both
      # fixer rounds are spent, the verdict is SETTLED: transition per the state machine
      # instead of relaunching.
      if [[ -n $head ]] && [[ $(st_get "$n" settle_head) == "$head" ]] && (( rounds >= 2 )); then
        rsha=$(review_verdict_sha "$RUN_DIR/meta/issue-$n.review.md")
        if [[ -n $rsha && $rsha == "$head" ]]; then
          tmux kill-session -t "$fs" 2>/dev/null || true
          st_to_done "$n"
          st_write "$n" settle_head ""
          forge_comment "$n" "bullet: verdict over commit \`$rsha\` re-confirmed with head unchanged across fixer rounds — settled as review-complete. Human: if more work is needed, requeue (remove \`bullet:done\`, add \`bullet:queued\`)."
          echo "monitor: #$n freshness ping-pong — verdict settled (head $head unchanged)"
          acted=1; break
        fi
      fi
      [[ -n $head ]] && st_write "$n" settle_head "$head"   # checkpoint for the next fixed-route tick
      if (( rounds >= 2 )); then
        st_to_blocked_r "$n"
        forge_comment "$n" "bullet: fixer round budget exhausted ($rounds rounds) — parked for a human. Remove \`bullet:blocked\` to requeue."
        acted=1; break
      fi
      free=$(role_free fixer)
      if (( free > 0 )); then
        title=$(forge_issue "$n" | jq -r '.title')
        wt=$(agent_ensure_worktree "$n" "$title")
        if [[ -n $wt ]]; then
          branch=$(git -C "$wt" branch --show-current)
          prompt=$(agent_compose fixer "$n" "$title" "$(forge_issue "$n" | jq -r '.body // ""')" "$wt" "$branch")
          if agent_spawn "$fs" "$wt" "$FIXER_MODEL" "$prompt"; then
            st_write "$n" fixer_rounds "$(( rounds + 1 ))"
            forge_comment "$n" "bullet: fixer launched (round $(( rounds + 1 ))/2)."
            echo "monitor: #$n fixer launched (round $(( rounds + 1 ))/2)"
            acted=1
          fi
        fi
      fi
      (( acted )) && break ;;
  esac
done

# --- conflict-solver lifecycle: solver session = worktree lock; reap it once its merge landed ---
# The solver's contract: push bullet-develop, THEN post `INTEGRATED:`. Comment present + branch
# (when known) already an ancestor of origin/bullet-develop → work is done, session is idle.
INTEGRATE_BRANCH="bullet-develop"
git -C "$TARGET" fetch origin --quiet || true
for s in $(tmux ls 2>/dev/null | grep -E "^bullet-${BULLET_REPO//\\//-}-i-[0-9]+:" | cut -d: -f1); do
  n=${s##*-i-}
  issue_says "$n" '^INTEGRATED:' || continue
  branch=$(st_get "$n" branch)
  if [[ -z $branch ]] || git -C "$TARGET" merge-base --is-ancestor "origin/$branch" "origin/$INTEGRATE_BRANCH" 2>/dev/null; then
    tmux kill-session -t "$s" 2>/dev/null || true
    acted=1
    echo "monitor: solver for #$n finished — session reaped"
  fi
done
# conciliation agents (role x): reaped once the trunk is an ancestor of bullet-develop
for s in $(tmux ls 2>/dev/null | grep -E "^bullet-${BULLET_REPO//\\//-}-x-[0-9]+:" | cut -d: -f1); do
  if git -C "$TARGET" merge-base --is-ancestor "origin/$TRUNK" "origin/$INTEGRATE_BRANCH" 2>/dev/null; then
    tmux kill-session -t "$s" 2>/dev/null || true
    acted=1
    echo "monitor: conciliation agent finished — session reaped"
  fi
done

(( acted )) || echo "monitor: no transitions"
