---
title: "Understanding the ByJG PHP Components Versioning System"
description: "A comprehensive guide to understanding how ByJG PHP components are versioned and how to use them effectively in your projects"
authors: [byjg]
date: 2025-11-22
tags: [php, versioning, composer, best-practices, ecosystem]
image: ./frontpage.png
---

# Understanding the ByJG PHP Components Versioning System

![Understanding the ByJG PHP Components Versioning System](./frontpage.png)

Managing dependencies across multiple PHP components used to be a nightmare.
When you have an ecosystem of 30+ interconnected packages, keeping track of which version works with which PHP version — and which versions are compatible with each other — can quickly become overwhelming.

That's why I completely redesigned the versioning strategy for all ByJG PHP components.
This post explains the evolution of the versioning system, how it works today, and how you can use it effectively in your projects.

<!-- truncate -->

## The Problem: Before PHP 7.4

Before PHP 7.4, each component in the ByJG ecosystem had **its own independent versioning scheme**.

This created several challenges:

- **Dependency Hell**: It was extremely difficult to identify which versions of different components were compatible with each other
- **PHP Version Confusion**: There was no clear way to know which PHP versions a specific component version supported
- **Maintenance Nightmare**: Managing patches and updates across components with different version numbers was complex and error-prone
- **Poor Developer Experience**: Users had to manually research compatibility matrices before installing components

For example, you might have:
- `byjg/anydataset` at version 3.2.1
- `byjg/serializer` at version 2.5.0
- `byjg/migration` at version 4.1.2

And trying to figure out which versions worked together — and with which PHP version — required digging through documentation or trial and error.

---

## The Solution: Standardized Versioning

Starting with **PHP 7.4**, I introduced a **standardized versioning system** across all ByJG components.

The key principle is simple:

> **The component major version indicates which PHP versions it supports.**

This creates a clear, predictable pattern that makes dependency management significantly easier.

### Version to PHP Support Matrix

| Component Version | Supported PHP Versions | Status                     |
|-------------------|------------------------|----------------------------|
| **4.9.x**         | PHP 7.4, 8.0, 8.1, 8.2 | Maintenance only (patches) |
| **5.0.x**         | PHP 8.1, 8.2, 8.3      | Maintenance only (patches) |
| **6.0.x**         | PHP 8.3, 8.4, 8.5      | Active development         |

This means:

- If you're running **PHP 8.4**, you should use version **6.0** of ByJG components
- If you're still on **PHP 8.2**, you can use version **4.9** or **5.0**
- If you need to support **PHP 7.4**, version **4.9** is your only option

### Benefits of This Approach

1. **Instant Clarity**: Just by looking at the version number, you know which PHP versions are supported
2. **Consistent Dependencies**: All components with the same major version are designed to work together
3. **Simplified Upgrades**: When upgrading PHP, you upgrade all components to the corresponding version
4. **Better Maintenance**: Clear separation between version lines makes patching specific versions straightforward

---

## Development Workflow and Branch Strategy

Understanding how releases and patches work is crucial for both contributors and users of the ecosystem.

### The Main Branch Strategy

The development workflow follows a straightforward pattern:

```
main/master branch
    ↓
Always contains the latest version (currently 6.0.x)
    ↓
Releases are tagged directly from this branch
```

**Key Points**:

- The `main` (or `master`) branch **always** contains the latest version of the component
- All new feature development happens on the main branch
- When a release is ready, it's tagged directly from main (e.g., `v6.0.0`, `v6.0.1`, etc.)
- This ensures the main branch is always stable and ready for release

### Version-Specific Branches for Patches

When a bug is discovered in an older version that still needs support, we use **version-specific branches**:

```
Branch 4.9  →  For patching version 4.9.x (PHP 7.4-8.2)
Branch 5.0  →  For patching version 5.0.x (PHP 8.1-8.3)
Branch 6.0  →  For patching version 6.0.x (PHP 8.3-8.5)
```

**Workflow Example**:

1. A critical bug is found in version 5.0.x
2. Create a fix branch from the `5.0` branch
3. Apply the fix and merge it back to the `5.0` branch
4. Tag a new patch release (e.g., `v5.0.8`)
5. If applicable, port the fix to newer versions (`6.0` or `main`)

This approach ensures:
- **Older versions remain stable** and can receive critical fixes
- **No interference** with active development on the main branch
- **Clear separation** between maintenance and new features

---

## Best Practices: Using Components in Your Project

### Recommendation #1: Use the Same Version Across All Components

To ensure maximum compatibility and avoid dependency conflicts, **always use components from the same major version**.

**Bad Practice** ❌:
```json
{
    "require": {
        "byjg/anydataset": "^5.0",
        "byjg/serializer": "^6.0",
        "byjg/migration": "^4.9"
    }
}
```

**Good Practice** ✅:
```json
{
    "require": {
        "byjg/anydataset": "^6.0",
        "byjg/serializer": "^6.0",
        "byjg/migration": "^6.0"
    }
}
```

### Recommendation #2: Use the Caret Operator (^)

The **caret operator** (`^`) is the recommended way to specify version constraints:

```json
{
    "require": {
        "byjg/anydataset": "^6.0"
    }
}
```

**What `^6.0` means**:

