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

## Attach to a Kubernetes cluster

Creates a PersistentVolume and PersistentVolumeClaim backed by the NFS export:

```bash
nimbus k8s volume attach --cluster CLUSTER_ID --name VOL_ID --size 1Gi
nimbus k8s volume detach --cluster CLUSTER_ID --name VOL_ID
```

## Delete a volume

Volumes must be detached from all resources before deletion:

```bash
nimbus volume delete VOL_ID
```
