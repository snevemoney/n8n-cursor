"""Mission authority for One-Mind: deterministic policy, limits and mode selection.

Extends (does not modify) profiles.AuthorityEnvelope so the browser path's
serialized authority stays byte-identical. Capability is never permission.
"""
from dataclasses import dataclass, field, asdict

from ._base import profiles

_p = profiles()
AutonomyMode = _p.AutonomyMode
AuthorityEnvelope = _p.AuthorityEnvelope
HARD_ACTIONS = _p.HARD_ACTIONS
MODES = tuple(m.value for m in AutonomyMode)
LIMIT_KEYS = ('actions', 'seconds', 'spend_usd', 'retries', 'model_usd')


@dataclass(frozen=True)
class MissionAuthority(AuthorityEnvelope):
    authorized_systems: tuple = ()
    confirm_actions: tuple = ()  # outward/destructive: always need explicit confirmation
    limits: tuple = (('actions', 50), ('seconds', 900), ('spend_usd', 0), ('retries', 3), ('model_usd', 0.5))

    def limit(self, key):
        return dict(self.limits).get(key, 0)

    @classmethod
    def from_dict(cls, row, mission_id):
        if not isinstance(row, dict) or row.get('mission_id') != mission_id:
            raise ValueError('authority_mission_mismatch')
        value = dict(row)
        for key in ('allowed_actions', 'forbidden_actions', 'permitted_capabilities', 'permitted_domains',
                    'approval_required_actions', 'credential_scope', 'authorized_systems', 'confirm_actions'):
            items = value.get(key, ())
            if not isinstance(items, (list, tuple)) or any(not isinstance(x, str) or not x for x in items):
                raise ValueError('invalid authority ' + key)
            value[key] = tuple(items)
        limits = value.get('limits', cls.__dataclass_fields__['limits'].default)
        limits = tuple(tuple(x) for x in (limits.items() if isinstance(limits, dict) else limits))
        for key, number in limits:
            if key not in LIMIT_KEYS or isinstance(number, bool) or not isinstance(number, (int, float)) or number < 0:
                raise ValueError('invalid authority limit')
        value['limits'] = limits
        envelope = cls(**value)
        AutonomyMode(envelope.autonomy_level)
        return envelope

    def to_dict(self):
        row = asdict(self)
        row['limits'] = dict(self.limits)
        return row

    def decide(self, action, capability, domains=(), *, system=None, credential=None, used=None):
        """BLOCK / REQUIRE_APPROVAL / AUTO_EXECUTE. Deterministic; base rules first."""
        if system is not None and system not in self.authorized_systems:
            return 'BLOCK'
        if credential is not None and credential not in self.credential_scope:
            return 'BLOCK'
        for key, value in (used or {}).items():
            if key not in LIMIT_KEYS:
                continue
            over = value > self.limit(key) if key == 'spend_usd' else value >= self.limit(key)
            if over:
                return 'BLOCK'
        verdict = AuthorityEnvelope.decide(self, action, capability, domains)
        if verdict == 'AUTO_EXECUTE' and (action in self.confirm_actions or action in HARD_ACTIONS):
            return 'REQUIRE_APPROVAL'
        return verdict


def select_mode(*, capability_maturity, risk, reversible, blast_radius, evidence_fresh, authorized=True, constraints=()):
    """Deterministic autonomy mode. Inputs: maturity in {experimental, shadow, proven},
    risk/blast_radius in {low, medium, high}. The most restrictive rule wins."""
    for name, value, allowed in (('capability_maturity', capability_maturity, ('experimental', 'shadow', 'proven')),
                                 ('risk', risk, ('low', 'medium', 'high')),
                                 ('blast_radius', blast_radius, ('low', 'medium', 'high'))):
        if value not in allowed:
            raise ValueError('invalid ' + name)
    if not authorized or 'answer_only' in constraints:
        return AutonomyMode.ANSWER_ONLY.value
    if capability_maturity == 'experimental' or risk == 'high' or blast_radius == 'high':
        return AutonomyMode.DELEGATE_ONLY.value
    if 'no_goal_autonomy' in constraints or not reversible or not evidence_fresh or capability_maturity == 'shadow' \
            or risk == 'medium' or blast_radius == 'medium':
        return AutonomyMode.ACT_WITH_POLICY.value
    return AutonomyMode.GOAL_AUTONOMY.value


def approval_scope(graph_nodes, blocked_node_id):
    """Pause only the affected part: the blocked node and everything that depends on it."""
    paused = {blocked_node_id}
    changed = True
    while changed:
        changed = False
        for node in graph_nodes:
            if node['worker_id'] not in paused and set(node.get('dependencies', ())) & paused:
                paused.add(node['worker_id'])
                changed = True
    return sorted(paused)
