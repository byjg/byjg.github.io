# XmlUtil

[![Build Status](https://github.com/byjg/php-xmlutil/actions/workflows/phpunit.yml/badge.svg?branch=master)](https://github.com/byjg/php-xmlutil/actions/workflows/phpunit.yml)
[![Opensource ByJG](https://img.shields.io/badge/opensource-byjg-success.svg)](http://opensource.byjg.com)
[![GitHub source](https://img.shields.io/badge/Github-source-informational?logo=github)](https://github.com/byjg/php-xmlutil/)
[![GitHub license](https://img.shields.io/github/license/byjg/php-xmlutil.svg)](https://opensource.byjg.com/opensource/licensing.html)
[![GitHub release](https://img.shields.io/github/release/byjg/php-xmlutil.svg)](https://github.com/byjg/php-xmlutil/releases/)

A utility class to make it easy work with XML in PHP

## Examples

- [Create a new XML Document using the API](using-api)
- [Working with namespaces](namespaces)
- [Query a XMLDocument](query-document)
- [Convert any model to XML](convert-model-xml)
- [Use Attributes to help in the conversion](convert-model-xml-withattributes)
- [Clean an XML document removing specific tags](clean-document)

## Install

```bash
composer require "byjg/xmlutil"
```

## Running the Tests

```bash
vendor/bin/phpunit
```

## Dependencies

```mermaid
flowchart TD
    byjg/xmlutil --> ext-simplexml
    byjg/xmlutil --> ext-dom
    byjg/xmlutil --> byjg/serializer
```


----
[Open source ByJG](http://opensource.byjg.com)