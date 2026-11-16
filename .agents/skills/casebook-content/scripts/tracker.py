"""Maintain the project casebook rewrite tracker and its generated Markdown view."""

from __future__ import annotations

import argparse
from collections import Counter
from copy import deepcopy
from datetime import datetime, timezone
import json
import os
from pathlib import Path


SECTIONS = ["case-brief", "walkthrough", "deep-dives", "practice", "quick-review"]
CHECKS = ["source_coverage", "editorial_review", "structural_validation", "browser_validation", "visual_review"]
STAGES = ["Not started", "In progress", "Review draft", "Complete", "Blocked"]
SECTION_STATES = ["pending", "in_progress", "complete"]
CHECK_STATES = ["pending", "partial", "passed", "failed"]
LIVE_STATES = ["pending", "deployed", "passed", "failed"]


def live_default():
    return {"status": "pending", "url": "", "deployment": "", "checked_at": None, "evidence": "", "report": ""}


def now():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


BASE = Path("02_System_Design_Case_Studies/Casebook_Rewrites")
RECORD, VIEW = BASE / "rewrite-tracker.json", BASE / "TRACKER.md"


def rel(target):
    """Link a repository-relative path from the tracker view, which sits in BASE."""
    return target if "://" in str(target) else os.path.relpath(target, BASE)


def project_root():
    cwd = Path.cwd()
    return next((path for path in [cwd, *cwd.parents] if (path / ".git").exists()), cwd)


def assignments(values, allowed=None):
    result = {}
    for value in values:
        if "=" not in value:
            raise ValueError(f"Use name=value: {value}")
        key, state = value.split("=", 1)
        if allowed is not None and key not in allowed:
            raise ValueError(f"Unknown field: {key}")
        result[key] = state
    return result


def validate(record, root):
    slugs = [case["slug"] for case in record["cases"]]
    if len(slugs) != len(set(slugs)):
        raise ValueError("Tracker contains duplicate case slugs")
    for case in record["cases"]:
        if case["stage"] not in STAGES:
            raise ValueError(f"Unknown stage for {case['slug']}")
        if set(case["sections"]) != set(SECTIONS) or set(case["checks"]) != set(CHECKS):
            raise ValueError(f"Incomplete section or check inventory for {case['slug']}")
        if any(value not in SECTION_STATES for value in case["sections"].values()):
            raise ValueError(f"Invalid section state for {case['slug']}")
        if any(value["status"] not in CHECK_STATES for value in case["checks"].values()):
            raise ValueError(f"Invalid check state for {case['slug']}")
        live = case.get("live", live_default())
        if live["status"] not in LIVE_STATES:
            raise ValueError(f"Invalid live state for {case['slug']}")
        if live["status"] in {"deployed", "passed"} and (not live.get("url", "").startswith("https://") or not live.get("deployment")):
            raise ValueError("Published cases require an HTTPS URL and deployment reference")
        if live["status"] == "passed":
            if case["stage"] != "Complete" or not live.get("evidence") or not live.get("checked_at"):
                raise ValueError("Live verification requires a completed rewrite and check evidence")
            report_path = root / live.get("report", "")
            if not report_path.is_file():
                raise ValueError("Live verification requires an existing JSON report")
            report = json.loads(report_path.read_text())
            if report.get("passed") is not True or report.get("url") != live["url"] or report.get("deployment") != live["deployment"]:
                raise ValueError("Live report must pass and match the URL and deployment")
        if case["stage"] == "Complete":
            gaps = []
            if case["mode"] != "teach":
                gaps.append("a faithful migration is not a completed teaching rewrite")
            gaps.extend(f"section {name}" for name, state in case["sections"].items() if state != "complete")
            gaps.extend(f"check {name}" for name, value in case["checks"].items() if value["status"] != "passed" or not value.get("evidence"))
            for name in ["markdown", "html", "coverage", "validation"]:
                value = case["artifacts"].get(name)
                if not value or not (root / value).is_file():
                    gaps.append(f"existing {name} artifact")
            if gaps:
                raise ValueError(f"Cannot mark {case['slug']} Complete: " + "; ".join(gaps))


def escape(value):
    return str(value).replace("|", "\\|").replace("\n", " ")


