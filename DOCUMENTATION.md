# Checkmk Connector – technical documentation

This document describes how the node is built, how the catalog is produced, and which
invariants the implementation guarantees. End-user setup lives in [README.md](README.md);
the per-operation table lives in [docs/operations.md](docs/operations.md).

## Layout

```
credentials/CheckmkConnectorApi.credentials.ts   Bearer credential + /version health check
nodes/CheckmkConnector/
  CheckmkConnector.node.ts                       resource/operation dispatch + item loop
  catalog/operations.generated.ts                generated catalog (single source of truth)
  catalog/types.ts                               catalog type definitions
  transport/CheckmkClient.ts                     URL building, requests, pagination
  transport/errors.ts                            Checkmk problem -> NodeApiError
  execute/executeCatalogOperation.ts             catalog operation -> request
  execute/executeCustomOperation.ts              Custom API resource
  live/liveStatus.ts                             Live Status helpers
  monitoring/monitoring.ts                       Monitoring resource (acknowledge, downtime)
  ui/buildProperties.ts                          n8n parameter generation
scripts/generate-catalog.mjs                     OpenAPI -> catalog + docs generator
```

`dist/` is produced by `npm run build` (`tsc` + `gulp build:icons`) and is the only content
published to npm.

## Catalog generation

`npm run generate` downloads the Checkmk OpenAPI document, validates `info.version === "1.0"`
and writes two files:

1. `nodes/CheckmkConnector/catalog/operations.generated.ts`
2. `docs/operations.md`

For every path/method pair the generator records:

| Field | Source |
| --- | --- |
| `id` | OpenAPI `operationId` |
| `resource` | first tag, slugified (`host_config` → `hosts`) with a human label |
| `label` | humanized summary: verb prefixes mapped (`Show all` → `Get Many`), articles dropped, title-cased; `" (deprecated)"` appended when `deprecated: true`, `" (METHOD)"` when two operations of a resource end up with the same label |
| `method`, `path` | operation verb and path template |
| `pathParameters`, `queryParameters`, `headerParameters` | OpenAPI parameters, with kind, type, enum values, required flag, description, example and schema default |
| `requestBody` | required flag, schema `$ref` name, first example (resolved through `components/schemas` when the example is schema-generated) |
| `ifMatch` | `true` when the operation declares an `If-Match` header |
| `paginated` | `true` for `GET` operations below `/collections/` |
| `deprecated` | OpenAPI `deprecated` |

The generator drops `Content-Type`, `Accept` and `Authorization` header parameters because the
transport owns them. Operation IDs must be unique; generation fails otherwise. Running the
generator is deterministic for a given document, so a regeneration diff is reviewable.

The current catalog: 189 operations, 40 resources, 32 paginated, 20 ETag-protected, 3
deprecated.

## Execution flow

`execute()` iterates input items. For each item it resolves `resource`:

- `customApi` → `executeCustomOperation`
- `liveStatus` → `getHost` / `getHosts` / `getServices` / `getProblems`
- `monitoring` → `acknowledgeProblem` / `getHostServices` / `scheduleDowntime`
- anything else → the catalog operation with a matching `operation` id

Results are wrapped: arrays are split into one n8n item per element, scalars are emitted as
`{ "value": … }`, and every item carries `pairedItem: { item: itemIndex }`.
`continueOnFail()` emits `{ "error": message }` per failed item; otherwise the error is
re-thrown unchanged when it is already a node error, or wrapped by `toNodeApiError`.

### Catalog operations

`executeCatalogOperation` assembles the request from catalog metadata and generated field
names:

- path parameters are URL-encoded and substituted into the path template
- query values: `options` fields pass their value, `number` fields `Number(value)`,
  `boolean` fields `value === true`, `string` fields verbatim; array parameters are sent as
  repeated keys (`arrayFormat: "repeat"`)
- JSON body fields accept objects or arrays, are required when the OpenAPI operation requires
  a body, and are omitted for `GET`/`DELETE` when empty
- `If-Match` defaults to `*` and is sent verbatim, quotes included
- paginated operations call `requestAll` with the item's Return All / Limit settings

### Transport

`CheckmkClient` builds `<host>/<site>/check_mk/api/<version>/<path>`:

- the site name is URL-encoded, slashes around it are trimmed
- absolute `http(s)` URLs are passed through unchanged (pagination links)
- protocol-relative URLs and non-HTTP schemes are rejected with a node error

Every request sets `Accept: application/json`, `arrayFormat: "repeat"`, `json: true`,
`returnFullResponse: true` and the credential's TLS-skip flag. `Content-Type` is only sent
together with a body. Requests go through
`helpers.httpRequestWithAuthentication('checkmkConnectorApi', …)`, so n8n handles the OAuth-free
Bearer header from the credential definition.

### Pagination

`requestAll` starts from the supplied options, reads `links[]` for `rel === "next"`, and reuses
the link's HTTP method when it is one of the supported verbs (the status collections are `POST`
but advertise `GET` links). It stops when the collected items reach the limit for bounded
reads, when the link's `method` is not valid, or when no next link exists. Hard guards raise a
node error at 1000 pages or 100 000 items.

### Error mapping

`toNodeApiError` understands both node-http error shapes:

```
{ statusCode, body: { title, detail, fields } }
{ response: { statusCode, body: { title, detail, fields } } }
```

