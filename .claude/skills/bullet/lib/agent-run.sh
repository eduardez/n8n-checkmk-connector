#!/usr/bin/env bash
# agent-run.sh — the ONLY thing tmux runs for an agent session.
# Receives prompt FILE PATH + model as literal argv — the tmux command line contains paths only,
# never prompt text: nothing in the string can be parsed as command substitution by the login
# shell (zsh ate a backtick-laden prompt on 2026-10-13; file-reading happens HERE, not in tmux).
set -u
PROMPT_FILE=${1:?usage: agent-run.sh <prompt-file> <model>}
MODEL=${2:?model}
export PATH="$HOME/.bun/bin:$PATH"
OMP_BIN=${OMP_BIN:-$HOME/.bun/bin/omp}
exec "$OMP_BIN" --model "$MODEL" --auto-approve -p "$(cat "$PROMPT_FILE")"
