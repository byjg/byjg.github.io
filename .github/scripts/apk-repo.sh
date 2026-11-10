#!/bin/sh
# Adds .apk packages to the Alpine repository folder, keeps the newest <keep> versions of each
# package, and rebuilds and signs the index of every architecture. Runs inside an Alpine
# container (it needs apk-tools and abuild-sign):
#
#   docker run --rm -v "$PWD:/w" -w /w alpine:3.22 \
#     sh .github/scripts/apk-repo.sh <repo folder> <new .apk folder> <keep> <private key> <key name>
#
# The repository is what apk expects: <repo folder>/<arch>/<pkgname>-<pkgver>.apk next to an
# APKINDEX.tar.gz signed with the RSA key. Users trust it with the public key, installed as
# /etc/apk/keys/<key name>; the signature names that file, so the key name never changes.
# A release names its .apk <package>_<version>_<os>_<arch>.apk: the name, version and
# architecture are read from the package itself.

set -eu

REPO=$1
ASSETS=$2
KEEP=$3
KEY=$4
KEY_NAME=$5

apk add -q abuild coreutils

field() {   # field <file.apk> <pkgname|pkgver|arch>
    tar -xzOf "$1" .PKGINFO 2>/dev/null | sed -n "s/^$2 = //p"
}

for FILE in "$ASSETS"/*.apk; do
    [ -e "$FILE" ] || continue
    ARCH=$(field "$FILE" arch)
    mkdir -p "$REPO/$ARCH"
    cp -v "$FILE" "$REPO/$ARCH/$(field "$FILE" pkgname)-$(field "$FILE" pkgver).apk"
done

for DIR in "$REPO"/*/; do
    ls "$DIR"*.apk >/dev/null 2>&1 || continue
    cd "$DIR"

    # Only the newest versions stay, as in the APT and RPM repositories
    for FILE in *.apk; do
        printf '%s\t%s\t%s\n' "$(field "$FILE" pkgname)" "$(field "$FILE" pkgver)" "$FILE"
    done > /tmp/packages.tsv
    for NAME in $(cut -f1 /tmp/packages.tsv | sort -u); do
        awk -F'\t' -v name="$NAME" '$1 == name' /tmp/packages.tsv | sort -t"$(printf '\t')" -k2,2V |
            head -n -"$KEEP" | cut -f3 | xargs -r rm -v
    done

    # The packages are not signed, the index is: apk trusts each package by the checksum the
    # signed index has for it
    rm -f APKINDEX.tar.gz
    apk index -q --allow-untrusted -d "ByJG Opensource" -o APKINDEX.tar.gz *.apk
    abuild-sign -q -k "$KEY" -p "$KEY_NAME" APKINDEX.tar.gz
    echo "$DIR: $(ls *.apk | wc -l) packages"
    cd - >/dev/null
done
