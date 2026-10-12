"""F4: every mission trace carries plan, model, actions (4 questions), verifier result, cost; reader CLI."""
import io
import json
import os
import sys
import tempfile
import unittest
from contextlib import redirect_stdout
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent))
from one_mind import coding_worker as CW, llm as L, controller as MC, fakes as F, registry as R, trace_cli  # noqa: E402

CMD = [sys.executable, '-m', 'unittest', '-q', 'test_calc']
TESTS = 'import unittest\nfrom calc import add\nclass T(unittest.TestCase):\n    def test_a(self):\n        self.assertEqual(add(2, 3), 5)\n'


class FullTrace(unittest.TestCase):
    def test_trace_and_cli(self):
        with patch.dict(os.environ, {'JARVIS_ONE_MIND': '1'}), tempfile.TemporaryDirectory() as d:
            repo = Path(d) / 'repo'; repo.mkdir()
            (repo / 'calc.py').write_text('def add(a, b):\n    return a - b\n'); (repo / 'test_calc.py').write_text(TESTS)
            ws = CW.Workspaces(repo)
            llm = L.FakeLLM([json.dumps({'files': {'calc.py': 'def add(a, b):\n    return a + b\n'}})], cost_per_call=0.01)
            agent = CW.BoxCodingAgent(llm, model='frontier', files=('calc.py',), test_cmd=CMD)
            try:
                out = MC.MissionController(Path(d) / 'm', R.REGISTRY, CW.make_box_workers(ws, agent, test_cmd=CMD, review_files=('calc.py',))).run(
                    {'mission_id': 'tr1', 'objective': 'fix add', 'authority': F.coding_authority('tr1'),
                     'nodes': F.coding_nodes(('calc.py',)), 'integration': ['runtime']})
            finally:
                ws.cleanup()
            s = trace_cli.summarize(trace_cli.load(Path(d) / 'm' / 'tr1'))
            buf = io.StringIO()
            with redirect_stdout(buf):
                trace_cli.main([str(Path(d) / 'm' / 'tr1')])
        self.assertEqual(out['status'], 'VERIFIED')
        self.assertEqual(s['plan']['batches'], [['build'], ['test'], ['review'], ['runtime']])
        self.assertEqual([m['model'] for m in s['models']], ['frontier'])
        self.assertAlmostEqual(s['cost_usd'], 0.01)
        build = [a for a in s['actions'] if a['worker_id'] == 'build'][0]
        self.assertEqual((build['possible'], build['authorized'], build['executed'], build['occurred']), (True, 'AUTO_EXECUTE', True, True))
        self.assertEqual({v['worker_id'] for v in s['verifier_results']}, {'test', 'runtime'})
        self.assertTrue(all(v['receipts'] for v in s['verifier_results']))
        self.assertEqual(s['terminal']['terminal_commit_id'], out['terminal_commit_id'])
        text = buf.getvalue()
        for needle in ('plan:', 'models: 1 call(s), $0.0100', 'possible / authorized / executed / occurred', 'verifiers:', 'terminal:'):
            self.assertIn(needle, text)

    def test_blocked_action_shows_not_executed(self):
        with patch.dict(os.environ, {'JARVIS_ONE_MIND': '1'}), tempfile.TemporaryDirectory() as d:
            m = {'mission_id': 'tr2', 'objective': 'x', 'authority': F.coding_authority('tr2'), 'nodes': F.coding_nodes(), 'integration': []}
            m['nodes'][0]['system'] = 'mac'
            MC.MissionController(d, R.REGISTRY, F.coding_workers('tr2')).run(m)
            s = trace_cli.summarize(trace_cli.load(Path(d) / 'tr2'))
        b = [a for a in s['actions'] if a['worker_id'] == 'build'][0]
        self.assertEqual((b['authorized'], b['executed'], b['occurred']), ('BLOCK', False, None))


if __name__ == '__main__':
    unittest.main()
