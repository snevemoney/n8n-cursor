#!/usr/bin/env python3
"""Build committed synthetic packets and optional scale trees. No real ids."""

from __future__ import annotations

import csv
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT.parent))

from fixtures.tiny_png import MINIMAL_FTYP_MP4, PNG_1X1  # noqa: E402
from learning_engine.io_util import write_jsonl  # noqa: E402
from learning_engine.packet import base_packet, claim, evidence_item  # noqa: E402
from learning_engine.validator import validate_packet  # noqa: E402

GISTS = [
    "Post shows an agent loop with a fresh-context verifier step",
    "List entry: a TV series recommendation",
    "Workflow CLI that writes a packet schema",
    "Model API changelog for a local eval harness",
    "UI layout notes for a design system",
    "Leisure concert mention",
    "Skill enrich proposal about adapters",
    "Voice over tool list",
]


def fifty_packets() -> list[dict]:
    packets = []
    for i in range(1, 55):
        kind = i % 3
        if kind == 0:
            frame_ref = f"frames/frame-t{i:03d}.jpg"
            packet = base_packet(
                signal_id=f"syn-pack-{i:03d}",
                source_type="youtube_l2",
                content_access="full_visual" if i % 9 == 0 else "frames",
                analysis_scope="full_visual" if i % 9 == 0 else "frames",
                source_text=GISTS[i % len(GISTS)],
                evidence=[
                    evidence_item(kind="file", source_ref="AE_STATUS.md"),
                    evidence_item(kind="frame", source_ref=frame_ref),
                ],
                verification_state="partial",
                processing_status="ok",
                lifecycle_state="analyzed",
                scores={"usefulness": "med" if i % 4 else "low"},
                claims=[claim("synthetic coverage note", ["AE_STATUS.md"])],
                source_url=f"https://example.com/watch?v=SYN{i:03d}",
                adapter="fixture",
            )
        elif kind == 1:
            packet = base_packet(
                signal_id=f"syn-pack-{i:03d}",
                source_type="corpus",
                content_access="transcript",
                analysis_scope="transcript",
                source_text=GISTS[i % len(GISTS)],
                evidence=[
                    evidence_item(kind="metadata", source_ref="META.json"),
                    evidence_item(kind="transcript", source_ref="transcript.txt"),
                ],
                verification_state="unknown",
                processing_status="partial",
                lifecycle_state="extracted",
                scores={"classification": "INGEST_PARTIAL"},
                adapter="fixture",
            )
        else:
            packet = base_packet(
                signal_id=f"syn-pack-{i:03d}",
                source_type="bookmark",
                content_access="preview_only" if i % 11 == 0 else "transcript",
                analysis_scope="preview_only" if i % 11 == 0 else "transcript",
                source_text=GISTS[i % len(GISTS)],
                evidence=[evidence_item(kind="field", source_ref="REVIEW.csv:gist")],
                verification_state="not_applicable",
                processing_status="ok",
                lifecycle_state="analyzed",
                scores={"usefulness": "high" if i % 17 == 0 else "none", "kw_category": "harness" if i % 5 else "unclassified"},
                adapter="fixture",
            )
        packets.append(validate_packet(packet))
    return packets


def write_frames() -> None:
    corpus = ROOT / "corpus" / "artifacts" / "9000000000000000010"
    (corpus / "frame-t001.jpg").write_bytes(PNG_1X1)
    (corpus / "still-t002.png").write_bytes(PNG_1X1)
    (corpus / "clip.mp4").write_bytes(MINIMAL_FTYP_MP4)
    yt = ROOT / "youtube_l2" / "l2-20260927" / "SYNTHETIC01"
    (yt / "frame-t001.jpg").write_bytes(PNG_1X1)
    (yt / "still-t002.png").write_bytes(PNG_1X1)
    frames = yt / "frames"
    frames.mkdir(exist_ok=True)
    (frames / "frame-t003.jpg").write_bytes(PNG_1X1)


