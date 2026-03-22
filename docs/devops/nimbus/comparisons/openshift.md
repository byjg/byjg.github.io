## DockNimbus vs Red Hat OpenShift

These are closer in ambition — both are platforms — but differ massively in scope, complexity, and target audience:

| | **DockNimbus** | **OpenShift** |
|---|---|---|
| **What it is** | Lightweight self-hosted cloud platform | Enterprise Kubernetes platform (Red Hat) |
| **Based on** | Docker Swarm + K3s | Full Kubernetes (OKD/OCP) + CRI-O |
| **Target audience** | Homelabbers, small teams, edge/IoT | Enterprise teams, regulated industries |
| **Target hardware** | Raspberry Pis, mixed ARM/x86 bare metal | Datacenter servers, cloud VMs (min 3 masters) |
| **Minimum footprint** | Single node, ~256MB RAM | 3 control plane nodes, ~16GB RAM each |
| **Installation** | SSH into nodes, auto-installs agent | Complex installer (IPI/UPI), CoreOS-based |
| **Networking** | WireGuard mesh, EasyHAProxy, dnsmasq | OpenShift SDN/OVN-Kubernetes, HAProxy Router |
| **Storage** | NFS volumes, MinIO S3 | CSI drivers, OCS/ODF (Ceph), PVs/PVCs |
| **IaC** | Built-in YAML manifests with drift detection | Native Kubernetes YAML + Operators + Helm + ArgoCD |
| **CI/CD** | Not included | Built-in (OpenShift Pipelines/Tekton, GitOps) |
| **Container registry** | Not included | Built-in integrated registry |
| **Developer experience** | CLI + manifest files | Web console, CLI (oc), developer catalog, S2I |
| **Service mesh** | Not included | OpenShift Service Mesh (Istio-based) |
| **Monitoring** | Heartbeat + basic metrics | Prometheus, Grafana, AlertManager built-in |
| **Logging** | Not included | EFK/Loki stack integrated |
| **Auth** | HMAC + JWT + mTLS | OAuth, LDAP, OIDC, RBAC, SCC, multi-tenancy |
| **Multi-tenancy** | Multi-user with API keys | Full namespace isolation, quotas, network policies |
| **Operator framework** | Not included | Operator Lifecycle Manager (OLM), OperatorHub |
| **Updates** | Manual binary replacement | Over-the-air cluster updates (OTA) |
| **Cost** | Free / open source | Free (OKD) or paid subscription (OCP) |
| **Complexity** | Simple — learn in an afternoon | Steep learning curve, dedicated platform team |
| **State management** | SQLite | etcd (distributed) |
| **Written in** | Go (single binary) | Go (many components) |

### When to use which

**DockNimbus** — You have bare metal (especially low-power or mixed-architecture hardware), want to go from zero to running workloads fast, and don't need enterprise features like service mesh, integrated CI/CD, or operator lifecycle management. You value simplicity and low overhead.

**OpenShift** — You're in an enterprise environment that needs full Kubernetes with guardrails: built-in CI/CD, monitoring, logging, security policies, multi-tenancy, compliance tooling, and vendor support. You have the hardware and team to run it.

### Key philosophical difference

- **OpenShift** is a *full enterprise platform* — it bundles everything (CI/CD, monitoring, logging, registry, service mesh, operators) but demands significant resources and expertise to run
- **DockNimbus** is a *lightweight cloud builder* — it gives you the core primitives (compute, storage, networking, orchestration) with minimal overhead and lets you add what you need on top

OpenShift is what you'd use if you're replacing a team's cloud infrastructure at scale. DockNimbus is what you'd use if you want to turn a shelf of Raspberry Pis and a couple old servers into your own cloud without reading 500 pages of docs.
