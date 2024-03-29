# PHP Rest Server

[![Build Status](https://github.com/byjg/php-restserver/actions/workflows/phpunit.yml/badge.svg?branch=master)](https://github.com/byjg/php-restserver/actions/workflows/phpunit.yml)
[![Opensource ByJG](https://img.shields.io/badge/opensource-byjg-success.svg)](http://opensource.byjg.com)
[![GitHub source](https://img.shields.io/badge/Github-source-informational?logo=github)](https://github.com/byjg/php-restserver/)
[![GitHub license](https://img.shields.io/github/license/byjg/php-restserver.svg)](https://opensource.byjg.com/opensource/licensing.html)
[![GitHub release](https://img.shields.io/github/release/byjg/php-restserver.svg)](https://github.com/byjg/php-restserver/releases/)

Create RESTFull services with different and customizable output handlers (JSON, XML, Html, etc.).
Auto-Generate routes from swagger.json definition.

## Documentation

Setup:
- [Set up the RestServer](setup.md)

Creating and customizing routes:
- [Defining Route Names](defining-route-names.md)
- [Create Routes using Closures](routes-using-closures.md)
- [Create Routes using Classes](routes-using-classes.md)
- [Auto-Generate from an OpenApi definition](autogenerator-routes-openapi.md) (**hot**)

Processing the request and output the response:
- [HttpRequest and HttpResponse object](httprequest-httpresponse.md)

Advanced:
- [Middleware](middleware.md)
- [Error Handler](error-handler.md)
- [Caching Routes](caching-routes.md)

## Installation

```bash
composer require "byjg/restserver"
```

## Dependencies

```mermaid
flowchart TD
   byjg/restserver --> byjg/serializer
   byjg/restserver --> byjg/singleton-pattern
   byjg/restserver --> nikikc/fast-route
   byjg/restserver --> filp/whoops
   byjg/restserver --> byjg/cache-engine
   byjg/restserver --> byjg/webrequest
   byjg/restserver --> byjg/jwt-wrapper
   byjg/restserver --> ext-json
```

----
[Open source ByJG](http://opensource.byjg.com)

