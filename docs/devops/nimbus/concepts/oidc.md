# Nimbus OIDC Provider

Nimbus acts as a full OpenID Connect (OIDC) identity provider, enabling single sign-on across K3s clusters, MinIO S3 instances, and any OIDC-compatible service.

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
| `/callback` | Internal callback after login |
| `/login` | Nimbus login form (username/password) |

## OAuth2 Clients

### Built-in "nimbus" client

Used by K3s for OIDC token validation. Public client (no secret), no redirect URIs needed.

### Registered clients

Created via API or GUI for external services (MinIO, Grafana, etc.):

```
POST /v1/oidc/clients
{
  "name": "my-app",
  "redirect_uris": ["http://localhost:9090/callback"]
}
```

Returns `client_id` and `client_secret` (shown once). Manage via IAM > user detail > OAuth2 Clients tab.

## Scopes

| Scope | What it grants |
|-------|---------------|
| `openid` | Always included -- basic identity |
| `profile` | Username, groups |
| `email` | Email claim (username@nimbus) |
| `k8s:admin` | cluster-admin on K3s clusters |
| `k8s:read` | Read-only K3s access |
| `s3:admin` | Full MinIO access |
| `s3:read` | Read-only S3 access |

Admin users get all scopes by default. Scopes are assigned per-user via the IAM page.

## Token Format

JWTs are signed with RS256. Claims include:

| Claim | Description | Example |
|-------|-------------|---------|
| `iss` | Issuer URL | `https://nimbus:8443` |
| `sub` | User ID | `user-abc123` |
| `aud` | Audience | `["nimbus"]` |
| `preferred_username` | Username | `alice` |
| `groups` | Scopes/groups | `["k8s:admin", "s3:admin"]` |
| `uid` | Nimbus user ID | `user-abc123` |
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

A `nimbus-admin` ClusterRoleBinding is auto-applied granting `cluster-admin` to the `admin` group.

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

## MinIO Integration

When creating an S3 instance, Nimbus automatically:
1. Creates an OAuth2 client for the MinIO instance
2. Injects OIDC environment variables into the MinIO Docker service:
   - `MINIO_IDENTITY_OPENID_CONFIG_URL`
   - `MINIO_IDENTITY_OPENID_CLIENT_ID`
   - `MINIO_IDENTITY_OPENID_CLIENT_SECRET`
   - `MINIO_IDENTITY_OPENID_SCOPES`
   - `MINIO_IDENTITY_OPENID_CLAIM_NAME`

MinIO console shows a "Login with SSO" button. Users authenticate via Nimbus and are redirected back.

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
- **Self-signed CA**: K3s and MinIO need the Nimbus CA cert for TLS verification. Auto-configured during provisioning.
- **Issuer URL stability**: Changing the API address invalidates tokens and breaks OIDC configuration.
- **Client secrets**: Shown once on creation, stored as SHA-256 hash.
