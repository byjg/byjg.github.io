---
sidebar_position: 3
---

# Publishing a Helm chart

ByJG charts are served from the Helm repository at
`https://opensource.byjg.com/helm`, stored in `helm-charts/helm/` of this
site's repository and listed on Artifact Hub. The
[`add-helm.yaml`](https://github.com/byjg/byjg.github.io/blob/master/.github/workflows/add-helm.yaml)
reusable workflow packages a chart and adds it there.

How users install from it: [Helm Repository](/docs/helm).

## Repository layout

The chart lives in a folder of the project repository, conventionally `helm/`:

```
helm/
  easyhaproxy/            chart name
    Chart.yaml
    values.yaml
    values.schema.json    optional, validates user values
    templates/
    README.md
```

## Add the job

```yaml
  HelmDeploy:
    if: github.ref == 'refs/heads/master'
    needs: Build
    uses: byjg/byjg.github.io/.github/workflows/add-helm.yaml@master
    with:
      repo: ${{ github.event.repository.name }}
      folder: helm
      project: easyhaproxy
    secrets: inherit

  Documentation:
    if: github.ref == 'refs/heads/master'
    needs: HelmDeploy
    uses: byjg/byjg.github.io/.github/workflows/add-doc.yaml@master
    with:
      folder: devops
      project: ${{ github.event.repository.name }}
    secrets:
      DOC_TOKEN: ${{ secrets.DOC_TOKEN }}
```

| Input | Meaning |
|---|---|
| `repo` | Repository name. Always under `byjg` -- this workflow has no owner input |
| `folder` | Folder holding the chart folder, e.g. `helm` |
| `project` | The chart folder, which is also the chart name |

The only secret it needs is `DOC_TOKEN`.

**`Documentation` needs `HelmDeploy`.** Both push to this site's repository;
running them in parallel makes one of the pushes fail.

## Versioning

- **Bump `version` in `Chart.yaml` on every change to the chart.** The
  package is named `<chart>-<version>.tgz`. Publishing without a bump replaces
  an already-published version in place, and users who installed it cannot
  tell that it changed.
- **`appVersion`** is the image tag the chart deploys by default. Quote it:
  `appVersion: "6.1.1"`.
- The chart version is semver and independent of the application version: a
  template fix bumps the chart, not the app.

When the chart follows an image release, automate the bump.
`docker-easy-haproxy` has `scripts/bump-version.sh <version>`, which updates
the image references, `appVersion`, and the chart patch version together. The
tag build runs `scripts/bump-version.sh --verify <tag>` and fails if the
repository was not bumped before tagging.

## What the workflow does

1. Checks out this site's repository and the project repository.
2. Installs Helm.
3. Runs `helm package` on `<folder>/<project>` and moves the `.tgz` into
   `helm-charts/helm/`.
4. Regenerates `index.yaml` for the whole folder with
   `helm repo index --url https://opensource.byjg.com/helm`.
5. Commits `[skip ci] Add helm package '<project>'` and pushes.

## Documenting the chart

`add-helm` publishes the package, not its README. Document installation and
values in the project's `docs/`, where `add-doc` publishes it -- for example
`docs/guides/helm.md` in `docker-easy-haproxy`.

## Checklist

- [ ] Chart in `helm/<chart>/`, folder name equals the chart `name`
- [ ] `version` bumped in `Chart.yaml`
- [ ] `appVersion` quoted and pointing at a published image tag
- [ ] `HelmDeploy` runs on `master` only, after the build
- [ ] `Documentation` job `needs: HelmDeploy`
