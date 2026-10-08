"""Shared adapter helpers. Never invent a URL, author, or file."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Callable

from learning_engine.errors import PacketValidationError
from learning_engine.validator import validate_packet

FRAME_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp"}
VIDEO_SUFFIXES = {".mp4", ".webm", ".mkv", ".mov", ".m4v"}
CAPTION_SUFFIXES = {".txt", ".json", ".md", ".vtt"}
TRANSCRIPT_EXACT = {
    "transcript.md",
    "transcript.txt",
    "transcript.json",
    "transcript.vtt",
    "transcript-burnin.json",
    "ocr-frames.txt",
    "stills_captions.json",
    "player-caption-samples.json",
    "captions.json",
    "captions_clean.txt",
    "captions_timeline.txt",
    "captions_w1.txt",
    "whisper.txt",
}
SOURCE_TEXT_MAX_CHARS = 50_000


def existing_files(folder: Path, suffixes: set[str] | None = None) -> list[Path]:
    if not folder.is_dir():
        return []
    out: list[Path] = []
    for path in sorted(folder.rglob("*")):
        if not path.is_file():
            continue
        if suffixes and path.suffix.lower() not in suffixes:
            continue
        out.append(path)
    return out


def existing_frames(folder: Path) -> list[Path]:
    hits: list[Path] = []
    if not folder.is_dir():
        return hits
    for path in sorted(folder.rglob("*")):
        if not path.is_file():
            continue
        name = path.name.lower()
        suffix = path.suffix.lower()
        if suffix not in FRAME_SUFFIXES:
            continue
        parent = path.parent.name.lower()
        if (
            name.startswith("frame-")
            or name.startswith("still-")
            or "frame" in name
            or "still" in name
            or parent in {"frames", "stills"}
            or "frames" in {part.lower() for part in path.parts}
            or "stills" in {part.lower() for part in path.parts}
        ):
            hits.append(path)
    return hits


def existing_transcripts(folder: Path) -> list[Path]:
    """Case-insensitive: TRANSCRIPT.md, *.vtt, captions*.{txt,json,md,vtt}, *transcript*."""
    hits: list[Path] = []
    if not folder.is_dir():
        return hits
    seen: set[Path] = set()
    for path in sorted(folder.rglob("*")):
        if not path.is_file():
            continue
        name = path.name.lower()
        match = False
        if name in TRANSCRIPT_EXACT:
            match = True
        elif "transcript" in name:
            match = True
        elif name.endswith(".vtt"):
            match = True
        elif name.startswith("captions") and path.suffix.lower() in CAPTION_SUFFIXES:
            match = True
        if match and path not in seen:
            seen.add(path)
            hits.append(path)
    return hits


def existing_videos(folder: Path) -> list[Path]:
    if not folder.is_dir():
        return []
    return [
        path
        for path in sorted(folder.rglob("*"))
        if path.is_file() and path.suffix.lower() in VIDEO_SUFFIXES
    ]


def existing_raw_files(folder: Path) -> list[Path]:
    raw = folder / "raw"
    if not raw.is_dir():
        return []
    return [path for path in sorted(raw.rglob("*")) if path.is_file()]


def pick_source_transcript(paths: list[Path]) -> Path | None:
    if not paths:
        return None

    def rank(path: Path) -> tuple[int, str]:
        name = path.name.lower()
        if name == "transcript.md":
            return (0, name)
        if name.endswith(".en-orig.vtt"):
            return (1, name)
        if name.endswith(".en.vtt"):
            return (2, name)
        if name.endswith(".vtt"):
            return (3, name)
        if name.startswith("captions_clean"):
            return (4, name)
        if "transcript" in name:
            return (5, name)
        return (6, name)

    return sorted(paths, key=rank)[0]


def clip_source_text(text: str, limit: int = SOURCE_TEXT_MAX_CHARS) -> tuple[str, int, bool]:
    n = len(text)
    if n <= limit:
        return text, n, False
    return text[:limit], n, True


def rel_ref(root: Path, path: Path) -> str:
    try:
        return str(path.resolve().relative_to(root.resolve()))
    except ValueError:
        return str(path)


def map_verified(value: str | None) -> str:
    raw = (value or "").strip().lower()
    mapping = {
        "yes": "verified",
        "partial": "partial",
        "no": "unverified",
        "n.a.": "not_applicable",
        "n/a": "not_applicable",
        "na": "not_applicable",
    }
    return mapping.get(raw, "unknown" if raw else "unknown")


def map_status(value: str | None) -> str:
    raw = (value or "").strip().upper()
    mapping = {
        "DONE": "ok",
        "OK": "ok",
        "FAILED": "failed",
        "PARTIAL": "partial",
        "PENDING": "pending",
        "IN_PROGRESS": "pending",
        "QUARANTINED": "failed",
    }
    return mapping.get(raw, "unknown" if raw else "unknown")


def empty_convert_report() -> dict[str, Any]:
    return {"packets": [], "invalid": []}


def collect_packet(
    report: dict[str, Any],
    ref: str,
    builder: Callable[[], dict[str, Any]],
    *,
    strict: bool,
) -> bool:
    """Validate and keep a packet. Return False when this item failed.

    Default path records the reason and continues. `--strict` still records
    the reason; callers stop the walk when this returns False.
    """
    try:
        packet = validate_packet(builder())
        report["packets"].append(packet)
        return True
    except (PacketValidationError, ValueError, OSError, json.JSONDecodeError) as exc:
        report["invalid"].append({"ref": ref, "reason": str(exc)})
        return False if strict else True


def convert_summary(adapter: str, report: dict[str, Any], output: str | None = None) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "ok": True,
        "adapter": adapter,
        "packets": len(report["packets"]),
        "invalid": len(report["invalid"]),
        "invalid_items": report["invalid"],
    }
    if output is not None:
        payload["output"] = output
    return payload
