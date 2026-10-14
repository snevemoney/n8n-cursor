"""Controller connections with real isolated source/copy receipts; no live provider proof."""
import asyncio,hashlib,json,sys,tempfile,unittest
from pathlib import Path
from unittest.mock import patch,Mock
from brain.mission_controller import MissionController
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'hands'))
from test_coding_workflow_guard import CodingWorkflowGuardTests,D,T,ID

class WorkflowExecutionController(unittest.TestCase):
 def test_prepared_copy_reused_child_queued_and_full_task_remains_unverified(self):
  fixture=CodingWorkflowGuardTests()
  with tempfile.TemporaryDirectory() as tmp:
   h,root,repo,runtime,scratch,hand=fixture.fixture(tmp);a,b=T.ExecutionTests().context(hand)
   with a,b,fixture.setup(hand),patch.object(D,'_spawn_worker',return_value=Mock(pid=876543)),patch.object(D,'_identity',return_value='offline fixture'):
    fixture.prepare(h,repo,runtime,scratch);mc=MissionController(D)
    raw=(root/'request.json').read_bytes()
    D.write_json(root/'execution_dispatch.json',{'mission_id':ID,'request_sha256':hashlib.sha256(raw).hexdigest(),'source_manifest':mc._workflow_manifest()})
    with patch.object(T.E,'prepare_execution',side_effect=AssertionError('do not repeat preparation')),patch.object(D.CodingMissionHandle,'status',return_value={'status':'COMPLETED','builder_verified':True,'coding_evidence':{'fixture':True}}):
     got=asyncio.run(mc.execute(root))
    self.assertEqual(got['status'],'WAITING_INDEPENDENT_REVIEW',got)
    self.assertFalse(got['verified']);self.assertFalse(got['task_verified'])
    self.assertIn('ArtCraft',got['spoken']);self.assertIn('Obsidian',got['spoken'])
    self.assertEqual(raw,(root/'request.json').read_bytes())
    self.assertFalse((root/'result.json').exists())
    child=D.read_json(root/'coding_child.json')['mission_id']
    child_request=D.read_json(D.mission_path(h,child)/'request.json')
    self.assertEqual(child_request['workflow_context']['parent_mission_id'],ID)

 def test_explicit_continue_reaches_existing_owned_queue_not_status_only(self):
  adapter=Mock();adapter.WorkflowMissionHandle.return_value.continue_workflow.return_value={'status':'WAITING_ORIGINAL_IMPLEMENTATION'}
  mc=MissionController(adapter)
  with patch.object(mc,'queue_research_build',return_value={'status':'QUEUED','task_verified':False}) as queue:
   result=mc.continue_research_build(Path('/offline/hive'),ID,'continue workflow')
  adapter.WorkflowMissionHandle.return_value.continue_workflow.assert_called_once_with(ID,'continue workflow')
  queue.assert_called_once_with(Path('/offline/hive'),ID)
  self.assertEqual(result['status'],'QUEUED');self.assertFalse(result['task_verified'])

 def test_unassociated_source_cannot_prepare_or_queue_builder(self):
  fixture=CodingWorkflowGuardTests()
  with tempfile.TemporaryDirectory() as tmp:
   h,root,repo,runtime,scratch,hand=fixture.fixture(tmp);a,b=T.ExecutionTests().context(hand)
   with a,b,fixture.setup(hand):
    source=D.read_json(root/'source_research.json');source['selected']['origin_association_verified']=False;D.write_json(root/'source_research.json',source)
    mc=MissionController(D);raw=(root/'request.json').read_bytes()
    D.write_json(root/'execution_dispatch.json',{'mission_id':ID,'request_sha256':hashlib.sha256(raw).hexdigest(),'source_manifest':mc._workflow_manifest()})
    with patch.object(D.CodingMissionHandle,'queue_workflow_code',side_effect=AssertionError('no build')):
     got=asyncio.run(mc.execute(root))
    self.assertEqual(got['status'],'WAITING_ORIGINAL_IMPLEMENTATION')
    self.assertFalse((root/'execution_contract.json').exists())
    self.assertEqual(raw,(root/'request.json').read_bytes())

 def test_new_worker_guard_context_reaches_existing_coding_executor(self):
  fixture=CodingWorkflowGuardTests()
  with tempfile.TemporaryDirectory() as tmp:
   h,root,repo,runtime,scratch,hand=fixture.fixture(tmp);a,b=T.ExecutionTests().context(hand)
   with a,b,fixture.setup(hand),patch.object(D,'_spawn_worker',return_value=Mock(pid=876543)),patch.object(D,'_identity',return_value='offline fixture'):
    fixture.prepare(h,repo,runtime,scratch)
    child=D.CodingMissionHandle(h).queue_workflow_code(ID)['mission_id'];child_root=D.mission_path(h,child)
    request=D.read_json(child_root/'request.json')
    with patch.object(D,'run_coding',return_value={'ok':False,'verified':False,'blocked':True}) as run:
     got=asyncio.run(MissionController(D).execute(child_root))
    self.assertEqual(run.call_args.kwargs['workflow_context'],request['workflow_context'])
    self.assertEqual(got['status'],'BLOCKED')
    self.assertFalse(got['verified'])

if __name__=='__main__':unittest.main()
