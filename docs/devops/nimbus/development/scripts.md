---
sidebar_position: 3
sidebar_label: "Development Scripts"
title: "Development Scripts"
---

# Development Scripts

The `scripts/` directory has helpers for running a development build of DockNimbus. Run them from the repository root.

| Script | Runs on | What it does |
|--------|---------|--------------|
| [`deploy.sh`](#deploysh) | your workstation | Builds and installs a development version on an existing control plane |
| [`dev-run.sh`](#dev-runsh) | the control plane itself | Pulls, builds, installs, and runs `nimbus-api` in the foreground |
| [`dev-gui.sh`](#dev-guish) | the control plane itself | Starts the agent and runs `nimbus-gui` in the foreground |
| [`cleanup.sh`](#cleanupsh) | your workstation | Wipes all DockNimbus state from a host |

## deploy.sh

Deploys the development version in your working tree to a control plane that is already installed (for example from the `.deb` packages). This is the standard way to try a change on a real cluster.

```bash
NIMBUS_HOST=ubuntu@192.168.1.10 NIMBUS_ARCH=arm64 ./scripts/deploy.sh
```

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NIMBUS_HOST` | yes | | SSH target of the control plane, `user@host` |
| `NIMBUS_ARCH` | no | `amd64` | Control plane architecture: `amd64`, `arm64` or `armhf` |

What it does:

1. Runs `make build-cross`, which builds every binary for every architecture.
2. Copies `nimbus`, `nimbus-api`, `nimbus-agent` and `nimbus-gui` for `NIMBUS_ARCH` to the host.
3. Copies the agent binaries for all architectures to `/var/lib/nimbus/dist/` on the host. The API serves agents to nodes from there.
4. Stops `nimbus-agent`, `nimbus-gui` and `nimbus-api`, installs the binaries in `/usr/bin`, and starts the services again.

Requirements: SSH access to the host, passwordless `sudo` on it, and the three systemd units already installed.

`deploy.sh` only updates the control plane. To move the other nodes to the new agent afterwards, run `nimbus node update-agent --all`: each agent fetches the new binary that `deploy.sh` put in `/var/lib/nimbus/dist/`, with no SSH. For a node whose agent is down, use `nimbus node update <node> --profile <ssh-profile>`, which has the control plane install it over SSH.

## dev-run.sh

Builds and runs the API from a checkout **on the control plane machine itself**, with logs in your terminal.

```bash
./scripts/dev-run.sh
```

It runs `git pull` on the current branch, stops `nimbus-agent`, and runs `make build` and `make build-agent-cross`. It then installs the binaries in `/usr/bin` and the agent binaries in `/var/lib/nimbus/dist/`, and runs `sudo nimbus-api` in the foreground, which reads `/etc/nimbus/api.yaml`. Press Ctrl+C to stop it.

If the `nimbus-api` systemd service is installed, stop it first (`sudo systemctl stop nimbus-api`), otherwise both compete for port 8443.

## dev-gui.sh

Companion to `dev-run.sh`: run it in a second terminal.

```bash
./scripts/dev-gui.sh
```

It starts the `nimbus-agent` service (which `dev-run.sh` stopped) and runs `sudo nimbus-gui` in the foreground, which reads `/etc/nimbus/gui.yaml`. As with the API, stop the `nimbus-gui` service first if it is installed.

## cleanup.sh

Removes **everything** DockNimbus put on a host, so you can reinstall from scratch. It is destructive:

- stops and removes the agent, the API, the GUI, their binaries and systemd units
- deletes `/etc/nimbus`, `/var/lib/nimbus` (including the CA and database) and `~/.nimbus`
- tears down the `wg-nimbus` WireGuard interface
- leaves the Docker Swarm and removes **all** its services
- uninstalls K3s
- removes the NFS test exports and the test swap file

```bash
./scripts/cleanup.sh localhost
SSH_USER=ubuntu SSH_KEY=~/.ssh/id_ed25519 ./scripts/cleanup.sh 192.168.1.10
```

| Variable | Default | Description |
|----------|---------|-------------|
| `SSH_USER` | `root` | SSH user; commands run with `sudo` when not root |
| `SSH_PORT` | `22` | SSH port |
| `SSH_KEY` | | Path to the SSH private key |
| `SSH_PASSWORD` | | Use password authentication instead of a key |

The end-to-end suite has its own variant, `tests_e2e/cleanup.sh`, which cleans the local host and the nodes set in `NODE1_IP`, `NODE2_IP` and `NODE_GPU_IP` (see [End-to-End Tests](./testing)).
