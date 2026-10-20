# RULES.md

Hard invariants for this repository. A change that breaks one is wrong even if tests pass.

## Catalog and operations

1. `nodes/CheckmkConnector/catalog/operations.generated.ts` and `docs/operations.md` are
   generated. NEVER hand-edit them; change `scripts/generate-catalog.mjs` and regenerate.
2. NEVER change an operation `id` or a resource `value`. Saved workflows reference them
   verbatim; add a new operation instead of renaming one.
3. Operation labels are display-only. They MUST stay free of HTTP method prefixes; the method
   and path belong in the option `description`.
4. Labels MUST NOT repeat the resource noun: under **Hosts**, `Get Host` / `Create Host` are
   `Get` / `Create`. Resources whose operations name different objects keep their noun, and a
   label that would lose meaning keeps it as well.
5. Labels MUST be unique per resource within the active (non-deprecated) set. The generator
   appends ` (METHOD)` on collision, so a duplicate means the generator needs a better
   humanization rule, not a manual override.
6. Deprecated operations stay in the catalog and keep their `(deprecated)` suffix.
7. Generating MUST be deterministic for a given OpenAPI document; a regeneration must produce
   a reviewable diff and nothing else.

## Transport

8. All requests go through `CheckmkClient`. NEVER call `helpers.httpRequest*` directly from a
   resource module.
9. The transport and the credential own request headers. The generator drops `Content-Type`,
   `Accept` and `Authorization` header parameters, and Custom API rejects `Authorization`,
   `Host`, `Content-Length` and `Cookie`. NEVER add a field for them. The generator also drops
   the `site`/`sites` query parameters: the credential **Site** is the only site selector, so
   operations never expose a site field.
10. Catalog operations that declare `If-Match` expose `ifMatch_<operationId>`, defaulting to
   `*`. Concurrency control stays opt-in through a real ETag.
11. Pagination follows `rel="next"` including its HTTP method and respects the 1000-page /
    100 000-item guards. NEVER add a second paging mechanism.
12. A 204 response yields one empty item. NEVER emit `{value: ""}` or a fabricated body.
13. Errors map to `NodeApiError` through `transport/errors.ts`, preserving the HTTP status and
    Checkmk `title` / `detail` / `fields`.

## Status queries

14. Status filters sent to `/domain-types/*/collections/all` are JSON strings. An `and` node
    MUST use `expr: [...]`; numeric operands MUST be strings (`"right": "0"`).
15. Live Status uses the `POST` collections and falls back to legacy `GET` only below Checkmk
    2.4. NEVER call the deprecated `GET` endpoints on 2.4+.
16. Curated resources (`liveStatus`, `monitoring`, `customApi`) MUST keep working on 2.2; gate
    version-specific behaviour behind the shared version probe.

## Code and tests

17. Match the existing pattern in the file you touch. No second convention, no abstraction with
    a single implementation, no scaffolding for later.
18. Every new operation, label rule or request shape needs a test that fails on the plausible
    bug; assert observable request bodies and emitted items, not internal calls.
19. Tests run against `dist/`. A test that passes without `npm run build` is not trustworthy.
20. `npm run build && npm run lint && npm test` MUST be green. Lint warnings are failures.
21. Behavioural changes MUST be demonstrated against a real Checkmk site; mocked tests alone
    are not evidence.

## Docs and release

22. Update `README.md` (user-facing behaviour) and `DOCUMENTATION.md` (design, generated-field
    table, dispatch list) in the same change that alters them.
23. Commits use Conventional Commits; release-please derives `CHANGELOG.md` and the version.
    NEVER edit `CHANGELOG.md` or bump the version by hand.
24. Regenerate the catalog only against the Checkmk version the repo claims to support; record
    an unsupported `info.version` as a deliberate decision.
