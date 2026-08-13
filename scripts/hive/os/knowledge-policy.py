#!/usr/bin/env python3
"""Knowledge sufficiency policy — confidence bands, budgets, per-agent source hierarchy."""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any, Literal

Action = Literal["proceed", "quick_verify", "research", "deep_research", "research_required"]

POLICY_PATH = Path(__file__).resolve().parent / "knowledge-policies.json"


def load_policy(path: Path | None = None) -> dict[str, Any]:
    p = path or POLICY_PATH
    return json.loads(p.read_text(encoding="utf-8"))


def assess(
    confidence: float,
    agent: str,
    *,
    high_risk: bool = False,
    unfamiliar: bool = False,
    visual_procedural: bool = False,
    policy: dict[str, Any] | None = None,
) -> tuple[Action, str, str]:
    """Return (action, budget_tier, reason)."""
    pol = policy or load_policy()
    bands = pol["confidence_bands"]
    if high_risk or unfamiliar:
        if confidence < bands["proceed"]:
            return "research_required", "standard", "unfamiliar or high-risk task requires research before execution"

    if confidence >= bands["proceed"]:
        return "proceed", "quick", f"confidence {confidence:.2f} >= {bands['proceed']}"
    if confidence >= bands["quick_verify"]:
        return "quick_verify", "quick", f"confidence {confidence:.2f} — quick verify before execute"
    if confidence >= bands["research"]:
        tier = "standard"
        return "research", tier, f"confidence {confidence:.2f} — standard research"
    return "deep_research", "deep", f"confidence {confidence:.2f} — deep research required"


def budget_for_tier(tier: str, policy: dict[str, Any] | None = None) -> dict[str, Any]:
    pol = policy or load_policy()
    return pol["budgets"].get(tier, pol["budgets"]["standard"])


def agent_hierarchy(agent: str, policy: dict[str, Any] | None = None) -> list[str]:
    pol = policy or load_policy()
    per = pol.get("per_agent", {}).get(agent, {})
    return per.get("source_hierarchy") or pol.get("default_source_hierarchy", [])


def social_video_role(agent: str, policy: dict[str, Any] | None = None) -> str:
    pol = policy or load_policy()
    per = pol.get("per_agent", {}).get(agent, {})
    return per.get("social_video_role", "evidence")


def check_budget(
    tier: str,
    *,
    sources: int,
    videos: int,
    policy: dict[str, Any] | None = None,
) -> tuple[bool, str]:
    b = budget_for_tier(tier, policy)
    if sources > b["max_sources"]:
        return False, f"sources {sources} exceeds {tier} max {b['max_sources']}"
    if videos > b["max_videos"]:
        return False, f"videos {videos} exceeds {tier} max {b['max_videos']}"
    return True, "ok"


def self_test() -> int:
    cases = [
        (0.9, "Forge", False, False, "proceed"),
        (0.7, "Forge", False, False, "quick_verify"),
        (0.5, "Forge", False, False, "research"),
        (0.3, "Forge", True, False, "research_required"),
    ]
    fails = 0
    for conf, agent, risk, unfam, expected in cases:
        got, _, _ = assess(conf, agent, high_risk=risk, unfamiliar=unfam)
        if got != expected:
            print(f"FAIL assess({conf}, {agent}): expected {expected}, got {got}")
            fails += 1
    if social_video_role("Wealth Manager") != "hypothesis_only":
        print("FAIL Wealth Manager social role")
        fails += 1
    ok, _ = check_budget("quick", sources=3, videos=1)
    if not ok:
        fails += 1
    ok, _ = check_budget("quick", sources=10, videos=1)
    if ok:
        fails += 1
    if fails:
        return 1
    print("knowledge-policy self-test: OK")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--confidence", type=float, help="Confidence 0-1")
    ap.add_argument("--agent", help="Agent display name")
    ap.add_argument("--high-risk", action="store_true")
    ap.add_argument("--unfamiliar", action="store_true")
    ap.add_argument("--visual", action="store_true")
    ap.add_argument("--hierarchy", metavar="AGENT")
    ap.add_argument("--budget", metavar="TIER")
    ap.add_argument("--check-budget", nargs=3, metavar=("TIER", "SOURCES", "VIDEOS"))
    ap.add_argument("--self-test", action="store_true")
    args = ap.parse_args()

    if args.self_test:
        return self_test()

    if args.hierarchy:
        print(
            json.dumps(
                {
                    "agent": args.hierarchy,
                    "hierarchy": agent_hierarchy(args.hierarchy),
                    "social_video_role": social_video_role(args.hierarchy),
                },
                indent=2,
            )
        )
        return 0

    if args.budget:
        print(json.dumps(budget_for_tier(args.budget), indent=2))
        return 0

    if args.check_budget:
        ok, msg = check_budget(args.check_budget[0], sources=int(args.check_budget[1]), videos=int(args.check_budget[2]))
        print(json.dumps({"ok": ok, "message": msg}, indent=2))
        return 0 if ok else 1

    if args.confidence is not None and args.agent:
        action, tier, reason = assess(
            args.confidence,
            args.agent,
            high_risk=args.high_risk,
            unfamiliar=args.unfamiliar,
            visual_procedural=args.visual,
        )
        print(json.dumps({"action": action, "budget_tier": tier, "reason": reason}, indent=2))
        return 0

    ap.print_help()
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
