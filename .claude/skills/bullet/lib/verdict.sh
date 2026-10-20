#!/usr/bin/env bash
# verdict.sh — review-verdict routing, the ONLY place that interprets verdict text.
# Agents write `REVIEW: <CLEAN|FIXED n|NEEDS-DECISION> — …` (reviewer law). Comment text is a
# REPORT, never state: the caller owns state and passes (verdict_body, verdict_comment_id,
# fixer_comment_id). Pure functions — unit-tested in selfcheck.sh.
# shellcheck shell=bash

# Normalize a verdict/coder comment body so the protocol line is greppable. Reviewers write
# through markdown (report.md renders `**Verdict:** \`REVIEW: …\``); backticks and bold survive
# the loader and hide the protocol prefix, so strip them BEFORE matching. Idempotent. The
# `REVIEW: `/`DONE`/… prefix is KEPT — monitor.sh and review.sh grep the normalized stream.
verdict_normalize() { # V_TEXT -> protocol line on stdout
  local v=${1:-}
  v=${v//\`/}                        # backticked protocol line
  v=${v//\*\*/}                      # markdown bold around wrapper or verdict
  v=${v#*[Vv]erdict:[[:space:]]}     # leading "**Verdict:**" wrapper (plain or bolded above)
  v=${v#"${v%%[![:space:]]*}"}       # ltrim
  v=${v%\*}; v=${v#\*}               # strip markdown bold/italic decoration at the edges
  printf '%s' "$v"
}

verdict_route() { # V_BODY V_ID F_ID -> "fresh_review" | "clean" | "fixed" | "needs_decision" | ""
  local v
  v=$(verdict_normalize "$1")
  v=${v#*REVIEW: }                   # strip everything up to the keyword (ids/versioned formats)
  v=${v#"${v%%[![:space:]]*}"}       # ltrim
  case $v in
    CLEAN*) echo clean; return 0 ;;
    NEEDS-DECISION*) echo needs_decision; return 0 ;;
    FIXED\ [0-9]*) ;; # a real verdict — freshness decides below
    *) echo ""; return 0 ;;  # not a verdict ("FIXED: applied 0" is a fixer REPORT, never routed)
  esac
  # A FIXED verdict is consumed by ONE fixer round: if a fixer report is newer than the
  # verdict, the round happened — route to a FRESH REVIEW, never another fixer.
  if [[ -n ${3:-} && -n ${2:-} && $3 -gt $2 ]]; then echo fresh_review; else echo fixed; fi
}
