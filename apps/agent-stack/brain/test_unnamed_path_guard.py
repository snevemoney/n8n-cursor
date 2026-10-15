"""The unnamed-path guard must not hide earlier successful work or report itself as a success.

Live, Oct 14 17:15 ET: yt-dlp ran fine (step 1), then the model picked a read of a path the owner never
named (step 2). The guard answered ok:True "You didn't name a file" and the yt-dlp result was lost.
"""
import importlib.util
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("unnamed_guard_pipeline", Path(__file__).with_name("pipeline.py"))
P = importlib.util.module_from_spec(spec)
spec.loader.exec_module(P)


def drain(gen):
    events = []
    while True:
        try:
            events.append(next(gen))
        except StopIteration as end:
            return end.value, events


def pick(hand, **args):
    return {"tool": hand, "args": args, "speak": ""}


class UnnamedPathGuardTests(unittest.TestCase):
    def test_guard_is_an_honest_skip_not_a_success(self):
        with tempfile.TemporaryDirectory() as tmp:
            hive = Path(tmp)
            gen = P.begin_turn(hive)
            got = P._run_tool_inner(pick("workspace_read", op="read", path="notes/output.txt"),
                                    "Run yt-dlp --print description https://www.youtube.com/watch?v=K_cha25S4Qo",
                                    hive=hive, retrieve_roots=[], gen=gen)
        self.assertIs(got["ok"], False)
        self.assertTrue(got.get("unnamed_path"))
        self.assertEqual(got["tool"], "say")  # an ask, not a read; unnamed_path carries the skip
        self.assertFalse(got["task_verified"])
        self.assertIn("didn't name", got["spoken"])

    def test_earlier_successful_step_survives_an_unnamed_read(self):
        first = pick("agent_tools", op="cli", argv=["yt-dlp", "--print", "description"])
        ran = {"tool": "agent_tools", "ok": True, "wires": ["agent_tools"], "cites": [],
               "spoken": "yt-dlp printed the description: open-source Jarvis, code at github.com/FatihMakes/Mark-LII."}
        guard = {"tool": "workspace_read", "ok": False, "unnamed_path": True, "task_verified": False,
                 "workspace_error": "unnamed path", "wires": ["files"], "cites": [],
                 "spoken": "You didn't name a file, so I didn't open one. Which file do you mean?"}
        decisions = iter([pick("workspace_read", op="read", path="notes/output.txt")])

        def talk(prompt, context, **kw):
            return next(decisions)

        def run(p, utterance, **kw):
            if False:
                yield None
            return guard

        with tempfile.TemporaryDirectory() as tmp, \
                patch.object(P, "online_talk", side_effect=talk), \
                patch.object(P, "_run_tool_heartbeat", side_effect=run), \
                patch.object(P, "turn_cancelled", return_value=False), \
                patch.object(P, "_vision_urls", return_value=[]):
            out, _ = drain(P._continue_hand_loop(first, ran, "Run yt-dlp on the saved video", hive=Path(tmp),
                                                 token=3, brain="openrouter", brief="context"))
        self.assertIn("FatihMakes/Mark-LII", out["spoken"])
        self.assertIn("didn't open", out["spoken"])
        self.assertEqual(out["hand_loop_meta"]["stop_reason"], "unnamed_read_skipped")
        self.assertEqual([s["ok"] for s in out["hand_loop_meta"]["steps"]], [True, False])
        self.assertFalse(out["task_verified"])


if __name__ == "__main__":
    unittest.main()
