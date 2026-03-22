## DockNimbus vs Coolify

Coolify is the modern self-hosted PaaS that's been gaining a lot of traction:

| | **DockNimbus** | **Coolify** |
|---|---|---|
| **What it is** | Self-hosted cloud platform | Self-hosted PaaS (Vercel/Netlify/Heroku alternative) |
| **Primary interface** | CLI + YAML manifests | Web UI (polished, modern) |
| **Deploy model** | Docker images via CLI/manifest | Git push, Dockerfile, Docker Compose, Nixpacks |
| **Scope** | Full stack: node provisioning → networking → workloads | App deployment + managed services on servers |
| **Multi-node** | Full multi-node clusters with WireGuard mesh | Multi-server via SSH (no clustering) |
| **Node provisioning** | Automated via SSH (installs agent, Docker, WireGuard) | Connects to servers via SSH (installs Docker) |
| **Networking** | WireGuard mesh VPN, EasyHAProxy, dnsmasq | Traefik reverse proxy, automatic SSL |
| **SSL/TLS** | Self-signed or custom certs | Automatic Let's Encrypt |
| **Storage** | NFS volumes, MinIO S3 built-in | Docker volumes, S3 backups |
| **Databases** | Deploy as containers manually | One-click managed databases (Postgres, MySQL, Redis, MongoDB, etc.) |
| **Kubernetes** | K3s clusters built-in | Not supported |
| **Docker Swarm** | Built-in cluster orchestration | Docker standalone (no Swarm) |
| **IaC** | Built-in YAML manifests with drift detection | API-driven, no declarative IaC |
| **Buildpacks** | Not included (bring your own image) | Nixpacks, Dockerfile, Docker Compose |
| **Preview deployments** | Not included | Pull request preview deployments |
| **Webhooks** | Not included | GitHub/GitLab/Bitbucket webhooks for auto-deploy |
| **Notifications** | Not included | Slack, Discord, email, Telegram, etc. |
| **Monitoring** | Basic heartbeat + metrics | Server monitoring dashboard |
| **Backups** | Not included | Scheduled database backups to S3 |
| **Auth** | Multi-user IAM (HMAC + JWT + mTLS) | Multi-user with teams |
| **ARM support** | First-class (RPi + x86 mixed) | Supported |
| **Minimum resources** | Single RPi, ~256MB RAM | 2 CPUs, 2GB RAM |
| **Written in** | Go (single binary) | PHP/Laravel + Node.js |
| **License** | Open source | Open source (Apache 2.0) |
| **Cost** | Free | Free (self-hosted) or paid cloud version |

### When to use which

**DockNimbus** — You want to build and manage infrastructure: clusters, encrypted mesh networking, shared storage, Kubernetes. You care about the infrastructure layer and want declarative IaC for everything.

**Coolify** — You want to deploy web apps, databases, and services with a beautiful UI, automatic SSL, git-based deployments, preview environments, and database backups. You don't want to think about clusters or networking.

### Key philosophical difference

- **Coolify** replaces *cloud PaaS products* (Vercel, Heroku, Railway) — it's about shipping apps fast with a great developer experience
- **DockNimbus** replaces *cloud infrastructure* (AWS EC2, networking, storage) — it's about building the platform that apps run on

Coolify is what you use when you want to self-host your apps. DockNimbus is what you use when you want to self-host your cloud.
