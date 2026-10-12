#!/usr/bin/env python3
"""One-Mind nightly evaluation set (offline, fixed tasks, no network, no spend).

Tasks: coding (Golden Mission + box coding worker on a real sandbox), research (claim must be
supported by its cited fixture source), browser-fake (page loaded by the fake browser, post-
condition checked), voice-text (ResponseRuntime never claims unverified success; streams).
Scores are appended to a JSON history file. No scheduler is created; see docs/jarvis/NIGHTLY_EVAL.md.

Usage: JARVIS_ONE_MIND=1 python3 eval/nightly/run_nightly.py [--history PATH]
"""
import argparse
import json
import os
import subprocess
import sys
import tempfile
import time
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
STACK = HERE.parents[1]
sys.path.insert(0, str(STACK / 'brain')); sys.path.insert(0, str(STACK / 'eval' / 'golden_mission'))
DEFAULT_HISTORY = Path(os.environ.get('JARVIS_NIGHTLY_HISTORY') or Path.home() / '.local/state/jarvis-one-mind/nightly-history.json')


def task_coding_golden():
    import run as G
    with tempfile.TemporaryDirectory() as tmp:
        report = G.golden(tmp)
    zero = all(not any(r['metrics'].values()) for r in report['runs'])
    return 1.0 if report['passed'] and zero else 0.0, {'runs': len(report['runs'])}


def task_coding_box_agent():
    from one_mind import coding_worker as CW, llm as L
    from one_mind.sandbox import Sandbox
    import run as G
    good = json.dumps({'files': {'calc.py': G.GOOD_FIX}, 'notes': 'fix'})
    wrong = json.dumps({'files': {'calc.py': G.WRONG_FIX}, 'notes': 'try'})
    with tempfile.TemporaryDirectory() as tmp:
        repo = G.make_sandbox(Path(tmp))
        agent = CW.BoxCodingAgent(L.FakeLLM([wrong, good]), model='fake', files=('calc.py',),
                                  test_cmd=[sys.executable, '-m', 'unittest', '-q', 'test_calc'])
        with Sandbox(repo) as sb:
            out = agent.run(sb, 'fix add')
            independent = CW.run_tests(sb.root, [sys.executable, '-m', 'unittest', '-q', 'test_calc'])['passed']
    return (1.0 if out['status'] == 'COMPLETED' and independent else 0.0), {'iterations': out['iterations']}


def task_research():
    data = json.loads((HERE / 'fixtures' / 'sources.json').read_text())

    def supported(ans):
        return all(ans['key'].lower() in data['sources'][c].lower() for c in ans['cites'])
    good, bad = supported(data['good_answer']), supported(data['bad_answer'])
    return (1.0 if good and not bad else 0.0), {'good_supported': good, 'bad_rejected': not bad}


def task_browser_fake():
    from one_mind import fake_browser as FB
    page = FB.load_page(HERE / 'fixtures' / 'pricing.html')
    hit, miss = FB.verify(page, 'Pro costs $29'), FB.verify(page, 'Enterprise costs $99')
    ok = hit['verified'] and hit['evidence'][0].startswith('page:') and not miss['verified']
    return (1.0 if ok else 0.0), {'title': page['title']}


def task_voice_text():
    from one_mind.response_runtime import ResponseRuntime
    rr = ResponseRuntime(chat=lambda p: 'All done, fixed!')
    unverified = {'status': 'PARTIAL', 'verified': False, 'failures': [{'worker_id': 'b', 'reason': 'verifier_failed:x'}]}
    verified = {'status': 'VERIFIED', 'verified': True, 'accepted': [], 'artifacts': {}}
    honest = 'not verified' in rr.final(unverified)
    spoke = rr.final(verified, 'x') == 'All done, fixed!'
    checks = [honest, spoke]
    if hasattr(rr, 'stream'):
        parts = list(ResponseRuntime(chat_stream=lambda p: iter(['I fixed ', 'it.'])).stream(verified, 'x'))
        checks.append(''.join(p['text'] for p in parts if p['type'] == 'partial') == 'I fixed it.')
    return sum(checks) / len(checks), {'checks': len(checks)}


TASKS = (('coding.golden', task_coding_golden), ('coding.box_agent', task_coding_box_agent),
         ('research.cited_claim', task_research), ('browser.fake_page', task_browser_fake), ('voice.text', task_voice_text))


def git_sha():
    try:
        return subprocess.run(['git', 'rev-parse', '--short', 'HEAD'], cwd=STACK, capture_output=True, text=True, timeout=10).stdout.strip()
    except Exception:
        return ''


def run_all(history):
    os.environ['JARVIS_ONE_MIND'] = '1'
    rows = []
    for tid, fn in TASKS:
        started = time.monotonic()
        try:
            score, detail = fn()
            error = ''
        except Exception as exc:
            score, detail, error = 0.0, {}, type(exc).__name__ + ': ' + str(exc)[:200]
        rows.append({'id': tid, 'score': round(score, 3), 'passed': score == 1.0, 'seconds': round(time.monotonic() - started, 3),
                     'detail': detail, 'error': error})
    record = {'run_at': datetime.now(timezone.utc).isoformat(), 'git_sha': git_sha(), 'tasks': rows,
              'score': round(sum(r['score'] for r in rows) / len(rows), 3), 'cost_usd': 0.0}
    history = Path(history)
    history.parent.mkdir(parents=True, exist_ok=True)
    past = json.loads(history.read_text()) if history.exists() else []
    past.append(record)
    tmp = history.with_suffix('.tmp'); tmp.write_text(json.dumps(past, indent=1)); tmp.replace(history)
    return record


if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--history', default=str(DEFAULT_HISTORY)); a = ap.parse_args()
    rec = run_all(a.history)
    print(json.dumps({'score': rec['score'], 'tasks': {r['id']: r['score'] for r in rec['tasks']}, 'history': a.history}))
    raise SystemExit(0 if rec['score'] == 1.0 else 1)
