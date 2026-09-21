---
sidebar_position: 2
sidebar_label: "API"
title: "API Endpoints"
---

# API Endpoints

The API server listens on `:8443` with TLS. Authenticated endpoints require either HMAC-signed requests or a JWT bearer token.

## Unauthenticated

| Method  | Path               | Description                                         |
|---------|--------------------|-----------------------------------------------------|
| `GET`   | `/healthz`         | Health check                                        |
| `GET`   | `/v1/version`      | API version                                         |
| `POST`  | `/v1/bootstrap`    | Create initial admin user                           |
| `POST`  | `/v1/iam/login`    | Login with username/password (returns JWT)          |
| `GET`   | `/v1/ca`           | Download CA certificate (auto-generated certs only) |
| `GET`   | `/v1/agent/binary` | Download agent binary                               |
| `POST`  | `/v1/nodes/join`   | Node self-registration with a join token            |

## Internal (mTLS only)

Used by agents. Requires mutual TLS with a valid client certificate.

| Method  | Path                                 | Description        |
|---------|--------------------------------------|--------------------|
| `POST`  | `/v1/internal/heartbeat`             | Agent heartbeat    |
| `GET`   | `/v1/internal/tasks/{nodeId}`        | Poll pending tasks |
| `POST`  | `/v1/internal/tasks/{taskId}/result` | Report task result |

## Nodes

| Method   | Path                            | Description                                                               |
|----------|---------------------------------|---------------------------------------------------------------------------|
| `POST`   | `/v1/nodes/deploy`              | Deploy node server-side (via SSH profile or inline credentials)           |
| `POST`   | `/v1/nodes/token`               | Generate a join token for a node to self-register with (returns `id`, `token`, `expires_at`) |
| `DELETE` | `/v1/nodes/token/{id}`          | Revoke an unused join token and drop the WireGuard peer it reserved; `404` if already used |
| `POST`   | `/v1/nodes/events`              | Record a node event                                                       |
| `GET`    | `/v1/nodes/events`              | List node events (deploy steps, join failures, SSH updates). Optional `?node_id=` or `?identifier=` (IP or hostname); without either, every node's events — see note below |
| `POST`   | `/v1/nodes`                     | Create node                                                               |
| `GET`    | `/v1/nodes`                     | List nodes                                                                |
| `GET`    | `/v1/nodes/{id}`                | Get node                                                                  |
| `PATCH`  | `/v1/nodes/{id}`                | Update the node's display name (`{"name": "..."}`) — see note below       |
| `POST`   | `/v1/nodes/{id}/ip`             | Change IP and/or pinned interface (`{"ip_address", "interface", "regenerate_cert"}`) |
| `POST`   | `/v1/nodes/{id}/drain`          | Drain node                                                                |
| `POST`   | `/v1/nodes/{id}/gpu-overcommit` | Set GPU overcommit factor (`{"gpu_overcommit_factor": N}`, N ∈ {1,2,4,8}) |
| `POST`   | `/v1/nodes/{id}/update-agent`   | Queue an agent binary update on the node (no SSH; node must be `ready`)   |
| `POST`   | `/v1/nodes/{id}/update-ssh`     | Update the agent binary and client certificate over SSH from the control plane, in the background (`202`); for an agent that is down. Takes the SSH credential fields below |
| `POST`   | `/v1/nodes/{id}/os-update`      | Queue a full OS package upgrade; node enters `needs_reboot` if a reboot is required |
| `POST`   | `/v1/nodes/{id}/check-updates`  | Re-check for OS package updates now, instead of waiting for the daily check |
| `POST`   | `/v1/nodes/{id}/reboot`         | Queue a reboot                                                            |
| `POST`   | `/v1/nodes/{id}/logs`           | Queue an agent log fetch (`?since=TIMESTAMP`, else `?lines=N` — default 100, max 10000); returns a task ID |
| `GET`    | `/v1/nodes/{id}/logs/{taskId}`  | Poll the log fetch result                                                 |
| `DELETE` | `/v1/nodes/{id}`                | Delete node                                                               |
| `POST`   | `/v1/nodes/{id}/cert`           | Issue client certificate                                                  |
| `POST`   | `/v1/nodes/{id}/cert/revoke`    | Revoke certificates                                                       |
| `POST`   | `/v1/nodes/{id}/unmanaged`      | Scan for workloads DockNimbus did not create (`?backend=swarm\|k8s`); returns a `task_id` |
| `GET`    | `/v1/nodes/{id}/unmanaged/{taskId}` | Result of that scan — see note below                                  |

### Listing node events

`GET /v1/nodes/events` takes optional filters, so the UI's activity dock can read every node at once and then poll for what is new:

| Parameter | Meaning |
|-----------|---------|
| `node_id` | One node. Its events recorded against its address before it had an ID are included |
| `identifier` | One address or hostname, for events from before a node existed |
| `since` | RFC3339 timestamp; only events after it |
| `limit` | Keep the newest N (max 1000). Applied by default (200) only when no node is named |

