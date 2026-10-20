#!/usr/bin/env bash
# integrate — merge finished issue branches into bullet-develop (the shared integration branch).
# Runs in a DEDICATED worktree checked out on bullet-develop; issue branches are merged from
# origin/<branch> (remote truth) so orchestrator resets can never eat agent commits.
# Conflicts: a conflict-solver agent owns the worktree until it pushes; orchestrator stands down.
# Law: agents merge into bullet-develop only; trunk is human territory (publish.sh opens the PRs).
# shellcheck shell=bash
set -u
BULLET_HOME="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
. "$BULLET_HOME/lib/config.sh"
. "$BULLET_HOME/lib/forge.sh"
. "$BULLET_HOME/lib/agent.sh"
. "$BULLET_HOME/lib/state.sh"
. "$BULLET_HOME/lib/tmux.sh"

bullet_load_config "${1:?usage: integrate <target-repo-dir>}"
require_deps

INTEGRATE_BRANCH="bullet-develop"
INTEGRATE_WT="$RUN_DIR/worktrees/$INTEGRATE_BRANCH"
[[ $TRUNK != "$INTEGRATE_BRANCH" ]] || die "integration branch must differ from trunk"

# conflict-solver owns the integration worktree while it lives — one writer at a time
live_solver=$(tmux ls 2>/dev/null | grep -E "^bullet-.*-i-[0-9]+:" | cut -d: -f1 | head -1 || true)
if [[ -n $live_solver ]]; then echo "integrate: conflict-solver live ($live_solver) — standing down"; exit 0; fi

mkdir -p "$RUN_DIR/worktrees"
git -C "$TARGET" fetch origin --quiet || true

# dedicated worktree on the integration branch (create branch from trunk when first needed)
if ! git -C "$TARGET" show-ref --verify -q "refs/heads/$INTEGRATE_BRANCH"; then
  if git -C "$TARGET" ls-remote --exit-code --heads origin "$INTEGRATE_BRANCH" >/dev/null 2>&1; then
    git -C "$TARGET" branch "$INTEGRATE_BRANCH" "origin/$INTEGRATE_BRANCH"
  else
    git -C "$TARGET" branch "$INTEGRATE_BRANCH" "origin/$TRUNK"
  fi
fi
if [[ ! -d $INTEGRATE_WT ]]; then
  git -C "$TARGET" worktree add "$INTEGRATE_WT" "$INTEGRATE_BRANCH" >/dev/null 2>&1 \
    || { echo "integrate: cannot attach integration worktree"; exit 1; }
fi
# sync integration branch to remote (or trunk if the remote branch vanished)
if git -C "$TARGET" ls-remote --exit-code --heads origin "$INTEGRATE_BRANCH" >/dev/null 2>&1; then
  base="origin/$INTEGRATE_BRANCH"
else
  base="origin/$TRUNK"
fi
git -C "$INTEGRATE_WT" reset --hard "$base" -q

# SOLVER POST-MORTEM GATE (fleet T3, incidents #39/#40/#42/#46): a killed/timed-out
# conflict-solver can leave conflict markers COMMITTED or a half-merged tree (dangling
# MERGE_HEAD, staged unmerged paths). Mechanical gate, not operator memory: BEFORE the
# branch is accepted (pushed or integrated=1), the merged tree must be marker-free,
# index-clean, and pass every repo gate. Any failure = solver round re-dispatched.
integration_wedge() { # -> 0 if the tree carries solver debris (markers / unmerged index)
  git -C "$INTEGRATE_WT" ls-files -u --deduplicate 2>/dev/null | grep -q . && return 0
  [[ -f "$INTEGRATE_WT/.git/MERGE_HEAD" ]] || [[ -f "$(git -C "$INTEGRATE_WT" rev-parse --git-dir)/MERGE_HEAD" ]] && return 0
  git -C "$INTEGRATE_WT" grep -lE '^(<{7}|>{7})' -- . 2>/dev/null | grep -q . && return 0
  return 1
}

