"""Owner canvas Z61 (TTS cleanup, 2026-10-16): the voice reads sentences, not markdown, URLs or shouting."""
import importlib.util
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
spec = importlib.util.spec_from_file_location("agent_stack_voice_speakable_test", Path(__file__).with_name("voice.py"))
V = importlib.util.module_from_spec(spec); spec.loader.exec_module(V)


class Speakable(unittest.TestCase):
    def test_cleanup(self):
        out = V.speakable("## Results\n- **Disk**: 40 GB free\n- See [the PR](https://github.com/x/y/pull/645) or https://example.com/a\n"
                          "UNKNOWN. `git status` is clean. CI and PDF stay.")
        for gone in ("#", "**", "`", "https://", "UNKNOWN", "- "):
            self.assertNotIn(gone, out)
        for kept in ("Disk: 40 GB free", "the PR", "unknown", "CI and PDF stay", "git status is clean"):
            self.assertIn(kept, out)

    def test_plain_text_is_unchanged(self):
        self.assertEqual(V.speakable("It's 3:08 AM."), "It's 3:08 AM.")


if __name__ == "__main__":
    unittest.main()
