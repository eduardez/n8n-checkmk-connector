#!/usr/bin/env bash
# protect.sh — BT-05: enforce the branching law at the FORGE, not in prompts. Creates/repairs
# branch protection so the bullet agent cannot push or merge into trunk (or any other protected
# branch). Per-branch policy:
#   trunk (PR target): push whitelist EMPTY for every account — direct trunk push is rejected
#     pre-receive; merge whitelist human-only (owner-only on a single-account forge).
#   bullet-develop (integration): push+merge whitelist = the API identity — integrate.sh, the
#     conflict-solver and the conciliation agent push it directly; workers never do.
# Reports drift; repairs when told (bullet protect <repo> --repair). Forge-level enforcement
# survives prompt edits and agent drift. Exit 0 = enforced (or already). Exit 1 = cannot enforce.
# shellcheck shell=bash
set -u
BULLET_HOME="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
. "$BULLET_HOME/lib/config.sh"
. "$BULLET_HOME/lib/forge.sh"

say() { printf '%-30s %s\n' "$1" "$2"; }
T=${1:?usage: bullet protect <target-repo-dir> [--repair]}
REPAIR=0; [[ ${2:-} == --repair ]] && REPAIR=1

bullet_load_config "$T"
[[ -n ${BULLET_TOKEN:-}${BULLET_BASIC:-} ]] || { echo "bullet protect: no BULLET_TOKEN/BULLET_BASIC — cannot reach $FORGE_URL"; exit 1; }

# Token/API identity: merge whitelist for bullet-develop must name whoever auto-merges (the API
# identity). Unresolvable → protect trunk only, report the integration branch as unprotected.
BOT_LOGIN=$(forge_api GET "/user" | jq -r '.login // ""' 2>/dev/null)

