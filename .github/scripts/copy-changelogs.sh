#!/usr/bin/env bash
# Publishes a project's CHANGELOG.md and CHANGELOG-<version>.md files as a "Changelog" group of
# its documentation: <destination>/changelog/<version>.md, CHANGELOG.md first, then the versions
# newest first. Does nothing when the project has no changelog.
#
# Usage: copy-changelogs.sh <project dir> <destination dir> <owner/repository>
#
# Links are rewritten for the new location: docs/... points to the project's pages, a
# CHANGELOG-<version>.md to its version page, and any other file of the repository (LICENSE,
# tests/, examples/...), which is not published, to the file on GitHub.

set -euo pipefail

SRC=$1
DEST=$2
REPO=$3

shopt -s nullglob
VERSIONED=("$SRC"/CHANGELOG-*.md)
[ -f "$SRC/CHANGELOG.md" ] || [ ${#VERSIONED[@]} -gt 0 ] || exit 0

mkdir -p "$DEST/changelog"
# The key keeps the translation key of each project's "Changelog" category unique
printf '{ "label": "Changelog", "key": "changelog-%s", "position": 1000, "collapsed": true }\n' "${REPO##*/}" > "$DEST/changelog/_category_.json"

POSITION=1
write_page() {  # <source file> <page name> <title>
    {
        printf -- '---\ntitle: "%s"\nsidebar_label: "%s"\nsidebar_position: %d\n---\n\n' "$3" "$3" "$POSITION"
        cat "$1"
    } > "$DEST/changelog/$2.md"
    POSITION=$((POSITION + 1))
}

if [ -f "$SRC/CHANGELOG.md" ]; then
    write_page "$SRC/CHANGELOG.md" changelog "Changelog"
fi
for VERSION in $(for f in "${VERSIONED[@]}"; do f=${f##*/CHANGELOG-}; echo "${f%.md}"; done | sort -rV); do
    write_page "$SRC/CHANGELOG-$VERSION.md" "$VERSION" "$VERSION"
done

# The repository files first, so the docs/ and CHANGELOG links below are not taken for them
REPO="$REPO" perl -pi -e '
    s{\]\((?:\./)?(?!\.\./|docs/|CHANGELOG|[a-zA-Z][a-zA-Z0-9+.-]*:|#|/)([^)\s]+)\)}{](https://github.com/$ENV{REPO}/blob/HEAD/$1)}g;
    s{\]\((?:\./)?docs/}{](../}g;
    s{\]\((?:\./)?CHANGELOG-([^)#\s]+?)\.md}{]($1}g;
    s{\]\((?:\./)?CHANGELOG\.md}{](changelog}g;
' "$DEST"/changelog/*.md
