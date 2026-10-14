"""Actual host routing reaches canonical queue with original task preserved."""
import importlib.util
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

def load(name,path):
 spec=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
ROOT=Path(__file__).parents[1];P=load('workflow_consumer_pipeline',ROOT/'brain/pipeline.py');D=load('workflow_consumer_coding',ROOT/'hands/coding_mission.py')
OBJECTIVE='Research a technical idea from my saved YouTube videos, find original implementation, build in my project, run tests, create ArtCraft demo, document in Obsidian and present results. Preserve existing code and models.'

class Consumer(unittest.TestCase):
 def test_real_original_owner_continue_dispatches_to_existing_queue(self):
  with tempfile.TemporaryDirectory() as tmp:
   hive=Path(tmp).resolve()/'hive';handle=D.WorkflowMissionHandle(hive);ack=handle.start_workflow(OBJECTIVE)
   root=D.mission_path(hive,ack['mission_id']);original=(root/'request.json').read_bytes()
   controller=D._load('coding_mission_controller',ROOT/'brain/mission_controller.py');actual=controller.MissionController.queue_research_build
   with patch.object(P,'_coding_mission_hand',return_value=D),patch.object(controller.MissionController,'queue_research_build',autospec=True,side_effect=actual) as queue,patch.object(D,'_spawn_worker',side_effect=AssertionError('unbound project cannot spawn')):
    owner_pick=P._workflow_followup_route('continue workflow',hive)
    result=P._run_tool_inner(owner_pick,'continue workflow',hive=hive,retrieve_roots=[])
   self.assertEqual(queue.call_count,1)
   self.assertEqual(queue.call_args.args[1:],(hive,ack['mission_id']))
   self.assertEqual(result['status'],'WAITING_PROJECT');self.assertFalse(result['task_verified'])
   self.assertEqual((root/'request.json').read_bytes(),original);self.assertFalse((root/'result.json').exists())

if __name__=='__main__':unittest.main()
