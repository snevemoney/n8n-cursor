"""Fake coding worker graph for offline tests and the Golden Mission. No network, no spend."""
from . import receipts, worker_results as W
from .authority import MissionAuthority


def coding_authority(mission_id, **kw):
    base = dict(mission_id=mission_id, autonomy_level='ACT_WITH_POLICY', allowed_actions=('READ', 'EDIT', 'TEST', 'REVIEW'),
                forbidden_actions=('DELETE', 'DEPLOY', 'SEND', 'PUBLISH', 'PAY'),
                permitted_capabilities=('software.build', 'software.verify', 'software.review'),
                permitted_domains=(), authorized_systems=('box',))
    base.update(kw)
    return MissionAuthority(**base)


def coding_nodes(files=('app.py',)):
    return [
        {'worker_id': 'build', 'task_id': 'fix', 'profile_id': 'software.builder', 'action': 'EDIT',
         'capability': 'software.build', 'system': 'box', 'files': list(files), 'acceptance': 'tests pass'},
        {'worker_id': 'test', 'task_id': 'fix', 'profile_id': 'software.verifier', 'action': 'TEST',
         'capability': 'software.verify', 'system': 'box', 'dependencies': ['build'],
         'inputs': {'test_request': 'run unit tests', 'patch_ref': 'build'}},
        {'worker_id': 'review', 'task_id': 'fix', 'profile_id': 'software.reviewer', 'action': 'REVIEW',
         'capability': 'software.review', 'system': 'box', 'dependencies': ['test'], 'inputs': {'repo_slice': 'app.py'}},
        {'worker_id': 'runtime', 'task_id': 'fix', 'profile_id': 'software.verifier', 'action': 'TEST',
         'capability': 'software.verify', 'system': 'box', 'dependencies': ['review'],
         'inputs': {'test_request': 'runtime check', 'patch_ref': 'build'}},
    ]


def prov(mission_id, node, profile_id):
    return W.Provenance(mission_id, node['task_id'], node['worker_id'], profile_id, 1)


def builder(mission_id, patches):
    """patches: list of patch strings per attempt."""
    def run(ctx, node, attempt):
        return W.BuilderResult('art-build-%d' % attempt, 'builder', prov(mission_id, node, 'software.builder'),
                               patch=patches[min(attempt, len(patches) - 1)], files=tuple(node.get('files', ())),
                               test_request='run unit tests')
    return run


def tester(mission_id, verdicts):
    """verdicts: per worker_id, list of 'PASS'/'FAIL' per attempt."""
    def run(ctx, node, attempt):
        seq = verdicts[node['worker_id']]
        v = seq[min(attempt, len(seq) - 1)]
        return W.TesterResult('art-%s-%d' % (node['worker_id'], attempt), 'tester',
                              prov(mission_id, node, 'software.verifier'), verdict=v, condition='unit tests',
                              expected='0 failures', observed='0 failures' if v == 'PASS' else '1 failure: test_add',
                              evidence=(receipts.record('run', mission_id, node['worker_id'], {'attempt': attempt, 'fake': True}),) if v == 'PASS' else ())
    return run


def reviewer(mission_id, recommendation='approve'):
    def run(ctx, node, attempt):
        return W.ReviewerResult('art-review-%d' % attempt, 'reviewer', prov(mission_id, node, 'software.reviewer'),
                                findings=(), risks=(), recommendation=recommendation)
    return run


def coding_workers(mission_id, *, patches=('fix',), verdicts=None, recommendation='approve'):
    verdicts = verdicts or {'test': ['PASS'], 'runtime': ['PASS']}
    t = tester(mission_id, verdicts)
    return {'software.builder': builder(mission_id, list(patches)), 'software.verifier': t,
            'software.reviewer': reviewer(mission_id, recommendation)}
