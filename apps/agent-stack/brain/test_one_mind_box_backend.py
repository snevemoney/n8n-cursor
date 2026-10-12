"""Box-agent coding backend behind the ModelRouter. FakeLLM only; no paid calls, no network."""
import json
import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent))
from one_mind import box_backend as BB, backends as B, llm as L, registry as R, router as RT, model_routing as MR, fakes as F  # noqa: E402

BUGGY = 'def add(a, b):\n    return a - b\n'
GOOD = 'def add(a, b):\n    return a + b\n'
TESTS = ('import unittest\nfrom calc import add\n\nclass T(unittest.TestCase):\n'
         '    def test_add(self):\n        self.assertEqual(add(2, 3), 5)\n')
CMD = [sys.executable, '-m', 'unittest', '-q', 'test_calc']


def edit(src):
    return json.dumps({'files': {'calc.py': src}, 'notes': 'edit'})


class FailingAliasLLM(L.FakeLLM):
    def __init__(self, replies, down, **kw):
        super().__init__(replies, **kw); self.down, self.models = set(down), []

    def chat(self, model, messages, **kw):
        self.models.append(model)
        if model in self.down:
            raise ConnectionError('alias down')
        return super().chat(model, messages, **kw)


@patch.dict(os.environ, {'JARVIS_ONE_MIND': '1'})
class BoxBackendTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.repo = Path(self.tmp.name) / 'repo'; self.repo.mkdir()
        (self.repo / 'calc.py').write_text(BUGGY); (self.repo / 'test_calc.py').write_text(TESTS)
        self.req = {'source': str(self.repo), 'files': ['calc.py'], 'test_cmd': CMD, 'objective': 'fix add'}

    def tearDown(self):
        self.tmp.cleanup()

    def test_model_router_selects_box_backend_and_it_fixes_code_in_copy(self):
        reg = B.BackendRegistry()
        backend = reg.register(BB.BoxCodingBackend(L.FakeLLM([edit(BUGGY), edit(GOOD)], meter=L.CostMeter(0.5)),
                                                   table={'frontier.chat': ['coder-x']}))
        prof = R.REGISTRY.resolve('software.builder')
        route = RT.EvidenceRouter().select(prof, 'box.shell', reg.candidates('box.shell'))
        self.assertEqual((route.backend_id, route.runtime), ('box.coding', 'box'))
        out = reg.get(route.backend_id).run(self.req)
        self.assertEqual(out['status'], 'COMPLETED')
        self.assertTrue(out['verify']['passed'])
        self.assertIn('+    return a + b', out['patch'])
        self.assertEqual(out['routes'][-1]['alias'], 'coder-x')
        self.assertEqual((self.repo / 'calc.py').read_text(), BUGGY)  # source untouched
        self.assertEqual(backend.routed.router.evidence[('software.builder', 'coder-x')], {'trials': 1, 'passes': 1})

    def test_aliases_configurable_with_fallback(self):
        with patch.dict(os.environ, {'JARVIS_ONE_MIND_ALIASES': json.dumps({'frontier.chat': ['my-a', 'my-b']})}):
            llm = FailingAliasLLM([edit(GOOD)], down=('my-a',), meter=L.CostMeter(0.5))
            out = BB.BoxCodingBackend(llm).run(self.req)
        self.assertEqual(out['status'], 'COMPLETED')
        self.assertEqual(llm.models, ['my-a', 'my-b'])

    def test_budget_failure_reported(self):
        out = BB.BoxCodingBackend(L.FakeLLM([edit(BUGGY)] * 2, meter=L.CostMeter(0.5)), max_iterations=2,
                                  table={'frontier.chat': ['c']}).run(self.req)
        self.assertEqual((out['status'], out['reason']), ('FAILED', 'iteration_budget'))

    def test_no_paid_backend_in_ci(self):
        class Paid(L.FakeLLM):
            paid = True
        with self.assertRaises(ValueError):
            B.BackendRegistry().register(BB.BoxCodingBackend(Paid([], meter=L.CostMeter(0.5))))
        with patch.dict(os.environ, {k: '' for k in L.KEY_ENVS}):
            with self.assertRaises(RuntimeError):
                BB.BoxCodingBackend.from_env(F.coding_authority('m'), allow_paid=True)
        with self.assertRaises(RuntimeError):
            BB.BoxCodingBackend.from_env(F.coding_authority('m'), allow_paid=False)

    def test_requires_flag(self):
        with patch.dict(os.environ, {'JARVIS_ONE_MIND': ''}):
            with self.assertRaises(RuntimeError):
                BB.BoxCodingBackend(L.FakeLLM([], meter=L.CostMeter(0.5))).run(self.req)


if __name__ == '__main__':
    unittest.main()
