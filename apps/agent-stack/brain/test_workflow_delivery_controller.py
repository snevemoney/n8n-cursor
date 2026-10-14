"""Connected canonical owner test, actual temporary Git/files; connectors/UI/reviews mocked.

No real provider, ArtCraft, Obsidian or native acceptance is asserted here.
"""
import asyncio,hashlib,json,sys,tempfile,unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch,Mock
from brain.mission_controller import MissionController
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'hands'))
import test_coding_workflow_guard as F
import test_workflow_delivery as DEL

class ConnectedOwner(unittest.TestCase):
 def test_actual_owner_from_builder_receipt_through_all_delivery_phases_and_terminal_dedupe(self):
  fixture=F.CodingWorkflowGuardTests();D=F.D;T=F.T;ID=F.ID
  with tempfile.TemporaryDirectory() as tmp:
   h,root,repo,runtime,scratch,hand=fixture.fixture(tmp);a,b=T.ExecutionTests().context(hand)
   request=D.read_json(root/'request.json');request['objective']='Implement the requested behavior with tests, a professional ArtCraft demonstration and one Obsidian implementation note.';D.write_json(root/'request.json',request)
   sha=hashlib.sha256((root/'request.json').read_bytes()).hexdigest()
   for name in ('owner_approval.json','original_implementation.json'):
    row=D.read_json(root/name);row['request_sha256']=sha;D.write_json(root/name,row)
   connector=DEL.ConnectorFixture();original_loader=D._load
   def load(name,path):
    if path.name=='workflow_delivery.py':
     return SimpleNamespace(Delivery=lambda adapter,hive,ident,**kw:DEL.M.Delivery(adapter,hive,ident,artifact_base=Path(tmp).resolve()/'private',runtime=connector,**kw),file_receipt=DEL.M.file_receipt)
    return original_loader(name,path)
   def completed(child):
    child_root=D.mission_path(h,child);request=D.read_json(child_root/'request.json');owned=Path(request['code_args']['repo'])
    source=owned/'offline_delivery_feature.py'
    if not source.exists():
     source.write_text('def actual_fixture_behavior(value):\n    return value + 1\n')
     hand._git(owned,'add','--','offline_delivery_feature.py');hand._git(owned,'commit','-q','-m','offline delivery feature fixture')
    docs=owned/'docs';docs.mkdir(exist_ok=True);(docs/('IMPLEMENTATION-'+root.name+'.md')).write_text('# Offline fixture implementation\n\nMethod, usage, meaningful fixture tests and limitations.\n');hand._git(owned,'add','--','docs');hand._git(owned,'commit','-q','-m','offline documentation fixture')
    checkpoint={'phase':'complete','snapshot':hand.code_repo_snapshot(owned),'files':[['offline_delivery_feature.py',source.read_text()]]}
    D.write_json(child_root/'checkpoint.json',{'checkpoint':checkpoint,'checkpoint_digest':hand.checkpoint_digest(checkpoint),'code_args':request['code_args'],'source_manifest':request['source_manifest']})
    receipt={'mission_id':child,'status':'COMPLETED','builder_verified':True,'coding_evidence':{'commit':'d'*40,'tests_passed':7,'offline_fixture':True}}
    D.write_json(D.mission_path(h,child)/'result.json',receipt);return receipt
   with a,b,fixture.setup(hand),patch.object(D,'_spawn_worker',return_value=Mock(pid=876543)),patch.object(D,'_identity',return_value='offline fixture'):
    fixture.prepare(h,repo,runtime,scratch);mc=MissionController(D);original=(root/'request.json').read_bytes()
    D.write_json(root/'execution_dispatch.json',{'mission_id':ID,'request_sha256':hashlib.sha256(original).hexdigest(),'source_manifest':mc._workflow_manifest()})
    nested_loader=D._load
    def scoped_load(name,path):
     if path.name=='workflow_delivery.py':return load(name,path)
     return nested_loader(name,path)
    with patch.object(D,'_load',side_effect=scoped_load),patch.object(D.CodingMissionHandle,'status',side_effect=completed):
     first=asyncio.run(mc.execute(root));self.assertEqual(first['status'],'WAITING_INDEPENDENT_REVIEW',first);self.assertEqual(connector.calls,[])
     authority=DEL.M.host_review_authority('independent_reviewer')
     mc.record_workflow_review(h,ID,'coding_delivery','ACCEPTED',{'offline_external_coding_review_fixture':True},authority)
     ready=asyncio.run(mc.execute(root));self.assertEqual(ready['status'],'WAITING_FINAL_REVIEW',ready);self.assertFalse(ready['task_verified'])
     self.assertEqual(connector.writes,1);self.assertEqual(connector.calls,['native','export','preview','open'])
     mc.record_workflow_review(h,ID,'final_delivery','ACCEPTED',{'offline_external_visual_and_delivery_review_fixture':True},authority)
     final=asyncio.run(mc.execute(root));self.assertEqual(final['status'],'COMPLETED',final);self.assertTrue(final['independent_acceptance'])
     raw=(root/'result.json').read_bytes();again=mc.queue_research_build(h,ID)
     self.assertEqual(again['status'],'COMPLETED');self.assertEqual(raw,(root/'result.json').read_bytes())
     self.assertEqual(connector.writes,1);self.assertEqual((root/'request.json').read_bytes(),original)
