#!/usr/bin/env bash
# doctor.sh — readiness check: config, deps, auth, forge, refs, labels, per-issue worktrees.
# Repair-safe: everything it can fix (labels, remote HEAD, worktrees, deps) it fixes; the rest
# it reports so the user decides. Exit 1 = blocking problem found.
# shellcheck shell=bash
set -u
BULLET_HOME="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
. "$BULLET_HOME/lib/config.sh"
. "$BULLET_HOME/lib/forge.sh"
. "$BULLET_HOME/lib/agent.sh"
. "$BULLET_HOME/lib/state.sh"
. "$BULLET_HOME/lib/tmux.sh"

fail=0
warn=0
say() { printf '%-28s %s\n' "$1" "$2"; }
ok()   { say "$1" "✓"; }
bad()  { say "$1" "✗ $2"; fail=1; }
meh()  { say "$1" "~ $2"; warn=1; }

T=${1:?usage: doctor.sh <target-repo-dir>}

# --- 1. deps ---
for d in git tmux curl jq python3; do
  command -v "$d" >/dev/null && ok "dep:$d" || bad "dep:$d" "missing"
done

# --- 2. auth env ---
[[ -n ${BULLET_TOKEN:-}${BULLET_BASIC:-} ]] && ok "auth env" || bad "auth env" "set BULLET_TOKEN or BULLET_BASIC"

# --- 3. config ---
bullet_load_config "$T"
ok "config" "$TARGET/bullet.yaml"

# --- 4. forge reachable ---
out=$(forge_api_raw GET "/repos/$BULLET_REPO")
code=${out%%$'\n'*}
[[ $code == 200 ]] && ok "forge reachable" "$BULLET_REPO" || bad "forge" "HTTP $code"

# --- 5. labels (create missing — announce, never silent) ---
for label in "bullet:queued" "bullet:running" "bullet:review" "bullet:done" "bullet:blocked"; do
  id=$(forge_label_id "$label")
  if [[ -n $id ]]; then ok "label:$label"
  else
    bullet_ensure_labels   # announces before creating
    id=$(forge_label_id "$label")
    [[ -n $id ]] && ok "label:$label" "created" || bad "label:$label" "missing — run: bullet labels init $T"
  fi
done

# --- 6. repo access (read AND write — pull-only tokens break labels/comments silently) ---
out=$(forge_api_raw GET "/repos/$BULLET_REPO/collaborators")
[[ ${out%%$'\n'*} == 200 ]] && ok "repo read access" || bad "repo read access" "HTTP ${out%%$'\n'*}"
login=$(forge_api GET "/user" | jq -r '.login // ""' 2>/dev/null)
if [[ -n $login ]]; then
  perm=$(forge_api GET "/repos/$BULLET_REPO/collaborators/$login/permission" | jq -r '.permission // ""' 2>/dev/null)
  [[ $perm == write || $perm == admin || $perm == owner ]] \
    && ok "repo write access" "$login: $perm" \
    || bad "repo write access" "$login: ${perm:-none} — token needs WRITE on $BULLET_REPO"
else
  bad "repo write access" "cannot resolve token identity (GET /user)"
fi

# --- 7. omp ---
command -v "${OMP_BIN:-omp}" >/dev/null && ok "omp" "${OMP_BIN:-omp}" || bad "omp" "not found (set omp_path in bullet.yaml)"

# --- 8. git refs: trunk must exist on origin; integration branch must differ and fetch ---
git -C "$T" fetch origin --quiet 2>/dev/null || true
if ! git -C "$T" ls-remote --exit-code --heads origin "$TRUNK" >/dev/null 2>&1; then
  git -C "$T" remote set-head origin -a >/dev/null 2>&1 || true   # repair stale remote HEAD
  git -C "$T" fetch origin --quiet 2>/dev/null || true
fi
git -C "$T" ls-remote --exit-code --heads origin "$TRUNK" >/dev/null 2>&1 \
  && ok "trunk:$TRUNK on origin" || bad "trunk:$TRUNK" "not on origin — fix branches.trunk in bullet.yaml"
