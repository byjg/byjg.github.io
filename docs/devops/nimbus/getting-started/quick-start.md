---
sidebar_position: 2
sidebar_label: "Quick Start"
title: "Quick Start"
---

# Quick Start

This guide walks you from a fresh install to a working DockNimbus setup with nodes ready for workloads.

## 1. Bootstrap and configure

**Option A: GUI** — Open `https://<API_HOST>:9443` in your browser, set the admin password, and click **Download Config** to save `nimbus-config.json`.

**Option B: CLI**

```bash
# Create the admin user (prints credentials and connection config)
nimbus bootstrap --api-url https://<API_HOST>:8443
# Save the connection_config block as nimbus-config.json
```

Then configure the CLI:

```bash
nimbus configure --from nimbus-config.json
```

If you're connecting from outside the WireGuard mesh (e.g. your laptop), override the API URL with the public IP:

```bash
nimbus configure --from nimbus-config.json --api-url https://<PUBLIC_IP>:8443
```

You can also configure manually:

```bash
nimbus configure \
  --api-url https://<API_HOST>:8443 \
  --access-key <ACCESS_KEY> \
  --secret-key <SECRET_KEY>
```

The configuration is saved to `~/.nimbus/config.json` with the API URL, credentials, and CA certificate embedded.

## 2. Add nodes

Register remote machines via SSH. This generates a join token, deploys the agent, configures WireGuard, and registers the node over the encrypted tunnel:

```bash
nimbus node add --ip 192.168.1.10 --user root
nimbus node add --ip 192.168.1.11 --user root
```

If the API server itself should also be a node:

```bash
sudo nimbus node add --local --ip <API_HOST_IP>
```

For nodes where SSH is not available (multi-cloud, NAT), generate a join token and run the agent manually:

```bash
# On the operator machine:
nimbus node add --get-token --ip <NODE_PUBLIC_IP>

# On the target node (copy the token from above): 
nimbus-agent --join --token <TOKEN>
```

## 3. Verify

```bash
nimbus node list
```

You should see your nodes with status `ready`:

```
ID              NAME  IP             STATUS  ROLE  AGENT  CPU        MEMORY
node-xxxxxxxx         192.168.1.10   ready   -     v0.2   4000/4000  7802MB/7802MB
node-yyyyyyyy         192.168.1.11   ready   -     v0.2   4000/4000  7802MB/7802MB
```

## Next steps

- [Deploy your first workload](first-workload)
- [Declare infrastructure with a manifest](../guides/manifest/overview)
