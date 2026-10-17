"""Operator loop (Evens 10-15 architecture): model picks general tools, the harness runs them through one gate,
real results go back, until done. A scripted model stands in for the live one; tools run for real in a temp home."""
import importlib.util
import json
import subprocess
import time
import os
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

    def test_background_job_streams_stay_apart_and_stop_ends_the_whole_job(self):
        import time
        t = O.Tools(O.Task.create(self.hive, "bg2").path)
        jid = t.shell({"command": "echo out; echo oops >&2; sleep 30 & sleep 30", "background": True})["text"].split()[3]
        time.sleep(0.5)
        self.assertTrue(t.job({"job_id": jid})["text"].startswith("running"))
        got = t.job({"job_id": jid, "action": "stop"})["text"]
        self.assertTrue(got.startswith("stopped by me"), got)
        self.assertIn("out", got); self.assertIn("stderr:\noops", got)
        child = O.subprocess.run(["pgrep", "-g", str(t.jobs[jid]["pid"])], capture_output=True, text=True).stdout.strip()
        self.assertEqual(child, "")  # the sleeps it started are gone too

    def test_a_reused_pid_is_not_mistaken_for_the_job(self):
        t = O.Tools(O.Task.create(self.hive, "bg3").path)
        jid = t.shell({"command": "sleep 0.1", "background": True})["text"].split()[3]
        t.jobs[jid].update(pid=os.getpid(), started="Mon Jan  1 00:00:00 2001")  # another live process holds the number now
        import time; time.sleep(0.4)
        self.assertNotIn("running", t.job({"job_id": jid})["text"].split("\n")[0])

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


class SignalAdd(OperatorLoop):  # rule §15: links found along the way go on the shared list through Jarvis's own tool
    def test_add_puts_the_link_on_the_shared_list(self):
        added = []
        class FakeL:
            @staticmethod
            def add(rows, url, title="", source="", **k): added.append(url); return {"id": "web-x", "status": "new"}
            @staticmethod
            def shared(root, fn, msg, push=True): return fn({})
        class FakeS:
            @staticmethod
            def worktree(): return Path("/tmp")
        with mock.patch.object(O, "_load", side_effect=lambda name, f: FakeL if "ledger" in f else FakeS):
            t = O.Tools(O.Task.create(self.hive, "x").path)
            self.assertIn("on the list: web-x", t.signal({"action": "add", "url": "https://github.com/a/b", "why": "seen in video"})["text"])
        self.assertEqual(added, ["https://github.com/a/b"])


class FeatureLoops(OperatorLoop):  # Evens 10-16/17: looping capabilities, inside the §13 rules
    def test_gates_then_runs_the_kit(self):
        kit = self.home / "kit" / "scripts"; kit.mkdir(parents=True)
        for n in ("round.py", "lock_checks.py", "init.sh", "stats.sh"): (kit / n).write_text("")
        repo = self.home / "wt"; repo.mkdir()
        with mock.patch.object(O, "LOOP_KIT", self.home / "kit"), mock.patch.dict(O.os.environ, {"JARVIS_ONE_MIND": "0"}):
            t = O.Tools(O.Task.create(self.hive, "loop").path)
            self.assertIn("loops are off", t.loop({"action": "show", "repo": str(repo), "feature": "x"})["text"])
        with mock.patch.object(O, "LOOP_KIT", self.home / "kit"), mock.patch.dict(O.os.environ, {"JARVIS_ONE_MIND": "1"}), \
             mock.patch.object(O.subprocess, "run", return_value=mock.Mock(returncode=0, stdout="shown", stderr="")) as run:
            self.assertIn("refused", t.loop({"action": "show", "repo": str(Path.home() / "jarvis-main"), "feature": "x"})["text"])
            self.assertIn("refused", t.loop({"action": "lock", "repo": str(repo), "feature": "x"})["text"])           # no approval words
            self.assertIn("shown", t.loop({"action": "show", "repo": str(repo), "feature": "my-feat"})["text"])
            got = t.loop({"action": "lock", "repo": str(repo), "feature": "my-feat", "approval": "yes, happy with these"})
            self.assertIn("exit 0", got["text"]); self.assertIn("--approval 'yes, happy with these'", run.call_args[0][0][-1])


class OneBlueCursor(unittest.TestCase):  # Evens 10-17: cua's cursor in Jarvis blue; Jarvis's own overlay off
    def test_cua_session_gets_the_theme_once_and_own_cursor_is_off(self):
        calls = []
        with mock.patch.object(O, "_CUA_THEMED", set()), mock.patch.object(O.CUA_DRIVER.__class__, "is_file", return_value=True), \
             mock.patch.object(O.subprocess, "run", side_effect=lambda argv, **k: calls.append(argv)):
            O._cua_cursor("jarvis"); O._cua_cursor("jarvis")
        self.assertEqual([c[2] for c in calls], ["set_agent_cursor_theme", "set_agent_cursor_enabled"])
        self.assertIn('"theme_id": "jarvis.blue"', calls[0][3])
        self.assertFalse(O.OWN_CURSOR)


class FreshBudgetPerRequest(unittest.TestCase):  # live 10-17: a new test line joined the idle $1.52 bunny job and was paused at once
    def test_idle_session_woken_by_a_new_line_gets_its_own_budget(self):
        d = Path(tempfile.mkdtemp()); task = O.Task(d / "t"); task.path.mkdir(parents=True)
        task.write("state.json", {"status": "IDLE", "cost_usd": 1.52, "cost_cap": 1.5, "pending_cap": True})
        (task.path / "inbox.jsonl").write_text(json.dumps({"at": 1, "text": "new request"}) + "\n")  # what tell() writes
        with mock.patch.object(O, "IDLE_S", 3), mock.patch.object(O, "_release_rev", return_value="", create=True):
            self.assertTrue(O._idle_until_spoken_to(task))
        st = task.read("state.json")
        self.assertEqual(st["status"], "RUNNING"); self.assertFalse(st["pending_cap"])
        self.assertFalse(O.HX.over_cap(st)); self.assertAlmostEqual(st["cost_cap"], 1.52 + O.HX.JOB_COST_CAP, 2)


