---
sidebar_position: 2
sidebar_label: "Kubernetes"
title: "Kubernetes Clusters (K3s)"
---

# Kubernetes Clusters (K3s)

DockNimbus deploys lightweight Kubernetes clusters using K3s. The first node becomes the control plane; additional nodes join as agents.

## Create a cluster

```bash
nimbus k8s create --name dev-k8s --nodes NODE1_ID,NODE2_ID
```

For a highly available control plane (embedded etcd, required for promote/demote):

```bash
nimbus k8s create --name dev-k8s --nodes NODE1_ID,NODE2_ID --ha
```

`--lb` deploys EasyHAProxy as the cluster's ingress controller — see [load balancing](#load-balancing) for what it does and how to add or remove one later.

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

A new worker installs the k3s agent in the background, which can take a minute or more. If the install fails, the node is taken out of the cluster and the cluster keeps its status. The reason is recorded as a `cluster_join_failed` event (`nimbus node events NODE_ID`).

## Promote and demote nodes

In HA clusters (created with `--ha`), worker nodes can be promoted to control plane and demoted back:

```bash
nimbus k8s promote --cluster CLUSTER_ID --node NODE_ID
nimbus k8s demote --cluster CLUSTER_ID --node NODE_ID
```

## Attach NFS volumes

Attach an NFS volume to a cluster as a PersistentVolume and PersistentVolumeClaim:

```bash
nimbus volume attach VOL_ID --cluster CLUSTER_ID [--size 10Gi]
nimbus volume list   --cluster CLUSTER_ID
nimbus volume detach VOL_ID --cluster CLUSTER_ID
```

This installs `nfs-common` on all cluster nodes and creates the PV/PVC resources. The claim is named `nfs-<volume>`, which is what a manifest mounts. Until a volume is attached that claim does not exist, and a manifest mounting it applies cleanly and then never schedules.

## Deploy compute instances to K8s

```bash
nimbus compute create --name web-app --k8s CLUSTER_ID \
  --image nginx:latest --type small --port 80:80
```

This creates a Deployment, Service, and Ingress (via EasyHAProxy) in the cluster.

## List and delete

```bash
nimbus k8s list
nimbus k8s delete CLUSTER_ID
```

A cluster that still has instances or services Nimbus manages (that are not terminated) cannot be
deleted, nor its last node removed: delete them first.

Every node uninstalls K3s, and the cluster shows as `deleting` until all of them have; a node whose
agent is offline uninstalls when it comes back. If an uninstall fails, the cluster stays in `error`
so the node still running K3s is not forgotten; delete it again once the node is fixed, and only the
nodes that have not uninstalled yet are retried. Removing a worker with `nimbus k8s remove-node`
leaves the cluster as it is.

## Load balancing

A cluster gets EasyHAProxy as its ingress controller when it is asked for, exactly as a swarm does:

```bash
nimbus k8s create --name dev-k8s --nodes NODE1_ID --lb
```

Without it the cluster runs fine and workloads are reachable inside it, but nothing serves Ingress objects — which is what you want when ingress is someone else's job. Compute instances deployed to a cluster get an Ingress with a domain in the format `<name>.<cluster-name>.nimbus`, and that Ingress needs a controller to answer it.

The decision is not permanent:

```bash
nimbus gateway lb set    --cluster CLUSTER_ID   # deploy it
nimbus gateway lb delete --cluster CLUSTER_ID   # take it away
nimbus gateway lb list                          # every load balancer, swarm and cluster alike
```

The web UI has the same on the cluster's detail page, under **Load Balancer**. Removing one leaves every workload running; what stops is the ingress in front of them.

## Unmanaged resources

DockNimbus manages only the resources it created, so deployments applied straight through `kubectl` stay outside its control. The cluster's detail page in the web UI has an **Unmanaged Resources** panel listing those deployments.

Press **Scan** to run it. The scan is manual because each run queues a task on the control-plane node, and its result is never stored — it is a live look at the cluster rather than an inventory that can go stale.

Excluded from the listing are the cluster's own system namespaces (`kube-system`, `kube-public`, `kube-node-lease` — which is where K3s keeps CoreDNS, Traefik, metrics-server and the local path provisioner), anything carrying a `nimbus` label, and any namespace DockNimbus created. That last rule is what keeps the EasyHAProxy ingress out of the list: it is installed from a Helm chart whose labels are not DockNimbus's to set, so DockNimbus labels the namespace it creates for it instead.

The panel is read-only. It shows you what is there; removing it is still done through `kubectl`.

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
