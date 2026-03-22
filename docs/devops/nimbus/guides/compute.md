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
