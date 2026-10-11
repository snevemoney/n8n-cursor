import importlib.util,sys,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('controller_browser_test',HERE.parent/'hands/browser_runtime.py')
br=importlib.util.module_from_spec(spec);sys.modules[spec.name]=br;spec.loader.exec_module(br)
class SourceEvidenceTests(unittest.IsolatedAsyncioTestCase):
 async def test_changed_control_plane_prevents_model_and_worker_execution(self):
  with tempfile.TemporaryDirectory() as tmp:
   root=Path(tmp)
   br.write_json(root/'request.json',{'mission_id':'a'*32,'objective':'Read result','source_manifest':{'brain/mission_controller.py':'old'}})
   br.write_json(root/'state.json',{'mission_id':'a'*32,'verified':False})
   br.write_json(root/'control.json',{'cancel':False})
   with patch.object(br,'mission_source_manifest',return_value={'brain/mission_controller.py':'new'}),patch.object(br,'ModelGateway') as gateway,patch.object(br,'BrowserRuntime') as worker:
    result=await br.execute_mission(root)
   gateway.assert_not_called();worker.assert_not_called()
   self.assertEqual(result['status'],'FAILED');self.assertFalse(result['verified'])
   self.assertIn('mission_control_plane_source_changed',result['terminal_reason'])
   replay=await br.execute_mission(root)
   self.assertEqual(replay['terminal_commit_id'],result['terminal_commit_id'])
if __name__=='__main__':unittest.main()
