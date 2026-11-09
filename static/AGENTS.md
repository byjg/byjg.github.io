# AGENTS.md — ByJG PHP components

> Source: <https://opensource.byjg.com/AGENTS.md>. To update, download it again:
> `curl -fsSL https://opensource.byjg.com/AGENTS.md -o AGENTS.md`
>
> Codex, Cursor and GitHub Copilot read `AGENTS.md` from the project root. Claude Code reads
> `CLAUDE.md`; add a line `@AGENTS.md` to it to import this file.

Instructions for any AI coding agent (Codex, Claude Code, Copilot, Cursor, Gemini, ...) working on
PHP code that involves `byjg/*` packages. Read all of it before changing code.

This file covers two kinds of work. Find out which one you are doing first:

| You are working on... | How to tell | Follow |
|---|---|---|
| **An application that uses ByJG components** | `composer.json` `name` is not `byjg/*`; `byjg/*` packages are dependencies | Sections 1–5 and **6** |
| **A ByJG component itself** (a `php-*` repository) | `composer.json` `name` is `byjg/<component>` | Sections 1–5 and **7** |

---

## 1. Working rules (non-negotiable)

These rules apply to every task. They override any default behaviour of your tool.

### Before you act
- When the human asks a **question**, verify it in the code and the docs, then answer with
  **options**. Do not start implementing until they choose one.
- If something is **hard, needs a workaround or a hack, STOP** and explain the problem. A workaround
  is a signal that the approach is wrong, not something to push through.
- If git over SSH fails (`ssh-add -l` shows no identities, `Permission denied (publickey)`), do
  **not** switch to HTTPS or `gh`. Stop and ask the human to reload the keys.

### Commits
- **Never commit or push before the human has reviewed the diff.** Show the diff and wait for an
  explicit go-ahead. No exceptions: not for trivial changes, and not when asked to "finish" something.
- Commit messages must **not** contain "Generated with ...", "Co-authored-by: <AI>" or any AI
  attribution, even if your tool adds it by default.

### Tests
- If the project has tests, run them **before** changing anything (baseline), and again after.
  A failure after your change is a regression in your change, not in the test.
- Existing tests may only be changed when **new behaviour** is added, and only after asking the human.
- **No fake tests.** No `assertTrue(true)`, no loosened assertions to make something pass, no tests
  written just to say tests exist. A test must fail if the feature breaks.

### Engineering principles
- **EASY:** if it is hard, it is probably wrong. Step back, and be willing to throw the change away
  (`git checkout -- .`) and restart cleanly.
- **KISS:** pick the simplest solution that solves the actual need. More lines is not more robust.
- **DRY:** do not duplicate code.
- **Understand the tool before fighting it.** Use the library's intended API instead of glue code
  around it.
- **Problems come in packs.** Look for the root cause across code, config, infrastructure and logs.

### PHP workflow
- **Preparing an environment:** `git fetch`, `git pull`, merge the default branch (`origin/master` or
  `origin/main`; check which one exists), `composer update`, then run Psalm and PHPUnit.
- If the project has a `docker-compose.yml`, run `docker compose up -d` before PHPUnit, and
  `docker compose down` when you are done if you started it.
- After changing PHP files: run **Psalm** and **PHPUnit** (`composer psalm`, `composer test`), and
  check that the docs (README, `docs/`) still match the code.
- **Never edit `vendor/` or `node_modules/`.** If a dependency changed its API, fix the project to match.
- Psalm does not run on PHP 8.6. If the default PHP is 8.6, run `vendor/bin/psalm.phar` with a
  PHP 8.5 (or older) binary.

---

## 2. Finding documentation

**Never guess a ByJG class, namespace or method.** Look it up, in this order:

1. **The `byjg-docs` MCP server**: search across all ByJG documentation (section 2.1).
2. **Installed docs and source**: `vendor/byjg/<package>/docs/*.md` and `vendor/byjg/<package>/src/`.
   Use these when the **exact signature of the installed version** matters. The MCP server and the
   website follow the latest published docs, which can describe a newer major than the one installed.
3. **Website**: `https://opensource.byjg.com/docs/php/<project>/`.

Always check what is installed:

```bash
composer show 'byjg/*'
```

### 2.1 The `byjg-docs` MCP server

| | |
|---|---|
| URL | `https://mcpdocs.byjg.com/mcp` (must end in `/mcp`) |
| Transport | Streamable HTTP |
| Authentication | None |
| Setup for every client | <https://opensource.byjg.com/docs/ai/mcpserver-byjg-docs/clients> |

