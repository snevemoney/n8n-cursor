"""Locked regressions for R13 N12 rules. Do not loosen."""

from __future__ import annotations

import io
import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from learning_engine.cli import main as cli_main
from learning_engine.io_util import write_jsonl
from learning_engine.packet import base_packet, evidence_item
from learning_engine.storage.sqlite_index import index_packets


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


def _cli_err(argv: list[str]) -> tuple[int, dict]:
    stderr = io.StringIO()
    stdout = io.StringIO()
    with mock.patch("sys.stderr", stderr), mock.patch("sys.stdout", stdout):
        rc = cli_main(argv)
    combined = stderr.getvalue() + stdout.getvalue()
    if "Traceback" in combined:
        raise AssertionError(f"traceback leaked:\n{combined}")
    return rc, json.loads(stderr.getvalue())


def _write_decoys(db: Path) -> dict[str, Path]:
    parent = db.parent
    name = db.name
    tmp_file = parent / f"{name}.tmp"
    notes = parent / f"{name}.tmp-notes.txt"
    tmpdir = parent / f"{name}.tmpdir"
    rebuilding = parent / f"{name}.rebuilding"
    tmp_file.write_text("user-tmp", encoding="utf-8")
    notes.write_text("user-notes", encoding="utf-8")
    tmpdir.mkdir()
    inside = tmpdir / "keep.txt"
    inside.write_text("inside-tmpdir", encoding="utf-8")
    rebuilding.mkdir()
    junk = rebuilding / "user.txt"
    junk.write_text("inside-rebuilding", encoding="utf-8")
    return {
        "tmp": tmp_file,
        "notes": notes,
        "tmpdir": tmpdir,
        "inside": inside,
        "rebuilding": rebuilding,
        "junk": junk,
    }


def _assert_decoys(test: unittest.TestCase, decoys: dict[str, Path]) -> None:
    test.assertTrue(decoys["tmp"].is_file())
    test.assertEqual(decoys["tmp"].read_text(encoding="utf-8"), "user-tmp")
    test.assertTrue(decoys["notes"].is_file())
    test.assertEqual(decoys["notes"].read_text(encoding="utf-8"), "user-notes")
    test.assertTrue(decoys["tmpdir"].is_dir())
    test.assertTrue(decoys["inside"].is_file())
    test.assertEqual(decoys["inside"].read_text(encoding="utf-8"), "inside-tmpdir")
    test.assertTrue(decoys["rebuilding"].is_dir())
    test.assertTrue(decoys["junk"].is_file())
    test.assertEqual(decoys["junk"].read_text(encoding="utf-8"), "inside-rebuilding")


class N121ExactTempNamesOnly(unittest.TestCase):
    def test_tmp_prefix_decoys_and_rebuilding_dir_survive(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            db = Path(tmp) / "idx.sqlite"
            index_packets(db, [_ok(signal_id="old")])
            before = db.read_bytes()
            decoys = _write_decoys(db)
            jsonl = Path(tmp) / "p.jsonl"
            write_jsonl(jsonl, [_ok(signal_id="new")])
            rc, err = _cli_err(
                ["store", "--packets", str(jsonl), "--sqlite", str(db), "--rebuild"]
            )
            self.assertEqual(rc, 1)
            self.assertEqual(err["path"], str(decoys["rebuilding"]))
            self.assertIn("not a regular file", err["error"])
            self.assertEqual(db.read_bytes(), before)
            _assert_decoys(self, decoys)

    def test_tmp_decoys_survive_successful_rebuild(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            db = Path(tmp) / "idx.sqlite"
            index_packets(db, [_ok(signal_id="old")])
            parent = db.parent
            name = db.name
            tmp_file = parent / f"{name}.tmp"
            notes = parent / f"{name}.tmp-notes.txt"
            tmpdir = parent / f"{name}.tmpdir"
            tmp_file.write_text("user-tmp", encoding="utf-8")
            notes.write_text("user-notes", encoding="utf-8")
            tmpdir.mkdir()
            (tmpdir / "keep.txt").write_text("inside-tmpdir", encoding="utf-8")
            jsonl = Path(tmp) / "p.jsonl"
            write_jsonl(jsonl, [_ok(signal_id="new")])
            stderr = io.StringIO()
            with mock.patch("sys.stderr", stderr):
                rc = cli_main(
                    ["store", "--packets", str(jsonl), "--sqlite", str(db), "--rebuild"]
                )
            self.assertEqual(rc, 0)
            self.assertNotIn("Traceback", stderr.getvalue())
            self.assertEqual(tmp_file.read_text(encoding="utf-8"), "user-tmp")
            self.assertEqual(notes.read_text(encoding="utf-8"), "user-notes")
            self.assertTrue(tmpdir.is_dir())
            self.assertEqual((tmpdir / "keep.txt").read_text(encoding="utf-8"), "inside-tmpdir")


class N122ValidateOutputWrite(unittest.TestCase):
    def test_output_write_failure_is_json(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            jsonl = Path(tmp) / "p.jsonl"
            write_jsonl(jsonl, [_ok()])
            out = Path(tmp) / "outdir"
            out.mkdir()
            rc, err = _cli_err(
                ["validate", "--input", str(jsonl), "--output", str(out)]
            )
            self.assertEqual(rc, 1)
            self.assertFalse(err["ok"])
            self.assertEqual(err["path"], str(out))
            self.assertTrue(err["error"])


class N123PlainStoreNoEmptyDb(unittest.TestCase):
    def test_failed_insert_does_not_leave_new_empty_db(self) -> None:
        import learning_engine.storage.sqlite_index as idx

        with tempfile.TemporaryDirectory() as tmp:
            db = Path(tmp) / "fresh.sqlite"
            jsonl = Path(tmp) / "p.jsonl"
            write_jsonl(jsonl, [_ok()])
            idx.FAIL_INDEX_AFTER = "after_connect"
            try:
                rc, err = _cli_err(
                    ["store", "--packets", str(jsonl), "--sqlite", str(db)]
                )
            finally:
                idx.FAIL_INDEX_AFTER = None
            self.assertEqual(rc, 1)
            self.assertFalse(db.exists())
            self.assertIn("simulated insert failure", err["error"])


class N125ReadonlySkipReason(unittest.TestCase):
    def test_readonly_test_skips_when_root(self) -> None:
        import test_r12_rules as r12

        method = r12.N111JsonlErrors.test_readonly_directory_is_json
        skip = getattr(method, "__unittest_skip__", False)
        reason = getattr(method, "__unittest_skip_reason__", "")
        if os.geteuid() == 0:
            self.assertTrue(skip)
            self.assertIn("geteuid", reason)
            self.assertIn("0", reason)
        else:
            self.assertFalse(skip)


if __name__ == "__main__":
    unittest.main()
