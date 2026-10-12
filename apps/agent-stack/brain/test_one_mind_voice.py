"""F8: streaming partials, interruption, mid-mission status (text only, fakes)."""
import json
import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent))
from one_mind import controller as MC, fakes as F, registry as R  # noqa: E402
from one_mind.response_runtime import ResponseRuntime, StatusNarrator, interruption_to_control  # noqa: E402

V = {'status': 'VERIFIED', 'verified': True, 'accepted': [], 'artifacts': {}}
U = {'status': 'PARTIAL', 'verified': False, 'failures': [{'worker_id': 'b', 'reason': 'verifier_failed:x'}]}


class Streaming(unittest.TestCase):
    def test_streams_sentence_partials(self):
        rr = ResponseRuntime(chat_stream=lambda p: iter(['I fixed ', 'add(). The te', 'sts pass now.']))
        parts = list(rr.stream(V, 'x'))
        self.assertEqual([p['text'] for p in parts if p['type'] == 'partial'], ['I fixed add().', ' The tests pass now.'])
        self.assertEqual(parts[-1], {'type': 'final', 'text': 'I fixed add(). The tests pass now.', 'interrupted': False})

    def test_unverified_never_streams_model_text(self):
        rr = ResponseRuntime(chat_stream=lambda p: iter(['All done! ', 'Fixed.']))
        parts = list(rr.stream(U, 'x'))
        self.assertTrue(all('not verified' in p['text'] for p in parts))

    def test_interruption_stops_stream(self):
        state = {'n': 0}
        def chunks(p):
            for c in ['First sentence. ', 'Second sentence. ', 'Third.']:
                state['n'] += 1
                yield c
        rr = ResponseRuntime(chat_stream=chunks)
        parts = list(rr.stream(V, 'x', interrupted=lambda: state['n'] >= 2))
        self.assertEqual(parts[-1], {'type': 'final', 'text': 'First sentence.', 'interrupted': True})
        self.assertEqual(state['n'], 2)

    def test_memory_guard_applies_to_stream(self):
        rr = ResponseRuntime(chat_stream=lambda p: iter(['Done. Secret plan alpha is live. ']),
                             memory_guard=lambda t: '' if 'Secret' in t else t)
        self.assertEqual(list(rr.stream(V))[-1]['text'], 'Done. Verified.')


class Interruption(unittest.TestCase):
    def test_mapping(self):
        self.assertTrue(interruption_to_control('Stop that', 1, 'i1')['cancel'])
        self.assertTrue(interruption_to_control('wait a sec', 1, 'i2')['pause'])
        self.assertIsNone(interruption_to_control('sounds good', 1, 'i3'))

    def test_stop_and_wait_mid_mission(self):
        with patch.dict(os.environ, {'JARVIS_ONE_MIND': '1'}), tempfile.TemporaryDirectory() as d:
            c = MC.MissionController(d, R.REGISTRY, F.coding_workers('v1'))
            m = lambda mid: {'mission_id': mid, 'objective': 'x', 'authority': F.coding_authority(mid), 'nodes': F.coding_nodes(), 'integration': ['runtime']}
            stopped = c.run(m('v1'), control=[interruption_to_control('stop', 1, 's')])
            c2 = MC.MissionController(d, R.REGISTRY, F.coding_workers('v2'))
            held = c2.run(m('v2'), control=[interruption_to_control('hold on', 1, 'w')])
        self.assertEqual(stopped['status'], 'CANCELLED')
        self.assertEqual(held['status'], 'NEEDS_APPROVAL'); self.assertEqual(held['paused'], ['review', 'runtime'])
        self.assertIn('build', held['accepted'])


class Status(unittest.TestCase):
    def test_narrates_changes_throttled_without_internals(self):
        with patch.dict(os.environ, {'JARVIS_ONE_MIND': '1'}), tempfile.TemporaryDirectory() as d:
            w = F.coding_workers('s1', verdicts={'test': ['FAIL', 'PASS'], 'runtime': ['PASS']}, patches=('bad', 'good'))
            MC.MissionController(d, R.REGISTRY, w).run({'mission_id': 's1', 'objective': 'x', 'authority': F.coding_authority('s1'),
                                                        'nodes': F.coding_nodes(), 'integration': ['runtime']})
            rows = [json.loads(l) for l in (Path(d) / 's1' / 'trace.jsonl').read_text().splitlines()]
        t = {'now': 0.0}
        n = StatusNarrator(min_interval=4, clock=lambda: t['now'])
        lines = []
        for i in range(1, len(rows) + 1):
            t['now'] += 1
            line = n.update(rows[:i])
            if line:
                lines.append(line)
        self.assertIn('Planning the work.', lines)
        self.assertIn('A check failed; repairing it.', lines)
        self.assertTrue(all('s1' not in l and 'art-' not in l and '_' not in l for l in lines))
        self.assertLess(len(lines), 8)


if __name__ == '__main__':
    unittest.main()