The HTTP status is preserved as a string in `httpCode`, `title` becomes the message, and
`detail` plus formatted `fields` entries become the description. Anything unparseable is
reported as `Checkmk request failed: <message>`.

## Live Status

Live Status reads use the `POST /domain-types/{host,service}/collections/all` endpoints on
Checkmk 2.4 and newer. Before 2.4 those collections only accept `GET`, so the node switches to
`GET` with the same values as query parameters and never touches the deprecated `GET`
endpoints on 2.4+.

- `getHost` reads the host configuration (`/objects/host_config/{host_name}`) and one filtered
  status row, returning the configuration with `host_status` appended. Without a matching
  status row `host_status` is `null`; with **Include Host Configuration** off it returns
  `{ host_name, host_status }`.
- `getHosts` (**Return All** on by default) lists all host configurations first, then issues
  exactly **one** bulk status request (columns and optional query, no per-host requests) and
  joins both by host name.
- `getServices` / `getProblems` post to the service status collection. Query objects are
  serialized to a JSON string because Checkmk expects a string field; `right` must be a string
  (`"0"`), numeric literals crash the 2.4.0p37 status engine.
- Columns are picked from a curated multi-select (host table for host operations, service table
  for service/problem operations). Defaults: 6 host columns, 6 service columns, 7 problem columns, problem query
  `{"op":"!=","left":"state","right":"0"}`.

Status collections do not emit `next` links, so `returnAll` does not page status rows: one
request returns every match. For `getHosts` it pages the host configuration listing, and the
joined output is only truncated by `limit` when **Return All** is off.

### Checkmk older than 2.4

The version probe runs once per workflow and feeds a legacy adapter:

- Query parameters that do not exist in the 2.2 API (`fields`, `hostnames`, `include_links`,
  `site` on host listing, `effective_attributes` on folder host listing, `mode` on host tag
  group deletion, `columns` on service-show invocation) are dropped with a warning instead of
  triggering HTTP 400 "Unknown field".
- Operations added after 2.2 (for example `POST /domain-types/host/collections/all`) still
  return 404 on such servers; use **Custom API** only for endpoints that exist there.
- The 2.4 catalog remains the single source of truth; UI examples are never used as field
  defaults, so unset parameters are not sent.

## Monitoring resource

Three curated operations cover alert triage and maintenance without exposing raw OpenAPI
fields. All of them are available on Checkmk 2.2 and newer; none of them is generated from the
catalog.

| Operation | Request |
| --- | --- |
| `acknowledgeProblem` | `POST /domain-types/acknowledge/collections/{host|service}` |
| `getHostServices` | `POST /domain-types/service/collections/all`, `GET` before 2.4 |
| `scheduleDowntime` | `POST /domain-types/downtime/collections/{host|service}` |

- `acknowledgeProblem` sends `acknowledge_type` (the **Target**), `host_name`, `comment`,
  `sticky`, `persistent` and `notify`; `service_description` is added for service targets and
  `expire_on` only when **Expire On** is set.
- `scheduleDowntime` sends `downtime_type`, `host_name`, `start_time`, `end_time`,
  `service_descriptions` for service targets, and `comment` when supplied.
- `getHostServices` reuses the Live Status transport (including the pre-2.4 `GET` fallback) and
  flattens each row through `normalizeStatusItem`. Its filter is either
  `{"op":"=","left":"host_name","right":"<host>"}` or, with **Only Problems**,
  `{"op":"and","expr":[<host filter>,{"op":"!=","left":"state","right":"0"}]}` — Checkmk
  rejects an `and` node built from `left`/`right`.
- Both write operations answer with HTTP 204 and no body, so the handler returns `{}` and the
  node emits one empty item.

## Custom API resource

`executeCustomOperation` accepts any method (GET/POST/PUT/PATCH/DELETE), a path relative to the
API base, a query object, headers and a JSON body.

- Paths must start with `/`; protocol-relative paths, schemes and drive-letter prefixes are
  rejected, so the request can never leave the configured site.
- `Authorization`, `Host`, `Content-Length` and `Cookie` headers are rejected (case-insensitive)
  because the credential or transport owns them.
- Bodies are JSON objects only and are skipped for `GET`/`DELETE`.
- **Return Full Response** returns `{statusCode, headers, body}`.

## Testing

- `npm test` builds and runs unit tests against `dist/` with `node:test`:
  catalog invariants, URL building, header/body handling, error mapping, pagination guards,
  live status joins, deprecated-endpoint avoidance, generated operation labels, and the
  Monitoring request shapes.
- `npm run test:integration` additionally exercises a real site when
  `CHECKMK_BASE_URL`, `CHECKMK_SITE`, `CHECKMK_USERNAME` and `CHECKMK_PASSWORD` are set. It
  creates a folder and host, activates changes, verifies ETag conflict handling (412), reads
  the host from the live status, then removes the host and folder recursively and activates
  again. Cleanup is best effort and also runs on failure.

## Regeneration checklist

```bash
CHECKMK_OPENAPI_URL=https://checkmk.example.com/production/check_mk/api/1.0/openapi-doc.yaml \
  npm run generate
npm run build && npm run lint && npm test
```

Review the diff of `operations.generated.ts` and `docs/operations.md`, then bump the package
version and add a `CHANGELOG.md` entry.
