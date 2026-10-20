---
name: catalog-regeneration
description: Use when regenerating the Checkmk operation catalog or updating it for a new Checkmk version - covers the generator, version assert, output files, and review checklist.
---

# Catalog regeneration

The node's operations live in `nodes/CheckmkConnector/catalog/operations.generated.ts`, generated from the Checkmk OpenAPI document. Never hand-edit it or `docs/operations.md`.

## Generate

```sh
# Local site (defaults to http://localhost:8080/cmk/check_mk/api/1.0/openapi-doc.yaml)
CHECKMK_USERNAME=cmkadmin CHECKMK_PASSWORD=mypassword npm run generate

# Explicit file or URL
npm run generate -- --input /tmp/openapi-2.5.yaml

# Environment override
CHECKMK_OPENAPI_URL=https://monitoring.example.com/cmk/check_mk/api/v1/openapi-doc.yaml npm run generate
```

The script asserts `info.version === "1.0"`. A document reporting another version fails by design: bump the supported version in the generator only after the catalog and tests are updated.

## What is generated

- `nodes/CheckmkConnector/catalog/operations.generated.ts` — `OPERATIONS` and `RESOURCES`.
- `docs/operations.md` — sortable operation table.

Stable rules:

- Operation value = full OpenAPI `operationId`; duplicates or missing IDs abort generation.
- Resource = camelCase of the first tag; resource labels are title-cased (`host_config` →
  `Host Config`).
- Operation labels are humanized summaries with the resource noun removed (`Show all hosts` →
  `Get Many`, `Create Host` → `Create`); `RESOURCE_NOUNS` lists the droppable nouns per resource.
  The HTTP method lives in the option description, never in the label.
- Header parameters `Content-Type`, `Accept`, `Authorization` are dropped; `If-Match` becomes `ifMatch`.
- `paginated` is true only for `GET` paths containing `/collections/`.
- Deprecated operations stay in the catalog and are marked.

## After regenerating

1. `npm run build && npm run lint && npm test` — the catalog test pins the operation count and structural invariants.
2. Update the pinned count and any changed expectations in `test/catalog.test.js` only when the new document legitimately changes them.
3. Diff `docs/operations.md`; review removed operations and used `operationId`s.
4. Note the source Checkmk version in the commit message, e.g. `feat: regenerate catalog from 2.5.0`.
5. If the new document changes schemas or removes endpoints, check `test/integration/checkmk.test.js` against a matching site.

## Version selection

The credential's `apiVersion` only changes the URL segment. One catalog serves both while the documents stay compatible; validate against a real instance before claiming support for a new Checkmk major.
