"""Deterministic ids and a reconstructable mission trace.

Ids are sha256 over (mission_id, kind, parent, seq); a replay yields the same
ids. Every action records four separate facts: possible, authorized,
executed, outcome_occurred. Jev decisions are recorded with authoritative=false.
"""
import hashlib
import json
from dataclasses import dataclass, asdict
from pathlib import Path

from .flag import require_enabled

ID_KINDS = ('mission', 'task', 'worker', 'action', 'observation', 'verification', 'artifact', 'terminal', 'jev', 'span')


def stable_id(mission_id, kind, *parts):
    if kind not in ID_KINDS:
        raise ValueError('unknown_id_kind')
    raw = json.dumps([mission_id, kind, *[str(p) for p in parts]], separators=(',', ':'))
    return kind[:3] + '_' + hashlib.sha256(raw.encode()).hexdigest()[:24]


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, default=str, separators=(',', ':')).encode()).hexdigest()


def terminal_commit_id(mission_id, final_state):
    return stable_id(mission_id, 'terminal', digest(final_state))


@dataclass(frozen=True)
class ActionRecord:
    action_id: str
    worker_id: str
    action: str
    capability: str
    possible: bool
    authorized: str  # AUTO_EXECUTE | REQUIRE_APPROVAL | BLOCK
    executed: bool
    outcome_occurred: bool | None  # None until a verifier observes it
    why: str = ''

    def __post_init__(self):
        if self.executed and self.authorized != 'AUTO_EXECUTE':
            raise ValueError('executed_without_authority')
        if self.executed and not self.possible:
            raise ValueError('executed_impossible_action')
        if self.outcome_occurred and not self.executed:
            raise ValueError('outcome_without_execution')


class Tracer:
    """Append-only trace.jsonl with deterministic sequence-based ids."""

    def __init__(self, root, mission_id):
        require_enabled()
        self.root = Path(root)
        self.mission_id = mission_id
        self.trace_id = stable_id(mission_id, 'mission')
        self._seq = {}
        self.root.mkdir(parents=True, exist_ok=True)
        self.path = self.root / 'trace.jsonl'

    def next_id(self, kind, parent=''):
        key = (kind, parent)
        self._seq[key] = self._seq.get(key, 0) + 1
        return stable_id(self.mission_id, kind, parent, self._seq[key])

    def emit(self, event, **fields):
        row = {'trace_id': self.trace_id, 'mission_id': self.mission_id, 'seq': sum(self._seq.values()),
               'span_id': self.next_id('span'), 'event': event, **fields}
        with self.path.open('a', encoding='utf-8') as stream:
            stream.write(json.dumps(row, sort_keys=True, default=str) + '\n')
        return row

    def action(self, record):
        return self.emit('action', **asdict(record))

    def jev(self, question, answer, *, mode='SHADOW'):
        return self.emit('jev.decision', jev_id=self.next_id('jev'), question=question, answer=answer,
                         mode=mode, authoritative=False)

    def rows(self):
        if not self.path.exists():
            return []
        return [json.loads(line) for line in self.path.read_text(encoding='utf-8').splitlines() if line.strip()]
