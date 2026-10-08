from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from tests.helpers import ROOT

from fixtures.build_synthetic import write_scale_bookmark
from fixtures.tiny_png import PNG_1X1
from learning_engine.adapters import bookmark_review, corpus_reingest, youtube_l2
from learning_engine.validator import count_false_full_visual, validate_packets


class AdapterTest(unittest.TestCase):
    def test_bookmark_synthetic_example(self) -> None:
        packets = bookmark_review.convert(ROOT / "fixtures" / "bookmark_review")
        self.assertEqual(len(packets), 3)
        validate_packets(packets)
        by_id = {p["signal_id"]: p for p in packets}
        self.assertEqual(by_id["9000000000000000001"]["content_access"], "transcript")
        self.assertEqual(by_id["9000000000000000003"]["content_access"], "preview_only")
        self.assertEqual(by_id["9000000000000000001"]["scores"]["kw_category"], "harness")
        self.assertNotIn("kw_category", by_id["9000000000000000002"]["scores"])
        self.assertTrue(by_id["9000000000000000001"]["source_text"].startswith("Post shows"))
        self.assertNotIn("<<<INSTRUCTIONS>>>", by_id["9000000000000000001"]["source_text"])
        self.assertEqual(count_false_full_visual(packets), 0)

    def test_bookmark_missing_state_is_unknown_not_guessed(self) -> None:
        packets = bookmark_review.convert(ROOT / "fixtures" / "bookmark_review")
        mid = next(p for p in packets if p["signal_id"].endswith("0002"))
        self.assertEqual(mid["processing_status"], "unknown")

    def test_corpus_only_refs_files_on_disk(self) -> None:
        packets = corpus_reingest.convert(ROOT / "fixtures" / "corpus")
        self.assertGreaterEqual(len(packets), 2)
        validate_packets(packets)
        rich = next(p for p in packets if p["signal_id"].endswith("0010"))
        refs = [e["source_ref"] for e in rich["evidence"]]
        self.assertTrue(any("META.json" in r for r in refs))
        self.assertTrue(any("frame" in r or "still" in r for r in refs))
        failed = next(p for p in packets if p["signal_id"].endswith("0011"))
        self.assertEqual(failed["content_access"], "preview_only")
        self.assertEqual(failed["completeness"]["has_keyframes"], "unknown")
        self.assertEqual(count_false_full_visual(packets), 0)

    def test_youtube_parses_ae_table_and_frames(self) -> None:
        packets = youtube_l2.convert(ROOT / "fixtures" / "youtube_l2")
        self.assertEqual(len(packets), 2)
        validate_packets(packets)
        one = next(p for p in packets if p["signal_id"] == "SYNTHETIC01")
        self.assertIn("A", one["ae_status"])
        self.assertTrue(one["ae_status"]["A"]["status"].startswith("PASS"))
        self.assertTrue(any(e["kind"] == "frame" for e in one["evidence"]))
        two = next(p for p in packets if p["signal_id"] == "SYNTHETIC02")
        self.assertEqual(two["content_access"], "none")
        self.assertEqual(count_false_full_visual(packets), 0)

    def test_adapters_scale_to_fifty_synthetic(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            dest = Path(tmp)
            write_scale_bookmark(dest / "bookmarks", 54)
            bm = bookmark_review.convert(dest / "bookmarks")
            self.assertGreaterEqual(len(bm), 50)
            validate_packets(bm)
            self.assertEqual(count_false_full_visual(bm), 0)

            artifacts = dest / "corpus" / "artifacts"
            for i in range(1, 55):
                folder = artifacts / f"syn-co-{i:03d}"
                folder.mkdir(parents=True)
                (folder / "META.json").write_text(
                    json.dumps(
                        {
                            "id": f"syn-co-{i:03d}",
                            "url": f"https://example.com/c/{i}",
                            "status": "OK",
                            "completeness": {"has_transcript": True},
                        }
                    ),
                    encoding="utf-8",
                )
                (folder / "transcript.txt").write_text("synthetic transcript", encoding="utf-8")
                if i % 4 == 0:
                    (folder / "frame-t001.jpg").write_bytes(PNG_1X1)
            corpus = corpus_reingest.convert(dest / "corpus")
            self.assertGreaterEqual(len(corpus), 50)
            validate_packets(corpus)
            self.assertEqual(count_false_full_visual(corpus), 0)

            l2 = dest / "l2"
            for i in range(1, 55):
                folder = l2 / f"SYN{i:03d}"
                folder.mkdir(parents=True)
                (folder / "AE_STATUS.md").write_text(
                    f"# A–E status — yt:SYN{i:03d}\n\n"
                    "| Letter | Status | Artifact |\n|---|---|---|\n"
                    "| A Source understood | PASS | COVERAGE.md |\n"
                    "| B Evidence | PASS | frames |\n"
                    "| C Method | PASS | METHOD.md |\n"
                    "| D Recreation | PASS | RECREATION.md |\n"
                    "| E Knowledge usable | PASS | SKILL_DELTA |\n",
                    encoding="utf-8",
                )
                (folder / "frame-t001.jpg").write_bytes(PNG_1X1)
                (folder / "ocr-frames.txt").write_text("synthetic caption", encoding="utf-8")
            yt = youtube_l2.convert(l2)
            self.assertGreaterEqual(len(yt), 50)
            validate_packets(yt)
            self.assertEqual(count_false_full_visual(yt), 0)
