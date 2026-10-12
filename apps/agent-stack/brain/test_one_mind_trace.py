"""B1: deterministic ids, terminal commit id, four-question action records."""
import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent))
from one_mind import trace as T  # noqa: E402


class IdTests(unittest.TestCase):
    def test_stable_and_distinct(self):
        self.assertEqual(T.stable_id('m', 'task', 1), T.stable_id('m', 'task', 1))
        self.assertNotEqual(T.stable_id('m', 'task', 1), T.stable_id('m', 'task', 2))
        self.assertNotEqual(T.stable_id('m', 'task', 1), T.stable_id('n', 'task', 1))
        with self.assertRaises(ValueError):
            T.stable_id('m', 'bogus')

    def test_terminal_commit_is_deterministic(self):
        a = T.terminal_commit_id('m', {'status': 'VERIFIED', 'x': [1, 2]})
        self.assertEqual(a, T.terminal_commit_id('m', {'x': [1, 2], 'status': 'VERIFIED'}))
        self.assertNotEqual(a, T.terminal_commit_id('m', {'status': 'PARTIAL', 'x': [1, 2]}))


class ActionRecordTests(unittest.TestCase):
    def test_four_questions_are_consistent(self):
        T.ActionRecord('a', 'w', 'EDIT', 'software.build', True, 'AUTO_EXECUTE', True, None)
        for bad in (dict(authorized='BLOCK', executed=True), dict(possible=False, executed=True),
                    dict(executed=False, outcome_occurred=True)):
            args = dict(action_id='a', worker_id='w', action='EDIT', capability='c', possible=True,
                        authorized='AUTO_EXECUTE', executed=True, outcome_occurred=None) | bad
            with self.assertRaises(ValueError):
                T.ActionRecord(**args)


class TracerTests(unittest.TestCase):
    def test_flag_off_refuses(self):
        with patch.dict(os.environ, {'JARVIS_ONE_MIND': ''}), tempfile.TemporaryDirectory() as d:
            with self.assertRaises(RuntimeError):
                T.Tracer(d, 'm')

    def test_replay_gives_identical_trace(self):
        def run(d):
            t = T.Tracer(d, 'm')
            t.emit('mission.goal', objective='fix')
            t.action(T.ActionRecord(t.next_id('action'), 'w', 'EDIT', 'software.build', True, 'AUTO_EXECUTE', True, True, 'test'))
            t.jev('stuck?', {'label': 'no'})
            return t.path.read_text()
        with patch.dict(os.environ, {'JARVIS_ONE_MIND': '1'}), tempfile.TemporaryDirectory() as a, \
                tempfile.TemporaryDirectory() as b:
            first, second = run(a), run(b)
            self.assertEqual(first, second)
            rows = T.Tracer(a, 'm').rows()
            self.assertEqual(rows[2]['authoritative'], False)
            self.assertEqual(len({r['span_id'] for r in rows}), 3)


if __name__ == '__main__':
    unittest.main()
