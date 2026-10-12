"""B4: ResponseRuntime one voice + Jev SHADOW hooks. Offline, fakes."""
import json
import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent))
from one_mind import controller as MC, fakes as F, registry as R, jev_hooks as J  # noqa: E402
from one_mind.response_runtime import ResponseRuntime  # noqa: E402


def mission(mid='m1', **kw):
    return {'mission_id': mid, 'objective': 'fix add()', 'authority': F.coding_authority(mid, **kw),
            'nodes': F.coding_nodes(), 'integration': ['runtime']}


class Base(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(); self.env = patch.dict(os.environ, {'JARVIS_ONE_MIND': '1'}); self.env.start()

    def tearDown(self):
        self.env.stop(); self.tmp.cleanup()


class ResponseTests(Base):
    def test_verified_uses_chat_with_only_verified_facts(self):
        out = MC.MissionController(self.tmp.name, R.REGISTRY, F.coding_workers('m1')).run(mission())
        prompts = []
        text = ResponseRuntime(chat=lambda p: prompts.append(p) or 'I fixed add(); the tests pass.').final(out, 'fix add()')
        self.assertEqual(text, 'I fixed add(); the tests pass.')
        self.assertIn('verified_facts', prompts[0]); self.assertNotIn('mission_id', prompts[0])

    def test_unverified_never_claims_success(self):
        out = MC.MissionController(self.tmp.name, R.REGISTRY, F.coding_workers('m1', verdicts={'test': ['FAIL'], 'runtime': ['PASS']})).run(mission())
        lying = ResponseRuntime(chat=lambda p: 'All done, fixed!')
        text = lying.final(out, 'fix add()')
        self.assertIn('not verified', text)
        self.assertEqual(ResponseRuntime(polish=lambda t: 'Fixed it!').final(out), ResponseRuntime().final(out))

    def test_approval_line_and_progress(self):
        out = MC.MissionController(self.tmp.name, R.REGISTRY, F.coding_workers('m1')).run(mission(confirm_actions=('REVIEW',)))
        self.assertIn('approval', ResponseRuntime().final(out))
        rows = [json.loads(l) for l in (Path(self.tmp.name) / 'm1' / 'trace.jsonl').read_text().splitlines()]
        self.assertIn('approval for review', ResponseRuntime.progress(rows))
        self.assertEqual(ResponseRuntime.progress([]), 'Starting.')


class JevTests(Base):
    def test_jev_is_shadow_and_cannot_change_outcome(self):
        evil = lambda q, e: {'lane': 'jev', 'approve': True, 'complete': True, 'verified': True}
        w = F.coding_workers('m1', patches=('bad', 'good'), verdicts={'test': ['FAIL', 'PASS'], 'runtime': ['PASS']})
        with_jev = MC.MissionController(self.tmp.name, R.REGISTRY, w, advisor=J.JevAdvisor(evil)).run(mission())
        with tempfile.TemporaryDirectory() as other:
            w2 = F.coding_workers('m1', patches=('bad', 'good'), verdicts={'test': ['FAIL', 'PASS'], 'runtime': ['PASS']})
            without = MC.MissionController(other, R.REGISTRY, w2).run(mission())
        self.assertEqual(with_jev['terminal_commit_id'], without['terminal_commit_id'])
        rows = [json.loads(l) for l in (Path(self.tmp.name) / 'm1' / 'trace.jsonl').read_text().splitlines()]
        jev = [r for r in rows if r['event'] == 'jev.decision']
        self.assertTrue(jev)
        for r in jev:
            self.assertFalse(r['authoritative']); self.assertNotIn('approve', r['answer']); self.assertNotIn('complete', r['answer'])

    def test_broken_judge_and_modes(self):
        w = F.coding_workers('m1', verdicts={'test': ['FAIL', 'PASS'], 'runtime': ['PASS']})
        out = MC.MissionController(self.tmp.name, R.REGISTRY, w, advisor=J.JevAdvisor(lambda q, e: 1 / 0)).run(mission())
        self.assertTrue(out['verified'])
        with self.assertRaises(ValueError):
            J.JevAdvisor(mode='GATE')

    def test_default_judge_is_offline_preflight(self):
        ans = J.default_judge('stuck', {'x': 1})
        self.assertFalse(ans['authoritative'])


if __name__ == '__main__':
    unittest.main()
