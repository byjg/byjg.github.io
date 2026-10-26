"""Publish the Agent Skills of the ByJG projects.

A project keeps its skills in .claude/skills/<name>/SKILL.md, next to the code they
describe; add-doc publishes them as it publishes the documentation, to two places:

- the byjg/skills repository, which the installers read: Claude Code through its plugin
  catalog (.claude-plugin/marketplace.json, one plugin per skill), `npx skills add
  byjg/skills --skill <name>` and Codex straight from skills/<name>/;
- this site, which has a page per skill in the AI section (docs/ai/agent-skills/).

Both are generated: change a skill in its project, never in byjg/skills or here.

    skills.py publish <project dir> <repository> <skills repo dir>
        Replaces the skills the repository published before with the ones it has now,
        and rewrites the catalog and the README of byjg/skills. The catalog records the
        repository of each skill (metadata.repository), which is how the previous ones
        are found.

    skills.py pages <skills repo dir> <site dir>
        Writes the Agent Skills pages of this site (docs/ai/agent-skills/) from the
        catalog of byjg/skills.
"""
import json
import os
import shutil
import sys

SKILLS_REPOSITORY = "byjg/skills"
CATALOG = "byjg"
SITE_URL = "https://opensource.byjg.com"
PAGES_URL = f"{SITE_URL}/docs/ai/agent-skills"


def read_front_matter(path):
    """The name and description of a SKILL.md: plain `key: value` lines, or a folded
    (`>`) or literal (`|`) block indented under the key."""
    with open(path, encoding="utf-8") as handle:
        lines = handle.read().split("\n")
    if not lines or lines[0].strip() != "---":
        raise ValueError(f"{path}: no front matter")
    end = lines.index("---", 1)
    values, key, block = {}, None, []
    for line in lines[1:end]:
        if key and (line.startswith(" ") or line == ""):
            block.append(line.strip())
            continue
        if key:
            values[key] = " ".join(part for part in block if part)
            key, block = None, []
        if ":" in line and not line.startswith(" "):
            name, value = line.split(":", 1)
            value = value.strip()
            if value in (">", "|", ">-", "|-"):
                key = name.strip()
            else:
                values[name.strip()] = value.strip("'\"")
    if key:
        values[key] = " ".join(part for part in block if part)
    return values


def catalog_path(skills_dir):
    return os.path.join(skills_dir, ".claude-plugin", "marketplace.json")


def read_catalog(skills_dir):
    if not os.path.exists(catalog_path(skills_dir)):
        return []
    with open(catalog_path(skills_dir), encoding="utf-8") as handle:
        return json.load(handle)["plugins"]


def publish(project_dir, repository, skills_dir):
    plugins = read_catalog(skills_dir)

    # Drop what this repository published before; keep everyone else's.
    for plugin in plugins:
        if plugin["metadata"]["repository"] == repository:
            shutil.rmtree(os.path.join(skills_dir, "skills", plugin["name"]), ignore_errors=True)
    plugins = [plugin for plugin in plugins if plugin["metadata"]["repository"] != repository]
    taken = {plugin["name"]: plugin["metadata"]["repository"] for plugin in plugins}

    source = os.path.join(project_dir, ".claude", "skills")
    names = sorted(
        name for name in (os.listdir(source) if os.path.isdir(source) else [])
        if os.path.isfile(os.path.join(source, name, "SKILL.md"))
    )
    for name in names:
        front = read_front_matter(os.path.join(source, name, "SKILL.md"))
        if front.get("name") != name:
            raise ValueError(f"{repository}: the name in {name}/SKILL.md must be the folder name, '{name}'")
        if name in taken:
            raise ValueError(f"{repository}: the skill '{name}' is already published by {taken[name]}")
        shutil.copytree(os.path.join(source, name), os.path.join(skills_dir, "skills", name))
        plugins.append({
            "name": name,
            "source": f"./skills/{name}",
            "description": front.get("description", ""),
            "homepage": f"{PAGES_URL}/{name}",
            "metadata": {"repository": repository},
        })

    plugins = sorted(plugins, key=lambda plugin: plugin["name"])
    write_catalog(skills_dir, plugins)
    write_readme(skills_dir, plugins)


def write_catalog(skills_dir, plugins):
    catalog = {
        "name": CATALOG,
        "description": "Agent Skills for the ByJG open source components, published from their repositories.",
        "owner": {"name": "ByJG", "url": "https://github.com/byjg"},
        "plugins": plugins,
    }
    os.makedirs(os.path.dirname(catalog_path(skills_dir)), exist_ok=True)
    with open(catalog_path(skills_dir), "w", encoding="utf-8") as handle:
        json.dump(catalog, handle, indent=2, ensure_ascii=False)
        handle.write("\n")


