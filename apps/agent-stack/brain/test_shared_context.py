"""Shared brain loader: path env, cap, opt-out, injected-file record."""
import importlib.util
import os
import tempfile
import unittest
from pathlib import Path
from unittest import mock

HERE = Path(__file__).resolve().parent


def _load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


SC = _load("test_shared_context_mod", HERE / "shared_context.py")
ONLINE = _load("test_shared_context_online", HERE / "online.py")


class SharedContextTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        (self.root / "JARVIS_CONTEXT.md").write_text("# JC\nRole: butler-tester-7731.\n", encoding="utf-8")
        (self.root / "AGENT_RULES.md").write_text("Rule: never-send-7731.\n", encoding="utf-8")
        self.env = mock.patch.dict(os.environ, {"JARVIS_SHARED_DIR": str(self.root)}, clear=False)
        self.env.start()
        os.environ.pop("JARVIS_SHARED_CONTEXT", None)
        os.environ.pop("JARVIS_SHARED_CONTEXT_MAX_CHARS", None)

    def tearDown(self):
        self.env.stop()
        self.tmp.cleanup()

    def test_default_dir_is_home_grok_shared(self):
        with mock.patch.dict(os.environ, {"JARVIS_SHARED_DIR": ""}):
            self.assertEqual(SC.shared_dir(), Path.home() / ".grok-shared")

    def test_env_dir_loads_both_files(self):
        got = SC.load_shared_context(use_cache=False)
        self.assertEqual(got["files"], ["JARVIS_CONTEXT.md", "AGENT_RULES.md"])
        self.assertIn("butler-tester-7731", got["text"])
        self.assertIn("never-send-7731", got["text"])

    def test_rules_dropped_when_over_cap(self):
        with mock.patch.dict(os.environ, {"JARVIS_SHARED_CONTEXT_MAX_CHARS": "60"}):
            got = SC.load_shared_context(use_cache=False)
        self.assertEqual(got["files"], ["JARVIS_CONTEXT.md"])
        self.assertLessEqual(got["chars"], 60)

    def test_primary_truncated_to_cap(self):
        (self.root / "JARVIS_CONTEXT.md").write_text("x" * 5000, encoding="utf-8")
        with mock.patch.dict(os.environ, {"JARVIS_SHARED_CONTEXT_MAX_CHARS": "500"}):
            got = SC.load_shared_context(use_cache=False)
        self.assertTrue(got["truncated"])
        self.assertLessEqual(got["chars"], 500)

    def test_opt_out(self):
        with mock.patch.dict(os.environ, {"JARVIS_SHARED_CONTEXT": "0"}):
            got = SC.load_shared_context(use_cache=False)
            self.assertEqual(got["files"], [])
            ONLINE._SHARED_MOD = None
            self.assertEqual(ONLINE.system_for("m"), ONLINE.SYS)
            self.assertEqual(ONLINE.LAST_INJECT["files"], [])

    def test_missing_dir_is_empty_not_error(self):
        with mock.patch.dict(os.environ, {"JARVIS_SHARED_DIR": str(self.root / "nope")}):
            self.assertEqual(SC.load_shared_context(use_cache=False)["text"], "")

    def test_payload_system_carries_context_and_records_files(self):
        ONLINE._SHARED_MOD = None
        body = ONLINE._openrouter_payload("m", "hi", stream=False)
        system = body["messages"][0]["content"]
        self.assertTrue(system.startswith(ONLINE.SYS))
        self.assertIn("butler-tester-7731", system)
        self.assertIn("JARVIS_CONTEXT.md", ONLINE.LAST_INJECT["files"])


if __name__ == "__main__":
    unittest.main()
