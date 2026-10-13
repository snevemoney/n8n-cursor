"""Locked regressions for R11 rules. Do not loosen."""

from __future__ import annotations

import hashlib
import io
import json
import shutil
import sqlite3
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from tests.helpers import ROOT

from fixtures.tiny_png import MINIMAL_FTYP_MP4, PNG_1X1
from learning_engine.adapters import bookmark_review, corpus_reingest, youtube_l2
from learning_engine.cli import main as cli_main
from learning_engine.errors import PacketValidationError
from learning_engine.io_util import read_jsonl, write_jsonl
from learning_engine.isolation import ALLOWED_OUTSIDE, forbidden_outside_paths
from learning_engine.isolation import main as isolation_main
from learning_engine.packet import base_packet, evidence_item
from learning_engine.storage.sqlite_index import index_judgments, index_packets
from learning_engine.validator import (
    FULL_VISUAL_NEEDS_ROOT,
    count_false_full_visual,
    validate_packet,
    validate_packets,
)

STRICT = ROOT / "fixtures" / "full_visual_strict"


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


def _full_visual(image_ref: str, video_ref: str, **overrides):
    packet = _ok(
        content_access="full_visual",
        analysis_scope="full_visual",
        evidence=[
            evidence_item(kind="frame", source_ref=image_ref),
            evidence_item(kind="file", source_ref=video_ref, note="video"),
        ],
    )
    packet.update(overrides)
    return packet


def _file_sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


class R11IsolationAllowlist(unittest.TestCase):
    def test_allows_tree_and_two_explicit_workflow_files(self) -> None:
        self.assertEqual(
            ALLOWED_OUTSIDE,
            {
                ".github/workflows/learning-engine.yml",
                ".github/workflows/ai-code-validation.yml",
            },
        )
        bad = forbidden_outside_paths(
            [
                "learning-engine/foo.py",
                "learning-engine/tests/test_r11_rules.py",
                "./learning-engine/schema/research_packet.v0.json",
                ".github/workflows/learning-engine.yml",
                ".github/workflows/ai-code-validation.yml",
            ]
        )
        self.assertEqual(bad, [])
        self.assertEqual(
            isolation_main(
                [
                    "learning-engine/foo.py",
                    ".github/workflows/ai-code-validation.yml",
                ]
            ),
            0,
        )

    def test_rejects_any_other_out_of_folder_path(self) -> None:
        paths = [
            "learning-engine/ok.py",
            ".github/workflows/scope-validation.yml",
            ".github/workflows/other.yml",
            "apps/agent-stack/foo.py",
            "README.md",
            ".github/dependabot.yml",
        ]
        bad = forbidden_outside_paths(paths)
        self.assertEqual(
            bad,
            [
                ".github/workflows/scope-validation.yml",
                ".github/workflows/other.yml",
                "apps/agent-stack/foo.py",
                "README.md",
                ".github/dependabot.yml",
            ],
        )
        stdout = io.StringIO()
        with mock.patch("sys.stdout", stdout):
            rc = isolation_main(paths)
        self.assertEqual(rc, 1)
        text = stdout.getvalue()
        self.assertIn("ai-code-validation.yml", text)
        self.assertIn(".github/workflows/scope-validation.yml", text)
        self.assertIn("apps/agent-stack/foo.py", text)
        self.assertNotIn("learning-engine/ok.py", text.splitlines()[1:])


