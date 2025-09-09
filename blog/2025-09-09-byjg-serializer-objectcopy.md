---
slug: byjg-serializer-objectcopy-superpowers
title: "Simple components, big superpowers: byjg/serializer and ObjectCopy"
authors: byjg
tags: [php, serializer, objectcopy, dto, byjg, opensource]
description: Highlighting how byjg/serializer and ObjectCopy turn everyday data transformations into one-liners—with arrays, YAML, PHP serialize, DTO mapping, case conversions, and value transformations.
---

In this post I’ll showcase two tiny-but-mighty pieces: the byjg/serializer’s Serialize and ObjectCopy utilities. Together, they make it trivial to convert, reshape, and map data across formats and DTOs.

<!-- truncate -->

## Introduction

OpenSource ByJG is a toolbox of small, framework-agnostic components you can mix and match as you like. 
The project leans heavily into the KISS principle (“keep it simple”), prioritizing short, composable libraries over 
heavyweight frameworks — you can see that spirit across its PHP component catalog and philosophy pages.

Among these, byjg/serializer shines as a pragmatic way to move data between objects, arrays and 
wire formats (JSON, XML, YAML) — including handy copy/mapping helpers when shapes don’t match 1:1. 

It installs with one line:

```bash
composer require byjg/serialize
```

