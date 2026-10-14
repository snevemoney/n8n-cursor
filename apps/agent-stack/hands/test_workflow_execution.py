import hashlib
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch

HERE=Path(__file__).parent

def load(name):
 s=importlib.util.spec_from_file_location('execution_test_'+name,HERE/(name+'.py'));m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m

E=load('workflow_execution');W=load('workflow_workspace');C=load('workflow_config_lock');R=load('workflow_repo_context')
ID='a'*32

class ExecutionTests(unittest.TestCase):
 def fixture(self,tmp):
  base=Path(tmp).resolve();repo=base/'source';app=repo/'apps/agent-stack';app.mkdir(parents=True)
  for rel in set(W.CRITICAL+W.LOCKED+C.WHOLE_FILES):
   p=app/rel;p.parent.mkdir(parents=True,exist_ok=True);p.write_text('# preserved project source\n')
  for rel,anchors in C.ANCHORS.items():
   p=app/rel;p.write_text('CODE_MODEL="anthropic/claude-opus"\n'+''.join('def '+name+'(*args):\n    return None\n' if name!='ModelGateway' else 'class ModelGateway:\n    pass\n' for name in anchors))
  (app/'feature.py').write_text('def value():\n    return 1\n')
  event=repo/'fixtures/events/actual-source-event.json';event.parent.mkdir(parents=True);event.write_text('{"actual":"fixture"}')
  env={'PATH':'/usr/bin:/bin','HOME':str(base),'GIT_CONFIG_GLOBAL':'/dev/null','GIT_CONFIG_NOSYSTEM':'1'}
  def git(*a):
   got=subprocess.run(['/usr/bin/git','-c','core.hooksPath=/dev/null','-c','core.fsmonitor=false','-C',str(repo),*a],capture_output=True,text=True,env=env,check=True);return got.stdout.strip()
  git('init','-q','-b','owned/source');git('config','user.name','Fixture');git('config','user.email','fixture@example.invalid');git('remote','add','origin','https://github.com/owner/project.git')
  git('add','-A');git('commit','-qm','source baseline')
  runtime=base/'runtime';git('worktree','add','--detach',str(runtime),'HEAD')
  (runtime/'apps/agent-stack/brain/online.py').write_text('# ACTUAL current runtime model preimage\n')
  (app/'feature.py').write_text('def value():\n    return 2 # preserve source dirty work\n')
  scratch=base/'scratch';scratch.mkdir();hand=W._hand()
  class Perm:
   def scratch_roots(self):return [scratch]
   def is_secret_path(self,p):return '.env' in Path(p).parts
   def decide(self,*a):return 'allow'
   def log_action(self,*a,**k):pass
  hand.PERM=lambda:Perm()
  hive=base/'hive';root=hive/'coding-missions'/ID;root.mkdir(parents=True)
  request={'mission_id':ID,'worker_kind':'research_build','request_scope':'transient_task','objective':'Original technical build'}
  binding={'repo':str(repo),'branch':'owned/source','authority':'literal_owner_answer'}
  for name,row in [('request',request),('binding',binding),('state',{'status':'WAITING_SOURCE','mission_id':ID,'worker_kind':'research_build'}),('control',{'cancel':False})]:(root/(name+'.json')).write_text(json.dumps(row))
  approval={'mission_id':ID,'kind':'workflow_edits','scope':'transient_task','authority':'explicit_owner_answer','target':str(repo),'branch':'owned/source','configuration_changes_authorized':False,'request_sha256':hashlib.sha256((root/'request.json').read_bytes()).hexdigest(),'binding_sha256':hashlib.sha256((root/'binding.json').read_bytes()).hexdigest()}
  (root/'owner_approval.json').write_text(json.dumps(approval))
  return hive,root,repo,runtime,scratch,hand

 def context(self,hand):
  modules={'workflow_workspace':W,'workflow_config_lock':C,'workflow_repo_context':R}
  return patch.object(E,'_load',side_effect=lambda n:modules[n]),patch.object(W,'_hand',return_value=hand)

 def prepare(self,hive,repo,runtime,scratch):
  baseline=E.capture_runtime_baseline(runtime,R._git(runtime))
  receipt=E.make_receipt(hive,ID,runtime_baseline=baseline)
  result=E.prepare_execution(hive,ID,source_receipt=receipt,runtime_baseline=baseline,scratch_root=scratch,active_fn=lambda:True)
  return baseline,receipt,result

 def guard(self,hive,result,writes=None):
  return E.guard(hive,ID,expected_contract_digest=result['execution_contract_digest'],expected_configuration_digest=result['configuration_digest'],proposedwrites=writes)

 def test_real_git_owned_copy_current_runtime_overlay_source_dirty_and_fixture_preserved(self):
  with tempfile.TemporaryDirectory() as tmp:
   hive,root,repo,runtime,scratch,hand=self.fixture(tmp);source_before=W._snapshot(repo,'apps/agent-stack',hand,{})
   runtime_before=(runtime/'apps/agent-stack/brain/online.py').read_bytes()
   a,b=self.context(hand)
   with a,b:
    baseline,receipt,result=self.prepare(hive,repo,runtime,scratch)
    self.assertTrue(result['ok'],result);copy=Path(result['working_copy'])
    self.assertEqual((copy/'apps/agent-stack/brain/online.py').read_bytes(),runtime_before)
    self.assertEqual((copy/'apps/agent-stack/feature.py').read_bytes(),(repo/'apps/agent-stack/feature.py').read_bytes())
    self.assertEqual(W._snapshot(repo,'apps/agent-stack',hand,{}),source_before)
    self.assertEqual((runtime/'apps/agent-stack/brain/online.py').read_bytes(),runtime_before)
    self.assertIn('fixtures/events/actual-source-event.json',receipt['dependencies'])
    self.assertEqual((copy/'fixtures/events/actual-source-event.json').read_bytes(),(repo/'fixtures/events/actual-source-event.json').read_bytes())
    self.assertTrue(self.guard(hive,result,{'hands/new_feature.py':'def feature():\n    return 7\n'})['ok'])
    self.assertFalse(self.guard(hive,result,{'brain/online.py':'MODEL="unapproved"\n'})['ok'])
    self.assertFalse(result['task_verified'])

 def test_contract_is_exclusive_before_second_mutation_and_guard_pins_both_digests(self):
  with tempfile.TemporaryDirectory() as tmp:
   hive,root,repo,runtime,scratch,hand=self.fixture(tmp);a,b=self.context(hand)
   with a,b:
    baseline,receipt,result=self.prepare(hive,repo,runtime,scratch);self.assertTrue(result['ok'],result)
    with self.assertRaises(FileExistsError):E.prepare_execution(hive,ID,source_receipt=receipt,runtime_baseline=baseline,scratch_root=scratch,active_fn=lambda:True)
    self.assertFalse(E.guard(hive,ID,expected_contract_digest=result['execution_contract_digest'],expected_configuration_digest='0'*64)['ok'])
    contract=json.loads((root/'execution_contract.json').read_text());self.assertEqual(contract['request_sha256'],receipt['task_provenance']['request_sha256'])
    self.assertEqual(contract['runtime_configuration_digest'],baseline['configuration_digest'])

 def test_cancellation_source_fixture_runtime_or_approval_change_stops_callback(self):
  for change in ('cancel','source','fixture','runtime','runtime_preimage','runtime_head','approval'):
   with self.subTest(change=change),tempfile.TemporaryDirectory() as tmp:
    hive,root,repo,runtime,scratch,hand=self.fixture(tmp);a,b=self.context(hand)
    with a,b:
     baseline,receipt,result=self.prepare(hive,repo,runtime,scratch);self.assertTrue(result['ok'],result)
     if change=='cancel':(root/'control.json').write_text('{"cancel":true}')
     if change=='source':(repo/'apps/agent-stack/feature.py').write_text('external owner change')
     if change=='fixture':(repo/'fixtures/events/actual-source-event.json').write_text('{}')
     if change=='runtime':(runtime/'apps/agent-stack/mouth/voice.py').write_text('unapproved voice model')
     if change=='runtime_preimage':(runtime/'apps/agent-stack/face/serve.py').write_text('# changed current dirty runtime preimage\n')
     if change=='runtime_head':(repo/'.git/worktrees/runtime/HEAD').write_text('d'*40)
     if change=='approval':(root/'owner_approval.json').write_text('{}')
     self.assertFalse(self.guard(hive,result)['ok'])

 def test_runtime_identity_and_missing_approval_fail_before_copy(self):
  with tempfile.TemporaryDirectory() as tmp:
   hive,root,repo,runtime,scratch,hand=self.fixture(tmp);a,b=self.context(hand)
   with a,b:
    with self.assertRaises(ValueError):E.capture_runtime_baseline(runtime,{})
    baseline=E.capture_runtime_baseline(runtime,R._git(runtime));(root/'owner_approval.json').unlink()
    with self.assertRaises(OSError):E.make_receipt(hive,ID,runtime_baseline=baseline)
    self.assertFalse((scratch/('workflow-'+ID)).exists())

 def test_runtime_overlay_cannot_expand_to_unrelated_source_files(self):
  with tempfile.TemporaryDirectory() as tmp:
   hive,root,repo,runtime,scratch,hand=self.fixture(tmp);a,b=self.context(hand)
   with a,b:
    baseline=E.capture_runtime_baseline(runtime,R._git(runtime));receipt=E.make_receipt(hive,ID,runtime_baseline=baseline)
    baseline['files']['apps/agent-stack/feature.py']=W._regular_bytes(runtime/'apps/agent-stack/feature.py')[1]
    result=E.prepare_execution(hive,ID,source_receipt=receipt,runtime_baseline=baseline,scratch_root=scratch,active_fn=lambda:True)
    self.assertFalse(result['ok']);self.assertEqual(result['reason'],'incomplete_runtime_configuration_overlay')
    self.assertFalse((scratch/('workflow-'+ID)).exists())

if __name__=='__main__':unittest.main()
