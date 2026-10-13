"""ArtCraft read-only inspect through agent_tools. The MCP session is stubbed (no server starts) unless JARVIS_TEST_CRAFT_LIVE=1."""
import importlib.util, json, os, tempfile, types, unittest
from pathlib import Path

HERE = Path(__file__).parent
spec = importlib.util.spec_from_file_location("agent_tools_craft_t", HERE / "agent_tools.py")
a = importlib.util.module_from_spec(spec)
spec.loader.exec_module(a)


def text(obj):
    return (True, json.dumps(obj))


class Session:
    """Stub for agent_tools._mcp_session: records the (tool, args) sequence, answers from a script."""

    def __init__(self, *replies):
        self.replies, self.seen = list(replies), []

    def __call__(self, spec_, calls, deadline):
        self.seen.extend(calls)
        out = []
        for i, _ in enumerate(calls):
            out.append(self.replies[min(i, len(self.replies) - 1)])
            if not out[-1][0]:  # like the real session: a failure ends the run
                break
        return out


class CraftInspect(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp()).resolve()
        os.environ["JARVIS_READ_ROOTS"] = str(self.tmp)
        os.environ["JARVIS_ACTION_LOG"] = "off"
        self.pdf = self.tmp / "hello.pdf"
        self.pdf.write_bytes(b"%PDF-1.4\n")
        self.csv = self.tmp / "parts.csv"
        self.csv.write_text("a,b\n1,2\n")
        inv = a._load("mcp_inventory", "mcp_inventory.py")
        self._spec = inv.server_spec
        inv.server_spec = lambda name, paths=None: {"command": "x", "args": [], "env": {}}

    def tearDown(self):
        a._load("mcp_inventory", "mcp_inventory.py").server_spec = self._spec
        os.environ.pop("JARVIS_READ_ROOTS", None)

    def test_open_then_inspect_only_and_no_save(self):
        s = Session(text({"doc": 1, "name": "hello.pdf", "pages": 1}), text({"documents": [{"document": {"pages": 1, "name": "hello.pdf"}}]}))
        a._mcp_session = s
        got = a.op_craft_inspect("pdfcraft", str(self.pdf))
        self.assertTrue(got["ok"] and got["verified"], got)
        self.assertEqual([c[0] for c in s.seen], ["doc_open", "doc_inspect"])
        self.assertEqual(s.seen[0][1], {"path": str(self.pdf)})
        self.assertIn("hello.pdf", got["spoken"])
        self.assertIn("pages", got["spoken"])
        self.assertNotIn("{", got["spoken"])

    def test_every_tool_in_the_table_is_a_lookup_or_the_one_open(self):
        for app, (open_tool, inspect_tool, _ext) in a.CRAFT_INSPECT.items():
            self.assertTrue(a.READ_TOOL.match(inspect_tool) and not a.WRITE_TOOL.search(inspect_tool), (app, inspect_tool))
            self.assertRegex(open_tool, r"^(?:doc_)?open(?:_\w+)?$", app)
            self.assertFalse(a.WRITE_TOOL.search(open_tool), (app, open_tool))

    def test_apps_without_a_path_open_are_said_plainly(self):
        a._mcp_session = Session(text({}))
        for app in ("filmcraft", "lightcraft", "nonsense"):
            got = a.op_craft_inspect(app, str(self.pdf))
            self.assertFalse(got["ok"], app)
            self.assertIn("can't", got["spoken"])

    def test_wrong_extension_refused_before_any_server_starts(self):
        s = Session(text({}))
        a._mcp_session = s
        got = a.op_craft_inspect("pdfcraft", str(self.csv))
        self.assertFalse(got["ok"])
        self.assertEqual(s.seen, [])

    def test_outside_roots_secret_and_missing_paths_refused(self):
        s = Session(text({}))
        a._mcp_session = s
        other = Path(tempfile.mkdtemp()).resolve() / "x.pdf"
        other.write_bytes(b"%PDF")
        sec = self.tmp / ".env.pdf"
        sec.write_bytes(b"%PDF")
        for p in (str(other), str(sec), str(self.tmp / "nope.pdf"), "/etc/passwd", ""):
            got = a.op_craft_inspect("pdfcraft", p)
            self.assertFalse(got["ok"], p)
        self.assertEqual(s.seen, [])

    def test_symlink_out_of_the_roots_refused(self):
        outside = Path(tempfile.mkdtemp()).resolve() / "real.pdf"
        outside.write_bytes(b"%PDF")
        link = self.tmp / "link.pdf"
        link.symlink_to(outside)
        a._mcp_session = Session(text({}))
        self.assertFalse(a.op_craft_inspect("pdfcraft", str(link))["ok"])

    def test_server_failure_is_a_sentence(self):
        a._mcp_session = Session((False, "could not start server (FileNotFoundError)"))
        got = a.op_craft_inspect("pdfcraft", str(self.pdf))
        self.assertFalse(got["ok"])
        self.assertIn("pdfcraft", got["spoken"])

    def test_open_error_stops_before_inspect_claims_anything(self):
        a._mcp_session = Session((False, "tool error: encrypted"), text({"pages": 9}))
        got = a.op_craft_inspect("pdfcraft", str(self.pdf))
        self.assertFalse(got["ok"])
        self.assertNotIn("9", got["spoken"])

    def test_unreadable_inspect_text_is_not_read_out(self):
        a._mcp_session = Session(text({"doc": 1}), (True, "Binary garbage \x00\x01 sk-ABCDEFGHIJKLMNOPQRSTUVWXYZ0123"))
        got = a.op_craft_inspect("pdfcraft", str(self.pdf))
        self.assertNotIn("sk-ABC", got["spoken"])

    def test_summary_names_counts_not_dumps(self):
        sm = a.craft_summary("gridcraft", json.dumps({"title": "parts.csv", "sheets": [{"name": "parts", "cells": 6}, {"name": "b"}],
                                                       "path": "/x/y/parts.csv", "dirty": False, "names": []}))
        self.assertIn("parts.csv", sm)
        self.assertIn("2 sheets", sm)
        self.assertLess(len(sm), 400)

    def test_task_step_and_single_sentence_through_run(self):
        a._mcp_session = Session(text({"doc": 1, "name": "hello.pdf", "pages": 1}), text({"documents": [{"document": {"pages": 1}}]}))
        got = a.run({"op": "craft_inspect", "app": "pdfcraft", "path": str(self.pdf)})
        self.assertTrue(got["ok"])
        self.assertNotIn("steps verified", got["spoken"])

    def test_old_read_gate_unchanged_for_other_craft_tools(self):
        for t in ("execute", "command_run", "batch", "save_document", "doc_save", "render_preview", "type_text", "doc_open"):
            self.assertTrue(a.op_mcp("pdfcraft", t, {}).get("gated"), t)
        for t in ("doc_inspect", "list_commands", "inspect_document", "read_range", "doc_info", "command_list"):
            self.assertTrue(a.READ_TOOL.match(t) and not a.WRITE_TOOL.search(t), t)


@unittest.skipUnless(os.environ.get("JARVIS_TEST_CRAFT_LIVE") == "1", "set JARVIS_TEST_CRAFT_LIVE=1 to start the local gridcraft MCP (headless, no network)")
class LiveLocal(unittest.TestCase):
    def test_gridcraft_csv(self):
        d = Path(tempfile.mkdtemp()).resolve()
        (d / "parts.csv").write_text("name,qty\nbolt,3\nnut,5\n")
        os.environ["JARVIS_READ_ROOTS"] = str(d)
        sp = importlib.util.spec_from_file_location("at_live", HERE / "agent_tools.py")
        mod = importlib.util.module_from_spec(sp)
        sp.loader.exec_module(mod)
        got = mod.op_craft_inspect("gridcraft", str(d / "parts.csv"))
        self.assertTrue(got["ok"], got)
        self.assertIn("parts", got["spoken"])


if __name__ == "__main__":
    unittest.main()
