---
title: shellscript-add
tags: [ai]
description: "Use this skill whenever the user wants to add a new installer script to the shellscript.download project. Trigger when the user says things like \"add a script for X\", \"create a new script to install Y\", \"write a .sh for Z\", \"add <tool> to the catalog\", or any request to create or write a new public/scripts/*.sh file. Also trigger when the user asks how to contribute a new script or what the pattern for a new script looks like."
---

# shellscript-add

Use this skill whenever the user wants to add a new installer script to the shellscript.download project. Trigger when the user says things like "add a script for X", "create a new script to install Y", "write a .sh for Z", "add &lt;tool> to the catalog", or any request to create or write a new public/scripts/*.sh file. Also trigger when the user asks how to contribute a new script or what the pattern for a new script looks like.

## Install

**Claude Code**: add the catalog once, then install the skill:

```text
/plugin marketplace add byjg/skills
/plugin install shellscript-add@byjg
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
    "shellscript-add@byjg": true
  }
}
```

**Other agents** that read Agent Skills (Codex, Cursor, Gemini CLI, ...):

```bash
npx skills add byjg/skills --skill shellscript-add
```

## Source

Maintained in [byjg/shellscript-download](https://github.com/byjg/shellscript-download/tree/master/.claude/skills/shellscript-add) and published to
[byjg/skills](https://github.com/byjg/skills) on every change to its `master` branch.