def install_lines(name):
    return [
        "**Claude Code**: add the catalog once, then install the skill:",
        "",
        "```text",
        f"/plugin marketplace add {SKILLS_REPOSITORY}",
        f"/plugin install {name}@{CATALOG}",
        "```",
        "",
        "Or declare it in a project's `.claude/settings.json`, so Claude Code offers it to",
        "everyone who opens the project:",
        "",
        "```json",
        json.dumps({
            "extraKnownMarketplaces": {CATALOG: {"source": {"source": "github", "repo": SKILLS_REPOSITORY}}},
            "enabledPlugins": {f"{name}@{CATALOG}": True},
        }, indent=2),
        "```",
        "",
        "**Other agents** that read Agent Skills (Codex, Cursor, Gemini CLI, ...):",
        "",
        "```bash",
        f"npx skills add {SKILLS_REPOSITORY} --skill {name}",
        "```",
    ]


def write_readme(skills_dir, plugins):
    lines = [
        "# ByJG Agent Skills",
        "",
        "Skills that teach a coding agent (Claude Code, Codex, Cursor, ...) how to work with the",
        f"ByJG open source components. Documentation: [{PAGES_URL}]({PAGES_URL}).",
        "",
        "> [!IMPORTANT]",
        "> This repository is generated automatically. Each skill is maintained in the repository",
        "> of the component it describes, in `.claude/skills/<name>/`, and published here on every",
        "> change to that repository's `master` branch. Changes made here are overwritten by the",
        "> next publish: open issues and pull requests in the component's repository instead.",
        "",
        "## Skills",
        "",
    ]
    if plugins:
        lines += ["| Skill | Description | Source |", "|---|---|---|"]
        for plugin in plugins:
            repository = plugin["metadata"]["repository"]
            description = plugin["description"].replace("|", "\\|")
            lines.append(f"| [{plugin['name']}](skills/{plugin['name']}) | {description} "
                         f"| [{repository}](https://github.com/{repository}/tree/master/.claude/skills/{plugin['name']}) |")
    else:
        lines.append("No skills are published yet.")
    lines += ["", "## Install", ""] + install_lines("<skill>")
    with open(os.path.join(skills_dir, "README.md"), "w", encoding="utf-8") as handle:
        handle.write("\n".join(lines) + "\n")


def mdx_text(text):
    """Plain text that MDX reads as text: braces and angle brackets are escaped."""
    return text.replace("{", "\\{").replace("}", "\\}").replace("<", "&lt;")


def page(plugin, skills_dir):
    name, repository = plugin["name"], plugin["metadata"]["repository"]
    source = f"https://github.com/{repository}/tree/master/.claude/skills/{name}"
    references_dir = os.path.join(skills_dir, "skills", name, "references")
    references = sorted(os.listdir(references_dir)) if os.path.isdir(references_dir) else []
    lines = [
        "---",
        f"title: {name}",
        "tags: [ai]",
        f"description: {json.dumps(plugin['description'], ensure_ascii=False)}",
        "---",
        "",
        f"# {name}",
        "",
        mdx_text(plugin["description"]),
        "",
        "## Install",
        "",
    ] + install_lines(name) + [
        "",
        "## Source",
        "",
        f"Maintained in [{repository}]({source}) and published to",
        f"[{SKILLS_REPOSITORY}](https://github.com/{SKILLS_REPOSITORY}) on every change to its `master` branch.",
    ]
    if references:
        lines += ["", "## References", "", "Loaded by the agent when a task needs them:", ""]
        lines += [f"- [{reference}]({source}/references/{reference})" for reference in references]
    return "\n".join(lines) + "\n"


def pages(skills_dir, site_dir):
    plugins = read_catalog(skills_dir)
    target = os.path.join(site_dir, "docs", "ai", "agent-skills")
    shutil.rmtree(target, ignore_errors=True)
    os.makedirs(target)
    index = [
        "---",
        "sidebar_key: agent-skills",
        "tags: [ai]",
        "---",
        "",
        "# Agent Skills",
        "",
        "Skills that teach a coding agent (Claude Code, Codex, Cursor, ...) how to work with the",
        "ByJG components. Each one is maintained in the repository of the component it describes",
        f"and published to [{SKILLS_REPOSITORY}](https://github.com/{SKILLS_REPOSITORY}), the `{CATALOG}`",
        "plugin catalog.",
        "",
    ]
    for plugin in plugins:
        index.append(f"- [{plugin['name']}]({plugin['name']}.md): {mdx_text(plugin['description'])}")
        with open(os.path.join(target, f"{plugin['name']}.md"), "w", encoding="utf-8") as handle:
            handle.write(page(plugin, skills_dir))
    if not plugins:
        index.append("No skills are published yet.")
    with open(os.path.join(target, "README.md"), "w", encoding="utf-8") as handle:
        handle.write("\n".join(index) + "\n")


if __name__ == "__main__":
    if len(sys.argv) == 5 and sys.argv[1] == "publish":
        publish(*sys.argv[2:])
    elif len(sys.argv) == 4 and sys.argv[1] == "pages":
        pages(*sys.argv[2:])
    else:
        sys.exit(__doc__)
