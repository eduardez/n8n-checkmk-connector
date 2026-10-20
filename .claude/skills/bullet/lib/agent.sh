#!/usr/bin/env bash
# agent.sh — agent lifecycle helpers shared by orchestrator phases.
# shellcheck shell=bash

slugify() { echo "$1" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]\+/-/g; s/^-\+//; s/-\+$//; s/-\{4,\}/-/g' | cut -c1-30; }

state_file() { echo "$RUN_DIR/state/issue-$1.json"; }

st_write() { # ISSUE KEY VALUE — upsert one key in the run state json
  local f; f=$(state_file "$1")
  if [[ -f $f ]]; then jq --arg k "$2" --arg v "$3" '.[$k]=$v' "$f" > "$f.tmp" && mv "$f.tmp" "$f"
  else jq -nc --arg k "$2" --arg v "$3" '{($k):$v}' > "$f"; fi
}

st_get() { jq -r --arg k "$2" '.[$k] // ""' "$(state_file "$1")" 2>/dev/null; }

st_budget_reset() { # ISSUE — human requeue resets the fixer budget (the ONLY re-arm path)
  local f; f=$(state_file "$1")
  [[ -f $f ]] || return 0
  jq 'del(.fixer_rounds)' "$f" > "$f.tmp" && mv "$f.tmp" "$f"
}

issue_comments_bodies() { # ISSUE [LIMIT] -> comment bodies, oldest first
  forge_comments "$1" "${2:-20}" | jq -r '.[].body' 2>/dev/null
}

issue_says() { # ISSUE ERE -> 0 if any comment body matches (POSIX ERE, grep -E)
  issue_comments_bodies "$1" | grep -qE "$2"
}

last_verdict() { # ISSUE -> last DONE/PARTIAL/BLOCKED line from the coder (markdown-tolerant)
  issue_comments_bodies "$1" 30 | while IFS= read -r b; do verdict_normalize "$b"; done \
    | grep -E '^(DONE|PARTIAL|BLOCKED)' | tail -1
}

# review_verdict_sha FILE -> the commit sha a reviewer's FINAL verdict binds to (fleet T2).
# Reads the review report (meta/issue-N.review.md), not the thread: review.md is the durable
# verdict record a relaunch would re-verify. Empty when absent or verdict-less.
review_verdict_sha() {
  [[ -f $1 ]] || return 0
  local line
  line=$(verdict_normalize "$(cat "$1")" | grep -E '^REVIEW: ' | tail -1)
  printf '%s' "$line" | grep -oE 'commit [0-9a-f]{7,40}' | head -1 | cut -d' ' -f2
}

# agent_ensure_worktree ISSUE TITLE -> echoes worktree path; creates branch+worktree idempotently
agent_ensure_worktree() {
  local n=$1 title=$2 wt branch
  wt="$RUN_DIR/worktrees/issue-$n"
  branch="issue/$n-$(slugify "$title")"
  mkdir -p "$RUN_DIR/worktrees"
  [[ -d $wt ]] || {
    git -C "$TARGET" fetch origin --quiet || true
    git -C "$TARGET" worktree add -b "$branch" "$wt" "origin/$TRUNK" >/dev/null 2>&1 \
      || git -C "$TARGET" worktree add "$wt" "$branch" >/dev/null 2>&1 \
      || { echo "bullet: worktree add failed for #$n" >&2; return 1; }
  }
  git -C "$wt" rev-parse --verify "$branch" >/dev/null 2>&1 || { echo "bullet: branch missing in $wt" >&2; return 1; }
  echo "$wt"
}

