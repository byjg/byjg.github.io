---
sidebar_position: 1
sidebar_label: "CLI"
title: "CLI Reference"
---

# CLI Reference

All commands support `--config` (config file path, default: `~/.nimbus/config.json`) and `--token` (JWT bearer token, or `NIMBUS_TOKEN` env).

## nimbus configure

Configure CLI credentials. Import from a JSON config file (downloaded from the GUI or bootstrap) or set individual flags.

```bash
# Import from JSON (recommended)
nimbus configure --from nimbus-config.json

# Override the API URL (e.g. when connecting from outside the WireGuard mesh)
nimbus configure --from nimbus-config.json --api-url https://<PUBLIC_IP>:8443

# Manual configuration
nimbus configure --api-url URL --access-key KEY --secret-key SECRET
```

## nimbus bootstrap

Initialize the control plane and create the admin user.

```bash
nimbus bootstrap --api-url URL [--insecure]
```

## nimbus version

Show client and server versions.

## nimbus node

| Subcommand       | Description                   | Key Flags                                                                                                      |
|------------------|-------------------------------|----------------------------------------------------------------------------------------------------------------|
| `add`            | Add a node via SSH or locally | `--ip` (required), `--user`, `--port`, `--key`, `--password`, `--profile`, `--name`, `--local`, `--gpu-driver` |
| `update`         | Update the agent over SSH from the control plane | `[node-id]`, `--profile`, `--user`, `--port`, `--key`, `--password`, `--all`, `--local`          |
| `update-agent`   | Update agent binary via the agent task queue (no SSH) | `[node-id-or-name]`, `--all`                                           |
| `os-update`      | Upgrade OS packages on a node | `[node-id-or-name]`, `--all`                                                                                   |
| `list`           | List all nodes                |                                                                                                                |
| `events`         | Show a node's events (deploy steps, join failures, SSH updates) | `[node-id-or-ip]`                                               |
| `describe`       | Show node details             | `[id]`                                                                                                         |
| `drain`          | Drain a node                  | `[id]`                                                                                                         |
| `delete`         | Delete a node                 | `[id]`                                                                                                         |
| `update-ip`      | Change a node's IP / pinned interface | `[node-id]`, `--ip`, `--interface`, `--regenerate-cert`                                                |
| `gpu-overcommit` | Set GPU overcommit factor     | `[node-id]` `[factor]` (1, 2, 4, or 8)                                                                         |

There are two ways to update a node's agent. `update-agent` queues the work on the **agent's own task queue**: no SSH credentials, but the agent has to be reachable and the node `ready`. `update` works over **SSH**, so it also works when the agent is down. Reach for `update-agent` first, and fall back to `update` when an agent is unreachable.

Like `add`, `update` runs its SSH connection from the **control plane**, not from your machine. It can use a stored SSH profile (`--profile`), and it reaches nodes your machine cannot. A `--key` file is read on your machine and sent to the control plane. The control plane copies the agent binary and a freshly issued client certificate to a private staging directory on the node, installs them owned by root (the certificate goes to `/var/lib/nimbus`, where the agent reads it), and restarts the agent. A non-root SSH user needs passwordless `sudo`. Progress is recorded as node events (`ssh_update_started`, `ssh_update_completed` or `ssh_update_failed`), which `update` prints as they arrive; it exits non-zero if any node failed. `update --local` updates the agent on the machine you run it on, without SSH.

`os-update` runs a full OS package upgrade (`apt-get upgrade` / `dnf upgrade`) on the node through its agent — it does not use SSH. If the upgrade requires a reboot (for example a new kernel), the node transitions to the `needs_reboot` state and stops running tasks until an administrator reboots it manually; the agent never reboots on its own. Use `--all` to queue the upgrade on every ready node.

