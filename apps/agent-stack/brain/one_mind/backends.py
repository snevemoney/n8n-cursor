"""Pluggable backends for One-Mind workers. Tests use FakeBackend only (no network, no spend).

A backend is an execution target for a profile's tool (box agent, frontier chat,
Jev decisions, local verifier). Real backends are registered by adapters later;
nothing here opens a socket. The coding backend is a box agent, never the Mac.
"""
import json
from dataclasses import dataclass, field

from ._base import profiles

BackendCandidate = profiles().BackendCandidate
FORBIDDEN_RUNTIMES = ('mac', 'macos_local')


class Backend:
    backend_id = ''
    runtime = ''
    tool = ''
    model_id = None
    paid = False

    def candidate(self):
        return BackendCandidate(self.backend_id, self.runtime, self.tool, self.model_id)

    def run(self, request):
        raise NotImplementedError


class FakeBackend(Backend):
    """Scripted replies, recorded calls. Each reply is a dict or an Exception to raise."""

    def __init__(self, backend_id, tool, replies=(), *, runtime='fake', model_id=None):
        self.backend_id, self.tool, self.runtime, self.model_id = backend_id, tool, runtime, model_id
        self.replies = list(replies)
        self.calls = []

    def run(self, request):
        self.calls.append(json.loads(json.dumps(request, default=str)))
        if not self.replies:
            raise RuntimeError('fake_backend_exhausted:' + self.backend_id)
        reply = self.replies.pop(0)
        if isinstance(reply, Exception):
            raise reply
        return reply(request) if callable(reply) else reply


class BackendRegistry:
    def __init__(self, *, allow_paid=False):
        self.allow_paid = allow_paid
        self._rows = {}

    def register(self, backend):
        if backend.runtime in FORBIDDEN_RUNTIMES:
            raise ValueError('runtime_forbidden:' + backend.runtime)
        if backend.paid and not self.allow_paid:
            raise ValueError('paid_backend_not_allowed')
        if backend.backend_id in self._rows:
            raise ValueError('duplicate_backend')
        self._rows[backend.backend_id] = backend
        return backend

    def get(self, backend_id):
        return self._rows[backend_id]

    def candidates(self, tool=None):
        return [b.candidate() for b in self._rows.values() if tool is None or b.tool == tool]
