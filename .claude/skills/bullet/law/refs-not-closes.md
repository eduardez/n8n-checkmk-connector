# Skill: refs-not-closes

Every reference to the issue is **`Refs #{{ISSUE}}`** — in commit messages, the plan, the report,
the PR body. Never `fixes|closes|resolves #N`: the forge would auto-close the issue on merge, and
the orchestrator owns the issue lifecycle. This applies everywhere you write about the change.