def render(record, root):
    counts = Counter(case["stage"] for case in record["cases"])
    total = len(record["cases"])
    lines = ["# Casebook rewrite tracker", "",
             "Tracks the complete teaching rewrite of the 33 casebooks in the approved five-section format and the course-content explanation style.", "",
             f"**Rewrites complete: {counts['Complete']} / {total}.** " + "; ".join(f"{stage}: {counts[stage]}" for stage in STAGES) + ".", "",
             "A completed format migration does not count as a completed prose rewrite. Live checking is tracked separately: pending, deployed, passed or failed. A live pass requires a completed rewrite, deployment reference, published URL and a matching successful check report.", "",
             "## Completion criteria", "",
             "Mark a case Complete only after all five sections have been rewritten, source coverage and editorial review pass, structural/browser/visual checks pass, and the Markdown, HTML, coverage, and validation artifacts exist. Source figures, tables, examples, caveats, and worked answers must remain accounted for.", "",
             "The section count records rewritten sections. It does not count sections that were only moved into the new layout. Check results describe the linked artifact and do not certify an unfinished rewrite.", "",
             "## Update the tracker", "",
             "The JSON record at [rewrite-tracker.json](rewrite-tracker.json) is authoritative. This Markdown view is generated by the project skill's tracker script. Update the record through that script rather than editing the table.", "",
             "```sh",
             'python3 .claude/skills/casebook-content/scripts/tracker.py --set enterprise-knowledge-assistant "In progress" --mode teach --section walkthrough=in_progress --note "Started the walkthrough prose rewrite."',
             'python3 .claude/skills/casebook-content/scripts/tracker.py --summary',
             "```", "",
             "Stages: Not started, In progress, Review draft, Complete, Blocked. Sections: pending, in_progress, complete. Checks: pending, partial, passed, failed.", "",
             "Use `--check name=state --evidence 'actual comparison or report path'` for review results and `--artifact name=path` for outputs. The script rejects premature completion. The [tracker instructions](../../.claude/skills/casebook-content/references/tracker.md) document all fields.", "",
             "## Cases", ""]
    themes = list(dict.fromkeys(case["theme"] for case in record["cases"]))
    number = {case["slug"]: index + 1 for index, case in enumerate(record["cases"])}
    for theme in themes:
        lines.extend([f"### {theme}", "", "| # | Case | Stage | Sections | Source coverage | Editorial | UI checks | Live check | Updated | Notes and artifacts |", "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |"])
        for case in [case for case in record["cases"] if case["theme"] == theme]:
            checks = case["checks"]
            passed = sum(checks[name]["status"] == "passed" for name in ["structural_validation", "browser_validation", "visual_review"])
            live = case.get("live", live_default())
            live_label = f"[{live['status']}]({live['url']})" if live.get("url") else live["status"]
            notes = escape(case.get("note", "")) or "Not started."
            for name, target in case["artifacts"].items():
                notes += f" [{escape(name)}]({rel(target)})"
            lines.append(f"| {number[case['slug']]} | [{escape(case['title'])}]({case['source_url']}) | {case['stage']} | {sum(state == 'complete' for state in case['sections'].values())} / 5 | {checks['source_coverage']['status']} | {checks['editorial_review']['status']} | {passed} / 3 | {live_label} | {case.get('updated') or 'Not started'} | {notes} |")
        lines.append("")
    lines.extend(["## Current work", ""])
    for case in record["cases"]:
        if case["stage"] == "Not started":
            continue
        lines.extend([f"### {case['title']}", "", f"Stage: {case['stage']}. Content mode: {case['mode']}. Live check: {case.get('live', live_default())['status']}.", "",
                      "| Section | Rewrite state |", "| --- | --- |"])
        for name, state in case["sections"].items():
            lines.append(f"| {name} | {state} |")
        lines.extend(["", "| Check | State | Evidence |", "| --- | --- | --- |"])
        for name, check in case["checks"].items():
            lines.append(f"| {name} | {check['status']} | {escape(check.get('evidence', '')) or 'Pending.'} |")
        lines.extend(["", f"Next: {escape(case.get('next_action') or 'Finish the pending rewrite and checks.')}", ""])
    lines.extend(["## Change log", "", "| Time (UTC) | Case | Change |", "| --- | --- | --- |"])
    for event in reversed(record.get("history", [])):
        lines.append(f"| {event['at']} | {escape(event['slug'])} | {escape(event['change'])} |")
    (root / VIEW).write_text("\n".join(lines) + "\n")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path)
    parser.add_argument("--init", type=Path, help="Initialise from a captured catalog JSON")
    parser.add_argument("--set", nargs=2, metavar=("SLUG", "STAGE"))
    parser.add_argument("--mode", choices=["teach", "faithful"])
    parser.add_argument("--section", action="append", default=[])
    parser.add_argument("--check", action="append", default=[])
    parser.add_argument("--artifact", action="append", default=[])
    parser.add_argument("--evidence")
    parser.add_argument("--note")
    parser.add_argument("--next")
    parser.add_argument("--live-status", choices=LIVE_STATES)
    parser.add_argument("--live-url")
    parser.add_argument("--deployment")
    parser.add_argument("--live-report")
    parser.add_argument("--summary", action="store_true")
    parser.add_argument("--render", action="store_true")
    args = parser.parse_args()
    root = (args.root or project_root()).resolve()
    path = root / RECORD
    if args.init:
        if path.exists():
            raise ValueError("Tracker already exists; initialisation will not overwrite it")
        catalog = json.loads(args.init.read_text())
        record = {"version": 1, "catalog_url": catalog["source_url"], "catalog_captured_at": catalog["retrieved_at"],
                  "updated_at": now(), "cases": [], "history": []}
        for item in catalog["cases"]:
            record["cases"].append({"slug": item["slug"], "title": item["title"], "theme": item["theme"],
                                    "source_url": item["url"], "worksheet_url": item.get("worksheet_url"),
                                    "stage": "Not started", "mode": "teach", "sections": dict.fromkeys(SECTIONS, "pending"),
                                    "checks": {key: {"status": "pending", "evidence": ""} for key in CHECKS},
                                    "artifacts": {}, "updated": None, "note": "", "next_action": ""})
        record["history"].append({"at": now(), "slug": "catalog", "change": f"Initialised {len(record['cases'])} cases from the captured source catalog."})
    else:
        record = json.loads(path.read_text())
    record["version"] = 2
    for item in record["cases"]:
        item.setdefault("live", live_default())
    original = deepcopy(record)
    if args.set:
        name, stage = args.set
        matches = [case for case in record["cases"] if case["slug"] == name]
        if len(matches) != 1:
            raise ValueError(f"Unknown case: {name}")
        case = matches[0]
        case["stage"] = stage
        if args.mode:
            case["mode"] = args.mode
        for section, state in assignments(args.section, SECTIONS).items():
            case["sections"][section] = state
        for check, state in assignments(args.check, CHECKS).items():
            if state == "passed" and not args.evidence:
                raise ValueError("A passed check requires --evidence")
            case["checks"][check] = {"status": state, "evidence": args.evidence or ""}
        if any([args.live_status, args.live_url, args.deployment, args.live_report]):
            live = case["live"]
            if args.live_status in {"passed", "failed"} and not args.evidence:
                raise ValueError("A live check result requires fresh --evidence")
            changed_publication = (args.live_url is not None and args.live_url != live.get("url")) or (args.deployment is not None and args.deployment != live.get("deployment"))
            if changed_publication or args.live_status == "deployed":
                live.update(status="deployed", checked_at=None, evidence="", report="")
            for key, value in [("status", args.live_status), ("url", args.live_url), ("deployment", args.deployment), ("report", args.live_report)]:
                if value is not None:
                    live[key] = value
            if args.evidence:
                live["evidence"] = args.evidence
            if args.live_status in {"passed", "failed"}:
                live["checked_at"] = now()
            elif args.live_status:
                live["checked_at"] = None
            if args.live_report:
                case["artifacts"]["live_check"] = args.live_report
        case["artifacts"].update(assignments(args.artifact))
        if args.note is not None:
            case["note"] = args.note
        if args.next is not None:
            case["next_action"] = args.next
        case["updated"] = now()[:10]
        record["updated_at"] = now()
        record["history"].append({"at": now(), "slug": name, "change": f"Set {stage}. " + (args.note or "Updated section/check states or artifacts.")})
    elif any([args.mode, args.section, args.check, args.artifact, args.evidence, args.note, args.next, args.live_status, args.live_url, args.deployment, args.live_report]):
        raise ValueError("Row changes require --set SLUG STAGE")
    validate(record, root)
    if args.init or args.set or args.render:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(record, indent=2, ensure_ascii=False) + "\n")
        render(record, root)
    if args.summary or not any([args.init, args.set, args.render]):
        counts = Counter(case["stage"] for case in record["cases"])
        print(json.dumps({"cases": len(record["cases"]), "complete": counts["Complete"], "live_verified": sum(c.get("live", {}).get("status") == "passed" for c in record["cases"]), "stages": {key: counts[key] for key in STAGES}}, indent=2))
    else:
        print(f"Updated {path} and {root / VIEW}")


if __name__ == "__main__":
    main()
