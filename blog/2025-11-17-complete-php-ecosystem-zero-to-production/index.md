---
title: "Building a Complete PHP Application: From Zero to Production"
description: "A comprehensive guide to building production-ready PHP applications using the ByJG ecosystem - from installing Docker on a blank machine to deploying a complete API application with authentication, logging, and CI/CD"
authors: [byjg]
date: 2025-11-17
tags: [php, docker, devops, ecosystem, rest-api, production, architecture]
---

# Building a Complete PHP Application: From Zero to Production

Have you ever wondered how to go from a completely blank machine to a fully functional, production-ready PHP application? Maybe you inherited an empty VPS, or your team wants to spin up a greenfield service without spending weeks assembling tooling. In this article, I'll walk you through the entire ByJG PHP ecosystem—a comprehensive set of tools and components that work together seamlessly to help you build modern PHP applications with confidence.

Whether you're working with Laravel, Symfony, or building from scratch, these components can help you accelerate development while maintaining production-grade quality. Think of it as a curated pit crew: each utility is lightweight on its own, yet designed to snap together when you need the whole pipeline.

### What We'll Cover

- Standing up a workstation on a blank Linux machine (or WSL) in minutes
- Understanding the PHP component catalog and when to reach for each piece
- Using the PHP REST Reference Architecture to bootstrap an API
- Selecting hardened Docker images for production workloads
- Operating a realistic workflow from day zero to ongoing maintenance

<!-- truncate -->

## The Journey: From Blank Machine to Production

Let's start from the very beginning - a machine with nothing installed - and work our way up to a complete, production-ready API application.

### Step 1: Setting Up Your Development Environment

