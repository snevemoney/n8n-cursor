"""Locked regressions for R10 N9 rules. Do not loosen."""

from __future__ import annotations

import hashlib
import io
import json
import sqlite3
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from learning_engine.adapters import youtube_l2
from learning_engine.io_util import write_jsonl
from learning_engine.packet import base_packet, evidence_item
from learning_engine.stage_c.harness import main as harness_main
from learning_engine.storage.sqlite_index import connect
from learning_engine.validator import validate_packets


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


def _build_r6_packets(conn: sqlite3.Connection, ids: list[str]) -> None:
    for sid in ids:
        conn.execute(
            """
            INSERT INTO packets (
                signal_id, source_type, content_access, analysis_scope,
                verification_state, processing_status, lifecycle_state,
                source_url, adapter, body_json
            ) VALUES (?, 'bookmark', 'transcript', 'transcript', 'unknown', 'ok',
                      'analyzed', NULL, 'bookmark_review', ?)
            """,
            (sid, json.dumps({"signal_id": sid, "source_type": "bookmark"})),
        )


class N91LegacyJudgmentsNotOverwritten(unittest.TestCase):
    def test_two_r6_runs_same_provider_keep_six_judgments(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            db = Path(tmp) / "r6-dup.sqlite"
            conn = sqlite3.connect(str(db))
            conn.executescript(R6_SCHEMA)
            ids = ["p-a", "p-b", "p-c"]
            _build_r6_packets(conn, ids)
            for batch in (1, 2):
                for sid in ids:
                    conn.execute(
                        """
                        INSERT INTO judgments (
                            signal_id, provider, flagged, label, latency_ms, cost_usd, body_json
                        ) VALUES (?, 'keyword_replay', ?, ?, 1.0, 0.0, ?)
                        """,
                        (sid, batch, f"run-{batch}", json.dumps({"batch": batch, "id": sid})),
                    )
            conn.commit()
            before_n = conn.execute("select count(*) from judgments").fetchone()[0]
            conn.close()
            self.assertEqual(before_n, 6)
            opened = connect(db)
            n_j = opened.execute("select count(*) from judgments").fetchone()[0]
            keys = opened.execute(
                "select run_id, source_type, signal_id, provider from judgments"
            ).fetchall()
            opened.close()
            self.assertEqual(n_j, 6)
            self.assertEqual(len(set(keys)), 6)


class N93EvalSqliteMigrationError(unittest.TestCase):
    def test_eval_sqlite_migration_failure_json_exit_db_unchanged(self) -> None:
        import learning_engine.storage.sqlite_index as idx

        with tempfile.TemporaryDirectory() as tmp:
            db = Path(tmp) / "r6-eval.sqlite"
            conn = sqlite3.connect(str(db))
            conn.executescript(R6_SCHEMA)
            _build_r6_packets(conn, ["legacy-00"])
            conn.execute(
                """
                INSERT INTO judgments (signal_id, provider, flagged, label, latency_ms, cost_usd, body_json)
                VALUES ('legacy-00', 'keyword_replay', 1, 'flag', 1.5, 0.0, '{}')
                """
            )
            conn.commit()
            conn.close()
            before = db.read_bytes()
            digest = _file_sha(db)
            packets = Path(tmp) / "p.jsonl"
            out = Path(tmp) / "report.json"
            write_jsonl(packets, [_ok()])
            idx.FAIL_MIGRATION_AFTER = "after_packets_copy"
            try:
                stderr = io.StringIO()
                with mock.patch("sys.stderr", stderr):
                    rc = harness_main(
                        [
                            "--provider",
                            "lexicon",
                            "--packets",
                            str(packets),
                            "--output",
                            str(out),
                            "--sqlite",
                            str(db),
                        ]
                    )
            finally:
                idx.FAIL_MIGRATION_AFTER = None
            self.assertNotEqual(rc, 0)
            self.assertEqual(db.read_bytes(), before)
            self.assertEqual(_file_sha(db), digest)
            err = json.loads(stderr.getvalue())
            self.assertFalse(err["ok"])
            self.assertIn("error", err)
            self.assertIn("unchanged", err["error"].lower())


class N95SubsetIsNotDisagreement(unittest.TestCase):
    def test_subset_caption_is_not_flagged(self) -> None:
        md = (
            "alpha bravo charlie delta echo foxtrot golf hotel india juliet "
            "kilo lima mike november oscar\n"
        )
        vtt = (
            "WEBVTT\n\n00:00:00.000 --> 00:00:03.000\n"
            "alpha bravo charlie delta echo\n"
        )
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp) / "SUBSET"
            _write_youtube(folder, files={"TRANSCRIPT.md": md, "SUBSET.en.vtt": vtt})
            pack = youtube_l2.convert(folder)[0]
            validate_packets([pack])
            self.assertEqual(Path(pack["preferred_source"]).name, "TRANSCRIPT.md")
            self.assertNotIn("transcript_disagreement", pack)

    def test_material_difference_flags_preferred_first(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp) / "DIFF"
            _write_youtube(
                folder,
                files={
                    "TRANSCRIPT.md": "curated transcript spoken words from the markdown file here\n",
                    "DIFF.en.vtt": (
                        "WEBVTT\n\n00:00:00.000 --> 00:00:04.000\n"
                        "zeta spoken caption line from the vtt stand-in here\n"
                    ),
                },
            )
            pack = youtube_l2.convert(folder)[0]
            validate_packets([pack])
            self.assertIn("transcript_disagreement", pack)
            refs = pack["scores"]["disagreement_refs"]
            self.assertTrue(refs)
            self.assertEqual(refs[0], pack["preferred_source"])
            self.assertEqual(Path(refs[0]).name, "TRANSCRIPT.md")
