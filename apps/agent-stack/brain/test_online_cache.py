"""Evens 10-17: prompt caching on the operator's model calls (the repeated prefix billed at the cached rate)."""
import importlib.util, unittest
from pathlib import Path
spec = importlib.util.spec_from_file_location("online_cache_t", Path(__file__).with_name("online.py"))
O = importlib.util.module_from_spec(spec); spec.loader.exec_module(O)


class CacheMarks(unittest.TestCase):
    def setUp(self):
        self.msgs = [{"role": "system", "content": "rules"}, {"role": "user", "content": "goal"},
                     {"role": "assistant", "content": None, "tool_calls": [{"id": "c0"}]}, {"role": "tool", "tool_call_id": "c0", "content": "ok"}]

    def test_anthropic_gets_two_breakpoints_and_input_is_untouched(self):
        out = O.with_cache_marks(self.msgs, "anthropic/claude-sonnet-5.5")
        self.assertEqual(out[0]["content"][0]["cache_control"], {"type": "ephemeral"})
        self.assertEqual(out[3]["content"][0]["cache_control"], {"type": "ephemeral"})
        self.assertEqual(out[1]["content"], "goal")                  # only the newest message is marked
        self.assertEqual(self.msgs[0]["content"], "rules")           # original list not mutated
        self.assertEqual(sum(1 for m in out if isinstance(m.get("content"), list)), 2)

    def test_other_models_are_left_alone(self):
        self.assertIs(O.with_cache_marks(self.msgs, "deepseek/deepseek-chat-v3.1"), self.msgs)

    def test_image_message_marks_its_text_part(self):
        m = [{"role": "system", "content": "r"}, {"role": "user", "content": [{"type": "image_url", "image_url": {"url": "x"}}, {"type": "text", "text": "screen"}]}]
        out = O.with_cache_marks(m, "anthropic/claude-sonnet-5.5")
        self.assertIn("cache_control", out[1]["content"][-1]); self.assertNotIn("cache_control", out[1]["content"][0])


if __name__ == "__main__":
    unittest.main()
