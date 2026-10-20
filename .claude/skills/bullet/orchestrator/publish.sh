#!/usr/bin/env bash
# publish — the PR layer.
# Topology: every finished issue gets its own PR issue-branch → bullet-develop, which bullet
# AUTO-MERGES (gates already ran on that exact merged tree in integrate.sh — the tree IS tested).
# Exactly ONE rolling PR bullet-develop → trunk stays open for the human; bullet refreshes its
# body every tick and never merges it. If the trunk moved under it (409/405), a conciliation
# agent reconciles trunk → bullet-develop so the rolling PR becomes clean again.
# shellcheck shell=bash
set -u
BULLET_HOME="$(cd "$(dirname "${BASH_SOURCE[0]}")/.."; pwd)"
. "$BULLET_HOME/lib/config.sh"
. "$BULLET_HOME/lib/forge.sh"
. "$BULLET_HOME/lib/agent.sh"
. "$BULLET_HOME/lib/state.sh"
. "$BULLET_HOME/lib/tmux.sh"

bullet_load_config "${1:?usage: publish <target-repo-dir>}"
require_deps

INTEGRATE_BRANCH="bullet-develop"
ROLL_BASE="$TRUNK"

# --- helpers -------------------------------------------------------------
forge_pr_comment() { # PR BODY — comments on the PR's issue thread (same endpoint, PR# = issue#)
  forge_comment "$1" "$2"
}

roll_body() { # -> refreshed rolling-PR body: the open issue PRs are the integrated list
  local list
  list=$(forge_api GET "/repos/$BULLET_REPO/pulls?state=open&limit=50" | jq -r --arg b "$INTEGRATE_BRANCH" '[.[] | select(.base.ref==$b) | "- PR #\(.number) — \(.title)"] | sort | join("\n")')
  printf '%s\n\n' "**Rolling PR.** All bullet work lands on \`$INTEGRATE_BRANCH\` via per-issue PRs (auto-merged after review + gates). Merge this single PR into \`$TRUNK\` when satisfied."
  [[ -n $list ]] && printf 'Integrated issues:\n%s\n\n' "$list"
  printf 'Automated by bullet: implemented → reviewed (independent model) → gates green → auto-merged into %s. Trunk is human territory; this PR is the one button the human presses.' "$INTEGRATE_BRANCH"
}

# --- reconcile agent owns the integration worktree while it lives --------
live_reconciler=$(tmux ls 2>/dev/null | grep -E "^bullet-.*-x-[0-9]+:" | cut -d: -f1 | head -1 || true)
if [[ -n $live_reconciler ]]; then echo "publish: conciliation agent live ($live_reconciler) — standing down"; exit 0; fi

mkdir -p "$RUN_DIR/logs" "$RUN_DIR/meta" "$RUN_DIR/worktrees"
git -C "$TARGET" fetch origin --quiet || true

