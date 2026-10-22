#!/usr/bin/env bash
# Keeps only the newest <keep> versions of every package in a repository folder and deletes the
# older ones, so packages/ does not grow with every release. Run it before reindexing: the apt
# and rpm metadata are rebuilt from the files left in the folder.
#
# Usage: prune-packages.sh <folder> <deb|rpm> <keep>
#
# Files are named <package>_<version>_<os>_<arch>.<ext>; every architecture of a version is
# kept or deleted together.

set -euo pipefail

DIR=$1
EXT=$2
KEEP=$3

cd "$DIR"
for PACKAGE in $(ls *."$EXT" 2>/dev/null | cut -d_ -f1 | sort -u); do
    for VERSION in $(ls "${PACKAGE}"_*."$EXT" | cut -d_ -f2 | sort -uV | head -n -"$KEEP"); do
        rm -v "${PACKAGE}_${VERSION}"_*."$EXT"
    done
done