Events come back oldest first. A request naming no node and no identifier reads across every node, which is why it is capped.

### SSH credentials

`POST /v1/nodes/deploy` and `POST /v1/nodes/{id}/update-ssh` both have the control plane open the SSH connection to the node, and take the same credential fields:

| Field          | Meaning |
|----------------|---------|
| `ssh_profile`  | Name of a stored SSH profile |
| `ssh_user`     | SSH user (default `root`); a non-root user needs passwordless `sudo` |
| `ssh_port`     | SSH port (default `22`) |
| `ssh_key`      | Private key **content**, not a path |
| `ssh_password` | SSH password |

Values given inline override the profile's. With none, the control plane's own ssh-agent and `~/.ssh/id_*` keys are tried.

`update-ssh` answers `202` and runs in the background. It records `ssh_update_started`, then `ssh_update_completed` or `ssh_update_failed` (with the reason) as node events. It refuses up front with `409` a node that is being removed or has not reported its architecture yet, and with `400` an unknown profile.

### Unmanaged resource scans

`POST /v1/nodes/{id}/unmanaged` queues a scan on the node and returns a task ID. Poll `GET /v1/nodes/{id}/unmanaged/{taskId}` until `status` is `completed`, then read `resources`; a `failed` scan returns `error` instead.

The result is **never stored**. The task row is only the transport, and the API deletes it as soon as it hands the result over, so a scan is a live look at the runtime rather than an inventory that can go stale. Poll again for a fresh answer — the same task ID cannot be read twice.

The scan reports only what DockNimbus did not create. Its own workloads are excluded, which is not simply a matter of one label: instances, the load balancer and DNS carry different `nimbus` label values, services belonging to a DockNimbus compose stack carry no `nimbus` label at all, and on Kubernetes the cluster's system namespaces and DockNimbus's own ingress namespace are excluded too.

### Node name vs. hostname

A node carries two separate labels, and only one of them is yours to set:

| Field      | Set by | Meaning |
|------------|--------|---------|
| `name`     | You, via `PATCH /v1/nodes/{id}` | A display label used to identify the node in the CLI and dashboard. |
| `hostname` | Discovered | The machine's own OS hostname. Docker Swarm and Kubernetes address nodes by this, so nimbus keeps it in step with what the node actually reports. |

`PATCH /v1/nodes/{id}` changes **only** `name`. It does not rename the machine, and it does not touch Docker Swarm or Kubernetes — a node renamed this way keeps the same `hostname` everywhere else.

To rename the machine itself, change its OS hostname on the node (`hostnamectl set-hostname ...`) and restart Docker so the swarm picks it up. Nimbus notices on the next heartbeat from the swarm manager and updates its own record; swarm membership is tracked by the Docker node ID, which survives the rename.

### Changing a node's IP

`POST /v1/nodes/{id}/ip` takes at least one of `ip_address` or `interface`. `regenerate_cert` is accepted for the **control-plane node only** (`400` otherwise) and reissues the API server certificate for the new address, hot-swapping it without a restart.

The response is the updated node, plus a `certificate` object when a reissue was requested:

```json
{
  "data": {
    "id": "node-abc123",
    "ip_address": "192.168.1.50",
    "certificate": { "reissued": true, "added_sans": ["192.168.1.50"] }
  }
}
```

The IP change and the reissue are reported independently: if the certificate fails, the response is still `200` with `certificate.error` set, because the address change has already been committed. See [Handling Dynamic Node IPs](../guides/node-dynamic-ip).

## Swarm Groups

| Method   | Path                      | Description            |
|----------|---------------------------|------------------------|
| `POST`   | `/v1/swarms`              | Create swarm group     |
| `GET`    | `/v1/swarms`              | List swarms            |
| `GET`    | `/v1/swarms/{id}`         | Get swarm              |
| `POST`   | `/v1/swarms/{id}/join`    | Add node to swarm      |
| `POST`   | `/v1/swarms/{id}/leave`   | Remove node from swarm |
| `DELETE` | `/v1/swarms/{id}`         | Delete swarm           |
| `GET`    | `/v1/swarms/{id}/members` | List swarm members     |
| `POST`   | `/v1/swarms/{id}/lb`      | Deploy load balancer   |
| `DELETE` | `/v1/swarms/{id}/lb`      | Remove load balancer   |

## Compute

| Method   | Path                                            | Description                                        |
|----------|-------------------------------------------------|----------------------------------------------------|
| `POST`   | `/v1/compute/instances`                         | Create instance                                    |
| `GET`    | `/v1/compute/instances`                         | List instances                                     |
| `GET`    | `/v1/compute/instances/{id}`                    | Get instance                                       |
| `DELETE` | `/v1/compute/instances/{id}`                    | Terminate instance                                 |
| `POST`   | `/v1/compute/instances/{id}/stop`               | Stop instance                                      |
| `POST`   | `/v1/compute/instances/{id}/start`              | Start instance                                     |
| `POST`   | `/v1/compute/instances/{id}/scale`              | Scale replicas                                     |
| `POST`   | `/v1/compute/instances/{id}/logs`               | Queue log fetch (`?lines=N` or `?since=TIMESTAMP`) |
| `GET`    | `/v1/compute/instances/{id}/logs/{taskId}`      | Poll log fetch result                              |
| `POST`   | `/v1/compute/instances/{id}/volumes`            | Attach volume                                      |
| `DELETE` | `/v1/compute/instances/{id}/volumes/{volumeId}` | Detach volume                                      |
| `GET`    | `/v1/compute/instance-types`                    | List instance types                                |

