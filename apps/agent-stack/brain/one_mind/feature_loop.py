"""Feature-loop pieces for One-Mind (flag JARVIS_ONE_MIND=1, default off).

Same contract as the shared feature-loop kit (workflows/feature-loop):
  RoundLog            results.tsv-compatible round log (append-only TSV)
  LockedCheckScorer   checks approved once, frozen by digest; score() re-runs EVERY feature's
                      checks; tamper -> 0, a previously-passing check failing -> 0 (REGRESSION)
  coach_proposal()    reads rounds, finds failure patterns repeating across >= 2 features (with
                      round ids), writes a PROPOSED 'How to work' note to a proposal path. It never
                      edits checks, profiles or rules; adoption needs an A/B and Evens's/owner's OK.
Offline only: no network, no keys, no paid calls.
"""
import hashlib
import inspect
import json
import subprocess
import time
from collections import defaultdict
from pathlib import Path

from .flag import require_enabled

HEADER = ('round', 'ts', 'feature', 'commit', 'score', 'best_before', 'status', 'failing', 'tried', 'secs', 'label')


class RoundLog:
    def __init__(self, path):
        self.path = Path(path)

    def append(self, **row):
        require_enabled()
        self.path.parent.mkdir(parents=True, exist_ok=True)
        new = not self.path.exists()
        n = len(self.rows()) + 1
        row = dict(row, round=row.get('round', n), ts=row.get('ts', time.strftime('%Y-%m-%dT%H:%M:%S')))
        with self.path.open('a') as fh:
            if new:
                fh.write('\t'.join(HEADER) + '\n')
            fh.write('\t'.join(str(row.get(k, '')).replace('\t', ' ').replace('\n', ' ') for k in HEADER) + '\n')
        return row

    def rows(self):
        if not self.path.exists():
            return []
        lines = self.path.read_text().splitlines()[1:]
        return [dict(zip(HEADER, (l.split('\t') + [''] * len(HEADER))[:len(HEADER)])) for l in lines if l.strip()]


def _check_digest(check):
    if callable(check):
        try:
            src = inspect.getsource(check)
        except (OSError, TypeError):
            src = getattr(check, '__qualname__', repr(check))
        return 'py:' + hashlib.sha256(src.encode()).hexdigest()
    return 'cmd:' + hashlib.sha256(json.dumps(list(check)).encode()).hexdigest()


class LockedCheckScorer:
    """checks = {feature: {check_id: callable(target)->bool | argv list run with cwd=target}}."""

    def __init__(self, checks, *, approved_by, approval, timeout=120):
        if not approved_by or not approval:
            raise ValueError('checks_need_owner_approval')
        self._checks = {f: dict(c) for f, c in checks.items()}
        self.approved_by, self.approval, self.timeout = approved_by, approval, timeout
        self.digest = self._digest()
        self.baseline = set()
        self.best = {}

    def _digest(self):
        flat = sorted((f, cid, _check_digest(c)) for f, cs in self._checks.items() for cid, c in cs.items())
        return hashlib.sha256(json.dumps(flat).encode()).hexdigest()

    def tampered(self):
        return self._digest() != self.digest

    def _run(self, check, target):
        try:
            if callable(check):
                return bool(check(target))
            out = subprocess.run(list(check), cwd=str(target), capture_output=True, text=True, timeout=self.timeout,
                                 env={'PATH': '/usr/bin:/bin', 'PYTHONDONTWRITEBYTECODE': '1', 'HOME': str(target)})
            return out.returncode == 0
        except Exception:
            return False

    def score(self, target, feature):
        require_enabled()
        res = {'%s/%s' % (f, cid): self._run(c, target) for f, cs in self._checks.items() for cid, c in cs.items()}
        mine = {k: v for k, v in res.items() if k.startswith(feature + '/')}
        out = {'feature': feature, 'passed': sum(mine.values()), 'total': len(mine),
               'failing': sorted(k for k, v in mine.items() if not v),
               'regressions': sorted(k for k in self.baseline if k in res and not res[k]),
               'passing_now': sorted(k for k, v in res.items() if v), 'reason': 'ok'}
        if self.tampered():
            out.update(reason='TAMPERED')
        elif out['regressions']:
            out.update(reason='REGRESSION')
        out['score'] = 0.0 if out['reason'] != 'ok' or not out['total'] else out['passed'] / out['total']
        return out

    def full(self, res):
        return res['reason'] == 'ok' and res['total'] > 0 and res['passed'] == res['total']

    def improves(self, res):
        """Keep rule: score strictly better than the best kept score for this feature, no tamper/regression."""
        return res['reason'] == 'ok' and res['score'] > self.best.get(res['feature'], 0.0)

    def keep(self, res):
        """Advance the baseline and best score only on a kept (ok) round."""
        if res['reason'] == 'ok':
            self.baseline = set(res['passing_now'])
            self.best[res['feature']] = max(self.best.get(res['feature'], 0.0), res['score'])


def label(res):
    """Deterministic failure-type label (Jev may only replace labels, never decisions)."""
    if res.get('reason') in ('TAMPERED', 'REGRESSION'):
        return res['reason'].lower()
    names = ' '.join(res.get('failing') or ())
    if 'wired' in names:
        return 'not-wired'
    if 'every_place' in names or 'every-place' in names:
        return 'old-path-left'
    return 'rule-fail' if res.get('failing') else 'none'


def log_round(log, res, *, status, tried, commit='', secs=0.0, best_before=0.0):
    failing = res['regressions'] if res['reason'] == 'REGRESSION' else res['failing']
    return log.append(feature=res['feature'], commit=commit,
                      score='%d/%d' % (0 if res['reason'] != 'ok' else res['passed'], res['total']),
                      best_before='%.3f' % best_before, status=status,
                      failing=(res['reason'] + ':' if res['reason'] != 'ok' else '') + (','.join(failing) or '-'),
                      tried=tried, secs=secs, label=label(res))


LESSONS = {
    'not-wired': 'Wire it in the same round that makes its checks pass: an entry point must call the new code.',
    'old-path-left': 'Find every older place that does the same job and make it use the new code.',
    'regression': 'Run the whole scorer (all features) before changing shared code.',
    'tampered': 'Never touch the locked checks or Fixed rules; fix the code.',
}


def coach_proposal(rows, out_dir, *, min_features=2):
    """Write a PROPOSED How-to-work note; returns its path, or None when nothing repeats. Read-only on inputs."""
    require_enabled()
    ev = defaultdict(list)
    for r in rows:
        if r.get('status') != 'kept' or r.get('failing') not in ('', '-'):
            if r.get('label') and r['label'] not in ('none', 'rule-fail'):
                ev[r['label']].append(r)
    habits = []
    for key, rs in sorted(ev.items()):
        feats = sorted({r['feature'] for r in rs})
        if len(feats) >= min_features:
            habits.append({'habit': key, 'features': feats, 'rounds': ['r%s(%s)' % (r['round'], r['feature']) for r in rs],
                           'proposed_line': LESSONS.get(key, 'Check for %s before you stop.' % key)})
    if not habits:
        return None
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    n = 1 + len(list(out.glob('how-to-work-v*.json')))
    path = out / ('how-to-work-v%d.json' % n)
    path.write_text(json.dumps({'status': 'PROPOSED', 'scope': 'How to work only', 'adopt_requires': ['ab_test', 'owner_ok'],
                                'habits': habits}, indent=1, sort_keys=True) + '\n')
    return str(path)
