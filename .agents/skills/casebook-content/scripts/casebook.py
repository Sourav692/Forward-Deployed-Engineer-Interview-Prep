"""Capture, render, and validate complete five-section casebooks."""

from __future__ import annotations

import argparse
from copy import deepcopy
from datetime import datetime, timezone
from hashlib import sha256
import html
import io
import json
from pathlib import Path
import re
import shutil
import subprocess
from contextlib import redirect_stdout
from urllib.parse import urljoin, urlparse
from urllib.request import urlopen

from bs4 import BeautifulSoup, Comment
from markdown_it import MarkdownIt


SKILL = Path(__file__).resolve().parents[1]
PANELS = [("case-brief", "Case brief"), ("walkthrough", "Design walkthrough"),
          ("deep-dives", "Technical deep dives"), ("practice", "Practice"), ("quick-review", "Quick review")]
INTRO = {
    "case-brief": "Understand the scenario, task, and constraints.",
    "walkthrough": "Follow the reasoning from discovery to delivery.",
    "deep-dives": "Examine mechanisms, alternatives, and operational consequences.",
    "practice": "Attempt the case before revealing the worked reasoning.",
    "quick-review": "Recall the decisions, failure responses, and closing answer.",
}


def soup(text):
    return BeautifulSoup(text, "html.parser")


def text(tag):
    return re.sub(r"\s+", " ", tag.get_text()).strip()


def hash_bytes(data):
    return sha256(data).hexdigest()


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n")


def slug(value):
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def relative_file(root, name):
    path = (root / name).resolve()
    if not path.is_relative_to(root.resolve()):
        raise ValueError(f"Path leaves the case directory: {name}")
    return path


def catalog(args):
    page = soup(Path(args.html).read_text() if args.html else urlopen(args.url).read())
    main = page.select_one("main")
    if not main:
        raise ValueError("No catalog main element found")
    cases = {}
    for link in main.select('a[href]'):
        url = urljoin(args.url, link["href"])
        path = urlparse(url).path
        if not re.fullmatch(r"/design/[^/]+", path) or urlparse(url).netloc != urlparse(args.url).netloc:
            continue
        if url in cases:
            continue
        label = link.get_text(" ", strip=True)
        level = re.search(r"\b(Foundation|Core|Advanced)$", label)
        title = re.sub(r"\s+(Case Study\s+)?(Foundation|Core|Advanced)$", "", label)
        theme = link.find_previous("h3")
        parent = link.find_parent("li") or link.parent
        worksheet = parent.select_one('a[href^="/practice/"]')
        cases[url] = {"slug": path.rsplit("/", 1)[-1], "title": title, "url": url,
                      "theme": theme.get_text(" ", strip=True) if theme else "",
                      "level": level[1] if level else "",
                      "worksheet_url": urljoin(args.url, worksheet["href"]) if worksheet else None,
                      "status": "pending", "output": None, "checks": {}, "gap": None}
    if args.expect is not None and len(cases) != args.expect:
        raise ValueError(f"Catalog has {len(cases)} cases; expected {args.expect}. Review scope before proceeding.")
    result = {"source_url": args.url, "retrieved_at": datetime.now(timezone.utc).isoformat(), "cases": list(cases.values())}
    write_json(args.out, result)
    print(f"Captured {len(cases)} catalog cases in {args.out}")


