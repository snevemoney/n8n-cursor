"""Keyword baseline.

--mode replay: use the stored kw_category label exactly as FORMATS-SYNTHETIC.md
defines. This is the baseline that must hit the operator-box reference numbers.

--mode rules: a separate, optional rules-based classifier. It is a different
baseline and is not expected to reproduce 0.706 / 0.223.
"""

from __future__ import annotations

import time
from typing import Any

from learning_engine.stage_c.contract import Judgment
from learning_engine.stage_c.metrics import is_flagged

# Small self-contained lexicons for --mode rules only.
RULE_CATEGORIES: list[tuple[str, tuple[str, ...]]] = [
    ("harness", ("verifier", "fresh context", "eval harness", "hold-out", "watchdog")),
    ("motion/video", ("after effects", "keyframes", "remotion", "timeline", "seedance")),
    ("model/api", ("openrouter", "whisper", "gpt-", "api key", "tokens")),
    ("builder-tool", ("cursor", "n8n", "workflow", "agent loop", "cli")),
    ("ui/design", ("figma", "layout", "hud", "css", "design system")),
    ("business", ("offer", "stripe", "invoice", "margin", "icp")),
    ("voice", ("elevenlabs", "tts", "voiceover", "whisper small")),
]


class KeywordReplayProvider:
    """Replay the stored kw_category. flagged := category != unclassified."""

    name = "keyword_replay"

    def evaluate(self, packet: dict[str, Any]) -> Judgment:
        started = time.perf_counter()
        scores = packet.get("scores") if isinstance(packet.get("scores"), dict) else {}
        kw = scores.get("kw_category")
        if kw is None:
            kw = packet.get("kw_category")
        flagged = is_flagged(kw)
        latency = (time.perf_counter() - started) * 1000.0
        return Judgment(
            signal_id=str(packet.get("signal_id") or ""),
            provider=self.name,
            flagged=flagged,
            label=str(kw) if kw is not None else None,
            confidence=1.0 if kw is not None else None,
            latency_ms=latency,
            cost_usd=0.0,
            raw={"mode": "replay", "kw_category": kw},
            notes="replay of stored kw_category; not a live classifier",
        )


class KeywordRulesProvider:
    """Optional rules baseline. Report separately from keyword_replay."""

    name = "keyword_rules"

    def evaluate(self, packet: dict[str, Any]) -> Judgment:
        started = time.perf_counter()
        text = str(packet.get("source_text") or "").lower()
        label = "unclassified"
        for category, needles in RULE_CATEGORIES:
            if any(needle in text for needle in needles):
                label = category
                break
        flagged = is_flagged(label)
        latency = (time.perf_counter() - started) * 1000.0
        return Judgment(
            signal_id=str(packet.get("signal_id") or ""),
            provider=self.name,
            flagged=flagged,
            label=label,
            confidence=1.0 if flagged else 0.0,
            latency_ms=latency,
            cost_usd=0.0,
            raw={"mode": "rules", "baseline": "keyword_rules"},
            notes="rules-based keyword classifier; different baseline from replay",
        )
