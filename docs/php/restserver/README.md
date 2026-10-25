---
sidebar_key: restserver
sidebar_category: http-apis
tags: [php, http]
---

# Rest Server

A REST server whose routes can come straight from your OpenAPI specification: document the API once, and that document is the router.

[![Sponsor](https://img.shields.io/badge/Sponsor-%23ea4aaa?logo=githubsponsors&logoColor=white&labelColor=0d1117)](https://github.com/sponsors/byjg)
[![Build Status](https://github.com/byjg/php-restserver/actions/workflows/phpunit.yml/badge.svg?branch=master)](https://github.com/byjg/php-restserver/actions/workflows/phpunit.yml)
[![Opensource ByJG](https://img.shields.io/badge/opensource-byjg-success.svg)](https://opensource.byjg.com)
[![Install MCP Server](https://img.shields.io/badge/Install-MCP_Server-8A2BE2?logo=modelcontextprotocol&logoColor=white)](https://opensource.byjg.com/docs/ai/mcpserver-byjg-docs/)
[![GitHub source](https://img.shields.io/badge/Github-source-informational?logo=github)](https://github.com/byjg/php-restserver/)
[![GitHub license](https://img.shields.io/github/license/byjg/php-restserver.svg)](https://opensource.byjg.com/license/)
[![GitHub release](https://img.shields.io/github/release/byjg/php-restserver.svg)](https://github.com/byjg/php-restserver/releases/)

## Why

In most frameworks the routes and the API documentation are two separate things, written
twice and kept in sync by hand. Sooner or later they disagree, and the documentation is the
one that is wrong.

RestServer can read the routes from the OpenAPI specification itself. Each `operationId`
names the method that handles it:

```php
$restServer = new Server();
$restServer->handle(new OpenApiRouteList(__DIR__ . '/openapi.json'));
```

- **The specification is the router.** An endpoint that is not documented does not exist,
  so the documentation cannot drift from the code. Generate the specification from
  attributes with [swagger-php](https://github.com/zircote/swagger-php), or write it by hand.
- **Write objects, not responses.** A controller writes data to an `HttpResponse`; the output
  handler serializes it to JSON, XML, CSV or HTML, chosen by content negotiation.
- **Routes the usual ways too:** PHP attributes, closures, or a list built by hand.

## Documentation

Setup:
- [Set up the RestServer](setup)

Creating and customizing routes:
- [Defining Route Names](defining-route-names)
- [Create Routes using Closures](routes-using-closures)
- [Create Routes Manually](routes-manually)
- [Create Routes using PHP Attributes](routes-using-php-attributes)
- [Auto-Generate from an OpenApi definition](autogenerator-routes-openapi) (**hot**)

Processing the request and output the response:
- [HttpRequest and HttpResponse object](httprequest-httpresponse)
- [File Uploads](file-uploads)

Advanced:
- [Middleware](middleware)
    - [CORS Support](middleware-cors)
    - [Static Server Files](middleware-staticserver)
    - [JWT Authentication](middleware-jwt)
    - [Block Path](middleware-blockpath)
- [Error Handler](error-handler)
- [Dependency Injection](dependency-injection)
- [Intercepting the Request](intercepting-request)
- [Output Processors](outprocessor)
- [Caching Routes](caching-routes)

Additional topics:
- [Mock Testing](mock-testing)
- [Route Metadata](route-metadata)
- [Content Negotiation](content-negotiation)
- [Custom HTTP Status Codes](custom-status-codes)
- [CSV Endpoint Example](csv-endpoint-example)
- [PSR-7 Adapters](psr7-adapters)

## Installation

```bash
composer require "byjg/restserver"
```

## Running Tests

```bash
docker compose up -d
vendor/bin/phpunit
```

----
[Open source ByJG](https://opensource.byjg.com)