## Kubernetes (K3s)

| Method   | Path                                              | Description                |
|----------|---------------------------------------------------|----------------------------|
| `POST`   | `/v1/kubernetes/clusters`                         | Create cluster             |
| `GET`    | `/v1/kubernetes/clusters`                         | List clusters              |
| `GET`    | `/v1/kubernetes/clusters/{id}`                    | Get cluster                |
| `DELETE` | `/v1/kubernetes/clusters/{id}`                    | Delete cluster             |
| `GET`    | `/v1/kubernetes/clusters/{id}/kubeconfig`         | Get kubeconfig             |
| `POST`   | `/v1/kubernetes/clusters/{id}/nodes`              | Add worker node            |
| `GET`    | `/v1/kubernetes/clusters/{id}/nodes`              | List cluster nodes         |
| `DELETE` | `/v1/kubernetes/clusters/{id}/nodes/{nodeId}`     | Remove worker node         |
| `POST`   | `/v1/kubernetes/clusters/{id}/volumes`            | Attach NFS volume (PV+PVC) |
| `DELETE` | `/v1/kubernetes/clusters/{id}/volumes/{volumeId}` | Detach NFS volume          |

## Volumes (NFS)

| Method   | Path               | Description   |
|----------|--------------------|---------------|
| `POST`   | `/v1/volumes`      | Create volume |
| `GET`    | `/v1/volumes`      | List volumes  |
| `GET`    | `/v1/volumes/{id}` | Get volume    |
| `DELETE` | `/v1/volumes/{id}` | Delete volume |

## S3 (MinIO)

| Method   | Path                    | Description           |
|----------|-------------------------|-----------------------|
| `POST`   | `/v1/s3/instances`      | Deploy MinIO instance |
| `GET`    | `/v1/s3/instances`      | List instances        |
| `DELETE` | `/v1/s3/instances/{id}` | Delete instance       |

## Services

| Method   | Path                      | Description           |
|----------|---------------------------|-----------------------|
| `POST`   | `/v1/services`            | Deploy compose stack  |
| `GET`    | `/v1/services`            | List services         |
| `GET`    | `/v1/services/{id}`       | Get service           |
| `PUT`    | `/v1/services/{id}`       | Update service        |
| `POST`   | `/v1/services/{id}/stop`  | Stop service          |
| `POST`   | `/v1/services/{id}/start` | Start service         |
| `DELETE` | `/v1/services/{id}`       | Remove service        |

## Gateway / Load Balancer

| Method  | Path                     | Description                    |
|---------|--------------------------|--------------------------------|
| `GET`   | `/v1/gateway`            | Gateway status + routing table |
| `GET`   | `/v1/loadbalancers`      | List load balancers            |
| `GET`   | `/v1/loadbalancers/{id}` | Get load balancer              |

## SSH Profiles

Manage encrypted SSH credential profiles for manifest-based node provisioning.

| Method   | Path                    | Description        |
|----------|-------------------------|--------------------|
| `POST`   | `/v1/ssh-profiles`      | Create SSH profile |
| `GET`    | `/v1/ssh-profiles`      | List profiles      |
| `GET`    | `/v1/ssh-profiles/{id}` | Get profile        |
| `DELETE` | `/v1/ssh-profiles/{id}` | Delete profile     |

Sensitive fields (private key, password) are encrypted with the CA key and never returned in API responses. List and get responses include `has_key` and `has_password` booleans.

## Tags

| Method   | Path       | Description              |
|----------|------------|--------------------------|
| `PUT`    | `/v1/tags` | Set a tag on a resource  |
| `GET`    | `/v1/tags` | List resource IDs by tag |
| `DELETE` | `/v1/tags` | Delete a tag             |

## IAM

| Method   | Path                              | Description                    |
|----------|-----------------------------------|--------------------------------|
| `POST`   | `/v1/iam/users`                   | Create user                    |
| `POST`   | `/v1/iam/users/{id}/keys`         | Generate API key pair          |
| `DELETE` | `/v1/iam/users/{id}/keys/{keyId}` | Delete API key                 |
| `POST`   | `/v1/iam/token`                   | Get token (HMAC-authenticated) |
| `POST`   | `/v1/iam/users/{id}/password`     | Set password                   |

## Cleanup

| Method | Path                                      | Description                 |
|--------|-------------------------------------------|-----------------------------|
| `POST` | `/v1/cleanup/{resourceType}/{resourceId}` | Force-clean stuck resources |
