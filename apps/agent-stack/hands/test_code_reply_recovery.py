"""Malformed model output and bounded coding batches; no providers or live files."""
import json
import pytest
from hands.test_coding_resume import coding

@pytest.mark.parametrize('durable',[True,False])
def test_malformed_reply_never_tests_or_commits_then_compact_reply_completes(coding,monkeypatch,durable):
 hand,root,args,calls,saved,save,repo=coding
 responses=['{"files":{"oversized.py":"truncated',
            json.dumps({'files':{'a.py':'def answer(): return 43\n','test_check.py':'import unittest\nfrom a import answer\nclass Check(unittest.TestCase):\n def test_value(self):self.assertEqual(answer(),43)\n'},'test_cmd':'python3 -m unittest discover -v','commit_message':'fixture bounded completion'})]
 histories=[]
 def model(history,*a):
  histories.append(json.loads(json.dumps(history)))
  if len(histories)==2:
   assert calls['tests']==0 and calls['commits']==0
   assert 'oversized.py' not in calls['writes']
   assert any('malformed_or_truncated_json' in row['content'] for row in history if row['role']=='user')
  return responses.pop(0),'configured-model'
 monkeypatch.setattr(hand,'llm',model)
 got=hand.run(args,checkpoint=save) if durable else hand.run(args)
 assert got['ok'],got
 assert calls['tests']==1 and calls['commits']==1 and len(histories)==2
 assert calls['writes']==(['.gitignore'] if durable else [])+['a.py','test_check.py']
 assert any(row['what'].endswith('model response') and row['status']=='failed' for row in got['steps'])
 if durable:assert saved[-1]['phase']=='complete'

@pytest.mark.parametrize('durable',[True,False])
@pytest.mark.parametrize('bad',['{}','[]','{"plan":["claim finished"]}','{"done":true}'])
def test_invalid_reply_exhaustion_preserves_no_generated_files_or_default_tests(coding,monkeypatch,durable,bad):
 hand,root,args,calls,saved,save,repo=coding
 monkeypatch.setattr(hand,'llm',lambda *a:(bad,'configured-model'))
 got=hand.run(args,checkpoint=save) if durable else hand.run(args)
 assert not got['ok'] and calls['tests']==0 and calls['commits']==0
 assert not (root/'a.py').exists()
 assert len([r for r in got['steps'] if r['what'].endswith('model response')])==hand.MAX_ITERS
 if durable:assert saved[-1]['phase']=='model' and saved[-1]['model_response_error']
