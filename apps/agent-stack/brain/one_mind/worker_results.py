"""Structured worker results. A WorkerResult can never declare the mission complete.

Only MissionController (later batch) creates a MissionResult; workers return
artifacts with provenance. Validation is deterministic.
"""
from dataclasses import dataclass, field, asdict

VERDICTS = ('PASS', 'FAIL')
RECOMMENDATIONS = ('approve', 'request_changes', 'block')
FORBIDDEN_CLAIMS = ('mission_complete', 'mission_verified', 'mission_success', 'done')


@dataclass(frozen=True)
class Provenance:
    mission_id: str
    task_id: str
    worker_id: str
    profile_id: str
    profile_version: int
    backend_id: str = ''
    trace_id: str = ''


@dataclass(frozen=True)
class WorkerResult:
    artifact_id: str
    kind: str
    provenance: Provenance
    status: str = 'COMPLETED'  # worker-level only: COMPLETED | FAILED | BLOCKED | NEEDS_APPROVAL
    evidence: tuple = ()
    notes: str = ''

    def to_dict(self):
        return asdict(self)


@dataclass(frozen=True)
class BuilderResult(WorkerResult):
    patch: str = ''
    files: tuple = ()
    test_request: str = ''


@dataclass(frozen=True)
class TesterResult(WorkerResult):
    verdict: str = 'FAIL'
    condition: str = ''
    expected: str = ''
    observed: str = ''


@dataclass(frozen=True)
class ReviewerResult(WorkerResult):
    findings: tuple = ()
    risks: tuple = ()
    recommendation: str = 'request_changes'


@dataclass(frozen=True)
class BrowserFlowResult(WorkerResult):
    flow_id: str = ''
    verified_by: str = ''  # verifier id; empty means unverified


KINDS = {'builder': BuilderResult, 'tester': TesterResult, 'reviewer': ReviewerResult, 'browser_flow': BrowserFlowResult}
STATUSES = ('COMPLETED', 'FAILED', 'BLOCKED', 'NEEDS_APPROVAL')


def validate(result):
    errors = []
    if not isinstance(result, WorkerResult):
        return ['not_a_worker_result']
    if not result.artifact_id:
        errors.append('artifact_id_required')
    if result.status not in STATUSES:
        errors.append('invalid_status')
    prov = result.provenance
    for key in ('mission_id', 'task_id', 'worker_id', 'profile_id'):
        if not getattr(prov, key):
            errors.append('provenance_' + key + '_required')
    if type(prov.profile_version) is not int or prov.profile_version < 1:
        errors.append('provenance_profile_version_invalid')
    if isinstance(result, TesterResult):
        if result.verdict not in VERDICTS:
            errors.append('invalid_verdict')
        if not (result.condition and result.expected and result.observed):
            errors.append('tester_fields_required')
        if result.verdict == 'PASS' and not result.evidence:
            errors.append('pass_requires_evidence')
    if isinstance(result, ReviewerResult) and result.recommendation not in RECOMMENDATIONS:
        errors.append('invalid_recommendation')
    if isinstance(result, BuilderResult) and result.status == 'COMPLETED' and not result.patch:
        errors.append('builder_patch_required')
    lowered = (result.notes or '').lower()
    if any(claim in lowered.replace(' ', '_') for claim in FORBIDDEN_CLAIMS[:3]):
        errors.append('worker_claims_mission_outcome')
    return errors


def from_dict(row):
    row = dict(row)
    cls = KINDS.get(row.get('kind'))
    if cls is None:
        raise ValueError('unknown_result_kind')
    if any(key in row for key in FORBIDDEN_CLAIMS):
        raise ValueError('worker_claims_mission_outcome')
    known = set(cls.__dataclass_fields__)
    extra = set(row) - known
    if extra:
        raise ValueError('unknown_fields:' + ','.join(sorted(extra)))
    row['provenance'] = Provenance(**row['provenance'])
    for key in ('evidence', 'files', 'findings', 'risks'):
        if key in row:
            row[key] = tuple(row[key])
    result = cls(**row)
    errors = validate(result)
    if errors:
        raise ValueError(';'.join(errors))
    return result
