---
sidebar_position: 2
sidebar_label: "VMs"
title: "VMs"
---

# VMs

A VM runs on a **VM host**: a node whose agent runs QEMU/KVM instead of
containers. The VMs are bridged onto the node's network, so each one gets its
own address from your network's DHCP, like any other machine on the LAN.

A VM host is never a member of a swarm or Kubernetes cluster. Swarm and K3s do
not see the CPU and memory its VMs use and would place containers on them, so
a node does one or the other.

## What a node offers

Every agent reports whether its node can run VMs. `nimbus node describe NODE`
shows it under `vm_support`:

```json
"vm_support": {
  "kvm": true,
  "bridges": ["docker0"],
  "uplink": "eth0"
}
```

| Field            | Meaning |
|------------------|---------|
| `kvm`            | `/dev/kvm` exists. Without it VMs would be emulated, too slow to offer, so the node cannot be a VM host. |
| `bridges`        | The Linux bridges on the node, which you can name with `--bridge`. |
| `uplink`         | The network card that carries the default route. |
| `bridge_refusal` | Why Nimbus cannot create its own bridge on the uplink; absent when it can. |

VMs run the node's own architecture: arm64 guests on an arm64 node, amd64 on
amd64. KVM does not accelerate another architecture.

## Making a node a VM host

```bash
nimbus node vm-host enable raspberry-01
```

The agent installs QEMU, its UEFI firmware, `qemu-img` and `xorriso`, then sets
up the bridge the VMs use. The node's `vm_host` goes from `enabling` to
`enabled`, or to `error` with the reason in `vm_host_error`. `nimbus node list`
shows the node's role as `vm-host`.

The request is refused before anything reaches the node, with the reason, when:

- the node is a member of a swarm or Kubernetes cluster;
- it has no KVM;
- its agent is too old to report `vm_support`;
- you name a bridge it does not have, or name none and Nimbus cannot create its own.

Once a node is a VM host, adding it to a swarm or cluster is refused.

### The bridge Nimbus creates

Without `--bridge`, Nimbus creates the bridge `nimbus-br0` on the uplink:

1. It writes `/etc/netplan/90-nimbus-bridge.yaml`, which puts the card on the
   bridge and moves the card's DHCP settings to it. The bridge takes the card's
   MAC address, so DHCP hands the node the same IP and its registered address
   does not change. No other netplan file is touched.
2. Many DHCP servers (dnsmasq, OpenWrt, Pi-hole) hand out leases by DHCP
   client-id rather than MAC, and the client-id systemd-networkd sends depends
   on the interface name. So the bridge sends the card's client-id, read from
   the card's current lease, through the drop-in
   `/etc/systemd/network/10-netplan-nimbus-br0.network.d/nimbus-dhcp.conf`.
   A card without a networkd lease is refused, since its address could change.
3. It arms a systemd timer, `nimbus-bridge-rollback`, that removes the bridge
   again after two minutes.
4. It runs `netplan apply`.
5. Once the bridge has an address and the agent reaches the control plane
   through it, the agent cancels the timer. If the agent cannot get through
   within 90 seconds, it puts the network back itself. If the agent dies, the
   timer still does.

An advertise interface pinned to the card moves to the bridge, so the heartbeat
keeps reporting the node's IP.

Nimbus creates the bridge only on what it knows how to switch safely. It refuses
when:

- the uplink is Wi-Fi, which cannot be bridged;
- the node does not use netplan;
- the card is managed by NetworkManager;
- the card has a static address, or netplan settings beyond DHCP (routes,
  nameservers…);
