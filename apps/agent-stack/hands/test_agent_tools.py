import importlib.util, os, tempfile, unittest
from pathlib import Path
spec = importlib.util.spec_from_file_location("agent_tools_t", Path(__file__).with_name("agent_tools.py"))
a = importlib.util.module_from_spec(spec); spec.loader.exec_module(a)


class AgentToolsGates(unittest.TestCase):
    def test_cli_gates_writes(self):
        for u in ("gh pr merge 644", "git push origin main", "gh api -X POST repos/x/y/issues"):
            got = a.run(a.args_from_utterance(u))
            self.assertFalse(got["ok"]); self.assertEqual(got["steps"][0]["status"], "needs Evens")

    def test_mcp_write_tool_gated_without_starting(self):
        got = a.op_mcp("anything", "send_message", {})
        self.assertTrue(got.get("gated"))

    def test_repo_outside_scratch_gated(self):
        os.environ["JARVIS_MODE_FILE"] = os.path.join(tempfile.mkdtemp(), "m.json")
        self.assertTrue(a.op_repo("/etc", "write", path="x", content="").get("gated"))

    def test_routing(self):
        self.assertEqual(a.args_from_utterance("call the context7 mcp tool resolve-library-id")["tool"], "resolve-library-id")
        self.assertTrue(a.wants("gh pr view 1"))
        self.assertFalse(a.wants("what's the weather"))


if __name__ == "__main__":
    unittest.main()
