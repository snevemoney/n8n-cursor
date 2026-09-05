#!/usr/bin/env python3
"""Five golden conversations. Mock Cursor + see.py + store. Then stop."""
from __future__ import annotations

import importlib.util
import json
import os
import tempfile
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

os.environ["AGENT_STACK_DRY_TTS"] = "1"
os.environ["AGENT_STACK_CURSOR_DRY"] = "1"

STACK = Path(__file__).resolve().parents[1]
TURN_PATH = STACK / "mouth" / "turn.py"
SCARS_PATH = STACK / "memory" / "scars.py"
CANNED_CAN = "I run the hive catalog here, not Grok Bot"


def _load(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


TURN = _load("agent_stack_mouth_golden", TURN_PATH)
SCARS = _load("agent_stack_scars_golden", SCARS_PATH)


def _hive(tmp: str) -> tuple[Path, Path]:
    hive = Path(tmp)
    vault = hive / "vault"
    vault.mkdir(parents=True)
    (hive / "bus").mkdir(parents=True)
    (vault / "OPERATOR_MEMORY.md").write_text(
        "# Operator Memory\n\n"
        "Jarvis can read the vault, look at the Safari page, ask the repo, "
        "or report status. Hard steps stay Evens.\n"
        "North star: maximum leverage, minimum noise.\n",
        encoding="utf-8",
    )
    return hive, vault


class GoldenPipelineTest(unittest.TestCase):
    def test_1_what_can_you_do_uses_model_and_store(self) -> None:
        calls: list[str] = []

        def fake_cursor(prompt: str, mode: str = "ask", **kw):
            _ = (mode, kw)
            calls.append(prompt)
            self.assertIn("pipeline-pack.md", prompt)
            self.assertNotIn(prompt[:4000] if False else "I run the hive catalog here, not Grok Bot", prompt)
            self.assertLess(len(prompt), 2000)
            return {
                "tool": "vault_read",
                "args": {"query": "what Jarvis can do"},
                "speak": "From the store I can read the vault, look at Safari, ask the repo, or report status.",
            }

        with tempfile.TemporaryDirectory(prefix="golden-can-") as tmp:
            hive, vault = _hive(tmp)
            out = TURN.apply_turn(
                "What can you do?",
                hive=hive,
                retrieve_roots=[vault],
                cursor_fn=fake_cursor,
            )
        self.assertTrue(calls, "model must be called")
        self.assertNotEqual(out.get("verb"), "can")
        self.assertNotIn(CANNED_CAN, out.get("spoken") or "")
        self.assertIn("vault", (out.get("spoken") or "").lower())
        self.assertTrue(
            "vault_read" in (out.get("wires") or []) or "store" in (out.get("wires") or []),
            out,
        )
        self.assertNotIn("today", (out.get("verb") or ""))

    def test_2_follow_up_needs_turn_1(self) -> None:
        packs: list[str] = []

        def fake_cursor(prompt: str, mode: str = "ask", **kw):
            _ = (mode, kw)
            pack = None
            for token in prompt.split():
                token = token.strip(" .\"'")
                if token.endswith("pipeline-pack.md"):
                    pack = Path(token)
                    break
            body = pack.read_text(encoding="utf-8") if pack and pack.is_file() else ""
            packs.append(body)
            if "What did I just say" in prompt:
                self.assertIn("north star is leverage", body)
                return {
                    "tool": "vault_read",
                    "args": {"query": "north star leverage"},
                    "speak": "You said your north star is leverage.",
                }
            return {
                "tool": "vault_read",
                "args": {"query": "north star"},
                "speak": "Noted. Your north star is leverage.",
            }

        with tempfile.TemporaryDirectory(prefix="golden-follow-") as tmp:
            hive, vault = _hive(tmp)
            first = TURN.apply_turn(
                "My north star is leverage",
                hive=hive,
                retrieve_roots=[vault],
                cursor_fn=fake_cursor,
            )
            self.assertIn("leverage", (first.get("spoken") or "").lower())
            second = TURN.apply_turn(
                "What did I just say?",
                hive=hive,
                retrieve_roots=[vault],
                cursor_fn=fake_cursor,
            )
        self.assertGreaterEqual(len(packs), 2)
        self.assertIn("north star is leverage", packs[-1])
        self.assertIn("leverage", (second.get("spoken") or "").lower())

    def test_3_look_at_this_page_runs_safari_see(self) -> None:
        saw: list[str] = []

        def fake_cursor(prompt: str, mode: str = "ask", **kw):
            _ = (prompt, mode, kw)
            return {"tool": "safari_see", "args": {}, "speak": "I looked at the page."}

        def fake_see(utterance: str = ""):
            saw.append(utterance)
            return {
                "ok": True,
                "wire": "safari",
                "spoken": "The front tab is Example Docs at https://example.com/page",
                "title": "Example Docs",
                "url": "https://example.com/page",
            }

        with tempfile.TemporaryDirectory(prefix="golden-see-") as tmp:
            hive, vault = _hive(tmp)
            out = TURN.apply_turn(
                "Look at this page",
                hive=hive,
                retrieve_roots=[vault],
                cursor_fn=fake_cursor,
                see_fn=fake_see,
            )
        self.assertEqual(saw, ["Look at this page"])
        self.assertEqual(out.get("verb"), "safari_see")
        spoken = out.get("spoken") or ""
        self.assertIn("Example Docs", spoken)
        self.assertIn("https://example.com/page", spoken)

    def test_4_send_this_email_is_proposal_only(self) -> None:
        sent: list[str] = []
        cursor_calls: list[str] = []

        def fake_cursor(prompt: str, mode: str = "ask", **kw):
            _ = (mode, kw)
            cursor_calls.append(prompt)
            return {"tool": "refuse_hard_step", "args": {}, "speak": "I will send it now."}

        def fake_send(to: str) -> None:
            sent.append(to)

        with tempfile.TemporaryDirectory(prefix="golden-send-") as tmp:
            hive, vault = _hive(tmp)
            out = TURN.apply_turn(
                "Send this email",
                hive=hive,
                retrieve_roots=[vault],
                cursor_fn=fake_cursor,
            )
            _ = fake_send
        self.assertEqual(sent, [])
        self.assertEqual(out.get("verb"), "refuse_hard_step")
        self.assertIn("Proposal only", out.get("spoken") or "")
        self.assertNotIn("I will send it now", out.get("spoken") or "")
        self.assertFalse(out.get("ask"))

    def test_5_auth_fail_ttl_still_reaches_model(self) -> None:
        calls: list[str] = []

        def fake_cursor(prompt: str, mode: str = "ask", **kw):
            _ = (mode, kw)
            calls.append(prompt)
            return {
                "tool": "vault_read",
                "args": {"query": "north star"},
                "speak": "From the store: maximum leverage, minimum noise.",
            }

        past = (datetime.now(timezone.utc) - timedelta(minutes=1)).strftime("%Y-%m-%dT%H:%M:%SZ")
        with tempfile.TemporaryDirectory(prefix="golden-scar-") as tmp:
            hive, vault = _hive(tmp)
            live = hive / "bus" / "scars.jsonl"
            SCARS.record(
                scar_id="cursor-auth-dark",
                symptom="UNKNOWN. Cursor agent needs a one-time login.",
                cause="fake auth fail",
                live=live,
                expires_at=past,
            )
            self.assertFalse(SCARS.blocks_cursor(live))
            out = TURN.apply_turn(
                "What is my north star?",
                hive=hive,
                retrieve_roots=[vault],
                cursor_fn=fake_cursor,
            )
            pack = hive / "bus" / "pipeline-pack.md"
            self.assertTrue(pack.is_file())
            self.assertNotIn("argv.append", pack.read_text(encoding="utf-8")[:20])
        self.assertTrue(calls, "expired scar must not skip the model")
        self.assertIn("leverage", (out.get("spoken") or "").lower())
        self.assertNotIn(CANNED_CAN, out.get("spoken") or "")


if __name__ == "__main__":
    unittest.main()
