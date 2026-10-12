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


def improve(registry, profile_id, traces, *, runner, offline_cases, shadow_cases, ledger, proposer=default_proposer):
    """Run the full loop once. Returns (registry_after, decision_row). registry is never mutated."""
    require_enabled()
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
    sh, _ = shadow(runner, baseline, candidate, shadow_cases)
    row['shadow'] = sh
    if not better(sh):
        row.update(decision='reject', reason='shadow_not_better'); ledger.record(row); return registry, row
    rows = [registry.resolve(pid, ver) for (pid, ver) in registry._profiles] + [candidate]
    row.update(decision='promote', reason='offline_and_shadow_better')
    ledger.record(row)
    return profiles().ProfileRegistry(rows), row
