"""PR #619: 'continue' resumes a soft-deadline cut exactly where it stopped; the backup request
after the first-token mark is streamed, so the soft deadline can end it mid-reply."""
import json, os, sys, tempfile, time, unittest
from pathlib import Path
from unittest import mock

os.environ.setdefault("AGENT_STACK_DRY_TTS", "1")
os.environ.setdefault("AGENT_STACK_CURSOR_DRY", "1")
os.environ.setdefault("JARVIS_JEV_LIVE", "0")
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from brain import online, pipeline  # noqa: E402
from memory import turn_log  # noqa: E402

resume = pipeline.RESUME  # the pipeline's own instance (loaded by path), so state is shared

ASK = "Tell me the long story of the lighthouse keeper."
SAID = "The keeper climbed the stairs every night. He wound the lens by hand."


def _hive(tmp):
    hive = Path(tmp)
    (hive / "bus").mkdir(parents=True)
    (hive / "vault").mkdir()
    return hive


class ResumeModuleTests(unittest.TestCase):
    def test_continue_phrases(self):
        for t in ("continue", "Continue.", "ok, continue", "go on", "keep going please", "Jarvis, continue",
                  "carry on, sir", "pick up where you left off", "finish your answer"):
            self.assertTrue(resume.is_continue(t), t)
        for t in ("continue the deploy to prod", "what is continue in python?", "tell me a story", "", "go on a trip"):
            self.assertFalse(resume.is_continue(t), t)

    def test_store_take_ttl_and_clear(self):
        resume.store("k", ask=ASK, said=SAID)
        self.assertEqual(resume.pending("k")["said"], SAID)
        self.assertIsNone(resume.pending("k", now=time.monotonic() + resume.ttl_sec() + 1))
        resume.store("k", ask=ASK, said=SAID)
        self.assertEqual(resume.take("k")["ask"], ASK)
        self.assertIsNone(resume.take("k"))
        resume.store("k", ask=ASK, said=SAID); resume.clear("k")
        self.assertIsNone(resume.pending("k"))

    def test_off_switch(self):
        with mock.patch.dict(os.environ, {"JARVIS_RESUME": "0"}):
            self.assertIsNone(resume.store("off", ask=ASK, said=SAID))

    def test_prompt_carries_exact_stop_point(self):
        p = resume.continue_prompt({"ask": ASK, "said": SAID})
        self.assertIn(ASK, p)
        self.assertIn(SAID, p)
        self.assertIn("exactly where that stops", p)

    def test_meta_and_turn_log_carry_no_text(self):
        e = resume.store("m", ask=ASK, said=SAID)
        meta = resume.meta(e, stored=True)
        self.assertEqual(meta["said_chars"], len(SAID))
        talk = {"t": time.time() + 5, "resume": {**meta, "ask": ASK, "said": SAID}, "finish_reason": "soft_deadline"}
        row = turn_log.build_row(started=time.time(), ended=time.time() + 6, events=[{"verb": "converse"}], talk=talk, inject=None)
        blob = json.dumps(row)
        self.assertEqual(row["finish_reason"], "soft_deadline")
        self.assertTrue(row["resume"]["stored"])
        for needle in ("lighthouse", "keeper", "wound"):
            self.assertNotIn(needle, blob)


