from __future__ import annotations

import json
import sqlite3
import tempfile
import unittest
from pathlib import Path

from tests.helpers import ROOT

from learning_engine.cli import main as cli_main
from learning_engine.io_util import read_jsonl
from learning_engine.stage_c.harness import main as harness_main
from learning_engine.stage_c.providers.lexicon import LexiconProvider
from learning_engine.storage.sqlite_index import index_packets


class StorageHarnessTest(unittest.TestCase):
    def test_sqlite_index_round_trip(self) -> None:
        packets = list(read_jsonl(ROOT / "fixtures" / "packets" / "fifty_valid.jsonl"))
        with tempfile.TemporaryDirectory() as tmp:
            db = Path(tmp) / "index.sqlite"
            n = index_packets(db, packets)
            self.assertEqual(n, len(packets))
            conn = sqlite3.connect(str(db))
            count = conn.execute("select count(*) from packets").fetchone()[0]
            conn.close()
            self.assertEqual(count, len(packets))

    def test_cli_adapt_validate_store(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp) / "bm.jsonl"
            report = Path(tmp) / "val.json"
            db = Path(tmp) / "idx.sqlite"
            self.assertEqual(
                cli_main(
                    [
                        "adapt",
                        "bookmark",
                        "--input",
                        str(ROOT / "fixtures" / "bookmark_review"),
                        "--output",
                        str(out),
                    ]
                ),
                0,
            )
            self.assertEqual(
                cli_main(
                    [
                        "validate",
                        "--input",
                        str(out),
                        "--output",
                        str(report),
                        "--min-packets",
                        "3",
                    ]
                ),
                0,
            )
            self.assertEqual(cli_main(["store", "--packets", str(out), "--sqlite", str(db)]), 0)
            payload = json.loads(report.read_text())
            self.assertEqual(payload["false_full_visual"], 0)
            self.assertGreaterEqual(payload["valid"], 3)

    def test_harness_keyword_cli(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp) / "report.json"
            rc = harness_main(
                [
                    "--provider",
                    "keyword",
                    "--mode",
                    "replay",
                    "--review",
                    str(ROOT / "fixtures" / "keyword_replay" / "REVIEW.csv"),
                    "--state",
                    str(ROOT / "fixtures" / "keyword_replay" / "STATE.jsonl"),
                    "--output",
                    str(out),
                ]
            )
            self.assertEqual(rc, 0)
            report = json.loads(out.read_text())
            self.assertEqual(report["provider"], "keyword_replay")
            self.assertIn("all", report)
            self.assertIn("done_only", report)
            self.assertIn("latency_ms_mean", report["all"])
            self.assertEqual(report["all"]["cost_usd_mean"], 0.0)

    def test_lexicon_flags_builder_text(self) -> None:
        from learning_engine.packet import base_packet, evidence_item

        useful = base_packet(
            signal_id="a",
            source_type="bookmark",
            content_access="transcript",
            analysis_scope="transcript",
            source_text="Agent loop with a verifier harness",
            evidence=[evidence_item(kind="field", source_ref="REVIEW.csv:gist")],
            verification_state="unknown",
            processing_status="ok",
            lifecycle_state="analyzed",
        )
        noise = dict(useful)
        noise["signal_id"] = "b"
        noise["source_text"] = "List entry: a TV series recommendation"
        self.assertTrue(LexiconProvider().evaluate(useful).flagged)
        self.assertFalse(LexiconProvider().evaluate(noise).flagged)
