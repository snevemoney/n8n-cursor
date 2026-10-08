"""Locked regressions for R8 N7 rules. Do not loosen."""

from __future__ import annotations

import json
import re
import sqlite3
import tempfile
import unittest
from pathlib import Path

from tests.helpers import ROOT

from fixtures.tiny_png import PNG_1X1
from learning_engine.adapters import bookmark_review, youtube_l2
from learning_engine.adapters.common import is_ocr_file
from learning_engine.cli import main as cli_main
from learning_engine.constants import DISK_CHECK_SKIPPED, SOURCE_TEXT_UNAVAILABLE, SYNTHETIC_YOUTUBE_IDS
from learning_engine.errors import IndexSchemaError
from learning_engine.io_util import write_jsonl
from learning_engine.packet import base_packet, evidence_item
from learning_engine.stage_c.harness import run_eval
from learning_engine.stage_c.labelled import labelled_to_packet, load_labelled
from learning_engine.stage_c.providers.keyword import KeywordRulesProvider
from learning_engine.stage_c.providers.lexicon import LexiconProvider
from learning_engine.storage.sqlite_index import (
    connect,
    index_judgments,
    index_packets,
    packet_counts_by_source_type,
    rebuild_from_jsonl,
)
from learning_engine.validator import count_false_full_visual, validate_packet, validate_packets


_YT_CLS = "A-Z" + "a-z" + "0-9" + "_-"
YT_ID_SHAPED = re.compile(rf"(?<![{_YT_CLS}])[{_YT_CLS}]{{11}}(?![{_YT_CLS}])")
PATH_ALLOW = frozenset({"l2-20260927"})


def _ok(**overrides):
    packet = base_packet(
        signal_id="syn-ok",
        source_type="bookmark",
        content_access="transcript",
        analysis_scope="transcript",
        source_text="Post shows an agent loop",
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


class R8N71GapNoteNeverSpeech(unittest.TestCase):
    def test_repass_gap_template_is_not_speech(self) -> None:
        template = (
            "Source: CAPTION_GAP\n"
            "| check | status |\n"
            "|---|---|\n"
            "| [ ] captions | missing |\n"
            "- [ ] recover timedtext\n"
            "https://example.com/watch?v=synthleak\n"
            "@operator_handle\n"
            "this leftover operator paragraph has enough tokens to look like speech\n"
        )
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp) / "SYNTHGAP7"
            _write_youtube(folder, files={"TRANSCRIPT.md": template})
            pack = youtube_l2.convert(folder)[0]
            validate_packets([pack])
            self.assertEqual(pack["source_text"], "")
            self.assertTrue(pack.get("caption_gap"))
            self.assertTrue(any(e.get("note") == "gap_note" for e in pack["evidence"]))
            self.assertNotIn("example.com", pack["source_text"])
            self.assertNotIn("@operator_handle", pack["source_text"])
            self.assertEqual(pack.get("transcript_quality"), "gap_note_with_content")

    def test_caption_gap_plus_three_tokens_is_not_speech(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp) / "SHORTGAP"
            _write_youtube(
                folder,
                files={"TRANSCRIPT.md": "CAPTION_GAP\nonly three tokens\n"},
            )
            pack = youtube_l2.convert(folder)[0]
            validate_packets([pack])
            self.assertEqual(pack["source_text"], "")
            self.assertTrue(pack.get("caption_gap"))
            self.assertFalse(any(e["kind"] == "transcript" for e in pack["evidence"]))
            self.assertNotEqual(pack.get("transcript_quality"), "gap_note_with_content")


class R8N72OcrNotSpeech(unittest.TestCase):
    def test_ocr_only_pack_is_gap(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp) / "OCRONLY"
            _write_youtube(
                folder,
                files={
                    "ocr-frames.txt": (
                        "visual text painted on the stills of this tape "
                        "with more than five tokens here"
                    )
                },
            )
            pack = youtube_l2.convert(folder)[0]
            validate_packets([pack])
            self.assertEqual(pack["source_text"], "")
            self.assertTrue(pack.get("caption_gap"))
            self.assertTrue(any(e.get("note") == "ocr" for e in pack["evidence"]))
            self.assertIn("visual text painted", pack["derived"]["ocr_text"])
            self.assertFalse(any(e["kind"] == "transcript" for e in pack["evidence"]))

    def test_ocr_plus_burnin_uses_burnin_only(self) -> None:
        lines = [
            "first invented caption line from the burn-in file",
            "second invented caption line from the burn-in file",
        ]
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp) / "OCRBURN"
            _write_youtube(
                folder,
                files={
                    "ocr-frames.txt": "ocr leftover that is much longer than the burn-in captions " * 4,
                    "transcript-burnin.json": json.dumps(
                        {"captions": [{"text": lines[0]}, {"text": lines[1]}]}
                    ),
                },
            )
            pack = youtube_l2.convert(folder)[0]
            validate_packets([pack])
            self.assertEqual(pack["source_text"], "\n".join(lines))
            self.assertNotIn("ocr leftover", pack["source_text"])
            self.assertIn("ocr leftover", pack["derived"]["ocr_text"])

    def test_three_burnin_caption_lines_exact(self) -> None:
        lines = [
            "alpha invented words on still one",
            "bravo invented words on still two",
            "charlie invented words on still three",
        ]
        self.assertGreaterEqual(sum(len(line.split()) for line in lines), 15)
        self.assertLessEqual(sum(len(line.split()) for line in lines), 20)
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp) / "BURN3"
            _write_youtube(
                folder,
                files={
                    "transcript-burnin.json": json.dumps(
                        {"captions": [{"text": line} for line in lines]}
                    )
                },
            )
            pack = youtube_l2.convert(folder)[0]
            validate_packets([pack])
            self.assertEqual(pack["source_text"], "\n".join(lines))


