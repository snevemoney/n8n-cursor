"""Evens 2026-10-16: "jarvis is not talking in plain english ... jarvis should talk in a way i will understand".
Real lines Jarvis said that day, and what a person would say instead."""
import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location("agent_stack_persona_plain_test", Path(__file__).with_name("persona.py"))
M = importlib.util.module_from_spec(spec); spec.loader.exec_module(M)


class PlainSpeech(unittest.TestCase):
    def test_note_slugs_become_words(self):
        got = M.plain_speech("Closest: 20260227-cursor-ide-browser-mcp-lead-pipeline-execution-3654c269 in client-engine-1")
        self.assertIn("cursor ide browser mcp lead pipeline execution", got)
        self.assertNotIn("20260227", got); self.assertNotIn("3654c269", got)

    def test_icloud_and_hash_names(self):
        got = M.plain_speech("Candidates: 158b2db0562842fcb9634dd63e55e34dbd5386a1375f4d9cbefea08668096c72.pdf (in com~apple~CloudDocs)")
        self.assertIn("an untitled PDF", got); self.assertIn("iCloud Drive", got)
        self.assertNotIn("158b2db", got); self.assertNotIn("com~apple", got)

    def test_model_ids_are_names(self):
        self.assertEqual(M.plain_speech("I am running on the model `deepseek/deepseek-chat-v3.1` via OpenRouter."),
                         "I am running on the model DeepSeek via OpenRouter.")
        self.assertIn("Claude Sonnet 5.5", M.plain_speech("Switched to anthropic/claude-sonnet-5.5."))

    def test_markdown_is_not_spoken(self):
        got = M.plain_speech("**Benefit-focused:**\n## Options\n- `Master AI Tools` now")
        self.assertNotIn("**", got); self.assertNotIn("`", got); self.assertNotIn("##", got)
        self.assertIn("Benefit-focused:", got); self.assertIn("Master AI Tools", got)

    def test_ordinary_words_untouched(self):
        for s in ("17 times 23 is 391.", "Press Command-W to close the window.", "Building Microservices (Newman, Sam).epub",
                  "The 2024 Nobel Prize in Physics went to Hopfield and Hinton."):
            self.assertEqual(M.plain_speech(s), s)

    def test_wrap_applies_it(self):
        out = M.wrap("Found it in com~apple~CloudDocs: **Crime and Punishment**.", verb="workspace_read", utterance="find books")
        self.assertIn("iCloud Drive", out); self.assertNotIn("**", out)


class NoFakeDone(unittest.TestCase):
    def test_open_claim_without_a_tool_is_dropped(self):
        got = M.promise_guard("LinkedIn is open in Safari showing your feed.", ran_tool=False)
        self.assertNotIn("is open", got)
        self.assertEqual(M.promise_guard("LinkedIn is open in Safari.", ran_tool=True), "LinkedIn is open in Safari.")


if __name__ == "__main__":
    unittest.main()
