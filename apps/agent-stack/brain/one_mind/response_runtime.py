"""ResponseRuntime: the one Jarvis voice, written from MissionResult only.

Verified missions: the frontier writer (injected `chat`) gets only verified
artifacts. Anything else: a deterministic honest line that names what is not
verified. A post-check refuses success language on unverified outcomes.
"""
import json
import re

SUCCESS_RE = re.compile(r"\b(done|fixed|complete[d]?|verified|succeeded|all set|works now|passed)\b", re.I)
JARVIS_PROFILE = {
    'relationship': 'operator butler, first person, concise',
    'initiative': 'execute within authority; ask only at approval boundaries',
    'uncertainty': 'name what is not verified; never imply success',
    'progress': 'one line from structured state, no internals',
    'corrections': 'acknowledge, replan the affected part, keep verified work',
}


def _verified_facts(result):
    arts = result.get('artifacts', {})
    return [{'worker_id': w, 'kind': arts[w].get('kind'), 'summary': arts[w].get('notes') or arts[w].get('patch')
             or arts[w].get('observed') or arts[w].get('recommendation')} for w in result.get('accepted', []) if w in arts]


def honest_line(result):
    status = result.get('status')
    if status == 'NEEDS_APPROVAL':
        return 'I need your approval before %s. The rest is held, and nothing is claimed done.' % ', '.join(result.get('paused', []))
    if status == 'CANCELLED':
        return 'Stopped as you asked. Nothing from this mission is claimed as finished.'
    reasons = sorted({f['reason'].split(':')[0] for f in result.get('failures', [])})
    return 'This is not verified yet: %s. I will not call it finished.' % (', '.join(reasons) or 'missing evidence')


class ResponseRuntime:
    def __init__(self, chat=None, polish=None):
        self.chat = chat  # callable(prompt: str) -> str ; fake in tests
        self.polish = polish or (lambda text: text)

    def final(self, result, objective=''):
        if not (result.get('verified') and result.get('status') == 'VERIFIED') or self.chat is None:
            text = honest_line(result) if not result.get('verified') else 'Verified: %s.' % objective
            return self._guard(result, self.polish(text))
        prompt = ('Write one natural first-person answer (2 sentences) for the operator. Use only these verified '
                  'facts; no internals, ids or worker names. ' + json.dumps({'objective': objective, 'profile': JARVIS_PROFILE,
                                                                               'verified_facts': _verified_facts(result)}))
        return self._guard(result, self.polish(self.chat(prompt)))

    @staticmethod
    def _guard(result, text):
        if not result.get('verified') and SUCCESS_RE.search(text) and 'not' not in text.lower():
            return honest_line(result)
        return text

    @staticmethod
    def progress(trace_rows):
        phases = [r for r in trace_rows if r.get('event') == 'mission.phase']
        if not phases:
            return 'Starting.'
        last = phases[-1]
        done = sum(1 for r in phases if r.get('phase') == 'OBSERVE' and r.get('result_status') == 'COMPLETED')
        paused = [r for r in trace_rows if r.get('event') == 'mission.approval_pause']
        tail = ' Waiting on your approval for %s.' % paused[-1]['node'] if paused else ''
        return 'Working: %s, %d step%s finished so far.%s' % (last['phase'].lower(), done, '' if done == 1 else 's', tail)