class ResumePipelineTests(unittest.TestCase):
    def test_soft_cut_then_continue_picks_up_and_clears(self):
        seen = []

        def talk(prompt, pack="", images=None):
            seen.append(prompt)
            return {"ok": True, "spoken": "Then one winter the storm came.", "wire": "openrouter", "model": "m", "finish_reason": "stop"}

        with tempfile.TemporaryDirectory(prefix="resume-") as tmp:
            hive = _hive(tmp)
            pipeline._resume_after_talk(hive, {"finish_reason": "soft_deadline", "model": "m",
                                               "spoken": f"{SAID} {online.SOFT_WRAP}"}, ask=ASK)
            key = pipeline._resume_key(hive)
            self.assertEqual(resume.pending(key)["said"], SAID)  # wrap line is not part of what was said
            events = list(pipeline.apply_pipeline_iter("continue", hive=hive, retrieve_roots=[hive / "vault"], talk_fn=talk))
            self.assertEqual(len(seen), 1)
            self.assertIn(SAID, seen[0])
            self.assertIn(ASK, seen[0])
            final = events[-1]
            self.assertIn("storm came", final.get("spoken") or "")
            self.assertIn("resume", final.get("wires") or [])
            self.assertIsNone(resume.pending(key))

    def test_second_cut_accumulates_said_words(self):
        def talk(prompt, pack="", images=None):
            return {"ok": True, "spoken": f"Then the storm came. {online.SOFT_WRAP}", "finish_reason": "soft_deadline", "model": "m"}

        with tempfile.TemporaryDirectory(prefix="resume2-") as tmp:
            hive = _hive(tmp)
            key = pipeline._resume_key(hive)
            resume.store(key, ask=ASK, said=SAID)
            list(pipeline.apply_pipeline_iter("go on", hive=hive, retrieve_roots=[hive / "vault"], talk_fn=talk))
            e = resume.pending(key)
            self.assertEqual(e["said"], f"{SAID} Then the storm came.")
            self.assertEqual(e["parts"], 2)
            self.assertEqual(e["ask"], ASK)

    def test_failed_continue_keeps_stop_point(self):
        with tempfile.TemporaryDirectory(prefix="resume3-") as tmp:
            hive = _hive(tmp)
            key = pipeline._resume_key(hive)
            resume.store(key, ask=ASK, said=SAID)
            list(pipeline.apply_pipeline_iter("continue", hive=hive, retrieve_roots=[hive / "vault"],
                                              talk_fn=lambda p, k="", images=None: {"ok": False, "spoken": ""}))
            self.assertEqual(resume.pending(key)["said"], SAID)

    def test_new_ask_drops_pending_and_continue_without_pending_is_normal(self):
        with tempfile.TemporaryDirectory(prefix="resume4-") as tmp:
            hive = _hive(tmp)
            key = pipeline._resume_key(hive)
            resume.store(key, ask=ASK, said=SAID)
            list(pipeline.apply_pipeline_iter("What time is it in Toronto?", hive=hive, retrieve_roots=[hive / "vault"],
                                              talk_fn=lambda p, k="", images=None: "It is late."))
            self.assertIsNone(resume.pending(key))
            evs = list(pipeline.apply_pipeline_iter("continue", hive=hive, retrieve_roots=[hive / "vault"],
                                                    talk_fn=lambda p, k="", images=None: "Sure."))
            self.assertNotIn("resume", evs[-1].get("wires") or [])


class _Res:
    def __init__(self, chunks, first=0.0, gap=0.0):
        self.chunks, self.first, self.gap, self.closed = chunks, first, gap, False

    def __iter__(self):
        t = time.monotonic()
        while time.monotonic() - t < self.first:
            if self.closed:
                return
            time.sleep(0.02)
        for c in self.chunks:
            if self.closed:
                return
            time.sleep(self.gap)
            yield ("data: " + json.dumps({"choices": [{"delta": {"content": c}, "finish_reason": None}]}) + "\n").encode()
        yield b"data: [DONE]\n"

    def close(self):
        self.closed = True


