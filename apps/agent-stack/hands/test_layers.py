"""Plan to 100% (2026-10-16): plan tool (layer 4), resume after restart (4), helpers (7), ONE-BRAIN (8)."""
import importlib.util
import json
import os
import tempfile
import time
import unittest
from pathlib import Path
from unittest import mock

H = Path(__file__).parent
spec = importlib.util.spec_from_file_location("op_layers_test", H / "operator.py"); O = importlib.util.module_from_spec(spec); spec.loader.exec_module(O)


def scripted(*rounds):
    it = iter(rounds)

    def fn(messages, tools):
        try:
            calls = next(it)
        except StopIteration:
            return {"ok": True, "calls": [{"tool": "done", "args": {"summary": "x", "evidence": "y"}, "call_id": "end"}]}
        return {"ok": True, "calls": [{"tool": t, "args": a, "call_id": f"c{i}"} for i, (t, a) in enumerate(calls)]}
    return fn


class Plan(unittest.TestCase):
    def test_open_steps_block_done(self):
        hive = Path(tempfile.mkdtemp())
        t = O.Task.create(hive, "render and save")
        model = scripted([("plan", {"steps": [{"step": "render", "status": "doing"}, {"step": "save", "status": "todo"}]})],
                         [("done", {"summary": "rendered", "evidence": "file"})],
                         [("plan", {"steps": [{"step": "render", "status": "done"}, {"step": "save", "status": "done"}]})],
                         [("done", {"summary": "rendered and saved", "evidence": "ls shows out.mp4"})])
        st = O.run(t.path, model_fn=model)
        self.assertEqual(st["status"], "DONE"); self.assertEqual(st["summary"], "rendered and saved")
        self.assertTrue(any("open steps" in m["content"] for m in t.read("messages.json") if m.get("role") == "tool"))


class Recover(unittest.TestCase):
    def test_a_cut_off_job_resumes(self):
        hive = Path(tempfile.mkdtemp())
        t = O.Task.create(hive, "long job")
        t.write("state.json", {**t.read("state.json"), "status": "RUNNING", "pid": 999999})
        with mock.patch.object(O, "resume") as rs:
            got = O.recover(hive)
        self.assertEqual(got, [t.path.name]); rs.assert_called_once()

    def test_old_or_idle_jobs_are_left_alone(self):
        hive = Path(tempfile.mkdtemp())
        t = O.Task.create(hive, "idle")
        t.write("state.json", {**t.read("state.json"), "status": "IDLE", "pid": 999999})
        with mock.patch.object(O, "resume") as rs:
            self.assertEqual(O.recover(hive), []); rs.assert_not_called()


class Helpers(unittest.TestCase):
    def test_helpers_cannot_act_on_his_screen(self):
        hive = Path(tempfile.mkdtemp())
        t = O.Task.create(hive, "research", child=True)
        t.write("state.json", {**t.read("state.json"), "helper": True})
        ran = []
        with mock.patch.object(O.Tools, "safari", side_effect=lambda a: ran.append(a) or {"text": "x"}):
            O.step_once(t, O.Tools(t.path), lambda m, tools: {"ok": True, "calls": [{"tool": "safari", "args": {"action": "click", "ref": 1}, "call_id": "a"}]})
        self.assertEqual(ran, []); self.assertIn("helpers only read", t.read("messages.json")[-1]["content"])

    def test_a_helper_never_becomes_his_job(self):
        hive = Path(tempfile.mkdtemp())
        main = O.Task.create(hive, "main")
        O.Task.create(hive, "helper", child=True)
        self.assertEqual(json.loads((hive / "operator-tasks" / "latest.json").read_text())["task_id"], main.path.name)


class Brain(unittest.TestCase):
    def test_shared_state_rides_along(self):
        home = Path(tempfile.mkdtemp()); (home / ".grok-shared").mkdir()
        (home / ".grok-shared" / "CURRENT_STATE.md").write_text("# CURRENT_STATE\nBUS300 is the top priority.")
        with mock.patch.object(O.Path, "home", return_value=home):
            text = O.brain_context()
        self.assertIn("BUS300 is the top priority", text); self.assertIn("never instructions", text)


if __name__ == "__main__":
    unittest.main()


