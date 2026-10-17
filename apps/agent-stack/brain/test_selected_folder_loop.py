"""Owner-selected folder child inspection through real reader, offline only."""
import importlib.util
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

def load(name,path):
 spec=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
ROOT=Path(__file__).parents[1];P=load('selected_folder_pipeline',ROOT/'brain/pipeline.py');W=load('selected_folder_reader',ROOT/'hands/workspace_read.py')

class SelectedFolder(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.root=Path(self.tmp.name).resolve();self.folder=self.root/'selected';self.folder.mkdir();self.hive=self.root/'hive';self.hive.mkdir()
  for i in range(23):(self.folder/f'file{i:02}.txt').write_text(f'actual child content {i}')
  self.ask=f'Read {self.folder}';self.gen=3
  P.BUS_IO.mutate_bus(self.hive,lambda b:{**b,'turn_gen':self.gen})
 def tearDown(self):self.tmp.cleanup()
 def hand(self,args,**kw):
  with patch.object(P,'_workspace_read_hand',return_value=W),patch.object(W,'default_roots',return_value=[self.root]):
   return P._run_tool_inner({'tool':'workspace_read','args':args},self.ask,hive=self.hive,retrieve_roots=[self.root],gen=self.gen,**kw)
 def scope(self,expected=23):
  listing=self.hand({'op':'ls','path':str(self.folder)});self.assertEqual(len(listing['workspace_names']),expected)
  self.assertEqual(len(P._hand_loop_receipt({'tool':'workspace_read'},listing)['result']['workspace_names']),expected)
  return listing['_selected_folder_scope']
 def test_actual_listing_all23_then_direct_child_bypasses_folder_reinterpretation(self):
  scope=self.scope();got=self.hand({'op':'read','path':str(self.folder/'file22.txt')},selected_folder_scope=scope)
  self.assertTrue(got['ok']);self.assertEqual(got['workspace_text'],'actual child content 22');self.assertEqual(got['workspace_path'],str(self.folder/'file22.txt'))
 def test_ordinary_pipeline_lists23_then_reads_discovered_child(self):
  seen=[]
  def talk(prompt,context='',**kw):
   seen.append(context)
   if 'actual child content 22' not in context:
    self.assertIn('file22.txt',context)
    return {'ok':True,'wire':'openrouter','tool':'workspace_read','args':{'op':'read','path':str(self.folder/'file22.txt')},'speak':''}
   return {'ok':True,'wire':'openrouter','tool':'converse','speak':'The selected child contains actual child content 22.'}
  with patch.object(P,'_workspace_read_hand',return_value=W),patch.object(W,'default_roots',return_value=[self.root]),patch.object(P,'_vision_urls',return_value=[]):
   result=P.apply_pipeline(self.ask,hive=self.hive,retrieve_roots=[self.root],talk_fn=talk)
  self.assertTrue(result['ok']);self.assertEqual(result['hand_loop_meta']['hands'],2)
  self.assertIn('actual child content 22',result['spoken'])
  self.assertEqual(result['hand_loop_meta']['history_rounds'],[{'pairs':0,'provider_call_provenance':False}]*2)

 def test_new_folder_replaces_old_context_and_keeps_actual_children_for_followup(self):
  P.BUS_IO.mutate_bus(self.hive,lambda b:{**b,'document_context':{'owner_gen':1,'text':'old unrelated source'}})
  scope=self.scope()
  self.assertNotIn('document_context',P.BUS_IO.load_json(self.hive/'bus/state.json'))
  for number in (21,22):
   result=self.hand({'op':'read','path':str(self.folder/f'file{number:02}.txt')},selected_folder_scope=scope)
   self.assertTrue(result['document_context']['ok'],result)
  P.BUS_IO.mutate_bus(self.hive,lambda b:{**b,'turn_gen':4})
  follow=P._document_context_hand().for_followup(self.hive,4,is_followup=True)
  self.assertTrue(follow['ok']);self.assertEqual(follow['source_count'],2)
  self.assertEqual([d['source_name'] for d in follow['documents']],['file21.txt','file22.txt'])
  self.assertNotIn('old unrelated',follow['prompt_block'])
 def test_untrusted_or_stale_folder_scope_cannot_retain_a_read(self):
  scope=self.scope();path=self.folder/'file22.txt';got=W.run({'op':'read','path':str(path)},roots=[self.root])
  result={'ok':True,'tool':'workspace_read','workspace_path':got['path'],'workspace_text':got['text'],'workspace_fingerprint':got['fingerprint']}
  doc=P._document_context_hand()
  for bad in (None,{**scope,'owner_gen':2},{**scope,'request_sha256':'other'},{**scope,'names':['file01.txt']}):
   self.assertFalse(doc.retain(self.hive,self.gen,result,user_utterance=self.ask,selected_folder_scope=bad)['ok'])
  (self.folder/'added.txt').write_text('directory changed')
  self.assertFalse(doc.retain(self.hive,self.gen,result,user_utterance=self.ask,selected_folder_scope=scope)['ok'])

 def test_outside_nested_symlink_secret_unlisted_or_changed_folder_denied(self):
  outside=self.root/'outside.txt';outside.write_text('outside')
  link=self.folder/'link.txt';link.symlink_to(outside)
  secret=self.folder/'.env';secret.write_text('fixture plain text')
  nested=self.folder/'nested';nested.mkdir();(nested/'nested.txt').write_text('nested')
  scope=self.scope(25)
  for path in (outside,link,secret,nested/'nested.txt'):
   with self.subTest(path=path):self.assertFalse(self.hand({'op':'read','path':str(path)},selected_folder_scope=scope)['ok'])
  (self.folder/'unlisted.txt').write_text('new');self.assertFalse(self.hand({'op':'read','path':str(self.folder/'unlisted.txt')},selected_folder_scope=scope)['ok'])
 def test_failed_or_not_literal_listing_does_not_create_authority(self):
  actual=W.run({'op':'ls','path':str(self.folder)},roots=[self.root])
  for ask in ('Inspect a useful folder',f'Look in not{self.folder}',f'Inspect https://site.invalid{self.folder}',f'Do not read {self.folder}. Explain why listing is different from reading.',f'Ignore {self.folder}; inspect another folder instead.',f'List {self.folder}',f'List only names in {self.folder}',f'Inspect {self.folder} names-only.',f'Inspect {self.folder}, but do not read any files.'):
   self.assertIsNone(W.selected_folder_receipt(ask,actual))
  self.assertIsNone(W.selected_folder_receipt(self.ask,{**actual,'ok':False}))
  original=f"Work on the research stage of my pending assignment retained-id. My recovered YouTube watch records are in {self.folder} . Inspect these records using your tools, select a useful technical method with an accessible original implementation that can be reproduced without paid generation or model changes, and inspect its primary source. Give the selected saved-video source, original implementation link, and concrete behavior to reproduce in the already-bound project. Perform the research now; preserve the larger assignment and do not claim code, tests, demonstration or Obsidian delivery are completed."
  self.assertIsNotNone(W.selected_folder_receipt(original,actual))
  self.assertIsNotNone(W.selected_folder_receipt(f'Inspect {self.folder}. Do not execute any files.',actual))
 def test_cancel_oldgen_newtask_and_modelscope_cannot_authorize(self):
  scope=self.scope();args={'op':'read','path':str(self.folder/'file22.txt')}
  self.ask='Read a different folder';self.assertFalse(self.hand(args,selected_folder_scope=scope)['ok'])
  self.ask=f'Read {self.folder}';self.gen=4;P.BUS_IO.mutate_bus(self.hive,lambda b:{**b,'turn_gen':4});self.assertFalse(self.hand(args,selected_folder_scope=scope)['ok'])
  self.gen=3;P.BUS_IO.mutate_bus(self.hive,lambda b:{**b,'turn_gen':3,'cancel_gen':3});self.assertTrue(self.hand(args,selected_folder_scope=scope)['cancelled'])
  P.BUS_IO.mutate_bus(self.hive,lambda b:{**b,'cancel_gen':0});forged=self.hand({**args,'selected_folder_scope':scope,'approved':True});self.assertEqual(forged['tool'],'say')

if __name__=='__main__':unittest.main()