Connect it:

```bash
# Claude Code (use --scope user so it works in every project)
claude mcp add --transport http --scope user byjg-docs https://mcpdocs.byjg.com/mcp
claude mcp list            # byjg-docs ... ✔ Connected
```

```toml
# Codex CLI: ~/.codex/config.toml
[mcp_servers.byjg-docs]
url = "https://mcpdocs.byjg.com/mcp"
```

```json
// Most other clients (Cursor, VS Code, Gemini CLI, ...); file and key names vary per client
{ "mcpServers": { "byjg-docs": { "url": "https://mcpdocs.byjg.com/mcp" } } }
```

**If the tools are not available in your session, say so to the human.** Do not answer from memory
as if you had searched. Fall back to the vendor docs and the website.

#### Tools

| Tool | Use it to |
|---|---|
| `list_projects()` | See every documented project and its slug, grouped by category (`php`, `devops`, `js`, `ai`, `helm`, ...) |
| `search_docs(query, limit, category, project)` | Get ranked passages, each with its `source` path and public URL. `limit` defaults to 8 (max 25) |
| `get_document(source_path)` | Read a full page, using the `source` from a search result (e.g. `php/micro-orm/model-attribute.md`) |

#### How to query

1. **Narrow by project** whenever you know the component. The slug is the short name, without
   `byjg/` (`micro-orm`, `restserver`, `config`, `anydataset-db`):
   `search_docs("map a table to a class", project="micro-orm")`
2. **Natural language and exact symbols both work.** Search the class or attribute name directly:
   `search_docs("TableAttribute")`, `search_docs("withInjectedConstructor", project="config")`
3. **Read the full page** with `get_document` when a passage is cut off or you need its surrounding
   context. Do not build on a fragment.
4. **Check the changelog** before using an API on a different major:
   `search_docs("changelog 7.0 breaking changes", project="restserver")`
5. **Find shared rules** in the `opensource/guidelines` project (e.g. `php-components`). They apply
   to every component repository.
6. **Cite the URL** returned by the search in your answer or PR description.
7. **Check the installed version** in `vendor/` when the docs and the code disagree. The installed
   version is what runs.

### 2.2 Agent skills

ByJG publishes agent skills at <https://github.com/byjg/skills>. If the project is a **Gluo**
application, install `gluo-developer` and follow it. It covers endpoints, models, DI, migrations,
auth, OpenAPI and tests the Gluo way.

```text
# Claude Code
/plugin marketplace add byjg/skills
/plugin install gluo-developer@byjg
```

```bash
# Codex, Cursor, Gemini CLI and other agents that read Agent Skills
npx skills add byjg/skills --skill gluo-developer
```

---

## 3. Component catalog (PHP)

Docs: `https://opensource.byjg.com/docs/php/<docs slug>/`. The MCP `project` filter uses the same slug.

### Building APIs and applications
| Package | Docs slug | What it does |
|---|---|---|
| `byjg/gluo` | `gluo` | REST API starter (`composer create-project byjg/gluo`) that wires the components together |
| `byjg/gluo-core` | `gluo-core` | Gluo's core: base classes, attributes, utilities |
| `byjg/gluo-laravel` | `gluo-laravel` | Service provider and connectors to use ByJG components in Laravel |
| `byjg/restserver` | `restserver` | REST server: routes (attributes, explicit or from OpenAPI), output processors, middleware |
| `byjg/config` | `config` | PSR-11 container: configuration per environment and dependency injection |
| `byjg/swagger-test` | `swagger-test` | PHPUnit contract tests of REST calls against an OpenAPI 2.0/3.0 spec |
| `byjg/soap-server` | `soap-server` | SOAP server |
| `byjg/scriptify` | `scriptify` | Run any PHP class as a command-line script |

### Data
| Package | Docs slug | What it does |
|---|---|---|
| `byjg/anydataset` | `anydataset` | Common data-source abstraction (iterators, filters) used by the others |
| `byjg/anydataset-db` | `anydataset-db` | Relational databases (MySQL, PostgreSQL, SQLite, SQL Server) |
| `byjg/anydataset-nosql` | `anydataset-nosql` | NoSQL document and key/value stores |
| `byjg/anydataset-json` / `-xml` / `-text` | `anydataset-json` / `-xml` / `-text` | JSON, XML and text files as datasets |
| `byjg/micro-orm` | `micro-orm` | Small ORM: models with attributes, repositories, query builder |
| `byjg/migration` | `migration` | Database versioning with plain SQL scripts (library + `vendor/bin/migrate`) |
| `byjg/cache-engine` | `cache-engine` | PSR-6 and PSR-16 caches with multiple storage drivers |
| `byjg/serializer` | `serializer` | Convert objects and arrays to/from JSON, XML, YAML, CSV, ... |

