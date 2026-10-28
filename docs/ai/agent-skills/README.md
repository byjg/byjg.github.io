---
sidebar_key: agent-skills
tags: [ai]
---

# Agent Skills

Skills that teach a coding agent (Claude Code, Codex, Cursor, ...) how to work with the
ByJG components. Each one is maintained in the repository of the component it describes
and published to [byjg/skills](https://github.com/byjg/skills), the `byjg`
plugin catalog.

- [feature-workflow](feature-workflow.md): Guided workflow for adding new features or fixing bugs in DockNimbus. Use this skill whenever the user asks to add a feature, fix a bug, implement a new API endpoint, add a CLI command, modify the UI, change agent behavior, or any task that involves changing functionality across the codebase layers (types, SDK, API handlers, repository, CLI, UI, agent). Trigger on phrases like 'add feature', 'fix bug', 'implement X', 'new command', 'new endpoint', 'agent not working', 'UI missing X', or any request that touches application logic. Even if the user mentions only one layer (e.g. 'fix the agent'), use this skill because the root cause often spans multiple layers.
- [gluo-developer](gluo-developer.md): Expert guide for working on a Gluo project: a PHP REST API created from byjg/php-gluo (composer create-project byjg/gluo) on the byjg/gluo-core framework. Use this skill whenever the user is working on such a project — including setting up the dev environment, creating new CRUD features, scaffolding with the code generator, modifying or fixing existing features, writing or updating tests, running migrations, and maintaining OpenAPI documentation. Trigger this skill for any task related to models, repositories, services, REST controllers, attributes, authentication, DI configuration, or the byjg framework stack in this codebase. Even if the user says something generic like "add a new endpoint" or "fix this bug", use this skill if they're working in this project.
