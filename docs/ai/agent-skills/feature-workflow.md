---
title: feature-workflow
tags: [ai]
description: "Guided workflow for adding new features or fixing bugs in DockNimbus. Use this skill whenever the user asks to add a feature, fix a bug, implement a new API endpoint, add a CLI command, modify the UI, change agent behavior, or any task that involves changing functionality across the codebase layers (types, SDK, API handlers, repository, CLI, UI, agent). Trigger on phrases like 'add feature', 'fix bug', 'implement X', 'new command', 'new endpoint', 'agent not working', 'UI missing X', or any request that touches application logic. Even if the user mentions only one layer (e.g. 'fix the agent'), use this skill because the root cause often spans multiple layers."
---

# feature-workflow

Guided workflow for adding new features or fixing bugs in DockNimbus. Use this skill whenever the user asks to add a feature, fix a bug, implement a new API endpoint, add a CLI command, modify the UI, change agent behavior, or any task that involves changing functionality across the codebase layers (types, SDK, API handlers, repository, CLI, UI, agent). Trigger on phrases like 'add feature', 'fix bug', 'implement X', 'new command', 'new endpoint', 'agent not working', 'UI missing X', or any request that touches application logic. Even if the user mentions only one layer (e.g. 'fix the agent'), use this skill because the root cause often spans multiple layers.

## Install

**Claude Code**: add the catalog once, then install the skill:

```text
/plugin marketplace add byjg/skills
/plugin install feature-workflow@byjg
```

Or declare it in a project's `.claude/settings.json`, so Claude Code offers it to
everyone who opens the project:

```json
{
  "extraKnownMarketplaces": {
    "byjg": {
      "source": {
        "source": "github",
        "repo": "byjg/skills"
      }
    }
  },
  "enabledPlugins": {
    "feature-workflow@byjg": true
  }
}
```

**Other agents** that read Agent Skills (Codex, Cursor, Gemini CLI, ...):

```bash
npx skills add byjg/skills --skill feature-workflow
```

## Source

Maintained in [docknimbus/nimbus](https://github.com/docknimbus/nimbus/tree/master/.claude/skills/feature-workflow) and published to
[byjg/skills](https://github.com/byjg/skills) on every change to its `master` branch.
