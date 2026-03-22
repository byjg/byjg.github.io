## DockNimbus vs CapRover

Similar to the Dokku comparison but CapRover adds clustering and a web UI:

| | **DockNimbus** | **CapRover** |
|---|---|---|
| **What it is** | Self-hosted cloud platform | Self-hosted PaaS on Docker Swarm |
| **Built on** | Docker Swarm + K3s | Docker Swarm |
| **Primary interface** | CLI + YAML manifests | Web UI + CLI |
| **Deploy model** | Docker images via CLI/manifest | Web UI upload, `git push`, Dockerfile, or image |
| **Multi-node** | Full multi-node with WireGuard mesh | Multi-node via Docker Swarm (manual join) |
| **Node provisioning** | Automated via SSH (installs everything) | Manual — install Docker + join Swarm yourself |
| **Networking** | WireGuard mesh, EasyHAProxy, dnsmasq | Docker Swarm overlay, Nginx, Let's Encrypt |
| **SSL/TLS** | Self-signed or custom certs | Automatic Let's Encrypt (one-click) |
| **Storage** | NFS volumes, MinIO S3 built-in | Docker volumes only |
| **Kubernetes** | K3s clusters built-in | Not supported |
| **IaC** | Built-in YAML manifests with drift detection | Not included — all via UI/CLI |
| **One-click apps** | Not included | App store with 100+ templates (WordPress, Postgres, etc.) |
| **Databases** | Deploy as containers manually | One-click deploy from app store |
| **Persistent apps** | Via NFS/S3 | Docker volumes (single-node persistence) |
| **Compose support** | Full Docker Compose via services | Not supported (single-container apps) |
| **Auth** | Multi-user IAM (HMAC + JWT + mTLS) | Single admin password |
| **Monitoring** | Basic heartbeat + metrics | NetData integration (optional) |
| **ARM support** | First-class (RPi + x86 mixed) | Limited |
| **Minimum resources** | Single RPi, ~256MB RAM | Single server, ~1GB RAM |
| **License** | Open source | Open source (Apache 2.0) |

### When to use which

**DockNimbus** — You want full control over infrastructure: encrypted networking, K8s clusters, NFS storage, multi-user access, and declarative IaC. You prefer CLI and manifests over a web UI.

**CapRover** — You want the easiest path to self-hosting web apps with a nice UI, one-click app templates, automatic SSL, and don't need Kubernetes or advanced networking. Think "self-hosted Heroku with a dashboard."

### Key philosophical difference

- **CapRover** is a *self-hosted app store* — browse templates, click deploy, get SSL. Optimized for ease of use
- **DockNimbus** is a *self-hosted cloud builder* — define your infrastructure as code, manage heterogeneous hardware, build clusters

CapRover wins on time-to-first-app. DockNimbus wins on infrastructure depth and control.
