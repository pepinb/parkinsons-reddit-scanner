#!/bin/bash
cd "$(dirname "$0")/.."

echo ""
echo "=== $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="

node scripts/fetch-and-save.js
if [ $? -eq 0 ]; then
  git add public/data/posts.json
  if git diff --staged --quiet; then
    echo "No changes to commit."
  else
    git commit -m "Update Reddit data $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    git push
    echo "Pushed updated data."
  fi
else
  echo "Fetch failed — will retry next run."
fi
