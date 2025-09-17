#!/bin/bash
set -euo pipefail

CHANGED=$(git diff --name-only origin/main...HEAD -- '*.ts' '*.tsx' || true)
if [ -n "$CHANGED" ]; then 
  echo "Linting changed files: $CHANGED"
  npx eslint $CHANGED --max-warnings=0
else
  echo "No TypeScript files changed"
fi

# Non-blocking baseline for visibility:
echo "Running full lint check (non-blocking)..."
npx eslint . --ext .ts,.tsx || true
