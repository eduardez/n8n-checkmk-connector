# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.7.0](https://github.com/eduardez/n8n-checkmk-connector/compare/v0.6.0...v0.7.0) (2026-10-20)


### Features

* derive site from credential, add host status and attribute selection ([21eddfb](https://github.com/eduardez/n8n-checkmk-connector/commit/21eddfb9bd40d77b12bc8df3dad734d7134cb889))

## [0.6.0](https://github.com/eduardez/n8n-checkmk-connector/compare/v0.5.0...v0.6.0) (2026-10-20)


### Features

* drop resource noun from operation labels ([5800932](https://github.com/eduardez/n8n-checkmk-connector/commit/5800932d13c3bc22f0242285bcc5e2355ba6664c))

## [0.5.0](https://github.com/eduardez/n8n-checkmk-connector/compare/v0.4.1...v0.5.0) (2026-10-20)


### Features

* humanize operation labels and add Monitoring resource ([7c4758f](https://github.com/eduardez/n8n-checkmk-connector/commit/7c4758f0129b183b54cfaa9c016708cb51e5dfbf))

## [0.4.1](https://github.com/eduardez/n8n-checkmk-connector/compare/v0.4.0...v0.4.1) (2026-10-20)


### Bug Fixes

* return all hosts by default in Get Hosts with Status ([109ea4c](https://github.com/eduardez/n8n-checkmk-connector/commit/109ea4cc25aaba6aa4cfeef5d89c0d6fa1ea2760))

## [0.4.0](https://github.com/eduardez/n8n-checkmk-connector/compare/v0.3.1...v0.4.0) (2026-10-20)


### Features

* select live status columns from a multi-select ([3d3cb32](https://github.com/eduardez/n8n-checkmk-connector/commit/3d3cb32e07c372072f29fcb4b533a2f4bb13bae8))

## [0.3.1](https://github.com/eduardez/n8n-checkmk-connector/compare/v0.3.0...v0.3.1) (2026-10-20)


### Bug Fixes

* only send parameters the connected Checkmk version supports ([fc14e0c](https://github.com/eduardez/n8n-checkmk-connector/commit/fc14e0c4263997330bbd0c31e5ffe84f301bb4ef))

## [0.3.0](https://github.com/eduardez/n8n-checkmk-connector/compare/v0.2.0...v0.3.0) (2026-10-20)


### Features

* publish the package as n8n-nodes-checkmk-connector ([767c915](https://github.com/eduardez/n8n-checkmk-connector/commit/767c9154ac43b861e568f797e6cdc9f6316349b6))

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