class OpenableRows(unittest.TestCase):  # live 10-17: Finder rows refused AXPress (-25206); cua-driver's own double_click uses AXOpen
    def test_press_on_a_row_that_refuses_axpress_falls_back_to_axopen(self):
        calls = []
        def hands(req):
            calls.append(req)
            if req.get("op") == "ax_act" and req.get("action") == "AXPress":
                return {"ok": False, "why": "the element refused AXPress (-25206)"}
            return {"ok": True}
        tools = O.Tools.__new__(O.Tools); tools.state = {"ax_refs": {"finder": [[0, 1]]}}
        tools._hands_json = hands; tools._show_cursor = lambda *a: None
        with mock.patch.object(O.Tools, "app", side_effect=lambda self, a: {"text": "read"} if a.get("action") == "read" else O.Tools.app.__wrapped__(self, a), autospec=True):
            pass
        orig_read = O.Tools.app
        def app(self, a):
            return {"text": "Finder: 1 elements"} if a.get("action") == "read" else orig_read(self, a)
        with mock.patch.object(O.Tools, "app", app):
            got = orig_read(tools, {"action": "press", "app": "Finder", "ref": 1})
        self.assertIn("Did open on 1", got["text"])
        self.assertEqual([c.get("action") for c in calls if c.get("op") == "ax_act"], ["AXPress", "AXOpen"])


class CancelReachesBackgroundJobs(unittest.TestCase):  # matrix "conc": cancellation propagation
    def test_stop_ends_the_jobs_background_commands(self):
        tmp = tempfile.TemporaryDirectory(); self.addCleanup(tmp.cleanup)
        task = O.Task.create(Path(tmp.name), "long thing")
        calls = {"n": 0}
        def model(m, t):
            calls["n"] += 1
            if calls["n"] == 1:
                return {"ok": True, "tool": "shell", "args": {"command": "sleep 60", "background": True}, "call_id": "c0",
                        "calls": [{"tool": "shell", "args": {"command": "sleep 60", "background": True}, "call_id": "c0"}]}
            task.write("control.json", {"cancel": True})  # he says stop while it waits
            return {"ok": True, "tool": "say", "args": {"text": "waiting"}, "call_id": "c1", "calls": [{"tool": "say", "args": {"text": "waiting"}, "call_id": "c1"}]}
        state = O.run(task.path, model_fn=model)
        self.assertEqual(state["status"], "CANCELLED"); self.assertEqual(len(state.get("stopped_jobs") or []), 1)
        pid = json.loads((task.path / "tools_state.json").read_text())["jobs"][state["stopped_jobs"][0]]["pid"]
        self.assertEqual(subprocess.run(["pgrep", "-g", str(pid)], capture_output=True, text=True).stdout.strip(), "")


class AxOwners(unittest.TestCase):  # axcontrol: repeated labels say whose they are
    def test_close_tab_buttons_name_their_tab(self):
        els = [{"path": [0], "role": "AXWindow", "label": "proof.pdf"},
               {"path": [0, 2, 0], "role": "AXRadioButton", "label": "GitHub audit review.png"},
               {"path": [0, 2, 0, 0], "role": "AXButton", "label": "Close tab"},
               {"path": [0, 2, 1], "role": "AXRadioButton", "label": "proof.pdf"},
               {"path": [0, 2, 1, 0], "role": "AXButton", "label": "Close tab"},
               {"path": [0, 3], "role": "AXButton", "label": "Share"}]
        self.assertEqual(O._ax_owners(els), {2: "GitHub audit review.png", 4: "proof.pdf"})


class PressThatChangedNothing(unittest.TestCase):  # axcontrol: no false "Did press"
    def test_unchanged_app_after_a_press_is_flagged(self):
        tree = {"ok": True, "elements": [{"path": [0], "role": "AXWindow", "label": "proof.pdf"},
                                         {"path": [0, 1], "role": "AXButton", "label": "Close tab", "actions": ["AXPress"]}]}
        t = O.Tools(Path(tempfile.mkdtemp()))
        with mock.patch.object(O.Tools, "_hands_json", side_effect=lambda req: tree if req["op"] == "ax_tree" else {"ok": True}), \
             mock.patch.object(O.time, "sleep"), mock.patch.object(O.Tools, "_show_cursor", create=True):
            t.app({"action": "read", "app": "Preview"})
            got = t.app({"action": "press", "app": "Preview", "ref": 2})["text"]
        self.assertIn("CHECK: nothing in the app changed", got)


class OpenWith(unittest.TestCase):  # macread: his default PDF app is PdfCraft; "in Preview" must mean Preview
    def test_with_names_the_app(self):
        seen = []
        with mock.patch.object(O.subprocess, "run", side_effect=lambda argv, **k: seen.append(argv) or O.subprocess.CompletedProcess(argv, 0, "", "")):
            O.Tools(Path(tempfile.mkdtemp())).open({"target": "~/a.pdf", "with": "Preview"})
            O.Tools(Path(tempfile.mkdtemp())).open({"target": "~/a.pdf"})
        self.assertEqual(seen[0][:3], ["open", "-a", "Preview"]); self.assertEqual(len(seen[1]), 2)


class NoSightWithoutLooking(unittest.TestCase):  # Z54
    def test_describing_the_screen_without_looking_is_sent_back(self):
        tmp = tempfile.TemporaryDirectory(); self.addCleanup(tmp.cleanup)
        model = scripted("Your screen shows Safari with three tabs open.",
                         [("done", {"summary": "The screen wire is off, so I have nothing to describe yet.", "evidence": "no look taken"})])
        state = O.run(O.Task.create(Path(tmp.name), "what's on my screen?").path, model_fn=model)
        self.assertTrue(any("you did not look this turn" in str(m.get("content")) for m in model.seen[1]))
        self.assertIn("nothing to describe", state["summary"])


