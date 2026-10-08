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
from learning_engine.adapters.common import (
    MIN_SPEECH_WORDS,
    SOURCE_TEXT_MAX_CHARS,
    ae_denies_transcript,
    clip_source_text,
    convert_summary,
    is_placeholder_transcript,
    is_substantive_speech,
    spoken_text,
)

SPEECH_PAD = (
    "The synthetic verifier runs in a fresh context and checks every "
    "step of the agent loop before anyone commits a change."
)
from learning_engine.cli import main as cli_main
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
        self.assertNotIn("# Transcript", pack["source_text"])
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
        self.assertNotIn("# Transcript", pack["source_text"])
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


class N1CaptionGapHonesty(unittest.TestCase):
    def test_caption_gap_placeholder_is_not_transcript_evidence(self) -> None:
        packets = corpus_reingest.convert(ROOT / "fixtures" / "corpus")
        pack = next(p for p in packets if p["signal_id"].endswith("0013"))
        validate_packets([pack])
        self.assertEqual(pack["source_text"], "")
        self.assertFalse(any(e["kind"] == "transcript" for e in pack["evidence"]))
        self.assertIn("CAPTION_GAP", pack.get("caption_gap", ""))
        self.assertIn("music-only", pack["caption_gap"])
        placeholder_refs = [
            e for e in pack["evidence"] if e.get("note") == "caption_gap_placeholder"
        ]
        self.assertTrue(placeholder_refs)
        self.assertTrue(
            any(e["source_ref"].upper().endswith("TRANSCRIPT.MD") for e in placeholder_refs)
        )
        self.assertEqual(pack["content_access"], "none")
        self.assertEqual(pack["scores"]["transcripts_usable"], 0)
        self.assertEqual(count_false_full_visual([pack]), 0)

    def test_meta_has_transcript_false_ignores_file_text(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp) / "gap"
            folder.mkdir()
            (folder / "META.json").write_text(
                json.dumps(
                    {
                        "id": "syn-gap-meta",
                        "url": "https://example.com/synthetic/gap-meta",
                        "status": "OK",
                        "classification": "CAPTION_GAP",
                        "transcript_chars": 0,
                        "completeness": {"has_transcript": False},
                    }
                ),
                encoding="utf-8",
            )
            (folder / "TRANSCRIPT.md").write_text(
                "# Transcript\n\nthis looks like speech but META said no\n",
                encoding="utf-8",
            )
            pack = corpus_reingest.convert(folder)[0]
            validate_packets([pack])
            self.assertEqual(pack["source_text"], "")
            self.assertFalse(any(e["kind"] == "transcript" for e in pack["evidence"]))
            self.assertTrue(pack.get("caption_gap"))
            self.assertNotIn("transcript_disagreement", pack)
            self.assertTrue(any(e["kind"] == "file" for e in pack["evidence"]))

    def test_heading_only_body_is_placeholder(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp) / "empty-body"
            folder.mkdir()
            (folder / "META.json").write_text(
                json.dumps(
                    {
                        "id": "syn-heading-only",
                        "url": "https://example.com/synthetic/heading-only",
                        "status": "OK",
                        "transcript_chars": 12,
                        "completeness": {"has_transcript": True},
                    }
                ),
                encoding="utf-8",
            )
            (folder / "TRANSCRIPT.md").write_text("# Transcript\n\n", encoding="utf-8")
            pack = corpus_reingest.convert(folder)[0]
            validate_packets([pack])
            self.assertEqual(pack["source_text"], "")
            self.assertFalse(any(e["kind"] == "transcript" for e in pack["evidence"]))
            self.assertTrue(is_placeholder_transcript("# Transcript\n\n"))

    def test_failed_caption_gap_meta_without_file_records_gap(self) -> None:
        packets = corpus_reingest.convert(ROOT / "fixtures" / "corpus")
        pack = next(p for p in packets if p["signal_id"].endswith("0011"))
        self.assertEqual(pack["source_text"], "")
        self.assertFalse(any(e["kind"] == "transcript" for e in pack["evidence"]))
        self.assertEqual(pack.get("caption_gap"), "CAPTION_GAP")


