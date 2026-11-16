import importlib.util
import json
from pathlib import Path
import tempfile
import subprocess
import sys
import unittest

spec = importlib.util.spec_from_file_location('tracker', Path(__file__).parents[1] / 'scripts/tracker.py')
tracker = importlib.util.module_from_spec(spec)
spec.loader.exec_module(tracker)

class LiveVerificationTests(unittest.TestCase):
    def test_live_pass_requires_matching_successful_report(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for name in ['markdown', 'html', 'coverage', 'validation']:
                (root / name).write_text('artifact')
            case = {'slug': 'case', 'stage': 'Complete', 'mode': 'teach',
                    'sections': dict.fromkeys(tracker.SECTIONS, 'complete'),
                    'checks': {key: {'status': 'passed', 'evidence': 'reviewed'} for key in tracker.CHECKS},
                    'artifacts': {key: key for key in ['markdown', 'html', 'coverage', 'validation']},
                    'live': {'status': 'passed', 'url': 'https://example.com/design/case', 'deployment': 'commit-123',
                             'checked_at': '2026-11-16', 'evidence': 'checked production', 'report': 'live.json'}}
            record = {'cases': [case]}
            with self.assertRaises(ValueError): tracker.validate(record, root)
            (root / 'live.json').write_text(json.dumps({'passed': True, 'url': case['live']['url'], 'deployment': 'wrong'}))
            with self.assertRaises(ValueError): tracker.validate(record, root)
            (root / 'live.json').write_text(json.dumps({'passed': True, 'url': case['live']['url'], 'deployment': 'commit-123'}))
            tracker.validate(record, root)
            case['stage'] = 'In progress'
            with self.assertRaises(ValueError): tracker.validate(record, root)

    def test_live_pass_needs_new_evidence_after_redeployment(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / tracker.BASE).mkdir(parents=True)
            for name in ['markdown', 'html', 'coverage', 'validation']:
                (root / name).write_text('artifact')
            case = {'slug': 'case', 'title': 'Case', 'theme': 'Theme', 'source_url': 'https://example.com/design/case',
                    'stage': 'Complete', 'mode': 'teach', 'sections': dict.fromkeys(tracker.SECTIONS, 'complete'),
                    'checks': {key: {'status': 'passed', 'evidence': 'reviewed'} for key in tracker.CHECKS},
                    'artifacts': {key: key for key in ['markdown', 'html', 'coverage', 'validation']},
                    'live': {'status': 'passed', 'url': 'https://example.com/design/case', 'deployment': 'old',
                             'checked_at': '2026-11-16', 'evidence': 'old evidence', 'report': 'live.json'}}
            (root / 'live.json').write_text(json.dumps({'passed': True, 'url': case['source_url'], 'deployment': 'old'}))
            file = root / tracker.RECORD
            file.write_text(json.dumps({'version': 2, 'cases': [case], 'history': []}))
            command = [sys.executable, str(Path(tracker.__file__)), '--root', str(root), '--set', 'case', 'Complete']
            result = subprocess.run(command + ['--deployment', 'new'], capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)
            updated = json.loads(file.read_text())['cases'][0]['live']
            self.assertEqual(updated['status'], 'deployed')
            self.assertEqual(updated['evidence'], '')
            self.assertIsNone(updated['checked_at'])
            (root / 'live.json').write_text(json.dumps({'passed': True, 'url': case['source_url'], 'deployment': 'new'}))
            result = subprocess.run(command + ['--live-status', 'passed', '--live-report', 'live.json'], capture_output=True, text=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertEqual(json.loads(file.read_text())['cases'][0]['live']['status'], 'deployed')
            result = subprocess.run(command + ['--live-status', 'passed', '--live-report', 'live.json', '--evidence', 'new deployment checked'], capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)

    def test_pending_live_does_not_require_deployment(self):
        record = {'cases': [{'slug': 'case', 'stage': 'Not started', 'mode': 'teach',
                            'sections': dict.fromkeys(tracker.SECTIONS, 'pending'),
                            'checks': {key: {'status': 'pending'} for key in tracker.CHECKS},
                            'artifacts': {}, 'live': tracker.live_default()}]}
        tracker.validate(record, Path('.'))

if __name__ == '__main__': unittest.main()
