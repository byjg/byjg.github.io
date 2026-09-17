---
sidebar_position: 1
---

# Development Guidelines

How ByJG projects are built, tested and published. Read this before adding a
new project, or before changing how an existing one is released.

## Publishing at a glance

| You want to publish | How | Guide |
|---|---|---|
| Documentation on this site | `add-doc.yaml` reusable workflow | [Publishing documentation](add-docs.md) |
| A Helm chart to `opensource.byjg.com/helm` | `add-helm.yaml` reusable workflow | [Publishing a Helm chart](helm.md) |
| DEB/RPM packages to the APT and RPM repositories | `add-pkg.yaml` reusable workflow | [Publishing Linux packages](linux-packages.md) |
| A Docker image | The project's own `build.yml` | [Docker images](docker-images.md) |
| A PHP component to Packagist | A git tag | [PHP components](php-components.md) |

The three reusable workflows live in
[byjg/byjg.github.io/.github/workflows](https://github.com/byjg/byjg.github.io/tree/master/.github/workflows)
and are referenced `@master`. Each one clones this site's repository, adds the
project's files, and pushes a commit to it.

## Shared rules

These exist for the reasons in
[Simple Principles to Avoid Overcomplicating the Complex](/blog/simple-principles-avoid-complexity):
keep the pipeline simple enough to reason about, write it once instead of
copying it into every project, and let the tests be what decides whether
something publishes.

- **Publish only after the tests pass.** Documentation and Helm jobs carry
  `if: github.ref == 'refs/heads/master'` and `needs:` the job that runs the
  tests, so broken code never reaches the site. Linux packages publish from a
  release tag instead.
- **Chain publishing jobs; never run them in parallel.** They all push to
  `byjg/byjg.github.io`, so a project that publishes a chart *and* documentation
  runs one after the other with `needs:`. The reusable workflows rebase and
  retry when another project pushes at the same moment, but chaining keeps a
  release from racing against itself.
- **Check the default branch.** Most repositories use `master`, some use
  `main`. Read it; do not assume.
- **Releases are tags.** Version tags are plain semver, `1.2.3`. The one
  exception is the GoReleaser flow for Linux packages, which uses `v1.2.3`.

## Secrets

| Secret | Used by | What it is |
|---|---|---|
| `DOC_TOKEN` | `add-doc`, `add-helm`, `add-pkg` | GitHub token with write access to `byjg/byjg.github.io`; `add-pkg` also uses it to download the project's release assets |
| `GPG_PRIVATE_KEY` | `add-pkg` | Base64-encoded private key that signs the APT and RPM metadata |
| `DOCKER_REGISTRY` | Docker builds | Registry host the images are pushed to |
| `DOCKER_REGISTRY_USER`, `DOCKER_REGISTRY_TOKEN` | Docker builds | Credentials for that registry |
| `NPM_TOKEN` | Node projects | Token that publishes packages to npm |

Secrets are set **per repository** -- `byjg` is a user account, so there are
no organization-wide secrets. They are provisioned by the maintainers from a
private infrastructure repository and are never set by hand: a manual change
drifts from that source and is overwritten on the next run. **New repository
that needs to publish? Ask a maintainer to register it.**

A reusable workflow does not see the caller's secrets unless they are passed
explicitly (`secrets: DOC_TOKEN: ...`) or with `secrets: inherit`.

## Principles

Keep it simple. See [the KISS principle](../kiss.md).
