---
sidebar_position: 1
sidebar_label: "Overview"
title: "Manifest (Infrastructure as Code)"
---

# Manifest (Infrastructure as Code)

Instead of running individual CLI commands, you can declare your entire infrastructure in a single YAML manifest. The manifest system provisions resources in dependency order, is idempotent (safe to re-run), and can detect drift to recreate changed resources.

## CLI usage

```bash
# Apply a manifest (creates/updates everything declared)
nimbus manifest apply --file infra.yaml

# Apply with variable substitution
nimbus manifest apply --file infra.yaml --env S3_PASSWORD=secret --env NODE_IP=10.0.0.1

# Prune orphaned resources no longer in the manifest
nimbus manifest apply --file infra.yaml --prune

# Tear down everything declared in the manifest
nimbus manifest remove --file infra.yaml
```

| Flag | Description |
|------|-------------|
| `--file` | Path to the manifest YAML file (required) |
| `--env` | Variable substitution in `KEY=VALUE` format (repeatable) |
| `--prune` | Delete resources owned by this manifest that are no longer declared (requires `name`) |

## How it works

### Dependency order

Resources are provisioned in this order and removed in reverse:

```
Nodes -> Volumes -> Swarms -> S3 -> Kubernetes -> Compute -> Services
```

### Idempotent apply

Running `nimbus manifest apply` multiple times is safe:

- **Nodes** — Skipped if the IP already exists and the node is ready
- **Volumes** — Skipped if already active; errors if `node` or `folder` changed
- **Swarms / Kubernetes** — Skipped if they exist; node membership is reconciled (adds missing, removes extra)
- **S3** — Skipped if already exists
- **Compute** — Skipped if unchanged; recreated if configuration drifted; scaled if only replicas changed
- **Services** — Always re-deployed (compose stacks are inherently idempotent)

### Change detection

On re-apply, compute instances are compared against the manifest. Changes to `image`, `type`, `domain`, `ports`, `env`, `command`, or `volumes` trigger automatic recreation. Replica count changes are applied in-place via scaling.

### Node reconciliation

Swarm and Kubernetes cluster node membership is reconciled to match the manifest. Nodes added to the list are joined; nodes removed from the list are evicted. The Kubernetes control plane node cannot be removed.

### External resources

Any node, volume, swarm, or Kubernetes cluster can be marked as `external: true` to reference an existing resource by name without managing its lifecycle. External resources are never created, modified, or deleted — they are simply looked up and made available for other sections to reference.

```yaml
nodes:
  web1:
    external: true        # Must already exist with name "web1"

swarms:
  prod:
    external: true

compute:
  web-app:
    swarm: prod           # Uses the external swarm
    image: nginx:latest
    type: small
```

This enables multi-manifest workflows where infra and apps are managed separately.

### Pruning

With `--prune`, resources tagged with the manifest name that are no longer declared in the YAML are deleted in reverse dependency order. This requires a `name` field in the manifest.

```bash
# First apply creates web-app and api-server
nimbus manifest apply --file infra.yaml --prune

# Later, remove api-server from the YAML and re-apply
# --prune deletes the orphaned api-server instance
nimbus manifest apply --file infra.yaml --prune
```

### Variable substitution

Any `${VAR}` in the manifest is replaced before parsing. Variables are resolved from `--env` flags first, then OS environment variables. Unresolved variables are left as-is.

## Removal

`nimbus manifest remove` tears down all resources declared in the manifest in reverse dependency order:

```bash
nimbus manifest remove --file infra.yaml --env S3_PASSWORD=secret
```

Variable substitution flags are still needed if the manifest contains variables.

## Further reading

- [Manifest Reference](reference) — field-by-field documentation for every manifest section
- [manifest-example.yaml](manifest-example.yaml) — complete working example
- [manifest-external-example.yaml](manifest-external-example.yaml) — example using external resource references
