# Handling Dynamic Node IPs

This guide explains what happens when a node's public IP address changes, and
how to recover connectivity using the `nimbus node update-ip` command.

---

## How Nimbus uses IP addresses

Nimbus maintains two distinct address spaces for each node:

| Field | Meaning | Used for |
|-------|---------|---------|
| `ip_address` | Node's public / LAN IP | WireGuard peer endpoint (initial handshake) |
| `wireguard_ip` | Overlay IP (e.g. `10.106.103.x`) | All ongoing agent ↔ API communication |

After a node is provisioned, **all internal traffic flows over the WireGuard
overlay network**, not over the public IP. The agent connects to the API using
the control-plane's WireGuard IP (e.g. `10.106.103.1:8443`). This means
day-to-day operation is completely insulated from public IP changes — as long
as the WireGuard tunnel stays up.

The public IP only matters to WireGuard for the initial peer handshake and
re-keying. If it becomes stale, WireGuard cannot establish a new session.

---

## Automatic self-healing via heartbeat

Every agent heartbeat now includes the node's current LAN/public IP address
(the first non-virtual, non-WireGuard interface). The API compares this against
the stored `ip_address` on every heartbeat. If they differ, the API:

1. Updates `nodes.ip_address` in the database.
2. Queues `update_wireguard_peers` on **all** provisioned nodes so every peer
   gets the new endpoint immediately.

This makes IP changes **fully automatic** for any node that can still reach the
API — which covers the common case of a worker whose WireGuard roaming kept the
tunnel alive through the IP change.

Running `nimbus node update-ip` manually is only needed when the self-healing
path is broken (see [Scenario 2](#scenario-2--control-plane-cp-node-ip-changes)).

## WireGuard roaming

WireGuard supports endpoint roaming: when a peer initiates a handshake from a
new source IP, the receiving side automatically updates that peer's endpoint for
the current session. Combined with the heartbeat-based auto-update above, this
means worker IP changes are fully transparent in most cases.

---

## Scenario 1 — Worker node IP changes

**Impact:** Low. WireGuard roaming usually recovers the tunnel automatically.

**What breaks without `update-ip`:**
- After a WireGuard restart or reboot, the stale endpoint is re-applied from
  the config file and the tunnel may fail to re-establish.
- New nodes that join will receive the stale peer list.

**Fix:**

```bash
nimbus node update-ip --node <node-id> --ip <new-ip>
```

This updates the DB and queues `update_wireguard_peers` on all provisioned
nodes so every peer gets the fresh endpoint.

---

## Scenario 2 — Control-plane (CP) node IP changes

**Impact: High.** The CP holds the API and the WireGuard hub. Workers have the
old CP endpoint hardcoded in their WireGuard peer config. Unlike the worker
scenario, workers cannot initiate a handshake to an unknown IP — they only know
the old one.

**What breaks:**
- Workers cannot re-establish the WireGuard tunnel after a keepalive timeout or
  rekey because their peer endpoint is wrong.
- Once WireGuard is down, agents cannot reach the API (which is on the overlay
  `10.106.103.1`) and become unreachable.
- New join tokens will still encode the old CP IP until `update-ip` is run.

**Fix — while workers are still connected (tunnel still up):**

Run `update-ip` before the old IP becomes unreachable. The CP will push peer
updates to all workers over the still-live tunnel:

```bash
nimbus node update-ip --node <cp-node-id> --ip <new-cp-ip>
```

**Fix — after workers have already lost connectivity (tunnel down):**

See [SSH fallback procedure](#ssh-fallback-procedure) below.

---

## Scenario 3 — Both CP and worker IPs change simultaneously

This is the worst case (e.g. full network re-addressing). The tunnel is broken
for every node. Follow the SSH fallback procedure for each worker, then run
`update-ip` for every node.

---

## SSH fallback procedure

When WireGuard is already down on a worker and the worker cannot receive the
`update_wireguard_peers` task from the API, manually update the peer endpoint
on the worker over SSH:

```bash
# On the worker node (via SSH):

# Option A — live update without restart (preferred):
wg set wg-nimbus peer <CP-wg-public-key> endpoint <new-cp-ip>:51820

# Option B — update the config file and reload:
sed -i "s/Endpoint = .*/Endpoint = <new-cp-ip>:51820/" /etc/wireguard/wg-nimbus.conf
wg syncconf wg-nimbus /etc/wireguard/wg-nimbus.conf
```

To find the CP's WireGuard public key:

```bash
# On the control-plane node:
cat /etc/wireguard/wg-nimbus.conf | grep PrivateKey | \
  awk '{print $3}' | wg pubkey
```

Once the tunnel is restored, the worker will reconnect to the API and can
receive normal tasks again. Then run `update-ip` from the CLI to persist the
change and redistribute configs to all nodes:

```bash
nimbus node update-ip --node <cp-node-id> --ip <new-cp-ip>
```

---

## Recommendation: use DDNS for the control-plane

If the CP's public IP changes frequently (e.g. residential ISP with no static
IP), consider:

1. **Dynamic DNS (DDNS)**: Register a hostname (e.g. `cp.mylab.duckdns.org`)
   and keep it updated whenever the IP changes. Configure your router or a
   cron job to push updates to your DDNS provider.

2. **WireGuard DNS endpoint**: Nimbus currently stores raw IPs, not hostnames.
   As a workaround, configure `/etc/wireguard/wg-nimbus.conf` on each worker
   to use the DDNS hostname as the CP peer endpoint. WireGuard will resolve it
   on each handshake:

   ```ini
   [Peer]
   # CP
   PublicKey = <cp-public-key>
   Endpoint = cp.mylab.duckdns.org:51820
   AllowedIPs = 10.106.103.1/32
   PersistentKeepalive = 25
   ```

3. **Static LAN IP**: If the CP is in your local network, assign it a static IP
   via DHCP reservation in your router. This is the simplest solution for home
   lab setups and eliminates the problem entirely.

---

## Reference

### `nimbus node update-ip`

```
Usage:
  nimbus node update-ip [node-id] [flags]

Flags:
  --node string   Node ID (or pass as positional argument)
  --ip   string   New public IP address (required)

Examples:
  nimbus node update-ip node-abc123 --ip 192.168.1.50
  nimbus node update-ip --node node-abc123 --ip 192.168.1.50
```

### API endpoint

```
POST /v1/nodes/{id}/ip
Content-Type: application/json

{"ip_address": "192.168.1.50"}
```

**Response:** Updated node object with the new `ip_address`.

**Error cases:**

| Status | Reason |
|--------|--------|
| `400` | Missing or invalid IP address |
| `400` | Node not yet provisioned (no WireGuard key) |
| `404` | Node not found |