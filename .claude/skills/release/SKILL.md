---
name: release
description: Use when preparing a release or changing CI/CD for this package - covers Conventional Commits, release-please, npm publishing, required secrets, and the release checklist.
---

# Release and CI/CD

## Versioning

Versions are derived from Conventional Commits on `main`; do not bump `package.json` by hand.

| Commit | Bump |
|---|---|
| `fix: ...` | patch |
| `feat: ...` | minor |
| `feat!: ...` or `BREAKING CHANGE:` | major |

`release-please-config.json` and `.release-please-manifest.json` drive the bot. On every push to `main`, `.github/workflows/release-please.yml` opens or updates a release PR that bumps `package.json`, prepends `CHANGELOG.md`, and — once merged — creates the git tag (`vX.Y.Z`) and GitHub release. It then calls `publish.yml` in the same run: a release created with `GITHUB_TOKEN` does not trigger other workflows.

## Publishing

`.github/workflows/publish.yml` is a reusable workflow called by `release-please.yml` when a release is created. It also accepts manual dispatch with a tag, and listens to `release: published` for releases created by a token with workflow-trigger rights. It publishes to npm with provenance, skipping versions that already exist.

Required repository secret:

- `NPM_TOKEN` — npm automation token allowed to publish `n8n-nodes-checkmk-connector`.

CI: `.github/workflows/ci.yml` runs build, lint, tests, and `npm pack --dry-run` on Node 20 and 22. Dependencies install with `--ignore-scripts` because `isolated-vm` has no prebuilt binary for every Node release.

Manual integration: `.github/workflows/integration.yml` uses repository secrets `CHECKMK_BASE_URL`, `CHECKMK_SITE`, `CHECKMK_USERNAME`, `CHECKMK_PASSWORD` and must target a disposable site.

## Before merging a release PR

1. `PATH=/usr/bin:$PATH npm run build && npm run lint && npm test`
2. Integration suite against a matching Checkmk version when the catalog or transport changed.
3. Confirm the PR's version and changelog entries match the commits.
4. Merge; verify the release job published `dist`-only tarball content and `npm view n8n-nodes-checkmk-connector dist-tags`.

## Local dry run

```sh
npm pack --dry-run --json
```

Every path must be under `dist/`, plus package metadata. Never publish from a working tree that fails lint or tests; `prepublishOnly` runs both.
