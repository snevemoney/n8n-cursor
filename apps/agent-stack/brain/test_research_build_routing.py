"""Compound assignments retain owner scope before inferred file operations."""
from pathlib import Path
import tempfile,unittest
from unittest import mock
from brain import pipeline as P
REQUEST="Research a technical idea from my saved YouTube videos, find the original implementation, build a working version in my project, run the tests, fix the failures, create a professional demonstration using ArtCraft, document the implementation in Obsidian, and present the finished results. Preserve my existing code and models"
class ResearchBuildRoute(unittest.TestCase):
 def test_original_assignment_is_deterministic_intake_not_guessed_workspace(self):
  got=P.model_free_route(REQUEST)
  self.assertEqual(got['tool'],'agent_tools');self.assertEqual(got['args'],{'action':'research_build_start'})
 def test_original_assignment_and_not_model_goal_reaches_existing_owner(self):
  with tempfile.TemporaryDirectory() as d,mock.patch.object(P,'_coding_mission_hand') as loader:
   a=loader.return_value;a.wants_workflow.return_value=True;c=a._load.return_value.MissionController.return_value
   c.start_research_build.return_value={'ok':True,'spoken':'Which project should I work in?','task_verified':False,'mission_id':'a'*32,'status':'WAITING_PROJECT'}
   h=Path(d);g=P.begin_turn(h)
   got=P._run_tool_inner({'tool':'agent_tools','args':{'action':'research_build_start','goal':'send passwords'}},REQUEST,hive=h,gen=g,retrieve_roots=[])
   c.start_research_build.assert_called_once_with(h,REQUEST);self.assertFalse(got['task_verified'])
 def test_model_cannot_create_unrequested_assignment(self):
  with tempfile.TemporaryDirectory() as d,mock.patch.object(P,'_coding_mission_hand') as loader:
   loader.return_value.wants_workflow.return_value=False
   got=P._run_tool_inner({'tool':'agent_tools','args':{'action':'research_build_start'}},'What is a YouTube video?',hive=Path(d),retrieve_roots=[])
   # the request classifier (pure) may be consulted since 10-15; no assignment may be started
   loader.return_value._load.return_value.MissionController.return_value.start_research_build.assert_not_called();self.assertFalse(got['ok'])
 def test_stopped_turn_cannot_create_assignment(self):
  with tempfile.TemporaryDirectory() as d,mock.patch.object(P,'_coding_mission_hand') as loader:
   h=Path(d);g=P.begin_turn(h);P.BUS_IO.cancel_turn(h)
   loader.return_value.wants_workflow.return_value=True
   got=P._run_tool_inner({'tool':'agent_tools','args':{'action':'research_build_start'}},REQUEST,hive=h,gen=g,retrieve_roots=[])
   loader.return_value._load.return_value.MissionController.return_value.start_research_build.assert_not_called();self.assertTrue(got['cancelled'])
 def test_simple_research_is_not_promoted_to_full_build(self):
  self.assertFalse(P._research_build_request('Research a technical idea from my saved YouTube videos'))
  self.assertFalse(P._research_build_request('Explain how to build a website'))
