---
sidebar_position: 2
sidebar_label: "Testing"
title: "End-to-End Tests"
---

# End-to-End Tests

Integration tests that exercise the full nimbus stack (API server, agent, CLI).

Naming: `test-{feature}-{method}.sh` where method is `cli` (provisioned via nimbus CLI) or `manifest` (provisioned via `nimbus manifest apply`).

## Test scripts

### CLI-provisioned tests

| Script | Environment | What it tests |
|--------|-------------|---------------|
| `test-docker.sh` | Local Docker | Swarm creation, compute instance deployment, EasyHAProxy routing. Runs entirely in Docker containers — no remote machines needed. |
| `test-swarm-cli.sh` | 2 remote VMs | Swarm lifecycle, compute instances, EasyHAProxy ingress, local DNS resolution, NFS volume creation and mount on a compute instance. |
| `test-kubernetes-cli.sh` | 2 remote VMs | K3s cluster creation, OIDC auth, kubeconfig retrieval, EasyHAProxy ingress on K8s, NFS volume attach/detach with PV/PVC verification. |
| `test-s3-cli.sh` | 1 remote VM | MinIO S3 instance deployment, health check, and teardown. |

### Manifest-provisioned tests

Same test scenarios as above but using `nimbus manifest apply` for provisioning:

| Script | Environment | What it tests |
|--------|-------------|---------------|
| `test-swarm-manifest.sh` | 2 remote VMs | Swarm manifest apply/remove, compute, NFS, EasyHAProxy |
| `test-kubernetes-manifest.sh` | 2 remote VMs | K3s manifest apply/remove, kubeconfig, NFS PV/PVC |
| `test-s3-manifest.sh` | 1 remote VM | S3 manifest apply/remove, MinIO health, object operations |

Manifest YAML files are in `tests_e2e/manifests/`.

## Shared library

`test-lib.sh` provides helpers used by all tests:
- Build and install binaries
- Start/stop the API server
- Bootstrap admin user and configure CLI
- SSH helpers and node registration
- Swap management for low-memory environments

## Usage

### Docker test (no remote machines)

```bash
./tests_e2e/test-docker.sh
```

### CLI-provisioned tests

Requires SSH access to remote machines:

```bash
NODE1_IP=192.168.1.10 NODE2_IP=192.168.1.11 ./tests_e2e/test-swarm-cli.sh
NODE1_IP=192.168.1.10 NODE2_IP=192.168.1.11 ./tests_e2e/test-kubernetes-cli.sh
NODE1_IP=192.168.1.10 ./tests_e2e/test-s3-cli.sh
```

### Manifest-provisioned tests

```bash
NODE1_IP=192.168.1.10 NODE2_IP=192.168.1.11 ./tests_e2e/test-swarm-manifest.sh
NODE1_IP=192.168.1.10 NODE2_IP=192.168.1.11 ./tests_e2e/test-kubernetes-manifest.sh
NODE1_IP=192.168.1.10 ./tests_e2e/test-s3-manifest.sh
```

### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SSH_USER` | `root` | SSH username for remote nodes |
| `SSH_PORT` | `22` | SSH port |
| `API_PORT` | `8443` | API server listen port |
| `SWARM_NAME` | `dev` | Swarm name (swarm test) |
| `CLUSTER_NAME` | `dev-k8s` | K3s cluster name (k8s test) |
