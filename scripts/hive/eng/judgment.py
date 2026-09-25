#!/usr/bin/env python3
"""Provider-neutral judgment boundary.

`evaluate` decides who may judge. It does not call a model, start a watcher,
or turn an external demo corpus into features.

Exact checks stay deterministic: pid alive, row count changed, artifact exists,
process finished, plus the earlier count, output, batch, and error-code reads.
Jev is not called for that state. Jev may only be allowed for a bounded verb:
route, rank, gate, filter, score, react, select. It is not Jarvis's model and
it is not merge authority.
"""
from __future__ import annotations

import argparse
import json
import sys
from typing import Any

EXACT_CHECKS = frozenset(
    {
        "pid_alive",
        "count_increased",
        "row_count_changed",
        "output_stopped",
        "batch_finished",
        "process_finished",
        "artifact_appeared",
        "artifact_exists",
        "error_code",
    }
)
JEV_VERBS = frozenset({"route", "rank", "gate", "filter", "score", "react", "select"})
ABSTAIN = frozenset({"NO_ACTION", "WAIT", "ASK", "ESCALATE"})
FORBIDDEN_ROLES = frozenset(
    {
        "brain",
        "jarvis_brain",
        "jarvis_model",
        "jarvis",
        "authority",
        "code_generator",
        "researcher",
        "conversation",
        "research",
        "architecture",
        "coding",
        "merge_authority",
        "merge",
    }
)
CLOSED_KINDS = frozenset({"conversation", "research", "architecture", "coding", "authority"})
QUESTION_PACK_CAP = 12
LIBRARY_SIZE = 273
DEMO_CORPUS_URL = "https://webdevcody.github.io/jev-demos/"


def corpus_features(corpus: dict[str, Any]) -> dict[str, Any]:
    """An external demo corpus is a signal. It is not a feature list."""
    demos = corpus.get("demos") if isinstance(corpus.get("demos"), list) else []
    external = corpus.get("signal_class") == "EXTERNAL_SIGNAL" or corpus.get("kind") == "demo_corpus"
    if not external:
        return {
            "features": [],
            "jobs": [],
            "refused": False,
            "reason": "not a demo corpus",
            "count": len(demos),
            "jev_called": False,
        }
    return {
        "features": [],
        "jobs": [],
        "refused": True,
        "reason": "external demo corpus cannot become a feature list",
        "count": len(demos),
        "url": corpus.get("url") or DEMO_CORPUS_URL,
        "jev_called": False,
        "provider_call": False,
        "confidence_is_evidence": False,
    }


def _role(request: dict[str, Any]) -> str:
    return str(request.get("role") or "").strip().lower().replace(" ", "_").replace("-", "_")


def _evidence(request: dict[str, Any]) -> list[Any]:
    raw = request.get("evidence")
    if not isinstance(raw, list):
        return []
    kept: list[Any] = []
    for item in raw:
        if item == "confidence":
            continue
        if isinstance(item, dict) and item.get("kind") == "confidence":
            continue
        kept.append(item)
    return kept


def _out(
    *,
    lane: str,
    action: str,
    reason: str,
    evidence: list[Any] | None = None,
    jev_allowed: bool = False,
    verb: str | None = None,
    repair: str | None = None,
    stop: str | None = None,
    facts: dict[str, Any] | None = None,
    extra: dict[str, Any] | None = None,
) -> dict[str, Any]:
    body: dict[str, Any] = {
        "lane": lane,
        "action": action,
        "reason": reason,
        "jev_called": False,
        "jev_allowed": jev_allowed,
        "verb": verb if jev_allowed else None,
        "provider": None,
        "provider_call": False,
        "confidence_is_evidence": False,
        "evidence": evidence or [],
        "repair": repair,
        "stop": stop,
        "facts": facts or {},
    }
    if extra:
        body.update(extra)
    return body


def _catastrophic(request: dict[str, Any]) -> bool:
    if request.get("catastrophic") is True:
        kind = str(request.get("failure_class") or request.get("kind") or "").lower()
        return kind in {"safety", "authority", "catastrophic"}
    return str(request.get("failure_class") or "").lower() in {"safety", "authority"} and request.get(
        "catastrophic"
    ) is True