class NoCreditIsNotDone(unittest.TestCase):  # live 10-17: "I couldn't ... Add credits" closed jobs as DONE
    def test_the_local_refusal_ends_the_job_as_model_unavailable_spoken_once(self):
        tmp = tempfile.TemporaryDirectory(); self.addCleanup(tmp.cleanup)
        task = O.Task.create(Path(tmp.name), "translate the page")
        line = "I couldn't work that out with the free local model. Add credits to OpenRouter."
        model = lambda m, t: {"ok": True, "tool": "", "text": line, "no_credit": True}
        state = O.run(task.path, model_fn=model)
        self.assertEqual(state["status"], "MODEL_UNAVAILABLE"); self.assertEqual(state["summary"], line)
        self.assertEqual([r["text"] for r in task.rows("speech.jsonl")].count(line), 1)


class TruthfulStatus(unittest.TestCase):  # matrix "jobtruth": RUNNING with a dead PID was reported as running
    def test_a_running_record_with_a_dead_worker_is_stalled(self):
        d = Path(tempfile.mkdtemp()); (d / "operator-tasks" / "t1").mkdir(parents=True)
        (d / "operator-tasks" / "t1" / "state.json").write_text(json.dumps({"task_id": "t1", "status": "RUNNING", "pid": 999999999}))
        (d / "operator-tasks" / "latest.json").write_text(json.dumps({"task_id": "t1"}))
        st = O.status(d)
        self.assertEqual(st["status"], "STALLED"); self.assertEqual(st["recorded_status"], "RUNNING"); self.assertFalse(O.running(d))


class RepickPerRequest(unittest.TestCase):  # live 10-17: cheap requests inherited the Sonnet pick of the idle session they joined
    def test_idle_wake_repicks_the_model_for_the_new_line(self):
        d = Path(tempfile.mkdtemp()); task = O.Task(d / "t"); task.path.mkdir(parents=True)
        task.write("state.json", {"status": "IDLE", "tier": "owner", "model": "anthropic/claude-sonnet-5.5", "cost_usd": 0.5})
        task.write("messages.json", [])
        (task.path / "inbox.jsonl").write_text(json.dumps({"at": 1, "text": "click 12 times 7"}) + "\n")
        with mock.patch.object(O, "IDLE_S", 3), mock.patch.object(O, "_jev_tier", return_value={"tier": "cheap", "conf": 0.95, "kind": "screen"}), \
             mock.patch.object(O, "_owner_model", return_value="anthropic/claude-sonnet-5.5"), mock.patch.object(O, "_scores", return_value={}):
            self.assertTrue(O._idle_until_spoken_to(task))
        st = task.read("state.json")
        self.assertEqual(st["tier"], "cheap"); self.assertEqual(st["model"], "deepseek/deepseek-v4-flash")


class ShellExitTruth(unittest.TestCase):  # matrix "honesty"/"term": the cwd printf must not mask a failing command
    def test_failing_command_reports_its_exit_code(self):
        tools = O.Tools(Path(tempfile.mkdtemp()))
        got = tools.shell({"command": "false"})
        self.assertTrue(got["text"].startswith("exit 1"), got["text"][:80])


class ProseOnlyDone(unittest.TestCase):  # matrix "vrec": an action request closed with prose, nothing acted
    def test_done_without_any_action_on_an_action_request_is_sent_back_once(self):
        d = Path(tempfile.mkdtemp()); task = O.Task(d / "t"); task.path.mkdir(parents=True)
        task.write("request.json", {"goal": "open Calculator and click 2 plus 2"}); task.write("state.json", {"turn_at": 1})
        why = O._done_gate(task, "done", {"summary": "Done, the answer is 4."})
        self.assertIn("no tool acted", why)
        task.trace({"event": "tool", "tool": "app", "args": {}, "at": 2})
        self.assertNotIn("no tool acted", O._done_gate(task, "done", {"summary": "Done.", "evidence": "display 4"}))


class PersonalityDials(unittest.TestCase):  # Z26
    def test_dials_are_config_keys_and_reach_the_prompt(self):
        d = Path(tempfile.mkdtemp())
        with mock.patch.object(O, "CONFIG_DIR", d), mock.patch.object(O, "CONFIG_LOG", d / "h.jsonl"), mock.patch.object(O, "PERSONALITIES", d):
            tools = O.Tools(d / "task"); tools.dir.mkdir(parents=True, exist_ok=True)
            got = tools.config({"key": "humor", "action": "set", "value": "100"}); self.assertIn("100", got["text"])
            self.assertIn("humor 100%", O.dials_text())
            self.assertIn("never changes", O.personality())
            bad = tools.config({"key": "honesty", "action": "set", "value": "250"}); self.assertNotIn("250%", O.dials_text())


class DrivingAndTakeover(unittest.TestCase):  # Z29: badge while driving, hands off the moment he touches the mouse
    def test_owner_touched_reads_hid_idle(self):
        self.assertTrue(O.owner_touched(0.5)); self.assertFalse(O.owner_touched(30))

    def test_orb_view_lists_tools_run_pick_and_chips(self):
        d = Path(tempfile.mkdtemp()); (d / "operator-tasks" / "t1").mkdir(parents=True)
        (d / "operator-tasks" / "t1" / "state.json").write_text(json.dumps({"task_id": "t1", "status": "RUNNING", "pid": os.getpid(), "turn_at": 1,
                                                                             "tier": "cheap", "model": "deepseek/deepseek-v4-flash", "jev": {"tier": "cheap", "ne": 0.13},
                                                                             "driving": {"tool": "app", "since": 5}, "cost_usd": 0.004}))
        (d / "operator-tasks" / "t1" / "request.json").write_text(json.dumps({"goal": "click 12 times 7 in Calculator"}))
        (d / "operator-tasks" / "latest.json").write_text(json.dumps({"task_id": "t1"}))
        with (d / "operator-tasks" / "t1" / "trace.jsonl").open("w") as fh:
            for tool in ("app", "app", "say", "app"):
                fh.write(json.dumps({"event": "tool", "tool": tool, "at": 2}) + "\n")
        v = O.orb_view(d)
        self.assertEqual(v["tools_run"], {"app": 3}); self.assertEqual(v["driving"]["tool"], "app")
        self.assertEqual(v["jev"]["ne"], 0.13); self.assertIn("How is it going?", v["chips"]); self.assertIn("click 12 times 7 in Calculator", v["chips"])


