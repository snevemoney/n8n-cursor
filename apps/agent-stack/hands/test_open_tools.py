"""Open access widens CLI and MCP use; consequential actions stay gated."""
import importlib.util
import os
import tempfile
import unittest
from pathlib import Path
from unittest import mock

HERE = Path(__file__).parent


def _load(name, file):
    spec = importlib.util.spec_from_file_location(name, HERE / file)
    mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod); return mod


AT = _load("agent_stack_agent_tools_open_test", "agent_tools.py")
MC = _load("agent_stack_mcp_call_open_test", "mcp_call.py")


class OpenTools(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(); self.addCleanup(self.tmp.cleanup)
        env = mock.patch.dict(os.environ, {"JARVIS_MODE_FILE": str(Path(self.tmp.name) / "m.json"), "JARVIS_ACTION_LOG": "off"})
        env.start(); self.addCleanup(env.stop)
        self.perm = AT.PERM()

    def test_closed_cli_stays_read_only(self):
        self.assertIn("read-only CLI list", AT.op_cli(["echo", "hi"])["spoken"])

    def test_open_cli_runs_any_tool_but_not_hard_verbs(self):
        self.perm.set_open_access(True)
        got = AT.op_cli(["echo", "hi"])
        self.assertTrue(got["ok"], got); self.assertIn("hi", got["output"])
        for argv in (["rm", "-rf", "/tmp/x"], ["git", "push", "origin"], ["sudo", "ls"], ["curl", "-X", "POST", "https://x"]):
            self.assertTrue(AT.op_cli(argv).get("gated"), argv)

    def test_open_mcp_allows_writes_except_consequential(self):
        self.perm.set_open_access(True)
        with mock.patch.object(AT, "_load") as load, mock.patch.object(AT, "_mcp_call", return_value=(True, "done")) as call:
            load.return_value.server_spec.return_value = {"command": "x"}
            self.assertTrue(AT.op_mcp("vectorcraft", "doc_new", {})["ok"])
            self.assertTrue(AT.op_mcp("gmail", "send_email", {}).get("gated"))
            self.assertTrue(AT.op_mcp("files", "delete_file", {}).get("gated"))
            self.assertEqual(call.call_count, 1)

    def test_open_mcp_allowlist_is_every_configured_server(self):
        self.assertEqual(MC.allowlist(), {"codebase-memory-mcp"})
        self.perm.set_open_access(True)
        with mock.patch.object(MC._inventory(), "inventory", return_value=([{"name": "artcraft"}, {"name": "n8n"}], 0)):
            self.assertEqual(MC.allowlist(), {"codebase-memory-mcp", "artcraft", "n8n"})


if __name__ == "__main__":
    unittest.main()