Because the upgrade can take several minutes, the task reports a `running` status while it is in progress (visible in the node's task list in the UI and via `nimbus task list`). When it finishes, the package-manager output is stored on the task result — inspect it with `nimbus task show <task-id>`.

`update-ip` records a node's new address and pins the interface the agent watches for future changes. For the **control-plane** node, add `--regenerate-cert`: the API's TLS certificate lists the addresses it was issued for, so after the control plane moves, clients cannot verify it on the new one. The flag reissues that certificate from the existing CA and swaps it in without a restart — agents and already-downloaded connection configs keep working, since the CA is unchanged. See [Handling Dynamic Node IPs](../guides/node-dynamic-ip).

The agent also checks for available OS package updates automatically once per day and reports the counts back to the control plane. `nimbus node list` shows an `UPDATES` column (total, with the security subset in parentheses; `-` means the node has not reported a check yet), and the node detail view shows the same along with when it was last checked. Nothing is installed automatically — use `os-update` when you want to apply them.

## nimbus swarm

| Subcommand  | Description          | Key Flags                                   |
|-------------|----------------------|---------------------------------------------|
| `create`    | Create a swarm group | `--name` (required), `--lb`, `--cloudflare` |
| `add-node`  | Add node to swarm    | `--swarm` (required), `--node` (required)   |
| `list`      | List swarms          |                                             |
| `delete`    | Delete a swarm       | `[id]`                                      |
| `lb set`    | Deploy EasyHAProxy   | `--swarm` (required)                        |
| `lb remove` | Remove EasyHAProxy   | `--swarm` (required)                        |
| `lb list`   | List load balancers  |                                             |

## nimbus compute

| Subcommand       | Description           | Key Flags                                                                                                                                                   |
|------------------|-----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `run`            | Create an instance    | `--name`, `--image` (required), `--swarm` or `--k8s`, `--type`, `--replicas`, `--port`, `--domain`, `--volume`, `--env`, `--command`, `--platform`, `--gpu` |
| `scale`          | Scale replicas        | `--id` (required), `--replicas` (required)                                                                                                                  |
| `list`           | List instances        |                                                                                                                                                             |
| `describe`       | Show instance details | `[id]`                                                                                                                                                      |
| `terminate`      | Terminate an instance | `[id]`                                                                                                                                                      |
| `stop`           | Stop an instance      | `[id]`                                                                                                                                                      |
| `start`          | Start an instance     | `[id]`                                                                                                                                                      |
| `logs`           | Fetch instance logs   | `[id]`, `-n` (lines), `-w` (follow)                                                                                                                         |
| `instance-types` | List instance types   |                                                                                                                                                             |
| `volume attach`  | Attach volume         | `--instance` (required), `--volume` (required)                                                                                                              |
| `volume detach`  | Detach volume         | `--instance` (required), `--volume` (required)                                                                                                              |

## nimbus k8s

| Subcommand       | Description                | Key Flags                                                        |
|------------------|----------------------------|------------------------------------------------------------------|
| `create-cluster` | Create a K3s cluster       | `--name` (required), `--nodes` (required, comma-separated)       |
| `kubeconfig`     | Get kubeconfig             | `--name` (required)                                              |
| `add-node`       | Add worker node            | `--cluster` (required), `--node` (required)                      |
| `remove-node`    | Remove worker node         | `--cluster` (required), `--node` (required)                      |
| `list`           | List clusters              |                                                                  |
| `delete-cluster` | Delete a cluster           | `[id]`                                                           |
| `volume attach`  | Attach NFS volume (PV+PVC) | `--cluster` (required), `--name` (required), `--size` (required) |
| `volume detach`  | Detach NFS volume          | `--cluster` (required), `--name` (required)                      |

## nimbus s3

| Subcommand  | Description           | Key Flags                                                                                              |
|-------------|-----------------------|--------------------------------------------------------------------------------------------------------|
| `create`    | Deploy MinIO instance | `--name` (required), `--swarm` (required), `--volume` (required), `--password`, `--license`, `--certs` |
| `list`      | List S3 instances     |                                                                                                        |
| `delete`    | Delete S3 instance    | `[id]`                                                                                                 |

## nimbus volume

| Subcommand  | Description       | Key Flags                                                       |
|-------------|-------------------|-----------------------------------------------------------------|
| `create`    | Create NFS volume | `--name` (required), `--node` (required), `--folder` (required) |
| `list`      | List volumes      |                                                                 |
| `delete`    | Delete volume     | `[id]`                                                          |

## nimbus service

| Subcommand  | Description          | Key Flags                                                                |
|-------------|----------------------|--------------------------------------------------------------------------|
| `deploy`    | Deploy compose stack | `--file` (required), `--swarm` (required), `--name`, `--env`, `--volume` |
| `list`      | List services        |                                                                          |
| `describe`  | Show service details | `[id]`                                                                   |
| `stop`      | Stop a service       | `[id]`                                                                   |
| `start`     | Start a service      | `[id]`                                                                   |
| `remove`    | Remove service       | `[id]`                                                                   |

## nimbus manifest

| Subcommand  | Description               | Key Flags                               |
|-------------|---------------------------|-----------------------------------------|
| `apply`     | Provision from manifest   | `--file` (required), `--env`, `--prune` |
| `remove`    | Remove manifest resources | `--file` (required), `--env`            |

## nimbus ssh-profile

Manage SSH profiles — named, reusable SSH credential sets stored encrypted in the database. Sensitive data (private keys, passwords) is encrypted using the control plane's CA key.

| Subcommand  | Description           | Key Flags                                                      |
|-------------|-----------------------|----------------------------------------------------------------|
| `create`    | Create an SSH profile | `--name` (required), `--user`, `--port`, `--key`, `--password` |
| `list`      | List SSH profiles     |                                                                |
| `delete`    | Delete an SSH profile | `[id]`                                                         |

At least one of `--key` (path to private key file) or `--password` is required. The `--key` flag reads the file and stores its content encrypted — the original file is not needed afterward.

```bash
# Create a profile with an SSH key
nimbus ssh-profile create --name prod-servers --user deploy --key ~/.ssh/id_ed25519

# Create a profile with password auth
nimbus ssh-profile create --name staging --user root --password secret123

# List profiles (sensitive data is never shown)
nimbus ssh-profile list

# Delete a profile
nimbus ssh-profile delete sshp-a1b2c3d4
```

SSH profiles are referenced in manifests via `ssh.profile`:

```yaml
nodes:
  web1:
    ip: 192.168.1.10
    ssh:
      profile: prod-servers
```

## nimbus certificate

Manage TLS certificates for SNI-based multi-domain serving. Certificates are stored in the
database and served immediately — no restart required. The default WireGuard IP cert
(`10.106.103.1`) is built-in and cannot be deleted.

| Subcommand | Description              | Key Flags                                                      |
|------------|--------------------------|----------------------------------------------------------------|
| `list`     | List certificates        |                                                                |
| `add`      | Add a TLS certificate    | `--domain` (required), `--cert` (required), `--key` (required), `--ca` |
| `delete`   | Delete a certificate     | `[id]`                                                         |

```bash
# Add a Let's Encrypt certificate for a public domain
nimbus certificate add \
  --domain nimbus.example.com \
  --cert /etc/letsencrypt/live/nimbus.example.com/fullchain.pem \
  --key  /etc/letsencrypt/live/nimbus.example.com/privkey.pem

# Add a certificate with a custom CA (for internal PKI)
nimbus certificate add \
  --domain internal.example.com \
  --cert /path/to/cert.pem \
  --key  /path/to/key.pem \
  --ca   /path/to/ca.pem

# List all certificates
nimbus certificate list

# Delete a certificate
nimbus certificate delete cert-a1b2c3d4
```

See [Exposing OIDC/OAuth2 Publicly](../guides/oidc-public-proxy) for a full setup guide.

## nimbus dns

| Subcommand  | Description                    | Key Flags    |
|-------------|--------------------------------|--------------|
| `setup`     | Configure local DNS resolution | `--swarm-id` |
| `remove`    | Remove DNS configuration       | `--swarm-id` |

## nimbus gateway

| Subcommand  | Description                |
|-------------|----------------------------|
| `status`    | Show gateway routing table |

## nimbus iam

| Subcommand       | Description               | Key Flags                                        |
|------------------|---------------------------|--------------------------------------------------|
| `create-user`    | Create a user             | `--email` (required), `--name`, `--admin`        |
| `delete-user`    | Delete a user             | `<user-id>` (arg)                                |
| `create-key`     | Generate API key pair     | `--user-id` (required)                           |
| `get-token`      | Get JWT token (HMAC auth) |                                                  |
| `set-password`   | Set user password         | `--user-id` (required), `--password` (required)  |
| `login`          | Login with password       | `--email` (required), `--password` (required)    |

### nimbus iam group

| Subcommand   | Description                   | Key Flags                                              |
|--------------|-------------------------------|--------------------------------------------------------|
| `list`       | List all groups               |                                                        |
| `create`     | Create a group                | `--name` (required), `--description`, `--scope` (repeatable) |
| `delete`     | Delete a custom group         | `<group-id>` (arg)                                     |
| `set-scopes` | Replace a group's scope list  | `--group` (required), `--scope` (repeatable)           |

### nimbus iam scope

| Subcommand   | Description                        | Key Flags                              |
|--------------|------------------------------------|----------------------------------------|
| `list`       | List all registered ARN scopes     |                                        |
| `register`   | Register a new scope               | `--scope` (required), `--description`  |
| `unregister` | Remove a registered scope          | `<scope>` (arg)                        |

### nimbus iam client

Manage OAuth2 clients used by external services (Grafana, ArgoCD, Nextcloud, etc.) to authenticate via Nimbus SSO.

| Subcommand | Description               | Key Flags                                                      |
|------------|---------------------------|----------------------------------------------------------------|
| `list`     | List all OAuth2 clients   |                                                                |
| `create`   | Create an OAuth2 client   | `--name` (required), `--redirect-uri` (required, repeatable)  |
| `delete`   | Delete an OAuth2 client   | `<id>` (arg — use the `ID` column from `list`, not Client ID) |

The `create` command prints the **Client ID** and **Client Secret**. The secret is shown only once — save it immediately.

```bash
# Register a client for Grafana
nimbus iam client create \
  --name grafana \
  --redirect-uri "https://grafana.example.com/login/generic_oauth"

# Register a client with multiple redirect URIs
nimbus iam client create \
  --name argocd \
  --redirect-uri "https://argocd.example.com/auth/callback" \
  --redirect-uri "https://argocd-staging.example.com/auth/callback"

# List all clients
nimbus iam client list

# Delete a client (use the ID column, not the client_id)
nimbus iam client delete oac-abc123
```

### nimbus iam user-group

| Subcommand | Description                   | Key Flags                                |
|------------|-------------------------------|------------------------------------------|
| `list`     | List a user's groups          | `--user` (required)                      |
| `add`      | Add user to a group           | `--user` (required), `--group` (required)|
| `remove`   | Remove user from a group      | `--user` (required), `--group` (required)|

## nimbus cleanup

Force-clean a resource stuck in error state.

```bash
nimbus cleanup [resource-type] [resource-id]
```

Valid resource types: `instance`, `cluster`, `s3`, `loadbalancer`, `swarm`, `volume`.
