---
sidebar_position: 2
---

# Publishing documentation

A project's documentation lives in its own repository. The
[`add-doc.yaml`](https://github.com/byjg/byjg.github.io/blob/master/.github/workflows/add-doc.yaml)
reusable workflow copies it into this site every time `master` builds.

:::warning
Never edit `docs/php`, `docs/devops`, `docs/js`, `docs/ai` or `docs/archived`
in this repository, nor `docs/ai/agent-skills` or the [byjg/skills](https://github.com/byjg/skills)
repository. The workflow deletes and re-copies a project's folder on every
publish, so edits made there are lost. Change the source repository instead.
:::

## Add the job

Add a job to the project's workflow, after the job that runs the tests:

```yaml
  Documentation:
    if: github.ref == 'refs/heads/master'
    needs: Build
    uses: byjg/byjg.github.io/.github/workflows/add-doc.yaml@master
    with:
      folder: php
      project: ${{ github.event.repository.name }}
    secrets:
      DOC_TOKEN: ${{ secrets.DOC_TOKEN }}
```

| Input | Required | Meaning |
|---|---|---|
| `folder` | yes | Site section: `php`, `js`, `devops`, `ai` or `archived` |
| `project` | yes | Repository name, without the owner |
| `owner` | no | Repository owner; defaults to `byjg` |

To publish without a push -- a project with no job, or to republish -- run
**Add project to the documentation** from the
[Actions tab of this repository](https://github.com/byjg/byjg.github.io/actions/workflows/add-doc.yaml)
and fill in the same inputs.

## Where it lands

The `folder` prefix is removed from the start of the repository name to form
the URL:

| Repository | `folder` | Site path |
|---|---|---|
| `php-micro-orm` | `php` | `docs/php/micro-orm` |
| `docker-easy-haproxy` | `devops` | `docs/devops/docker-easy-haproxy` |
| `mcpserver-byjg-docs` | `ai` | `docs/ai/mcpserver-byjg-docs` |

Only `README.md`, `docs/`, `composer.json` and `.claude/skills/` are read from the
repository.
What the site shows depends on whether `docs/` exists:

| Repository has | Site gets |
|---|---|
| `README.md` only | One page: `docs/<folder>/<name>.md` |
| `README.md` and `docs/` | A section: `README.md` becomes the index page, and everything under `docs/` is copied next to it |

The project's folder is deleted before copying, so a page removed from the
repository also disappears from the site.

The commit is pushed to this site's `master`, which every project pushes to --
`add-doc`, `add-helm` and `add-pkg` all commit here. When two releases overlap,
the second push is rejected (`! [rejected] ... (fetch first)`), so the three
workflows rebase and retry up to 5 times before failing. Any other job that
pushes here must do the same; a plain `git push` loses the run's work.

## Repository layout

```
README.md                 index page of the project's section
docs/
  getting-started.md
  some-topic.md
  image.png               images live inside docs/ too
  guides/                 optional subfolders
    _category_.json
    first-guide.md
```

Anything outside `README.md` and `docs/` is not copied. An image referenced
from `src/` or the repository root will be missing on the site.

## Front matter

### README.md

```markdown
---
sidebar_key: micro-orm
tags: [php, databases, orm]
---

# MicroOrm
```

- **`sidebar_key`** -- the project name without the folder prefix. Every
  project's index page is a `README.md`; this key keeps their sidebar entries
  unique. For a project with `docs/` whose README has no front matter, the
  workflow generates one with only `sidebar_key` -- but no tags. Write it
  yourself.
- **`tags`** -- must already exist in
  [`docs/tags.yml`](https://github.com/byjg/byjg.github.io/blob/master/docs/tags.yml).
  An unknown tag produces a build warning. Add a new tag to `tags.yml` first.

### Pages in docs/

```markdown
---
sidebar_position: 3
---

# Querying the database
```

`sidebar_position` sets the order in the sidebar. `title`, `sidebar_label`
and `description` are also used where the heading is not a good label.

A subfolder gets its label and order from a `_category_.json`:

```json
{
  "label": "Getting Started",
  "position": 1,
  "link": {
    "type": "generated-index",
    "description": "Install and run your first example."
  }
}
```

## Links

Write links that work on GitHub. The workflow rewrites them for the site:

| In the repository | On the site |
|---|---|
| README: `[Cache](docs/cache.md)` | `[Cache](cache)` |
| docs page: `[Cache](cache.md)` | `[Cache](cache)` |

- Link from the README into `docs/` with the `docs/` prefix, and between docs
  pages relative to the page.
- Do not link to files outside `docs/` -- `LICENSE`, `CHANGELOG`, source
  files. They are not copied, so the link breaks. Use the full GitHub URL
  instead.
- Do not name a page `index.md` (or `README.md`) inside a `docs/` subfolder
  and link to it. The rewrite turns `guides/index.md` into `guides/index`,
  while the site serves that page at `guides/` -- a broken link. Give it a
  normal name, such as `guides/overview.md`, or use a `_category_.json` with a
  generated index instead.

:::danger
**The site build fails on any broken link.** One bad link in one project's
docs stops the whole site from deploying, for every project.
:::

## PHP dependency graph

For `folder: php` the workflow also reads `composer.json` and records the
project's `byjg/*` dependencies -- from `require`, `require-dev` and
`suggest` -- in `data/dependencies/<name>.json`. The graph on the
[PHP Components](/docs/php) page is rebuilt from all recorded projects.

Nothing to maintain by hand: keep `composer.json` accurate. A hand-written
`## Dependencies` diagram in the README is not used for the graph.

## Agent skills

A project can ship [Agent Skills](https://agentskills.io): instructions that teach a
coding agent (Claude Code, Codex, Cursor, ...) how to work with the component. Like the
documentation, a skill lives in the project's repository and the workflow publishes it.

```
.claude/skills/
  gluo-developer/
    SKILL.md              front matter with name and description, then the instructions
    references/           optional: files the skill points to, loaded when needed
      testing.md
```

`.claude/skills/` is the location Claude Code loads skills from, so the skill also works
while you work on the project itself.

- **`name`** in the front matter must be the folder name. The publish fails otherwise.
- **The name is unique across all projects.** Every skill is published into one
  catalog; a name another project already published fails the publish. Prefer a name
  that says what it is about (`gluo-developer`, not `dev-guide`).
- **Keep the front matter to the fields of the open standard** (`name`,
  `description`, and the few others it defines). Claude Code ignores keys it doesn't
  know, but claude.ai and the Skills API reject them.

On every publish, `skills.py` (next to the workflow) does the following:

| Where | What |
|---|---|
| [byjg/skills](https://github.com/byjg/skills) | `skills/<name>/`: a copy of the skill. `.claude-plugin/marketplace.json`: the `byjg` plugin catalog, one plugin per skill. `README.md`: the list of skills |
| this site | `docs/ai/agent-skills/`, the [Agent Skills](/docs/ai/agent-skills) section of AI: a page per skill, with how to install it. A project named `agent-skills` in the `ai` folder would collide with it |

A project's previous skills are removed first (the catalog records which project
published each one), so a renamed or deleted skill disappears from both places.
`byjg/skills` takes pushes from every project too, and its push rebases and retries
like this site's.

Users install from `byjg/skills`:

```text
/plugin marketplace add byjg/skills          # Claude Code
/plugin install gluo-developer@byjg
npx skills add byjg/skills --skill gluo-developer   # other agents
```

A project can also declare the catalog in its committed `.claude/settings.json`, so
Claude Code offers the skill to everyone who opens it:

```json
{
  "extraKnownMarketplaces": {
    "byjg": { "source": { "source": "github", "repo": "byjg/skills" } }
  },
  "enabledPlugins": { "gluo-developer@byjg": true }
}
```

To check a skill before it is published, publish it into a local clone of
`byjg/skills`, validate the catalog, and build the pages:

```bash
cd byjg.github.io
python3 skills.py publish ../php-my-project byjg/php-my-project ../skills
python3 skills.py pages ../skills .
claude plugin validate ../skills
npm run build
```

Discard both copies afterwards (`git checkout -- . && git clean -fd` in each); the
workflow publishes the real ones.

## Preview before publishing

To check a large change, copy it into a local clone of this repository and
build the site. The build fails on the same broken links the real one would:

```bash
cd byjg.github.io
mkdir -p docs/php/my-project
cp -r ../php-my-project/docs/* docs/php/my-project/
sed 's~(docs/~(~g' ../php-my-project/README.md > docs/php/my-project/README.md
npm install
npm run build
```

Discard the copy afterwards; the workflow publishes the real one.

## Checklist

- [ ] `Documentation` job runs on `master` only and `needs:` the test job
- [ ] `README.md` has front matter with `sidebar_key` and `tags` from `tags.yml`
- [ ] Every page in `docs/` has `sidebar_position`
- [ ] Links stay inside `README.md` and `docs/`; images are inside `docs/`
- [ ] Each skill in `.claude/skills/` has a `name` equal to its folder name, unique across projects
