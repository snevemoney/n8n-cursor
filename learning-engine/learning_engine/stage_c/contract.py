"""Provider-neutral Stage C contract.

    judgment = provider.evaluate(packet)

Local baselines cost 0. Live providers refuse unless opt-in + key.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any, Protocol

from learning_engine.constants import JUDGMENT_SCHEMA_VERSION


@dataclass
class Judgment:
    signal_id: str
    provider: str
    flagged: bool
    label: str | None
    confidence: float | None
    latency_ms: float
    cost_usd: float | None
    raw: dict[str, Any] = field(default_factory=dict)
    notes: str = ""

    def to_json(self) -> dict[str, Any]:
        payload = asdict(self)
        payload["schema_version"] = JUDGMENT_SCHEMA_VERSION
        return payload


class Provider(Protocol):
    name: str

    def evaluate(self, packet: dict[str, Any]) -> Judgment: ...


def evaluate(provider: Provider, packet: dict[str, Any]) -> Judgment:
    """The only Stage C entry point later judges should share."""
    return provider.evaluate(packet)
