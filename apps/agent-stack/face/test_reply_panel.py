"""Orb reply panel must show a whole short answer and scroll longer ones (Evens, 2026-10-13: reply cut mid-line)."""
import re, unittest
from pathlib import Path

CSS = Path(__file__).with_name("pane.html").read_text(encoding="utf-8")


def rule(selector: str) -> str:
    m = re.search(re.escape(selector) + r"\s*\{(.*?)\}", CSS, re.S)
    assert m, selector
    return m.group(1)


class ReplyPanel(unittest.TestCase):
    def test_reply_panel_is_tall_enough_and_scrolls(self):
        body = rule("html.widget .chip")
        self.assertRegex(body, r"overflow-y:\s*auto")
        cap = re.search(r"max-height:\s*min\((\d+)vh,\s*(\d+)px\)", body)
        self.assertTrue(cap, "max-height must scale with the window, not a fixed 64px")
        self.assertGreaterEqual(int(cap.group(2)), 200)

    def test_question_line_can_wrap_to_two_lines(self):
        body = rule("html.widget .chip #heard")
        self.assertNotIn("white-space: nowrap", body)
        self.assertRegex(body, r"-webkit-line-clamp:\s*2")


if __name__ == "__main__":
    unittest.main()
