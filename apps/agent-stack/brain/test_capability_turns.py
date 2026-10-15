"""Grok bad-turns queue 2026-10-15 (PR 644 comment): each exact utterance gets a real hand, never model talk."""
import importlib.util
import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest import mock

STACK = Path(__file__).resolve().parents[1]
_spec = importlib.util.spec_from_file_location("agent_stack_pipeline_capability_test", STACK / "brain" / "pipeline.py")
P = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(P)


class Routes(unittest.TestCase):
    def setUp(self):
        mode = mock.patch.dict(os.environ, {"JARVIS_MODE_FILE": str(Path(tempfile.mkdtemp()) / "mode.json")})
        mode.start(); self.addCleanup(mode.stop)

    def test_exact_bad_turns_are_routed(self):
        cases = {
            "What repos do you have installed": "workspace_read",
            "Don't you have a red arrow you can use": "capability",
            "Can you open a book on my Mac about AI": "workspace_read",
            "Could you change your code so you can give yourself access": "capability",
            "can you fix it now?": "capability",
        }
        for said, tool in cases.items():
            self.assertEqual((P.model_free_route(said) or {}).get("tool"), tool, said)

    def test_pointer_commands_still_point(self):
        for said in ("point to the save button", "where do I click to export"):
            self.assertEqual(P.model_free_route(said)["tool"], "pointer", said)

    def test_red_arrow_question_is_true_and_draws_nothing(self):
        got = P._capability_hand().run("Don't you have a red arrow you can use")
        self.assertIn("Yes", got["spoken"]); self.assertIn("point to", got["spoken"])
        self.assertNotIn("not a functional tool", got["spoken"])
        self.assertTrue(P._capability_hand().wants("Don't you have a red arrow you can use"))
        self.assertEqual(P._capability_hand().wants("point to the red arrow icon"), "")

    def test_self_change_is_honest(self):
        got = P._capability_hand().run("Could you change your code so you can give yourself access")
        self.assertIn("permission granted", got["spoken"]); self.assertIn("lock it down", got["spoken"])
        self.assertIn("scratch repo", got["spoken"]); self.assertNotIn("1 h", got["spoken"])
        fix = P._capability_hand().run("can you fix it now?")["spoken"]
        self.assertIn("coding worker", fix); self.assertNotIn("system design", fix)

    def test_fix_it_names_the_last_turn(self):
        got = P._capability_hand().run("can you fix it now?", prior={"user": "What repos do you have installed",
                                                                     "jarvis": "Sir. Local repos: jarvis-main."})
        self.assertIn("What repos do you have installed", got["spoken"]); self.assertIn("jarvis-main", got["spoken"])

    def test_access_line_follows_the_real_state(self):
        cap = P._capability_hand()
        with mock.patch.object(cap, "_open_access", return_value=True):
            on = cap.run("Could you change your code so you can give yourself access")["spoken"]
        self.assertIn("open access is on", on); self.assertNotIn("Say \"permission granted\"", on)

    def test_turn_passes_prior_turn_to_fix_it(self):
        hive = Path(tempfile.mkdtemp()); (hive / "bus").mkdir()
        (hive / "bus" / "state.json").write_text(json.dumps({"turns": [{"user": "open a book about AI", "jarvis": "Found 0 books."}]}))
        out = list(P.apply_pipeline_iter("can you fix it now?", hive=hive))
        self.assertIn("open a book about AI", out[-1]["spoken"])

    def test_book_ask_is_a_real_search_with_topic(self):
        args = P._workspace_read_hand().args_from_utterance("Can you open a book on my Mac about AI")
        self.assertEqual(args["op"], "find"); self.assertEqual(args["topic"], "AI")


class RepoListing(unittest.TestCase):
    def setUp(self):
        self.home = Path(tempfile.mkdtemp())
        for rel in ("jarvis-main", "tools/whisper", "tools/markitdown", "jarvis-repos/acme__tool"):
            (self.home / rel / ".git").mkdir(parents=True)
        env = mock.patch.dict(os.environ, {"HOME": str(self.home), "JARVIS_MODE_FILE": str(self.home / "mode.json")})
        env.start(); self.addCleanup(env.stop)
        self.W = P._workspace_read_hand()

    def test_closed_names_scope_and_how_to_widen(self):
        got = self.W._list_repos([self.home / "jarvis-main"], True)
        self.assertIn("~/jarvis-main", got["names"]); self.assertIn("~/jarvis-repos/acme__tool", got["names"])
        self.assertNotIn("~/tools/whisper", got["names"])
        self.assertIn("I looked in", got["spoken"]); self.assertIn("permission granted", got["spoken"])

    def test_open_finds_tools_clones(self):
        with mock.patch.object(self.W, "open_access", return_value=True):
            got = self.W._list_repos([self.home / "jarvis-main"], True)
        self.assertIn("~/tools/whisper", got["names"]); self.assertIn("~/tools/markitdown", got["names"])
        self.assertNotIn("permission granted", got["spoken"])


class PidReuse(unittest.TestCase):
    def setUp(self):
        spec = importlib.util.spec_from_file_location("agent_stack_coding_mission_pid_test", STACK / "hands" / "coding_mission.py")
        self.CM = importlib.util.module_from_spec(spec); spec.loader.exec_module(self.CM)

    def test_reused_pid_is_not_the_worker(self):
        with mock.patch.object(self.CM, "_identity", return_value="Thu Oct 15 10:00:00 2026 /usr/bin/other"):
            self.assertTrue(self.CM._pid_reused({"pid": 4242, "identity": "Wed Oct 14 09:00:00 2026 python3 -B worker.py"}))
            self.assertFalse(self.CM._pid_reused({"pid": 4242, "identity": "Thu Oct 15 10:00:00 2026 /usr/bin/other"}))

    def test_unprovable_identity_never_counts_as_reused(self):
        with mock.patch.object(self.CM, "_identity", return_value=None):
            self.assertFalse(self.CM._pid_reused({"pid": 4242, "identity": "x"}))
        with mock.patch.object(self.CM, "_identity", return_value="libproc:1:2:3"):
            self.assertFalse(self.CM._pid_reused({"pid": 4242, "identity": "Wed Oct 14 python3"}))
        self.assertFalse(self.CM._pid_reused({"pid": 4242}))


if __name__ == "__main__":
    unittest.main()
