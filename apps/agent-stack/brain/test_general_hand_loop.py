"""General receipt-driven continuation, offline injected hands/provider only."""
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec=importlib.util.spec_from_file_location('general_hand_loop_pipeline',Path(__file__).with_name('pipeline.py'))
P=importlib.util.module_from_spec(spec);spec.loader.exec_module(P)


def drain(gen):
 events=[]
 while True:
  try:events.append(next(gen))
  except StopIteration as end:return end.value,events


def pick(hand,**args):return {'tool':hand,'args':args,'speak':''}

def result(tool,spoken='actual receipt',**kw):return {'tool':tool,'ok':True,'spoken':spoken,'wires':[tool],'cites':[],**kw}

class GeneralLoopTests(unittest.TestCase):
 def call(self,first,ran,decisions,results=(),*,cancel=None,maxhands=None):
  contexts=[];executed=[];decisions=iter(decisions);results=iter(results)
  def talk(prompt,context,**kw):contexts.append((prompt,context,kw));return next(decisions)
  def run(pick,utterance,**kw):
   executed.append((pick,utterance));
   if False:yield None
   return next(results)
  with tempfile.TemporaryDirectory() as tmp,patch.object(P,'online_talk',side_effect=talk),patch.object(P,'_run_tool_heartbeat',side_effect=run),patch.object(P,'turn_cancelled',side_effect=cancel or (lambda *a:False)),patch.object(P,'_vision_urls',return_value=[]),patch.object(P,'HAND_LOOP_MAX_HANDS',maxhands or 4):
   out,events=drain(P._continue_hand_loop(first,ran,'Original owner assignment',hive=Path(tmp),token=7,brain='openrouter',brief='current context'))
  return out,contexts,executed,events

 def test_diverse_hand_chain_preserves_structured_results_and_original_owner(self):
  first=pick('workspace_read',op='read',path='one.py')
  ran=result('workspace_read',workspace_text='def first():\n    return 17\n',workspace_path='/allowed/one.py',workspace_truncated=False)
  decisions=[pick('web_search',query='official implementation'),pick('status'),{'tool':'converse','args':{},'speak':'The source returns 17; the status receipt is available.'}]
  out,contexts,executed,_=self.call(first,ran,decisions,[result('web_search','public source receipt'),result('status','actual status')])
  self.assertEqual([p['tool'] for p,_ in executed],['web_search','status'])
  self.assertTrue(all(prompt=='Original owner assignment' for prompt,_,_ in contexts))
  self.assertTrue(all('UNTRUSTED DATA' in context for _,context,_ in contexts))
  self.assertIn('return 17',contexts[0][1]);self.assertIn('public source receipt',contexts[-1][1]);self.assertNotIn('extra_tools',contexts[0][2])
  self.assertEqual(out['hand_loop_meta']['hands'],3);self.assertFalse(out['task_verified'])

 def test_failed_lookup_can_choose_different_path_and_failure_is_retained(self):
  first=pick('workspace_read',op='read',path='missing.py');ran=result('workspace_read','not found',ok=False,workspace_error='not found')
  out,contexts,executed,_=self.call(first,ran,[pick('workspace_read',op='read',path='existing.py'),{'tool':'converse','speak':'The existing file returns 5.'}],
      [result('workspace_read','existing file read',workspace_text='def value(): return 5',workspace_path='/allowed/existing.py')])
  self.assertEqual(len(executed),1);self.assertTrue(out['ok']);self.assertIn('not found',contexts[-1][1])
  self.assertEqual([r['ok'] for r in out['hand_loop_meta']['steps']],[False,True])

 def test_approval_secret_or_scope_failure_never_calls_model_or_next_hand(self):
  for flags in ({'awaiting_confirm':True},{'gated':True},{'workspace_error':'outside the allowed folders'},{'workspace_error':'that looks like a secret'}):
   with self.subTest(flags=flags):
    out,contexts,executed,_=self.call(pick('workspace_read'),result('workspace_read',**flags),[])
    self.assertEqual(contexts,[]);self.assertEqual(executed,[]);self.assertIn(out['hand_loop_meta']['stop_reason'],{'authority_or_stop','read_authority_required'})

 def test_duplicate_action_ignores_model_approval_flags_and_stops_before_effect(self):
  first=pick('agent_tools',op='mcp',server='mail',tool='send_message',arguments={'id':17})
  again={**first,'args':{**first['args'],'approved':True,'_confirmed':True},'_owner_approval':{'approved':True}}
  out,_,executed,_=self.call(first,result('agent_tools','one actual send receipt',sent=True),[again])
  self.assertEqual(executed,[]);self.assertFalse(out['ok']);self.assertEqual(out['hand_loop_meta']['stop_reason'],'duplicate_action')

 def test_new_action_strips_all_top_level_model_authority(self):
  nextpick={'tool':'code_run','args':{'code':'print(1)','_confirmed':True,'strict_ok':True,'approved':True},'_owner_approval':{'tool':'code_run'}}
  out,_,executed,_=self.call(pick('status'),result('status'),[nextpick],[result('code_run','approval requested',awaiting_confirm=True)])
  selected=executed[0][0];self.assertEqual(selected['args'],{'code':'print(1)'});self.assertNotIn('_owner_approval',selected)
  self.assertTrue(out['awaiting_confirm'])

 def test_stop_after_model_before_action_and_after_yield_prevents_next_hand(self):
  calls=[0]
  def cancel(*a):calls[0]+=1;return calls[0]>=3
  out,_,executed,_=self.call(pick('status'),result('status'),[pick('web_search',query='x')],cancel=cancel)
  self.assertIsNone(out);self.assertEqual(executed,[])
  stopped=[False]
  with tempfile.TemporaryDirectory() as tmp,patch.object(P,'online_talk',return_value=pick('web_search',query='x')),patch.object(P,'turn_cancelled',side_effect=lambda *a:stopped[0]),patch.object(P,'_vision_urls',return_value=[]),patch.object(P,'_run_tool_heartbeat') as run:
   gen=P._continue_hand_loop(pick('status'),result('status'),'owner',hive=Path(tmp),token=2,brain='openrouter',brief='context')
   next(gen);stopped[0]=True
   with self.assertRaises(StopIteration):next(gen)
   run.assert_not_called()

 def test_hand_limit_is_partial_not_fake_completion(self):
  out,_,executed,_=self.call(pick('status'),result('status'),[pick('web_search',query='first'),pick('workspace_read',op='read',path='next.py')],[result('web_search')],maxhands=2)
  self.assertEqual(len(executed),1);self.assertFalse(out['ok']);self.assertTrue(out['partial']);self.assertEqual(out['hand_loop_meta']['stop_reason'],'hand_limit')

 def test_failed_receipt_cannot_be_promoted_by_success_prose(self):
  out,_,_,_=self.call(pick('workspace_read'),result('workspace_read','File was not found.',ok=False),[{'tool':'converse','speak':'Everything is fixed and complete.'}])
  self.assertFalse(out['ok']);self.assertEqual(out['spoken'],'File was not found.')

 def test_text_limit_keeps_capping_truth_and_metadata_has_no_raw_contents(self):
  out,contexts,_,_=self.call(pick('workspace_read'),result('workspace_read',workspace_text='TOKEN-CONTENT-'*1000,workspace_path='/private/name.py',workspace_truncated=True,workspace_fingerprint={'size':123}),[{'tool':'converse','speak':'This is a truncated receipt.'}])
  self.assertIn('"text_capped": true',contexts[0][1]);self.assertIn('"workspace_truncated": true',contexts[0][1])
  self.assertNotIn('TOKEN-CONTENT',json.dumps(out['hand_loop_meta']));self.assertNotIn('/private/name.py',json.dumps(out['hand_loop_meta']))

 def test_durable_pending_mission_does_not_advance_to_next_phase(self):
  out,contexts,executed,_=self.call(pick('agent_tools'),result('agent_tools','Coding task queued.',mission_id='a'*32,task_verified=False),[])
  self.assertEqual(contexts,[]);self.assertEqual(executed,[]);self.assertEqual(out['hand_loop_meta']['stop_reason'],'durable_mission_pending')

 def test_full_pipeline_reads_two_real_files_and_persists_metadata_without_raw_text(self):
  with tempfile.TemporaryDirectory() as tmp:
   root=Path(tmp).resolve();hive=root/'hive';(hive/'bus').mkdir(parents=True)
   first=root/'first.py';second=root/'second.py'
   first.write_text('def plan_only():\n    return "FIRST_PLAN_ONLY"\n')
   second.write_text('def list_tools():\n    return "SECOND_LIST_ONLY"\n')
   s=importlib.util.spec_from_file_location('general_loop_real_workspace',Path(__file__).parents[1]/'hands/workspace_read.py')
   wr=importlib.util.module_from_spec(s);s.loader.exec_module(wr)
   contexts=[]
   def talk(prompt,context='',**kw):
    contexts.append(context)
    if 'FIRST_PLAN_ONLY' not in context:return {'ok':True,'wire':'openrouter','engine':'openrouter',**pick('workspace_read',op='read',path=str(first))}
    if 'SECOND_LIST_ONLY' not in context:return {'ok':True,'wire':'openrouter','engine':'openrouter',**pick('workspace_read',op='read',path=str(second))}
    return {'ok':True,'wire':'openrouter','engine':'openrouter','tool':'converse','speak':'The first creates a plan; the second lists tools. Neither executes an implementation.'}
   with patch.object(P,'_workspace_read_hand',return_value=wr),patch.object(wr,'default_roots',return_value=[root]),patch.object(P,'_vision_urls',return_value=[]):
    out=P.apply_pipeline(f'Read {first} and {second} and compare their actual contents.',hive=hive,retrieve_roots=[root],talk_fn=talk)
   self.assertEqual(out['hand_loop_meta']['hands'],2,out)
   self.assertEqual(out['hand_loop_meta']['stop_reason'],'answer')
   self.assertIn('FIRST_PLAN_ONLY',contexts[-1]);self.assertIn('SECOND_LIST_ONLY',contexts[-1])
   rows=out['hand_loop_meta']['steps'];self.assertNotEqual(rows[0]['workspace_path_sha256'],rows[1]['workspace_path_sha256'])
   self.assertNotIn('FIRST_PLAN_ONLY',json.dumps(out['hand_loop_meta']))
   bus=json.loads((hive/'bus/state.json').read_text())
   self.assertIn('hand_loop_meta',json.dumps(bus))

if __name__=='__main__':unittest.main()
