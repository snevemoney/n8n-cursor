"""Browser MissionController terminal_commit_id: uuid4 with JARVIS_ONE_MIND off (unchanged),
deterministic sha256(mission id + verified outcome) with it on. Same execute_mission code path."""
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
    async def test_flag_off_keeps_uuid4(self):
        with patch.dict(os.environ, {'JARVIS_ONE_MIND': ''}):
            with tempfile.TemporaryDirectory() as a, tempfile.TemporaryDirectory() as b:
                first, second = await failed_mission(a), await failed_mission(b)
        for row in (first, second):
            self.assertEqual(row['status'], 'FAILED')
            self.assertRegex(row['terminal_commit_id'], r'^[0-9a-f]{32}$')
            self.assertEqual(uuid.UUID(hex=row['terminal_commit_id']).version, 4)
        self.assertNotEqual(first['terminal_commit_id'], second['terminal_commit_id'])

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
            self.assertNotEqual(fn(req, ok), fn(req, ok))


if __name__ == '__main__':
    unittest.main()
