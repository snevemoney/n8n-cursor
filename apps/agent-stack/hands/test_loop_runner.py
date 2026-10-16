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
