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
- [gluo-developer](gluo-developer.md): Develop and maintain PHP REST APIs created with byjg/gluo: endpoints, models, persistence, DI configuration, migrations, authentication, OpenAPI, and tests. Use whenever working on a Gluo PHP application, even for generic requests such as "add a new endpoint" or "fix this bug" that do not name Gluo explicitly. Follow the project's installed dependency versions and existing conventions. Frontend-only work needs this skill only when it changes the API integration.
