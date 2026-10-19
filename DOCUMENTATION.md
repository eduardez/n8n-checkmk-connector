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
| `label` | `"<METHOD> <summary>"`, `" (deprecated)"` appended when `deprecated: true` |
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

Live Status reads use the `POST /domain-types/{host,service}/collections/all` endpoints only;
the `GET` variants are deprecated in Checkmk 2.4.

- `getHost` reads the host configuration (`/objects/host_config/{host_name}`) and one filtered
  status row, returning the configuration with `host_status` appended. Without a matching
  status row `host_status` is `null`; with **Include Host Configuration** off it returns
  `{ host_name, host_status }`.
- `getHosts` lists all host configurations first, then issues exactly **one** bulk status
  request (columns and optional query, no per-host requests) and joins both by host name.
- `getServices` / `getProblems` post to the service status collection. Query objects are
  serialized to a JSON string because Checkmk expects a string field; `right` must be a string
  (`"0"`), numeric literals crash the 2.4.0p37 status engine.
- Defaults: 6 host columns, 6 service columns, 7 problem columns, problem query
  `{"op":"!=","left":"state","right":"0"}`.

Because status collections do not emit `next` links, `returnAll` has no effect beyond
returning the full status response (bounded by `limit`).

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
  live status joins, deprecated-endpoint avoidance.
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
