import importlib.util
import os
import unittest
from pathlib import Path
from unittest import mock

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("rea_tool", HERE / "rea_tool.py")
RT = importlib.util.module_from_spec(spec)
spec.loader.exec_module(RT)


class ReaToolTest(unittest.TestCase):
    def test_off_by_default(self):
        with mock.patch.dict(os.environ, {}, clear=False):
            os.environ.pop(RT.FLAG, None)
            base = {"n8n-mcp": {"command": "x"}}
            self.assertIs(RT.mcp_servers(base), base)
            self.assertFalse(RT.tool_allowed("open_binary"))

    def test_on_adds_pinned_entry_without_mutating(self):
        with mock.patch.dict(os.environ, {RT.FLAG: "1"}):
            base = {"n8n-mcp": {"command": "x"}}
            out = RT.mcp_servers(base)
            self.assertEqual(out["rea"], {"command": "npx", "args": ["-y", "rea-agents@6.3.0", "--mcp"]})
            self.assertNotIn("rea", base)

    def test_existing_entry_kept(self):
        with mock.patch.dict(os.environ, {RT.FLAG: "1"}):
            base = {"rea": {"command": "custom"}}
            self.assertEqual(RT.mcp_servers(base)["rea"]["command"], "custom")

    def test_only_read_only_tools(self):
        with mock.patch.dict(os.environ, {RT.FLAG: "1"}):
            self.assertTrue(RT.tool_allowed("rea__open_binary"))
            self.assertFalse(RT.tool_allowed("set_comment"))
            self.assertFalse(RT.tool_allowed("capture_browser_scenario"))

    def test_flag_must_be_exactly_1(self):
        with mock.patch.dict(os.environ, {RT.FLAG: "true"}):
            self.assertFalse(RT.enabled())


if __name__ == "__main__":
    unittest.main()
