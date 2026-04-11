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

For a highly available control plane (embedded etcd, required for promote/demote):

```bash
nimbus k8s create-cluster --name dev-k8s --nodes NODE1_ID,NODE2_ID --ha
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

## Promote and demote nodes

In HA clusters (created with `--ha`), worker nodes can be promoted to control plane and demoted back:

```bash
nimbus k8s promote-node --cluster CLUSTER_ID --node NODE_ID
nimbus k8s demote-node --cluster CLUSTER_ID --node NODE_ID
```

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

## Access control (OIDC)

Nimbus acts as an OIDC provider for K3s. When a cluster is created, two `ClusterRoleBindings` are automatically created:

| OIDC group                      | Kubernetes role |
|---------------------------------|-----------------|
| `nimbus:k8s:<cluster-id>:admin` | `cluster-admin` |
| `nimbus:k8s:<cluster-id>:read`  | `view`          |

Users and groups in Nimbus IAM are granted access by assigning the corresponding ARN scope. Wildcard scopes (`nimbus:k8s:*:admin`) are expanded at token issuance time to all live clusters.

See [Users & Access Management](./iam.md#kubernetes-access) for how to assign scopes.

### Custom roles

You can use any permission word beyond `admin` and `read` — for example `devops`, `ci`, `readonly-ops`. The scope format `nimbus:k8s:<cluster-id>:<permission>` is validated by Nimbus as: type must be `k8s`, cluster ID must exist, permission is free-form. The binding between that permission word and a Kubernetes role is created with `kubectl`:

```bash
# 1. Create a group in Nimbus with the custom scope
nimbus iam group create \
  --name devops \
  --scope "nimbus:k8s:cls-abc123:devops"

# 2. Create the ClusterRoleBinding in K3s
export KUBECONFIG=~/.kube/cls-abc123.yaml

kubectl create clusterrolebinding nimbus-k8s-cls-abc123-devops \
  --clusterrole=edit \
  --group="nimbus:k8s:cls-abc123:devops"

# 3. Add a user to the group
nimbus iam user-group add --user USER_ID --group GROUP_ID
```

The token issued to that user will contain `nimbus:k8s:cls-abc123:devops` in the `groups` claim. K3s matches it to the binding and grants `edit` access.

You can also use a custom `ClusterRole` instead of a built-in one:

```bash
kubectl apply -f - <<EOF
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: deploy-only
rules:
- apiGroups: ["apps"]
  resources: ["deployments"]
  verbs: ["get", "list", "create", "update", "patch"]
EOF

kubectl create clusterrolebinding nimbus-k8s-cls-abc123-devops \
  --clusterrole=deploy-only \
  --group="nimbus:k8s:cls-abc123:devops"
```

:::note
Nimbus does not manage custom K3s bindings. Create and maintain them with `kubectl`. If the cluster is deleted, the bindings are removed with it automatically by K3s.
:::
