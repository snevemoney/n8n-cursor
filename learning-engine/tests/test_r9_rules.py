"""Locked regressions for R9 N8 rules. Do not loosen."""

from __future__ import annotations

import hashlib
import io
import json
import sqlite3
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from tests.helpers import ROOT

from learning_engine.adapters import youtube_l2
from learning_engine.adapters.common import is_ocr_file, spoken_text
from learning_engine.cli import main as cli_main
from learning_engine.io_util import write_jsonl
from learning_engine.packet import base_packet, evidence_item
from learning_engine.stage_c.harness import run_eval
from learning_engine.stage_c.providers.lexicon import LexiconProvider
from learning_engine.storage.sqlite_index import (
    LEGACY_MIGRATED_RUN_ID,
    connect,
    index_packets,
)
from learning_engine.validator import validate_packets


# Exact R6 SCHEMA from learning-engine/learning_engine/storage/sqlite_index.py @ 41f30292
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
CREATE INDEX IF NOT EXISTS idx_judgments_signal ON judgments(signal_id);
CREATE INDEX IF NOT EXISTS idx_packets_source ON packets(source_type);
"""

ROLLING_VTT = """WEBVTT

1
00:00:00.000 --> 00:00:01.500
alpha line one

2
00:00:00.800 --> 00:00:02.500
alpha line one
bravo line two

3
00:00:01.500 --> 00:00:03.200
alpha line one
bravo line two

4
00:00:02.400 --> 00:00:04.000
bravo line two <00:00:02.800><c> charlie line three</c>

5
00:00:03.200 --> 00:00:05.000
charlie line three
"""

WIN1_TEXT = "alpha alpha alpha alpha alpha beta gamma\n"
WIN5_TEXT = (
    "alpha bravo charlie delta echo foxtrot golf hotel india juliet "
    "kilo lima mike november oscar papa\n"
)
MD_SPEECH = "curated transcript spoken words from the markdown file here\n"
SHORT_VTT = """WEBVTT

