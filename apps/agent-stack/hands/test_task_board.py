"""Owner canvas C01 (voice task board, 2026-10-16): one honest answer from the real mission and loop state."""
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location("agent_stack_task_board_test", Path(__file__).with_name("task_board.py"))
T = importlib.util.module_from_spec(spec); spec.loader.exec_module(T)


class TaskBoard(unittest.TestCase):
    def _mission(self, hive, kind, mid, state, objective="add a health endpoint"):
        d = hive / kind / mid; d.mkdir(parents=True)
        (d / "state.json").write_text(json.dumps(state)); (d / "request.json").write_text(json.dumps({"objective": objective}))

    def test_board_reads_status_through_the_owner_check(self):
        hive = Path(tempfile.mkdtemp())
        self._mission(hive, "coding-missions", "a" * 32, {"status": "RUNNING", "progress": {"what": "running tests"}})
        self._mission(hive, "coding-missions", "b" * 32, {"status": "COMPLETED"})
        self._mission(hive, "browser-missions", "c" * 32, {"status": "QUEUED"}, "compare keyboard prices")
        dead = lambda mid: {"status": "FAILED"} if mid.startswith("c") else json.loads((hive / "coding-missions" / mid / "state.json").read_text())
        got = T.board(hive, coding_status=dead, browser_status=dead,
                      loops=[{"status": "active", "what": "checks disk space", "every_min": 10, "runs": 2, "max_runs": 36}])
        self.assertIn("coding task aaaaaaaa (add a health endpoint) is running: running tests", got["spoken"])
        self.assertIn("loop: checks disk space every 10 min, run 2 of 36", got["spoken"])
        self.assertNotIn("browser research cccccccc", got["spoken"].split("Recently")[0])  # its worker is gone: finished FAILED
        self.assertIn("Recently finished", got["spoken"])

    def test_empty(self):
        self.assertEqual(T.board(Path(tempfile.mkdtemp()))["spoken"], "Nothing is running right now.")

    def test_wants(self):
        for u in ("what are all my jobs", "what's running right now", "what are you working on?"):
            self.assertTrue(T.wants(u), u)
        for u in ("what are the odds", "what jobs are hiring nurses", "I'm working on it"):
            self.assertFalse(T.wants(u), u)


class Modes(unittest.TestCase):
    def test_modes_read_the_switches(self):
        got = T.modes({"mic": "mute", "watch": {"armed": True}, "eyes": {}}, open_access=True)
        self.assertEqual(got["spoken"], "Right now the mic is muted, screen watch is on, the camera is off and open access is on.")
        self.assertIn("unknown state", T.modes({}, open_access=False)["spoken"])

    def test_wants_modes(self):
        self.assertTrue(T.wants_modes("are you listening?")); self.assertFalse(T.wants_modes("can you see my screen"))


class Drop(unittest.TestCase):
    def test_drop_line(self):
        got = T.drop_line({"drop": {"name": "invoice.pdf", "mime": "application/pdf", "bytes": 204800}})
        self.assertTrue(got["ok"]); self.assertIn("invoice.pdf, a PDF of 200 KB", got["spoken"])
        self.assertFalse(T.drop_line({})["ok"])
        self.assertEqual(T.wants_drop("what file did I just drop?"), "what")
        self.assertEqual(T.wants_drop("summarize the pdf I dropped"), "read")
        self.assertEqual(T.wants_drop("I dropped my phone"), "")


if __name__ == "__main__":
    unittest.main()
