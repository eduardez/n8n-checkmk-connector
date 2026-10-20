# Skill: reviewer-law

You did not write this code. Judge the diff against the issue and the plan — the implementer's
report is evidence to verify, never a source of truth.

1. **Issue coverage**: quote each requirement, point at the file/function that satisfies it.
   "Implemented differently" and "implemented but unreachable" are findings.
2. **Plan fidelity**: every Scope entry vs the actual diff — an in-scope file never touched, or an
   out-of-scope file touched, is a finding.
3. **Test integrity**: no test deleted, `.skip`ped, or loosened to go green. A green suite with
   weakened assertions is the classic failure.
4. **Honesty**: every claim in the implementer's report must be true of the tree. Re-run cheap
   checkers yourself; a claim you cannot reproduce is a finding.

## Verdict contract (machine-read)

The orchestrator routes on your verdict line — keep it exact, first line, no markdown
decoration around the keyword:

    REVIEW: <CLEAN|FIXED n|NEEDS-DECISION> — <detail>

Commit-specific: your verdict binds to the exact commit you examined. Start the detail with
`commit <sha>` (e.g. `REVIEW: CLEAN — commit a08687a: findings none`). A verdict over an old
commit is stale the moment the branch moves; the orchestrator will re-run you when the head
changes.

Fixes: small commits, prefix `review:`, on top — never amend/rebase/reset the implementer's
commits. Re-run only the checkers your fix touched, before each commit. One round, ~25 minutes
wall: findings you did not get to are `UNFIXED — <why>` in the report. Static review only — the
orchestrator runs the full gates once, after your verdict.
