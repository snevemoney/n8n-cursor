"""PR #619 follow-up: literal ids survive the mouth; no turn reaches the 25 s Face wall."""
import importlib.util, json, sys, threading, time, unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from brain import online  # noqa: E402

_spec = importlib.util.spec_from_file_location("agent_stack_persona_lit", ROOT / "mouth" / "persona.py")
persona = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(persona)


class LiteralTokenTests(unittest.TestCase):
    LIVE = ("I don't see any reference to PR 619 in the current disk context. "
            "PR #620 and BUS300 are CANDIDATE; job 4821 ran as PID 4018 at 12:03.")

    def test_strip_factory_keeps_pr_numbers_ids_and_numbers(self):
        out = persona.strip_factory(self.LIVE, utterance="What's the plan for PR 619?")
        for tok in ("PR 619", "PR #620", "BUS300", "4821", "PID 4018", "12:03"):
            self.assertIn(tok, out)
        self.assertNotIn("reference to in", out)

    def test_full_wrap_keeps_pr_number(self):
        out = persona.wrap(self.LIVE, verb="converse", utterance="What's the plan for PR 619?")
        self.assertIn("PR 619", out)
        self.assertIn("PR #620", out)
        self.assertNotIn("reference to in", out)

    def test_private_shapes_still_redacted(self):
        out = persona.scrub_unspeakable("Card 4111 1111 1111 1111 and id 123-45-6789 for PR 619.")
        self.assertIn("PR 619", out)
        self.assertNotIn("4111 1111", out)
        self.assertNotIn("123-45-6789", out)


class _Res:
    def __init__(self, chunks, gap):
        self.chunks, self.gap, self.closed = chunks, gap, False

    def __iter__(self):
        for c in self.chunks:
            if self.closed:
                return
            time.sleep(self.gap)
            yield ("data: " + json.dumps({"choices": [{"delta": {"content": c}, "finish_reason": None}]}) + "\n").encode()
        yield b"data: [DONE]\n"

    def close(self):
        self.closed = True


class SoftDeadlineTests(unittest.TestCase):
    def _run(self, res, soft_in, timeout=5.0):
        said = []
        t = time.monotonic()
        text, finish, win = online.raced_stream(
            [("A", {"model": "A"})], headers={}, timeout=timeout, hedge=9.0, sink=said.append,
            opener=lambda body, budget: res, soft_at=time.monotonic() + soft_in,
        )
        return text, finish, said, time.monotonic() - t

    def test_long_stream_is_cut_at_soft_mark_with_honest_wrap(self):
        res = _Res(["One whole sentence. ", "Two whole ", "sentence. ", "Three is half "] + ["more "] * 200, gap=0.05)
        text, finish, said, took = self._run(res, soft_in=0.4)
        self.assertEqual(finish, "soft_deadline")
        self.assertLess(took, 0.9)
        self.assertTrue(res.closed)
        self.assertTrue(text.endswith(online.SOFT_WRAP))
        self.assertIn("cutting this short for time", text)
        self.assertIn("continue", text.lower())
        self.assertNotIn("Three is half", text)  # clipped tail dropped, not spoken
        self.assertEqual(said[-1], online.SOFT_WRAP)

    def test_short_stream_untouched(self):
        text, finish, said, _ = self._run(_Res(["Short answer. ", "Done."], gap=0.01), soft_in=2.0)
        self.assertEqual(text, "Short answer. Done.")
        self.assertNotEqual(finish, "soft_deadline")
        self.assertNotIn(online.SOFT_WRAP, said)

    def test_soft_wrap_with_no_whole_sentence(self):
        self.assertEqual(online.soft_wrap("half a thou"), online.SOFT_WRAP)
        self.assertEqual(online.soft_wrap("Done. half"), f"Done. {online.SOFT_WRAP}")

    def test_budget_marks_fit_the_wall(self):
        self.assertLessEqual(online.TURN_SOFT_SEC, 18.0)
        self.assertLess(online.TURN_HARD_SEC, 25.0)
        self.assertLess(online.TURN_SOFT_SEC, online.TURN_HARD_SEC)

    def test_turn_left_uses_thread_turn_start(self):
        box = {}

        def worker():
            online.set_stream_sink(lambda s: None, turn_start=time.monotonic() - 10.0)
            box["left"] = online.turn_left(18.0)
            online.set_stream_sink(None)

        th = threading.Thread(target=worker); th.start(); th.join()
        self.assertAlmostEqual(box["left"], 8.0, delta=0.5)

    def test_plain_question_token_cap(self):
        self.assertLessEqual(online.OPENROUTER_PLAIN_TOKENS, online.OPENROUTER_RETRIEVE_TOKENS)
        self.assertLessEqual(online.OPENROUTER_PLAIN_TOKENS, 256)


    def test_length_cap_keeps_whole_sentences_instead_of_second_call(self):
        text = ("The keeper climbed the stairs every night for forty years. He wound the lens. "
                "Then one winter the storm came and he")
        self.assertEqual(online._usable_length_text(text),
                         "The keeper climbed the stairs every night for forty years. He wound the lens.")
        self.assertEqual(online._usable_length_text("Short. and then the keeper went up to the"), "")


if __name__ == "__main__":
    unittest.main()