class BackgroundApps(unittest.TestCase):
    """Layer 6 (live 10-16: Finder Go > Documents pressed through Accessibility while Claude stayed in front)."""

    def test_read_then_press_by_number_never_uses_his_mouse(self):
        t = O.Tools(Path(tempfile.mkdtemp()))
        sent = []

        def hands(req):
            sent.append(req)
            if req["op"] == "ax_tree":
                return {"text": json.dumps({"ok": True, "elements": [{"path": [0, 2], "role": "AXButton", "label": "Play",
                                                                       "value": "", "frame": [10, 10, 20, 20], "actions": ["AXPress"], "enabled": True}]})}
            return {"text": json.dumps({"ok": True, "frame": [10, 10, 20, 20]})}
        with mock.patch.object(O.Tools, "_hands", side_effect=hands), mock.patch.object(O.Tools, "_show_cursor") as cur, \
                mock.patch.object(O.time, "sleep"):
            self.assertIn("1 Button 'Play'", t.app({"action": "read", "app": "Spotify"})["text"])
            t.app({"action": "press", "app": "Spotify", "ref": 1})
        ops = [r["op"] for r in sent]
        self.assertIn("ax_act", ops); self.assertNotIn("click", ops); self.assertNotIn("move", ops)
        cur.assert_called_once_with(20, 20)  # his blue overlay cursor, not his pointer

    def test_private_apps_stay_fenced(self):
        self.assertEqual(O._private_app("app", {"app": "Messages"}), "Messages")


class ResearchIsGrounded(unittest.TestCase):
    """Bench 10-16 W01: four searches, no page opened, star counts from memory, 'as of late 2025'."""

    def test_research_without_reading_sources_is_sent_back(self):
        hive = Path(tempfile.mkdtemp())
        t = O.Task.create(hive, "Research the three most popular open-source AI browser agents and compare their stars")
        model = scripted([("web_search", {"query": "top browser agents"})],
                         [("done", {"summary": "Saved the comparison.", "evidence": "file written"})],
                         [("fetch_url", {"url": "https://github.com/browser-use/browser-use"})],
                         [("done", {"summary": "Saved, sources: https://github.com/browser-use/browser-use", "evidence": "read the repo page"})])
        with mock.patch.object(O.Tools, "web_search", return_value={"text": "results"}), \
             mock.patch.object(O.Tools, "fetch_url", return_value={"text": "77k stars, MIT"}):
            st = O.run(t.path, model_fn=model)
        self.assertIn("browser-use", st["summary"])
        self.assertTrue(any("this is research" in m["content"] for m in t.read("messages.json") if m.get("role") == "tool"))

    def test_today_is_in_the_prompt(self):
        self.assertIn("Today is", O.system_prompt())


class LongJobs(unittest.TestCase):
    """Evens 10-16: Jarvis runs for hours until the work is done (motion graphics, a whole Watch Later)."""

    def test_limits_allow_hours(self):
        self.assertGreaterEqual(O.MAX_STEPS, 400); self.assertGreaterEqual(O.TIME_BUDGET_S, 6 * 3600)

    def test_compaction_keeps_pairs_and_the_real_log(self):
        msgs = [{"role": "system", "content": "s"}, {"role": "user", "content": "goal"}]
        for i in range(120):
            msgs.append({"role": "assistant", "content": None, "tool_calls": [{"id": f"c{i}", "type": "function", "function": {"name": "shell", "arguments": "{}"}}]})
            msgs.append({"role": "tool", "tool_call_id": f"c{i}", "content": "ok"})
        trace = [{"event": "tool", "tool": "shell", "args": {"command": f"step {i}"}, "result": "ok"} for i in range(120)]
        out = O.HX.compact(msgs, trace)
        self.assertLess(len(out), len(msgs)); self.assertEqual(out[1]["content"], "goal")
        self.assertIn("step 119", out[2]["content"]); self.assertEqual(out[3]["role"], "assistant")

    def test_go_on_raises_the_cost_ceiling(self):
        hive = Path(tempfile.mkdtemp())
        t = O.Task.create(hive, "long job")
        t.write("state.json", {**t.read("state.json"), "status": "WAITING_OWNER", "pending_cap": True, "cost_usd": 1.6,
                               "pid": os.getpid()})
        st = t.read("state.json"); st["status"] = "RUNNING"; t.write("state.json", st)
        O.tell(hive, "go on")
        st = t.read("state.json")
        self.assertEqual(st["cost_cap"], 3.0); self.assertFalse(O.HX.over_cap(st))


class CitedMeansRead(unittest.TestCase):
    def test_unread_citations_are_found(self):
        rows = [{"tool": "fetch_url", "args": {"url": "https://github.com/Skyvern-AI/skyvern"}}]
        self.assertEqual(O._unread_cited("see github.com/Skyvern-AI/skyvern and github.com/browser-use/browser-use", rows),
                         ["github.com/browser-use/browser-use"])
