"""Render the PHP component dependency graph.

Reads the per-project files written by collect-deps.py, one per project, each
holding that project's byjg dependencies as declared in its composer.json.

Usage: mermaid.py <directory of dependency json files>
"""
from collections import defaultdict, deque
import json
import os
import sys

# Strongest wins when a package appears in more than one section: a real
# dependency is not also drawn as a suggestion.
SECTION_ORDER = ("require", "require-dev", "suggest")

EDGE = {
    "require": "-->",
    "require-dev": "-.->|dev|",
    "suggest": "-.->|suggest|",
}

DEPRECATED = ("byjg/anydataset-array",)


def load(directory):
    """Return (nodes, edges) where edges is {(source, target): section}."""
    nodes = set()
    edges = {}
    for entry in sorted(os.listdir(directory)):
        if not entry.endswith(".json"):
            continue
        with open(os.path.join(directory, entry), encoding="utf-8") as fh:
            data = json.load(fh)
        source = data["name"]
        nodes.add(source)
        for section in SECTION_ORDER:
            for target in data.get("deps", {}).get(section, {}):
                nodes.add(target)
                # first section wins, per SECTION_ORDER
                edges.setdefault((source, target), section)
    return nodes, edges


def doc_link(package):
    """URL of a package's documentation page.

    The docs folder is the repository name without its "php-" prefix, so
    byjg/anydataset-db lives at /docs/php/anydataset-db. One package declares
    itself as byjg/php-resilience, keeping the prefix the others drop; strip it
    so the link still resolves.
    """
    slug = package.split("/")[-1]
    if slug.startswith("php-"):
        slug = slug[len("php-"):]
    return f"https://opensource.byjg.com/docs/php/{slug}"


def topological_sort(nodes, connections):
    in_degree = {node: 0 for node in nodes}
    adjacency_list = defaultdict(list)

    for source, target in connections:
        in_degree[target] += 1
        adjacency_list[source].append(target)

    queue = deque(sorted(node for node in nodes if in_degree[node] == 0))
    result = []
    while queue:
        current_node = queue.popleft()
        result.append(current_node)
        for neighbor in adjacency_list[current_node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    # Anything left sits in a cycle; emit it so no node is silently dropped.
    result.extend(sorted(set(nodes) - set(result)))
    return result


def render(directory):
    nodes, edges = load(directory)
    sorted_nodes = topological_sort(nodes, list(edges))

    print("# PHP Components")
    print("## Class Dependency")
    print()
    print("Generated from each component's `composer.json`.")
    print("Solid is `require`, `dev` is `require-dev`, `suggest` is optional.")
    print()
    print("```mermaid")
    print("graph LR;")
    for node in sorted_nodes:
        print(f"  {node}[<a href='{doc_link(node)}' style='text-decoration:none'>{node}🔗</a>];")
    for (source, target), section in edges.items():
        print(f"  {source} {EDGE[section]} {target};")
    print("  classDef default fill:#ffffff,stroke:#333,stroke-width:1.5px,color:#000,font-size:14px;")
    print("  classDef highlight fill:#ffef96,stroke:#ff9900,stroke-width:3px;")
    print("  classDef deprecated fill:#f8f8f8,stroke:#cccccc,stroke-dasharray: 5 5,stroke-width:1px,color:#999;")
    print("  classDef working-on fill:#fff3cd,stroke:#ffcc00,stroke-width:2px,color:#856404;")
    print("  classDef finished fill:#d4edda,stroke:#28a745,stroke-width:2px,color:#155724;")
    for name in DEPRECATED:
        if name in nodes:
            print(f"  class {name} deprecated;")
    print("```")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    render(sys.argv[1])
