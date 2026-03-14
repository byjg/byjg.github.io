# IP Interaction Map

This document maps every place in the codebase where an IP address is chosen for network communication.

## Design Principle

All inter-node traffic flows through the **WireGuard overlay network** (`10.10.0.0/16`). This means Docker Swarm gossip/Raft, K3s API/kubelet, NFS mounts, and S3 endpoints are all encrypted in transit via WireGuard tunnels — never sent in the clear over public IPs.

Public IPs are only used where traffic **must** originate or terminate outside the WireGuard network: the WireGuard UDP endpoints themselves, DNS responses for developer machines, Cloudflare records, and agent registration.

```
Developer machine (not on WireGuard)
    │
    │  DNS query → dnsmasq returns PUBLIC IP
    │  HTTP :80  → EasyHAProxy (binds 0.0.0.0)
    │
    ▼
┌──────────── Node A (public: 10.108.0.3, overlay: 10.10.0.1) ────────────┐
│  WireGuard wg-nimbus ◄──── UDP endpoint = PUBLIC IP                      │
│       │                                                                   │
│       │ overlay tunnel                                                    │
│       ▼                                                                   │
│  Docker Swarm / K3s / NFS ──── all traffic on OVERLAY IPs ──────────►    │
└──────────────────────────────────────────────────────────────────────┬────┘
                                                                      │
                                                          WireGuard tunnel
                                                          (encrypted UDP)
                                                                      │
┌──────────── Node B (public: 10.108.0.4, overlay: 10.10.0.2) ───────┴────┐
│  WireGuard wg-nimbus ◄──── UDP endpoint = PUBLIC IP                      │
│       │                                                                   │
│       │ overlay tunnel                                                    │
│       ▼                                                                   │
│  Docker Swarm / K3s / NFS ──── all traffic on OVERLAY IPs                │
└──────────────────────────────────────────────────────────────────────────┘
```

## Legend

- **PUBLIC** = `node.IPAddress` (e.g., `10.108.0.4`) — the node's real/public IP
- **OVERLAY** = `nodeOverlayIP()` / `node.WireGuardIP` (e.g., `10.10.0.1`) — WireGuard tunnel IP

---

## WireGuard Layer

| Where | IP Used | Who Connects | Notes |
|---|---|---|---|
| `handlers.go:104` — WireGuard peer `Endpoint` | **PUBLIC** | Other nodes' WG clients (external UDP) | Must be routable from the internet |
| `handlers.go:106` — WireGuard peer `AllowedIP` | **OVERLAY** | Internal tunnel routing | IP range accessible through the tunnel |
| `handlers.go:119` — WireGuard config `Address` | **OVERLAY** | Node's own interface | Assigned overlay IP |

## Docker Swarm

All Docker Swarm communication (gossip protocol, Raft consensus, service mesh, overlay networking) travels over the **WireGuard overlay**. The swarm is initialized with `--advertise-addr` set to the overlay IP, so all inter-node swarm traffic is encrypted via WireGuard.

| Where | IP Used | Who Connects | Notes |
|---|---|---|---|
| `swarm.go:113` — `swarm init --advertise-addr` | **OVERLAY** | Swarm nodes (gossip, Raft on :2377) | All swarm mesh traffic uses this address |
| `swarm.go:135` — `swarm join` manager IP | **OVERLAY** | Worker nodes joining swarm | `docker swarm join overlay:2377` |
| `swarm.go:149,153` — `setup_local_dns` manager IP | **OVERLAY** | Agent nodes (DNS on swarm nodes) | Nodes are on WireGuard, so overlay is reachable |
| `swarm.go:322` — `deploy_swarm_dnsmasq` response IP | **PUBLIC** | External host/developer machine | Host is NOT on WireGuard, needs public IP |

### Docker Swarm — Exposed Ports

Published ports (`-p`) bind on `0.0.0.0` (all interfaces), so they are reachable via both public and overlay IPs.

| Where | Port | Who Connects | Notes |
|---|---|---|---|
| `executor.go:440` — EasyHAProxy `-p 80:80` | `0.0.0.0:80` | External clients via public IP | HTTP load balancer |
| `executor.go:441` — EasyHAProxy `-p 443:443` | `0.0.0.0:443` | External clients via public IP | HTTPS load balancer |
| `executor.go:470` — dnsmasq `-p 5053:53` | `0.0.0.0:5053` | DNS queries (via iptables DNAT) | Wildcard DNS for swarm domains |

