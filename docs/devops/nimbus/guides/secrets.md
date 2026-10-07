---
sidebar_position: 6.5
sidebar_label: "Secrets and Configs"
title: "Secrets and Configs"
---

# Secrets and Configs

A **secret** or a **config** is a value a service reads (a password, an API token, an nginx.conf) kept outside the service's compose file or manifest. The service refers to it by name, so the value is not stored with the service, not shown by `nimbus service describe`, and not visible in `docker inspect` as an environment variable.

Both work the same way. The difference is whether you can read the value back:

| | Secret | Config |
|---|---|---|
| Stored | encrypted with the Nimbus CA key | as is |
| `describe`, the API, the UI | never return the value | return the value (the UI opens it for editing) |
| On a swarm | Docker secret, mounted at `/run/secrets/<name>` (in memory) | Docker config, mounted at `/<name>` |
| On a cluster | `Secret` with one key, `<name>` | `ConfigMap` with one key, `<name>` |

Like a [service](services), each one belongs to a **swarm**, or to a **Kubernetes cluster** and a **namespace** (`default` unless you give one). A value can be up to 500 KB, Docker's limit.

## Create

The value comes from a file, from stdin, or from the command line:

```bash
# From a file
nimbus secret create --name db_password --swarm prod --from-file ./db_password.txt

# From stdin
openssl rand -hex 32 | nimbus secret create --name api_key --swarm prod

# A config on a cluster, in a namespace
nimbus config create --name nginx-conf --cluster k3s --namespace web --from-file ./nginx.conf
```

`--from-literal` also works, but for a secret the value then stays in your shell history. Prefer a file or stdin.

`--swarm` and `--cluster` accept an ID or a name.

Names follow the backend:
- **Swarm:** letters, digits, `-`, `_` and `.`, up to 52 characters.
- **Cluster:** a Kubernetes object name: lowercase letters, digits, `-` and `.`.

## Use it from a Compose stack

Declare it `external` at the top level under its Nimbus name, and list it on the services that read it:

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets: [db_password]
    configs:
      - source: pg_conf
        target: /etc/postgresql/postgresql.conf

secrets:
  db_password:
    external: true

configs:
  pg_conf:
    external: true
```

Docker cannot change a secret or config once it is created, so each value is its own Docker object, named `<name>-v<version>`. When Nimbus deploys the stack, it points each external declaration at the current object (`name: db_password-v3`) in the copy it sends to the swarm manager. The compose file you stored keeps the name you wrote. Inside the container the path stays the same: `/run/secrets/db_password`.

An external name that Nimbus doesn't manage is left alone, so a secret someone created with `docker secret create` still works.

## Use it from a manifest

On a cluster it is an ordinary `Secret` or `ConfigMap` named after it, holding one key with the same name:

```yaml
env:
  - name: DB_PASSWORD
    valueFrom:
      secretKeyRef: {name: db-password, key: db-password}
volumeMounts:
  - name: conf
    mountPath: /etc/nginx/conf.d
volumes:
  - name: conf
    configMap: {name: nginx-conf}
```

A manifest uses it when it names it, in the same namespace, through any of these fields:
- **Secrets:** `secretKeyRef`, `secretRef`, a `secret` volume or projected source, `imagePullSecrets`.
- **Configs:** `configMapKeyRef`, `configMapRef`, a `configMap` volume or projected source.

## Update: rotation

```bash
nimbus secret update db_password --from-file ./new_password.txt
```

An update stores the new value and bumps the version. The services using it pick it up:

- **Swarm:** Nimbus creates `<name>-v<next>` and redeploys every running stack that uses it, pointing each at the new object. It then removes the old objects. A stopped stack uses the new value when it next starts.
- **Cluster:** the `Secret` or `ConfigMap` is updated in place, then the Deployments, StatefulSets and DaemonSets of the manifests using it get a `rollout restart`, because a pod reads environment values only when it starts.

The activity dock shows each step.

## List, describe, delete

```bash
nimbus secret list                 # ID, name, target, version, the services using it, status
nimbus secret describe db_password # metadata only; never the value
nimbus config describe nginx-conf --value > nginx.conf   # a config's value, as stored
nimbus secret delete db_password
```

Anywhere an ID is accepted, a name works too, as long as only one secret (or config) has that name.

A secret or config that a service still uses cannot be deleted: the API answers `409` and names the services, because they would fail to start without it. Remove it from those services first. Deleting the swarm or cluster removes its secrets and configs too.

## In the web UI

**Configuration → Secrets** and **Configuration → Configs** list them with the services using each. Select one row and use the toolbar:
- **Replace value** (secrets): write a new value. The old one is never shown.
- **Edit** (configs): opens the current value.
- **Delete:** asks you to type the name. It is refused while services use the item.

Values can also be loaded from a file, including binary ones.

## How the value reaches the node

The value travels to the swarm manager or the cluster's control node in the agent task that creates the object, over the agent's mutual TLS connection. The copy stored with the task is removed as soon as the task finishes. The agent passes the value to `docker` on stdin, never on the command line, and does not log it.
