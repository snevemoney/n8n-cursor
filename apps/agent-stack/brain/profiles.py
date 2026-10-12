"""Versioned role contracts and authority for the existing Jarvis runtimes.

This module owns no scheduler, browser driver, terminal writer or model credentials.
Profiles describe roles. Runtime adapters remain responsible for executing them.
"""
from dataclasses import dataclass
from enum import Enum
from types import MappingProxyType


class AutonomyMode(str, Enum):
    ANSWER_ONLY = 'ANSWER_ONLY'
    DELEGATE_ONLY = 'DELEGATE_ONLY'
    ACT_WITH_POLICY = 'ACT_WITH_POLICY'
    GOAL_AUTONOMY = 'GOAL_AUTONOMY'


@dataclass(frozen=True)
class WorkerProfile:
    profile_id: str
    version: int
    role: str
    capabilities: tuple[str, ...]
    tools: tuple[str, ...]
    context_policy: tuple[str, ...]
    verification_requirements: tuple[str, ...]
    output_contract: str
    escalation_rules: tuple[str, ...]
    persona: str = ''


class ProfileRegistry:
    def __init__(self, profiles):
        rows = {(p.profile_id, p.version): p for p in profiles}
        if len(rows) != len(profiles):
            raise ValueError('duplicate profile version')
        if any(type(p.version) is not int or p.version < 1 for p in profiles):
            raise ValueError('positive profile version required')
        self._profiles = MappingProxyType(rows)

    def resolve(self, profile_id, version=None):
        candidates = [p for (name, _), p in self._profiles.items() if name == profile_id]
        if version is None and candidates:
            return max(candidates, key=lambda p: p.version)
        try:
            return self._profiles[(profile_id, version)]
        except KeyError:
            raise ValueError('unknown profile version') from None


REGISTRY = ProfileRegistry([
    WorkerProfile('browser.planner', 1, 'decompose bounded browser goal', ('browser.plan',),
                  ('frontier.chat',), ('objective', 'constraints', 'authority'),
                  ('compiled_flow_contract',), 'BrowserFlow[]', ('ambiguous_acceptance',)),
    WorkerProfile('browser.operator', 1, 'execute bounded browser flow', ('browser.read',),
                  ('browser_use', 'jev.decisions', 'frontier.chat'),
                  ('flow', 'fresh_observation', 'recent_actions', 'verification_feedback'),
                  ('independent_browser_verifier',), 'BrowserFlowResult',
                  ('authentication', 'unsafe_action', 'budget_exhausted')),
    WorkerProfile('browser.verifier', 1, 'challenge requested browser postconditions', ('browser.verify',),
                  ('fresh_dom', 'provider_read', 'artifact_read'), ('flow', 'verification_recipe'),
                  ('fresh_postcondition_evidence',), 'VerificationResult', ('insufficient_evidence',), 'adversarial'),
    WorkerProfile('response.synthesizer', 1, 'render verified mission findings', ('response.synthesize',),
                  ('frontier.chat',), ('objective', 'verified_findings', 'failures', 'steering'),
                  ('mission_acceptance',), 'JarvisResponse', ('missing_required_result',)),
])


# Browser action names, not model/tool identities. Existing target policy is an
# additional gate; this contract never relaxes its site or credential checks.
READ_ACTIONS = ('CLICK', 'OPEN_TAB', 'INPUT', 'SELECT', 'SWITCH_TAB', 'SCROLL',
                'NAVIGATE', 'BACK', 'WAIT', 'EXTRACT', 'STOP_CANDIDATE', 'FAIL_CANDIDATE', 'ESCALATE')
HARD_ACTIONS = ('SEND', 'PAY', 'BOOK', 'PUBLISH', 'DELETE', 'AUTHENTICATE', 'DEPLOY')


