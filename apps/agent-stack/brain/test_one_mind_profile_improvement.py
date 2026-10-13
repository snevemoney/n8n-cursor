"""#22 profile improvement loop: traces -> candidate -> offline eval -> shadow -> promote/reject. Fakes only."""
import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent))
from one_mind import profile_improvement as PI, registry as R  # noqa: E402

PID = 'software.builder'
TRACES = [{'profile_id': PID, 'version': 1, 'passed': i < 2, 'reason': 'budget_exhausted', 'cost_usd': 0.02} for i in range(6)]
CASES = [{'id': 'c%d' % i, 'needs_retries': 3 + (i % 2)} for i in range(6)]


def runner(profile, case):
    retries = dict(profile.budgets).get('retries', 0)
    return {'passed': retries >= case['needs_retries'], 'cost_usd': 0.01 * retries, 'seconds': 1.0}


def worse_runner(profile, case):
    return {'passed': profile.version == 1 or case['id'] != 'c0', 'cost_usd': 0.01, 'seconds': 1.0}


@patch.dict(os.environ, {'JARVIS_ONE_MIND': '1'})
class Loop(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.ledger = PI.Ledger(Path(self.tmp.name) / 'improve.jsonl')

    def tearDown(self):
        self.tmp.cleanup()

    def test_promotes_better_candidate_and_records_metrics(self):
        reg, row = PI.improve(R.REGISTRY, PID, TRACES, runner=runner, offline_cases=CASES, shadow_cases=CASES[:4], ledger=self.ledger)
        self.assertEqual(row['decision'], 'promote')
        self.assertEqual(reg.resolve(PID).version, 2)
        self.assertEqual(dict(reg.resolve(PID).budgets)['retries'], 4)
        self.assertEqual(R.REGISTRY.resolve(PID).version, 1)  # original untouched
        self.assertEqual(reg.resolve(PID, 1), R.REGISTRY.resolve(PID))
        self.assertGreater(row['offline']['candidate']['pass_rate'], row['offline']['baseline']['pass_rate'])
        self.assertEqual(row['shadow']['served_from'], 'baseline')
        led = self.ledger.rows()
        self.assertEqual(len(led), 1)
        self.assertEqual(led[0]['decision'], 'promote')
        self.assertIn('pass_rate', led[0]['shadow']['candidate'])

    def test_rejects_on_regression(self):
        reg, row = PI.improve(R.REGISTRY, PID, TRACES, runner=worse_runner, offline_cases=CASES, shadow_cases=CASES, ledger=self.ledger)
        self.assertEqual((row['decision'], row['reason']), ('reject', 'offline_not_better'))
        self.assertEqual(row['offline']['regressions'], ['c0'])
        self.assertIs(reg, R.REGISTRY)

    def test_rejects_when_shadow_not_better(self):
        flat = [{'id': 's%d' % i, 'needs_retries': 0} for i in range(3)]
        reg, row = PI.improve(R.REGISTRY, PID, TRACES, runner=lambda p, c: {'passed': True, 'cost_usd': 0, 'seconds': 1} if c['id'].startswith('s') else runner(p, c),
                              offline_cases=CASES, shadow_cases=flat, ledger=self.ledger)
        self.assertEqual((row['decision'], row['reason']), ('reject', 'shadow_not_better'))
        self.assertIs(reg, R.REGISTRY)

    def test_skips_without_enough_traces_or_candidate(self):
        _, row = PI.improve(R.REGISTRY, PID, TRACES[:2], runner=runner, offline_cases=CASES, shadow_cases=CASES, ledger=self.ledger)
        self.assertEqual(row['reason'], 'insufficient_traces')
        ok = [dict(t, passed=True) for t in TRACES]
        _, row = PI.improve(R.REGISTRY, PID, ok, runner=runner, offline_cases=CASES, shadow_cases=CASES, ledger=self.ledger)
        self.assertEqual(row['reason'], 'no_candidate')
        self.assertEqual([r['decision'] for r in self.ledger.rows()], ['skip', 'skip'])

    def test_candidate_cannot_change_tools_or_authority(self):
        with self.assertRaises(ValueError):
            PI.make_candidate(R.REGISTRY.resolve(PID), {'tools': ('external.send',)})
        with self.assertRaises(ValueError):
            PI.make_candidate(R.REGISTRY.resolve(PID), {'authority_ref': 'external'})

    def test_requires_flag(self):
        with patch.dict(os.environ, {'JARVIS_ONE_MIND': ''}):
            with self.assertRaises(RuntimeError):
                PI.improve(R.REGISTRY, PID, TRACES, runner=runner, offline_cases=CASES, shadow_cases=CASES, ledger=self.ledger)


if __name__ == '__main__':
    unittest.main()
