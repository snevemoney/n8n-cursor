"""Actual Watch loop must preserve stroke failure; no GUI actions."""
import ast
from pathlib import Path
from types import SimpleNamespace
import unittest

class WatchLoopResultTest(unittest.TestCase):
    def run_loop(self, receipt, *, no_pick=False, pick=None, self_app=False):
        source = (Path(__file__).parent / 'pipeline.py').read_text()
        node = next(n for n in ast.parse(source).body if isinstance(n, ast.FunctionDef) and n.name == 'run_watch_loop')
        frame = SimpleNamespace(watch_allow_verb=lambda _: '', snap_frame=lambda _: {'state': {'app': 'Fixture'}},
            commit_watch_stroke=lambda *a, **kw: dict(receipt))
        scope = dict(Path=Path, FRAME=frame, ONLINE=None, SENSES=None, SEE=None, WATCH_LOOP_CAP=1,
            act_if_current=lambda *a, **kw: {}, _perceive_watch=lambda *a, **kw: {},
            load_json=lambda _: {}, _watch_front_app=lambda *a: 'Fixture', _focus_self_app=lambda _: self_app,
            is_hard_step=lambda *a: False, _vision_urls=lambda _: [], online_talk=lambda *a, **kw: {'spoken': 'Done. The file was saved.'},
            extract_pick=lambda _: None if no_pick else (pick or {'tool': 'mac_act', 'args': {'op': 'click'}}), _disarm_watch=lambda *a, **kw: None)
        exec(compile(ast.Module(body=[node], type_ignores=[]), 'actual-watch-loop', 'exec'), scope)
        return scope['run_watch_loop']('fixture task', hive=Path('/fixture'), gen=1)

    def test_failed_stroke_is_not_success(self):
        receipt = {'ok': False, 'spoken': 'Postcondition unchanged.', 'op': 'verify', 'hid': True}
        result = self.run_loop(receipt)
        self.assertFalse(result['ok'])
        self.assertEqual(result['stroke'], receipt)

    def test_success_keeps_executor_receipt(self):
        receipt = {'ok': True, 'spoken': 'Observed change.', 'op': 'click', 'hid': True}
        result = self.run_loop(receipt)
        self.assertTrue(result['ok'])
        self.assertEqual(result['stroke'], receipt)

    def test_prose_without_command_cannot_claim_execution(self):
        result = self.run_loop({}, no_pick=True)
        self.assertFalse(result['ok'])
        self.assertNotIn('The file was saved', result['spoken'])
        self.assertIn('No action was executed', result['spoken'])

    def test_model_stop_is_not_verified_task_completion(self):
        for pick in ({'tool': 'stop', 'speak': 'The file was saved.'}, {'tool': 'converse', 'speak': 'The file was saved.'}, {'tool': 'mac_act', 'args': {'op': 'stop'}, 'speak': 'The file was saved.'}):
            with self.subTest(pick=pick):
                result = self.run_loop({}, pick=pick)
                self.assertFalse(result['ok'])
                self.assertEqual(result['reason'], 'model_stopped_without_action')
                self.assertNotIn('The file was saved', result['spoken'])

    def test_unsupported_tool_cannot_claim_execution(self):
        result = self.run_loop({}, pick={'tool': 'file_save', 'speak': 'The file was saved.'})
        self.assertFalse(result['ok'])
        self.assertEqual(result['reason'], 'unsupported_watch_tool')
        self.assertNotIn('The file was saved', result['spoken'])

    def test_orb_self_observation_is_blocked_not_success(self):
        result = self.run_loop({}, self_app=True)
        self.assertFalse(result['ok'])
        self.assertEqual(result['reason'], 'no_action_receipt')

    def test_second_browser_hand_refusal_is_not_success(self):
        result = self.run_loop({}, pick={'tool': 'safari_see'})
        self.assertFalse(result['ok'])
        self.assertEqual(result['reason'], 'no_action_receipt')
