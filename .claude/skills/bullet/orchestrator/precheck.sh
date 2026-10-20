#!/usr/bin/env bash
# precheck.sh — BT-00: entry guard. Runs before any fleet command on a repo. Verifies the
# bullet install is intact and the repo is initialized; when not, ANNOUNCES what it will
# bootstrap and does it (never silent — BT-02 law). Exit 0 = proceed. Exit 1 = tell the user.
# shellcheck shell=bash
set -u
BULLET_HOME="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

fail=0; warn=0
say() { printf '%-26s %s\n' "$1" "$2"; }
ok()  { say "$1" "✓"; }
bad() { say "$1" "✗ $2"; fail=1; }
meh() { say "$1" "~ $2"; warn=1; }
announce() { echo "bullet precheck: $*" >&2; }

T=${1:?usage: precheck.sh <target-repo-dir>}
[[ -d $T ]] || { echo "bullet precheck: $T does not exist"; exit 1; }
if [[ -d $T/.git ]]; then ok "git repo" "$T"; else
  echo "bullet precheck: $T is not a git repo — bullet needs one"; exit 1
fi

# --- 1. runtime self-check: syntax + config parse + prompt compose ---
if bash "$BULLET_HOME/selfcheck.sh" >/dev/null 2>&1; then
  ok "runtime selfcheck" "$BULLET_HOME"
else
  bad "runtime selfcheck" "broken — run: bash $BULLET_HOME/selfcheck.sh"
fi

# --- 2. repo bootstrap: config + per-repo skill (init announces what it creates) ---
missing=""
[[ -f $T/.bullet/bullet.yaml ]] || missing+=" config"
[[ -f $T/.bullet/AGENT.md ]]    || missing+=" per-repo-skill"
if [[ -n $missing ]]; then
  announce "$T not initialized (missing:$missing) — running bullet init now"
  "$BULLET_HOME/orchestrator/init.sh" "$T" || bad "bullet init" "failed — see output above"
  [[ -f $T/.bullet/bullet.yaml ]] || bad "config" "still missing after init"
fi
[[ -f $T/.bullet/bullet.yaml ]] && ok "config" ".bullet/bullet.yaml"

# --- 3. gitignore hygiene (init appends these; older installs may lack them) ---
if [[ -f $T/.bullet/bullet.yaml ]]; then
  need=""
  for line in ".bullet/state/" ".bullet/meta/" ".bullet/worktrees/" ".bullet/logs/"; do
    grep -qxF "$line" "$T/.gitignore" 2>/dev/null || need+="$line"$'\n'
  done
  if [[ -n $need ]]; then
    announce "gitignore missing runtime dirs — appending (fleet state never committed)"
    touch "$T/.gitignore"; printf '%s' "$need" >> "$T/.gitignore"
  fi
  ok "gitignore" "runtime dirs ignored"
fi

# --- 4. deps (cheap; doctor goes deeper) ---
for d in git tmux curl jq python3; do
  command -v "$d" >/dev/null && ok "dep:$d" || bad "dep:$d" "missing"
done

# --- 5. auth: env first, then ~/.bullet-env (this host's forge credential file) ---
if [[ -z ${BULLET_TOKEN:-}${BULLET_BASIC:-} && -r $HOME/.bullet-env ]]; then
  # shellcheck disable=SC1090
  . "$HOME/.bullet-env"
  [[ -n ${BULLET_TOKEN:-}${BULLET_BASIC:-} ]] && ok "auth" "loaded from ~/.bullet-env"
fi
[[ -n ${BULLET_TOKEN:-}${BULLET_BASIC:-} ]] || meh "auth" "no BULLET_TOKEN/BULLET_BASIC — forge checks skipped"

# --- 6. forge + labels: only with auth; labels created WITH notice (BT-02) ---
if [[ -n ${BULLET_TOKEN:-}${BULLET_BASIC:-} && -f $T/.bullet/bullet.yaml ]]; then
  . "$BULLET_HOME/lib/config.sh"; . "$BULLET_HOME/lib/forge.sh"; . "$BULLET_HOME/lib/state.sh"
  if bullet_load_config "$T" 2>/dev/null; then
    out=$(forge_api_raw GET "/repos/$BULLET_REPO"); code=${out%%$'\n'*}
    if [[ $code == 200 ]]; then
      ok "forge" "$BULLET_REPO"
      n=0
      for l in "bullet:queued" "bullet:running" "bullet:review" "bullet:done" "bullet:blocked"; do
        [[ -n $(forge_label_id "$l") ]] && n=$((n+1))
      done
      if (( n == 5 )); then ok "labels" "5/5 state labels"; else bullet_ensure_labels; fi
    else
      meh "forge" "HTTP $code from $BULLET_REPO — check url/repo in bullet.yaml + token scope"
    fi
  else
    bad "config" "unparsable — fix .bullet/bullet.yaml"
  fi
fi

(( fail )) && { echo "bullet precheck: blocking problems above — fix before running the fleet."; exit 1; }
echo "bullet precheck: ready$([[ $warn == 1 ]] && echo ' (with notes)') — $T"
