"""YouTube l2 / repass pack folders (AE_STATUS.md + siblings) → research-packet v0.

Accepts table AE_STATUS and the bullet-list repass format. Any local video
file counts (source.mp4, source_vid.mp4, section clips). full_visual needs
frame evidence refs AND a video that exists on disk.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any

from learning_engine.adapters.common import (
    clip_source_text,
    collect_packet,
    convert_summary,
    empty_convert_report,
    existing_frames,
    existing_transcripts,
    existing_videos,
    pick_source_transcript,
    rel_ref,
    spoken_text,
    split_transcripts,
)
from learning_engine.io_util import write_jsonl
from learning_engine.packet import base_packet, claim, evidence_item

AE_ROW = re.compile(
    r"^\|\s*(?P<letter>[A-E])\b[^|]*\|\s*(?P<status>[^|]+)\|\s*(?P<artifact>[^|]+)\|",
    re.MULTILINE,
)
TITLE_RE = re.compile(r"yt:(?P<vid>[A-Za-z0-9_-]+)")
HEADING_ID_RE = re.compile(
    r"AE_STATUS\s*[—\-]+\s*(?P<vid>[A-Za-z0-9_-]+)",
    re.IGNORECASE,
)
BULLET_FIELD = re.compile(
    r"^-\s+\*\*(?P<key>[^*]+)\*\*\s*:\s*(?P<val>.+?)\s*$",
    re.MULTILINE,
)
NOTE_LINE = re.compile(r"^-\s+(?P<note>.+?)\s*$", re.MULTILINE)
LETTER_BULLET = re.compile(
    r"^-\s+(?P<letter>[A-E])\s+(?P<status>[A-Za-z]+)\s+[—–\-]+\s+(?P<artifact>\S.+?)\s*$",
    re.MULTILINE,
)


def find_pack_dirs(input_path: Path) -> list[Path]:
    if (input_path / "AE_STATUS.md").is_file():
        return [input_path]
    if not input_path.is_dir():
        raise FileNotFoundError(f"youtube l2 input is not a directory: {input_path}")
    return sorted({path.parent for path in input_path.rglob("AE_STATUS.md")})


def parse_ae_status(text: str) -> dict[str, Any]:
    """Table A–E rows and/or the bullet-list repass format."""
    out: dict[str, Any] = {}
    for match in AE_ROW.finditer(text):
        letter = match.group("letter")
        out[letter] = {
            "status": match.group("status").strip(),
            "artifact": match.group("artifact").strip(),
        }
    for match in LETTER_BULLET.finditer(text):
        letter = match.group("letter").upper()
        if letter in out:
            continue
        out[letter] = {
            "status": match.group("status").strip(),
            "artifact": match.group("artifact").strip(),
        }
    bullets = {m.group("key").strip().lower(): m.group("val").strip() for m in BULLET_FIELD.finditer(text)}
    notes_block = ""
    notes_idx = re.search(r"^##\s+Notes\s*$", text, re.MULTILINE | re.IGNORECASE)
    if notes_idx:
        notes_block = text[notes_idx.end() :]
    notes = [m.group("note").strip() for m in NOTE_LINE.finditer(notes_block)]
    transcript_source = None
    for note in notes:
        if note.lower().startswith("transcript_source="):
            transcript_source = note.split("=", 1)[1].strip()
            break
    if bullets or notes:
        out["overall"] = {
            "status": bullets.get("status", ""),
            "updated": bullets.get("updated", ""),
            "batch": bullets.get("batch", ""),
        }
        if notes:
            out["notes"] = notes
        if transcript_source:
            out["transcript_source"] = transcript_source
    return out


def _read_json_object(path: Path) -> dict[str, Any]:
    if not path.is_file():
        return {}
    try:
        obj = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}
    return obj if isinstance(obj, dict) else {}


def _info_json(folder: Path) -> dict[str, Any]:
    merged: dict[str, Any] = {}
    candidates = [folder / "info.json", folder / "meta.json"]
    candidates.extend(sorted(folder.glob("*.info.json")))
    for path in candidates:
        payload = _read_json_object(path)
        if payload:
            merged.update(payload)
    return merged


def _read_transcript_text(path: Path) -> str:
    raw = path.read_text(encoding="utf-8", errors="replace")
    if path.suffix.lower() != ".json":
        return raw
    try:
        obj = json.loads(raw)
    except json.JSONDecodeError:
        return raw
    if isinstance(obj, dict):
        for key in ("text", "transcript", "captions"):
            value = obj.get(key)
            if isinstance(value, str):
                return value
            if isinstance(value, list):
                parts = [
                    str(item.get("text"))
                    for item in value
                    if isinstance(item, dict) and item.get("text")
                ]
                if parts:
                    return "\n".join(parts)
    if isinstance(obj, list):
        parts = [str(item.get("text")) for item in obj if isinstance(item, dict) and item.get("text")]
        if parts:
            return "\n".join(parts)
    return raw


def _source_text(transcripts: list[Path]) -> str:
    picked = pick_source_transcript(transcripts)
    if picked is None:
        return ""
    return _read_transcript_text(picked)


def _signal_id(ae_text: str, folder: Path, info: dict[str, Any]) -> str:
    title_hit = TITLE_RE.search(ae_text)
    if title_hit:
        return title_hit.group("vid")
    heading = HEADING_ID_RE.search(ae_text)
    if heading:
        return heading.group("vid")
    if isinstance(info.get("id"), str) and info["id"].strip():
        return str(info["id"])
    return folder.name


def pack_to_packet(folder: Path) -> dict[str, Any]:
    ae_path = folder / "AE_STATUS.md"
    ae_text = ae_path.read_text(encoding="utf-8")
    ae = parse_ae_status(ae_text)
    info = _info_json(folder)
    signal_id = _signal_id(ae_text, folder, info)

    frames = existing_frames(folder)
    discovered = existing_transcripts(folder)
    real_transcripts, placeholders, file_gap = split_transcripts(
        discovered, _read_transcript_text
    )
    videos = existing_videos(folder)
    evidence: list[dict[str, Any]] = [
        evidence_item(kind="file", source_ref=rel_ref(folder, ae_path), note="AE_STATUS.md")
    ]
    for sibling in ("COVERAGE.md", "METHOD.md", "EVIDENCE_INDEX.md", "RECREATION.md", "SKILL_DELTA.md"):
        path = folder / sibling
        if path.is_file():
            evidence.append(evidence_item(kind="file", source_ref=rel_ref(folder, path)))
    cited = {rel_ref(folder, p) for p in [ae_path]}
    for path in [folder / "info.json", folder / "meta.json", *sorted(folder.glob("*.info.json"))]:
        if path.is_file():
            ref = rel_ref(folder, path)
            if ref not in cited:
                evidence.append(evidence_item(kind="metadata", source_ref=ref))
                cited.add(ref)
    for path in frames:
        evidence.append(evidence_item(kind="frame", source_ref=rel_ref(folder, path)))
    for path in real_transcripts:
        evidence.append(evidence_item(kind="transcript", source_ref=rel_ref(folder, path)))
    for path in placeholders:
        evidence.append(
            evidence_item(
                kind="file",
                source_ref=rel_ref(folder, path),
                note="caption_gap_placeholder",
            )
        )
    for path in videos:
        ref = rel_ref(folder, path)
        if ref not in cited:
            evidence.append(evidence_item(kind="file", source_ref=ref, note="video"))
            cited.add(ref)

    source_text, source_chars, truncated = clip_source_text(
        spoken_text(_source_text(real_transcripts))
    )

    if frames and videos:
        content_access = "full_visual"
        analysis_scope = "full_visual"
    elif frames:
        content_access = "frames"
        analysis_scope = "frames"
    elif real_transcripts or source_text:
        content_access = "transcript"
        analysis_scope = "transcript"
    else:
        content_access = "none"
        analysis_scope = "none"

    url = info.get("webpage_url") or info.get("url")
    source_url = url if isinstance(url, str) and url.strip() else None
    author = info.get("uploader") or info.get("channel") or info.get("uploader_id")
    source_author = author if isinstance(author, str) and author.strip() else None

    claims: list[dict[str, Any]] = []
    skill_delta = folder / "SKILL_DELTA.md"
    if skill_delta.is_file():
        text = skill_delta.read_text(encoding="utf-8").strip()
        if text:
            claims.append(claim(text[:500], ["SKILL_DELTA.md"]))

    letters = [k for k in ae if k in {"A", "B", "C", "D", "E"}]
    scores: dict[str, Any] = {
        "frames_on_disk": len(frames),
        "videos_on_disk": len(videos),
        "transcripts_on_disk": len(discovered),
        "transcripts_usable": len(real_transcripts),
        "ae_letters_parsed": len(letters),
        "source_text_chars": source_chars,
        "source_text_truncated": truncated,
    }
    for letter in letters:
        row = ae[letter]
        if isinstance(row, dict):
            scores[f"ae_{letter}"] = row.get("status")
    overall = ae.get("overall") if isinstance(ae.get("overall"), dict) else {}
    if overall.get("status"):
        scores["ae_overall"] = overall["status"]
    if overall.get("updated"):
        scores["ae_updated"] = overall["updated"]
    if overall.get("batch"):
        scores["ae_batch"] = overall["batch"]
    if ae.get("transcript_source"):
        scores["ae_transcript_source"] = ae["transcript_source"]
    if file_gap:
        scores["caption_gap"] = file_gap

    processing = "unknown"
    if letters:
        processing = "ok"
        statuses = " ".join(str(ae[letter].get("status", "")) for letter in letters).upper()
        if "FAIL" in statuses or "BLOCKED" in statuses:
            processing = "partial"
    if overall.get("status"):
        raw = str(overall["status"]).strip().upper()
        if raw == "PARTIAL":
            processing = "partial"
        elif raw in {"PASS", "OK", "DONE"}:
            processing = processing if letters else "ok"
        elif raw in {"FAIL", "FAILED", "BLOCKED"}:
            processing = "failed"

    has_ae = bool(letters or overall)
    return base_packet(
        signal_id=signal_id,
        source_type="youtube_l2",
        content_access=content_access,
        analysis_scope=analysis_scope,
        source_text=source_text,
        evidence=evidence,
        verification_state="partial" if has_ae else "unknown",
        processing_status=processing,
        lifecycle_state="analyzed" if has_ae else "extracted",
        scores=scores,
        claims=claims,
        source_url=source_url,
        source_author=source_author,
        adapter="youtube_l2",
        input_ref=str(folder),
        extra={"ae_status": ae} if ae else None,
    )


def convert_report(input_path: Path, *, strict: bool = False) -> dict[str, Any]:
    report = empty_convert_report()
    for folder in find_pack_dirs(input_path):
        if not collect_packet(report, str(folder), lambda f=folder: pack_to_packet(f), strict=strict) and strict:
            break
    return report


def convert(input_path: Path, *, strict: bool = False) -> list[dict[str, Any]]:
    return convert_report(input_path, strict=strict)["packets"]


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Convert YouTube l2 / repass packs into packets")
    parser.add_argument("--input", required=True, help="l2/repass root, date folder, or one pack folder")
    parser.add_argument("--output", required=True, help="JSONL output path")
    parser.add_argument("--strict", action="store_true", help="Fail on the first invalid packet")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    report = convert_report(Path(args.input), strict=args.strict)
    n = write_jsonl(Path(args.output), report["packets"])
    summary = convert_summary("youtube_l2", report, args.output, strict=args.strict)
    summary["packets"] = n
    print(json.dumps(summary))
    if args.strict and report["invalid"]:
        return 1
    return 0 if report["packets"] or not report["invalid"] else 1


if __name__ == "__main__":
    sys.exit(main())
