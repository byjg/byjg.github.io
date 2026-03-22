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

## List swarms

```bash
nimbus swarm list
```

## Load balancer management

If you didn't use `--lb` at creation time, you can manage the load balancer separately:

```bash
# Deploy EasyHAProxy
nimbus swarm lb set --swarm SWARM_ID

# List load balancers
nimbus swarm lb list

# Remove EasyHAProxy
nimbus swarm lb remove --swarm SWARM_ID
```

## Gateway status

View the routing table showing how domains are mapped to services:

```bash
nimbus gateway status
```

## Local DNS

Configure your workstation to resolve swarm domains (e.g., `web-1.production.nimbus`) via dnsmasq running on the swarm manager:

```bash
sudo nimbus dns setup
```

This configures `systemd-resolved` to forward queries for swarm domains to the manager node's dnsmasq. To remove:

```bash
sudo nimbus dns remove
```

## Delete a swarm

```bash
nimbus swarm delete SWARM_ID
```
