## DockNimbus vs Kubernetes

DockNimbus sits *above* Kubernetes — it can deploy K3s clusters as one of its capabilities, but it's a broader platform:

| | **DockNimbus** | **Kubernetes** |
|---|---|---|
| **What it is** | Self-hosted cloud platform | Container orchestration engine |
| **Scope** | Full stack: nodes, networking, storage, clusters, workloads | Orchestrates containers within an existing cluster |
| **Assumes you have** | Bare metal machines with SSH access | An already-provisioned cluster |
| **Node provisioning** | Built-in — SSH installs agent, Docker, WireGuard | Not included — needs kubeadm, Kubespray, Rancher, etc. |
| **Cluster creation** | `nimbus kubernetes create` or manifest YAML | Manual bootstrapping (kubeadm init, join) |
| **Networking setup** | WireGuard mesh VPN auto-configured between nodes | Requires CNI plugin (Calico, Flannel, Cilium) |
| **Load balancing** | Built-in EasyHAProxy with domain routing | Requires Ingress controller (nginx, Traefik) + external LB |
| **DNS** | Built-in dnsmasq + Cloudflare integration | CoreDNS (cluster-internal only), external DNS separate |
| **Storage** | NFS volumes + MinIO S3 provisioned via CLI/manifest | Requires CSI drivers, PV/PVC configuration, external storage |
| **Non-K8s workloads** | Docker Swarm services, Compose stacks, standalone containers | Kubernetes only |
| **IaC** | Single manifest declares nodes → clusters → workloads | Separate tools needed: Terraform (infra) + Helm/Kustomize (workloads) |
| **State** | Centralized SQLite (single source of truth for everything) | etcd (cluster state only, not infra) |
| **Config complexity** | ~20 line YAML for a full stack | Deployment + Service + Ingress + PVC + ConfigMap + ... |
| **Multi-cluster** | Native — manage multiple Swarms and K8s clusters from one CLI | Needs federation or tools like Rancher, Loft, Admiralty |
| **Monitoring** | Basic heartbeat + hardware metrics | Requires Prometheus/Grafana stack |
| **Security** | mTLS (agents), HMAC/JWT (users), WireGuard (transit) | RBAC, NetworkPolicy, PSA — but cluster must already exist |
| **Learning curve** | Hours | Weeks to months |
| **Minimum resources** | Single RPi, ~256MB RAM | 2GB+ RAM per node (control plane needs more) |
| **Ecosystem** | Opinionated, self-contained | Massive — Helm charts, operators, CRDs, service meshes |
| **Extensibility** | Limited to what DockNimbus provides | Nearly unlimited via CRDs, operators, admission webhooks |

### When to use which

**DockNimbus** — You want to go from bare metal to running workloads without stitching together 5+ tools. You don't need the full Kubernetes ecosystem and its extensibility. You want one CLI and one manifest format for everything from node setup to workload deployment.

**Kubernetes** — You need the full ecosystem: custom operators, CRDs, advanced scheduling (affinity, taints, topology), service mesh, GitOps pipelines, or you're deploying to an environment where K8s is already running (EKS, GKE, AKS). You have the team and time to manage the complexity.

### Key philosophical difference

- **Kubernetes** answers: *"I have a cluster — how do I orchestrate containers on it?"*
- **DockNimbus** answers: *"I have machines — how do I turn them into a working platform?"*

Kubernetes is one layer of the stack. DockNimbus is the whole stack — and it happens to use K3s (or Docker Swarm) as its orchestration layer under the hood.
