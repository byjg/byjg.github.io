---
sidebar_position: 4
sidebar_label: "Sizes"
title: "Container Sizes"
---

# Container Sizes

A container runs with a CPU and a memory limit. Give them directly, or pick a
**size**, a named shorthand for both:

```bash
nimbus container create --name web --swarm SWARM_ID --image nginx --size medium
nimbus container create --name web --swarm SWARM_ID --image nginx --cpu 0.5 --memory 512M
```

- `--cpu` is in cores (`0.5`, `2`), as Docker's `--cpus`.
- `--memory` takes a binary unit: `512M` is 512 MiB, `2G` is 2 GiB.
- A size cannot be combined with `--cpu` or `--memory`.
- Giving only one of `--cpu`/`--memory` takes the other from `small`.
- Giving neither means `small` (1 CPU, 1 GiB).

Only the limits are stored: a container created with `--size medium` is
afterwards a container with 2 CPUs and 2 GiB. When it is edited without new
limits, it keeps the ones it has.

## Sizes

| Name | CPU | Memory | `-m2` (2× memory) | `-m4` (4× memory) |
|------|-----|--------|-------------------|-------------------|
| `pico` | 0.25 | 128 MiB | 256 MiB | 512 MiB |
| `nano` | 0.5 | 256 MiB | 512 MiB | 1 GiB |
| `micro` | 1 | 512 MiB | 1 GiB | 2 GiB |
| `small` | 1 | 1 GiB | 2 GiB | 4 GiB |
| `medium` | 2 | 2 GiB | 4 GiB | 8 GiB |
| `large` | 4 | 4 GiB | 8 GiB | 16 GiB |
| `xlarge` | 8 | 8 GiB | 16 GiB | 32 GiB |

`small-m4` is 1 CPU with 4 GiB. List them with:

```bash
nimbus container sizes
```

In manifests, use `size`, or `cpu` and `memory`:

```yaml
containers:
  web:
    swarm: prod
    image: nginx
    size: medium
  worker:
    swarm: prod
    image: myworker
    cpu: 0.5
    memory: 768M
```

Manifests written before v0.11.0 used `type:`; it is refused, naming `size:`.

## GPU support

GPUs are requested independently from the CPU and memory limits, with the `--gpu` flag. Any size, or any CPU and memory, can be combined with GPU requests:

```bash
nimbus container create --name ml-train --swarm SWARM_ID \
  --image pytorch/pytorch --size large --gpu 2
```

In manifests, use the `gpu` field:

```yaml
containers:
  ml-train:
    swarm: prod
    image: pytorch/pytorch
    size: large
    gpu: 2
```

GPU requests are separate from CPU and memory because GPU workloads have widely varying resource profiles. A lightweight inference model might need `small` + 1 GPU, while distributed training might need `xlarge` + 4 GPUs.

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

Only NVIDIA GPUs are supported. See the [GPU acceleration](../guides/containers.md#gpu-acceleration) guide for details on provisioning and availability.
