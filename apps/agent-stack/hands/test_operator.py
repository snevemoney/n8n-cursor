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


if __name__ == "__main__":
    unittest.main()
