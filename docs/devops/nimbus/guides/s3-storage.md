---
sidebar_position: 4
sidebar_label: "S3 Storage"
title: "S3 Storage (RustFS)"
---

# S3 Storage (RustFS)

DockNimbus deploys [RustFS](https://github.com/rustfs/rustfs) (`rustfs/rustfs:1.0.0`) as a Docker Swarm
service for S3-compatible object storage. Each instance serves two domains through the swarm's
EasyHAProxy:

| Domain | Port | Serves |
|--------|------|--------|
| `<name>.<swarm>.<local_domain>` | 9000 | S3 API |
| `console-<name>.<swarm>.<local_domain>` | 9001 | Web console (under `/rustfs/console/`) |

## Prerequisites

- An active Docker Swarm with at least one node
- An NFS volume for data persistence

RustFS runs as a non-root user (uid `10001`). When the instance is created, Nimbus makes that user the
owner of the volume's folder on the volume's node, so the folder should be dedicated to the instance.

## Deploy an S3 instance

```bash
# Create a volume for the data
nimbus volume create --name s3-data --node NODE_ID --folder /srv/nimbus/s3

# Deploy RustFS on the swarm
nimbus s3 create --name my-store --swarm SWARM_ID --volume VOL_ID
```

If you omit `--password`, a root password is auto-generated and displayed in the output. A password
you choose must be at least 8 characters.

### Optional flags

| Flag | Description |
|------|-------------|
| `--password` | Root secret key, at least 8 characters |
| `--oidc-cert` | Certificate ID to enable console SSO through Nimbus via that domain |

## Authentication

### Console SSO via OIDC (recommended)

To enable SSO on the console, pass the ID of a TLS certificate registered with
`nimbus certificate create`. Nimbus registers an OAuth2 client for the instance and configures RustFS
to use that certificate's domain as the issuer. The console then offers to sign in through Nimbus.

```bash
# First register a certificate for your public domain
nimbus certificate create \
  --domain nimbus.example.com \
  --cert /etc/letsencrypt/live/nimbus.example.com/fullchain.pem \
  --key  /etc/letsencrypt/live/nimbus.example.com/privkey.pem

# Deploy RustFS with console SSO on that domain
nimbus s3 create --name my-store --swarm SWARM_ID --volume VOL_ID \
  --oidc-cert <CERT_ID>
```

The OIDC issuer URL is resolved dynamically: when a request arrives at `nimbus.example.com`, Nimbus
automatically uses that domain as the issuer — no config file changes or restarts required. See
[TLS Certificates](../reference/configuration.md#oidc-issuer-url) for details. RustFS must trust the
certificate, so use one from a public CA (e.g. Let's Encrypt).

Console access is granted with the instance's IAM scopes. The OAuth2 client's ID is the S3 instance
ID, and the token sent to the console carries the RustFS policy for the permission the user holds:

| IAM scope | RustFS policy | Console access |
|-----------|---------------|----------------|
| `nimbus:s3:<id>:admin` | `consoleAdmin` | Full admin |
| `nimbus:s3:<id>:readwrite` | `readwrite` | Read and write data |
| `nimbus:s3:<id>:read` | `readonly` | Read-only |

The wildcards `nimbus:s3:*:admin`, `nimbus:s3:*:readwrite` and `nimbus:s3:*:read` cover every
instance. Admin users hold `nimbus:s3:*:admin` through the built-in `admin` group, and the
`admin-read` group holds `nimbus:s3:*:read`. A user without any of these scopes cannot sign in to the
console. Assign scopes in **IAM** or with `nimbus iam`; see [IAM](iam).

Deleting the instance removes its OAuth2 client and every `nimbus:s3:<id>:*` scope assigned to users
and groups.

See [OIDC / OAuth2](../concepts/oidc) for the full provider documentation.

### Static credentials

The S3 API is also accessible with the root credentials — useful for API clients, CLIs, or SDKs:

- **Access key:** `admin`
- **Secret key:** the password given at creation time (or the auto-generated value printed in the `nimbus s3 create` output)
- **Region:** `us-east-1`

```bash
aws --endpoint-url http://<S3_DOMAIN> s3 ls
```

The API supports path-style addressing (`http://<S3_DOMAIN>/<bucket>/<key>`); configure SDKs with
`force_path_style = true`.

## List and delete

```bash
nimbus s3 list
nimbus s3 delete S3_ID
```

`nimbus s3 list` shows both the S3 domain and the console domain of each instance.
