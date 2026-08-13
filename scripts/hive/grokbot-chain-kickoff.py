#!/usr/bin/env python3
"""Kick off a multi-agent handoff chain from ONE Grok prompt.

Walks grok-handoff-chains.json and queues handoffs to each downstream agent.
Production path: agents register outcomes → grokbot-orchestrate.py polls the ledger.

Usage:
  python3 scripts/hive/grokbot-chain-kickoff.py \\
    --trigger-agent "Web Intelligence Hunter" \\
    --chains research-to-gtm,intel-to-build \\
    --niche "ProofCheck nursing EN/FR claim QC for schools"
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
CHAINS_PATH = Path(__file__).resolve().parent / "grok-handoff-chains.json"

_orch_spec = importlib.util.spec_from_file_location(
    "grokbot_orchestrate", Path(__file__).resolve().parent / "grokbot-orchestrate.py"
)
_orch = importlib.util.module_from_spec(_orch_spec)
assert _orch_spec.loader is not None
_orch_spec.loader.exec_module(_orch)


def load_chains() -> dict[str, Any]:
    return json.loads(CHAINS_PATH.read_text(encoding="utf-8"))


def main() -> int:
    ap = argparse.ArgumentParser(description="One-prompt multi-agent chain kickoff")
    ap.add_argument("--trigger-agent", default="Web Intelligence Hunter")
    ap.add_argument("--chains", default="research-to-gtm,intel-to-build")
    ap.add_argument("--niche", default="ProofCheck nursing EN/FR claim QC for schools")
    ap.add_argument("--correlation-id", help="Override correlationId (default: auto)")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    cid = args.correlation_id or f"chain-kickoff-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    cfg = load_chains()
    chain_ids = [c.strip() for c in args.chains.split(",") if c.strip()]
    chains = [c for c in cfg.get("chains") or [] if c["id"] in chain_ids]

    trigger_prompt = f"""MULTI-AGENT CHAIN KICKOFF — you are hop 0.

correlationId: {cid}
Niche: {args.niche}

This run starts an automated handoff chain across Market Scout → GTM → Engineering → HITL.
Register when done:
  python3 scripts/hive/grok-hive-tool.py --grok-agent "Big Boss" --tool scorpion_register_outcome --params '{{"correlationId":"{cid}","jobType":"research.web_intel","status":"done","summary":"{args.niche} dossier","target":"scorpion"}}'

Mac orchestrator (launchd every 15m) continues the chain from your registration."""

    print(f"correlationId: {cid}")
    print(f"[0] trigger → {args.trigger_agent}")
    _orch.send_handoff(args.trigger_agent, trigger_prompt, dry_run=args.dry_run)

    agents_prompted = [args.trigger_agent]
    hop_num = 0
    for chain in chains:
        for hop in chain.get("hops") or []:
            hop_num += 1
            mission = {
                "correlationId": cid,
                "jobType": (hop.get("when") or {}).get("jobType", ""),
                "status": "done",
                "goal": args.niche,
                "metadata": {"summary": f"{args.niche} — chain hop {hop_num}"},
            }
            target = _orch.resolve_target_agent(hop.get("to", "Big Boss"), mission, cfg)
            prompt = _orch.build_handoff_prompt(hop.get("prompt", ""), mission)
            if hop.get("tier3Stop"):
                prompt += "\n\nTIER 3 STOP: propose only — never auto-approve money/send/deploy."
            print(f"[{hop_num}] {chain['id']} → {target}")
            if _orch.send_handoff(target, prompt, dry_run=args.dry_run):
                agents_prompted.append(target)

    print("\nAgents queued in Grok Bot:")
    for i, name in enumerate(agents_prompted, 1):
        print(f"  {i}. {name}")
    print(f"\nTrack: correlationId={cid}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
