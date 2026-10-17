import importlib.util, os, tempfile, unittest
from pathlib import Path
from unittest import mock
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


class Round2(unittest.TestCase):
    def test_new_routes(self):
        self.assertEqual(a.args_from_utterance("list the n8n mcp tools"), {"op": "mcp_list", "server": "n8n"})
        got = a.args_from_utterance("in scratch repo demo: write a slugify function with tests")
        self.assertEqual(got["steps"][0]["op"], "code")

    def test_code_loop_without_model_is_honest(self):
        a.llm = lambda *x, **k: ("", "")
        a.rank_skills = lambda *x, **k: []
        os.environ["JARVIS_SCRATCH_ROOTS"] = tempfile.mkdtemp()
        got = a.op_code("r", "anything")
        self.assertFalse(got["ok"]); self.assertIn("NOT done", got["spoken"])


class ReadOnlyByName(unittest.TestCase):
    def test_gui_and_exec_tools_gated(self):
        # Evens 10-15: open by default runs GUI/exec MCP tools without a confirm; only an owner-revoked mode gates them.
        with mock.patch.object(a, "_open_access", return_value=False):
            for t in ("click", "drag", "js", "command_run", "execute", "batch", "browser_click", "add_slide"):
                self.assertTrue(a.op_mcp("x", t, {}).get("gated"), t)

    def test_lookups_pass_gate(self):
        for t in ("resolve-library-id", "convert_to_markdown", "query-docs", "list_items_in_registries", "get_item_examples_from_registries"):
            self.assertTrue(a.READ_TOOL.match(t) and not a.WRITE_TOOL.search(t), t)
