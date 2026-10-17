import ast,json,re,tempfile,unittest
from pathlib import Path
from hands import coding_mission as M

class ProgressStatusTests(unittest.TestCase):
 def test_real_failed_workflow_uses_receipts_not_stale_success_or_error(self):
  with tempfile.TemporaryDirectory() as tmp:
   h=M.WorkflowMissionHandle(Path(tmp)/'hive');ack=h.start_workflow('Research saved YouTube technical idea, build tests, ArtCraft and Obsidian.')
   root=M.mission_path(h.hive,ack['mission_id']);r=M.read_json(root/'state.json');r.update(status='PREPARATION_BLOCKED',spoken='Everything ready MATCH',execution_error='OLD_ERROR',preparation={'reason':'working_copy_selector_review_required'});M.write_json(root/'state.json',r)
   before=(root/'state.json').read_bytes();got=h.progress_status(ack['mission_id'])
   self.assertIn('blocked',got['spoken']);self.assertIn('demonstration and Obsidian note are not ready',got['spoken']);self.assertNotIn('working_copy_selector_review_required',got['spoken']);self.assertEqual(got['status'],'PREPARATION_BLOCKED');self.assertNotIn('OLD_ERROR',got['spoken']);self.assertNotIn('MATCH',got['spoken']);self.assertFalse(got['task_verified']);self.assertEqual(before,(root/'state.json').read_bytes())

 def test_actual_2276_wording_routes_to_named_receipt_before_conversation(self):
  text='What is the actual status of retained assignment '+'a'*32+'? Report completed actions, current blocker, and whether any coding, ArtCraft demonstration, or Obsidian note actually exists. Do not claim completion.'
  source=(Path(__file__).parents[1]/'brain/pipeline.py').read_text();tree=ast.parse(source);node=next(n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='_workflow_followup_route')
  class Adapter:
   @staticmethod
   def read_json(path):return {'mission_id':'b'*32}
  ns={'re':re,'Path':Path,'_coding_mission_hand':lambda:Adapter(),'_research_build_request':lambda text:False,
      '_coding_resume_match':lambda text:False}  # helper the route now consults first
  exec(compile(ast.Module(body=[node],type_ignores=[]),'route','exec'),ns)
  got=ns['_workflow_followup_route'](text,Path('/test/hive'))
  self.assertEqual(got['args'],{'action':'research_build_status','mission_id':'a'*32})
  self.assertIsNone(ns['_workflow_followup_route']('Hello',None))

 def test_unknown_named_workflow_has_no_receipts_or_success_claim(self):
  with tempfile.TemporaryDirectory() as tmp:
   got=M.WorkflowMissionHandle(Path(tmp)/'hive').progress_status('c'*32)
   self.assertFalse(got['ok']);self.assertIn('no retained workflow receipt',got['spoken']);self.assertFalse(got['verified'])

 def test_terminal_coding_receipt_wins_over_stale_running_state(self):
  for terminal in ('COMPLETED','FAILED'):
   with self.subTest(terminal=terminal),tempfile.TemporaryDirectory() as tmp:
    h=M.WorkflowMissionHandle(Path(tmp)/'hive');ack=h.start_workflow('Research saved YouTube, build tests, ArtCraft and Obsidian.')
    parent=M.mission_path(h.hive,ack['mission_id']);child='d'*32;root=M.mission_path(h.hive,child);root.mkdir()
    M.write_json(root/'request.json',{'mission_id':child,'worker_kind':'coding','workflow_context':{'parent_mission_id':ack['mission_id']}})
    M.write_json(root/'state.json',{'status':'RUNNING'})
    M.write_json(root/'result.json',{'status':terminal,'builder_verified':terminal=='COMPLETED'})
    M.write_json(parent/'coding_child.json',{'mission_id':child})
    got=h.progress_status(ack['mission_id'])
    self.assertEqual(got['status_evidence']['coding_status'],terminal);self.assertNotIn('RUNNING',got['spoken']);self.assertNotIn(terminal,got['spoken']);self.assertFalse(got['task_verified'])
