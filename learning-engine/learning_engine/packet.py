"""Honest packet construction. Missing input → omit or unknown. Never guess."""

from __future__ import annotations

from typing import Any

from learning_engine.constants import SCHEMA_VERSION


def evidence_item(
    *,
    kind: str,
    source_ref: str,
    exists: bool | None = True,
    note: str | None = None,
) -> dict[str, Any]:
    item: dict[str, Any] = {"kind": kind, "source_ref": source_ref}
    if exists is not None:
        item["exists"] = exists
    if note:
        item["note"] = note
    return item


def claim(text: str, support_refs: list[str]) -> dict[str, Any]:
    return {"text": text, "support_refs": list(support_refs)}


def base_packet(
    *,
    signal_id: str,
    source_type: str,
    content_access: str,
    analysis_scope: str,
    source_text: str,
    evidence: list[dict[str, Any]],
    verification_state: str,
    processing_status: str,
    lifecycle_state: str,
    scores: dict[str, Any] | None = None,
    claims: list[dict[str, Any]] | None = None,
    source_url: str | None = None,
    source_author: str | None = None,
    retrieved_at: str | None = None,
    adapter: str | None = None,
    input_ref: str | None = None,
    extra: dict[str, Any] | None = None,
) -> dict[str, Any]:
    packet: dict[str, Any] = {
        "schema_version": SCHEMA_VERSION,
        "signal_id": signal_id,
        "source_type": source_type,
        "content_access": content_access,
        "analysis_scope": analysis_scope,
        "source_text": source_text if source_text is not None else "",
        "claims": claims or [],
        "evidence": evidence,
        "scores": scores or {},
        "verification_state": verification_state,
        "processing_status": processing_status,
        "lifecycle_state": lifecycle_state,
    }
    if source_url:
        packet["source_url"] = source_url
    if source_author:
        packet["source_author"] = source_author
    if retrieved_at:
        packet["retrieved_at"] = retrieved_at
    if adapter:
        packet["adapter"] = adapter
    if input_ref:
        packet["input_ref"] = input_ref
    if extra:
        for key, value in extra.items():
            if value is not None:
                packet[key] = value
    return packet
