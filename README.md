# n8n Checkmk Connector

[![CI](https://github.com/eduardez/n8n-nodes-checkmk-connector/actions/workflows/ci.yml/badge.svg)](https://github.com/eduardez/n8n-nodes-checkmk-connector/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/n8n-nodes-checkmk-connector.svg)](https://www.npmjs.com/package/n8n-nodes-checkmk-connector)

Repository: [n8n-nodes-checkmk-connector](https://github.com/eduardez/n8n-nodes-checkmk-connector) · Homepage: [README](https://github.com/eduardez/n8n-nodes-checkmk-connector#readme) · npm package: [n8n-nodes-checkmk-connector](https://www.npmjs.com/package/n8n-nodes-checkmk-connector) · Issues: [GitHub Issues](https://github.com/eduardez/n8n-nodes-checkmk-connector/issues)

Contributions are welcome—feel free to contribute!

Community n8n action node for the [Checkmk REST API](https://docs.checkmk.com/latest/en/rest_api.html).
The operation catalog is generated from the Checkmk OpenAPI document, so the node exposes
**189 operations across 40 resources** of Checkmk 2.4.0p37 (API versions `1.0` and `v1`)
without hand-written per-endpoint code.

Beyond the generated catalog the node ships four convenience layers:

- **Live Status** – host/service status reads and a ready-made non-OK problem query.
- **Monitoring** – acknowledge a problem, read every service of one host, or schedule downtime.
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
- **Monitoring** – `Acknowledge Problem`, `Get Host Services`, `Schedule Downtime`.
- **Custom API** – any method, path, query parameters, headers and body (JSON, form or text),
  with credential headers protected.

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

Operation labels are humanized and resource-scoped: `Show all hosts` becomes `Get Many`, and
`Create Host` under **Hosts** is just `Create`, because the resource already names the object.
Labels keep their noun when dropping it would be ambiguous (BI aggregations, packs and rules)
and fall back to the full name when two operations of one resource would collide. The HTTP
method never appears in the name; the dropdown **description** carries `METHOD /path`.

### Pagination and limits

Collection operations expose **Return All** and **Limit**. Return All follows the
`rel="next"` link (including its HTTP method) until the last page. The client guards against
runaway chains at 1000 pages / 100 000 items and fails with a node error instead of looping.

### Host status

**Hosts → Get** and **Hosts → Get Many** fetch the live status of the returned hosts in one
bulk request and attach it as `host_status` (`null` when no status row matches). Turn
**Include Live Status** off to skip that request and keep the raw configuration only.

### Extension attributes

**Extension Attributes** takes a comma-separated list of attribute names (`tag_criticality,
tag_location`) and trims the `attributes` and `effective_attributes` maps of every operation's
response to those names. Leave it empty to return every attribute. The site is not a node
option: the credential **Site** already scopes the request URL.

### Optimistic locking

Operations that check ETags expose an **If-Match** field. `*` disables concurrency control
(last write wins). To detect conflicts, read the resource first, take the `etag` response
header (or use the value returned by a previous update) and paste it into the field; a stale
value returns HTTP 412.

### Live Status details

Live Status reads always use the supported `POST /domain-types/{host,service}/collections/all`
endpoints. The older `GET` collections are deprecated in Checkmk 2.4 and are never used by
these operations.

- **Columns** – multi-select of common live status columns, pre-selected with sensible defaults; anything else can be requested through **Custom API**.
- **Query** – Checkmk filter expression as a JSON object, sent as a JSON *string*.
  Use string values for `right`, e.g. `{"op":"!=","left":"state","right":"0"}`; numeric
  literals crash the status engine on 2.4.0p37.
- **Get Problems** defaults to `state != 0`; supplying a query replaces that default.
- **Get Host with Status** nests live data under `host_status` so status columns never
  overwrite configuration attributes. **Get Hosts with Status** returns every configuration
  by default (**Return All** on), makes one bulk status request, and joins both by host name.

### Monitoring details

- **Acknowledge Problem** posts to `/domain-types/acknowledge/collections/{host|service}`.
  **Target** picks host or service; a service acknowledgement also needs the exact
  **Service Description**. **Comment** is required, `sticky`/`persistent`/`notify` are passed
  through as sent, and **Expire On** is optional.
- **Get Host Services** posts one host-filtered request to
  `/domain-types/service/collections/all` (**GET** on Checkmk < 2.4) and flattens the status
  rows. **Only Problems** narrows the query to `state != 0`; **Columns** bounds the response.
  The collection is unpaged, so there is no **Return All**.
- **Schedule Downtime** posts to `/domain-types/downtime/collections/{host|service}` with
  **Start Time**/**End Time** (ISO 8601). Service downtimes take comma-separated
  **Service Descriptions**.
- Both write operations answer with HTTP 204, so the node emits one empty item.

### Custom API restrictions

- Path must start with `/` and stay relative to the API base; absolute URLs are rejected.
- `Authorization`, `Host`, `Content-Length` and `Cookie` headers cannot be overridden.
- **Query Parameters** and **Headers** take JSON objects; array query values are sent as
  repeated keys.
- **Body Content Type** selects JSON (object/array), form URL-encoded (object, arrays repeat
  the key) or text (JSON string) serialization; bodies are ignored for `GET`/`DELETE`.
- **Response Format** parses the body as JSON or returns it as plain text. **Return Full
  Response** returns `{statusCode, headers, body}`.

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
| 2.2.x | `1.0` | 2.4 catalog; query parameters added later are dropped with a warning | Smoke-tested on `2.2.0p47.cre` |
| 2.3.x | `1.0` | Same as 2.2, plus whatever 2.3 added | Not exercised |
| < 2.2 | n/a | — | Unsupported; the node logs a warning |

On 2.2 the node keeps the 2.4 catalog but adapts at runtime: parameters unknown to 2.2 are
dropped (Checkmk rejects unknown query parameters with HTTP 400), Live Status falls back to the
`GET` status collections, and operations introduced after 2.2 return 404. Operations that only
exist in 2.2 are reachable through **Custom API**.

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

Every change merged to `main` through a pull request runs `publish.yml`. Conventional Commits choose the release bump; other commit types, including `docs` and `chore`, produce a patch release:

| Commit | Version bump |
| --- | --- |
| `fix:` | patch |
| `feat:` | minor |
| `feat!:` or `BREAKING CHANGE:` | major |
| Other commit types | patch |

The workflow does not open a release PR or commit a version back to `main`. The source `package.json` may keep its development version; the release runner sets the calculated version in the npm artifact. The `vX.Y.Z` tag and GitHub release identify the same source commit and version. `CHANGELOG.md` remains historical.

If automatic publishing fails after semantic-release creates a tag, dispatch **Actions → Publish → Run workflow** from `main` with the exact `X.Y.Z` from that existing `vX.Y.Z` tag. Recovery builds the tagged commit, requires it to be an ancestor of `main`, and skips an existing npm version only when its registry `gitHead` matches that commit. A manual version without an existing tag must exceed both the highest stable git tag and npm `latest`. The workflow never pushes a version commit to `main`.

Configure the npm **Trusted Publisher** for owner `eduardez`, repository `n8n-nodes-checkmk-connector`, and workflow filename `publish.yml` only. Leave the environment blank and allow direct `npm publish`; the workflow uses Node 22 and npm 11.19.0 with OIDC, not an npm token.

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
(`.github/workflows/ci.yml`). To run the integration suite against a disposable site, manually dispatch CI with `run_integration` enabled and configure the `CHECKMK_*` repository secrets.

### Agent skills

Repo-scoped skills for coding agents live in `.claude/skills/`:

- [`checkmk-api`](.claude/skills/checkmk-api/SKILL.md) – URL construction, auth, status queries,
  ETags, pagination, Custom API limits.
- [`catalog-regeneration`](.claude/skills/catalog-regeneration/SKILL.md) – generator usage and
  review checklist.
- [`release`](.claude/skills/release/SKILL.md) – Conventional Commits, protected-main publishing, npm Trusted Publishing, and recovery.



## License

MIT © 2026 eduardez
