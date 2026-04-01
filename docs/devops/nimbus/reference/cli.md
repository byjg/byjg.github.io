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
| `update`         | Update agent binary           | `[node-id]`, `--user`, `--port`, `--key`, `--password`, `--all`, `--local`                                     |
| `list`           | List all nodes                |                                                                                                                |
| `describe`       | Show node details             | `[id]`                                                                                                         |
| `drain`          | Drain a node                  | `[id]`                                                                                                         |
| `delete`         | Delete a node                 | `[id]`                                                                                                         |
| `gpu-overcommit` | Set GPU overcommit factor     | `[node-id]` `[factor]` (1, 2, 4, or 8)                                                                         |

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

| Subcommand  | Description           | Key Flags                                              |
|-------------|-----------------------|--------------------------------------------------------|
| `create`    | Create an SSH profile | `--name` (required), `--user`, `--port`, `--key`, `--password` |
| `list`      | List SSH profiles     |                                                        |
| `delete`    | Delete an SSH profile | `[id]`                                                 |

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

| Subcommand     | Description               | Key Flags                                        |
|----------------|---------------------------|--------------------------------------------------|
| `create-user`  | Create a user             | `--username` (required), `--admin`               |
| `create-key`   | Generate API key pair     | `--user-id` (required)                           |
| `get-token`    | Get JWT token (HMAC auth) |                                                  |
| `set-password` | Set user password         | `--user-id` (required), `--password` (required)  |
| `login`        | Login with password       | `--username` (required), `--password` (required) |

## nimbus cleanup

Force-clean a resource stuck in error state.

```bash
nimbus cleanup [resource-type] [resource-id]
```

Valid resource types: `instance`, `cluster`, `s3`, `loadbalancer`, `swarm`, `volume`.
