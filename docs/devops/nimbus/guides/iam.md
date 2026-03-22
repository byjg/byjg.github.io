---
sidebar_position: 7
sidebar_label: "Users & Access"
title: "Users & Access Management"
---

# Users & Access Management

DockNimbus supports multiple users with API key and JWT authentication.

## Create a user

```bash
nimbus iam create-user --username developer
```

Add `--admin` for admin privileges.

## Generate API keys

```bash
nimbus iam create-key --user-id USER_ID
```

This returns an access key and secret key for HMAC authentication.

## Password and JWT login

```bash
# Set a password for a user
nimbus iam set-password --user-id USER_ID --password <password>

# Login to get a JWT token
nimbus iam login --username developer --password <password>
```

The login command outputs a `NIMBUS_TOKEN` export command. JWT tokens are valid for 1 hour.

## Get a token via HMAC

If already configured with API keys:

```bash
nimbus iam get-token
```
