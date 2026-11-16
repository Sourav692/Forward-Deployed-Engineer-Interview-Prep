"""Build, validate, browser-check and aggregate one casebook.

Usage, from the site repository root: python3 .claude/skills/casebook-content/scripts/finish_case.py SLUG

Reads 02_System_Design_Case_Studies/Casebook_Rewrites/SLUG/ and writes the offline bundle and check
reports to .casebook-build/SLUG/ (git-ignored). The visual review is a human record, so it lives beside
the case as SLUG/visual-review.json and is written by the reviewer after inspecting the screenshots.
Exits 1 on any failure. Set PUPPETEER_MODULE to an installed puppeteer-core module.
"""
import json
import os
import re
import subprocess
import sys
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parent
BASE = Path("02_System_Design_Case_Studies/Casebook_Rewrites")
PYTHON = ["uv", "run", "-q", "--no-project", "--with", "beautifulsoup4", "--with", "markdown-it-py", "python"]


def run(command):
    result = subprocess.run(command, capture_output=True, text=True)
    print(result.stdout[-3000:], result.stderr[-3000:])
    return result.returncode == 0


def passed(path):
    return path.exists() and json.loads(path.read_text()).get("passed") is True


def main():
    slug = sys.argv[1]
    source = BASE / slug
    case, out = source / "case.json", Path(".casebook-build") / slug
    ok = run(PYTHON + [str(SCRIPTS / "casebook.py"), "build", str(case), "--out", str(out)])
    ok = run(PYTHON + [str(SCRIPTS / "casebook.py"), "validate", str(case), "--bundle", str(out)]) and ok
    ok = run(["node", str(SCRIPTS / "check_browser.cjs"), str(out / "index.html"), "--out", str(out / "browser-check.json")]) and ok

    meta = json.loads(case.read_text())
    html = (out / "index.html").read_text()
    ids = set(re.findall(r'\sid="([^"]+)"', html))
    missing = {key: value for key, value in meta.get("aliases", {}).items() if value not in ids}
    alias = {"passed": not missing, "checked": len(meta.get("aliases", {})), "missing": missing,
             "figures": html.count('class="source-diagram"')}
    (out / "alias-check.json").write_text(json.dumps(alias, indent=2))

    visual = source / "visual-review.json"
    report = {
        "passed": ok and alias["passed"] and passed(out / "content-check.json") and passed(out / "browser-check.json") and passed(visual),
        "mode": meta.get("mode"),
        "source_sections": len(json.loads((source / "source.json").read_text()).get("sections", [])),
        "coverage_rows": len(meta.get("coverage", [])),
        "worked_answers": len(re.findall(r'<details[^>]*class="answer-reveal ', html)),
        "reports": {"structure": "content-check.json", "browser": "browser-check.json", "aliases": "alias-check.json", "visual": "visual-review.json"},
        "editorial": meta.get("editorial_review"),
    }
    (out / "validation.json").write_text(json.dumps(report, indent=1))
    print(json.dumps({key: report[key] for key in ("passed", "source_sections", "coverage_rows", "worked_answers")}),
          "aliases_missing:", missing, "visual_review:", visual.exists())
    sys.exit(0 if report["passed"] else 1)


if __name__ == "__main__":
    main()