def capture(args):
    raw = Path(args.html).read_bytes() if args.html else urlopen(args.url).read()
    page = soup(raw)
    if args.selector:
        region = page.select_one(args.selector)
    else:
        region = page.select_one("article.case-chapters") or page.select_one("article")
    if region is None:
        raise ValueError("No reliable article boundary found. Inspect the page and supply --selector.")
    sections = region.select("section[id]")
    # Avoid counting both a chapter and all its descendants as separate copies.
    sections = [section for section in sections if not any(parent in sections for parent in section.parents)]
    if not sections:
        chunks, current = [], None
        for node in region.children:
            if getattr(node, "name", None) == "h2":
                current = page.new_tag("section", id=slug(node.get_text()))
                chunks.append(current)
            if current is None:
                current = page.new_tag("section", id="source-introduction")
                chunks.append(current)
            current.append(deepcopy(node))
        sections = chunks
    destination = args.out.resolve()
    destination.mkdir(parents=True, exist_ok=True)
    records, assets, ids = [], {}, set()
    for index, original in enumerate(sections):
        id = original.get("id") or f"source-section-{index+1}"
        if id in ids:
            raise ValueError(f"Duplicate source ID: {id}")
        ids.add(id)
        clean = deepcopy(original)
        for comment in clean.find_all(string=lambda value: isinstance(value, Comment)):
            comment.extract()
        for element in clean.select("script, style, iframe, object, embed, form, button"):
            element.decompose()
        for element in [clean, *clean.find_all()]:
            old_classes = element.get("class", [])
            element.attrs = {key: value for key, value in element.attrs.items() if key in {
                "id", "href", "src", "alt", "title", "width", "height", "role", "tabindex", "aria-label", "colspan", "rowspan", "scope"}}
            if element.name in {"h2", "h3"}:
                element.name = "h4" if element.name == "h2" else "h5"
                element["class"] = ["source-title"] if element.name == "h4" else []
            if element.name == "a" and element.get("href"):
                href = element["href"]
                if href.startswith(("javascript:", "data:")):
                    del element["href"]
                elif not href.startswith("#"):
                    element["href"] = urljoin(args.url, href)
            if element.name == "img" and element.get("src"):
                source_url = urljoin(args.url, element["src"])
                if source_url not in assets:
                    data = urlopen(source_url).read()
                    suffix = Path(urlparse(source_url).path).suffix.lower()
                    if suffix not in {".svg", ".png", ".jpg", ".jpeg", ".webp", ".gif"}:
                        raise ValueError(f"Unsupported image format: {source_url}")
                    if suffix == ".svg" and re.search(rb"<script\b|\bonload\s*=|javascript:", data, re.I):
                        raise ValueError(f"Executable SVG rejected: {source_url}")
                    path = "source-assets/" + hash_bytes(data)[:16] + suffix
                    relative_file(destination, path).parent.mkdir(parents=True, exist_ok=True)
                    relative_file(destination, path).write_bytes(data)
                    assets[source_url] = {"path": path, "sha256": hash_bytes(data), "source_url": source_url}
                element["src"] = assets[source_url]["path"]
                element["loading"] = "lazy"
                element["class"] = ["diagram-dark"] if "diagram-dark" in old_classes else ["diagram-light"]
            if "table-wrap" in old_classes:
                element["class"] = ["source-table-wrap"]
            if "mermaid-figure" in old_classes:
                element["class"] = ["source-diagram"]
        clean["id"] = id
        clean["data-source-id"] = id
        clean["class"] = ["source-content"]
        title = original.find(re.compile("^h[1-6]$"))
        records.append({"id": id, "title": title.get_text(" ", strip=True) if title else "Introduction",
                        "text": text(clean), "text_sha256": hash_bytes(text(clean).encode()), "html": str(clean),
                        "tables": len(clean.select("table")), "code_blocks": [tag.get_text() for tag in clean.select("pre")],
                        "glossary": [{"term": tag.get_text(), "definition": tag.get("title", "")} for tag in clean.select("abbr")],
                        "assets": [tag["src"] for tag in clean.select("img[src]")]})
    title = page.find("h1")
    result = {"source_url": args.url, "retrieved_at": datetime.now(timezone.utc).isoformat(),
              "source_html_sha256": hash_bytes(raw), "title": title.get_text(" ", strip=True) if title else "",
              "selector": args.selector or "article", "sections": records, "assets": list(assets.values())}
    write_json(destination / "source.json", result)
    print(f"Captured {len(records)} sections and {len(assets)} image assets in {destination}")


def render_markdown(markdown):
    md = MarkdownIt("commonmark", {"html": True}).enable("table")
    tokens = md.parse(markdown)
    seen = set()
    for index, token in enumerate(tokens):
        if token.type != "heading_open":
            continue
        content = tokens[index + 1]
        match = re.search(r"\s*\{#([a-zA-Z][\w-]*)\}\s*$", content.content)
        id = match[1] if match else slug(content.content)
        if id in seen:
            raise ValueError(f"Duplicate Markdown heading anchor: {id}. Assign an explicit {{#anchor}}.")
        seen.add(id)
        if match:
            content.content = content.content[:match.start()]
            content.children = md.parseInline(content.content)[0].children
        token.attrSet("id", id)
    return soup(md.renderer.render(tokens, md.options, {}))


