---
sidebar_position: 1
sidebar_label: "Containers"
title: "Containers"
---

# Containers

A container runs one image on a Docker Swarm or a Kubernetes cluster, with resource limits and optional load balancing.

## Create a container

```bash
nimbus container create \
  --name web-1 \
  --swarm SWARM_ID \
  --image byjg/static-httpserver \
  --size small \
  --port 80:8080 \
  --env TITLE=soon \
  --env "MESSAGE=Keep In Touch"
```

For Kubernetes deployments, use `--k8s` instead of `--swarm`:

```bash
nimbus container create \
  --name web-1 \
  --k8s CLUSTER_ID \
  --image nginx:latest \
  --size medium \
  --port 80:80
```

## Edit a container

Update the image, size (or CPU and memory), replicas, volumes, or other mutable configuration of a running instance. Name and target (swarm/cluster) cannot be changed after creation.

```bash
nimbus container update --id CONTAINER_ID \
  --image nginx:1.25 \
  --size medium
```

## List containers

```bash
nimbus container list
```

## Scale replicas

```bash
nimbus container scale --id CONTAINER_ID --replicas 3
```

## Stop, start, and terminate

```bash
nimbus container stop CONTAINER_ID
nimbus container start CONTAINER_ID
nimbus container delete CONTAINER_ID
```

A container you stopped through DockNimbus, but which the runtime reports as running, is shown as `drifted`. That happens when someone scales the service back up directly in Docker or Kubernetes: what DockNimbus recorded and what is actually running no longer agree, and DockNimbus will not silently pick a side.

Either resolution works — `nimbus container stop` enforces the recorded state, `nimbus container start` adopts what is running — and if the container stops again on its own the status returns to `stopped` without you doing anything.

Terminated containers are never treated this way: they are gone deliberately and are not resurrected by an observation.

## Logs

Fetch the last 100 lines of a container's logs:

```bash
nimbus container logs CONTAINER_ID
```

Specify a different number of lines:

```bash
nimbus container logs CONTAINER_ID -n 500
```

Continuously tail new log output:

```bash
nimbus container logs CONTAINER_ID -w
```

Works with both Docker Swarm and Kubernetes containers.

## Attach a volume

Mount an NFS volume to a running container:

```bash
nimbus volume attach VOL_ID --container CONTAINER_ID --path /data
nimbus volume detach VOL_ID --container CONTAINER_ID
nimbus volume list --container CONTAINER_ID
```

Or specify volumes at creation time:

```bash
nimbus container create --name app --swarm SWARM_ID \
  --image myapp --size small --volume VOL_ID:/data
```

## Custom domain

Route traffic through the load balancer with a custom domain:

```bash
nimbus container create --name app --swarm SWARM_ID \
  --image myapp --size small --port 80:8080 \
  --domain app.example.com
```

## GPU acceleration

Request NVIDIA GPUs for ML training, inference, or other GPU workloads. GPUs are an independent resource — pick any size, or any CPU and memory, for CPU/memory and add `--gpu N`:

```bash
nimbus container create --name ml-train --swarm SWARM_ID \
  --image pytorch/pytorch:latest --size large --gpu 1
```

On Kubernetes:

```bash
nimbus container create --name inference --k8s CLUSTER_ID \
  --image llama:latest --size medium --gpu 2
```

### How it works

- **Automatic provisioning** — When you add a node with NVIDIA GPUs, DockNimbus automatically installs the driver, nvidia-container-toolkit, and configures the container runtime. No manual setup required.
- **Placement** — Nodes with GPUs are labeled automatically. The scheduler places GPU workloads only on GPU-capable nodes.
- **Docker Swarm** — Uses `--generic-resource gpu=N` for resource allocation and `NVIDIA_VISIBLE_DEVICES` for runtime access.
- **Kubernetes** — Uses `nvidia.com/gpu` resource limits and the NVIDIA device plugin for device assignment.

### GPU sharing (time-slicing)

By default, each GPU is exclusive to one container (overcommit factor = 1). To allow multiple containers to share a GPU via time-slicing:

```bash
nimbus node gpu-overcommit NODE_ID 4
```

This advertises each physical GPU as 4 virtual slots. With a single GPU and overcommit=4, up to 4 containers can each request `--gpu 1`.

> **Warning:** Time-slicing provides NO memory isolation. All containers sharing a GPU see the full VRAM but share it with others. Set the overcommit factor based on your workloads' known VRAM usage.

Allowed values: `1`, `2`, `4`, `8`.

### Check GPU availability

```bash
nimbus node list
```

The GPU column shows `available/total` virtual slots for GPU nodes, like the CPU and MEMORY columns, or `-` for non-GPU nodes. Use `nimbus node describe NODE_ID` for per-device details including model, memory, and health status.

A slot is in use when something holds it, whoever placed it:

- **Docker Swarm:** the slots a running container's service reserves (`generic_resources: gpu`), whether it is a container, a stack, or a service deployed outside Nimbus.
- **Kubernetes:** the `nvidia.com/gpu` its pods request, reported by the cluster's control node.
- **Outside the orchestrators:** each workload using a GPU without either (`docker run --gpus`, a process on the host) holds one slot of each GPU it uses. A workload is a container with all its processes, or a process outside any container.

A slot counts a tenant, not how much of the GPU it uses, the same as time-slicing does. The count is information: Swarm and Kubernetes place GPU work by their own reservations, which know nothing of a workload outside them, so with an overcommit factor above 1 they may place work beside it.

## Platform constraints

Target specific architectures:

```bash
nimbus container create --name arm-app --swarm SWARM_ID \
  --image myapp --size small --platform arm64
```

## Sizes, CPU and memory

A container's CPU and memory limits are given directly (`--cpu 0.5 --memory 512M`) or with a size, a named shorthand for both (`--size medium`); neither means `small` (1 CPU, 1 GiB).

```bash
nimbus container sizes
```

See [Container Sizes](../reference/sizes) for the full list and the rules.
