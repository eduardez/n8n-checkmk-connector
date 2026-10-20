#!/usr/bin/env bash
# tidy.sh — FLEET T5: reconcile forge labels with the evidence on disk/forge.
# Fleets drift when a phase crashes mid-transition: issue #35 left `bullet:running` on a
# finished issue, #41-style ping-pong left stale labels after manual requeues, and AutoFirme
# carries open issues labeled `bullet:done` whose branches never merged. tidy recomputes the
# state each issue SHOULD be in from durable evidence — meta report/review verdicts, whether
# the issue branch was merged into the integration branch / trunk — and reports (or with
# --apply moves) the label. Dry-run by default; NEVER touches issues with a live session.
# shellcheck shell=bash
set -u
BULLET_HOME="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
. "$BULLET_HOME/lib/config.sh"
. "$BULLET_HOME/lib/forge.sh"
. "$BULLET_HOME/lib/tmux.sh"
. "$BULLET_HOME/lib/agent.sh"
. "$BULLET_HOME/lib/verdict.sh"
. "$BULLET_HOME/lib/state.sh"

APPLY=0; REPO=""
for a in "$@"; do case $a in --apply) APPLY=1;; -h*|-*) echo "usage: bullet tidy <target-repo> [--apply]" >&2; exit 2;; *) REPO=$a;; esac; done
bullet_load_config "${REPO:?usage: bullet tidy <target-repo> [--apply]}"

INTEGRATE_BRANCH="bullet-develop"
git -C "$TARGET" fetch origin --quiet || true

# all open issues, not just labeled ones — unlabeled drift (dead dupes) is the other failure mode
issues=$(forge_api GET "/repos/$BULLET_REPO/issues?state=open&type=issues&limit=50&page=1") || exit 1
# label IDs once (Forgejo PUT wants ids)
_LABEL_CACHE=$(forge_api GET "/repos/$BULLET_REPO/labels")

label_id() { jq -r --arg n "$1" '.[] | select(.name==$n) | .id' <<<"$_LABEL_CACHE" | head -1; }

forge_label_set() { # ISSUE LABEL — replace ALL state labels with LABEL (PUT, id-based: names rejected)
  local id; id=$(label_id "$1")
  [[ -n $id ]] || { echo "tidy: label $1 missing on $BULLET_REPO" >&2; return 1; }
  forge_api PUT "/repos/$BULLET_REPO/issues/$issue/labels" "$(jq -nc --argjson i "$id" '{labels:[$i]}')" >/dev/null
}

merged() { # BRANCH INTO -> 0 if BRANCH's tip is an ancestor of INTO
  git -C "$TARGET" fetch origin --quiet "$1" "$2" 2>/dev/null || true
  git -C "$TARGET" merge-base --is-ancestor "origin/$1" "origin/$2" 2>/dev/null
}

changes=0
for issue in $(jq -r '.[].number' <<<"$issues"); do
  labels=$(st_issue_labels "$issue")
  cur=""; cnt=0
  for l in $(printf '%s' "$labels" | tr ',' ' '); do
    [[ $l == bullet:* ]] && { cur=$l; cnt=$((cnt+1)); }
  done
  (( cnt == 1 )) || cur=""    # no label, or 2+ state labels → report as drifted
  s=$(session_for coder "$issue"); r=$(session_for reviewer "$issue")
  if tmux_has "$s" || tmux_has "$r"; then continue; fi   # live session — not ours to touch

  # --- evidence ---
  report="$RUN_DIR/meta/issue-$issue.report.md"; review="$RUN_DIR/meta/issue-$issue.review.md"
  outcome=""
  [[ -f $report ]] && outcome=$(verdict_normalize "$(cat "$report")" | grep -oE '(DONE|PARTIAL|BLOCKED)' | head -1)
  verd=""
  [[ -f $review ]] && verd=$(verdict_normalize "$(cat "$review")" | grep -oE 'CLEAN|NEEDS-DECISION' | head -1)
  branch=$(st_get "$issue" branch)
  [[ -z $branch ]] && branch="issue/$issue-$(slugify "$(forge_issue "$issue" | jq -r '.title')")"
  integrated=$(st_get "$issue" integrated)
  if [[ $integrated == 1 ]] || merged "$branch" "$INTEGRATE_BRANCH" || merged "$branch" "$TRUNK"; then
    evidence=integrated
  elif [[ $verd == CLEAN ]] || [[ $outcome == DONE || $outcome == PARTIAL ]]; then
    evidence=review
  elif [[ $outcome == BLOCKED || $verd == NEEDS-DECISION ]]; then
    evidence=blocked
  elif [[ -n $branch ]] && git -C "$TARGET" ls-remote --exit-code --heads origin "$branch" >/dev/null 2>&1; then
    evidence=running
  else
    evidence=queued
  fi

  want="bullet:$evidence"; [[ $evidence == integrated ]] && want="bullet:done"
  [[ $cur == "$want" ]] && continue
  echo "#$issue: label=${cur:-none} evidence=$want (branch=$branch outcome=${outcome:-none} verdict=${verd:-none})"
  changes=$((changes + 1))
  if (( APPLY )); then
    case $evidence in
      integrated) st_to_done "$issue" || forge_label_set bullet:done;;   # state machine path first
      review)     forge_label_set bullet:review;;
      running)    forge_label_set bullet:running;;
      blocked)    forge_label_set bullet:blocked;;
      queued)     forge_label_set bullet:queued;;
    esac
  fi
done

(( APPLY )) && echo "tidy: $changes issue(s) reconciled on $BULLET_REPO" \
             || echo "tidy: $changes issue(s) drifted on $BULLET_REPO — re-run with --apply to fix"
