"""Windows, displays and Terminal awareness. Injected runner: no real screen, no real apps."""
import importlib.util
import json
import subprocess
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location("macos_windows_t", Path(__file__).with_name("macos_windows.py"))
W = importlib.util.module_from_spec(spec)
spec.loader.exec_module(W)

DISPLAYS = {"SPDisplaysDataType": [{"spdisplays_ndrvs": [
    {"_name": "Color LCD", "_spdisplays_resolution": "3024 x 1964 Retina", "spdisplays_main": "spdisplays_yes"},
    {"_name": "DELL P2422H", "_spdisplays_resolution": "1920 x 1080 @ 60.00Hz"}]}]}
WINDOWS = [{"app": "Cursor", "title": "pipeline.py", "x": 0, "y": 25, "w": 1512, "h": 920},
           {"app": "Terminal", "title": "evenslouis — zsh", "x": 1512, "y": 0, "w": 900, "h": 600},
           {"app": "Jarvis Orb", "title": "", "x": 1300, "y": 700, "w": 220, "h": 300}]


class FakeRun:
    def __init__(self, terminal_text="$ pytest -q\n3 passed"):
        self.calls = []
        self.terminal_text = terminal_text

    def __call__(self, argv, timeout=12.0):
        self.calls.append(argv)
        joined = " ".join(argv)
        if argv[0] == "system_profiler":
            out = json.dumps(DISPLAYS)
        elif "CGWindowListCopyWindowInfo" in joined:
            out = json.dumps(WINDOWS)
        elif "selected tab of front window" in joined:
            out = self.terminal_text
        elif argv[:2] == ["open", "-a"]:
            out = ""
        else:
            out = ""
        return subprocess.CompletedProcess(argv, 0, out, "")


class Intent(unittest.TestCase):
    def test_wants_window_and_display_questions(self):
        for u in ("what windows are open", "which apps are open right now", "how many displays do I have",
                  "what's in my terminal", "switch to Cursor", "focus Terminal"):
            self.assertTrue(W.wants(u, run=FakeRun()), u)  # screen *content* is a vision question, not this hand

    def test_ignores_unrelated_talk(self):
        for u in ("open a window of opportunity for the launch", "write a terminal velocity explainer",
                  "explain how displays work"):
            self.assertFalse(W.wants(u), u)


class Behaviour(unittest.TestCase):
    def test_displays(self):
        got = W.run("how many displays do I have", run=FakeRun())
        self.assertTrue(got["ok"])
        self.assertIn("2 displays", got["spoken"])
        self.assertIn("DELL P2422H", got["spoken"])

    def test_windows_list_apps(self):
        got = W.run("what windows are open", run=FakeRun())
        self.assertTrue(got["ok"])
        for app in ("Cursor", "Terminal", "Jarvis Orb"):
            self.assertIn(app, got["spoken"])

    def test_terminal_contents_redact_secrets(self):
        fake = FakeRun(terminal_text="$ export TOKEN=" + "ghp_" + "A1b2C3d4E5f6G7h8I9j0K1l2M3n4\n$ ls\nREADME.md")
        got = W.run("what's in my terminal", run=fake)
        self.assertTrue(got["ok"])
        self.assertIn("README.md", got["spoken"])
        self.assertNotIn("ghp_", got["spoken"])

    def test_switch_only_to_an_open_app(self):
        fake = FakeRun()
        got = W.run("switch to Cursor", run=fake)
        self.assertTrue(got["ok"])
        self.assertIn(["open", "-a", "Cursor"], fake.calls)
        fake2 = FakeRun()
        miss = W.run("switch to Photoshop", run=fake2)
        self.assertFalse(miss["ok"])
        self.assertFalse(any(c[:2] == ["open", "-a"] for c in fake2.calls))

    def test_failure_is_honest(self):
        def broken(argv, timeout=12.0):
            raise subprocess.TimeoutExpired(argv, timeout)
        got = W.run("what windows are open", run=broken)
        self.assertFalse(got["ok"])
        self.assertFalse(got["task_verified"])


if __name__ == "__main__":
    unittest.main()
