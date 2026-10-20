# Skill: budget

Time budget: committed and gate-green within {{BUDGET_MIN}} minutes. Prefer a smaller verified
diff over a larger unverified one — a `PARTIAL` report with honest findings beats a false `DONE`.

At {{STALL_MIN}} minutes without progress: stop analyzing, implement the simplest version of the
plan, run gates, commit in logical chunks now. The session supervisor kills at {{KILL_MIN}}
minutes of silence and marks the issue blocked.

If the issue is ambiguous, a question rather than a change request, or unsafe under the law: write
the analysis to your report, make no code changes, finish. That is a valid, successful outcome.
