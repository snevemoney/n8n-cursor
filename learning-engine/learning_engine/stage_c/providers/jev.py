"""Jev via OpenRouter Decisions. Refuses without --opt-in-live AND OPENROUTER_API_KEY.

POST https://openrouter.ai/api/alpha/decisions
model: typesafe/jev-1.13
Cost is taken from the API response usage.cost, never estimated.
No live calls in tests or CI. State is source_text only (untrusted).
"""

from __future__ import annotations

import json
import os
import time
from typing import Any
from urllib.request import Request

from learning_engine.errors import ProviderRefused
from learning_engine.network import ALLOW_NETWORK_ENV, guarded_urlopen, require_live_call
from learning_engine.stage_c.contract import Judgment

JEV_URL = "https://openrouter.ai/api/alpha/decisions"
JEV_MODEL = "typesafe/jev-1.13"
KEY_ENV = "OPENROUTER_API_KEY"

USEFUL_QUESTION = {
    "useful": {
        "type": "noul",
        "instructions": (
            "Is this research signal useful for building or operating software "
            "systems (harness, tool, model/API, workflow), not leisure or noise?"
        ),
        "criteria": {
            "true": "Reusable building lesson, harness, tool, model, or workflow signal.",
            "false": "Leisure, entertainment, empty preview, or no building lesson.",
        },
    }
}


def extract_cost_usd(payload: dict[str, Any]) -> float | None:
    """Billed cost from the response. None if the API omitted it (do not estimate)."""
    usage = payload.get("usage")
    if isinstance(usage, dict):
        for key in ("cost", "cost_usd", "total_cost"):
            value = usage.get(key)
            if isinstance(value, (int, float)):
                return float(value)
    return None


def flagged_from_answers(payload: dict[str, Any]) -> tuple[bool, float | None]:
    answers = payload.get("answers")
    if not isinstance(answers, dict):
        return False, None
    useful = answers.get("useful")
    if not isinstance(useful, dict):
        return False, None
    noul = useful.get("noul")
    if isinstance(noul, (int, float)):
        return float(noul) >= 0.5, float(noul)
    return False, None


class JevOpenRouterProvider:
    name = "jev_openrouter"

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
        os.environ[ALLOW_NETWORK_ENV] = "1"
        source_text = str(packet.get("source_text") or "")
        # Hard cap: drop characters rather than guess a tokenizer.
        # ~4 chars/token is only used as a cap, not as a billed cost.
        cap_chars = max(32, self.max_input_tokens * 4)
        if len(source_text) > cap_chars:
            source_text = source_text[:cap_chars]
        body = {
            "model": JEV_MODEL,
            "state": {"source_text": source_text, "signal_id": packet.get("signal_id")},
            "questions": USEFUL_QUESTION,
        }
        request = Request(
            JEV_URL,
            data=json.dumps(body).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        started = time.perf_counter()
        try:
            with guarded_urlopen(request, timeout=self.timeout_sec) as resp:
                raw = resp.read().decode("utf-8")
                payload = json.loads(raw) if raw else {}
        except ProviderRefused:
            raise
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
                "model": payload.get("model") or JEV_MODEL,
                "id": payload.get("id"),
                "usage": payload.get("usage"),
                "answers": payload.get("answers"),
            },
            notes="cost_usd is usage.cost from the API; never estimated",
        )
