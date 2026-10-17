"""Per-turn JSONL log: one line per turn, model/latency/injected/tools, opt-out."""
import importlib.util
import json
import os
import tempfile
import time
import unittest
from pathlib import Path
from unittest import mock

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("test_turn_log_mod", HERE / "turn_log.py")
TL = importlib.util.module_from_spec(spec)
spec.loader.exec_module(TL)


class ReleaseRev(unittest.TestCase):  # audit 10-16: rev was null because live Jarvis runs from a git worktree
    def test_rev_resolves_inside_a_worktree(self):
        import subprocess
        d = Path(tempfile.mkdtemp())
        g = lambda *a, cwd: subprocess.run(["git", *a], cwd=cwd, check=True, capture_output=True)
        g("init", "-q", "main", cwd=d); m = d / "main"
        for k, v in (("user.email", "t@t"), ("user.name", "t")): g("config", k, v, cwd=m)
        (m / "a").write_text("a"); g("add", "a", cwd=m); g("commit", "-q", "-m", "one", cwd=m)
        g("worktree", "add", "-q", str(d / "wt"), "-b", "side", cwd=m)
        sha = subprocess.run(["git", "rev-parse", "HEAD"], cwd=d / "wt", capture_output=True, text=True).stdout.strip()
        with mock.patch.object(TL, "ROOT", d / "wt"), mock.patch.object(TL, "_REV", []):
            self.assertEqual(TL.release_rev(), sha[:12])


class TurnLogTest(unittest.TestCase):
    def test_row_fields(self):
        t0 = time.time()
        talk = {"t": t0 + 0.1, "model": "deepseek/deepseek-chat-v3.1", "primary": "nex/x:free", "fallback": True,
                "latency_ms": 900, "est_tokens_in": 1200, "est_tokens_out": 30, "injected": ["JARVIS_CONTEXT.md"]}
        events = [{"verb": "think", "ok": True}, {"verb": "vault_read", "ok": True}, {"verb": "converse", "ok": True, "gen": 4}]
        row = TL.build_row(started=t0, ended=t0 + 1.25, events=events, talk=talk, inject={})
        self.assertEqual(row["model"], "deepseek/deepseek-chat-v3.1")
        self.assertTrue(row["fallback"])
        self.assertEqual(row["latency_ms"], 1250)
        self.assertEqual(row["injected_context"], ["JARVIS_CONTEXT.md"])
        self.assertEqual(row["tools"], ["vault_read", "converse"])
        self.assertTrue(row["ts"].endswith("Z"))

    def test_row_carries_no_transcript_text(self):
        t0 = time.time()
        secret_ask, secret_reply = "my bank pin is 4417 zebra", "Sir. Your pin 4417 zebra is noted."
        events = [{"verb": "converse", "ok": True, "spoken": secret_reply, "utterance": secret_ask,
                   "spoken_delta": secret_reply, "cites": [{"snippet": secret_reply}], "args": {"q": secret_ask},
                   "execution_summary": {"executor": "converse", "task_verified": False, "spoken": secret_reply}}]
        talk = {"t": t0 + 0.1, "model": "m/x", "prompt": secret_ask, "spoken": secret_reply}
        line = json.dumps(TL.build_row(started=t0, ended=t0 + 1, events=events, talk=talk, inject={}))
        self.assertNotIn("4417", line)
        self.assertNotIn("zebra", line)
        allowed = {"ts", "model", "primary_model", "fallback", "latency_ms", "talk_latency_ms", "est_tokens_in",
                   "est_tokens_out", "injected_context", "retrieved", "tools", "verb", "ok", "outcome", "gen",
                   "finish_reason", "resume",  # both metadata only: a finish code and resume counts
                   "tool_ms", "first_chunk_ms", "roadblock", "cost_bucket",  # timings and codes, never text
                   "usage_tokens_in", "usage_tokens_out", "usage_cost_usd", "usage_gen_id",  # metered numbers + provider id
                   "task_verified", "awaiting_approval", "execution_summary",  # booleans + executor/outcome codes
                   # Mac review 2026-10-16: fixed codes, booleans and build identity only
                   "hands", "stop_reason", "error_class", "boot_id", "rev"}
        self.assertEqual(set(json.loads(line)), allowed)

    def test_stale_talk_record_is_not_this_turn(self):
        t0 = time.time()
        row = TL.build_row(started=t0, ended=t0 + 0.01, events=[{"verb": "stop"}], talk={"t": t0 - 5, "model": "old"}, inject={})
        self.assertIsNone(row["model"])

    def test_append_jsonl_and_opt_out(self):
        with tempfile.TemporaryDirectory() as tmp:
            dest = Path(tmp) / "sub" / "turns.jsonl"
            with mock.patch.dict(os.environ, {"JARVIS_TURN_LOG": str(dest)}):
                TL.append({"a": 1})
                TL.append({"a": 2})
            lines = dest.read_text().splitlines()
            self.assertEqual([json.loads(x)["a"] for x in lines], [1, 2])
            with mock.patch.dict(os.environ, {"JARVIS_TURN_LOG": "0"}):
                self.assertIsNone(TL.log_path())
                self.assertIsNone(TL.append({"a": 3}))

    def test_mouth_writes_one_line_per_turn(self):
        os.environ.setdefault("AGENT_STACK_DRY_TTS", "1")
        spec = importlib.util.spec_from_file_location("test_turn_log_mouth", HERE.parent / "mouth" / "turn.py")
        mouth = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mouth)
        with tempfile.TemporaryDirectory() as tmp:
            dest = Path(tmp) / "turns.jsonl"
            hive = Path(tmp) / "hive"
            (hive / "bus").mkdir(parents=True)
            (hive / "bus" / "state.json").write_text("{}")
            with mock.patch.dict(os.environ, {"JARVIS_TURN_LOG": str(dest)}):
                mouth.apply_turn("stop", hive=hive)
                mouth.apply_turn("", hive=hive)
            rows = [json.loads(x) for x in dest.read_text().splitlines()]
            self.assertEqual(len(rows), 2)
            self.assertEqual(rows[0]["tools"], ["stop"])
            for key in ("ts", "model", "latency_ms", "injected_context", "tools"):
                self.assertIn(key, rows[0])


if __name__ == "__main__":
    unittest.main()


class PastedKeyIsMasked(unittest.TestCase):  # sig_z99
    def test_a_key_he_says_never_lands_in_the_log(self):
        import importlib.util, json, tempfile
        spec = importlib.util.spec_from_file_location("turn_log_mask_t", Path(__file__).with_name("turn_log.py"))
        T = importlib.util.module_from_spec(spec); spec.loader.exec_module(T)
        d = Path(tempfile.mkdtemp()) / "t.jsonl"; key = "sk-or-v1-" + "e" * 48
        T.append({"utterance": f"use {key}", "reply": "ok"}, d)
        self.assertNotIn(key, d.read_text()); self.assertEqual(json.loads(d.read_text())["reply"], "ok")
