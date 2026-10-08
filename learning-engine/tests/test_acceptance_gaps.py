"""Synthetic coverage for operator-box defects D1–D7."""

from __future__ import annotations

import io
import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from tests.helpers import ROOT

from fixtures.tiny_png import PNG_1X1
from learning_engine.adapters import bookmark_review, corpus_reingest, youtube_l2
from learning_engine.adapters.common import SOURCE_TEXT_MAX_CHARS, clip_source_text
from learning_engine.errors import ProviderRefused
from learning_engine.network import require_live_call
from learning_engine.stage_c.harness import main as harness_main
from learning_engine.stage_c.providers.jev import JevOpenRouterProvider
from learning_engine.validator import count_false_full_visual, validate_packets


class D1TranscriptDiscovery(unittest.TestCase):
    def test_corpus_reads_uppercase_transcript_md_and_puts_text_in_source(self) -> None:
        packets = corpus_reingest.convert(ROOT / "fixtures" / "corpus")
        pack = next(p for p in packets if p["signal_id"].endswith("0012"))
        refs = [e["source_ref"] for e in pack["evidence"] if e["kind"] == "transcript"]
        self.assertTrue(any(r.upper().endswith("TRANSCRIPT.MD") or r.endswith("TRANSCRIPT.md") for r in refs))
        self.assertIn("uppercase transcript", pack["source_text"])
        self.assertGreater(pack["scores"]["source_text_chars"], 0)
        self.assertFalse(pack["scores"]["source_text_truncated"])
        self.assertEqual(count_false_full_visual([pack]), 0)

    def test_source_text_truncation_records_length(self) -> None:
        text, n, truncated = clip_source_text("x" * (SOURCE_TEXT_MAX_CHARS + 5))
        self.assertTrue(truncated)
        self.assertEqual(n, SOURCE_TEXT_MAX_CHARS + 5)
        self.assertEqual(len(text), SOURCE_TEXT_MAX_CHARS)


class D2RawMedia(unittest.TestCase):
    def test_corpus_cites_files_under_raw(self) -> None:
        packets = corpus_reingest.convert(ROOT / "fixtures" / "corpus")
        pack = next(p for p in packets if p["signal_id"].endswith("0012"))
        refs = [e["source_ref"] for e in pack["evidence"]]
        self.assertTrue(any("raw/" in r and r.endswith(".mp4") for r in refs))
        self.assertTrue(any("raw/" in r and r.endswith(".info.json") for r in refs))
        self.assertTrue(any("raw/" in r and r.endswith(".txt") for r in refs))


class D3AnyLocalVideo(unittest.TestCase):
    def test_youtube_full_visual_accepts_source_vid_mp4(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp) / "SYNVID"
            folder.mkdir()
            (folder / "AE_STATUS.md").write_text(
                "# A–E status — yt:SYNVID\n\n"
                "| Letter | Status | Artifact |\n|---|---|---|\n"
                "| A Source understood | PASS | COVERAGE.md |\n",
                encoding="utf-8",
            )
            (folder / "frame-t001.jpg").write_bytes(PNG_1X1)
            (folder / "source_vid.mp4").write_bytes(b"synthetic-not-a-video")
            (folder / "captions.json").write_text('{"text": "synthetic caption"}', encoding="utf-8")
            pack = youtube_l2.convert(folder)[0]
            self.assertEqual(pack["content_access"], "full_visual")
            self.assertTrue(any(e["kind"] == "frame" for e in pack["evidence"]))
            self.assertTrue(any(e["source_ref"].endswith("source_vid.mp4") for e in pack["evidence"]))
            validate_packets([pack])
            self.assertEqual(count_false_full_visual([pack]), 0)

    def test_youtube_frames_without_video_are_not_full_visual(self) -> None:
        packets = youtube_l2.convert(ROOT / "fixtures" / "youtube_l2")
        one = next(p for p in packets if p["signal_id"] == "SYNTHETIC01")
        self.assertTrue(any(e["kind"] == "frame" for e in one["evidence"]))
        self.assertEqual(one["content_access"], "frames")


