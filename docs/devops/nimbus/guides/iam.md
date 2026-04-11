---
sidebar_position: 7
sidebar_label: "Users & Access"
title: "Users & Access Management"
---

# Users & Access Management

DockNimbus supports multiple users with API key and JWT authentication, IAM groups, and ARN-style scopes for fine-grained access control.

## Users

### Create a user

```bash
nimbus iam create-user --username developer
```

Add `--admin` for administrator privileges. Admin users are automatically added to the built-in `admin` group.

### Generate API keys

```bash
nimbus iam create-key --user-id USER_ID
```

Returns an access key and secret key for HMAC authentication.

### Password and JWT login

```bash
# Set a password
nimbus iam set-password --user-id USER_ID --password <password>

# Login and get a JWT token
nimbus iam login --username developer --password <password>
```

JWT tokens are valid for 1 hour.

### Get a token via HMAC

```bash
nimbus iam get-token
```

---

## Scopes and ARN format

Permissions in Nimbus use an ARN (Amazon Resource Name-style) format:

```
nimbus:<resource-type>:<resource-id>:<permission>
```

| Examp-le                      | Meani-ng                                |
|-------------------------------|-----------------------------------------|
| `nimbus:k8s:*:admin`          | Admin on **all** Kubernetes clusters    |
| `nimbus:k8s:cls-abc123:admin` | Admin on cluster `cls-abc123` only      |
| `nimbus:k8s:cls-abc123:read`  | Read-only on cluster `cls-abc123` only  |
| `nimbus:s3:*:admin`           | Admin on **all** MinIO instances        |
| `nimbus:s3:s3-xyz789:read`    | Read-only on MinIO instance `s3-xyz789` |
| `nimbus:compute:*:admin`      | Admin on all compute instances          |

For external services (OAuth2 clients):
```
external:<client-name>:<permission>
```

**Wildcard expansion:** At token issuance time, wildcard scopes like `nimbus:k8s:*:admin` are expanded to all concrete registered cluster IDs. Kubernetes and other services only ever see exact scope strings in the token — they have no concept of wildcards.

### List registered scopes

Scopes are automatically registered when resources are provisioned (K3s clusters, MinIO instances). You can also register custom scopes manually:

```bash
nimbus iam scope list

nimbus iam scope register --scope "external:grafana:admin" --description "Grafana admin"
nimbus iam scope unregister "external:grafana:admin"
```

---

## Groups

Groups are named collections of scopes. Assign a group to a user instead of managing individual scopes.

### Built-in groups

| Group        | Sco-pes                                                             |
|--------------|---------------------------------------------------------------------|
| `admin`      | `nimbus:k8s:*:admin`, `nimbus:s3:*:admin`, `nimbus:compute:*:admin` |
| `admin-read` | `nimbus:k8s:*:read`, `nimbus:s3:*:read`, `nimbus:compute:*:read`    |

Built-in groups cannot be deleted. Admin users are automatically assigned to the `admin` group.

### Create a group

```bash
nimbus iam group create \
  --name developers \
  --description "Dev team" \
  --scope "nimbus:k8s:cls-abc123:admin" \
  --scope "nimbus:s3:s3-xyz789:read"
```

### List and delete groups

```bash
nimbus iam group list
nimbus iam group delete <group-id>   # custom groups only
```

### Update group scopes

Replaces the group's scope list entirely. All scopes must be registered first.

```bash
nimbus iam group set-scopes \
  --group <group-id> \
  --scope "nimbus:k8s:cls-abc123:admin" \
  --scope "nimbus:k8s:cls-xyz999:read"
```

---

## User group membership

```bash
# Add user to a group
nimbus iam user-group add --user USER_ID --group GROUP_ID

# Remove user from a group
nimbus iam user-group remove --user USER_ID --group GROUP_ID

# List a user's groups
nimbus iam user-group list --user USER_ID
```

---

## Kubernetes access

When a K3s cluster is provisioned, Nimbus automatically creates two RBAC bindings:

| Binding                         | OIDC group                      | Kubernetes role  |
|---------------------------------|---------------------------------|------------------|
| `nimbus-k8s-<cluster-id>-admin` | `nimbus:k8s:<cluster-id>:admin` | `cluster-admin`  |
| `nimbus-k8s-<cluster-id>-read`  | `nimbus:k8s:<cluster-id>:read`  | `view`           |

A user whose token contains `nimbus:k8s:cls-abc123:admin` (from a direct scope, group scope, or wildcard expansion) gets `cluster-admin` on that cluster. No other clusters are affected.

### Custom Kubernetes roles

Beyond `admin` and `read`, you can define any permission word in Nimbus and map it to any Kubernetes `ClusterRole` or `Role` via `kubectl`. Nimbus emits the scope string as-is into the token's `groups` claim — K3s enforces whatever binding you create.

**Example: give a team `devops` access with a restricted role**

**Step 1 — Create the group and scope in Nimbus**

```bash
# Create a group for the devops team
nimbus iam group create \
  --name devops \
  --description "DevOps team — deploy access on cls-abc123" \
  --scope "nimbus:k8s:cls-abc123:devops"
```

The scope format is validated as `nimbus:<type>:<resource-id>:<permission>` where:
- `<type>` must be a known resource type (`k8s`, `s3`, `compute`, `volume`)
- `<resource-id>` must be an existing resource ID or `*` (wildcard)
- `<permission>` is arbitrary — `devops`, `ci`, `readonly-ops`, anything you choose

**Step 2 — Create the Kubernetes binding**

Get the kubeconfig for the cluster and create the binding:

```bash
export KUBECONFIG=~/.kube/cls-abc123.yaml

# Bind the OIDC group to a Kubernetes ClusterRole of your choice
kubectl create clusterrolebinding nimbus-k8s-cls-abc123-devops \
  --clusterrole=edit \
  --group="nimbus:k8s:cls-abc123:devops"
```

You can use any built-in role (`edit`, `view`, `cluster-admin`) or a custom `ClusterRole` you define.

**Step 3 — Assign the group to a user**

```bash
nimbus iam user-group add --user USER_ID --group GROUP_ID
```

The user's next token will contain `nimbus:k8s:cls-abc123:devops` in the `groups` claim. K3s matches it to the binding and grants `edit` access on that cluster only.

:::note
Nimbus does not manage custom K3s bindings — you create and maintain them with `kubectl`. If the cluster is deleted, remove the binding manually or it becomes orphaned (harmless, but untidy).
:::

---

## UI

The IAM page has two tabs:

**Users** — list all users, click to view detail. Each user detail shows:
- Direct scopes (validated against registered scopes)
- Groups tab: current group memberships, add/remove groups
- API Keys tab
- OAuth2 Clients tab

**Groups** — list all groups. Click a group to view and edit its scopes.
