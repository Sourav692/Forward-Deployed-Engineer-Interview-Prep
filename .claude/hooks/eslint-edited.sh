#!/usr/bin/env bash
# PostToolUse Write|Edit: lint the edited site/ source file; report errors back to Claude.
f=$(jq -r '.tool_response.filePath // .tool_input.file_path // empty')
case "$f" in
  */site/content/*|*/site/node_modules/*|*/site/.next/*) exit 0 ;;
  */site/*.ts|*/site/*.tsx|*/site/*.mjs) ;;
  *) exit 0 ;;
esac
site="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel)}/site"
out=$(cd "$site" && ./node_modules/.bin/eslint --no-warn-ignored "$f" 2>&1) && exit 0
echo "ESLint errors in $f:" >&2
echo "$out" >&2
exit 2
