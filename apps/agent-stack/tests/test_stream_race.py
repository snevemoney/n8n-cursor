import json, sys, threading, time, unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from brain import online


class FakeRes:
    def __init__(self, chunks, first_delay=0.0, gap=0.0):
        self.chunks, self.first, self.gap, self.closed = chunks, first_delay, gap, False

    def __iter__(self):
        time.sleep(self.first)
        for i, c in enumerate(self.chunks):
            if self.closed:
                return
            if i:
                time.sleep(self.gap)
            yield ("data: " + json.dumps({"choices": [{"delta": {"content": c}, "finish_reason": None}]}) + "\n").encode()
        yield b"data: [DONE]\n"

    def close(self):
        self.closed = True


class StreamRaceTests(unittest.TestCase):
    def _race(self, a, b, hedge=0.2, timeout=5.0):
        res = {"A": a, "B": b}
        opened = []

        def opener(body, budget):
            opened.append(body["model"])
            return res[body["model"]]

        said = []
        t = time.monotonic()
        text, finish, win = online.raced_stream(
            [("A", {"model": "A"}), ("B", {"model": "B"})], headers={}, timeout=timeout, hedge=hedge,
            sink=said.append, opener=opener,
        )
        return text, win, said, time.monotonic() - t, opened

    def test_fast_primary_wins_backup_never_opened(self):
        text, win, said, took, opened = self._race(FakeRes(["Hello sir. ", "Second line."], 0.01), FakeRes(["x."]))
        self.assertEqual((win, opened), ("A", ["A"]))
        self.assertEqual(text, "Hello sir. Second line.")
        self.assertEqual(said, ["Hello sir.", "Second line."])

    def test_slow_primary_loses_to_backup_and_is_closed(self):
        slow = FakeRes(["Late."], first_delay=2.0)
        text, win, said, took, opened = self._race(slow, FakeRes(["Backup here. ", "Done."], 0.05))
        self.assertEqual(win, "B")
        self.assertEqual(text, "Backup here. Done.")
        self.assertLess(took, 1.5)
        self.assertTrue(slow.closed)

    def test_first_sentence_reaches_sink_before_reply_ends(self):
        stamps = []
        res = FakeRes(["First words. ", "More ", "text ", "later."], 0.05, gap=0.4)
        t0 = time.monotonic()
        online.raced_stream([("A", {"model": "A"})], headers={}, timeout=5, hedge=9,
                            sink=lambda s: stamps.append(time.monotonic() - t0), opener=lambda b, x: res)
        self.assertLess(stamps[0], 0.4)
        self.assertGreater(time.monotonic() - t0, 1.0)

    def test_streamed_unbacked_claims_withheld(self):
        _, _, said, _, _ = self._race(
            FakeRes(["Good evening. ", "All my core tools are operational. ", "I'm operational and ready to assist. ", "What next?"], 0.01),
            FakeRes(["x."]),
        )
        self.assertEqual(said, ["Good evening.", "What next?"])

    def test_nobody_answers_raises_timeout_within_budget(self):
        t = time.monotonic()
        with self.assertRaises(TimeoutError):
            self._race(FakeRes(["a."], first_delay=3), FakeRes(["b."], first_delay=3), hedge=0.1, timeout=0.8)
        self.assertLess(time.monotonic() - t, 1.5)


class FirstTokenCapTests(unittest.TestCase):
    def test_no_first_token_gives_up_at_cap(self):
        from unittest import mock
        stall = FakeRes(["late."], first_delay=5)
        with mock.patch.dict("os.environ", {"JARVIS_TALK_FIRST_TOKEN_SEC": "1"}):
            t = time.monotonic()
            with self.assertRaises(TimeoutError):
                online.raced_stream([("A", {"model": "A"})], headers={}, timeout=20, hedge=9, opener=lambda b, x: stall)
        self.assertLess(time.monotonic() - t, 1.6)


class TrimTests(unittest.TestCase):
    def test_history_and_shared_block_caps(self):
        from brain import pipeline
        self.assertLessEqual(pipeline.HISTORY_TURNS, 8)
        self.assertLessEqual(online.SHARED_BLOCK_CHARS, 12000)
        turns = [{"user": f"u{i}", "jarvis": "x" * 2000} for i in range(20)]
        brief = pipeline.sitting_brief(turns, {}, utterance="hello")
        self.assertNotIn("u10", brief)
        self.assertNotIn("x" * 400, brief)


if __name__ == "__main__":
    unittest.main()
