#!/usr/bin/env python3
"""Read a One-Mind mission trace. Usage: python3 brain/one_mind/trace_cli.py <mission_dir|trace.jsonl> [--json]

Sections: plan, models (+cost), actions (possible / authorized / executed / occurred),
verifier results, Jev (advisory), steering, terminal commit.
"""
import argparse
import json
import sys
from pathlib import Path


def load(path):
    p = Path(path)
    p = p / 'trace.jsonl' if p.is_dir() else p
    return [json.loads(l) for l in p.read_text(encoding='utf-8').splitlines() if l.strip()]


def summarize(rows):
    ev = lambda name: [r for r in rows if r['event'] == name]
    graph = next((r for r in rows if r.get('phase') == 'GRAPH'), {})
    goal = next((r for r in rows if r.get('phase') == 'GOAL'), {})
    outcomes = {r['action_id']: r['outcome_occurred'] for r in ev('action.outcome')}
    actions = [{'action_id': r['action_id'], 'worker_id': r['worker_id'], 'action': r['action'], 'possible': r['possible'],
                'authorized': r['authorized'], 'executed': r['executed'],
                'occurred': outcomes.get(r['action_id'], r['outcome_occurred'])} for r in ev('action')]
    calls = ev('model.call')
    term = (ev('terminal.commit') or [{}])[0]
    return {
        'mission_id': rows[0]['mission_id'] if rows else '', 'trace_id': rows[0]['trace_id'] if rows else '',
        'objective': goal.get('objective', ''),
        'plan': {'batches': graph.get('batches', []), 'workers': graph.get('workers', [])},
        'models': [{'worker_id': c.get('worker_id'), 'model': c.get('model'), 'served_model': c.get('served_model'),
                    'cost_usd': c.get('cost_usd'), 'cost_source': c.get('cost_source')} for c in calls],
        'cost_usd': round(sum(float(c.get('cost_usd') or 0) for c in calls), 6),
        'actions': actions,
        'verifier_results': [{k: r.get(k) for k in ('worker_id', 'verdict', 'condition', 'observed', 'receipts')} for r in ev('verifier.result')],
        'jev': [{k: r.get(k) for k in ('question', 'answer', 'mode', 'authoritative')} for r in ev('jev.decision')],
        'steering': [{k: r.get(k) for k in ('id', 'node', 'cancel', 'kind')} for r in ev('mission.steering')],
        'phases': [r['phase'] for r in ev('mission.phase')],
        'terminal': {'terminal_commit_id': term.get('terminal_commit_id'), 'status': term.get('status'),
                     'verified': term.get('verified'), 'duplicates_suppressed': len(ev('terminal.duplicate_suppressed'))},
    }


def render(s):
    out = ['mission %s  trace %s' % (s['mission_id'], s['trace_id']), 'objective: %s' % s['objective'],
           'plan: %s' % ' -> '.join('[' + ', '.join(b) + ']' for b in s['plan']['batches']),
           'phases: %s' % ' '.join(s['phases']),
           'models: %d call(s), $%.4f' % (len(s['models']), s['cost_usd'])]
    out += ['  %s %s ($%s, %s)' % (m['worker_id'], m['served_model'] or m['model'], m['cost_usd'], m['cost_source']) for m in s['models']]
    out.append('actions (possible / authorized / executed / occurred):')
    out += ['  %-8s %-7s %s / %s / %s / %s' % (a['worker_id'], a['action'], a['possible'], a['authorized'], a['executed'], a['occurred'])
            for a in s['actions']]
    out.append('verifiers:')
    out += ['  %s %s (%s) receipts=%d' % (v['worker_id'], v['verdict'], (v['observed'] or '')[:60], len(v['receipts'] or [])) for v in s['verifier_results']]
    if s['jev']:
        out.append('jev (advisory, authoritative=false): %d decision(s)' % len(s['jev']))
    if s['steering']:
        out.append('steering: %s' % ', '.join(str(x['id']) for x in s['steering']))
    t = s['terminal']
    out.append('terminal: %s status=%s verified=%s duplicates_suppressed=%d' % (t['terminal_commit_id'], t['status'], t['verified'], t['duplicates_suppressed']))
    return '\n'.join(out)


def main(argv=None):
    ap = argparse.ArgumentParser(); ap.add_argument('path'); ap.add_argument('--json', action='store_true')
    a = ap.parse_args(argv)
    s = summarize(load(a.path))
    print(json.dumps(s, indent=1, default=str) if a.json else render(s))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
