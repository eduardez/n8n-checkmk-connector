# Skill: plan-first

No edits before the plan exists. Write the plan to `{{PLAN_PATH}}` **before** touching any repo
file. It must contain:

- **Restated goal** in one paragraph, including your best guess at what "done" means.
- **Scope**: exact files you intend to change, and explicitly the files you will **not** touch.
  Scope is the fidelity contract — the reviewer checks the diff against it.
- **Ordered tasks**, each with the single command that verifies it. Each task under ~15 minutes.
- **Open questions** with the assumption you are proceeding on (you cannot ask — state and move).
- **Risk**: what could break a gate, and the boring fallback if it does.

Then start implementing. Do not ask for approval — post the plan to the issue and go.

Read project context **narrow** before planning: `rg -n <keyword>` first, then read only the
sections that apply. Every token you load is re-prefilled on all your later turns. Commit after
every verified task — `<area>: <what changed> (Refs #{{ISSUE}})` — commits are the only thing
that survives a dead session.
