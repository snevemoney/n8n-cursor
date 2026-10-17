"""Evens 10-16: one shared list of every signal (Watch Later + X bookmarks) that all agents read before touching a link:
one row per video/post id, stages new -> sorted/later/skipped -> taken -> learned/failed, a 'taken' claim that expires."""
import importlib.util
import tempfile
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location("ledger_t", Path(__file__).with_name("signal_ledger.py"))
L = importlib.util.module_from_spec(spec); spec.loader.exec_module(L)

YT = "https://www.youtube.com/watch?v=abcdefghijk"


class Ids(unittest.TestCase):
    def test_every_form_of_a_link_is_one_row(self):
        rows = {}
        L.add(rows, YT, title="t")
        L.add(rows, "https://youtu.be/abcdefghijk?t=30", title="other")
        L.add(rows, YT + "&list=WL&t=5s")
        self.assertEqual(list(rows), ["abcdefghijk"])
        self.assertEqual(rows["abcdefghijk"]["title"], "t")          # adding never overwrites
        L.add(rows, "https://x.com/someone/status/2088007687149601254", source="x")
        L.add(rows, "https://twitter.com/other/status/2088007687149601254?s=20")
        self.assertIn("x-2088007687149601254", rows); self.assertEqual(len(rows), 2)


class Flow(unittest.TestCase):
    def setUp(self):
        self.rows = {}
        for i, p in ((1, 5), (2, 1), (3, 3)):
            L.add(self.rows, f"https://www.youtube.com/watch?v=vid{i:08d}", title=f"t{i}")
            L.sort_into(self.rows, f"vid{i:08d}", "sorted", priority=p)

    def test_take_gives_highest_priority_and_never_the_same_item_twice(self):
        a = L.take(self.rows, "jarvis", now=100)
        b = L.take(self.rows, "grok", now=100)
        self.assertEqual((a["id"], b["id"]), ("vid00000002", "vid00000003"))
        self.assertEqual(self.rows["vid00000002"]["owner"], "jarvis")

    def test_a_silent_claim_expires_after_six_hours(self):
        L.take(self.rows, "grok", now=0)
        self.assertEqual(L.take(self.rows, "jarvis", now=L.CLAIM_S - 1)["id"], "vid00000003")
        self.assertEqual(L.take(self.rows, "cursor", now=L.CLAIM_S + 1)["id"], "vid00000002")

    def test_learned_points_to_the_packet_and_failures_retry_then_park(self):
        L.take(self.rows, "jarvis", now=1)
        L.finish(self.rows, "vid00000002", "jarvis", "learned", result="packets/vid00000002")
        self.assertEqual(self.rows["vid00000002"]["status"], "learned")
        for _ in range(L.MAX_ATTEMPTS):
            L.take(self.rows, "jarvis", now=2, only="vid00000003")
            L.finish(self.rows, "vid00000003", "jarvis", "failed", error="boom")
        self.assertEqual(self.rows["vid00000003"]["status"], "failed")
        self.assertEqual(self.rows["vid00000003"]["error"], "boom")

    def test_only_the_owner_can_finish_a_taken_item(self):
        L.take(self.rows, "grok", now=1)
        with self.assertRaises(ValueError):
            L.finish(self.rows, "vid00000002", "jarvis", "learned")

    def test_sorting_never_moves_an_item_backwards(self):
        L.take(self.rows, "jarvis", now=1)
        L.finish(self.rows, "vid00000002", "jarvis", "learned")
        L.sort_into(self.rows, "vid00000002", "sorted", priority=1)
        self.assertEqual(self.rows["vid00000002"]["status"], "learned")


class File(unittest.TestCase):
    def test_round_trip_is_stable_and_sorted_by_id(self):
        d = Path(tempfile.mkdtemp()); f = d / "SIGNALS.csv"
        rows = {}
        L.add(rows, "https://www.youtube.com/watch?v=zzzzzzzzzzz"); L.add(rows, YT)
        L.save(f, rows)
        again = L.load(f)
        self.assertEqual(list(again), ["abcdefghijk", "zzzzzzzzzzz"])
        L.save(f, again)
        self.assertEqual(f.read_text(), f.read_text())
        self.assertEqual(L.counts(again)["youtube"]["new"], 2)

    def test_sync_seeds_from_watch_later_triage_and_learned_packets(self):
        rows = {}
        wl = [{"id": "aaaaaaaaaaa", "link": "https://www.youtube.com/watch?v=aaaaaaaaaaa", "title": "A"},
              {"id": "bbbbbbbbbbb", "link": "https://www.youtube.com/watch?v=bbbbbbbbbbb", "title": "B"},
              {"id": "ccccccccccc", "link": "https://www.youtube.com/watch?v=ccccccccccc", "title": "C"}]
        triage = [{"id": "aaaaaaaaaaa", "tier": "deep", "priority": "1", "evens_override": ""},
                  {"id": "bbbbbbbbbbb", "tier": "skip", "priority": "9", "evens_override": ""},
                  {"id": "ccccccccccc", "tier": "later", "priority": "7", "evens_override": "studio"}]
        L.sync(rows, wl, triage, learned={"aaaaaaaaaaa": "packets/aaaaaaaaaaa", "x-1": "packets/x-1", "web-example-com-a": "packets/web-example-com-a", "job-cards": "packets/job-cards"})
        self.assertEqual(sorted(r["status"] for r in rows.values() if r["source"] == "web"), ["learned"])  # no stray row
        self.assertEqual(rows["aaaaaaaaaaa"]["status"], "learned")
        self.assertEqual(rows["bbbbbbbbbbb"]["status"], "skipped")
        self.assertEqual(rows["ccccccccccc"]["status"], "sorted")    # his override wins
        self.assertEqual(rows["x-1"]["source"], "x")


class TwoAgents(unittest.TestCase):  # Grok on the box and Jarvis on the Mac share the list through git
    def test_two_copies_never_claim_the_same_item(self):
        import subprocess
        d = Path(tempfile.mkdtemp())
        g = lambda *a, cwd=d: subprocess.run(["git", *a], cwd=cwd, check=True, capture_output=True)
        g("init", "-q", "--bare", "-b", "jarvis/signals", "origin.git")
        g("clone", "-q", str(d / "origin.git"), "a")
        a, b = d / "a", d / "b"
        for k, v in (("user.email", "t@t"), ("user.name", "t")):
            g("config", k, v, cwd=a)
        g("checkout", "-q", "-b", "jarvis/signals", cwd=a)
        rows = {}
        for i in (1, 2):
            L.add(rows, f"https://www.youtube.com/watch?v=vid{i:08d}")
            L.sort_into(rows, f"vid{i:08d}", "sorted", priority=i)
        L.save(a / L.REL, rows)
        g("add", ".", cwd=a); g("commit", "-q", "-m", "seed", cwd=a); g("push", "-q", "origin", "jarvis/signals", cwd=a)
        g("clone", "-q", "-b", "jarvis/signals", str(d / "origin.git"), "b")
        for k, v in (("user.email", "t@t"), ("user.name", "t")):
            g("config", k, v, cwd=b)
        first = L.shared(a, lambda r: dict(L.take(r, "jarvis")), "a takes")
        second = L.shared(b, lambda r: dict(L.take(r, "grok")), "b takes")   # b is behind; it pulls first
        self.assertEqual((first["id"], second["id"]), ("vid00000001", "vid00000002"))
        self.assertEqual(L.load(b / L.REL)["vid00000001"]["owner"], "jarvis")


if __name__ == "__main__":
    unittest.main()
