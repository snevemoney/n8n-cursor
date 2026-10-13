"""Feature-loop wiring in One-Mind: round log, locked-check scorer (regression/tamper = 0), coach proposal path,
wired into profile improvement and the box coding backend. Fakes only; no network, no paid calls."""
import json
import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent))
from one_mind import feature_loop as FL, profile_improvement as PI, registry as R, box_backend as BB, llm as L  # noqa: E402
from test_one_mind_profile_improvement import TRACES, CASES, runner, PID  # noqa: E402
from test_one_mind_box_backend import BUGGY, GOOD, TESTS, CMD, edit  # noqa: E402

PY = sys.executable


def wired(root):
    return 'from calc import add' in (Path(root) / 'main.py').read_text() if (Path(root) / 'main.py').exists() else False


@patch.dict(os.environ, {'JARVIS_ONE_MIND': '1'})
class FeatureLoop(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.d = Path(self.tmp.name)
        self.log = FL.RoundLog(self.d / 'results.tsv')

    def tearDown(self):
        self.tmp.cleanup()

    def test_scorer_needs_approval_and_scores_regression_and_tamper_zero(self):
        with self.assertRaises(ValueError):
            FL.LockedCheckScorer({'a': {'ok': lambda t: True}}, approved_by='', approval='')
        state = {'a': True, 'b': False}
        sc = FL.LockedCheckScorer({'a': {'one': lambda t: state['a']}, 'b': {'one': lambda t: state['b']}},
                                  approved_by='test-fixture', approval='synthetic approval in unit test')
        r = sc.score(None, 'a'); self.assertTrue(sc.full(r)); sc.keep(r)
        state.update(a=False, b=True)                      # building b breaks a
        r = sc.score(None, 'b')
        self.assertEqual((r['reason'], r['score'], r['regressions']), ('REGRESSION', 0.0, ['a/one']))
        self.assertFalse(sc.improves(r))
        state['a'] = True
        sc._checks['b']['one'] = lambda t: True            # tamper with a locked check
        r = sc.score(None, 'b')
        self.assertEqual((r['reason'], r['score']), ('TAMPERED', 0.0))

    def test_round_log_and_coach_proposal_across_features(self):
        for feat in ('x', 'y'):
            FL.log_round(self.log, {'feature': feat, 'passed': 1, 'total': 2, 'failing': [feat + '/90_wired'],
                                    'regressions': [], 'reason': 'ok'}, status='kept', tried='library only')
        rows = self.log.rows()
        self.assertEqual([r['label'] for r in rows], ['not-wired', 'not-wired'])
        self.assertEqual(self.log.path.read_text().splitlines()[0].split('\t'), list(FL.HEADER))
        p = FL.coach_proposal(rows, self.d / 'proposals')
        data = json.loads(Path(p).read_text())
        self.assertEqual((data['status'], data['scope']), ('PROPOSED', 'How to work only'))
        self.assertEqual(data['habits'][0]['rounds'], ['r1(x)', 'r2(y)'])
        self.assertIsNone(FL.coach_proposal(rows[:1], self.d / 'proposals'))   # one feature is not a pattern

    def test_profile_improvement_rejects_candidate_failing_locked_checks_and_logs_round(self):
        ledger = PI.Ledger(self.d / 'improve.jsonl')
        sc = FL.LockedCheckScorer({PID: {'retries_le_3': lambda p: dict(p.budgets).get('retries', 0) <= 3}},
                                  approved_by='test-fixture', approval='synthetic')
        reg, row = PI.improve(R.REGISTRY, PID, TRACES, runner=runner, offline_cases=CASES, shadow_cases=CASES[:4],
                              ledger=ledger, round_log=self.log, locked_scorer=sc, coach_dir=self.d / 'prop')
        self.assertEqual((row['decision'], row['reason']), ('reject', 'locked_checks_failed'))
        self.assertIs(reg, R.REGISTRY)
        self.assertEqual(self.log.rows()[-1]['status'], 'reverted')
        self.assertEqual(ledger.rows()[-1]['decision'], 'reject')

    def test_profile_improvement_promotes_when_locked_checks_full(self):
        ledger = PI.Ledger(self.d / 'improve.jsonl')
        sc = FL.LockedCheckScorer({PID: {'version_ok': lambda p: p.version >= 1}}, approved_by='t', approval='synthetic')
        reg, row = PI.improve(R.REGISTRY, PID, TRACES, runner=runner, offline_cases=CASES, shadow_cases=CASES[:4],
                              ledger=ledger, round_log=self.log, locked_scorer=sc)
        self.assertEqual(row['decision'], 'promote')
        self.assertEqual(row['locked']['score'], 1.0)
        self.assertEqual(self.log.rows()[-1]['status'], 'kept')

    def _repo(self):
        repo = self.d / 'repo'; repo.mkdir()
        (repo / 'calc.py').write_text(BUGGY); (repo / 'test_calc.py').write_text(TESTS)
        (repo / 'main.py').write_text('print(1)\n')
        return repo

    def test_box_backend_locked_checks_keep_or_revert_and_log(self):
        repo = self._repo()
        sc = FL.LockedCheckScorer({'add': {'01_tests': CMD, '90_wired': wired}}, approved_by='t', approval='synthetic')
        req = {'source': str(repo), 'files': ['calc.py'], 'test_cmd': CMD, 'objective': 'fix add', 'feature': 'add',
               'locked_checks': sc, 'round_log': self.log, 'coach_dir': str(self.d / 'prop')}
        out = BB.BoxCodingBackend(L.FakeLLM([edit(GOOD)], meter=L.CostMeter(0.5)), table={'frontier.chat': ['c']}).run(req)
        self.assertTrue(out['verify']['passed'])                 # unit tests pass ...
        self.assertEqual(out['status'], 'FAILED')                 # ... but not wired into main -> not done
        self.assertEqual(out['feature_loop']['locked']['failing'], ['add/90_wired'])
        self.assertTrue(out['feature_loop']['kept'])              # progress 1/2 kept as progress
        self.assertEqual(self.log.rows()[-1]['label'], 'not-wired')
        self.assertEqual((repo / 'calc.py').read_text(), BUGGY)   # source untouched

    def test_box_backend_without_locked_checks_unchanged(self):
        repo = self._repo()
        out = BB.BoxCodingBackend(L.FakeLLM([edit(GOOD)], meter=L.CostMeter(0.5)), table={'frontier.chat': ['c']}).run(
            {'source': str(repo), 'files': ['calc.py'], 'test_cmd': CMD, 'objective': 'fix add'})
        self.assertEqual(out['status'], 'COMPLETED')
        self.assertNotIn('feature_loop', out)

    def test_requires_flag(self):
        with patch.dict(os.environ, {'JARVIS_ONE_MIND': ''}):
            with self.assertRaises(RuntimeError):
                self.log.append(feature='x')
            with self.assertRaises(RuntimeError):
                FL.coach_proposal([], self.d)


if __name__ == '__main__':
    unittest.main()
