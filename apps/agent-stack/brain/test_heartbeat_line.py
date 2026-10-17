"""Evens 10-16: a slow step says what Jarvis is waiting for ("Waiting for YouTube to load"), not a joke line."""
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

STACK = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("hb_turn", STACK / "mouth" / "turn.py")
M = importlib.util.module_from_spec(spec); spec.loader.exec_module(M)
P = M.PIPELINE
O = P._operator_hand()


class Heartbeat(unittest.TestCase):
    def job(self, tool, args):
        hive = Path(tempfile.mkdtemp())
        t = O.Task.create(hive, "x") if hasattr(O, "Task") else None
        t.trace({"event": "tool", "tool": tool, "args": args, "result": "ok"})
        st = t.read("state.json"); st["status"] = "RUNNING"; t.write("state.json", st)
        return hive

    def test_says_what_it_waits_for(self):
        self.assertEqual(P.heartbeat_line("operator", self.job("safari", {"action": "navigate", "url": "https://www.youtube.com/x"})),
                         "Waiting for youtube.com to load, sir.")
        self.assertEqual(P.heartbeat_line("operator", self.job("shell", {"command": "yt-dlp https://x"})),
                         "Waiting for the video to download, sir.")
        self.assertEqual(P.heartbeat_line("web_search", None, {"args": {"query": "playwright mcp stars"}}),
                         "Still searching for playwright mcp stars, sir.")

    def test_no_joke_lines(self):
        for line in (P.TOOL_HEARTBEAT, P.heartbeat_line("unknown"), M.HEARTBEAT):
            self.assertNotIn("fashionably", line); self.assertNotIn("wires", line)


if __name__ == "__main__":
    unittest.main()
