"""F5: LiteLLM alias routing with evidence and per-mission budget. Fakes only."""
import os
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent))
from one_mind import model_routing as MR, llm as L, registry as R, fakes as F, router as RT  # noqa: E402

TABLE = {'frontier.chat': ['frontier-a', 'frontier-b'], 'jev.decisions': ['jev']}


class FlakyClient:
    def __init__(self, meter, fail=(), cost=0.1):
        self.meter, self.fail, self.cost, self.models, self.on_call = meter, set(fail), cost, [], None

    def chat(self, model, messages, **kw):
        self.meter.check(self.cost)
        self.models.append(model)
        if model in self.fail:
            raise ConnectionError('down')
        row = {'model': model, 'cost_usd': self.cost}
        self.meter.add(row)
        if self.on_call:
            self.on_call(row)
        return 'ok:' + model


class Routing(unittest.TestCase):
    def setUp(self):
        self.prof = R.REGISTRY.resolve('software.builder')  # tools include frontier.chat

    def test_config_order_then_fallback(self):
        c = FlakyClient(L.CostMeter(0.5), fail=('frontier-a',))
        rc = MR.RoutedModelClient(self.prof, 'frontier.chat', c, table=TABLE)
        self.assertEqual(rc.chat('auto', []), 'ok:frontier-b')
        self.assertEqual(c.models, ['frontier-a', 'frontier-b'])

    def test_evidence_promotes_alias(self):
        router = RT.EvidenceRouter({('software.builder', 'frontier-b'): {'trials': 6, 'passes': 6},
                                    ('software.builder', 'frontier-a'): {'trials': 6, 'passes': 2}})
        rc = MR.RoutedModelClient(self.prof, 'frontier.chat', FlakyClient(L.CostMeter(0.5)), router=router, table=TABLE)
        rc.chat('auto', [])
        self.assertEqual(rc.routes[-1], {'alias': 'frontier-b', 'reason': 'proven_evidence'})
        rc.record_outcome(True)
        self.assertEqual(router.evidence[('software.builder', 'frontier-b')]['trials'], 7)

    def test_per_mission_budget_enforced(self):
        auth = F.coding_authority('m', limits={'model_usd': 0.25})
        meter = MR.mission_meter(auth)
        rc = MR.RoutedModelClient(self.prof, 'frontier.chat', FlakyClient(meter, cost=0.1), table=TABLE)
        rc.chat('auto', []); rc.chat('auto', [])
        with self.assertRaises(L.BudgetExceeded):
            rc.chat('auto', [])
        self.assertAlmostEqual(meter.spent, 0.2)
        other = MR.mission_meter(F.coding_authority('n'))
        self.assertEqual((other.spent, other.cap), (0.0, 0.5))

    def test_cap_never_above_fifty_cents(self):
        self.assertEqual(MR.mission_meter(F.coding_authority('m', limits={'model_usd': 5})).cap, 0.5)

    def test_tool_not_in_profile_refused(self):
        rc = MR.RoutedModelClient(R.REGISTRY.resolve('software.verifier'), 'frontier.chat', FlakyClient(L.CostMeter(1)), table=TABLE)
        with self.assertRaises(ValueError):
            rc.chat('auto', [])

    def test_alias_env_and_default_client(self):
        with patch.dict(os.environ, {'JARVIS_ONE_MIND_ALIASES': '{"frontier.chat": ["x"]}'}):
            self.assertEqual([c.backend_id for c in MR.candidates('frontier.chat')], ['x'])
        with patch.dict(os.environ, {'JARVIS_ONE_MIND_ALIASES': '{"frontier.chat": "x"}'}), self.assertRaises(ValueError):
            MR.aliases()
        with patch.dict(os.environ, {'JARVIS_LITELLM_KEY': '', 'LITELLM_KEY_JARVIS': ''}):
            self.assertIsNone(MR.default_client(F.coding_authority('m')))

    def test_all_backends_down(self):
        rc = MR.RoutedModelClient(self.prof, 'frontier.chat', FlakyClient(L.CostMeter(1), fail=('frontier-a', 'frontier-b')), table=TABLE)
        with self.assertRaises(RuntimeError):
            rc.chat('auto', [])


if __name__ == '__main__':
    unittest.main()
