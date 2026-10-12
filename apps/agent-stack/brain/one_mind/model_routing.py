"""Evidence-based model routing over LiteLLM aliases with per-mission budget enforcement.

profile + tool -> EvidenceRouter picks an alias (explicit > proven evidence > config order)
-> client.chat. Failures fall back to the next alias. Every call is charged to the
mission's CostMeter, capped by MissionAuthority limit 'model_usd' (default $0.50).
Aliases come from JARVIS_ONE_MIND_ALIASES (JSON {tool: [alias, ...]}); defaults are
placeholders: 'jev' for routing/judgment, 'frontier' for hard reasoning.
"""
import json
import os

from ._base import profiles
from .llm import BudgetExceeded, CostMeter, LiteLLMClient, live_available
from .router import EvidenceRouter

BackendCandidate = profiles().BackendCandidate
DEFAULT_ALIASES = {'jev.decisions': ['jev'], 'frontier.chat': ['frontier']}


def aliases():
    raw = os.environ.get('JARVIS_ONE_MIND_ALIASES', '').strip()
    if not raw:
        return dict(DEFAULT_ALIASES)
    data = json.loads(raw)
    if not isinstance(data, dict) or any(not isinstance(v, list) or not all(isinstance(x, str) and x for x in v) for v in data.values()):
        raise ValueError('invalid JARVIS_ONE_MIND_ALIASES')
    return data


def candidates(tool, table=None):
    return [BackendCandidate(alias, 'litellm', tool, alias) for alias in (table or aliases()).get(tool, [])]


def mission_meter(authority):
    return CostMeter(min(float(authority.limit('model_usd')), 0.50))


class RoutedModelClient:
    """Drop-in llm for workers: chat(model_ignored, messages). Routes per call; enforces the mission budget."""

    def __init__(self, profile, tool, client, *, router=None, table=None, preferred=None):
        self.profile, self.tool, self.client = profile, tool, client
        self.router = router or EvidenceRouter()
        self.table = table
        self.preferred = preferred
        self.routes = []
        self.on_call = None

    @property
    def meter(self):
        return self.client.meter

    def chat(self, model, messages, **kw):
        excluded = []
        last_error = None
        cands = candidates(self.tool, self.table)
        while True:
            try:
                route = self.router.select(self.profile, self.tool, cands, preferred=self.preferred, excluded=tuple(excluded))
            except ValueError as exc:
                if str(exc) == 'profile_tool_not_permitted':
                    raise
                raise RuntimeError('no_backend_available:%s' % (last_error or exc))
            self.routes.append({'alias': route.backend_id, 'reason': route.reason})
            previous = getattr(self.client, 'on_call', None)
            self.client.on_call = lambda row: self.on_call and self.on_call(dict(row, route_reason=route.reason))
            try:
                return self.client.chat(route.backend_id, messages, **kw)
            except BudgetExceeded:
                raise
            except Exception as exc:  # backend failure -> next alias
                last_error = type(exc).__name__
                excluded.append(route.backend_id)
            finally:
                self.client.on_call = previous

    def record_outcome(self, passed):
        if not self.routes:
            return
        key = (self.profile.profile_id, self.routes[-1]['alias'])
        row = self.router.evidence.setdefault(key, {'trials': 0, 'passes': 0})
        row['trials'] += 1
        row['passes'] += int(bool(passed))


def default_client(authority):
    """Live LiteLLM client capped by the mission budget when a key is present; else None (callers use fakes)."""
    return LiteLLMClient(mission_meter(authority)) if live_available() else None
