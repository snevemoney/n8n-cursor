import hashlib,tempfile,unittest
from pathlib import Path
from unittest import mock
import coding_mission as M
from test_workflow_intake import OBJECTIVE
class WorkflowOwnerApprovalTests(unittest.TestCase):
 def test_exact_unquoted_orb_approval_records_receipt(self):
  with tempfile.TemporaryDirectory() as d:
   hive=Path(d)/'hive';repo=Path(d).resolve()/'repo';repo.mkdir()
   h=M.WorkflowMissionHandle(hive);task=h.start_workflow(OBJECTIVE);ident=task['mission_id'];root=M.mission_path(hive,ident)
   perm=M._load('agent_stack_permissions',M.STACK/'hands'/'permissions.py')
   branch='jarvis/workflow-'+ident
   with mock.patch.object(perm,'decide',return_value='confirm'):
    h.bind_project(ident,str(repo),branch,f'Use project folder {repo} on isolated branch {branch}.')
   answer=f'Approve workflow edits for {repo} on branch {branch}.'
   result=h.approve_project(ident,answer)
   self.assertEqual(result['status'],'WAITING_SOURCE')
   receipt=M.read_json(root/'owner_approval.json')
   self.assertEqual(receipt['owner_answer'],answer)
   self.assertEqual(receipt['target'],str(repo))
   self.assertEqual(receipt['branch'],branch)

 def test_owner_can_override_project_gate_without_changing_original_or_global_mode(self):
  with tempfile.TemporaryDirectory() as d:
   hive=Path(d)/'hive';repo=Path(d).resolve()/'repo';repo.mkdir();(repo/'human.txt').write_text('preserve')
   h=M.WorkflowMissionHandle(hive);task=h.start_workflow(OBJECTIVE);ident=task['mission_id'];root=M.mission_path(hive,ident)
   perm=M._load('agent_stack_permissions',M.STACK/'hands'/'permissions.py')
   with mock.patch.object(perm,'decide',return_value='confirm'):h.bind_project(ident,str(repo),'codex/owner','Use '+str(repo))
   original=(root/'request.json').read_bytes();answer=f'Approve workflow edits for "{repo}" on branch codex/owner'
   result=h.approve_project(ident,answer)
   self.assertEqual(result['status'],'WAITING_SOURCE');self.assertFalse(result['task_verified'])
   grant=M.WorkflowMissionHandle(hive).project_approval(ident);self.assertEqual(grant['request_sha256'],hashlib.sha256(original).hexdigest())
   self.assertEqual((root/'request.json').read_bytes(),original);self.assertEqual((repo/'human.txt').read_text(),'preserve')
   for wrong in ('approve',f'Approve workflow edits for "{repo}-other" on branch codex/owner',f'Approve workflow edits for "{repo}" on branch main'):
    with self.assertRaises(ValueError):h.approve_project(ident,wrong)
   source={'selected':{'source_url':'https://www.youtube.com/watch?v=abcdefghijk','implementation_verified':False}}
   M.write_json(root/'source_research.json',source);source_bytes=(root/'source_research.json').read_bytes()
   h.cancel(ident);self.assertIsNone(h.project_approval(ident));resumed=h.continue_workflow(ident,'continue workflow')
   self.assertEqual(resumed['status'],'WAITING_ORIGINAL_IMPLEMENTATION');self.assertNotIn('Which saved',resumed['spoken'])
   self.assertEqual((root/'source_research.json').read_bytes(),source_bytes)
   self.assertIsNotNone(h.project_approval(ident))
   binding=M.read_json(root/'binding.json');binding['branch']='codex/changed';M.write_json(root/'binding.json',binding)
   self.assertIsNone(h.project_approval(ident))
if __name__=='__main__':unittest.main()
