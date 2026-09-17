---
sidebar_position: 6
---

# PHP components

Standards shared by the `php-*` repositories. When in doubt, compare with
[php-uri](https://github.com/byjg/php-uri), a small component that follows
all of them.

## Branches and versions

| Branch | Holds |
|---|---|
| `master` | The latest released line |
| `a.b` (e.g. `6.0`) | The current release line; target for fixes |
| `(a+1).0` (e.g. `7.0`) | The next major while in progress |

- **Tags are plain semver without a prefix:** `7.0.1`. CI triggers on `*.*.*`.
- **Packagist** publishes tags as versions and branches as `<branch>.x-dev` --
  pushing the `7.0` branch is what makes `7.0.x-dev` resolvable.
- **One changelog per line:** `CHANGELOG-7.0.md`. An older one
  (`CHANGELOG-6.0.md`) can stay in the repository.

## composer.json

```json
{
  "require": {
    "php": ">=8.3 <8.7"
  },
  "require-dev": {
    "phpunit/phpunit": "^12.5"
  },
  "minimum-stability": "dev",
  "prefer-stable": true,
  "scripts": {
    "test": "vendor/bin/phpunit",
    "psalm": [
      "@composer --working-dir=tools/psalm update --no-interaction",
      "tools/psalm/vendor/bin/psalm --threads=1"
    ]
  }
}
```

- **`php`** covers the versions the CI matrix tests (8.3 to 8.6 for the 7.x
  line).
- **`minimum-stability: dev` with `prefer-stable: true`** -- both, always.
  While a major is unreleased, `^7.0` only matches `7.0.x-dev`. Without
  `dev` stability Composer rejects it and silently falls back to the previous
  major.
- **`byjg/*` dependencies** point at the same major (`^7.0`). Edit version
  constraints only in `require` and `require-dev` -- `suggest` values are
  descriptions, not constraints.
- **`scripts`**: `composer test` and `composer psalm` must both exist; CI
  calls them.

## Psalm

Psalm is installed in its own Composer project under `tools/psalm`, not in
`require-dev`, so it never constrains the component's dependencies.

`tools/psalm/composer.json`:

```json
{
  "require": {
    "vimeo/psalm": "^6.16"
  }
}
```

`psalm.xml` must set `cacheDirectory="/tmp/psalm"` -- without it Psalm fails
in CI with `mkdir(): Permission denied`:

```xml
<?xml version="1.0"?>
<psalm
    errorLevel="3"
    resolveFromConfigFile="true"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns="https://getpsalm.org/schema/config"
    cacheDirectory="/tmp/psalm"
    xsi:schemaLocation="https://getpsalm.org/schema/config tools/psalm/vendor/vimeo/psalm/config.xsd"
    findUnusedBaselineEntry="true"
    findUnusedCode="false"
>
    <projectFiles>
        <directory name="src" />
        <ignoreFiles>
            <directory name="vendor" />
        </ignoreFiles>
    </projectFiles>
</psalm>
```

**Check `.gitignore` before committing.** Unanchored `vendor` and
`composer.lock` also cover `tools/psalm/`. If the patterns are anchored
(`/vendor`), add `/tools/*/vendor/` and `/tools/*/composer.lock` -- otherwise
Psalm's whole vendor tree gets committed. Only `tools/psalm/composer.json`
belongs in git.

## Tests

- PHPUnit configuration is `phpunit.xml`, not `phpunit.xml.dist`.
- Tests that need a database or broker use a `docker-compose.yml` locally and
  `services:` in CI.
- Locally: `docker compose up -d` if the project has a compose file, then
  `composer update` and `composer test`.

## CI workflow

`.github/workflows/phpunit.yml`:

```yaml
name: PHPUnit
on:
  push:
    branches:
      - master
    tags:
      - "*.*.*"
  pull_request:
    branches:
      - master

jobs:
  Build:
    runs-on: 'ubuntu-latest'
    container:
      image: 'byjg/php:${{ matrix.php-version }}-cli'
      options: --user root --privileged
    strategy:
      matrix:
        php-version:
          - "8.6"
          - "8.5"
          - "8.4"
          - "8.3"

    steps:
      - uses: actions/checkout@v5
      - run: composer install
      - run: composer test

  Psalm:
    name: Psalm Static Analyzer
    runs-on: ubuntu-latest
    permissions:
      security-events: write
    container:
      image: byjg/php:8.5-cli
      options: --user root --privileged

    steps:
      - uses: actions/checkout@v4
      - run: composer install
      - run: composer --working-dir=tools/psalm update --no-interaction
      - name: Psalm
        # Exit code 2 means flaws were found, not that Psalm failed to run.
        run: ./tools/psalm/vendor/bin/psalm
          --show-info=true
          --report=psalm-results.sarif || [ $? = 2 ]
      - name: Upload Analysis results to GitHub
        uses: github/codeql-action/upload-sarif@v4
        if: github.ref == 'refs/heads/master'
        with:
          sarif_file: psalm-results.sarif

  Documentation:
    if: github.ref == 'refs/heads/master'
    needs: Build
    uses: byjg/byjg.github.io/.github/workflows/add-doc.yaml@master
    with:
      folder: php
      project: ${{ github.event.repository.name }}
    secrets:
      DOC_TOKEN: ${{ secrets.DOC_TOKEN }}
```

- **Psalm runs once, in its own job**, on a single PHP version -- not inside
  the test matrix.
- **Pushing a branch does not run CI.** The workflow triggers on pull requests
  to `master`, so open the PR; until then the commit shows no checks at all,
  which is easy to mistake for success.

## Repository files

| File | |
|---|---|
| `README.md` | Front matter and links as in [Publishing documentation](add-docs.md) |
| `docs/` | Documentation pages |
| `LICENSE` | MIT -- see [license](/license) |
| `CONTRIBUTING.md` | Branch model and contribution rules |
| `CHANGELOG-<a.b>.md` | Changes of the release line |
| `.github/FUNDING.yml` | `github: byjg` |

No `.travis*` files; CI is GitHub Actions only.

## Releasing a new major across components

The components depend on each other, so a new major is released bottom-up:

1. **Order by dependency level.** Level 0 has no `byjg/*` dependencies; each
   level depends only on lower ones. Count `require-dev` too -- a dev
   dependency on another component still decides the order.
2. **Push a level's branches before starting the next.** The next level's
   `^7.0` resolves only once Packagist serves `7.0.x-dev`.
3. **Leave no component behind.** One component still on the previous major
   pins its whole subtree to that major's PHP range.
4. **Confirm the checks are green** against the pushed commit before moving
   on. Transient network failures (HTTP 504, TLS errors) are common -- read
   the log and re-run before assuming a real defect.
