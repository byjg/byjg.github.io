---
sidebar_label: AGENTS.md
description: A ready-made AGENTS.md that teaches any AI coding agent how to work with the ByJG PHP components. Download it into your project.
tags: [ai, php]
---

# AGENTS.md for ByJG PHP components

An `AGENTS.md` file gives an AI coding agent (Codex, Claude Code, Cursor, GitHub Copilot, Gemini,
...) the instructions it needs before it touches your code. This one is written for PHP projects
that use the `byjg/*` components, and for work on the components themselves.

## Get it

From the root of your project:

```bash
curl -fsSL https://opensource.byjg.com/AGENTS.md -o AGENTS.md
```

Or open [opensource.byjg.com/AGENTS.md](https://opensource.byjg.com/AGENTS.md) and save the file.

To update it, run the same command again. The file has no project-specific content, so replacing it
is safe. Put your own project's instructions in a separate section or file.

## Make your agent read it

| Agent | Setup |
|---|---|
| Codex, Cursor, GitHub Copilot | Nothing. They read `AGENTS.md` from the project root |
| Claude Code | Claude Code reads `CLAUDE.md`. Import the file with a line in it: `echo '@AGENTS.md' >> CLAUDE.md` |
| Gemini CLI | Gemini CLI reads `GEMINI.md` by default. Point its context file setting to `AGENTS.md` |

## What it contains

| Section | Content |
|---|---|
| Working rules | Answer questions with options before implementing; stop on workarounds; never commit before the diff is reviewed; no AI attribution in commits; run tests before and after a change; no fake tests; EASY, KISS and DRY |
| Finding documentation | How to connect and query the [ByJG Docs MCP Server](mcpserver-byjg-docs/README.md), when to trust the installed `vendor/` code instead, and the [agent skills](agent-skills/README.md) |
| Component catalog | Every PHP component, with its package name, docs slug and purpose, plus the abandoned packages to avoid |
| Versions | How to install the 7.x line while it is published as `7.0.x-dev`, and the v6 to v7 changes agents get wrong |
| Common pitfalls | Mistakes seen in practice: strict controller registration, `APP_ENV`, `MockServer` exceptions, destructive migration resets, Psalm configuration |
| Applications | Patterns for DI, models and repositories, REST endpoints, migrations and tests, with code |
| Components | The rules of the `php-*` repositories, summarised from [PHP components](../opensource/guidelines/php-components.md) |
| Definition of done | The checklist an agent completes before handing the change back |

## Related

- [ByJG Docs MCP Server](mcpserver-byjg-docs/README.md): the documentation search the file tells agents to use.
- [Agent Skills](agent-skills/README.md): for a Gluo application, install `gluo-developer` as well.
