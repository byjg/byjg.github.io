---
sidebar_position: 4
sidebar_label: "S3 Storage"
title: "S3 Storage (MinIO)"
---

# S3 Storage (MinIO)

DockNimbus deploys MinIO as a Docker Swarm service for S3-compatible object storage.

## Prerequisites

- An active Docker Swarm with at least one node
- An NFS volume for data persistence

## Deploy an S3 instance

```bash
# Create a volume for MinIO data
nimbus volume create --name minio-data --node NODE_ID --folder /srv/nimbus/minio

# Deploy MinIO on the swarm
nimbus s3 create --name my-store --swarm SWARM_ID --volume VOL_ID
```

If you omit `--password`, a root password is auto-generated and displayed in the output.

### Optional flags

| Flag | Description |
|------|-------------|
| `--password` | MinIO root password |
| `--license` | Path to MinIO license file (enables enterprise image) |
| `--certs` | Path to TLS certificate PEM file |
| `--oidc-cert` | Certificate ID to enable browser SSO via that domain |

## Authentication

### SSO via OIDC (recommended)

To enable browser SSO, pass the ID of a TLS certificate registered with `nimbus certificate add`. Nimbus creates a dedicated OAuth2 client and injects the OIDC settings into the MinIO service using that certificate's domain as the issuer URL. The MinIO console shows a **Login with SSO** button that authenticates users through Nimbus.

```bash
# First register a certificate for your public domain
nimbus certificate add \
  --domain nimbus.example.com \
  --cert /etc/letsencrypt/live/nimbus.example.com/fullchain.pem \
  --key  /etc/letsencrypt/live/nimbus.example.com/privkey.pem

# Deploy MinIO with OIDC SSO enabled on that domain
nimbus s3 create --name my-store --swarm SWARM_ID --volume VOL_ID \
  --oidc-cert <CERT_ID>
```

The OIDC issuer URL is resolved dynamically: when a request arrives at `nimbus.example.com`, Nimbus automatically uses that domain as the issuer — no config file changes or restarts required. See [TLS Certificates](../reference/configuration.md#oidc-issuer-url) for details.

Access is controlled by the user's assigned scopes:

| Scope | MinIO access |
|-------|-------------|
| `s3:admin` | Full admin access |
| `s3:read` | Read-only access |

Admin users receive both scopes by default. Scopes are assigned per-user via **IAM > user detail > OAuth2 Clients**.

See [OIDC / OAuth2](../concepts/oidc) for the full provider documentation.

### Static credentials

MinIO is also accessible via its root credentials — useful for API clients, `mc`, or SDKs:

- **Access key:** `minioadmin`
- **Secret key:** the password shown at creation time (or the auto-generated value printed in the `nimbus s3 create` output)

```bash
mc alias set my-store http://<MINIO_DOMAIN>:9000 minioadmin <SECRET_KEY>
```

## List and delete

```bash
nimbus s3 list
nimbus s3 delete S3_ID
```