class CuaThroughDaemon(unittest.TestCase):  # live 10-17: "session is not available to this transport" on every MCP call
    def test_cua_calls_go_through_the_daemon_with_jarvis_session_and_keep_the_write_gate(self):
        tools = O.Tools(Path(tempfile.mkdtemp()))
        with mock.patch.object(O, "_cua_cursor"), mock.patch.object(O.subprocess, "run", return_value=mock.Mock(returncode=0, stdout="{\"apps\": []}", stderr="")) as run:
            got = tools.mcp({"server": "cua-driver", "tool": "list_apps", "arguments": {}})
        self.assertIn("answered", got["text"])
        argv = run.call_args[0][0]
        self.assertEqual(argv[1:3], ["call", "list_apps"]); self.assertEqual(json.loads(argv[3])["session"], "jarvis")
        at = O._load("agent_tools", "agent_tools.py")
        with mock.patch.object(at, "_open_access", return_value=False), mock.patch.object(O.subprocess, "run") as run2:
            got = tools.mcp({"server": "cua-driver", "tool": "kill_app", "arguments": {"pid": 1}})
        self.assertIn("needs Evens", got["text"]); run2.assert_not_called()


class AppTypeWaitsForWindow(unittest.TestCase):  # live 10-17: "opened bg2.txt but found no window for it"
    def test_window_that_appears_late_is_found(self):
        f = Path(tempfile.mkdtemp()) / "late.txt"; f.write_text("")
        seen = {"n": 0}
        def run(argv, **kw):
            tool = argv[2]
            if tool == "launch_app": out = {"pid": -1, "launch_state": {"window_ready": False}}   # app already running
            elif tool == "list_apps": out = {"apps": [{"bundle_id": "com.apple.TextEdit", "running": True, "pid": 42}]}
            elif tool == "list_windows":
                seen["n"] += 1
                out = {"windows": [] if seen["n"] < 3 else [{"window_id": 7, "title": "late.txt", "is_on_screen": True}]}
            elif tool == "get_window_state": out = {"elements": [{"role": "AXTextArea", "element_token": "s1:3"}], "snapshot_id": "s1"}
            else: out = {"ok": True}
            return mock.Mock(returncode=0, stdout=json.dumps(out), stderr="")
        tools = O.Tools(Path(tempfile.mkdtemp()))
        with mock.patch.object(O.subprocess, "run", side_effect=run), mock.patch.object(O, "_cua_cursor"), mock.patch.object(O.time, "sleep"):
            got = tools.app_type({"file": str(f), "text": "hello"})
        self.assertNotIn("found no window", got["text"]); self.assertGreaterEqual(seen["n"], 3)


class InputLease(unittest.TestCase):  # matrix "inputlease"
    def test_second_job_cannot_take_the_pointer_while_one_holds_it(self):
        d = Path(tempfile.mkdtemp())
        with mock.patch.object(O, "INPUT_LOCK", d / "input.lock"), mock.patch.object(O, "LEASE_WAIT_S", 0.5):
            import subprocess as sp, sys as _s
            holder = sp.Popen([_s.executable, "-c", f"import fcntl,time;f=open({str(d / 'input.lock')!r},'a+');fcntl.flock(f,fcntl.LOCK_EX);time.sleep(3)"])
            time.sleep(0.5)
            with self.assertRaises(O.LeaseBusy):
                with O.input_lease("computer", "job2"):
                    pass
            with O.input_lease("app", "job2"):  # background tools never wait
                pass
            holder.wait()
            with O.input_lease("computer", "job2"):
                self.assertEqual((d / "input.lock").read_text(), "job2")


class EffectAwareRetry(unittest.TestCase):  # matrix "effectretry"
    def test_identical_action_after_an_error_is_held_once_for_a_check(self):
        d = Path(tempfile.mkdtemp()); task = O.Task(d / "t"); task.path.mkdir(parents=True)
        task.write("state.json", {"status": "RUNNING", "turn_at": 1}); task.write("request.json", {"goal": "write it"})
        calls = []
        class Tl:
            def write_file(self, a):
                calls.append(a); return {"text": "error: TimeoutError: timed out"} if len(calls) == 1 else {"text": "wrote"}
        tools = Tl()
        def model(c):
            return lambda m, t: {"ok": True, "calls": [{"tool": "write_file", "args": {"path": "/tmp/x", "content": "y"}, "call_id": c}]}
        task.write("messages.json", [{"role": "user", "content": "write it"}])
        with mock.patch.object(O, "_authority") as au:
            au.return_value.authorize.return_value = ("allow", "")
            for i in range(3):
                O.step_once(task, tools, model(f"c{i}"))
        self.assertEqual(len(calls), 2)  # first ran (error), second held for a check, third ran
        held = [r for r in task.rows("trace.jsonl") if "may already have taken effect" in str(r.get("result"))]
        self.assertEqual(len(held), 1)


class StaleRefs(unittest.TestCase):  # matrix "observations"
    def test_old_read_is_refreshed_and_the_same_element_is_found(self):
        tools = O.Tools(Path(tempfile.mkdtemp()))
        reads = [[{"role": "AXButton", "label": "OK", "path": [0, 1]}, {"role": "AXButton", "label": "Cancel", "path": [0, 2]}],
                 [{"role": "AXButton", "label": "Help", "path": [0, 0]}, {"role": "AXButton", "label": "Cancel", "path": [0, 5]},
                  {"role": "AXButton", "label": "OK", "path": [0, 6]}]]
        acted = []
        def hands(req):
            if req["op"] == "ax_tree":
                return {"ok": True, "elements": reads.pop(0)}
            acted.append(req); return {"ok": True}
        tools._hands_json = hands; tools._show_cursor = lambda *a: None
        tools.app({"action": "read", "app": "X"})
        tools.state["ax_read_at"]["x"] = 0  # pretend the read is old
        with mock.patch.object(O.time, "sleep"), mock.patch.object(O.Tools, "app", wraps=tools.app) as _:
            pass
        orig = O.Tools.app
        def app(self, a):
            return {"text": "read"} if a.get("action") == "read" and acted else orig(self, a)
        with mock.patch.object(O.time, "sleep"), mock.patch.object(O.Tools, "app", app):
            orig(tools, {"action": "press", "app": "X", "ref": 1})
        self.assertEqual(acted[0]["path"], [0, 6])  # "OK" moved from position 1 to 3


