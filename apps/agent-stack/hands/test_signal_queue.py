"""Evens 2026-10-16: process the whole Watch Later reliably — a durable queue: priority order, free tier first, budget
guard, retries, resumes after restarts and credit outages, never does a video twice."""
import csv
import importlib.util
import tempfile
import unittest
from pathlib import Path
from unittest import mock

H = Path(__file__).parent
spec = importlib.util.spec_from_file_location("q_test", H / "signal_queue.py"); Q = importlib.util.module_from_spec(spec); spec.loader.exec_module(Q)


def triage_csv(d, rows):
    f = d / "triage.csv"
    with f.open("w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=["priority", "tier", "lens", "fps", "id", "title", "channel", "length", "seconds",
                                           "reason", "link", "evens_override"])
        w.writeheader(); w.writerows(rows)
    return f


def row(i, tier="deep", prio=1, secs=600, override=""):
    return {"priority": prio, "tier": tier, "lens": "learn", "fps": 1.0, "id": f"vid{i:08d}", "title": f"t{i}", "channel": "c",
            "length": "10:00", "seconds": secs, "reason": "", "link": f"https://www.youtube.com/watch?v=vid{i:08d}",
            "evens_override": override}


class Queue(unittest.TestCase):
    def setUp(self):
        self.d = Path(tempfile.mkdtemp())
        self.q = Q.Queue(self.d / "q.db")

    def test_sync_takes_watch_tiers_and_his_overrides_once(self):
        f = triage_csv(self.d, [row(1), row(2, "skip", 9), row(3, "later", 7, override="deep"), row(4, "light", 5)])
        self.assertEqual(self.q.sync(f, done=set()), 3)
        self.assertEqual(self.q.sync(f, done=set()), 0)         # never added twice
        self.assertEqual(self.q.counts()["queued"], 3)

    def test_highest_priority_first(self):
        f = triage_csv(self.d, [row(1, "light", 5), row(2, "deep", 1), row(3, "biz", 3)])
        self.q.sync(f, done=set())
        self.assertEqual(self.q.next()["id"], "vid00000002")

    def test_run_learns_retries_and_stops_at_the_budget(self):
        f = triage_csv(self.d, [row(1), row(2), row(3)])
        self.q.sync(f, done=set())
        calls = []
        class Wait(Exception):
            pass
        def ingest(url, force=False, lens="", fps=0.0):
            calls.append(url)
            if len(calls) == 1:
                return {"status": "DONE", "methods": 7}
            if len(calls) == 2:
                return {"status": "FAILED", "text": "temporary"}
            raise Wait("free tier full")
        got = self.q.run(ingest, budget_wait=Wait, max_videos=10)
        c = self.q.counts()
        self.assertEqual(c["done"], 1); self.assertEqual(got["stopped"], "budget/free tier: free tier full")
        self.assertEqual(self.q.get("vid00000002")["attempts"], 1); self.assertEqual(self.q.get("vid00000002")["state"], "queued")

    def test_a_video_failing_three_times_is_parked_as_failed(self):
        f = triage_csv(self.d, [row(1)])
        self.q.sync(f, done=set())
        for _ in range(3):
            self.q.run(lambda *a, **k: {"status": "FAILED", "text": "broken"}, budget_wait=RuntimeError, max_videos=1)
        self.assertEqual(self.q.get("vid00000001")["state"], "failed")

    def test_already_learned_videos_are_not_queued(self):
        f = triage_csv(self.d, [row(1), row(2)])
        self.assertEqual(self.q.sync(f, done={"vid00000001"}), 1)


    def test_items_another_agent_holds_are_passed_over_and_outcomes_reported(self):
        f = triage_csv(self.d, [row(1, prio=1), row(2, prio=2)])
        self.q.sync(f, done=set())
        reports = []
        got = self.q.run(lambda *a, **k: {"status": "DONE", "methods": 3}, budget_wait=RuntimeError, max_videos=5,
                         claim=lambda vid: vid != "vid00000001", report=lambda *a: reports.append(a))
        self.assertEqual(got["learned"], ["vid00000002"])
        self.assertEqual(self.q.get("vid00000001")["state"], "queued")   # left for the agent that holds it
        self.assertEqual(reports, [("vid00000002", "learned", "")])

    def test_a_pause_hands_the_claim_back(self):
        f = triage_csv(self.d, [row(1)])
        self.q.sync(f, done=set())
        reports = []
        class Wait(Exception):
            pass
        def ingest(*a, **k):
            raise Wait("quota")
        self.q.run(ingest, budget_wait=Wait, claim=lambda vid: True, report=lambda *a: reports.append(a))
        self.assertEqual(reports, [("vid00000001", "released", "")])


if __name__ == "__main__":
    unittest.main()
