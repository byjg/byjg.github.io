---
sidebar_position: 11
---

# ArgoCD SSO with Nimbus

This guide connects ArgoCD to Nimbus as an OIDC identity provider. After completing it, users log in to ArgoCD with their Nimbus credentials and ArgoCD roles are controlled through Nimbus IAM groups.

This setup is particularly useful when Nimbus already manages the K3s cluster where ArgoCD is deployed — users can authenticate to both with the same identity.

## Prerequisites

- Nimbus running and accessible over HTTPS
- ArgoCD ≥ 2.4 deployed on a Nimbus-managed K3s cluster
- Admin access to both systems

## 1. Register an OAuth2 client in Nimbus

**Via CLI:**

```bash
nimbus iam client create \
  --name argocd \
  --redirect-uri "https://<argocd-host>/auth/callback"
```

The output contains the **Client ID** and **Client Secret** — save the secret now, it cannot be retrieved again.

**Via UI:** navigate to **IAM → OAuth2 Clients**, click **Create Client**, and fill in the same values.

## 2. Create external scopes for ArgoCD roles

In **IAM → Scopes**, register:

```
external:argocd:admin
external:argocd:readonly
```

Assign `external:argocd:admin` to the Nimbus `admin` group, and `external:argocd:readonly` to any read-only groups.

## 3. Configure ArgoCD

Edit the `argocd-cm` ConfigMap:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-cm
  namespace: argocd
data:
  url: https://<argocd-host>
  oidc.config: |
    name: Nimbus
    issuer: https://<nimbus-host>
    clientID: <client-id>
    clientSecret: $oidc.nimbus.clientSecret
    requestedScopes:
      - openid
      - profile
      - email
      - groups
      - offline_access
    requestedIDTokenClaims:
      groups:
        essential: true
```

Store the client secret in the `argocd-secret` Secret:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: argocd-secret
  namespace: argocd
stringData:
  oidc.nimbus.clientSecret: <client-secret>
```

## 4. Map Nimbus groups to ArgoCD roles

Edit the `argocd-rbac-cm` ConfigMap:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-rbac-cm
  namespace: argocd
data:
  policy.csv: |
    g, admin, role:admin
    g, readonly, role:readonly
  policy.default: role:readonly
  scopes: '[groups]'
```

The values `admin` and `readonly` correspond to the permission leaf of the `external:argocd:*` scopes assigned in Nimbus.

## 5. Restart ArgoCD and verify

```bash
kubectl rollout restart deployment argocd-server -n argocd
```

Open the ArgoCD UI and click **Log in via Nimbus**. After authenticating, verify your role under **User Info**.

## Troubleshooting

- **`groups claim missing`** — ensure `external:argocd:*` scopes are assigned to the user's group in Nimbus and that `groups` is listed in `requestedScopes`.
- **`invalid redirect URI`** — the URI in Nimbus must be exactly `https://<argocd-host>/auth/callback` with no trailing slash.
- **TLS with self-signed certs** — add the Nimbus CA to the ArgoCD trust store via the `argocd-tls-certs-cm` ConfigMap.