### Security and users
| Package | Docs slug | What it does |
|---|---|---|
| `byjg/authuser` | `authuser` | User authentication (repository + service layers) |
| `byjg/jwt-wrapper` | `jwt-wrapper` | JWT tokens (wraps `firebase/php-jwt`) |
| `byjg/jwt-session` | `jwt-session` | PHP sessions stored in JWT tokens (stateless) |
| `byjg/crypto` | `crypto` | Symmetric encryption with keyless exchange |

### Messaging and integration
| Package | Docs slug | What it does |
|---|---|---|
| `byjg/message-queue-client` | `message-queue-client` | Base for message queue drivers |
| `byjg/rabbitmq-client` | `rabbitmq-client` | RabbitMQ driver for `message-queue-client` |
| `byjg/redis-queue-client` | `redis-queue-client` | Redis driver for `message-queue-client` |
| `byjg/mailwrapper` | `mailwrapper` | Send email with one interface for any provider |
| `byjg/sms-client` | `sms-client` | Send SMS through multiple providers |
| `byjg/webrequest` | `webrequest` | PSR-7 implementation and HTTP client (cURL) |
| `byjg/uri` | `uri` | PSR-7 `UriInterface` and PSR-17 factory |

### Domain and utilities
| Package | Docs slug | What it does |
|---|---|---|
| `byjg/featureflag` | `featureflag` | Feature flags and dispatching code by flag |
| `byjg/statemachine` | `statemachine` | Finite state machine with conditional transitions |
| `byjg/wallets` | `wallets` | Digital wallets and transactions with audit trail |
| `byjg/resilience` | `resilience` | Resilience patterns (uses Redis/Memcached lock stores) |
| `byjg/phpthread` | `phpthread` | Threads and non-blocking code |
| `byjg/text-classifier` | `text-classifier` | Bayesian spam filter and Naive Bayes classifier |
| `byjg/llm-api-objects` | `llm-api-objects` | Typed PHP objects for LLM API payloads |
| `byjg/jinja-php` | `jinja` | Jinja2 templates in PHP |
| `byjg/xmlutil` | `xmlutil` | XML manipulation, querying and conversion |
| `byjg/imageutil` | `imageutil` | Image manipulation with GD |
| `byjg/convert` | `convert` | Text conversions (HTML entities, accents, emoji, ...) |
| `byjg/shortid` | `shortid` | Short string IDs from numbers |
| `byjg/wordnumber` | `wordnumber` | Numbers to words in several languages |
| `byjg/fonemabr` | `fonemabr` | Phonetic simplification of Portuguese words for search |
| `byjg/singleton-pattern` | `singleton-pattern` | Singleton as a trait |

**Do not add these to new code:** `byjg/resttemplate` (abandoned, replaced by `byjg/gluo`),
`byjg/anydataset-array`, `byjg/account-statements`, `byjg/php-daemonize` (abandoned; use
`byjg/scriptify`), and the legacy `byjg/xmlnuke*` packages. Run `list_projects()` for non-PHP
projects (DevOps, JavaScript, Helm, AI).

---

## 4. Versions

| Line | Status (November 2026) |
|---|---|
| **7.x** | Next major, published only as `7.0.x-dev` branches. Requires PHP `>=8.3 <8.7` |
| **6.x** | Latest stable |

To use v7, `composer.json` needs **both** settings. Without `minimum-stability: dev`, Composer
silently falls back to 6.x:

```json
{
    "require": {
        "byjg/restserver": "^7.0",
        "byjg/micro-orm": "^7.0"
    },
    "minimum-stability": "dev",
    "prefer-stable": true
}
```

- Keep **every** `byjg/*` dependency on the same major. Mixing 6.x and 7.x is not supported.
- Before using an API across majors, read the component's changelog (`docs/changelog/7-0.md`, or
  `search_docs("changelog 7.0", project=...)`).

### v6 → v7 differences agents get wrong

*Verified against `7.0.x-dev` in November 2026. Re-check against `vendor/` if your version differs.*