# Single-account forge: bot identity == repo owner → forge cannot distinguish human from agent
# by account. Push protection stays absolute; trunk merge whitelist = owner (the human merges).
# With a dedicated bot account (identity != owner): trunk merges strictly human-only.
OWNER=${BULLET_REPO%%/*}
SINGLE=0; [[ -n $BOT_LOGIN && $BOT_LOGIN == "$OWNER" ]] && SINGLE=1

# Protected branches: trunk (PR target) + bullet-develop (integration). Ship = trunk today; a
# future config with ship != trunk gets it too. bullet worktrees run on issue/* branches only,
# so protecting these cannot block a launch.
branches=("$TRUNK" "bullet-develop")
[[ -n $SHIP && $SHIP != "$TRUNK" && $SHIP != bullet-develop ]] && branches+=("$SHIP")

forgejo_body() { # BRANCH -> JSON body (create/patch)
  # bullet-develop: push+merge whitelist = the integrating identity — integrate.sh, the
  # conflict-solver and the conciliation agent push it directly (SKILL.md); workers never do.
  # trunk: push whitelist empty for every account (direct trunk push = rejected pre-receive);
  # merge whitelist owner-only on single-account forges, human-only with a dedicated bot.
  local b=$1 pwl='[]' mwl='[]'
  if [[ $b == bullet-develop && -n $BOT_LOGIN ]]; then
    pwl=$(jq -nc --arg u "$BOT_LOGIN" '[$u]'); mwl=$pwl
  elif [[ $SINGLE == 1 && -n $BOT_LOGIN ]]; then
    mwl=$(jq -nc --arg u "$BOT_LOGIN" '[$u]')
  fi
  jq -nc --arg b "$b" --argjson pwl "$pwl" --argjson mwl "$mwl" \
    '{rule_name:$b, enable_push:true, enable_push_whitelist:true, push_whitelist_usernames:$pwl,
      enable_merge_whitelist:true, merge_whitelist_usernames:$mwl,
      block_on_rejected_reviews:false, block_on_official_review_requests:false,
      block_on_outdated_branch:true}'
}
github_body() { # BRANCH -> JSON body. PR-review requirement on trunk = non-admins (the bot)
  # cannot merge trunk PRs without a human approval; admins exempt via enforce_admins:false.
  # restrictions omitted: org-only field, 422 on personal repos.
  local b=$1 reviews=null
  [[ $b == "$TRUNK" || $b == "$SHIP" ]] && reviews='{"dismiss_stale_reviews":true,"required_approving_review_count":1}'
  jq -nc --argjson r "$reviews" \
    '{required_status_checks:null, enforce_admins:false, required_pull_request_reviews:$r,
      allow_force_pushes:false, allow_deletions:false}'
}

failed=0
for b in "${branches[@]}"; do
  if [[ $FORGE == forgejo ]]; then
    if [[ $b == bullet-develop && -z $BOT_LOGIN ]]; then
      say "protect:$b" "~ skipped — cannot resolve API identity (GET /user): auto-merge whitelist unknown"
      failed=1; continue
    fi
    out=$(forge_api_raw GET "/repos/$BULLET_REPO/branch_protections/$b")
    code=${out%%$'\n'*}; cur=${out#*$'\n'}
    if [[ $code != 200 ]]; then
      if (( REPAIR )); then
        out=$(forge_api_raw POST "/repos/$BULLET_REPO/branch_protections" "$(forgejo_body "$b")")
        code=${out%%$'\n'*}
        [[ $code == 201 || $code == 200 ]] \
          && say "protect:$b" "created — pushes blocked; merges: $([[ $b == bullet-develop ]] && echo "bot ($BOT_LOGIN) auto-merge" || { [[ $SINGLE == 1 ]] && echo "owner ($BOT_LOGIN) only" || echo "human only"; })" \
          || { say "protect:$b" "✗ HTTP $code — enforce in forge UI: Settings → Branches"; failed=1; }
      else
        say "protect:$b" "MISSING — run: bullet protect $T --repair"
        failed=1
      fi
    else
      push_wl=$(forge_jq '[.push_whitelist_usernames[]?] | join(",")' "$cur")
      merge_wl=$(forge_jq '[.merge_whitelist_usernames[]?] | join(",")' "$cur")
      drift=""
      if [[ $b == bullet-develop ]]; then
        [[ ,$push_wl, != *",$BOT_LOGIN,"* ]] && drift+="push-whitelist lacks bot $BOT_LOGIN (integrate/conflict-solver/conciliation push it) "
        [[ ,$merge_wl, != *",$BOT_LOGIN,"* ]] && drift+="merge-whitelist lacks bot $BOT_LOGIN (auto-merge breaks) "
      else
        [[ -n $push_wl ]] && drift+="push-whitelist '$push_wl' (trunk is push-blocked for everyone) "
        if [[ $SINGLE == 1 ]]; then
          [[ -n $merge_wl && ,$merge_wl, != *",$OWNER,"* ]] && drift+="merge-whitelist '$merge_wl' unexpected (owner-only policy) "
        else
          [[ -n $merge_wl ]] && drift+="merge-whitelist '$merge_wl' (human-only violated) "
        fi
      fi
      if [[ -z $drift ]]; then
        say "protect:$b" "✓ enforced (pushes: $([[ $b == bullet-develop ]] && echo "integrator ($BOT_LOGIN) only" || echo "blocked for everyone"); merges: $([[ $b == bullet-develop ]] && echo "integrator only" || { [[ $SINGLE == 1 ]] && echo "owner only" || echo "human only"; }))"
      elif (( REPAIR )); then
        out=$(forge_api_raw PATCH "/repos/$BULLET_REPO/branch_protections/$b" "$(forgejo_body "$b")")
        code=${out%%$'\n'*}
        [[ $code == 200 || $code == 201 ]] && say "protect:$b" "repaired — was: ${drift%% }" \
          || { say "protect:$b" "✗ repair HTTP $code — fix in forge UI: Settings → Branches"; failed=1; }
      else
        say "protect:$b" "~ drift: ${drift}— --repair resets"
        failed=1
      fi
    fi
  else
    out=$(forge_api_raw GET "/repos/$BULLET_REPO/branches/$b/protection")
    code=${out%%$'\n'*}
    if [[ $code != 200 ]]; then
      if (( REPAIR )); then
        out=$(forge_api_raw PUT "/repos/$BULLET_REPO/branches/$b/protection" "$(github_body "$b")")
        code=${out%%$'\n'*}
        [[ $code == 200 ]] && say "protect:$b" "created — force-push/deletion off; trunk requires human approval" \
          || { say "protect:$b" "✗ HTTP $code — needs admin token; enforce in GitHub settings"; failed=1; }
      else
        say "protect:$b" "MISSING — run: bullet protect $T --repair"
        failed=1
      fi
    else
      cur=${out#*$'\n'}
      fp=$(forge_jq '.allow_force_pushes.enabled // false' "$cur" 2>/dev/null)
      dl=$(forge_jq '.allow_deletions.enabled // false' "$cur" 2>/dev/null)
      [[ $fp == false && $dl == false ]] && say "protect:$b" "✓ enforced (force-push/deletion off)" \
        || { say "protect:$b" "~ drift: force-push/deletion enabled — --repair resets"; failed=1; }
    fi
  fi
done

[[ -n $BOT_LOGIN ]] && say "api identity" "$BOT_LOGIN$([[ $SINGLE == 1 ]] && echo ' (single-account forge: human+agent share it)')"
if (( failed )); then
  echo "bullet protect: branching law NOT fully enforced — see above. (Human blocked merging on the forge UI? Add your username to the rule whitelist: Settings → Branches.)"
  exit 1
fi
[[ $SINGLE == 1 ]] && tail="trunk push-blocked for everyone + owner-merge only; bullet-develop reserved to the integrator identity" \
  || tail="trunk push-blocked for everyone + human-merge only; bullet-develop reserved to the integrator identity"
echo "bullet protect: branching law enforced on $BULLET_REPO ($tail)"
