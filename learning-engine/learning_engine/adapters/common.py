"""Shared adapter helpers. Never invent a URL, author, or file."""

from __future__ import annotations

import json
import re
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
VTT_TIMESTAMP = re.compile(
    r"^\d{1,2}:\d{2}(?::\d{2})?(?:[.,]\d+)?\s+-->\s+\d{1,2}:\d{2}(?::\d{2})?(?:[.,]\d+)?"
)
VTT_CUE_NUMBER = re.compile(r"^\d+$")
MD_HEADING = re.compile(r"^#{1,6}\s+\S")
CAPTION_GAP_LINE = re.compile(r"^_+\s*CAPTION_GAP\b.*_+\s*$", re.IGNORECASE)


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


def spoken_text(raw: str) -> str:
    """Spoken words only. Evidence refs still point at the original file."""
    lines_out: list[str] = []
    for line in raw.replace("\r\n", "\n").split("\n"):
        stripped = line.strip()
        if not stripped:
            continue
        upper = stripped.upper()
        if upper.startswith("WEBVTT"):
            continue
        if upper.startswith("NOTE") or upper.startswith("STYLE") or upper.startswith("REGION"):
            continue
        if VTT_TIMESTAMP.match(stripped):
            continue
        if VTT_CUE_NUMBER.match(stripped):
            continue
        if MD_HEADING.match(stripped):
            continue
        lines_out.append(stripped)
    return "\n".join(lines_out).strip()


def is_caption_gap_line(line: str) -> bool:
    return bool(CAPTION_GAP_LINE.match(line.strip()))


def extract_caption_gap(raw: str) -> str | None:
    for line in raw.replace("\r\n", "\n").split("\n"):
        stripped = line.strip()
        if is_caption_gap_line(stripped):
            return stripped.strip("_").strip()
    return None


def is_placeholder_transcript(raw: str) -> bool:
    """Gap markers or heading-only bodies are not transcript evidence."""
    spoken = spoken_text(raw)
    if not spoken:
        return True
    return all(is_caption_gap_line(line) or extract_caption_gap(line) for line in spoken.splitlines())


def split_transcripts(
    paths: list[Path],
    read_text: Callable[[Path], str],
) -> tuple[list[Path], list[Path], str | None]:
    """Separate real speech files from placeholder / gap-marker files."""
    real: list[Path] = []
    placeholders: list[Path] = []
    gap: str | None = None
    for path in paths:
        raw = read_text(path)
        extracted = extract_caption_gap(raw)
        if extracted:
            gap = gap or extracted
        if is_placeholder_transcript(raw):
            placeholders.append(path)
        else:
            real.append(path)
    return real, placeholders, gap


def meta_denies_transcript(meta: dict[str, Any], has_transcript_flag: bool | None) -> bool:
    """META is the filter: has_transcript false or transcript_chars 0 means no speech."""
    if has_transcript_flag is False:
        return True
    chars = meta.get("transcript_chars")
    if isinstance(chars, (int, float)) and chars == 0:
        return True
    return False


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


def convert_summary(
    adapter: str,
    report: dict[str, Any],
    output: str | None = None,
    *,
    strict: bool = False,
) -> dict[str, Any]:
    invalid_n = len(report["invalid"])
    ok = True
    if invalid_n and (strict or not report["packets"]):
        ok = False
    payload: dict[str, Any] = {
        "ok": ok,
        "adapter": adapter,
        "packets": len(report["packets"]),
        "invalid": invalid_n,
        "invalid_items": report["invalid"],
    }
    if output is not None:
        payload["output"] = output
    return payload
