#!/usr/bin/env python3
"""Golden Mission (offline). A real sandboxed repair in a tmp dir with box-agent fakes.

Steps proven: goal, ground (authority), plan, worker graph, execute (builder edits a
real file), observe, verify (real unittest subprocess by an independent verifier),
injected failure -> recover (repair), user steering -> replan affected subgraph,
reviewer, runtime verifier (integration), mission verification, ONE terminal commit,
ONE natural answer, metrics from traces. No network, no paid calls, never the Mac.
"""
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

BRAIN = Path(__file__).resolve().parents[2] / 'brain'
sys.path.insert(0, str(BRAIN))
from one_mind import controller as MC, fakes as F, registry as R, worker_results as W  # noqa: E402
from one_mind.jev_hooks import JevAdvisor  # noqa: E402
from one_mind.response_runtime import ResponseRuntime  # noqa: E402
sys.path.insert(0, str(Path(__file__).resolve().parent))
import metrics as M  # noqa: E402

BUGGY = 'def add(a, b):\n    return a - b\n'
WRONG_FIX = 'def add(a, b):\n    return abs(a) + abs(b)\n'  # passes positives, fails negatives
GOOD_FIX = 'def add(a, b):\n    return a + b\n'
TESTS = ('import unittest\nfrom calc import add\n\nclass T(unittest.TestCase):\n'
         '    def test_add(self):\n        self.assertEqual(add(2, 3), 5)\n'
         '    def test_negative(self):\n        self.assertEqual(add(-2, 1), -1)\n')


def make_sandbox(root):
    repo = Path(root) / 'repo'
    repo.mkdir(parents=True)
    (repo / 'calc.py').write_text(BUGGY)
    (repo / 'test_calc.py').write_text(TESTS)
    return repo


def unittest_run(repo, extra=''):
    cmd = [sys.executable, '-m', 'unittest', '-q', 'test_calc']
    out = subprocess.run(cmd, cwd=repo, capture_output=True, text=True, timeout=60,
                         env={'PATH': os.environ.get('PATH', ''), 'PYTHONDONTWRITEBYTECODE': '1'})
    ok = out.returncode == 0
    if ok and extra:
        chk = subprocess.run([sys.executable, '-c', extra], cwd=repo, capture_output=True, text=True, timeout=60,
                             env={'PATH': os.environ.get('PATH', ''), 'PYTHONDONTWRITEBYTECODE': '1'})
        ok = chk.returncode == 0
        out = chk if not ok else out
    return ok, (out.stderr or out.stdout).strip().splitlines()[-1:] or ['ok']


def workers(mid, repo, *, inject_failure):
    fixes = [WRONG_FIX, GOOD_FIX] if inject_failure else [GOOD_FIX]

    def builder(ctx, node, attempt):  # box agent: edits the sandbox file
        patch = fixes[min(attempt, len(fixes) - 1)]
        (repo / 'calc.py').write_text(patch)
        return W.BuilderResult('art-build-%d' % attempt, 'builder', F.prov(mid, node, 'software.builder'),
                               patch=patch, files=('calc.py',), test_request='run unit tests')

    def tester(ctx, node, attempt):  # independent verifier: real subprocess
        request = ctx['context'].get('test_request', '')
        extra = 'from calc import add; assert add(0, 0) == 0' if 'edge' in request else ''
        ok, tail = unittest_run(repo, extra)
        return W.TesterResult('art-%s-%d' % (node['worker_id'], attempt), 'tester',
                              F.prov(mid, node, 'software.verifier'), verdict='PASS' if ok else 'FAIL',
                              condition='unit tests' + (' + edge' if extra else ''), expected='0 failures',
                              observed='0 failures' if ok else ' '.join(tail)[:200],
                              evidence=('unittest:%s:%d:%s' % (node['worker_id'], attempt, 'ok'),) if ok else ())

    def reviewer(ctx, node, attempt):
        src = (repo / 'calc.py').read_text()
        rec = 'approve' if 'a + b' in src else 'request_changes'
        return W.ReviewerResult('art-review-%d' % attempt, 'reviewer', F.prov(mid, node, 'software.reviewer'),
                                findings=() if rec == 'approve' else ('add() is not plain addition',),
                                risks=(), recommendation=rec)
    return {'software.builder': builder, 'software.verifier': tester, 'software.reviewer': reviewer}


def run_once(root, mid, *, inject_failure=False, steer=False):
    os.environ['JARVIS_ONE_MIND'] = '1'
    repo = make_sandbox(Path(root) / mid)
    answers, delivered = [], []
    mission = {'mission_id': mid, 'objective': 'Fix add() in calc.py so the tests pass',
               'authority': F.coding_authority(mid), 'nodes': F.coding_nodes(('calc.py',)), 'integration': ['runtime']}
    control = [{'id': 'steer-1', 'kind': 'user', 'after_batch': 0, 'node': 'test',
                'changes': {'inputs': {'test_request': 'run unit tests and an edge case', 'patch_ref': 'build'}}}] if steer else []
    ctl = MC.MissionController(Path(root) / 'missions', R.REGISTRY, workers(mid, repo, inject_failure=inject_failure),
                               deliver=delivered.append, advisor=JevAdvisor(lambda q, e: {'lane': 'jev', 'label': 'test_failure'}))
    result = ctl.run(mission, control=control)
    again = ctl.run(mission, control=control)  # replay must not double-commit
    answers.append(ResponseRuntime(chat=lambda p: 'I fixed add() in calc.py and the tests now pass.').final(result, mission['objective']))
    recheck, _ = unittest_run(repo)
    metrics = M.compute(Path(root) / 'missions' / mid, independent_recheck_passed=recheck)
    return {'mission_id': mid, 'status': result['status'], 'verified': result['verified'],
            'terminal_commit_id': result['terminal_commit_id'], 'replay_duplicate': bool(again.get('duplicate')),
            'replay_same_id': again['terminal_commit_id'] == result['terminal_commit_id'],
            'deliveries': len(delivered), 'answers': answers, 'metrics': metrics, 'recheck': recheck}


def golden(root):
    runs = [run_once(root, 'golden-%d' % i) for i in range(1, 4)]
    runs.append(run_once(root, 'golden-steer-fail', inject_failure=True, steer=True))
    ok = all(r['verified'] and r['deliveries'] == 1 and len(r['answers']) == 1 and r['replay_duplicate']
             and r['replay_same_id'] and not any(r['metrics'].values()) for r in runs)
    return {'passed': ok, 'runs': runs}


if __name__ == '__main__':
    with tempfile.TemporaryDirectory() as tmp:
        report = golden(tmp)
    print(json.dumps(report, indent=1))
    raise SystemExit(0 if report['passed'] else 1)
