#!/usr/bin/env bash

HELM_FOLDER="$1"
HELM_PROJECT="$2"

if [ -z "$HELM_PROJECT" ]
then
  echo "Usage: "
  echo "  add-helm.sh <helm_folder> <helm_project>"
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

# Install helm
wget https://get.helm.sh/helm-v3.9.4-linux-amd64.tar.gz -o /dev/null -O helm.tar.gz
tar xvf helm.tar.gz
sudo mv linux-amd64/helm /usr/local/bin
helm version

# Build package
cd $HELM_FOLDER
helm package $HELM_PROJECT
mv $HELM_PROJECT*.tgz $TMP_FOLDER/helm
helm repo index $TMP_FOLDER/helm --url https://opensource.byjg.com/helm

cd "$TMP_FOLDER"
git add "helm/*"
git config user.name "CI/CD"
git config user.email "info@byjg.com.br"
git commit -m "[skip ci] Add helm package '$HELM_PROJECT'"
git push