# agent_compose ROLE ISSUE TITLE BODY WORKTREE BRANCH -> prompt file path
agent_compose() {
  local role=$1 n=$2 title=$3 body=$4 wt=$5 branch=$6 out
  out="$RUN_DIR/meta/issue-$n.$role.md"
  python3 "$BULLET_HOME/lib/compose.py" "$BULLET_HOME/prompts/$role.md" \
    --set FORGE_HOST="$FORGE_URL" \
    --set FJ_HOST="$FORGE_URL" \
    --set FJ_REPO="$BULLET_REPO" \
    --set REPO="$BULLET_REPO" \
    --set WORKTREE="$wt" \
    --set BRANCH="$branch" \
    --set TRUNK="$TRUNK" \
    --set SHIP="$SHIP" \
    --set ISSUE="$n" \
    --set ISSUE_TITLE="$title" \
    --set ISSUE_BODY="$body" \
    --set PLAN_PATH="$RUN_DIR/meta/issue-$n.plan.md" \
    --set REPORT_PATH="$RUN_DIR/meta/issue-$n.report.md" \
    --set REVIEW_REPORT_PATH="$RUN_DIR/meta/issue-$n.review.md" \
    --set BUDGET_MIN="$BUDGET_MIN" \
    --set STALL_MIN="$STALL_MIN" \
    --set KILL_MIN="$KILL_MIN" \
    --set GATES="${GATES[*]:- (none configured; keep the diff minimal and verified)}" \
    > "$out" || return 1
  echo "$out"
}

# agent_spawn SESSION WORKTREE MODEL PROMPT_FILE — one-shot omp run in tmux.
# Uses `omp -p` (print mode): the process EXITS when the agent finishes, so session-alive
# ⇔ work running and process-exit = deterministic completion. No idle-TUI limbo, no trust
# in the agent quitting (the old interactive flow left zombie sessions blocking locks).
agent_spawn() {
  local session=$1 wt=$2 model=$3 prompt=$4
  if [[ -n ${BULLET_DRY_RUN:-} ]]; then
    echo "DRY: would spawn $session in $wt (model $model, prompt $prompt)" >&2
    return 0
  fi
  export PATH="$HOME/.bun/bin:$PATH"
  # prompt goes through a FILE, never inline: tmux re-parses the command string with the user's
  # shell, so backticks/quotes inside a composed prompt would execute as command substitution.
  # The tmux string carries LITERAL PATHS only; agent-run.sh does the cat + omp call itself.
  local pfile="$RUN_DIR/meta/$session.cmd"   # session name contains '/', so no leading dot (hidden-dir trap)
  mkdir -p "$(dirname "$pfile")"
  cp "$prompt" "$pfile"
  tmux new-session -d -s "$session" -c "$wt" \
    "$BULLET_HOME/lib/agent-run.sh $pfile $model" || return 1
  return 0
}

session_for() { # ROLE ISSUE -> session name unique per repo (repo slug from BULLET_REPO)
  local letter; case $1 in coder) letter=c;; reviewer) letter=r;; fixer) letter=f;; conflict) letter=i;; reconcile) letter=x;; *) letter=x;; esac
  echo "bullet-${BULLET_REPO//\\//-}-$letter-$2"
}

role_slots() { case $1 in coder) echo $CODER_SLOTS;; reviewer) echo $REVIEWER_SLOTS;; fixer) echo $FIXER_SLOTS;; conflict|reconcile) echo 1;; esac; }

role_model() { case $1 in coder) echo "$CODER_MODEL";; reviewer) echo "$REVIEWER_MODEL";; fixer) echo "$FIXER_MODEL";; conflict|reconcile) echo "$CODER_MODEL";; esac; }

role_free() { # ROLE -> free slots for THIS role (per-role counting; global 10-live cap still applies)
  local total live mine room avail letter
  case $1 in
    coder) letter=c ;; reviewer) letter=r ;; fixer) letter=f ;; conflict) letter=i ;; reconcile) letter=x ;;
    *) echo 0; return 0 ;;
  esac
  total=$(role_slots "$1")
  live=$(tmux ls 2>/dev/null | grep -cE '^bullet-[^ ]+-[crfix]-[0-9]+:' || true)
  mine=$(tmux ls 2>/dev/null | grep -cE "^bullet-${BULLET_REPO//\\//-}-${letter}-[0-9]+:" || true)
  (( live < 10 )) || { echo 0; return 0; }
  room=$(( 10 - live ))
  avail=$(( total - mine )); (( avail < 0 )) && avail=0
  (( avail > room )) && avail=$room
  echo $avail
}
