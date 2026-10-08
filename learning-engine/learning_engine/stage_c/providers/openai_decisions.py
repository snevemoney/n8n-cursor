"""OpenAI Decisions. Refuses without --opt-in-live AND OPENAI_API_KEY.

POST https://api.openai.com/v1/decisions
model: gpt-6-luna
Cost is taken from the API response when present; never estimated.
"""

from __future__ import annotations

import json
import time
from typing import Any
from urllib.request import Request

from learning_engine.network import guarded_urlopen, require_live_call
from learning_engine.stage_c.contract import Judgment

OPENAI_URL = "https://api.openai.com/v1/decisions"
OPENAI_MODEL = "gpt-6-luna"
KEY_ENV = "OPENAI_API_KEY"

QUESTIONS = [
    {
        "type": "predicate",
        "name": "useful",
        "instructions": (
            "Is this research signal useful for building or operating software "
            "systems, not leisure or noise?"
        ),
    }
]


def extract_cost_usd(payload: dict[str, Any]) -> float | None:
    for key in ("cost", "cost_usd"):
        value = payload.get(key)
        if isinstance(value, (int, float)):
            return float(value)
    usage = payload.get("usage")
    if isinstance(usage, dict):
        for key in ("cost", "cost_usd"):
            value = usage.get(key)
            if isinstance(value, (int, float)):
                return float(value)
    meta = payload.get("provider_metadata")
    if isinstance(meta, dict):
        gateway = meta.get("gateway")
        if isinstance(gateway, dict) and gateway.get("cost") is not None:
            try:
                return float(gateway["cost"])
            except (TypeError, ValueError):
                return None
    return None


def flagged_from_answers(payload: dict[str, Any]) -> tuple[bool, float | None]:
    answers = payload.get("answers")
    if isinstance(answers, list):
        for item in answers:
            if isinstance(item, dict) and item.get("name") == "useful":
                prob = item.get("probability")
                if isinstance(prob, (int, float)):
                    return float(prob) >= 0.5, float(prob)
    if isinstance(answers, dict):
        useful = answers.get("useful")
        if isinstance(useful, dict):
            prob = useful.get("probability") or useful.get("noul")
            if isinstance(prob, (int, float)):
                return float(prob) >= 0.5, float(prob)
    return False, None


class OpenAIDecisionsProvider:
    name = "openai_decisions"

    def __init__(
        self,
        *,
        opt_in_live: bool = False,
        max_input_tokens: int = 4000,
        timeout_sec: float = 30.0,
    ) -> None:
        self.opt_in_live = opt_in_live
        self.max_input_tokens = max_input_tokens
        self.timeout_sec = timeout_sec

    def evaluate(self, packet: dict[str, Any]) -> Judgment:
        key = require_live_call(flag=self.opt_in_live, env_var=KEY_ENV)
        source_text = str(packet.get("source_text") or "")
        cap_chars = max(32, self.max_input_tokens * 4)
        if len(source_text) > cap_chars:
            source_text = source_text[:cap_chars]
        body = {
            "model": OPENAI_MODEL,
            "input": source_text,
            "questions": QUESTIONS,
        }
        request = Request(
            OPENAI_URL,
            data=json.dumps(body).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        started = time.perf_counter()
        with guarded_urlopen(request, timeout=self.timeout_sec, authorized=True) as resp:
            raw = resp.read().decode("utf-8")
            payload = json.loads(raw) if raw else {}
        latency = (time.perf_counter() - started) * 1000.0
        if not isinstance(payload, dict):
            payload = {"raw": payload}
        flagged, confidence = flagged_from_answers(payload)
        return Judgment(
            signal_id=str(packet.get("signal_id") or ""),
            provider=self.name,
            flagged=flagged,
            label="useful" if flagged else "not_useful",
            confidence=confidence,
            latency_ms=latency,
            cost_usd=extract_cost_usd(payload),
            raw={
                "model": payload.get("model") or OPENAI_MODEL,
                "usage": payload.get("usage"),
                "answers": payload.get("answers"),
            },
            notes="cost_usd taken from the API response when present; never estimated",
        )
