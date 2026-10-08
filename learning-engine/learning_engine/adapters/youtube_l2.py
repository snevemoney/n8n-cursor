"""YouTube l2 pack folders (AE_STATUS.md + siblings) → research-packet v0."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any

from learning_engine.adapters.common import existing_frames, existing_transcripts, rel_ref
from learning_engine.io_util import write_jsonl
from learning_engine.packet import base_packet, claim, evidence_item
from learning_engine.validator import validate_packet

AE_ROW = re.compile(
    r"^\|\s*(?P<letter>[A-E])\b[^|]*\|\s*(?P<status>[^|]+)\|\s*(?P<artifact>[^|]+)\|",
    re.MULTILINE,
)
TITLE_RE = re.compile(r"yt:(?P<vid>[A-Za-z0-9_-]+)")


def find_pack_dirs(input_path: Path) -> list[Path]:
    if (input_path / "AE_STATUS.md").is_file():
        return [input_path]
    if not input_path.is_dir():
        raise FileNotFoundError(f"youtube l2 input is not a directory: {input_path}")
    return sorted({path.parent for path in input_path.rglob("AE_STATUS.md")})


def parse_ae_status(text: str) -> dict[str, dict[str, str]]:
    out: dict[str, dict[str, str]] = {}
    for match in AE_ROW.finditer(text):
        letter = match.group("letter")
        out[letter] = {
            "status": match.group("status").strip(),
            "artifact": match.group("artifact").strip(),
        }
    return out


def _info_json(folder: Path) -> dict[str, Any]:
    path = folder / "info.json"
    if not path.is_file():
        return {}
    try:
        obj = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}
    return obj if isinstance(obj, dict) else {}


def _source_text(folder: Path, transcripts: list[Path]) -> str:
    for name in (
        "transcript-burnin.json",
        "player-caption-samples.json",
        "ocr-frames.txt",
        "stills_captions.json",
    ):
        path = folder / name
        if not path.is_file():
            continue
        raw = path.read_text(encoding="utf-8", errors="replace")
        if path.suffix.lower() == ".json":
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
                        parts = [str(item.get("text")) for item in value if isinstance(item, dict) and item.get("text")]
                        if parts:
                            return "\n".join(parts)
            if isinstance(obj, list):
                parts = [str(item.get("text")) for item in obj if isinstance(item, dict) and item.get("text")]
                if parts:
                    return "\n".join(parts)
            return raw
        return raw
    if transcripts:
        return transcripts[0].read_text(encoding="utf-8", errors="replace")
    coverage = folder / "COVERAGE.md"
    if coverage.is_file():
        # coverage is operator notes, not source. Do not copy it into source_text.
        return ""
    return ""


def pack_to_packet(folder: Path) -> dict[str, Any]:
    ae_path = folder / "AE_STATUS.md"
    ae_text = ae_path.read_text(encoding="utf-8")
    ae = parse_ae_status(ae_text)
    title_hit = TITLE_RE.search(ae_text)
    info = _info_json(folder)
    signal_id = ""
    if title_hit:
        signal_id = title_hit.group("vid")
    if not signal_id and isinstance(info.get("id"), str):
        signal_id = info["id"]
    if not signal_id:
        signal_id = folder.name

    frames = existing_frames(folder)
    transcripts = existing_transcripts(folder)
    evidence: list[dict[str, Any]] = [
        evidence_item(kind="file", source_ref=rel_ref(folder, ae_path), note="AE_STATUS.md")
    ]
    for sibling in ("COVERAGE.md", "METHOD.md", "EVIDENCE_INDEX.md", "RECREATION.md", "SKILL_DELTA.md"):
        path = folder / sibling
        if path.is_file():
            evidence.append(evidence_item(kind="file", source_ref=rel_ref(folder, path)))
    if (folder / "info.json").is_file():
        evidence.append(evidence_item(kind="metadata", source_ref="info.json"))
    for path in frames:
        evidence.append(evidence_item(kind="frame", source_ref=rel_ref(folder, path)))
    for path in transcripts:
        evidence.append(evidence_item(kind="transcript", source_ref=rel_ref(folder, path)))
    for name in ("ocr-frames.txt", "player-caption-samples.json", "transcript-burnin.json", "stills_captions.json"):
        path = folder / name
        if path.is_file():
            kind = "caption" if "caption" in name or "ocr" in name else "transcript"
            evidence.append(evidence_item(kind=kind, source_ref=rel_ref(folder, path)))

    source_text = _source_text(folder, transcripts)
    has_caption = any(
        (folder / name).is_file()
        for name in ("ocr-frames.txt", "player-caption-samples.json", "transcript-burnin.json", "stills_captions.json")
    )

    if frames and (folder / "source.mp4").is_file():
        content_access = "full_visual"
        analysis_scope = "full_visual"
    elif frames:
        content_access = "frames"
        analysis_scope = "frames"
    elif transcripts or has_caption or source_text:
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

    scores: dict[str, Any] = {
        "frames_on_disk": len(frames),
        "ae_letters_parsed": len(ae),
    }
    for letter, row in ae.items():
        scores[f"ae_{letter}"] = row.get("status")

    processing = "ok" if ae else "unknown"
    statuses = " ".join(row.get("status", "") for row in ae.values()).upper()
    if "FAIL" in statuses or "BLOCKED" in statuses:
        processing = "partial"
    if not ae:
        processing = "unknown"

    return base_packet(
        signal_id=signal_id,
        source_type="youtube_l2",
        content_access=content_access,
        analysis_scope=analysis_scope,
        source_text=source_text,
        evidence=evidence,
        verification_state="partial" if ae else "unknown",
        processing_status=processing,
        lifecycle_state="analyzed" if ae else "extracted",
        scores=scores,
        claims=claims,
        source_url=source_url,
        source_author=source_author,
        adapter="youtube_l2",
        input_ref=str(folder),
        extra={"ae_status": ae} if ae else None,
    )


def convert(input_path: Path) -> list[dict[str, Any]]:
    packets = [validate_packet(pack_to_packet(folder)) for folder in find_pack_dirs(input_path)]
    return packets


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Convert YouTube l2 packs into packets")
    parser.add_argument("--input", required=True, help="l2 root, date folder, or one pack folder")
    parser.add_argument("--output", required=True, help="JSONL output path")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    packets = convert(Path(args.input))
    n = write_jsonl(Path(args.output), packets)
    print(json.dumps({"ok": True, "packets": n, "adapter": "youtube_l2"}))
    return 0


if __name__ == "__main__":
    sys.exit(main())