def make_practice(config):
    prompts = config.get("practice_prompts") or [
        {"id": "discovery", "label": "Discovery and requirements"},
        {"id": "reasoning", "label": "Design and reasoning"},
        {"id": "decisions", "label": "Decisions and alternatives"},
        {"id": "validation", "label": "Validation and delivery"},
    ]
    rubric = config.get("rubric", [])
    body = ['<section class="reading-section" id="practice-answer"><h3>Work through your answer</h3>',
            '<p id="save-help">This local worksheet is a prototype addition. Notes save in this browser. Nothing is submitted or scored.</p><form id="practice-form">']
    for item in prompts:
        id, label = html.escape(item["id"], quote=True), html.escape(item["label"])
        if not re.fullmatch(r"[a-z][a-z0-9-]*", item["id"]):
            raise ValueError("Practice field IDs must be lowercase slugs")
        body.append(f'<label for="answer-{id}">{label}<span>{html.escape(item.get("hint", ""))}</span></label><textarea id="answer-{id}" name="{id}" data-note="{id}" data-note-label="{label}" rows="4"></textarea>')
    body.extend(['<div class="form-actions"><button class="btn primary" id="mark-attempted" type="submit">Mark practice as attempted</button><button class="btn secondary" id="export-notes" type="button">Export notes</button></div>',
                 '<p class="form-status" id="notes-status" role="status">No notes yet.</p></form></section>',
                 '<section class="reading-section" id="practice-rubric"><h3>Check your reasoning</h3><details class="answer-reveal"><summary>Reveal the self-assessment rubric</summary><div class="detail-body"><p>This checklist is an authored addition. Assess what you can explain without reopening the walkthrough.</p><div class="rubric-list">'])
    for index, label in enumerate(rubric):
        body.append(f'<label><input name="rubric" type="checkbox" value="check-{index+1}">{html.escape(label)}</label>')
    body.append(f'</div><p id="rubric-status" aria-live="polite">0 of {len(rubric)} reasoning checks covered.</p></div></details></section>')
    return soup("\n".join(body))


