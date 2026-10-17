import unittest

from wake_word import WakeGate, split_wake


class SplitWake(unittest.TestCase):
    def test_path_kept(self):
        self.assertEqual(
            split_wake("Hey Jarvis open /workspace/Report.pdf"),
            (True, "open /workspace/Report.pdf"),
        )

    def test_case_and_math_kept(self):
        self.assertEqual(
            split_wake("hey, JARVIS: what is 2+2*3?"),
            (True, "what is 2+2*3?"),
        )

    def test_prefix_dropped(self):
        self.assertEqual(
            split_wake("so um OK Jarvis Open Microsoft Edge"),
            (True, "Open Microsoft Edge"),
        )

    def test_no_wake(self):
        self.assertEqual(split_wake("hey jarvisx play music"), (False, ""))
        self.assertEqual(split_wake(""), (False, ""))


class Gate(unittest.TestCase):
    def test_ignores_side_talk_when_asleep(self):
        gate = WakeGate(window=5)
        self.assertEqual(gate.feed("open Edge please", 0)["action"], "ignore")

    def test_wake_then_command_verbatim(self):
        gate = WakeGate(window=5)
        self.assertEqual(
            gate.feed("Hey Jarvis.", 0), {"action": "wake", "command": ""}
        )
        self.assertEqual(
            gate.feed("  Open C:\\Docs\\A.txt  ", 3),
            {"action": "command", "command": "Open C:\\Docs\\A.txt"},
        )

    def test_window_expires(self):
        gate = WakeGate(window=5)
        gate.feed("hey jarvis", 0)
        self.assertEqual(gate.feed("open Edge", 6)["action"], "ignore")
        self.assertFalse(gate.is_awake(6))

    def test_bad_window(self):
        with self.assertRaises(ValueError):
            WakeGate(window=0)


if __name__ == "__main__":
    unittest.main()
