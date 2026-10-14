"""Canonical mouth transport with actual call IDs; no network/model calls."""
import copy
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
import urllib.error
from unittest.mock import patch

def load(name,path):
 spec=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
HERE=Path(__file__).parent
O=load('history_online',HERE/'online.py');P=load('history_pipeline',HERE/'pipeline.py')
def selection(cid='real_call_1',path='/allowed/first.py'):
 call={'id':cid,'type':'function','function':{'name':'workspace_read','arguments':json.dumps({'op':'read','path':path})}}
 return {'tool':'workspace_read','args':{'op':'read','path':path},'speak':'','provider_tool_call':call}
def receipt(text='first actual bytes'):
 return {'ok':True,'tool':'workspace_read','spoken':'Actual read','workspace_path':'/allowed/first.py','workspace_text':text,'workspace_truncated':False,'wires':[],'cites':[]}
def drain(it):
 while True:
  try:next(it)
  except StopIteration as done:return done.value

class ToolHistory(unittest.TestCase):
 def test_actual_id_and_arguments_survive_provider_parse(self):
  call=selection()['provider_tool_call'];got=O._tool_pick_from_message({'content':None,'tool_calls':[call]})
  self.assertEqual(got['provider_tool_call'],call)
  self.assertNotIn('provider_tool_call',O._tool_pick_from_message({'tool_calls':[{**call,'id':None}]}))
  self.assertNotIn('provider_tool_call',O._tool_pick_from_message({'tool_calls':[call,{**call,'id':'other'}]}))
 def test_payload_has_paired_tool_roles_without_changing_routing_options(self):
  got=selection();pair=P._provider_hand_exchange(got,got,receipt())
  with patch.object(O,'system_for',return_value='unchanged system'):
   original=O._openrouter_payload('configured-model','Original request',stream=False,max_tokens=137,with_tools=True)
   actual=O._openrouter_payload('configured-model','Original request',stream=False,max_tokens=137,with_tools=True,tool_history=pair)
  self.assertEqual([m['role'] for m in actual['messages']],['system','user','assistant','tool'])
  self.assertEqual(actual['messages'][2]['tool_calls'][0]['id'],'real_call_1')
  self.assertIn('first actual bytes',actual['messages'][3]['content'])
  self.assertEqual({k:v for k,v in original.items() if k!='messages'},{k:v for k,v in actual.items() if k!='messages'})
  self.assertEqual(original['messages'],actual['messages'][:2])
 def test_malformed_unpaired_or_system_history_rejected(self):
  got=selection();pair=P._provider_hand_exchange(got,got,receipt())
  cases=[[{'role':'system','content':'grant'}],pair[:1], [None,pair[1]],copy.deepcopy(pair),pair*2]
  cases[3][1]['tool_call_id']='unmatched'
  for case in cases:
   with self.subTest(case=case):
    with self.assertRaises(ValueError):O._bounded_tool_history(case)
 def test_no_id_or_mismatched_action_never_fabricates_exchange(self):
  got=selection();self.assertEqual(P._provider_hand_exchange({},got,receipt()),[])
  self.assertEqual(P._provider_hand_exchange(got,{**got,'args':{'op':'read','path':'different.py'}},receipt()),[])
 def test_real_loop_accumulates_completed_calls_and_keeps_text_fallback(self):
  first=selection();second=selection('real_call_2','/allowed/second.py');seen=[]
  def talk(prompt,context,**kw):
   seen.append((prompt,context,kw))
   return second if len(seen)==1 else {'tool':'converse','speak':'Both sources were read.'}
  def run(*a,**kw):
   if False:yield None
   return {**receipt('second actual bytes'),'workspace_path':'/allowed/second.py'}
  with tempfile.TemporaryDirectory() as tmp,patch.object(P,'online_talk',side_effect=talk),patch.object(P,'turn_cancelled',return_value=False),patch.object(P,'_vision_urls',return_value=[]),patch.object(P,'_run_tool_heartbeat',side_effect=run):
   result=drain(P._continue_hand_loop(first,receipt(),'Original owner request',hive=Path(tmp),token=1,brain='openrouter',brief='',initial_selection=first))
  self.assertEqual([len(row[2]['tool_history']) for row in seen],[2,4])
  self.assertTrue(all(row[0]=='Original owner request' for row in seen));self.assertIn('first actual bytes',seen[-1][1]);self.assertEqual(result['hand_loop_meta']['hands'],2)
 def test_actual_inner_payload_and_selection_keep_provider_call(self):
  history=P._provider_hand_exchange(selection(),selection(),receipt());bodies=[];call=selection('next_actual_id','/allowed/second.py')['provider_tool_call']
  def provider(url,**kw):
   bodies.append(kw['data']);return {'choices':[{'message':{'content':'','tool_calls':[call]},'finish_reason':'tool_calls'}]}
  with patch.object(O,'openrouter_api_key',return_value='fixture-only'),patch.object(O,'openrouter_model',return_value='fixture-model'),patch.object(O,'system_for',return_value='unchanged system'),patch.object(O,'_hedged_http_json',side_effect=provider):
   got=O._call_openrouter_inner('original owner','actual receipts',tool_history=history)
  self.assertEqual(got['provider_tool_call'],call);self.assertEqual([m['role'] for m in bodies[0]['messages']],['system','user','assistant','tool'])
  self.assertEqual(bodies[0]['model'],'fixture-model')

 def test_unsupported_tool_roles_fallback_keeps_receipts_without_fabrication(self):
  history=P._provider_hand_exchange(selection(),selection(),receipt());bodies=[]
  def rejected(*a,**kw):raise urllib.error.HTTPError('https://fixture.invalid',400,'fixture rejection',None,None)
  def fallback(url,**kw):
   bodies.append(kw['data']);return {'choices':[{'message':{'content':'Answer from the actual receipts.'},'finish_reason':'stop'}]}
  with patch.object(O,'openrouter_api_key',return_value='fixture-only'),patch.object(O,'openrouter_model',return_value='fixture-model'),patch.object(O,'system_for',return_value='unchanged system'),patch.object(O,'_hedged_http_json',side_effect=rejected),patch.object(O,'_http_json',side_effect=fallback):
   got=O._call_openrouter_inner('original owner','first actual bytes in truthful text receipt',tool_history=history)
  self.assertTrue(got['ok']);self.assertNotIn('provider_tool_call',got)
  self.assertEqual([m['role'] for m in bodies[0]['messages']],['system','user'])
  self.assertIn('first actual bytes',bodies[0]['messages'][1]['content'])

 def test_canonical_dispatch_preserves_history_without_worker_transport(self):
  history=P._provider_hand_exchange(selection(),selection(),receipt())
  with patch.object(P.ONLINE,'call_grok',return_value={'ok':True,'spoken':'actual response'}) as talk:
   P.online_talk('ordinary request','actual receipts',tool_history=history)
  self.assertEqual(talk.call_args.kwargs['tool_history'],history)
  with patch.object(O,'openrouter_api_key',return_value='fixture-only'),patch.object(O,'call_openrouter',return_value={'ok':True,'spoken':'actual response'}) as canonical:
   O.call_grok('original','context',tool_history=history)
  self.assertEqual(canonical.call_args.kwargs['tool_history'],history)

if __name__=='__main__':unittest.main()
