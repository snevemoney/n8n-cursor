#!/usr/bin/env python3
"""Unit tests for session-matrix (catch-up + paste pack)."""
from __future__ import annotations

import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
SCRIPT = HERE.parent / "os" / "session-matrix.py"
FIXTURE = HERE / "fixtures" / "session-matrix-heads.json"


def _load_mod():
    spec = importlib.util.spec_from_file_location("session_matrix", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {SCRIPT}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load_mod()


class SessionMatrixTest(unittest.TestCase):
    def test_official_sentences_in_paste_pack(self) -> None:
        packed = json.loads(FIXTURE.read_text(encoding="utf-8"))
        text = MOD.render_paste_pack(
            packed["cursor"],
            packed["grok"],
            at="2026-08-29T18:40:00Z",
            said_rel="inbox/2026-08-29-said-5.md",
        )
        self.assertIn("Grok, Claude, ChatGPT, and Cursor each read", text)
        self.assertIn("Same session store", text)
        self.assertIn("11111111-aaaa-bbbb-cccc-222222222222", text)
        self.assertIn("33333333-dddd-eeee-ffff-444444444444", text)
        self.assertNotIn(".jsonl", text)

    def test_write_bundle_no_transcript_dump(self) -> None:
        packed = MOD.heads_from_json(FIXTURE)
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / "os"
            (root / "inbox").mkdir(parents=True)
            wrote = MOD.write_bundle(
                root,
                packed["cursor"],
                packed["grok"],
                at="2026-08-29T18:40:00Z",
                date="2026-08-29",
            )
            said = Path(wrote["said"]).read_text(encoding="utf-8")
            index = Path(wrote["index"]).read_text(encoding="utf-8")
            paste = Path(wrote["paste"]).read_text(encoding="utf-8")
            hot = Path(wrote["hot"]).read_text(encoding="utf-8")
            latest = (root / "inbox" / "PASTE-PACK-LATEST.md").read_text(encoding="utf-8")
            self.assertTrue(Path(wrote["said"]).name.startswith("2026-08-29-said-"))
            self.assertIn("Grok, Claude, ChatGPT, and Cursor each read", said)
            store_index = (root / "sessions" / "INDEX.md").read_text(encoding="utf-8")
            self.assertIn("11111111-aaaa-bbbb-cccc-222222222222", store_index)
            self.assertIn("cursor", store_index)
            self.assertIn("33333333-dddd-eeee-ffff-444444444444", store_index)
            self.assertEqual(paste, latest)
            self.assertIn("Same session store", hot)
            self.assertNotIn("<user_query>", paste + index + said)

    def test_next_said_increments(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            inbox = Path(tmp)
            (inbox / "2026-08-29-said-1.md").write_text("x\n", encoding="utf-8")
            (inbox / "2026-08-29-said-2.md").write_text("y\n", encoding="utf-8")
            got = MOD.next_said_path(inbox, "2026-08-29")
            self.assertEqual(got.name, "2026-08-29-said-3.md")


if __name__ == "__main__":
    unittest.main()
