"""pipeline.py One-Mind hook: identical behavior with JARVIS_ONE_MIND off (same apply_pipeline path),
routing to the generic MissionController only when on and box workers are registered."""
import importlib.util
import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

HERE = Path(__file__).resolve().parent
os.environ.setdefault("AGENT_STACK_DRY_TTS", "1")
os.environ.setdefault("AGENT_STACK_CURSOR_DRY", "1")
spec = importlib.util.spec_from_file_location("agent_stack_pipeline_hook_test", HERE / "pipeline.py")
PIPE = importlib.util.module_from_spec(spec); sys.modules[spec.name] = PIPE; spec.loader.exec_module(PIPE)
ASK = "No I meant send a prompt saying hello to cursor"


def run(env_value, *, workers=None):
    tmp = tempfile.TemporaryDirectory(prefix="pipeline-om-")
    hive = Path(tmp.name); vault = hive / "vault"; (hive / "bus").mkdir(parents=True); vault.mkdir()
    calls = []

    def cursor_ask_fn(prompt, mode="ask", **kw):
        calls.append(str(prompt))
        return {"ok": True, "spoken": "Cursor heard hello.", "wire": "cursor_ask"}
    env = {"JARVIS_ONE_MIND": env_value}
    try:
        with mock.patch.dict(os.environ, env), mock.patch.object(PIPE, "speak_dispatch", side_effect=AssertionError):
            if workers is not None:
                PIPE.one_mind_route({"tool": "noop"}, "", hive, None)  # load hook module
                sys.modules["agent_stack_one_mind.pipeline_hook"].register_workers(workers)
            out = PIPE.apply_pipeline(ASK, hive=hive, retrieve_roots=[vault], cursor_ask_fn=cursor_ask_fn,
                                      talk_fn=lambda *a, **k: {"ok": True, "spoken": "should not talk"})
            missions = sorted(p.name for p in (hive / "one_mind" / "missions").glob("*")) \
                if (hive / "one_mind").exists() else []
    finally:
        tmp.cleanup()
        if "agent_stack_one_mind.pipeline_hook" in sys.modules:
            sys.modules["agent_stack_one_mind.pipeline_hook"].register_workers({})
    return out, calls, missions


def comparable(out):
    return {k: out.get(k) for k in ("ok", "tool", "spoken", "task_verified", "wires", "sent")}


class FlagOff(unittest.TestCase):
    def test_flag_off_hook_never_called_and_output_unchanged(self):
        with mock.patch.object(PIPE, "one_mind_route", side_effect=AssertionError("hook called")):
            out, calls, missions = run("")
        self.assertEqual(len(calls), 1)
        self.assertIn("hello", (out.get("spoken") or "").lower())
        self.assertEqual(missions, [])
        self.assertNotIn("one_mind", out.get("wires") or [])

    def test_flag_off_equals_flag_on_without_workers(self):
        off, off_calls, _ = run("")
        on, on_calls, missions = run("1")
        self.assertEqual(comparable(off), comparable(on))
        self.assertEqual(off_calls, on_calls)
        self.assertEqual(missions, [])


class FlagOn(unittest.TestCase):
    def workers(self):
        import agent_stack_one_mind.fakes as F  # same package instance the hook uses
        return F.coding_workers("ignored")

    def test_routes_coding_turn_to_generic_controller(self):
        with mock.patch.dict(os.environ, {"JARVIS_ONE_MIND": "1"}):
            PIPE.one_mind_route({"tool": "noop"}, "", Path(tempfile.gettempdir()), None)
        out, calls, missions = run("1", workers=self.workers())
        self.assertEqual(calls, [])  # legacy cursor_ask not used
        self.assertEqual(len(missions), 1)
        self.assertEqual(out.get("wires"), ["one_mind"])
        self.assertIn("Verified", out.get("spoken") or "")

    def test_hard_step_still_refused_with_flag_on(self):
        with mock.patch.dict(os.environ, {"JARVIS_ONE_MIND": "1"}), tempfile.TemporaryDirectory() as d:
            ran = PIPE.run_tool({"tool": "cursor_ask", "args": {}, "speak": ""}, "send the invoice to Bob",
                                hive=Path(d), retrieve_roots=[])
        self.assertEqual(ran["tool"], "refuse_hard_step")


if __name__ == "__main__":
    unittest.main()
