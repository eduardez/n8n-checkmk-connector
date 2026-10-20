# The slot model

An **agent** = one tmux session running one headless omp CLI in one git worktree, working exactly
one issue. The fleet is a fixed set of slots from `bullet.yaml` — max **10**, enforced on every
tick by counting live `bullet-*` tmux sessions.

## Default split (agents: 10)

| Role | Slots | tmux name | Work |
|---|---|---|---|
| coder | 7 | `bullet-<repo>-c-<N>` | claim `bullet:queued` → plan → implement → gates → `DONE` comment |
| reviewer | 2 | `bullet-<repo>-r-<N>` | fresh session, **different model family**: findings → fix (`review:` commits) → one `REVIEW:` verdict |
| fixer | 1 | `bullet-<repo>-f-<N>` | on `REVIEW: FIXED n`: read verdict from thread, fix each finding + regression test, `FIXED: applied n` |

The split is ratio-derived from `agents:` when `split:` is absent (ceil to coder first). Reviewers
and fixers are lazily created — a tick only spawns one if an issue is waiting in that state and a
slot is free. Worktrees live at `<repo>/.bullet/worktrees/issue-<N>` (or `run_root` override).

## Hard rules

1. An agent session is **single-issue, single-worktree**. It never touches the trunk, never pushes,
   never creates a PR. The orchestrator publishes.
2. Agent identity is the forge comment identity (e.g. a bot account). Comments are the only channel.
3. A dead session is recovered by `--continue` resume, not a fresh prompt — commits survived, context
   is in the transcript.
4. Slots are reclaimed only by `preflight` (crash sweep) — nothing else kills agents.

## Adding a role

New role = one prompt in `prompts/` + a line in the tick phase order. If it needs a label, add it to
`labels:` in `bullet.yaml` and `docs/STATE-MACHINE.md`. Nothing else.
