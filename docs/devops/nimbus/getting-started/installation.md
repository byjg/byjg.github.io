---
sidebar_position: 1
sidebar_label: "Installation"
title: "Installation"
---

# Installation

## From packages

### 1. Add the package repository

Follow the instructions at [opensource.byjg.com/docs/packages](https://opensource.byjg.com/docs/packages) to add the APT or DNF repository.

### 2. Install the API server

On the control plane machine:

```bash
sudo apt install nimbus-api    # Debian/Ubuntu
sudo dnf install nimbus-api    # Fedora/RHEL
```

The API server starts automatically on `:8443` with auto-generated TLS certificates.

### 3. Install the CLI

On your workstation (or the same machine):

```bash
sudo apt install nimbus         # Debian/Ubuntu
sudo dnf install nimbus         # Fedora/RHEL
```

## From source

```bash
make build        # Build for current platform
make build-all    # Cross-compile for linux/amd64, linux/arm64, darwin/*
```

This produces three binaries in `bin/`:
- `nimbus-api` — the control plane server
- `nimbus-agent` — the node agent
- `nimbus` — the CLI

See [Local Development Setup](../development/local-setup) for a complete development walkthrough.
