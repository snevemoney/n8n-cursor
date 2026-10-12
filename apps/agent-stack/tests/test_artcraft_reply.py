"""ArtCraft save/open reply: user folders survive the path scrub; the talk per-try limit fits a slow provider."""
import importlib.util
import sys
import unittest
from pathlib import Path

STACK = Path(__file__).resolve().parents[1]


def _load(name, rel):
    spec = importlib.util.spec_from_file_location(name, STACK / rel)
    mod = importlib.util.module_from_spec(spec)
    sys.modules[name] = mod
    spec.loader.exec_module(mod)
    return mod


class ArtCraftReplyTest(unittest.TestCase):
    def test_user_folders_kept_private_paths_dropped(self):
        persona = _load("ac_persona", "mouth/persona.py")
        out = persona.wrap("Save into `~/Movies` or `~/Documents/Studio`, then open it. Key at /Users/x/secret.env and ~/.ssh/id.",
                           verb="converse", utterance="where do studio files go")
        self.assertIn("~/Movies", out)
        self.assertIn("~/Documents/Studio", out)
        self.assertNotIn("/Users/", out)
        self.assertNotIn(".ssh", out)

    def test_talk_attempt_fits_slow_provider_and_turn_wall(self):
        online = _load("ac_online", "brain/online.py")
        serve_src = (STACK / "face/serve.py").read_text()
        self.assertGreaterEqual(online.OPENROUTER_ATTEMPT_SEC, 18.0)
        self.assertLess(online.OPENROUTER_WALL_SEC, 25.0)
        self.assertIn("TURN_WALL_SEC = 25.0", serve_src)


if __name__ == "__main__":
    unittest.main()
