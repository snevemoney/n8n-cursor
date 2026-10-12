"""B1: One-Mind contracts (authority, mode, registry, worker results). Offline."""
import os
import sys
import unittest
from dataclasses import asdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from one_mind import authority as A, registry as R, worker_results as W, flag  # noqa: E402


def env(**kw):
    base = dict(mission_id='m1', autonomy_level='ACT_WITH_POLICY', allowed_actions=('READ', 'EDIT', 'SEND'),
                forbidden_actions=('DELETE',), permitted_capabilities=('software.build',), permitted_domains=(),
                authorized_systems=('box',), credential_scope=('github.read',), tier='external')
    base.update(kw)
    return A.MissionAuthority(**base)


class AuthorityTests(unittest.TestCase):
    def test_capability_is_not_permission(self):
        self.assertEqual(env().decide('EDIT', 'software.review'), 'BLOCK')
        self.assertEqual(env().decide('DELETE', 'software.build'), 'BLOCK')
        self.assertEqual(env().decide('EDIT', 'software.build'), 'AUTO_EXECUTE')

    def test_outward_and_hard_actions_need_confirmation(self):
        self.assertEqual(env().decide('SEND', 'software.build'), 'REQUIRE_APPROVAL')
        self.assertEqual(env(confirm_actions=('EDIT',)).decide('EDIT', 'software.build'), 'REQUIRE_APPROVAL')

    def test_systems_credentials_and_limits(self):
        self.assertEqual(env().decide('EDIT', 'software.build', system='mac'), 'BLOCK')
        self.assertEqual(env().decide('EDIT', 'software.build', system='box'), 'AUTO_EXECUTE')
        self.assertEqual(env().decide('EDIT', 'software.build', credential='github.write'), 'BLOCK')
        self.assertEqual(env().decide('EDIT', 'software.build', used={'actions': 50}), 'BLOCK')
        self.assertEqual(env().decide('EDIT', 'software.build', used={'spend_usd': 0}), 'AUTO_EXECUTE')
        self.assertEqual(env().decide('EDIT', 'software.build', used={'spend_usd': 0.01}), 'BLOCK')

    def test_round_trip_and_validation(self):
        e = env()
        self.assertEqual(A.MissionAuthority.from_dict(e.to_dict(), 'm1'), e)
        with self.assertRaises(ValueError):
            A.MissionAuthority.from_dict(e.to_dict(), 'other')
        bad = e.to_dict() | {'limits': {'actions': -1}}
        with self.assertRaises(ValueError):
            A.MissionAuthority.from_dict(bad, 'm1')

    def test_modes_block_execution(self):
        for mode in ('ANSWER_ONLY', 'DELEGATE_ONLY'):
            self.assertEqual(env(autonomy_level=mode).decide('EDIT', 'software.build'), 'BLOCK')

    def test_base_envelope_unchanged(self):
        base = A.AuthorityEnvelope.browser_read('m', ('example.com',))
        self.assertNotIn('limits', asdict(base))


class ModeTests(unittest.TestCase):
    def m(self, **kw):
        args = dict(capability_maturity='proven', risk='low', reversible=True, blast_radius='low', evidence_fresh=True)
        args.update(kw)
        return A.select_mode(**args)

    def test_mode_matrix(self):
        self.assertEqual(self.m(), 'GOAL_AUTONOMY')
        self.assertEqual(self.m(reversible=False), 'ACT_WITH_POLICY')
        self.assertEqual(self.m(evidence_fresh=False), 'ACT_WITH_POLICY')
        self.assertEqual(self.m(capability_maturity='shadow'), 'ACT_WITH_POLICY')
        self.assertEqual(self.m(risk='high'), 'DELEGATE_ONLY')
        self.assertEqual(self.m(capability_maturity='experimental'), 'DELEGATE_ONLY')
        self.assertEqual(self.m(authorized=False), 'ANSWER_ONLY')
        with self.assertRaises(ValueError):
            self.m(risk='tiny')

    def test_pause_only_affected_subgraph(self):
        nodes = [{'worker_id': 'a'}, {'worker_id': 'b', 'dependencies': ['a']},
                 {'worker_id': 'c', 'dependencies': ['b']}, {'worker_id': 'd'}]
        self.assertEqual(A.approval_scope(nodes, 'b'), ['b', 'c'])


class RegistryTests(unittest.TestCase):
    def test_seed_and_browser_profiles(self):
        for pid in R.SEED_IDS + R.BROWSER_IDS:
            self.assertEqual(R.REGISTRY.resolve(pid).version, 1)
        self.assertEqual(len(R.SEED_IDS), 9)
        self.assertIs(R.REGISTRY.resolve('browser.operator'), A.profiles().REGISTRY.resolve('browser.operator'))

    def test_profiles_are_roles_not_models(self):
        for pid in R.SEED_IDS:
            prof = R.REGISTRY.resolve(pid)
            self.assertFalse(any('gpt' in t or 'claude' in t or 'grok' in t for t in prof.tools))
            self.assertIn(prof.reasoning_policy, ('frontier', 'jev', 'deterministic'))
            self.assertTrue(R.budgets(prof)['actions'] > 0)

    def test_verifiers_are_adversarial(self):
        for pid in ('software.verifier', 'software.reviewer', 'research.verifier'):
            self.assertEqual(R.REGISTRY.resolve(pid).persona, 'adversarial')


def prov():
    return W.Provenance('m1', 't1', 'w1', 'software.verifier', 1)


class WorkerResultTests(unittest.TestCase):
    def test_tester_contract(self):
        ok = W.TesterResult('a1', 'tester', prov(), verdict='PASS', condition='tests', expected='0 fail',
                            observed='0 fail', evidence=('log:1',))
        self.assertEqual(W.validate(ok), [])
        no_ev = W.TesterResult('a1', 'tester', prov(), verdict='PASS', condition='c', expected='e', observed='o')
        self.assertIn('pass_requires_evidence', W.validate(no_ev))

    def test_worker_cannot_claim_mission_outcome(self):
        row = W.BuilderResult('a2', 'builder', prov(), patch='diff').to_dict() | {'mission_complete': True}
        with self.assertRaises(ValueError):
            W.from_dict(row)
        claim = W.BuilderResult('a2', 'builder', prov(), patch='diff', notes='Mission complete!')
        self.assertIn('worker_claims_mission_outcome', W.validate(claim))

    def test_round_trip_and_unknown_fields(self):
        r = W.ReviewerResult('a3', 'reviewer', prov(), findings=('x',), recommendation='approve')
        self.assertEqual(W.from_dict(r.to_dict()), r)
        with self.assertRaises(ValueError):
            W.from_dict(r.to_dict() | {'surprise': 1})
        with self.assertRaises(ValueError):
            W.from_dict(W.BuilderResult('a4', 'builder', prov()).to_dict())


class FlagTests(unittest.TestCase):
    def test_default_off(self):
        old = os.environ.pop(flag.FLAG, None)
        try:
            self.assertFalse(flag.enabled())
            with self.assertRaises(RuntimeError):
                flag.require_enabled()
        finally:
            if old is not None:
                os.environ[flag.FLAG] = old


if __name__ == '__main__':
    unittest.main()
