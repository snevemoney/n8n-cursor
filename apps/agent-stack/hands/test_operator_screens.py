"""Live 2026-10-16: Safari was on the MacBook screen, the screenshot only showed the main display, and the loop
re-opened Spotify 18 times. The screenshot follows the front window's display; repeating an action gets a brake."""
import importlib.util
import tempfile
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location("agent_stack_operator_screens", Path(__file__).with_name("operator.py"))
O = importlib.util.module_from_spec(spec); spec.loader.exec_module(O)

# his real layout 10-16: external main 1920x1080 at (0,0); built-in 1512x982 below it, Cocoa origin (143,-982)
DISPLAYS = O.displays_from_cocoa([(0, 0, 1920, 1080), (143, -982, 1512, 982)])
WINDOWS = [("WindowManager", (-7, 228, 66, 82)), ("Safari", (364, 1158, 1070, 860)), ("System Settings", (590, 243, 740, 625))]


class Screens(unittest.TestCase):
    def test_cocoa_frames_become_top_left_boxes(self):
        self.assertEqual(DISPLAYS[0], {"n": 1, "x": 0, "y": 0, "w": 1920, "h": 1080})
        self.assertEqual(DISPLAYS[1], {"n": 2, "x": 143, "y": 1080, "w": 1512, "h": 982})

    def test_front_window_picks_its_display(self):
        self.assertEqual(O.pick_display(DISPLAYS, WINDOWS)["n"], 2)

    def test_app_and_index_override(self):
        self.assertEqual(O.pick_display(DISPLAYS, WINDOWS, app="System Settings")["n"], 1)
        self.assertEqual(O.pick_display(DISPLAYS, WINDOWS, index=1)["n"], 1)


class Brake(unittest.TestCase):
    def test_third_repeat_gets_a_nudge_fifth_stops(self):
        t = O.Task.create(Path(tempfile.mkdtemp()), "x")
        call = ("shell", {"command": "open -a Safari https://open.spotify.com"})
        self.assertIsNone(O.repetition(t, *call)); self.assertIsNone(O.repetition(t, *call))
        self.assertEqual(O.repetition(t, *call), "nudge")
        O.repetition(t, *call)
        self.assertEqual(O.repetition(t, *call), "stop")

    def test_different_actions_are_fine(self):
        t = O.Task.create(Path(tempfile.mkdtemp()), "x")
        for i in range(6):
            self.assertIsNone(O.repetition(t, "mouse", {"action": "click", "x": i, "y": 1}))


if __name__ == "__main__":
    unittest.main()
