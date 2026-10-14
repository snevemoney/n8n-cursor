"""Real file snapshots; no provider or GUI calls."""
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch


def load(name,path):
 spec=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
D=load('collection_context',Path(__file__).with_name('document_context.py'))
B=D._bus_io()

class Collections(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.root=Path(self.tmp.name).resolve();self.hive=self.root/'hive';self.hive.mkdir()
  self.files=[self.root/'alpha.py',self.root/'beta.py']
  for i,p in enumerate(self.files):p.write_text(f'actual source {i}')
  self.ask='Read '+ ' and '.join(map(str,self.files))+' and compare them.'
  self.gen(1)
 def tearDown(self):self.tmp.cleanup()
 def gen(self,n,cancel=0):B.mutate_bus(self.hive,lambda b:{**b,'turn_gen':n,'cancel_gen':cancel})
 def retain(self,p,**kw):return D.retain(self.hive,1,{'ok':True,'tool':'workspace_read','workspace_path':str(p),'workspace_text':p.read_text(),**kw},user_utterance=self.ask)
 def both(self):
  for p in self.files:self.assertTrue(self.retain(p)['ok'])
  self.gen(2)
 def follow(self):return D.for_followup(self.hive,2,is_followup=True)
 def test_two_actual_sources_then_followup(self):
  self.both();r=self.follow();self.assertEqual(r['source_count'],2);self.assertEqual([x['text'] for x in r['documents']],['actual source 0','actual source 1'])
 def test_changed_deleted_expired_collection_has_no_text(self):
  for mutation in ('changed','deleted','expired'):
   with self.subTest(mutation=mutation):
    self.gen(1);self.files[0].write_text('actual source 0');self.both()
    if mutation=='changed':self.files[0].write_text('changed')
    elif mutation=='deleted':self.files[0].unlink()
    else:B.mutate_bus(self.hive,lambda b:{**b,'document_context':{**b['document_context'],'documents':[{**x,'expires_at':0} for x in b['document_context']['documents']]}})
    r=self.follow();self.assertFalse(r['ok']);self.assertNotIn('text',r);self.assertNotIn('prompt_block',r)
 def test_origin_stop_invalidates_later_active_turn(self):
  self.both();self.gen(2,cancel=1);self.assertEqual(self.follow()['status'],'STALE')
 def test_stop_during_atomic_retain_cannot_append(self):
  actual=B.act_if_current
  def stop(hive,gen,fn):self.gen(1,cancel=1);return actual(hive,gen,fn)
  with patch.object(B,'act_if_current',side_effect=stop):self.assertFalse(self.retain(self.files[0])['ok'])
  self.assertNotIn('document_context',B.load_json(self.hive/'bus/state.json'))
 def test_model_only_or_filename_prefix_not_authority(self):
  for ask in ('Read unrelated.py','Read alpha.py-other'):
   self.ask=ask;self.assertFalse(self.retain(self.files[0])['ok'])
 def test_other_request_replaces_collection_and_unrelated_query_denied(self):
  self.retain(self.files[0]);self.ask='Read '+str(self.files[1]);self.retain(self.files[1]);self.gen(2)
  self.assertEqual(self.follow()['source_count'],1)
  self.assertFalse(D.for_followup(self.hive,2)['ok'])
 def test_partial_redacted_and_bounded(self):
  self.files[0].write_text('A'*12000);self.files[1].write_text('sk-'+'x'*25+'\n'+'B'*12000)
  self.both();r=self.follow();self.assertEqual(r['status'],'PARTIAL');self.assertTrue(r['token_scrubbed']);self.assertLessEqual(sum(len(x['text'].encode()) for x in r['documents']),18000)
  self.assertNotIn('sk-'+ 'x'*25,json.dumps(B.load_json(self.hive/'bus/state.json')))
 def test_secret_path_and_symlink_denied(self):
  for name in ('.env','alias.py'):
   p=self.root/name
   if name=='.env':p.write_text('not a credential fixture')
   else:p.symlink_to(self.files[0])
   self.ask='Read '+str(p);self.assertFalse(self.retain(p)['ok'])

if __name__=='__main__':unittest.main()
