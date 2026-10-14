"""Connected delivery OFFLINE fixtures: actual temp artifacts, mocked connectors/UI/reviews.

These tests assert lifecycle and evidence handling; they are not native ArtCraft,
Obsidian, independent acceptance, or professional visual-quality proof.
"""
import hashlib,importlib.util,json,tempfile,unittest
from unittest.mock import patch
from pathlib import Path
from types import SimpleNamespace

ROOT=Path(__file__).parents[1]
def load(name,path):
 spec=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
M=load('connected_delivery',Path(__file__).with_name('workflow_delivery.py'));PM=load('delivery_methods',Path(__file__).with_name('project_methods.py'));H=load('delivery_fixture_hand',Path(__file__).with_name('agent_tools.py'))
ID='a'*32;CHILD='b'*32
class Adapter:
 STACK=ROOT
 def __init__(self):self.allowed=True
 def mission_path(self,hive,id):return Path(hive)/'coding-missions'/id
 def read_json(self,p):
  try:return json.loads(Path(p).read_text())
  except FileNotFoundError:return {}
 def write_json(self,p,row):Path(p).parent.mkdir(parents=True,exist_ok=True);Path(p).write_text(json.dumps(row))
 def _validate_workflow_context(self,c,args):
  if c!={'parent_mission_id':ID}:raise ValueError('foreign_child')
 def _load(self,name,path):
  if path.name=='workflow_execution.py':return SimpleNamespace(guard=lambda *a,**kw:{'ok':self.allowed,'configuration_preserved':self.allowed})
  if path.name=='project_methods.py':return PM
  if path.name=='agent_tools.py':return H
  raise AssertionError(path)
