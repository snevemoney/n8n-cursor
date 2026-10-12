"""F7: permission tiers; send/spend/deploy always need approval; missions run in throwaway copies."""
import json
import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent))
from one_mind import authority as A, fakes as F, controller as MC, registry as R, coding_worker as CW, llm as L  # noqa: E402
from one_mind.sandbox import Sandbox  # noqa: E402


def env(tier, **kw):
    base = dict(mission_id='m', autonomy_level='GOAL_AUTONOMY', allowed_actions=tuple(A.ALWAYS_APPROVAL) + ('READ', 'EDIT', 'COMMIT'),
                forbidden_actions=(), permitted_capabilities=('c',), permitted_domains=(), tier=tier)
    base.update(kw)
    return A.MissionAuthority(**base)


class Tiers(unittest.TestCase):
    def test_tier_ladder(self):
        self.assertEqual(env('read_only').decide('READ', 'c'), 'AUTO_EXECUTE')
        self.assertEqual(env('read_only').decide('EDIT', 'c'), 'BLOCK')
        self.assertEqual(env('sandbox_write').decide('EDIT', 'c'), 'AUTO_EXECUTE')
        self.assertEqual(env('sandbox_write').decide('COMMIT', 'c'), 'BLOCK')
        self.assertEqual(env('worktree_write').decide('COMMIT', 'c'), 'AUTO_EXECUTE')
        self.assertEqual(env('worktree_write').decide('UNKNOWN_OP', 'c'), 'BLOCK')

    def test_send_spend_deploy_always_need_approval(self):
        for action in ('SEND', 'SPEND', 'PAY', 'DEPLOY', 'PUBLISH', 'PUSH', 'MERGE', 'EMAIL'):
            self.assertEqual(env('external').decide(action, 'c'), 'REQUIRE_APPROVAL', action)
            self.assertEqual(env('worktree_write').decide(action, 'c'), 'BLOCK', action)

    def test_invalid_tier_rejected(self):
        row = env('external').to_dict() | {'tier': 'root'}
        with self.assertRaises(ValueError):
            A.MissionAuthority.from_dict(row, 'm')
        self.assertEqual(env('root').decide('READ', 'c'), 'BLOCK')

    def test_deploy_node_pauses_mission_even_when_allowed(self):
        with patch.dict(os.environ, {'JARVIS_ONE_MIND': '1'}), tempfile.TemporaryDirectory() as d:
            nodes = F.coding_nodes() + [{'worker_id': 'ship', 'task_id': 'fix', 'profile_id': 'software.builder', 'action': 'DEPLOY',
                                         'capability': 'software.build', 'system': 'box', 'dependencies': ['runtime']}]
            auth = F.coding_authority('t1', tier='external', allowed_actions=('READ', 'EDIT', 'TEST', 'REVIEW', 'DEPLOY'), forbidden_actions=())
            out = MC.MissionController(d, R.REGISTRY, F.coding_workers('t1')).run(
                {'mission_id': 't1', 'objective': 'x', 'authority': auth, 'nodes': nodes, 'integration': ['runtime']})
        self.assertEqual(out['status'], 'NEEDS_APPROVAL'); self.assertEqual(out['paused'], ['ship'])


class Throwaway(unittest.TestCase):
    def test_mission_never_writes_source_and_copy_is_removed(self):
        with patch.dict(os.environ, {'JARVIS_ONE_MIND': '1'}), tempfile.TemporaryDirectory() as d:
            repo = Path(d) / 'repo'; repo.mkdir()
            (repo / 'calc.py').write_text('def add(a, b):\n    return a - b\n')
            (repo / 'test_calc.py').write_text('import unittest\nfrom calc import add\nclass T(unittest.TestCase):\n    def test(self):\n        self.assertEqual(add(1, 1), 2)\n')
            cmd = [sys.executable, '-m', 'unittest', '-q', 'test_calc']
            ws = CW.Workspaces(repo)
            agent = CW.BoxCodingAgent(L.FakeLLM([json.dumps({'files': {'calc.py': 'def add(a, b):\n    return a + b\n'}})]),
                                      model='fake', files=('calc.py',), test_cmd=cmd)
            out = MC.MissionController(Path(d) / 'm', R.REGISTRY, CW.make_box_workers(ws, agent, test_cmd=cmd, review_files=('calc.py',))).run(
                {'mission_id': 't2', 'objective': 'fix', 'authority': F.coding_authority('t2'), 'nodes': F.coding_nodes(('calc.py',)), 'integration': ['runtime']})
            copy = ws.get('t2').root
            self.assertTrue(copy.exists()); ws.cleanup(); self.assertFalse(copy.exists())
            self.assertEqual(out['status'], 'VERIFIED')
            self.assertIn('a - b', (repo / 'calc.py').read_text())


if __name__ == '__main__':
    unittest.main()
