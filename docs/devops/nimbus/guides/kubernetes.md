---
sidebar_position: 2
sidebar_label: "Kubernetes"
title: "Kubernetes Clusters (K3s)"
---

# Kubernetes Clusters (K3s)

DockNimbus deploys lightweight Kubernetes clusters using K3s. The first node becomes the control plane; additional nodes join as agents.

## Create a cluster

```bash
nimbus k8s create-cluster --name dev-k8s --nodes NODE1_ID,NODE2_ID
```

## Get kubeconfig

```bash
nimbus k8s kubeconfig --name dev-k8s > ~/.kube/dev-k8s.yaml
export KUBECONFIG=~/.kube/dev-k8s.yaml
kubectl get nodes
```

The kubeconfig endpoint is configurable via `kubeconfig_endpoint` in the API server config:
- `"public"` (default) — uses the node's public IP
- `"overlay"` — uses the WireGuard IP (only reachable from other nodes)
- `"<ip>"` — a specific IP or hostname

## Add and remove nodes

```bash
nimbus k8s add-node --cluster CLUSTER_ID --node NODE_ID
nimbus k8s remove-node --cluster CLUSTER_ID --node NODE_ID
```

The control plane node cannot be removed.

## Attach NFS volumes

Attach an NFS volume to a cluster as a PersistentVolume and PersistentVolumeClaim:

```bash
nimbus k8s volume attach --cluster CLUSTER_ID --name VOL_ID --size 1Gi
nimbus k8s volume detach --cluster CLUSTER_ID --name VOL_ID
```

This automatically installs `nfs-common` on all cluster nodes and creates the PV/PVC resources.

## Deploy compute instances to K8s

```bash
nimbus compute run --name web-app --k8s CLUSTER_ID \
  --image nginx:latest --type small --port 80:80
```

This creates a Deployment, Service, and Ingress (via EasyHAProxy) in the cluster.

## List and delete

```bash
nimbus k8s list
nimbus k8s delete-cluster CLUSTER_ID
```

## Load balancing

K3s clusters automatically deploy EasyHAProxy as an ingress controller. Compute instances deployed to K8s get an Ingress resource with a domain in the format `<name>.<cluster-name>.nimbus`.
