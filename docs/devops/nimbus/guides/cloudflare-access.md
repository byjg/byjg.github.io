---
sidebar_position: 13
---

# Cloudflare Access SSO with Nimbus

This guide connects Cloudflare Access (Zero Trust) to Nimbus as an OpenID Connect identity provider. After completing it, users authenticate to any Cloudflare-protected application using their Nimbus credentials, and access policies can be written against Nimbus IAM groups.

## Prerequisites

- Nimbus running and reachable over HTTPS from the public internet (see [Exposing OIDC/OAuth2 Publicly](./oidc-public-proxy))
- A Cloudflare Zero Trust account
- Admin access to both systems

## 1. Expose Nimbus publicly

Cloudflare's servers must be able to reach Nimbus to validate tokens. If Nimbus is on a private network, use one of these approaches:

**Option A — Public domain on port 8443** (simplest):
```bash
nimbus certificate add \
  --domain nimbus.example.com \
  --cert /etc/letsencrypt/live/nimbus.example.com/fullchain.pem \
  --key  /etc/letsencrypt/live/nimbus.example.com/privkey.pem
```
Open port 8443 in your firewall. Nimbus is now reachable at `https://nimbus.example.com:8443`.

**Option B — Cloudflare Tunnel** (no open ports):
```bash
cloudflared tunnel create nimbus
cloudflared tunnel route dns nimbus nimbus.example.com
```
Configure the tunnel to forward to `https://localhost:8443` with `originServerName: nimbus.example.com`. This is the most secure option — no inbound ports required.

## 2. Register an OAuth2 client in Nimbus

You need the Cloudflare Access callback URL first. In your Cloudflare Zero Trust dashboard, note your team domain — it follows the pattern `https://<team>.cloudflareaccess.com`.

**Via CLI:**
```bash
nimbus iam client create \
  --name cloudflare-access \
  --redirect-uri "https://<team>.cloudflareaccess.com/cdn-cgi/access/callback"
```

Save the **Client ID** and **Client Secret** — shown only once.

**Via UI:** navigate to **IAM → OAuth2 Clients**, click **Create Client**, and fill in the same values.

## 3. Create external scopes for Cloudflare Access policies

Register the permission values that Cloudflare Access policies will match against. In **IAM → Scopes** or via CLI:

```bash
nimbus iam scope register --scope "external:cloudflare-access:allow"
nimbus iam scope register --scope "external:cloudflare-access:admin"
```

Assign these to the appropriate Nimbus IAM groups. For example, add `external:cloudflare-access:allow` to any group whose members should be permitted through Cloudflare Access.

## 4. Configure Cloudflare Access

In the Cloudflare Zero Trust dashboard, navigate to **Settings → Authentication → Add new** and select **OpenID Connect** (listed as "OpenID Connect" in the identity provider list).

Fill in the following:

| Field | Value |
|---|---|
| Name | `Nimbus` |
| App ID | `<client-id>` from step 2 |
| Client secret | `<client-secret>` from step 2 |
| Auth URL | `https://nimbus.example.com:8443/authorize` |
| Token URL | `https://nimbus.example.com:8443/oauth/token` |
| Certificate URL | `https://nimbus.example.com:8443/keys` |
| PKCE | **On** — Nimbus supports S256 |
| Email claim | leave blank — Nimbus uses the standard `email` claim |
| OIDC Scopes | `openid`, `email`, `profile`, `groups` |
| OIDC Claims | `groups` |

:::tip Discovery URL
Cloudflare may also accept a discovery URL directly: `https://nimbus.example.com:8443/.well-known/openid-configuration`
:::

The `groups` scope tells Nimbus to include the groups claim in the token. The `groups` OIDC claim tells Cloudflare to extract it from the token and make it available for Access policies.

Save the configuration and click **Test** to verify Cloudflare can reach Nimbus and complete the OIDC handshake.

## 5. Write Access policies

In your Cloudflare Access application, create a policy that uses the `groups` claim:

| Rule type | Selector | Value |
|---|---|---|
| Include | OIDC Claims — `groups` | `allow` |

Users with `external:cloudflare-access:allow` assigned in Nimbus will have `groups: ["allow"]` in their token. Cloudflare matches this against the policy and grants access.

For admin-only applications, use the `admin` value instead:

| Rule type | Selector | Value |
|---|---|---|
| Include | OIDC Claims — `groups` | `admin` |

## 6. Verify

Open a Cloudflare-protected application in a browser. You should be redirected to the Nimbus login page. After authenticating, Cloudflare validates the token and grants access based on the groups claim.

## Troubleshooting

- **`invalid_client` error** — double-check the Client ID and Client Secret match what Nimbus issued.
- **`issuer mismatch`** — the domain used in the Auth/Token/Certificate URLs must exactly match the domain of the TLS certificate registered in Nimbus. Nimbus sets the issuer dynamically from the `Host` header.
- **User has no `groups` claim** — ensure `external:cloudflare-access:*` scopes are assigned to the user's group in Nimbus. Users with no matching external scopes get an empty `groups` array.
- **Cloudflare Tunnel TLS errors** — set `noTLSVerify: true` in the tunnel ingress config if Nimbus uses a self-signed certificate, or add the Nimbus CA to the tunnel's trust store.
