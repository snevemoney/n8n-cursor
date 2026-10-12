#!/usr/bin/env python3
"""Unit tests for archive-chats leftover-stub aliases."""
from __future__ import annotations

import importlib.util
import json
import tempfile
import unittest
import zipfile
from pathlib import Path
from unittest.mock import patch

HERE = Path(__file__).resolve().parent
SCRIPT = HERE.parent / "os" / "archive-chats.py"


def _load_mod():
    spec = importlib.util.spec_from_file_location("archive_chats", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {SCRIPT}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load_mod()


class ArchiveChatsTest(unittest.TestCase):
    def test_replace_leftover_stubs_writes_aliases(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            grok_dir = root / "CONTENT/os/sessions/grok"
            desk = grok_dir / "forge"
            desk.mkdir(parents=True)
            sid = "thread-1"
            (desk / f"{sid}.md").write_text(
                "---\narchive_type: conversation_text\nid: thread-1\n---\n\n# Real\n\nbody\n",
                encoding="utf-8",
            )
            stub = grok_dir / f"{sid}.md"
            stub.write_text(
                "---\nsurface: grok\nid: thread-1\n---\n\n# Stub\n",
                encoding="utf-8",
            )
            claude_dir = root / "CONTENT/os/sessions/claude"
            claude_dir.mkdir(parents=True)
            leftover = claude_dir / "local_skip.md"
            leftover.write_text(
                "---\nsurface: claude\nid: local_skip\n---\n\n# Vps health check\n",
                encoding="utf-8",
            )
            with patch.object(MOD, "dest_roots", return_value=[root]):
                changed = MOD.replace_leftover_stubs(
                    [
                        {
                            "id": sid,
                            "title": "Real",
                            "rel": f"CONTENT/os/sessions/grok/forge/{sid}.md",
                        }
                    ],
                    [],
                    dry_run=False,
                )
            self.assertEqual(changed["grok"], 1)
            self.assertEqual(changed["claude"], 1)
            grok_alias = stub.read_text(encoding="utf-8")
            self.assertIn("archive_type: archive_alias", grok_alias)
            self.assertIn("grok/forge/thread-1", grok_alias)
            claude_alias = leftover.read_text(encoding="utf-8")
            self.assertIn("archive_type: archive_alias", claude_alias)
            self.assertIn("Title-only", claude_alias)

    def test_write_cursor_pointers_are_thin(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            with patch.object(MOD, "dest_roots", return_value=[root]):
                n = MOD.write_cursor_pointers(
                    [
                        {
                            "id": "abc-1",
                            "title": "Site builder",
                            "date": "2026-09-11T00:00:00Z",
                            "desk": "n8n-cursor",
                            "rel": "CURSOR_CHATS/n8n-cursor/20260911-site-abc-1.md",
                        }
                    ],
                    dry_run=False,
                )
            self.assertEqual(n, 1)
            note = (root / "CONTENT/os/sessions/cursor/abc-1.md").read_text(encoding="utf-8")
            self.assertIn("archive_type: cursor_pointer", note)
            self.assertIn("CURSOR_CHATS/n8n-cursor/20260911-site-abc-1", note)
            self.assertNotIn("## Transcript", note)

    def test_resolve_claude_export_reads_zip_from_manifest_folder(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp)
            conversations = [{"uuid": "c1", "name": "Hello", "chat_messages": [{"sender": "human", "text": "hi"}]}]
            inner = folder / "conversations.json"
            inner.write_text(json.dumps(conversations), encoding="utf-8")
            zpath = folder / "conversations-000.zip"
            with zipfile.ZipFile(zpath, "w") as zf:
                zf.write(inner, arcname="conversations.json")
            manifest = folder / "manifest.json"
            manifest.write_text(
                json.dumps(
                    {
                        "data_files": [
                            {"category": "conversations", "filename": "conversations-000.zip"}
                        ]
                    }
                ),
                encoding="utf-8",
            )
            resolved = MOD.resolve_claude_export(manifest)
            self.assertIsNotNone(resolved)
            recs = MOD.load_web_export(manifest)
            self.assertTrue(any(r.get("chat_id") == "c1" for r in recs))


if __name__ == "__main__":
    unittest.main()
