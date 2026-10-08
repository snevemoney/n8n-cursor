"""Join REVIEW.csv + STATE.jsonl into labelled rows for the keyword metric."""

from __future__ import annotations

import csv
from pathlib import Path
from typing import Any

from learning_engine.adapters.bookmark_review import load_state
from learning_engine.stage_c.metrics import is_flagged


def load_labelled(review_path: Path, state_path: Path | None) -> list[dict[str, Any]]:
    state_by_id = load_state(state_path)
    rows: list[dict[str, Any]] = []
    with review_path.open(encoding="utf-8", newline="") as handle:
        for raw in csv.DictReader(handle):
            signal_id = str(raw.get("id") or "").strip()
            state = state_by_id.get(signal_id) or {}
            kw = state.get("kw_category")
            rows.append(
                {
                    "signal_id": signal_id,
                    "usefulness": (raw.get("usefulness") or "").strip(),
                    "kw_category": kw,
                    "flagged": is_flagged(kw),
                    "status": state.get("status"),
                    "source_text": raw.get("gist") or "",
                    "review_category": raw.get("category") or "",
                    "verified": raw.get("verified") or "",
                    "source": raw.get("source") or "",
                    "scores": {"kw_category": kw, "usefulness": (raw.get("usefulness") or "").strip()},
                }
            )
    return rows


def labelled_to_packet(row: dict[str, Any]) -> dict[str, Any]:
    """Minimal packet so providers can evaluate labelled review rows."""
    from learning_engine.packet import base_packet, evidence_item

    return base_packet(
        signal_id=row["signal_id"],
        source_type="bookmark",
        content_access="preview_only" if row.get("source") == "preview-only" else "transcript",
        analysis_scope="preview_only" if row.get("source") == "preview-only" else "transcript",
        source_text=str(row.get("source_text") or ""),
        evidence=[evidence_item(kind="field", source_ref="REVIEW.csv:gist")],
        verification_state="unknown",
        processing_status="ok" if str(row.get("status") or "").upper() == "DONE" else "unknown",
        lifecycle_state="analyzed",
        scores=row.get("scores") or {},
    )