def write_shadow() -> None:
    rows = []
    useful_gists = [
        "Agent loop with a fresh-context verifier step in the eval harness",
        "n8n workflow CLI that writes adapters and a packet schema",
        "OpenRouter model API used only as a local baseline comparison",
        "Skill enrich: keep source text out of the instruction field",
        "Keyframe stills plus transcript for a coverage pack",
        "Cursor builder tool that runs a separate verifier",
        "Watchdog grades the builder; do not self-score",
        "SQLite index plus JSONL for packets and judgments",
        "Lexicon decision-gate: cheap skip versus escalate",
        "Prompt schema for a typed decisions call",
        "Transcript burn-in captions for method reconstruction",
        "Adapter honesty: missing completeness keys stay unknown",
    ]
    noise_gists = [
        "List entry: a TV series recommendation",
        "Leisure concert mention with no building lesson",
        "Vacation photo dump",
        "Sports score recap",
        "Meme compilation",
        "Recipe for soup",
        "Celebrity interview clip",
        "Weather chat",
        "Music playlist",
        "Fashion haul",
        "Gaming stream highlight with no tool lesson",
        "Movie trailer recommendation",
    ]
    for i, gist in enumerate(useful_gists, start=1):
        rows.append(
            {
                "signal_id": f"shadow-u{i:02d}",
                "usefulness": "high" if i <= 4 else "med",
                "kw_category": "harness" if i % 2 else "builder-tool",
                "status": "DONE",
                "source_text": gist,
                "source": "full-text",
                "scores": {
                    "usefulness": "high" if i <= 4 else "med",
                    "kw_category": "harness" if i % 2 else "builder-tool",
                },
            }
        )
    for i, gist in enumerate(noise_gists, start=1):
        rows.append(
            {
                "signal_id": f"shadow-n{i:02d}",
                "usefulness": "none",
                "kw_category": "unclassified",
                "status": "DONE",
                "source_text": gist,
                "source": "full-text",
                "scores": {"usefulness": "none", "kw_category": "unclassified"},
            }
        )
    path = ROOT / "shadow" / "labelled.jsonl"
    write_jsonl(path, rows)


def write_scale_bookmark(dest: Path, n: int = 54) -> None:
    dest.mkdir(parents=True, exist_ok=True)
    review = dest / "REVIEW.csv"
    state = dest / "STATE.jsonl"
    with review.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(
            [
                "id",
                "author",
                "date",
                "gist",
                "category",
                "lesson",
                "usefulness",
                "disposition",
                "verified",
                "links",
                "source",
            ]
        )
        for i in range(1, n + 1):
            writer.writerow(
                [
                    f"syn-bm-{i:03d}",
                    f"synth_{i}",
                    "2026-09-01",
                    GISTS[i % len(GISTS)],
                    "harness" if i % 3 else "leisure",
                    "Keep source text separate" if i % 7 == 0 else "",
                    ("high", "med", "low", "none")[i % 4],
                    "keep",
                    "n.a.",
                    f"https://example.com/bm/{i}" if i % 2 else "",
                    "preview-only" if i % 13 == 0 else "full-text",
                ]
            )
    with state.open("w", encoding="utf-8") as handle:
        for i in range(1, n + 1):
            handle.write(
                json.dumps(
                    {
                        "id": f"syn-bm-{i:03d}",
                        "kw_category": "harness" if i % 3 else "unclassified",
                        "status": "FAILED" if i % 20 == 0 else "DONE",
                    }
                )
                + "\n"
            )


def main() -> None:
    write_frames()
    packets = fifty_packets()
    write_jsonl(ROOT / "packets" / "fifty_valid.jsonl", packets)
    write_shadow()
    write_scale_bookmark(ROOT / "bookmark_scale")
    print(json.dumps({"ok": True, "fifty_valid": len(packets)}))


if __name__ == "__main__":
    main()