class TakeoverSpeed(unittest.TestCase):  # Z05
    def test_fast_mode_hands_back_sooner(self):
        d = Path(tempfile.mkdtemp())
        with mock.patch.object(O, "CONFIG_DIR", d):
            self.assertEqual(O.takeover_window(), O.TAKEOVER_S)
            (d / "takeover-speed.txt").write_text("fast")
            self.assertEqual(O.takeover_window(), 0.7)
            self.assertFalse(O.owner_touched(1.0)); self.assertTrue(O.owner_touched(0.5))


class ScheduleTool(unittest.TestCase):  # canvas wire sched -> pipe: the operator brain can schedule what he asks
    def test_schedule_registers_lists_and_cancels_through_the_loop_registry(self):
        d = Path(tempfile.mkdtemp())
        with mock.patch.dict(os.environ, {"JARVIS_LOOPS_FILE": str(d / "loops.json")}):
            tools = O.Tools(d / "t")
            self.assertIn("every day at 06:00", tools.schedule({"op": "start", "what": "reports my morning brief", "at": "06:00"})["text"])
            self.assertIn("morning brief", tools.schedule({"op": "list"})["text"])
            self.assertIn("won't loop", tools.schedule({"op": "start", "what": "sends an email to Bob"})["text"])
            self.assertIn("Cancelled", tools.schedule({"op": "cancel", "id": "reports my morning brief"})["text"])
        self.assertIn("schedule", [t["function"]["name"] for t in O.TOOLS]); self.assertIn("schedule", O.ACTING_TOOLS)


class EventReplay(unittest.TestCase):  # matrix "eventreplay"
    def test_lines_are_numbered_and_replayed_from_a_sequence(self):
        d = Path(tempfile.mkdtemp()); root = d / "operator-tasks"
        task = O.Task(root / "t1"); task.path.mkdir(parents=True)
        task.write("state.json", {"task_id": "t1", "status": "DONE"}); task.write("request.json", {"goal": "g"})
        (root / "latest.json").write_text(json.dumps({"task_id": "t1"}))
        for line in ("Starting.", "Halfway.", "Done, the file is saved."):
            task.speak(line)
        got = O.events(d, "t1", 1)
        self.assertEqual([l["seq"] for l in got["lines"]], [1, 2]); self.assertEqual(got["seq"], 3)
        self.assertEqual(got["lines"][-1]["text"], "Done, the file is saved.")
        self.assertEqual(O.events(d, "", 0)["task_id"], "t1")            # no task given: the latest job
        self.assertEqual(O.events(d, "../etc", 0)["task_id"], "t1")      # a bad id never escapes the task folder


class SlowToolStatus(unittest.TestCase):  # Z81
    def test_a_slow_tool_gets_one_plain_line_and_a_fast_one_none(self):
        d = Path(tempfile.mkdtemp()); task = O.Task(d / "t"); task.path.mkdir(parents=True)
        task.write("state.json", {"status": "RUNNING", "turn_at": 1}); task.write("request.json", {"goal": "g"})
        class Tl:
            def shell(self, a):
                time.sleep(float(a["s"])); return {"text": "exit 0"}
        def model(s):
            return lambda m, t: {"ok": True, "calls": [{"tool": "shell", "args": {"command": "x", "s": s}, "call_id": "c"}]}
        task.write("messages.json", [{"role": "user", "content": "g"}])
        with mock.patch.object(O, "_authority") as au, mock.patch.object(O, "SLOW_TOOL_S", 0.3):
            au.return_value.authorize.return_value = ("allow", "")
            O.step_once(task, Tl(), model(0.05)); time.sleep(0.4)
            self.assertEqual(task.rows("speech.jsonl"), [])
            O.step_once(task, Tl(), model(0.6))
        lines = [r["text"] for r in task.rows("speech.jsonl")]
        self.assertEqual(lines, ["Still on it; that command is taking a moment."])
        self.assertTrue(task.rows("speech.jsonl")[0].get("filler"))
        self.assertTrue(all(w in O.SLOW_WORDS for w in ("find_files", "grep", "read_file")))


class VoiceSpeed(unittest.TestCase):  # X07
    def test_speed_setting_is_validated_and_clamped(self):
        d = Path(tempfile.mkdtemp())
        with mock.patch.object(O, "CONFIG_DIR", d), mock.patch.object(O, "CONFIG_LOG", d / "h.jsonl"):
            (d / "t").mkdir(); tools = O.Tools(d / "t")
            self.assertIn("1.1", tools.config({"key": "voice_speed", "action": "set", "value": "1.1"})["text"])
            self.assertIn("refused", tools.config({"key": "voice_speed", "action": "set", "value": "3"})["text"])


class VaultGraphFocus(unittest.TestCase):  # Z70: focus puts the note on his Orb graph through the job state
    def test_focus_is_recorded_for_the_orb(self):
        d = Path(tempfile.mkdtemp()); vault = d / "v"; vault.mkdir(); (vault / "Strategy.md").write_text("x")
        task_dir = d / "operator-tasks" / "t1"; task_dir.mkdir(parents=True); O.Task(task_dir).write("state.json", {"task_id": "t1"})
        (d / "operator-tasks" / "latest.json").write_text(json.dumps({"task_id": "t1"}))
        with mock.patch.dict(os.environ, {"JARVIS_VAULT": str(vault)}):
            got = O.Tools(task_dir).vault_graph({"op": "focus", "name": "strategy"})
        self.assertIn("Showing Strategy", got["text"])
        self.assertEqual(O.orb_view(d)["graph_focus"]["note"], "Strategy")