class D4LetterBullets(unittest.TestCase):
    def test_parses_letter_bullets_a_through_e(self) -> None:
        packets = youtube_l2.convert(ROOT / "fixtures" / "youtube_letters")
        self.assertEqual(len(packets), 1)
        pack = packets[0]
        validate_packets(packets)
        self.assertEqual(pack["signal_id"], "SYNTHETIC03")
        self.assertEqual(pack["scores"]["ae_letters_parsed"], 5)
        self.assertEqual(pack["ae_status"]["A"]["status"], "PASS")
        self.assertEqual(pack["ae_status"]["A"]["artifact"], "COVERAGE.md")
        self.assertEqual(pack["ae_status"]["B"]["status"], "PARTIAL")
        self.assertEqual(pack["ae_status"]["D"]["status"], "FAIL")
        self.assertEqual(pack["ae_status"]["E"]["status"], "PASS (file store)")
        self.assertEqual(pack["processing_status"], "partial")
        refs = [e["source_ref"] for e in pack["evidence"] if e["kind"] == "transcript"]
        self.assertTrue(any(r.endswith(".en.vtt") for r in refs))
        self.assertIn("spoken letter pack line", pack["source_text"])
        self.assertNotIn("WEBVTT", pack["source_text"])
        self.assertEqual(count_false_full_visual(packets), 0)

    def test_parse_ae_status_letter_form(self) -> None:
        parsed = youtube_l2.parse_ae_status(
            "- A PASS — COVERAGE.md\n- B PARTIAL — METHOD.md\n"
        )
        self.assertEqual(parsed["A"]["artifact"], "COVERAGE.md")
        self.assertEqual(parsed["B"]["status"], "PARTIAL")


class N2SpokenText(unittest.TestCase):
    def test_strips_markdown_heading_and_vtt_chrome(self) -> None:
        md = "# Transcript\n\nsynthetic spoken line\n"
        self.assertEqual(spoken_text(md), "synthetic spoken line")
        vtt = (
            "WEBVTT\n\n"
            "1\n"
            "00:00:00.000 --> 00:00:01.000\n"
            "hello from the cue\n"
        )
        self.assertEqual(spoken_text(vtt), "hello from the cue")
        self.assertNotIn("WEBVTT", spoken_text(vtt))
        self.assertNotIn("-->", spoken_text(vtt))

    def test_corpus_source_text_drops_heading(self) -> None:
        packets = corpus_reingest.convert(ROOT / "fixtures" / "corpus")
        pack = next(p for p in packets if p["signal_id"].endswith("0012"))
        self.assertTrue(pack["source_text"].startswith("synthetic uppercase"))
        self.assertNotIn("#", pack["source_text"])
        self.assertTrue(
            any(
                e["kind"] == "transcript"
                and e["source_ref"].upper().endswith("TRANSCRIPT.MD")
                for e in pack["evidence"]
            )
        )


class N3StrictOkFalse(unittest.TestCase):
    def test_convert_summary_strict_is_not_ok(self) -> None:
        report = {
            "packets": [{"signal_id": "ok"}],
            "invalid": [{"ref": "bad", "reason": "nope"}],
        }
        loose = convert_summary("bookmark_review", report)
        self.assertTrue(loose["ok"])
        strict = convert_summary("bookmark_review", report, strict=True)
        self.assertFalse(strict["ok"])

    def test_strict_cli_json_ok_false(self) -> None:
        mixed = ROOT / "fixtures" / "bookmark_mixed"
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp) / "out.jsonl"
            buf = io.StringIO()
            with mock.patch("sys.stdout", buf):
                rc = bookmark_review.main(
                    ["--input", str(mixed), "--output", str(out), "--strict"]
                )
            self.assertEqual(rc, 1)
            payload = json.loads(buf.getvalue())
            self.assertFalse(payload["ok"])
            self.assertEqual(payload["invalid"], 1)

            buf2 = io.StringIO()
            with mock.patch("sys.stdout", buf2):
                rc2 = cli_main(
                    [
                        "adapt",
                        "bookmark",
                        "--input",
                        str(mixed),
                        "--output",
                        str(Path(tmp) / "cli.jsonl"),
                        "--strict",
                    ]
                )
            self.assertEqual(rc2, 1)
            cli_payload = json.loads(buf2.getvalue())
            self.assertFalse(cli_payload["ok"])
            self.assertEqual(cli_payload["invalid"], 1)


