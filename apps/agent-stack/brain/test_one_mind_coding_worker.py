"""F1: real box coding worker (sandbox copy, real test runs, loop to pass/budget) with FakeLLM."""
import json
import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent))
from one_mind import coding_worker as CW, llm as L, controller as MC, fakes as F, registry as R, pipeline_hook as PH  # noqa: E402
from one_mind.sandbox import Sandbox  # noqa: E402

BUGGY = 'def add(a, b):\n    return a - b\n'
WRONG = 'def add(a, b):\n    return abs(a) + abs(b)\n'
GOOD = 'def add(a, b):\n    return a + b\n'
TESTS = ('import unittest\nfrom calc import add\n\nclass T(unittest.TestCase):\n'
         '    def test_add(self):\n        self.assertEqual(add(2, 3), 5)\n'
         '    def test_negative(self):\n        self.assertEqual(add(-2, 1), -1)\n')
CMD = [sys.executable, '-m', 'unittest', '-q', 'test_calc']


def edit(src):
    return json.dumps({'files': {'calc.py': src}, 'notes': 'edit'})


class Repo(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.repo = Path(self.tmp.name) / 'repo'; self.repo.mkdir()
        (self.repo / 'calc.py').write_text(BUGGY); (self.repo / 'test_calc.py').write_text(TESTS)

    def tearDown(self):
        self.tmp.cleanup()


class AgentTests(Repo):
    def test_loops_until_tests_pass_in_copy(self):
        llm = L.FakeLLM(['not json', edit(WRONG), edit(GOOD)])
        agent = CW.BoxCodingAgent(llm, model='fake', files=('calc.py',), test_cmd=CMD)
        with Sandbox(self.repo) as sb:
            out = agent.run(sb, 'fix add')
            self.assertEqual((out['status'], out['iterations']), ('COMPLETED', 3))
            self.assertIn('+    return a + b', sb.diff(['calc.py']))
        self.assertEqual((self.repo / 'calc.py').read_text(), BUGGY)  # source untouched

    def test_iteration_budget(self):
        agent = CW.BoxCodingAgent(L.FakeLLM([edit(WRONG)] * 5), model='fake', files=('calc.py',), test_cmd=CMD, max_iterations=2)
        with Sandbox(self.repo) as sb:
            self.assertEqual(agent.run(sb, 'fix')['reason'], 'iteration_budget')

    def test_rejects_unsafe_or_out_of_scope_edits(self):
        for bad in (json.dumps({'files': {'test_calc.py': 'x'}}), edit('import os\nos.system("rm -rf /")\n')):
            with self.assertRaises(ValueError):
                CW.parse_edit(bad, ('calc.py',))
        with Sandbox(self.repo) as sb, self.assertRaises(ValueError):
            sb.write('../escape.py', 'x')

    def test_cost_cap_refuses_before_call(self):
        meter = L.CostMeter(0.10)
        llm = L.FakeLLM([edit(WRONG)] * 5, meter=meter, cost_per_call=0.06)
        agent = CW.BoxCodingAgent(llm, model='fake', files=('calc.py',), test_cmd=CMD)
        with Sandbox(self.repo) as sb, self.assertRaises(L.BudgetExceeded):
            agent.run(sb, 'fix')
        self.assertLessEqual(meter.spent, 0.10)

    def test_live_client_never_exposes_key(self):
        with patch.dict(os.environ, {'JARVIS_LITELLM_KEY': 'sk-test-not-real-123'}):
            c = L.LiteLLMClient(L.CostMeter(0.5))
            self.assertNotIn('sk-test', repr(c)); self.assertNotIn('sk-test', str(vars(c)))


class MissionTests(Repo):
    def setUp(self):
        super().setUp()
        self.env = patch.dict(os.environ, {'JARVIS_ONE_MIND': '1'}); self.env.start()

    def tearDown(self):
        self.env.stop(); PH.register_workers({}); super().tearDown()

    def workers(self, replies):
        ws = CW.Workspaces(self.repo)
        agent = CW.BoxCodingAgent(L.FakeLLM(replies), model='fake', files=('calc.py',), test_cmd=CMD)
        return ws, CW.make_box_workers(ws, agent, test_cmd=CMD, review_files=('calc.py',))

    def test_controller_mission_verified_by_independent_run(self):
        ws, w = self.workers([edit(GOOD)])
        try:
            m = {'mission_id': 'cw1', 'objective': 'fix add', 'authority': F.coding_authority('cw1'),
                 'nodes': F.coding_nodes(('calc.py',)), 'integration': ['runtime']}
            with tempfile.TemporaryDirectory() as d:
                out = MC.MissionController(d, R.REGISTRY, w).run(m)
                rows = [json.loads(l) for l in (Path(d) / 'cw1' / 'trace.jsonl').read_text().splitlines()]
        finally:
            ws.cleanup()
        self.assertEqual(out['status'], 'VERIFIED')
        self.assertTrue(out['artifacts']['test']['evidence'][0].startswith('run:test:exit=0'))
        self.assertTrue(any(r['event'] == 'builder.iteration' for r in rows))

    def test_pipeline_hook_routes_with_box_workers(self):
        ws, w = self.workers([edit(GOOD)])
        PH.register_workers(w)
        try:
            with tempfile.TemporaryDirectory() as hive:
                out = PH.handle({'tool': 'cursor_ask', 'args': {'query': 'fix add in calc.py'}}, 'fix add', hive)
        finally:
            ws.cleanup()
        self.assertTrue(out['task_verified']); self.assertEqual(out['wires'], ['one_mind'])


if __name__ == '__main__':
    unittest.main()
