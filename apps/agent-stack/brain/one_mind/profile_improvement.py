"""#22 Profile improvement: traces -> candidate -> offline eval -> shadow -> promote | reject.

A profile is an operational role (profile != model). Improvement never edits a live profile:
a candidate is a new *version* of the same profile_id. It is promoted (added to a new
ProfileRegistry, so resolve() picks it) only if it beats the baseline on the offline eval set
AND in shadow, with zero regressions on cases the baseline passed. Shadow runs never affect
the user-facing result: the baseline output is always the one returned. Every stage's
metrics go to an append-only JSONL ledger. Offline/fake runners only in CI; no spend here.

Inputs (from controller trace/outcomes rows): {'profile_id', 'version', 'passed', 'reason',
'cost_usd', 'seconds'}.
"""
import json
import time
from dataclasses import replace
from pathlib import Path

from ._base import profiles
from .flag import require_enabled

MIN_TRACES = 5
MIN_GAIN = 0.0  # candidate pass rate must be >= baseline + MIN_GAIN, and strictly better on some axis


def trace_stats(rows, profile_id):
    rows = [r for r in rows if r.get('profile_id') == profile_id]
    n = len(rows)
    reasons = {}
    for r in rows:
        if not r.get('passed'):
            reasons[r.get('reason') or 'unknown'] = reasons.get(r.get('reason') or 'unknown', 0) + 1
    return {'profile_id': profile_id, 'traces': n,
            'pass_rate': (sum(1 for r in rows if r.get('passed')) / n) if n else 0.0,
            'failure_reasons': reasons,
            'mean_cost_usd': (sum(float(r.get('cost_usd', 0)) for r in rows) / n) if n else 0.0}


def default_proposer(profile, stats):
    """Deterministic, conservative edits derived from failure reasons. Returns (changes, rationale) or None."""
    reasons = stats['failure_reasons']
    if not reasons:
        return None
    top = max(reasons, key=lambda k: (reasons[k], k))
    budgets = dict(getattr(profile, 'budgets', ()) or ())
    if top in ('budget_exhausted', 'iteration_budget', 'time_budget') and budgets:
        budgets['retries'] = budgets.get('retries', 1) + 1
        return {'budgets': tuple(sorted(budgets.items()))}, 'raise retries: top failure %s' % top
    if top in ('insufficient_evidence', 'unverified'):
        ctx = tuple(profile.context_policy) + (('verification_feedback',) if 'verification_feedback' not in profile.context_policy else ())
        if ctx != tuple(profile.context_policy):
            return {'context_policy': ctx}, 'add verification_feedback context: top failure %s' % top
    return None


def make_candidate(profile, changes):
    allowed = {'budgets', 'context_policy', 'persona', 'escalation_rules', 'reasoning_policy'}
    bad = set(changes) - allowed
    if bad:
        raise ValueError('candidate_change_not_allowed:' + ','.join(sorted(bad)))  # never tools/authority/capabilities
    return replace(profile, version=profile.version + 1, **changes)


def _score(results):
    n = len(results)
    return {'n': n, 'pass_rate': (sum(1 for r in results if r['passed']) / n) if n else 0.0,
            'mean_cost_usd': (sum(float(r.get('cost_usd', 0)) for r in results) / n) if n else 0.0,
            'mean_seconds': (sum(float(r.get('seconds', 0)) for r in results) / n) if n else 0.0}


def compare(runner, baseline, candidate, cases):
    base = [dict(runner(baseline, c), case=c.get('id')) for c in cases]
    cand = [dict(runner(candidate, c), case=c.get('id')) for c in cases]
    regressions = [b['case'] for b, k in zip(base, cand) if b['passed'] and not k['passed']]
    return {'baseline': _score(base), 'candidate': _score(cand), 'regressions': regressions}


def offline_eval(runner, baseline, candidate, cases):
    return compare(runner, baseline, candidate, cases)


def shadow(runner, baseline, candidate, live_cases):
    """Baseline result is what the user gets; candidate runs alongside and is only measured."""
    served, metrics = [], compare(runner, baseline, candidate, live_cases)
    for c in live_cases:
        served.append(runner(baseline, c))
    metrics['served_from'] = 'baseline'
    return metrics, served


