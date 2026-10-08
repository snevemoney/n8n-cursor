"""Locked regressions for R12 N11 rules. Do not loosen."""

from __future__ import annotations

import io
import json
import os
import sqlite3
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from fixtures.tiny_png import MINIMAL_FTYP_MP4, PNG_1X1
from learning_engine.cli import main as cli_main
from learning_engine.constants import VIDEO_EXTENSIONS
from learning_engine.errors import PacketValidationError
from learning_engine.isolation import forbidden_outside_paths
from learning_engine.io_util import write_jsonl
from learning_engine.packet import base_packet, evidence_item
from learning_engine.storage.sqlite_index import index_packets
from learning_engine.validator import validate_packet


R6_SCHEMA = """
CREATE TABLE IF NOT EXISTS packets (
    signal_id TEXT PRIMARY KEY,
    source_type TEXT,
    content_access TEXT,
    analysis_scope TEXT,
    verification_state TEXT,
    processing_status TEXT,
    lifecycle_state TEXT,
    source_url TEXT,
    adapter TEXT,
    body_json TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS judgments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    signal_id TEXT,
    provider TEXT,
    flagged INTEGER,
    label TEXT,
    latency_ms REAL,
    cost_usd REAL,
    body_json TEXT NOT NULL
);
"""


def _ok(**overrides):
    packet = base_packet(
        signal_id="syn-ok",
        source_type="bookmark",
        content_access="transcript",
        analysis_scope="transcript",
        source_text="Post shows an agent loop with a verifier harness",
        evidence=[evidence_item(kind="field", source_ref="REVIEW.csv:gist")],
        verification_state="unknown",
        processing_status="ok",
        lifecycle_state="analyzed",
        evidence_base=".",
    )
    packet.update(overrides)
    return packet


def _full_visual(image_ref: str, video_ref: str):
    return _ok(
        content_access="full_visual",
        analysis_scope="full_visual",
        evidence=[
            evidence_item(kind="frame", source_ref=image_ref),
            evidence_item(kind="file", source_ref=video_ref, note="video"),
        ],
    )


def _cli_err(argv: list[str]) -> tuple[int, dict]:
    stderr = io.StringIO()
    stdout = io.StringIO()
    with mock.patch("sys.stderr", stderr), mock.patch("sys.stdout", stdout):
        rc = cli_main(argv)
    err_text = stderr.getvalue()
    out_text = stdout.getvalue()
    combined = err_text + out_text
    if "Traceback" in combined:
        raise AssertionError(f"traceback leaked:\n{combined}")
    payload = json.loads(err_text)
    return rc, payload