class R3YoutubeCaptionGap(unittest.TestCase):
    def test_ae_transcript_source_caption_gap_is_authoritative(self) -> None:
        packets = youtube_l2.convert(ROOT / "fixtures" / "youtube_repass_gap")
        pack = next(p for p in packets if p["signal_id"] == "SYNTHETIC04")
        validate_packets([pack])
        self.assertEqual(pack["source_text"], "")
        self.assertFalse(any(e["kind"] == "transcript" for e in pack["evidence"]))
        self.assertTrue(pack.get("caption_gap"))
        self.assertIn("CAPTION_GAP", pack["caption_gap"].upper())
        self.assertTrue(
            any(
                e.get("note") == "caption_gap_placeholder"
                and e["source_ref"].upper().endswith("TRANSCRIPT.MD")
                for e in pack["evidence"]
            )
        )
        self.assertEqual(pack["scores"]["transcripts_usable"], 0)
        self.assertEqual(count_false_full_visual(packets), 0)

    def test_file_caption_gap_token_is_not_speech(self) -> None:
        packets = youtube_l2.convert(ROOT / "fixtures" / "youtube_repass_gap")
        pack = next(p for p in packets if p["signal_id"] == "SYNTHETIC05")
        validate_packets([pack])
        self.assertEqual(pack["source_text"], "")
        self.assertFalse(any(e["kind"] == "transcript" for e in pack["evidence"]))
        self.assertIn("CAPTION_GAP", pack.get("caption_gap", "").upper())
        self.assertFalse(is_placeholder_transcript("# Transcript\n\n" + SPEECH_PAD + "\n"))
        self.assertTrue(is_placeholder_transcript("Source: CAPTION_GAP\nyt-dlp: no subs\n"))
        self.assertGreaterEqual(MIN_SPEECH_WORDS, 20)

    def test_ae_gap_note_with_short_file_is_still_a_gap(self) -> None:
        parsed = youtube_l2.parse_ae_status(
            "- **status**: PARTIAL\n\n## Notes\n- transcript_source=CAPTION_GAP\n"
        )
        self.assertTrue(ae_denies_transcript(parsed))
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp) / "SYNTHGAP"
            folder.mkdir()
            (folder / "AE_STATUS.md").write_text(
                "# AE_STATUS — SYNTHGAP\n\n"
                "- **status**: PARTIAL\n\n"
                "## Notes\n- transcript_source=CAPTION_GAP\n",
                encoding="utf-8",
            )
            (folder / "TRANSCRIPT.md").write_text(
                "# Transcript\n\nthis looks like speech but is only eight words long\n",
                encoding="utf-8",
            )
            pack = youtube_l2.convert(folder)[0]
            validate_packets([pack])
            self.assertEqual(pack["source_text"], "")
            self.assertFalse(any(e["kind"] == "transcript" for e in pack["evidence"]))
            self.assertTrue(pack.get("caption_gap"))
            self.assertNotIn("transcript_disagreement", pack)

    def test_table_mention_of_caption_gap_is_not_pack_gap(self) -> None:
        packets = youtube_l2.convert(ROOT / "fixtures" / "youtube_l2")
        one = next(p for p in packets if p["signal_id"] == "SYNTHETIC01")
        self.assertFalse(ae_denies_transcript(one.get("ae_status") or {}))
        self.assertIn("burnt-in caption", one["source_text"])


class R3SpokenNoteNotDropped(unittest.TestCase):
    def test_spoken_region_and_note_lines_survive_markdown(self) -> None:
        md = "region, which was received\nNOTE to self: run the verifier\nstyle guide says keep this\n"
        spoken = spoken_text(md)
        self.assertIn("region, which was received", spoken)
        self.assertIn("NOTE to self: run the verifier", spoken)
        self.assertIn("style guide says keep this", spoken)

    def test_vtt_block_headers_only_are_stripped(self) -> None:
        vtt = (
            "WEBVTT\n\n"
            "NOTE this is a comment\n"
            "00:00:00.000 --> 00:00:01.000\n"
            "region, which was received\n"
        )
        spoken = spoken_text(vtt)
        self.assertIn("region, which was received", spoken)
        self.assertNotIn("this is a comment", spoken)
        block = "WEBVTT\n\nSTYLE\n::cue { color: red }\n\n00:00:00.000 --> 00:00:01.000\nhello\n"
        self.assertEqual(spoken_text(block), "hello")