def _closed_use(request: dict[str, Any]) -> bool:
    """Conversation, research, architecture, coding, and authority stay off Jev.

    Jev is not Jarvis's model and it is not merge authority.
    """
    if request.get("merge_authority") is True or request.get("jarvis_model") is True:
        return True
    if request.get("jarvis") is True and str(request.get("model") or "").strip().lower() == "jev":
        return True
    kind = str(request.get("kind") or "").strip().lower().replace(" ", "_").replace("-", "_")
    return kind in CLOSED_KINDS


def _has_exact_state(request: dict[str, Any]) -> bool:
    if any(
        key in request
        for key in (
            "pid_alive",
            "count",
            "previous_count",
            "count_increased",
            "row_count",
            "previous_row_count",
            "row_count_changed",
            "output_stopped",
            "batch_finished",
            "process_finished",
            "artifact_appeared",
            "artifact_exists",
            "error_code",
            "stall_line",
            "unchanged_ticks",
        )
    ):
        return True
    checks = request.get("checks")
    if isinstance(checks, list) and EXACT_CHECKS.intersection(str(item) for item in checks):
        return True
    return False


def _similar_failures(request: dict[str, Any]) -> bool:
    failures = request.get("failures")
    if not isinstance(failures, list) or len(failures) < 10:
        return False
    signatures: list[str] = []
    for item in failures:
        if isinstance(item, dict):
            signatures.append(str(item.get("signature") or ""))
        else:
            signatures.append(str(item))
    return bool(signatures) and len(set(signatures)) == 1 and bool(signatures[0])


def _questions_refused(request: dict[str, Any]) -> dict[str, Any] | None:
    questions = request.get("questions")
    library = request.get("library_size")
    size = library if isinstance(library, int) and library > 0 else LIBRARY_SIZE
    count = len(questions) if isinstance(questions, list) else 0
    ask_all = request.get("ask_all") is True or count >= size
    over_pack = count > QUESTION_PACK_CAP
    if not ask_all and not over_pack:
        return None
    return _out(
        lane="deterministic",
        action="NO_ACTION",
        reason="question library is not asked in full",
        evidence=_evidence(request),
        extra={"questions_asked": 0, "library_size": size},
    )


def _exact(request: dict[str, Any], evidence: list[Any]) -> dict[str, Any]:
    pid_alive = request.get("pid_alive")
    count = request.get("count")
    if count is None:
        count = request.get("row_count")
    previous = request.get("previous_count")
    if previous is None:
        previous = request.get("previous_row_count")
    increased = request.get("count_increased")
    if increased is None and isinstance(count, (int, float)) and isinstance(previous, (int, float)):
        increased = count > previous
    unchanged = (
        isinstance(count, (int, float))
        and isinstance(previous, (int, float))
        and count == previous
    )
    changed = request.get("row_count_changed")
    if isinstance(count, (int, float)) and isinstance(previous, (int, float)):
        changed = count != previous
    stall_line = request.get("stall_line")
    unchanged_ticks = request.get("unchanged_ticks")
    past_stall = (
        isinstance(stall_line, int)
        and isinstance(unchanged_ticks, int)
        and unchanged_ticks > stall_line
    )
    facts = {
        "pid_alive": pid_alive is True,
        "count_increased": increased is True,
        "count_unchanged": unchanged,
        "past_stall": past_stall,
        "output_stopped": request.get("output_stopped") is True,
        "batch_finished": request.get("batch_finished") is True,
        "row_count_changed": changed is True,
        "artifact_appeared": request.get("artifact_appeared") is True,
        "artifact_exists": request.get("artifact_exists") is True or request.get("artifact_appeared") is True,
        "process_finished": request.get("process_finished") is True
        or request.get("batch_finished") is True
        or request.get("output_stopped") is True,
        "error_code": request.get("error_code") if "error_code" in request else None,
    }
    if pid_alive is True and increased is True:
        return _out(
            lane="deterministic",
            action="MONITOR",
            reason="pid alive and count increasing; deterministic monitor",
            evidence=evidence,
            facts=facts,
        )
    if pid_alive is True and unchanged and past_stall:
        return _out(
            lane="deterministic",
            action="STALL",
            reason="pid alive and count unchanged past the stall line; deterministic stall",
            evidence=evidence,
            repair="start",
            facts=facts,
        )
    return _out(
        lane="deterministic",
        action="READ",
        reason="exact state is read deterministically",
        evidence=evidence,
        facts=facts,
    )


