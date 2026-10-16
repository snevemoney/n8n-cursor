"""Evens 2026-10-16: control the screen like Codex/Claude computer use — clicks land where the model looked, every
action shows the result, and the session stays open so his next line continues the same agent."""
import importlib.util
import json
import tempfile
import threading
import time
import unittest
from pathlib import Path
from unittest import mock

H = Path(__file__).parent
spec = importlib.util.spec_from_file_location("cu_test", H / "computer_use.py"); CU = importlib.util.module_from_spec(spec); spec.loader.exec_module(CU)
spec = importlib.util.spec_from_file_location("op_cu_test", H / "operator.py"); O = importlib.util.module_from_spec(spec); spec.loader.exec_module(O)

BUILTIN = {"n": 2, "x": 143, "y": 1080, "w": 1512, "h": 982}


class Mapping(unittest.TestCase):
    def test_pixel_of_scaled_shot_maps_to_global_point_on_second_display(self):
        s = CU.image_scale(BUILTIN)
        self.assertAlmostEqual(s, 1280 / 1512)
        self.assertEqual(CU.to_global(BUILTIN, 640, 100), (143 + round(640 / s), 1080 + round(100 / s)))
        self.assertEqual(CU.to_image(BUILTIN, *CU.to_global(BUILTIN, 640, 100)), (640, 100))

    def test_requests(self):
        self.assertEqual(CU.hands_request("double_click", {"coordinate": [0, 0]}, BUILTIN)["count"], 2)
        self.assertEqual(CU.hands_request("scroll", {"scroll_direction": "down", "scroll_amount": 5}, BUILTIN)["dy"], -5)
        self.assertEqual(CU.hands_request("key", {"text": "cmd+l"}, BUILTIN), {"op": "key", "keys": "cmd+l"})


class ComputerTool(unittest.TestCase):
    def test_click_glides_cursor_clicks_and_returns_a_fresh_shot(self):
        t = O.Tools(Path(tempfile.mkdtemp()))
        sent = []
        with mock.patch.object(O, "live_screens", return_value=([BUILTIN], [])), \
             mock.patch.object(O.Tools, "_show_cursor") as cur, \
             mock.patch.object(O.Tools, "_hands", side_effect=lambda r: sent.append(r) or {"text": "ok"}), \
             mock.patch.object(O.Tools, "_shot", return_value={"text": "Did left_click. shot", "image": "data:x"}), \
             mock.patch.object(CU, "settle"):
            got = t.computer({"action": "left_click", "coordinate": [640, 100]})
        x, y = CU.to_global(BUILTIN, 640, 100)
        cur.assert_called_once_with(x, y)
        self.assertEqual(sent, [{"op": "click", "x": x, "y": y, "count": 1, "button": "left"}])
        self.assertEqual(got["image"], "data:x")

    def test_looking_is_not_repetition(self):
        hive = Path(tempfile.mkdtemp())
        with mock.patch.object(O, "_jev_tier", return_value={"tier": "mid", "conf": 0.9}):
            task = O.Task.create(hive, "look")
        shots = [{"ok": True, "calls": [{"tool": "computer", "args": {"action": "screenshot"}, "call_id": f"c{i}"}]} for i in range(6)]
        rounds = iter(shots + [{"ok": True, "calls": [{"tool": "done", "args": {"summary": "seen"}, "call_id": "z"}]}])
        with mock.patch.object(O.Tools, "computer", return_value={"text": "shot", "image": "data:x"}):
            st = O.run(task.path, model_fn=lambda m, tools: next(rounds))
        self.assertEqual(st["status"], "DONE")


class LiveSession(unittest.TestCase):
    def test_idle_session_resumes_on_his_next_line(self):
        hive = Path(tempfile.mkdtemp())
        with mock.patch.object(O, "_jev_tier", return_value={"tier": "mid", "conf": 0.9}):
            task = O.Task.create(hive, "open spotify")
        msgs = task.read("messages.json")

        def his_line():
            time.sleep(0.3)
            m = task.read("messages.json"); m.append({"role": "user", "content": "now pause it"}); task.write("messages.json", m)
        threading.Thread(target=his_line).start()
        with mock.patch.object(O, "IDLE_S", 5):
            self.assertTrue(O._idle_until_spoken_to(task))
        self.assertEqual(task.read("state.json")["status"], "RUNNING")
        self.assertGreater(len(task.read("messages.json")), len(msgs))

    def test_idle_session_ends_after_the_idle_time(self):
        hive = Path(tempfile.mkdtemp())
        with mock.patch.object(O, "_jev_tier", return_value={"tier": "mid", "conf": 0.9}):
            task = O.Task.create(hive, "x")
        with mock.patch.object(O, "IDLE_S", 0.5):
            self.assertFalse(O._idle_until_spoken_to(task))


if __name__ == "__main__":
    unittest.main()
