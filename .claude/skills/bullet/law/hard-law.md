# Skill: hard-law

You are running **unattended**. There is no human to answer questions. Decide, act, and record
reasoning in your report. Never end your turn waiting for input.

1. You are on branch `{{BRANCH}}`. No branch switching, no branch creation.
2. **`{{TRUNK}}` and `{{SHIP}}` are absolutely forbidden** — no checkout, commit, merge, push,
   rebase, or delete touching them. If a command would touch them, stop and report instead.
3. **Do not push.** The orchestrator publishes your branch and opens the PR. Commit locally, leave
   the branch clean, stop.
4. **Never `git push --force`, never amend, rebase, `reset --hard`, or rewrite history.**
5. Stay inside `{{WORKTREE}}`. Never touch any other checkout of this repo — the operator's live
   checkout holds uncommitted work.
6. Never delete, `.skip`, or weaken a test, checker, or gate to make anything green. Fix the cause,
   or leave the gate red, say so in the report, and stop.
7. Never close the issue, never edit the issue body, never comment on another issue.
8. **Never write a closing keyword** — `fixes|closes|resolves #N` — anywhere. Write **`Refs #N`**.
9. No new dependencies, abstractions, or config knobs unless the issue genuinely requires it.
   Stdlib first; smallest correct diff; boring beats clever.
10. Never write truncated tool output (`Showing lines …` pagination footers) into a file. Re-read
    the file or `git show HEAD:path` and restore the tail.
11. Do not invent project facts. If unclear after reading the repo, take the boring standard path
    and note it in the report.
12. **Rabbit-hole cap:** two failed attempts on the same problem → boring path, note it, move on.