- Allows any version `>= 6.0.0` and `< 7.0.0`
- You'll receive **patch updates** (6.0.1, 6.0.2, etc.) automatically
- You'll receive **minor updates** (6.1.0, 6.2.0, etc.) automatically
- You **won't** automatically upgrade to version 7.0.0, which would be a breaking change

This gives you the best balance of:
- **Stability**: No breaking changes from major version upgrades
- **Security**: Automatic patch updates for bug fixes
- **Features**: Access to new minor version features without manual intervention

---

## Testing Development Versions

Sometimes you need to test unreleased features or help with development. There are two approaches:

### Option 1: Set Minimum Stability (Project-Wide)

This approach tells Composer to allow development versions for **all** packages:

```json
{
    "require": {
        "byjg/anydataset": "^6.0",
        "byjg/serializer": "^6.0"
    },
    "minimum-stability": "dev",
    "prefer-stable": false
}
```

**How it works**:

- `"minimum-stability": "dev"` allows Composer to install dev versions
- `"prefer-stable": false"` tells Composer to prefer development versions over stable ones when available
- The `^6.0` constraint will now match `6.0.x-dev` branches

**When to use**:
- When you're actively developing or testing multiple components
- When you want to test the bleeding edge of the entire ecosystem

**Caution**: This affects **all** dependencies, not just ByJG components. Use with care in production environments.

### Option 2: Pin Specific Components to Dev Versions

This approach is more targeted and only affects specific packages:

```json
{
    "require": {
        "byjg/anydataset": "6.0.x-dev",
        "byjg/serializer": "^6.0",
        "byjg/migration": "^6.0"
    }
}
```

**How it works**:

- `"6.0.x-dev"` explicitly requests the development version of the `6.0` branch
- Other packages continue to use stable versions
- You can mix and match: test one component's dev version while keeping others stable

**When to use**:
- When testing a specific feature or bug fix in a single component
- When contributing to a specific component
- When you need more control over which packages use dev versions

### Composer Update Commands

After changing version constraints:

```bash
# Update all packages
composer update

# Update only specific packages
composer update byjg/anydataset

# Update all byjg packages
composer update byjg/*
```

---

## Migration Strategy Between Versions

When it's time to upgrade to a new PHP version (and consequently a new component version), follow this approach:

### Step 1: Check Your Current PHP Version

```bash
php -v
```

### Step 2: Update Your composer.json

Change all ByJG component versions to match your target PHP version:

```json
{
    "require": {
        "php": "^8.4",
        "byjg/anydataset": "^6.0",
        "byjg/serializer": "^6.0",
        "byjg/migration": "^6.0",
        "byjg/rest": "^6.0"
    }
}
```

### Step 3: Run Composer Update

```bash
composer update
```

### Step 4: Test Your Application

Run your test suite to catch any breaking changes:

```bash
./vendor/bin/phpunit
```

### Step 5: Review Changelogs

Check the changelogs of each component for breaking changes:

```
https://opensource.byjg.com/docs/php/[component-name]/
```

---

## Version Support Lifecycle

Understanding the support lifecycle helps you plan upgrades:

| Version | Release Date | Active Development | Security Patches | End of Life |
|---------|--------------|--------------------|------------------|-------------|
| 4.9.x   | 2020         | ❌ Ended            | ✅ No             | 2023        |
| 5.0.x   | 2022         | ❌ Ended            | ✅ No             | 2025        |
| 6.0.x   | 2025         | ✅ Active           | ✅ Yes            | TBD         |

**Active Development**: New features, improvements, and optimizations
**Security Patches**: Critical bug fixes and security updates only

---

## Real-World Example

Let's say you're building a new REST API application:

### Your PHP Version
```bash
$ php -v
PHP 8.4.1
```

### Your composer.json
```json
{
    "name": "mycompany/api",
    "require": {
        "php": "^8.4",
        "byjg/rest": "^6.0",
        "byjg/anydataset": "^6.0",
        "byjg/migration": "^6.0",
        "byjg/jwt-session": "^6.0",
        "byjg/authuser": "^6.0"
    },
    "require-dev": {
        "phpunit/phpunit": "^11.0"
    }
}
```

### Install Dependencies
```bash
composer install
```

**Result**: Composer installs the latest 6.0.x versions of all components, ensuring:
- ✅ Full compatibility with PHP 8.4
- ✅ All components work together seamlessly
- ✅ Automatic updates for patches and minor versions
- ✅ Stable, tested ecosystem

---

## Conclusion

The standardized versioning system for ByJG PHP components transforms dependency management from a complex puzzle into a straightforward process.

**Key Takeaways**:

1. **Component version = PHP version compatibility** — Version 6.0 = PHP 8.3/8.4/8.5
2. **Always use the same major version** across all ByJG components
3. **Use the caret operator** (`^6.0`) for optimal stability and updates
4. **Main branch = latest version**, version branches for patches
5. **Two ways to test dev versions**: project-wide stability settings or per-package pinning

By following these guidelines, you'll have a maintainable, predictable dependency setup that scales with your application.

Want to explore the entire ecosystem?
👉 Visit [https://opensource.byjg.com](https://opensource.byjg.com)

Need to check which components are available?
👉 Browse the [component catalog](https://opensource.byjg.com/docs/php/)
