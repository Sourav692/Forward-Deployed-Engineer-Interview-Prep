#!/usr/bin/env python3
"""Read-only structural evidence for reviewers; never a teaching/runtime verdict.

Optional JSON output is confined to repo-root .system_design_review/. No course
file is created or updated and no lab, browser, package install or network runs.
"""
import argparse
from collections import Counter
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlsplit

BASE = Path(__file__).resolve().parents[1]
PHASES = ('Understand the Problem', 'Learn and Design', 'Observe and Experiment',
          'Think Like a Staff Engineer', 'Validate and Carry Forward')


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.links, self.assets = [], [], []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        if tag == 'a' and 'href' in attrs:
            self.links.append(attrs['href'])
        if 'src' in attrs:
            self.assets.append(attrs['src'])
        if tag == 'link' and set(attrs.get('rel', '').split()) & {'stylesheet', 'preload', 'preconnect', 'modulepreload'}:
            self.assets.append(attrs.get('href', ''))


def fingerprint(path):
    value = hashlib.sha256()
    with path.open('rb') as handle:
        for chunk in iter(lambda: handle.read(65536), b''):
            value.update(chunk)
    return value.hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--workspace', required=True, type=Path)
    parser.add_argument('--stage', required=True, type=int, choices=range(13), metavar='0..12')
    parser.add_argument('--repo-root', type=Path, help='Defaults to the learning workspace parent.')
    parser.add_argument('--report-dir', type=Path, help='A fresh run directory inside repo-root .system_design_review/.')
    parser.add_argument('--format', choices=('text', 'json'), default='text')
    args = parser.parse_args()
    workspace = args.workspace.resolve()
    repo = (args.repo_root or workspace.parent).resolve()
    if not workspace.is_relative_to(repo):
        parser.error('--workspace must be inside --repo-root')
    report_file = None
    if args.report_dir:
        ignored = repo / '.system_design_review'
        directory = args.report_dir if args.report_dir.is_absolute() else repo / args.report_dir
        directory = directory.resolve()
        # Reject both traversal and a report-root symlink escaping the repository.
        if not ignored.resolve().is_relative_to(repo) or not directory.is_relative_to(ignored.resolve()) or directory == ignored.resolve():
            parser.error('--report-dir must be a run directory under repo-root .system_design_review/')
        report_file = directory / 'structural-audit.json'
        if report_file.exists():
            parser.error('structural-audit.json already exists; use a new review run')

    report = {'stage': args.stage, 'kind': 'structural evidence only', 'workspace': str(workspace),
              'checks': [], 'warnings': [], 'artifact_fingerprints': {},
              'not_checked': ['substantive teaching and mapped-depth mastery', 'factual correctness and architecture guarantees',
                              'semantic Markdown/HTML parity', 'browser/offline/keyboard behaviour',
                              'lab runtime and clean-package execution', 'production readiness and learner mastery']}

    def check(name, passed, evidence):
        report['checks'].append({'check': name, 'status': 'passed' if passed else 'failed', 'evidence': evidence})

    def read(path):
        try:
            value = path.read_text(encoding='utf-8')
            report['artifact_fingerprints'][str(path.relative_to(repo))] = fingerprint(path)
            return value
        except (OSError, UnicodeError) as exc:
            check('read ' + path.name, False, str(exc))
            return None

    mapping = json.loads((BASE / 'references/curriculum-map.json').read_text(encoding='utf-8'))
    if args.stage == 0:
        stage = workspace / 'stages/00-enterprise-overview'
        modules = []
        report['warnings'].append('Stage 0 is orientation; instructional module-depth checks are not applicable.')
    else:
        entry = next(s for s in mapping['stages'] if s['stage'] == args.stage)
        stage = workspace / entry['output_dir']
        modules = [m for m in mapping['modules'] if m['primary_stage'] == args.stage]
    report['stage_path'] = str(stage)
    report['assigned_modules'] = [{'id': m['id'], 'target_depth': m['target_depth']} for m in modules]
    required = ('stage-plan.md', 'guide.md', 'guide.html', 'stage-state.json', 'validation.md')
    for name in required:
        check('artifact ' + name, (stage / name).is_file(), str(stage / name))
    md = read(stage / 'guide.md') if (stage / 'guide.md').is_file() else None
    source = read(stage / 'guide.html') if (stage / 'guide.html').is_file() else None

    def local_link(link, base, ids=None):
        url = urlsplit(link)
        if url.scheme or url.netloc:
            return
        target = (base / unquote(url.path)).resolve() if url.path else None
        if target:
            if not target.is_relative_to(repo):
                report['warnings'].append('Local dependency outside repository was not inspected: ' + link)
                return
            check('local file link', target.is_file(), str(base) + ': ' + link)
            if target.is_file() and target.suffix == '.html' and url.fragment:
                try:
                    page = Page()
                    page.feed(target.read_text(encoding='utf-8'))
                    check('cross-file HTML anchor', unquote(url.fragment) in page.ids, link)
                except (OSError, UnicodeError) as exc:
                    check('read HTML anchor target', False, str(exc))
        elif url.fragment and ids is not None:
            check('HTML anchor', unquote(url.fragment) in ids, link)
        elif url.fragment:
            report['warnings'].append('Markdown-only anchor requires rendered-source inspection: ' + link)

    if md is not None:
        for phase in PHASES:
            present = phase.casefold() in md.casefold()
            if args.stage == 0 and not present:
                report['warnings'].append('Orientation may use a simpler structure; instructional phase not found: ' + phase)
            else:
                check('Markdown phase', present, phase)
        for module in modules:
            present = re.search(r'(?<![\d.])' + re.escape(module['id']) + r'(?![\d.])', md) is not None
            check('module ID mention (not teaching proof)', present, module['id'] + ' ' + module['target_depth'])
        for link in re.findall(r'\[[^\]]*\]\(([^)]+)\)', md):
            local_link(link, stage)
        if '```mermaid' not in md:
            report['warnings'].append('No Mermaid fence found; inspect equivalent diagram source manually.')
    if source is not None:
        page = Page()
        page.feed(source)
        check('HTML document envelope', '<html' in source.lower() and '</html>' in source.lower(), 'Document boundaries only; not full markup validity.')
        check('unique HTML IDs', len(page.ids) == len(set(page.ids)), str([k for k,v in Counter(page.ids).items() if v > 1]))
        for link in page.links:
            local_link(link, stage, page.ids)
        for asset in page.assets:
            if urlsplit(asset).scheme in ('http', 'https') or asset.startswith('//'):
                check('offline asset reference', False, asset)
            elif not urlsplit(asset).scheme:
                local_link(asset, stage)
        if re.search(r'(?:url\(\s*[\'"]?|@import\s+[\'"])https?://', source, re.I):
            check('offline CSS reference', False, 'External CSS resource reference detected.')
        if '<svg' not in source.lower():
            report['warnings'].append('No inline SVG found; inspect semantic HTML diagrams and text alternatives manually.')
    state_path = stage / 'stage-state.json'
    if state_path.is_file():
        raw = read(state_path)
        try:
            state = json.loads(raw) if raw is not None else None
            if not isinstance(state, dict):
                raise ValueError('stage-state.json must be an object')
            artifacts = state.get('artifacts', [])
            if not isinstance(artifacts, list) or any(not isinstance(x, str) for x in artifacts):
                raise ValueError('artifacts must be a list of path strings')
            for artifact in artifacts:
                target = (stage / artifact).resolve()
                check('declared artifact', target.is_relative_to(repo) and target.is_file(), artifact)
                if target.is_relative_to(repo) and target.is_file():
                    report['artifact_fingerprints'][str(target.relative_to(repo))] = fingerprint(target)
            if state.get('learner_completion') == 'passed':
                report['warnings'].append('Learner marked passed: verify assessment evidence separately; this audit does not assess it.')
        except (ValueError, TypeError) as exc:
            check('stage state JSON', False, str(exc))
    report['structural_status'] = 'failed' if any(c['status'] == 'failed' for c in report['checks']) else 'passed'
    report['warnings'].append('Module evidence and reviewer reports belong in .system_design_review/, not in the stage. A structural pass is not review approval.')
    payload = json.dumps(report, indent=2, ensure_ascii=False) + '\n'
    if report_file:
        report_file.parent.mkdir(parents=True, exist_ok=True)
        with report_file.open('x', encoding='utf-8') as handle:
            handle.write(payload)
    if args.format == 'json':
        print(payload, end='')
    else:
        print(f'Stage {args.stage}: {stage}')
        for item in report['checks']:
            if item['status'] == 'failed':
                print('FAILED:', item['check'], '-', item['evidence'])
        for warning in report['warnings']:
            print('WARNING:', warning)
        print(report['structural_status'].upper() + ': structural evidence only; substantive teaching and runtime checks remain separate.')
        if report_file:
            print('Report:', report_file)
    return int(report['structural_status'] == 'failed')


if __name__ == '__main__':
    sys.exit(main())
