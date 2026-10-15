import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

PATH=Path(__file__).with_name('coding_mission.py')
spec=importlib.util.spec_from_file_location('workflow_intake_test',PATH)
M=importlib.util.module_from_spec(spec);spec.loader.exec_module(M)
OBJECTIVE='Research a technical idea from my saved YouTube videos, find the original implementation, build a working version in my project, run the tests, fix the failures, create a professional demonstration using ArtCraft, document the implementation in Obsidian, and present the finished results. Preserve my existing code and models'

class WorkflowIntakeTests(unittest.TestCase):
    def test_original_request_is_immutable_unverified_and_recovers_after_restart(self):
        with tempfile.TemporaryDirectory() as tmp, patch.object(M,'_spawn_worker',side_effect=AssertionError('no worker')):
            hive=Path(tmp)/'hive';h=M.WorkflowMissionHandle(hive)
            ack=h.start_workflow(OBJECTIVE)
            self.assertEqual(ack['status'],'WAITING_PROJECT');self.assertFalse(ack['task_verified'])
            self.assertEqual(ack['objective'],OBJECTIVE);self.assertTrue(ack['goal_preserved']);self.assertEqual(ack['actions'],[])
            root=M.mission_path(hive,ack['mission_id']);original=(root/'request.json').read_bytes()
            recovered=M.WorkflowMissionHandle(hive).workflow_status(ack['mission_id'])
            self.assertEqual(recovered['objective'],OBJECTIVE);self.assertIn('exact folder path',recovered['question'])
            self.assertEqual((root/'request.json').read_bytes(),original)
            self.assertFalse((root/'result.json').exists());self.assertFalse((hive/'coding-missions'/'latest.json').exists())
            self.assertEqual(M.read_json(hive/'coding-missions'/'latest_workflow.json')['mission_id'],ack['mission_id'])

    def test_explicit_project_answer_binds_continuation_without_edits(self):
        with tempfile.TemporaryDirectory() as tmp:
            hive=Path(tmp)/'hive';repo=Path(tmp).resolve()/'repo';repo.mkdir();(repo/'existing.txt').write_text('preserve')
            h=M.WorkflowMissionHandle(hive);ack=h.start_workflow(OBJECTIVE);root=M.mission_path(hive,ack['mission_id']);old=(root/'request.json').read_bytes()
            perm=M._load('agent_stack_permissions',M.STACK/'hands'/'permissions.py')
            with patch.object(perm,'decide',return_value='allow'):
                result=h.bind_project(ack['mission_id'],str(repo),'jarvis/owned-test','Use '+str(repo))
            self.assertEqual(result['status'],'WAITING_SOURCE');self.assertFalse(result['task_verified'])
            self.assertEqual((root/'request.json').read_bytes(),old);self.assertEqual((repo/'existing.txt').read_text(),'preserve')
            self.assertFalse((repo/'.git').exists());self.assertEqual(M.read_json(root/'binding.json')['repo'],str(repo))

    def test_my_project_cannot_authorize_a_guessed_path(self):
        with tempfile.TemporaryDirectory() as tmp:
            repo=Path(tmp).resolve()/'repo';repo.mkdir();h=M.WorkflowMissionHandle(Path(tmp)/'hive');ack=h.start_workflow(OBJECTIVE)
            with self.assertRaises(ValueError):h.bind_project(ack['mission_id'],str(repo),'jarvis/test','my project')
            self.assertFalse((M.mission_path(h.hive,ack['mission_id'])/'binding.json').exists())

    def test_stop_and_explicit_continue_keep_goal_and_checkpoint(self):
        with tempfile.TemporaryDirectory() as tmp:
            hive=Path(tmp);h=M.WorkflowMissionHandle(hive);ack=h.start_workflow(OBJECTIVE)
            root=M.mission_path(hive,ack['mission_id']);before=(root/'request.json').read_bytes()
            self.assertIn(ack['mission_id'],M.CodingMissionHandle(hive).cancel_active())
            self.assertEqual(M.CodingMissionHandle(hive).status(ack['mission_id'])['status'],'CANCELLED')
            with self.assertRaises(ValueError):h.continue_workflow(ack['mission_id'],'sure')
            continued=h.continue_workflow(ack['mission_id'],'continue the workflow')
            self.assertEqual(continued['status'],'WAITING_PROJECT');self.assertEqual(continued['objective'],OBJECTIVE)
            self.assertEqual((root/'request.json').read_bytes(),before);self.assertFalse((root/'result.json').exists())

    def test_owner_style_description_is_explicit_continuation(self):
        with tempfile.TemporaryDirectory() as tmp:
            hive=Path(tmp);h=M.WorkflowMissionHandle(hive);ack=h.start_workflow(OBJECTIVE)
            h.cancel(ack['mission_id'])
            continued=h.continue_workflow(ack['mission_id'],'Continue my saved-video build.')
            self.assertEqual(continued['status'],'WAITING_PROJECT')
            self.assertEqual(continued['objective'],OBJECTIVE)

    def test_existing_permissions_and_isolation_are_not_bypassed(self):
        with tempfile.TemporaryDirectory() as tmp:
            repo=Path(tmp).resolve()/'repo';repo.mkdir();h=M.WorkflowMissionHandle(Path(tmp)/'hive');ack=h.start_workflow(OBJECTIVE)
            perm=M._load('agent_stack_permissions',M.STACK/'hands'/'permissions.py')
            with patch.object(perm,'decide',return_value='confirm'):
                row=h.bind_project(ack['mission_id'],str(repo),'main','Use '+str(repo))
            self.assertEqual(row['status'],'WAITING_APPROVAL');self.assertFalse(row['task_verified'])

    def test_neighbour_prefix_is_not_project_authority(self):
        with tempfile.TemporaryDirectory() as tmp:
            repo=Path(tmp).resolve()/'repo';repo.mkdir()
            other=repo.with_name('repo-other');other.mkdir()
            spaced=repo.with_name('repo other');spaced.mkdir()
            h=M.WorkflowMissionHandle(Path(tmp)/'hive');ack=h.start_workflow(OBJECTIVE)
            for answer in ('Use '+str(other),'Use '+str(spaced),'word'+str(repo)):
                with self.assertRaises(ValueError):h.bind_project(ack['mission_id'],str(repo),'jarvis/test',answer)
            self.assertFalse((M.mission_path(h.hive,ack['mission_id'])/'binding.json').exists())

    def test_quoted_spaces_and_tilde_are_exact_canonical_authority(self):
        with tempfile.TemporaryDirectory() as tmp:
            home=Path(tmp).resolve();repo=home/'repo space';repo.mkdir()
            self.assertTrue(M._owner_path_matches('Use "'+str(repo)+'"',repo))
            self.assertTrue(M._owner_path_matches('Use '+str(repo),repo))
            with patch('os.path.expanduser',side_effect=lambda value:str(home) if value=='~' else (str(home/value[2:]) if value.startswith('~/') else value)):
                self.assertTrue(M._owner_path_matches('Use "~/repo space"',repo))

    def test_identical_request_dedupes_and_never_resumes_cancelled(self):
        with tempfile.TemporaryDirectory() as tmp:
            h=M.WorkflowMissionHandle(Path(tmp));first=h.start_workflow(OBJECTIVE)
            original=(M.mission_path(h.hive,first['mission_id'])/'request.json').read_bytes()
            second=M.WorkflowMissionHandle(Path(tmp)).start_workflow(OBJECTIVE)
            self.assertEqual(first['mission_id'],second['mission_id'])
            h.cancel(first['mission_id'])
            third=h.start_workflow(OBJECTIVE)
            self.assertEqual(third['mission_id'],first['mission_id']);self.assertEqual(third['status'],'CANCELLED')
            self.assertEqual((M.mission_path(h.hive,first['mission_id'])/'request.json').read_bytes(),original)
            self.assertEqual(len([p for p in (Path(tmp)/'coding-missions').iterdir() if p.is_dir()]),1)

if __name__=='__main__':unittest.main()
