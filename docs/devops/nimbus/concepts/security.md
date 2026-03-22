---
sidebar_position: 3
sidebar_label: "Security"
title: "Security Model"
---

# Security Model

DockNimbus uses layered security to protect control plane communication, inter-node traffic, and user authentication.

## mTLS (Agent <-> API)

Every agent authenticates to the API server using mutual TLS with per-node client certificates.

During node join:
1. A join token is generated containing a one-time secret (SHA-256 hashed in the DB), WireGuard keys, and the CA certificate. Tokens expire after 10 minutes and are single-use.
2. The agent configures WireGuard and calls the join API over the encrypted tunnel.
3. The API validates the token, creates the node record, and issues a client certificate signed by the CA. The certificate's CommonName contains the node ID.
4. The CA cert, client cert, and client key are saved to the data directory on the node.
5. The agent uses these credentials for all subsequent API communication over WireGuard.

Certificate revocation is supported via `nimbus node delete`, which revokes the node's certificate.

## HMAC Authentication (CLI <-> API)

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

## WireGuard Encryption (Node <-> Node)

All inter-node traffic is encrypted via a full-mesh WireGuard VPN:

- The API server allocates overlay IPs from a configurable subnet (default: `10.106.103.0/24`)
- Each node generates a Curve25519 key pair during registration
- Peer configurations are distributed to all nodes automatically
- Docker Swarm gossip, K3s API, NFS mounts, and S3 traffic all route through the encrypted overlay

Public IPs are only used for WireGuard UDP endpoints, external DNS responses, and Cloudflare records. See [Networking](networking) for the complete IP interaction map.

## TLS (External Access)

The API server listens on `:8443` with TLS. By default, it generates a self-signed certificate and CA. The CA certificate can be downloaded via `GET /v1/ca` or is automatically saved during `nimbus bootstrap`.

For production, you can provide your own certificates via `tls_cert` and `tls_key` in the API configuration.
