---
sidebar_key: nimbus
---

# DockNimbus

Self-hosted cloud platform for bare metal machines.

[Website](https://docknimbus.com) | [Documentation](https://opensource.byjg.com/docs/devops/nimbus/) | [GitHub](https://github.com/docknimbus/nimbus)

DockNimbus turns heterogeneous bare metal machines (Raspberry Pi 4/5, x86 servers, etc.) into a cloud platform with compute instances (Docker Swarm), Kubernetes clusters (K3s), object storage (MinIO), and load balancers (EasyHAProxy) — all managed through a REST API and CLI.

**Key capabilities:**

- **Infrastructure as Code** — Declare your entire infrastructure in a [single YAML manifest](guides/manifest/overview): nodes, volumes, swarms, Kubernetes clusters, compute instances, and services. Idempotent apply, drift detection, and pruning of orphaned resources.
- **Zero-trust networking** — All inter-node traffic is encrypted via a WireGuard mesh VPN. Agents authenticate to the control plane using mTLS with auto-issued per-node certificates.
- **Heterogeneous hardware** — Mix ARM64 (Raspberry Pi) and x86 servers in the same cluster. Platform constraints route workloads to the right architecture.

## Architecture

```
User --> nimbus CLI (HMAC/JWT) --> nimbus-api (control plane, TLS)
User --> nimbus-gui (Web UI) -------^
                                    |
                                    +--> nimbus-agent (on each node, mTLS)
                                    |       +-- Docker Swarm
                                    |       +-- K3s clusters
                                    |       +-- MinIO (S3)
                                    |       +-- WireGuard tunnel
                                    |
                                    +--> SQLite (state)
                                    +--> WireGuard (encrypted mesh)
```

- **nimbus-api** — Control plane REST API server (TLS, SQLite)
- **nimbus-agent** — Node agent, executes tasks and reports heartbeats (mTLS)
- **nimbus** — CLI client (HMAC or JWT auth)
- **nimbus-gui** — Web dashboard for managing nodes, clusters, and workloads (Vue.js SPA, proxies to nimbus-api)
- **WireGuard** — Encrypted mesh connecting all nodes

## Documentation

| Section | Description |
|---------|-------------|
| [Getting Started](getting-started/installation) | Installation, quick start, first workload |
| [Guides](guides/compute) | Task-oriented guides for compute, Kubernetes, volumes, S3, swarms, services, IAM, and manifests |
| [Concepts](concepts/architecture) | Architecture, networking, and security model |
| [Reference](reference/cli) | CLI commands, API endpoints, configuration, instance types |
| [Development](development/local-setup) | Local setup, building, and testing |

## Quick Start

```bash
# Install
sudo apt install nimbus-api nimbus    # or: sudo dnf install nimbus-api nimbus

# Bootstrap (prints credentials + connection config JSON)
nimbus bootstrap --api-url https://<API_HOST>:8443

# Configure CLI from the downloaded JSON (or use the GUI "Download Config" button)
nimbus configure --from nimbus-config.json
# Or override the API URL if connecting from outside the WireGuard mesh:
# nimbus configure --from nimbus-config.json --api-url https://<PUBLIC_IP>:8443

# Add nodes
nimbus node add --ip 192.168.1.10 --user root --api-url https://<API_HOST>:8443

# Deploy
nimbus manifest apply --file infra.yaml
```

See the [Quick Start guide](getting-started/quick-start) for the full walkthrough.

## Technology Stack

- **Go** — Single binary, ARM64+x86 cross-compile
- **Docker Swarm** — Compute clustering
- **K3s** — Lightweight Kubernetes
- **MinIO** — S3-compatible object storage
- **EasyHAProxy** — Docker-native and K8s load balancing
- **WireGuard** — Encrypted mesh networking
- **SQLite (WAL)** — Embedded state store

## Current Release

v0.4.1