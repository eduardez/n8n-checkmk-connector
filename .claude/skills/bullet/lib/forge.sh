#!/usr/bin/env bash
# forge.sh — Forgejo + GitHub API wrapper. Everything goes through forge_api.
# Auth: BULLET_TOKEN (preferred) or BULLET_BASIC=user:pass. BULLET_DRY_RUN=1 prints instead of executing.
# shellcheck shell=bash

forge_api_raw() { # METHOD PATH [JSON_BODY] -> prints "CODE\nBODY" (forge_code readable in subshells)
  local method=$1 path=$2 body=${3:-}
  local auth=() data=()
  if [[ -n ${BULLET_TOKEN:-} ]]; then auth=(-H "Authorization: token $BULLET_TOKEN")
  elif [[ -n ${BULLET_BASIC:-} ]]; then auth=(-u "$BULLET_BASIC")
  else echo "78"; echo "forge.sh: set BULLET_TOKEN or BULLET_BASIC" >&2; return 0; fi
  local out
  if [[ -n ${BULLET_DRY_RUN:-} ]]; then out=$'200\nDRY'; printf 'DRY: %q\n' "${method} ${FORGE_URL%/}${path}" >&2; echo "$out"; return 0; fi
  out=$(curl -s --max-time 30 -w $'\n%{http_code}' -X "$method" "${FORGE_API%/}${path}" \
        "${auth[@]}" -H "Content-Type: application/json" -A "bullet/1.0" ${body:+-d "$body"})
  local code=${out##*$'\n'}
  printf '%s\n%s' "$code" "${out%$'\n'*}"
}

forge_api() { # METHOD PATH [JSON_BODY] -> stdout=body; $forge_code set in the CURRENT shell only
  local out
  out=$(forge_api_raw "$@")
  forge_code=${out%%$'\n'*}
  printf '%s' "${out#*$'\n'}"
}

forge_jq() { jq -r "$1" 2>/dev/null <<<"${2:-}"; }

# --- issues ---

forge_list_issues() { # LABEL -> JSON array of OPEN issues carrying that label
  # Client-side filter: Forgejo's `labels=<id>` query param is ignored server-side (verified on
  # git.eduard3v.com), so filtering in jq is the only correct path for both forges.
  local label=$1 out page acc="" code
  for page in 1 2 3 4 5 6 7 8; do
    out=$(forge_api_raw GET "/repos/$BULLET_REPO/issues?state=open&type=issues&limit=50&page=$page")
    code=${out%%$'\n'*}; out=${out#*$'\n'}
    if [[ $code != 200 ]]; then
      echo "forge_list_issues: HTTP $code from $FORGE_API (check BULLET_TOKEN/BULLET_BASIC — body: $(head -c 160 <<<"$out"))" >&2
      echo "[]"; return 1
    fi
    local count; count=$(jq 'length' <<<"$out" 2>/dev/null || echo 0)
    acc+="$out"$'\n'
    (( count < 50 )) && break
  done
  jq -s --arg l "$label" '[.[][] | select(any(.labels[]?; .name==$l))]' <<<"$acc"
}

forge_issue() { forge_api GET "/repos/$BULLET_REPO/issues/$1"; }

forge_comment() { # ISSUE BODY — no-op when the thread's last comment is identical (no spam)
  # Forgejo lists comments oldest-first AND caps pages (default 10 items), so the newest comment
  # lives on the LAST page — compute it from the issue's total comment count.
  local total page last
  total=$(forge_issue "$1" | jq -r '.comments // 0')
  page=$(( (total + 49) / 50 )); (( page < 1 )) && page=1
  last=$(forge_api GET "/repos/$BULLET_REPO/issues/$1/comments?limit=50&page=$page" | jq -r '.[-1].body // ""')
  [[ $last == "$2" ]] && return 0
  forge_api POST "/repos/$BULLET_REPO/issues/$1/comments" "$(jq -nc --arg b "$2" '{body:$b}')" >/dev/null
}

forge_comments() { # ISSUE [COUNT] -> last N comment bodies (oldest first)
  forge_api GET "/repos/$BULLET_REPO/issues/$1/comments?limit=${2:-10}"
}

forge_comment_author() { # ISSUE COMMENT_ID
  forge_api GET "/repos/$BULLET_REPO/issues/$1/comments" | jq -r ".[] | select(.id==$2) | .user.login" | head -1
}

# --- labels (name-based on both forges; forgejo needs id resolution) ---

_LABEL_CACHE=""
forge_label_id() { # NAME -> id (cached per run)
  if [[ -z ${_LABEL_CACHE:-} ]]; then _LABEL_CACHE=$(forge_api GET "/repos/$BULLET_REPO/labels"); fi
  jq -r --arg n "$1" '.[] | select(.name==$n) | .id' <<<"$_LABEL_CACHE" 2>/dev/null | head -1
}

forge_label_add() { # ISSUE NAME
  local id name=$2
  if [[ $FORGE == forgejo ]]; then
    id=$(forge_label_id "$name")
    [[ -n $id ]] || { echo "bullet: label $name missing on $BULLET_REPO" >&2; return 1; }
    forge_api POST "/repos/$BULLET_REPO/issues/$1/labels" "$(jq -nc --argjson i "$id" '{labels:[$i]}')" >/dev/null
  else
    forge_api POST "/repos/$BULLET_REPO/issues/$1/labels" "$(jq -nc --arg n "$name" '{labels:[$n]}')" >/dev/null
  fi
}

forge_label_rm() { # ISSUE NAME (tolerant: missing label is fine)
  if [[ $FORGE == forgejo ]]; then
    local id; id=$(forge_label_id "$2")
    [[ -n $id ]] || return 0
    forge_api DELETE "/repos/$BULLET_REPO/issues/$1/labels/$id" >/dev/null
  else
    forge_api DELETE "/repos/$BULLET_REPO/issues/$1/labels/$(printf %s "$2" | jq -sRr @uri)" >/dev/null
  fi
}

# --- pull requests ---

forge_open_pr() { # HEAD BRANCH BASE TITLE BODY -> PR number (empty on failure)
  local r body code
  r=$(forge_api_raw POST "/repos/$BULLET_REPO/pulls" \
      "$(jq -nc --arg h "$1" --arg b "$2" --arg t "$3" --arg B "$4" '{head:$h,base:$b,title:$t,body:$B}')")
  code=${r%%$'\n'*}; r=${r#*$'\n'}
  [[ $code == 201 || $code == 200 ]] && { forge_jq '.number' "$r"; return 0; }
  echo "bullet: PR create HTTP $code: $(forge_jq '.message' "$r")" >&2; return 1
}

forge_merge_pr() { # PR_NUMBER -> 0 and echoes forge HTTP code on 2xx; 1 on failure
  local r code
  if [[ $FORGE == forgejo ]]; then
    r=$(forge_api_raw POST "/repos/$BULLET_REPO/pulls/$1/merge" '{"Do":"merge"}')
  else
    r=$(forge_api PUT "/repos/$BULLET_REPO/pulls/$1/merge" '{"merge_method":"merge"}')
    r="200"$'\n'"$r"   # normalize to code+body shape
  fi
  code=${r%%$'\n'*}
  [[ $code =~ ^20 ]] && { echo "$code"; return 0; }
  echo "$code"; return 1
}
