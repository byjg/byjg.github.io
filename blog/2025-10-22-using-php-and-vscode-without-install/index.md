---
title: "Easy PHP Development with Docker and VSCode"
description: "Learn how to set up a complete PHP development environment using only Docker and VSCode. No local PHP installation required"
authors: [byjg]
date: 2025-10-22
tags: [PHP, Docker, VSCode, Development, Xdebug]
---

# Easy PHP Development with Docker and VSCode

Setting up a PHP development environment can be challenging, especially when you need to manage multiple PHP versions or avoid cluttering 
your system with local installations. In this guide, I'll show you how to create a complete PHP development environment using only Docker and VSCode.
No local PHP installation required!

<!-- truncate --> 

## What You'll Get

By the end of this tutorial, you'll have:
- PHP running entirely in Docker containers
- Full debugging support with Xdebug in VSCode
- Ability to run individual PHP scripts
- Built-in PHP development server
- Zero PHP installation on your host machine

## Prerequisites

- Docker installed and running
- Visual Studio Code installed
- Basic familiarity with command line

## Step 1: Install PHP via Docker Wrapper

We'll use [shellscript.download](https://shellscript.download), a collection of curated ready-to-use scripts that make installation a breeze.

First, install the Loader:

```bash
/bin/bash -c "$(curl -fsSL https://shellscript.download/install/loader)"
```

And then run this single command to install PHP 8.4 via Docker:

```bash
load.sh php-docker -- 8.4
```

This creates a wrapper script at ~/.shellscript/bin/php8.4 that runs PHP inside a Docker container. 
The beauty of this approach is that PHP runs in complete isolation. Your host system stays clean!

The script also adds ~/.shellscript/bin to your PATH, so you can:
- Call php8.4 directly from anywhere in your terminal
- Use php as an alias (automatically points to your default PHP version)

Try it out:

```bashp
php8.4 --version
php --version  # Uses the alias
```

:::tip
You can install multiple PHP versions side by side:
```bash
load.sh php-docker -- 8.3
load.sh php-docker -- 8.2
```
:::

## Step 2: Install VSCode Extensions

You need two extensions for PHP development with debugging:

1. **PHP Debug** by Xdebug
    - Extension ID: `xdebug.php-debug`
    - Provides Xdebug integration for debugging PHP code

2. **PHP Intelephense** (recommended) or **PHP IntelliSense**
    - Extension ID: `bmewburn.vscode-intelephense-client`
    - Provides code intelligence, autocompletion, and more

Install them via VSCode:
1. Press `Ctrl+Shift+X` (or `Cmd+Shift+X` on Mac) to open Extensions
2. Search for "PHP Debug" and install
3. Search for "PHP Intelephense" and install

:::tip
There is another extension that install all packages you need. This extension is not free, however you can use it
in the trial period.

The extension ID is `devsense.phptools-vscode`
:::

## Step 3: Configure VSCode Settings

Open your VSCode settings (`.vscode/settings.json` in your project or global settings) and add:

```jsonc
{
    "php.executables": {
        "8.4": "/home/YOUR_USERNAME/.shellscript/bin/php8.4"
    },
    "php.version": "8.4",
    "php.debug.port": [9003]
}
```

:::caution Important
Replace `/home/YOUR_USERNAME/` with your actual home directory path. You can find it by running `echo ~` in your terminal.

If you installed a different PHP version, update both the key (`"8.4"`) and the path accordingly:
```jsonc
"php.executables": {
    "8.3": "/home/YOUR_USERNAME/.shellscript/bin/php8.3"
},
"php.version": "8.3",
```
:::

## Step 4: Configure Launch Configurations

Create or update `.vscode/launch.json` in your project root:

```jsonc
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Listen for Xdebug",
            "type": "php",
            "request": "launch",
            "port": 9003,
            "pathMappings": {
                "/workdir": "${workspaceFolder}"
            }
        },
        {
            "name": "PHP Debug Current Script",
            "type": "php",
            "request": "launch",
            "program": "${file}",
            "cwd": "${fileDirname}",
            "port": 9003,
            "pathMappings": {
                "/workdir": "${workspaceFolder}"
            },
            "runtimeArgs": [
                "-dxdebug.start_with_request=yes"
            ],
            "env": {
                "XDEBUG_MODE": "debug,develop",
                "XDEBUG_CONFIG": "client_port=9003"
            }
        },
        {
            "name": "PHP Run Open Script",
            "type": "php",
            "request": "launch",
            "program": "${file}",
            "cwd": "${fileDirname}",
            "noDebug": true,
            "pathMappings": {
                "/workdir": "${workspaceFolder}"
            }
        },
        {
            "name": "PHP Built-in Server",
            "type": "php",
            "request": "launch",
            "runtimeArgs": [
                "-S",
                "localhost:8080",
                "-t",
                "/workdir"
            ],
            "port": 9003,
            "pathMappings": {
                "/workdir": "${workspaceFolder}"
            },
            "noDebug": false,
            "serverReadyAction": {
                "pattern": "Development Server \\(http://localhost:([0-9]+)\\) started",
                "uriFormat": "http://localhost:%s",
                "action": "openExternally"
            }
        },
        {
            "name": "PHP Built-in Server (no debug)",
            "type": "php",
            "request": "launch",
            "runtimeArgs": [
                "-S",
                "localhost:8080",
                "-t",
                "/workdir"
            ],
            "noDebug": true,
            "serverReadyAction": {
                "action": "openExternally"
            }
        }
    ]
}
```

## Step 5: Test Your Setup

Create a simple test file `test.php`:

```php
<?php

function greet($name) {
    $greeting = "Hello, $name!";
    return $greeting;
}

function calculate($a, $b) {
    $sum = $a + $b;
    $product = $a * $b;
    return [
        'sum' => $sum,
        'product' => $product,
        'average' => $sum / 2
    ];
}

echo "=== Testing PHP Setup ===\n\n";

$name = "Developer";
echo greet($name) . "\n\n";

$result = calculate(10, 5);
echo "Calculations for 10 and 5:\n";
echo "Sum: {$result['sum']}\n";
echo "Product: {$result['product']}\n";
echo "Average: {$result['average']}\n\n";

echo "PHP Version: " . phpversion() . "\n";
echo "Xdebug loaded: " . (extension_loaded('xdebug') ? 'Yes' : 'No') . "\n";
```

## Using Your New Setup

### Running a Script Without Debugging

1. Open `test.php`
2. Press `F5` or click the Run button
3. Select **"PHP Run Open Script"**
4. See the output in the Debug Console

### Debugging a Script

1. Set a breakpoint by clicking to the left of a line number (try line with `$greeting = ...`)
2. Press `F5`
3. Select **"PHP Debug Current Script"**
4. Execution will pause at your breakpoint
5. Inspect variables, step through code, etc.

### Running the Built-in Server

1. Create an `index.php` file in your project root
2. Press `F5`
3. Select **"PHP Built-in Server"** or **"PHP Built-in Server (no debug)"**
4. Your browser will automatically open to `http://localhost:8080`
5. Set breakpoints in your PHP files and refresh the page to debug

## How It Works

The magic happens in the wrapper script created by shellscript.download. It:

1. Converts absolute file paths to relative paths
2. Mounts your project directory as `/workdir` in the Docker container
3. Runs PHP inside the container with Xdebug configured
4. Uses `--network host` so Xdebug can connect back to VSCode

All of this happens transparently. You just write PHP code and debug as if PHP were installed locally!

## Benefits of This Approach

✅ **Clean System**: No PHP installation cluttering your system  
✅ **Multiple Versions**: Run different PHP versions for different projects  
✅ **Consistent Environment**: Same PHP environment across different machines  
✅ **Full Debugging**: Complete Xdebug support with breakpoints, variable inspection, etc.  
✅ **Easy Updates**: Update PHP by just changing the wrapper script  
✅ **Isolated Dependencies**: Each container is isolated with its own extensions

## Troubleshooting

### "Could not connect to debugging client"

Make sure VSCode is listening for Xdebug. You should see "Listening to Xdebug on port 0.0.0.0:9003" in the Debug Console when you start debugging.

### "Address already in use" when starting server

The server is still running from a previous launch. Stop it by clicking the trash icon in the terminal where it's running, or press `Ctrl+C`.

### Path issues

Ensure your `pathMappings` correctly maps `/workdir` to your workspace folder. This tells Xdebug how to translate container paths to your local paths.

## Conclusion

With this setup, you have a professional PHP development environment that's:
- Easy to set up (just a few minutes!)
- Easy to maintain
- Portable across machines
- Completely isolated from your host system

No more dependency conflicts, no more "works on my machine" problems, and no more complex PHP installations. Just pure, containerized PHP development bliss!

Happy coding! 🚀