spawn_solver() { # ISSUE — hand the worktree to a conflict-solver agent
  local n=$1 title rs
  git -C "$INTEGRATE_WT" merge --abort 2>/dev/null || true
  git -C "$INTEGRATE_WT" reset --hard "$base" -q      # solver restarts the merge itself
  title=$(forge_issue "$n" | jq -r '.title')
  rs=$(session_for conflict "$n")
  prompt=$(agent_compose conflict "$n" "$title" "$(forge_issue "$n" | jq -r '.body // ""')" "$INTEGRATE_WT" "$(st_get "$n" branch)")
  if agent_spawn "$rs" "$INTEGRATE_WT" "$CODER_MODEL" "$prompt"; then
    forge_comment "$n" "bullet: merge conflicts with \`$INTEGRATE_BRANCH\` — conflict-solver agent owns the worktree until it pushes."
    echo "integrate: #$n conflict-solver launched"
  fi
}

for n in $(forge_list_issues "bullet:done" | jq -r '[.[] | .number] | sort[] '); do
  [[ $(st_get "$n" integrated) == 1 ]] && continue
  branch=$(st_get "$n" branch)
  if [[ -z $branch ]]; then
    # self-heal: derive the branch from the forge slug and verify it on origin (state file
    # loss must not spam the thread or stall integration)
    guess="issue/$n-$(slugify "$(forge_issue "$n" | jq -r '.title')")"
    if git -C "$TARGET" ls-remote --exit-code --heads origin "$guess" >/dev/null 2>&1; then
      branch=$guess
      st_write "$n" branch "$branch"
      echo "integrate: #$n branch recovered from origin: $branch"
    else
      issue_says "$n" "no branch recorded" || \
        forge_comment "$n" "bullet: no branch recorded — cannot integrate."
      continue
    fi
  fi
  # merge from the REMOTE branch — the local ref may be stale (worktree resets); origin is truth
  if ! git -C "$TARGET" ls-remote --exit-code --heads origin "$branch" >/dev/null 2>&1; then
    issue_says "$n" "not on origin" || \
      forge_comment "$n" "bullet: branch \`$branch\` not on origin — cannot integrate."
    continue
  fi

  if ! git -C "$INTEGRATE_WT" merge --no-ff --no-edit "origin/$branch" 2> "$RUN_DIR/logs/integrate-$n.log"; then
    spawn_solver "$n"
    break   # the worktree now belongs to the solver — nothing else may run in it
  fi

  # post-mortem check FIRST (cheap, mechanical): markers committed or half-merged tree
  # = the solver died mid-merge — re-dispatch, never push or mark integrated
  if integration_wedge; then
    git -C "$INTEGRATE_WT" reset --hard "$base" -q    # branch NOT accepted; solver restarts clean
    forge_comment "$n" "bullet: solver post-mortem on \`$INTEGRATE_BRANCH\` found conflict markers / half-merged tree — solver round re-dispatched (branch not accepted)."
    echo "integrate: #$n solver wedge detected — re-dispatch"
    spawn_solver "$n"
    break
  fi

  # deps for gates (setup: hook, e.g. `bun install`), then gates on the merged tree
  for s in "${SETUP[@]}"; do (cd "$INTEGRATE_WT" && eval "$s") >/dev/null 2>&1 || true; done
  gate_fail=""
  for g in "${GATES[@]}"; do
    if ! (cd "$INTEGRATE_WT" && eval "$g"); then gate_fail=$g; break; fi
  done
  if [[ -n $gate_fail ]]; then
    git -C "$INTEGRATE_WT" reset --hard "$base" -q    # never push a red integration branch
    forge_comment "$n" "bullet: gates red on integration (\`$gate_fail\`) — conflict-solver agent reconciles."
    spawn_solver "$n"
    break   # solver owns the worktree
  fi

  if git -C "$INTEGRATE_WT" push origin "HEAD:refs/heads/$INTEGRATE_BRANCH"; then
    st_write "$n" integrated 1
    forge_comment "$n" "bullet: merged into \`$INTEGRATE_BRANCH\` — integration gates green."
    echo "integrate: #$n merged into $INTEGRATE_BRANCH"
  else
    forge_comment "$n" "bullet: integration push failed — retry next tick."
  fi
  break   # one integration per tick
done