def build(args):
    config_path = args.case.resolve()
    root, config = config_path.parent, json.loads(config_path.read_text())
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", config["slug"]):
        raise ValueError("Case slug must use lowercase letters, digits, and hyphens")
    markdown_path = relative_file(root, config.get("markdown", "casebook.md"))
    article = render_markdown(markdown_path.read_text())
    if article.select('pre code.language-mermaid'):
        raise ValueError("Render Mermaid to a local SVG and reference that asset before building. Do not ship a code fence instead of a diagram.")
    sections, active = {id: [] for id, _ in PANELS}, None
    for node in list(article.children):
        if getattr(node, "name", None) == "h2":
            label = node.get_text(" ", strip=True)
            found = next((id for id, title in PANELS if title == label), None)
            if found is None or sections[found]:
                raise ValueError(f"Unexpected or repeated primary heading: {label}")
            active = found
            continue
        if active is None:
            if str(node).strip():
                raise ValueError("Start Markdown with ## Case brief; metadata supplies the page title")
        else:
            sections[active].append(node)
    if any(not soup(''.join(str(node) for node in nodes)).get_text(strip=True) for nodes in sections.values()):
        raise ValueError("All five primary sections need substantive authored content")
    template = (SKILL / "assets/reader/shell.html").read_text()
    values = {"TITLE": config["title"], "SLUG": config["slug"], "SUBTITLE": config["subtitle"],
              "THEME": config.get("theme", "Worked system design"), "LEVEL": config.get("level", "Case study"),
              "AUTHOR": config.get("author", "Forward Deployed"), "UPDATED": config.get("updated", ""), "KIND": config.get("kind", "System design"),
              "SOURCE_URL": config["source_url"]}
    for key, value in values.items():
        template = template.replace("@@" + key + "@@", html.escape(str(value), quote=True))
    for id, _ in PANELS:
        fragment = soup("")
        current = None
        for node in sections[id]:
            if getattr(node, "name", None) == "h3":
                current = fragment.new_tag("section", id=node.get("id"))
                current["class"] = ["reading-section"]
                del node["id"]
                current.append(node)
                fragment.append(current)
            elif getattr(node, "name", None) in {"section", "details"} and node.get("id") and (
                    "reading-section" in node.get("class", []) or "deep-topic" in node.get("class", [])
                    or (node.name == "details" and "source-chapter" not in node.get("class", []))):
                current = None
                if "deep-topic" not in node.get("class", []):
                    node["class"] = list(dict.fromkeys([*node.get("class", []), "reading-section"]))
                fragment.append(node)
            elif current is not None:
                current.append(node)
            else:
                fragment.append(node)
        if id == "deep-dives":
            for group in fragment.select(":scope > section.reading-section"):
                if group["id"] in {"references", "source-references"}:
                    continue
                heading = group.find("h3", recursive=False)
                if heading:
                    group.name = "details"
                    group["class"] = ["deep-topic"]
                    summary = fragment.new_tag("summary")
                    label = fragment.new_tag("span")
                    label.string = heading.get_text()
                    summary.append(label)
                    heading.replace_with(summary)
        template = template.replace("@@BODY-" + id + "@@", str(fragment))
        template = template.replace("@@INTRO-" + id + "@@", html.escape(config.get("intros", {}).get(id, INTRO[id])))
    page = soup(template)
    if page.select_one("#practice-form") is None:
        prompt = page.select_one("#practice > .reading-section")
        if prompt is not None:
            prompt.insert_after(make_practice(config))
        else:
            page.select_one("#practice > .section-end").insert_before(make_practice(config))
    for field in page.select("#practice-form textarea"):
        field["data-note"] = field["name"]
        label = page.find("label", attrs={"for": field["id"]})
        field["data-note-label"] = label.find(string=True).strip() if label else field["name"]
    worked_answers = [item for item in page.select("#practice details.answer-reveal, #practice details.source-answer, #practice details[data-worked-answer]")
                      if item.find_parent(id="practice-rubric") is None]
    for index, answer in enumerate(worked_answers):
        answer["id"] = answer.get("id") or f"practice-worked-answer-{index+1}"
        answer["data-worked-answer"] = "true"
    for a in page.select('#case-brief > section[id], #case-brief > details[id]'):
        heading = a.select_one("h3, summary")
        if heading:
            link = page.new_tag("a", href="#" + a["id"])
            link.string = heading.get_text(" ", strip=True)
            page.select_one("#section-contents").append(link)
    settings = page.new_tag("script", id="case-config", type="application/json")
    settings.string = json.dumps({**{key: config.get(key, {}) if key == "aliases" else config[key] for key in ["slug", "title", "source_url", "aliases"]},
                                  "answer_reveals": [answer["id"] for answer in worked_answers]}).replace("<", "\\u003c")
    page.head.append(settings)
    if page.select('script:not([src]):not([type="application/json"])'):
        raise ValueError("Content scripts must be supplied as explicit authored custom_scripts, not copied from a source")
    out = args.out.resolve()
    out.mkdir(parents=True, exist_ok=True)
    for file in (SKILL / "assets/reader").iterdir():
        if file.name == "shell.html":
            continue
        if file.is_dir():
            shutil.copytree(file, out / file.name, dirs_exist_ok=True)
        else:
            shutil.copy2(file, out / file.name)
    if config.get("mode") == "faithful":
        style = out / "styles.css"
        lines = style.read_text().splitlines()
        lines.insert(2, "/* Hallmark · copy: verbatim · original case passages are preserved in faithful migration mode */")
        lines.insert(3, "/* Hallmark · answered F1 · Original punctuation is retained in faithfully imported source passages. */")
        style.write_text("\n".join(lines) + "\n")
    references = {img["src"] for img in page.select("img[src]") if not img["src"].startswith("data:")}
    for path in references:
        if urlparse(path).scheme:
            raise ValueError(f"Bundle the image locally before building: {path}")
        source = relative_file(root, path)
        destination = relative_file(out, path)
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)
    for path in config.get("custom_scripts", []):
        source = relative_file(root, path)
        destination = relative_file(out, path)
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)
        script = page.new_tag("script", src=path, defer="")
        page.head.append(script)
    shutil.copy2(markdown_path, out / "casebook.md")
    bundled_config = deepcopy(config)
    bundled_config["markdown"] = "casebook.md"
    if config.get("source_inventory"):
        bundled_config["source_inventory"] = "source.json"
    write_json(out / "case.json", bundled_config)
    if config.get("source_inventory"):
        shutil.copy2(relative_file(root, config["source_inventory"]), out / "source.json")
    (out / "index.html").write_text(str(page) + "\n")
    print(f"Built {out / 'index.html'}")


