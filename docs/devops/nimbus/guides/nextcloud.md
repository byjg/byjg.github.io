---
sidebar_position: 12
---

# Nextcloud SSO with Nimbus

This guide connects Nextcloud to Nimbus as an OIDC identity provider using the [Social Login](https://github.com/zorn-v/nextcloud-social-login) or the official [OpenID Connect Login](https://github.com/pulsejet/nextcloud-oidc-login) app. After completing it, users log in to Nextcloud with their Nimbus credentials.

## Prerequisites

- Nimbus running and accessible over HTTPS
- Nextcloud ≥ 25
- The **OpenID Connect Login** app installed in Nextcloud (`nextcloud-oidc-login`)

## 1. Register an OAuth2 client in Nimbus

**Via CLI:**

```bash
nimbus iam client create \
  --name nextcloud \
  --redirect-uri "https://<nextcloud-host>/apps/oidc_login/oidc"
```

The output contains the **Client ID** and **Client Secret** — save the secret now, it cannot be retrieved again.

**Via UI:** navigate to **IAM → OAuth2 Clients**, click **Create Client**, and fill in the same values.

## 2. Create external scopes (optional)

If you want to map Nimbus groups to Nextcloud admin status, register a scope in **IAM → Scopes**:

```
external:nextcloud:admin
```

Assign it to the Nimbus `admin` group.

## 3. Configure Nextcloud

Add the following to `config/config.php`:

```php
'oidc_login_provider_url' => 'https://<nimbus-host>',
'oidc_login_client_id' => '<client-id>',
'oidc_login_client_secret' => '<client-secret>',
'oidc_login_auto_redirect' => false,
'oidc_login_end_session_redirect' => false,
'oidc_login_button_text' => 'Sign in with Nimbus',
'oidc_login_hide_password_form' => false,
'oidc_login_use_id_token' => true,
'oidc_login_attributes' => [
    'id'            => 'sub',
    'name'          => 'name',
    'mail'          => 'email',
    'groups'        => 'groups',
],
'oidc_login_default_group' => 'oidc',
'oidc_login_scope' => 'openid profile email groups offline_access',
'oidc_login_use_external_storage' => false,
'oidc_login_tls_verify' => true,
```

:::note
The `offline_access` scope allows Nextcloud to refresh the session in the background. Without it, users must re-authenticate every hour.
:::

## 4. Map admin scope (optional)

To automatically grant Nextcloud admin rights to users with `external:nextcloud:admin`, add:

```php
'oidc_login_admin_attribute' => 'groups',
'oidc_login_admin_groups' => ['admin'],
```

The value `admin` matches the permission leaf of the `external:nextcloud:admin` scope emitted by Nimbus in the `groups` claim.

## 5. Verify

Clear Nextcloud's config cache and open the login page:

```bash
php occ maintenance:repair
```

You should see a **Sign in with Nimbus** button. After signing in, the user is provisioned automatically based on the OIDC claims.

## Troubleshooting

- **User not provisioned** — check that `oidc_login_attributes.id` maps to a stable, non-empty claim. Nimbus always sets `sub` to the user's internal ID.
- **Groups not synced** — ensure `groups` is in `oidc_login_scope` and that the user has `external:nextcloud:*` scopes assigned in Nimbus.
- **TLS errors** — if Nimbus uses a self-signed cert, set `oidc_login_tls_verify => false` during testing and add the CA to the system trust store in production.
