---
sidebar_position: 5
---

# Docker images

Docker images are built and pushed by the project's own
`.github/workflows/build.yml`. The reference implementation is
[docker-easy-haproxy](https://github.com/byjg/docker-easy-haproxy/blob/master/.github/workflows/build.yml).

## Conventions

| | |
|---|---|
| Image name | `byjg/<name>` -- the repository name without the `docker-` prefix (`docker-easy-haproxy` → `byjg/easy-haproxy`) |
| Platforms | `linux/amd64` and `linux/arm64`, built with QEMU and Buildx |
| Registry | `DOCKER_REGISTRY`, logged in with `DOCKER_REGISTRY_USER` / `DOCKER_REGISTRY_TOKEN` |
| Documentation | `add-doc` with `folder: devops` |

## Tags

| Event | Built | Pushed as |
|---|---|---|
| Push to `master` | yes | `latest` |
| Push of tag `1.2.3` | yes | `1.2.3` |
| Pull request to `master` | yes | not pushed |
| Manual run with `push: true` | yes | `latest` from `master`, otherwise the branch name |

A release is a semver tag without prefix: `git tag 1.2.3 && git push --tags`.

## Workflow

```yaml
name: Docker

on:
  push:
    branches: [ master ]
    tags: [ '*.*.*' ]
  pull_request:
    branches: [ master ]
  workflow_dispatch:
    inputs:
      push:
        description: 'Push image to registry'
        required: false
        default: 'false'
        type: choice
        options:
          - 'false'
          - 'true'

env:
  IMAGE_NAME: byjg/my-image

jobs:
  Test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      # ... run the project's tests

  Build:
    runs-on: ubuntu-latest
    needs: [Test]
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v7

      - uses: docker/setup-qemu-action@v4

      - uses: docker/setup-buildx-action@v4

      - name: Log into registry
        if: github.event_name == 'push' || github.event.inputs.push == 'true'
        uses: docker/login-action@v4
        with:
          registry: ${{ secrets.DOCKER_REGISTRY }}
          username: ${{ secrets.DOCKER_REGISTRY_USER }}
          password: ${{ secrets.DOCKER_REGISTRY_TOKEN }}

      - name: Extract Docker metadata
        id: meta
        uses: docker/metadata-action@v6
        with:
          images: ${{ secrets.DOCKER_REGISTRY }}/${{ env.IMAGE_NAME }}

      # master -> latest; a tag -> the tag itself
      - uses: actions/github-script@v9
        id: normalized
        with:
          script: |
            tags = `${{ join(steps.meta.outputs.tags, ',') }}`
            result = []
            tags.split("\n").forEach(function (item) {
              short_tag = item.trim().split(":")[1];
              if (short_tag == "master" || short_tag == "main") {
                result.push("${{ env.IMAGE_NAME }}:latest");
              } else if (short_tag != "latest") {
                result.push("${{ env.IMAGE_NAME }}:" + short_tag);
              }
            })
            return result.join(",");
          result-encoding: string

      - name: Build and push Docker image
        uses: docker/build-push-action@v7
        with:
          context: .
          file: Dockerfile
          platforms: linux/amd64,linux/arm64
          push: ${{ github.event_name == 'push' || github.event.inputs.push == 'true' }}
          tags: ${{ steps.normalized.outputs.result }}
          labels: ${{ steps.meta.outputs.labels }}

  Documentation:
    if: github.ref == 'refs/heads/master'
    needs: Build
    uses: byjg/byjg.github.io/.github/workflows/add-doc.yaml@master
    with:
      folder: devops
      project: ${{ github.event.repository.name }}
    secrets:
      DOC_TOKEN: ${{ secrets.DOC_TOKEN }}
```

- **`Build` needs the tests.** An image is never pushed from a failing commit.
- **Pull requests build but never push**, so a broken Dockerfile is caught
  before merge without publishing anything.
- If the image has a Helm chart, add `HelmDeploy` between `Build` and
  `Documentation` -- see [Publishing a Helm chart](helm.md).

## Checklist

- [ ] `IMAGE_NAME` is `byjg/<name>`
- [ ] Both `linux/amd64` and `linux/arm64` build
- [ ] `Build` needs the test job; pushes only on `push` events or a manual `push: true`
- [ ] `master` publishes `latest`, tags publish the version
- [ ] `Documentation` job with `folder: devops`
