"""Research-packet v0 validator.

Schema file is the contract. This module enforces required fields, enums, and
the honesty rules the schema cannot express: full_visual needs image + video
evidence (by extension), every evidence item names kind + source_ref, and
source_text is not mixed with operator delimiters.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any, Iterable

PNG_MAGIC = b"\x89PNG\r\n\x1a\n"
JPEG_MAGIC = b"\xff\xd8\xff"
GIF87_MAGIC = b"GIF87a"
GIF89_MAGIC = b"GIF89a"
EBML_MAGIC = b"\x1a\x45\xdf\xa3"
FULL_VISUAL_NEEDS_ROOT = (
    "full_visual requires --root so image and video evidence can be checked on disk"
)

from learning_engine.constants import (
    ANALYSIS_SCOPE,
    CONTENT_ACCESS,
    DISK_CHECK_SKIPPED,
    EVIDENCE_KINDS,
    IMAGE_EXTENSIONS,
    INJECTION_RE,
    INSTRUCTION_KEYS,
    INSTRUCTION_MARKERS,
    LIFECYCLE_STATES,
    PROCESSING_STATUSES,
    REQUIRED_PACKET_FIELDS,
    SCHEMA_VERSION,
    SOURCE_TYPES,
    VERIFICATION_STATES,
    VIDEO_EXTENSIONS,
)
from learning_engine.errors import PacketValidationError

SCHEMA_PATH = Path(__file__).resolve().parents[1] / "schema" / "research_packet.v0.json"
INJECTION_PATTERN = re.compile(INJECTION_RE, re.IGNORECASE)


def load_schema() -> dict[str, Any]:
    return json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))


def evidence_suffix(item: dict[str, Any]) -> str:
    ref = str(item.get("source_ref") or "")
    return Path(ref).suffix.lower()


def evidence_exists_true(item: dict[str, Any]) -> bool:
    return item.get("exists") is True


def is_image_evidence(item: dict[str, Any]) -> bool:
    return evidence_exists_true(item) and evidence_suffix(item) in IMAGE_EXTENSIONS


def is_video_evidence(item: dict[str, Any]) -> bool:
    return evidence_exists_true(item) and evidence_suffix(item) in VIDEO_EXTENSIONS


def _resolve_evidence_path(
    ref: str,
    root: Path | None,
    evidence_base: str | None = None,
) -> Path:
    path = Path(ref)
    if path.is_absolute():
        return path
    if root is None:
        return path
    base = evidence_base or "."
    base_path = Path(base)
    if base_path.is_absolute():
        return (base_path / path).resolve()
    return (root / base_path / path).resolve()


def evidence_on_disk(
    item: dict[str, Any],
    root: Path | None,
    evidence_base: str | None = None,
) -> bool:
    if root is None:
        return True
    return _resolve_evidence_path(
        str(item.get("source_ref") or ""),
        root,
        evidence_base,
    ).is_file()


def looks_like_image(data: bytes) -> bool:
    """True when bytes are PNG, JPEG, GIF, or WebP. Extension need not match."""
    if data.startswith(PNG_MAGIC) or data.startswith(JPEG_MAGIC):
        return True
    if data.startswith(GIF87_MAGIC) or data.startswith(GIF89_MAGIC):
        return True
    return len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WEBP"


def looks_like_video(data: bytes, suffix: str) -> bool:
    """MP4/MOV need ftyp; WebM/MKV need EBML; AVI needs RIFF AVI. Else non-empty."""
    if not data:
        return False
    if suffix in {".mp4", ".mov", ".m4v"}:
        return len(data) >= 8 and data[4:8] == b"ftyp"
    if suffix in {".webm", ".mkv"}:
        return data.startswith(EBML_MAGIC)
    if suffix == ".avi":
        return len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"AVI "
    return True


def evidence_media_ok(
    item: dict[str, Any],
    root: Path | None,
    evidence_base: str | None = None,
) -> bool:
    if root is None:
        return True
    path = _resolve_evidence_path(
        str(item.get("source_ref") or ""),
        root,
        evidence_base,
    )
    if not path.is_file():
        return False
    data = path.read_bytes()
    if not data:
        return False
    suffix = evidence_suffix(item)
    if suffix in IMAGE_EXTENSIONS:
        return looks_like_image(data)
    if suffix in VIDEO_EXTENSIONS:
        return looks_like_video(data, suffix)
    return True


def has_frame_evidence(packet: dict[str, Any]) -> bool:
    evidence = packet.get("evidence")
    if not isinstance(evidence, list):
        return False
    return any(isinstance(item, dict) and is_image_evidence(item) for item in evidence)


def has_video_evidence(packet: dict[str, Any]) -> bool:
    evidence = packet.get("evidence")
    if not isinstance(evidence, list):
        return False
    return any(isinstance(item, dict) and is_video_evidence(item) for item in evidence)


def has_full_visual_media(
    packet: dict[str, Any],
    *,
    root: Path | None = None,
) -> bool:
    evidence = packet.get("evidence")
    if not isinstance(evidence, list):
        return False
    image = False
    video = False
    for item in evidence:
        if not isinstance(item, dict):
            continue
        if not evidence_exists_true(item):
            continue
        if root is not None and not evidence_media_ok(
            item, root, packet.get("evidence_base") if isinstance(packet.get("evidence_base"), str) else None
        ):
            continue
        suffix = evidence_suffix(item)
        if suffix in IMAGE_EXTENSIONS:
            image = True
        if suffix in VIDEO_EXTENSIONS:
            video = True
    return image and video


def count_false_full_visual(
    packets: Iterable[dict[str, Any]],
    *,
    root: Path | None = None,
) -> int:
    n = 0
    for packet in packets:
        access = packet.get("content_access")
        scope = packet.get("analysis_scope")
        if access == "full_visual" or scope == "full_visual":
            if not has_full_visual_media(packet, root=root):
                n += 1
    return n


def _reject_mixed_source(source_text: Any, path: str) -> None:
    if isinstance(source_text, dict):
        mixed = INSTRUCTION_KEYS.intersection(source_text.keys())
        if mixed:
            raise PacketValidationError(
                "source_text must not contain instruction/prompt keys; "
                f"move {sorted(mixed)} to operator_instructions",
                path,
            )
        text = source_text.get("text")
        if isinstance(text, str):
            _reject_markers(text, path)
        return
    if isinstance(source_text, str):
        _reject_markers(source_text, path)
        return
    raise PacketValidationError("source_text must be a string", path)


def _reject_markers(text: str, path: str) -> None:
    upper = text.upper()
    for marker in INSTRUCTION_MARKERS:
        if marker in text or marker in upper:
            raise PacketValidationError(
                "source_text contains instruction markers; untrusted source "
                "must stay separate from directives",
                path,
            )


def _source_text_str(source_text: Any) -> str:
    if isinstance(source_text, str):
        return source_text
    if isinstance(source_text, dict) and isinstance(source_text.get("text"), str):
        return str(source_text["text"])
    return ""


def validate_packet(
    packet: Any,
    *,
    path: str = "$",
    root: Path | str | None = None,
    warnings: list[str] | None = None,
    evidence_root: Path | str | None = None,
) -> dict[str, Any]:
    if not isinstance(packet, dict):
        raise PacketValidationError("packet must be an object", path)
    warn = warnings if warnings is not None else []
    disk_root: Path | None = None
    raw_root = root if root is not None else evidence_root
    if raw_root is not None:
        disk_root = Path(raw_root)
    elif warnings is not None:
        if DISK_CHECK_SKIPPED not in warn:
            warn.append(DISK_CHECK_SKIPPED)
    for field in REQUIRED_PACKET_FIELDS:
        if field not in packet:
            raise PacketValidationError(f"missing required field {field}", path)
    if packet.get("schema_version") != SCHEMA_VERSION:
        raise PacketValidationError(
            f"schema_version must be {SCHEMA_VERSION}", f"{path}.schema_version"
        )
    signal_id = packet.get("signal_id")
    if not isinstance(signal_id, str) or not signal_id.strip():
        raise PacketValidationError("signal_id must be a non-empty string", f"{path}.signal_id")
    if packet.get("source_type") not in SOURCE_TYPES:
        raise PacketValidationError("invalid source_type", f"{path}.source_type")
    if packet.get("content_access") not in CONTENT_ACCESS:
        raise PacketValidationError("invalid content_access", f"{path}.content_access")
    if packet.get("analysis_scope") not in ANALYSIS_SCOPE:
        raise PacketValidationError("invalid analysis_scope", f"{path}.analysis_scope")
    if packet.get("verification_state") not in VERIFICATION_STATES:
        raise PacketValidationError("invalid verification_state", f"{path}.verification_state")
    if packet.get("processing_status") not in PROCESSING_STATUSES:
        raise PacketValidationError("invalid processing_status", f"{path}.processing_status")
    if packet.get("lifecycle_state") not in LIFECYCLE_STATES:
        raise PacketValidationError("invalid lifecycle_state", f"{path}.lifecycle_state")
    if "source_url" in packet:
        url = packet.get("source_url")
        if not isinstance(url, str) or not url.strip():
            raise PacketValidationError(
                "source_url if present must be a non-empty string from the input",
                f"{path}.source_url",
            )

    _reject_mixed_source(packet.get("source_text"), f"{path}.source_text")
    derived = packet.get("derived") if isinstance(packet.get("derived"), dict) else {}
    reviewer = derived.get("reviewer_summary")
    if isinstance(reviewer, str) and reviewer:
        _reject_markers(reviewer, f"{path}.derived.reviewer_summary")
    source_blob = _source_text_str(packet.get("source_text"))
    if INJECTION_PATTERN.search(source_blob):
        packet["injection_suspect"] = True
        warn.append(f"{path}: injection_suspect (jailbreak phrasing in source_text)")

    if packet.get("transcript_quality") == "suspect_hallucination":
        warn.append(f"{path}: transcript_quality=suspect_hallucination")

    scores = packet.get("scores")
    if not isinstance(scores, dict):
        raise PacketValidationError("scores must be an object", f"{path}.scores")

    claims = packet.get("claims")
    if not isinstance(claims, list):
        raise PacketValidationError("claims must be an array", f"{path}.claims")
    for i, claim in enumerate(claims):
        cpath = f"{path}.claims[{i}]"
        if not isinstance(claim, dict):
            raise PacketValidationError("claim must be an object", cpath)
        if not isinstance(claim.get("text"), str) or not claim["text"].strip():
            raise PacketValidationError("claim.text required", cpath)
        refs = claim.get("support_refs")
        if not isinstance(refs, list) or not all(isinstance(r, str) and r.strip() for r in refs):
            raise PacketValidationError("claim.support_refs must be non-empty strings", cpath)

    evidence = packet.get("evidence")
    if not isinstance(evidence, list):
        raise PacketValidationError("evidence must be an array", f"{path}.evidence")
    for i, item in enumerate(evidence):
        epath = f"{path}.evidence[{i}]"
        if not isinstance(item, dict):
            raise PacketValidationError("evidence item must be an object", epath)
        if item.get("kind") not in EVIDENCE_KINDS:
            raise PacketValidationError("evidence.kind required and known", epath)
        ref = item.get("source_ref")
        if not isinstance(ref, str) or not ref.strip():
            raise PacketValidationError(
                "evidence.source_ref required (path on disk or named input field)",
                epath,
            )
        if item.get("exists") is False:
            raise PacketValidationError(
                "fabricated evidence: source_ref marked exists=false",
                epath,
            )

    if packet.get("content_access") == "full_visual" or packet.get("analysis_scope") == "full_visual":
        if disk_root is None:
            raise PacketValidationError(FULL_VISUAL_NEEDS_ROOT, path)
        if not has_full_visual_media(packet, root=disk_root):
            raise PacketValidationError(
                "full_visual requires at least one image-extension evidence ref "
                "(jpg/jpeg/png/webp) and one video-extension evidence ref "
                "(mp4/webm/mov/mkv/m4v/avi), both exists=true, present on disk, non-empty, "
                "and with recognisable media bytes "
                "(image: PNG/JPEG/GIF/WebP magic; video: MP4/MOV ftyp, WebM/MKV EBML, "
                "AVI RIFF; other video extensions: non-empty)",
                path,
            )

    if warnings is None and warn:
        packet.setdefault("notes", [])
        if isinstance(packet.get("notes"), list):
            for item in warn:
                if item not in packet["notes"]:
                    packet["notes"].append(item)
    return packet


def validate_packets(
    packets: Iterable[Any],
    *,
    root: Path | str | None = None,
    warnings: list[str] | None = None,
) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for i, packet in enumerate(packets):
        out.append(validate_packet(packet, path=f"$[{i}]", root=root, warnings=warnings))
    return out
