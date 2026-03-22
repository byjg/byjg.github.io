---
sidebar_position: 2
sidebar_label: "Reference"
title: "Manifest Reference"
---

# Manifest Reference

The manifest system lets you declare your entire infrastructure in a single YAML file. DockNimbus provisions resources in dependency order, handles idempotent re-applies, detects configuration drift, and can prune orphaned resources.

## CLI Usage

```bash
# Apply a manifest
nimbus manifest apply --file infra.yaml

# Apply with variable substitution
nimbus manifest apply --file infra.yaml --env S3_PASSWORD=secret --env NODE_IP=10.0.0.1

# Apply and prune resources that were removed from the manifest
nimbus manifest apply --file infra.yaml --prune

# Tear down all resources declared in the manifest
nimbus manifest remove --file infra.yaml
```

### Flags

| Flag | Description |
|------|-------------|
| `--file` | Path to the manifest YAML file (required) |
| `--env` | Variable substitution in `KEY=VALUE` format (repeatable) |
| `--prune` | Delete resources owned by this manifest that are no longer declared (requires `name`) |

## Manifest Structure

A manifest has the following top-level sections, each optional. Resources are provisioned in this order and removed in reverse:

```
nodes -> volumes -> swarms -> s3 -> kubernetes -> compute -> services
```

### `name`

An optional identifier for the manifest. Required when using `--prune` to track resource ownership.

- Must be 63 characters or less
- Only alphanumeric characters and hyphens allowed

```yaml
name: my-infrastructure
```

### `nodes`

Bare metal machines to register as DockNimbus nodes. Each node is provisioned via SSH — the agent binary is installed, an mTLS certificate is issued, and WireGuard is configured automatically.

```yaml
nodes:
  web1:
    ip: 192.168.1.10
    name: web-server-1        # Optional display name
    ssh:
      user: root
      # key: ~/.ssh/id_rsa    # SSH private key (default: ~/.ssh/id_rsa)
      # password: ${PASS}     # Password auth (alternative to key)
      # port: 22              # SSH port (default: 22)

  web2:
    ip: 192.168.1.11
    ssh:
      user: root
```

The alias (e.g. `web1`, `web2`) is used to reference this node in other sections. On re-apply, existing nodes matching the IP are skipped.

### `volumes`

NFS volumes hosted on a node. A directory is created and exported via NFS so it can be mounted by compute instances or Kubernetes clusters.

```yaml
volumes:
  data-vol:
    node: web1                 # Node alias from the nodes section
    folder: /srv/nimbus/data   # Path on the node
```

Volumes are immutable after creation — changing the `node` or `folder` of an existing volume will produce an error to prevent accidental data loss.

### `swarms`

Docker Swarm clusters. The first node becomes the manager; additional nodes join as workers.

```yaml
swarms:
  prod:
    nodes: [web1, web2]
    lb: true                   # Deploy EasyHAProxy load balancer
    # cloudflare:              # Optional external DNS
    #   token: ${CF_TOKEN}
    #   domain: example.com
```

On re-apply, node membership is reconciled — nodes added to the list are joined and nodes removed from the list are evicted.

### `s3`

MinIO S3-compatible object storage instances deployed to a swarm.

```yaml
s3:
  store1:
    swarm: prod                # Swarm alias
    volume: data-vol           # Volume alias for persistent storage
    password: ${S3_PASSWORD}   # MinIO root password
    # license: /path/to/license    # Optional MinIO license file
    # certs: /path/to/certs.pem   # Optional custom TLS certificates
```

### `kubernetes`

K3s Kubernetes clusters. The first node becomes the control plane; additional nodes join as agents.

```yaml
kubernetes:
  dev-k8s:
    nodes: [web1, web2]
    volumes:                   # NFS volumes to attach as PV + PVC
      data-vol: 1Gi
    manifests:                 # Inline K8s resources applied after the cluster is ready
      - apiVersion: apps/v1
        kind: Deployment
        metadata:
          name: web-app
        spec:
          replicas: 1
          selector:
            matchLabels:
              app: web-app
          template:
            metadata:
              labels:
                app: web-app
            spec:
              containers:
                - name: app
                  image: nginx:latest
                  ports:
                    - containerPort: 80
```

| Field | Description |
|-------|-------------|
| `nodes` | Node aliases — first is control plane, rest are workers |
| `volumes` | Map of volume alias to PVC size — creates NFS-backed PersistentVolume and PersistentVolumeClaim |
| `manifests` | Inline Kubernetes resources applied via `kubectl apply` after cluster creation |

On re-apply, cluster node membership is reconciled (the control plane node cannot be removed).

### `compute`

Container instances deployed to either a Docker Swarm or a Kubernetes cluster. Specify exactly one of `swarm` or `k8s`.

```yaml
compute:
  web-app:
    swarm: prod                # Deploy to Docker Swarm
    image: byjg/static-httpserver
    type: small
    replicas: 1
    domain: app.example.com
    ports:
      - "80:8080"              # host:container
    volumes:
      - data-vol:/data         # volume-alias:mount-path
    env:
      - TITLE=soon
      - "MESSAGE=Keep In Touch"
    command: ["nginx", "-g", "daemon off;"]

  k8s-app:
    k8s: dev-k8s               # Deploy to Kubernetes cluster
    image: nginx:latest
    type: medium
    ports:
      - "80:80"
```

