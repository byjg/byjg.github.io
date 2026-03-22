## DockNimbus vs Canonical LXD

These are fundamentally different tools solving different problems:

| | **DockNimbus** | **Canonical LXD** |
|---|---|---|
| **What it is** | Self-hosted cloud platform / IaC orchestrator | System container & VM manager |
| **Abstraction level** | Platform-level (like a mini AWS/GCP) | Host-level (like a hypervisor) |
| **Workloads** | Docker containers, K3s pods, Compose stacks | System containers (full OS), VMs |
| **Container model** | Application containers (Docker/OCI) | System containers (run full init, feel like VMs) |
| **Cluster model** | Central API server + per-node agents (hub-spoke) | Distributed peer cluster (Raft/Dqlite) |
| **Networking** | WireGuard mesh VPN, EasyHAProxy LB, dnsmasq DNS | OVN, bridged, macvlan, SR-IOV |
| **Storage** | NFS volumes, MinIO S3 | ZFS, Btrfs, LVM, Ceph, CephFS |
| **IaC** | Built-in YAML manifests with idempotent apply, drift detection, pruning | No native IaC; relies on Terraform provider or Juju |
| **Orchestration** | Docker Swarm + K3s built-in | None (manages instances, not orchestration) |
| **State** | Centralized SQLite | Distributed Dqlite across cluster |
| **Auth** | Multi-user IAM (HMAC + JWT + mTLS) | TLS client certs, RBAC (via Canonical RBAC) |
| **Target hardware** | Heterogeneous (RPi + x86 mixed clusters) | Any Linux host, focus on server/cloud |
| **Node setup** | Automated via SSH (installs agent, WireGuard, Docker) | Manual `lxd init` or preseed |
| **Load balancing** | Built-in (EasyHAProxy) | Not included |
| **Written in** | Go (single binary) | Go (snap-packaged) |

### When to use which

**DockNimbus** — You want a turnkey platform that takes bare metal (especially mixed ARM/x86 like Raspberry Pis + servers) and gives you Docker services, Kubernetes clusters, storage, networking, load balancing, and IaC from a single CLI/manifest. It's opinionated and batteries-included.

**LXD** — You want lightweight system containers or VMs that behave like full Linux machines. Great for dev environments, CI runners, or workloads that need a full OS (systemd, SSH, package management inside the container). LXD gives you more control at the infrastructure layer but less out-of-the-box orchestration.

### Key philosophical difference

- **LXD** manages *machines* (containers/VMs that look like servers)
- **DockNimbus** manages *infrastructure* (takes machines and builds a platform on top of them with clustering, networking, storage, and workload orchestration)

They could even be complementary — you could run DockNimbus nodes inside LXD instances if you wanted isolated virtual infrastructure for testing.
