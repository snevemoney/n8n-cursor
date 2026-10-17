"""Owner canvas 'Scheduled loops' + honesty audit 2026-10-16: a registered loop really runs; nothing claims it runs
when no runner is alive; expired loops are not listed as active."""
import importlib.util
import os
import tempfile
import threading
import unittest
from datetime import datetime, timedelta
from pathlib import Path
from unittest import mock

STACK = Path(__file__).resolve().parents[1]


def _load(name, rel):
    spec = importlib.util.spec_from_file_location(name, STACK / rel)
    mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
    return mod


class LoopRunner(unittest.TestCase):
    def setUp(self):
        env = mock.patch.dict(os.environ, {"JARVIS_LOOPS_FILE": str(Path(tempfile.mkdtemp()) / "loops.json")})
        env.start(); self.addCleanup(env.stop)
        self.L = _load("agent_stack_loop_test", "hands/loop.py")
        self.R = _load("agent_stack_loop_runner_test", "hands/loop_runner.py")

    def test_without_runner_the_reply_says_not_running(self):
        got = self.L.run({"op": "start", "what": "checks disk space", "every_min": 10})
        self.assertTrue(got["ok"]); self.assertIn("not running", got["spoken"])

    def test_tick_runs_due_loops_counts_and_notifies_on_change(self):
        self.L.run({"op": "start", "what": "checks disk space", "every_min": 10})
        cards = []
        ran = self.R.tick(self.L, notify=cards.append, checker=lambda w: (True, "40 GB free"))
        self.assertEqual(len(ran), 1); self.assertEqual(ran[0]["runs"], 1); self.assertEqual(len(cards), 1)
        self.assertEqual(self.R.tick(self.L, notify=cards.append, checker=lambda w: (True, "40 GB free")), [])  # not due yet
        later = datetime.now() + timedelta(minutes=11)
        self.R.tick(self.L, now=later, notify=cards.append, checker=lambda w: (True, "40 GB free"))
        self.assertEqual(len(cards), 1)  # same answer: no new card
        self.assertIn("checks it on schedule", self.L.run({"op": "start", "what": "checks battery", "every_min": 10})["spoken"])

    def test_expired_and_unsupported(self):
        self.L.run({"op": "start", "what": "checks disk space", "every_min": 10})
        self.R.tick(self.L, now=datetime.now() + timedelta(hours=25), checker=lambda w: (True, "x"))
        self.assertEqual(self.L.run({"op": "list"})["spoken"], "No active loops.")
        self.assertIsNone(self.R.check("checks the weather")[0])

    def test_concurrent_starts_do_not_lose_rows(self):
        errs = []

        def start(i):
            try:
                self.L.run({"op": "start", "what": f"checks disk space {i}", "every_min": 10})
            except Exception as exc:  # noqa: BLE001
                errs.append(exc)
        ts = [threading.Thread(target=start, args=(i,)) for i in range(6)]
        [t.start() for t in ts]; [t.join() for t in ts]
        self.assertEqual(errs, []); self.assertEqual(len(self.L._load()), 6)


if __name__ == "__main__":
    unittest.main()


class MorningBrief(unittest.TestCase):  # Z20 / X36: a daily brief at a set time from his own files, missed time runs later
    def setUp(self):
        global L, R
        L = _load("agent_stack_loop_test_b", "hands/loop.py")
        R = _load("agent_stack_loop_runner_test_b", "hands/loop_runner.py")

    def test_daily_brief_runs_once_after_its_time_and_catches_up(self):
        from datetime import datetime
        d = Path(tempfile.mkdtemp())
        with mock.patch.dict(os.environ, {"JARVIS_LOOPS_FILE": str(d / "loops.json")}):
            got = L.run({"op": "start", "what": "reports my morning brief", "at": "06:00"})
            self.assertTrue(got["ok"], got); self.assertIn("every day at 06:00", got["spoken"])
            calls = []
            chk = lambda w: (calls.append(w), (True, "brief text"))[1]
            self.assertEqual(R.tick(L, now=datetime(2026, 10, 18, 5, 59), checker=chk), [])
            self.assertEqual(len(R.tick(L, now=datetime(2026, 10, 18, 9, 30), checker=chk)), 1)   # Mac asleep at 6: runs at 9:30
            self.assertEqual(R.tick(L, now=datetime(2026, 10, 18, 10, 0), checker=chk), [])      # once a day
            self.assertEqual(len(R.tick(L, now=datetime(2026, 10, 19, 6, 1), checker=chk)), 1)
            self.assertEqual(L.run({"op": "start", "what": "reports my morning brief", "at": "25:00"})["ok"], False)

    def test_brief_reads_his_files(self):
        d = Path(tempfile.mkdtemp()); (d / "Ops Watch").mkdir()
        (d / "Decisions Needed.md").write_text("- 2026-10-17 03:20 (Claude Code): OpenRouter is at $0.\n")
        (d / "Ops Watch" / "STATUS.md").write_text("| | Item | Detail | Fix | Owner |\n|---|---|---|---|---|\n| 🔴 RED | No backup | d | f | Evens |\n| 🟠 AMBER | Disk full | d | f | Evens |\n| 🟢 GREEN | Jarvis up | | | |\n")
        with mock.patch.object(R, "PRIVATE", d), mock.patch.object(R, "SHARED", d):
            ok, text = R.check("reports my morning brief")
        self.assertTrue(ok); self.assertIn("1 decisions wait", text); self.assertIn("OpenRouter is at $0", text); self.assertIn("1 red: No backup.", text); self.assertIn("1 amber, 1 of them yours", text)
