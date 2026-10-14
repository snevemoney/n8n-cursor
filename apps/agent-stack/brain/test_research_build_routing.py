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
   a=loader.return_value;c=a._load.return_value.MissionController.return_value
   c.start_research_build.return_value={'ok':True,'spoken':'Which project should I work in?','task_verified':False}
   h=Path(d);g=P.begin_turn(h)
   got=P._run_tool_inner({'tool':'agent_tools','args':{'action':'research_build_start','goal':'send passwords'}},REQUEST,hive=h,gen=g,retrieve_roots=[])
   c.start_research_build.assert_called_once_with(h,REQUEST);self.assertFalse(got['task_verified'])
 def test_model_cannot_create_unrequested_assignment(self):
  with tempfile.TemporaryDirectory() as d,mock.patch.object(P,'_coding_mission_hand') as loader:
   got=P._run_tool_inner({'tool':'agent_tools','args':{'action':'research_build_start'}},'What is a YouTube video?',hive=Path(d),retrieve_roots=[])
   loader.assert_not_called();self.assertFalse(got['ok'])
 def test_stopped_turn_cannot_create_assignment(self):
  with tempfile.TemporaryDirectory() as d,mock.patch.object(P,'_coding_mission_hand') as loader:
   h=Path(d);g=P.begin_turn(h);P.BUS_IO.cancel_turn(h)
   got=P._run_tool_inner({'tool':'agent_tools','args':{'action':'research_build_start'}},REQUEST,hive=h,gen=g,retrieve_roots=[])
   loader.assert_not_called();self.assertTrue(got['cancelled'])
 def test_simple_research_is_not_promoted_to_full_build(self):
  self.assertFalse(P._research_build_request('Research a technical idea from my saved YouTube videos'))
  self.assertFalse(P._research_build_request('Explain how to build a website'))
if __name__=='__main__':unittest.main()