def validate(args):
    path = args.case.resolve()
    config, root = json.loads(path.read_text()), path.parent
    bundle = args.bundle.resolve()
    page = soup((bundle / "index.html").read_text())
    errors = []
    def require(condition, message):
        if not condition:
            errors.append(message)
    ids = [tag["id"] for tag in page.select("[id]")]
    require(len(ids) == len(set(ids)), "Duplicate document IDs")
    require([tag.get("id") for tag in page.select("main > .panel")] == [id for id, _ in PANELS], "Five-section order changed")
    require(config.get("mode") in {"teach", "faithful"}, "Specify mode: teach or faithful")
    inventory = json.loads(relative_file(root, config["source_inventory"]).read_text()) if config.get("source_inventory") else {"sections": [], "assets": []}
    rows = config.get("coverage", [])
    for source in inventory["sections"]:
        mapped = [row for row in rows if row.get("source_id") == source["id"]]
        require(bool(mapped), f"Unmapped source section: {source['id']}")
        for row in mapped:
            require(row.get("status") in {"preserved", "expanded", "consolidated"}, f"Unauthorised omission or unresolved status: {source['id']}")
            require(bool(row.get("anchors")), f"Missing output destination: {source['id']}")
            for anchor in row.get("anchors", []):
                require(anchor in ids, f"Missing coverage anchor: {anchor}")
            if config.get("mode") == "teach":
                require(row.get("review", {}).get("status") == "reviewed" and len(row.get("review", {}).get("evidence", "").strip()) >= 30,
                        f"Source comparison not recorded: {source['id']}")
        if config.get("mode") == "faithful":
            matches = page.select(f'[data-source-id="{source["id"]}"]')
            require(len(matches) == 1, f"Missing or duplicated verbatim passage: {source['id']}")
            if len(matches) == 1:
                require(hash_bytes(text(matches[0]).encode()) == source["text_sha256"], f"Source text changed: {source['id']}")
                require([code.get_text() for code in matches[0].select("pre")] == source["code_blocks"], f"Source code changed: {source['id']}")
                require(len(matches[0].select("table")) == source["tables"], f"Source table lost: {source['id']}")
                require([{"term": term.get_text(), "definition": term.get("title", "")} for term in matches[0].select("abbr")] == source["glossary"], f"Glossary definition changed: {source['id']}")
    if not inventory["sections"]:
        require(config.get("new_topic") is True and bool(config.get("sources")), "A source inventory or cited new_topic is required")
    require(config.get("editorial_review", {}).get("status") == "reviewed", "Editorial explanation review is not complete")
    for anchor in config.get("required_anchors", []):
        require(anchor in ids, f"Required teaching anchor missing: {anchor}")
    image_paths = [tag["src"] for tag in page.select("img[src]")]
    for asset in inventory["assets"]:
        require(asset["path"] in image_paths, f"Original diagram missing: {asset['path']}")
        file = relative_file(bundle, asset["path"])
        require(file.exists() and hash_bytes(file.read_bytes()) == asset["sha256"], f"Original image payload changed: {asset['path']}")
    for figure in config.get("required_figures", []):
        require(figure["id"] in ids, f"Required figure anchor missing: {figure['id']}")
        require(figure["path"] in image_paths, f"Required figure image missing: {figure['path']}")
        file = relative_file(bundle, figure["path"])
        require(file.exists() and hash_bytes(file.read_bytes()) == figure["sha256"], f"Required figure payload changed: {figure['path']}")
    aliases = {"intro", "main", "deep-dive", "cheat-sheet", "full-pack", *config.get("aliases", {})}
    for a in page.select('a[href^="#"]'):
        require(a["href"][1:] in ids or a["href"][1:] in aliases, f"Broken fragment: {a['href']}")
    for tag in page.select("img[src], script[src], link[rel=stylesheet][href]"):
        value = tag.get("src") or tag["href"]
        require(not urlparse(value).scheme or value.startswith("data:"), f"Network-dependent asset: {value}")
        if not urlparse(value).scheme:
            require(relative_file(bundle, value).is_file(), f"Missing local asset: {value}")
    require(bool(page.select("#practice-form textarea[data-note]")), "Practice note fields are missing")
    require(bool(page.select('input[name="rubric"]')), "Case-specific self-assessment rubric is missing")
    answers = page.select('#practice details[data-worked-answer]')
    require(bool(answers), "Practice needs a worked-answer reveal beyond the self-assessment rubric")
    for answer in answers:
        summary = answer.find("summary", recursive=False)
        require(summary is not None and len(text(answer)) > len(text(summary)), f"Empty worked answer: {answer.get('id')}")
    for id in config.get("required_answer_reveals", []):
        require(bool(page.select(f'#practice details[data-worked-answer][id="{id}"]')), f"Required worked-answer reveal missing: {id}")
    report = {"source_sections": len(inventory["sections"]), "coverage_rows": len(rows), "mode": config.get("mode"),
              "errors": errors, "passed": not errors,
              "limits": "Structural checks and recorded editorial evidence do not independently prove explanatory fidelity."}
    write_json(bundle / "content-check.json", report)
    print(json.dumps(report, indent=2))
    if errors:
        raise SystemExit(1)


