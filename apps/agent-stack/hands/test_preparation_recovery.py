"""Actual temporary source/scratch Git repositories; public HTTP is an offline fixture."""
import base64,hashlib,json,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
from hands import test_workflow_execution as F
E,W,R=F.E,F.W,F.R
class Recovery(unittest.TestCase):
 def test_exact_public_exception_keeps_sensitive_test_and_rejects_forged_or_changed_source(self):
  with tempfile.TemporaryDirectory() as tmp:
   f=F.ExecutionTests();h,root,repo,runtime,scratch,hand=f.fixture(tmp)
   relative='apps/agent-stack/test_public_tokens.py';path=repo/relative;path.write_text('CODE_MODEL = "preserved"\n')
   import subprocess
   for args in [('add','--',relative),('commit','-qm','public test fixture')]:subprocess.run(['/usr/bin/git','-c','core.hooksPath=/dev/null','-c','core.fsmonitor=false','-C',str(repo),*args],check=True,capture_output=True)
   perm=hand.PERM();old=perm.is_secret_path;perm.is_secret_path=lambda p:old(p) or Path(p).name=='test_public_tokens.py';hand.PERM=lambda:perm
   a,b=f.context(hand)
   with a,b:
    with self.assertRaises(ValueError):E.approve_source_exception(h,F.ID,relative,hashlib.sha256(path.read_bytes()).hexdigest(),authority={'approved':True},evidence={'offline':True})
    with self.assertRaises(ValueError):E.approve_source_exception(h,F.ID,relative,'0'*64,authority=E.source_review_authority(),evidence={'offline':True})
    with self.assertRaises(ValueError):E.approve_source_exception(h,F.ID,'apps/agent-stack/credentials/test_tokens.py','0'*64,authority=E.source_review_authority(),evidence={'offline':True})
    E.approve_source_exception(h,F.ID,relative,hashlib.sha256(path.read_bytes()).hexdigest(),authority=E.source_review_authority(),evidence={'offline_independent_review':True})
    raw=path.read_bytes();blob=hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()
    with self.assertRaises(ValueError):E._source_exceptions(h,F.ID,fetch_public=True,fetch_fn=lambda *a,**k:{'sha':blob,'encoding':'base64','content':base64.b64encode(b'wrong public bytes').decode()})
    self.assertFalse((root/'source_exception_public.json').exists())
    proof=E._source_exceptions(h,F.ID,fetch_public=True,fetch_fn=lambda *a,**k:{'sha':blob,'encoding':'base64','content':base64.b64encode(raw).decode()})
    files,_=W._snapshot(repo,'apps/agent-stack',hand,{},lambda:proof);self.assertIn(relative,files)
    with self.assertRaises(ValueError):W._snapshot(repo,'apps/agent-stack',hand,{},dict(proof))
    path.write_text('CODE_MODEL="changed"\n')
    with self.assertRaises(ValueError):E._source_exceptions(h,F.ID)
 def test_actual_durable_code_checkpoint_test_commit_resume_with_reviewed_token_filename(self):
  import subprocess
  with tempfile.TemporaryDirectory() as tmp:
   f=F.ExecutionTests();h,root,repo,runtime,scratch,hand=f.fixture(tmp)
   relative='apps/agent-stack/test_public_tokens.py';path=repo/relative;path.write_text('def source_behavior(value):\n    return value + 1\n')
   for args in [('add','--',relative),('commit','-qm','public test fixture')]:subprocess.run(['/usr/bin/git','-c','core.hooksPath=/dev/null','-c','core.fsmonitor=false','-C',str(repo),*args],check=True,capture_output=True)
   perm=hand.PERM();old=perm.is_secret_path;perm.is_secret_path=lambda p:old(p) or Path(p).name=='test_public_tokens.py';hand.PERM=lambda:perm
   a,b=f.context(hand)
   with a,b:
    raw=path.read_bytes();E.approve_source_exception(h,F.ID,relative,hashlib.sha256(raw).hexdigest(),authority=E.source_review_authority(),evidence={'offline_independent_review':True})
    blob=hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest();E._source_exceptions(h,F.ID,fetch_public=True,fetch_fn=lambda *a,**k:json.dumps({'sha':blob,'encoding':'base64','content':base64.b64encode(raw).decode()}).encode())
    baseline,receipt,ready=f.prepare(h,repo,runtime,scratch);self.assertTrue(ready['ok'],ready);owned=Path(ready['working_copy']);allowed=E.source_exception_guard(h,F.ID,owned)
    with self.assertRaises(Exception):hand.code_repo_snapshot(owned)
    with hand.source_exception_scope(allowed):self.assertIn(relative,hand.code_repo_snapshot(owned)['files']);self.assertIn(relative,hand._committed_files(owned))
    with hand.source_exception_scope(allowed):self.assertIn('source_behavior',hand._code_reads(owned,{'read_paths':[relative]})[0]['content'])
    self.assertIn('error',hand._code_reads(owned,{'read_paths':[relative]})[0])
    with hand.source_exception_scope(lambda actual,name,sha:sha is None):self.assertIn('error',hand._code_reads(owned,{'read_paths':[relative]})[0])
    args={'op':'code','repo':str(owned),'goal':'Offline fixture behavior and meaningful test','branch':'jarvis/workflow-'+F.ID}
    model={'plan':['implement fixture behavior','test'],'files':{'fixture_behavior.py':'def value(): return 7\n','test_fixture_behavior.py':'import unittest\nfrom fixture_behavior import value\nclass Check(unittest.TestCase):\n def test_value(self):self.assertEqual(value(),7)\n'},'test_cmd':'python3 -m unittest discover -s . -p test_fixture_behavior.py -v','commit_message':'offline actual durable fixture','done':True}
    checkpoints=[]
    with patch.object(hand,'rank_skills',return_value=[]),patch.object(hand,'llm',return_value=(json.dumps(model),'offline-injected-no-provider')):
     got=hand.run(args,checkpoint=checkpoints.append,source_exception_guard=allowed,mutation_guard=lambda event,writes:E.guard(h,F.ID,expected_contract_digest=ready['execution_contract_digest'],expected_configuration_digest=ready['configuration_digest'],proposedwrites=writes))
    self.assertTrue(got['verified'],got);self.assertEqual(checkpoints[-1]['phase'],'complete')
    with hand.source_exception_scope(allowed):resumed=hand.reconcile_code_checkpoint(checkpoints[-1],args)
    self.assertEqual(resumed['phase'],'complete');self.assertEqual((owned/relative).read_bytes(),raw)
    with hand.source_exception_scope(lambda *args:False):
     with self.assertRaises(Exception):hand.code_repo_snapshot(owned)
 def test_clean_prebuilder_archive_preserves_contract_copy_and_rejects_user_changes(self):
  for changed in (False,True):
   with self.subTest(changed=changed),tempfile.TemporaryDirectory() as tmp:
    f=F.ExecutionTests();h,root,repo,runtime,scratch,hand=f.fixture(tmp);a,b=f.context(hand)
    with a,b:
     baseline=E.capture_runtime_baseline(runtime,R._git(runtime));receipt=E.make_receipt(h,F.ID,runtime_baseline=baseline)
     # Interrupt before guard creation, after real copy+baseline commit.
     original=W.prepare
     def prepare(*args,**kwargs):
      result=original(*args,**kwargs);self.assertTrue(result['ok'],result);raise RuntimeError('offline crash after preparation')
     with patch.object(W,'prepare',side_effect=prepare):
      with self.assertRaises(RuntimeError):E.prepare_execution(h,F.ID,source_receipt=receipt,runtime_baseline=baseline,scratch_root=scratch,active_fn=lambda:True)
     target=scratch/('workflow-'+F.ID);before=hand.code_repo_snapshot(target);contract=(root/'execution_contract.json').read_bytes()
     if changed:
      (target/'apps/agent-stack/feature.py').write_text('user edit')
      with self.assertRaises(ValueError):E.recover_preparation(h,F.ID,active_fn=lambda:True)
      self.assertEqual((root/'execution_contract.json').read_bytes(),contract);self.assertTrue(target.exists());continue
     result=E.recover_preparation(h,F.ID,active_fn=lambda:True);self.assertTrue(result['recovered']);moved=Path(result['preserved_copy']);after=hand.code_repo_snapshot(moved);after['repo']=before['repo'];self.assertEqual(before,after)
     self.assertEqual((Path(result['archive'])/'execution_contract.json').read_bytes(),contract);self.assertFalse(target.exists());self.assertFalse((root/'execution_contract.json').exists())
     fresh=E.prepare_execution(h,F.ID,source_receipt=receipt,runtime_baseline=baseline,scratch_root=scratch,active_fn=lambda:True);self.assertTrue(fresh['ok'],fresh);self.assertTrue(moved.exists())
 def test_interrupted_archive_move_resumes_preserving_both_original_objects(self):
  with tempfile.TemporaryDirectory() as tmp:
   f=F.ExecutionTests();h,root,repo,runtime,scratch,hand=f.fixture(tmp);a,b=f.context(hand)
   with a,b:
    baseline=E.capture_runtime_baseline(runtime,R._git(runtime));receipt=E.make_receipt(h,F.ID,runtime_baseline=baseline);original_prepare=W.prepare
    def prepared(*args,**kw):
     result=original_prepare(*args,**kw);self.assertTrue(result['ok'],result);raise RuntimeError('fixture crash')
    with patch.object(W,'prepare',side_effect=prepared):
     with self.assertRaises(RuntimeError):E.prepare_execution(h,F.ID,source_receipt=receipt,runtime_baseline=baseline,scratch_root=scratch,active_fn=lambda:True)
    contract=(root/'execution_contract.json').read_bytes();move=E._rename_exclusive;calls=[]
    def first_move_then_crash(source,target):
     move(source,target);calls.append(str(source));raise RuntimeError('fixture process loss after first move')
    with patch.object(E,'_rename_exclusive',side_effect=first_move_then_crash):
     with self.assertRaises(RuntimeError):E.recover_preparation(h,F.ID,active_fn=lambda:True)
    self.assertEqual((root/'execution_contract.json').read_bytes(),contract);self.assertEqual(len(calls),1)
    result=E.recover_preparation(h,F.ID,active_fn=lambda:True);self.assertTrue(result['recovered']);self.assertEqual((Path(result['archive'])/'execution_contract.json').read_bytes(),contract);self.assertTrue(Path(result['preserved_copy']).exists())
 def test_failed_copy_with_reviewed_token_file_archives_and_recovers_without_scope_leak(self):
  import subprocess
  for change in ('unchanged','wronghash','unreviewed'):
   with self.subTest(change=change),tempfile.TemporaryDirectory() as tmp:
    f=F.ExecutionTests();h,root,repo,runtime,scratch,hand=f.fixture(tmp);relative='apps/agent-stack/test_public_tokens.py';path=repo/relative;path.write_text('def source_behavior(value): return value + 1\n')
    for args in [('add','--',relative),('commit','-qm','public recovery fixture')]:subprocess.run(['/usr/bin/git','-c','core.hooksPath=/dev/null','-c','core.fsmonitor=false','-C',str(repo),*args],check=True,capture_output=True)
    perm=hand.PERM();old=perm.is_secret_path;perm.is_secret_path=lambda p:old(p) or Path(p).name=='test_public_tokens.py';hand.PERM=lambda:perm;a,b=f.context(hand)
    with a,b:
     raw=path.read_bytes();E.approve_source_exception(h,F.ID,relative,hashlib.sha256(raw).hexdigest(),authority=E.source_review_authority(),evidence={'offline_independent_review':True})
     blob=hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest();E._source_exceptions(h,F.ID,fetch_public=True,fetch_fn=lambda *a,**k:json.dumps({'sha':blob,'encoding':'base64','content':base64.b64encode(raw).decode()}).encode())
     baseline=E.capture_runtime_baseline(runtime,R._git(runtime));receipt=E.make_receipt(h,F.ID,runtime_baseline=baseline);prepare=W.prepare
     def prepared(*args,**kw):
      result=prepare(*args,**kw);self.assertTrue(result['ok'],result);raise RuntimeError('offline failure before guard')
     with patch.object(W,'prepare',side_effect=prepared):
      with self.assertRaises(RuntimeError):E.prepare_execution(h,F.ID,source_receipt=receipt,runtime_baseline=baseline,scratch_root=scratch,active_fn=lambda:True)
     target=scratch/('workflow-'+F.ID);contract=(root/'execution_contract.json').read_bytes()
     with self.assertRaises(Exception):hand.code_repo_snapshot(target)
     if change=='wronghash':(target/relative).write_text('def different(): return 0\n')
     if change=='unreviewed':(root/'source_exception_review.json').rename(root/'source_exception_review.saved')
     if change!='unchanged':
      with self.assertRaises(Exception):E.recover_preparation(h,F.ID,active_fn=lambda:True)
      self.assertTrue(target.exists());self.assertEqual((root/'execution_contract.json').read_bytes(),contract);continue
     move=E._rename_exclusive
     def moved_then_crash(source,destination):move(source,destination);raise RuntimeError('offline interruption after move')
     with patch.object(E,'_rename_exclusive',side_effect=moved_then_crash):
      with self.assertRaises(RuntimeError):E.recover_preparation(h,F.ID,active_fn=lambda:True)
     archived=next(scratch.glob('workflow-*-preparation-*'))
     with self.assertRaises(Exception):hand.code_repo_snapshot(archived)
     result=E.recover_preparation(h,F.ID,active_fn=lambda:True);self.assertTrue(result['recovered']);self.assertEqual((archived/relative).read_bytes(),raw);self.assertEqual((Path(result['archive'])/'execution_contract.json').read_bytes(),contract)
     with self.assertRaises(Exception):hand.code_repo_snapshot(archived)
if __name__=='__main__':unittest.main()
