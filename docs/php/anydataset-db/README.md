---
sidebar_key: anydataset-db
tags: [php, anydataset, databases]
---

# Database Abstraction Layer

**AnyDataset-DB** provides a relational database abstraction layer. It is part of the Anydataset project, an agnostic
data source abstraction layer for PHP.

[![Sponsor](https://img.shields.io/badge/Sponsor-%23ea4aaa?logo=githubsponsors&logoColor=white&labelColor=0d1117)](https://github.com/sponsors/byjg)
[![Build Status](https://github.com/byjg/php-anydataset-db/actions/workflows/phpunit.yml/badge.svg?branch=master)](https://github.com/byjg/php-anydataset-db/actions/workflows/phpunit.yml)
[![Opensource ByJG](https://img.shields.io/badge/opensource-byjg-success.svg)](https://opensource.byjg.com)
[![Install MCP Server](https://img.shields.io/badge/Install-MCP_Server-8A2BE2?logo=modelcontextprotocol&logoColor=white)](https://opensource.byjg.com/docs/ai/mcpserver-byjg-docs/)
[![GitHub source](https://img.shields.io/badge/Github-source-informational?logo=github)](https://github.com/byjg/php-anydataset-db/)
[![GitHub license](https://img.shields.io/github/license/byjg/php-anydataset-db.svg)](https://opensource.byjg.com/license/)
[![GitHub release](https://img.shields.io/github/release/byjg/php-anydataset-db.svg)](https://github.com/byjg/php-anydataset-db/releases/)

Learn more about Anydataset [here](https://opensource.byjg.com/anydataset).

## Features

- Connection based on URI
- Handles compatibility and code optimization across multiple databases (e.g., MySQL, PostgreSQL, MS SQL Server)
- Built-in Query Cache support using a PSR-16 compliant interface
- Enables connection routing based on regular expressions for queries (e.g., directing queries to different databases
  for specific tables)

## Connection Based on URI

Database connections are defined using URL-based connection strings.

Supported drivers are listed below:

| Database            | Connection String                                 | Factory Method    |
|---------------------|---------------------------------------------------|-------------------|
| SQLite              | sqlite:///path/to/file                            | `getDbInstance()` |
| MySQL/MariaDB       | mysql://username:password@hostname:port/database  | `getDbInstance()` |
| PostgreSQL          | pgsql://username:password@hostname:port/database  | `getDbInstance()` |
| SQL Server (DbLib)  | dblib://username:password@hostname:port/database  | `getDbInstance()` |
| SQL Server (Sqlsrv) | sqlsrv://username:password@hostname:port/database | `getDbInstance()` |
| Oracle (OCI8)       | oci8://username:password@hostname:port/database   | `getDbInstance()` |
| Oracle (PDO OCI)    | oci://username:password@hostname:port/database    | `getDbInstance()` |
| Generic PDO         | pdo://username:password@pdo_driver?PDO_PARAMETERS | `getDbInstance()` |
| Cloudflare D1       | d1://account_id:api_token@api.cloudflare.com/database_id | `getDbInstance()` |

Example usage:

```php
<?php
$conn = \ByJG\AnyDataset\Db\Factory::getDbInstance("mysql://root:password@10.0.1.10/myschema");
```

## Examples

- [Getting Started](getting-started)
- [Basic Query and Update](basic-query)
- [Sql Statement Object](sqlstatement)
- [Cache results](cache)
- [Database Transaction](transaction)
- [Load Balance and Connection Pooling](load-balance)
- [Database Helper](helper)
- [Filtering the Query](iteratorfilter)
- [Entity Mapping](entity)

## Advanced Topics

- [Database Driver Interface](db-driver-interface)
- [DatabaseExecutor - Recommended API](database-executor)
- [Executor Observers](observers)
- [Journal (Record and Restore Changes)](journal)
- [Passing Parameters to PDODriver](parameters)
- [Generic PDO Driver](generic-pdo-driver)
- [Running Tests](tests)
- [Installing the PHP database extensions](installing-extensions)
- [Getting an Iterator from an existing PDO Statement](pdostatement)
- [Pre Fetch records](prefetch)
- [Logging](logging)
- [Deprecated Features](deprecated-features)

## Database Specifics

- [MySQL](mysql)
- [PostgreSQL](postgresql)
- [Oracle](oracle)
- [SQLServer](sqlserver)
- [Cloudflare D1](cloudflare-d1)
- [Literal PDO Connection String](literal-pdo-driver)


## Installation

Just type:

```bash
composer require "byjg/anydataset-db"
```

## Running Tests

```bash
docker compose up -d
vendor/bin/phpunit
```

More details, including the database suites, are in [Running Unit tests](tests).

----
[Open source ByJG](https://opensource.byjg.com)
