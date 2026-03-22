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

## List and delete

```bash
nimbus s3 list
nimbus s3 delete S3_ID
```
