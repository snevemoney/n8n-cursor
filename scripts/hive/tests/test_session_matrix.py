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

    def test_chatgpt_desktop_titles_not_stubs(self) -> None:
        sid = "6a7b2776-ba2c-83ea-9a9e-37f6c02aeaa6"
        self.assertFalse(MOD.is_real_chatgpt_title(f"ChatGPT conversation {sid[:13]}", sid))
        self.assertTrue(MOD.is_real_chatgpt_title("Daily Wealth & Stock Ranking", sid))
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            auto = root / "automation-repository-user-x" / "automations.json"
            auto.parent.mkdir(parents=True)
            auto.write_text(
                json.dumps(
                    {
                        "automationResponses": [
                            {
                                "conversationId": sid,
                                "title": "Daily Wealth & Stock Ranking",
                            }
                        ]
                    }
                ),
                encoding="utf-8",
            )
            conv = root / "conversations-v3-x"
            conv.mkdir()
            (conv / f"{sid}.data").write_bytes(b"\x00not-a-title")
            (conv / "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.data").write_bytes(b"\x00x")
            titles = MOD.harvest_chatgpt_desktop_titles(root)
            self.assertEqual(titles[sid], "Daily Wealth & Stock Ranking")
            rows = MOD.collect_chatgpt_heads(8, title_map=titles, app_root=root)
            by_id = {r["id"]: r["title"] for r in rows}
            self.assertEqual(by_id[sid], "Daily Wealth & Stock Ranking")
            self.assertTrue(by_id["aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"].startswith("ChatGPT conversation"))
            os_root = root / "os"
            os_root.mkdir()
            MOD.write_session_store(
                os_root,
                {"cursor": [], "grok": [], "claude": [], "chatgpt": rows},
                at="2026-08-29T19:00:00Z",
            )
            overlay = json.loads((os_root / "sessions" / "chatgpt-titles.json").read_text(encoding="utf-8"))
            self.assertEqual(overlay["titles"][sid], "Daily Wealth & Stock Ranking")
            again = MOD.collect_chatgpt_heads(
                8,
                title_map=MOD.load_chatgpt_title_overlay(os_root / "sessions" / "chatgpt-titles.json"),
                app_root=root,
            )
            self.assertEqual(again[0]["title"] if again[0]["id"] == sid else by_id[sid], "Daily Wealth & Stock Ranking")
            self.assertTrue(all(r["id"] != sid or r["title"] == "Daily Wealth & Stock Ranking" for r in again))


if __name__ == "__main__":
    unittest.main()
