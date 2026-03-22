## DockNimbus vs Canonical MicroCloud

Both target small-scale, multi-node self-hosted infrastructure, making this one of the closer comparisons:

| | **DockNimbus** | **MicroCloud** |
|---|---|---|
| **What it is** | Self-hosted cloud platform | Automated small-scale cloud (LXD + Ceph + OVN) |
| **By** | Independent / open source | Canonical |
| **Components** | Single Go binary (API + agent + CLI) | LXD + MicroCeph + MicroOVN (3 snaps) |
| **Workloads** | Docker containers, K3s pods, Compose stacks | System containers (LXC) + VMs (QEMU) |
| **Container model** | Application containers (OCI) | System containers (full OS with init) |
| **Cluster setup** | Central API + SSH-based node provisioning | Interactive `microcloud init` across nodes |
| **Minimum nodes** | 1 | 3 (for Ceph quorum) |
| **Networking** | WireGuard mesh VPN, EasyHAProxy, dnsmasq | OVN (full SDN: virtual switches, routers, ACLs) |
| **Storage** | NFS volumes, MinIO S3 | Ceph (distributed, replicated block/object storage) |
| **Storage resilience** | Single NFS server (no replication) | Ceph replication across nodes (survives node loss) |
| **IaC** | Built-in YAML manifests with drift detection | Not built-in — Terraform provider or cloud-init |
| **Kubernetes** | K3s clusters built-in | Not included (can run K8s inside VMs/containers) |
| **Docker Swarm** | Built-in cluster orchestration | Not included |
| **VM support** | No | Full QEMU/KVM VMs |
| **Live migration** | Not supported | VM and container live migration |
| **Snapshots** | Not included | Container and VM snapshots |
| **Backup** | Not included | Built-in export/backup |
| **GPU passthrough** | Not supported | Supported (PCIe passthrough) |
| **HA** | Service replicas via Swarm/K3s | Distributed Ceph + Dqlite (survives node failures) |
| **Load balancing** | Built-in EasyHAProxy | OVN load balancers |
| **Auth** | Multi-user IAM (HMAC + JWT + mTLS) | TLS client certs, Unix socket |
| **Web UI** | None | None (CLI only, or add Canonical's LXD UI) |
| **ARM support** | First-class (RPi + x86 mixed) | Limited (LXD supports ARM, but Ceph on ARM is niche) |
| **Target hardware** | Raspberry Pis, mixed ARM/x86 | Small x86 servers, NUCs, edge appliances |
| **Target scale** | 1–20+ nodes | 3–50 nodes |
| **Complexity** | Simple — learn in an afternoon | Moderate — need to understand LXD + Ceph + OVN |
| **License** | Open source | Open source (AGPLv3 for LXD) |

### When to use which

**DockNimbus** — You want to deploy containerized applications on heterogeneous hardware (especially ARM), need Docker Swarm or Kubernetes orchestration, and want a single declarative manifest for your entire stack. You don't need VMs or distributed storage replication.

**MicroCloud** — You want a small private cloud that provides VMs and system containers with distributed storage (Ceph) and proper SDN (OVN). You need resilience to node failure, live migration, and workloads that look like full Linux machines. You have at least 3 x86 servers.

### Key philosophical difference

- **MicroCloud** is a *mini private cloud* — it gives you what OpenStack or VMware does, but at a small scale and with zero configuration. Think "3 NUCs become a cloud"
- **DockNimbus** is a *bare-metal-to-app platform* — it skips the VM layer entirely and goes straight from machines to running container workloads

MicroCloud gives you more infrastructure resilience (Ceph replication, live migration). DockNimbus gives you more application-level features (orchestration, IaC, load balancing, mesh networking).
