---
title: "How I Manage 30+ Open Source Projects (and Stay Sane 😄)"
description: ""
authors: [byjg]
date: 2025-11-09
tags: [opensource, automation, php, devops, docker, artificial-intelligence]
image: ./frontpage.png
---

# How I Manage 30+ Open Source Projects (and Stay Sane 😄)

![How I Manage 30+ Open Source Projects](./frontpage.png)

Maintaining more than **30 open source projects** is a bit like conducting an orchestra alone.  
Each project has its own particularities, dependencies, pipelines, documentation, and tests — and yet all of them need to work in harmony.  

In a company with 30 microservices, it’s common to have something like **2 to 4 DevOps**, **3 to 5 Product Owners**, and **50 to 100 developers**.  
I do this **mostly by myself**.

It sounds impossible, but it isn’t.  
Let’s walk through how this ecosystem works — and how automation, standardization, and good use of Artificial Intelligence make it not only viable, but actually enjoyable.

<!-- truncate -->

## What I Maintain

My open source work is centered around two big pillars:

- An **ecosystem of PHP components** — from micro-ORMs and serializers to complete REST integrations.  
- A **set of Docker images** — used both in development and production, ensuring consistency and reproducibility across environments.

These projects interconnect, forming a modular and reusable architecture.  
Any component can be used independently in other frameworks, but they also fit together nicely inside my main ecosystem.

---

## Creating a Developer Experience Environment

The first thing I had to fix was what slowed me down the most: the **development setup**.  
Every time I changed machines, I had to configure dozens of dependencies — PHP, extensions, Composer, test tools, etc.  
Something was always missing.

The solution was to create **standardized Docker images**.  
Today I maintain PHP images for several purposes:

- CLI  
- FPM  
- FPM with Nginx  
- Docker Compose examples

These images are used in **development, CI/CD, and production**, which eliminates environment drift and the classic “works on my machine”.

But the bigger challenge was running **multiple PHP versions** on the same machine.  
Since I was already using Docker, I decided the **development environment should also run in containers**.

I standardized everything on Linux and kept experimenting with tools while I was coding, until I created another open source project: [https://shellscript.download](https://shellscript.download).

With it, my environment can be set up with a single command:

```bash
load.sh php-docker -- 8.4
```

After that, I have everything ready — PHP, Composer, extensions, tools — in a few minutes.

---

## Automation and Process Standardization

Having 30 projects is like having 30 microservices:  
each one with its own documentation, architecture, dependencies, and lifecycle.

The key is **automation**.

Since 2013, I’ve been continuously improving each project, always keeping:

- **Automated tests**
- **Meaningful code coverage**
- **Continuous Integration hooked into everything**

But there was another pain point: **documentation**.  
Keeping docs scattered across repositories is a nightmare.  
I needed to centralize documentation **without maintaining it in two places**.

### The Solution

I created a pipeline that, whenever a PR is merged, **automatically copies that project’s documentation** into a central repository: `byjg.github.io`.

That repository organizes the content inside a **[Docusaurus](https://docusaurus.io)** structure and triggers an automatic build on **Cloudflare Pages**, publishing everything at [https://opensource.byjg.com](https://opensource.byjg.com).

So, **every documented commit can automatically update the main site** — with no manual maintenance and zero additional hosting cost.

In the end, I focused on three principles:

1. **Automate what is repetitive**  
2. **Centralize what is shared**  
3. **Isolate what is independent**

---

## Building a Sustainable Ecosystem

My PHP components strictly follow **PSR standards**, use **Composer** for package management, and can be integrated into any framework.  
Each project includes examples, tests, and usage instructions.

Over time, I realized that the collection of components formed a solid foundation for something bigger.  
That’s when the **[PHP Rest Reference Architecture](https://github.com/byjg/php-rest-reference-architecture)** was born — a project that combines the main components of the ecosystem into a ready-to-use structure:

- Preconfigured CI/CD  
- Full OpenAPI support for REST endpoints  
- Built-in authentication and authorization  
- Database migration  
- Dependency injection  
- Docker and build scripts  

With a single command, I can create a fully functional PHP REST project in minutes:

```bash
load.sh php-rest-api -- <folder> --namespace=<name> --name=<name/name> --install-examples=n
```

This automation allows anyone to create a complete API based on clean architecture and good practices — without reinventing the wheel.

---

## Getting Ready for Production

The **Docker images** I use in development are the same ones used in CI/CD and in production.  
They are pushed to a **Container Registry**, which lets me promote versions across environments (`dev → staging → production`) with full traceability.

For load balancing, I created the **[Easy HAProxy](https://github.com/byjg/easyhaproxy)** project — a simplified and powerful HAProxy setup that **self-configures based on Docker service labels**.

It supports SSL, avoids downtime, and removes the need to manually edit configuration files.  
You just run the container and let it handle everything.

---

## Artificial Intelligence: My New “Intern”

Artificial Intelligence has become my ally in several areas — and honestly, it’s a *game changer*.

### Documentation

I created custom prompts that cover about 95% of my documentation needs:  
from writing consistent guides to avoiding formatting issues that might break Docusaurus.

### Design and Frontend

My strength has always been backend work.  
Before, building UI screens felt slow and painful.

Now, I describe what I want, and the AI generates the basic layout or page for me — and I plug it into my backend.  
This lets me focus more on logic and integration instead of CSS details.

### Assisted Development

I use **Claude Code** as my main coding assistant, **ChatGPT** as a second opinion or idea generator, and **Junie (PHPStorm)** for in-IDE help.  

I never let AI run completely unattended: I treat it like a very smart junior developer.  
I review what it does, guide it, and change direction when needed.

Often, I start by asking for a **plan** before touching any code.  
Then I authorize each step, adjust, and refine.

This approach has significantly multiplied my productivity — without sacrificing quality.

---

## What’s Behind All This

### Infrastructure

- Optimized Docker images  
- Load balancing with Easy HAProxy  
- Builder image for CI/CD  

### Automation

- Standardized CI/CD pipelines  
- Reused workflows shared across projects  
- Ansible and Terraform to configure environments  
- Python scripts to configure GitHub repositories and settings  

---

## Conclusion

Maintaining dozens of open source projects **is not a matter of time, it’s a matter of system**.  
When each part of the process is automated, documented, and integrated, the work scales naturally.

The secret is to **build a cohesive ecosystem** where each component supports the others — and where the developer becomes not just the author of the code, but the orchestrator of a self-sustaining environment.

At the end of the day, I focus on **one project at a time**, do the best I can on it, and let **automation and standardization handle the rest**.  

And that’s how I manage to keep 30+ projects alive, documented, and constantly evolving — almost on my own.  

---

Want to see all of this in action?  
👉 Check out [https://opensource.byjg.com](https://opensource.byjg.com)
