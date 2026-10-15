"""Evens's own prompts from 2026-10-15 (receipts 00:51-10:23 ET). Each fell to the model, which denied hands it has or
invented results (10:22: two AI books that exist nowhere on the Mac). They must reach the real hand."""
import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location("evens_prompts_pipeline", Path(__file__).with_name("pipeline.py"))
P = importlib.util.module_from_spec(spec)
spec.loader.exec_module(P)


def tool(u):
    return (P.model_free_route(u) or {}).get("tool", "MODEL")


class EvensPrompts(unittest.TestCase):
    def test_arrow_question_gets_true_answer(self):
        self.assertEqual(tool("Don't you have a red arrow you can use"), "capability")

    def test_misheard_arrow_reaches_pointer(self):
        # no real target named ("the overlay"): the capability hand says the arrow exists and how to aim it
        self.assertEqual(tool("Can you show me a narrow on the overlay on my screen"), "capability")
        self.assertEqual(tool("show me a narrow on the Safari button"), "pointer")

    def test_book_search_after_grant(self):
        self.assertEqual(tool("go through every file and look for books about AI"), "workspace_read")
        self.assertEqual(tool("look for books about AI"), "workspace_read")

    def test_where_on_my_screen_looks(self):
        self.assertEqual(tool("Where did it say Jarvis Maine on my terminal screen"), "screen_see")

    def test_ordinary_speech_untouched(self):
        for u in ["the road gets a narrow on the left", "what is a red arrow", "I read a book about AI"]:
            self.assertNotIn(tool(u), ("pointer", "screen_see"), u)


class SandboxOutputIsFinal(unittest.TestCase):
    def test_model_does_not_narrate_over_real_output(self):
        # live 18:08: sandbox printed 45; the model then said "extra parenthesis, syntax error"
        import tempfile
        h = Path(tempfile.mkdtemp()); (h / "bus").mkdir()
        out = P.apply_pipeline("Run this python and tell me the output: print(sum(range(10)))", hive=h, retrieve_roots=[],
                               talk_fn=lambda *a, **k: {"ok": True, "spoken": "There is an extra parenthesis."})
        self.assertIn("45", out["spoken"]); self.assertNotIn("parenthesis", out["spoken"])


if __name__ == "__main__":
    unittest.main()
