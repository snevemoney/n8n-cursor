#!/usr/bin/env python3
"""Poll Scorpion missions and dispatch Grok agent handoff chains.

Usage:
  python3 scripts/hive/grokbot-orchestrate.py --watch --once
  python3 scripts/hive/grokbot-orchestrate.py --watch --interval 900
  python3 scripts/hive/grokbot-orchestrate.py --run-chain research-to-gtm --correlation-id web-intel-20260812
  python3 scripts/hive/grokbot-orchestrate.py --validate
  python3 scripts/hive/grokbot-orchestrate.py --dry-run --watch --once
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import re
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
CHAINS_PATH = Path(__file__).resolve().parent / "grok-handoff-chains.json"
STATE_PATH = Path.home() / ".grokbot" / "orchestrator-state.json"
HIVE_TOOL = ROOT / "scripts/hive/grok-hive-tool.py"

_dispatch_spec = importlib.util.spec_from_file_location(
    "grokbot_dispatch_missions", Path(__file__).resolve().parent / "grokbot-dispatch-missions.py"
)
_dispatch_mod = importlib.util.module_from_spec(_dispatch_spec)
assert _dispatch_spec.loader is not None
_dispatch_spec.loader.exec_module(_dispatch_mod)

SAFETY_PREAMBLE = _dispatch_mod.SAFETY_PREAMBLE
load_gateway = _dispatch_mod.load_gateway
call = _dispatch_mod.call


def load_chains() -> dict[str, Any]:
    if not CHAINS_PATH.is_file():
        raise SystemExit(f"Missing {CHAINS_PATH}")
    return json.loads(CHAINS_PATH.read_text(encoding="utf-8"))


def load_state() -> dict[str, Any]:
    if STATE_PATH.is_file():
        return json.loads(STATE_PATH.read_text(encoding="utf-8"))
    return {"processed": {}, "hopCounts": {}, "lastPoll": None}


def save_state(state: dict[str, Any]) -> None:
    STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    STATE_PATH.write_text(json.dumps(state, indent=2) + "\n", encoding="utf-8")


def fetch_missions(poll_agent: str, limit: int = 100) -> list[dict[str, Any]]:
    if not HIVE_TOOL.is_file():
        return []
    proc = subprocess.run(
        [
            sys.executable,
            str(HIVE_TOOL),
            "--grok-agent",
            poll_agent,
            "--tool",
            "scorpion_list_missions",
            "--params",
            json.dumps({"limit": limit}),
        ],
        capture_output=True,
        text=True,
        timeout=120,
    )
    if proc.returncode != 0:
        print(f"  missions fetch failed: {proc.stderr.strip()[:200]}", file=sys.stderr)
        return []
    try:
        data = json.loads(proc.stdout)
    except json.JSONDecodeError:
        return []
    if not data.get("ok"):
        return []
    inner = data.get("data") or data
    missions = inner.get("missions") if isinstance(inner, dict) else None
    if missions is None and isinstance(data.get("missions"), list):
        missions = data["missions"]
    return missions if isinstance(missions, list) else []


def mission_summary(mission: dict[str, Any]) -> str:
    meta = mission.get("metadata") or {}
    if isinstance(meta, dict) and meta.get("summary"):
        return str(meta["summary"])
    return str(mission.get("goal") or mission.get("correlationId") or "")


def resolve_gtm_agent(text: str, resolve_map: dict[str, str]) -> str:
    low = text.lower()
    for key, agent in resolve_map.items():
        if key == "default":
            continue
        if key in low:
            return agent
    return resolve_map.get("default", "ProofCheck GTM")


def resolve_target_agent(to: str, mission: dict[str, Any], chains_cfg: dict[str, Any]) -> str:
    if to == "{requestingAgent}":
        meta = mission.get("metadata") or mission.get("payload") or {}
        if isinstance(meta, dict):
            payload = meta.get("payload") or meta
            if isinstance(payload, dict) and payload.get("requested_by"):
                return str(payload["requested_by"])
        summary = mission_summary(mission)
        for name in ("Forge", "Creative Studio", "Product GTM", "Career Strategist", "Wealth Manager", "Consultant"):
            if name.lower() in summary.lower():
                return name
        return "Forge"
    if to != "{gtmAgent}":
        return to
    blob = f"{mission_summary(mission)} {mission.get('jobType', '')} {json.dumps(mission.get('metadata') or {})}"
    return resolve_gtm_agent(blob, chains_cfg.get("gtmAgentResolve") or {})


def hop_matches(when: dict[str, Any], mission: dict[str, Any]) -> bool:
    job_type = mission.get("jobType") or ""
    if when.get("jobType") and when["jobType"] != job_type:
        return False
    status = mission.get("status") or ""
    allowed = when.get("status") or ["done"]
    if status not in allowed:
        return False
    meta = mission.get("metadata") or {}
    if when.get("minIssues") is not None:
        issues = meta.get("issues") if isinstance(meta, dict) else None
        if not isinstance(issues, int) or issues < when["minIssues"]:
            return False
    return True


def dedupe_key(chain_id: str, hop_index: int, correlation_id: str) -> str:
    return f"{correlation_id}:{chain_id}:{hop_index}"


def build_handoff_prompt(template: str, mission: dict[str, Any]) -> str:
    summary = mission_summary(mission).replace('"', "'")
    return template.format(
        correlationId=mission.get("correlationId", ""),
        jobType=mission.get("jobType", ""),
        summary=summary,
        status=mission.get("status", ""),
    )


def send_handoff(agent_name: str, prompt: str, *, dry_run: bool) -> bool:
    full_prompt = f"{SAFETY_PREAMBLE}\n\n{prompt}"
    if dry_run:
        print(f"  [dry-run] handoff → {agent_name}")
        return True
    try:
        base, headers = load_gateway()
        health = call(base, headers, "/health")
        if not health.get("ok"):
            print("  gateway not healthy", file=sys.stderr)
            return False
        agents = call(base, headers, "/api/listAgents", {})
        by_name = {a["name"]: a["id"] for a in agents}
        agent_id = by_name.get(agent_name)
        if not agent_id:
            print(f"  skip handoff — agent not in gateway: {agent_name}", file=sys.stderr)
            return False
        call(base, headers, "/api/sendPrompt", {"agentId": agent_id, "prompt": full_prompt})
        print(f"  ✓ handoff queued → {agent_name}")
        return True
    except SystemExit as exc:
        print(f"  handoff failed: {exc}", file=sys.stderr)
        return False


def process_missions(
    chains_cfg: dict[str, Any],
    state: dict[str, Any],
    *,
    dry_run: bool,
    chain_filter: str | None = None,
    correlation_filter: str | None = None,
) -> int:
    poll_agent = chains_cfg.get("pollAgent", "Big Boss")
    max_hops = int(chains_cfg.get("maxHopsPerCorrelation", 3))
    missions = fetch_missions(poll_agent)
    if correlation_filter:
        missions = [m for m in missions if m.get("correlationId") == correlation_filter]
    dispatched = 0
    processed: dict[str, str] = state.setdefault("processed", {})
    hop_counts: dict[str, int] = state.setdefault("hopCounts", {})

    for chain in chains_cfg.get("chains") or []:
        chain_id = chain["id"]
        if chain_filter and chain_id != chain_filter:
            continue
        for hop_index, hop in enumerate(chain.get("hops") or []):
            when = hop.get("when") or {}
            for mission in missions:
                cid = str(mission.get("correlationId") or "")
                if not cid or not hop_matches(when, mission):
                    continue
                key = dedupe_key(chain_id, hop_index, cid)
                if key in processed:
                    continue
                hops_so_far = hop_counts.get(cid, 0)
                if hops_so_far >= max_hops:
                    print(f"  cap reached for {cid} ({max_hops} hops)")
                    continue
                target = resolve_target_agent(hop.get("to", "Big Boss"), mission, chains_cfg)
                prompt = build_handoff_prompt(hop.get("prompt", ""), mission)
                if hop.get("tier3Stop"):
                    prompt += "\n\nTIER 3 STOP: propose only — never auto-approve money/send/deploy."
                print(f"chain={chain_id} hop={hop_index + 1} cid={cid} → {target}")
                if send_handoff(target, prompt, dry_run=dry_run):
                    processed[key] = datetime.now(timezone.utc).isoformat()
                    hop_counts[cid] = hops_so_far + 1
                    dispatched += 1
    state["lastPoll"] = datetime.now(timezone.utc).isoformat()
    return dispatched


def validate_chains(cfg: dict[str, Any]) -> None:
    assert cfg.get("chains"), "no chains defined"
    for chain in cfg["chains"]:
        assert chain.get("id") and chain.get("hops"), f"invalid chain: {chain}"
        for hop in chain["hops"]:
            assert hop.get("to") and hop.get("when") and hop.get("prompt"), f"invalid hop in {chain['id']}"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--watch", action="store_true", help="Poll mission store")
    ap.add_argument("--once", action="store_true", help="Single poll cycle (for launchd)")
    ap.add_argument("--interval", type=int, default=900, help="Seconds between polls when --watch without --once")
    ap.add_argument("--run-chain", help="Process one chain id")
    ap.add_argument("--correlation-id", help="Filter to one correlationId")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--validate", action="store_true")
    args = ap.parse_args()

    cfg = load_chains()
    if args.validate:
        validate_chains(cfg)
        print(f"Chains valid: {len(cfg['chains'])} chains, maxHops={cfg.get('maxHopsPerCorrelation', 3)}")
        return 0

    state = load_state()

    if args.watch or args.run_chain:
        if args.run_chain and not args.watch:
            args.watch = True
            args.once = True
        cycles = 1 if args.once else 0
        while True:
            n = process_missions(
                cfg,
                state,
                dry_run=args.dry_run,
                chain_filter=args.run_chain,
                correlation_filter=args.correlation_id,
            )
            save_state(state)
            print(f"Orchestrator: dispatched={n} processed_keys={len(state.get('processed', {}))}")
            if args.once or cycles == 1:
                break
            time.sleep(args.interval)
        return 0

    ap.print_help()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
