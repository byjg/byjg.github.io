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
| `test-swarm-cli.sh` | 2 remote VMs | Swarm lifecycle, compute instances, EasyHAProxy ingress, local DNS resolution, NFS volume creation and mount on a compute instance. |
| `test-kubernetes-cli.sh` | 2 remote VMs | K3s cluster creation, OIDC auth, kubeconfig retrieval, EasyHAProxy ingress on K8s, NFS volume attach/detach with PV/PVC verification. |
| `test-s3-cli.sh` | 1 remote VM | RustFS S3 instance deployment, health check, console route, console SSO token, object operations, and teardown. |

### Manifest-provisioned tests

Same test scenarios as above but using `nimbus manifest apply` for provisioning:

| Script | Environment | What it tests |
|--------|-------------|---------------|
| `test-swarm-manifest.sh` | 2 remote VMs | Swarm manifest apply/remove, compute, NFS, EasyHAProxy |
| `test-kubernetes-manifest.sh` | 2 remote VMs | K3s manifest apply/remove, kubeconfig, NFS PV/PVC |
| `test-s3-manifest.sh` | 1 remote VM | S3 manifest apply/remove, RustFS health, console route, object operations |

Manifest YAML files are in `tests_e2e/manifests/`.

## Shared library

`test-lib.sh` provides helpers used by all tests:
- Build and install binaries
- Start/stop the API server
- Bootstrap admin user and configure CLI
- SSH helpers and node registration
- Swap management for low-memory environments
- Reading CLI output: `nimbus_field "<list command>" <key> <value> <field>` returns one field of the row whose `<key>` is `<value>`, and `nimbus_count` counts such rows. Both read `-o json`, never a table column, so a new column does not break a test:

  ```bash
  SVC_STATUS=$(nimbus_field "service list" name stack-test status)
  NODE1_ID=$(nimbus_field "node list" ip_address "$NODE1_IP" id)
  READY=$(nimbus_count "node list" status ready)
  ```

## Usage

### Local VMs (no machines to set aside)

`tests_e2e/vms.sh` creates the control plane and two nodes as QEMU VMs on this machine, with ByJG's [qemu.sh](https://shellscript.download) (`load.sh qemu`). They join the host bridge `virbr0`, so each has its own address and they reach each other like real machines. The first run sets the bridge up (libvirt's default network, with sudo); after that it needs no sudo.

```bash
./tests_e2e/vms.sh up                      # create and boot the VMs, wait for SSH
eval "$(./tests_e2e/vms.sh env)"           # CP_IP, NODE1_IP, NODE2_IP, SSH_USER, SSH_PASSWORD
./tests_e2e/test-kubernetes-cli.sh
./tests_e2e/vms.sh down                    # remove them
```

A run changes the VMs; recreate them (`down`, then `up`) before the next one.

### CLI-provisioned tests

Requires SSH access to the machines: the control plane (`CP_IP`) and the nodes. Nimbus is installed on each and its state wiped afterwards, so use machines (or VMs) set aside for testing.

`CP_IP` is required. `CP_IP=localhost` installs the control plane on the machine running the tests, but only when you say so; it is never assumed.

The tests talk to the installation through a CLI context of their own, `tests_e2e/.cli/config.json` (ignored by git). Your `~/.nimbus` contexts, and any `NIMBUS_CONFIG` or `NIMBUS_TOKEN` in your shell, are neither used nor touched. The swarm tests run `nimbus dns create`, which changes the resolver of the machine running them (systemd-resolved and an iptables rule, with sudo).

```bash
CP_IP=192.168.1.5 NODE1_IP=192.168.1.10 NODE2_IP=192.168.1.11 ./tests_e2e/test-swarm-cli.sh
CP_IP=192.168.1.5 NODE1_IP=192.168.1.10 NODE2_IP=192.168.1.11 ./tests_e2e/test-kubernetes-cli.sh
CP_IP=192.168.1.5 NODE1_IP=192.168.1.10 ./tests_e2e/test-s3-cli.sh
```

### Manifest-provisioned tests

```bash
CP_IP=192.168.1.5 NODE1_IP=192.168.1.10 NODE2_IP=192.168.1.11 ./tests_e2e/test-swarm-manifest.sh
CP_IP=192.168.1.5 NODE1_IP=192.168.1.10 NODE2_IP=192.168.1.11 ./tests_e2e/test-kubernetes-manifest.sh
CP_IP=192.168.1.5 NODE1_IP=192.168.1.10 ./tests_e2e/test-s3-manifest.sh
```

### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SSH_USER` | `root` | SSH username for remote nodes |
| `SSH_PORT` | `22` | SSH port |
| `API_PORT` | `8443` | API server listen port |
| `SWARM_NAME` | `dev` | Swarm name (swarm test) |
| `CLUSTER_NAME` | `dev-k8s` | K3s cluster name (k8s test) |
