"""Operator loop (Evens 10-15 architecture): model picks general tools, the harness runs them through one gate,
real results go back, until done. A scripted model stands in for the live one; tools run for real in a temp home."""
import importlib.util
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

spec = importlib.util.spec_from_file_location("operator_t", Path(__file__).with_name("operator.py"))
O = importlib.util.module_from_spec(spec)
sys.modules["operator_t"] = O
spec.loader.exec_module(O)


def scripted(*turns):
    """Each turn is a list of (tool, args) or a plain text final answer. Records what the model saw."""
    seen, queue = [], list(turns)

    def fn(messages, tools):
        seen.append(json.loads(json.dumps(messages)))
        turn = queue.pop(0)
        if isinstance(turn, str):
            return {"ok": True, "tool": "", "text": turn}
        return {"ok": True, "tool": turn[0][0], "args": turn[0][1], "call_id": "c0",
                "calls": [{"tool": t, "args": a, "call_id": f"c{i}"} for i, (t, a) in enumerate(turn)]}
    fn.seen = seen
    return fn


class OperatorLoop(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.home = Path(self.tmp.name)
        (self.home / "proj").mkdir()
        for n in ("a.py", "b.py", "notes.txt"):
            (self.home / "proj" / n).write_text("x\n")
        self.hive = self.home / "hive"
        p = mock.patch.object(Path, "home", return_value=self.home)
        p.start(); self.addCleanup(p.stop)
        self.addCleanup(self.tmp.cleanup)

    def test_unfamiliar_task_end_to_end_with_real_tools(self):
        report = str(self.home / "report.txt")
        model = scripted(
            [("shell", {"command": f"cd {self.home}/proj && ls *.py | wc -l"})],
            [("write_file", {"path": report, "content": "python files: 2\n"})],
            [("read_file", {"path": report})],
            [("done", {"summary": "Counted 2 .py files and wrote report.txt", "evidence": report})])
        task = O.Task.create(self.hive, "Count the Python files in ~/proj and save the count to ~/report.txt")
        state = O.run(task.path, model_fn=model)
        self.assertEqual(state["status"], "DONE")
        self.assertEqual((self.home / "report.txt").read_text(), "python files: 2\n")
        tool_results = [m["content"] for m in model.seen[-1] if m["role"] == "tool"]
        self.assertIn("2", tool_results[0])            # the real shell output reached the model
        self.assertIn("read back matches", tool_results[1])
        self.assertIn("python files: 2", tool_results[2])

    def test_kept_stop_is_refused_as_data_and_the_model_goes_another_way(self):
        model = scripted([("shell", {"command": "rm -rf ~/proj"})],
                         [("ask_owner", {"question": "May I delete ~/proj?"})])
        task = O.Task.create(self.hive, "clean up proj")
        state = O.run(task.path, model_fn=model)
        self.assertEqual(state["status"], "WAITING_OWNER")
        self.assertTrue((self.home / "proj").exists())
        self.assertIn("needs Evens's OK", [m for m in model.seen[1] if m["role"] == "tool"][0]["content"])

    def test_tool_error_is_returned_and_recovered(self):
        model = scripted([("read_file", {"path": str(self.home / "missing.txt")})],
                         [("list_dir", {"path": str(self.home / "proj")})],
                         [("done", {"summary": "listed instead"})])
        state = O.run(O.Task.create(self.hive, "read the notes").path, model_fn=model)
        self.assertEqual(state["status"], "DONE")
        first = [m for m in model.seen[1] if m["role"] == "tool"][0]["content"]
        self.assertIn("FileNotFoundError", first)

    def test_cd_persists_like_a_terminal(self):
        model = scripted([("shell", {"command": f"cd {self.home}/proj"})], [("shell", {"command": "ls"})],
                         [("done", {"summary": "ok", "evidence": "ls shows a.py"})])
        O.run(O.Task.create(self.hive, "look").path, model_fn=model)
        self.assertIn("a.py", [m for m in model.seen[2] if m["role"] == "tool"][1]["content"])

    def test_cancel_stops_and_resume_continues_from_disk(self):
        task = O.Task.create(self.hive, "two steps")
        O.cancel(self.hive, task.path.name)
        self.assertEqual(O.run(task.path, model_fn=scripted()).get("status"), "CANCELLED")
        task.write("control.json", {"cancel": False})
        model = scripted([("list_dir", {"path": str(self.home)})], [("done", {"summary": "resumed"})])
        state = O.run(task.path, model_fn=model)
        self.assertEqual(state["status"], "DONE")
        self.assertEqual(model.seen[0][1]["content"], "two steps")  # the original goal survived on disk

    def test_step_limit_ends_a_runaway_loop(self):
        model = scripted(*[[("list_dir", {"path": str(self.home)})]] * 3)
        state = O.run(O.Task.create(self.hive, "loop").path, model_fn=model, max_steps=3)
        self.assertEqual(state["status"], "STEP_LIMIT")

    def test_secret_read_is_flagged_and_masked(self):  # Evens 10-16: flag, never stop
        fake = "sk-or-v1-" + "a" * 48  # synthetic, not a real key
        (self.home / ".env").write_text(f"OPENROUTER_API_KEY={fake}\nMODE=test\n")
        model = scripted([("read_file", {"path": str(self.home / ".env")})], [("done", {"summary": "ok"})])
        O.run(O.Task.create(self.hive, "read env").path, model_fn=model)
        content = [m for m in model.seen[1] if m["role"] == "tool"][0]["content"]
        self.assertIn("Heads up", content); self.assertIn("OPENROUTER_API_KEY", content); self.assertNotIn(fake, content)


class CompletionTruth(OperatorLoop):  # matrix audit 10-16: success must be real before Jarvis says DONE
    def test_failing_command_reports_its_real_exit_code(self):
        model = scripted([("shell", {"command": "false"})], [("done", {"summary": "ok", "evidence": "x"})])
        O.run(O.Task.create(self.hive, "check").path, model_fn=model)
        self.assertIn("exit 1", [m for m in model.seen[1] if m["role"] == "tool"][0]["content"])

    def test_background_job_keeps_its_exit_code(self):
        import time
        task = O.Task.create(self.hive, "bg")
        t = O.Tools(task.path)
        jid = t.shell({"command": "echo hi; exit 3", "background": True})["text"].split()[3]
        for _ in range(50):
            got = t.job({"job_id": jid})["text"]
            if got.startswith("finished"):
                break
            time.sleep(0.1)
        self.assertIn("exit 3", got)

    def test_prose_after_acting_is_not_accepted_as_done(self):
        model = scripted([("shell", {"command": "echo made"})], "All done, it worked.",
                         [("done", {"summary": "made it", "evidence": "echo printed made"})])
        state = O.run(O.Task.create(self.hive, "make the thing").path, model_fn=model)
        self.assertEqual(state["status"], "DONE")
        self.assertEqual(state["evidence"], "echo printed made")
        self.assertTrue(any("Before you finish" in str(m.get("content")) for m in model.seen[2]))

    def test_plain_answer_without_actions_still_finishes(self):
        state = O.run(O.Task.create(self.hive, "what is 2+2").path, model_fn=scripted("4"))
        self.assertEqual(state["status"], "DONE")

    def test_unproven_finish_after_two_checks_is_marked_unverified(self):
        model = scripted([("shell", {"command": "echo x"})], [("done", {"summary": "did it"})],
                         [("done", {"summary": "did it"})], [("done", {"summary": "did it"})])
        with mock.patch.object(O, "record_outcome") as rec:
            state = O.run(O.Task.create(self.hive, "do it").path, model_fn=model)
        self.assertEqual(state["status"], "DONE")
        self.assertTrue(state.get("unverified")); self.assertFalse(state.get("verified"))
        self.assertTrue(rec.called and rec.call_args[0][2] is False)   # not scored as a success

    def test_resume_relaunches_a_dead_running_worker(self):
        task = O.Task.create(self.hive, "long job")
        task.write("state.json", {**task.read("state.json"), "status": "RUNNING", "pid": 999999})
        with mock.patch.object(O.subprocess, "Popen") as pop:
            got = O.resume(self.hive, task.path.name)
        self.assertEqual(got["status"], "QUEUED")
        pop.assert_called_once()


class SpokenOnce(OperatorLoop):  # live 10-17: say + done 12 ms apart were both spoken; "Hello Jarvis" got re-greeted; a line arrived 3x
    def test_done_summary_is_silent_when_anything_was_said_this_turn(self):
        model = scripted([("say", {"text": "The page is on your screen now."})],
                         [("done", {"summary": "The GitHub results are on your screen in Safari.", "evidence": "tab 3"})])
        task = O.Task.create(self.hive, "show it")
        O.run(task.path, model_fn=model)
        self.assertEqual(len(task.rows("speech.jsonl")), 1)

    def test_idle_resume_is_a_plain_line_not_an_interruption(self):
        msgs = [{"role": "system"}, {"role": "user"}, {"role": "assistant"}, {"role": "tool"}]
        self.assertEqual(O.inbox_note({"status": "RUNNING", "turn_at": O.time.time()}, msgs), "")          # just resumed
        self.assertIn("While you were working", O.inbox_note({"status": "RUNNING", "turn_at": O.time.time() - 60}, msgs))
        self.assertEqual(O.inbox_note({"status": "IDLE", "turn_at": 0}, msgs), "")

    def test_same_line_twice_within_twenty_seconds_is_one_line(self):
        task = O.Task.create(self.hive, "search for open source versions of 11 labs")
        O.tell(self.hive, "Search for open source versions of 11 labs in my browser")
        got = O.tell(self.hive, "search for open source versions of 11 labs in my browser.")
        self.assertTrue(got.get("duplicate"))
        self.assertEqual(len(task.rows("inbox.jsonl")), 1)
        self.assertFalse(O.tell(self.hive, "and open the first one").get("duplicate"))


class SelfConfig(OperatorLoop):  # Evens 10-17: Jarvis has access to its own configs and changes what makes sense
    def test_set_get_history_and_refusals(self):
        d = self.home / "cfg"; pers = self.home / "pers"; pers.mkdir(); (pers / "alfred.md").write_text("voice: bm_george\n# A")
        with mock.patch.object(O, "CONFIG_DIR", d), mock.patch.object(O, "CONFIG_LOG", d / "h.jsonl"), mock.patch.object(O, "PERSONALITIES", pers):
            t = O.Tools(O.Task.create(self.hive, "cfg").path)
            self.assertIn("(default)", t.config({"action": "get", "key": "voice"})["text"])
            self.assertIn("-> bm_lewis:50+am_michael:50", t.config({"action": "set", "key": "voice", "value": "bm_lewis:50+am_michael:50", "why": "he chose it"})["text"])
            self.assertIn("refused", t.config({"action": "set", "key": "voice", "value": "rm -rf /"})["text"])
            self.assertIn("refused", t.config({"action": "set", "key": "personality", "value": "nope"})["text"])
            self.assertIn("-> alfred", t.config({"action": "set", "key": "personality", "value": "alfred"})["text"])
            self.assertIn("not a setting", t.config({"action": "set", "key": "OPENROUTER_API_KEY", "value": "x"})["text"])
            self.assertEqual((d / "voice.txt").read_text().strip(), "bm_lewis:50+am_michael:50")
            self.assertEqual(len(t.config({"action": "history"})["text"].splitlines()), 2)


class Personalities(unittest.TestCase):  # Evens 10-17: personalities and their voices are files; one line switches them
    def test_switch_by_name_and_voice_line(self):
        d = Path(tempfile.mkdtemp()); (d / "alfred.md").write_text("voice: bm_george\n# Alfred\nWarm and dry.")
        f = d / "personality.txt"; f.write_text("alfred")
        with mock.patch.object(O, "PERSONALITIES", d), mock.patch.object(O, "PERSONALITY_FILE", f):
            self.assertEqual(O.personality_name(), "alfred"); self.assertEqual(O.personality_voice(), "bm_george")
            self.assertIn("Warm and dry", O.personality()); self.assertNotIn("voice:", O.personality())
            f.write_text("../evil"); self.assertEqual(O.personality_name(), "jarvis-valet")


class JevPicksTheTool(unittest.TestCase):  # Evens 10-16: Jev decides which tool class to reach for, never a stop
    def test_hint_names_the_tool_class_and_keeps_the_stops(self):
        h = O.jev_tool_hint({"kind": "screen", "why": "jev mid/screen 0.81"})
        self.assertIn("Accessibility", h); self.assertIn("stay Evens's", h)
        self.assertEqual(O.jev_tool_hint({"kind": "any"}), "")


class LivingArtifacts(OperatorLoop):
    def test_mermaid_blocks_render_in_html_artifacts(self):
        with mock.patch.object(O, "ARTIFACTS", self.home / "ARTIFACTS"), mock.patch.object(O.subprocess, "run"):
            t = O.Tools(O.Task.create(self.hive, "chart").path)
            t.artifact({"name": "Roadmap", "content": "<h1>r</h1>\n```mermaid\ngraph TD; A-->B\n```", "kind": "html"})
        page = (self.home / "ARTIFACTS/Jarvis/roadmap/roadmap.html").read_text()
        self.assertIn('<pre class="mermaid">graph TD; A-->B', page); self.assertIn("mermaid.min.js", page)
  # Evens 10-16: artifacts (dashboards, trackers, plans...) that update as we build
    def test_publish_then_update_keeps_history_and_index(self):
        with mock.patch.object(O, "ARTIFACTS", self.home / "ARTIFACTS"), mock.patch.object(O.subprocess, "run") as run:
            t = O.Tools(O.Task.create(self.hive, "dash").path)
            a = t.artifact({"name": "Credits Tracker", "content": "<h1>v1</h1>", "kind": "html"})
            b = t.artifact({"name": "Credits Tracker", "content": "<h1>v2</h1>", "kind": "html"})
        self.assertIn("published", a["text"]); self.assertIn("updated", b["text"])
        page = self.home / "ARTIFACTS/Jarvis/credits-tracker/credits-tracker.html"
        self.assertEqual(page.read_text(), "<h1>v2</h1>")
        self.assertEqual(len(list((page.parent / "history").glob("*.html"))), 1)
        self.assertEqual((self.home / "ARTIFACTS/INDEX.md").read_text().count("Credits Tracker"), 1)
        self.assertEqual(run.call_count, 1)   # opened once, on first publish


if __name__ == "__main__":
    unittest.main()
