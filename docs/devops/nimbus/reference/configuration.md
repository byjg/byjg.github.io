---
sidebar_position: 3
sidebar_label: "Configuration"
title: "Configuration"
---

# Configuration

Config files are loaded in the following order:
1. Explicit `--config` flag path
2. Config directory (`/etc/nimbus/` for root, `~/.nimbus/` for non-root)

State files (database, TLS certs, keys) are stored in the data directory:
- `/var/lib/nimbus/` for root
- `~/.nimbus/` for non-root

## API Server (`api.yaml`)

```yaml
listen: ":8443"
db_path: "nimbus.db"                    # resolved to data directory
admin_secret_key: "change-me-in-production"
wireguard_subnet: "10.106.103.0/24"
local_domain: "nimbus"
# kubeconfig_endpoint: "public"         # "public", "overlay", or a specific IP
# tls_cert: "/path/to/server.crt"      # omit for auto-generated self-signed certs
# tls_key: "/path/to/server.key"
# cors:
#   - "https://192.168.1.100:9443"
```

| Field | Default | Description |
|-------|---------|-------------|
| `listen` | `:8443` | API listen address |
| `db_path` | `nimbus.db` | SQLite database path (resolved to data directory when relative) |
| `admin_secret_key` | | Secret key used for initial bootstrap authentication |
| `wireguard_subnet` | `10.106.103.0/24` | Subnet for WireGuard overlay IP allocation |
| `local_domain` | `nimbus` | Domain suffix for service DNS (e.g., `web-1.prod.nimbus`) |
| `kubeconfig_endpoint` | `public` | IP used in kubeconfig: `"public"`, `"overlay"`, or a specific IP/hostname |
| `tls_cert` | | Path to TLS certificate (omit for auto-generated self-signed) |
| `tls_key` | | Path to TLS private key |
| `cors` | auto-detect | List of allowed CORS origins. If not set, allows any origin in the same /24 subnet as the server's local IPs |

## Agent (`agent.yaml`)

```yaml
api_url: "https://control-node:8443"
heartbeat_interval_sec: 10
wireguard_port: 51820
tls_ca: "/var/lib/nimbus/ca.crt"
tls_cert: "/var/lib/nimbus/client.crt"
tls_key: "/var/lib/nimbus/client.key"
```

| Field | Default | Description |
|-------|---------|-------------|
| `api_url` | | API server URL |
| `heartbeat_interval_sec` | `10` | Seconds between heartbeats |
| `wireguard_port` | `51820` | WireGuard UDP listen port |
| `tls_ca` | | Path to CA certificate for API server verification |
| `tls_cert` | | Path to client certificate (mTLS) |
| `tls_key` | | Path to client private key |

## CLI (`~/.nimbus/config.json`)

This file is the same JSON returned by the API during bootstrap or API key creation. Download it from the GUI ("Download Config") or save it from the CLI bootstrap output, then import with `nimbus configure --from nimbus-config.json`.

```json
{
  "api_url": "https://10.106.103.1:8443",
  "access_key": "NBUSxxxx",
  "secret_key": "yyyy",
  "tls_ca": "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----\n"
}
```

| Field | Description |
|-------|-------------|
| `api_url` | API server URL (WireGuard IP) |
| `access_key` | HMAC access key (from bootstrap or `iam create-key`) |
| `secret_key` | HMAC secret key |
| `tls_ca` | CA certificate PEM (embedded, not a file path) |

## GUI Server (`gui.yaml`)

The GUI must be installed on the same host as the nimbus-api server.

```yaml
listen: ":9443"
# api_url is set automatically after bootstrap (WireGuard .1 IP).
# Override only if needed:
# api_url: "https://10.106.103.1:8443"
# tls_cert: "/path/to/gui.crt"
# tls_key: "/path/to/gui.key"
```

| Field | Default | Description |
|-------|---------|-------------|
| `listen` | `:9443` | GUI listen address (HTTPS) |
| `api_url` | *(auto-set after bootstrap)* | API server URL — set automatically to the WireGuard .1 IP. Override to use a custom address. |
| `tls_cert` | | Path to TLS certificate (omit for auto-generated) |
| `tls_key` | | Path to TLS private key |

TLS certificate behavior:
- If `tls_cert`/`tls_key` are set, those are used directly
- Otherwise, the GUI cert is auto-generated and signed by the API CA
