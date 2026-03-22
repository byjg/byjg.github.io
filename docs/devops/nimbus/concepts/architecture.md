---
sidebar_position: 1
sidebar_label: "Architecture"
title: "Architecture"
---

# Architecture

```
User --> nimbus CLI (HMAC/JWT) --> nimbus-api (control plane, TLS)
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

## Components

| Component | Description |
|-----------|-------------|
| **nimbus-api** | Control plane REST API server. Listens on `:8443` with TLS (auto-generated or user-provided certs). Stores state in SQLite (WAL mode). Manages node registration, task queuing, certificate issuance, and WireGuard IP allocation. |
| **nimbus-agent** | Node agent installed on every managed machine. Authenticates to the API via mTLS with per-node client certificates. Sends heartbeats every 10 seconds (including CPU, memory, and disk metrics). Polls for and executes tasks: Docker Swarm operations, K3s install/join, NFS exports, WireGuard configuration. |
| **nimbus** | CLI client for operators. Authenticates via HMAC-signed requests (access/secret key pair) or JWT bearer tokens. |

## Communication

### API ↔ Agent (mTLS)

Each agent gets a unique client certificate signed by the API's CA during the node join process. The agent's node ID is embedded in the certificate's CommonName. All agent-to-API traffic uses mutual TLS over WireGuard.

The agent communicates through three endpoints:
- **POST /v1/internal/heartbeat** — periodic health reports with hardware metrics
- **GET /v1/internal/tasks/`{nodeId}`** — poll for pending tasks to execute
- **POST /v1/internal/tasks/`{taskId}`/result** — report task completion or failure

### CLI ↔ API (HMAC / JWT)

The CLI signs each request with HMAC using the secret key from `nimbus configure`. Alternatively, users can authenticate with username/password via `nimbus iam login` to get a JWT token.

### Node ↔ Node (WireGuard)

All inter-node traffic (Docker Swarm gossip, K3s API, NFS mounts, S3) flows through a full-mesh WireGuard VPN. The API server assigns overlay IPs from a configurable subnet (default: `10.106.103.0/24`) and distributes peer configurations to all nodes.

See [Networking](networking) for a detailed IP interaction map.

## Task Queue

The API doesn't connect directly to nodes. Instead, it queues tasks (e.g., `swarm_init`, `k3s_install_server`, `setup_nfs_export`) which agents poll for and execute asynchronously. Task results are reported back via the API, which updates resource state accordingly.

## State

All state is stored in a single SQLite database (WAL mode) on the API server. There is no external database dependency. The database tracks nodes, swarms, clusters, instances, volumes, certificates, tasks, and resource tags.
