"""Watch clicks show Jarvis's blue cursor gliding to the target, then a click ripple."""
import importlib.util
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest import mock

_spec = importlib.util.spec_from_file_location("agent_stack_see_cursor_test", Path(__file__).with_name("see.py"))
S = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(S)


class WatchCursor(unittest.TestCase):
    def test_glide_starts_cursor_from_his_pointer_and_waits(self):
        calls = []
        fake = SimpleNamespace(live=lambda: True, cursor_display=lambda: {"cursor": (10, 20)}, GLIDE_SEC=0,
                               cursor_start=lambda frm, to, hold: calls.append((frm, to, hold)) or True)
        with mock.patch.object(S, "_pointer_hand", return_value=fake):
            self.assertTrue(S._jarvis_cursor_glide(300.0, 400.0))
        self.assertEqual(calls, [((10, 20), (300.0, 400.0), 3)])

    def test_outside_live_face_no_cursor_and_no_error(self):
        fake = SimpleNamespace(live=lambda: False)
        with mock.patch.object(S, "_pointer_hand", return_value=fake):
            self.assertFalse(S._jarvis_cursor_glide(1.0, 2.0))

    def test_cursor_fault_never_blocks(self):
        with mock.patch.object(S, "_pointer_hand", side_effect=RuntimeError("no swiftc")):
            self.assertFalse(S._jarvis_cursor_glide(1.0, 2.0))
            S._jarvis_cursor_signal("USR1")


if __name__ == "__main__":
    unittest.main()
