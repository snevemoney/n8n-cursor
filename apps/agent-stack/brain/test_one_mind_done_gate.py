"""F3 regressions: no false 'Done', no false 'browser verified'."""
import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent))
from one_mind import controller as MC, fakes as F, registry as R, receipts, worker_results as W, fake_browser as FB  # noqa: E402
from one_mind.response_runtime import ResponseRuntime  # noqa: E402


def mission(mid, nodes=None, integration=('runtime',)):
    return {'mission_id': mid, 'objective': 'x', 'authority': F.coding_authority(mid),
            'nodes': nodes or F.coding_nodes(), 'integration': list(integration)}


def forged_tester(mid, evidence):
    def run(ctx, node, attempt):
        return W.TesterResult('a-%s-%d' % (node['worker_id'], attempt), 'tester', F.prov(mid, node, 'software.verifier'),
                              verdict='PASS', condition='tests', expected='0 fail', observed='0 fail', evidence=evidence(node))
    return run


class DoneGate(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(); self.env = patch.dict(os.environ, {'JARVIS_ONE_MIND': '1'}); self.env.start()

    def tearDown(self):
        self.env.stop(); self.tmp.cleanup()

    def run_with(self, mid, tester, **kw):
        w = F.coding_workers(mid); w['software.verifier'] = tester
        return MC.MissionController(self.tmp.name, R.REGISTRY, w).run(mission(mid, **kw))

    def test_forged_receipt_string_is_not_done(self):
        out = self.run_with('f1', forged_tester('f1', lambda n: ('run:deadbeefdeadbeefdead',)))
        self.assertNotEqual(out['status'], 'VERIFIED'); self.assertFalse(out['verified'])
        self.assertIn('no_execution_receipt', str(out['failures']))
        self.assertNotIn('Done', ResponseRuntime(chat=lambda p: 'Done!').final(out))

    def test_free_text_log_evidence_is_not_done(self):
        out = self.run_with('f2', forged_tester('f2', lambda n: ('log: tests passed, trust me',)))
        self.assertFalse(out['verified'])

    def test_receipt_from_other_worker_or_mission_rejected(self):
        out = self.run_with('f3', forged_tester('f3', lambda n: (receipts.record('run', 'other-mission', n['worker_id'], {}),)))
        self.assertFalse(out['verified'])
        out = self.run_with('f4', forged_tester('f4', lambda n: (receipts.record('run', 'f4', 'build', {}),)))
        self.assertFalse(out['verified'])

    def test_real_receipt_is_done(self):
        out = self.run_with('f5', forged_tester('f5', lambda n: (receipts.record('run', 'f5', n['worker_id'], {'exit': 0}),)))
        self.assertEqual(out['status'], 'VERIFIED')

    def test_builder_only_mission_cannot_be_done(self):
        nodes = [n for n in F.coding_nodes() if n['worker_id'] == 'build']
        out = MC.MissionController(self.tmp.name, R.REGISTRY, F.coding_workers('f6')).run(mission('f6', nodes, ()))
        self.assertFalse(out['verified'])


class BrowserGate(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(); self.env = patch.dict(os.environ, {'JARVIS_ONE_MIND': '1'}); self.env.start()
        self.page = Path(self.tmp.name) / 'p.html'; self.page.write_text('<title>T</title><p>Pro costs $29</p>')

    def tearDown(self):
        self.env.stop(); self.tmp.cleanup()

    def browse(self, mid, verified_by):
        node = {'worker_id': 'flow', 'task_id': 't', 'profile_id': 'browser.operator', 'action': 'READ',
                'capability': 'browser.read', 'system': 'box'}

        def op(ctx, n, attempt):
            return W.BrowserFlowResult('a-flow', 'browser_flow', W.Provenance(mid, 't', 'flow', 'browser.operator', 1),
                                       flow_id='flow', verified_by=verified_by(mid))
        auth = F.coding_authority(mid, allowed_actions=('READ',), permitted_capabilities=('browser.read',))
        return MC.MissionController(self.tmp.name, R.REGISTRY, {'browser.operator': op}).run(
            {'mission_id': mid, 'objective': 'price', 'authority': auth, 'nodes': [node], 'integration': []})

    def test_false_browser_verified_rejected(self):
        for mid, vb in (('b1', lambda m: ''), ('b2', lambda m: 'page:forged'),
                        ('b3', lambda m: receipts.record('page', m, 'flow', {}))):  # self-certified by operator
            out = self.browse(mid, vb)
            self.assertFalse(out['verified'], mid)
            self.assertIn('browser_not_verified_by_page_load', str(out['failures']))

    def test_page_loaded_by_separate_verifier_is_done(self):
        def vb(mid):
            return FB.verify(FB.load_page(self.page), 'Pro costs $29', mission_id=mid, worker_id='flow:verifier')['evidence'][0]
        self.assertEqual(self.browse('b4', vb)['status'], 'VERIFIED')

    def test_fake_browser_miss_mints_no_receipt(self):
        self.assertEqual(FB.verify(FB.load_page(self.page), 'Enterprise $99', mission_id='m', worker_id='v')['evidence'], ())


if __name__ == '__main__':
    unittest.main()
