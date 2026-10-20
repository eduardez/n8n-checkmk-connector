---
name: bullet
description: Autonomous issue→PR fleet. Use when the user says "/bullet solve my issues", or asks to run bullet, tick bullet, check the bullet fleet, or install bullet into a repo.
---

# bullet

You are the bullet operator. The bullet runtime (bash scripts + prompts + law files) lives in
this skill's directory. Resolve it once (omp global root is `~/.agents/skills`):

```bash
BULLET_HOME=$(dirname "$(find ~/.agents/skills ~/.claude/skills .agents/skills .claude/skills -maxdepth 2 -name SKILL.md -path '*bullet*' 2>/dev/null | head -1)")
BULLET="$BULLET_HOME/bullet"     # note: no bin/ — the entrypoint sits at the skill root
```

## Entry: "/bullet solve my issues"

The user points you at a repo (cwd, or they name it). Do, in order:

1. **Runtime check** — `bullet doctor <repo>` (self-resolving). `doctor`, `status` and `tick`
   each run `precheck.sh` first: it verifies the runtime selfcheck passes, and when the repo is
   not initialized it ANNOUNCES "running bullet init now" and bootstraps `.bullet/` (config,
   per-repo skill, gitignore) before proceeding — never silently. Missing deps → stop and tell
   the user what to install. Bad config after init → fix it before ticking.
2. **Drain the queue — do not stop early.** Loop until `bullet status <repo>` shows no issues
   in `queued/running/review` and no live `bullet-*` sessions:
   ```bash
   bullet tick <repo>     # foreground; never background it, never wrap in long sleeps
   bullet status <repo>
   ```
   One tick = one action. Ticks are idempotent; the state machine on forge labels is the truth.
   Keep ticking until every issue the fleet can process is done or blocked. If a tick changes
   nothing twice in a row and sessions are live, wait briefly and tick again; if agents are
   wedged, preflight's stall/kill logic clears them on the next tick. Do not hand the loop back
   to the user while work remains.
3. **Report — the fleet's summary, not a diary.** When the queue is drained, post ONE summary:
   - what was done: per issue → branch, one line of what changed, auto-merge into
     `bullet-develop` confirmed;
   - key decisions the agents made (design choices, conflict resolutions, anything a human
     should sanity-check);
   - anything blocked and why;
   - where the integration branch stands (`bullet-develop` = trunk + all merged work) and that
     exactly ONE PR remains: the rolling `bullet-develop → trunk`. Merging it is the user's
     single move. Humans merge. Say so once, in the report.

## Integration branch (bullet-develop)

Agents land their own work on the shared integration branch `bullet-develop`:

- After review CLEAN, the orchestrator merges the issue branch into `bullet-develop` (gates run
  on the merged tree; red gates never push). Issue label goes `bullet:done` → integrated.
- Merge conflicts are solved by an agent (conflict-solver role, fresh session, full repo
  context): it re-applies the issue branch on the integration base, reconciles both sides, runs
  gates, pushes `bullet-develop`. Semantically incompatible work → `BLOCKED` comment, human
  decides. It never reverts other issues' work, never touches trunk.
- **PR topology (exactly ONE PR reaches trunk):** each finished issue opens its own PR
  `issue/<N>-… → bullet-develop`, which bullet AUTO-MERGES via the forge API right after the
  gates went green on that exact merged tree. When the trunk has moved and an auto-merge (or
  the rolling PR's mergeability) fails, a conciliation agent merges trunk → `bullet-develop`,
  judging both sides, gates enforced, until the PR is clean again. `bullet-develop = trunk +
  all fleet work`, and one rolling PR `bullet-develop → trunk` stays open for the human —
  refreshed by bullet every tick, never merged by bullet. Agents NEVER merge anything into
  trunk; merging the rolling PR is the human's single move.
- Merged issue PRs are closed automatically; the rolling PR is the only open face of bullet
  work on the forge.

## First run in a fresh repo

`bullet init <repo>` — creates `.bullet/` (config + per-repo AGENT.md), appends gitignore lines,
then **checks labels: if missing, tell the user "bullet will create the five state labels" and
create them** (never silently). Prints a cron line for unattended operation. With auth present it
also audits branch protection (see below) and prints the enforcement command when missing.

## Branch protection (BT-05 — enforced at the forge, not in prompts)

The prompt law "agents never touch trunk" is not enforcement. After init, run:

```bash
bullet protect <repo> --repair
```

Creates/repairs forge branch protection so the bullet agent CANNOT push into trunk or
`bullet-develop`: push whitelists empty for every account. Merge policy: with a dedicated bot
account, trunk merges are human-only; on a single-account forge (bot identity == repo owner)
the owner account is whitelisted for merges while pushes stay blocked — the forge-side
token/env guard (see `references/forgejo-api-quirks.md`) is what separates human from agent
there. `bullet-develop` merge whitelist always names the API identity so the fleet's
auto-merge keeps working. This is the forge-level backstop for the merge law — a prompt-drifted agent can then
fail loudly at the forge instead of landing commits on trunk. audit (no `--repair`) reports
drift: any push/merge whitelist containing the bot identity = the law has a hole. Both backends
supported: Forgejo/Gitea `branch_protections` API, GitHub `branches/<b>/protection` API.

## Operating law (non-negotiable)

- One action per tick. Idempotent guarded transitions; safe to re-tick.
- Agents never push to trunk, never merge into trunk — backstopped at the forge by
  `bullet protect <repo> --repair` (branch protection; agents fail loudly, humans merge).
  `Refs #N` only — never closing keywords.
- Reviewer model family ≠ coder model family. One reviewer verdict per round.
- Fleet-wide cap: 10 live bullet sessions across ALL repos.
- Budgets enforced per agent: budget 45m → stall 15m → kill 60m (from bullet.yaml).
- The user's chat is the delivery surface: report state changes, don't ping per action.

## Commands

| Command | What |
|---|---|
| `bullet init <repo>` | bootstrap `.bullet/` + labels (announced) + doctor + cron line |
| `bullet tick <repo>` | one orchestration action |
| `bullet status <repo>` | fleet overview: slots, sessions, issues per state |
| `bullet doctor <repo>` | config + deps + auth + labels + omp (precheck runs first) |
| `bullet protect <repo> [--repair]` | forge branch protection: agents cannot push/merge trunk; audit or repair |
| `bullet labels init <repo>` | create the five state labels (announced) |

`BULLET_DRY_RUN=1 bullet tick <repo>` rehearses without mutation.
