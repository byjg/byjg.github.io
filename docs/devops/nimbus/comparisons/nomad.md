## DockNimbus vs HashiCorp Nomad

The closest architectural peer — both are lightweight orchestrators, but with different philosophies:

| | **DockNimbus** | **Nomad** |
|---|---|---|
| **What it is** | Self-hosted cloud platform | Workload orchestrator |
| **Workloads** | Docker containers, K3s pods, Compose stacks | Containers, VMs, binaries, Java, raw exec |
| **Scope** | Full stack (node provisioning → workloads) | Orchestration only (assumes nodes exist) |
| **Node provisioning** | Built-in via SSH | Not included — needs Packer, Terraform, etc. |
| **Networking** | WireGuard mesh, EasyHAProxy, dnsmasq | Consul Connect (service mesh), no built-in LB |
| **Service discovery** | Built-in DNS | Requires Consul (separate tool) |
| **Secrets** | Not included | Requires Vault (separate tool) |
| **Storage** | NFS volumes, MinIO S3 built-in | CSI plugins, host volumes |
| **IaC** | YAML manifests (nodes → clusters → workloads) | HCL job specs (workloads only) |
| **Cluster model** | Central API + agents (hub-spoke) | Server + client nodes (Raft consensus) |
| **Multi-region** | Not built-in | Native multi-region federation |
| **Scheduling** | Swarm/K3s handles it | Sophisticated bin-packing, affinity, constraints, preemption |
| **Batch jobs** | Not supported | First-class (parameterized, periodic, dispatch) |
| **Non-container workloads** | No (containers only) | Yes — raw binaries, Java JARs, QEMU VMs |
| **Web UI** | None | Built-in |
| **ARM support** | First-class (RPi + x86 mixed) | Supported but not a focus |
| **Ecosystem dependency** | Self-contained | Best with Consul + Vault (the "HashiStack") |
| **Learning curve** | Hours | Days (more with Consul + Vault) |
| **Minimum resources** | Single RPi, ~256MB RAM | Single node, ~256MB RAM |
| **License** | Open source | BSL 1.1 (source-available, not fully open) |

### When to use which

**DockNimbus** — You want a single tool that handles everything from bare metal provisioning to running workloads. You don't want to assemble a stack of tools. Your workloads are containers.

**Nomad** — You need to orchestrate diverse workload types (not just containers), want sophisticated scheduling (bin-packing, preemption, batch jobs), or need multi-region federation. You're okay adding Consul and Vault for networking and secrets.

### Key philosophical difference

- **Nomad** is a *single-purpose orchestrator* — does one thing well but needs friends (Consul, Vault, Terraform) for a complete platform
- **DockNimbus** is an *all-in-one platform* — less powerful scheduling, but everything is integrated out of the box

Nomad is a better orchestrator. DockNimbus is a better "zero to platform" experience.