- the card is configured by a netplan rule that matches several cards (such as
  Armbian's `all-eth-interfaces`);
- the default route is already on a bridge.

Make the bridge yourself in those cases, then name it.

### A bridge of your own

```bash
nimbus node vm-host enable gx10-1 --bridge br-lan
```

Nimbus only checks that the node has the bridge. It never changes it, and leaves
it as it is when the node stops being a VM host.

### Docker's firewall

Docker sets the `FORWARD` policy to `DROP` and makes bridged traffic go through
iptables, which leaves bridged VMs without a network on a node where Docker is
installed. A VM host gets the unit `nimbus-vm-bridge-fw.service`, which adds
`-i BRIDGE -o BRIDGE -j ACCEPT` to the `DOCKER-USER` chain every time Docker
starts. On a node without Docker it does nothing.

## Creating a VM

```bash
nimbus vm create --name web --node raspberry-01 --image ubuntu-24.04 --size medium
```

| Flag | Meaning |
|------|---------|
| `--name` | The VM's name, which is also its hostname: lowercase letters, digits and hyphens. |
| `--node` | The VM host to run it on. |
| `--image` | A name from `nimbus vm images` (`ubuntu-24.04`, the default; `ubuntu-22.04`; `debian-12`), built for the node's architecture, or an https URL to a qcow2 or raw cloud image. |
| `--size` | A size with whole vCPUs, from `nimbus vm sizes`. Or give `--cpu` (whole vCPUs) and `--memory`. Neither means `small`: 1 vCPU, 1G. |
| `--disk` | The disk, `20G` by default. |
| `--ssh-key` | A public key file allowed to log in, repeatable. |
| `--ssh-profile` | A Nimbus SSH profile (`nimbus ssh-profile list`) whose key may log in, repeatable. The control plane adds the public half of the profile's key; the private key never leaves it. |
| `--cloud-init` | Cloud-init of your own: a `#cloud-config` file or a `#!` script, up to 64K. See below. |

Without `--ssh-key` or `--ssh-profile`, the VM gets your `~/.ssh/id_ed25519.pub`,
`id_ecdsa.pub` or `id_rsa.pub`, or else the keys in your ssh-agent.

The API checks everything before the node is asked to do anything:

- the node is an enabled VM host;
- the name is free;
- the image exists for the node's architecture;
- the VMs' vCPUs and memory fit the node's total, with 1G of memory kept for the host;
- the disk fits the node's free space.

Stopped VMs count too, so starting one never finds its CPU and memory taken.

On the node, the VM lives in `/var/lib/nimbus/vms/<id>/`:

- `disk.qcow2`, a copy-on-write disk over the cloud image, which the node
  downloads once into `/var/lib/nimbus/vms/images/` and shares between VMs;
- `seed.iso`, the cloud-init seed: the hostname, your SSH keys, and
  `qemu-guest-agent`, through which the node learns the VM's address;
- `vars.fd`, the VM's UEFI variables;
- `console.log`, its serial console.

### Your own cloud-init

```yaml
#cloud-config
packages: [nginx]
write_files:
  - path: /var/www/html/index.html
    content: hello
runcmd:
  - [systemctl, enable, --now, nginx]
```

```bash
nimbus vm create --name web --node raspberry-01 --cloud-init web.yaml
```

Your file goes into the VM's seed next to Nimbus's own part, and cloud-init
merges the two:

- lists such as `packages`, `runcmd` and `ssh_authorized_keys` are combined,
  so the VM gets your packages and `qemu-guest-agent`, your commands and
  Nimbus's;
- anything else you set, such as `hostname`, stays as you set it.

A `#!` script runs once, on the first boot.

Cloud-init can hold secrets, so Nimbus does not keep it: it is removed from the
task once the node has it, and the node keeps it only in the VM's seed.

Each VM is a systemd unit named after its ID, such as `nimbus-vm-3f9a12c0.service`,
running QEMU with KVM. It
keeps running when the agent restarts, starts again when the node reboots, and
is restarted if QEMU crashes.

## Using a VM

```bash
nimbus vm list
```

```
ID           NAME  NODE          IMAGE         CPU     MEMORY     DISK       STATUS   ADDRESS       LOGIN
vm-3f9a12c0  web   raspberry-01  ubuntu-24.04  0.31/2  1.4G/2G    2.6G/20G   running  192.168.1.50  ssh ubuntu@192.168.1.50
```

The address appears once the guest is up and cloud-init has installed
`qemu-guest-agent`, which takes a minute or two on the first boot. It is the
address of the VM's own network card on the bridge, from your network's DHCP.

### What a VM uses

While a VM runs, CPU, MEMORY and DISK show what it uses on its host over what
it was given. The host measures them, so nothing runs inside the guest for it:

- **CPU:** vCPUs in use, averaged since the agent's previous heartbeat.
- **Memory:** the guest memory QEMU has touched, and QEMU itself. A guest
  that has not touched all of its memory yet shows less than it was given. The
  host's cache of the VM's disk file is not counted: the kernel drops it when
  it needs the memory.
- **Disk:** what the VM has written over the image it started from. The
  image is shared by the VMs made from it and is not counted, so this is less
  than `df` shows in the guest.

The figures show up one heartbeat after the VM starts, or after the agent
restarts. The VMs page shows the same as bars.

### What a VM host has left

`nimbus node describe raspberry-01` shows, under `vm_capacity`, what the VM
host has given its VMs and what they can have in all: its cores, its memory
less 1 GiB kept for the host, and its free disk. Stopped VMs count, since
starting them must not find their CPU and memory taken. A VM that does not fit
is refused with what is free. The node's page and the Create VM form show the
same.

A VM's disk takes space as the VM writes to it, so the disks given can add up
to more than the node has; a new VM is only refused a disk larger than the free
space.

| Command | What it does |
|---------|--------------|
| `nimbus vm describe VM` | The VM's details, as JSON. |
| `nimbus vm logs VM [-n LINES]` | The end of the serial console: boot messages and cloud-init's output. |
| `nimbus vm stop VM` | Presses the VM's power button and gives the guest 60 seconds to shut down before stopping it hard. The disk is kept, and the VM stays stopped across node reboots. |
| `nimbus vm start VM` | Starts a stopped VM. |
| `nimbus vm restart VM` | A stop, then a start. |
| `nimbus vm resize VM` | Changes the VM's vCPUs and memory, or grows its disk (see below). |
| `nimbus vm delete VM` | Removes the VM and its disk, after you type its name (`--yes` skips that). |

A guest that shuts itself down shows as `stopped`. A VM whose QEMU fails shows
as `error`, with the reason.

A VM host with VMs cannot stop being one, and cannot be deleted: delete its VMs
first.

### Resizing a VM

```bash
nimbus vm resize web --cpu 4 --memory 8G   # what you leave out stays as it is
nimbus vm resize web --size large
nimbus vm resize web --disk 80G            # a disk can only grow
```

QEMU reads a VM's size when it starts, so a running VM is shut down (power
button, forced after 60 seconds) and started again: the command asks first,
unless `--yes`. A stopped VM stays stopped, with its new size for when it
starts. The VMs page has the same as **Resize**.

The new size has to fit on the VM host like a new VM would, counting what the
VM has now as its own. The VM keeps its old size if the resize fails, and shows
as `error` with the reason.

A grown disk shows in the guest on its next boot: the Ubuntu and Debian cloud
images grow their root partition and filesystem by themselves (cloud-init's
`growpart` and `resizefs` run on every boot). A disk cannot shrink.

## Making a VM host an ordinary node again

```bash
nimbus node vm-host disable raspberry-01
```

The bridge Nimbus created is removed behind the same rollback timer, and the
card gets the node's address back. A bridge you named is left alone. QEMU stays
installed.