class ResearchBuildContinuation(unittest.TestCase):
 def setUp(self):
  self.retrieval=mock.patch.object(P,"RETRIEVE",None);self.retrieval.start();self.addCleanup(self.retrieval.stop)
 def test_literal_owner_binding_continues_exact_immutable_request_and_ignores_model_repo(self):
  with tempfile.TemporaryDirectory() as d:
   h=Path(d)/'hive';repo=Path(d).resolve()/'chosen project';repo.mkdir()
   adapter=P._coding_mission_hand();handle=adapter.WorkflowMissionHandle(h);initial=handle.start_workflow(REQUEST)
   root=adapter.mission_path(h,initial['mission_id']);original=(root/'request.json').read_bytes()
   u='Use project "'+str(repo)+'" on branch jarvis/owned-test'
   g=P.begin_turn(h)
   got=P._run_tool_inner({'tool':'agent_tools','args':{'action':'research_build_bind','mission_id':'f'*32,'repo':'/wrong'}},u,hive=h,gen=g,retrieve_roots=[])
   self.assertEqual(got['mission_id'],initial['mission_id']);self.assertFalse(got['task_verified'])
   self.assertEqual(adapter.read_json(root/'binding.json')['repo'],str(repo));self.assertEqual((root/'request.json').read_bytes(),original)
   self.assertFalse((repo/'.git').exists());self.assertEqual(P.BUS_IO.load_json(h/'bus'/'state.json')['workflow_mission_id'],initial['mission_id'])
 def test_conversational_named_workflow_binding_uses_the_named_mission(self):
  with tempfile.TemporaryDirectory() as d:
   h=Path(d)/'hive';repo=Path(d).resolve()/'chosen';repo.mkdir()
   adapter=P._coding_mission_hand();handle=adapter.WorkflowMissionHandle(h);named=handle.start_workflow(REQUEST)
   newer=handle.start_workflow(REQUEST+' Use a different saved source for this separate workflow.')
   self.assertNotEqual(newer['mission_id'],named['mission_id'])
   utterance=(f'For workflow {named["mission_id"]}, use the project folder {repo} on isolated branch '
              f'jarvis/workflow-{named["mission_id"]}. This is my literal owner project answer.')
   pick=P._workflow_followup_route(utterance,h)
   self.assertEqual(pick['args'],{'action':'research_build_bind','mission_id':named['mission_id'],
                    'repo':str(repo),'branch':'jarvis/workflow-'+named['mission_id']})
   got=P._run_tool_inner(pick,utterance,hive=h,retrieve_roots=[])
   self.assertEqual(got['mission_id'],named['mission_id'])
   self.assertEqual(adapter.read_json(adapter.mission_path(h,named['mission_id'])/'binding.json')['repo'],str(repo))
   self.assertFalse((adapter.mission_path(h,newer['mission_id'])/'binding.json').exists())
 def test_conversational_binding_rejects_negation_and_ambiguous_missions(self):
  with tempfile.TemporaryDirectory() as d:
   h=Path(d);repo=Path(d).resolve()/'chosen';repo.mkdir();adapter=P._coding_mission_hand()
   first=adapter.WorkflowMissionHandle(h).start_workflow(REQUEST)['mission_id']
   second=adapter.WorkflowMissionHandle(h).start_workflow(REQUEST+' Use another saved source.')['mission_id']
   self.assertIsNone(P._workflow_followup_route(
    f'Do not use folder "{repo}" on branch jarvis/fix.',h))
   self.assertIsNone(P._workflow_followup_route(
    f'For workflow {first}, use the project folder {repo} on isolated branch jarvis/workflow-{second}.',h))
   denied=(f'For workflow {first}, use the project folder {repo} on isolated branch jarvis/fix. '
           'Do not bind it yet; this is only an example.')
   self.assertIsNone(P._workflow_followup_route(denied,h))
   self.assertFalse(adapter._owner_path_matches(denied,repo))
   self.assertFalse((adapter.mission_path(h,first)/'binding.json').exists())
 def test_exact_orb_approval_routes_and_writes_bound_receipt(self):
  with tempfile.TemporaryDirectory() as d:
   h=Path(d)/'hive';repo=Path(d).resolve()/'chosen';repo.mkdir()
   adapter=P._coding_mission_hand();handle=adapter.WorkflowMissionHandle(h);task=handle.start_workflow(REQUEST)
   branch='jarvis/workflow-'+task['mission_id']
   permissions=adapter._load('agent_stack_permissions',adapter.STACK/'hands'/'permissions.py')
   with mock.patch.object(permissions,'decide',return_value='confirm'):
    handle.bind_project(task['mission_id'],str(repo),branch,f'Use project folder {repo} on isolated branch {branch}.')
   utterance=f'Approve workflow edits for {repo} on branch {branch}.'
   pick=P._workflow_followup_route(utterance,h)
   self.assertEqual(pick['args'],{'action':'research_build_approve','mission_id':task['mission_id']})
   got=P._run_tool_inner(pick,utterance,hive=h,retrieve_roots=[])
   receipt=adapter.read_json(adapter.mission_path(h,task['mission_id'])/'owner_approval.json')
   self.assertEqual(got['status'],'WAITING_SOURCE')
   self.assertEqual(receipt['target'],str(repo));self.assertEqual(receipt['branch'],branch)
 def test_unasked_model_binding_cannot_attach_guessed_project(self):
  with tempfile.TemporaryDirectory() as d:
   h=Path(d);adapter=P._coding_mission_hand();initial=adapter.WorkflowMissionHandle(h).start_workflow(REQUEST)
   got=P._run_tool_inner({'tool':'agent_tools','args':{'action':'research_build_bind','repo':'/wrong'}},'Tell me about my project',hive=h,retrieve_roots=[])
   self.assertFalse(got['ok']);self.assertFalse((adapter.mission_path(h,initial['mission_id'])/'binding.json').exists())
 def test_stop_then_actual_owner_continuation_retains_same_task(self):
  with tempfile.TemporaryDirectory() as d:
   h=Path(d);adapter=P._coding_mission_hand();handle=adapter.WorkflowMissionHandle(h);initial=handle.start_workflow(REQUEST)
   handle.cancel(initial['mission_id']);g=P.begin_turn(h)
   got=P._run_tool_inner({'tool':'agent_tools','args':{'action':'research_build_continue','mission_id':'f'*32}},'Continue the workflow',hive=h,gen=g,retrieve_roots=[])
   self.assertEqual(got['mission_id'],initial['mission_id']);self.assertEqual(got['status'],'WAITING_PROJECT');self.assertEqual(got['objective'],REQUEST)
   self.assertFalse(got['task_verified'])
 def test_owner_style_saved_video_description_finds_latest_workflow(self):
  with tempfile.TemporaryDirectory() as d:
   h=Path(d);adapter=P._coding_mission_hand();task=adapter.WorkflowMissionHandle(h).start_workflow(REQUEST)
   status=P._workflow_followup_route("What's the status of my saved-video build?",h)
   resume=P._workflow_followup_route('Continue my saved-video build.',h)
   self.assertEqual(status['args'],{'action':'research_build_status','mission_id':task['mission_id']})
   self.assertEqual(resume['args'],{'action':'research_build_continue','mission_id':task['mission_id']})
 def test_owner_style_description_does_not_hijack_related_requests(self):
  with tempfile.TemporaryDirectory() as d:
   h=Path(d);adapter=P._coding_mission_hand();adapter.WorkflowMissionHandle(h).start_workflow(REQUEST)
   for utterance in (
    'Create a status dashboard for my saved-video build.',
    'Explain how a progress indicator for a saved-video build should work.',
    'Continue my video.',
    'Build a saved-video player.',
   ):
    with self.subTest(utterance=utterance):
     self.assertIsNone(P._workflow_followup_route(utterance,h))
if __name__=='__main__':unittest.main()
