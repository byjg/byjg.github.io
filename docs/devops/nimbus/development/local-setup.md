---
sidebar_position: 1
sidebar_label: "Local Setup"
title: "Local Development Setup"
---

# Local Development Setup

This guide walks you through building and running DockNimbus locally on a single machine for development and testing.

## Prerequisites

- **Go 1.22+** (to build from source)
- **Docker** (for compute instances, K3s clusters, MinIO, and EasyHAProxy)
- **Linux** (agent metrics use Linux syscalls; API and CLI work on macOS too)

Optional:
- **WireGuard** — only needed for multi-node mesh networking

## Build

```bash
cd docknimbus
make build
```

This produces three binaries in `bin/`:
- `nimbus-api` — the control plane server
- `nimbus-agent` — the node agent
- `nimbus` — the CLI

## Start the API server

```bash
./bin/nimbus-api --config configs/api.yaml
```

The server starts on `:8443` with TLS (auto-generated self-signed certificate) and a local SQLite database (`nimbus.db`).

Leave this running in a terminal.

## Bootstrap and configure

In a new terminal:

```bash
# Bootstrap the admin user (also saves CA cert to ~/.nimbus/ca.crt)
./bin/nimbus bootstrap --api-url https://localhost:8443

# Configure the CLI with the returned credentials
./bin/nimbus configure \
  --api-url https://localhost:8443 \
  --access-key NBUSxxxxxxxxxxxxxxxxxxxx \
  --secret-key yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
```

The CLI automatically uses `~/.nimbus/ca.crt` (saved by `bootstrap`) to trust the self-signed certificate.

> If you bootstrapped with `curl` and don't have the CA cert yet:
> ```bash
> curl -sk https://localhost:8443/v1/ca -o ~/.nimbus/ca.crt
> ```

## Add a local node

```bash
sudo ./bin/nimbus node add --local --ip <your-local-ip>
```

This creates the node record, issues an mTLS client certificate, downloads the agent binary, and starts the agent via systemd.

## Verify

```bash
./bin/nimbus node list
```

```
ID              NAME  IP             STATUS  ROLE  AGENT  CPU        MEMORY
node-xxxxxxxx         192.168.1.x    ready   -     dev    8000/8000  16384MB/16384MB
```

## Adding remote nodes

For multi-node setups:

```bash
./bin/nimbus node add \
  --ip 192.168.1.10 \
  --user root \
  --api-url https://YOUR_API_HOST:8443
```

This automatically:
1. Pre-creates a node record and issues a client certificate
2. Downloads the agent binary from the API server
3. Copies binary, CA cert, and client cert/key to the remote machine via SSH
4. Installs Docker and WireGuard if missing
5. Writes the agent config and starts the systemd service
6. Waits for the node to become ready

Nodes form a full-mesh WireGuard VPN automatically.

## Try it out

With your node ready, try the workflows in the [Guides](../guides/compute) section, using `./bin/nimbus` instead of the installed binary.

## Cross-compilation

```bash
GOOS=linux GOARCH=arm64 make build    # ARM64
make build-cross                         # All platforms
```
