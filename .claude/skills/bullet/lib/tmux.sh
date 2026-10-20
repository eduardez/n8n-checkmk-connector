#!/usr/bin/env bash
# tmux.sh — agent session management. One session per agent slot.
# shellcheck shell=bash

tmux_has() { tmux has-session -t "$1" 2>/dev/null; }

# agent_mtime SESSION -> seconds since last pane output, empty if unknown
tmux_mtime() {
  local ts
  ts=$(tmux display-message -p -t "$1" '#{session_activity}' 2>/dev/null) || return 0
  [[ -n $ts ]] || return 0
  echo $(( $(date +%s) - ts ))
}

tmux_lastline() { tmux capture-pane -p -t "$1" 2>/dev/null | grep -v '^[[:space:]]*$' | tail -1; }

# agent_send FILE SESSION — paste a file into a session, then Enter (prompt must land after TUI ready)
agent_send() {
  local file=$1 session=$2
  tmux load-buffer "$file" && tmux paste-buffer -t "$session" && sleep 1 && tmux send-keys -t "$session" Enter
}

# agent_alive SESSION -> 0/1 by transcript freshness (omp writes every turn)
agent_alive() { # SESSION TRANSCRIPT_GLOB STALL_MIN
  local newest
  newest=$(ls -t ${2} 2>/dev/null | head -1)
  [[ -n $newest ]] || return 0
  local age=$(( $(date +%s) - $(stat -c %Y "$newest") ))
  (( age < $3 * 60 )) || { tmux_has "$1" && tmux kill-session -t "$1" 2>/dev/null; return 1; }
  return 0
}
