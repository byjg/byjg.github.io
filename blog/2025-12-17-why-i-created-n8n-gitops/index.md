---
slug: why-i-created-n8n-gitops
title: Why I Created `n8n-gitops`
authors: [byjg]
date: 2025-12-17
tags: [n8n, gitops, devops, automation, workflow, ci-cd, deployment, engineering]
description: n8n is an excellent workflow IDE, but its default production workflow relies on manual, UI-driven deployment. That approach breaks fundamental engineering principles around change control, auditability, and reproducibility.
---

# **Why I Created `n8n-gitops`**

n8n is an excellent workflow IDE, but its default production workflow relies on manual, UI-driven deployment. That
approach breaks fundamental engineering principles around change control, auditability, and reproducibility.
`n8n-gitops` exists to close that gap by turning n8n workflows into versioned, reviewable, and reproducible artifacts
managed through Git and deployed through automation. It allows teams to keep n8n's visual productivity while enforcing
the same delivery standards used for any other production system.

<!-- truncate -->

n8n is a genuinely strong tool. As a visual IDE for building workflows, it strikes a rare balance between accessibility
and power: you can model complex event-driven flows, react to webhooks and schedules, integrate with APIs, SaaS
platforms, and databases, and still drop down into real Python or JavaScript when the logic demands it. From a
productivity and expressiveness standpoint, it is very well designed.

The problem does not appear when you are creating workflows. It appears the moment you try to run them seriously in
production.

The first time I encountered the recommended promotion workflow build locally, copy the workflow, paste it into
production I immediately knew I could not accept that model. Not because it is inconvenient, but because it breaks some
of the most basic principles of operating production systems. Manual deployment is not a stylistic preference; it is a
systemic risk.

Once workflows are promoted by copy and paste, you lose control almost instantly. There is no reliable way to understand
exactly what changed, no meaningful diff, no authoritative record of who deployed what and when, and no reproducible
state you can point to as "the version currently running." Even worse, anyone with access to the production UI
implicitly gains the ability to deploy logic that can trigger external systems, move data, or execute arbitrary code.
That is not just uncomfortable; it is fundamentally incompatible with environments that value auditability,
traceability, and controlled change.

For me, this crosses a hard line. I operate under a very simple rule: nothing reaches production manually. Not
applications, not infrastructure, and not workflows. If a system cannot be deployed through a controlled, reviewable,
and repeatable process, then it is not a system I can confidently recommend or rely on for critical automation.

The frustrating part is that n8n is not far from doing this right. Under the hood, it exposes a capable API that allows
workflows to be listed, created, replaced, activated, and deactivated programmatically. That API is powerful enough to
build a proper delivery model one that does not rely on the UI as a deployment surface. Even the Git Sync feature
available in business and enterprise plans hints in this direction, but it remains largely UI-driven and does not fully
embrace Git as the control plane.

What I wanted was straightforward and unremarkable by modern engineering standards. I wanted to use local n8n as an IDE,
not as a deployment mechanism. I wanted Git to be the source of truth. I wanted workflow logic especially Python and
JavaScript to live in real files instead of being buried inside escaped JSON blobs. I wanted pull requests, code review,
version tags, and CI/CD-driven promotion across environments. Most importantly, I wanted deployments to be boring,
deterministic, and reversible.

That combination did not exist, so I built it.

`n8n-gitops` is not an alternative to n8n; it is a control layer around it. The visual editor remains exactly where it
shines designing workflows. From there, workflows are exported in mirror mode, ensuring that the repository always
reflects the true state of the instance and that drift is eliminated rather than tolerated. Code is externalized into
proper source files, making reviews readable, tooling effective, and changes understandable by humans. Git becomes the
place where decisions are discussed, approvals happen, and versions are defined.

Deployment then stops being an act performed by a person clicking buttons and becomes an operation executed by a
pipeline. A specific tag, branch, or commit is deployed to a target instance via the API. Rollback is no longer a
special procedure; it is simply redeploying a previous reference. There is no ambiguity about what is running, how it
got there, or how to undo it.

This shift is what made n8n usable for me in real environments. Before this, n8n felt like a powerful prototyping and
automation tool with production caveats. After this, it becomes a workflow runtime that can be governed with the same
discipline as any other production system.

The intent of this project is not to compete with n8n or criticize its focus on usability. It exists to bridge two
worlds that often collide: low-code productivity and infrastructure rigor. n8n optimizes for speed and approachability;
GitOps optimizes for safety, visibility, and trust. `n8n-gitops` exists to connect those priorities without forcing you
to give one up for the other.

If a workflow engine can trigger money movement, call external systems, mutate data, or execute arbitrary code, then it
deserves the same delivery standards as any service you deploy. This project is simply an enforcement of that reality.