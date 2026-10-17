"""Restart and silent-failure audits 2026-10-16: what survives a Face restart, and which fallbacks failed open."""
import importlib.util
import json
import sys
import tempfile
import time
import unittest
from pathlib import Path
from unittest.mock import patch

HERE = Path(__file__).resolve().parent
STACK = HERE.parent
spec = importlib.util.spec_from_file_location('restart_pipeline', HERE / 'pipeline.py')
P = importlib.util.module_from_spec(spec); spec.loader.exec_module(P)


def _mod(name, rel):
    s = importlib.util.spec_from_file_location(name, STACK / rel)
    m = importlib.util.module_from_spec(s); s.loader.exec_module(m)
    return m


class ConfirmAcrossRestartTests(unittest.TestCase):
    def test_a_confirm_armed_before_a_restart_never_fires(self):
        with tempfile.TemporaryDirectory() as tmp:
            hive = Path(tmp)
            P.confirm_arm(hive, 'code_run', {'code': 'print(1)'}, 'run something')
            row = json.loads((hive / 'bus' / 'pending_confirm.json').read_text())
            row['boot'] = 'an-earlier-process'
            (hive / 'bus' / 'pending_confirm.json').write_text(json.dumps(row))
            got = P.confirm_take(hive, 'yes')
            self.assertEqual(got['tool'], 'say')
            self.assertIn('restarted', got['speak'])
            self.assertFalse((hive / 'bus' / 'pending_confirm.json').exists())

    def test_same_process_confirm_still_runs(self):
        with tempfile.TemporaryDirectory() as tmp:
            hive = Path(tmp)
            P.confirm_arm(hive, 'code_run', {'code': 'print(1)'}, 'run something')
            got = P.confirm_take(hive, 'yes')
            self.assertEqual(got['tool'], 'code_run')
            self.assertTrue(got['args']['_confirmed'])

    def test_boot_id_is_shared_by_reloaded_copies(self):
        other = importlib.util.module_from_spec(importlib.util.spec_from_file_location('restart_pipeline_2', HERE / 'pipeline.py'))
        self.assertEqual(sys._jarvis_boot_id, P.boot_id())
        log = _mod('restart_turn_log', 'memory/turn_log.py')
        self.assertEqual(log._BOOT_ID, P.boot_id())
        del other


class GenFloorTests(unittest.TestCase):
    def test_a_corrupt_bus_does_not_restart_gens_at_one(self):
        bus = _mod('restart_bus_io', 'memory/bus_io.py')
        with tempfile.TemporaryDirectory() as tmp:
            hive = Path(tmp)
            for _ in range(5):
                bus.begin_turn(hive)
            (hive / 'bus' / 'state.json').write_text('{not json')
            self.assertEqual(bus.begin_turn(hive), 6)


class HandoffCounterTests(unittest.TestCase):
    def test_resume_cap_applies_and_hands_add_up(self):
        with tempfile.TemporaryDirectory() as tmp:
            hive = Path(tmp)
            r = lambda n: [{'hand': 'web_search', 'op_key': f'k{i}', 'result': {'ok': True}} for i in range(n)]
            first = P._hand_loop_handoff_save(hive, 1, 'research it', r(4), 'hand_limit')
            self.assertEqual((first['parts'], first['hands']), (1, 4))
            entry = P._hand_loop_handoff_load(hive)
            second = P._hand_loop_handoff_save(hive, 2, 'research it', r(8), 'hand_limit', prev=entry)
            self.assertEqual((second['parts'], second['hands']), (2, 8))
            entry = P._hand_loop_handoff_load(hive)
            for n in range(3, 7):
                entry = dict(entry, parts=n)
            self.assertIsNone(P._hand_loop_handoff_save(hive, 3, 'research it', r(8), 'hand_limit', prev=dict(entry, parts=6)))

    def test_a_crash_mid_resume_keeps_the_paused_request(self):
        with tempfile.TemporaryDirectory() as tmp:
            hive = Path(tmp)
            P._hand_loop_handoff_save(hive, 1, 'research it', [{'hand': 'web_search', 'result': {'ok': True}}], 'hand_limit')
            entry = P._hand_loop_handoff_load(hive)
            self.assertTrue((hive / 'hand-loop' / 'handoff.json').exists())  # loading does not consume it
            P._hand_loop_handoff_done(hive, entry)
            self.assertFalse((hive / 'hand-loop' / 'handoff.json').exists())


class StrandedMissionTests(unittest.TestCase):
    def test_a_mission_whose_worker_died_is_reported_not_marked_done(self):
        tb = _mod('restart_task_board', 'hands/task_board.py')
        with tempfile.TemporaryDirectory() as tmp:
            hive = Path(tmp)
            d = hive / 'coding-missions' / ('b' * 32); d.mkdir(parents=True)
            (d / 'state.json').write_text(json.dumps({'status': 'RUNNING'}))
            (d / 'request.json').write_text(json.dumps({'objective': 'add a login page'}))
            cards = tb.stranded(hive, coding_status=lambda mid: {'status': 'UNAVAILABLE', 'worker_liveness': 'unavailable'})
            self.assertEqual(len(cards), 1)
            self.assertIn('add a login page', cards[0]['body']); self.assertIn('resume the coding task', cards[0]['body'])
            self.assertFalse((d / 'result.json').exists())
            alive = tb.stranded(hive, coding_status=lambda mid: {'status': 'RUNNING', 'worker_liveness': 'alive'})
            self.assertEqual(alive, [])


class FailClosedTests(unittest.TestCase):
    def test_receipt_redaction_withholds_when_the_detector_is_gone(self):
        with patch.object(P.hooks, 'redact', side_effect=RuntimeError('detector missing')):
            self.assertEqual(P._receipt_redact('key: abc'), '[withheld]')

    def test_unreadable_loop_list_is_not_reported_as_no_loops(self):
        loop = _mod('restart_loop', 'hands/loop.py')
        with tempfile.TemporaryDirectory() as tmp:
            f = Path(tmp) / 'loops.json'
            with patch.dict('os.environ', {'JARVIS_LOOPS_FILE': str(f)}):
                self.assertEqual(loop.load_checked(), ([], True))
                f.write_text('{broken')
                self.assertEqual(loop.load_checked(), ([], False))


if __name__ == '__main__':
    unittest.main()
