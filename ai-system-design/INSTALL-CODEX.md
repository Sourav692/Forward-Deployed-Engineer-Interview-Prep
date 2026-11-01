# Codex installation

1. Copy the entire folder `install/codex/.agents/skills/architecture-driven-staff-ai-system-design` into `<your-project>/.agents/skills/`.
2. Start Codex in `<your-project>`.
3. Ask: `Use the architecture-driven-staff-ai-system-design skill. Initialize the workspace, then create Stage 1 only.`
4. If skill discovery is unavailable, explicitly point Codex to `.agents/skills/architecture-driven-staff-ai-system-design/SKILL.md`.
5. Run `python .agents/skills/architecture-driven-staff-ai-system-design/scripts/test_package.py`.

This package uses standard YAML front matter and relative reference paths. It does not require proprietary commands or external libraries.