class CourseIndex(unittest.TestCase):  # Saylor: all his courses known on every turn
    def test_course_skills_are_listed_and_others_are_not(self):
        d = Path(tempfile.mkdtemp()); sk = d / ".claude/skills"
        for n in ("ug-american-government", "grad-brand-management-equity-architecture", "prdv-time-stress-goal-productivity", "react-patterns"):
            (sk / n).mkdir(parents=True)
        with mock.patch.object(O.Path, "home", return_value=d), mock.patch.object(O, "_COURSES", []):
            got = O.course_index()
        self.assertIn("3: grad-brand-management-equity-architecture, prdv-time-stress-goal-productivity, ug-american-government", got)
        self.assertNotIn("react-patterns", got)


class AnswerTheQuestion(unittest.TestCase):  # live 10-17: "What time is it?" -> "Proved the current time."
    def _gate(self, goal, summary):
        d = Path(tempfile.mkdtemp()); task = O.Task(d / "t"); task.path.mkdir(parents=True)
        task.write("request.json", {"goal": goal}); task.write("state.json", {"turn_at": 1})
        task.trace({"event": "tool", "tool": "shell", "args": {}, "at": 2})
        return O._done_gate(task, "done", {"summary": summary, "evidence": "date said 05:21"})

    def test_a_report_about_the_work_is_sent_back(self):
        self.assertIn("answer itself", self._gate("What time is it?", "Proved the current time."))
        self.assertIn("answer itself", self._gate("Quelle heure est-il ?", "Verified the time."))
        self.assertIn("answer itself", self._gate("What time is it?", "Reported the current time"))
        self.assertIn("answer itself", self._gate("What time is it?", "Sir. Checked the clock for you."))

    def test_the_answer_itself_passes(self):
        self.assertEqual(self._gate("What time is it?", "It's 5:21 in the morning, sir."), "")
        self.assertEqual(self._gate("Quelle heure est-il ?", "Il est 5 h 21, samedi 17 octobre."), "")
        self.assertEqual(self._gate("Open Calculator", "Opened Calculator."), "")  # not a question


class FillerNeverSilencesTheAnswer(unittest.TestCase):  # live 10-17: the time he asked for was never spoken
    def test_done_summary_is_spoken_after_a_filler(self):
        d = Path(tempfile.mkdtemp()); task = O.Task(d / "t"); task.path.mkdir(parents=True)
        task.write("state.json", {"status": "RUNNING", "turn_at": 1}); task.write("request.json", {"goal": "What time is it?"})
        task.speak("Still on it; the file search is taking a moment.", filler=True)
        task.trace({"event": "tool", "tool": "shell", "args": {}, "at": 2})
        task.write("messages.json", [{"role": "user", "content": "What time is it?"}])
        model = lambda m, t: {"ok": True, "calls": [{"tool": "done", "args": {"summary": "It's 5:37 in the morning, sir.", "evidence": "date"}, "call_id": "c"}]}
        with mock.patch.object(O, "_authority") as au:
            au.return_value.authorize.return_value = ("allow", "")
            O.step_once(task, mock.Mock(), model)
        self.assertEqual([r["text"] for r in task.rows("speech.jsonl")][-1], "It's 5:37 in the morning, sir.")


class ApprovalRecord(unittest.TestCase):  # Z60
    def test_his_yes_is_recorded_with_what_it_covers(self):
        d = Path(tempfile.mkdtemp()); root = d / "operator-tasks"; task = O.Task(root / "t1"); task.path.mkdir(parents=True)
        task.write("state.json", {"task_id": "t1", "status": "WAITING_OWNER", "pid": os.getpid(), "pending_ok": "fp123", "pending_what": "that sends an email to Bob"})
        (root / "latest.json").write_text(json.dumps({"task_id": "t1"}))
        with mock.patch.object(O, "APPROVALS", d / "approvals.jsonl"), mock.patch.object(O, "running", return_value=True):
            O.tell(d, "yes, send it")
        rec = json.loads((d / "approvals.jsonl").read_text().splitlines()[0])
        self.assertEqual((rec["who"], rec["covers"], rec["scope"], rec["channel"]), ("Evens", "fp123", "this one call", "orb"))
        self.assertIn("email to Bob", rec["what"]); self.assertEqual(rec["words"], "yes, send it")
        self.assertEqual(task.read("state.json")["granted"], "fp123")


class FocusTool(unittest.TestCase):  # Z17: the operator brain can start and stop a focus lock
    def test_focus_start_and_stop_reach_the_focus_session(self):
        fake = mock.Mock(); fake.focus_arm.return_value = {"spoken": "Locked on Pages, sir. 1 minute on the clock."}
        fake.focus_stand_down.return_value = {"spoken": "Standing down, sir. 1 of 1 minute on target, 0 drifts."}
        tools = O.Tools(Path(tempfile.mkdtemp()))
        with mock.patch.object(O, "_load_brain", return_value=fake):
            self.assertIn("Locked on Pages", tools.focus({"op": "start", "minutes": 1})["text"])
            self.assertIn("Standing down", tools.focus({"op": "stop"})["text"])
        fake.focus_arm.assert_called_once(); self.assertEqual(fake.focus_arm.call_args[0][1], 1)
        self.assertIn("focus", O.ACTING_TOOLS)


class EscalationKeepsTheCheapChain(unittest.TestCase):  # live 10-17: escalated to a dead pin and fell to the local model
    def test_owner_chain_keeps_the_cheap_models_behind_the_pin(self):
        seen = {}
        class On:
            @staticmethod
            def load_existing_env(): pass
            @staticmethod
            def call_openrouter_messages(messages, tools, model_chain=(), **kw):
                seen["chain"] = model_chain; return {"ok": True}
        with mock.patch.dict(sys.modules, {"op_online": On}), mock.patch.object(O, "_owner_model", return_value="anthropic/claude-sonnet-5.5"):
            O._model_fn("owner", ["deepseek/deepseek-v4-flash", "anthropic/claude-haiku-5.5"])([], [])
        self.assertEqual(seen["chain"][:3], ("anthropic/claude-sonnet-5.5", "deepseek/deepseek-v4-flash", "anthropic/claude-haiku-5.5"))
        self.assertEqual(len(seen["chain"]), len(set(seen["chain"])))
        O._model_fn("owner", None)([], [])  # the pin alone: the cheap pool still stands behind it (no credit -> DeepSeek, not local)
        self.assertEqual(seen["chain"][0], "anthropic/claude-sonnet-5.5"); self.assertIn("deepseek/deepseek-v4-flash", seen["chain"])
        self.assertGreaterEqual(O.CHEAP_ESCALATE_STEPS, 20)


