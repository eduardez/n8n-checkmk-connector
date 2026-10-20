#!/usr/bin/env bash
# status.sh — fleet overview. Read-only.
# shellcheck shell=bash
set -u
BULLET_HOME="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
. "$BULLET_HOME/lib/config.sh"
. "$BULLET_HOME/lib/forge.sh"
. "$BULLET_HOME/lib/tmux.sh"
. "$BULLET_HOME/lib/agent.sh"

bullet_load_config "${1:?usage: status.sh <target-repo-dir>}"

echo "repo:      $BULLET_REPO @ $FORGE_URL (trunk: $TRUNK, ship: $SHIP)"
echo "agents:    $AGENTS (coder $CODER_SLOTS / reviewer $REVIEWER_SLOTS / fixer $FIXER_SLOTS)"
echo "models:    coder=$CODER_MODEL reviewer=$REVIEWER_MODEL fixer=$FIXER_MODEL"
echo
for label in queued running review done blocked; do
  issues=$(forge_list_issues "bullet:$label" | jq -r '.[].number' | tr '\n' ' ')
  printf '  %-16s %s\n' "bullet:$label" "${issues:-—}"
done
echo
live=$(tmux ls 2>/dev/null | grep -E "^bullet-${BULLET_REPO//\\//-}-[crfix]-[0-9]+:" || true)
if [[ -n $live ]]; then
  echo "live sessions:"
  echo "$live" | while IFS=: read -r name rest; do
    n=${name##*-}
    age=$(tmux_mtime "$name")
    printf '  %-40s idle %ss  last: %s\n' "$name" "${age:-?}" "$(tmux_lastline "$name" | cut -c1-60)"
  done
else
  echo "live sessions: none"
fi
