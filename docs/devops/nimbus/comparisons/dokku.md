## DockNimbus vs Dokku

Both simplify self-hosted deployments, but at completely different levels:

| | **DockNimbus** | **Dokku** |
|---|---|---|
| **What it is** | Self-hosted cloud platform | Self-hosted PaaS (mini-Heroku) |
| **Deploy model** | Docker images via CLI/manifest | `git push` (buildpacks or Dockerfile) |
| **Abstraction** | Infrastructure-level (nodes, clusters, networking) | App-level (just push code, platform handles the rest) |
| **Multi-node** | Built-in (multi-node clusters) | Single-node only (no clustering) |
| **Node provisioning** | Automated via SSH | Not applicable — runs on one server |
| **Networking** | WireGuard mesh, EasyHAProxy, dnsmasq | Nginx reverse proxy, Let's Encrypt built-in |
| **Storage** | NFS volumes, MinIO S3 | Plugin-based (postgres, redis, etc. as services) |
| **Databases** | Not included (deploy as containers) | First-class plugins (postgres, mysql, redis, mongo) |
| **SSL/TLS** | Self-signed or custom certs | Automatic Let's Encrypt |
| **IaC** | YAML manifests for full infrastructure | App config via CLI, no full IaC |
| **Buildpacks** | Not included (bring your own image) | Heroku buildpacks + Dockerfile + Cloud Native Buildpacks |
| **Scaling** | Replicas via Swarm/K3s across nodes | Process scaling on single host (`dokku ps:scale`) |
| **Zero-downtime deploy** | Via Swarm rolling updates | Built-in zero-downtime checks |
| **App lifecycle** | Manual (deploy, update, remove) | Full lifecycle (deploy, rollback, maintenance mode) |
| **Review apps** | Not included | Not built-in (but possible with plugins) |
| **Cron jobs** | Not included | Built-in (`dokku cron`) |
| **Logs** | Not included | `dokku logs` per app |
| **ARM support** | First-class | Supported |
| **Minimum resources** | Single RPi, ~256MB RAM | Single server, ~1GB RAM |
| **Target audience** | Infra-minded homelabbers, small teams | Developers who want Heroku-style deploys |

### When to use which

**DockNimbus** — You're managing multiple machines and need infrastructure orchestration: clusters, encrypted networking, shared storage, multi-node workloads. You think in terms of infrastructure.

**Dokku** — You have a single server and want to deploy web apps with `git push`. You want managed databases as plugins, automatic SSL, and a Heroku-like developer experience. You think in terms of apps.

### Key philosophical difference

- **Dokku** is a *developer platform* — push code, get a running app with a URL and SSL
- **DockNimbus** is an *infrastructure platform* — provision machines, build clusters, deploy workloads

Dokku is for developers who don't want to think about infrastructure. DockNimbus is for people who want to build the infrastructure itself.
