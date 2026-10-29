---
name: release
description: Use when preparing a release or changing CI/CD for this package - covers Conventional Commits, release-please, npm trusted publishing, and the release checklist.
---

# Release and CI/CD

## Versioning

Versions are normally derived from Conventional Commits on `main`. For an explicitly requested one-off release, use the `Publish` workflow's manual dispatch; do not edit version files by hand.

| Commit | Bump |
|---|---|
| `fix: ...` | patch |
| `feat: ...` | minor |
| `feat!: ...` or `BREAKING CHANGE:` | major |

`release-please-config.json` and `.release-please-manifest.json` drive the bot. On every push to `main`, `.github/workflows/release-please.yml` opens or updates a release PR that bumps `package.json`, prepends `CHANGELOG.md`, and — once merged — creates the git tag (`vX.Y.Z`) and GitHub release. It then calls `publish.yml` in the same run: a release created with `GITHUB_TOKEN` does not trigger other workflows.

## Publishing

`.github/workflows/publish.yml` is a reusable workflow called by `release-please.yml` when a release is created. It also accepts manual dispatch with a new stable version number and listens to `release: published`. All paths publish through npm Trusted Publishing (OIDC); no npm token secret is used. The manual path updates `package.json`, `package-lock.json`, and `.release-please-manifest.json`, then publishes, pushes the tag, and creates the GitHub release.

Configure npm Trusted Publishers for GitHub Actions with owner `eduardez` and repository `n8n-checkmk-connector`. npm validates the caller workflow filename: register both `publish.yml` (manual/direct publishing) and `release-please.yml` (the reusable workflow caller). Leave the environment blank unless a matching GitHub Actions environment is configured; allow direct `npm publish`. The workflows grant `id-token: write` and use Node 22.14+ with npm 11.5.1+.

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
