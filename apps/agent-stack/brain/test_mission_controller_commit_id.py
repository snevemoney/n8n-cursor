"""Browser MissionController terminal_commit_id: deterministic 'ter_' sha256(mission id + verified
outcome) regardless of JARVIS_ONE_MIND (replaces uuid4; Evens GO 2026-10-12). Matches
one_mind.trace.terminal_commit_id and never imports one_mind."""
import importlib.util, os, re, sys, tempfile, unittest, uuid
from pathlib import Path
from unittest.mock import patch

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('commit_id_browser_test', HERE.parent / 'hands/browser_runtime.py')
br = importlib.util.module_from_spec(spec); sys.modules[spec.name] = br; spec.loader.exec_module(br)


async def failed_mission(tmp):
    root = Path(tmp)
    br.write_json(root / 'request.json', {'mission_id': 'b' * 32, 'objective': 'Read result',
                                          'source_manifest': {'brain/mission_controller.py': 'old'}})
    br.write_json(root / 'state.json', {'mission_id': 'b' * 32, 'verified': False})
    br.write_json(root / 'control.json', {'cancel': False})
    with patch.object(br, 'mission_source_manifest', return_value={'brain/mission_controller.py': 'new'}), \
            patch.object(br, 'ModelGateway'), patch.object(br, 'BrowserRuntime'):
        return await br.execute_mission(root)


class CommitIdTests(unittest.IsolatedAsyncioTestCase):
    async def test_flag_off_deterministic_ter_and_no_one_mind_import(self):
        with patch.dict(os.environ, {'JARVIS_ONE_MIND': ''}):
            with tempfile.TemporaryDirectory() as a, tempfile.TemporaryDirectory() as b:
                first, second = await failed_mission(a), await failed_mission(b)
        for row in (first, second):
            self.assertEqual(row['status'], 'FAILED')
            self.assertRegex(row['terminal_commit_id'], r'^ter_[0-9a-f]{24}$')
        self.assertEqual(first['terminal_commit_id'], second['terminal_commit_id'])
        code = ('import importlib.util,sys;s=importlib.util.spec_from_file_location("mc",%r);m=importlib.util.module_from_spec(s);'
                's.loader.exec_module(m);print(m.MissionController._terminal_commit_id({"mission_id":"x"},{"status":"FAILED"}));'
                'print([k for k in sys.modules if "one_mind" in k])') % str(HERE / 'mission_controller.py')
        import subprocess
        out = subprocess.run([sys.executable, '-c', code], capture_output=True, text=True, env={k: v for k, v in os.environ.items() if k != 'JARVIS_ONE_MIND'})
        lines = out.stdout.split()
        self.assertTrue(lines[0].startswith('ter_'), out.stderr)
        self.assertEqual(lines[-1], '[]')

    def test_matches_one_mind_trace_formula(self):
        spec3 = importlib.util.spec_from_file_location('commit_id_mc2', HERE / 'mission_controller.py')
        mc = importlib.util.module_from_spec(spec3); spec3.loader.exec_module(mc)
        pkg_spec = importlib.util.spec_from_file_location('om_cid', HERE / 'one_mind' / '__init__.py', submodule_search_locations=[str(HERE / 'one_mind')])
        pkg = importlib.util.module_from_spec(pkg_spec); sys.modules['om_cid'] = pkg; pkg_spec.loader.exec_module(pkg)
        tspec = importlib.util.spec_from_file_location('om_cid.trace', HERE / 'one_mind' / 'trace.py')
        tr = importlib.util.module_from_spec(tspec); sys.modules['om_cid.trace'] = tr; tspec.loader.exec_module(tr)
        try:
            state = {'status': 'VERIFIED', 'verified': True, 'results': [{'flow_id': 'f2', 'verified': True}, {'flow_id': 'f1', 'verified': True}]}
            outcome = {'status': 'VERIFIED', 'verified': True, 'accepted': ['f1', 'f2']}
            self.assertEqual(mc.MissionController._terminal_commit_id({'mission_id': 'm1'}, state), tr.terminal_commit_id('m1', outcome))
        finally:
            for k in [k for k in sys.modules if k.startswith('om_cid')]:
                del sys.modules[k]

    async def test_flag_on_replay_gives_same_id(self):
        with patch.dict(os.environ, {'JARVIS_ONE_MIND': '1'}):
            with tempfile.TemporaryDirectory() as a, tempfile.TemporaryDirectory() as b:
                first, second = await failed_mission(a), await failed_mission(b)
                replay = await failed_mission(a)
        self.assertTrue(first['terminal_commit_id'].startswith('ter_'))
        self.assertEqual(first['terminal_commit_id'], second['terminal_commit_id'])
        self.assertEqual(first['terminal_commit_id'], replay['terminal_commit_id'])

    def test_flag_on_id_depends_on_verified_outcome(self):
        fn = br.sys.modules['agent_stack_mission_controller'].MissionController._terminal_commit_id \
            if 'agent_stack_mission_controller' in br.sys.modules else None
        if fn is None:
            spec2 = importlib.util.spec_from_file_location('commit_id_mc', HERE / 'mission_controller.py')
            mc = importlib.util.module_from_spec(spec2); spec2.loader.exec_module(mc); fn = mc.MissionController._terminal_commit_id
        req = {'mission_id': 'c' * 32}
        ok = {'status': 'VERIFIED', 'verified': True, 'results': [{'flow_id': 'f1', 'verified': True}]}
        with patch.dict(os.environ, {'JARVIS_ONE_MIND': '1'}):
            self.assertEqual(fn(req, ok), fn(req, dict(ok)))
            self.assertNotEqual(fn(req, ok), fn(req, ok | {'status': 'PARTIAL', 'verified': False}))
        with patch.dict(os.environ, {'JARVIS_ONE_MIND': ''}):
            self.assertEqual(fn(req, ok), fn(req, dict(ok)))


if __name__ == '__main__':
    unittest.main()
