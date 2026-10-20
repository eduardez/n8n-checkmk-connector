# n8n Checkmk Connector

[![CI](https://github.com/eduardez/n8n-checkmk-connector/actions/workflows/ci.yml/badge.svg)](https://github.com/eduardez/n8n-checkmk-connector/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/n8n-nodes-checkmk-connector.svg)](https://www.npmjs.com/package/n8n-nodes-checkmk-connector)

Community n8n action node for the [Checkmk REST API](https://docs.checkmk.com/latest/en/rest_api.html).
The operation catalog is generated from the Checkmk OpenAPI document, so the node exposes
**189 operations across 40 resources** of Checkmk 2.4.0p37 (API versions `1.0` and `v1`)
without hand-written per-endpoint code.

Beyond the generated catalog the node ships three convenience layers:

- **Live Status** – host/service status reads and a ready-made non-OK problem query.
- **Custom API** – an arbitrary authenticated request for endpoints missing from the catalog.
- **Pagination** – every collection operation follows `rel="next"` links or returns a bounded page.

## Installation

The npm package is `n8n-nodes-checkmk-connector`. Releases up to `0.2.0` were published as
`n8n-checkmk-connector` and are deprecated.

### As a community node

```bash
npm install n8n-nodes-checkmk-connector
```

Restart n8n afterwards. The node appears as **Checkmk Connector**.

### Manual install (custom nodes folder)

```bash
mkdir -p ~/.n8n/custom
cd ~/.n8n/custom
npm init -y
npm install n8n-nodes-checkmk-connector
```

Set `N8N_CUSTOM_EXTENSIONS=~/.n8n/custom` (or rely on the default `~/.n8n/custom` lookup) and
restart n8n.

## Credentials

Create a **Checkmk Connector API** credential:

| Field | Meaning | Example |
| --- | --- | --- |
| Host | Scheme, host and optional port of the Checkmk site, **without** the site path | `https://checkmk.example.com` |
| Site | Site ID | `production` |
| API Version | `1.0` or `v1` | `1.0` |
| Username | Automation user | `automation` |
| Password | Automation secret | `…` |
| Ignore SSL Issues | Skip certificate verification (self-signed setups only) | `false` |

The node authenticates with `Authorization: Bearer <username> <password>` and calls
`<host>/<site>/check_mk/api/<version>/…`. Create a dedicated automation user with the
**Customer** role or an equivalent restricted role; the node can modify configuration.

## Resources

- **Generated resources** – folders, hosts, services, rules, users, notifications, BI,
  audit logs, host/service groups, tag groups, sites, broker connections, metrics and the
  remaining Checkmk domains. See [`docs/operations.md`](docs/operations.md) for the full table.
- **Live Status** – `Get Host with Status`, `Get Hosts with Status`, `Get Services`,
  `Get Problems`.
- **Custom API** – any method/path/query/headers/body combination, with credential headers
  protected.

### Parameter naming

Catalog parameter fields are derived from the OpenAPI `operationId` and parameter name:

```
path_<operationId>_<param>     e.g. path_cmk_gui_openapi_endpoints_host_config_update_host_host_name
query_<operationId>_<param>
header_<operationId>_<param>
body_<operationId>          JSON request body (defaults to the OpenAPI example)
ifMatch_<operationId>       ETag sent as If-Match, "*" by default
returnAll_<operationId>     follow pagination links
limit_<operationId>         page size when Return All is off
```

Names are long on purpose: they are stable across regenerations and never collide between
operations that share a parameter name. The n8n UI shows a readable label; the long key is
only visible in expressions (`$parameter["path_…"]`) and exported JSON.

### Pagination and limits

Collection operations expose **Return All** and **Limit**. Return All follows the
`rel="next"` link (including its HTTP method) until the last page. The client guards against
runaway chains at 1000 pages / 100 000 items and fails with a node error instead of looping.

### Optimistic locking

Operations that check ETags expose an **If-Match** field. `*` disables concurrency control
(last write wins). To detect conflicts, read the resource first, take the `etag` response
header (or use the value returned by a previous update) and paste it into the field; a stale
value returns HTTP 412.

### Live Status details

Live Status reads always use the supported `POST /domain-types/{host,service}/collections/all`
endpoints. The older `GET` collections are deprecated in Checkmk 2.4 and are never used by
these operations.

- **Columns** – comma-separated list of live status columns.
- **Query** – Checkmk filter expression as a JSON object, sent as a JSON *string*.
  Use string values for `right`, e.g. `{"op":"!=","left":"state","right":"0"}`; numeric
  literals crash the status engine on 2.4.0p37.
- **Get Problems** defaults to `state != 0`; supplying a query replaces that default.
- **Get Host with Status** nests live data under `host_status` so status columns never
  overwrite configuration attributes. **Get Hosts with Status** fetches all configurations,
  one bulk status request, and joins both by host name.

### Custom API restrictions

- Path must start with `/` and stay relative to the API base; absolute URLs are rejected.
- `Authorization`, `Host`, `Content-Length` and `Cookie` headers cannot be overridden.
- Bodies are JSON objects and ignored for `GET`/`DELETE`.
- Optional **Return Full Response** returns `{statusCode, headers, body}`.

## Errors

Checkmk problem responses (`title`, `detail`, `fields`) are surfaced as n8n node API errors:
`title` becomes the message, `detail` plus field problems become the description, and the HTTP
status is preserved. Enable **Continue On Fail** to emit `{ "error": "…" }` per item instead.

## Examples

- [`examples/live-monitoring.workflow.json`](examples/live-monitoring.workflow.json) – manual
  trigger → live non-OK problems.
- [`examples/host-lifecycle.workflow.json`](examples/host-lifecycle.workflow.json) – create a
  host, activate changes, read it back.

Both workflows ship with a placeholder credential; select your own **Checkmk Connector API**
credential after import.

## Compatibility and versioning

### Checkmk and REST API versions

| Checkmk | Credential API version | Catalog | Verification |
| --- | --- | --- | --- |
| 2.4.x | `1.0`, or `v1` | Generated from 2.4.0p37 CRE (131 paths, 189 operations) | Full integration suite on `2.4.0p37.cre` |
| 2.5.x | `v1` (recommended), `1.0` (legacy) | Same catalog | Full integration suite plus document diff on `2.5.0-2025.11.04.cre` |
| 3.0.x | `v1` only | Same catalog | Not exercised; the node warns when `1.0` is selected |
| < 2.4 | n/a | — | Unsupported; the node logs a warning |

The Checkmk 2.5 document keeps all 131 paths and 189 operations. Two differences matter when
considering regeneration:

- **22 operation IDs were renamed** (LDAP connections, passwords, site connections, user roles).
  Regenerating from 2.5 would rename UI fields and break saved workflows, so the shipped catalog
  stays generated from 2.4.
- **20 operations changed request bodies or parameter schemas** (password `owned_by`, site
  connection models, user roles, quick setup `search`). The node sends exactly what you enter;
  generated defaults for those operations reflect 2.4.

The node probes `/version` at most once per workflow per hour and logs a warning when the site
predates 2.4 or when API `1.0` is used against Checkmk 3.0. The probe never fails an execution.

### Package versions

Releases are automated with [release-please](https://github.com/googleapis/release-please) from
[Conventional Commits](https://www.conventionalcommits.org/) on `main`:

| Commit prefix | Version bump |
| --- | --- |
| `fix:` | patch |
| `feat:` | minor |
| `feat!:` or `BREAKING CHANGE:` | major |

Release please opens a release PR that updates `package.json` and `CHANGELOG.md`; merging it tags
the commit (`vX.Y.Z`) and creates the GitHub release. The same workflow run then calls
`.github/workflows/publish.yml`, which publishes the tarball to npm with provenance and skips
versions that already exist. Do not edit the version or `CHANGELOG.md` by hand.

Required repository secret: `NPM_TOKEN` (npm automation token allowed to publish
`n8n-nodes-checkmk-connector`).

## Development

```bash
npm install
npm run build          # tsc + icons into dist/
npm run lint           # eslint (n8n community rules)
npm test               # unit tests against dist/
npm run generate       # regenerate catalog + docs/operations.md from Checkmk
```

`npm run generate` fetches the document from `CHECKMK_OPENAPI_URL`, or from a local site at
`http://localhost:8080/cmk/check_mk/api/1.0/openapi-doc.yaml` when the variable is unset. Pass
`--input /path/to/openapi.yaml` to work offline. See
[`.claude/skills/catalog-regeneration/SKILL.md`](.claude/skills/catalog-regeneration/SKILL.md)
for the regeneration checklist.

Integration tests run against a real site and clean up after themselves:

```bash
CHECKMK_BASE_URL=https://checkmk.example.com \
CHECKMK_SITE=production \
CHECKMK_USERNAME=automation \
CHECKMK_PASSWORD=secret \
CHECKMK_EXPECTED_VERSION=2.4.0p37.cre \
npm run test:integration
```

They create a folder and a host, activate changes, verify ETag conflicts, and delete everything
again (recursively). The test is skipped when the four connection variables are missing;
`CHECKMK_EXPECTED_VERSION` defaults to `2.4.0p37.cre`.

CI runs build, lint, unit tests, and `npm pack --dry-run` on Node 20 and 22
(`.github/workflows/ci.yml`). The integration suite is a manual workflow that reads the
`CHECKMK_*` repository secrets.

### Agent skills

Repo-scoped skills for coding agents live in `.claude/skills/`:

- [`checkmk-api`](.claude/skills/checkmk-api/SKILL.md) – URL construction, auth, status queries,
  ETags, pagination, Custom API limits.
- [`catalog-regeneration`](.claude/skills/catalog-regeneration/SKILL.md) – generator usage and
  review checklist.
- [`release`](.claude/skills/release/SKILL.md) – Conventional Commits, release-please, npm
  publishing, required secrets.

## License

MIT © 2026 eduardez