class McpSteps(unittest.TestCase):  # canvas "apps": stateful servers need new -> edit -> save in ONE session
    def test_steps_run_in_one_session_and_each_step_is_gated(self):
        at = O._load("agent_tools", "agent_tools.py")
        with mock.patch.object(at, "_mcp_session", return_value=[(True, "doc 0"), (True, "slide 1"), (True, "saved")]) as sess, \
             mock.patch.object(at, "_open_access", return_value=True), \
             mock.patch.object(O._load("mcp_inventory", "mcp_inventory.py"), "server_spec", return_value={"command": "x"}):
            got = at.op_mcp_steps("deckcraft", [{"tool": "new_presentation"}, {"tool": "add_slide", "arguments": {"title": "t"}},
                                                {"tool": "save_presentation", "arguments": {"path": "/tmp/a.pptx"}}])
        self.assertTrue(got["ok"]); self.assertEqual(sess.call_count, 1)
        self.assertEqual([c[0] for c in sess.call_args[0][1]], ["new_presentation", "add_slide", "save_presentation"])
        with mock.patch.object(at, "_mcp_session") as sess2, mock.patch.object(at, "_open_access", return_value=True):
            got = at.op_mcp_steps("gmail", [{"tool": "read_inbox"}, {"tool": "send_email", "arguments": {}}])
        self.assertTrue(got.get("gated")); sess2.assert_not_called()   # a send anywhere in the list stops all steps


class RememberTool(unittest.TestCase):  # memory wired to the operator brain; only his words are stored
    def test_his_words_are_kept_and_reach_the_prompt(self):
        d = Path(tempfile.mkdtemp()); task = O.Task(d / "t"); task.path.mkdir(parents=True)
        with mock.patch.dict(os.environ, {"JARVIS_MEMORY_FILE": str(d / "mem.json")}):
            task.write("messages.json", [{"role": "user", "content": "Remember that my sister's birthday is March 3"}])
            tools = O.Tools(task.path)
            self.assertIn("remember", tools.remember({"op": "remember", "text": "his sister loves jazz and lives in Paris"})["text"].lower())
            stored = json.loads((d / "mem.json").read_text())
            self.assertEqual(stored, ["my sister's birthday is March 3"])   # his words, not the model's embellishment
            self.assertIn("my sister's birthday is March 3", O.memory_text())
            self.assertIn("March 3", tools.remember({"op": "recall", "text": "birthday"})["text"])
            task.write("messages.json", [{"role": "user", "content": "Do this.\n\nEvens's exact words: Remember that the gate code is blue"}])
            tools.remember({"op": "remember", "text": "x"})
            self.assertIn("the gate code is blue", json.loads((d / "mem.json").read_text()))
            task.write("messages.json", [{"role": "user", "content": "What's the weather?"}])
            self.assertIn("didn't ask me to remember", tools.remember({"op": "remember", "text": "invented fact"})["text"])
            self.assertEqual(json.loads((d / "mem.json").read_text()), ["my sister's birthday is March 3", "the gate code is blue"])


class PidReuse(unittest.TestCase):  # fault trial: a reused pid must not make a dead job look alive
    def test_a_live_pid_that_is_not_a_jarvis_worker_is_not_alive(self):
        other = subprocess.Popen(["sleep", "5"])
        try:
            self.assertFalse(O._alive(other.pid))           # exists, but it is `sleep`, not a worker
        finally:
            other.kill(); other.wait()
        self.assertTrue(O._alive(os.getpid()))              # the process running the job itself
        self.assertFalse(O._alive(999999999))
        d = Path(tempfile.mkdtemp()); (d / "operator-tasks" / "t1").mkdir(parents=True)
        other = subprocess.Popen(["sleep", "5"])
        try:
            (d / "operator-tasks" / "t1" / "state.json").write_text(json.dumps({"task_id": "t1", "status": "RUNNING", "pid": other.pid}))
            (d / "operator-tasks" / "latest.json").write_text(json.dumps({"task_id": "t1"}))
            self.assertEqual(O.status(d)["status"], "STALLED")
        finally:
            other.kill(); other.wait()


class CredentialHandles(unittest.TestCase):  # a secret value never reaches the model, the trace or his ears
    def test_every_tool_result_is_masked_including_odd_shaped_secrets(self):
        d = Path(tempfile.mkdtemp()); task = O.Task(d / "t"); task.path.mkdir(parents=True)
        task.write("state.json", {"status": "RUNNING", "turn_at": 1}); task.write("request.json", {"goal": "check the key length"})
        odd = "q8Zx-not-a-known-format-7731"
        FAKE_OR = "sk-" + "or-v1-" + "abcdef0123456789" * 3  # built at runtime: no key-shaped literal in the public repo
        class Tl:
            def shell(self, a): return {"text": f"exit 0\nkey={odd}\nother={FAKE_OR}"}
        task.write("messages.json", [{"role": "user", "content": "check the key length"}])
        model = lambda m, t: {"ok": True, "calls": [{"tool": "shell", "args": {"command": "echo $WEIRD_SERVICE_TOKEN"}, "call_id": "c"}]}
        with mock.patch.dict(os.environ, {"WEIRD_SERVICE_TOKEN": odd}), mock.patch.object(O, "_authority") as au:
            au.return_value.authorize.return_value = ("allow", "")
            O.step_once(task, Tl(), model)
        blob = (task.path / "trace.jsonl").read_text() + (task.path / "messages.json").read_text()
        self.assertNotIn(odd, blob); self.assertNotIn(FAKE_OR, blob)
        self.assertIn("[REDACTED SECRET]", blob)


