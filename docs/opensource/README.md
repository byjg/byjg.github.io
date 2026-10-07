---
sidebar_position: 1
---

# Opensource by JG

Open source projects to build, run and evolve software with AI assistance:
reusable application components, container images, delivery tooling, an
infrastructure platform, and the documentation of all of it made available to
AI assistants. Everything is [MIT licensed](/license/) and maintained in the
open at [github.com/byjg](https://github.com/byjg).

Each project works on its own. [The ByJG Ecosystem](ecosystem.md) shows how
they fit together, from an idea to production.

| Layer | Where | What you will find |
|---|---|---|
| Knowledge and developer experience | [AI](/docs/ai) | The documentation MCP server and Parolsh, the natural language shell |
| Application building blocks | [PHP](/docs/php), [JavaScript](/docs/js) | Components published on Packagist (database access, REST, migrations, caching, JWT, queues) and small browser libraries |
| Runtime, delivery and infrastructure | [DevOps](/docs/devops) | Docker images, HAProxy with service discovery, the Kubernetes CI image and the DockNimbus platform |
| Distribution | [Linux packages](/docs/packages), [Helm charts](/docs/helm) | The APT, RPM and Helm repositories |

## Taking part

- **[Contributing](contrib.md)** -- how to open a pull request, which branch to
  target, and the checks that run. PHP components have
  [a page of their own](contrib-php.md).
- **[Issues](issues.md)** -- how to report a bug, ask for a feature, or ask a
  question.
- **[Security](security.md)** -- how to report a vulnerability privately.
- **[Code of Conduct](https://github.com/byjg/.github/blob/main/CODE_OF_CONDUCT.md)** -- applies to everyone taking
  part.
- **[Sponsor](sponsor.md)** -- if any of this saves you time.

## How things are built

The [Development Guidelines](guidelines/README.md) describe how these projects
are tested, released and documented -- read them before adding a new one. The
thinking behind them is in
[Simple Principles to Avoid Overcomplicating the Complex](/blog/simple-principles-avoid-complexity)
and the [KISS principle](kiss.md).

