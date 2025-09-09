---
slug: byjg-serializer-objectcopy-superpowers
title: "Simple components, big superpowers: byjg/serializer and ObjectCopy"
authors: byjg
tags: [php, serializer, objectcopy, dto, byjg, opensource]
description: Highlighting how byjg/serializer and ObjectCopy turn everyday data transformations into one-liners—with arrays, YAML, PHP serialize, DTO mapping, case conversions, and value transformations.
---

Open Source ByJG is a collection of small, focused PHP components—framework-agnostic by design—that you can mix and match to solve real problems without bringing an entire framework along for the ride.

<!-- truncate -->

In this post I’ll showcase two tiny-but-mighty pieces: the byjg/serializer’s Serialize and ObjectCopy utilities. Together, they make it trivial to convert, reshape, and map data across formats and DTOs.

Links:
- Docs home: https://opensource.byjg.com/docs/php/serializer
- Serialize class: https://opensource.byjg.com/docs/php/serializer/serialize
- ObjectCopy: https://opensource.byjg.com/docs/php/serializer/objectcopy
- ObjectCopyInterface: https://opensource.byjg.com/docs/php/serializer/objectcopyinterface
- GitHub: https://github.com/byjg/serializer

Installation

```bash
composer require byjg/serialize
```

Note: The serializer uses ext-json and can also leverage symfony/yaml and ext-simplexml for YAML and XML support.

1) Serialize: from object to array, JSON, YAML, XML, and more

The Serialize class converts any object, stdClass, or array into arrays or common text formats, with optional modifiers.

Basic: class to array and YAML

```php
<?php
use ByJG\Serializer\Serialize;

class Customer
{
    public function __construct(private string $name, private ?int $age)
    {
    }
    public function getName(): string { return $this->name; }
    public function getAge(): ?int { return $this->age; }
}

$customer = new Customer('João', null);

// To array
$array = Serialize::from($customer)->toArray();
// [ 'name' => 'João', 'age' => null ]

// To YAML
$yaml = Serialize::from($customer)->toYaml();
// e.g.
// name: "João"
// age: null
```

Parsing existing serialized content

```php
<?php
use ByJG\Serializer\Serialize;

// From PHP's native serialize()
$serialized = serialize(['a' => 1, 'b' => 2]);
$parsed = Serialize::fromPhpSerialize($serialized)->toArray();
// [ 'a' => 1, 'b' => 2 ]

// From JSON
$json = '{"foo": "bar"}';
$parsedJson = Serialize::fromJson($json)->toArray();

// From YAML
$yaml = "foo: bar\nanswer: 42\n";
$parsedYaml = Serialize::fromYaml($yaml)->toArray();
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

Advanced: parse attributes during serialization

```php
<?php
use ByJG\Serializer\Serialize;

class Model
{
    public string $Id = '';
    #[SampleAttribute("Message")]
    public string $Name = '';
}

$model = new Model();
$model->Id = '123';
$model->Name = 'John';

$result = Serialize::from($model)
    ->parseAttributes(function ($attribute, $value, $keyName, $propertyName, $getterName) {
        // Example: append attribute metadata if present
        return $attribute ? ($value . ': ' . $attribute->getElementName()) : $value;
    });
```

2) ObjectCopy: copy arrays and objects, rename fields, change case, transform values

ObjectCopy moves data between arrays/objects, even when property names differ. You can rename properties, switch case styles, and alter values on the fly.

Basic: copy an array into an object

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

Basic: copy one DTO into another DTO

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
