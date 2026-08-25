#!/usr/bin/env python3
"""Tests for scripts/hive/os/one-brain.py — isolated temp OS, no vault writes."""
from __future__ import annotations

import importlib.util
import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
SCRIPT = HERE / "one-brain.py"


def load_mod():
    spec = importlib.util.spec_from_file_location("one_brain", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {SCRIPT}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = load_mod()


class OneBrainTest(unittest.TestCase):
    def setUp(self) -> None:
        self.td = tempfile.TemporaryDirectory()
        self.root = Path(self.td.name) / "os"
        self.chats = Path(self.td.name) / "projects"
        self.root.mkdir(parents=True)
        os.environ["ONE_BRAIN_OS"] = str(self.root)

    def tearDown(self) -> None:
        os.environ.pop("ONE_BRAIN_OS", None)
        self.td.cleanup()

    def test_wake_empty_card(self) -> None:
        card = MOD.collect_wake(self.root, chats_root=self.chats)
        text = MOD.format_card(card, 1800)
        self.assertIn("ONE BRAIN", text)
        self.assertIn("HOT: (empty", text)
        self.assertNotIn(".jsonl", text)

    def test_close_updates_hot_and_latest(self) -> None:
        MOD.emit_builtin(
            self.root,
            {
                "kind": "activity",
                "skill": "said",
                "desk": "forge",
                "host": "cursor",
                "title": "one brain wired",
                "items": ["session start reads hot.md"],
            },
        )
        card = MOD.collect_wake(self.root, chats_root=self.chats)
        self.assertTrue(card["hot"])
        self.assertTrue(str(card["last_emit"]).startswith("inbox/"))
        self.assertTrue((self.root / "hot.md").is_file())
        self.assertIn("one brain wired", MOD.format_card(card, 1800))

    def test_receipt_without_handoff_is_gap(self) -> None:
        MOD.append_receipt(
            self.root,
            {"kind": "receipt", "session_id": "abc", "emitted": False, "at": MOD.now_iso()},
        )
        card = MOD.collect_wake(self.root, chats_root=self.chats, include_chats=False)
        self.assertIn("closed without handoff", card["previous_gap"])

    def test_chat_list_is_titles_not_bodies(self) -> None:
        sess = self.chats / "demo" / "agent-transcripts" / "sid-1"
        sess.mkdir(parents=True)
        (sess / "sid-1.jsonl").write_text(
            json.dumps(
                {
                    "role": "user",
                    "message": {
                        "content": [{"type": "text", "text": "<user_query>keep this title</user_query>"}]
                    },
                }
            )
            + "\nFULL TRANSCRIPT BODY MUST NOT LEAK\n",
            encoding="utf-8",
        )
        text = MOD.format_card(MOD.collect_wake(self.root, chats_root=self.chats), 1800)
        self.assertIn("keep this title", text)
        self.assertNotIn("FULL TRANSCRIPT BODY", text)

    def test_wake_hook_json(self) -> None:
        proc = subprocess.run(
            [sys.executable, str(SCRIPT), "wake", "--hook", "--no-chats", "--os-root", str(self.root)],
            input=json.dumps({"session_id": "sess-1", "is_background_agent": False}),
            text=True,
            capture_output=True,
            check=False,
        )
        self.assertEqual(proc.returncode, 0, proc.stderr)
        payload = json.loads(proc.stdout)
        self.assertIn("additional_context", payload)
        self.assertEqual(payload.get("env", {}).get("HIVE_ONE_BRAIN_SESSION"), "sess-1")
        self.assertIn("ONE BRAIN", payload["additional_context"])

    def test_close_hook_receipt_only(self) -> None:
        proc = subprocess.run(
            [sys.executable, str(SCRIPT), "close", "--hook", "--os-root", str(self.root)],
            input=json.dumps({"session_id": "sess-2", "reason": "completed"}),
            text=True,
            capture_output=True,
            check=False,
        )
        self.assertEqual(proc.returncode, 0, proc.stderr)
        payload = json.loads(proc.stdout)
        self.assertFalse(payload["emitted"])
        recs = MOD.last_receipts(self.root, 1)
        self.assertEqual(recs[0]["session_id"], "sess-2")
        self.assertFalse(recs[0]["emitted"])

    def test_trigger_check_cli(self) -> None:
        proc = subprocess.run(
            [sys.executable, str(SCRIPT), "trigger-check"],
            text=True,
            capture_output=True,
            check=False,
        )
        self.assertEqual(proc.returncode, 0, proc.stderr)
        payload = json.loads(proc.stdout)
        self.assertEqual(payload["trigger_check"], "pass")


if __name__ == "__main__":
    unittest.main()
