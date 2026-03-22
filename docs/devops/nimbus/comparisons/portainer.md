## DockNimbus vs Portainer

Both make Docker easier to manage, but at different scopes:

| | **DockNimbus** | **Portainer** |
|---|---|---|
| **What it is** | Self-hosted cloud platform | Container management UI |
| **Primary interface** | CLI + YAML manifests | Web UI (primary), API |
| **Scope** | Full stack: node provisioning → networking → workloads | Manages existing Docker/Swarm/K8s environments |
| **Node provisioning** | Built-in via SSH | Not included — Docker must already be installed |
| **Cluster creation** | Creates Docker Swarm + K3s clusters | Connects to existing clusters |
| **Networking** | WireGuard mesh VPN, EasyHAProxy, dnsmasq | Uses Docker/K8s networking as-is |
| **Storage** | NFS volumes, MinIO S3 built-in | Manages existing Docker volumes |
| **IaC** | Built-in YAML manifests with drift detection | Stacks (Compose files) via UI, no full IaC |
| **Compose support** | Deploy via `nimbus service` commands/manifests | Deploy Compose stacks via web UI |
| **K8s support** | Creates and manages K3s clusters | Connects to existing K8s, deploys via UI |
| **App templates** | Not included | Built-in app template catalog |
| **RBAC** | Multi-user with API keys/JWT | Teams, roles, endpoint access control |
| **Edge computing** | WireGuard mesh for remote nodes | Portainer Edge Agent for remote environments |
| **Registry management** | Not included | Connect multiple container registries via UI |
| **GitOps** | Not included | Git-based stack deployments |
| **Web terminal** | Not included | Container console access in browser |
| **ARM support** | First-class (RPi + x86 mixed) | Supported |
| **Minimum resources** | Single RPi, ~256MB RAM | Single node, ~512MB RAM |
| **Cost** | Free | Free (CE) or paid (Business Edition) |
| **Target audience** | Homelabbers, small teams wanting IaC | Teams wanting a visual Docker/K8s management layer |

### When to use which

**DockNimbus** — You want to build infrastructure from scratch on bare metal, prefer CLI and declarative manifests, and need integrated networking (WireGuard) and storage (NFS/S3). You're comfortable without a web UI.

**Portainer** — You already have Docker or Kubernetes running and want a web UI to manage containers, stacks, and images. Your team prefers clicking over typing. You want app templates and registry browsing.

### Key philosophical difference

- **Portainer** is a *window into existing infrastructure* — it makes what you already have easier to see and manage
- **DockNimbus** *builds the infrastructure* — it takes bare machines and creates the platform from scratch

Portainer is a UI layer. DockNimbus is a platform builder. You could theoretically run Portainer on top of a DockNimbus-managed Swarm for the best of both worlds.
