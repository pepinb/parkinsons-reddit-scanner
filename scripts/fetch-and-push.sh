#!/bin/bash
export PATH="/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin:$PATH"
cd "$(dirname "$0")/.."

echo ""
echo "=== Fetch started: $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
node scripts/fetch-and-save.js

if [ $? -eq 0 ]; then
  git add public/data/posts.json
  if ! git diff --staged --quiet; then
    git commit -m "Update Reddit data $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    git push
    echo "=== Pushed updated data ==="
  else
    echo "=== No changes to push ==="
  fi
else
  echo "=== Fetch failed ==="
fi
echo "=== Fetch complete: $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
