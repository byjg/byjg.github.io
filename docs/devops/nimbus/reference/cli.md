---
sidebar_position: 1
sidebar_label: "CLI"
title: "CLI Reference"
---

# CLI Reference

All commands support `--context`, `--output` and `--token` (JWT bearer token, or `NIMBUS_TOKEN` env).

`--context` picks which Nimbus installation to talk to: a name resolves to `~/.nimbus/<name>.json`, a path is used as is, and without it the CLI uses `NIMBUS_CONFIG` (same rules) or else `~/.nimbus/config.json`. It used to be called `--config`, renamed because `nimbus config` is now a command (see [nimbus secret / nimbus config](#nimbus-secret--nimbus-config)).

```bash
nimbus --context prod configure --from prod-config.json   # save a context
nimbus --context prod node list                           # use it
export NIMBUS_CONFIG=prod                                 # or for the whole shell
```

`--output` (`-o`) sets how read commands print: `table` (the default) for people, or `json` for scripts. It applies to every `list` command and to `node events`, `gateway status`, `manifest status` and `compute instance-types`; `describe` and `task show` print JSON already. The JSON is what the API returns, with its field names, so a script reads a field by name instead of by column position, and keeps working when a column is added to the table. An empty list prints `[]`.

```bash
nimbus service list -o json | jq -r '.[] | select(.name == "web") | .status'
nimbus node list -o json | jq -r '.[] | select(.ip_address == "10.0.0.5") | .id'
```

## nimbus configure

Configure CLI credentials. Import from a JSON config file (downloaded from the GUI or bootstrap) or set individual flags.

```bash
# Import from JSON (recommended)
nimbus configure --from nimbus-config.json

# Override the API URL (e.g. when connecting from outside the WireGuard mesh)
nimbus configure --from nimbus-config.json --api-url https://<PUBLIC_IP>:8443

# Manual configuration
nimbus configure --api-url URL --access-key KEY --secret-key SECRET
```

## nimbus bootstrap

Initialize the control plane and create the admin user.

```bash
nimbus bootstrap --api-url URL [--insecure]
```

## nimbus version

Show client and server versions.

## nimbus node

| Subcommand       | Description                   | Key Flags                                                                                                      |
|------------------|-------------------------------|----------------------------------------------------------------------------------------------------------------|
| `add`            | Add a node via SSH or locally | `--ip` (required), `--user`, `--port`, `--key`, `--password`, `--profile`, `--name`, `--local`, `--gpu-driver` |
| `agent update`   | Update the agent on a node    | `[node-id-or-name]`, `--all`, `--ssh`, `--local`, and with `--ssh`: `--profile`, `--user`, `--port`, `--key`, `--password` |
| `os update`      | Upgrade OS packages on a node | `[node-id-or-name]`, `--all`                                                                                   |
| `os check`       | Re-check available OS updates | `[node-id-or-name]`, `--all`                                                                                   |
| `stop`           | Stop the agent on a node via its task queue | `[node-id-or-name]`, `--all`                                                                     |
| `start`          | Start the agent on a node over SSH from the control plane | `[node-id-or-name]`, `--profile`, `--user`, `--port`, `--key`, `--password`, `--all` |
| `list`           | List all nodes                |                                                                                                                |
| `events`         | Show a node's events (deploy steps, join failures, SSH updates) | `[node-id-or-ip]`                                               |
| `describe`       | Show node details             | `[id]`                                                                                                         |
| `cordon`         | Stop scheduling new workloads on a node | `[id]`                                                                               |
| `drain`          | Cordon a node and move its workloads elsewhere | `[id]`                                                                        |
| `uncordon`       | Put a drained node back into service | `[id]`                                                                                  |
| `delete`         | Delete a node                 | `[id]`                                                                                                         |
| `set-ip`         | Change a node's IP / pinned interface | `[node-id]`, `--ip`, `--interface`, `--regenerate-cert`                                                |
| `gpu-overcommit` | Set GPU overcommit factor     | `[node-id]` `[factor]` (1, 2, 4, or 8)                                                                         |

There are two ways to get a new agent onto a node, and they differ only in transport, so they are one command with a flag. `agent update` queues the work on the **agent's own task queue**: no SSH credentials, but the agent has to be reachable and the node `ready`. `agent update --ssh` has the control plane connect over **SSH**, which also works when the agent is down, and reissues the node's client certificate while it is there. Reach for the default first and fall back to `--ssh` when an agent is unreachable. An SSH-only flag passed without `--ssh` is refused rather than ignored.

`os update` and `os check` are the operating system's own packages, which have nothing to do with the agent's version — they sat beside it under similar names (`os-update`, `check-updates`) and were easy to confuse.

Like `add`, `update` runs its SSH connection from the **control plane**, not from your machine. It can use a stored SSH profile (`--profile`), and it reaches nodes your machine cannot. A `--key` file is read on your machine and sent to the control plane. The control plane copies the agent binary and a freshly issued client certificate to a private staging directory on the node, installs them owned by root (the certificate goes to `/var/lib/nimbus`, where the agent reads it), and restarts the agent. A non-root SSH user needs passwordless `sudo`. Progress is recorded as node events (`ssh_update_started`, `ssh_update_completed` or `ssh_update_failed`), which `update` prints as they arrive; it exits non-zero if any node failed. `update --local` updates the agent on the machine you run it on, without SSH.

`os update` runs a full OS package upgrade (`apt-get upgrade` / `dnf upgrade`) on the node through its agent — it does not use SSH. If the upgrade requires a reboot (for example a new kernel), the node transitions to the `needs_reboot` state and stops running tasks until an administrator reboots it manually; the agent never reboots on its own. Use `--all` to queue the upgrade on every ready node.

Because the upgrade can take several minutes, the task reports a `running` status while it is in progress (visible in the node's task list in the UI and via `nimbus task list`). When it finishes, the package-manager output is stored on the task result — inspect it with `nimbus task show <task-id>`.

The upgrade does not run inside the agent. The agent writes a short shell script, starts it as a transient systemd unit (`nimbus-os-update`) and goes back to its other work. The script runs the upgrade, captures the log, and calls the agent binary back with `--finish-os-update` to report the result, request a reboot if one is needed, and re-count what is still outstanding.

This matters because the upgrade includes nimbus's own packages: installing them restarts `nimbus-agent`, and an upgrade running inside the agent's control group would be killed with it, leaving `dpkg` half-configured and the node offline. Detached, the upgrade survives the restart, and because it reports for itself the task still completes — the agent that started it does not have to be alive at the end. On a control plane the upgrade also restarts `nimbus-api`, so the callback retries for a few minutes and, failing that, leaves the result in `/var/lib/nimbus/pending-results` for the agent to deliver on its next start.

Before starting, the agent records which nimbus services are running, and the callback restarts any the upgrade stopped — naming them on the task result. Releases up to 0.7.0 stopped **and disabled** these services on every upgrade, so a node upgrading from one of them would otherwise be left offline, and off at the next boot too; the callback and the new package's post-install script both repair that. A service an administrator had already stopped is not started, because it was not in the pre-upgrade snapshot.

`stop` and `start` are a pair. `stop` goes through the node's own task queue: the agent reports the node **offline** and then stops itself, so the control plane shows the stop immediately instead of discovering a stale heartbeat. The machine keeps running and so do its workloads — containers carry on serving, and Nimbus simply stops managing the node. Because the workloads are no longer reported, they show as `unreachable` while the node is stopped.

`start` cannot use the task queue: there is no agent left to take a task. The control plane opens an SSH connection itself, like `node add` and `node update`, so it can use a stored SSH profile (`--profile`) and reach nodes your machine cannot; a non-root SSH user needs passwordless sudo. It runs `systemctl enable --now nimbus-agent`, which also repairs a node whose unit was left disabled and keeps the agent across reboots. Progress is recorded as node events (`ssh_start_started`, `ssh_start_completed`, `ssh_start_failed`), which `start` prints as they arrive; it exits non-zero if any node failed. The node returns to `ready` on its next heartbeat.

### Taking a node out of service

Four commands sound similar and do different things:

| Command  | What happens to the machine          | What happens to its workloads                                                  | Getting back                                         |
|----------|--------------------------------------|--------------------------------------------------------------------------------|------------------------------------------------------|
| `cordon` | Keeps running, agent keeps reporting | Left alone; nothing new is placed here | `node uncordon` |
| `drain`  | Keeps running, agent keeps reporting | Moved to other nodes by the orchestrator that owns them                        | `node uncordon`                                      |
| `stop`   | Keeps running; only the agent stops  | Keep running, but are reported `unreachable` because nothing is reporting them | `node start` (over SSH)                              |
| `reboot` | Restarts                             | Come back as the runtime restarts them                                         | Automatic — the node reports `ready` when it is back |
| `delete` | Untouched                            | Left as they are                                                               | Re-add the node                                      |

`cordon` is the gentler of the two: the node stops receiving new work and keeps everything it already has. Use it when you want a node to wind down naturally, or ahead of a window where you would rather it did not pick anything up.

`drain` is the one for planned maintenance. It marks the node `cordoned`, so Nimbus places nothing new on it, and asks every orchestrator the node belongs to to drain it: Docker Swarm sets the node's availability to `drain` and Kubernetes evicts its pods, so **the workloads move to other nodes** rather than stopping. The order goes to the swarm manager or the cluster's control node, not to the node being drained.

Cluster membership is untouched — the node stays in the swarm or cluster — which is what makes `node uncordon` enough to undo it. Workloads that moved are not moved back; the orchestrators simply start placing work there again. A node whose workloads belong to no orchestrator keeps running them: there is nowhere for them to move.

Cordoning is independent of a node's status, so a cordoned node still reports `ready` and can be rebooted, updated or stopped like any other.

`stop` is the one to reach for when a machine needs to be left alone for a while (hardware work, a noisy neighbour, a node you want out of the cluster without deleting it). Nimbus lets go of the node entirely, and nothing is scheduled on it because it is offline.

`set-ip` records a node's new address and pins the interface the agent watches for future changes. For the **control-plane** node, add `--regenerate-cert`: the API's TLS certificate lists the addresses it was issued for, so after the control plane moves, clients cannot verify it on the new one. The flag reissues that certificate from the existing CA and swaps it in without a restart — agents and already-downloaded connection configs keep working, since the CA is unchanged. See [Handling Dynamic Node IPs](../guides/node-dynamic-ip).

The agent also checks for available OS package updates automatically once per day and reports the counts back to the control plane. `nimbus node list` shows an `UPDATES` column (total, with the security subset in parentheses; `-` means the node has not reported a check yet), and the node detail view shows the same along with when it was last checked. Nothing is installed automatically — use `os update` when you want to apply them.

## nimbus swarm

| Subcommand  | Description          | Key Flags                                   |
|-------------|----------------------|---------------------------------------------|
| `create`    | Create a swarm group | `--name` (required), `--lb`, `--cloudflare` |
| `add-node`  | Add node to swarm    | `--swarm` (required), `--node` (required)   |
| `list`      | List swarms          |                                             |
| `delete`    | Delete a swarm       | `[id]`, `--force`                           |

## nimbus compute

| Subcommand       | Description           | Key Flags                                                                                                                                                   |
|------------------|-----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `create`         | Create an instance    | `--name`, `--image` (required), `--swarm` or `--k8s`, `--type`, `--replicas`, `--port`, `--domain`, `--volume`, `--env`, `--command`, `--platform`, `--gpu` |
| `scale`          | Scale replicas        | `--id` (required), `--replicas` (required)                                                                                                                  |
| `clone`          | Clone an instance     | `--id` (required), `--name`, `--target-swarm`, `--target-k8s`                                                                                                |
| `list`           | List instances        |                                                                                                                                                             |
| `describe`       | Show instance details | `[id]`                                                                                                                                                      |
| `delete`         | Delete an instance    | `[id]`                                                                                                                                                      |
| `stop`           | Stop an instance      | `[id]`                                                                                                                                                      |
| `start`          | Start an instance     | `[id]`                                                                                                                                                      |
| `logs`           | Fetch instance logs   | `[id]`, `-n` (lines), `-w` (follow)                                                                                                                         |
| `instance-types` | List instance types   |                                                                                                                                                             |

## nimbus k8s

| Subcommand       | Description                | Key Flags                                                        |
|------------------|----------------------------|------------------------------------------------------------------|
| `create`         | Create a K3s cluster       | `--name` (required), `--nodes` (required, comma-separated), `--ha`, `--lb` |
| `kubeconfig`     | Get kubeconfig             | `--name` (required)                                              |
| `add-node`       | Add worker node            | `--cluster` (required), `--node` (required)                      |
| `remove-node`    | Remove worker node         | `--cluster` (required), `--node` (required)                      |
| `promote`        | Promote a worker to control-plane | `--cluster` (required), `--node` (required)               |
| `demote`         | Demote a control-plane node back to worker | `--cluster` (required), `--node` (required)      |
| `list`           | List clusters              |                                                                  |
| `delete`         | Delete a cluster           | `[id]`                                                           |

The verbs match `nimbus swarm`, so the same operation is spelled the same way whichever orchestrator it is on.

`--lb` deploys EasyHAProxy on the cluster, exactly as `swarm create --lb` does for a swarm. Without it the cluster has no ingress controller, and a manifest's Ingress objects are not served by anything — a valid choice when ingress is handled elsewhere. One can be added or removed later with `nimbus gateway lb set --cluster CLUSTER_ID` and `nimbus gateway lb delete --cluster CLUSTER_ID`.

## nimbus s3

| Subcommand  | Description            | Key Flags                                                                            |
|-------------|------------------------|--------------------------------------------------------------------------------------|
| `create`    | Deploy RustFS instance | `--name` (required), `--swarm` (required), `--volume` (required), `--password`, `--oidc-cert` |
| `list`      | List S3 instances      |                                                                                      |
| `delete`    | Delete S3 instance     | `[id]`                                                                               |

## nimbus volume

Every volume operation lives here, including attaching. The volume is the noun;
where it goes is a flag.

| Subcommand  | Description                                   | Key Flags                                                                     |
|-------------|-----------------------------------------------|-------------------------------------------------------------------------------|
| `create`    | Create a volume (NFS, or local with `--local`) | `--name` (required), `--node` (required), `--folder` (required), `--local`    |
| `list`      | List volumes, or what a target has            | `--cluster`, `--instance`                                                     |
| `attach`    | Attach to an instance or a Kubernetes cluster | `[volume-id]`, `--instance` **or** `--cluster` (required), `--path`, `--size` |
| `detach`    | Detach from an instance or a cluster          | `[volume-id]`, `--instance` **or** `--cluster` (required)                     |
| `delete`    | Delete volume                                 | `[id]`                                                                        |

`attach` takes exactly one target. `--path` is the mount path inside an instance and applies only to `--instance`; `--size` is the claim size and applies only to `--cluster`, where it defaults to `10Gi` — a claim has to carry a figure, and NFS ignores it.

There is no `--swarm`, for either verb. A volume is created as a Docker volume on **every** swarm node when it is created, so a Compose stack can reference `nfs-<volume>` as `external` with nothing to attach first. Kubernetes is the exception: the claim is per-cluster and exists only once attached. See [Volumes](../guides/volumes).

`list` with no flags shows every volume. `--cluster` shows what is attached to a cluster and the claim each provides; `--instance` shows what is mounted in an instance and where. Detaching from a cluster waits for the cluster's answer and reports it: Kubernetes will not complete the deletion while a pod still mounts the claim.

## nimbus secret / nimbus config

Values services read by name instead of carrying them in a compose file or manifest. The two commands are the same; a secret's value is stored encrypted and never shown, a config's can be read back. See [Secrets and Configs](../guides/secrets).

| Subcommand  | Description                                              | Key Flags                                                                                          |
|-------------|----------------------------------------------------------|----------------------------------------------------------------------------------------------------|
| `create`    | Create one on a swarm, or on a cluster in a namespace    | `--name` (required), `--swarm` **or** `--cluster` (required), `--namespace`, `--from-file`, `--from-literal` |
| `list`      | List them, with the services using each                  |                                                                                                    |
| `describe`  | Show one (never a secret's value)                        | `[id-or-name]`, `--value` (config only: print the value)                                           |
| `update`    | Replace the value and redeploy the services using it     | `[id-or-name]`, `--from-file`, `--from-literal`                                                    |
| `delete`    | Delete one no service uses                               | `[id-or-name]`                                                                                     |

Without `--from-file` or `--from-literal`, the value is read from stdin.

## nimbus service

A **service** is a deployed workload bundle: a Docker Compose stack on a swarm, or a Kubernetes manifest on a cluster. Both are managed with the same commands.

| Subcommand  | Description                                       | Key Flags                                                                                |
|-------------|---------------------------------------------------|-------------------------------------------------------------------------------------------|
| `deploy`    | Deploy a compose stack, or apply a k8s manifest    | `--file` (required), `--swarm` **or** `--cluster` (required), `--name`, `--env`, `--volume` |
| `list`      | List services                                     |                                                                                             |
| `describe`  | Show service details                              | `[id]`                                                                                      |
| `stop`      | Stop a service                                    | `[id]`                                                                                      |
| `start`     | Start a service                                   | `[id]`                                                                                      |
| `delete`    | Delete a service                                  | `[id]`                                                                                      |
| `logs`      | Fetch logs from a service                         | `[id]`, `-n` (lines), `-w` (follow), `--container` (one workload)                            |

### Service logs

A service is many workloads — a stack becomes one Docker service per Compose entry, a manifest becomes whatever it declares — and neither `docker` nor `kubectl` tails all of them at once. `service logs` reads each one and tags every line with the workload it came from:

```bash
$ nimbus service logs svc-1a2b -n 20
[web] 172.17.0.1 - GET / 200
[web] 172.17.0.1 - GET /api 200
[db]  LOG:  database system is ready
```

`--container` narrows the read to one workload, and its output is passed through untagged, exactly as `docker service logs` or `kubectl logs` would print it:

```bash
nimbus service logs svc-1a2b --container web
```

The name to pass is the one in the Compose file (`web`, not `mystack_web`) or the workload's name in the manifest; on Kubernetes `namespace/name` and `kind/name` also work when a manifest declares the same name twice. Only objects that can have logs are read — a Service, ConfigMap or Ingress is skipped. A workload that cannot be read reports its error in place, so one crash-looping pod does not hide the rest of the stack.

### Compose stacks and Kubernetes manifests

`--swarm` makes the file a Docker Compose file, deployed as a stack on that swarm. `--cluster` makes it a Kubernetes manifest, applied with `kubectl` on the cluster's control node; it may hold several documents separated by `---`. A service targets one or the other, never both.

`nimbus service list` names the difference in the `KIND` column — `compose` or `manifest` — with the swarm or cluster in `TARGET`:

```
ID            NAME       KIND      TARGET          REPLICAS  STATUS
svc-2878de16  vllm-lite  compose   swarm-3f1d5a37  2         running
svc-91a0c4e2  api        manifest  cl-7f2b18d0     3         running
```

In the web UI the same distinction is a badge on each row, and the deploy screen asks which target you mean before it asks for the file.

**What Nimbus records.** A manifest can declare anything — Deployments, Ingresses, CRDs — so there is no label or name to watch it by. Nimbus records the objects `kubectl` reports applying, and that record is what everything else works from:

- **Monitoring** checks those objects by name. Kinds that run pods (Deployment, StatefulSet, DaemonSet, Job) report ready against desired, so a service is `running` only once its workloads are ready and `pending` while they roll out (`api has 1/3 ready`). Anything else counts as present or missing; an object that has gone missing makes the service `error`, because Nimbus applied it and something else removed it.
- **Re-applying** the same service — `deploy` again with the same name, or editing it in the UI — applies the new manifest and deletes the objects it no longer declares. Only objects Nimbus recorded applying are ever deleted, which is the safe form of `kubectl apply --prune`: that one selects by label and is well known for removing more than intended.
- **`stop`** deletes the objects but keeps the manifest, so `start` re-applies it. **`remove`** deletes the objects and the service record.

**Using an NFS volume.** The two backends reference a Nimbus volume differently, and the web UI's deploy screen can insert either snippet at the cursor for any existing volume.

On a swarm, Nimbus creates a Docker volume on the node named `nfs-<volume>`, so a compose file refers to it as external. A compose file is a single YAML document, and Docker ignores top-level `x-` keys, so an anchor can live there and be aliased by every service that wants the mount:

```yaml
volumes:
  nfs-media:
    external: true

x-nfs-media: &nfs-media
  - nfs-media:/data/media

services:
  web:
    image: nginx
    volumes: *nfs-media
```

On a cluster, attaching a volume (`POST /v1/kubernetes/clusters/{id}/volumes`) applies a PersistentVolume and a claim named `nfs-<volume>`. Reuse there is **by claim name**: every workload naming the same claim gets the same share, across documents and across services. YAML anchors cannot help across documents — each document has its own anchor namespace, so an anchor defined before a `---` is not visible after it — but they still save repetition within one document:

```yaml
spec:
  template:
    spec:
      containers:
        - name: app
          volumeMounts:
            - &mnt-media
              name: media
              mountPath: /data/media
        - name: sidecar
          volumeMounts:
            - *mnt-media
      volumes:
        - name: media
          persistentVolumeClaim:
            claimName: nfs-media
```

A volume gains its claim when it is attached to the cluster — `nimbus volume attach <volume-id> --cluster <id>`, or the **NFS Volumes** card on the cluster page. `nimbus volume list --cluster <id>` shows what is attached.

Mounting a claim that was never attached is the quiet failure worth knowing about: `kubectl apply` **succeeds**, and the pods then sit unschedulable waiting for a claim that does not exist. Nimbus reports Kubernetes' own reason on the service (`Deployment/api in default has 0/2 ready: persistentvolumeclaim "nfs-test" not found`), and the web UI offers **Attach and add** so the claim is created before the manifest names it. On a swarm the equivalent failure is loud: the deploy itself fails with Docker's error.

`describe` prints the manifest and the recorded objects, and the UI lists them under **Applied objects** — which is what is really in the cluster, as opposed to what the manifest asks for.

## nimbus manifest

| Subcommand  | Description               | Key Flags                               |
|-------------|---------------------------|-----------------------------------------|
| `apply`     | Provision from manifest   | `--file` (required), `--env`, `--prune`      |
| `remove`    | Remove the resources a manifest declares | `[name]` or `--file`, `--env`, `--purge` |
| `list`      | List saved manifests      |                                              |
| `status`    | Show a saved manifest's status | `[name]`                                |

`remove` keeps the manifest record, so the same manifest can be applied again. `--purge` deletes the record as well, once its resources are gone. There used to be a separate `manifest delete` that did the second thing, which left two verbs for the same act where one was quietly more destructive.

## nimbus ssh-profile

Manage SSH profiles — named, reusable SSH credential sets stored encrypted in the database. Sensitive data (private keys, passwords) is encrypted using the control plane's CA key.

| Subcommand  | Description           | Key Flags                                                      |
|-------------|-----------------------|----------------------------------------------------------------|
| `create`    | Create an SSH profile | `--name` (required), `--user`, `--port`, `--key`, `--password` |
| `list`      | List SSH profiles     |                                                                |
| `delete`    | Delete an SSH profile | `[id]`                                                         |

At least one of `--key` (path to private key file) or `--password` is required. The `--key` flag reads the file and stores its content encrypted — the original file is not needed afterward.

```bash
# Create a profile with an SSH key
nimbus ssh-profile create --name prod-servers --user deploy --key ~/.ssh/id_ed25519

# Create a profile with password auth
nimbus ssh-profile create --name staging --user root --password secret123

# List profiles (sensitive data is never shown)
nimbus ssh-profile list

# Delete a profile
nimbus ssh-profile delete sshp-a1b2c3d4
```

SSH profiles are referenced in manifests via `ssh.profile`:

```yaml
nodes:
  web1:
    ip: 192.168.1.10
    ssh:
      profile: prod-servers
```

## nimbus certificate

Manage TLS certificates for SNI-based multi-domain serving. Certificates are stored in the
database and served immediately — no restart required. The default WireGuard IP cert
(`10.106.103.1`) is built-in and cannot be deleted.

| Subcommand | Description              | Key Flags                                                      |
|------------|--------------------------|----------------------------------------------------------------|
| `list`     | List certificates        |                                                                |
| `create`   | Create a TLS certificate | `--domain` (required), `--cert` (required), `--key` (required), `--ca` |
| `delete`   | Delete a certificate     | `[id]`                                                         |

```bash
# Add a Let's Encrypt certificate for a public domain
nimbus certificate create \
  --domain nimbus.example.com \
  --cert /etc/letsencrypt/live/nimbus.example.com/fullchain.pem \
  --key  /etc/letsencrypt/live/nimbus.example.com/privkey.pem

# Add a certificate with a custom CA (for internal PKI)
nimbus certificate create \
  --domain internal.example.com \
  --cert /path/to/cert.pem \
  --key  /path/to/key.pem \
  --ca   /path/to/ca.pem

# List all certificates
nimbus certificate list

# Delete a certificate
nimbus certificate delete cert-a1b2c3d4
```

See [Exposing OIDC/OAuth2 Publicly](../guides/oidc-public-proxy) for a full setup guide.

## nimbus dns

| Subcommand  | Description                    | Key Flags    |
|-------------|--------------------------------|--------------|
| `create`    | Configure local DNS resolution | `--swarm-id` |
| `delete`    | Remove DNS configuration       | `--swarm-id` |

## nimbus gateway

| Subcommand  | Description                          | Key Flags            |
|-------------|--------------------------------------|----------------------|
| `status`    | Show the routing table               |                      |
| `lb set`    | Deploy the load balancer             | `--swarm` **or** `--cluster` |
| `lb delete` | Delete the load balancer             | `--swarm` **or** `--cluster` |
| `lb list`   | List load balancers                  |                      |

The load balancer (EasyHAProxy) is what the gateway routes through, so it is managed here rather than under `nimbus swarm` — `nimbus swarm create --lb` still deploys one at creation time.

`lb list` shows every load balancer, on swarms and clusters alike, with the one it serves:

```bash
$ nimbus gateway lb list
ID              NAME                 SERVES            NODE      PORT   STATUS
lb-edge-9f2a    easyhaproxy-sw-1     swarm-1a2b        node-1    80     active
lb-k8s-3c71     easyhaproxy-k8s-p1   cls-ccf2d1c4      node-4    31080  active
```

Both backends work the same way: a load balancer exists when it was asked for — `swarm create --lb`, `k8s create --lb`, or `lb set` later — and `lb delete` takes it away. Removing one leaves the workloads running; what stops is the ingress in front of them.

## nimbus iam

| Subcommand  | Description               | Key Flags                                     |
|-------------|---------------------------|-----------------------------------------------|
| `get-token` | Get JWT token (HMAC auth) |                                               |
| `login`     | Login with password       | `--email` (required), `--password` (required) |

`login` and `get-token` act on whoever runs the command rather than on a resource, so they stay at the top. Everything else is grouped by the thing it manages.

### nimbus iam user

| Subcommand     | Description               | Key Flags                                       |
|----------------|---------------------------|--------------------------------------------------|
| `create`       | Create a user             | `--email` (required), `--name`, `--admin`        |
| `list`         | List users                |                                                  |
| `update`       | Update email or name      | `<user-id>` (arg), `--email`, `--name`           |
| `delete`       | Delete a user             | `<user-id>` (arg)                                |
| `set-password` | Set user password         | `--user-id` (required), `--password` (required)  |

### nimbus iam key

| Subcommand | Description           | Key Flags                 |
|------------|-----------------------|---------------------------|
| `create`   | Generate API key pair | `--user-id` (required)    |
| `list`     | List a user's keys    | `--user-id` (required)    |
| `revoke`   | Revoke an API key     | `--key-id` (required)     |

### nimbus iam group

| Subcommand   | Description                   | Key Flags                                              |
|--------------|-------------------------------|--------------------------------------------------------|
| `list`       | List all groups               |                                                        |
| `create`     | Create a group                | `--name` (required), `--description`, `--scope` (repeatable) |
| `delete`     | Delete a custom group         | `<group-id>` (arg)                                     |
| `set-scopes` | Replace a group's scope list  | `--group` (required), `--scope` (repeatable)           |

### nimbus iam scope

| Subcommand   | Description                        | Key Flags                              |
|--------------|------------------------------------|----------------------------------------|
| `list`       | List all registered ARN scopes     |                                        |
| `register`   | Register a new scope               | `--scope` (required), `--description`  |
| `unregister` | Remove a registered scope          | `<scope>` (arg)                        |

### nimbus iam client

Manage OAuth2 clients used by external services (Grafana, ArgoCD, Nextcloud, etc.) to authenticate via Nimbus SSO.

| Subcommand | Description               | Key Flags                                                      |
|------------|---------------------------|----------------------------------------------------------------|
| `list`     | List all OAuth2 clients   |                                                                |
| `create`   | Create an OAuth2 client   | `--name` (required), `--redirect-uri` (required, repeatable)  |
| `delete`   | Delete an OAuth2 client   | `<id>` (arg — use the `ID` column from `list`, not Client ID) |

The `create` command prints the **Client ID** and **Client Secret**. The secret is shown only once — save it immediately.

```bash
# Register a client for Grafana
nimbus iam client create \
  --name grafana \
  --redirect-uri "https://grafana.example.com/login/generic_oauth"

# Register a client with multiple redirect URIs
nimbus iam client create \
  --name argocd \
  --redirect-uri "https://argocd.example.com/auth/callback" \
  --redirect-uri "https://argocd-staging.example.com/auth/callback"

# List all clients
nimbus iam client list

# Delete a client (use the ID column, not the client_id)
nimbus iam client delete oac-abc123
```

### nimbus iam user-group

| Subcommand | Description                   | Key Flags                                |
|------------|-------------------------------|------------------------------------------|
| `list`     | List a user's groups          | `--user` (required)                      |
| `add`      | Add user to a group           | `--user` (required), `--group` (required)|
| `remove`   | Remove user from a group      | `--user` (required), `--group` (required)|

## nimbus cleanup

Force-clean a resource stuck in error state.

```bash
nimbus cleanup [resource-type] [resource-id]
```

Valid resource types: `instance`, `cluster`, `s3`, `loadbalancer`, `swarm`, `volume`.
