"""One-Mind ProfileRegistry: the four existing browser profiles plus the spec seed.

Profiles are operational roles, never model identities (profile != model).
Built on profiles.ProfileRegistry; profiles.REGISTRY is left untouched.
"""
from dataclasses import dataclass

from ._base import profiles

_p = profiles()
WorkerProfile = _p.WorkerProfile


@dataclass(frozen=True)
class OneMindProfile(WorkerProfile):
    objective: str = ''
    reasoning_policy: str = 'frontier'  # frontier | jev | deterministic
    authority_ref: str = 'read_only'
    budgets: tuple = (('actions', 20), ('seconds', 600), ('retries', 2))


def _seed(pid, role, caps, tools, ctx, verify, contract, esc, *, objective, reasoning='frontier',
          authority='read_only', budgets=(('actions', 20), ('seconds', 600), ('retries', 2)), persona=''):
    return OneMindProfile(pid, 1, role, caps, tools, ctx, verify, contract, esc, persona,
                          objective, reasoning, authority, budgets)


SEED = (
    _seed('software.builder', 'implement a bounded code change in a box worktree', ('software.build',),
          ('box.shell', 'box.git_worktree', 'frontier.chat'), ('objective', 'acceptance', 'repo_slice', 'test_feedback'),
          ('software.verifier',), 'BuilderResult', ('scope_exceeded', 'budget_exhausted'),
          objective='produce a patch that meets acceptance criteria', authority='worktree_write',
          budgets=(('actions', 40), ('seconds', 1800), ('retries', 3))),
    _seed('software.verifier', 'run tests and hunt for wrongness', ('software.verify',),
          ('box.shell',), ('acceptance', 'patch_ref', 'test_request'), ('fresh_test_run',), 'TesterResult',
          ('insufficient_evidence',), objective='prove or disprove the acceptance condition',
          reasoning='deterministic', persona='adversarial'),
    _seed('software.reviewer', 'review a patch for defects and risk', ('software.review',),
          ('frontier.chat', 'rea.analyze'), ('patch_ref', 'acceptance', 'repo_slice'), ('evidence_cited',),
          'ReviewerResult', ('high_risk_change',), objective='find defects before merge', persona='adversarial'),
    _seed('architecture.reviewer', 'review design against constraints', ('architecture.review',),
          ('frontier.chat',), ('objective', 'constraints', 'design_doc'), ('evidence_cited',), 'ReviewerResult',
          ('constraint_conflict',), objective='find structural risk'),
    _seed('research.fast', 'answer a bounded question quickly with sources', ('research.read',),
          ('web.search', 'web.fetch', 'frontier.chat'), ('question', 'constraints'), ('research.verifier',),
          'ResearchResult', ('conflicting_sources',), objective='sourced short answer',
          budgets=(('actions', 10), ('seconds', 180), ('retries', 1))),
    _seed('research.deep', 'multi-source investigation', ('research.read',),
          ('web.search', 'web.fetch', 'frontier.chat'), ('question', 'constraints', 'prior_findings'),
          ('research.verifier',), 'ResearchResult', ('conflicting_sources', 'budget_exhausted'),
          objective='sourced synthesis', budgets=(('actions', 60), ('seconds', 1800), ('retries', 2))),
    _seed('research.verifier', 'check claims against cited sources', ('research.verify',),
          ('web.fetch',), ('claims', 'sources'), ('source_supports_claim',), 'VerificationResult',
          ('unsupported_claim',), objective='reject unsupported claims', persona='adversarial'),
    _seed('design.ui', 'produce UI design artifacts', ('design.ui',),
          ('frontier.chat', 'mobbin.search'), ('objective', 'brand', 'constraints'), ('architecture.reviewer',),
          'DesignResult', ('taste_ambiguity',), objective='design meeting stated constraints'),
    _seed('media.video', 'produce media artifacts within budget', ('media.video',),
          ('media.generate',), ('objective', 'brand', 'budget'), ('visual_inspect',), 'MediaResult',
          ('spend_required',), objective='media artifact', authority='approval_for_spend',
          budgets=(('actions', 5), ('seconds', 1200), ('retries', 1))),
)

SEED_IDS = tuple(p.profile_id for p in SEED)
BROWSER_IDS = ('browser.planner', 'browser.operator', 'browser.verifier', 'response.synthesizer')
REGISTRY = _p.ProfileRegistry([_p.REGISTRY.resolve(pid) for pid in BROWSER_IDS] + list(SEED))


def budgets(profile):
    return dict(getattr(profile, 'budgets', ()) or ())
