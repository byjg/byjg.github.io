## DockNimbus vs Rancher

Both manage Kubernetes clusters, but from very different angles:

| | **DockNimbus** | **Rancher** |
|---|---|---|
| **What it is** | Self-hosted cloud platform | Multi-cluster Kubernetes management platform |
| **Focus** | Full stack: bare metal → workloads | Kubernetes lifecycle & multi-cluster ops |
| **UI** | CLI only | Full web UI (primary interface) |
| **Cluster creation** | K3s + Docker Swarm via CLI/manifest | RKE, RKE2, K3s, imported clusters, cloud-hosted (EKS/GKE/AKS) |
| **Node provisioning** | Built-in via SSH (installs agent, Docker, WireGuard) | Node drivers for cloud providers; manual for bare metal |
| **Non-K8s workloads** | Docker Swarm services, Compose stacks | Kubernetes only |
| **Networking** | WireGuard mesh, EasyHAProxy, dnsmasq | Delegates to CNI (Canal, Calico, Cilium) |
| **Storage** | NFS volumes, MinIO S3 built-in | Longhorn (optional), CSI drivers |
| **IaC** | Built-in YAML manifests (full stack) | Not built-in — use Terraform provider or Fleet |
| **GitOps** | Not included | Fleet (built-in), integrates with ArgoCD |
| **App catalog** | Not included | Helm chart catalog in UI |
| **Multi-cluster** | Manage multiple Swarms + K8s from one CLI | Core feature — centralized management of 100s of clusters |
| **RBAC** | Multi-user with API keys/JWT | Full K8s RBAC + Rancher roles, LDAP/AD/SAML |
| **Monitoring** | Basic heartbeat + metrics | Prometheus + Grafana stack (one-click install) |
| **Logging** | Not included | Integrated logging (Fluentd/Fluentbit) |
| **Backup** | Not included | Backup/restore via Velero integration |
| **Cluster upgrades** | Manual | Managed K8s version upgrades through UI |
| **Cloud integration** | None (bare metal focused) | AWS, GCP, Azure, vSphere, DO |
| **ARM support** | First-class (RPi + x86 mixed) | Supported (K3s/RKE2) |
| **Minimum resources** | Single RPi, ~256MB RAM | 4GB+ RAM for Rancher server |
| **Architecture** | Go single binary (API + agent + CLI) | Rancher server (runs on K8s itself) |
| **License** | Open source | Open source (Apache 2.0) |

### When to use which

**DockNimbus** — You want a lightweight, CLI-driven platform that handles everything from SSH-ing into bare metal to running containers. You don't need a web UI or multi-cloud support. Your clusters are small and your hardware is diverse.

**Rancher** — You're managing multiple Kubernetes clusters (on-prem, cloud, or hybrid), want a web UI for ops teams, need app catalogs, GitOps (Fleet), monitoring, and enterprise auth (LDAP/SAML). You're already invested in the Kubernetes ecosystem.

### Key philosophical difference

- **Rancher** is a *Kubernetes management plane* — it assumes K8s is your runtime and gives you tools to manage many clusters at scale
- **DockNimbus** is a *bare-metal-to-workload platform* — it doesn't assume anything exists yet and builds the whole stack for you

Rancher is for teams that already live in Kubernetes. DockNimbus is for people who want to avoid the Kubernetes complexity tax for simpler use cases.
