---
sidebar_position: 3
sidebar_label: "Security"
title: "Security Model"
---

# Security Model

DockNimbus uses layered security to protect control plane communication, inter-node traffic, and user authentication.

## mTLS (Agent ↔ API)

Every agent authenticates to the API server using mutual TLS with per-node client certificates.

During node join:
1. A join token is generated containing a one-time secret (SHA-256 hashed in the DB), WireGuard keys, and the CA certificate. Tokens expire after 10 minutes and are single-use.
2. The agent configures WireGuard and calls the join API over the encrypted tunnel.
3. The API validates the token, creates the node record, and issues a client certificate signed by the CA. The certificate's CommonName contains the node ID.
4. The CA cert, client cert, and client key are saved to the data directory on the node.
5. The agent uses these credentials for all subsequent API communication over WireGuard.

A token reserves a WireGuard IP and a peer on the control plane until it is used. If a deploy fails, the token is revoked (removing that peer), and if the join had already created the node record, the node is removed too. The node tears down the WireGuard tunnel it configured. Tokens that expire unused have their peer removed within 5 minutes.

If the host used to run a control plane, the join stops and disables `nimbus-api` and `nimbus-gui` and moves their files (including the old CA key and database) into `pre-join-backup-<timestamp>` directories under `/etc/nimbus` and `/var/lib/nimbus`. The join refuses to run while `nimbus-api` is running on the host.

Certificate revocation is supported via `nimbus node delete`, which revokes the node's certificate.

## SSH (Control Plane → Node)

Every SSH connection to a node, for `nimbus node add`, `nimbus node update` and manifest applies, is opened by the control plane, never by the CLI. SSH profiles keep their private keys and passwords encrypted with the control plane's CA key; a key passed with `--key` is read on your machine and sent to the control plane over the authenticated API.

Files for the node are copied into a private staging directory created with `mktemp` on the node, then installed with `install -o root -g root`, so the agent binary and its certificate are owned by root whatever the SSH user. A non-root SSH user must have passwordless `sudo`, which is checked before anything is copied. Connection attempts time out after 15 seconds.

## HMAC Authentication (CLI ↔ API)

CLI requests are signed using HMAC-SHA256. Each request includes:
- An `X-Access-Key` header identifying the key pair
- An `X-Signature` header containing the HMAC signature of the request
- An `X-Timestamp` header for replay protection

API key pairs are generated during `nimbus bootstrap` (for the admin user) or via `nimbus iam create-key`.

## JWT Authentication

As an alternative to HMAC, users can authenticate with username and password:

```bash
# Set a password
nimbus iam set-password --user-id USER_ID --password <password>

# Login to get a JWT token
nimbus iam login --username admin --password <password>

# Use the token (automatically set via NIMBUS_TOKEN env var)
export NIMBUS_TOKEN=<token>
nimbus node list
```

JWT tokens are short-lived (1 hour) and include the user ID, username, and admin flag.

## WireGuard Encryption (Node ↔ Node)

All inter-node traffic is encrypted via a full-mesh WireGuard VPN:

- The API server allocates overlay IPs from a configurable subnet (default: `10.106.103.0/24`)
- Each node generates a Curve25519 key pair during registration
- Peer configurations are distributed to all nodes automatically
- Docker Swarm gossip, K3s API, NFS mounts, and S3 traffic all route through the encrypted overlay

Public IPs are only used for WireGuard UDP endpoints, external DNS responses, and Cloudflare records. See [Networking](networking) for the complete IP interaction map.

## TLS (External Access)

The API server listens on `:8443` with TLS. By default, it generates a self-signed certificate and CA. The CA certificate can be downloaded via `GET /v1/ca` or is automatically saved during `nimbus bootstrap`.

A server certificate is only valid for the addresses it was issued for, so on startup the API checks its own certificate against the machine's current hostname and addresses and reissues it from the existing CA when it no longer covers them. `nimbus-gui` does the same for its certificate. The CA itself is created once and never regenerated — it is the root of trust for every node certificate it has issued, so replacing it would lock every agent out of the mesh. If the CA key is missing, the API refuses to start rather than mint a new one.

To reissue the API certificate immediately after moving the control plane, without waiting for a restart, see [`node update-ip --regenerate-cert`](../guides/node-dynamic-ip).

For production, you can provide your own certificates via `tls_cert` and `tls_key` in the API configuration. Operator-supplied certificates are never inspected or replaced — renewing them is up to you.
