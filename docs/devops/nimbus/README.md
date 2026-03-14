---
sidebar_key: nimbus
---

# DockNimbus

Self-hosted AWS-like cloud platform for bare metal machines.

DockNimbus turns heterogeneous bare metal machines (Raspberry Pi 4/5, x86 servers, etc.) into a cloud platform with compute instances (Docker Swarm), Kubernetes clusters (Kind), object storage (MinIO), and load balancers (EasyHAProxy) — all managed through a REST API and CLI.

## Architecture

```
User --> nimbus CLI --> nimbus-api (control plane)
                        |
                        +--> nimbus-agent (on each node)
                        |       ├── Docker daemon
                        |       ├── Kind clusters
                        |       └── WireGuard tunnel
                        |
                        +--> SQLite (state)
                        +--> WireGuard (encrypted mesh)
```

## Quick Start

### 1. Build

```bash
make build        # Build for current platform
make build-all    # Cross-compile for linux/amd64, linux/arm64, darwin/*
```

### 2. Set Up Control Plane

```bash
# On the control plane machine:
sudo bash scripts/setup-controlplane.sh
sudo cp bin/nimbus-api /opt/nimbus/
sudo systemctl start nimbus-api

# Bootstrap admin user
./bin/nimbus bootstrap --api-url https://localhost:8443
```

### 3. Configure CLI

```bash
nimbus configure \
  --api-url https://control-node:8443 \
  --access-key AKID \
  --secret-key SK
```

### 4. Register Nodes

```bash
# On each bare metal machine:
sudo bash scripts/install-agent.sh \
  --api-url https://control-node:8443 \
  --token YOUR_ADMIN_SECRET
sudo cp bin/nimbus-agent /opt/nimbus/
sudo systemctl start nimbus-agent
```

### 5. Use It

```bash
# List registered nodes
nimbus node list

# Create a Docker Swarm group
nimbus swarm create --name production
nimbus swarm add-node --swarm SWARM_ID --node NODE_ID

# Launch a compute instance
nimbus compute run --name web-1 --swarm SWARM_ID --image byjg/static-httpserver --type medium \
  --port 80:8080 --env TITLE=soon --env "MESSAGE=Keep In Touch" --domain web.example.com

# Create a Kubernetes cluster
nimbus eks create-cluster --name dev-k8s --nodes NODE1,NODE2,NODE3
nimbus eks kubeconfig --name dev-k8s > ~/.kube/dev-k8s.yaml

# Create an NFS volume
nimbus volume create --name mydata --node NODE_ID --folder /exports/mydata

# Attach volume to a compute instance
nimbus compute run --name web-1 --swarm SWARM_ID --image byjg/static-httpserver --type medium --volume VOL_ID

# Attach volume to a K8s cluster
nimbus k8s volume attach --cluster CLUSTER_ID --name VOL_ID
nimbus k8s volume detach --cluster CLUSTER_ID --name VOL_ID

# Deploy S3 storage (MinIO)
nimbus s3 create --name main-store --node NODE_ID

# Set edge gateway
nimbus gateway set --node NODE_ID
nimbus gateway status
```

## Components

| Service | Description |
|---------|-------------|
| `nimbus-api` | Control plane REST API server |
| `nimbus-agent` | Node agent (runs on each bare metal machine) |
| `nimbus` | CLI client |

## Instance Types

| Name | CPU | Memory |
|------|-----|--------|
| nano | 0.5 | 256MB |
| micro | 1 | 512MB |
| small | 1 | 1GB |
| medium | 2 | 2GB |
| large | 4 | 4GB |
| xlarge | 8 | 8GB |

## API Endpoints

### Nodes
- `POST /v1/internal/nodes/register` — Agent self-registers (token auth)
- `GET /v1/nodes` — List all nodes
- `GET /v1/nodes/{id}` — Node details
- `POST /v1/nodes/{id}/drain` — Drain workloads
- `DELETE /v1/nodes/{id}` — Deregister node

### Swarm Groups
- `POST /v1/swarms` — Create swarm group
- `GET /v1/swarms` — List swarm groups
- `POST /v1/swarms/{id}/join` — Add node to swarm
- `POST /v1/swarms/{id}/leave` — Remove node from swarm
- `DELETE /v1/swarms/{id}` — Delete swarm group

### Compute (EC2-like)
- `POST /v1/compute/instances` — Create instance
- `GET /v1/compute/instances` — List instances
- `GET /v1/compute/instances/{id}` — Describe instance
- `DELETE /v1/compute/instances/{id}` — Terminate instance
- `POST /v1/compute/instances/{id}/stop` — Stop instance
- `POST /v1/compute/instances/{id}/start` — Start instance
- `GET /v1/compute/instance-types` — List instance types

### Kubernetes (EKS-like)
- `POST /v1/kubernetes/clusters` — Create Kind cluster
- `GET /v1/kubernetes/clusters` — List clusters
- `GET /v1/kubernetes/clusters/{id}` — Describe cluster
- `DELETE /v1/kubernetes/clusters/{id}` — Delete cluster
- `GET /v1/kubernetes/clusters/{id}/kubeconfig` — Get kubeconfig

### S3 (S3-compatible storage)
- `POST /v1/s3/instances` — Deploy MinIO instance
- `GET /v1/s3/instances` — List instances
- `DELETE /v1/s3/instances/{id}` — Remove instance

### Volumes (NFS)
- `POST /v1/volumes` — Create NFS volume
- `GET /v1/volumes` — List volumes
- `GET /v1/volumes/{id}` — Get volume details
- `DELETE /v1/volumes/{id}` — Delete volume (rejects if attachments exist)
- `POST /v1/kubernetes/clusters/{id}/volumes` — Attach volume to K8s cluster
- `DELETE /v1/kubernetes/clusters/{id}/volumes/{volumeId}` — Detach volume from cluster

### Gateway / Load Balancer
- `POST /v1/gateway/set` — Designate gateway node
- `GET /v1/gateway` — Gateway status + routing table
- `GET /v1/loadbalancers` — List all EasyHAProxy instances

### IAM
- `POST /v1/iam/users` — Create user
- `POST /v1/iam/users/{id}/keys` — Generate API key pair

## Configuration

### API Server (`configs/api.yaml`)
```yaml
listen: ":8443"
db_path: "nimbus.db"
admin_secret_key: "change-me"
wireguard_subnet: "10.10.0.0/16"
cloudflare_token: ""
cloudflare_zone: ""
```

### Agent (`configs/agent.yaml`)
```yaml
api_url: "https://control-node:8443"
node_token: "your-token"
heartbeat_interval_sec: 10
wireguard_port: 51820
```

## Technology Stack

- **Go** — Single binary, ARM64+x86 cross-compile
- **Docker Swarm** — Compute clustering
- **Kind** — Kubernetes clusters backed by Docker
- **MinIO** — S3-compatible object storage
- **EasyHAProxy** — Docker-native load balancing
- **WireGuard** — Encrypted mesh networking
- **SQLite (WAL)** — Embedded state store
- **chi** — HTTP router
- **cobra** — CLI framework
