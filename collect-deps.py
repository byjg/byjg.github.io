"""Record one project's byjg dependencies, read from its composer.json.

The dependency graph used to be scraped from a hand-written mermaid block in
each README, which drifted: entries stayed behind after a dependency was
dropped, and several projects had no block at all. composer.json is the actual
declaration, so it is what gets recorded here.

Usage: collect-deps.py <composer.json> <output.json>
"""
import json
import sys

SECTIONS = ("require", "require-dev", "suggest")


def collect(composer_path):
    with open(composer_path, encoding="utf-8") as fh:
        composer = json.load(fh)

    name = composer.get("name", "")
    out = {"name": name, "deps": {}}

    for section in SECTIONS:
        # suggest maps package -> description rather than package -> constraint,
        # so only the key is meaningful for the graph.
        names = sorted(
            k for k in (composer.get(section) or {}) if k.startswith("byjg/")
        )
        if names:
            out["deps"][section] = {
                k: (composer[section][k] if section != "suggest" else "")
                for k in names
            }
    return out


def main():
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    result = collect(sys.argv[1])
    if not result["name"]:
        raise SystemExit(f"{sys.argv[1]}: no package name")
    with open(sys.argv[2], "w", encoding="utf-8") as fh:
        json.dump(result, fh, indent=2, sort_keys=True)
        fh.write("\n")
    total = sum(len(v) for v in result["deps"].values())
    print(f"{result['name']}: {total} byjg dependencies recorded")


if __name__ == "__main__":
    main()