if [[ $TRUNK == "bullet-develop" ]]; then
  bad "integration branch" "must differ from trunk"
elif git -C "$T" ls-remote --exit-code --heads origin bullet-develop >/dev/null 2>&1; then
  ok "integration:bullet-develop"
else
  meh "integration:bullet-develop" "not on origin yet — created at first integrate"
fi

# --- 9. per-issue readiness: branch on origin, worktree present (created if missing), deps ---
INTEGRATE_BRANCH="bullet-develop"
for n in $(forge_list_issues "bullet:queued" | jq -r '[.[] | .number] | sort[] ' \
           ; forge_list_issues "bullet:running" | jq -r '[.[] | .number] | sort[] ' \
           ; forge_list_issues "bullet:review"  | jq -r '[.[] | .number] | sort[] ' \
           ; forge_list_issues "bullet:done"    | jq -r '[.[] | .number] | sort[] '); do
  [[ -f $RUN_DIR/state/issue-$n.json ]] || continue   # never seen by this checkout — nothing to heal
  title=$(forge_issue "$n" | jq -r '.title')
  branch=$(st_get "$n" branch)
  [[ -n $branch ]] || branch="issue/$n-$(slugify "$title")"
  wt="$RUN_DIR/worktrees/issue-$n"

  if git -C "$T" ls-remote --exit-code --heads origin "$branch" >/dev/null 2>&1; then
    ok "issue#$n branch" "$branch"
  else
    bad "issue#$n branch" "$branch not on origin (pre-flight will recreate if re-queued)"
    continue
  fi

  if [[ -d $wt ]]; then
    ok "issue#$n worktree" "present"
  else
    git -C "$T" worktree prune >/dev/null 2>&1
    if git -C "$T" worktree add "$wt" "$branch" >/dev/null 2>&1; then
      ok "issue#$n worktree" "recreated"
    elif git -C "$T" worktree add -b "$branch" "$wt" "origin/$TRUNK" >/dev/null 2>&1; then
      ok "issue#$n worktree" "recreated (+branch)"
    else
      bad "issue#$n worktree" "cannot recreate — manual: git worktree add $wt $branch"
      continue
    fi
  fi

  # setup hook: worktrees created before `setup:` existed lack deps (bun-types failure class)
  [[ -f $wt/package.json && ! -d $wt/node_modules ]] && [[ -n ${SETUP[*]:-} ]] && {
    (cd "$wt" && eval "${SETUP[0]}") >/dev/null 2>&1 \
      && ok "issue#$n deps" "installed" || meh "issue#$n deps" "setup hook failed"
  }
done

# --- 10. stale state prune: worktree dead + work merged → state file is a rebuildable cache ---
for f in "$RUN_DIR"/state/issue-*.json; do
  [[ -f $f ]] || continue
  n=$(basename "$f" .json); n=${n#issue-}
  [[ -d $RUN_DIR/worktrees/issue-$n ]] && continue
  integrated=$(python3 -c "import json;print(json.load(open('$f')).get('integrated',''))" 2>/dev/null)
  branch=$(python3 -c "import json;print(json.load(open('$f')).get('branch',''))" 2>/dev/null)
  if [[ $integrated == 1 && -n $branch ]] \
     && git -C "$T" ls-remote --exit-code --heads origin "$branch" >/dev/null 2>&1 \
     && git -C "$T" merge-base --is-ancestor "origin/$branch" "origin/$INTEGRATE_BRANCH" 2>/dev/null; then
    rm -f "$f"
    ok "state issue#$n" "pruned (merged; rebuilt on demand)"
  fi
done

(( fail )) && { echo "doctor: $fail blocking problem(s) — fix above before coding."; exit 1; }
(( warn  )) && echo "doctor: ready, with notes."
(( warn || fail )) || echo "doctor: all good — bullet is ready on $BULLET_REPO"
