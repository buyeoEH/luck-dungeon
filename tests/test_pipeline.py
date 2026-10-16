import contextlib
import csv
import io
import json
import os
from pathlib import Path
import runpy
import sys
import tempfile
import unittest
from unittest.mock import patch
from urllib.error import HTTPError

ROOT = Path(__file__).resolve().parents[1]


class PipelineTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.out = Path(self.temp.name)
        self.runs = []
        causes = ['promoted', 'gem_shortage', 'resource_shortage',
                  'missing_recipe_cards', 'affordable_but_no_promotion', 'no_shop_diagnostics']
        self.events = []
        for seed, cause in enumerate(causes):
            row = dict(strategy='economy', seed=seed, round=3, phase='gameover',
                       score=100, cleared=0, enemies=2, enemyHp=30, deck=12,
                       damage=5, aoeDamage=2, pierceDamage=0, overkillDamage=0,
                       promotions=int(cause == 'promoted'), comboTriggers=0,
                       cardsBought=1, error='')
            self.runs.append(row)
            if cause == 'no_shop_diagnostics':
                continue
            recipe = dict(missingCount=int(cause == 'missing_recipe_cards'),
                          missing={'rd': 1} if cause == 'missing_recipe_cards' else {},
                          gemShort=int(cause == 'gem_shortage'),
                          resourceShort=int(cause == 'resource_shortage'),
                          ready=cause in ('promoted', 'affordable_but_no_promotion'))
            self.events.extend([
                dict(strategy='economy', seed=seed, eventIndex=0, round=1, phase='shop',
                     type='shop_snapshot', stage='entry', recipes=[recipe], offers=[]),
                dict(strategy='economy', seed=seed, eventIndex=1, round=1, phase='shop',
                     type='purchase', id='rd', price=3),
            ])
        for filename, rows in [('runs.csv', self.runs), ('rounds.csv', [dict(
                strategy='economy', seed=0, round=1, score=100, enemyHp=30,
                enemyCount=2, attack=5, damage=5, aoeDamage=2, deck=12)])]:
            with (self.out / filename).open('w', newline='') as f:
                writer = csv.DictWriter(f, fieldnames=rows[0].keys())
                writer.writeheader()
                writer.writerows(rows)
        (self.out / 'events.jsonl').write_text(''.join(json.dumps(e)+'\n' for e in self.events))

    def run_script(self, name, arg):
        with patch.object(sys, 'argv', [name, str(arg)]), contextlib.redirect_stdout(io.StringIO()):
            runpy.run_path(str(ROOT / 'cloud' / name), run_name='__main__')

    def test_analysis_causes_and_all_shop_visits(self):
        self.run_script('analyze_results.py', self.out)
        report = json.loads((self.out / 'analysis.json').read_text())
        self.assertEqual(set(report['promotion_diagnosis']['causes'].values()), {1})
        self.assertEqual(len(report['promotion_diagnosis']['causes']), 6)
        self.assertEqual(report['promotion_diagnosis']['shop']['visits'], 5)
        self.assertEqual(report['promotion_diagnosis']['shop']['purchases'], 5)
        self.assertEqual(report['total_round_rows'], 1)
        self.assertTrue((self.out / 'analysis.md').exists())

    def test_upload_sequence_and_key_headers(self):
        self.run_script('analyze_results.py', self.out)
        for key in ['sb_secret_test_fixture', 'legacy-test-fixture']:
            with self.subTest(key_type=key.split('_')[0]):
                calls = []

                def respond(req, timeout):
                    calls.append(req)
                    response = unittest.mock.MagicMock()
                    response.__enter__.return_value.status = 201
                    return response

                with patch.dict(os.environ, {'SUPABASE_URL': 'https://test.invalid',
                        'SUPABASE_SECRET_KEY': key, 'GITHUB_RUN_ID': '123',
                        'GITHUB_RUN_ATTEMPT': '1'}, clear=True), patch('urllib.request.urlopen', respond):
                    self.run_script('upload_results.py', self.out / 'runs.csv')
                self.assertEqual([r.get_method() for r in calls], ['POST']*4+['PATCH'])
                self.assertTrue(calls[0].full_url.endswith('autolab_batches?on_conflict=batch_id'))
                self.assertEqual(len(json.loads(calls[1].data)), 6)
                self.assertEqual(json.loads(calls[-1].data)['events_ingested'], len(self.events))
                self.assertEqual(json.loads(calls[-1].data)['status'], 'complete')
                self.assertEqual(calls[0].get_header('Apikey'), key)
                self.assertEqual(calls[0].get_header('Authorization'),
                                 None if key.startswith('sb_secret_') else 'Bearer '+key)
                self.assertTrue((self.out / 'batch_id.txt').exists())

    def test_upload_failure_never_echoes_response_or_marks_complete(self):
        key = 'sb_secret_private_fixture'
        error = HTTPError('https://test.invalid', 401, 'failure', {}, io.BytesIO(key.encode()))
        with patch.dict(os.environ, {'SUPABASE_URL':'https://test.invalid',
                'SUPABASE_SECRET_KEY':key}, clear=True), patch('urllib.request.urlopen', side_effect=error):
            with self.assertRaises(SystemExit) as caught:
                self.run_script('upload_results.py', self.out / 'runs.csv')
        self.assertNotIn(key, str(caught.exception))
        self.assertIn('HTTP 401', str(caught.exception))
        self.assertFalse((self.out / 'batch_id.txt').exists())


if __name__ == '__main__':
    unittest.main()