The library converts any object/array/stdClass to array, and then formats that to JSON, XML, YAML, or plain text. It also parses from JSON/YAML/PHP-serialized strings into arrays, and lets you filter/transform fields and even read PHP 8 attributes on the fly. Under the hood, it sticks to lean dependencies (json, symfony/yaml, simplexml).
[Opensource ByJG](https://opensource.byjg.com/)

## Basic: from anything to anything

Let’s start with a tiny model and go through the everyday moves.

```php
<?php

use ByJG\Serializer\Serialize;

final class User
{
    public function __construct(
        private int $id,
        private string $name,
        private ?string $email = null,
    ) {}

    public function getId(): int { return $this->id; }
    public function getName(): string { return $this->name; }
    public function getEmail(): ?string { return $this->email; }
}

$user = new User(1, 'João', null);

// 1) Object → array
$asArray = Serialize::from($user)->toArray();

// 2) Array → YAML (JSON/XML similar)
$yaml = Serialize::from($asArray)->toYaml();

// 3) PHP’s own serialized string (use PHP core for output)
$phpSerialized = serialize($asArray);

// 4) Back from a PHP-serialized string → array
$backToArray = Serialize::fromPhpSerialize($phpSerialized)->toArray();

```

The calls above mirror the documented API for converting “from anything to array”, formatting arrays and objects to JSON/XML/YAML, 
and parsing from JSON/YAML/PHP serialized strings back to arrays.

Another examples:

```php
<?php
use ByJG\Serializer\Serialize;

// From PHP's native serialize()
$serialized = serialize(['a' => 1, 'b' => 2]);
$parsed = Serialize::fromPhpSerialize($serialized)->toArray();
// [ 'a' => 1, 'b' => 2 ]

// From JSON
$json = '{"foo": "bar"}';
$parsedJson = Serialize::fromJson($json)->toYaml();
// foo: bar

// From YAML
$yaml = "foo: bar\nanswer: 42\n";
$parsedYaml = Serialize::fromYaml($yaml)->toJson();
// {"foo":"bar","answer":42}
```

Useful modifiers at a glance

```php
<?php
use ByJG\Serializer\Serialize;

$result = Serialize::from($customer)
    ->withDoNotParseNullValues()  // drop nulls
    ->withOnlyString()            // coerce values to strings
    ->withMethodPattern('/([^A-Za-z0-9])/') // customize getter->property mapping
    ->toArray();
```

Other outputs

```php
<?php
use ByJG\Serializer\Serialize;

echo Serialize::from(['k' => 'v'])->toJson();
echo Serialize::from(['k' => 'v'])->toXml();
echo Serialize::from(['k' => 'v'])->toPlainText();
```

### Read PHP 8 Attributes and transform values

You can parse attributes and transform each property as you go — a powerful hook for masking, formatting, or adding metadata.


```php
<?php

use ByJG\Serializer\Serialize;

#[Attribute]
final class Label {
    public function __construct(public string $text) {}
}

final class Product {
    #[Label('SKU')]
    public string $id = 'A-123';

    #[Label('Pretty name')]
    public string $name = 'Fuzzy Panda';
}

$prod = new Product();

$out = Serialize::from($prod)->parseAttributes(
    // Callback receives ($attributeInstance, $value, $keyName, $propertyName, $getterName)
    function ($attr, $value, $key, $prop, $getter) {
        // If the attribute exists, append its label
        return $attr ? "{$value} ({$attr->text})" : $value;
    },
    Label::class // Only parse this attribute type
    // , $flags (optional)
);

print_r($out);
// [ 'id' => 'A-123 (SKU)', 'name' => 'Fuzzy Panda (Pretty name)' ]

```

This callback-based attribute parsing is part of the Serialize API.

## ObjectCopy: move data between arrays and objects

ObjectCopy moves data between arrays/objects, even when property names differ. 
You can rename properties, switch case styles, and alter values on the fly.

Here a basic example:

```php
<?php
use ByJG\Serializer\ObjectCopy;

class UserDto
{
    public int $id;
    public string $name;
}

$payload = ['id' => 10, 'name' => 'Ana'];
$dto = new UserDto();
ObjectCopy::copy($payload, $dto);
// $dto->id === 10; $dto->name === 'Ana'
```

And another copying from one DTO into another DTO

```php
<?php
use ByJG\Serializer\ObjectCopy;

class SourceDto { public int $idModel = 1; public string $clientName = 'John'; }
class TargetDto { public int $idModel; public string $clientName; }

$source = new SourceDto();
$target = new TargetDto();
ObjectCopy::copy($source, $target);
```

Advanced: camelCase to snake_case

```php
<?php
use ByJG\Serializer\ObjectCopy;
use ByJG\Serializer\Property\CamelToSnakeCase;

class Source
{
    public int $idModel = 1;
    public string $clientName = 'John';
    public int $age = 30;
}

class Target
{
    public int $id_model;
    public string $client_name;
    public int $age;
}

$source = new Source();
$target = new Target();
ObjectCopy::copy($source, $target, new CamelToSnakeCase());
```

Advanced: snake_case to camelCase

```php
<?php
use ByJG\Serializer\ObjectCopy;
use ByJG\Serializer\Property\SnakeToCamelCase;

class Source { 
    public int $id_model = 1; 
    public string $client_name = 'John'; 
    public int $age = 30; 
}
class Target { 
    public int $idModel; 
    public string $clientName; 
    public int $age; 
}

$source = new Source();
$target = new Target();
ObjectCopy::copy($source, $target, new SnakeToCamelCase());
```

Advanced: map different property names explicitly

```php
<?php
use ByJG\Serializer\ObjectCopy;
use ByJG\Serializer\Property\DifferentTargetProperty;

class Source { 
    public int $id_model = 1; 
    public string $client_name = 'John'; 
    public int $age = 30; 
}
class Target { 
    public int $SomeId; 
    public string $SomeName; 
    public int $SomeAge; 
}

$source = new Source();
$target = new Target();

ObjectCopy::copy(
    $source,
    $target,
    new DifferentTargetProperty([
        'id_model' => 'SomeId',
        'client_name' => 'SomeName',
        'age' => 'SomeAge',
    ])
);
```

Advanced: apply value conversions while copying

```php
<?php
use ByJG\Serializer\ObjectCopy;

$payload = [
    'birth_date' => '2024-12-31',
    'amount' => 123.45,
    'name' => 'john',
];

class InvoiceDto
{
    public \DateTimeImmutable $birthDate;
    public int $amountCents;
    public string $name;
}

$target = new InvoiceDto();

$changeValue = function (string $sourceName, string $targetName, $value) {
    if ($targetName === 'birthDate') {
        return new \DateTimeImmutable($value);
    }
    if ($targetName === 'amountCents') {
        return (int) round($value * 100);
    }
    if ($targetName === 'name') {
        return ucfirst($value);
    }
    return $value;
};

ObjectCopy::copy($payload, $target, null, $changeValue);
```

Other special conversion cases

- Provide your own property pattern callback to dynamically match names (prefixes, different setters, etc.).
- Combine a property pattern and a value transformer in the same copy call.
- Use ObjectCopyInterface to add copyFrom/copyTo to your DTOs, so they can ingest/emit data directly.

```php
<?php
use ByJG\Serializer\ObjectCopy;
use ByJG\Serializer\ObjectCopy as ObjectCopyBase; // if you prefer extending

class MyDto extends ObjectCopyBase {}

$dto = new MyDto();
$dto->copyFrom(['id' => 1, 'name' => 'Alice']);  // from array/object to this DTO
$dto->copyTo($another);                           // from this DTO into another object/array
```

Wrap-up

If you need pragmatic, framework-agnostic data shaping in PHP, byjg/serializer delivers:
- Serialize to read and emit arrays/JSON/YAML/XML and parse PHP-serialized data—with handy modifiers.
- ObjectCopy to move data between arrays and objects, rename or retarget fields, switch case styles, and transform values inline.

Explore the full docs for more patterns and edge cases:
- https://opensource.byjg.com/docs/php/serializer/serialize
- https://opensource.byjg.com/docs/php/serializer/objectcopy
- https://opensource.byjg.com/docs/php/serializer/objectcopyinterface
