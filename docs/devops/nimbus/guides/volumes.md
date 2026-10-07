---
sidebar_position: 3
sidebar_label: "Volumes"
title: "Volumes"
---

# Volumes

Volumes provide persistent storage in a folder on a node, mountable by compute instances, Compose stacks and Kubernetes manifests alike. A volume is one of two types, chosen when it is created and fixed after:

| Type | Where the data is used | Network |
|------|------------------------|---------|
| `nfs` (default) | on any node | exported over NFS to the others |
| `local` | only on its own node — whatever uses it runs there | none |

## Create a volume

```bash
nimbus volume create --name mydata --node NODE_ID --folder /exports/mydata          # NFS
nimbus volume create --name pgdata --node NODE_ID --folder /srv/pgdata --local      # local
```

For an NFS volume, this sets up the NFS export on the node and creates the matching Docker volume on every swarm node. A local volume only gets its folder and, on its node, the Docker volume. See [local volumes](#local-volumes). On Kubernetes nothing is created until the volume is [attached to a cluster](#attach-to-a-kubernetes-cluster) — see [how volumes are mounted](#how-volumes-are-mounted) for why the two differ.

## List volumes

```bash
nimbus volume list                        # every volume
nimbus volume list --cluster CLUSTER_ID   # what a cluster has attached, and the claim each provides
nimbus volume list --instance INSTANCE_ID # what an instance mounts, and where
```

## Attach to a compute instance

At creation time:

```bash
nimbus compute create --name app --swarm SWARM_ID \
  --image myapp --type small --volume VOL_ID:/data
```

To a running instance (NFS volumes only: a local volume would have to move the running service to its node, so it is attached by creating or updating the instance with it):

```bash
nimbus volume attach VOL_ID --instance INSTANCE_ID --path /data
nimbus volume detach VOL_ID --instance INSTANCE_ID
nimbus volume list --instance INSTANCE_ID
```

## Local volumes

A local volume is a folder on one node that nothing else can reach — no NFS export, no network in the data path. It suits data that must live on local disk: databases and anything else relying on file locks (SQLite, LMDB), which network filesystems do not honour.

Whatever uses a local volume runs on its node, and Nimbus places it there:

- **Compute instances** are pinned to the volume's node (`node.hostname == <node>`), at creation, on update, and when a stopped service is recreated on start. Asking for another node with `--node` is refused.
- **Compose stacks**: every service that mounts the volume gets the same constraint added under `deploy.placement.constraints` in the copy sent to the node. The stack as you wrote it is what Nimbus stores and shows.
- **Kubernetes**: the volume becomes a `local` PersistentVolume (`ReadWriteOnce`) with `nodeAffinity` to its node, so every pod using the claim is scheduled there. The claim is named `nfs-<volume>`, like an NFS one, so manifests do not change with the type.
- **S3 instances** run on the volume's node.

What cannot hold is refused before anything is created: the volume's node must belong to the swarm or cluster, and a workload cannot use local volumes of two different nodes.

## How volumes are mounted

A volume is one NFS export on one node. What that turns into depends on the backend, and the two differ in a way worth knowing: on a swarm it is ready everywhere as soon as it exists, while on Kubernetes nothing exists until you attach it.

### Docker Swarm — a volume on every node, automatically

Every swarm node gets a Docker volume named `nfs-<volume>` for each active NFS volume; a local volume's exists on its own node only. Nimbus creates them when the volume is created and on any node that joins later, so a stack can reference one without further ceremony:

```yaml
volumes:
  nfs-mydata:
    external: true
```

On the node that hosts the export, the Docker volume is a local bind-mount (`type=none, o=bind`) straight to the export folder rather than a mount over NFS. That avoids loopback NFS traffic and gives better I/O for workloads that land on the storage node. Every other node mounts it over NFS (`type=nfs, o=addr=<server>,rw,nolock,soft`). Which case applies is decided by the node's overlay address matching the volume's server address.

### Kubernetes — a claim per cluster, only once attached

There is no per-node equivalent. A volume becomes usable on a cluster when it is **attached**, which applies a PersistentVolume and a PersistentVolumeClaim named `nfs-<volume>` (ReadWriteMany for NFS; for a local volume, ReadWriteOnce and pinned to its node, which must be in the cluster). Workloads then mount it by claim name, in any manifest, in any namespace that has the claim:

```yaml
volumes:
  - name: data
    persistentVolumeClaim:
      claimName: nfs-mydata
```

Creating a volume does **not** attach it to any cluster, and creating a cluster does not attach existing volumes to it. Until you attach, the claim does not exist — and a manifest that mounts it applies cleanly and then never schedules, because Kubernetes waits for a claim that is not there. Nimbus reports that on the service, in Kubernetes' own words:

```
Deployment/api in default has 0/2 ready: persistentvolumeclaim "nfs-mydata" not found
```

## Attach to a Kubernetes cluster

```bash
nimbus volume attach VOL_ID --cluster CLUSTER_ID [--size 10Gi]
nimbus volume list   --cluster CLUSTER_ID
nimbus volume detach VOL_ID --cluster CLUSTER_ID
```

`--size` is optional and defaults to `10Gi`: a claim has to carry a figure, and NFS ignores it. The web UI has the same under **Kubernetes → the cluster → NFS Volumes**, and the Services editor offers **Attach and add**, which attaches the volume before writing the claim into a manifest.

Detaching removes the claim and the PersistentVolume; the NFS export itself is untouched. Kubernetes will not complete the deletion while a pod still mounts the claim — it leaves the object `Terminating` until the last consumer lets go — so the task fails and reports what is holding it:

```
persistentvolumeclaim/nfs-mydata is Terminating (kubernetes.io/pvc-protection); used by pod/api-7d9f in default
```

Stop or remove those workloads and detach again.

## Delete a volume

Volumes must be detached from all resources before deletion. The folder and its data stay on the node either way; a local volume, having no export to take down, is removed at once:

```bash
nimbus volume delete VOL_ID
```