## Kubernetes (K3s)

All K3s inter-node communication (kubelet, etcd, agent join) travels over the **WireGuard overlay**. `--node-ip` and `--server` are set to overlay IPs.

The **kubeconfig endpoint** (what `kubectl` connects to) is configurable via `kubeconfig_endpoint` in `api.yaml`:
- `"public"` (default) — node's public IP, works from any machine
- `"overlay"` — WireGuard IP, only works from other nodes
- `"<ip>"` — a specific IP or hostname (e.g., a load balancer)

The K3s TLS certificate includes both the overlay IP and the kubeconfig endpoint IP via `--tls-san`, so the cert is valid for both internal and external access.

| Where | IP Used | Who Connects | Notes |
|---|---|---|---|
| `kubernetes.go:80` — `k3s server --node-ip` | **OVERLAY** | Workers (inter-node) | K3s listens on overlay for cluster traffic |
| `kubernetes.go:80` — `k3s server --tls-san` | **OVERLAY + KUBECONFIG** | Both | Cert valid for both IPs |
| `kubernetes.go:223` — `k3s agent --server` URL | **OVERLAY** | Worker to control plane | `https://overlay:6443` |
| `kubernetes.go:227` — `k3s agent --node-ip` | **OVERLAY** | Control plane to worker | kubelet address |
| `nodes.go:504` — worker `--node-ip` (from init complete) | **OVERLAY** | Control plane to worker | Same as above |
| `executor.go` — kubeconfig server address | **KUBECONFIG** | kubectl (external) | Configurable via `kubeconfig_endpoint` |

### K3s — Exposed Ports

| Where | Port | Who Connects | Notes |
|---|---|---|---|
| K3s API server | `:6443` | Workers + kubectl | Listens on all interfaces; cert covers both IPs |
| K3s EasyHAProxy (HelmChart) | `:80`, `:443` | External clients | Deployed via Helm CRD, hostNetwork |

## NFS Volumes

NFS traffic between nodes uses the **WireGuard overlay**, so volume data is encrypted in transit.

| Where | IP Used | Who Connects | Notes |
|---|---|---|---|
| `volume.go:39` — NFS server IP stored in DB | **OVERLAY** | Other nodes mounting NFS | Stored as `vol.ServerIP` |
| `compute.go:133` — NFS mount in `create_service` | **OVERLAY** | Docker containers (cross-node) | `addr=overlay,rw,nolock,soft` |
| `compute.go:474` — NFS mount in `instance_mount_add` | **OVERLAY** | Docker containers (cross-node) | Same as above |

## S3 (MinIO)

| Where | IP Used | Who Connects | Notes |
|---|---|---|---|
| `s3.go:61` — S3 endpoint URL | **OVERLAY** | Internal agents/containers | `http://overlay:9000` |

## Cloudflare DNS

| Where | IP Used | Who Connects | Notes |
|---|---|---|---|
| `compute.go:190` — Cloudflare A record | **PUBLIC** | Internet DNS queries | External-facing DNS, must be public |

## CLI DNS Setup (host machine)

The host machine running `nimbus dns setup` is **not** on the WireGuard network, so it must use the public IP to reach dnsmasq on the manager node.

| Where | IP Used | Who Connects | Notes |
|---|---|---|---|
| `main.go:584` — `resolvectl dns` target | **PUBLIC** | Host's systemd-resolved | Host is not on WireGuard |
| `main.go:591` — iptables DNAT `53->5053` | **PUBLIC** | Host DNS queries | Redirects to dnsmasq |

## Agent Registration

| Where | IP Used | Who Connects | Notes |
|---|---|---|---|
| `main.go:315` — agent `advertise_ip` config | **PUBLIC** | Agent to API server | How the API knows the node's public IP |

---

## Summary

| Traffic Type | IP Type | Encrypted? | Examples |
|---|---|---|---|
| Node-to-node | **OVERLAY** | Yes (WireGuard) | Swarm gossip/Raft, K3s API/kubelet, NFS mounts, S3, agent-side DNS |
| External-facing | **PUBLIC** | No (plain) | WG endpoints, dnsmasq responses, Cloudflare, CLI DNS, agent registration |
| Published ports | **0.0.0.0** | No (plain) | EasyHAProxy :80/:443, dnsmasq :5053 |