class R11FullVisualStrict(unittest.TestCase):
    def test_zero_byte_frame_rejected_with_root(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            shutil.copy2(STRICT / "zero_frame.png", root / "zero_frame.png")
            (root / "clip.mp4").write_bytes(MINIMAL_FTYP_MP4)
            self.assertEqual((root / "zero_frame.png").stat().st_size, 0)
            with self.assertRaises(PacketValidationError) as ctx:
                validate_packet(_full_visual("zero_frame.png", "clip.mp4"), root=root)
            self.assertIn("full_visual", str(ctx.exception))

    def test_zero_byte_video_rejected_with_root(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "frame.png").write_bytes(PNG_1X1)
            shutil.copy2(STRICT / "zero_video.mp4", root / "zero_video.mp4")
            self.assertEqual((root / "zero_video.mp4").stat().st_size, 0)
            with self.assertRaises(PacketValidationError) as ctx:
                validate_packet(_full_visual("frame.png", "zero_video.mp4"), root=root)
            self.assertIn("full_visual", str(ctx.exception))

    def test_text_bytes_named_png_rejected_with_root(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            shutil.copy2(STRICT / "text.png", root / "text.png")
            (root / "clip.mp4").write_bytes(MINIMAL_FTYP_MP4)
            self.assertGreater((root / "text.png").stat().st_size, 0)
            self.assertFalse((root / "text.png").read_bytes().startswith(b"\x89PNG"))
            with self.assertRaises(PacketValidationError) as ctx:
                validate_packet(_full_visual("text.png", "clip.mp4"), root=root)
            self.assertIn("full_visual", str(ctx.exception))

    def test_full_visual_without_root_is_error(self) -> None:
        packet = _full_visual("frame.png", "clip.mp4")
        with self.assertRaises(PacketValidationError) as ctx:
            validate_packet(packet)
        self.assertEqual(str(ctx.exception).split(":")[-1].strip(), FULL_VISUAL_NEEDS_ROOT)
        self.assertIn("--root", str(ctx.exception))
        with tempfile.TemporaryDirectory() as tmp:
            jsonl = Path(tmp) / "fv.jsonl"
            write_jsonl(jsonl, [packet])
            stdout = io.StringIO()
            with mock.patch("sys.stdout", stdout):
                rc = cli_main(["validate", "--input", str(jsonl)])
            self.assertEqual(rc, 1)
            report = json.loads(stdout.getvalue())
            self.assertFalse(report["ok"])
            self.assertTrue(any("--root" in err for err in report["errors"]))
            self.assertTrue(any("full_visual" in err for err in report["errors"]))

    def test_non_full_visual_still_validates_without_root(self) -> None:
        validate_packet(_ok())

    def test_valid_magic_bytes_pass_with_root(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "frame.png").write_bytes(PNG_1X1)
            (root / "clip.mp4").write_bytes(MINIMAL_FTYP_MP4)
            validate_packet(_full_visual("frame.png", "clip.mp4"), root=root)

    def test_adapter_and_real_style_zero_false_full_visual(self) -> None:
        bookmarks = bookmark_review.convert(ROOT / "fixtures" / "bookmark_review")
        validate_packets(bookmarks)
        self.assertEqual(count_false_full_visual(bookmarks), 0)

        corpus_root = ROOT / "fixtures" / "corpus"
        corpus = corpus_reingest.convert(corpus_root)
        validate_packets(corpus, root=corpus_root)
        self.assertEqual(count_false_full_visual(corpus), 0)
        self.assertEqual(count_false_full_visual(corpus, root=corpus_root), 0)

        youtube = youtube_l2.convert(ROOT / "fixtures" / "youtube_l2")
        validate_packets(youtube)
        self.assertEqual(count_false_full_visual(youtube), 0)

        fifty = list(read_jsonl(ROOT / "fixtures" / "packets" / "fifty_valid.jsonl"))
        self.assertGreaterEqual(len(fifty), 50)
        self.assertEqual(count_false_full_visual(fifty), 0)
        plain = [
            p
            for p in fifty
            if p.get("content_access") != "full_visual"
            and p.get("analysis_scope") != "full_visual"
        ]
        validate_packets(plain)


class R11AtomicRebuild(unittest.TestCase):
    def test_forced_failure_leaves_rows_byte_identical(self) -> None:
        import learning_engine.storage.sqlite_index as idx

        bookmark = [_ok(signal_id="keep-bm", source_type="bookmark")]
        corpus = [_ok(signal_id="keep-co", source_type="corpus")]
        with tempfile.TemporaryDirectory() as tmp:
            db = Path(tmp) / "idx.sqlite"
            index_packets(db, bookmark + corpus)
            index_judgments(
                db,
                [
                    {
                        "signal_id": "keep-bm",
                        "source_type": "bookmark",
                        "provider": "keyword_replay",
                    }
                ],
                run_id="run-keep",
            )
            before = db.read_bytes()
            digest = _file_sha(db)
            jsonl = Path(tmp) / "yt.jsonl"
            write_jsonl(jsonl, [_ok(signal_id="new-yt", source_type="youtube_l2")])
            idx.FAIL_REBUILD_AFTER = "after_delete"
            try:
                stderr = io.StringIO()
                with mock.patch("sys.stderr", stderr):
                    rc = cli_main(
                        [
                            "store",
                            "--packets",
                            str(jsonl),
                            "--sqlite",
                            str(db),
                            "--rebuild",
                        ]
                    )
            finally:
                idx.FAIL_REBUILD_AFTER = None
            self.assertEqual(rc, 1)
            self.assertEqual(db.read_bytes(), before)
            self.assertEqual(_file_sha(db), digest)
            err_text = stderr.getvalue()
            self.assertNotIn("Traceback", err_text)
            err = json.loads(err_text)
            self.assertFalse(err["ok"])
            self.assertIn("unchanged", err["error"].lower())
            conn = sqlite3.connect(str(db))
            try:
                rows = {
                    (str(source), str(sid))
                    for source, sid in conn.execute(
                        "SELECT source_type, signal_id FROM packets"
                    )
                }
                n_j = conn.execute("SELECT COUNT(*) FROM judgments").fetchone()[0]
            finally:
                conn.close()
            self.assertEqual(rows, {("bookmark", "keep-bm"), ("corpus", "keep-co")})
            self.assertEqual(n_j, 1)


if __name__ == "__main__":
    unittest.main()
