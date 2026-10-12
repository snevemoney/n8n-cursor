"""B3: generic MissionController with fake coding graph. Offline."""
import json
import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent))
from one_mind import controller as MC, fakes as F, registry as R, scheduler as S, worker_results as W  # noqa: E402
from one_mind.trace import terminal_commit_id  # noqa: E402

ON = {'JARVIS_ONE_MIND': '1'}


def mission(mid='m1', **kw):
    return {'mission_id': mid, 'objective': 'fix add()', 'authority': F.coding_authority(mid, **kw),
            'nodes': F.coding_nodes(), 'integration': ['runtime']}


class Base(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.env = patch.dict(os.environ, ON); self.env.start()
        self.delivered = []

    def tearDown(self):
        self.env.stop(); self.tmp.cleanup()

    def ctl(self, workers):
        return MC.MissionController(self.tmp.name, R.REGISTRY, workers, deliver=self.delivered.append)

    def trace(self, mid='m1'):
        return [json.loads(l) for l in (Path(self.tmp.name) / mid / 'trace.jsonl').read_text().splitlines()]


class ControllerTests(Base):
    def test_flag_off_refuses(self):
        with patch.dict(os.environ, {'JARVIS_ONE_MIND': ''}):
            with self.assertRaises(RuntimeError):
                MC.MissionController(self.tmp.name, R.REGISTRY, {})

    def test_happy_path_verified_and_deterministic_commit(self):
        out = self.ctl(F.coding_workers('m1')).run(mission())
        self.assertEqual(out['status'], 'VERIFIED')
        expected = terminal_commit_id('m1', {'status': 'VERIFIED', 'verified': True, 'accepted': sorted(out['accepted'])})
        self.assertEqual(out['terminal_commit_id'], expected)
        self.assertEqual(len(self.delivered), 1)
        phases = [r['phase'] for r in self.trace() if r['event'] == 'mission.phase']
        for ph in ('GOAL', 'GROUND', 'PLAN', 'GRAPH', 'OBSERVE', 'VERIFY', 'COMPLETE'):
            self.assertIn(ph, phases)

    def test_duplicate_commit_suppressed(self):
        c = self.ctl(F.coding_workers('m1'))
        first = c.run(mission()); second = c.run(mission())
        self.assertEqual(first['terminal_commit_id'], second['terminal_commit_id'])
        self.assertTrue(second['duplicate'])
        self.assertEqual(len(self.delivered), 1)
        self.assertEqual(sum(r['event'] == 'terminal.commit' for r in self.trace()), 1)

    def test_same_outcome_same_id_across_runs(self):
        a = self.ctl(F.coding_workers('m1')).run(mission())
        with tempfile.TemporaryDirectory() as other:
            b = MC.MissionController(other, R.REGISTRY, F.coding_workers('m1')).run(mission())
        self.assertEqual(a['terminal_commit_id'], b['terminal_commit_id'])

    def test_injected_failure_recovers(self):
        w = F.coding_workers('m1', patches=('bad', 'good'), verdicts={'test': ['FAIL', 'PASS'], 'runtime': ['PASS']})
        out = self.ctl(w).run(mission())
        self.assertEqual(out['status'], 'VERIFIED')
        self.assertEqual(out['artifacts']['build']['patch'], 'good')
        self.assertTrue(any(r.get('phase') == 'RECOVER' for r in self.trace()))

    def test_retry_budget_exhausted_is_not_success(self):
        w = F.coding_workers('m1', verdicts={'test': ['FAIL'], 'runtime': ['PASS']})
        out = self.ctl(w).run(mission())
        self.assertFalse(out['verified'])
        self.assertIn('verifier_failed', json.dumps(out['failures']))

    def test_worker_self_certification_rejected(self):
        m = mission(); m['nodes'] = [n for n in m['nodes'] if n['worker_id'] == 'build']; m['integration'] = []
        out = self.ctl(F.coding_workers('m1')).run(m)
        self.assertFalse(out['verified'])
        self.assertEqual(out['failures'][0]['reason'], 'no_independent_verifier')

    def test_reviewer_block_fails_mission(self):
        out = self.ctl(F.coding_workers('m1', recommendation='block')).run(mission())
        self.assertFalse(out['verified'])

    def test_unauthorized_action_blocked_not_executed(self):
        m = mission(); m['nodes'][0]['system'] = 'mac'
        out = self.ctl(F.coding_workers('m1')).run(m)
        self.assertFalse(out['verified'])
        acts = [r for r in self.trace() if r['event'] == 'action' and r['worker_id'] == 'build']
        self.assertEqual((acts[0]['authorized'], acts[0]['executed']), ('BLOCK', False))

    def test_approval_pauses_only_affected_part(self):
        m = mission(confirm_actions=('REVIEW',))
        out = self.ctl(F.coding_workers('m1')).run(m)
        self.assertEqual(out['status'], 'NEEDS_APPROVAL')
        self.assertEqual(out['paused'], ['review', 'runtime'])
        self.assertIn('build', out['accepted'])
        # approved re-run in a fresh mission id completes
        m2 = mission('m2', confirm_actions=('REVIEW',))
        out2 = self.ctl(F.coding_workers('m2')).run(m2, approvals=('review',))
        self.assertEqual(out2['status'], 'VERIFIED')

    def test_steering_replans_only_affected_subgraph(self):
        calls = []
        w = F.coding_workers('m1')
        orig = w['software.builder']
        w['software.builder'] = lambda c, n, a: calls.append(n['worker_id']) or orig(c, n, a)
        ev = [{'id': 's1', 'after_batch': 1, 'node': 'test', 'changes': {'inputs': {'test_request': 'also edge', 'patch_ref': 'build'}}}]
        out = self.ctl(w).run(mission(), control=ev)
        self.assertEqual(out['status'], 'VERIFIED')
        self.assertEqual(calls, ['build'])  # verified build kept, not re-run
        replan = [r for r in self.trace() if r.get('phase') == 'REPLAN'][0]
        self.assertEqual(replan['affected'], ['review', 'runtime', 'test'])
        self.assertIn('build', replan['kept'])

    def test_cancel(self):
        out = self.ctl(F.coding_workers('m1')).run(mission(), control=[{'id': 'c', 'after_batch': 0, 'cancel': True}])
        self.assertEqual(out['status'], 'CANCELLED'); self.assertFalse(out['verified'])

    def test_worker_exception_is_observation(self):
        w = F.coding_workers('m1'); w['software.reviewer'] = lambda *a: 1 / 0
        out = self.ctl(w).run(mission())
        self.assertFalse(out['verified'])


class SchedulerTests(unittest.TestCase):
    def test_conflicts_and_cycles(self):
        nodes = [{'worker_id': 'a', 'files': ['x']}, {'worker_id': 'b', 'files': ['x']}, {'worker_id': 'c', 'files': ['y']}]
        self.assertEqual(S.batches(nodes), [['a', 'c'], ['b']])
        with self.assertRaises(ValueError):
            S.topo_order([{'worker_id': 'a', 'dependencies': ['b']}, {'worker_id': 'b', 'dependencies': ['a']}])
        with self.assertRaises(ValueError):
            S.topo_order([{'worker_id': 'a', 'dependencies': ['zz']}])


if __name__ == '__main__':
    unittest.main()
