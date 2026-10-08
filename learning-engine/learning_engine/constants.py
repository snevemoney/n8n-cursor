"""Shared enums for research-packet v0."""

from __future__ import annotations

SCHEMA_VERSION = "research-packet.v0"
JUDGMENT_SCHEMA_VERSION = "judgment.v0"

SOURCE_TYPES = frozenset({"bookmark", "corpus", "youtube_l2", "unknown"})
CONTENT_ACCESS = frozenset({"transcript", "frames", "full_visual", "preview_only", "none"})
ANALYSIS_SCOPE = frozenset({"transcript", "frames", "full_visual", "preview_only", "none"})
EVIDENCE_KINDS = frozenset(
    {"frame", "still", "transcript", "caption", "file", "field", "metadata"}
)
FRAME_EVIDENCE_KINDS = frozenset({"frame", "still"})
VERIFICATION_STATES = frozenset(
    {"verified", "partial", "unverified", "not_applicable", "unknown"}
)
PROCESSING_STATUSES = frozenset({"pending", "ok", "failed", "partial", "unknown"})
LIFECYCLE_STATES = frozenset(
    {
        "discovered",
        "extracted",
        "analyzed",
        "proposed",
        "prototyped",
        "tested",
        "independently_verified",
        "approved",
        "deployed",
        "unknown",
    }
)
USEFULNESS = frozenset({"high", "med", "low", "none"})
USEFUL_VALUES = frozenset({"high", "med"})
KW_UNCLASSIFIED = "unclassified"

# Untrusted source text must not carry directives. These markers prove a mix-up.
INSTRUCTION_MARKERS = (
    "<<<INSTRUCTIONS>>>",
    "---INSTRUCTIONS---",
    "SYSTEM PROMPT:",
    "IGNORE PREVIOUS INSTRUCTIONS",
)
INSTRUCTION_KEYS = frozenset(
    {"instructions", "prompt", "system", "directive", "operator_instructions"}
)

REQUIRED_PACKET_FIELDS = (
    "schema_version",
    "signal_id",
    "source_type",
    "content_access",
    "analysis_scope",
    "claims",
    "evidence",
    "scores",
    "verification_state",
    "processing_status",
    "lifecycle_state",
    "source_text",
)
