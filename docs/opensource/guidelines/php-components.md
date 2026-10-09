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
    "phpunit/phpunit": "^12.5",
    "psalm/phar": "^6.16"
  },
  "minimum-stability": "dev",
  "prefer-stable": true,
  "scripts": {
    "test": "vendor/bin/phpunit",
    "psalm": "vendor/bin/psalm.phar"
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

Psalm is installed as `psalm/phar` in `require-dev`, not as `vimeo/psalm`:

```json
{
  "require-dev": {
    "psalm/phar": "^6.16"
  }
}
```

- `vimeo/psalm` lists the PHP versions it supports and no published release
  includes 8.6, so as a dev dependency it made `composer install` fail on the
  8.6 build job before any test ran.
- `psalm/phar` requires only `php ^8.2` and bundles its own dependencies. It
  installs on every PHP version of the matrix and never constrains the
  component's dependencies.
- Psalm itself still does not *run* on 8.6, which is why the Psalm job uses
  8.5.
- `composer psalm` runs `vendor/bin/psalm.phar`. There is no `tools/psalm`
  folder.

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
    xsi:schemaLocation="https://getpsalm.org/schema/config https://raw.githubusercontent.com/vimeo/psalm/6.x/config.xsd"
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

`.gitignore` covers `vendor` and `composer.lock`; neither is committed.

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
      - uses: actions/checkout@v7
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
      - uses: actions/checkout@v7
      - run: composer install
      - name: Psalm
        # Exit code 2 means flaws were found, not that Psalm failed to run.
        run: ./vendor/bin/psalm.phar
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
| `LICENSE` | MIT -- see [license](/license), which also lists the exceptions |
| `CHANGELOG-<a.b>.md` | Changes of the release line |

No `CONTRIBUTING.md`, `SECURITY.md` or `.github/FUNDING.yml` in the repository:
they come from the account-wide defaults in
[byjg/.github](https://github.com/byjg/.github), so there is one copy to
maintain.

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