def better(m):
    b, k = m['baseline'], m['candidate']
    if m['regressions'] or k['pass_rate'] < b['pass_rate'] + MIN_GAIN:
        return False
    return k['pass_rate'] > b['pass_rate'] or k['mean_cost_usd'] < b['mean_cost_usd'] or k['mean_seconds'] < b['mean_seconds']


class Ledger:
    def __init__(self, path):
        self.path = Path(path)

    def record(self, row):
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self.path.open('a') as fh:
            fh.write(json.dumps(dict(row, ts=time.time()), sort_keys=True, default=str) + '\n')

    def rows(self):
        return [json.loads(l) for l in self.path.read_text().splitlines()] if self.path.exists() else []


def improve(registry, profile_id, traces, *, runner, offline_cases, shadow_cases, ledger, proposer=default_proposer,
            round_log=None, locked_scorer=None, coach_dir=None):
    """Run the full loop once. Returns (registry_after, decision_row). registry is never mutated.

    Feature-loop wiring (optional, all None = previous behaviour): locked_scorer (feature_loop.LockedCheckScorer,
    approved once) must score the candidate full with no regression or the candidate is rejected; every decision is
    appended to round_log (results.tsv format); coach_dir gets a PROPOSED How-to-work note when a failure pattern
    repeats across profiles. The proposal is never applied here.
    """
    require_enabled()
    if round_log is not None or locked_scorer is not None or coach_dir is not None:
        ledger = _LoopLedger(ledger, round_log, coach_dir, profile_id)
    baseline = registry.resolve(profile_id)
    stats = trace_stats(traces, profile_id)
    row = {'profile_id': profile_id, 'baseline_version': baseline.version, 'traces': stats}
    if stats['traces'] < MIN_TRACES:
        row.update(decision='skip', reason='insufficient_traces'); ledger.record(row); return registry, row
    proposal = proposer(baseline, stats)
    if not proposal:
        row.update(decision='skip', reason='no_candidate'); ledger.record(row); return registry, row
    changes, rationale = proposal
    candidate = make_candidate(baseline, changes)
    row.update(candidate_version=candidate.version, changes=changes, rationale=rationale)
    off = offline_eval(runner, baseline, candidate, offline_cases)
    row['offline'] = off
    if not better(off):
        row.update(decision='reject', reason='offline_not_better'); ledger.record(row); return registry, row
    if locked_scorer is not None:
        locked = locked_scorer.score(candidate, profile_id)
        row['locked'] = {k: locked[k] for k in ('passed', 'total', 'failing', 'regressions', 'reason', 'score')}
        ledger.locked = locked
        if not locked_scorer.full(locked):
            row.update(decision='reject', reason='locked_checks_failed'); ledger.record(row); return registry, row
    sh, _ = shadow(runner, baseline, candidate, shadow_cases)
    row['shadow'] = sh
    if not better(sh):
        row.update(decision='reject', reason='shadow_not_better'); ledger.record(row); return registry, row
    rows = [registry.resolve(pid, ver) for (pid, ver) in registry._profiles] + [candidate]
    row.update(decision='promote', reason='offline_and_shadow_better')
    if locked_scorer is not None:
        locked_scorer.keep(ledger.locked)
    ledger.record(row)
    return profiles().ProfileRegistry(rows), row


class _LoopLedger:
    """Wraps the JSONL ledger: also writes a results.tsv round row and, if asked, a coach proposal path."""

    def __init__(self, inner, round_log, coach_dir, profile_id):
        self.inner, self.round_log, self.coach_dir, self.profile_id, self.locked = inner, round_log, coach_dir, profile_id, None

    def rows(self):
        return self.inner.rows()

    def record(self, row):
        from . import feature_loop as FL
        if self.round_log is not None:
            res = self.locked or {'feature': self.profile_id, 'passed': 0, 'total': 0, 'failing': [], 'regressions': [], 'reason': 'ok'}
            if row.get('reason') in ('offline_not_better', 'shadow_not_better') and not res.get('failing'):
                res = dict(res, failing=[row['reason']])
            res = dict(res, feature=self.profile_id)
            FL.log_round(self.round_log, res, status='kept' if row.get('decision') == 'promote' else
                         ('reverted' if row.get('decision') == 'reject' else 'no-change'),
                         tried='candidate v%s: %s' % (row.get('candidate_version', '-'), row.get('rationale') or row.get('reason')))
            if self.coach_dir is not None:
                row['coach_proposal'] = FL.coach_proposal(self.round_log.rows(), self.coach_dir)
        self.inner.record(row)