00:00:00.000 --> 00:00:01.000
one two three
"""
LONG_MD = (
    "alpha bravo charlie delta echo foxtrot golf hotel india juliet "
    "kilo lima mike november oscar papa quebec romeo sierra tango "
    "uniform victor whiskey xray yankee zulu extra words stay here\n"
)


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


def _write_youtube(folder: Path, *, files: dict[str, str], ae: str | None = None) -> None:
    folder.mkdir(parents=True, exist_ok=True)
    (folder / "AE_STATUS.md").write_text(
        ae or f"# AE_STATUS — {folder.name}\n\n- **status**: PASS\n",
        encoding="utf-8",
    )
    for name, body in files.items():
        dest = folder / name
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(body, encoding="utf-8")


def _file_sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


class N81TranscriptMdBeatsVtt(unittest.TestCase):
    def test_transcript_md_plus_vtt_md_wins_and_records_disagreement(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp) / "MDVTT"
            _write_youtube(
                folder,
                files={
                    "TRANSCRIPT.md": MD_SPEECH,
                    "MDVTT.en.vtt": (
                        "WEBVTT\n\n00:00:00.000 --> 00:00:04.000\n"
                        "zeta spoken caption line from the vtt stand-in here\n"
                    ),
                },
            )
            pack = youtube_l2.convert(folder)[0]
            validate_packets([pack])
            self.assertEqual(Path(pack["preferred_source"]).name, "TRANSCRIPT.md")
            self.assertIn("curated transcript spoken words", pack["source_text"])
            self.assertNotIn("zeta spoken caption", pack["source_text"])
            self.assertIn("transcript_disagreement", pack)
            refs = pack["scores"]["disagreement_refs"]
            self.assertTrue(refs)
            self.assertEqual(refs[0], pack["preferred_source"])

    def test_short_vtt_does_not_beat_long_transcript_md(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp) / "SHORTV"
            _write_youtube(
                folder,
                files={"TRANSCRIPT.md": LONG_MD, "SHORTV.en.vtt": SHORT_VTT},
            )
            pack = youtube_l2.convert(folder)[0]
            validate_packets([pack])
            self.assertEqual(Path(pack["preferred_source"]).name, "TRANSCRIPT.md")
            self.assertIn("alpha bravo charlie", pack["source_text"])
            self.assertGreaterEqual(len(pack["source_text"].split()), 5)
            self.assertNotEqual(pack.get("transcript_quality"), "short")


class N81RollingCaptionDedupe(unittest.TestCase):
    def test_rolling_vtt_emits_each_line_once_in_order(self) -> None:
        text = spoken_text(ROLLING_VTT)
        lines = [line for line in text.split("\n") if line.strip()]
        self.assertEqual(lines, ["alpha line one", "bravo line two", "charlie line three"])
        for left, right in zip(lines, lines[1:]):
            self.assertNotEqual(left, right)
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp) / "ROLL"
            _write_youtube(folder, files={"ROLL.en.vtt": ROLLING_VTT})
            pack = youtube_l2.convert(folder)[0]
            validate_packets([pack])
            spoken = [line for line in pack["source_text"].split("\n") if line.strip()]
            self.assertEqual(spoken, ["alpha line one", "bravo line two", "charlie line three"])


class N81WindowDistinctTokens(unittest.TestCase):
    def test_win5_beats_win1_by_distinct_tokens(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp) / "WINS"
            _write_youtube(
                folder,
                files={
                    "clip.win1.vtt": "WEBVTT\n\n00:00:00.000 --> 00:00:02.000\n" + WIN1_TEXT,
                    "clip.win5.vtt": "WEBVTT\n\n00:00:00.000 --> 00:00:02.000\n" + WIN5_TEXT,
                },
            )
            pack = youtube_l2.convert(folder)[0]
            validate_packets([pack])
            self.assertEqual(Path(pack["preferred_source"]).name, "clip.win5.vtt")
            self.assertIn("foxtrot", pack["source_text"])
            self.assertNotIn("gamma", pack["source_text"])


class N82OcrTokenNotSubstring(unittest.TestCase):
    def test_video_id_with_ocr_letters_is_speech(self) -> None:
        self.assertFalse(is_ocr_file(Path("synthOCrVideo01.en.vtt")))
        self.assertTrue(is_ocr_file(Path("ocr-frames.txt")))
        self.assertTrue(is_ocr_file(Path("frames_ocr.txt")))
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp) / "OCRid"
            _write_youtube(
                folder,
                files={
                    "synthOCrVideo01.en.vtt": (
                        "WEBVTT\n\n00:00:00.000 --> 00:00:03.000\n"
                        "spoken words from the synthetic caption file here\n"
                    )
                },
            )
            pack = youtube_l2.convert(folder)[0]
            validate_packets([pack])
            self.assertTrue(any(e["kind"] == "transcript" for e in pack["evidence"]))
            self.assertFalse(any(e.get("note") == "ocr" for e in pack["evidence"]))
            self.assertIn("spoken words from the synthetic", pack["source_text"])
            self.assertNotIn("caption_gap", pack)
            derived = pack.get("derived") or {}
            self.assertFalse(derived.get("ocr_text"))


class N83R6Migration(unittest.TestCase):
    def _build_r6(self, db: Path) -> None:
        conn = sqlite3.connect(str(db))
        conn.executescript(R6_SCHEMA)
        for i in range(10):
            sid = f"legacy-{i:02d}"
            source = "bookmark" if i < 7 else "youtube_l2"
            body = json.dumps({"signal_id": sid, "source_type": source})
            conn.execute(
                """
                INSERT INTO packets (
                    signal_id, source_type, content_access, analysis_scope,
                    verification_state, processing_status, lifecycle_state,
                    source_url, adapter, body_json
                ) VALUES (?, ?, 'transcript', 'transcript', 'unknown', 'ok',
                          'analyzed', NULL, 'bookmark_review', ?)
                """,
                (sid, source, body),
            )
        conn.execute(
            """
            INSERT INTO judgments (signal_id, provider, flagged, label, latency_ms, cost_usd, body_json)
            VALUES ('legacy-00', 'keyword_replay', 1, 'flag', 1.5, 0.0, '{}')
            """
        )
        conn.commit()
        conn.close()

    def test_r6_ten_packets_one_judgment_then_store_eval(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            db = Path(tmp) / "r6.sqlite"
            self._build_r6(db)
            opened = connect(db)
            n_p = opened.execute("select count(*) from packets").fetchone()[0]
            rows = opened.execute(
                "select run_id, count(*) from judgments group by run_id"
            ).fetchall()
            pk = [
                str(row[1])
                for row in opened.execute("PRAGMA table_info(packets)")
                if row[5]
            ]
            opened.close()
            self.assertEqual(n_p, 10)
            self.assertEqual(rows, [(LEGACY_MIGRATED_RUN_ID, 1)])
            self.assertEqual(pk, ["source_type", "signal_id"])
            extra = [_ok(signal_id="after-migrate", source_type="bookmark")]
            self.assertEqual(index_packets(db, extra), 1)
            jsonl = Path(tmp) / "more.jsonl"
            write_jsonl(jsonl, extra)
            self.assertEqual(cli_main(["store", "--packets", str(jsonl), "--sqlite", str(db)]), 0)
            result = run_eval(
                LexiconProvider(),
                [{"packet": extra[0], "signal_id": extra[0]["signal_id"]}],
            )
            self.assertIn("all", result["report"])
            self.assertNotEqual(result["report"].get("status"), "error")

    def test_mid_migration_failure_leaves_db_byte_identical(self) -> None:
        import learning_engine.storage.sqlite_index as idx

        with tempfile.TemporaryDirectory() as tmp:
            db = Path(tmp) / "r6-fail.sqlite"
            self._build_r6(db)
            before = db.read_bytes()
            digest = _file_sha(db)
            jsonl = Path(tmp) / "p.jsonl"
            write_jsonl(jsonl, [_ok()])
            idx.FAIL_MIGRATION_AFTER = "after_packets_copy"
            try:
                stderr = io.StringIO()
                with mock.patch("sys.stderr", stderr):
                    rc = cli_main(["store", "--packets", str(jsonl), "--sqlite", str(db)])
            finally:
                idx.FAIL_MIGRATION_AFTER = None
            self.assertNotEqual(rc, 0)
            self.assertEqual(db.read_bytes(), before)
            self.assertEqual(_file_sha(db), digest)
            err = json.loads(stderr.getvalue())
            self.assertFalse(err["ok"])
            self.assertIn("unchanged", err["error"].lower())
            conn = sqlite3.connect(str(db))
            names = {
                str(row[0])
                for row in conn.execute("SELECT name FROM sqlite_master WHERE type='table'")
            }
            pk = [
                str(row[1]) for row in conn.execute("PRAGMA table_info(packets)") if row[5]
            ]
            jcols = {str(row[1]) for row in conn.execute("PRAGMA table_info(judgments)")}
            n_p = conn.execute("select count(*) from packets").fetchone()[0]
            n_j = conn.execute("select count(*) from judgments").fetchone()[0]
            conn.close()
            self.assertNotIn("packets_legacy", names)
            self.assertEqual(pk, ["signal_id"])
            self.assertNotIn("run_id", jcols)
            self.assertEqual(n_p, 10)
            self.assertEqual(n_j, 1)


class N85DisagreementRefsRelative(unittest.TestCase):
    def test_refs_are_packet_relative_preferred_first(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp) / "NEST"
            _write_youtube(
                folder,
                files={
                    "TRANSCRIPT.md": MD_SPEECH,
                    "clips/captions_clean.txt": "zeta spoken caption line from the nested file\n",
                },
            )
            pack = youtube_l2.convert(folder)[0]
            validate_packets([pack])
            self.assertIn("transcript_disagreement", pack)
            refs = pack["scores"]["disagreement_refs"]
            self.assertTrue(refs)
            self.assertEqual(refs[0], pack["preferred_source"])
            self.assertEqual(Path(refs[0]).name, "TRANSCRIPT.md")
            self.assertIn("clips/captions_clean.txt", refs)
            self.assertFalse(any(item == "captions_clean.txt" for item in refs))
