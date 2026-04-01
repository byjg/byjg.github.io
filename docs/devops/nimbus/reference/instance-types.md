---
sidebar_position: 4
sidebar_label: "Instance Types"
title: "Instance Types"
---

# Instance Types

Instance types define the CPU and memory resource limits for compute instances.

| Name | CPU | Memory |
|------|-----|--------|
| `nano` | 0.5 cores | 256 MB |
| `micro` | 1 core | 512 MB |
| `small` | 1 core | 1 GB |
| `medium` | 2 cores | 2 GB |
| `large` | 4 cores | 4 GB |
| `xlarge` | 8 cores | 8 GB |

List available types via CLI:

```bash
nimbus compute instance-types
```

The instance type is set with `--type` when creating a compute instance:

```bash
nimbus compute run --name web --swarm SWARM_ID --image nginx --type medium
```

In manifests, use the `type` field:

```yaml
compute:
  web:
    swarm: prod
    image: nginx
    type: medium
```

## GPU support

GPUs are requested independently from instance types using the `--gpu` flag. Any instance type can be combined with GPU requests:

```bash
nimbus compute run --name ml-train --swarm SWARM_ID \
  --image pytorch/pytorch --type large --gpu 2
```

In manifests, use the `gpu` field:

```yaml
compute:
  ml-train:
    swarm: prod
    image: pytorch/pytorch
    type: large
    gpu: 2
```

GPU requests are separate from CPU/memory tiers because GPU workloads have widely varying resource profiles. A lightweight inference model might need `small` + 1 GPU, while distributed training might need `xlarge` + 4 GPUs.

### What is a GPU slot?

When you request `--gpu 1`, you are requesting one **GPU slot** on a node. What a slot represents depends on the node's overcommit factor:

| Overcommit  | Physical GPUs  | Slots  | `--gpu 1` means                                                                                      |
|-------------|----------------|--------|------------------------------------------------------------------------------------------------------|
| 1 (default) | 1              | 1      | Exclusive access to the entire physical GPU. No other container can use it.                          |
| 2           | 1              | 2      | Time-shared access — 2 containers share 1 physical GPU. Each sees full VRAM but shares compute time. |
| 4           | 1              | 4      | 4 containers share 1 physical GPU.                                                                   |
| 8           | 1              | 8      | 8 containers share 1 physical GPU (aggressive sharing).                                              |

**Example:** A node with 2x RTX 3090 and overcommit=4 has `2 × 4 = 8` GPU slots. You can run 8 containers each requesting `--gpu 1`, with pairs of containers time-sharing each physical GPU.

The overcommit factor is set per node:

```bash
nimbus node gpu-overcommit NODE_ID 4
```

> **Important:** Time-slicing provides NO memory isolation. All containers sharing a GPU see the full VRAM but share it. If two containers each try to use 100% of the VRAM, one will OOM. Set the overcommit factor based on your workloads' known VRAM usage. For production training workloads, keep overcommit at 1 (default). For inference with small models, 2-4 is typical.

### Failed GPUs

DockNimbus tracks individual GPU health. If a GPU is marked as `failed`, it is excluded from the allocatable count and won't receive workloads. Use `nimbus node describe NODE_ID` to see per-device health status.

Only NVIDIA GPUs are supported. See the [GPU acceleration](../guides/compute.md#gpu-acceleration) guide for details on provisioning and availability.
