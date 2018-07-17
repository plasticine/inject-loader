#!/usr/bin/env bash

if [ -z "$1" ]; then
  echo "Please provide a package name!"
  exit 1
fi

if [ -z "$2" ]; then
  echo "Please provide a package description!"
  exit 1
fi

PACKAGE_NAME=$1
PACKAGE_DESCRIPTION=$2

FILES=$(find . -type f -not -path '*/node_modules/*' -and -not -path '*/\.*')

for file in ${FILES[@]}; do
  sed -i "s/PROJECT_NAME/${PACKAGE_NAME}/g" $file
  sed -i "s/PROJECT_DESCRIPTION/${PACKAGE_DESCRIPTION}/g" $file
done

mv .gitlab-ci.example.yml .gitlab-ci.yml