When you have a blank Linux machine (or WSL on Windows), the first challenge is getting Docker and PHP installed without spending an afternoon copying snippets from blog posts. This is where [shellscript.download](https://shellscript.download) comes in. It's a single loader script that ships opinionated installers so your team can standardize the whole stack with one-liners.

**First, install the loader script (idempotent and safe to rerun):**
```bash
/bin/bash -c "$(curl -fsSL https://shellscript.download/install/loader)"
```

With `load.sh` in place you can install tools in separate steps. Each command checks pre-requisites, pins known-good versions, and configures services the same way on every server.

**Installing Docker:**
```bash
load.sh docker
```

**Installing PHP 8.4 via Docker:**
```bash
load.sh php-docker -- 8.4
```

**Installing Node.js 22 (for modern development tools like Claude Code, Codex, etc.):**
```bash
load.sh node-docker -- 22
```

That's it! In just three commands, you now have:
- Docker installed and running
- PHP 8.4 ready to use via Docker containers
- Node.js 22 for modern development tools

The beauty of this approach is that everything runs in containers—no version conflicts, no dependency hell, just clean, reproducible environments. If someone on your team needs to rebuild their workstation or if you move between laptops, you're a few commands away from parity.

## The PHP Components Ecosystem

Once your environment is ready, you gain access to an extensive collection of [production-tested PHP components](https://opensource.byjg.com/docs/php) that can be used with **ANY PHP framework**—Laravel, Symfony, Slim, or your own custom solution. These packages grew out of real client projects, so each one solves a specific operational problem: configuration, caching, persistence, messaging, and more.

Below is a guided tour grouped by layer. Use it as a menu; you can grab only what you need, or assemble the full stack when greenfielding a service.

### Core Infrastructure Components

Start with the building blocks that keep configuration, caching, and migrations predictable across environments.

**[Cache Engine](https://opensource.byjg.com/docs/php/cache-engine)** - PSR-6 and PSR-16 compliant caching with multiple backends:
- File system, Redis, Memcached, Session
- Shared memory (ShmOp), TmpFS
- Built-in garbage collection and atomic operations

**[Config Management](https://opensource.byjg.com/docs/php/config)** - Environment-based configuration with dependency injection support

**[Migration](https://opensource.byjg.com/docs/php/migration)** - Database version control with up/down migrations supporting MySQL, PostgreSQL, SQLite, Oracle, and SQL Server

### Data Access & ORM

Next, wire up data persistence. The AnyDataset layer gives you unified access to multiple databases, and Micro-ORM adds just enough structure without trapping you in a heavy framework.

**[Micro-ORM](https://opensource.byjg.com/docs/php/micro-orm)** - Lightweight Object-Relational Mapping with:
- Query builder
- Active Record pattern support
- Repository pattern support
- Relationship mapping without heavy overhead

**[AnyDataset-DB](https://opensource.byjg.com/docs/php/anydataset-db)** - Universal database abstraction layer supporting multiple databases with a consistent API

### REST API & Web Services

With data covered, expose it through APIs that follow the contracts you publish.

**[RestServer](https://opensource.byjg.com/docs/php/restserver)** - Create RESTful services with:
- Auto-generation from OpenAPI/Swagger definitions
- Multiple output handlers (JSON, XML, HTML)
- Built-in middleware support (CORS, JWT, Static Server)
- Route caching for performance

**[Swagger Test](https://opensource.byjg.com/docs/php/swagger-test)** - Contract testing to ensure your API matches your OpenAPI specification

### Security & Authentication

Authentication is baked in rather than bolted on, so you can build features without reinventing session storage or JWT flows.

**[AuthUser](https://opensource.byjg.com/docs/php/authuser)** - Complete user authentication and authorization system with:
- Session management
- Custom properties
- Multiple storage backends (Database, XML)

**[JWT Wrapper](https://opensource.byjg.com/docs/php/jwt-wrapper)** - JSON Web Token handling for stateless authentication

**[JWT Session](https://opensource.byjg.com/docs/php/jwt-session)** - JWT-based session management

**[Crypto](https://opensource.byjg.com/docs/php/crypto)** - Passwordless symmetric encryption with dynamic key generation

### Communication

Modern apps rarely operate in isolation. These clients keep outbound communication (mail, queues, SMS) consistent.

**[MailWrapper](https://opensource.byjg.com/docs/php/mailwrapper)** - Send emails through multiple providers:
- SMTP (SSL/TLS)
- Amazon SES API
- Mailgun API
- Sendmail

**[Message Queue Client](https://opensource.byjg.com/docs/php/message-queue-client)** - Unified interface for message queuing:
- RabbitMQ support via [rabbitmq-client](https://github.com/byjg/rabbitmq-client)
- Redis Queue support via [redis-queue-client](https://github.com/byjg/redis-queue-client)
- Easy to implement custom connectors

**[SMS Client](https://opensource.byjg.com/docs/php/sms-client)** - Send SMS through various providers

### Utilities

Finally, a set of focused helpers for everyday tasks—ID generation, image manipulation, conversion, and URI handling.

**[ShortId](https://opensource.byjg.com/docs/php/shortid)** - Generate short, unique, URL-safe IDs

**[ImageUtil](https://opensource.byjg.com/docs/php/imageutil)** - Image manipulation and processing

**[Convert](https://opensource.byjg.com/docs/php/convert)** - Data conversion utilities

**[URI](https://opensource.byjg.com/docs/php/uri)** - URI manipulation and parsing

And [many more components](https://opensource.byjg.com/docs/php) covering various needs...

### Key Advantages

- **Framework Agnostic**: Use any component independently in your existing projects
- **PSR Compliant**: Follows PHP-FIG standards (PSR-6, PSR-7, PSR-11, PSR-16)
- **Well Documented**: Every component has comprehensive documentation with examples
- **Production Tested**: Used in real-world production environments
- **Composer Ready**: Simple installation via `composer require byjg/component-name`

## Building a Complete Application from Scratch

While you can use individual components with any framework, what if you want to create a complete API application from scratch and keep velocity high? This is where the **[PHP REST Reference Architecture](https://github.com/byjg/php-rest-reference-architecture)** comes in. It's intentionally not another framework—it is a set of opinions captured as code so you can fork it, tailor it, and still recognize every moving part.

### What is the PHP REST Reference Architecture?

The PHP REST Reference Architecture is a **production-ready template** (not a framework) that brings together the best components from the ByJG ecosystem into a cohesive, ready-to-use application structure.

### What's Included

The template is broken into layers so you can keep tightening or loosening abstractions depending on the stage of your product.

**Code Generation & Architecture:**
- Automatic CRUD generation from database tables
- Choice between Repository Pattern (clean separation) or ActiveRecord Pattern (rapid prototyping)
- Auto-generated models, repositories, services, controllers, and tests

**Security Built-In:**
- JWT-based authentication system
- Role-Based Access Control (RBAC)
- Ready-to-use login endpoints

**API Documentation:**
- Auto-generated OpenAPI documentation synchronized with code
- Interactive Swagger UI for API exploration
- Contract testing to keep docs in sync

**Database Management:**
- Built-in migration system
- MicroORM for lightweight data access
- Query builder and relationship mapping

**Development Experience:**
- Docker containerization (MySQL, PHP-FPM, Nginx)
- Scriptify: interactive PHP terminal and CLI runner
- Comprehensive functional test suite
- Hot reload during development

**Production Ready:**
- Pre-configured CI/CD workflows (GitHub Actions, GitLab CI, Bitbucket Pipelines)
- Environment-based configuration
- Structured logging
- Error handling and reporting
- PSR-7, PSR-11, PSR-6/16 standards compliance

### Getting Started with Reference Architecture

```bash
# Install the template
load.sh php-rest-api -- my-api \
  --namespace=MyCompany \
  --name=mycompany/my-api \
  --install-examples=y
```

This single command creates a complete API application with:
- Project structure following clean architecture
- Database migrations ready
- Authentication system configured
- OpenAPI documentation generated
- Docker environment set up
- CI/CD pipelines ready
- Tests configured

You can start developing immediately with:
```bash
cd my-api
docker-compose up -d
composer codegen -- --env=dev --table=users all --save
```

From here, you're not hunting for stubs or copying controllers from earlier projects. Code generation scaffolds endpoints, migrations keep the database in sync, and the OpenAPI file stays coupled to actual handlers. Because everything is PSR-compliant, you can drop in any additional middleware or reuse familiar packages.

## Production Deployment

Local success is only half the story. Shipping to production means choosing images you can trust and an ingress strategy that won't wake you up during traffic spikes. The ecosystem includes curated Docker images and a self-updating HAProxy layer so operational pieces feel as cohesive as the developer experience.

### Hardened PHP Docker Images

For production deployment, the ecosystem provides [curated, security-hardened PHP Docker images](https://opensource.byjg.com/docs/devops/docker-php) supporting:

- **PHP Versions**: From 5.6 to 8.5 (edge)
- **Multi-Architecture**: AMD64 and ARM64 (Raspberry Pi, AWS Graviton)
- **Image Variants**:
  - `base` - Minimal with 45+ PHP extensions (~135MB)
  - `cli` - Development tools included (~154MB)
  - `fpm` - PHP-FPM for custom setups (~139MB)
  - `fpm-nginx` - Complete LEMP stack (~154MB)
  - `fpm-apache` - Complete LAMP stack (~154MB)

**Security Features:**
- Runs as non-root user (`app`)
- Includes SBOM & build provenance
- Monthly tagged releases for stability
- Regular security updates

**Example:**
```bash
docker pull byjg/php:8.4-fpm-nginx-2025.11
```

### Load Balancing & Ingress

For production traffic management, [EasyHAProxy](https://opensource.byjg.com/docs/devops/docker-easy-haproxy) provides dynamic HAProxy configuration through service discovery. Whether you deploy to Docker Swarm, Kubernetes, or a single VM, the same labels configure certificates, routing, and stats, which keeps operations boring (in the best possible way).

**Supported Platforms:**
- Docker standalone
- Docker Swarm clusters
- Kubernetes
- Manual static configuration

**Features:**
- Automatic SSL/TLS with Let's Encrypt (ACME protocol)
- Custom SSL certificates
- Load balancing across replicas
- Zero-downtime configuration reloads
- TCP mode support
- Built-in statistics dashboard

**Example for Docker Swarm:**
```bash
docker service create \
  --name my-api \
  --label easyhaproxy.host=api.example.com \
  --label easyhaproxy.ssl.type=letsencrypt \
  mycompany/my-api:latest
```

EasyHAProxy automatically detects the service, configures HAProxy, obtains SSL certificates, and starts routing traffic - no manual configuration needed!

## The Complete Ecosystem Flow

Here's how everything fits together. The diagram highlights how a single loader command cascades into an application template, Docker base images, and eventually automated ingress. Trace the arrows to see how each piece feeds the next stage of the lifecycle:

```mermaid
graph TB
    subgraph "Development Setup"
        A[Blank Machine] -->|load.sh docker| B[Docker Installed]
        B -->|load.sh php-docker| C[PHP Environment]
        B -->|load.sh node-docker| D[Node.js Tools]
    end

    subgraph "Application Development"
        C -->|Use individually| E[ByJG PHP Components<br/>30+ libraries]
        C -->|Full template| F[PHP REST Reference Architecture]

        F -->|uses| E
        F --> Q[Generated Code]
        F --> R[Authentication System]
        F --> S[API Documentation]
        F --> T[Database Migrations]
    end

    subgraph "Docker PHP Images"
        V[Hardened PHP Images<br/>PHP 5.6 to 8.5]
        V1[base - 45+ extensions]
        V2[cli - dev tools]
        V3[fpm - PHP-FPM]
        V4[fpm-nginx - LEMP]
        V5[fpm-apache - LAMP]

        V -.->|variants| V1
        V -.->|variants| V2
        V -.->|variants| V3
        V -.->|variants| V4
        V -.->|variants| V5
    end

    subgraph "Production Deployment"
        Q --> V
        V --> Z[EasyHAProxy<br/>Ingress Controller]

        Z --> AA[Docker Swarm]
        Z --> AB[Kubernetes]
        Z --> AC[Docker Standalone]
        Z --> AD[Manual Config]
    end

    subgraph "Supporting Infrastructure"
        V --> LOCAL[Local Development]
        V --> CICD[CI/CD Pipelines]
        S --> CICD
        Z --> AF[SSL/TLS + Let's Encrypt]
        Z --> AG[Load Balancing]
    end

    style A fill:#f9f,stroke:#333,stroke-width:2px,color:#000
    style E fill:#ffe,stroke:#333,stroke-width:2px,color:#000
    style F fill:#bbf,stroke:#333,stroke-width:2px,color:#000
    style V fill:#bfb,stroke:#333,stroke-width:2px,color:#000
    style Z fill:#fbb,stroke:#333,stroke-width:2px,color:#000
```

## Real-World Workflow

Let's walk through a complete real-world scenario. Imagine you're tasked with launching a commerce API before the next quarterly planning session. The timeline below mirrors how most teams actually move—there's a burst of setup, a block of feature work, a sprint on automation, and finally a handoff to operations.

### Day 1: Project Setup
```bash
# Set up environment (one time)
/bin/bash -c "$(curl -fsSL https://shellscript.download/install/loader)"
load.sh docker
load.sh php-docker -- 8.4

# Create new project
load.sh php-rest-api -- my-shop-api \
  --namespace=MyShop \
  --name=mycompany/shop-api

cd my-shop-api
docker-compose up -d
```

### Day 2-10: Development
```bash
# Generate complete CRUD for products table
composer codegen -- --env=dev --table=products all --save

# Add email notifications using MailWrapper
composer require byjg/mailwrapper

# Add queue processing for async tasks
composer require byjg/redis-queue-client

# Run tests
composer test
```

During this phase you're iterating quickly: add capabilities via Composer, lean on generated CRUD to avoid repetitive work, and keep confidence high with the baked-in test suite.

### Week 2: CI/CD Setup
- Push to GitHub
- CI/CD workflows already configured (GitHub Actions)
- Automatic testing on every PR
- Docker image build on merge to main

There is no scramble to stitch together workflows—the template checked in `.github/workflows` (and equivalents for GitLab/Bitbucket), so enabling CI is a matter of connecting secrets and letting the pipeline run.

### Month 1: Production Deployment
```bash
# Pull production-ready image
docker pull byjg/php:8.4-fpm-nginx-2025.11

# Build your application image using it as base
docker build -t mycompany/shop-api:1.0.0 .

# Deploy to Docker Swarm with EasyHAProxy
docker service create \
  --name shop-api \
  --replicas 3 \
  --label easyhaproxy.host=api.shop.com \
  --label easyhaproxy.ssl.type=letsencrypt \
  --label easyhaproxy.port=8080 \
  mycompany/shop-api:1.0.0
```

By the time you deploy, you already know which Docker image tag you're targeting, and EasyHAProxy keeps ingress configuration consistent. Scaling to more replicas or pointing a staging hostname at the same service is a label change, not a manual HAProxy edit.

Your API is now:
- Running with 3 replicas for high availability
- Load balanced automatically
- Secured with Let's Encrypt SSL
- Monitored via HAProxy stats
- Ready to scale

## Why This Ecosystem?

After following the workflow it's worth stepping back. Why invest in this collection instead of mixing random packages from Packagist? These are the anchors that keep the experience cohesive:

### 1. **Consistency Across Environments**
The same Docker images run in development, CI/CD, and production - eliminating "works on my machine" issues.

### 2. **Rapid Development**
Go from idea to working API in minutes, not days. Code generation handles boilerplate while you focus on business logic.

### 3. **Production-Grade Quality**
Built-in authentication, authorization, logging, error handling, and testing mean you start with best practices, not technical debt.

### 4. **Framework Freedom**
Use components individually in existing projects or adopt the full reference architecture for new projects.

### 5. **Modern DevOps Practices**
CI/CD ready, containerized, with infrastructure as code. Deploy to any container orchestration platform.

### 6. **No Vendor Lock-In**
It's a template, not a framework. You own the code. Modify anything you need.

### 7. **Comprehensive Documentation**
Every component is documented with examples at [opensource.byjg.com](https://opensource.byjg.com)

## Ecosystem Components Summary

If you only remember five links, make them these:

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| [shellscript.download](https://shellscript.download) | Environment Setup | One-command Docker, PHP, Node installation |
| [ByJG Components](https://opensource.byjg.com/docs/php) | Reusable Libraries | 30+ production-tested PHP components |
| [PHP REST Reference Architecture](https://github.com/byjg/php-rest-reference-architecture) | Application Template | Complete API scaffold with auth, docs, CI/CD |
| [PHP Docker Images](https://opensource.byjg.com/docs/devops/docker-php) | Container Runtime | Hardened, multi-arch images PHP 5.6-8.5 |
| [EasyHAProxy](https://opensource.byjg.com/docs/devops/docker-easy-haproxy) | Ingress Controller | Auto-configured load balancing & SSL |

## Getting Started

Ready to build your next PHP application with this ecosystem? Here's how to start, depending on where your project currently sits:

1. **For Existing Projects**: Browse the [component library](https://opensource.byjg.com/docs/php) and add individual components via Composer

2. **For New APIs**: Use the [PHP REST Reference Architecture](https://github.com/byjg/php-rest-reference-architecture) template

3. **For Environment Setup**: Visit [shellscript.download](https://shellscript.download) for installation scripts

4. **For Production**: Check out [PHP Docker Images](https://opensource.byjg.com/docs/devops/docker-php) and [EasyHAProxy](https://opensource.byjg.com/docs/devops/docker-easy-haproxy)

## Conclusion

The ByJG PHP ecosystem provides a complete, cohesive solution for modern PHP development - from your first command on a blank machine to a production-ready, scalable API application.

By combining:
- Simple environment setup
- Modular, reusable components
- Production-ready templates
- Hardened Docker images
- Automated load balancing

You can focus on building features instead of infrastructure, while maintaining professional-grade quality throughout the entire development lifecycle.

Whether you're building a small microservice or a complex application, this ecosystem has the tools you need to succeed.

---

**Explore the ecosystem:**
- Documentation: [https://opensource.byjg.com](https://opensource.byjg.com)
- GitHub: [https://github.com/byjg](https://github.com/byjg)
- Setup Scripts: [https://shellscript.download](https://shellscript.download)

Happy coding!
