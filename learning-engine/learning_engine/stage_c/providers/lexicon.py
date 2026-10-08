"""Lexicon / decision-gate baseline. Self-contained. Cost 0."""

from __future__ import annotations

import time
from typing import Any

from learning_engine.stage_c.contract import Judgment

CHEAP_USEFUL = (
    "agent",
    "harness",
    "verifier",
    "eval",
    "workflow",
    "cursor",
    "n8n",
    "api",
    "model",
    "skill",
    "packet",
    "transcript",
    "keyframe",
    "prompt",
    "cli",
    "schema",
    "adapter",
    "baseline",
)
NOISE = (
    "tv series",
    "recommendation",
    "leisure",
    "recipe",
    "vacation",
    "meme",
    "concert",
    "sports score",
)


class LexiconProvider:
    name = "lexicon_gate"

    def evaluate(self, packet: dict[str, Any]) -> Judgment:
        started = time.perf_counter()
        text = str(packet.get("source_text") or "").lower()
        useful_hits = [w for w in CHEAP_USEFUL if w in text]
        noise_hits = [w for w in NOISE if w in text]
        score = len(useful_hits) - (2 * len(noise_hits))
        flagged = score >= 1
        latency = (time.perf_counter() - started) * 1000.0
        return Judgment(
            signal_id=str(packet.get("signal_id") or ""),
            provider=self.name,
            flagged=flagged,
            label="useful" if flagged else "noise",
            confidence=min(1.0, max(0.0, 0.5 + 0.1 * score)),
            latency_ms=latency,
            cost_usd=0.0,
            raw={
                "useful_hits": useful_hits,
                "noise_hits": noise_hits,
                "score": score,
                "gate": "escalate" if flagged else "cheap_skip",
            },
            notes="local lexicon decision-gate; not keyword_replay",
        )
