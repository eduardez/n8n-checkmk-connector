---
name: checkmk-api
description: Use when calling the Checkmk REST API from this repository or extending the connector - covers URL construction, Bearer auth, status collections, query syntax, ETags, pagination, and Custom API limits.
---

# Checkmk REST API in this repository

## Base URL

```text
{host}/{site}/check_mk/api/{apiVersion}/{path}
```

- `host` may not contain `/check_mk` or the site name. The client strips trailing slashes from `host` and `site`.
- `apiVersion` is `1.0` (Checkmk <= 2.4) or `v1` (Checkmk >= 2.5). On 2.4 both paths serve the same document.
- The path is always relative to the API base, except when following an absolute `links.next` URL from a paginated response.

## Authentication

```http
Authorization: Bearer <username> <password>
Accept: application/json
```

Checkmk uses the native Bearer form `Bearer <user> <password>`; this is not Basic auth. Use a dedicated automation user with the minimum needed permissions.

## Status data (Live Status)

Use POST collections, never the deprecated GET ones:

```http
POST /domain-types/host/collections/all
POST /domain-types/service/collections/all
```

Body shape:

```json
{
  "sites": ["cmk"],
  "query": "{\"op\":\"!=\",\"left\":\"state\",\"right\":0}",
  "columns": ["name", "state", "plugin_output"]
}
```

- `query` MUST be a JSON **string**, not an object.
- `right` in comparison expressions MUST be a string, e.g. `"0"`; numeric literals return HTTP 500 on 2.4.
- `columns` is a JSON array of Livestatus column names; unknown columns fail the request.
- `sites: []` means all sites on the raw API; this node never sends it, because the credential site already scopes the URL.
- `GET /domain-types/host/collections/all`, `GET /domain-types/service/collections/all`, and `GET /objects/host/{host_name}/collections/services` are deprecated and removed in Checkmk 3.0.

## Configuration objects and ETags

- Headers that accept `If-Match`: pass `*` to bypass optimistic locking (last write wins), or the exact ETag from a prior read, including quotes.
- Never strip or normalize ETag quotes.
- Keys in `PUT` bodies use the operation's documented update key (`update_attributes`, `update_config`, ...), not the create key.

## Pagination

- Collection responses carry `value` plus `links`; follow the entry with `rel: "next"`.
- Keep `arrayFormat: "repeat"` when sending array query parameters (`?columns=a&columns=b`), not bracket notation.
- `returnAll: false` slices the first page to `limit`.

## Errors

| Status | Meaning |
|---|---|
| 400 | Invalid query/body; check the JSON string format and enum values |
| 401/403 | Bad automation user or missing permissions |
| 404 | Object or endpoint absent in this Checkmk version |
| 412 | `If-Match` mismatch |
| 428 | Write without `If-Match` |

Responses carry `title`, `detail`, and `fields`; map them to `NodeApiError` as `transport/errors.ts` does.

## Custom API resource

Allows any method/path under the API base. It rejects absolute URLs and the headers `Authorization`, `Host`, `Content-Length`, `Cookie`. Use it for endpoints not present in the generated catalog, not to bypass authentication.

## Checkmk 2.2 constraints

- 2.2 rejects unknown query parameters with HTTP 400 (`These fields have problems: site, hostnames, include_links, fields`). Never send a parameter unless the user set it.
- Only 157 operations exist in 2.2; `POST /domain-types/{host,service}/collections/all` is 2.4+. Use the `GET` status collections there.
- Query parameter differences on the 2.4 catalog: see `nodes/CheckmkConnector/transport/compatibility.ts`.
