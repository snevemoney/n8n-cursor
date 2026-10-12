#!/usr/bin/env python3
"""Unit tests for session-matrix (catch-up + paste pack)."""
from __future__ import annotations

import importlib.util
import json
import os
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
        self.assertIn("Hive Slack is the shared room", text)
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
            store_index = (root / "sessions" / "Recent Conversations.md").read_text(encoding="utf-8")
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

    def test_write_session_store_skips_archive_notes(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            os_root = Path(tmp)
            dest = os_root / "sessions" / "chatgpt"
            dest.mkdir(parents=True)
            archive = dest / "keep-me.md"
            archive.write_text(
                "---\nsurface: chatgpt\nid: keep-me\narchive_type: conversation_text\n---\n\n# Keep\n\nreal body\n",
                encoding="utf-8",
            )
            stub_ok = dest / "fresh.md"
            MOD.write_session_store(
                os_root,
                {
                    "cursor": [],
                    "grok": [],
                    "claude": [],
                    "chatgpt": [
                        {"surface": "chatgpt", "id": "keep-me", "title": "wiped", "ask": "wiped", "mtime": "x"},
                        {"surface": "chatgpt", "id": "fresh", "title": "Fresh", "ask": "hi", "mtime": "x"},
                    ],
                },
                at="2026-09-11T16:00:00Z",
            )
            kept = archive.read_text(encoding="utf-8")
            self.assertIn("real body", kept)
            self.assertIn("archive_type: conversation_text", kept)
            self.assertTrue(stub_ok.is_file())
            self.assertIn("Fresh", stub_ok.read_text(encoding="utf-8"))

    def test_write_session_store_skips_archive_alias(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            os_root = Path(tmp)
            dest = os_root / "sessions" / "grok"
            dest.mkdir(parents=True)
            alias = dest / "desk-thread.md"
            alias.write_text(
                "---\nalias: true\narchive_type: archive_alias\nid: desk-thread\n---\n\n# Alias\n\nkeep\n",
                encoding="utf-8",
            )
            MOD.write_session_store(
                os_root,
                {
                    "cursor": [],
                    "grok": [
                        {"surface": "grok", "id": "desk-thread", "title": "wiped", "ask": "wiped", "mtime": "x"},
                    ],
                    "claude": [],
                    "chatgpt": [],
                },
                at="2026-09-11T16:00:00Z",
            )
            kept = alias.read_text(encoding="utf-8")
            self.assertIn("keep", kept)
            self.assertIn("archive_type: archive_alias", kept)

    def test_write_session_store_aliases_nested_grok_and_claude_heads(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            os_root = Path(tmp)
            desk = os_root / "sessions" / "grok" / "forge"
            desk.mkdir(parents=True)
            (desk / "nested-1.md").write_text(
                "---\narchive_type: conversation_text\nid: nested-1\n---\n\n# Real\n\nbody\n",
                encoding="utf-8",
            )
            MOD.write_session_store(
                os_root,
                {
                    "cursor": [],
                    "grok": [
                        {"surface": "grok", "id": "nested-1", "title": "Real", "ask": "hi", "mtime": "x"},
                    ],
                    "claude": [
                        {"surface": "claude", "id": "local_new", "title": "Phase", "ask": "Phase", "mtime": "x"},
                    ],
                    "chatgpt": [],
                },
                at="2026-09-11T16:00:00Z",
            )
            grok_head = (os_root / "sessions" / "grok" / "nested-1.md").read_text(encoding="utf-8")
            self.assertIn("archive_type: archive_alias", grok_head)
            self.assertIn("Desk transcript", grok_head)
            claude_head = (os_root / "sessions" / "claude" / "local_new.md").read_text(encoding="utf-8")
            self.assertIn("archive_type: archive_alias", claude_head)
            self.assertIn("Title-only head", claude_head)

    def test_slack_skipped_without_env(self) -> None:
        old = {k: os.environ.pop(k) for k in list(os.environ) if k.startswith("SLACK_HIVE_")}
        try:
            self.assertIsNone(MOD.slack_hive_config())
            result = MOD.post_slack_hive("should not send")
            self.assertFalse(result["ok"])
            self.assertEqual(result.get("skipped"), "no SLACK_HIVE_* env")
        finally:
            os.environ.update(old)

    def test_render_slack_snapshot_titles_only(self) -> None:
        packed = MOD.heads_from_json(FIXTURE)
        text = MOD.render_slack_snapshot(
            packed,
            at="2026-08-29T19:40:00Z",
            said_rel="inbox/2026-08-29-said-2.md",
            hot_line="2026-08-29T19:40:00Z · store sessions/ cursor=1 grok=1",
            prev_rows=[],
        )
        self.assertIn("Hive Slack is the shared room", text)
        # Union: main points Slack at sessions/INDEX.md; both index files are written.
        self.assertTrue(
            "`docs/hive/outer-heaven/CONTENT/os/sessions/Recent Conversations.md`" in text
            or "`docs/hive/outer-heaven/CONTENT/os/sessions/INDEX.md`" in text
        )
        self.assertIn("can the memory of all chat session continue", text)
        self.assertIn("stand down", text)
        self.assertNotIn("<user_query>", text)
        self.assertNotIn(".data", text.split("Do not decrypt")[0])
        delta = MOD.render_slack_snapshot(
            packed,
            at="2026-08-29T19:40:00Z",
            said_rel="inbox/2026-08-29-said-2.md",
            hot_line="hot",
            prev_rows=[{"surface": "cursor", "id": "nope", "title": "old"}],
        )
        self.assertIn("Delta — new titles", delta)


if __name__ == "__main__":
    unittest.main()
