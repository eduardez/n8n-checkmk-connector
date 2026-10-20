#!/usr/bin/env bash
# selfcheck.sh — no-forge smoke test: syntax + config parse + prompt compose. Run before wiring cron.
# shellcheck shell=bash
set -u
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
fails=0

echo "== bash -n on all shell =="
while IFS= read -r f; do
  bash -n "$f" && echo "  ok: ${f#$HERE/}" || { echo "  SYNTAX FAIL: $f"; fails=$((fails+1)); }
done < <(find "$HERE" \( -name "*.sh" -o -name bullet \) -type f | grep -v '/\.git/')

echo "== config parse (example yaml) =="
tmp=$(mktemp -d)
cp "$HERE/bullet.yaml.example" "$tmp/bullet.yaml"
. "$HERE/lib/config.sh"
BULLET_CFG_FILE=$tmp/bullet.yaml
bullet_load_config "$tmp"
for expect in "FORGE=forgejo" "TRUNK=develop" "SHIP=main" "AGENTS=10" "CODER_SLOTS=7" "REVIEWER_SLOTS=2" "FIXER_SLOTS=1" "MERGE_MODE=operator"; do
  k=${expect%%=*}; want=${expect#*=}; val=${!k}
  [[ $val == "$want" ]] && echo "  ok: $expect" || { echo "  FAIL: $k=$val want $want"; fails=$((fails+1)); }
done
mapfile -t G < <(cfg_list gates "$tmp/bullet.yaml")
[[ ${#G[@]} -eq 3 ]] && echo "  ok: gates list (${#G[@]})" || { echo "  FAIL: gates list (${#G[@]}: ${G[*]})"; fails=$((fails+1)); }

echo "== prompt compose =="
python3 "$HERE/lib/compose.py" "$HERE/prompts/coder.md" \
  --set WORKTREE=/tmp/wt --set BRANCH=issue/1-test --set TRUNK=main --set SHIP=main \
  --set ISSUE=1 --set ISSUE_TITLE=t --set ISSUE_BODY=b \
  --set PLAN_PATH=/tmp/p.md --set REPORT_PATH=/tmp/r.md --set REVIEW_REPORT_PATH=/tmp/rr.md \
  --set BUDGET_MIN=45 --set STALL_MIN=15 --set KILL_MIN=60 \
  --set GATES="bun test" --set FORGE_HOST=https://x --set FJ_HOST=https://x \
  --set FJ_REPO=o/r --set REPO=o/r > "$tmp/prompt.md" \
  && { grep -q "SKILL: hard-law" "$tmp/prompt.md" && grep -q "SKILL: budget" "$tmp/prompt.md" \
       && echo "  ok: coder prompt composed ($(wc -l < "$tmp/prompt.md") lines, all skills inlined)" \
       || { echo "  FAIL: skills not inlined"; fails=$((fails+1)); }; } \
  || { echo "  FAIL: compose errored"; fails=$((fails+1)); }

python3 "$HERE/lib/compose.py" "$HERE/prompts/reviewer.md" \
  --set WORKTREE=/tmp/wt --set BRANCH=issue/1-test --set TRUNK=main --set SHIP=main \
  --set ISSUE=1 --set ISSUE_TITLE=t --set ISSUE_BODY=b \
  --set PLAN_PATH=/tmp/p.md --set REPORT_PATH=/tmp/r.md --set REVIEW_REPORT_PATH=/tmp/rr.md \
  --set BUDGET_MIN=45 --set STALL_MIN=15 --set KILL_MIN=60 \
  --set GATES="bun test" --set FORGE_HOST=https://x --set FJ_HOST=https://x \
  --set FJ_REPO=o/r --set REPO=o/r > /dev/null \
  && echo "  ok: reviewer prompt composed" || { echo "  FAIL: reviewer compose"; fails=$((fails+1)); }

echo "== unfilled-slot guard =="
python3 "$HERE/lib/compose.py" "$HERE/prompts/coder.md" --set WORKTREE=/x 2>/dev/null \
  && { echo "  FAIL: compose should error on unfilled slots"; fails=$((fails+1)); } \
  || echo "  ok: compose refuses partial fill"

echo "== verdict routing (the stale-verdict regression) =="
. "$HERE/lib/verdict.sh"
t() { # WANT V_BODY V_ID F_ID LABEL
  got=$(verdict_route "$2" "$3" "$4")
  [[ $got == "$1" ]] && echo "  ok: $5" || { echo "  FAIL: $5 → got '$got' want '$1'"; fails=$((fails+1)); }
}
t fixed     "REVIEW: FIXED 2 — declaration order, import order" 100 90 "verdict newer than fixer report → fixer round"
t fresh_review "REVIEW: FIXED 2 — declaration order, import order" 100 110 "verdict OLDER than fixer report → fresh review (never another fixer)"
t clean     "REVIEW: CLEAN — findings: none" 100 110 "CLEAN wins even after a fixer round"
t needs_decision "REVIEW: NEEDS-DECISION — which API? | options: a / b" 100 110 "NEEDS-DECISION → parked"
t fresh_review "*REVIEW: FIXED 1* — nit" 100 120 "markdown-decorated verdict still routes"
t ""        "FIXED: applied 0 — nothing outstanding" 100 90 "fixer report is NOT a verdict"
t fresh_review "REVIEW: FIXED 2" 100 999 "no-comment-id arithmetic never re-fixes"
t fixed     "REVIEW: FIXED 2" 100 "" "verdict with no fixer report yet → fixer round"
t fixed     '**Verdict:** `REVIEW: FIXED 2 — commit a08687a: declaration order`' 100 90 "report.md decorated verdict routes (fleet T1)"
t clean     '**Verdict:** `REVIEW: CLEAN — commit a08687a`' 100 110 "decorated CLEAN routes"
t ""       '**Verdict:** `FIXED: applied 2 — x`' 100 90 "decorated fixer REPORT still not a verdict"
t needs_decision '`Verdict:` REVIEW: NEEDS-DECISION — pick one' 100 110 "backticked wrapper without bold"

echo "== verdict normalization (fleet T1) =="
n() { # WANT V_TEXT
  got=$(verdict_normalize "$2")
  [[ $got == "$1" ]] && echo "  ok: $2 → $got" || { echo "  FAIL: '$2' → '$got' want '$1'"; fails=$((fails+1)); }
}
n "REVIEW: FIXED 2 — commit a08687a" '**Verdict:** `REVIEW: FIXED 2 — commit a08687a`'
n "REVIEW: CLEAN — commit a08687a" '**Verdict:** REVIEW: CLEAN — commit a08687a'
n "REVIEW: CLEAN — x" 'Verdict: REVIEW: CLEAN — x'
n "REVIEW: CLEAN — x" 'verdict: REVIEW: CLEAN — x'
n "REVIEW: CLEAN — x" '**REVIEW: CLEAN — x**'
n "REVIEW: CLEAN — x" '`REVIEW: CLEAN — x`'
n "REVIEW: CLEAN — x" "REVIEW: CLEAN — x"   # idempotent on plain lines
n "DONE: commit a08687a" '**DONE**: commit a08687a'
n "DONE: applied" '**DONE**: applied'

rm -rf "$tmp"
(( fails )) && { echo "selfcheck: $fails failure(s)"; exit 1; }
echo "selfcheck: all green"