| Field | Description |
|-------|-------------|
| `swarm` | Swarm alias to deploy to (mutually exclusive with `k8s`) |
| `k8s` | Kubernetes cluster alias to deploy to (mutually exclusive with `swarm`) |
| `image` | Container image |
| `type` | Instance type: `nano`, `micro`, `small`, `medium`, `large`, `xlarge` |
| `replicas` | Number of replicas (default: 1) |
| `domain` | Custom domain for the instance (routed via load balancer) |
| `ports` | Port mappings in `"host:container"` format |
| `volumes` | Volume mounts in `"volume-alias:/mount/path"` format |
| `env` | Environment variables in `KEY=VALUE` format |
| `command` | Container command as an array (e.g. `["sh", "-c", "echo hello"]`) |
| `platform` | Target platform constraint (e.g. `arm64`) |

On re-apply, changes to `image`, `type`, `domain`, `ports`, `env`, `command`, or `volumes` are detected and the instance is recreated. Replica count changes are applied in-place via scaling.

### `services`

Docker Compose stacks deployed to a swarm. Services are always re-deployed on apply (idempotent).

```yaml
services:
  my-stack:
    swarm: prod
    compose:
      services:
        web:
          image: nginx:latest
          ports:
            - "80:80"
        redis:
          image: redis:alpine
    env:
      - KEY=value
    volume-mappings:
      - compose-name: data     # Volume name inside compose definition
        volume: data-vol       # Manifest volume alias
```

| Field | Description |
|-------|-------------|
| `swarm` | Swarm alias to deploy to |
| `compose` | Inline Docker Compose content (services, networks, volumes, etc.) |
| `env` | Environment variables passed to the compose stack |
| `volume-mappings` | Maps compose volume names to manifest volume aliases for NFS-backed storage |

## External Resources

Any node, volume, swarm, or Kubernetes cluster can be marked as `external: true` to reference an existing resource by name instead of creating it. External resources:

- Must already exist in the API (looked up by the manifest alias as the resource name)
- Are never created, modified, or deleted by `apply` or `remove`
- Are never pruned by `--prune`
- Can be referenced by other sections (e.g. compute instances can target an external swarm)

```yaml
nodes:
  web1:
    external: true

volumes:
  shared-data:
    external: true

swarms:
  prod:
    external: true

kubernetes:
  cluster1:
    external: true
    volumes:                   # Volumes and manifests can still be applied
      shared-data: 1Gi
    manifests:
      - apiVersion: apps/v1
        kind: Deployment
        ...

compute:
  web-app:
    swarm: prod                # Uses the external swarm
    image: nginx:latest
    type: small
```

This is useful when:
- Infrastructure is shared across multiple manifests (e.g. nodes managed by one manifest, apps by another)
- You want to deploy workloads to existing swarms or clusters without managing their lifecycle
- Teams are separated — infra team manages nodes/swarms, app team manages compute/services

`external: true` is mutually exclusive with resource-specific fields. For example, an external node cannot have `ip` or `ssh` fields, and an external swarm cannot have `nodes` or `lb` fields.

## Variable Substitution

Any `${VAR}` in the manifest is replaced before parsing. Variables are resolved in order:

1. `--env` flags passed to the CLI
2. OS environment variables

```yaml
nodes:
  web1:
    ip: ${NODE1_IP}
    ssh:
      user: ${SSH_USER}
      password: ${NODE1_PASS}
```

```bash
nimbus manifest apply --file infra.yaml \
  --env NODE1_IP=10.0.0.1 \
  --env SSH_USER=deploy \
  --env NODE1_PASS=secret
```

Unresolved variables are left as-is (not treated as an error), so optional fields can reference variables that may not be set.

## Idempotent Apply

Running `nimbus manifest apply` multiple times is safe:

- **Nodes**: Skipped if the IP already exists and the node is ready
- **Volumes**: Skipped if already active; errors if `node` or `folder` changed
- **Swarms/Kubernetes**: Skipped if they exist; node membership is reconciled (adds missing, removes extra)
- **S3**: Skipped if already exists
- **Compute**: Skipped if unchanged; recreated if configuration drifted; scaled if only replicas changed
- **Services**: Always re-deployed (compose stacks are inherently idempotent)

## Pruning

When using `--prune`, DockNimbus tracks which resources belong to a manifest by tagging them with the manifest `name`. Resources that are tagged with the manifest name but no longer declared in the YAML are deleted in reverse dependency order:

```
services -> compute -> kubernetes -> s3 -> swarms -> volumes -> nodes
```

This is useful when you remove a section from your manifest and want the corresponding resources cleaned up automatically.

```bash
# First apply creates web-app and api-server
nimbus manifest apply --file infra.yaml --prune

# Later, remove api-server from the YAML and re-apply
# --prune will delete the orphaned api-server instance
nimbus manifest apply --file infra.yaml --prune
```

## Removal

`nimbus manifest remove` tears down all resources declared in the manifest in reverse dependency order. Unlike `--prune`, it removes everything in the manifest, not just orphans.

```bash
nimbus manifest remove --file infra.yaml --env S3_PASSWORD=secret
```

Variable substitution flags are still needed on removal if the manifest contains variables (the file must parse successfully).

## Full Example

See [manifest-example.yaml](manifest-example.yaml) for a complete working example.
