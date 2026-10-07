---
sidebar_position: 3
sidebar_label: "OIDC / OAuth2"
title: "Nimbus OIDC Provider"
---

# Nimbus OIDC Provider

Nimbus acts as a full OpenID Connect (OIDC) identity provider, enabling single sign-on across K3s clusters, S3 (RustFS) consoles, and any OIDC-compatible service.

## Architecture

```
Browser/App                         Nimbus API
    |                                   |
    |-- GET /authorize ---------------->|
    |<-- redirect to /login ------------|
    |-- POST /login (credentials) ----->|
    |<-- redirect with auth code -------|
    |-- POST /oauth/token (code) ------>|
    |<-- access_token + id_token -------|
    |                                   |
    |-- GET /userinfo (Bearer token) -->|
    |<-- user claims -------------------|
```

For K3s, tokens are validated locally via JWKS -- no per-request callback to Nimbus.

## Endpoints

Served by the zitadel/oidc v3 provider:

| Endpoint | Description |
|----------|-------------|
| `/.well-known/openid-configuration` | OIDC discovery document |
| `/keys` | JWKS (RSA public key for token verification) |
| `/authorize` | Authorization endpoint (starts auth code flow) |
| `/oauth/token` | Token endpoint (exchanges code for tokens) |
| `/userinfo` | Returns user claims for a valid access token |
| `/revoke` | Token revocation |
| `/end_session` | Logout |
| `/callback` | Internal callback after login |
| `/login` | Nimbus login form (username/password) |

## OAuth2 Clients

### Built-in "nimbus" client

Used by K3s for OIDC token validation. Public client (no secret), no redirect URIs needed.

### Registered clients

Created via API or GUI for external services (Grafana, etc.):

```
POST /v1/oidc/clients
{
  "name": "my-app",
  "redirect_uris": ["http://localhost:9090/callback"]
}
```

Returns `client_id` and `client_secret` (shown once). Manage via IAM > user detail > OAuth2 Clients tab.

## Scopes

These are the OAuth2 scopes a client can request:

| Scope | What it grants |
|-------|---------------|
| `openid` | Required -- basic identity |
| `profile` | Name and profile picture |
| `email` | Email address |
| `groups` | Group memberships and permissions |
| `offline_access` | Refresh token (keeps the user signed in) |