# ============================================================================
# A. per-issue PRs → bullet-develop, auto-merged (gates already green upstream)
# ============================================================================
for n in $(forge_list_issues "bullet:done" | jq -r '[.[] | .number] | sort[] '); do
  branch=$(st_get "$n" branch)
  # fully published? PR recorded in state + merged = never touch it again — but close any
  # leftover open per-issue PR first (the rolling PR is the only open face of bullet work)
  if [[ -n $(st_get "$n" pr) && $(st_get "$n" merged) == 1 ]]; then
    leftover=$(forge_api GET "/repos/$BULLET_REPO/pulls?state=open&limit=50" | jq -r --arg b "$branch" '[.[] | select(.head.ref==$b)][0].number // ""')
    [[ -z $leftover ]] || { forge_api PATCH "/repos/$BULLET_REPO/pulls/$leftover" '{"state":"closed"}' >/dev/null; forge_comment "$n" "bullet: PR #$leftover closed — work already merged into \`$INTEGRATE_BRANCH\`."; }
    continue
  fi
  if [[ -z $branch ]]; then
    guess="issue/$n-$(slugify "$(forge_issue "$n" | jq -r '.title')")"
    if git -C "$TARGET" ls-remote --exit-code --heads origin "$guess" >/dev/null 2>&1; then
      branch=$guess; st_write "$n" branch "$branch"
      echo "publish: #$n branch recovered from origin"
    fi
  fi
  [[ -n $branch ]] || { forge_comment "$n" "bullet: no branch recorded — cannot publish."; continue; }

  # branch must exist on origin before a PR can reference it — recreate worktree if lost,
  # snap to local truth, push (idempotent)
  wt="$RUN_DIR/worktrees/issue-$n"
  if [[ ! -d $wt ]]; then
    git -C "$TARGET" fetch origin --quiet || true
    git -C "$TARGET" worktree add "$wt" "$branch" >/dev/null 2>&1 \
      || git -C "$TARGET" worktree add -b "$branch" "$wt" "origin/$TRUNK" >/dev/null 2>&1 \
      || { forge_comment "$n" "bullet: worktree gone and unrecoverable — cannot publish."; continue; }
    git -C "$wt" checkout -B "$branch"  -q 2>/dev/null || true
    for s in "${SETUP[@]:-}"; do [[ -n $s ]] && (cd "$wt" && eval "$s") >/dev/null 2>&1 || true; done
  fi
  if ! git -C "$wt" push -u origin "$branch" 2>&1 | grep -qE "rejected|error"; then
    :
  else
    forge_comment "$n" "bullet: push failed — retry next tick."; continue
  fi

  # already integrated earlier (pre-rolling era or healed state)? mark and move on — never
  # re-merge an ancestor (would 409-loop and drag the conciliation agent into old history)
  if git -C "$TARGET" merge-base --is-ancestor "origin/$branch" "origin/$INTEGRATE_BRANCH" 2>/dev/null; then
    st_write "$n" merged 1
    # close the per-issue PR — work is in bullet-develop; the rolling PR is the only open face
    openpr=$(forge_api GET "/repos/$BULLET_REPO/pulls?state=open&limit=50" | jq -r --arg b "$branch" '[.[] | select(.head.ref==$b)][0].number // ""')
    [[ -n $openpr ]] && { forge_api PATCH "/repos/$BULLET_REPO/pulls/$openpr" '{"state":"closed"}' >/dev/null; forge_comment "$n" "bullet: PR #$openpr closed — work already merged into \`$INTEGRATE_BRANCH\`."; }
    # migration hygiene: close any leftover old-topology PR (head=$branch, base=$TRUNK)
    stale=$(forge_api GET "/repos/$BULLET_REPO/pulls?state=open&limit=50" | jq -r --arg b "$branch" --arg t "$TRUNK" '[.[] | select(.head.ref==$b) | select(.base.ref==$t)][0].number // ""')
    if [[ -n $stale ]]; then
      forge_api PATCH "/repos/$BULLET_REPO/pulls/$stale" '{"state":"closed"}' >/dev/null
      forge_comment "$n" "bullet: stale PR #$stale ($branch → \`$TRUNK\`) closed — work flows via \`$INTEGRATE_BRANCH\`; trunk receives it through the single rolling PR."
    fi
    [[ -n $(st_get "$n" pr) ]] || forge_comment "$n" "bullet: work already merged into \`$INTEGRATE_BRANCH\`."
    continue
  fi

  # PR for this head ALREADY TARGETING the integration branch? reuse; else create.
  # (base filter is the migration guard: pre-rolling PRs targeted trunk — never reuse those)
  pr=$(forge_api GET "/repos/$BULLET_REPO/pulls?state=open&limit=50" | jq -r --arg b "$branch" --arg t "$INTEGRATE_BRANCH" '[.[] | select(.head.ref==$b) | select(.base.ref==$t)][0].number // ""')
  if [[ -z $pr ]]; then
    # old-topology PR open (head=$branch, base=$TRUNK)? close it — trunk PRs are not bullet's
    stale=$(forge_api GET "/repos/$BULLET_REPO/pulls?state=open&limit=50" | jq -r --arg b "$branch" --arg t "$TRUNK" '[.[] | select(.head.ref==$b) | select(.base.ref==$t)][0].number // ""')
    if [[ -n $stale ]]; then
      forge_api PATCH "/repos/$BULLET_REPO/pulls/$stale" '{"state":"closed"}' >/dev/null
      forge_comment "$n" "bullet: stale PR #$stale ($branch → \`$TRUNK\`) closed — work flows via \`$INTEGRATE_BRANCH\`; trunk receives it through the single rolling PR."
    fi
    title=$(forge_issue "$n" | jq -r '.title')
    pr=$(forge_open_pr "$branch" "$INTEGRATE_BRANCH" "$title" \
         "$(printf 'Implements **#%s**.\n\nRefs #%s\n\nAutomated by bullet: reviewed (independent model) → gates green on merged tree. Auto-merge follows.' "$n" "$n")")
    [[ -n $pr ]] && forge_comment "$n" "bullet: PR #$pr open → \`$INTEGRATE_BRANCH\` (auto-merge follows)."
  fi
  [[ -n $pr ]] || { forge_comment "$n" "bullet: PR create failed — retry next tick."; continue; }
  st_write "$n" pr "$pr"

  # auto-merge: integrate.sh already ran gates on THIS exact merged tree — the tree is tested
  code=$(forge_merge_pr "$pr") && {
    st_write "$n" merged 1
    forge_comment "$n" "bullet: PR #$pr auto-merged into \`$INTEGRATE_BRANCH\`."
    echo "publish: #$n auto-merged via PR #$pr"
    git -C "$TARGET" worktree remove --force "$RUN_DIR/worktrees/issue-$n" 2>/dev/null || true
  } || case $code in
    409|405)   # integration branch moved / merge blocked → conciliation agent owns the worktree
      st_write "$n" merged 0
      rs=$(session_for reconcile "$n")
      tmux has-session -t "$rs" 2>/dev/null && break   # reconciler for this issue already owns it
      wt="$RUN_DIR/worktrees/$INTEGRATE_BRANCH"
      mkdir -p "$RUN_DIR/worktrees"
      [[ -d $wt ]] || git -C "$TARGET" worktree add "$wt" "$INTEGRATE_BRANCH" >/dev/null 2>&1 \
        || { forge_comment "$n" "bullet: merge blocked (HTTP $code) and integration worktree unavailable — manual reconciliation needed."; continue; }
      git -C "$wt" reset --hard "origin/$INTEGRATE_BRANCH" -q
      prompt=$(agent_compose reconcile "$n" "Rolling PR divergence" "" "$wt" "$INTEGRATE_BRANCH")
      if agent_spawn "$rs" "$wt" "$(role_model reconcile)" "$prompt"; then
        forge_comment "$n" "bullet: merge blocked (HTTP $code) — conciliation agent merges trunk work into \`$INTEGRATE_BRANCH\`; PR auto-merges next tick."
      else
        forge_comment "$n" "bullet: merge blocked (HTTP $code) — conciliation agent failed to launch; manual reconciliation needed."
      fi
      break   # the worktree now belongs to the reconciler — nothing else runs in it
      ;;
    *) forge_comment "$n" "publish: auto-merge failed (HTTP $code) — retry next tick." ;;
  esac
  break   # one publish action per tick
