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
| `POST`   | `/v1/nodes`                     | Create node                                                               |
| `GET`    | `/v1/nodes`                     | List nodes                                                                |
| `GET`    | `/v1/nodes/{id}`                | Get node                                                                  |
| `PATCH`  | `/v1/nodes/{id}`                | Update node name                                                          |
| `POST`   | `/v1/nodes/{id}/drain`          | Drain node                                                                |
| `POST`   | `/v1/nodes/{id}/gpu-overcommit` | Set GPU overcommit factor (`{"gpu_overcommit_factor": N}`, N ∈ {1,2,4,8}) |
| `DELETE` | `/v1/nodes/{id}`                | Delete node                                                               |
| `POST`   | `/v1/nodes/{id}/cert`           | Issue client certificate                                                  |
| `POST`   | `/v1/nodes/{id}/cert/revoke`    | Revoke certificates                                                       |

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