Permissions are not OAuth2 scopes. They are Nimbus IAM scopes (`nimbus:<type>:<id>:<perm>` and
`external:<client-name>:<perm>`) assigned to users and groups, and they reach the client through the
`groups` claim. See [IAM > Scopes and ARN format](../guides/iam.md#scopes-and-arn-format).

### The `groups` claim

What goes into `groups` depends on the client:

- **Built-in `nimbus` client (K3s):** the user's full IAM scopes, with wildcards expanded to concrete
  resource IDs, e.g. `["nimbus:k8s:cls-abc123:admin"]`. Admin users also get the scopes of the
  built-in `admin` group.
- **Registered clients:** only the scopes named `external:<client-name>:<perm>`, and only the
  `<perm>` part. `<client-name>` is the client's name in lowercase with spaces replaced by hyphens.
  For a client named `grafana`, a user holding `external:grafana:admin` gets `["admin"]`, and
  `nimbus:*` scopes are never sent.
- **S3 console clients:** the client ID is the S3 instance ID (`s3-...`). Only the scopes
  `nimbus:s3:<that-id>:<perm>` count, and each is sent as the RustFS policy for `<perm>`:
  `admin` → `consoleAdmin`, `readwrite` → `readwrite`, `read` → `readonly`. Admin users also get
  the scopes of the built-in `admin` group. See [S3 Storage](../guides/s3-storage.md#console-sso-via-oidc-recommended).

External scopes must be registered before they can be assigned:

```bash
nimbus iam scope register --scope "external:my-app:viewer" --description "My App viewer"
```

## Token Format

JWTs are signed with RS256. Claims include:

| Claim | Description | Example |
|-------|-------------|---------|
| `iss` | Issuer URL | `https://10.106.103.1:8443` |
| `sub` | Nimbus user ID | `user-abc123` |
| `aud` | Audience (the client ID) | `["oidc-xxxx"]` |
| `preferred_username` | Username | `alice` |
| `name` | Username | `alice` |
| `email` | Email address | `alice@example.com` |
| `picture` | Gravatar URL | `https://www.gravatar.com/avatar/...` |
| `groups` | Permissions for this client (see above) | `["admin"]` |
| `uid` | Nimbus user ID | `user-abc123` |
| `usr` | Email address | `alice@example.com` |
| `adm` | Admin flag | `true` |

## K3s Integration

K3s clusters are auto-configured with OIDC flags during creation:

```
--oidc-issuer-url=https://<nimbus-api>
--oidc-client-id=nimbus
--oidc-username-claim=preferred_username
--oidc-groups-claim=groups
--oidc-username-prefix=-
--oidc-ca-file=<ca-path>
```

Two ClusterRoleBindings are applied to each cluster:

| Binding | Group | ClusterRole |
|---------|-------|-------------|
| `nimbus-k8s-<clusterID>-admin` | `nimbus:k8s:<clusterID>:admin` | `cluster-admin` |
| `nimbus-k8s-<clusterID>-read` | `nimbus:k8s:<clusterID>:read` | `view` |

A wildcard scope such as `nimbus:k8s:*:admin` is expanded to every cluster ID when the token is
issued, so it matches these bindings.

### kubectl with OIDC

The kubeconfig uses the nimbus CLI as a credential plugin:

```yaml
users:
- name: alice
  user:
    exec:
      command: nimbus
      args: [iam, get-token, --exec-credential]
```

kubectl automatically fetches a fresh 1-hour OIDC token on each API call.

## S3 (RustFS) Integration

When an S3 instance is created with `--oidc-cert`, Nimbus:
1. Creates an OAuth2 client whose client ID is the S3 instance ID
2. Injects OIDC environment variables into the RustFS Docker service:
   - `RUSTFS_IDENTITY_OPENID_CONFIG_URL` — discovery on the certificate's domain
   - `RUSTFS_IDENTITY_OPENID_CLIENT_ID` / `RUSTFS_IDENTITY_OPENID_CLIENT_SECRET`
   - `RUSTFS_IDENTITY_OPENID_REDIRECT_URI` — `http://<s3-domain>/rustfs/admin/v3/oidc/callback/default`
   - `RUSTFS_IDENTITY_OPENID_CLAIM_NAME=groups`
   - `RUSTFS_BROWSER_REDIRECT_URL` — the console domain, where the browser lands after login
   - `RUSTFS_OUTBOUND_ALLOW_ORIGINS` — the issuer, which RustFS would otherwise refuse to call

The console offers to sign in through Nimbus. RustFS reads each value of the `groups` claim as a
policy name, which is why the claim carries RustFS policies for this client.

## Integrating Other Services

Any OIDC-compatible service can use Nimbus as an identity provider:

```
Discovery URL: https://<nimbus-api>/.well-known/openid-configuration
Client ID: <from /v1/oidc/clients>
Client Secret: <shown once on creation>
Scopes: openid profile email
```

### Grafana example

```ini
[auth.generic_oauth]
enabled = true
name = Nimbus
client_id = oidc-xxxx
client_secret = xxxx
auth_url = https://nimbus:8443/authorize
token_url = https://nimbus:8443/oauth/token
api_url = https://nimbus:8443/userinfo
scopes = openid profile email
```

## Testing the OIDC Flow

Use `oauth2c` to test the authorization code flow:

```bash
go run github.com/cloudentity/oauth2c@latest https://<nimbus-api> \
  --client-id <client_id> \
  --client-secret <client_secret> \
  --scopes "openid profile email" \
  --grant-type authorization_code \
  --auth-method client_secret_basic \
  --insecure
```

## Key Management

- RSA-2048 key pair generated on first server startup
- Private key at `{DataDir}/oidc-signing.key` (permissions: 0600)
- Key ID (`kid`) derived from public key hash -- stable across restarts
- Authorization codes and auth requests stored in-memory (lost on restart, short-lived)

## Security Considerations

- **Token lifetime**: 1 hour
- **No real-time revocation**: Tokens valid until expiry. Disabling a user prevents new token issuance.
- **Self-signed CA**: K3s needs the Nimbus CA cert for TLS verification. Auto-configured during provisioning. S3 consoles use the issuer on the certificate's domain instead, so that certificate must be publicly trusted.
- **Issuer URL stability**: Changing the API address invalidates tokens and breaks OIDC configuration.
- **Client secrets**: Shown once on creation, stored as SHA-256 hash.
