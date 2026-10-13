"""B5: Golden Mission passes repeatedly (3 clean + steering/failure-injection) with all six metrics at 0."""
import json
import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent / 'golden_mission'))
import run as G  # noqa: E402
import metrics as M  # noqa: E402


class GoldenMission(unittest.TestCase):
    def setUp(self):
        self.env = patch.dict(os.environ, {'JARVIS_ONE_MIND': '1'}); self.env.start()

    def tearDown(self):
        self.env.stop()

    def test_golden_repeatedly(self):
        with tempfile.TemporaryDirectory() as tmp:
            report = G.golden(tmp)
            steer = [r for r in report['runs'] if r['mission_id'] == 'golden-steer-fail'][0]
            rows = [json.loads(l) for l in (Path(tmp) / 'missions' / 'golden-steer-fail' / 'trace.jsonl').read_text().splitlines()]
        self.assertTrue(report['passed'], json.dumps(report, indent=1)[:3000])
        self.assertEqual(len(report['runs']), 6)
        self.assertEqual([r['mission_id'] for r in report['runs']][3:5], ['golden-fail', 'golden-steer'])
        phases = {r.get('phase') for r in rows if r['event'] == 'mission.phase'}
        for ph in ('GOAL', 'GROUND', 'PLAN', 'GRAPH', 'OBSERVE', 'VERIFY', 'RECOVER', 'REPLAN', 'COMPLETE'):
            self.assertIn(ph, phases)
        self.assertTrue(any(r['event'] == 'mission.steering' for r in rows))
        self.assertTrue(any(r['event'] == 'jev.decision' and r['authoritative'] is False for r in rows))
        self.assertEqual(sum(r['event'] == 'terminal.commit' for r in rows), 1)
        self.assertEqual(steer['answers'], ['I fixed add() in calc.py and the tests now pass.'])

    def test_metrics_catch_false_success(self):
        with tempfile.TemporaryDirectory() as tmp:
            G.run_once(tmp, 'm-fs')
            m = M.compute(Path(tmp) / 'missions' / 'm-fs', independent_recheck_passed=False)
        self.assertEqual(m['false_success'], 1)

    def test_flag_off_harness_refuses(self):
        with patch.dict(os.environ, {'JARVIS_ONE_MIND': ''}), tempfile.TemporaryDirectory() as tmp:
            sys.path.insert(0, str(G.BRAIN))
            from one_mind import controller as MC, registry as R
            with self.assertRaises(RuntimeError):
                MC.MissionController(tmp, R.REGISTRY, {})


if __name__ == '__main__':
    unittest.main()
