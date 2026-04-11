---
sidebar_position: 10
---

# Grafana SSO with Nimbus

This guide walks through connecting Grafana to Nimbus as an OIDC identity provider. After completing it, users will log in to Grafana using their Nimbus credentials, and Grafana roles will be mapped from Nimbus IAM groups.

## Prerequisites

- Nimbus running and accessible over HTTPS
- Grafana ≥ 9.0
- Admin access to both systems

## 1. Register an OAuth2 client in Nimbus

**Via CLI:**

```bash
nimbus iam client create \
  --name grafana \
  --redirect-uri "https://<grafana-host>/login/generic_oauth"
```

The output contains the **Client ID** and **Client Secret** — save the secret now, it cannot be retrieved again.

**Via UI:** navigate to **IAM → OAuth2 Clients**, click **Create Client**, and fill in the same values.

## 2. Create external scopes for Grafana roles

Register the scopes that will map to Grafana roles. In **IAM → Scopes**:

```
external:grafana:admin
external:grafana:editor
external:grafana:viewer
```

Assign these scopes to the appropriate Nimbus IAM groups. For example, add `external:grafana:admin` to the built-in `admin` group.

## 3. Configure Grafana

Add the following to `grafana.ini` (or set the equivalent environment variables):

```ini
[auth.generic_oauth]
enabled = true
name = Nimbus
icon = signin
client_id = <client-id>
client_secret = <client-secret>
scopes = openid profile email offline_access groups
auth_url = https://<nimbus-host>/oauth/v2/authorize
token_url = https://<nimbus-host>/oauth/v2/token
api_url = https://<nimbus-host>/oidc/v1/userinfo
tls_skip_verify_insecure = false

# Map the groups claim to Grafana roles
role_attribute_path = contains(groups[*], 'admin') && 'Admin' || contains(groups[*], 'editor') && 'Editor' || 'Viewer'
role_attribute_strict = true

# Allow auto-provisioning of users
allow_sign_up = true
```

:::note
The `offline_access` scope enables refresh tokens. This keeps Grafana sessions alive beyond the 1-hour access token lifetime without requiring users to re-authenticate.
:::

## 4. Restart Grafana and verify

Restart Grafana to apply the configuration. On the login page you should now see a **Sign in with Nimbus** button.

Log in with a Nimbus user that has an `external:grafana:*` scope assigned. Grafana will display the mapped role in the user profile page.

## Troubleshooting

- **`role_attribute_path did not match`** — the user has no `external:grafana:*` scope assigned in Nimbus. Add the relevant scope to their group.
- **`redirect_uri mismatch`** — the redirect URI registered in Nimbus must exactly match the one Grafana sends. Check for trailing slashes.
- **TLS errors** — if Nimbus uses a self-signed cert, either add it to Grafana's trusted CA store or temporarily set `tls_skip_verify_insecure = true` during testing.
