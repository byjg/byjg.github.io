---
sidebar_position: 13
sidebar_label: "Activity Dock"
title: "Watching What the Control Plane Is Doing"
---

# Watching What the Control Plane Is Doing

Actions started from the web UI — adding a node, updating an agent, an OS update, a reboot, removing a node — run on the control plane and finish in their own time. The **activity dock** is where you watch them: one stream of node events and agent tasks, docked to the bottom of the window and shared by every page.

## The three modes

The control sits in the sidebar, under **Activity**, next to the theme toggle. Your choice is remembered in the browser.

| Mode | What it does |
|------|--------------|
| **Auto** (default) | The dock opens when you start an action and shows only that action. It closes a few seconds after the action succeeds. A **failure keeps it open**, so the reason stays on screen. |
| **Off** | The dock never opens, and nothing is polled. Actions still run; you see only the confirmation toast. |
| **Pinned** | The dock stays open, showing everything, with filters. |

When the dock is closed it takes no space and makes no requests.

## Reading the feed

Each row is either a **node event** (recorded by the control plane, such as `deploy_started` or `ssh_update_failed`) or an **agent task** (queued on a node, such as `os_update` or `reboot`), newest first. A row names the node, which links to it.

Two things the feed leaves out. Housekeeping the control plane queues on its own — status refreshes, WireGuard peer syncs, agent reconfiguration — is hidden, because it is not an action anyone took and there is a lot of it. And a task disappears from the feed once the control plane prunes it, ten minutes after it finishes; events are kept, so older history is events only.

While an action you started is being watched, the dock shows that action alone. **All** switches to everything, where you can narrow by node or type in the filter box. **Clear** forgets the finished actions.

The dock polls only while it is open, every 2 seconds while something is running and every 10 seconds otherwise, and stops entirely when the browser tab is in the background.

## Per-node history

A node's page has an **Events** button that opens the dock filtered to that node, showing its events and tasks together. This replaces the separate event and task tables that used to sit on the page.

## The same information elsewhere

The dock reads `GET /v1/nodes/events` and `GET /v1/tasks`, so everything it shows is also available from the CLI:

```bash
nimbus node events <node-id-or-ip>
nimbus task list
```
