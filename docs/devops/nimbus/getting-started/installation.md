---
sidebar_position: 1
sidebar_label: "Installation"
title: "Installation"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Installation

## From packages

### 1. Add the package repository

Follow the instructions at [opensource.byjg.com/docs/packages](https://opensource.byjg.com/docs/packages) to add the APT or DNF repository.

### 2. Install the API server

On the control plane machine:

<Tabs>
  <TabItem value="apt" label="APT (Debian/Ubuntu)" default>
    ```bash
    sudo apt install nimbus-api
    ```
  </TabItem>
  <TabItem value="dnf" label="DNF (Fedora/RHEL)">
    ```bash
    sudo dnf install nimbus-api
    ```
  </TabItem>
</Tabs>

The API server starts automatically on `:8443` with auto-generated TLS certificates.

### 3. Install the CLI

On your workstation (or the same machine):

<Tabs>
  <TabItem value="apt" label="APT (Debian/Ubuntu)" default>
    ```bash
    sudo apt install nimbus
    ```
  </TabItem>
  <TabItem value="dnf" label="DNF (Fedora/RHEL)">
    ```bash
    sudo dnf install nimbus
    ```
  </TabItem>
</Tabs>

## Supported platforms

| Binary         | amd64 | arm64 | armhf (ARMv7) | macOS amd64 | macOS arm64 |
|----------------|-------|-------|---------------|-------------|-------------|
| `nimbus-api`   | ✅     | ✅     | ✅             | —           | —           |
| `nimbus-agent` | ✅     | ✅     | ✅             | —           | —           |
| `nimbus` (CLI) | ✅     | ✅     | ✅             | ✅           | ✅           |
| `nimbus-gui`   | ✅     | ✅     | ✅             | —           | —           |

:::note armhf
`armhf` targets ARMv7 hard-float (e.g. Tinker Board S, Raspberry Pi 2/3 running 32-bit OS).
Building `nimbus-api` for armhf requires `gcc-arm-linux-gnueabihf` for CGO/SQLite.
:::

## From source

```bash
make build        # Build for current platform
make build-cross  # Cross-compile for all platforms (linux/amd64, arm64, armhf, darwin/*)
```

This produces four binaries in `bin/`:
- `nimbus-api` — the control plane server
- `nimbus-agent` — the node agent (also built into `bin/dist/` for all arches)
- `nimbus` — the CLI
- `nimbus-gui` — the GUI server (with embedded UI)

See [Local Development Setup](../development/local-setup) for a complete development walkthrough.
