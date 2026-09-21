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

## Service status and replicas

`nimbus service list` shows the live state of each stack as observed on the swarm:

```
ID          NAME      SWARM       REPLICAS  STATUS   REASON  CREATED
svc-xxxxxx  my-stack  swarm-xxxx  3         running          2026-07-06T12:00:00Z
```

- **REPLICAS** is the number of tasks actually running across the stack's services (not the desired count from the compose file).
- **STATUS** starts as `pending` when a deploy is queued and only becomes `running` once the agent on the swarm manager confirms the stack's tasks are up. If tasks fail or the stack disappears from the swarm, the status changes to `error` or `not_found` with the reason in **REASON**.

The agent on each swarm manager watches its workloads continuously (Docker events plus a periodic sync) and pushes changes to the API with its heartbeat, so the CLI and the web UI reflect real state within roughly the heartbeat interval (10 seconds by default) — including for services deployed through manifests. A service whose node stops sending heartbeats is marked `error` with reason `node offline`.

### Drift

A service you stopped through DockNimbus, but which is running on the swarm anyway, is reported as `drifted` rather than being quietly changed to `running`. That happens when someone scales the stack back up directly in Docker: what DockNimbus recorded and what the swarm is doing no longer agree, and neither is assumed to be the one you meant.

Resolve it whichever way you intended:

- `nimbus service stop SERVICE_ID` enforces the recorded state and stops it again.
- `nimbus service start SERVICE_ID` adopts what is running, and the status returns to `running`.

Doing nothing is also fine — the status stays `drifted`, and if the stack later stops on its own it goes back to `stopped` by itself.
