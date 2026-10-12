#!/usr/bin/env python3
"""Golden Mission with the REAL box coding worker and a live LiteLLM model, hard-capped at $0.50.

Needs JARVIS_ONE_MIND=1, a key in JARVIS_LITELLM_KEY (or LITELLM_KEY_JARVIS) and a model alias
in JARVIS_ONE_MIND_CODING_MODEL. Prints SKIPPED and exits 0 when any are missing. The key
is never printed. Usage: JARVIS_ONE_MIND=1 python3 eval/golden_mission/live_run.py [--cap 0.50]
"""
import argparse
import json
import os
import sys
import tempfile
from pathlib import Path

BRAIN = Path(__file__).resolve().parents[2] / 'brain'
sys.path.insert(0, str(BRAIN)); sys.path.insert(0, str(Path(__file__).resolve().parent))
from one_mind import coding_worker as CW, llm as L, controller as MC, fakes as F, registry as R  # noqa: E402
from one_mind.jev_hooks import JevAdvisor  # noqa: E402
import metrics as M  # noqa: E402
import run as G  # noqa: E402


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--cap', type=float, default=0.50); a = ap.parse_args()
    cap = min(a.cap, 0.50)
    model = os.environ.get('JARVIS_ONE_MIND_CODING_MODEL', '').strip()
    missing = [n for n, ok in (('JARVIS_ONE_MIND=1', os.environ.get('JARVIS_ONE_MIND') == '1'),
                               ('litellm key env', L.live_available()), ('JARVIS_ONE_MIND_CODING_MODEL', bool(model))) if not ok]
    if missing:
        print(json.dumps({'status': 'SKIPPED', 'missing': missing, 'cost_usd': 0}))
        return 0
    meter = L.CostMeter(cap)
    with tempfile.TemporaryDirectory() as tmp:
        repo = G.make_sandbox(Path(tmp) / 'src')
        ws = CW.Workspaces(repo)
        cmd = [sys.executable, '-m', 'unittest', '-q', 'test_calc']
        agent = CW.BoxCodingAgent(L.LiteLLMClient(meter), model=model, files=('calc.py',), test_cmd=cmd, max_iterations=3)
        workers = CW.make_box_workers(ws, agent, test_cmd=cmd, review_files=('calc.py',))
        mid = 'golden-live'
        mission = {'mission_id': mid, 'objective': 'Fix add() in calc.py so the tests pass', 'authority': F.coding_authority(mid),
                   'nodes': F.coding_nodes(('calc.py',)), 'integration': ['runtime']}
        try:
            out = MC.MissionController(Path(tmp) / 'missions', R.REGISTRY, workers, advisor=JevAdvisor()).run(mission)
            recheck = CW.run_tests(ws.get(mid).root, cmd)['passed']
            metrics = M.compute(Path(tmp) / 'missions' / mid, independent_recheck_passed=recheck)
        finally:
            ws.cleanup()
    print(json.dumps({'status': out['status'], 'verified': out['verified'], 'terminal_commit_id': out['terminal_commit_id'],
                      'metrics': metrics, 'cost_usd': round(meter.spent, 4), 'cap_usd': cap, 'calls': len(meter.calls),
                      'models': sorted({c.get('served_model') or c['model'] for c in meter.calls})}))
    return 0 if out['verified'] and not any(metrics.values()) else 1


if __name__ == '__main__':
    raise SystemExit(main())
