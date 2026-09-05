#!/usr/bin/env python3
"""Never-again scars. Do not repeat a logged error."""
from __future__ import annotations

import importlib.util
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parent / "scars.py"


def _load():
    spec = importlib.util.spec_from_file_location("agent_stack_scars", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {SCRIPT}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load()


class ScarsTest(unittest.TestCase):
    def test_lookup_cursor_auth(self) -> None:
        scar = MOD.lookup("UNKNOWN. Cursor agent needs a one-time login. Run agent login in Terminal.")
        self.assertIsNotNone(scar)
        self.assertEqual(scar["id"], "cursor-auth-dark")
        self.assertEqual(scar["heal"], "store_fallback")

    def test_record_then_blocks_cursor(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-scars-") as tmp:
            live = Path(tmp) / "scars.jsonl"
            self.assertFalse(MOD.blocks_cursor(live))
            MOD.record(scar_id="cursor-auth-dark", symptom="login UNKNOWN", live=live)
            self.assertTrue(MOD.blocks_cursor(live))
            self.assertEqual(MOD.hits_for("cursor-auth-dark", live), 1)

    def test_legacy_row_without_ttl_does_not_block(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-scars-legacy-") as tmp:
            live = Path(tmp) / "scars.jsonl"
            live.write_text(
                '{"id":"cursor-auth-dark","at":"2026-09-04T20:03:46Z","symptom":"login"}\n',
                encoding="utf-8",
            )
            self.assertFalse(MOD.blocks_cursor(live))

    def test_expired_or_resolved_does_not_block(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-scars-ttl-") as tmp:
            live = Path(tmp) / "scars.jsonl"
            MOD.record(
                scar_id="cursor-auth-dark",
                symptom="login UNKNOWN",
                live=live,
                expires_at="2000-01-01T00:00:00Z",
            )
            self.assertFalse(MOD.blocks_cursor(live))
            MOD.record(scar_id="cursor-auth-dark", symptom="login UNKNOWN", live=live)
            self.assertTrue(MOD.blocks_cursor(live))
            MOD.resolve("cursor-auth-dark", live)
            self.assertFalse(MOD.blocks_cursor(live))

    def test_send_an_agent_is_a_known_scar(self) -> None:
        scar = MOD.lookup("send an agent to fix him")
        self.assertIsNotNone(scar)
        self.assertEqual(scar["id"], "send-an-agent-not-hard-step")


if __name__ == "__main__":
    unittest.main()