class R8N73NoRealYoutubeIds(unittest.TestCase):
    def test_fixtures_and_tests_have_no_real_youtube_ids(self) -> None:
        roots = [ROOT / "fixtures", ROOT / "tests"]
        leaked: list[str] = []
        skip_parts = {"__pycache__", ".git"}
        skip_suffixes = {".pyc", ".pyo", ".png", ".jpg", ".jpeg", ".webp", ".mp4"}
        for root in roots:
            for path in root.rglob("*"):
                if not path.is_file():
                    continue
                if any(part in skip_parts for part in path.parts):
                    continue
                if path.suffix.lower() in skip_suffixes:
                    continue
                text = path.read_text(encoding="utf-8", errors="replace")
                for match in YT_ID_SHAPED.finditer(text):
                    token = match.group(0)
                    if token in SYNTHETIC_YOUTUBE_IDS or token in PATH_ALLOW:
                        continue
                    if not any(ch.islower() for ch in token) or not any(ch.isdigit() for ch in token):
                        continue
                    if "A-Z" in token or "a-z" in token or "0-9" in token:
                        continue
                    leaked.append(f"{path.relative_to(ROOT)}:{token}")
        self.assertEqual(leaked, [])


class R8N75EvidenceBase(unittest.TestCase):
    def test_root_joins_evidence_base_and_matches_adapter(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            tree = Path(tmp) / "l2"
            folder = tree / "PACK01"
            folder.mkdir(parents=True)
            (folder / "AE_STATUS.md").write_text(
                "# AE_STATUS — PACK01\n\n- **status**: PASS\n",
                encoding="utf-8",
            )
            (folder / "frame-t001.jpg").write_bytes(PNG_1X1)
            (folder / "source.mp4").write_bytes(b"synthetic-not-a-video")
            (folder / "whisper.txt").write_text(
                "spoken words from the synthetic caption file here\n",
                encoding="utf-8",
            )
            packets = youtube_l2.convert(tree)
            pack = packets[0]
            self.assertEqual(pack["evidence_base"], "PACK01")
            self.assertEqual(pack["content_access"], "full_visual")
            self.assertEqual(count_false_full_visual(packets), 0)
            self.assertEqual(count_false_full_visual(packets, root=tree), 0)
            validate_packets(packets, root=tree)

    def test_validate_without_root_warns_disk_skipped(self) -> None:
        warnings: list[str] = []
        validate_packet(_ok(), warnings=warnings)
        self.assertIn(DISK_CHECK_SKIPPED, warnings)
        with tempfile.TemporaryDirectory() as tmp:
            jsonl = Path(tmp) / "p.jsonl"
            write_jsonl(jsonl, [_ok()])
            rc = cli_main(["validate", "--input", str(jsonl)])
            self.assertEqual(rc, 0)


class R8N76SqliteNonDestructive(unittest.TestCase):
    def test_rebuild_replaces_only_present_source_types(self) -> None:
        bookmark = [_ok(signal_id="a", source_type="bookmark")]
        corpus = [_ok(signal_id="b", source_type="corpus")]
        youtube = [_ok(signal_id="c", source_type="youtube_l2")]
        with tempfile.TemporaryDirectory() as tmp:
            db = Path(tmp) / "idx.sqlite"
            index_packets(db, bookmark + corpus + youtube)
            index_judgments(
                db,
                [{"signal_id": "a", "source_type": "bookmark", "provider": "keyword_replay"}],
                run_id="run-keep",
            )
            jsonl = Path(tmp) / "yt.jsonl"
            write_jsonl(jsonl, [_ok(signal_id="c2", source_type="youtube_l2")])
            rebuild_from_jsonl(db, jsonl)
            counts = packet_counts_by_source_type(db)
            self.assertEqual(counts["bookmark"], 1)
            self.assertEqual(counts["corpus"], 1)
            self.assertEqual(counts["youtube_l2"], 1)
            conn = sqlite3.connect(str(db))
            n_j = conn.execute("select count(*) from judgments").fetchone()[0]
            conn.close()
            self.assertEqual(n_j, 1)

    def test_old_schema_migrates_and_keeps_judgments(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            db = Path(tmp) / "old.sqlite"
            conn = sqlite3.connect(str(db))
            conn.executescript(
                """
                CREATE TABLE packets (
                    signal_id TEXT PRIMARY KEY,
                    content_access TEXT,
                    body_json TEXT NOT NULL
                );
                CREATE TABLE judgments (
                    run_id TEXT NOT NULL,
                    source_type TEXT NOT NULL,
                    signal_id TEXT NOT NULL,
                    provider TEXT NOT NULL,
                    flagged INTEGER,
                    label TEXT,
                    latency_ms REAL,
                    cost_usd REAL,
                    body_json TEXT NOT NULL,
                    PRIMARY KEY (run_id, source_type, signal_id, provider)
                );
                """
            )
            conn.execute(
                "INSERT INTO packets (signal_id, content_access, body_json) VALUES (?,?,?)",
                ("old-1", "transcript", "{}"),
            )
            conn.execute(
                "INSERT INTO judgments (run_id, source_type, signal_id, provider, flagged, label, latency_ms, cost_usd, body_json) "
                "VALUES (?,?,?,?,?,?,?,?,?)",
                ("run-old", "bookmark", "old-1", "keyword_replay", 1, "x", 0, 0, "{}"),
            )
            conn.commit()
            conn.close()
            opened = connect(db)
            n_p = opened.execute("select count(*) from packets").fetchone()[0]
            n_j = opened.execute("select count(*) from judgments").fetchone()[0]
            cols = {row[1] for row in opened.execute("PRAGMA table_info(packets)")}
            opened.close()
            self.assertEqual(n_p, 1)
            self.assertEqual(n_j, 1)
            self.assertIn("source_type", cols)

    def test_unrecognized_schema_refuses(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            db = Path(tmp) / "weird.sqlite"
            conn = sqlite3.connect(str(db))
            conn.execute("CREATE TABLE packets (foo TEXT)")
            conn.commit()
            conn.close()
            with self.assertRaises(IndexSchemaError):
                connect(db)


class R8N77DisagreementRefs(unittest.TestCase):
    def test_disagreement_refs_name_preferred_and_differing(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp) / "DIFF"
            _write_youtube(
                folder,
                files={
                    "TRANSCRIPT.md": "alpha spoken transcript line from the md file\n",
                    "captions_clean.txt": "zeta spoken caption line from the vtt stand-in\n",
                },
            )
            pack = youtube_l2.convert(folder)[0]
            validate_packets([pack])
            refs = pack["scores"]["disagreement_refs"]
            self.assertEqual(refs[0], Path(pack["preferred_source"]).name)
            self.assertIn("TRANSCRIPT.md", refs)
            self.assertIn("captions_clean.txt", refs)


class R8Reg4NotApplicable(unittest.TestCase):
    def test_lexicon_on_empty_source_text_is_not_applicable(self) -> None:
        rows = load_labelled(
            ROOT / "fixtures" / "keyword_replay" / "REVIEW.csv",
            ROOT / "fixtures" / "keyword_replay" / "STATE.jsonl",
        )
        result = run_eval(LexiconProvider(), [{**row, "packet": labelled_to_packet(row)} for row in rows])
        self.assertEqual(result["report"]["status"], SOURCE_TEXT_UNAVAILABLE)
        self.assertNotIn("recall", result["report"]["all"])
        self.assertNotIn("precision", result["report"]["all"])

    def test_keyword_rules_on_empty_source_text_is_not_applicable(self) -> None:
        packets = bookmark_review.convert(ROOT / "fixtures" / "bookmark_review")
        result = run_eval(KeywordRulesProvider(), [{"packet": p, "signal_id": p["signal_id"]} for p in packets])
        self.assertEqual(result["report"]["status"], SOURCE_TEXT_UNAVAILABLE)
        self.assertNotIn("recall", result["report"]["all"])


class R8NameChecks(unittest.TestCase):
    def test_ocr_name_helper(self) -> None:
        self.assertTrue(is_ocr_file(Path("ocr-frames.txt")))
        self.assertTrue(is_ocr_file(Path("still-ocr.json")))
        self.assertFalse(is_ocr_file(Path("whisper.txt")))
