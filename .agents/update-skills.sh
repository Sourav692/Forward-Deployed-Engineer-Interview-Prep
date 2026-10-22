#!/usr/bin/env bash
# Update the Codex skills in .agents/skills from skills-lock.json.
# Don't run `npx skills update` here: it auto-detects Claude Code and re-adds
# .claude/skills symlinks. Claude Code gets these skills from the sourav-skills plugin.
set -euo pipefail
cd "$(dirname "$0")/.."
python3 - <<'PY' | while read -r src args; do npx -y skills@latest add "$src" $args -a codex -y < /dev/null; done
import json
by_source = {}
for name, entry in json.load(open("skills-lock.json"))["skills"].items():
    by_source.setdefault(entry["source"], []).append(name)
for source, names in by_source.items():
    print(source, " ".join(f"-s {n}" for n in names))
PY
