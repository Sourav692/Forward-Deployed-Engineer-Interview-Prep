# Claude Code installation

1. Copy the entire folder `install/claude-code/.claude/skills/architecture-driven-staff-ai-system-design` into `<your-project>/.claude/skills/`.
2. Start Claude Code from `<your-project>`.
3. Ask: `Use the architecture-driven-staff-ai-system-design skill. Initialize the workspace, then create Stage 1 only.`
4. If not discovered, explicitly ask it to read `.claude/skills/architecture-driven-staff-ai-system-design/SKILL.md`.
5. Run `python .claude/skills/architecture-driven-staff-ai-system-design/scripts/test_package.py`.

Keep all references, templates and scripts in the skill folder. The sample HTML file is offline-capable.
