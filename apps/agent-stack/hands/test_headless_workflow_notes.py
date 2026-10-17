"""Headless note delivery uses temporary vaults only, never the owner's vault."""
import json,os,tempfile,unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch
from hands import test_workflow_delivery as T
M=T.M
class Headless(unittest.TestCase):
 accept_coding=T.Connected.accept_coding
 tearDown=T.Connected.tearDown
 def setUp(self):
  T.Connected.setUp(self);r=self.a.read_json(self.task/'request.json');r['worker_kind']='research_build';self.a.write_json(self.task/'request.json',r)
  self.vault=self.root/'vault';(self.vault/'.obsidian').mkdir(parents=True);self.inbox=self.vault/'00_Outer_Heaven/shared/inbox';self.inbox.mkdir(parents=True)
  M.enable_headless_notes(self.a,self.hive,T.ID,owner_answer='Use Obsidian headless for this workflow.',vault_root=self.vault)
  original=M.Runtime(self.a,self.d.check)
  self.r.note_contract=original.note_contract;self.r.note_read=original.note_read;self.r.note_list=original.note_list;self.r.note_write=original.note_write
 def test_actual_temporary_note_atomic_create_readback_resume_without_app_or_duplicate(self):
  self.accept_coding();ready=self.d.advance(self.coding);self.assertEqual(ready['status'],'WAITING_FINAL_REVIEW')
  target=self.inbox/('Jarvis-implementation-'+T.ID+'.md');self.assertTrue(target.is_file());before=target.stat().st_ino
  self.assertIn('Usage: implemented_behavior(value)',target.read_text());self.assertEqual(list(self.inbox.glob('.jarvis-note-*')),[])
  again=self.d.advance(self.coding);self.assertEqual(again['status'],'WAITING_FINAL_REVIEW');self.assertEqual(target.stat().st_ino,before)
 def test_existing_conflict_preserved_nooverwrite_and_symlink_rejected(self):
  target=self.inbox/('Jarvis-implementation-'+T.ID+'.md');target.write_text('human preexisting')
  self.accept_coding();got=self.d.advance(self.coding);self.assertEqual(got['delivery_reason'],'implementation_note_conflict');self.assertEqual(target.read_text(),'human preexisting')
  target.unlink();target.symlink_to(self.root/'outside')
  got=self.d.advance(self.coding);self.assertEqual(got['delivery_reason'],'obsidian_read_or_permission_unavailable');self.assertFalse((self.root/'outside').exists())
 def test_stop_before_publication_leaves_no_final_note_and_preserves_pending(self):
  self.accept_coding();original=os.link
  def stop_link(*args,**kwargs):
   self.live=False
   # Emulate Stop immediately before publication, not after creating the note.
   M.HeadlessNote(M.Runtime(self.a,self.d.check)).scope()
   return original(*args,**kwargs)
  with patch.object(M.os,'link',side_effect=stop_link):got=self.d.advance(self.coding)
  self.assertEqual(got['status'],'DELIVERY_RECOVERY_REQUIRED');self.assertFalse((self.inbox/('Jarvis-implementation-'+T.ID+'.md')).exists());self.assertEqual(list(self.inbox.glob('.jarvis-note-*')),[])
 def test_stop_after_publication_reconciles_exact_note_without_duplicate(self):
  self.accept_coding();original=os.link
  def publish_then_stop(*args,**kwargs):
   result=original(*args,**kwargs);self.live=False;return result
  with patch.object(M.os,'link',side_effect=publish_then_stop):got=self.d.advance(self.coding)
  self.assertEqual(got['status'],'DELIVERY_RECOVERY_REQUIRED');target=self.inbox/('Jarvis-implementation-'+T.ID+'.md');self.assertTrue(target.exists());identity=target.stat().st_ino
  self.live=True;again=self.d.advance(self.coding);self.assertEqual(again['status'],'WAITING_FINAL_REVIEW');self.assertEqual(target.stat().st_ino,identity)
 def test_temp_collision_cleanup_preserves_unowned_existing_file(self):
  self.accept_coding();temporary=self.inbox/'.jarvis-note-collision';temporary.write_text('unowned existing file')
  with patch.object(M.uuid,'uuid4',return_value=SimpleNamespace(hex='collision')):got=self.d.advance(self.coding)
  self.assertEqual(got['status'],'DELIVERY_RECOVERY_REQUIRED');self.assertEqual(temporary.read_text(),'unowned existing file')
 def test_temp_replacement_is_not_published_or_deleted_during_cleanup(self):
  self.accept_coding();original=M.HeadlessNote.scope;replaced=[]
  def replace_temporary(instance):
   row=original(instance)
   temporary=next(iter(self.inbox.glob('.jarvis-note-*')),None)
   if temporary is not None and not replaced:
    temporary.unlink();temporary.write_text('unowned replacement');replaced.append(temporary)
   return row
  with patch.object(M.HeadlessNote,'scope',replace_temporary):got=self.d.advance(self.coding)
  self.assertEqual(got['delivery_reason'],'headless_temporary_changed');self.assertFalse((self.inbox/('Jarvis-implementation-'+T.ID+'.md')).exists());self.assertEqual(replaced[0].read_text(),'unowned replacement')
 def test_no_generic_model_boolean_or_changed_task_can_grant_headless_scope(self):
  with self.assertRaises(ValueError):M.enable_headless_notes(self.a,self.hive,T.ID,owner_answer='approved true',vault_root=self.vault)
  self.accept_coding();self.d.advance(self.coding);self.a.write_json(self.task/'request.json',{'objective':'different','worker_kind':'research_build'})
  runtime=M.Runtime(self.a,self.d.check)
  with self.assertRaises(ValueError):runtime.note_contract()
