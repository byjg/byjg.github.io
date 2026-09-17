# Contributing to PHP components

What is specific to the `byjg/php-*` components. The rules that apply to every
repository -- how to report an issue, what a pull request needs, and the
documentation rule -- are on [Contributing](contrib.md).

## Branches and release series

A PHP component keeps one branch per release series:

| Branch | What it is |
|---|---|
| `master` | The current series, and what releases are tagged from. **Pull requests go here** |
| `6.0`, `5.0`, `4.9` | Older series, kept for maintenance. They stay where that series ended |
| The next major (`7.0` today) | Where maintainers prepare that release |

`php-config` 6.1.0, for instance, is tagged on `master`, while the `6.0` branch
stopped at the end of that series.

If your fix belongs in an older series as well, say so in the pull request and a
maintainer backports it. If the next major is open, a maintainer may forward
your change there too -- you do not have to open the same pull request twice.

To develop against an unreleased series, composer accepts a branch alias:

```json
{ "require": { "byjg/<component>": "7.0.x-dev" } }
```

## Running the tests

```bash
composer update
docker compose up -d      # only when the repository has a docker-compose.yml
composer test             # or vendor/bin/phpunit
composer psalm            # static analysis
```

Almost every component defines the `test` and `psalm` scripts (44 of 47); where
one is missing, call `vendor/bin/phpunit` directly.

The services in `docker-compose.yml` are what the tests connect to -- a database,
a queue, an S3-compatible server. A test that cannot reach its service marks
itself incomplete rather than failing, so **check the summary line**:
`Incomplete` means those tests did not run, and a suite that skips itself
quietly is worse than one that fails loudly. It is the
[tests, tests, tests](/blog/simple-principles-avoid-complexity) habit that makes
a component safe to refactor -- a green run that tested nothing gives you
nothing.

## PHP versions

CI runs the suite on **PHP 8.3, 8.4, 8.5 and 8.6**. Code has to work on the
lowest of them, so avoid syntax introduced later, and check the `require.php`
constraint in `composer.json` before using a newer feature.

Psalm runs in CI on **PHP 8.5** only (the `byjg/php:8.5-cli` image, with Psalm
installed from `tools/psalm`), because Psalm does not always support the newest
PHP release on the day it ships. Locally, run it on 8.5 too if the newest
version refuses to install it.

## Code style

[PSR-1](https://www.php-fig.org/psr/psr-1/),
[PSR-2](https://www.php-fig.org/psr/psr-2/) and
[PSR-12](https://www.php-fig.org/psr/psr-12/).

## Releasing

Releases are made by maintainers: a tag on `master` publishes the component to
Packagist and its documentation to this site. The mechanics are in
[PHP components](guidelines/php-components.md).