class BackupStreamTests(unittest.TestCase):
    def _run(self, opens, *, soft="30", env_extra=None):
        said = []

        def no_plain(*a, **k):
            raise AssertionError("plain non-streamed race must not run")

        env = {"JARVIS_TALK_FIRST_TOKEN_SEC": "1", "JARVIS_TALK_STREAM_HEDGE_SEC": "0.2", "JARVIS_TALK_HEDGE_SEC": "5",
               **(env_extra or {})}
        out = {}

        def worker():
            online.set_stream_sink(said.append, turn_start=time.monotonic())
            try:
                with mock.patch.object(online, "openrouter_api_key", return_value="k"), \
                     mock.patch.object(online, "_http_open", side_effect=opens), \
                     mock.patch.object(online, "_hedged_http_json", side_effect=no_plain), \
                     mock.patch.object(online, "TURN_SOFT_SEC", float(soft)), \
                     mock.patch.dict(os.environ, env):
                    t = time.monotonic()
                    out["got"] = online._call_openrouter_inner("Tell me a long story about the sea.", hands=False)
                    out["took"] = time.monotonic() - t
            finally:
                online.set_stream_sink(None)

        import threading
        th = threading.Thread(target=worker); th.start(); th.join(30)
        return out["got"], out["took"], said

    def _opener(self, second):
        count = {}

        def opens(url, data=None, headers=None, timeout=None):
            m = data["model"]
            count[m] = count.get(m, 0) + 1
            if sum(count.values()) <= 2:
                return _Res(["late."], first=20)  # first race: nobody sends a first token
            return second(m)
        return opens, count

    def test_backup_request_is_streamed_after_first_token_mark(self):
        fast = online.OPENROUTER_FAST_MODEL
        opens, count = self._opener(lambda m: _Res(["Backup words. ", "Second line."], gap=0.02) if m == fast else _Res(["x."], first=20))
        got, took, said = self._run(opens)
        self.assertTrue(got["ok"], got)
        self.assertEqual(got["model"], fast)
        self.assertIn("Backup words.", got["spoken"])
        self.assertEqual(said[0], "Backup words.")  # streamed to the Orb, not landed whole
        self.assertEqual(count.get(fast), 2)
        self.assertLess(took, 3.0)

    def test_soft_deadline_cuts_streamed_backup_mid_reply(self):
        fast = online.OPENROUTER_FAST_MODEL
        opens, _ = self._opener(lambda m: _Res(["One sentence. ", "Two sentence. ", "Half "] + ["more "] * 400, gap=0.03)
                                if m == fast else _Res(["x."], first=20))
        got, took, said = self._run(opens, soft="1.6")
        self.assertEqual(got.get("finish_reason"), "soft_deadline", got)
        self.assertTrue(got["spoken"].rstrip().endswith(online.SOFT_WRAP.rstrip(".") + ".") or online.SOFT_WRAP in got["spoken"])
        self.assertNotIn("Half more", got["spoken"])
        self.assertEqual(said[-1], online.SOFT_WRAP)
        self.assertLess(took, 3.0)

    def test_off_switch_keeps_plain_race(self):
        called = {}

        def plain(*a, **k):
            called["yes"] = True
            return {"choices": [{"message": {"content": "Plain answer."}, "finish_reason": "stop"}]}

        said = []
        online.set_stream_sink(said.append, turn_start=time.monotonic())
        try:
            with mock.patch.object(online, "openrouter_api_key", return_value="k"), \
                 mock.patch.object(online, "_http_open", side_effect=lambda *a, **k: _Res(["late."], first=20)), \
                 mock.patch.object(online, "_hedged_http_json", side_effect=plain), \
                 mock.patch.dict(os.environ, {"JARVIS_TALK_FIRST_TOKEN_SEC": "1", "JARVIS_TALK_BACKUP_STREAM": "0",
                                              "JARVIS_TALK_STREAM_HEDGE_SEC": "0.2"}):
                got = online._call_openrouter_inner("Tell me a long story about the sea.", hands=False)
        finally:
            online.set_stream_sink(None)
        self.assertTrue(called.get("yes"))
        self.assertIn("Plain answer", got["spoken"])

    def test_raced_stream_first_by_override(self):
        t = time.monotonic()
        with self.assertRaises(TimeoutError):
            online.raced_stream([("A", {"model": "A"})], headers={}, timeout=20, hedge=0.0,
                                opener=lambda b, x: _Res(["late."], first=20), first_by=0.6)
        self.assertLess(time.monotonic() - t, 1.3)


if __name__ == "__main__":
    unittest.main()
