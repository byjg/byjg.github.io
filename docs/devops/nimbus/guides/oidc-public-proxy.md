---
sidebar_position: 8
sidebar_label: "OIDC Public Proxy"
title: "Exposing OIDC/OAuth2 Publicly"
---

# Exposing OIDC/OAuth2 Publicly

By default the Nimbus OIDC provider issues tokens with the WireGuard `.1` address as the
issuer (`https://10.106.103.1:8443`). This is sufficient for K3s and agents — they
communicate internally — but browser-based SSO (MinIO console login) requires users'
browsers to reach the OIDC endpoints too.

Nimbus is **domain-aware**: once you register a TLS certificate for a public domain via
`nimbus certificate add`, OIDC discovery requests arriving at that domain automatically
receive a response with that domain as the issuer. No config file changes or restarts needed.

There are two approaches depending on your security requirements:

| | [Direct access](#approach-1-direct-access) | [Proxy](#approach-2-hardened-proxy) |
|--|--|--|
| OIDC endpoints exposed | All OIDC paths via port 8443 | Only OIDC paths via port 443 |
| API exposed publicly | Yes (port 8443 open) | No |
| Complexity | Low — just a CLI command | Medium — extra service |
| Certificate management | `nimbus certificate add` | Let's Encrypt + static-httpserver |

---

## Approach 1: Direct access

The Nimbus API already listens on all interfaces (`0.0.0.0:8443`). By adding a public
TLS certificate and opening port 8443, browsers can reach the OIDC endpoints directly.
K3s and agents continue using the WireGuard IP with the default Nimbus cert — unaffected.

### Step 1 — Obtain a TLS certificate

Get a trusted certificate for your public domain (e.g. Let's Encrypt via certbot):

```bash
certbot certonly --standalone -d nimbus.example.com
```

### Step 2 — Add the certificate to Nimbus

```bash
nimbus certificate add \
  --domain nimbus.example.com \
  --cert /etc/letsencrypt/live/nimbus.example.com/fullchain.pem \
  --key  /etc/letsencrypt/live/nimbus.example.com/privkey.pem
```

The cert is stored in the database and loaded immediately — no restart required.
When a browser connects to `nimbus.example.com:8443`, Nimbus serves this cert via SNI.
All other clients (agents, K3s) connecting via the WireGuard IP still get the default cert.

### Step 3 — Open port 8443

Allow inbound TCP on port 8443 from the internet on your firewall/security group.

Once the certificate is registered, nimbus automatically uses `https://nimbus.example.com` as the OIDC issuer for any request arriving at that hostname — no restart or config file change required.

### Network requirements

| Port | Protocol | Open publicly |
|------|----------|--------------|
| `8443` | TCP | Yes — browser OIDC + (full API) |
| `51820` | UDP | No — WireGuard mesh only |

---

## Approach 2: Hardened proxy

For maximum security, only the OIDC endpoints are exposed — all other API paths remain
unreachable from the internet. This uses
[`static-httpserver`](https://github.com/byjg/docker-static-httpserver) v0.4.0+ as a
TLS-terminating reverse proxy on port 443.

```
Browser ──HTTPS (public cert)──► static-httpserver ──HTTPS (Nimbus CA)──► nimbus-api
                                   (port 443)         (WireGuard only)     (port 8443)
                                   OIDC paths only
```

The OIDC discovery document returns `https://nimbus.example.com` as the issuer for
requests arriving at that hostname — so browser redirects go through the proxy.
K3s and agents still use the WireGuard IP directly.

### Step 1 — Install static-httpserver

```bash
# Debian/Ubuntu
sudo apt install static-httpserver

# RHEL/Fedora
sudo dnf install static-httpserver
```

Or download from the [releases page](https://github.com/byjg/docker-static-httpserver/releases).

### Step 3 — Run the proxy

Create an empty root directory (no static files needed — all traffic is proxied):

```bash
sudo mkdir -p /var/www/nimbus-proxy
```

:::note Let's Encrypt cert format
Let's Encrypt names its files `fullchain.pem` and `privkey.pem`. static-httpserver
expects `cert.pem` and `key.pem`. Symlink them:
```bash
ln -s /etc/letsencrypt/live/nimbus.example.com/fullchain.pem \
      /etc/letsencrypt/live/nimbus.example.com/cert.pem
ln -s /etc/letsencrypt/live/nimbus.example.com/privkey.pem \
      /etc/letsencrypt/live/nimbus.example.com/key.pem
```
:::

Start static-httpserver, exposing only the OIDC endpoints:

```bash
static-httpserver \
  --root-dir /var/www/nimbus-proxy \
  --tls-port 443 \
  --tls-cert-dir /etc/letsencrypt/live/nimbus.example.com \
  --proxy /.well-known/openid-configuration=https://10.106.103.1:8443/.well-known/openid-configuration \
  --proxy /keys=https://10.106.103.1:8443/keys \
  --proxy /authorize=https://10.106.103.1:8443/authorize \
  --proxy /oauth/token=https://10.106.103.1:8443/oauth/token \
  --proxy /login=https://10.106.103.1:8443/login \
  --proxy /callback=https://10.106.103.1:8443/callback \
  --proxy /userinfo=https://10.106.103.1:8443/userinfo \
  --proxy /revoke=https://10.106.103.1:8443/revoke \
  --proxy /end_session=https://10.106.103.1:8443/end_session \
  --proxy-ca /var/lib/nimbus/ca.crt
```

The `--proxy-ca` flag makes static-httpserver trust the Nimbus self-signed CA when
connecting to the backend. Everything else — `/v1/nodes`, `/v1/bootstrap`, etc. —
returns `404` from the static server and never reaches the API.

### Step 4 — Run as a systemd service

Create `/etc/systemd/system/nimbus-oidc-proxy.service`:

```ini
[Unit]
Description=Nimbus OIDC Public Proxy
After=network.target nimbus-api.service

[Service]
ExecStart=/usr/bin/static-httpserver \
  --root-dir /var/www/nimbus-proxy \
  --tls-port 443 \
  --tls-cert-dir /etc/letsencrypt/live/nimbus.example.com \
  --proxy /.well-known/openid-configuration=https://10.106.103.1:8443/.well-known/openid-configuration \
  --proxy /keys=https://10.106.103.1:8443/keys \
  --proxy /authorize=https://10.106.103.1:8443/authorize \
  --proxy /oauth/token=https://10.106.103.1:8443/oauth/token \
  --proxy /login=https://10.106.103.1:8443/login \
  --proxy /callback=https://10.106.103.1:8443/callback \
  --proxy /userinfo=https://10.106.103.1:8443/userinfo \
  --proxy /revoke=https://10.106.103.1:8443/revoke \
  --proxy /end_session=https://10.106.103.1:8443/end_session \
  --proxy-ca /var/lib/nimbus/ca.crt
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now nimbus-oidc-proxy
```

### Network requirements

| Port | Protocol | Open publicly |
|------|----------|--------------|
| `443` | TCP | Yes — browser OIDC only |
| `8443` | TCP | No — WireGuard mesh only |
| `51820` | UDP | No — WireGuard mesh only |

---

## What gets exposed (both approaches)

| Path | Purpose |
|------|---------|
| `/.well-known/openid-configuration` | OIDC discovery document |
| `/keys` | JWKS — public key for token verification |
| `/authorize` | Starts the OAuth2 authorization code flow |
| `/oauth/token` | Exchanges auth code for tokens |
| `/login` | Nimbus login form (browser SSO) |
| `/callback` | Post-login redirect handler |
| `/userinfo` | Returns user claims for a valid token |
| `/revoke` | Token revocation |
| `/end_session` | Logout |
