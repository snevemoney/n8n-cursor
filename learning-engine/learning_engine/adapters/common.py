"""Shared adapter helpers. Never invent a URL, author, or file."""

from __future__ import annotations

from pathlib import Path

FRAME_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp"}
TRANSCRIPT_NAMES = {
    "transcript.txt",
    "transcript.json",
    "transcript-burnin.json",
    "ocr-frames.txt",
}


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
        if name.startswith("frame-") or name.startswith("still-") or "frame" in path.parts or "still" in name or "stills" in path.parts:
            hits.append(path)
            continue
        # jpg/png in the pack folder counts as a still/frame only if named like one
        if suffix in FRAME_SUFFIXES and (
            "frame" in name or "still" in name or path.parent.name in {"frames", "stills"}
        ):
            hits.append(path)
    return hits


def existing_transcripts(folder: Path) -> list[Path]:
    hits: list[Path] = []
    if not folder.is_dir():
        return hits
    for path in sorted(folder.iterdir()) if folder.is_dir() else []:
        if path.is_file() and path.name.lower() in TRANSCRIPT_NAMES:
            hits.append(path)
    # also accept *transcript*
    for path in sorted(folder.rglob("*transcript*")):
        if path.is_file() and path not in hits:
            hits.append(path)
    return hits


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
