"""Explicit coding recovery retains original authority and bypasses a prose model."""
from pathlib import Path
import tempfile
import unittest
from unittest import mock
from brain import pipeline as P

class CodingResumeRoute(unittest.TestCase):
    def adapter(self, patched):
        a=patched.return_value
        a.read_json.return_value={'mission_id':'c'*32}
        a.CodingMissionHandle.return_value.resume.return_value={'ok':True,'tool':'agent_tools','mission_id':'d'*32,'task_verified':False,'spoken':'Resuming the original coding task from its checkpoint.','wires':['coding_mission'],'cites':[],'sent':False}
        return a

    def test_latest_checkpoint_resume_is_actual_hand_without_model(self):
        for utterance in ('Resume coding task','Continue that coding task','Please resume the code mission.'):
            with self.subTest(utterance=utterance), tempfile.TemporaryDirectory() as d, mock.patch.object(P,'_coding_mission_hand') as patched:
                a=self.adapter(patched);talk=mock.Mock(side_effect=AssertionError('Recovery must not call a conversation model'))
                got=P.apply_pipeline(utterance,hive=Path(d),retrieve_roots=[],talk_fn=talk)
                a.CodingMissionHandle.return_value.resume.assert_called_once_with('c'*32)
                self.assertEqual(got['mission_id'],'d'*32);self.assertFalse(got['task_verified']);talk.assert_not_called()

    def test_utterance_id_wins_over_model_argument(self):
        with tempfile.TemporaryDirectory() as d, mock.patch.object(P,'_coding_mission_hand') as patched:
            a=self.adapter(patched)
            got=P._run_tool_inner({'tool':'agent_tools','args':{'action':'coding_resume','mission_id':'e'*32}},
                'Resume coding task '+('a'*32),hive=Path(d),retrieve_roots=[])
            a.CodingMissionHandle.return_value.resume.assert_called_once_with('a'*32)
            self.assertFalse(got['task_verified'])

    def test_model_resume_pick_cannot_start_unrequested_recovery(self):
        with tempfile.TemporaryDirectory() as d, mock.patch.object(P,'_coding_mission_hand') as patched:
            got=P._run_tool_inner({'tool':'agent_tools','args':{'action':'coding_resume','mission_id':'e'*32}},
                'Tell me about checkpoints',hive=Path(d),retrieve_roots=[])
            patched.assert_not_called();self.assertFalse(got['ok'])

    def test_resume_rejection_is_honest_not_a_started_task(self):
        with tempfile.TemporaryDirectory() as d, mock.patch.object(P,'_coding_mission_hand') as patched:
            a=self.adapter(patched);a.CodingMissionHandle.return_value.resume.side_effect=ValueError('checkpoint_repo_changed')
            got=P._run_tool_inner({'tool':'agent_tools','args':{'action':'coding_resume'}},
                'Resume coding task',hive=Path(d),retrieve_roots=[])
            self.assertFalse(got['ok']);self.assertFalse(got['task_verified']);self.assertIn('checkpoint_repo_changed',got['spoken'])

    def test_cancelled_conversation_cannot_spawn_resume(self):
        with tempfile.TemporaryDirectory() as d, mock.patch.object(P,'_coding_mission_hand') as patched:
            h=Path(d);g=P.begin_turn(h);P.BUS_IO.cancel_turn(h)
            got=P._run_tool_inner({'tool':'agent_tools','args':{'action':'coding_resume'}},
                'Resume coding task',hive=h,retrieve_roots=[],gen=g)
            patched.assert_not_called();self.assertTrue(got['cancelled'])

if __name__=='__main__':unittest.main()