def batch_build(args):
    record = json.loads(args.catalog.read_text())
    summary = {"pending": 0, "draft": 0, "validated": 0, "complete": 0, "blocked": 0}
    for case in record["cases"]:
        name = case["slug"]
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", name):
            raise ValueError(f"Invalid catalog slug: {name}")
        config = args.cases / name / "case.json"
        destination = args.out / name
        if not config.is_file():
            if case.get("status") != "blocked":
                case.update(status="pending", gap="Case content has not been authored.")
        else:
            case["checks"] = {}
            case["output"] = str(destination.resolve())
            try:
                with redirect_stdout(io.StringIO()):
                    build(argparse.Namespace(case=config, out=destination))
                    validate(argparse.Namespace(case=config, bundle=destination))
                case["checks"]["content"] = True
                case.update(status="validated", gap="Browser and visual review remain.")
                if args.browser:
                    result = subprocess.run(["node", str(SKILL / "scripts/check_browser.cjs"),
                                             str(destination / "index.html"), "--out", str(destination / "browser-check.json")],
                                            capture_output=True, text=True)
                    case["checks"]["browser"] = result.returncode == 0
                    case["status"] = "validated"
                    case["gap"] = "Inspect the rendered figures and record visual_review before marking complete."
                    if result.returncode:
                        case["gap"] = "Browser checks failed; inspect browser-check.json."
                    else:
                        authored = json.loads(config.read_text())
                        if authored.get("visual_review", {}).get("status") == "reviewed":
                            case.update(status="complete", gap=None)
            except (ValueError, OSError, KeyError, SystemExit) as error:
                case.update(status="draft", gap=str(error) or "Content validation failed; inspect content-check.json.")
        summary[case["status"]] += 1
        write_json(args.catalog, record)
    print(json.dumps({"cases": len(record["cases"]), "status": summary, "catalog": str(args.catalog)}, indent=2))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    p = commands.add_parser("catalog")
    p.add_argument("--url", default="https://forwarddeployedprep.com/design")
    p.add_argument("--html", type=Path)
    p.add_argument("--out", type=Path, required=True)
    p.add_argument("--expect", type=int)
    p.set_defaults(run=catalog)
    p = commands.add_parser("capture")
    p.add_argument("url")
    p.add_argument("--html", type=Path)
    p.add_argument("--selector")
    p.add_argument("--out", type=Path, required=True)
    p.set_defaults(run=capture)
    p = commands.add_parser("batch-build")
    p.add_argument("--catalog", type=Path, required=True)
    p.add_argument("--cases", type=Path, required=True)
    p.add_argument("--out", type=Path, required=True)
    p.add_argument("--browser", action="store_true")
    p.set_defaults(run=batch_build)
    for name in ["build", "validate"]:
        p = commands.add_parser(name)
        p.add_argument("case", type=Path)
        p.add_argument("--out" if name == "build" else "--bundle", type=Path, required=True)
        p.set_defaults(run=build if name == "build" else validate)
    args = parser.parse_args()
    args.run(args)


if __name__ == "__main__":
    main()
