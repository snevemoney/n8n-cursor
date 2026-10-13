"""pipeline.py -> One-Mind hook. Called only when JARVIS_ONE_MIND=1, after the
pipeline's hard-step and unauthorized-tool refusals.

Mission-type turns = coding missions (tool `cursor_ask`). browser_mission keeps
its own controller (runs alongside). Returns None to fall through to the
legacy path when no box-agent workers are registered or anything goes wrong,
so enabling the flag without workers changes nothing.
"""
import hashlib
from pathlib import Path

from .flag import require_enabled

MISSION_TOOLS = ('cursor_ask',)
WORKERS = {}  # profile_id -> worker callable; box-agent adapters register here. Never the Mac.


def register_workers(workers):
    WORKERS.clear()
    WORKERS.update(workers)


def handle(pick, utterance, hive, *, gen=None):
    require_enabled()
    tool = str((pick or {}).get('tool') or '')
    if tool not in MISSION_TOOLS:
        return None
    needed = ('software.builder', 'software.verifier', 'software.reviewer')
    if not all(k in WORKERS for k in needed):
        return None
    from . import controller as MC, fakes as F, registry as R
    from .response_runtime import ResponseRuntime
    try:
        mid = 'om_' + hashlib.sha256(('%s|%s' % (gen, utterance)).encode()).hexdigest()[:24]
        args = pick.get('args') if isinstance(pick.get('args'), dict) else {}
        objective = str(args.get('query') or utterance)[:500]
        mission = {'mission_id': mid, 'objective': objective, 'authority': F.coding_authority(mid),
                   'nodes': F.coding_nodes(), 'integration': ['runtime']}
        ctl = MC.MissionController(Path(hive) / 'one_mind' / 'missions', R.REGISTRY, dict(WORKERS))
        result = ctl.run(mission)
        spoken = ResponseRuntime().final(result, objective)
    except Exception:
        return None
    return {'ok': bool(result.get('verified')), 'tool': tool, 'spoken': spoken,
            'task_verified': bool(result.get('verified')), 'wires': ['one_mind'], 'cites': [], 'sent': False,
            'mission_id': mid, 'terminal_commit_id': result.get('terminal_commit_id'),
            'mission_status': result.get('status')}
