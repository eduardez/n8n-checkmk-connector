---
name: release
description: Covers Conventional Commits, protected-main publishing, npm Trusted Publishing, and recovery for this package.
---

# Release and CI/CD

## Versioning

Every change merged to `main` through a pull request triggers `.github/workflows/publish.yml`.
Conventional Commits select the version bump; every other commit type falls back to a patch:

| Commit | Bump |
|---|---|
| `fix: ...` | patch |
| `feat: ...` | minor |
| `feat!: ...` or `BREAKING CHANGE:` | major |
| Other types, including `docs:` and `chore:` | patch |

The workflow does not create a release PR or commit version changes to `main`. The source
`package.json` may retain its development version; the release runner writes the calculated
version into the npm artifact. The `vX.Y.Z` tag and GitHub release identify the same source
commit and version. `CHANGELOG.md` is historical and is not updated by the release workflow.

## Publishing

On a `main` push, `publish.yml` runs semantic-release with the checked-in `.releaserc.json`.
It tests and publishes the calculated npm version, then creates the matching tag and GitHub
release. Stable externally published `vX.Y.Z` releases are also handled by this workflow.

For recovery after semantic-release has created a tag but npm publishing failed, dispatch
**Actions → Publish → Run workflow** from `main` with the exact `X.Y.Z` from that existing tag.
The workflow builds the tagged commit, requires it to be an ancestor of `main`, and skips an
existing npm version only when its registry `gitHead` matches that commit. A manual version
without an existing tag must exceed both the highest stable git tag and npm `latest`. Manual
publishing changes `package.json` only in the runner and never pushes to `main`.

Configure the npm **Trusted Publisher** for owner `eduardez`, repository
`n8n-nodes-checkmk-connector`, and workflow filename `publish.yml` only. Leave the environment blank
and allow direct `npm publish`. The workflow uses Node 22 and npm 11.19.0 with OIDC; no npm
token is used.

## CI and integration

`.github/workflows/ci.yml` runs build, lint, tests, and `npm pack --dry-run` on Node 20 and 22.
Dependencies install with `--ignore-scripts` because `isolated-vm` has no prebuilt binary for
every Node release.

To run integration tests, manually dispatch CI with `run_integration` enabled and configure
`CHECKMK_BASE_URL`, `CHECKMK_SITE`, `CHECKMK_USERNAME`, and `CHECKMK_PASSWORD` for a disposable
site.

## Before merging changes

1. Run `npm ci --ignore-scripts`, `npm run build`, `npm run lint`, and `npm test`.
2. Run integration tests against a matching Checkmk version when the catalog or transport changes.
3. Submit changes with a Conventional Commit PR and merge after required checks pass.
4. Verify the post-merge publish run and the published npm version/source SHA.

## Local dry run

```sh
npm pack --dry-run --json
```

Every path must be under `dist/`, plus package metadata. Never publish from a working tree that
fails lint or tests; `prepublishOnly` runs both.
