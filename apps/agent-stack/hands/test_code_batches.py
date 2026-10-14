"""Actual temporary writes/tests/commits; injected model replies, no live providers."""
import json
import pytest
from hands.test_coding_resume import coding,Crash

@pytest.mark.parametrize('durable',[True,False])
def test_continuing_batch_retains_file_without_test_or_commit_and_final_batch_verifies(coding,monkeypatch,durable):
 hand,root,args,calls,saved,save,repo=coding
 replies=[{'files':{'a.py':'def answer(): return 43\n'},'continue':True},
          {'files':{'test_check.py':'import unittest\nfrom a import answer\nclass Check(unittest.TestCase):\n def test_value(self):self.assertEqual(answer(),43)\n'},'test_cmd':'python3 -m unittest discover -v','commit_message':'fixture batch completion'}]
 histories=[]
 def model(history,*a):
  histories.append(history)
  if len(histories)==2:
   assert (root/'a.py').is_file() and calls['tests']==0 and calls['commits']==0
   assert any('No tests or commit ran' in r['content'] for r in history if r['role']=='user')
  return json.dumps(replies.pop(0)),'configured-model'
 monkeypatch.setattr(hand,'llm',model)
 result=hand.run(args,checkpoint=save) if durable else hand.run(args)
 assert result['ok'] and calls['tests']==1 and calls['commits']==1 and len(histories)==2
 if durable:assert saved[-1]['phase']=='complete' and saved[-1]['continuing_batches'] is True

@pytest.mark.parametrize('durable',[True,False])
def test_unfinished_batches_never_self_pass_or_fall_back_to_default_tests(coding,monkeypatch,durable):
 hand,root,args,calls,saved,save,repo=coding
 replies=iter([{'files':{'a.py':'def value(): return 7\n'},'continue':True}]+[{'files':{'b.py':'pass\n'}}]*3)
 monkeypatch.setattr(hand,'llm',lambda *a:(json.dumps(next(replies)),'configured-model'))
 result=hand.run(args,checkpoint=save) if durable else hand.run(args)
 assert not result['ok'] and calls['tests']==0 and calls['commits']==0
 assert (root/'a.py').exists() and not (root/'b.py').exists()

@pytest.mark.parametrize('bad',[{'files':{'a.py':'pass','b.py':'pass'},'continue':True},
 {'files':{'a.py':'x'*3100},'continue':True},{'files':{'a.py':'pass'},'continue':True,'test_cmd':'python3 -m unittest'},
 {'files':{'a.py':'pass'},'continue':'true'}])
def test_continuation_reply_is_bounded_and_unambiguous(coding,bad):
 hand,*_=coding
 assert hand._code_reply(json.dumps(bad))[0] is None

def test_durable_resume_after_batch_write_does_not_repeat_write_or_skip_final_tests(coding,monkeypatch):
 hand,root,args,calls,saved,save,repo=coding
 replies=[{'files':{'a.py':'def answer(): return 43\n'},'continue':True},
 {'files':{'test_check.py':'import unittest\nfrom a import answer\nclass Check(unittest.TestCase):\n def test_value(self):self.assertEqual(answer(),43)\n'},'test_cmd':'python3 -m unittest discover -v','commit_message':'fixture resumed batch'}]
 monkeypatch.setattr(hand,'llm',lambda *a:(json.dumps(replies.pop(0)),'configured-model'))
 def crash(target,action,**kw):
  result=repo(target,action,**kw)
  if action=='write' and kw.get('path')=='a.py':raise Crash()
  return result
 monkeypatch.setattr(hand,'op_repo',crash)
 with pytest.raises(Crash):hand.run(args,checkpoint=save)
 assert calls['tests']==0 and calls['commits']==0
 monkeypatch.setattr(hand,'op_repo',repo)
 result=hand.run(args,checkpoint=save,resume_checkpoint=saved[-1])
 assert result['ok'] and calls['writes'].count('a.py')==1 and calls['tests']==1 and calls['commits']==1 and not replies

@pytest.mark.parametrize('durable',[True,False])
def test_passed_tests_done_false_allow_actual_result_documentation_before_one_final_commit(coding,monkeypatch,durable):
 hand,root,args,calls,saved,save,repo=coding
 first={'files':{'test_check.py':'import unittest\nclass Check(unittest.TestCase):\n def test_value(self):self.assertEqual(6*7,42)\n'},'test_cmd':'python3 -m unittest discover -v','done':False}
 second={'files':{'IMPLEMENTATION.md':'Actual first fixture test run: one test passed. Command: python3 -m unittest discover -v.\n'},'test_cmd':'python3 -m unittest discover -v','done':True,'commit_message':'fixture tested documentation'}
 replies=[first,second]
 def model(history,*a):
  if len(replies)==1:
   assert calls['tests']==1 and calls['commits']==0
   assert any('Actual tests passed' in r['content'] and 'no commit ran' in r['content'] for r in history if r['role']=='user')
  return json.dumps(replies.pop(0)),'configured-model'
 monkeypatch.setattr(hand,'llm',model)
 got=hand.run(args,checkpoint=save) if durable else hand.run(args)
 assert got['ok'] and calls['tests']==2 and calls['commits']==1 and (root/'IMPLEMENTATION.md').is_file()

@pytest.mark.parametrize('durable',[True,False])
def test_done_false_exhaustion_never_commits_or_claims_success(coding,monkeypatch,durable):
 hand,root,args,calls,saved,save,repo=coding
 reply={'files':{'test_check.py':'import unittest\nclass Check(unittest.TestCase):\n def test_value(self):self.assertTrue(True)\n'},'test_cmd':'python3 -m unittest discover -v','done':False}
 monkeypatch.setattr(hand,'llm',lambda *a:(json.dumps(reply),'configured-model'))
 got=hand.run(args,checkpoint=save) if durable else hand.run(args)
 assert not got['ok'] and calls['tests']==hand.MAX_ITERS and calls['commits']==0

@pytest.mark.parametrize('durable',[True,False])
def test_passed_partial_then_malformed_exhaustion_cannot_reuse_stale_success(coding,monkeypatch,durable):
 hand,root,args,calls,saved,save,repo=coding
 replies=iter([json.dumps({'files':{'test_check.py':'import unittest\nclass Check(unittest.TestCase):\n def test_value(self):self.assertTrue(True)\n'},'test_cmd':'python3 -m unittest discover -v','done':False})]+['{"files":{"broken.py":"incomplete']*3)
 monkeypatch.setattr(hand,'llm',lambda *a:(next(replies),'configured-model'))
 got=hand.run(args,checkpoint=save) if durable else hand.run(args)
 assert not got['ok'] and calls['tests']==1 and calls['commits']==0 and not (root/'broken.py').exists()

@pytest.mark.parametrize('done',['false',0,None])
def test_explicit_done_requires_boolean_even_on_inspection_reply(coding,done):
 hand,*_=coding
 assert hand._code_reply(json.dumps({'done':done,'read_paths':['a.py']}))[0] is None
 assert hand._code_reply(json.dumps({'done':done,'test_cmd':'python3 -m unittest'}))[0] is None
