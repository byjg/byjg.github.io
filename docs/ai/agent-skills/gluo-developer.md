---
title: gluo-developer
tags: [ai]
description: "Develop and maintain PHP REST APIs created with byjg/gluo: endpoints, models, persistence, DI configuration, migrations, authentication, OpenAPI, and tests. Use whenever working on a Gluo PHP application, even for generic requests such as \"add a new endpoint\" or \"fix this bug\" that do not name Gluo explicitly. Follow the project's installed dependency versions and existing conventions. Frontend-only work needs this skill only when it changes the API integration."
---

# gluo-developer

Develop and maintain PHP REST APIs created with byjg/gluo: endpoints, models, persistence, DI configuration, migrations, authentication, OpenAPI, and tests. Use whenever working on a Gluo PHP application, even for generic requests such as "add a new endpoint" or "fix this bug" that do not name Gluo explicitly. Follow the project's installed dependency versions and existing conventions. Frontend-only work needs this skill only when it changes the API integration.

## Install

**Claude Code**: add the catalog once, then install the skill:

```text
/plugin marketplace add byjg/skills
/plugin install gluo-developer@byjg
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
    "gluo-developer@byjg": true
  }
}
```

**Other agents** that read Agent Skills (Codex, Cursor, Gemini CLI, ...):

```bash
npx skills add byjg/skills --skill gluo-developer
```

## Source

Maintained in [byjg/php-gluo](https://github.com/byjg/php-gluo/tree/master/.claude/skills/gluo-developer) and published to
[byjg/skills](https://github.com/byjg/skills) on every change to its `master` branch.

## References

Loaded by the agent when a task needs them:

- [anydataset.md](https://github.com/byjg/php-gluo/tree/master/.claude/skills/gluo-developer/references/anydataset.md)
- [cache.md](https://github.com/byjg/php-gluo/tree/master/.claude/skills/gluo-developer/references/cache.md)
- [di-environments.md](https://github.com/byjg/php-gluo/tree/master/.claude/skills/gluo-developer/references/di-environments.md)
- [email.md](https://github.com/byjg/php-gluo/tree/master/.claude/skills/gluo-developer/references/email.md)
- [featureflags.md](https://github.com/byjg/php-gluo/tree/master/.claude/skills/gluo-developer/references/featureflags.md)
- [http-client.md](https://github.com/byjg/php-gluo/tree/master/.claude/skills/gluo-developer/references/http-client.md)
- [imageutil.md](https://github.com/byjg/php-gluo/tree/master/.claude/skills/gluo-developer/references/imageutil.md)
- [jinja.md](https://github.com/byjg/php-gluo/tree/master/.claude/skills/gluo-developer/references/jinja.md)
- [manual-crud.md](https://github.com/byjg/php-gluo/tree/master/.claude/skills/gluo-developer/references/manual-crud.md)
- [messagequeue.md](https://github.com/byjg/php-gluo/tree/master/.claude/skills/gluo-developer/references/messagequeue.md)
- [openapi-patterns.md](https://github.com/byjg/php-gluo/tree/master/.claude/skills/gluo-developer/references/openapi-patterns.md)
- [queries.md](https://github.com/byjg/php-gluo/tree/master/.claude/skills/gluo-developer/references/queries.md)
- [request-response.md](https://github.com/byjg/php-gluo/tree/master/.claude/skills/gluo-developer/references/request-response.md)
- [scriptify.md](https://github.com/byjg/php-gluo/tree/master/.claude/skills/gluo-developer/references/scriptify.md)
- [serialization.md](https://github.com/byjg/php-gluo/tree/master/.claude/skills/gluo-developer/references/serialization.md)
- [statemachine.md](https://github.com/byjg/php-gluo/tree/master/.claude/skills/gluo-developer/references/statemachine.md)
- [testing.md](https://github.com/byjg/php-gluo/tree/master/.claude/skills/gluo-developer/references/testing.md)
- [users.md](https://github.com/byjg/php-gluo/tree/master/.claude/skills/gluo-developer/references/users.md)
- [xml.md](https://github.com/byjg/php-gluo/tree/master/.claude/skills/gluo-developer/references/xml.md)
