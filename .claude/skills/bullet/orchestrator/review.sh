#!/usr/bin/env bash
# review — spawn a reviewer session for an issue sitting in bullet:review. One spawn per tick.
# Verdict reading + fixer launching live in monitor.sh; this is only the reviewer launcher.
# Rounds: coder DONE → reviewer #1 → REVIEW: FIXED n → fixer → FIXED: applied → reviewer #2 → CLEAN → done.
# shellcheck shell=bash
set -u
BULLET_HOME="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
. "$BULLET_HOME/lib/config.sh"
. "$BULLET_HOME/lib/forge.sh"
. "$BULLET_HOME/lib/tmux.sh"
. "$BULLET_HOME/lib/agent.sh"

bullet_load_config "${1:?usage: review <target-repo-dir>}"
require_deps

for n in $(forge_list_issues "bullet:review" | jq -r '.[].number'); do
  rs=$(session_for reviewer "$n")
  tmux_has "$rs" && { echo "review: #$n reviewer live"; continue; }
  tmux_has "$(session_for fixer "$n")" && { echo "review: #$n fixer live"; continue; }

  # last milestone on the thread decides: a pending REVIEW verdict is monitor's business;
  # after the fixer's FIXED: applied a FRESH reviewer round starts (same session name is free
  # again because the previous reviewer was killed by monitor)
  last=$(issue_comments_bodies "$n" 30 | while IFS= read -r b; do verdict_normalize "$b"; done \
         | grep -E '^(REVIEW:|FIXED: applied)' | tail -1)
  case $last in
    REVIEW:*) echo "review: #$n verdict pending — monitor owns it"; continue ;;
  esac

  free=$(role_free reviewer)
  (( free > 0 )) || { echo "review: no free reviewer slot"; break; }
  title=$(forge_issue "$n" | jq -r '.title')
  wt=$(agent_ensure_worktree "$n" "$title") || { echo "review: #$n worktree missing"; continue; }
  branch=$(git -C "$wt" branch --show-current)
  prompt=$(agent_compose reviewer "$n" "$title" "$(forge_issue "$n" | jq -r '.body // ""')" "$wt" "$branch") || continue
  if agent_spawn "$rs" "$wt" "$REVIEWER_MODEL" "$prompt"; then
    forge_comment "$n" "bullet: reviewer launched (model \`$REVIEWER_MODEL\`, independent of coder)."
    echo "review: #$n reviewer launched"
  fi
  break   # one spawn per tick
done