class D4BulletAeStatus(unittest.TestCase):
    def test_parses_repass_bullet_list_and_vtt_captions(self) -> None:
        packets = youtube_l2.convert(ROOT / "fixtures" / "youtube_repass")
        self.assertEqual(len(packets), 1)
        pack = packets[0]
        validate_packets(packets)
        self.assertEqual(pack["signal_id"], "SYNTHETIC01")
        self.assertEqual(pack["ae_status"]["overall"]["status"], "PARTIAL")
        self.assertIn("BATCH12", pack["ae_status"]["overall"]["batch"])
        self.assertTrue(str(pack["ae_status"].get("transcript_source", "")).startswith("vtt"))
        refs = [e["source_ref"] for e in pack["evidence"]]
        self.assertTrue(any(r.endswith("TRANSCRIPT.md") for r in refs))
        self.assertTrue(any(r.endswith(".en-orig.vtt") for r in refs))
        self.assertTrue(any(r.endswith("captions_clean.txt") for r in refs))
        self.assertIn("repass transcript", pack["source_text"])
        self.assertEqual(pack["processing_status"], "partial")
        self.assertEqual(pack["content_access"], "frames")
        self.assertEqual(count_false_full_visual(packets), 0)


class D5HarnessRefusal(unittest.TestCase):
    def test_opt_in_without_key_exits_2_with_json(self) -> None:
        env = {k: v for k, v in os.environ.items() if k != "OPENROUTER_API_KEY"}
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp) / "report.json"
            stderr = io.StringIO()
            with mock.patch.dict(os.environ, env, clear=True):
                os.environ.pop("OPENROUTER_API_KEY", None)
                with mock.patch("sys.stderr", stderr):
                    rc = harness_main(
                        [
                            "--provider",
                            "jev",
                            "--opt-in-live",
                            "--review",
                            str(ROOT / "fixtures" / "keyword_replay" / "REVIEW.csv"),
                            "--output",
                            str(out),
                        ]
                    )
            self.assertEqual(rc, 2)
            payload = json.loads(stderr.getvalue())
            self.assertFalse(payload["ok"])
            self.assertIn("OPENROUTER_API_KEY", payload["error"])
            self.assertFalse(out.exists())


class D6NetworkGate(unittest.TestCase):
    def test_env_opt_in_is_not_a_bypass(self) -> None:
        env = {
            **os.environ,
            "LEARNING_ENGINE_OPT_IN_LIVE": "1",
            "LEARNING_ENGINE_ALLOW_NETWORK": "1",
            "OPENROUTER_API_KEY": "should-not-be-used",
        }
        with mock.patch.dict(os.environ, env, clear=True):
            with self.assertRaises(ProviderRefused) as ctx:
                require_live_call(flag=False, env_var="OPENROUTER_API_KEY")
            self.assertIn("opt-in-live", str(ctx.exception))
            with self.assertRaises(ProviderRefused):
                JevOpenRouterProvider(opt_in_live=False).evaluate(
                    {
                        "signal_id": "x",
                        "source_text": "hi",
                    }
                )


class D7CollectInvalid(unittest.TestCase):
    def test_default_skips_invalid_and_strict_stops(self) -> None:
        mixed = ROOT / "fixtures" / "bookmark_mixed"
        report = bookmark_review.convert_report(mixed, strict=False)
        ids = [p["signal_id"] for p in report["packets"]]
        self.assertEqual(ids, ["syn-ok-1", "syn-ok-2"])
        self.assertEqual(len(report["invalid"]), 1)
        self.assertIn("syn-bad-1", report["invalid"][0]["ref"])
        self.assertIn("instruction", report["invalid"][0]["reason"].lower())
        validate_packets(report["packets"])

        strict = bookmark_review.convert_report(mixed, strict=True)
        self.assertEqual([p["signal_id"] for p in strict["packets"]], ["syn-ok-1"])
        self.assertEqual(len(strict["invalid"]), 1)
