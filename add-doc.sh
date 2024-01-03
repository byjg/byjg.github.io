#!/usr/bin/env bash

DOC_FOLDER="$1"
PROJECT_NAME="$2"
EXTRA_FOLDER="$3"

if [ -z "$PROJECT_NAME" ]
then
  echo "Usage: "
  echo "  add-doc.sh <doc_folder> <project> [extra_folder]"
  exit 1
fi

if [ -z "$DOC_GITHUB_TOKEN" ]
then
  echo 'DOC_GITHUB_TOKEN is required'
  exit 2
fi

PROJECT_FOLDER="$PWD"
TMP_FOLDER=/tmp/byjg.github.io

git clone --depth 1 https://byjg:$DOC_GITHUB_TOKEN@github.com/byjg/byjg.github.io $TMP_FOLDER

# Copy contents of the repository to the documentation folder
rm -rf ${TMP_FOLDER}/${DOC_FOLDER}/${PROJECT_NAME}/
rm -rf ${TMP_FOLDER}/${DOC_FOLDER}/${PROJECT_NAME}.md
if [ -z "$EXTRA_FOLDER" ]
then
  cp README.md "${TMP_FOLDER}/${DOC_FOLDER}/${PROJECT_NAME}.md"
else
  mkdir -p "${TMP_FOLDER}/${DOC_FOLDER}/${PROJECT_NAME}"
  sed "s~(docs/~(~g"  README.md > "${TMP_FOLDER}/${DOC_FOLDER}/${PROJECT_NAME}/README.md"
  cp -r ${EXTRA_FOLDER}/* "${TMP_FOLDER}/${DOC_FOLDER}/${PROJECT_NAME}"
fi

# Extract mermaid diagrams
rm "${TMP_FOLDER}/php/README.md"
find "${TMP_FOLDER}/php -maxdepth 2 -name '*.md -exec grep -A 12 "## Dependencies" {} \; | sed -n '/flowchart TD/,/```/ {/flowchart TD/b;/```/b;p}' | tr -s ' ' > /tmp/mermaid-all.txt
grep '\-\-> byjg' /tmp/mermaid-all.txt > /tmp/mermaid.txt
grep ' byjg' /tmp/mermaid-all.txt | sed 's/ -->.*//g' | sort | uniq >> /tmp/mermaid.txt
python3 mermaid.py /tmp/mermaid.txt > "${TMP_FOLDER}/php/README.md"

# Commit and push
cd "$TMP_FOLDER"
git add "${DOC_FOLDER}/${PROJECT_NAME}*"
git config user.name "CI/CD"
git config user.email "info@byjg.com.br"
git commit -m "Update documentation '$DOC_FOLDER' '$PROJECT_NAME'"
git push