def _rank(request: dict[str, Any], evidence: list[Any], reason: str) -> dict[str, Any]:
    return _out(
        lane="jev",
        action="RANK",
        reason=reason,
        evidence=evidence,
        jev_allowed=True,
        verb="rank",
        extra={"cluster": True},
    )


def evaluate(request: dict[str, Any]) -> dict[str, Any]:
    """Route one judgment. Never calls a provider."""
    if not isinstance(request, dict):
        return _out(lane="deterministic", action="NO_ACTION", reason="request must be an object")

    role = _role(request)
    if role in FORBIDDEN_ROLES:
        return _out(
            lane="human",
            action="ESCALATE",
            reason="Jev is not Jarvis's model, merge authority, a coder, or a researcher",
            evidence=_evidence(request),
        )

    corpus = request.get("corpus")
    if isinstance(corpus, dict):
        decision = corpus_features(corpus)
        if decision["refused"]:
            decision["lane"] = "deterministic"
            decision["action"] = "NO_ACTION"
            return decision

    refused = _questions_refused(request)
    if refused is not None:
        return refused

    evidence = _evidence(request)
    if _catastrophic(request):
        return _out(
            lane="deterministic",
            action="STOP",
            reason="deterministic gate stops the run; Jev is not the stop",
            evidence=evidence,
            stop="gate",
        )

    if _has_exact_state(request):
        return _exact(request, evidence)

    if _closed_use(request):
        return _out(
            lane="human",
            action="ESCALATE",
            reason="Jev is not used for conversation, research, architecture, coding, or authority",
            evidence=evidence,
        )

    if _similar_failures(request):
        return _rank(request, evidence, "similar failures may be clustered and ranked")

    clusters = request.get("repair_clusters")
    if isinstance(clusters, list) and len(clusters) >= 2:
        safe = all(isinstance(item, dict) and item.get("safe") is True for item in clusters)
        if safe and request.get("clear_winner") is False:
            return _rank(request, evidence, "safe repair clusters have no clear winner")
        if safe and request.get("clear_winner") is True:
            winner = next(
                (item.get("id") for item in clusters if isinstance(item, dict) and item.get("winner") is True),
                None,
            )
            return _out(
                lane="deterministic",
                action="READ",
                reason="a clear winner is an exact pick",
                evidence=evidence,
                facts={"winner": winner},
            )
        if not safe:
            return _out(
                lane="deterministic",
                action="ESCALATE",
                reason="an unsafe repair cluster is not sent to Jev",
                evidence=evidence,
            )

    kind = str(request.get("kind") or "").lower()
    if kind in {"open", "generation"}:
        return _out(
            lane="frontier",
            action="WAIT",
            reason="open generation is a frontier model",
            evidence=evidence,
        )
    if request.get("authority_required") is True or kind == "authority":
        return _out(
            lane="human",
            action="ESCALATE",
            reason="authority stays with a human",
            evidence=evidence,
        )

    verb = str(request.get("verb") or "").lower()
    if verb in JEV_VERBS:
        return _out(
            lane="jev",
            action=verb.upper(),
            reason="bounded judgment may use Jev",
            evidence=evidence,
            jev_allowed=True,
            verb=verb,
        )

    action = str(request.get("action") or "")
    if action in ABSTAIN:
        return _out(lane="deterministic", action=action, reason="abstain is a valid output", evidence=evidence)

    if request.get("confidence") is not None and not evidence:
        return _out(
            lane="deterministic",
            action="NO_ACTION",
            reason="confidence is not evidence",
            evidence=[],
        )

    questions = request.get("questions")
    if isinstance(questions, list) and 0 < len(questions) <= QUESTION_PACK_CAP:
        return _out(
            lane="deterministic",
            action="ASK",
            reason="a question pack is a library draw",
            evidence=evidence,
            extra={"questions_asked": len(questions), "library_size": LIBRARY_SIZE},
        )

    return _out(lane="deterministic", action="NO_ACTION", reason="nothing to judge", evidence=evidence)


def main() -> int:
    parser = argparse.ArgumentParser(description="Provider-neutral judgment boundary")
    parser.add_argument("--json", required=True, help="One judgment request as JSON")
    args = parser.parse_args()
    try:
        request = json.loads(args.json)
    except json.JSONDecodeError:
        print(json.dumps({"action": "NO_ACTION", "reason": "invalid json", "jev_called": False}))
        return 1
    decision = evaluate(request) if isinstance(request, dict) else evaluate({})
    print(json.dumps(decision, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
