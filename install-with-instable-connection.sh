#!/bin/bash
# source of this script: https://stackoverflow.com/questions/67991537/npm-install-error-enotempty-directory-not-empty
set -e

while true; do
  log="$HOME/.npm/_logs/`ls $HOME/.npm/_logs/ | tail -n 1`"
  echo "log: $log"
  for path in `cat "$log" | grep 'ENOTEMPTY' | grep -oE "[^']+node_modules[^']+"`; do
    echo "removing $path"
    rm -rf "$path"
  done
  if npm install; then
    break
  fi
done
