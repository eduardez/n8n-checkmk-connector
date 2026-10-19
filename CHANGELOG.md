# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
