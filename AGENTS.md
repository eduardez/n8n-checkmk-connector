# AGENTS.md

Orientation for coding agents. User-facing docs live in [README.md](README.md); the design
rationale lives in [DOCUMENTATION.md](DOCUMENTATION.md); hard invariants live in
[RULES.md](RULES.md). Task recipes live in `.claude/skills/` (`catalog-regeneration`,
`checkmk-api`, `release`).

## Setup and commands

Node >= 20.15, npm, TypeScript.

```sh
npm install
npm run build             # rimraf dist && tsc && gulp build:icons
npm run lint              # eslint credentials nodes package.json
npm test                  # build, then node --test test/*.test.js
npm run generate          # regenerate catalog + docs/operations.md (needs a Checkmk site)
npm run format            # prettier over credentials, nodes, test, scripts
```

Tests import from `dist/` and stub `IExecuteFunctions` through
`test/helpers/mockContext.js`; they only pass after a build, which `npm test` already does.

## Layout

```
credentials/CheckmkConnectorApi.credentials.ts   Bearer credential + /version health check
nodes/CheckmkConnector/CheckmkConnector.node.ts  description, properties, resource dispatch
nodes/CheckmkConnector/catalog/                  generated catalog + types (never hand-edit)
nodes/CheckmkConnector/execute/                  catalog operation and Custom API execution
nodes/CheckmkConnector/live/liveStatus.ts        Live Status reads, legacy 2.2 adapter
nodes/CheckmkConnector/monitoring/monitoring.ts  curated Monitoring operations
nodes/CheckmkConnector/transport/                URL building, requests, pagination, errors
nodes/CheckmkConnector/ui/buildProperties.ts     parameter generation from the catalog
scripts/generate-catalog.mjs                     OpenAPI -> catalog + docs generator
```

A change that touches parameters usually touches three places: the catalog/generator, the
property builder, and a test. Keep the diff to those.

## Workflow

1. Read the affected module end to end before editing; this repo has one convention per
   concern and no parallel abstractions.
2. For catalog or label work: edit `scripts/generate-catalog.mjs`, regenerate, then review the
   diff of `catalog/operations.generated.ts` and `docs/operations.md` — the diff is the proof.
3. For a new curated resource: add a module under `nodes/CheckmkConnector/<resource>/`, a
   selector block in `ui/buildProperties.ts`, a branch in the dispatch map, and a test.
4. Add or extend tests in `test/` in the existing `node:test` + mock-context style; assert
   request shape and emitted items, not internal calls.
5. Gate: `npm run build && npm run lint && npm test` must be green with no lint warnings.
6. Behavioural changes get a live check against a real site (`test:integration` or a throwaway
   script) before you claim them; mocks do not prove Checkmk's endpoint contract.

## Known gotchas

- Lint runs the `n8n-nodes-base` rules. Options in an `options` array need `action`; write a
  human sentence, do not accept the slug the autofixer generates.
- `node-param-default-missing` fires when an option `default` is a member expression such as
  `defaultOperation.id`; assign it to a local `const` first.
- Generated property names are `path_<operationId>_<param>` style; never rename them, saved
  workflows store the raw key.
- Checkmk status filters (`/collections/all`): an `and` node must carry `expr: [...]`;
  `left`/`right` returns HTTP 500 `KeyError: 'expr'`. Numeric operands must be strings (`"0"`),
  numbers silently match nothing.
- Create/activate/delete endpoints need `ifMatch: '*'` or they answer HTTP 428.
- Acknowledge and downtime answer HTTP 204 with an empty body; handlers return `{}` so the item
  is empty instead of `{value: ""}`.
- `scripts/generate-catalog.mjs` asserts `info.version === "1.0"`; bump support deliberately,
  not by editing the assertion alone.
