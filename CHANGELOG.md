# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1](https://github.com/eduardez/n8n-checkmk-connector/compare/v0.2.0...v0.2.1) (2026-10-19)


### Documentation

* describe the chained release and publish flow ([1affd7b](https://github.com/eduardez/n8n-checkmk-connector/commit/1affd7be1d31f4b551cde5ec647734824d95a451))

## [0.2.0](https://github.com/eduardez/n8n-checkmk-connector/compare/n8n-checkmk-connector-v0.1.1...n8n-checkmk-connector-v0.2.0) (2026-10-19)


### Features

* add clean-room Checkmk connector ([ef2a54b](https://github.com/eduardez/n8n-checkmk-connector/commit/ef2a54b63aa6976ed487d2b1d4e0a4306622d85a))
* add version compatibility warnings and automated releases ([bb963a6](https://github.com/eduardez/n8n-checkmk-connector/commit/bb963a6705f913e71210a0647e8b8c19d576cc7e))

## [0.1.1] - 2026-10-19

### Fixed

- Published 0.1.1 because the registry staged the initial 0.1.0 upload; no code changes.

## [0.1.0] - 2026-10-19

### Added

- Checkmk Connector action node with Bearer authentication and a `/version` credential test.
- Catalog generated from the Checkmk 2.4.0p37 OpenAPI document: 189 operations across 40
  resources, including path/query/header parameters, JSON bodies, ETag-protected requests and
  paginated collections.
- Return All / Limit handling that follows `rel="next"` pagination links with page and item
  guards.
- Live Status resource: host with status, all hosts with status, services and non-OK problems
  built on the supported `POST` status collections.
- Custom API resource for arbitrary endpoints, with protected authentication headers and
  relative-path enforcement.
- Checkmk problem details mapped to n8n node API errors with HTTP status, title, detail and
  field problems.
- Unit tests for catalog invariants, transport, error mapping, pagination and live status.
- Opt-in integration suite covering ETag conflicts, change activation and cleanup.
- Documentation, generated operation reference and example workflows.
