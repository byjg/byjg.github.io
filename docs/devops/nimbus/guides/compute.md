---
sidebar_position: 1
sidebar_label: "Compute Instances"
title: "Compute Instances"
---

# Compute Instances

Compute instances are containers running on Docker Swarm or Kubernetes clusters, managed with resource limits and optional load balancing.

## Create an instance

```bash
nimbus compute run \
  --name web-1 \
  --swarm SWARM_ID \
  --image byjg/static-httpserver \
  --type small \
  --port 80:8080 \
  --env TITLE=soon \
  --env "MESSAGE=Keep In Touch"
```

For Kubernetes deployments, use `--k8s` instead of `--swarm`:

```bash
nimbus compute run \
  --name web-1 \
  --k8s CLUSTER_ID \
  --image nginx:latest \
  --type medium \
  --port 80:80
```

## Edit an instance

Update the image, instance type, replicas, volumes, or other mutable configuration of a running instance. Name and target (swarm/cluster) cannot be changed after creation.

```bash
nimbus compute update --id INSTANCE_ID \
  --image nginx:1.25 \
  --type medium
```

## List instances

```bash
nimbus compute list
```

## Scale replicas

```bash
nimbus compute scale --id INSTANCE_ID --replicas 3
```

## Stop, start, and terminate

```bash
nimbus compute stop INSTANCE_ID
nimbus compute start INSTANCE_ID
nimbus compute terminate INSTANCE_ID
```

## Logs

Fetch the last 100 lines of an instance's container logs:

```bash
nimbus compute logs INSTANCE_ID
```

Specify a different number of lines:

```bash
nimbus compute logs INSTANCE_ID -n 500
```

Continuously tail new log output:

```bash
nimbus compute logs INSTANCE_ID -w
```

Works with both Docker Swarm and Kubernetes instances.

## Attach a volume

Mount an NFS volume to a running instance:

```bash
nimbus compute volume attach --instance INSTANCE_ID --volume VOL_ID:/data
nimbus compute volume detach --instance INSTANCE_ID --volume VOL_ID
```

Or specify volumes at creation time:

```bash
nimbus compute run --name app --swarm SWARM_ID \
  --image myapp --type small --volume VOL_ID:/data
```

## Custom domain

Route traffic through the load balancer with a custom domain:

```bash
nimbus compute run --name app --swarm SWARM_ID \
  --image myapp --type small --port 80:8080 \
  --domain app.example.com
```

## GPU acceleration

Request NVIDIA GPUs for ML training, inference, or other GPU workloads. GPUs are an independent resource — pick any instance type for CPU/memory and add `--gpu N`:

```bash
nimbus compute run --name ml-train --swarm SWARM_ID \
  --image pytorch/pytorch:latest --type large --gpu 1
```

On Kubernetes:

```bash
nimbus compute run --name inference --k8s CLUSTER_ID \
  --image llama:latest --type medium --gpu 2
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

The GPU column shows `used/total` virtual slots for GPU nodes, or `-` for non-GPU nodes. Use `nimbus node describe NODE_ID` for per-device details including model, memory, and health status.

## Platform constraints

Target specific architectures:

```bash
nimbus compute run --name arm-app --swarm SWARM_ID \
  --image myapp --type small --platform arm64
```

## Instance types

```bash
nimbus compute instance-types
```

See [Instance Types](../reference/instance-types) for the full list.