@dataclass(frozen=True)
class AuthorityEnvelope:
    mission_id: str
    autonomy_level: str
    allowed_actions: tuple[str, ...]
    forbidden_actions: tuple[str, ...]
    permitted_capabilities: tuple[str, ...]
    permitted_domains: tuple[str, ...]
    approval_required_actions: tuple[str, ...] = ()
    external_communication_policy: str = 'forbidden'
    credential_scope: tuple[str, ...] = ()

    @classmethod
    def browser_read(cls, mission_id, domains=()):
        return cls(mission_id, AutonomyMode.GOAL_AUTONOMY.value, READ_ACTIONS, HARD_ACTIONS,
                   ('browser.read', 'browser.verify'), tuple(domains))

    @classmethod
    def from_dict(cls, row, mission_id):
        if not isinstance(row, dict) or row.get('mission_id') != mission_id:
            raise ValueError('authority_mission_mismatch')
        value = dict(row)
        for key in ('allowed_actions', 'forbidden_actions', 'permitted_capabilities',
                    'permitted_domains', 'approval_required_actions', 'credential_scope'):
            items = value.get(key, ())
            if not isinstance(items, (list, tuple)) or any(not isinstance(x, str) or not x for x in items):
                raise ValueError('invalid authority ' + key)
            value[key] = tuple(items)
        envelope = cls(**value)
        AutonomyMode(envelope.autonomy_level)
        return envelope

    def decide(self, action, capability, domains=()):
        if self.autonomy_level not in {mode.value for mode in AutonomyMode}:
            return 'BLOCK'
        if action in self.forbidden_actions or capability not in self.permitted_capabilities:
            return 'BLOCK'
        if self.autonomy_level in (AutonomyMode.ANSWER_ONLY.value, AutonomyMode.DELEGATE_ONLY.value):
            return 'BLOCK'
        if self.permitted_domains and not set(domains) <= set(self.permitted_domains):
            return 'BLOCK'
        if action in self.approval_required_actions:
            return 'REQUIRE_APPROVAL'
        return 'AUTO_EXECUTE' if action in self.allowed_actions else 'BLOCK'


def browser_worker_graph(flows):
    """Describe the existing scheduler's actual per-flow actor/verifier roles."""
    nodes = []
    for flow in flows:
        for role in ('operator', 'verifier'):
            profile = REGISTRY.resolve('browser.' + role)
            dependencies = ([flow.flow_id + ':operator'] if role == 'verifier' else
                            [fid + ':verifier' for fid in flow.dependencies])
            nodes.append({'worker_id': flow.flow_id + ':' + role, 'task_id': flow.flow_id,
                          'mission_id': flow.mission_id, 'revision': flow.revision,
                          'profile_id': profile.profile_id, 'profile_version': profile.version,
                          'dependencies': dependencies, 'parallelizable': flow.parallelizable,
                          'context_policy': list(profile.context_policy),
                          'verification_requirements': list(profile.verification_requirements),
                          'budgets': {'actions':flow.action_budget, 'retries':flow.retry_budget, 'seconds':flow.time_budget},
                          'runtime': 'BrowserRuntime' if role == 'operator' else 'BrowserVerifier'})
    return nodes


@dataclass(frozen=True)
class BackendCandidate:
    backend_id: str
    runtime: str
    tool: str
    model_id: str | None = None


@dataclass(frozen=True)
class BackendRoute:
    profile_id: str
    profile_version: int
    backend_id: str
    runtime: str
    tool: str
    model_id: str | None
    reason: str


class ModelRouter:
    """Select only installed/configured backends compatible with a profile.

    Configuration order is a preference, not proof of capability quality. The
    route records that distinction rather than labelling untested models proven.
    Runtime-specific availability/fallback handling remains with its adapter.
    """
    def select(self, profile, tool, candidates, *, preferred=None, excluded=()):
        if tool not in profile.tools:
            raise ValueError('profile_tool_not_permitted')
        eligible = [c for c in candidates if c.tool == tool and c.backend_id not in excluded]
        if not eligible:
            raise ValueError('no_compatible_backend')
        if preferred is not None:
            eligible = [c for c in eligible if c.backend_id == preferred]
            if not eligible:
                raise ValueError('configured_backend_unavailable')
        candidate = eligible[0]
        return BackendRoute(profile.profile_id, profile.version, candidate.backend_id,
                            candidate.runtime, candidate.tool, candidate.model_id,
                            'explicit_configuration' if preferred is not None else 'configured_preference')


def browser_role_profile(role):
    roles = {'planner':'browser.planner', 'planner_repair':'browser.planner',
             'replanning':'browser.planner', 'synthesis':'response.synthesizer',
             'text':'browser.operator', 'escalation':'browser.operator',
             'jev':'browser.operator', 'jev_policy':'browser.operator'}
    try:
        return REGISTRY.resolve(roles[role])
    except KeyError:
        raise ValueError('unknown_browser_model_role') from None
