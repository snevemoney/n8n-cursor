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
    def __init__(self, chat=None, polish=None, memory_guard=None, chat_stream=None):
        self.chat = chat  # callable(prompt: str) -> str ; fake in tests
        self.chat_stream = chat_stream  # callable(prompt) -> iterable[str] (F8)
        self.polish = polish or (lambda text: text)
        self.memory_guard = memory_guard  # e.g. memory.redact_unspeakable (F6)

    def final(self, result, objective=''):
        if not (result.get('verified') and result.get('status') == 'VERIFIED') or self.chat is None:
            text = honest_line(result) if not result.get('verified') else 'Verified: %s.' % objective
            return self._guard(result, self.polish(text))
        prompt = ('Write one natural first-person answer (2 sentences) for the operator. Use only these verified '
                  'facts; no internals, ids or worker names. ' + json.dumps({'objective': objective, 'profile': JARVIS_PROFILE,
                                                                               'verified_facts': _verified_facts(result)}))
        return self._guard(result, self.polish(self.chat(prompt)))

    def _guard(self, result, text):
        if self.memory_guard is not None:
            text = self.memory_guard(text) or ('Verified.' if result.get('verified') else honest_line(result))
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


SENTENCE_END = re.compile(r'(?<=[.!?])\s')
STOP_RE = re.compile(r"^\s*(stop|cancel|halt|never mind|nevermind|abort)\b", re.I)
WAIT_RE = re.compile(r"^\s*(wait|hold on|pause|one sec)\b", re.I)


def _stream(self, result, objective='', interrupted=None):
    """Yield {'type':'partial','text'} chunks then one {'type':'final',...}.

    Unverified outcomes never stream model text (honest line only). Verified outcomes stream
    sentence by sentence through the same guards; interrupted() is checked before each chunk.
    """
    interrupted = interrupted or (lambda: False)
    verified = bool(result.get('verified') and result.get('status') == 'VERIFIED')
    if not verified or self.chat_stream is None:
        text = self.final(result, objective)
        if interrupted():
            yield {'type': 'final', 'text': '', 'interrupted': True}
            return
        yield {'type': 'partial', 'text': text}
        yield {'type': 'final', 'text': text, 'interrupted': False}
        return
    prompt = ('Write one natural first-person answer (2 sentences). Use only verified facts. ' +
              json.dumps({'objective': objective, 'verified_facts': _verified_facts(result)}))
    spoken, buf = [], ''
    for chunk in self.chat_stream(prompt):
        if interrupted():
            yield {'type': 'final', 'text': ''.join(spoken).strip(), 'interrupted': True}
            return
        buf += chunk
        parts = SENTENCE_END.split(buf)
        for sentence in parts[:-1]:
            out = self._guard(result, self.polish(sentence.strip()))
            if out:
                piece = (' ' if spoken else '') + out
                spoken.append(piece)
                yield {'type': 'partial', 'text': piece}
        buf = parts[-1]
    if buf.strip() and not interrupted():
        out = self._guard(result, self.polish(buf.strip()))
        if out:
            piece = (' ' if spoken else '') + out if spoken else out
            spoken.append(piece)
            yield {'type': 'partial', 'text': piece}
    yield {'type': 'final', 'text': ''.join(spoken).strip(), 'interrupted': interrupted()}


ResponseRuntime.stream = _stream


def interruption_to_control(utterance, after_batch, event_id):
    """Map a mid-mission interruption to a controller steering event (applied at the next safe boundary)."""
    if STOP_RE.search(utterance or ''):
        return {'id': event_id, 'after_batch': after_batch, 'cancel': True, 'kind': 'user'}
    if WAIT_RE.search(utterance or ''):
        return {'id': event_id, 'after_batch': after_batch, 'pause': True, 'kind': 'user'}
    return None


class StatusNarrator:
    """Mid-mission status lines from trace rows: only on meaningful change, throttled, no internals."""
    LINES = {'PLAN': 'Planning the work.', 'GRAPH': 'Plan set; starting.', 'RECOVER': 'A check failed; repairing it.',
             'REPLAN': 'Adjusting the plan to your change; finished work is kept.', 'VERIFY': 'Checking the result independently.'}

    def __init__(self, min_interval=4.0, clock=None):
        import time as _t
        self.min_interval, self.clock = min_interval, clock or _t.monotonic
        self.last_at, self.last_line, self.seen = None, None, 0

    def update(self, rows):
        new, self.seen = rows[self.seen:], len(rows)
        line = None
        for r in new:
            if r.get('event') == 'mission.approval_pause':
                line = 'I need your approval before continuing; the rest is held.'
            elif r.get('event') == 'mission.phase' and r.get('phase') in self.LINES:
                line = self.LINES[r['phase']]
            elif r.get('event') == 'mission.phase' and r.get('phase') == 'OBSERVE' and r.get('result_status') == 'COMPLETED':
                done = sum(1 for x in rows if x.get('event') == 'mission.phase' and x.get('phase') == 'OBSERVE'
                           and x.get('result_status') == 'COMPLETED')
                line = '%d step%s done.' % (done, '' if done == 1 else 's')
        if line is None or line == self.last_line:
            return None
        now = self.clock()
        urgent = 'approval' in line or 'repair' in line
        if self.last_at is not None and now - self.last_at < self.min_interval and not urgent:
            return None
        self.last_at, self.last_line = now, line
        return line
