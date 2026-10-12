"""Turn-relevant shared-memory retrieval: match, caps, denylist, opt-out, log metadata."""
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


SC = _load("test_retr_sc", HERE / "shared_context.py")
ONLINE = _load("test_retr_online", HERE / "online.py")

MAC = """# MAC_SHARED_MEMORY — fixture
- **Studio deliverables go where the operator can see them** (fixture): after work in a studio app, save the project and export into ~/Documents, then open it in the desktop app.
- **Example repo is public** (fixture): never put private notes in it.
"""
PREF = """# OPERATOR_PREFERENCES
## Replies
- Typed prompts get text replies; speak only after the mic was used.
"""
TASKS = """# ACTIVE_TASKS
| Surface | Owner |
|---|---|
| Face 127.0.0.1:4018 | Platform A |
"""


class RetrievalTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        (self.root / "MAC_SHARED_MEMORY.md").write_text(MAC)
        (self.root / "OPERATOR_PREFERENCES.md").write_text(PREF)
        (self.root / "ACTIVE_TASKS.md").write_text(TASKS)
        (self.root / "CURRENT_STATE.md").write_text("- studio deliverables save export: leaked key rotation pending\n")
        (self.root / "SECURITY_TODO.md").write_text("- studio save export backup gap\n")
        (self.root / "JARVIS_CONTEXT.md").write_text("# JC\nfixture\n")
        self.env = mock.patch.dict(os.environ, {"JARVIS_SHARED_DIR": str(self.root), "JARVIS_SHARED_CONTEXT": "1"})
        self.env.start()

    def tearDown(self):
        self.env.stop()
        self.tmp.cleanup()

    def test_studio_ask_retrieves_save_open_rule_with_heading(self):
        rows = SC.retrieve_entries("Where should you save and export my studio project so I can open it?")
        self.assertTrue(rows)
        self.assertEqual(rows[0]["file"], "MAC_SHARED_MEMORY.md")
        self.assertIn("Studio deliverables", rows[0]["heading"])
        self.assertIn("open it in the desktop app", rows[0]["text"])

    def test_preference_file_and_tasks_table_are_searched(self):
        files = {r["file"] for r in SC.retrieve_entries("Should typed prompts get spoken replies or text replies?")}
        self.assertIn("OPERATOR_PREFERENCES.md", files)
        files = {r["file"] for r in SC.retrieve_entries("Which platform owner holds the face 4018 surface?")}
        self.assertIn("ACTIVE_TASKS.md", files)

    def test_denied_files_and_secret_entries_never_read(self):
        names = [p.name for p in SC.retrieval_files(self.root)]
        self.assertNotIn("CURRENT_STATE.md", names)
        self.assertNotIn("SECURITY_TODO.md", names)
        (self.root / "SHARED_MEMORY.md").write_text("- studio save export: the api key lives in a file\n")
        for row in SC.retrieve_entries("studio save export project open"):
            self.assertNotIn("api key", row["text"].lower())
            self.assertNotIn(row["file"], {"CURRENT_STATE.md", "SECURITY_TODO.md"})

    def test_unrelated_ask_retrieves_nothing(self):
        self.assertEqual(SC.retrieve_entries("Why is the sky blue?"), [])

    def test_caps_hold(self):
        big = "# M\n" + "".join(f"- studio save export open entry {i} " + "x" * 300 + "\n" for i in range(20))
        (self.root / "MAC_SHARED_MEMORY.md").write_text(big)
        with mock.patch.dict(os.environ, {"JARVIS_SHARED_SNIPPET_FILE_MAX_CHARS": "800"}):
            rows = SC.retrieve_entries("studio save export open")
        self.assertLessEqual(sum(len(r["text"]) for r in rows if r["file"] == "MAC_SHARED_MEMORY.md"), 800)
        self.assertLessEqual(len(rows), 6)

    def test_per_file_cap_on_base_files(self):
        (self.root / "JARVIS_CONTEXT.md").write_text("y" * 5000)
        with mock.patch.dict(os.environ, {"JARVIS_SHARED_FILE_MAX_CHARS": "1000"}):
            got = SC.load_shared_context(use_cache=False)
        self.assertLessEqual(got["chars"], 1100)

    def test_f07_context_is_date_stamped_and_stale_marked(self):
        old = self.root / "MAC_SHARED_MEMORY.md"
        os.utime(old, (1_700_000_000, 1_700_000_000))
        rows = SC.retrieve_entries("Where should you save and export my studio project so I can open it?")
        self.assertIn("as of 2023-11-", rows[0]["as_of"])
        self.assertIn("STALE", rows[0]["as_of"])
        fresh = SC.stamp(self.root / "ACTIVE_TASKS.md")
        self.assertIn("as of", fresh)
        self.assertNotIn("STALE", fresh)
        text, _ = SC.retrieved_block("Where should you save and export my studio project so I can open it?")
        self.assertIn("STALE", text)
        os.utime(self.root / "JARVIS_CONTEXT.md", (1_700_000_000, 1_700_000_000))
        got = SC.load_shared_context(use_cache=False)
        self.assertIn("[shared:JARVIS_CONTEXT.md | as of 2023-11-", got["text"])
        self.assertIn("STALE", got["text"])

    def test_r15_drift_report_names_missing_and_stale(self):
        os.utime(self.root / "MAC_SHARED_MEMORY.md", (1_700_000_000, 1_700_000_000))
        rep = SC.drift_report(self.root)
        self.assertIn("AGENT_RULES.md", rep["missing"])
        self.assertIn("MAC_SHARED_MEMORY.md", rep["stale"])
        self.assertNotIn("CURRENT_STATE.md", [r["file"] for r in rep["present"]])
        self.assertFalse(rep["ok"])

    def test_f07_header_date_beats_fresh_sync_mtime(self):
        (self.root / "SHARED_MEMORY.md").write_text("# SHARED_MEMORY (2023-11-01 22:30 ET)\n- studio save export open\n")
        line = SC.stamp(self.root / "SHARED_MEMORY.md")
        self.assertIn("as of 2023-11-01 22:30", line)
        self.assertIn("STALE", line)

    def test_opt_out(self):
        with mock.patch.dict(os.environ, {"JARVIS_SHARED_CONTEXT": "0"}):
            self.assertEqual(SC.retrieve_entries("studio save export open"), [])

    def test_payload_records_file_and_heading_only(self):
        ONLINE._SHARED_MOD = None
        body = ONLINE._openrouter_payload("m", "Live context:\nzzz\n\nCurrent ask:\nWhere do I save and export the studio project to open it?", stream=False)
        self.assertIn("open it in the desktop app", body["messages"][0]["content"])
        snip = ONLINE.LAST_INJECT["snippets"]
        self.assertEqual(snip[0]["file"], "MAC_SHARED_MEMORY.md")
        self.assertEqual(set(snip[0]), {"file", "heading"})


if __name__ == "__main__":
    unittest.main()
