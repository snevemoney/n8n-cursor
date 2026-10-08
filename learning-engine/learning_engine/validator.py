"""Research-packet v0 validator.

Schema file is the contract. This module enforces required fields, enums, and
the honesty rules the schema cannot express: full_visual needs frame evidence,
every evidence item names kind + source_ref, and source_text is not a prompt.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Iterable

from learning_engine.constants import (
    ANALYSIS_SCOPE,
    CONTENT_ACCESS,
    EVIDENCE_KINDS,
    FRAME_EVIDENCE_KINDS,
    INSTRUCTION_KEYS,
    INSTRUCTION_MARKERS,
    LIFECYCLE_STATES,
    PROCESSING_STATUSES,
    REQUIRED_PACKET_FIELDS,
    SCHEMA_VERSION,
    SOURCE_TYPES,
    VERIFICATION_STATES,
)
from learning_engine.errors import PacketValidationError

SCHEMA_PATH = Path(__file__).resolve().parents[1] / "schema" / "research_packet.v0.json"


def load_schema() -> dict[str, Any]:
    return json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))


def _is_frame_evidence(item: dict[str, Any]) -> bool:
    kind = item.get("kind")
    if kind in FRAME_EVIDENCE_KINDS:
        return True
    if kind == "file":
        ref = str(item.get("source_ref") or "").lower()
        return any(token in ref for token in ("frame", "still", ".jpg", ".jpeg", ".png"))
    return False


def has_frame_evidence(packet: dict[str, Any]) -> bool:
    evidence = packet.get("evidence")
    if not isinstance(evidence, list):
        return False
    return any(isinstance(item, dict) and _is_frame_evidence(item) for item in evidence)


def count_false_full_visual(packets: Iterable[dict[str, Any]]) -> int:
    n = 0
    for packet in packets:
        access = packet.get("content_access")
        scope = packet.get("analysis_scope")
        if access == "full_visual" or scope == "full_visual":
            if not has_frame_evidence(packet):
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


def validate_packet(packet: Any, *, path: str = "$") -> dict[str, Any]:
    if not isinstance(packet, dict):
        raise PacketValidationError("packet must be an object", path)
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
        if not has_frame_evidence(packet):
            raise PacketValidationError(
                "full_visual requires at least one frame/still evidence ref",
                path,
            )

    return packet


def validate_packets(packets: Iterable[Any]) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for i, packet in enumerate(packets):
        out.append(validate_packet(packet, path=f"$[{i}]"))
    return out
