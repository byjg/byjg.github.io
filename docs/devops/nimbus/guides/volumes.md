---
sidebar_position: 3
sidebar_label: "Volumes"
title: "NFS Volumes"
---

# NFS Volumes

Volumes provide persistent NFS storage hosted on a node. They can be mounted by compute instances (Docker Swarm or Kubernetes) across the cluster.

## Create a volume

```bash
nimbus volume create --name mydata --node NODE_ID --folder /exports/mydata
```

This sets up the NFS export on the node and makes it available for attachment.

## List volumes

```bash
nimbus volume list
```

## Attach to a compute instance

At creation time:

```bash
nimbus compute run --name app --swarm SWARM_ID \
  --image myapp --type small --volume VOL_ID:/data
```

To a running instance:

```bash
nimbus compute volume attach --instance INSTANCE_ID --volume VOL_ID:/data
nimbus compute volume detach --instance INSTANCE_ID --volume VOL_ID
```

## How Docker volumes are mounted

On Docker Swarm, each node gets a Docker volume for every active NFS volume. When a node is the same machine that hosts the NFS export, Nimbus creates a local bind-mount volume (`type=none, o=bind`) pointing directly to the export folder instead of mounting over NFS. This avoids loopback NFS traffic and gives better I/O performance for workloads that land on the storage node.

For all other nodes the volume is mounted over NFS as normal.

## Attach to a Kubernetes cluster

Creates a PersistentVolume and PersistentVolumeClaim backed by the NFS export:

```bash
nimbus k8s volume attach --cluster CLUSTER_ID --name VOL_ID --size 1Gi
nimbus k8s volume detach --cluster CLUSTER_ID --name VOL_ID
```

When a new Kubernetes cluster is created, all existing active volumes are automatically provisioned as PV/PVC on that cluster — no manual attach step needed.

## Delete a volume

Volumes must be detached from all resources before deletion:

```bash
nimbus volume delete VOL_ID
```
