## DockNimbus vs Proxmox VE

Both target self-hosters, but they work at different layers:

| | **DockNimbus** | **Proxmox VE** |
|---|---|---|
| **What it is** | Self-hosted cloud platform / IaC orchestrator | Hypervisor & virtualization management platform |
| **Workloads** | Docker containers, K3s pods, Compose stacks | Full VMs (KVM) + system containers (LXC) |
| **Abstraction** | Platform-level (manages infra + workloads) | Hypervisor-level (manages VMs/containers on hosts) |
| **Target audience** | Homelabbers, small teams, edge/IoT | Homelabbers, SMBs, enterprises |
| **UI** | CLI only | Full web UI + CLI |
| **Cluster model** | Central API + per-node agents | Peer cluster (Corosync) |
| **Node provisioning** | Automated via SSH | Manual Proxmox installation on each node |
| **Networking** | WireGuard mesh, EasyHAProxy, dnsmasq | Linux bridges, VLANs, OVS, SDN |
| **Storage** | NFS volumes, MinIO S3 | ZFS, Ceph, LVM, NFS, iSCSI, GlusterFS |
| **IaC** | Built-in YAML manifests | Not built-in — needs Terraform provider or Ansible |
| **Container orchestration** | Docker Swarm + K3s built-in | None — LXC containers are standalone |
| **Live migration** | Not supported | VM live migration between nodes |
| **Backup** | Not included | Built-in (vzdump) + Proxmox Backup Server |
| **HA** | Service replicas via Swarm/K3s | VM HA via fencing + automatic restart |
| **GPU passthrough** | Not supported | Full PCIe/GPU passthrough |
| **Snapshots** | Not included | VM/container snapshots |
| **Minimum resources** | Single RPi, ~256MB RAM | x86 server, ~2GB RAM (no ARM support) |
| **ARM support** | First-class (RPi + x86 mixed) | x86 only |
| **Cost** | Free | Free (community) or paid subscription |
| **Base OS** | Any Linux with SSH | Proxmox's Debian-based OS (replaces your OS) |

### When to use which

**DockNimbus** — You want to deploy containerized applications across heterogeneous hardware (especially ARM) with minimal setup. You think in terms of services and workloads, not VMs.

**Proxmox** — You want full virtualization: run Windows VMs, pass through GPUs, snapshot and migrate VMs, or need workload isolation at the hypervisor level. You have x86 hardware and want a web UI.

### Key philosophical difference

- **Proxmox** gives you *virtual machines* — you still need to set up everything inside them
- **DockNimbus** gives you a *running platform* — workloads deploy directly without an intermediate VM layer

They're actually very complementary: many people run Docker/K8s inside Proxmox VMs. DockNimbus cuts out that middle layer and goes straight from bare metal to workloads.