class PlainEnglish(unittest.TestCase):  # Evens 10-17: his card read "Used app_type to create and type into /private"
    def test_his_screenshot_line_becomes_words_and_a_file_name(self):
        got = O.plain("Sir. Used app_type to create and type into /private/tmp/claude-501/-Users-evenslouis/fab/jarvis-bg-test4.txt in the background.")
        self.assertEqual(got, "Sir. Used background typing to create and type into “jarvis-bg-test4.txt” in the background.")

    def test_paths_with_spaces_urls_and_quotes_survive(self):
        self.assertEqual(O.plain("Saved to /Users/someone/My Studio/Some Folder/x.html in the folder."), "Saved to “x.html” in the folder.")  # public-guard: allow (a made-up path; the test is that paths are removed)
        self.assertEqual(O.plain("see https://x.com/a_b?c_d=1 and `raw_name` and \"my_file\""), "see https://x.com/a_b?c_d=1 and `raw_name` and \"my_file\"")
        self.assertEqual(O.plain("The display reads 84."), "The display reads 84.")
        self.assertEqual(O.plain("press_on failed with AXPress"), "press on failed with a click")

    def test_speak_and_done_go_through_plain(self):
        d = Path(tempfile.mkdtemp()); task = O.Task(d / "t"); task.path.mkdir(parents=True)
        task.speak("Used app_type on /tmp/x/file.txt")
        self.assertEqual(task.rows("speech.jsonl")[0]["text"], "Used background typing on “file.txt”")


class JevNeedsExpensive(unittest.TestCase):  # live 10-17: Jev omitted model_tier; needs_expensive still says cheap
    def test_tier_is_derived_from_needs_expensive(self):
        class PF:
            def __init__(self, live): self.live = live
            def result(self, wait=True): return self.live
        class J:
            live = {"handler": "tool", "confidence": 1.0, "needs_expensive": 0.19, "model_tier": None}
            @classmethod
            def start(cls, g, live=True): return PF(cls.live)
        with mock.patch.object(O, "_load_brain", return_value=J):
            got = O._jev_tier("type a line")
        self.assertEqual(got["tier"], "cheap"); self.assertGreaterEqual(got["conf"], O.JEV_MIN_CONF)
        self.assertEqual(O.JEV_LAST["ne"], 0.19)

    def test_a_job_jev_rates_very_cheap_starts_cheap_even_if_it_says_mid(self):
        class PF:
            def __init__(self, live): self.live = live
            def result(self, wait=True): return self.live
        class J:
            live = {"handler": "tool", "confidence": 1.0, "needs_expensive": 0.14, "model_tier": "mid", "model_tier_conf": 0.66, "task_kind": "screen"}
            @classmethod
            def start(cls, g, live=True): return PF(cls.live)
        with mock.patch.object(O, "_load_brain", return_value=J):
            got = O._jev_tier("click 12 times 7 in Calculator")
        self.assertEqual(got["tier"], "cheap"); self.assertGreaterEqual(got["conf"], O.JEV_MIN_CONF)

    def test_a_failing_jev_call_is_recorded_not_hidden(self):
        with mock.patch.object(O, "_load_brain", side_effect=RuntimeError("no router")):
            self.assertIsNone(O._jev_tier("x"))
        self.assertIn("RuntimeError", O.JEV_LAST["error"])
        with mock.patch.object(O, "_owner_model", return_value="anthropic/claude-sonnet-5.5"), \
             mock.patch.object(O, "_load_brain", side_effect=RuntimeError("no router")):
            self.assertIn("RuntimeError", O.choose_model("x")["jev"]["error"])

    def test_screen_jobs_start_on_deepseek(self):
        self.assertEqual(O.POOLS["cheap"]["screen"][0], "deepseek/deepseek-v4-flash")


class CheapFirst(unittest.TestCase):  # Evens 10-17: $0.01 or less for simple jobs, even with his Sonnet pin
    def test_cheap_jobs_skip_the_pin_and_real_work_keeps_it(self):
        with mock.patch.object(O, "_owner_model", return_value="anthropic/claude-sonnet-5.5"), \
             mock.patch.object(O, "_jev_tier", return_value={"tier": "cheap", "conf": 0.9, "kind": "any"}):
            self.assertEqual(O.choose_model("type a line in a file")["tier"], "cheap")
        with mock.patch.object(O, "_owner_model", return_value="anthropic/claude-sonnet-5.5"), \
             mock.patch.object(O, "_jev_tier", return_value={"tier": "frontier", "conf": 0.9, "kind": "code"}):
            self.assertEqual(O.choose_model("refactor the operator")["model"], "anthropic/claude-sonnet-5.5")
        with mock.patch.object(O, "_owner_model", return_value="anthropic/claude-sonnet-5.5"), \
             mock.patch.object(O, "_jev_tier", return_value={"tier": "cheap", "conf": 0.3, "kind": "any"}):
            self.assertEqual(O.choose_model("hm")["tier"], "owner")          # unsure Jev: his pin stands


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
    def test_any_file_becomes_a_versioned_artifact(self):  # images, videos, podcasts, decks, 3D: same history and index
        f1 = self.home / "cover.png"; f1.write_bytes(b"\x89PNG v1"); f2 = self.home / "cover2.png"; f2.write_bytes(b"\x89PNG v2")
        with mock.patch.object(O, "ARTIFACTS", self.home / "ARTIFACTS"), mock.patch.object(O.subprocess, "run"):
            t = O.Tools(O.Task.create(self.hive, "cover").path)
            self.assertIn("published", t.artifact({"name": "Ebook Cover", "file": str(f1)})["text"])
            self.assertIn("updated", t.artifact({"name": "Ebook Cover", "file": str(f2)})["text"])
            self.assertIn("no such file", t.artifact({"name": "X", "file": str(self.home / "nope.mp4")})["text"])
            self.assertIn("needs content", t.artifact({"name": "Y"})["text"])
        page = self.home / "ARTIFACTS/Jarvis/ebook-cover/ebook-cover.png"
        self.assertEqual(page.read_bytes(), b"\x89PNG v2"); self.assertEqual(len(list((page.parent / "history").glob("*.png"))), 1)

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
