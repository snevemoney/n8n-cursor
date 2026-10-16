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


class ThenChains(unittest.TestCase):
    def setUp(self):
        mode = mock.patch.dict(os.environ, {"JARVIS_MODE_FILE": str(Path(tempfile.mkdtemp()) / "mode.json")})
        mode.start(); self.addCleanup(mode.stop)

    def test_spoken_chain_runs_each_step(self):
        self.assertEqual(P.split_steps("what time is it then what's today's date"), ["what time is it", "what's today's date"])
        hive = Path(tempfile.mkdtemp()); (hive / "bus").mkdir()
        out = list(P.apply_pipeline_iter("what time is it then what's today's date", hive=hive))[-1]
        self.assertEqual(out["tool"], "multistep"); self.assertIn("Step 2", out["spoken"])

    def test_non_chains_and_hard_chains_are_not_split(self):
        self.assertEqual(P.split_steps("I went home and then slept"), [])
        self.assertNotEqual((P.model_free_route("fix the bug then push to main") or {}).get("tool"), "multistep")
        self.assertTrue(P.is_hard_step("fix the bug then push to main"))


class CanvasRoutes(unittest.TestCase):
    """Owner canvas nodes that got spoken routes 2026-10-16 (eval/system_matrix.json)."""
    def setUp(self):
        mode = mock.patch.dict(os.environ, {"JARVIS_MODE_FILE": str(Path(tempfile.mkdtemp()) / "mode.json")})
        mode.start(); self.addCleanup(mode.stop)

    def test_routes(self):
        cases = {"what time is it": "say", "hush": "say", "what apps are running": "apps", "show me my open windows": "apps",
                 "run the command df -h": "agent_tools", "what's the ci status on pr 645": "agent_tools",
                 "search my vault for pricing": "vault_read", "translate my screen": "screen_see",
                 "what did you just do": "results_recall", "capture this idea: a flashcard app": "memory",
                 "what lessons have you learned": "capability", "remember that the gym opens at 6, then what time is it": "multistep"}
        for said, tool in cases.items():
            self.assertEqual((P.turn_fixed_pick(said) or {}).get("tool"), tool, said)

    def test_reaching_people_publishing_and_logins_ask_first(self):
        for said in ("call Normand", "text my accountant that I'm late", "push the branch", "open a pull request",
                     "log into the hostinger account"):
            self.assertTrue(P.is_hard_step(said), said)
        for said in ("call the function twice", "how do I call a function in python", "did Normand call"):
            self.assertFalse(P.is_hard_step(said), said)

    def test_clock_is_the_machine_not_the_model(self):
        self.assertTrue(P.turn_fixed_pick("what's today's date")["speak"].startswith("Today is"))

    def test_lessons_come_from_the_bank(self):
        got = P._capability_hand().run("show me your scars")
        self.assertTrue(got["ok"]); self.assertIn("never-again bank", got["spoken"])


class RoutingAudit(unittest.TestCase):
    """Routing audit 2026-10-16: no input hangs or crashes the router; talk never acts; spoken hard steps are hard."""
    def setUp(self):
        mode = mock.patch.dict(os.environ, {"JARVIS_MODE_FILE": str(Path(tempfile.mkdtemp()) / "mode.json")})
        mode.start(); self.addCleanup(mode.stop)

    def test_pathological_inputs_are_fast(self):
        import time
        for u in ("jarvis, " * 400 + "what is up", "Jarvis! " * 40 + "x", "open notes" + " " * 5000 + "please",
                  "\n    " * 200 + "open notes", "a." * 2500, "https://" + "a." * 2000 + "com", " " * 5000, "token" * 3000):
            t = time.monotonic(); P.turn_fixed_pick(u); P.is_hard_step(u)
            self.assertLess(time.monotonic() - t, 1.0, u[:30])

    def test_lone_surrogate_does_not_crash_the_turn(self):
        hive = Path(tempfile.mkdtemp()); (hive / "bus").mkdir()
        out = list(P.apply_pipeline_iter("\udcff open notes", hive=hive, talk_fn=lambda *a, **k: {"ok": True, "spoken": "ok"}))
        self.assertTrue(out)

    def test_talk_never_acts(self):
        for u in ("don't check my gmail", "did you ask codex to fix it", "how do i close it", "my friend said install the github repo ollama/ollama",
                  "never press the x", "click the save button no wait never mind", "remember that time we went to quebec", "install the update"):
            self.assertNotIn((P.turn_fixed_pick(u) or {}).get("tool"), ("agent_tools", "desk_dispatch", "pointer_click", "repo", "memory", "pointer"), u)

    def test_spoken_hard_steps_and_benign_lines(self):
        for u in ("send it", "pay normand", "delete my notes", "push it", "call normand", "never mind, send the email to sarah",
                  "draft an email to normand and send it", "log in to my bank"):
            self.assertTrue(P.is_hard_step(u), u)
        for u in ("remind me to pay the rent tomorrow", "Call Me Maybe is a great song", "don\u2019t send the email to sarah",
                  "send me a text when you're done", "call the function twice", "i might book a flight to paris"):
            self.assertFalse(P.is_hard_step(u), u)


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
        self.assertIn("acme__tool in jarvis-repos", got["spoken"]); self.assertNotIn("~/", got["spoken"])

    def test_open_finds_tools_clones(self):
        with mock.patch.object(self.W, "open_access", return_value=True):
            got = self.W._list_repos([self.home / "jarvis-main"], True)
        self.assertIn("~/tools/whisper", got["names"]); self.assertIn("~/tools/markitdown", got["names"])
        self.assertNotIn("permission granted", got["spoken"]); self.assertIn("whisper in tools", got["spoken"])

    def test_spoken_survives_the_mouth_filter(self):
        spec = importlib.util.spec_from_file_location("agent_stack_persona_repo_test", STACK / "mouth" / "persona.py")
        M = importlib.util.module_from_spec(spec); spec.loader.exec_module(M)
        with mock.patch.object(self.W, "open_access", return_value=True):
            sp = self.W._list_repos([self.home / "jarvis-main"], True)["spoken"]
        self.assertEqual(M.strip_factory(sp, utterance="What repos do you have installed"), sp)


class BookCandidates(unittest.TestCase):
    def test_candidates_are_spoken_as_names_and_survive_the_mouth(self):
        home = Path(tempfile.mkdtemp()); (home / "Books").mkdir()
        (home / "Books" / "Deep Learning AI.pdf").write_bytes(b"%PDF-1.4")
        W = P._workspace_read_hand()
        got = W._find_documents({"op": "find", "extensions": [".pdf"], "topic": "AI", "path": ""}, [home])
        self.assertTrue(got["files"][0].endswith("Deep Learning AI.pdf"))
        self.assertIn("Deep Learning AI.pdf (in Books)", got["spoken"])
        spec = importlib.util.spec_from_file_location("agent_stack_persona_book_test", STACK / "mouth" / "persona.py")
        M = importlib.util.module_from_spec(spec); spec.loader.exec_module(M)
        self.assertIn("Deep Learning AI.pdf (in Books)", M.strip_factory(got["spoken"], utterance="find books about AI"))


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
