#!/usr/bin/env python3
"""Provider-neutral judgment boundary.

`evaluate` decides who may judge. SELECT builds the OpenRouter chat request
the hive registry already describes. The network call stays behind
HIVE_OPENROUTER_CALL, which defaults off. evaluate does not start a watcher
or turn an external demo corpus into features.

Exact checks stay deterministic: pid alive, row count changed, artifact exists,
process finished, plus the earlier count, output, batch, and error-code reads.
Jev is not called for that state. Jev may only be allowed for a bounded verb:
route, rank, gate, filter, score, react, select. It is not Jarvis's model and
it is not merge authority.
"""
from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import os
import urllib.request
from pathlib import Path
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
PACK_STATUS = "READY_FOR_IMPLEMENTATION_NOT_LIVE"
PACK_CORPUS = Path(__file__).with_name("jev-question-packs-v1.yaml")
OPENROUTER_CALL_GUARD = "HIVE_OPENROUTER_CALL"
SELECT_MODEL_ID = "anthropic/claude-haiku-4-5"


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


def _input_hash(request: dict[str, Any]) -> str:
    payload = json.dumps(request, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def _load_process_packs() -> dict[str, Any] | None:
    """Read process packs from the reconstructed corpus. Status must stay not-live."""
    if not PACK_CORPUS.is_file():
        return None
    status = ""
    version = ""
    packs: dict[str, list[dict[str, str]]] = {}
    section = ""
    current = ""
    open_question: dict[str, str] | None = None

    def finish() -> None:
        nonlocal open_question
        if open_question and current:
            text = open_question["question"]
            if len(text) >= 2 and text[0] == text[-1] and text[0] in {"'", '"'}:
                inner = text[1:-1]
                if text[0] == "'":
                    inner = inner.replace("''", "'")
                open_question["question"] = inner
            packs[current].append(open_question)
        open_question = None

    for raw in PACK_CORPUS.read_text(encoding="utf-8").splitlines():
        if raw.startswith("status:"):
            status = raw.split(":", 1)[1].strip().strip("'\"")
            continue
        if raw.startswith("schema_version:"):
            version = raw.split(":", 1)[1].strip().strip("'\"")
            continue
        if raw == "packs:":
            finish()
            section = "packs"
            current = ""
            continue
        if section == "packs" and raw and not raw.startswith(" "):
            finish()
            section = ""
            current = ""
            continue
        if section != "packs":
            continue
        if raw.startswith("  ") and not raw.startswith("   ") and raw.endswith(":") and not raw.strip().startswith("-"):
            finish()
            current = raw.strip()[:-1]
            packs[current] = []
            continue
        if raw.startswith("    - id:"):
            finish()
            open_question = {"id": raw.split(":", 1)[1].strip(), "question": ""}
            continue
        if open_question is not None and raw.startswith("      question:"):
            open_question["question"] = raw.split(":", 1)[1].strip()
            continue
        if open_question is not None and open_question["question"] and raw.startswith("        "):
            open_question["question"] = f"{open_question['question']} {raw.strip()}"
    finish()
    if status != PACK_STATUS or not packs:
        return None
    return {"status": status, "version": version, "packs": packs}


def _applicable_packs(packs: dict[str, list[dict[str, str]]], request: dict[str, Any]) -> list[str]:
    stage = str(request.get("process_stage") or "").strip()
    names = list(packs)
    if not stage:
        return names
    return [name for name in names if name == stage or name.startswith(f"{stage}.")]


def _smallest_pack(corpus: dict[str, Any], request: dict[str, Any]) -> tuple[str, list[dict[str, str]]] | None:
    packs = corpus["packs"]
    names = _applicable_packs(packs, request)
    if not names:
        return None
    chosen = min(names, key=lambda name: (len(packs[name]), name))
    questions = packs[chosen]
    if not questions:
        return None
    return chosen, questions


def _registry():
    path = Path(__file__).resolve().parents[1] / "sync-vps-llm-keys.py"
    spec = importlib.util.spec_from_file_location("hive_sync_vps_llm_keys", path)
    if spec is None or spec.loader is None:
        return None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _openrouter_call_enabled() -> bool:
    """Default off. Only the exact env value "1" would open the network call."""
    return os.environ.get(OPENROUTER_CALL_GUARD, "") == "1"


def _build_openrouter_chat_request(questions: list[str]) -> dict[str, Any] | None:
    """Build the openai-completions body the OpenRouter registry describes. Does not send."""
    registry = _registry()
    if registry is None:
        return None
    provider = registry.openrouter_provider()
    if provider.get("api") != "openai-completions" or not provider.get("baseUrl"):
        return None
    chosen = next(
        ((model_id, name) for model_id, name in registry.OPENROUTER_MODELS if model_id == SELECT_MODEL_ID),
        None,
    )
    if chosen is None:
        return None
    model_id, name = chosen
    entry = registry.model_entry(model_id, name)
    max_tokens = entry.get("maxTokens")
    if not isinstance(max_tokens, int):
        return None
    body = {
        "model": model_id,
        "max_tokens": max_tokens,
        "messages": [{"role": "user", "content": text} for text in questions],
    }
    return {
        "provider": "openrouter",
        "api": provider["api"],
        "method": "POST",
        "url": str(provider["baseUrl"]).rstrip("/") + "/chat/completions",
        "body": body,
    }


def _post_openrouter_chat(prepared: dict[str, Any]) -> dict[str, Any]:
    """POST with urllib.request. The guard defaults off and does not open a socket."""
    if not _openrouter_call_enabled():
        return {"provider_call": False}
    payload = json.dumps(prepared["body"], separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(
        str(prepared["url"]),
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        resp.read()
    return {"provider_call": True}


def _select_through_boundary(request: dict[str, Any], evidence: list[Any]) -> dict[str, Any]:
    """SELECT the smallest applicable pack, then build the registry chat request."""
    digest = _input_hash(request)
    corpus = _load_process_packs()
    if corpus is None:
        return _out(
            lane="deterministic",
            action="NO_ACTION",
            reason="question pack corpus is not ready for implementation",
            evidence=evidence,
            extra={
                "abstain": True,
                "confidence_band": "C0",
                "input_hash": digest,
                "pack_id": None,
                "question_ids": [],
                "recommended_mode": "SHADOW",
            },
        )
    chosen = _smallest_pack(corpus, request)
    if chosen is None:
        return _out(
            lane="deterministic",
            action="NO_ACTION",
            reason="no applicable question pack",
            evidence=evidence,
            extra={
                "abstain": True,
                "confidence_band": "C0",
                "input_hash": digest,
                "pack_id": None,
                "question_ids": [],
                "pack_status": corpus["status"],
                "recommended_mode": "SHADOW",
            },
        )
    pack_id, questions = chosen
    question_ids = [str(item.get("id") or "") for item in questions]
    question_texts = [str(item.get("question") or "") for item in questions]
    prepared = _build_openrouter_chat_request(question_texts)
    if prepared is None:
        return _out(
            lane="deterministic",
            action="NO_ACTION",
            reason="openrouter registry did not describe a chat request",
            evidence=evidence,
            extra={
                "abstain": True,
                "confidence_band": "C0",
                "input_hash": digest,
                "pack_id": pack_id,
                "question_ids": question_ids,
                "pack_status": corpus["status"],
                "recommended_mode": "SHADOW",
            },
        )
    posted = _post_openrouter_chat(prepared)
    return _out(
        lane="jev",
        action="SELECT",
        reason="smallest applicable pack is the OpenRouter chat request; the guard defaults off so the call is not made",
        evidence=evidence,
        jev_allowed=True,
        verb="select",
        extra={
            "provider": prepared["provider"],
            "provider_call": posted["provider_call"] is True,
            "model": prepared["body"]["model"],
            "max_tokens": prepared["body"]["max_tokens"],
            "api": prepared["api"],
            "chat_request": prepared,
            "guard": OPENROUTER_CALL_GUARD,
            "guard_default": "off",
            "pack_id": pack_id,
            "pack_version": corpus["version"],
            "pack_status": corpus["status"],
            "question_ids": question_ids,
            "input_hash": digest,
            "abstain": False,
            "confidence_raw": None,
            "confidence_calibrated": None,
            "confidence_band": "C0",
            "recommended_mode": "SHADOW",
        },
    )


def evaluate(request: dict[str, Any]) -> dict[str, Any]:
    """Route one judgment. The OpenRouter call stays behind a guard that defaults off."""
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
    if verb == "select":
        return _select_through_boundary(request, evidence)
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
