"""Review 2026-10-15: the windows hand only claims utterances that are really about windows, displays or Terminal."""
import importlib.util
import unittest
from pathlib import Path

from test_macos_windows import FakeRun

spec = importlib.util.spec_from_file_location("macos_windows_scope", Path(__file__).with_name("macos_windows.py"))
W = importlib.util.module_from_spec(spec)
spec.loader.exec_module(W)

HIJACKS = ("go to sleep", "go to the store", "go to bed", "go to work", "go to settings", "go to the vault",
           "switch to dark mode", "switch to the next song", "switch to my other task", "focus on the report",
           "focus mode", "bring up my calendar", "bring up the issue", "what's the best monitor for coding",
           "what monitor should I buy", "what screen resolution should I use", "what is in my terminal history",
           "open the doc on my second screen")
OWNED = ("how many displays do I have", "which screens are connected", "what windows are open",
         "what's in my terminal", "switch to Cursor", "bring up terminal", "focus the Jarvis Orb window")


class Scope(unittest.TestCase):
    def test_ordinary_phrases_are_not_claimed(self):
        for u in HIJACKS:
            self.assertFalse(W.wants(u, run=FakeRun()), u)

    def test_real_window_questions_are_claimed(self):
        for u in OWNED:
            self.assertTrue(W.wants(u, run=FakeRun()), u)

    def test_short_or_ambiguous_prefix_does_not_focus(self):
        for u in ("switch to c", "go to t", "switch to j"):
            fake = FakeRun()
            got = W.run(u, run=fake)
            self.assertFalse(got["ok"], u)
            self.assertFalse([c for c in fake.calls if c[:2] == ["open", "-a"]], u)

    def test_three_letter_unique_prefix_focuses(self):
        fake = FakeRun()
        got = W.run("switch to curs", run=fake)
        self.assertTrue(got["ok"])
        self.assertIn(["open", "-a", "Cursor"], fake.calls)

    def test_terminal_redacts_before_cutting(self):
        key = "sk-" + "Z" * 40
        text = "x" * (W.TERMINAL_CHARS - 10) + "\nexport OPENAI_API_KEY=" + key + "\n$ ok"
        got = W.run("what's in my terminal", run=FakeRun(terminal_text=text))
        self.assertNotIn("Z" * 20, got["spoken"])


if __name__ == "__main__":
    unittest.main()
