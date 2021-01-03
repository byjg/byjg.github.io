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

rm -rf ${TMP_FOLDER}/${DOC_FOLDER}/${PROJECT_NAME}*
if [ -z "$EXTRA_FOLDER" ]
then
  cp README.md "${TMP_FOLDER}/${DOC_FOLDER}/${PROJECT_NAME}.md"
else
  mkdir -p "${TMP_FOLDER}/${DOC_FOLDER}/${PROJECT_NAME}"
  cp README.md "${TMP_FOLDER}/${DOC_FOLDER}/${PROJECT_NAME}"
  cp -r ${EXTRA_FOLDER}/* "${TMP_FOLDER}/${DOC_FOLDER}/${PROJECT_NAME}"
fi

cd "$TMP_FOLDER"
git add "${DOC_FOLDER}/${PROJECT_NAME}*"
git config user.name "CI/CD"
git config user.email "info@byjg.com.br"
git commit -m "Update documentation '$DOC_FOLDER' '$PROJECT_NAME'"
git push
