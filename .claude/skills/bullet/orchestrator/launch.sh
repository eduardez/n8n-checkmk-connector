#!/usr/bin/env bash
# launch — claim queued issues into free coder slots (≤1 launch per tick keeps ticks short).
# shellcheck shell=bash
set -u
BULLET_HOME="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
. "$BULLET_HOME/lib/config.sh"
. "$BULLET_HOME/lib/forge.sh"
. "$BULLET_HOME/lib/tmux.sh"
. "$BULLET_HOME/lib/agent.sh"
. "$BULLET_HOME/lib/state.sh"

bullet_load_config "${1:?usage: launch <target-repo-dir>}"
require_deps

free=$(role_free coder)
(( free > 0 )) || { echo "launch: no free coder slot"; exit 0; }

# oldest queued issue first
issues=$(forge_list_issues "bullet:queued" | jq -r '[.[] | {n:.number, t:.title}] | sort_by(.n)[] | "\(.n)\t\(.t)"')
[[ -n $issues ]] || { echo "launch: queue empty"; exit 0; }

while IFS=$'\t' read -r n title; do
  [[ -n $n ]] || continue
  # claim: guard + label swap (queued -> running) BEFORE any local work
  if ! st_to_running "$n"; then continue; fi   # lost race or gone: skip
  body=$(forge_issue "$n" | jq -r '.body // ""')
  wt=$(agent_ensure_worktree "$n" "$title") || { st_to_blocked "$n"; forge_comment "$n" "bullet: worktree create failed — blocked."; continue; }
  branch="issue/$n-$(slugify "$title")"
  prompt=$(agent_compose coder "$n" "$title" "$body" "$wt" "$branch") || { st_to_blocked "$n"; forge_comment "$n" "bullet: prompt compose failed — blocked."; continue; }
  session=$(session_for coder "$n")
  if agent_spawn "$session" "$wt" "$CODER_MODEL" "$prompt"; then
    st_write "$n" branch "$branch"; st_write "$n" worktree "$wt"; st_write "$n" role coder
    forge_comment "$n" "bullet: coder launched on branch \`$branch\` (model \`$CODER_MODEL\`)."
    echo "launch: #$n → $session"
  else
    st_to_blocked "$n"
    forge_comment "$n" "bullet: agent spawn failed — blocked."
  fi
  break   # one launch per tick
done <<< "$issues"
