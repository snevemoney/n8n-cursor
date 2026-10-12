"""Real box coding worker: edits a throwaway copy, runs tests, loops until pass or budget.

Never the Mac. Never the source tree. Model calls go through llm.LiteLLMClient (metered,
capped) or llm.FakeLLM in tests. The builder self-runs tests only to decide whether to keep
iterating; mission verification is done by a separate verifier worker (independent run).
"""
import json
import os
import re
import subprocess
import sys
import time

from . import receipts, worker_results as W
from .sandbox import Sandbox

FORBIDDEN_CODE = re.compile(r"(os\.system|subprocess|shutil\.rmtree|socket|urllib|requests|eval\(|exec\()")
JSON_RE = re.compile(r"\{.*\}", re.S)
SYSTEM = ('You are a careful software builder working in a sandbox copy of a small repo. '
          'Return ONLY JSON {"files": {"<relative path>": "<full new file content>"}, "notes": "<one line>"}. '
          'Edit only the allowed files. Make the tests pass without editing tests.')


def run_tests(root, cmd, timeout=120):
    env = {'PATH': os.environ.get('PATH', ''), 'PYTHONDONTWRITEBYTECODE': '1', 'HOME': str(root)}
    started = time.monotonic()
    try:
        out = subprocess.run(cmd, cwd=root, capture_output=True, text=True, timeout=timeout, env=env)
        code, text = out.returncode, (out.stdout + out.stderr)
    except subprocess.TimeoutExpired:
        code, text = 124, 'timeout'
    return {'passed': code == 0, 'exit_code': code, 'tail': text.strip()[-800:], 'seconds': round(time.monotonic() - started, 3)}


def parse_edit(text, allowed):
    match = JSON_RE.search(text or '')
    if not match:
        raise ValueError('no_json_edit')
    data = json.loads(match.group(0))
    files = data.get('files') or {}
    if not isinstance(files, dict) or not files:
        raise ValueError('empty_edit')
    bad = [p for p in files if p not in allowed]
    if bad:
        raise ValueError('edit_outside_allowed:' + ','.join(bad))
    for content in files.values():
        if not isinstance(content, str) or FORBIDDEN_CODE.search(content):
            raise ValueError('forbidden_code_in_edit')
    return files, str(data.get('notes') or '')[:200]


class Workspaces:
    """mission_id -> Sandbox, shared by builder and the independent verifier of one mission."""
    def __init__(self, source):
        self.source = source
        self._rows = {}

    def get(self, mission_id):
        if mission_id not in self._rows:
            self._rows[mission_id] = Sandbox(self.source)
        return self._rows[mission_id]

    def cleanup(self):
        for sb in self._rows.values():
            sb.cleanup()
        self._rows.clear()


class BoxCodingAgent:
    def __init__(self, llm, *, model, files, test_cmd, max_iterations=4, max_seconds=600):
        self.llm, self.model, self.files, self.test_cmd = llm, model, tuple(files), list(test_cmd)
        self.max_iterations, self.max_seconds = max_iterations, max_seconds

    def run(self, sandbox, objective, feedback=None, emit=None):
        emit = emit or (lambda *a, **k: None)
        started = time.monotonic()
        last = feedback or {}
        notes = ''
        history = []
        for i in range(self.max_iterations):
            if time.monotonic() - started > self.max_seconds:
                return {'status': 'FAILED', 'reason': 'time_budget', 'iterations': i, 'history': history, 'notes': notes}
            current = {p: sandbox.path(p).read_text() if sandbox.path(p).exists() else '' for p in self.files}
            prompt = json.dumps({'objective': objective, 'allowed_files': current, 'last_test_result': last})
            try:
                text = self.llm.chat(self.model, [{'role': 'system', 'content': SYSTEM}, {'role': 'user', 'content': prompt}])
                edit, notes = parse_edit(text, self.files)
            except ValueError as exc:
                history.append({'iteration': i, 'error': str(exc)[:200]}); last = {'error': str(exc)[:200]}
                emit('builder.iteration', iteration=i, error=str(exc)[:200])
                continue
            for rel, content in edit.items():
                sandbox.write(rel, content)
            last = run_tests(sandbox.root, self.test_cmd)
            history.append({'iteration': i, 'passed': last['passed'], 'exit_code': last['exit_code']})
            emit('builder.iteration', iteration=i, passed=last['passed'], exit_code=last['exit_code'])
            if last['passed']:
                return {'status': 'COMPLETED', 'iterations': i + 1, 'history': history, 'notes': notes}
        return {'status': 'FAILED', 'reason': 'iteration_budget', 'iterations': self.max_iterations, 'history': history, 'notes': notes}


def make_box_workers(workspaces, agent, *, test_cmd, review_files):
    """Worker callables for pipeline_hook.register_workers / MissionController."""
    def prov(ctx, node, pid):
        return W.Provenance(node.get('mission_id') or ctx.get('mission_id', ''), node['task_id'], node['worker_id'], pid, 1)

    def builder(ctx, node, attempt):
        mid = ctx['mission_id']
        sb = workspaces.get(mid)
        out = agent.run(sb, ctx['context'].get('objective', ''), ctx['context'].get('test_feedback'), ctx.get('emit'))
        patch = sb.diff(agent.files)
        status = 'COMPLETED' if out['status'] == 'COMPLETED' and patch else 'FAILED'
        return W.BuilderResult('art-build-%s-%d' % (mid[-8:], attempt), 'builder',
                               W.Provenance(mid, node['task_id'], node['worker_id'], 'software.builder', 1),
                               status=status, patch=patch, files=agent.files, test_request=' '.join(test_cmd),
                               notes='iterations=%d %s' % (out['iterations'], out.get('reason', '')))

    def verifier(ctx, node, attempt):
        mid = ctx['mission_id']
        res = run_tests(workspaces.get(mid).root, test_cmd)
        return W.TesterResult('art-%s-%s-%d' % (node['worker_id'], mid[-8:], attempt), 'tester',
                              W.Provenance(mid, node['task_id'], node['worker_id'], 'software.verifier', 1),
                              verdict='PASS' if res['passed'] else 'FAIL', condition=' '.join(test_cmd),
                              expected='exit 0', observed='exit %d: %s' % (res['exit_code'], res['tail'][-160:]),
                              evidence=(receipts.record('run', mid, node['worker_id'], {'cmd': test_cmd, 'exit_code': res['exit_code'], 'seconds': res['seconds']}),) if res['passed'] else ())

    def reviewer(ctx, node, attempt):
        mid = ctx['mission_id']
        patch = workspaces.get(mid).diff(review_files)
        findings = []
        if not patch:
            findings.append('empty patch')
        added = '\n'.join(l for l in patch.splitlines() if l.startswith('+') and not l.startswith('+++'))
        if FORBIDDEN_CODE.search(added):
            findings.append('forbidden call added')
        return W.ReviewerResult('art-review-%s-%d' % (mid[-8:], attempt), 'reviewer',
                                W.Provenance(mid, node['task_id'], node['worker_id'], 'software.reviewer', 1),
                                findings=tuple(findings), risks=(), recommendation='block' if findings else 'approve')
    return {'software.builder': builder, 'software.verifier': verifier, 'software.reviewer': reviewer}
