---
sidebar_key: xmlutil
tags: [php, text-manipulation]
---

# XML Utility

Build, query and convert XML without fighting DOM: a fluent API, XPath with namespaces, and PHP models mapped to XML with attributes.


[![Sponsor](https://img.shields.io/badge/Sponsor-%23ea4aaa?logo=githubsponsors&logoColor=white&labelColor=0d1117)](https://github.com/sponsors/byjg)
[![Build Status](https://github.com/byjg/php-xmlutil/actions/workflows/phpunit.yml/badge.svg?branch=master)](https://github.com/byjg/php-xmlutil/actions/workflows/phpunit.yml)
[![Opensource ByJG](https://img.shields.io/badge/opensource-byjg-success.svg)](https://opensource.byjg.com)
[![Install MCP Server](https://img.shields.io/badge/Install-MCP_Server-8A2BE2?logo=modelcontextprotocol&logoColor=white)](https://opensource.byjg.com/docs/ai/mcpserver-byjg-docs/)
[![GitHub source](https://img.shields.io/badge/Github-source-informational?logo=github)](https://github.com/byjg/php-xmlutil/)
[![GitHub license](https://img.shields.io/github/license/byjg/php-xmlutil.svg)](https://opensource.byjg.com/license/)
[![GitHub release](https://img.shields.io/github/release/byjg/php-xmlutil.svg)](https://github.com/byjg/php-xmlutil/releases/)

## Why

PHP's DOM is complete but verbose: creating a node, adding a namespace or running an XPath
query takes several objects and many lines, and turning a PHP object into XML is left to you.

XML Util wraps it in a small API, and maps a model to XML from attributes on the class:

```php
#[XmlEntity(rootElementName: 'Person')]
class Person
{
    #[XmlProperty(elementName: 'Name')]
    public string $name;
}

echo (new EntityParser())->parse($person)->toString(format: true);
```

- **Fluent building and XPath** (`appendChild()`, `selectNodes()`), with namespaces.
- **Models to XML by attributes**, instead of hand-written serialization.
- **XML to arrays** with the same rules as [byjg/serializer](https://github.com/byjg/php-serializer)
  (`toFullArray()`).

## Overview

PHP XML Util provides a comprehensive set of tools for XML manipulation in PHP applications. It simplifies common 
XML operations with an intuitive API, allowing developers to create, modify, query, and validate XML documents
with minimal code.

The library is designed to be lightweight yet powerful, offering features that go beyond 
PHP's built-in XML functionality while maintaining a clean and easy-to-use interface.

## Key Features

- **Simple XML Creation API** - Create and manipulate XML documents programmatically with an intuitive API
- **XPath Querying** - Easily query and navigate XML documents using XPath expressions
- **PHP Model ↔ XML Conversion** - Seamlessly convert between PHP objects and XML representations
- **Attribute-Based Mapping** - Use PHP attributes to control XML serialization behavior
- **Namespace Support** - Full support for XML namespaces in all operations
- **Document Cleaning** - Selectively remove specific tags from XML documents
- **XML Validation** - Validate XML documents against schemas
- **File Handling** - Convenient methods for loading and saving XML from/to files

## Quick Example

```php
<?php
use ByJG\XmlUtil\XmlDocument;

// Create a new XML document
$xml = new XmlDocument('<root />');

// Build the document structure
$myNode = $xml->appendChild('mynode');
$myNode->appendChild('subnode', 'text');
$myNode->appendChild('subnode', 'more text');
$otherNode = $myNode->appendChild('othersubnode', 'other text');
$otherNode->addAttribute('attr', 'value');

// Output formatted XML
echo $xml->toString(format: true);
```

Output:
```xml
<?xml version="1.0" encoding="utf-8"?>
<root>
  <mynode>
    <subnode>text</subnode>
    <subnode>more text</subnode>
    <othersubnode attr="value">other text</othersubnode>
  </mynode>
</root>
```

## Documentation

The library is fully documented with detailed guides and examples for each feature:

- [Creating XML Documents](using-api): Learn how to create and manipulate XML documents using the API
- [Working with Namespaces](namespaces): Guide to handling XML namespaces properly
- [Querying with XPath](query-document): How to use XPath expressions to query XML documents
- [PHP Models to XML](convert-model-xml): Converting PHP objects to XML and vice versa
- [Attribute-Based Mapping](convert-model-xml-withattributes): Using PHP attributes to control XML serialization
- [Cleaning Documents](clean-document): Removing specific tags from XML documents
- [File Operations](file-handling): Loading and saving XML from/to files
- [XML Validation](validate-document): Validating XML documents against schemas

## Installation

```bash
composer require "byjg/xmlutil"
```

## Running Tests

```bash
vendor/bin/phpunit
```

----
[Open source ByJG](https://opensource.byjg.com)