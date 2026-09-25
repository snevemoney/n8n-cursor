#!/usr/bin/env python3
"""Shared fleet closure projection for the 17 Grok desks.

The desks stay specialized. This module is the state they share, read from
the repo, not from the stale Outer Heaven cache or a chat transcript.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
CLOSURE_PATH = Path(__file__).with_name("fleet-closures.json")
RESEARCHER_ADOPTION = (
    ROOT / "docs/hive/outer-heaven/CONTENT/os/researcher-adoption.json"
)
CONN_PATH = Path.home() / ".grokbot/local-exec-daemon-connection.json"

EMPTY_ICP = frozenset({"", "none", "(none)", "null", "parked"})
TRACE_HOPS = ("request", "context_pack", "skills", "why_selected", "behavior")
LEAD_HUNTER_STOP = (
    "IGNORE",
    "OPERATOR_FOCUS.icp_id empty — Lead Hunter NO_ACTION (do not hunt random ICP)",
)


def load_closures(path: Path | None = None) -> dict:
    src = path or CLOSURE_PATH
    return json.loads(src.read_text(encoding="utf-8"))


def researcher_adopted(path: Path | None = None) -> int:
    src = path or RESEARCHER_ADOPTION
    data = json.loads(src.read_text(encoding="utf-8"))
    return int(data.get("adopted", 0))


def lead_hunter_decision(icp: str | None) -> tuple[str, str] | None:
    """None means the ICP gate is open. A value means stop."""
    token = (icp or "").strip().lower()
    if token in EMPTY_ICP:
        return LEAD_HUNTER_STOP
    return None


def wait_evens_is_interrupt() -> bool:
    return False


def product_proof_is_market_proof() -> bool:
    return False


def invented_metric_allowed() -> bool:
    return False


def method_label_is_adopted(label: str, outcome: dict | None = None) -> bool:
    """A batch label or PREVIOUSLY_ADOPTED row is not adoption."""
    if not isinstance(outcome, dict):
        return False
    if outcome.get("adopted") is not True:
        return False
    evidence = str(outcome.get("evidence") or "").strip()
    if not evidence:
        return False
    normalized = (label or "").strip().lower().replace(" ", "_")
    if normalized in {"previously_adopted", "adopted+needs_verification"}:
        return False
    return normalized == "adopted"


def creative_trace_gaps(trace: dict | None) -> list[str]:
    if not isinstance(trace, dict):
        return list(TRACE_HOPS)
    missing = []
    for hop in TRACE_HOPS:
        if not str(trace.get(hop) or "").strip():
            missing.append(hop)
    return missing


def mutation_authorized(actor: str, authority: dict | None = None) -> bool:
    """Desk names do not grant a vault-config write. Evens's own dated job does."""
    del actor
    if not isinstance(authority, dict):
        return False
    if str(authority.get("via") or "").strip():
        return False
    if str(authority.get("source") or "").strip().lower() != "evens":
        return False
    if not str(authority.get("job_id") or "").strip():
        return False
    if not str(authority.get("dated") or "").strip():
        return False
    return True


def calendar_mutate_allowed() -> bool:
    return False


def other_agent_has_routine(keys: set[str] | list[str], agent_id: str, name: str) -> bool:
    """True when a different agent id already holds this routine name."""
    own = f"{agent_id}:{name}"
    for key in keys:
        if key == own:
            continue
        if key.split(":", 1)[-1] == name:
            return True
    return False


def duplicate_routine_names(keys: list[str]) -> list[str]:
    seen: dict[str, int] = {}
    for key in keys:
        name = key.split(":", 1)[-1]
        seen[name] = seen.get(name, 0) + 1
    return sorted(name for name, count in seen.items() if count > 1)


def gateway_endpoint(conn: dict | None) -> tuple[str, dict[str, str]] | None:
    """Return (base, headers) or None. Does not read the sealed blob."""
    if not isinstance(conn, dict):
        return None
    base = conn.get("baseUrl")
    token = conn.get("token")
    if not isinstance(base, str) or not base.strip():
        return None
    if not isinstance(token, str) or not token.strip():
        return None
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    extra = conn.get("headers")
    if isinstance(extra, dict):
        headers.update({str(k): str(v) for k, v in extra.items()})
    return base.rstrip("/"), headers


def child_executor_allowed(conn: dict | None = None, path: Path | None = None) -> bool:
    if conn is None:
        src = path or CONN_PATH
        if not src.is_file():
            return False
        try:
            conn = json.loads(src.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return False
    return gateway_endpoint(conn) is not None


def render_for(agent: str, *, data: dict | None = None, icp: str | None = None) -> str:
    payload = data if data is not None else load_closures()
    lines = ["Shared state (this desk only; the job card still owns the lane)."]
    for line in payload.get("shared") or []:
        lines.append(f"- {line}")
    for row in payload.get("closures") or []:
        desks = row.get("desks") or []
        if agent not in desks:
            continue
        lines.append(f"- {row.get('text', '').strip()}")
    if agent == "Lead Hunter" and lead_hunter_decision(icp) is not None:
        lines.append("- Gate: NO_ACTION until OPERATOR_FOCUS.icp_id is a real id.")
    if agent == "Researcher":
        lines.append(f"- Durable adopted count: {researcher_adopted()}.")
    if agent == "Creative Studio":
        gaps = creative_trace_gaps(None)
        lines.append(f"- Trace missing: {', '.join(gaps)}.")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Fleet closure projection")
    parser.add_argument("--agent", default="", help="Render the slice for one desk")
    parser.add_argument("--child-executor", action="store_true")
    args = parser.parse_args()
    if args.child_executor:
        if child_executor_allowed():
            print("OK: gateway can dispatch")
            return 0
        print(
            "NO_ACTION: gateway connection has no baseUrl — child executor not started",
            file=sys.stderr,
        )
        return 2
    if args.agent:
        print(render_for(args.agent))
        return 0
    parser.print_help()
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