| Wrong (v6 or guessed) | Correct in v7 |
|---|---|
| `ByJG\RestServer\HttpRequestHandler` | `ByJG\RestServer\Server` |
| `ByJG\RestServer\MockRequestHandler` | `ByJG\RestServer\MockServer` |
| `$request->param('id')` | `$request->attributeString('id')` (route params and query string) |
| `ByJG\AnyDataset\Db\DbDriverInterface` | `ByJG\AnyDataset\Db\Interfaces\DbDriverInterface` |
| Controller calls `Config::get()` to fetch its dependencies | Constructor injection + `Server::withContainer()` (v6 always used `new $class()`) |
| `vimeo/psalm` in `require-dev` | `psalm/phar` (`vimeo/psalm` fails to install on PHP 8.6). Components **and** applications |
| `phpunit.xml.dist` | `phpunit.xml`. Components **and** applications |

---

## 5. Common pitfalls (all projects)

- **`withContainer()` is strict.** Once set, every controller must be registered in the container,
  or the request fails with `ControllerNotRegisteredException` (HTTP 501).
- **`Config` environments need `APP_ENV`.** With `config/ConfigBootstrap.php`, a missing `APP_ENV`
  makes the app return HTTP 500 with an empty body. Set it in every run command and in
  `phpunit.xml` (`<env name="APP_ENV" value="test" force="true"/>`).
- **`MockServer` throws HTTP exceptions** (`Error404Exception`, ...) instead of returning an error
  response. Test error cases with `expectException()`; check the real JSON error with `curl`.
- **Migration `reset` drops everything.** Use it only for tests. Use `up` or `update` otherwise.
- **Down migrations are named after the version they go back to:** `down/00000-*.sql` undoes
  `up/00001-*.sql`.
- **MicroOrm typed properties must be nullable with a default** (`public ?string $name = null;`).
- **Psalm reports DI and attribute classes as unused.** Use `findUnusedCode="false"`; do not
  sprinkle suppressions.
- **`psalm.xml` must not point into `vendor/vimeo/psalm`.** With `psalm/phar` that folder does not
  exist. Use the schema URL and `cacheDirectory="/tmp/psalm"` from the template in section 6.6.

---

## 6. Applications that use ByJG components

If the project is built on **Gluo**, use the `gluo-developer` skill (section 2.2) and the Gluo docs
(`search_docs(..., project="gluo")`). Follow the project's existing conventions. What follows is
for applications assembled directly from the components.

### 6.1 Dependency injection (`byjg/config`)

The usual chain for a database-backed API:

```text
DB_URI -> DbDriverInterface -> DatabaseExecutor -> XxxRepository -> XxxController
```

```php
<?php
use ByJG\AnyDataset\Db\DatabaseExecutor;
use ByJG\AnyDataset\Db\Factory;
use ByJG\AnyDataset\Db\Interfaces\DbDriverInterface;
use ByJG\Config\DependencyInjection as DI;
use ByJG\Config\Param;

return [
    'DB_URI' => 'sqlite://' . __DIR__ . '/../var/app.db',

    DbDriverInterface::class => DI::bind(Factory::class)
        ->withFactoryMethod('getDbInstance', [Param::get('DB_URI')])
        ->toSingleton(),

    DatabaseExecutor::class => DI::bind(DatabaseExecutor::class)
        ->withInjectedConstructor()
        ->toSingleton(),

    ProductRepository::class => DI::bind(ProductRepository::class)
        ->withInjectedConstructor()
        ->toSingleton(),

    ProductController::class => DI::bind(ProductController::class)
        ->withInjectedConstructor()
        ->toInstance(),
];
```

There are two ways to build the container:

| Option | When |
|---|---|
| `new ByJG\Config\Container([...])` in a `bootstrap.php` | One environment, small app. Read the DB URI from an env var such as `DATABASE_URL` |
| `config/ConfigBootstrap.php` + `config/config-<env>.php`, used through `Config::getContainer()` | Separate dev/test/prod settings. Requires `APP_ENV` (section 5) |

### 6.2 Models and repositories (`byjg/micro-orm`)

```php
<?php
use ByJG\AnyDataset\Db\DatabaseExecutor;
use ByJG\MicroOrm\Attributes\FieldAttribute;
use ByJG\MicroOrm\Attributes\TableAttribute;
use ByJG\MicroOrm\Repository;

#[TableAttribute(tableName: 'products')]
class Product
{
    #[FieldAttribute(primaryKey: true)]
    public ?int $id = null;

    #[FieldAttribute(fieldName: 'product_name')]   // only when the column name differs
    public ?string $name = null;
}

class ProductRepository extends Repository
{
    public function __construct(DatabaseExecutor $executor)
    {
        parent::__construct($executor, Product::class);
    }
}
```

