#!/usr/bin/env bash
# Vercel Ignore Build Step
# Exit 0 => skip build (no impactful change) | Exit 1 => build
set -uo pipefail
SHA="${VERCEL_GIT_COMMIT_SHA:-HEAD}"
BASE="$(git rev-parse --verify "${SHA}^" 2>/dev/null || true)"
if [ -z "$BASE" ]; then
  echo "vercel-ignore: no parent commit, building."
  exit 1
fi
CHANGED="$(git diff --name-only "$BASE" "$SHA" || true)"
if [ -z "$CHANGED" ]; then
  echo "vercel-ignore: no changes, skipping."
  exit 0
fi

# Returns 0 (skip) if the file cannot affect the deployed site.
ignore_file() {
  case "$1" in
    .github/*|\
    .github/*/*|\
    .gitignore|.gitmodules|.editorconfig|.prettierrc*|.prettierignore|\
    .eslintrc*|.codespell*|.vale*|.mdl*|\
    README*|CONTRIBUTING*|CODE_OF_CONDUCT*|SECURITY*|LICENSE*|CHANGELOG*|\
    scripts/*.md|scripts/*.sh|tests/*|vitest.config*|*.md)
      return 0 ;;
    *) return 1 ;;
  esac
}

for f in $CHANGED; do
  if ! ignore_file "$f"; then
    echo "vercel-ignore: impactful change -> build: $f"
    exit 1
  fi
done

echo "vercel-ignore: only non-impacting files changed -> skip deployment."
exit 0
