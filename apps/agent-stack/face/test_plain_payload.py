"""Evens 10-17: every spoken line that leaves the Face is plain English (no paths, no tool names, no step numbers)."""
import importlib.util
import re
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("serve_plain_t", HERE / "serve.py")
S = importlib.util.module_from_spec(spec); spec.loader.exec_module(S)
NOT_PLAIN = re.compile(r"(?<![\w/])/(?:private|tmp|Users)/|\b[a-z]+_[a-z]+\b|\bAX[A-Z]\w+|\(step \d+\)")


class PlainPayload(unittest.TestCase):
    def test_his_screenshot_line_is_plain_when_it_leaves_the_face(self):
        got = S.plain_payload({"ok": True, "spoken": "Sir. Used app_type to create and type into /private/tmp/claude-501/x/jarvis-bg-test4.txt in the background."})
        self.assertFalse(NOT_PLAIN.search(got["spoken"]), got["spoken"])
        self.assertIn("jarvis-bg-test4.txt", got["spoken"])

    def test_payloads_without_a_line_are_untouched(self):
        self.assertEqual(S.plain_payload({"ok": True}), {"ok": True})
        self.assertEqual(S.plain_payload([1]), [1])

    def test_the_still_working_line_has_no_step_number(self):
        spec = importlib.util.spec_from_file_location("pipe_plain_t", HERE.parent / "brain" / "pipeline.py")
        line = Path(spec.origin).read_text()
        self.assertNotIn("I'm working on it (step {", line)


if __name__ == "__main__":
    unittest.main()
