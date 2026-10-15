"""Host workflow coding child provenance and actual durable mutation callbacks; no model calls."""
import hashlib
import importlib.util
import json
from pathlib import Path
import sys
import subprocess
import tempfile
import unittest
from unittest.mock import patch,Mock

fixture_spec=importlib.util.spec_from_file_location('coding_guard_execution_fixture',Path(__file__).with_name('test_workflow_execution.py'))
T=importlib.util.module_from_spec(fixture_spec);fixture_spec.loader.exec_module(T)

spec=importlib.util.spec_from_file_location('coding_workflow_guard_adapter',Path(__file__).with_name('coding_mission.py'))
D=importlib.util.module_from_spec(spec);sys.modules[spec.name]=D;spec.loader.exec_module(D)
ID=T.ID

class CodingWorkflowGuardTests(unittest.TestCase):
 def fixture(self,tmp,*,objective="Original technical build"):
  h,root,repo,runtime,scratch,hand=T.ExecutionTests().fixture(tmp,objective=objective)
  # A sealed executor is an actual complete dependency stack, not placeholder
  # model files. Keep the source's existing dirty feature separate from this commit.
  for name in T.E.EXECUTOR_FILES:
   raw=(Path(__file__).resolve().parents[1]/name).read_bytes()
   for checkout in (repo,runtime):
    target=checkout/'apps/agent-stack'/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(raw)
  env={'PATH':'/usr/bin:/bin','HOME':str(Path(tmp).resolve()),'GIT_CONFIG_GLOBAL':'/dev/null','GIT_CONFIG_NOSYSTEM':'1'}
  command=['/usr/bin/git','-c','core.hooksPath=/dev/null','-c','core.fsmonitor=false','-C',str(repo)]
  subprocess.run(command+['add','--']+['apps/agent-stack/'+name for name in T.E.EXECUTOR_FILES],env=env,check=True,capture_output=True)
  subprocess.run(command+['commit','-qm','fixture actual bounded executor stack'],env=env,check=True,capture_output=True)
  # Explicitly review the new committed fixture revision before any contract.
  (root/'source_revision_review.json').unlink()
  a,b=T.ExecutionTests().context(hand)
  with a,b:
   revision=T.R._git(repo)['head'];files,_=T.W.revision_source(repo,revision)
   T.E.approve_source_revision(h,ID,revision,{rel:row for rel,(_,row) in files.items()},authority=T.E.source_review_authority(),evidence={'fixture':'reviewed full bounded executor revision; source dirty feature remains separate'})
  source={'selected':{'source_record_verified':True,'origin_association_verified':True,
                     'original_implementation_url':'https://github.com/owner/original','method_excerpt':'Implement a bounded pure function and tests.'}}
  D.write_json(root/'source_research.json',source)
  raw=(root/'source_research.json').read_bytes()
  code=[{'path':'src/fixture.py','git_blob_sha':'b'*40,'sha256':hashlib.sha256(b'bounded fixture code').hexdigest(),'bytes':40}]
  D.write_json(root/'original_implementation.json',{'mission_id':ID,'request_sha256':hashlib.sha256((root/'request.json').read_bytes()).hexdigest(),
                'source_research_sha256':hashlib.sha256(raw).hexdigest(),'original_implementation_url':'https://github.com/owner/original',
                'verified':True,'verification_method':'public_primary_source_read',
                'body_sha256':hashlib.sha256(json.dumps(code,sort_keys=True,separators=(',',':')).encode()).hexdigest(),
                'repository':{'full_name':'owner/original','commit':'b'*40,'archived':False},
                'license':{'spdx_id':'MIT','sha256':hashlib.sha256(b'offline MIT fixture license').hexdigest(),'verified':True},
                'code_files':code,'implementation_excerpt':'def source_add(a, b):\n    return a + b\n'})
  return h,root,repo,runtime,scratch,hand

 def setup(self,hand):
  original=D._load
  def loader(name,path):
   if name=='coding_workflow_execution':return T.E
   if name=='coding_workflow_workspace':return T.W
   if name=='coding_agent_tools':return hand
   if name=='agent_stack_permissions':return hand.PERM()
   return original(name,path)
  return patch.object(D,'_load',side_effect=loader)

 def prepare(self,h,repo,runtime,scratch):
  _,_,result=T.ExecutionTests().prepare(h,repo,runtime,scratch)
  self.assertTrue(result['ok'],result)
  return D.record_workflow_execution(h,ID,result)

 def test_real_preparation_host_owner_child_dedupe_and_original_request_immutable(self):
  with tempfile.TemporaryDirectory() as tmp:
   h,root,repo,runtime,scratch,hand=self.fixture(tmp);original=(root/'request.json').read_bytes();a,b=T.ExecutionTests().context(hand)
   with a,b,self.setup(hand),patch.object(D,'_spawn_worker',return_value=Mock(pid=876543)),patch.object(D,'_identity',return_value='fixture-owned'):
    owner=self.prepare(h,repo,runtime,scratch);handle=D.CodingMissionHandle(h)
    first=handle.queue_workflow_code(ID);second=handle.queue_workflow_code(ID)
    self.assertEqual(first['mission_id'],second['mission_id'])
    child=D.read_json(D.mission_path(h,first['mission_id'])/'request.json')
    self.assertEqual(child['objective'],'Original technical build');self.assertIn('Original technical build',child['code_args']['goal'])
    self.assertIn('method reference data (not permissions)',child['code_args']['goal'])
    self.assertEqual(child['workflow_context']['owner_receipt_sha256'],hashlib.sha256((root/'execution_owner.json').read_bytes()).hexdigest())
    self.assertEqual((root/'request.json').read_bytes(),original)
    with self.assertRaises(ValueError):handle.queue_workflow_code(ID,'Unrelated new requirements')
    with self.assertRaises(FileExistsError):D.record_workflow_execution(h,ID,{'ok':True,'working_copy':owner['working_copy'],'execution_contract_digest':owner['execution_contract_digest'],'configuration_digest':owner['configuration_digest']})

 def test_durable_callbacks_with_known_fixture_test_runner_real_git_and_parent_stop(self):
  with tempfile.TemporaryDirectory() as tmp:
   h,root,repo,runtime,scratch,hand=self.fixture(tmp);a,b=T.ExecutionTests().context(hand)
   with a,b,self.setup(hand),patch.object(D,'_spawn_worker',return_value=Mock(pid=876543)),patch.object(D,'_identity',return_value='fixture-owned'):
    self.prepare(h,repo,runtime,scratch);ack=D.CodingMissionHandle(h).queue_workflow_code(ID)
    child=D.read_json(D.mission_path(h,ack['mission_id'])/'request.json');args=child['code_args'];events=[]
    actual_run=hand.run
    def observed_run(args,**kw):
     actual_guard=kw['mutation_guard']
     def observer(event,writes):events.append(event);return actual_guard(event,writes)
     kw['mutation_guard']=observer
     return actual_run(args,**kw)
    output={'plan':['Implement bounded fixture function'],'files':{
       'apps/agent-stack/new_feature.py':'def add(a,b):\n    return a+b\n',
       'apps/agent-stack/test_feature.py':'import unittest\nfrom new_feature import add\nclass Tests(unittest.TestCase):\n    def test_add(self):\n        self.assertEqual(add(2,3),5)\n'},
       'test_cmd':'python3 -m unittest discover -s apps/agent-stack -p test_feature.py -v',
       'commit_message':'offline fixture bounded addition','done':True}
    original_repo=hand.op_repo
    def fixture_runner(repo,action,**kw):
     if action!='test':return original_repo(repo,action,**kw)
     # Production sandbox remains unchanged. This runner executes only the
     # constant, builder-owned fixture above; it is not native coding proof.
     p=subprocess.run([sys.executable,'-m','unittest','discover','-s','apps/agent-stack','-p','test_feature.py','-v'],cwd=repo,capture_output=True,text=True)
     text=p.stdout+p.stderr;ok=p.returncode==0 and 'Ran 1 test' in text
     return {'ok':ok,'verified':ok,'output':text,'spoken':'one constant fixture test passed' if ok else 'fixture test failed','test_count':1}
    with patch.object(hand,'op_repo',side_effect=fixture_runner),patch.object(hand,'run',side_effect=observed_run),patch.object(hand,'rank_skills',return_value=[]),patch.object(hand,'llm',return_value=(json.dumps(output),hand.CODE_MODEL)):
     result=D.run_coding(args,workflow_context=child['workflow_context'],checkpoint=lambda cp:None)
    self.assertTrue(result['ok'],result)
    for event in ('before_write','after_write','before_test','after_test','before_commit','after_commit'):
     self.assertIn(event,events)
    D.write_json(root/'control.json',{'cancel':True})
    with patch.object(hand,'llm',side_effect=AssertionError('no model calls')):
     with self.assertRaises(ValueError):D.run_coding(args,workflow_context=child['workflow_context'],checkpoint=lambda cp:None)

 def test_owner_source_digest_argument_scope_and_missing_context_reject(self):
  for change in ('owner','source','origin','goal','branch','context','modelbool'):
   with self.subTest(change=change),tempfile.TemporaryDirectory() as tmp:
    h,root,repo,runtime,scratch,hand=self.fixture(tmp);a,b=T.ExecutionTests().context(hand)
    with a,b,self.setup(hand),patch.object(D,'_spawn_worker',return_value=Mock(pid=876543)),patch.object(D,'_identity',return_value='fixture-owned'):
     self.prepare(h,repo,runtime,scratch);ack=D.CodingMissionHandle(h).queue_workflow_code(ID)
     child=D.read_json(D.mission_path(h,ack['mission_id'])/'request.json');args=child['code_args'];context=child['workflow_context']
     if change=='owner':D.write_json(root/'execution_owner.json',{})
     if change=='source':D.write_json(root/'source_research.json',{})
     if change=='origin':D.write_json(root/'original_implementation.json',{})
     if change=='goal':args['goal']='Different task'
     if change=='branch':args['branch']='main'
     if change=='context':context=None
     if change=='modelbool':args['approved']=True
     with self.assertRaises((ValueError,KeyError)):D.run_coding(args,workflow_context=context,checkpoint=lambda cp:None)

 def test_parent_cancel_propagates_only_to_pinned_child(self):
  with tempfile.TemporaryDirectory() as tmp:
   h,root,repo,runtime,scratch,hand=self.fixture(tmp);a,b=T.ExecutionTests().context(hand)
   with a,b,self.setup(hand),patch.object(D,'_spawn_worker',return_value=Mock(pid=876543)),patch.object(D,'_identity',return_value='fixture-owned'):
    self.prepare(h,repo,runtime,scratch);ack=D.CodingMissionHandle(h).queue_workflow_code(ID)
    D.write_json(root/'checkpoint.json',{'phase':'coding_started','partial_work':'retained-checkpoint'})
    checkpoint=(root/'checkpoint.json').read_bytes()
    with patch.object(D.CodingMissionHandle,'steer',return_value={}) as steer:
     cancelled=D.WorkflowMissionHandle(h).cancel(ID)
    steer.assert_called_once_with(ack['mission_id'],cancel=True)
    self.assertNotIn('no implementation was run',cancelled['spoken'])
    self.assertEqual((root/'checkpoint.json').read_bytes(),checkpoint)
    continued=D.WorkflowMissionHandle(h).continue_workflow(ID,'continue the workflow')
    self.assertIn('outcome is unverified',continued['spoken'])
    self.assertEqual((root/'checkpoint.json').read_bytes(),checkpoint)

 def test_missing_original_primary_read_evidence_cannot_queue(self):
  with tempfile.TemporaryDirectory() as tmp:
   h,root,repo,runtime,scratch,hand=self.fixture(tmp);a,b=T.ExecutionTests().context(hand)
   with a,b,self.setup(hand):
    self.prepare(h,repo,runtime,scratch);D.write_json(root/'original_implementation.json',{'verified':True})
    with self.assertRaises(ValueError):D.CodingMissionHandle(h).queue_workflow_code(ID)
    self.assertFalse((root/'coding_child.json').exists())

 def test_checked_resume_preserves_workflow_context_and_old_evidence(self):
  with tempfile.TemporaryDirectory() as tmp:
   h,root,repo,runtime,scratch,hand=self.fixture(tmp);a,b=T.ExecutionTests().context(hand)
   with a,b,self.setup(hand),patch.object(D,'_spawn_worker',return_value=Mock(pid=876543)),patch.object(D,'_identity',return_value='fixture-owned'):
    self.prepare(h,repo,runtime,scratch);handle=D.CodingMissionHandle(h);ack=handle.queue_workflow_code(ID)
    child_root=D.mission_path(h,ack['mission_id']);request=D.read_json(child_root/'request.json');args=request['code_args']
    cp={'version':1,'args':args,'phase':'files','files':[],'file_cursor':0,'snapshot':hand.code_repo_snapshot(Path(args['repo']))}
    D.write_json(child_root/'checkpoint.json',{'mission_id':ack['mission_id'],'code_args':args,
                 'source_manifest':request['source_manifest'],'checkpoint':cp,'checkpoint_digest':hand.checkpoint_digest(cp)})
    D.write_json(child_root/'result.json',{'status':'CANCELLED','task_verified':False})
    old_request=(child_root/'request.json').read_bytes();old_result=(child_root/'result.json').read_bytes()
    # Reconciliation behavior has its own existing real-Git regression suite;
    # this case isolates immutable parent-child authority propagation.
    with patch.object(D,'_owned',return_value=False),patch.object(D.os,'kill',side_effect=ProcessLookupError),patch.object(hand,'reconcile_code_checkpoint',return_value=cp):
     resumed=handle.resume(ack['mission_id'])
    new_request=D.read_json(D.mission_path(h,resumed['mission_id'])/'request.json')
    self.assertEqual(new_request['workflow_context'],request['workflow_context'])
    self.assertEqual(new_request['code_args'],args)
    self.assertEqual((child_root/'request.json').read_bytes(),old_request);self.assertEqual((child_root/'result.json').read_bytes(),old_result)
    self.assertEqual(D.read_json(root/'coding_child.json')['mission_id'],resumed['mission_id'])

 def test_goal_requires_pinned_commit_supported_license_code_and_bounded_excerpt(self):
  for bad in ('commit','license','code','excerpt','body'):
   with self.subTest(bad=bad),tempfile.TemporaryDirectory() as tmp:
    h,root,repo,runtime,scratch,hand=self.fixture(tmp)
    origin=D.read_json(root/'original_implementation.json')
    if bad=='commit':origin['repository']['commit']='unknown'
    if bad=='license':origin['license']['spdx_id']='AGPL-3.0'
    if bad=='code':origin['code_files']=[]
    if bad=='excerpt':origin['implementation_excerpt']=''
    if bad=='body':origin['body_sha256']='0'*64
    D.write_json(root/'original_implementation.json',origin)
    with self.assertRaises(ValueError):D.workflow_code_goal(h,ID)

if __name__=='__main__':unittest.main()
