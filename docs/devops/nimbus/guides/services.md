---
sidebar_position: 6
sidebar_label: "Services"
title: "Docker Compose Services"
---

# Docker Compose Services

Deploy Docker Compose stacks to a Docker Swarm. Services are deployed as Docker Swarm stacks and can reference NFS volumes from DockNimbus.

## Deploy a service

```bash
nimbus service deploy \
  --name my-stack \
  --swarm SWARM_ID \
  --file docker-compose.yml
```

### With environment variables

```bash
nimbus service deploy \
  --name my-stack \
  --swarm SWARM_ID \
  --file docker-compose.yml \
  --env DB_HOST=postgres \
  --env DB_PASSWORD=secret
```

### With volume mappings

Map Compose volume names to DockNimbus NFS volumes:

```bash
nimbus service deploy \
  --name my-stack \
  --swarm SWARM_ID \
  --file docker-compose.yml \
  --volume data:VOL_ID
```

Where `data` is the volume name in your `docker-compose.yml` and `VOL_ID` is the DockNimbus volume.

## Stop and start

Stop a service (removes the stack from Docker, preserves config in DockNimbus):

```bash
nimbus service stop SERVICE_ID
```

Start a stopped service (redeploys from the stored compose file):

```bash
nimbus service start SERVICE_ID
```

## List, describe, and remove

```bash
nimbus service list
nimbus service describe SERVICE_ID
nimbus service remove SERVICE_ID
```
