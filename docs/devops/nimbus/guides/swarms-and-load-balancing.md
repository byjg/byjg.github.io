---
sidebar_position: 5
sidebar_label: "Swarms & Load Balancing"
title: "Docker Swarms & Load Balancing"
---

# Docker Swarms & Load Balancing

Docker Swarms group nodes into a cluster for running compute instances and services. EasyHAProxy provides automatic load balancing and ingress routing.

## Create a swarm

```bash
nimbus swarm create --name production --lb
```

The `--lb` flag automatically deploys EasyHAProxy as a load balancer.

### Cloudflare integration

```bash
nimbus swarm create --name production --lb \
  --cloudflare /path/to/cloudflare.env
```

The env file should contain `CLOUDFLARE_TOKEN` and `CLOUDFLARE_DOMAIN`.

## Add and remove nodes

```bash
nimbus swarm add-node --swarm SWARM_ID --node NODE_ID
```

The first node becomes the manager; additional nodes join as workers.

The join runs on the node in the background. Once it succeeds, the node's local DNS is pointed at the manager for the swarm's domain. If it fails, the node is taken out of the swarm and the swarm keeps its status. The reason is recorded as a `swarm_join_failed` event:

```bash
nimbus node events NODE_ID
```

The most common reason is a Docker daemon that won't start on the node. The event then includes the state of `docker.service` and dockerd's last log line; `journalctl -u docker` on the node shows the rest.

## List swarms

```bash
nimbus swarm list
```

## Load balancer management

If you didn't use `--lb` at creation time, you can manage the load balancer separately:

```bash
# Deploy EasyHAProxy
nimbus gateway lb set --swarm SWARM_ID

# List load balancers
nimbus gateway lb list

# Delete the load balancer
nimbus gateway lb delete --swarm SWARM_ID
```

## Gateway status

View the routing table showing how domains are mapped to services:

```bash
nimbus gateway status
```

## Local DNS

Configure your workstation to resolve swarm domains (e.g., `web-1.production.nimbus`) via dnsmasq running on the swarm manager:

```bash
sudo nimbus dns create
```

This configures `systemd-resolved` to forward queries for swarm domains to the manager node's dnsmasq. To remove:

```bash
sudo nimbus dns delete
```

## Unmanaged resources

DockNimbus manages only the resources it created, so anything you deploy straight to Docker stays outside its control. The swarm's detail page in the web UI has an **Unmanaged Resources** panel that shows those services, so a swarm is not a place where things can hide.

Press **Scan** to run it. The scan is manual rather than automatic because each run queues a task on the swarm manager, and its result is never stored — it is a live look at the swarm, accurate as of the moment you pressed the button.

DockNimbus's own services are excluded: instances, the load balancer, local DNS, and every service belonging to a stack deployed through DockNimbus, including stacks whose services carry no DockNimbus label of their own.

The panel is read-only. It shows you what is there; stopping it is still done through Docker.

## Delete a swarm

```bash
nimbus swarm delete SWARM_ID          # load balancer and nodes removed first
nimbus swarm delete SWARM_ID --force  # removes the load balancer, every node leaves
```

A swarm that still has instances or services Nimbus manages (that are not terminated) cannot be
deleted: delete them first. The same holds for removing its last node, or deleting that node.

Every member leaves the Docker swarm, and the swarm shows as `deleting` until they all have. A node
whose agent is offline leaves when it comes back, so the swarm is never removed while a node is still
in it. If a leave fails, the swarm stays in `error` with that node still listed; run the delete again once
the node is fixed, and its leave is retried.
Removing the last node with `nimbus swarm remove-node` deletes the swarm the same way.

While a swarm is `deleting`, its name cannot be reused.