class R3TimelineKeepsWords(unittest.TestCase):
    def test_timestamp_prefix_keeps_words_and_is_not_placeholder(self) -> None:
        raw = "00:00:01.000 --> 00:00:03.000 actual words\n[00:01] more words\n"
        self.assertEqual(spoken_text(raw), "actual words\nmore words")
        self.assertTrue(is_placeholder_transcript(raw))
        padded = raw + SPEECH_PAD + "\n"
        self.assertFalse(is_placeholder_transcript(padded))
        self.assertTrue(is_placeholder_transcript("00:00:01.000 --> 00:00:03.000\n# Transcript\n"))

    def test_captions_timeline_file_is_speech(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp) / "SYNTL"
            folder.mkdir()
            (folder / "AE_STATUS.md").write_text(
                "# AE_STATUS — SYNTL\n\n- **status**: PASS\n",
                encoding="utf-8",
            )
            (folder / "captions_timeline.txt").write_text(
                "00:00:01.000 --> 00:00:03.000 actual words on the timeline\n"
                "[00:01] second spoken line\n"
                f"{SPEECH_PAD}\n",
                encoding="utf-8",
            )
            pack = youtube_l2.convert(folder)[0]
            validate_packets([pack])
            self.assertIn("actual words on the timeline", pack["source_text"])
            self.assertIn("second spoken line", pack["source_text"])
            self.assertTrue(any(e["kind"] == "transcript" for e in pack["evidence"]))
            self.assertNotIn("caption_gap", pack)


class R3ProvenanceAndTags(unittest.TestCase):
    def test_strips_provenance_kind_language_and_inline_tags(self) -> None:
        raw = (
            "_source: whisper small_\n"
            "# Transcript\n"
            "<v Speaker>hello <c>from</c> the <00:00:01.234>cue</v>\n"
        )
        self.assertEqual(spoken_text(raw), "hello from the cue")
        vtt = (
            "WEBVTT\n"
            "Kind: captions\n"
            "Language: en\n\n"
            "1\n"
            "00:00:00.000 --> 00:00:01.000 align:start\n"
            "<v Speaker>tagged speech</v>\n"
        )
        self.assertEqual(spoken_text(vtt), "tagged speech")
        self.assertNotIn("Kind:", spoken_text(vtt))
        self.assertNotIn("Language:", spoken_text(vtt))

    def test_adapter_records_provenance_and_drops_it_from_source_text(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp) / "SYNPROV"
            folder.mkdir()
            (folder / "AE_STATUS.md").write_text(
                "# AE_STATUS — SYNPROV\n\n- **status**: PASS\n",
                encoding="utf-8",
            )
            (folder / "TRANSCRIPT.md").write_text(
                "_source: yt-dlp auto/subs (CAPTION_SOURCE)_\n"
                "# Transcript\n\n"
                f"spoken after provenance\n{SPEECH_PAD}\n",
                encoding="utf-8",
            )
            pack = youtube_l2.convert(folder)[0]
            validate_packets([pack])
            self.assertIn("spoken after provenance", pack["source_text"])
            self.assertIn("yt-dlp", pack["scores"].get("transcript_source", ""))
            self.assertNotIn("_source:", pack["source_text"])


class R3LetterParenthetical(unittest.TestCase):
    def test_letter_bullet_allows_parenthetical_after_status(self) -> None:
        parsed = youtube_l2.parse_ae_status(
            "- E PASS (file store) — SKILL_DELTA.md\n- A PASS — COVERAGE.md\n"
        )
        self.assertEqual(parsed["E"]["status"], "PASS (file store)")
        self.assertEqual(parsed["E"]["artifact"], "SKILL_DELTA.md")
        self.assertEqual(parsed["A"]["artifact"], "COVERAGE.md")


class B1RecoveredVttNotWiped(unittest.TestCase):
    def test_ae_caption_gap_mention_does_not_wipe_real_speech(self) -> None:
        packets = youtube_l2.convert(ROOT / "fixtures" / "youtube_repass_recovered")
        pack = next(p for p in packets if p["signal_id"] == "SYNTHETIC06")
        validate_packets([pack])
        kinds = [(e["kind"], e["source_ref"]) for e in pack["evidence"]]
        self.assertTrue(any(k == "transcript" and r.endswith("TRANSCRIPT.md") for k, r in kinds))
        self.assertTrue(any(k == "transcript" and r.endswith(".en.vtt") for k, r in kinds))
        self.assertTrue(pack["source_text"])
        self.assertIn("recovered speech", pack["source_text"])
        self.assertNotIn("caption_gap", pack)
        self.assertIn("transcript_disagreement", pack)
        self.assertTrue(any("CAPTION_GAP" in n for n in pack.get("notes", [])))
        self.assertEqual(count_false_full_visual(packets), 0)


