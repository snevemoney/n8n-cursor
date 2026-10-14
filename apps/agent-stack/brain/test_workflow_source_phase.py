from pathlib import Path
import tempfile,unittest
from unittest import mock
from brain import pipeline as P
from brain.mission_controller import MissionController
from brain.test_research_build_routing import REQUEST
class WorkflowSourcePhase(unittest.TestCase):
 def test_actual_saved_record_is_researched_and_checkpointed_without_clearing_edit_gate(self):
  with tempfile.TemporaryDirectory() as d:
   h=Path(d)/'hive';source=Path(d).resolve()/'sources';source.mkdir();file=source/'saved-video.md'
   text='Saved YouTube: https://www.youtube.com/watch?v=abcdefghijk\nOriginal implementation: https://github.com/example/memory-agent\nThe Python agent uses browser observations and persistent memory checkpoints.'
   file.write_text(text);adapter=P._coding_mission_hand();handle=adapter.WorkflowMissionHandle(h);task=handle.start_workflow(REQUEST)
   adapter.write_json(adapter.mission_path(h,task['mission_id'])/'state.json',dict(task,status='WAITING_APPROVAL'))
   retrieve=mock.Mock(return_value={'hits':[{'abs':str(file)}]});read=lambda path,cap:(path.read_text()[:cap],None)
   got=MissionController(adapter).research_saved_sources(h,task['mission_id'],roots=[source],retrieve_fn=retrieve,read_fn=read,active_fn=lambda:True)
   root=adapter.mission_path(h,task['mission_id']);proof=adapter.read_json(root/'source_research.json')
   self.assertEqual(retrieve.call_count,3);self.assertEqual(proof['selected']['original_implementation_url'],'https://github.com/example/memory-agent')
   self.assertEqual(got['status'],'WAITING_APPROVAL');self.assertFalse(got['task_verified']);self.assertEqual(got['objective'],REQUEST)
   self.assertEqual(adapter.read_json(root/'checkpoint.json')['phase'],'source_research');self.assertFalse((root/'result.json').exists())
 def test_stop_during_retrieval_cannot_store_candidate_or_clear_original_task(self):
  with tempfile.TemporaryDirectory() as d:
   h=Path(d);source=h/'sources';source.mkdir();adapter=P._coding_mission_hand();handle=adapter.WorkflowMissionHandle(h);task=handle.start_workflow(REQUEST)
   root=adapter.mission_path(h,task['mission_id']);original=(root/'request.json').read_bytes()
   def retrieve(*a,**kw):
    handle.cancel(task['mission_id']);return {'hits':[]}
   got=MissionController(adapter).research_saved_sources(h,task['mission_id'],roots=[source],retrieve_fn=retrieve,read_fn=lambda *a:('',None),active_fn=lambda:True)
   self.assertEqual(got['status'],'CANCELLED');self.assertFalse((root/'source_research.json').exists());self.assertEqual((root/'request.json').read_bytes(),original)
class WorkflowSourceBinding(unittest.TestCase):
 def test_explicit_packet_is_bound_only_inside_current_job_or_existing_source_roots(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d).resolve();job=root/'job'/'work';project=job/'project';project.mkdir(parents=True);packet=job/'source packet';packet.mkdir()
   h=root/'hive';adapter=P._coding_mission_hand();handle=adapter.WorkflowMissionHandle(h);task=handle.start_workflow(REQUEST)
   handle.bind_project(task['mission_id'],str(project),'jarvis/source','Use "'+str(project)+'"')
   mc=MissionController(adapter);mc.bind_saved_source_root(h,task['mission_id'],str(packet),'Use saved sources "'+str(packet)+'"',default_roots=[])
   receipt=adapter.read_json(adapter.mission_path(h,task['mission_id'])/'source_roots.json')
   self.assertEqual(receipt['roots'],[str(packet)]);self.assertFalse(receipt['global_read_roots_changed'])
   outside=root/'other';outside.mkdir()
   with self.assertRaises(ValueError):mc.bind_saved_source_root(h,task['mission_id'],str(outside),'Use saved sources "'+str(outside)+'"',default_roots=[])
   with self.assertRaises(ValueError):mc.bind_saved_source_root(h,task['mission_id'],str(packet),'Use saved sources "'+str(packet)+'-other"',default_roots=[])
if __name__=='__main__':unittest.main()