- **One repository class per entity.** Do not register the generic `Repository::class` in the
  container: the key can hold only one entity, so a second model forces a refactor.
- Protected or private properties need a public getter and setter.
- `$repository->get($id)` returns `null` when the row does not exist.
- For a deterministic list, order explicitly:
  `$repository->getByQuery($repository->queryInstance()->orderBy(['id']))`.

### 6.3 REST endpoints (`byjg/restserver`)

```php
<?php
use ByJG\RestServer\Attributes\RouteDefinition;
use ByJG\RestServer\Exception\Error404Exception;
use ByJG\RestServer\HttpRequest;
use ByJG\RestServer\HttpResponse;

class ProductController
{
    public function __construct(protected ProductRepository $repository)
    {
    }

    #[RouteDefinition('GET', '/products/{id:\d+}')]
    public function get(HttpResponse $response, HttpRequest $request): void
    {
        $product = $this->repository->get((int)$request->attributeString('id'));
        if ($product === null) {
            throw new Error404Exception('Product not found');
        }
        $response->write($product);
    }
}
```

```php
<?php
// public/index.php
use ByJG\Config\Config;
use ByJG\RestServer\Route\RouteList;
use ByJG\RestServer\Server;

$routes = (new RouteList())->addClass(ProductController::class);

(new Server())
    ->withContainer(Config::getContainer())
    ->handle($routes);
```

- Declare routes with `#[RouteDefinition]` (`RouteList::addClass()`), explicitly
  (`Route::get('/path')->withClass(Controller::class, 'method')`) or from an OpenAPI spec
  (`OpenApiRouteList`). Follow whichever the project already uses.
- Constrain route parameters in the path (`{id:\d+}`), so invalid input gets a 404 before it
  reaches the controller.
- Signal HTTP errors by throwing `Error4xxException` / `Error5xxException`.

### 6.4 Migrations (`byjg/migration`)

```text
db/
  base.sql                                  # baseline schema (version 0)
  migrations/up/00001-create-products.sql
  migrations/down/00000-create-products.sql
```

- Start each script with `-- @description: ...`.
- **Schema only.** Keep demo or seed data out of migrations; use a separate seed script.

```bash
vendor/bin/migrate up    -c "sqlite://$PWD/var/app.db" -p ./db           # normal use, re-runnable
vendor/bin/migrate reset -c "sqlite://$PWD/var/test.db" -p ./db --yes    # tests only
```

```php
<?php
use ByJG\DbMigration\Database\SqliteDatabase;
use ByJG\DbMigration\Migration;
use ByJG\Util\Uri;

Migration::registerDatabase(SqliteDatabase::class);   // MySqlDatabase, PgsqlDatabase, DblibDatabase
$migration = new Migration(new Uri($dbUri), __DIR__ . '/../db');
$migration->createVersion();   // safe to repeat
$migration->update();
```

### 6.5 Testing

Test endpoints through the real router and container with `MockServer`, against a **separate test
database** that is reset once per test class. If the API has an OpenAPI spec, add contract tests
with `byjg/swagger-test`.

```php
<?php
use ByJG\Config\Config;
use ByJG\DbMigration\Database\SqliteDatabase;
use ByJG\DbMigration\Migration;
use ByJG\RestServer\Exception\Error404Exception;
use ByJG\RestServer\MockServer;
use ByJG\RestServer\Route\RouteList;
use ByJG\Util\Uri;
use ByJG\WebRequest\Psr7\Request;
use PHPUnit\Framework\TestCase;

class ProductControllerTest extends TestCase
{
    public static function setUpBeforeClass(): void
    {
        Migration::registerDatabase(SqliteDatabase::class);
        (new Migration(new Uri(Config::get('DB_URI')), __DIR__ . '/../db'))->reset();
    }

    protected function request(string $path): array
    {
        $server = (new MockServer())
            ->withContainer(Config::getContainer())
            ->withRequestObject(new Request(new Uri("http://localhost$path")));
        $server->handle((new RouteList())->addClass(ProductController::class));

        $response = $server->getPsr7Response();
        return [$response->getStatusCode(), json_decode($response->getBody()->getContents(), true)];
    }

    public function testGetProduct(): void
    {
        [$status, $body] = $this->request('/products/1');
        $this->assertEquals(200, $status);
        $this->assertEquals('Keyboard', $body['name']);
    }

    public function testGetProductNotFound(): void
    {
        $this->expectException(Error404Exception::class);
        $this->request('/products/99');
    }
}
```