class B2StillsCaptionsJson(unittest.TestCase):
    def test_stills_captions_with_gap_field_is_still_speech(self) -> None:
        lexicon = "alpha bravo charlie delta echo foxtrot golf hotel india juliet".split()
        words = [lexicon[i % len(lexicon)] for i in range(1000)]
        payload = {
            "note": "(CAPTION_GAP: timedtext 429)",
            "stills": [{"text": " ".join(words[i : i + 50])} for i in range(0, 1000, 50)],
        }
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp) / "SYNSTILLS"
            folder.mkdir()
            (folder / "AE_STATUS.md").write_text(
                "# AE_STATUS — SYNSTILLS\n\n- **status**: PASS\n",
                encoding="utf-8",
            )
            (folder / "stills_captions.json").write_text(json.dumps(payload), encoding="utf-8")
            pack = youtube_l2.convert(folder)[0]
            validate_packets([pack])
            self.assertTrue(any(e["kind"] == "transcript" for e in pack["evidence"]))
            self.assertGreaterEqual(len(pack["source_text"].split()), MIN_SPEECH_WORDS)
            self.assertNotIn("caption_gap", pack)
            self.assertIn("alpha", pack["source_text"])
            self.assertNotIn("CAPTION_GAP", pack["source_text"])
            self.assertTrue(is_substantive_speech(pack["source_text"]))


class B3WhisperNoise(unittest.TestCase):
    def test_you_you_vtt_is_not_transcript_evidence(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp) / "SYNNOISE"
            folder.mkdir()
            (folder / "AE_STATUS.md").write_text(
                "# AE_STATUS — SYNNOISE\n\n- **status**: PASS\n",
                encoding="utf-8",
            )
            (folder / "SYNNOISE.en.vtt").write_text(
                "WEBVTT\n\n1\n00:00:00.000 --> 00:00:01.000\nyou\n\n2\n00:00:01.000 --> 00:00:02.000\nyou\n",
                encoding="utf-8",
            )
            pack = youtube_l2.convert(folder)[0]
            validate_packets([pack])
            self.assertEqual(pack["source_text"], "")
            self.assertFalse(any(e["kind"] == "transcript" for e in pack["evidence"]))
            self.assertTrue(pack.get("caption_gap"))
            self.assertNotIn("transcript_disagreement", pack)


class M1OperatorLines(unittest.TestCase):
    def test_strips_leading_source_and_fetched_lines(self) -> None:
        raw = (
            "Source: youtube-auto-captions-vtt\n"
            "Fetched: 2026-09-29T09:00:00Z\n"
            f"{SPEECH_PAD}\n"
        )
        spoken = spoken_text(raw)
        self.assertNotIn("Source:", spoken)
        self.assertNotIn("Fetched:", spoken)
        self.assertIn("synthetic verifier", spoken)
        packets = youtube_l2.convert(ROOT / "fixtures" / "youtube_repass_recovered")
        pack = next(p for p in packets if p["signal_id"] == "SYNTHETIC06")
        self.assertNotIn("Source:", pack["source_text"])
        self.assertNotIn("Fetched:", pack["source_text"])


class ContentWinsDisagreement(unittest.TestCase):
    def test_meta_no_transcript_but_substantive_file_keeps_speech(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp) / "meta-disagree"
            folder.mkdir()
            (folder / "META.json").write_text(
                json.dumps(
                    {
                        "id": "syn-meta-disagree",
                        "url": "https://example.com/synthetic/meta-disagree",
                        "status": "OK",
                        "classification": "CAPTION_GAP",
                        "transcript_chars": 0,
                        "completeness": {"has_transcript": False},
                    }
                ),
                encoding="utf-8",
            )
            (folder / "TRANSCRIPT.md").write_text(
                f"# Transcript\n\n{SPEECH_PAD}\n",
                encoding="utf-8",
            )
            pack = corpus_reingest.convert(folder)[0]
            validate_packets([pack])
            self.assertIn("synthetic verifier", pack["source_text"])
            self.assertTrue(any(e["kind"] == "transcript" for e in pack["evidence"]))
            self.assertNotIn("caption_gap", pack)
            self.assertIn("transcript_disagreement", pack)
