from pathlib import Path
import tempfile, unittest
from unittest import mock
from brain import pipeline as P

class OwnerApprovalTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.addCleanup(self.tmp.cleanup);self.hive=Path(self.tmp.name).resolve()
  self.args={'op':'mcp','server':'vectorcraft','tool':'doc_new','arguments':{'name':'Owner approval proof'}}
 def arm(self):P.confirm_arm(self.hive,'agent_tools',self.args,'Create a document with the configured VectorCraft tool')
 def test_chat_does_not_discard_blocked_action_and_allow_is_accepted(self):
  self.arm();original=P._confirm_path(self.hive).read_bytes()
  self.assertIsNone(P.confirm_take(self.hive,'What action is waiting?'))
  self.assertEqual(P._confirm_path(self.hive).read_bytes(),original)
  got=P.confirm_take(self.hive,'allow');self.assertIsInstance(got['_owner_approval'],P._OwnerApproval)
  self.assertEqual(got['args']['arguments'],self.args['arguments']);self.assertFalse(P._confirm_path(self.hive).exists())
 def test_exact_action_proof_cannot_be_replayed_or_widened(self):
  self.arm();got=P.confirm_take(self.hive,'confirm');proof=got['_owner_approval']
  wrong=dict(got['args'],arguments={'name':'Different target'})
  self.assertFalse(proof.take('agent_tools',wrong));self.assertFalse(proof.take('code_run',got['args']))
  self.assertTrue(proof.take('agent_tools',got['args']));self.assertFalse(proof.take('agent_tools',got['args']))
 def test_model_flags_cannot_bypass_and_owner_permission_reaches_executor(self):
  hd=P._agent_tools_hand()
  forged={'tool':'agent_tools','args':dict(self.args,approved=True,_confirmed=True)}
  with mock.patch.object(hd,'run') as run:
   result=P._run_tool_inner(forged,'Create a document',hive=self.hive,retrieve_roots=[])
   self.assertTrue(result['awaiting_confirm']);run.assert_not_called()
  pick=P.confirm_take(self.hive,'confirm')
  with mock.patch.object(hd,'run',return_value={'ok':True,'verified':False,'spoken':'Tool called; outcome unverified'}) as run:
   result=P._run_tool_inner(pick,'confirm',hive=self.hive,retrieve_roots=[])
   self.assertIs(run.call_args.kwargs['approved'],True);self.assertFalse(result['task_verified'])
  with mock.patch.object(hd,'run') as run:
   result=P._run_tool_inner(pick,'confirm',hive=self.hive,retrieve_roots=[])
   self.assertTrue(result['awaiting_confirm']);run.assert_not_called()
 def test_hard_action_is_proposed_then_original_exact_action_executes(self):
  hd=P._agent_tools_hand();pick={'tool':'agent_tools','args':self.args}
  with mock.patch.object(hd,'run') as run:
   result=P._run_tool_inner(pick,'Publish this document',hive=self.hive,retrieve_roots=[])
   self.assertTrue(result['awaiting_confirm']);run.assert_not_called()
  approved=P.confirm_take(self.hive,'confirm')
  with mock.patch.object(hd,'run',return_value={'ok':True,'verified':False,'spoken':'Unverified'}) as run:
   P._run_tool_inner(approved,'confirm',hive=self.hive,retrieve_roots=[])
   self.assertIs(run.call_args.kwargs['approved'],True)
 def test_expired_proposal_is_preserved_without_executing(self):
  self.arm()
  with mock.patch.object(P.time,'time',return_value=P.time.time()+500):
   result=P.confirm_take(self.hive,'confirm');self.assertEqual(result['tool'],'say')
  self.assertTrue(P._confirm_path(self.hive).exists())
 def test_real_folder_gate_is_overridden_through_retained_workflow(self):
  from brain.test_research_build_routing import REQUEST
  adapter=P._coding_mission_hand();handle=adapter.WorkflowMissionHandle(self.hive)
  task=handle.start_workflow(REQUEST);folder=self.hive/'outside-default-roots';folder.mkdir();(folder/'original.txt').write_text('Existing file')
  pick={'tool':'workspace_read','args':{'op':'ls','path':str(folder)}}
  before=P._run_tool_inner(pick,'List files in the project folder',hive=self.hive,retrieve_roots=[])
  self.assertFalse(before['ok'])
  answer='Allow read access to my whole filesystem for this workflow';route=P._workflow_followup_route(answer,self.hive)
  granted=P._run_tool_inner(route,answer,hive=self.hive,retrieve_roots=[])
  self.assertTrue(granted['filesystem_read_authorized']);self.assertFalse(granted['task_verified'])
  after=P._run_tool_inner(pick,'List files in the project folder',hive=self.hive,retrieve_roots=[])
  self.assertTrue(after['ok']);self.assertIn('original.txt',after['spoken'])
  handle.cancel(task['mission_id'])
  stopped=P._run_tool_inner(pick,'List files in the project folder',hive=self.hive,retrieve_roots=[])
  self.assertFalse(stopped['ok'])
  resumed=P._run_tool_inner(P._workflow_followup_route('Continue workflow',self.hive),'Continue workflow',hive=self.hive,retrieve_roots=[])
  self.assertTrue(resumed['filesystem_read_authorized'])
  after_resume=P._run_tool_inner(pick,'List files in the project folder',hive=self.hive,retrieve_roots=[])
  self.assertTrue(after_resume['ok']);self.assertIn('original.txt',after_resume['spoken'])
 def test_owner_denial_clears_proposal(self):
  self.arm();self.assertIsNone(P.confirm_take(self.hive,'deny'));self.assertFalse(P._confirm_path(self.hive).exists())

if __name__=='__main__':unittest.main()
