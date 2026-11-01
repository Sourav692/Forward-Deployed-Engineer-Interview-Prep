"""Check a distributed Stage 1 ZIP in a clean directory using Python stdlib.

Run from repository root:
python3 10_AI_System_Design/stages/01-mvp/labs/verify_package.py \
    10_AI_System_Design/dist/stage-01-mvp.zip
"""

import argparse
import json
import re
from html.parser import HTMLParser
from pathlib import Path
import subprocess
import sys
import tempfile
from urllib.parse import unquote, urlsplit
import zipfile


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.links = []

    def handle_starttag(self, tag, attributes):
        values = dict(attributes)
        if "id" in values:
            self.ids.append(values["id"])
        if tag == "a" and "href" in values:
            self.links.append(values["href"])


def verify(archive):
    with tempfile.TemporaryDirectory(prefix="stage1-package-") as directory:
        destination = Path(directory).resolve()
        with zipfile.ZipFile(archive) as package:
            assert package.testzip() is None, "Archive checksum error"
            for member in package.infolist():
                target = (destination / member.filename).resolve()
                assert target.is_relative_to(destination), "Path escapes extraction directory"
                assert not member.filename.endswith((".sqlite", ".pyc", ".zip"))
                assert "__pycache__" not in member.filename
            package.extractall(destination)

        workspace = destination / "10_AI_System_Design"
        stage = workspace / "stages/01-mvp"
        state = json.loads((stage / "stage-state.json").read_text())
        for artifact in state["artifacts"]:
            path = (stage / artifact).resolve()
            assert path.is_relative_to(destination) and path.is_file(), artifact

        links = Links()
        links.feed((stage / "guide.html").read_text())
        assert len(set(links.ids)) == len(links.ids), "Duplicate HTML IDs"
        for link in links.links:
            url = urlsplit(link)
            if url.scheme or url.netloc:
                continue
            if url.path:
                path = (stage / unquote(url.path)).resolve()
                assert path.is_relative_to(destination) and path.is_file(), link
            else:
                assert unquote(url.fragment) in links.ids, link

        # Inspect the whole package, including ADR/current-system references.
        for document in workspace.rglob("*.md"):
            for link in re.findall(r"\[[^\]]+\]\(([^)]+)\)", document.read_text()):
                url = urlsplit(link)
                if url.scheme or url.netloc or not url.path:
                    continue
                path = (document.parent / unquote(url.path)).resolve()
                assert path.is_relative_to(destination) and path.is_file(), (document, link)
                if url.fragment and path.suffix == ".html":
                    target_links = Links()
                    target_links.feed(path.read_text())
                    assert unquote(url.fragment) in target_links.ids, (document, link)

        # Tests import their sibling mvp.py and create only temporary databases.
        result = subprocess.run(
            [sys.executable, str(stage / "labs/test_mvp.py")],
            cwd=destination, text=True, capture_output=True, timeout=60,
        )
        if result.returncode:
            raise AssertionError(result.stdout + result.stderr)
        print(result.stderr.strip())
        print("PASS: clean extraction, declared artifacts, HTML/Markdown links, anchors, and HTTP tests.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive", type=Path)
    args = parser.parse_args()
    verify(args.archive)
