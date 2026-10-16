"""The operator is a hand the model chooses for real work (Evens 10-15 architecture). The turn starts a durable job,
waits briefly, and reports the verified result, a question, or that it keeps working."""
import importlib.util
import tempfile
import unittest
from pathlib import Path
from unittest import mock

spec = importlib.util.spec_from_file_location("op_turn_pipeline", Path(__file__).with_name("pipeline.py"))
P = importlib.util.module_from_spec(spec)
spec.loader.exec_module(P)


class OperatorTurn(unittest.TestCase):
    def test_model_can_choose_operator(self):
        self.assertIn("operator", P.HANDS)
        names = [t["function"]["name"] for t in P.ONLINE.OPENROUTER_HANDS] if P.ONLINE else ["operator"]
        self.assertIn("operator", names)

    def test_turn_runs_job_and_reports_verified_result(self):
        op = P._operator_hand()
        with tempfile.TemporaryDirectory() as t:
            hive, out = Path(t) / "hive", Path(t) / "hello.txt"
            replies = iter([
                {"ok": True, "tool": "write_file", "args": {"path": str(out), "content": "hi"}, "call_id": "a",
                 "calls": [{"tool": "write_file", "args": {"path": str(out), "content": "hi"}, "call_id": "a"}]},
                {"ok": True, "tool": "done", "args": {"summary": "Wrote hello.txt", "evidence": str(out)}, "call_id": "b",
                 "calls": [{"tool": "done", "args": {"summary": "Wrote hello.txt", "evidence": str(out)}, "call_id": "b"}]}])
            def start_inline(h, goal, turns=None):
                task = op.Task.create(h, goal, turns=turns)
                op.run(task.path, model_fn=lambda m, tools: next(replies))
                return {"task_id": task.path.name, "path": str(task.path)}
            with mock.patch.object(op, "start", side_effect=start_inline), mock.patch.object(Path, "home", return_value=Path(t)):
                got = P._run_tool_inner({"tool": "operator", "args": {"goal": "write hi to hello.txt"}},
                                        "write hi to hello.txt", hive=hive, retrieve_roots=[])
            self.assertTrue(got["task_verified"], got)
            self.assertIn("Wrote hello.txt", got["spoken"]); self.assertEqual(out.read_text(), "hi")

    def test_model_failure_line_does_not_invite_a_parrot(self):
        line = P._operator_line({"status": "MODEL_UNAVAILABLE"})
        self.assertIn("model call failed", line); self.assertNotIn("say continue", line)

    def test_pack_sends_work_requests_to_operator(self):
        import tempfile
        with tempfile.TemporaryDirectory() as t:
            hive = Path(t); (hive / "bus").mkdir()
            pack = P.assemble_pack("make a 3D animation", hive=hive, retrieve_roots=[], turns=[])
        self.assertIn("call the operator tool", pack); self.assertIn("never repeat an earlier reply", pack)


if __name__ == "__main__":
    unittest.main()
