---
sidebar_position: 1
---

# Comparisons

How DockNimbus compares to other tools and platforms in the self-hosted and cloud-native ecosystem.

## At a glance

| Platform | Category | Key difference from DockNimbus |
|----------|----------|---------------------------|
| [Canonical LXD](lxd) | System container/VM manager | Manages machines, not infrastructure |
| [OpenShift](openshift) | Enterprise Kubernetes platform | Full enterprise stack, heavy resource requirements |
| [Kubernetes](kubernetes) | Container orchestration | One layer of the stack; DockNimbus is the whole stack |
| [Proxmox VE](proxmox) | Hypervisor | VM-level abstraction, x86 only |
| [Nomad](nomad) | Workload orchestrator | Better scheduler, but needs Consul + Vault for a full platform |
| [Rancher](rancher) | Multi-cluster K8s management | K8s management plane, not a bare-metal-to-workload platform |
| [Portainer](portainer) | Container management UI | UI layer for existing infrastructure, doesn't build it |
| [Dokku](dokku) | Self-hosted PaaS | Single-node, app-level abstraction (git push to deploy) |
| [CapRover](caprover) | Self-hosted PaaS | App store experience, no IaC or advanced networking |
| [Coolify](coolify) | Self-hosted PaaS | Modern developer UX, no clustering or mesh networking |
| [MicroCloud](microcloud) | Small-scale private cloud | Mini private cloud (LXD + Ceph + OVN), requires 3+ x86 nodes |

## Where DockNimbus fits

DockNimbus occupies a unique position: it's a **bare-metal-to-workload platform** for heterogeneous hardware. Most tools either operate at a higher level (PaaS — deploy apps) or a lower level (hypervisors — manage VMs). DockNimbus bridges the gap by taking raw machines and turning them into a managed cloud with orchestration, networking, and storage built in.

```
Higher abstraction (app-focused)
  ┌─────────────────────────────┐
  │  Coolify, Dokku, CapRover   │  ← Push code, get a running app
  ├─────────────────────────────┤
  │  OpenShift, Rancher          │  ← Manage Kubernetes at scale
  ├─────────────────────────────┤
  │  ★ DockNimbus                │  ← Bare metal → clusters → workloads
  ├─────────────────────────────┤
  │  Kubernetes, Nomad, Swarm    │  ← Orchestrate containers on a cluster
  ├─────────────────────────────┤
  │  Proxmox, LXD, MicroCloud    │  ← Manage VMs / system containers
  └─────────────────────────────┘
Lower abstraction (machine-focused)
```
