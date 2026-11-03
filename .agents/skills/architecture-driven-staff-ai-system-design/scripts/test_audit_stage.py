#!/usr/bin/env python3
"""Exercise read-only review and output confinement using disposable fixtures."""
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

SCRIPT = Path(__file__).with_name('audit_stage.py')


class AuditTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.repo = Path(self.temp.name) / 'repo'
        self.workspace = self.repo / '10_AI_System_Design'
        self.stage = self.workspace / 'stages/00-enterprise-overview'
        self.stage.mkdir(parents=True)
        phases = ['Understand the Problem', 'Learn and Design', 'Observe and Experiment',
                  'Think Like a Staff Engineer', 'Validate and Carry Forward']
        (self.stage / 'guide.md').write_text('\n'.join('## ' + p for p in phases))
        (self.stage / 'guide.html').write_text('<!doctype html><html><body><h1 id="intro">Orientation</h1><a href="#intro">Start</a></body></html>')
        for name in ('stage-plan.md', 'validation.md'):
            (self.stage / name).write_text('Disposable test fixture; no model or infrastructure runs.')
        (self.stage / 'stage-state.json').write_text(json.dumps({'learner_completion': 'unassessed', 'artifacts': ['guide.md','guide.html']}))

    def tearDown(self):
        self.temp.cleanup()

    def run_audit(self, *extra, stage=0):
        return subprocess.run([sys.executable, str(SCRIPT), '--workspace', str(self.workspace),
                               '--stage', str(stage), '--format', 'json', *extra], capture_output=True, text=True)

    def snapshot(self):
        return {p.relative_to(self.workspace).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
                for p in self.workspace.rglob('*') if p.is_file()}

    def test_existing_stage_needs_no_embedded_review_files(self):
        before = self.snapshot()
        result = self.run_audit()
        self.assertEqual(result.returncode, 0, result.stderr)
        report = json.loads(result.stdout)
        self.assertEqual(report['assigned_modules'], [])
        self.assertEqual(report['structural_status'], 'passed')
        self.assertEqual(before, self.snapshot())
        self.assertFalse((self.repo / '.system_design_review').exists())

    def test_orientation_does_not_require_full_instructional_headings(self):
        (self.stage / 'guide.md').write_text('# Customer Journey\nAlice needs a saved supplier reply. Target and implementation are distinct.')
        result = self.run_audit()
        self.assertEqual(result.returncode, 0, result.stderr)
        report = json.loads(result.stdout)
        self.assertEqual(report['assigned_modules'], [])
        self.assertTrue(any('simpler structure' in warning for warning in report['warnings']))

    def test_partial_artifacts_still_get_inspected(self):
        (self.stage / 'guide.html').unlink()
        (self.stage / 'stage-state.json').write_text('{broken')
        result = self.run_audit()
        self.assertEqual(result.returncode, 1)
        checks = json.loads(result.stdout)['checks']
        self.assertTrue(any(c['check'] == 'Markdown phase' and c['status'] == 'passed' for c in checks))
        self.assertTrue(any(c['check'] == 'stage state JSON' and c['status'] == 'failed' for c in checks))

    def test_report_is_confined_and_never_overwritten(self):
        target = self.repo / '.system_design_review/stage-00/run'
        before = self.snapshot()
        first = self.run_audit('--report-dir', str(target))
        self.assertEqual(first.returncode, 0, first.stderr)
        artifact = target / 'structural-audit.json'
        saved = artifact.read_bytes()
        self.assertEqual(json.loads(saved)['structural_status'], 'passed')
        second = self.run_audit('--report-dir', str(target))
        self.assertEqual(second.returncode, 2)
        self.assertEqual(saved, artifact.read_bytes())
        self.assertEqual(before, self.snapshot())

    def test_outside_report_paths_reject_without_writes(self):
        before = self.snapshot()
        for destination in (self.stage, self.repo / '.system_design_review/../../escape', self.repo / '.system_design_review-copy/run'):
            result = self.run_audit('--report-dir', str(destination))
            self.assertEqual(result.returncode, 2, result.stdout + result.stderr)
        self.assertEqual(before, self.snapshot())
        self.assertFalse((self.repo / '.system_design_review-copy').exists())

    def test_report_root_symlink_cannot_escape_repository(self):
        outside = Path(self.temp.name) / 'outside'
        outside.mkdir()
        (self.repo / '.system_design_review').symlink_to(outside, target_is_directory=True)
        result = self.run_audit('--report-dir', str(self.repo / '.system_design_review/run'))
        self.assertEqual(result.returncode, 2)
        self.assertEqual(list(outside.iterdir()), [])

    def test_duplicate_ids_bad_links_and_online_assets_are_findings(self):
        (self.stage / 'guide.html').write_text('<html><body><p id="x"></p><p id="x"></p><a href="#absent">Broken</a><script src="https://example.invalid/app.js"></script></body></html>')
        result = self.run_audit()
        self.assertEqual(result.returncode, 1)
        failed = {c['check'] for c in json.loads(result.stdout)['checks'] if c['status'] == 'failed'}
        self.assertTrue({'unique HTML IDs', 'HTML anchor', 'offline asset reference'} <= failed)

    def test_module_id_substrings_do_not_count(self):
        other = self.stage.with_name('01-mvp')
        self.stage.rename(other)
        with (other / 'guide.md').open('a') as handle:
            handle.write('\n11.1 does not teach module 1.1.\n')
        # Remove the actual ID in the explanatory sentence, leaving only 11.1.
        (other / 'guide.md').write_text((other / 'guide.md').read_text().replace('module 1.1', 'the assigned module'))
        result = self.run_audit(stage=1)
        self.assertEqual(result.returncode, 1)
        checks = json.loads(result.stdout)['checks']
        self.assertTrue(any(c['check'].startswith('module ID mention') and c['evidence'] == '1.1 D3' and c['status'] == 'failed' for c in checks))


if __name__ == '__main__':
    unittest.main()