done

# ============================================================================
# B. the ONE rolling PR: bullet-develop → trunk, refreshed every tick
# ============================================================================
if git -C "$TARGET" ls-remote --exit-code --heads origin "$INTEGRATE_BRANCH" >/dev/null 2>&1; then
  pr=$(forge_api GET "/repos/$BULLET_REPO/pulls?state=open&limit=50" | jq -r --arg b "$INTEGRATE_BRANCH" --arg t "$TRUNK" '[.[] | select(.head.ref==$b) | select(.base.ref==$t)][0].number // ""')
  if [[ -z $pr ]]; then
    # reuse any previous rolling PR (closed-but-NOT-merged reopens; a merged one is history)
    pr=$(forge_api GET "/repos/$BULLET_REPO/pulls?state=all&limit=50" | jq -r --arg b "$INTEGRATE_BRANCH" --arg t "$TRUNK" '[.[] | select(.head.ref==$b) | select(.base.ref==$t) | select(.state=="closed" and .merged==false)][0].number // ""')
    if [[ -n $pr ]]; then
      forge_api PATCH "/repos/$BULLET_REPO/pulls/$pr" '{"state":"open"}' >/dev/null
      echo "publish: rolling PR #$pr reopened (maintenance: no issue transition this tick)"
    else
      pr=$(forge_open_pr "$INTEGRATE_BRANCH" "$TRUNK" "bullet: integrated work for human review" "$(roll_body)")
      echo "publish: rolling PR #$pr created ($INTEGRATE_BRANCH → $TRUNK)"
    fi
  else
    echo "publish: rolling PR #$pr — maintenance refresh (no issue transition this tick)"
  fi
  [[ -n $pr ]] && forge_api PATCH "/repos/$BULLET_REPO/pulls/$pr" "$(jq -nc --arg b "$(roll_body)" '{body:$b}')" >/dev/null

  # rolling PR mergeable? if trunk moved under it, a conciliation agent merges trunk work into
  # bullet-develop (judging both sides, gates green) until the PR is clean for the human
  if [[ -n $pr ]] && [[ $(forge_api GET "/repos/$BULLET_REPO/pulls/$pr" | jq -r 'if .mergeable == false then "false" else "true" end') == "false" ]]; then
    rs=$(session_for reconcile "$pr")
    if ! tmux has-session -t "$rs" 2>/dev/null; then
      wt="$RUN_DIR/worktrees/$INTEGRATE_BRANCH"
      [[ -d $wt ]] || git -C "$TARGET" worktree add "$wt" "$INTEGRATE_BRANCH" >/dev/null 2>&1
      git -C "$wt" reset --hard "origin/$INTEGRATE_BRANCH" -q 2>/dev/null || true
      prompt=$(agent_compose reconcile "$pr" "Rolling PR #$pr conflicts with $TRUNK" "" "$wt" "$INTEGRATE_BRANCH")
      if agent_spawn "$rs" "$wt" "$(role_model reconcile)" "$prompt"; then
        forge_pr_comment "$pr" "bullet: rolling PR conflicts with \`$TRUNK\` — conciliation agent merges trunk work into \`$INTEGRATE_BRANCH\` (gates enforced); this PR turns green when it pushes."
        echo "publish: conciliation agent launched for rolling PR #$pr"
      else
        forge_pr_comment "$pr" "bullet: rolling PR conflicts with \`$TRUNK\` — conciliation agent failed to launch; manual reconciliation needed."
      fi
    else
      echo "publish: conciliation agent already owns rolling PR #$pr"
    fi
  fi
fi

echo "publish: tick done — $(forge_api GET "/repos/$BULLET_REPO/pulls?state=open&limit=50" | jq -r '[.[] | select(.head.ref | startswith("issue/"))] | length') open issue PRs; rolling PR #$pr → $TRUNK"