class N111JsonlErrors(unittest.TestCase):
    def test_corrupt_last_line_store_rebuild_is_json(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            jsonl = root / "bad.jsonl"
            jsonl.write_text(
                json.dumps(_ok(signal_id="a")) + "\n{not-json\n",
                encoding="utf-8",
            )
            rc, err = _cli_err(
                ["store", "--packets", str(jsonl), "--sqlite", str(root / "idx.sqlite"), "--rebuild"]
            )
            self.assertEqual(rc, 1)
            self.assertFalse(err["ok"])
            self.assertEqual(err["path"], str(jsonl))
            self.assertEqual(err["line"], 2)
            self.assertIn("invalid JSON", err["error"])

    def test_corrupt_mid_file_validate_is_json(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            jsonl = Path(tmp) / "mid.jsonl"
            jsonl.write_text(
                json.dumps(_ok(signal_id="a"))
                + "\n{not-json\n"
                + json.dumps(_ok(signal_id="c"))
                + "\n",
                encoding="utf-8",
            )
            rc, err = _cli_err(["validate", "--input", str(jsonl)])
            self.assertEqual(rc, 1)
            self.assertEqual(err["line"], 2)
            self.assertEqual(err["path"], str(jsonl))

    def test_non_object_line_plain_store_is_json(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            jsonl = Path(tmp) / "arr.jsonl"
            jsonl.write_text('["not", "an", "object"]\n', encoding="utf-8")
            rc, err = _cli_err(
                ["store", "--packets", str(jsonl), "--sqlite", str(Path(tmp) / "idx.sqlite")]
            )
            self.assertEqual(rc, 1)
            self.assertEqual(err["line"], 1)
            self.assertIn("object", err["error"])

    def test_invalid_utf8_is_json_with_line(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            jsonl = Path(tmp) / "bad-utf8.jsonl"
            jsonl.write_bytes(b'{"signal_id":"ok"}\n\xff\xfe not utf-8\n')
            rc, err = _cli_err(["validate", "--input", str(jsonl)])
            self.assertEqual(rc, 1)
            self.assertEqual(err["line"], 2)
            self.assertIn("UTF-8", err["error"])

    def test_missing_jsonl_is_json(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            missing = Path(tmp) / "nope.jsonl"
            rc, err = _cli_err(
                [
                    "store",
                    "--packets",
                    str(missing),
                    "--sqlite",
                    str(Path(tmp) / "idx.sqlite"),
                    "--rebuild",
                ]
            )
            self.assertEqual(rc, 1)
            self.assertEqual(err["path"], str(missing))
            self.assertIn("not found", err["error"].lower())
            self.assertNotIn("line", err)

    @unittest.skipIf(
        os.geteuid() == 0,
        "chmod 0555 does not block the superuser (os.geteuid()==0)",
    )
    def test_readonly_directory_is_json(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            jsonl = root / "p.jsonl"
            write_jsonl(jsonl, [_ok()])
            locked = root / "locked"
            locked.mkdir()
            db = locked / "idx.sqlite"
            locked.chmod(0o555)
            try:
                rc, err = _cli_err(
                    ["store", "--packets", str(jsonl), "--sqlite", str(db), "--rebuild"]
                )
            finally:
                locked.chmod(0o755)
            self.assertEqual(rc, 1)
            self.assertFalse(err["ok"])
            self.assertTrue(err["error"])
            self.assertFalse(db.exists())

    def test_leftover_temp_directory_is_json_when_not_cleared(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            db = root / "idx.sqlite"
            index_packets(db, [_ok(signal_id="keep")])
            before = db.read_bytes()
            stale = db.with_name(db.name + ".rebuilding")
            stale.mkdir()
            junk = stale / "junk"
            junk.write_text("x", encoding="utf-8")
            jsonl = root / "p.jsonl"
            write_jsonl(jsonl, [_ok(signal_id="new")])
            rc, err = _cli_err(
                ["store", "--packets", str(jsonl), "--sqlite", str(db), "--rebuild"]
            )
            self.assertEqual(rc, 1)
            self.assertIn("not a regular file", err["error"])
            self.assertEqual(err["path"], str(stale))
            self.assertTrue(stale.is_dir())
            self.assertEqual(junk.read_text(encoding="utf-8"), "x")
            self.assertEqual(db.read_bytes(), before)


class N112CleanupNeverRaises(unittest.TestCase):
    def test_cleanup_failure_adds_warning_field(self) -> None:
        import learning_engine.storage.sqlite_index as idx

        with tempfile.TemporaryDirectory() as tmp:
            db = Path(tmp) / "idx.sqlite"
            index_packets(db, [_ok(signal_id="keep")])
            jsonl = Path(tmp) / "p.jsonl"
            write_jsonl(jsonl, [_ok(signal_id="new", source_type="youtube_l2")])
            idx.FAIL_REBUILD_AFTER = "after_delete"
            idx.FAIL_CLEANUP = True
            try:
                rc, err = _cli_err(
                    ["store", "--packets", str(jsonl), "--sqlite", str(db), "--rebuild"]
                )
            finally:
                idx.FAIL_REBUILD_AFTER = None
                idx.FAIL_CLEANUP = False
            self.assertEqual(rc, 1)
            self.assertIn("cleanup_warning", err)
            self.assertIn("simulated cleanup failure", err["cleanup_warning"])


class N113NoEmptyDbAndStaleClear(unittest.TestCase):
    def test_failed_rebuild_does_not_leave_new_empty_db(self) -> None:
        import learning_engine.storage.sqlite_index as idx

        with tempfile.TemporaryDirectory() as tmp:
            db = Path(tmp) / "fresh.sqlite"
            jsonl = Path(tmp) / "p.jsonl"
            write_jsonl(jsonl, [_ok()])
            idx.FAIL_REBUILD_AFTER = "after_delete"
            try:
                rc, err = _cli_err(
                    ["store", "--packets", str(jsonl), "--sqlite", str(db), "--rebuild"]
                )
            finally:
                idx.FAIL_REBUILD_AFTER = None
            self.assertEqual(rc, 1)
            self.assertFalse(db.exists())
            self.assertIn("no database was created", err["error"])
            self.assertNotIn("database left unchanged", err["error"])

    def test_stale_rebuilding_dir_aborts_and_leaves_decoys(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            db = Path(tmp) / "idx.sqlite"
            index_packets(db, [_ok(signal_id="old")])
            before = db.read_bytes()
            stale = db.with_name(db.name + ".rebuilding")
            stale.mkdir()
            (stale / "junk").write_text("keep", encoding="utf-8")
            stray = Path(tmp) / (db.name + ".tmp-old")
            stray.write_text("stale", encoding="utf-8")
            jsonl = Path(tmp) / "p.jsonl"
            write_jsonl(jsonl, [_ok(signal_id="new")])
            rc, err = _cli_err(
                ["store", "--packets", str(jsonl), "--sqlite", str(db), "--rebuild"]
            )
            self.assertEqual(rc, 1)
            self.assertEqual(err["path"], str(stale))
            self.assertTrue(stale.is_dir())
            self.assertEqual((stale / "junk").read_text(encoding="utf-8"), "keep")
            self.assertTrue(stray.is_file())
            self.assertEqual(stray.read_text(encoding="utf-8"), "stale")
            self.assertEqual(db.read_bytes(), before)


class N114IsolationTraversal(unittest.TestCase):
    def test_rejects_parent_traversal_and_absolute(self) -> None:
        bad = forbidden_outside_paths(
            [
                "learning-engine/../apps/x",
                "/learning-engine/foo.py",
                "learning-engine/isolation.py",
            ]
        )
        self.assertEqual(bad, ["learning-engine/../apps/x", "/learning-engine/foo.py"])


class N115AviM4vVideoRefs(unittest.TestCase):
    def test_avi_and_m4v_count_as_video_extensions(self) -> None:
        self.assertIn(".avi", VIDEO_EXTENSIONS)
        self.assertIn(".m4v", VIDEO_EXTENSIONS)
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "frame.png").write_bytes(PNG_1X1)
            (root / "clip.m4v").write_bytes(MINIMAL_FTYP_MP4)
            (root / "clip.avi").write_bytes(b"RIFF\x00\x00\x00\x00AVI ")
            validate_packet(_full_visual("frame.png", "clip.m4v"), root=root)
            validate_packet(_full_visual("frame.png", "clip.avi"), root=root)
            with self.assertRaises(PacketValidationError):
                validate_packet(_full_visual("frame.png", "clip.m4v"))


class N117UncheckedFullVisual(unittest.TestCase):
    def test_validate_without_root_reports_unchecked_not_zero(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            jsonl = Path(tmp) / "fv.jsonl"
            write_jsonl(jsonl, [_full_visual("frame.png", "clip.mp4")])
            stdout = io.StringIO()
            stderr = io.StringIO()
            with mock.patch("sys.stdout", stdout), mock.patch("sys.stderr", stderr):
                rc = cli_main(["validate", "--input", str(jsonl)])
            self.assertEqual(rc, 1)
            self.assertNotIn("Traceback", stdout.getvalue() + stderr.getvalue())
            report = json.loads(stdout.getvalue())
            self.assertEqual(report["false_full_visual"], "unchecked_no_root")
            self.assertNotEqual(report["false_full_visual"], 0)


class N118NoDoubledUnchangedPrefix(unittest.TestCase):
    def test_rebuild_does_not_double_unchanged_prefix(self) -> None:
        import learning_engine.storage.sqlite_index as idx

        with tempfile.TemporaryDirectory() as tmp:
            db = Path(tmp) / "r6.sqlite"
            conn = sqlite3.connect(str(db))
            conn.executescript(R6_SCHEMA)
            conn.execute(
                "INSERT INTO packets (signal_id, source_type, body_json) VALUES ('legacy','bookmark','{}')"
            )
            conn.commit()
            conn.close()
            jsonl = Path(tmp) / "p.jsonl"
            write_jsonl(jsonl, [_ok()])
            idx.FAIL_MIGRATION_AFTER = "after_packets_copy"
            try:
                rc, err = _cli_err(
                    ["store", "--packets", str(jsonl), "--sqlite", str(db), "--rebuild"]
                )
            finally:
                idx.FAIL_MIGRATION_AFTER = None
            self.assertEqual(rc, 1)
            self.assertEqual(err["error"].lower().count("database left unchanged"), 1)


if __name__ == "__main__":
    unittest.main()
