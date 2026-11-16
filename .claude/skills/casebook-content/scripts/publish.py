"""Write the checked reader snapshot for each validated casebook.

Usage, from the site repository root, after finish_case.py passes:
    python3 .claude/skills/casebook-content/scripts/publish.py [--slug SLUG ...]

For each case (default: every Complete case in the tracker) it reads the bundle in .casebook-build/SLUG/
and writes reader.html and snapshot.json beside the case's casebook.md. Then run `npm run sync` in site/.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
from bs4 import BeautifulSoup

BASE = Path("02_System_Design_Case_Studies/Casebook_Rewrites")


def sha(value):
    return hashlib.sha256(value).hexdigest()


def legacy_aliases(config, tabs):
    """Map the old site's tab ids onto the five sections so old links keep working."""
    for tab in tabs:
        id = tab["id"]
        destination = ("case-brief" if id == "intro" else "deep-dives" if id.startswith("deep-dive")
                       else "quick-review" if id.startswith("cheat-sheet") else "walkthrough")
        config["aliases"].setdefault(id, destination)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--slug", action="append")
    args = parser.parse_args()
    tracker = json.loads((BASE / "rewrite-tracker.json").read_text())
    cases = [case["slug"] for case in tracker["cases"] if (case["slug"] in args.slug if args.slug else case["stage"] == "Complete")]
    manifest = json.loads(Path("site/content/manifest.json").read_text())
    tabs = {item["slug"]: item.get("tabs", []) for module in manifest["modules"] if module["id"] == "15-fde-case-studies"
            for track in module["tracks"] for item in track["scenarios"]}
    for slug in cases:
        source, bundle = BASE / slug, Path(".casebook-build") / slug
        raw = (source / "case.json").read_bytes()
        config = json.loads(raw)
        legacy_aliases(config, tabs.get(slug, []))
        config_bytes = (json.dumps(config, indent=2) + "\n").encode()
        if json.loads(config_bytes) != json.loads(raw):
            (source / "case.json").write_bytes(config_bytes)
            raise ValueError(f"Added legacy aliases to {slug}/case.json; run finish_case.py again")
        if config["mode"] != "teach" or config.get("editorial_review", {}).get("status") != "reviewed":
            raise ValueError(f"Unreviewed teaching draft: {slug}")
        for file in ["content-check.json", "browser-check.json", "validation.json"]:
            if json.loads((bundle / file).read_text()).get("passed") is not True:
                raise ValueError(f"Failed check: {slug}/{file}")
        markdown = (source / "casebook.md").read_bytes()
        if markdown != (bundle / "casebook.md").read_bytes():
            raise ValueError(f"Rebuild the stale reader: {slug}")
        page = BeautifulSoup((bundle / "index.html").read_text(), "html.parser")
        nav, layout = page.select_one(".section-nav"), page.select_one(".reading-layout")
        if not nav or not layout or len(layout.select(".panel")) != 5:
            raise ValueError(f"Invalid five-section reader: {slug}")
        main_element = layout.select_one("main")
        main_element.name = "div"
        main_element["class"] = ["casebook-body"]
        for tag in layout.select("[src], a[href]"):
            attribute = "src" if tag.has_attr("src") else "href"
            value = tag.get(attribute, "")
            if value.startswith("source-assets/"):
                tag[attribute] = f"/casebook-assets/{slug}/" + value.removeprefix("source-assets/")
        for image in layout.select("img.diagram-dark"):
            link = page.new_tag("a", href=image["src"], target="_blank", rel="noopener")
            link["class"] = ["diagram-dark-link"]
            image.wrap(link)
        # Only one theme's image is displayed, so the other link would have no accessible
        # name (axe link-name). Name every figure link from its own image.
        for image in layout.select(".source-diagram a > img"):
            label = image.get("alt", "").strip() or "figure"
            image.parent["aria-label"] = f"Open full size: {label}"
        fragment = str(nav) + "\n" + str(layout) + "\n"
        (source / "reader.html").write_text(fragment)
        (source / "snapshot.json").write_text(json.dumps({
            "mode": "teach", "validated": True,
            "markdown_sha256": sha(markdown), "html_sha256": sha(fragment.encode()), "config_sha256": sha(raw),
            "source_url": config["source_url"], "validation": json.loads((bundle / "validation.json").read_text()),
        }, indent=2) + "\n")
        print(f"Published {slug}")


if __name__ == "__main__":
    main()