class ConnectorFixture:
 def __init__(self):self.calls=[];self.notes={};self.writes=0;self.badread=False;self.stop_after=None;self.connector=True
 def craft(self,task,plan):
  phase='native' if task.startswith('Create ') else 'export' if 'export PDF exactly' in task else 'preview'
  path=Path(plan[phase]);path.write_bytes(json.dumps({'fixture':'offline native','evidence':task[-500:]}).encode() if phase=='native' else b'%PDF-1.4\nfixture export\n%%EOF' if phase=='export' else b'\x89PNG\r\n\x1a\nfixture preview')
  self.calls.append(phase)
  if self.stop_after:self.stop_after();self.stop_after=None
  return {'ok':True,'steps':[{'tool':'fixture_save','ok':True}]}
 def inspect(self,path):return {'ok':path.is_file(),'inspection_sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'offline_fixture':True}
 def open_visible(self,path):self.calls.append('open');return {'verified':True,'offline_UI_fixture':True}
 def visible(self,path):return {'verified':True,'offline_UI_fixture':True}
 def note_contract(self):return {'server':'fixture-obsidian','write':'append_content','read':'get_file_contents','list':'list_files_in_dir','schema_verified':True,'schema_sha256':'offline-observed-schema-fixture'} if self.connector else None
 def note_read(self,c,p):return {'ok':p in self.notes,'content':('wrong readback' if self.badread else self.notes.get(p,''))}
 def note_list(self,c,p):return {'ok':True,'names':[Path(n).name for n in self.notes]}
 def note_write(self,action):self.writes+=1;self.notes[action['arguments']['filepath']]=action['arguments']['content'];return {'ok':True}
class Connected(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.root=Path(self.tmp.name).resolve();self.hive=self.root/'hive';self.a=Adapter();self.task=self.a.mission_path(self.hive,ID);self.child=self.a.mission_path(self.hive,CHILD)
  self.a.write_json(self.task/'request.json',{'objective':'Implement actual requested behavior, meaningful tests, professional ArtCraft demo, and one Obsidian implementation note.'})
  self.a.write_json(self.task/'control.json',{'cancel':False});self.a.write_json(self.task/'execution_owner.json',{'working_copy':str(self.root/'owned-copy'),'execution_contract_digest':'contract-fixture','configuration_digest':'config-fixture'})
  self.a.write_json(self.task/'original_implementation.json',{'original_implementation_url':'https://github.com/actual-fixture/project','repository':{'commit':'c'*40}})
  self.a.write_json(self.task/'coding_child.json',{'mission_id':CHILD});self.a.write_json(self.child/'request.json',{'workflow_context':{'parent_mission_id':ID},'code_args':{'repo':'fixture-owned-copy'}})
  self.coding={'mission_id':CHILD,'status':'COMPLETED','builder_verified':True,'coding_evidence':{'commit':'d'*40,'tests_passed':7}}
  self.a.write_json(self.child/'result.json',self.coding)
  repo=self.root/'owned-copy';repo.mkdir();source=repo/'implementation.py';source.write_text('def implemented_behavior(value):\n    return value + 1\n')
  (repo/'docs').mkdir();(repo/'docs'/('IMPLEMENTATION-'+ID+'.md')).write_text('# Actual offline fixture implementation\n\nMethod: increment input. Usage: implemented_behavior(value). Tests: seven offline fixture checks. Limits: no native execution proof.\n')
  for args in (('init','-q'),('config','user.name','Offline Fixture'),('config','user.email','fixture@invalid'),('add','--','implementation.py','docs'),('commit','-q','-m','offline implementation fixture')):
   result=H._git(repo,*args);self.assertEqual(result.returncode,0,result.stderr)
  request=self.a.read_json(self.child/'request.json');request['source_manifest']={'offline_fixture':'pinned'};self.a.write_json(self.child/'request.json',request)
  checkpoint={'phase':'complete','snapshot':H.code_repo_snapshot(repo),'files':[['implementation.py',source.read_text()]]}
  self.a.write_json(self.child/'checkpoint.json',{'checkpoint':checkpoint,'checkpoint_digest':H.checkpoint_digest(checkpoint),'code_args':request['code_args'],'source_manifest':request['source_manifest']})
  self.live=True;self.r=ConnectorFixture();self.d=M.Delivery(self.a,self.hive,ID,active_fn=lambda:self.live,artifact_base=self.root/'private',runtime=self.r)
  self.auth=M.host_review_authority('independent_reviewer')
 def tearDown(self):self.tmp.cleanup()
 def accept_coding(self):
  waiting=self.d.advance(self.coding);self.assertEqual(waiting['status'],'WAITING_INDEPENDENT_REVIEW')
  self.d.record_review('coding_delivery',waiting['review_subject'],'ACCEPTED',{'offline_external_review_fixture':True},self.auth)
 def test_connected_happy_path_real_temp_artifacts_note_readback_and_external_final_boundary(self):
  self.accept_coding();ready=self.d.advance(self.coding);self.assertEqual(ready['status'],'WAITING_FINAL_REVIEW');self.assertFalse(ready['task_verified'])
  self.assertEqual(self.r.calls,['native','export','preview','open']);self.assertEqual(self.r.writes,1)
  self.assertIn('Usage: implemented_behavior(value)',next(iter(self.r.notes.values())))
  for phase in ('native','export','preview'):
   file=ready['delivery_artifacts'][phase]['file'];self.assertEqual(M.file_receipt(file['path']),file)
  self.d.record_review('final_delivery',ready['review_subject'],'ACCEPTED',{'offline_visual_and_readback_review_fixture':True},self.auth)
  final=self.d.advance(self.coding);self.assertEqual(final['status'],'COMPLETED');self.assertTrue(final['independent_acceptance'])
  self.assertEqual(self.r.writes,1);self.assertEqual(self.r.calls,['native','export','preview','open'])
 def test_nested_craft_command_cannot_escape_host_action_or_path_scope(self):
  plan={'native':'/private/native.deckcraft','export':'/private/export.pdf','preview':'/private/preview.png','implementation_evidence':{}}
  real=SimpleNamespace(tools=[],instructions='',call=lambda *args:self.fail('unsafe command reached app'),observe=lambda:{'ok':True})
  for arguments in ({'steps':[{'id':'file.delete','params':{}}]}, {'steps':[{'id':'file.export','params':{'path':'/outside/escape.pdf'}}]}):
   craft=SimpleNamespace(session=lambda app:real,run=lambda args,task,model_fn,session_fn:session_fn('deckcraft').call('command_batch',arguments))
   runtime=M.Runtime(SimpleNamespace(STACK=ROOT,_load=lambda *args:SimpleNamespace(OPENROUTER_PAID_FALLBACKS=())),lambda:None)
   runtime.scope=lambda:(None,{},plan);runtime.load=lambda name:craft
   with self.assertRaises(ValueError):runtime.craft('private scoped demo',plan)
 def test_missing_reviewed_implementation_document_blocks_before_any_delivery(self):
  document=self.root/'owned-copy'/'docs'/('IMPLEMENTATION-'+ID+'.md');document.unlink()
  # Reconcile the actual current clean source snapshot, demonstrating that the
  # document requirement is separate from the general repository proof.
  H._git(self.root/'owned-copy','add','-u');H._git(self.root/'owned-copy','commit','-q','-m','offline removed docs')
  wrapped=self.a.read_json(self.child/'checkpoint.json');wrapped['checkpoint']['snapshot']=H.code_repo_snapshot(self.root/'owned-copy');wrapped['checkpoint_digest']=H.checkpoint_digest(wrapped['checkpoint']);self.a.write_json(self.child/'checkpoint.json',wrapped)
  result=self.d.advance(self.coding);self.assertEqual(result['delivery_reason'],'implementation_document_required');self.assertEqual(self.r.calls,[]);self.assertEqual(self.r.writes,0)
 def test_model_review_flags_and_unrequested_deliverables_cannot_grant_authority(self):
  waiting=self.d.advance(self.coding)
  with self.assertRaises(ValueError):self.d.record_review('coding_delivery',waiting['review_subject'],'ACCEPTED',{'approved':True},{'approved':True})
  self.assertEqual(self.d.advance(self.coding)['status'],'WAITING_INDEPENDENT_REVIEW');self.assertEqual(self.r.calls,[])
  self.a.write_json(self.task/'request.json',{'objective':'Build only.'});denied=self.d.advance(self.coding);self.assertEqual(denied['delivery_reason'],'deliverables_not_requested');self.assertEqual(self.r.writes,0)
 def test_stop_mid_action_then_resume_reconciles_actual_existing_file_without_duplicate_create(self):
  self.accept_coding();self.r.stop_after=lambda:setattr(self,'live',False)
  stopped=self.d.advance(self.coding);self.assertEqual(stopped['delivery_reason'],'delivery_stopped');self.assertEqual(self.r.calls,['native'])
  self.live=True;ready=self.d.advance(self.coding);self.assertEqual(ready['status'],'WAITING_FINAL_REVIEW');self.assertEqual(self.r.calls,['native','export','preview','open']);self.assertEqual(self.r.writes,1)
 def test_readback_failure_never_claims_success_or_replays_note_write(self):
  self.accept_coding();self.r.badread=True
  failed=self.d.advance(self.coding);self.assertEqual(failed['delivery_reason'],'obsidian_readback_mismatch');self.assertEqual(self.r.writes,1)
  self.r.badread=False;ready=self.d.advance(self.coding);self.assertEqual(ready['status'],'WAITING_FINAL_REVIEW');self.assertEqual(self.r.writes,1)
 def test_actual_implementation_drift_blocks_before_artifacts(self):
  self.accept_coding();(self.root/'owned-copy'/'implementation.py').write_text('def replaced(): return False')
  held=self.d.advance(self.coding);self.assertEqual(held['delivery_reason'],'verified_implementation_snapshot_required');self.assertEqual(self.r.calls,[])
 def test_private_note_write_uses_exact_host_receipt_and_cannot_be_replayed_or_redirected(self):
  self.accept_coding();real=M.Runtime(self.a,self.d.check);original=self.r.note_write
  def checked_write(action):
   with patch.object(H,'op_mcp',return_value={'ok':True}) as called:
    real.note_write(action)
   self.assertTrue(called.call_args.kwargs['approved']);self.assertEqual(called.call_args.args[2]['filepath'],'00_Outer_Heaven/shared/inbox/Jarvis-implementation-'+ID+'.md')
   return original(action)
  self.r.note_write=checked_write;ready=self.d.advance(self.coding);self.assertEqual(ready['status'],'WAITING_FINAL_REVIEW')
  state=self.a.read_json(self.task/'delivery.json');action={'server':'fixture-obsidian','tool':'append_content','arguments':{'filepath':state['plan']['note_path'],'content':state['plan']['note_content']}}
  with patch.object(H,'op_mcp',side_effect=AssertionError('no replay')):
   with self.assertRaises(ValueError):real.note_write(action)
   with self.assertRaises(ValueError):M.Runtime(self.a,lambda:None).note_write({'server':'mail','tool':'send','arguments':{'approved':True}})
 def test_window_permission_failure_does_not_discard_note_progress_or_claim_delivery(self):
  self.accept_coding();self.r.open_visible=lambda path:{'verified':False};self.r.visible=lambda path:{'verified':False}
  held=self.d.advance(self.coding);self.assertEqual(held['status'],'WAITING_NATIVE_VIEW');self.assertEqual(self.r.writes,1);self.assertFalse(held['task_verified'])

 def test_connector_configuration_and_artifact_drift_pause_without_false_completion(self):
  self.accept_coding();self.r.connector=False
  failed=self.d.advance(self.coding);self.assertEqual(failed['delivery_reason'],'obsidian_connector_contract_unavailable');self.assertEqual(self.r.writes,0)
  self.r.connector=True;ready=self.d.advance(self.coding);self.assertEqual(ready['status'],'WAITING_FINAL_REVIEW')
  Path(ready['delivery_artifacts']['native']['file']['path']).write_text('external modification')
  self.assertEqual(self.d.advance(self.coding)['delivery_reason'],'delivered_artifact_changed')
  self.a.allowed=False;self.assertEqual(self.d.advance(self.coding)['delivery_reason'],'delivery_configuration_or_authority_changed')

if __name__=='__main__':unittest.main()
