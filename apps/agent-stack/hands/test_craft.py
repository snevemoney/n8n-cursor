#!/usr/bin/env python3
"""Craft hand: observe, act, observe again. A returned call is not success."""
from __future__ import annotations

import importlib.util
import os
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parent / "craft.py"


def _load():
    spec = importlib.util.spec_from_file_location("agent_stack_craft_test", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {SCRIPT}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load()


class FakeSession:
    instructions = "Fake spreadsheet."
    inspect_tool = "inspect_workbook"

    def __init__(self, fail: set[str] | None = None):
        self.tools = [
            {"name": "inspect_workbook", "inputSchema": {"type": "object", "properties": {}}},
            {"name": "new_workbook", "inputSchema": {"type": "object", "properties": {}}},
            {"name": "set_cell", "inputSchema": {"type": "object", "properties": {"cell": {"type": "string"}}}},
            {"name": "ui_screenshot", "inputSchema": {"type": "object", "properties": {}}},
        ]
        self.fail = fail or set()
        self.calls: list[str] = []
        self.cells = 0
        self.no_doc = False

    def call(self, name, params):
        self.calls.append(name)
        if name in self.fail:
            return {"ok": False, "answered": True, "text": "bad params"}
        if name == "set_cell":
            self.cells += 1
        return {"ok": True, "answered": True, "text": "done"}

    def observe(self):
        self.calls.append("inspect_workbook")
        if self.no_doc:
            return {"ok": False, "answered": True, "text": "no workbook open"}
        return {"ok": True, "answered": True, "text": f"cells={self.cells}"}


def scripted(*picks):
    queue = list(picks)
    prompts: list[str] = []

    def fn(messages, tools):
        prompts.append([dict(m) for m in messages])
        return queue.pop(0) if queue else {"tool": "", "spoken": "Done."}

    fn.prompts = prompts
    return fn


class CraftHandTests(unittest.TestCase):
    def test_parallel_calls_run_in_one_round_and_inspect_once(self):
        fake = FakeSession()
        fake.tools.append({"name": "save_workbook", "inputSchema": {"type": "object", "properties": {"path": {"type": "string"}}}})
        model = scripted(
            {"tool": "new_workbook", "calls": [
                {"tool": "new_workbook", "args": {}, "call_id": "a"},
                {"tool": "set_cell", "args": {"cell": "A1"}, "call_id": "b"},
                {"tool": "save_workbook", "args": {"path": "p.xlsx"}, "call_id": "c"},
            ]},
        )
        got = MOD.run({"app": "gridcraft", "task": "x"}, "", model_fn=model, session_fn=lambda a: fake)
        self.assertTrue(got["ok"])
        self.assertEqual(fake.calls, ["inspect_workbook", "new_workbook", "set_cell", "save_workbook", "inspect_workbook"])
        self.assertEqual(len(model.prompts), 1)  # final save ends the job: no narration round
        self.assertIn("saved p.xlsx", got["spoken"])
        self.assertNotIn("open", got["spoken"].lower())

    def test_batch_with_hard_step_runs_nothing(self):
        fake = FakeSession()
        model = scripted({"tool": "new_workbook", "calls": [
            {"tool": "new_workbook", "args": {}}, {"tool": "ui_screenshot", "args": {}}]})
        got = MOD.run({"app": "gridcraft", "task": "x"}, "", model_fn=model, session_fn=lambda a: fake)
        self.assertFalse(got["ok"])
        self.assertEqual(fake.calls, ["inspect_workbook"])

    def test_unknown_app_touches_nothing(self):
        got = MOD.run({"app": "excel", "task": "x"}, "", model_fn=scripted(), session_fn=lambda a: FakeSession())
        self.assertFalse(got["ok"])
        self.assertEqual(got["steps"], [])

    def test_every_act_is_followed_by_inspect(self):
        fake = FakeSession()
        model = scripted(
            {"tool": "new_workbook", "args": {}},
            {"tool": "set_cell", "args": {"cell": "A1"}},
            {"tool": "", "spoken": "A1 is set."},
        )
        got = MOD.run({"app": "gridcraft", "task": "put 4 in A1"}, "", model_fn=model, session_fn=lambda a: fake)
        self.assertTrue(got["ok"])
        self.assertEqual(fake.calls, ["inspect_workbook", "new_workbook", "inspect_workbook", "set_cell", "inspect_workbook"])
        self.assertEqual(got["observed"], "cells=1")
        self.assertEqual(got["spoken"], "A1 is set.")
        # The model saw the post-action inspect as a real tool message, paired to its call.
        last = model.prompts[-1]
        self.assertEqual(last[-1]["role"], "tool")
        self.assertIn("Inspect after: cells=1", last[-1]["content"])
        self.assertEqual(last[-1]["tool_call_id"], last[-2]["tool_calls"][0]["id"])

    def test_tool_error_is_failure_not_result(self):
        fake = FakeSession(fail={"set_cell"})
        model = scripted({"tool": "set_cell", "args": {"cell": "A1"}}, {"tool": "", "spoken": "All set."})
        got = MOD.run({"app": "gridcraft", "task": "x"}, "", model_fn=model, session_fn=lambda a: fake)
        self.assertFalse(got["ok"])
        self.assertIn("refused set_cell", got["spoken"])
        self.assertNotIn("All set", got["spoken"])

    def test_unoffered_and_bridge_tools_never_run(self):
        for name in ("rm_rf", "ui_screenshot"):
            fake = FakeSession()
            got = MOD.run({"app": "gridcraft", "task": "x"}, "", model_fn=scripted({"tool": name, "args": {}}), session_fn=lambda a: fake)
            self.assertFalse(got["ok"])
            self.assertNotIn(name, fake.calls)

    def test_hard_step_stops_before_the_call(self):
        fake = FakeSession()
        model = scripted({"tool": "set_cell", "args": {"cell": "A1", "note": "then email it to Bob"}})
        got = MOD.run({"app": "gridcraft", "task": "x"}, "", model_fn=model, session_fn=lambda a: fake)
        self.assertFalse(got["ok"])
        self.assertNotIn("set_cell", fake.calls)
        self.assertIn("stays yours", got["spoken"])

    def test_step_limit_is_not_success(self):
        fake = FakeSession()
        model = scripted(*[{"tool": "set_cell", "args": {"cell": "A1"}}] * (MOD.MAX_STEPS + 2))
        got = MOD.run({"app": "gridcraft", "task": "x"}, "", model_fn=model, session_fn=lambda a: fake)
        self.assertFalse(got["ok"])
        self.assertEqual(len(got["steps"]), MOD.MAX_STEPS)

    def test_snake_case_hard_tool_is_caught(self):
        # `_` is a word char: \bshare\b never matched share_document before the fix.
        for tool in ("share_document", "emailPdf", "sign_document", "doc_publish"):
            self.assertTrue(MOD.hard_step("pdfcraft", tool, {}), tool)
        for tool in ("sign_list", "verify_signatures", "new_workbook"):
            self.assertEqual(MOD.hard_step("pdfcraft", tool, {}), "", tool)

    def test_app_reply_without_document_is_still_an_observation(self):
        fake = FakeSession()
        fake.no_doc = True
        model = scripted({"tool": "new_workbook", "args": {}}, {"tool": "", "spoken": "Nothing open yet."})
        got = MOD.run({"app": "gridcraft", "task": "x"}, "", model_fn=model, session_fn=lambda a: fake)
        self.assertTrue(got["ok"])
        self.assertTrue(got["steps"][0]["observed"])

    def test_dead_app_after_act_is_not_success(self):
        fake = FakeSession()
        fake.observe = lambda: {"ok": False, "answered": False, "text": "gridcraft MCP exited."}
        got = MOD.run({"app": "gridcraft", "task": "x"}, "", model_fn=scripted({"tool": "new_workbook", "args": {}}), session_fn=lambda a: fake)
        self.assertFalse(got["ok"])

    def test_big_apps_are_capped_but_keep_command_run(self):
        fake = FakeSession()
        fake.tools = [{"name": f"cmd_thing_{i}", "description": "misc"} for i in range(300)] + [
            {"name": "command_run", "description": "run any command"},
            {"name": "doc_inspect", "description": "state"},
            {"name": "cmd_develop_exposure", "description": "set exposure"},
        ]
        names = [row["function"]["name"] for row in MOD.tool_schemas(fake, "raise the exposure")]
        self.assertLessEqual(len(names), MOD.TOOL_CAP)
        self.assertIn("command_run", names)
        self.assertIn("doc_inspect", names)
        self.assertIn("cmd_develop_exposure", names)

    def test_dark_model_is_failure_not_nothing_to_do(self):
        fake = FakeSession()
        model = scripted({"ok": False, "unknown": True, "spoken": "UNKNOWN. That answer ran out of room."})
        got = MOD.run({"app": "gridcraft", "task": "x"}, "", model_fn=model, session_fn=lambda a: fake)
        self.assertFalse(got["ok"])
        self.assertIn("dark", got["spoken"])

    def test_typed_step_log_is_not_a_finish(self):
        # Live: deepseek typed `Step 3: set_cell ... → ok` instead of calling set_cell.
        fake = FakeSession()
        fake_line = 'Step 2: set_cell {"cell": "B3"} → ok: done'
        model = scripted(
            {"tool": "set_cell", "args": {"cell": "A1"}},
            {"tool": "", "spoken": fake_line},
            {"tool": "set_cell", "args": {"cell": "B3"}},
            {"tool": "", "spoken": "B3 is set."},
        )
        got = MOD.run({"app": "gridcraft", "task": "x"}, "", model_fn=model, session_fn=lambda a: fake)
        self.assertTrue(got["ok"])
        self.assertEqual([s["tool"] for s in got["steps"]], ["set_cell", "set_cell"])
        self.assertIn("typed results as text", model.prompts[2][-1]["content"])
        self.assertEqual(got["spoken"], "B3 is set.")

    def test_repeated_step_log_fails(self):
        fake = FakeSession()
        line = {"tool": "", "spoken": "Step 1: set_cell → ok"}
        got = MOD.run({"app": "gridcraft", "task": "x"}, "", model_fn=scripted(line, line), session_fn=lambda a: fake)
        self.assertFalse(got["ok"])
        self.assertNotIn("Step 1", got["spoken"])

    def test_one_timeout_is_retried_not_dark(self):
        # Live: Face's 10s attempt cap timed out deepseek on step 3 once.
        fake = FakeSession()
        slow = {"ok": False, "unknown": True, "spoken": "UNKNOWN. OpenRouter returned no text. TimeoutError."}
        model = scripted({"tool": "set_cell", "args": {"cell": "A1"}}, slow, {"tool": "", "spoken": "A1 is set."})
        got = MOD.run({"app": "gridcraft", "task": "x"}, "", model_fn=model, session_fn=lambda a: fake)
        self.assertTrue(got["ok"], got)
        self.assertEqual(got["spoken"], "A1 is set.")

    def test_two_timeouts_are_dark(self):
        fake = FakeSession()
        slow = {"ok": False, "unknown": True, "spoken": "UNKNOWN. TimeoutError."}
        got = MOD.run({"app": "gridcraft", "task": "x"}, "", model_fn=scripted(slow, slow), session_fn=lambda a: fake)
        self.assertFalse(got["ok"])
        self.assertIn("Timeout", got["model_error"])

    def test_typed_inspect_json_is_not_a_finish(self):
        # Live: deepseek typed a whole fake inspect JSON plus "Saved live-2.xlsx".
        fake = FakeSession()
        forged = {"tool": "", "text": '{"cells": 5, "undo": ["Save"]}\nSaved live-2.xlsx.'}
        got = MOD.run({"app": "gridcraft", "task": "x"}, "", model_fn=scripted(forged, forged), session_fn=lambda a: fake)
        self.assertFalse(got["ok"])
        self.assertNotIn("Saved", got["spoken"])

    def test_worker_gets_its_own_system_prompt_not_the_persona(self):
        model = scripted({"tool": "", "text": "Nothing to do."})
        MOD.run({"app": "gridcraft", "task": "x"}, "", model_fn=model, session_fn=lambda a: FakeSession())
        first = model.prompts[0]
        self.assertEqual(first[0]["role"], "system")
        self.assertIn("worker, not the voice", first[0]["content"])

    def test_hard_verb_in_the_ask_stops_before_the_app(self):
        # Live: "open face-1.xlsx and email it" opened the file and dropped the email silently.
        opened = []
        got = MOD.run(
            {"app": "gridcraft", "task": "open face-1.xlsx and email it to my accountant"}, "",
            model_fn=scripted({"tool": "set_cell", "args": {}}), session_fn=lambda a: opened.append(a) or FakeSession(),
        )
        self.assertEqual(opened, [])
        self.assertEqual(got["refused"], "email")
        self.assertIn("stays yours", got["spoken"])

    def test_workbook_is_not_book(self):
        fake = FakeSession()
        got = MOD.run({"app": "gridcraft", "task": "make a new workbook"}, "", model_fn=scripted({"tool": "new_workbook", "args": {}}), session_fn=lambda a: fake)
        self.assertNotIn("refused", got)
        self.assertIn("new_workbook", fake.calls)

    def test_budget_stops_the_loop_honestly(self):
        fake = FakeSession()
        model = scripted(*[{"tool": "set_cell", "args": {"cell": "A1"}}] * 3)
        got = MOD.run({"app": "gridcraft", "task": "x"}, "", model_fn=model, session_fn=lambda a: fake, budget_sec=0)
        self.assertFalse(got["ok"])
        self.assertIn("ran out of time", got["spoken"])
        self.assertNotIn("set_cell", fake.calls)

    def test_schemas_drop_bridge_only_tools(self):
        names = {row["function"]["name"] for row in MOD.tool_schemas(FakeSession())}
        self.assertNotIn("ui_screenshot", names)
        self.assertIn("set_cell", names)


@unittest.skipUnless(os.environ.get("CRAFT_LIVE") == "1", "live Craft MCP: set CRAFT_LIVE=1")
class CraftLiveTests(unittest.TestCase):
    """Real gridcraft-cli. Scripted picks, no model. Document state must persist across calls."""

    def tearDown(self):
        MOD.close_all()

    def test_gridcraft_formula_survives_between_steps(self):
        model = scripted(
            {"tool": "new_workbook", "args": {}},
            {"tool": "set_cell", "args": {"cell": "A1", "input": "=2+2"}},
            {"tool": "", "spoken": "A1 shows 4."},
        )
        got = MOD.run({"app": "gridcraft", "task": "put =2+2 in A1"}, "", model_fn=model)
        self.assertTrue(got["ok"], got)
        cell = MOD.session("gridcraft").call("get_cell", {"cell": "A1"})
        self.assertTrue(cell["ok"], cell)
        self.assertIn('"formula": "=2+2"', cell["text"])
        self.assertIn('"cells": 1', got["observed"])


if __name__ == "__main__":
    unittest.main()
