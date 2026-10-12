"""B2: evidence router, fake backends, ContextBuilder. Offline; no paid calls."""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from one_mind import backends as B, router as RT, context_builder as C, registry as R  # noqa: E402


def reg():
    r = B.BackendRegistry()
    r.register(B.FakeBackend('box-agent-a', 'box.shell', runtime='box'))
    r.register(B.FakeBackend('box-agent-b', 'box.shell', runtime='box'))
    r.register(B.FakeBackend('chat', 'frontier.chat'))
    return r


class BackendTests(unittest.TestCase):
    def test_fake_scripted_and_recorded(self):
        f = B.FakeBackend('f', 'box.shell', [{'ok': 1}, ValueError('boom'), lambda req: {'echo': req['x']}])
        self.assertEqual(f.run({'x': 1}), {'ok': 1})
        with self.assertRaises(ValueError):
            f.run({'x': 2})
        self.assertEqual(f.run({'x': 3}), {'echo': 3})
        with self.assertRaises(RuntimeError):
            f.run({})
        self.assertEqual(len(f.calls), 4)

    def test_mac_and_paid_refused(self):
        r = B.BackendRegistry()
        with self.assertRaises(ValueError):
            r.register(B.FakeBackend('mac', 'box.shell', runtime='mac'))
        paid = B.FakeBackend('p', 'frontier.chat'); paid.paid = True
        with self.assertRaises(ValueError):
            r.register(paid)


class RouterTests(unittest.TestCase):
    def setUp(self):
        self.profile = R.REGISTRY.resolve('software.verifier')
        self.cands = reg().candidates('box.shell')

    def test_config_order_without_evidence(self):
        route = RT.EvidenceRouter().select(self.profile, 'box.shell', self.cands)
        self.assertEqual((route.backend_id, route.reason), ('box-agent-a', 'configured_preference'))

    def test_proven_evidence_wins_only_with_enough_trials(self):
        ev = {('software.verifier', 'box-agent-b'): {'trials': 10, 'passes': 9},
              ('software.verifier', 'box-agent-a'): {'trials': 10, 'passes': 5}}
        route = RT.EvidenceRouter(ev).select(self.profile, 'box.shell', self.cands)
        self.assertEqual((route.backend_id, route.reason), ('box-agent-b', 'proven_evidence'))
        thin = {('software.verifier', 'box-agent-b'): {'trials': 2, 'passes': 2}}
        self.assertEqual(RT.EvidenceRouter(thin).select(self.profile, 'box.shell', self.cands).backend_id, 'box-agent-a')

    def test_preference_and_tool_permission(self):
        ev = {('software.verifier', 'box-agent-b'): {'trials': 10, 'passes': 10}}
        route = RT.EvidenceRouter(ev).select(self.profile, 'box.shell', self.cands, preferred='box-agent-a')
        self.assertEqual(route.reason, 'explicit_configuration')
        with self.assertRaises(ValueError):
            RT.EvidenceRouter().select(self.profile, 'frontier.chat', reg().candidates('frontier.chat'))
        with self.assertRaises(ValueError):
            RT.EvidenceRouter().select(self.profile, 'box.shell', self.cands, excluded=('box-agent-a', 'box-agent-b'))

    def test_route_drives_fake_backend(self):
        r = reg()
        r.get('box-agent-b').replies.append({'verdict': 'PASS'})
        ev = {('software.verifier', 'box-agent-b'): {'trials': 5, 'passes': 5}}
        route = RT.EvidenceRouter(ev).select(self.profile, 'box.shell', r.candidates('box.shell'))
        self.assertEqual(r.get(route.backend_id).run({'cmd': 'pytest'}), {'verdict': 'PASS'})


class ContextTests(unittest.TestCase):
    def test_minimal_and_redacted(self):
        prof = R.REGISTRY.resolve('software.verifier')  # acceptance, patch_ref, test_request
        built = C.ContextBuilder().build(prof, {'acceptance': 'tests pass', 'objective': 'x', 'memory': 'private',
                                                'patch_ref': {'id': 'a1', 'api_key': 'zzz'}})
        self.assertEqual(set(built['context']), {'acceptance', 'patch_ref'})
        self.assertEqual(built['context']['patch_ref']['api_key'], '[redacted]')
        self.assertEqual(built['missing'], ['test_request'])
        self.assertFalse(C.ContextBuilder.sufficient(built))

    def test_cap(self):
        prof = R.REGISTRY.resolve('software.verifier')
        built = C.ContextBuilder(char_cap=200).build(prof, {'acceptance': 'a' * 5000, 'patch_ref': 'p', 'test_request': 't'})
        self.assertIn('acceptance', built['truncated'])
        self.assertTrue(C.ContextBuilder.sufficient(built))


if __name__ == '__main__':
    unittest.main()
