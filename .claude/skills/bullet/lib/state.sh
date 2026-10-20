#!/usr/bin/env bash
# state.sh — THE ONLY label writer. Agents comment; they never relabel.
# Every transition is a guarded label swap, so a re-run is always safe.
# shellcheck shell=bash

noop() { :; }

st_issue_labels() { forge_api GET "/repos/$BULLET_REPO/issues/$1" | jq -r '[.labels[].name] | join(",")'; }

st_has_label() { # ISSUE LABEL
  local labels; labels=$(st_issue_labels "$1")
  [[ ,$labels, == *",$2,"* ]]
}

st_labels() { # ISSUE NEW_LABEL [OLD_LABELS...] — remove olds (tolerant), add new
  local issue=$1 new=$2; shift 2
  local old
  for old in "$@"; do forge_label_rm "$issue" "$old"; done
  forge_label_add "$issue" "$new"
}

st_move() { # FROM TO ISSUE — guarded (no-op if the issue already left FROM)
  local from=$1 to=$2 issue=$3
  st_has_label "$issue" "$from" || return 1     # lost the race / already moved
  st_labels "$issue" "$to" "$from"
}

# --- concrete transitions ---
st_to_running()   { st_move "bullet:queued"  "bullet:running" "$1"; }
st_to_review()    { st_move "bullet:running" "bullet:review"  "$1"; }
st_to_done()      { st_move "bullet:review"  "bullet:done"    "$1"; }
st_to_blocked()   { st_move "bullet:running" "bullet:blocked" "$1"; }
st_to_blocked_r() { st_move "bullet:review"  "bullet:blocked" "$1"; }
st_requeue()      { st_move "bullet:blocked" "bullet:queued"  "$1"; }

# BT-02: create missing state labels WITH a notice first — never silent forge mutation.
bullet_ensure_labels() {
  local missing=() spec name color id
  for spec in "bullet:queued:1d76db" "bullet:running:fbca04" "bullet:review:5319e7" \
              "bullet:done:0e8a16" "bullet:blocked:d93f0b"; do
    name=$(echo "$spec" | cut -d: -f1-2)
    [[ -n $(forge_label_id "$name") ]] || missing+=("$spec")
  done
  (( ${#missing[@]} )) || return 0
  echo "bullet: state labels missing on $BULLET_REPO — creating them now (one-time setup): $(printf '%s ' "${missing[@]%%:*}")" >&2
  for spec in "${missing[@]}"; do
    name=$(echo "$spec" | cut -d: -f1-2); color=$(echo "$spec" | cut -d: -f3)
    forge_api POST "/repos/$BULLET_REPO/labels" \
      "$(jq -nc --arg n "$name" --arg c "$color" '{name:$n,color:$c}')" >/dev/null
    echo "bullet: created label $name" >&2
  done
  _LABEL_CACHE=""   # bust the id cache
  _BULLET_LABELS_CREATED=1
}