### 6.6 Application housekeeping
- **Commit `composer.lock`** in applications; it pins the dev revisions that were tested.
- `.gitignore`: `vendor/` and local database files.
- Use the same tooling as the components: `psalm/phar` (not `vimeo/psalm`) and `phpunit.xml`
  (not `phpunit.xml.dist`).
- Expose `composer` scripts for the routine commands. `test` and `psalm` always; `migrate` and
  `start` when useful.

```json
{
    "require-dev": {
        "phpunit/phpunit": "^12.5",
        "psalm/phar": "^6.16"
    },
    "scripts": {
        "test": "vendor/bin/phpunit",
        "psalm": "vendor/bin/psalm.phar"
    }
}
```

`psalm.xml`:

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

`phpunit.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="vendor/phpunit/phpunit/phpunit.xsd"
         bootstrap="vendor/autoload.php"
         colors="true">
    <php>
        <env name="APP_ENV" value="test" force="true"/>
    </php>
    <testsuites>
        <testsuite name="default">
            <directory>tests</directory>
        </testsuite>
    </testsuites>
</phpunit>
```

---

## 7. Working on a ByJG component (`php-*` repositories)

Full rules: <https://opensource.byjg.com/docs/opensource/guidelines/php-components>
(`get_document("opensource/guidelines/php-components.md")`). When in doubt, compare with
[php-uri](https://github.com/byjg/php-uri), which follows all of them.

### Branches and releases
| Branch | Holds |
|---|---|
| `master` | Latest released line |
| `a.b` (e.g. `6.0`) | Current release line; target for fixes |
| `(a+1).0` (e.g. `7.0`) | Next major while in progress (Packagist serves it as `7.0.x-dev`) |

- Tags are plain semver, no prefix: `7.0.1`.
- One changelog per line: `CHANGELOG-7.0.md`.
- **A new major is released bottom-up by dependency level** (count `require-dev` too). Push a
  level's branches and confirm CI is green before starting the next level, and leave no component
  behind.
- **Pushing a branch does not run CI**; it runs on pull requests to `master`. No checks on a commit
  does not mean success.

### Required files and settings
- `composer.json`: `"php": ">=8.3 <8.7"`, `phpunit/phpunit: ^12.5`, `psalm/phar: ^6.16`,
  `minimum-stability: dev` + `prefer-stable: true`, all `byjg/*` on the same major, and scripts
  `"test": "vendor/bin/phpunit"` and `"psalm": "vendor/bin/psalm.phar"` (CI calls both).
- `psalm.xml`: `errorLevel="3"`, `cacheDirectory="/tmp/psalm"` (CI fails without it),
  `findUnusedCode="false"`.
- `phpunit.xml` (not `phpunit.xml.dist`).
- `.gitignore`: `vendor` and **`composer.lock`**. Components do not commit the lock file.
- `README.md`, `docs/`, `LICENSE` (MIT), `CHANGELOG-<a.b>.md`.
- **Not** in the repository: `CONTRIBUTING.md`, `SECURITY.md`, `.github/FUNDING.yml` (they come from
  `byjg/.github`), `.travis*`.
- CI: `.github/workflows/phpunit.yml`. Tests run on a PHP 8.3–8.6 matrix (`byjg/php:<v>-cli`);
  Psalm runs once in its own job on 8.5.

### Changing a component
- Run `composer test` and `composer psalm` (with `docker compose up -d` first if there is a
  `docker-compose.yml`).
- Update `docs/` and the changelog in the same change. The docs are published to
  opensource.byjg.com and indexed by the MCP server, so they are what other agents will read.
- A breaking change belongs in the next major branch, with a migration note in the changelog.

---

## 8. Definition of done

- [ ] `composer show 'byjg/*'` checked; every class and method verified (MCP, `vendor/`, or website)
- [ ] `composer test` passes, with the same or more tests than the baseline
- [ ] `composer psalm` reports no errors
- [ ] Applications: endpoints smoke-tested for real (`php -S` + `curl`), including an error case
- [ ] Components: docs and changelog updated
- [ ] README matches the code (run commands, required env vars such as `APP_ENV`)
- [ ] `docker compose down` if you started it
- [ ] Diff shown to the human; **nothing committed or pushed**
