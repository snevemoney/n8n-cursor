"""Coding workers share conversation-safe terminal ownership with browser workers."""
import json
from pathlib import Path
import tempfile
import unittest
from unittest import mock
from concurrent.futures import ThreadPoolExecutor
from brain import pipeline as P

class CodingDelivery(unittest.TestCase):
    def result(self, hive, mid='c'*32, **kw):
        root=hive/'coding-missions'/mid;root.mkdir(parents=True)
        (root/'result.json').write_text(json.dumps(dict(mission_id=mid,terminal_commit_id='one',spoken='Files and local commit are ready. Independent acceptance remains pending.',status='COMPLETED',verified=False,builder_verified=True,**kw)))
        (root/'request.json').write_text(json.dumps({'objective':'Build a scratch task'}))
        return root

    def test_newer_conversation_is_preserved_until_idle(self):
        with tempfile.TemporaryDirectory() as d:
            h=Path(d);self.result(h);g=P.begin_turn(h)
            P.BUS_IO.mutate_bus(h,lambda b:dict(b,job_status='working',phase='think'))
            self.assertIsNone(P.deliver_browser_missions(h))
            P.BUS_IO.commit_response(h,g,lambda b:dict(b,spoken='Conversation reply',phase='speak',job_status='done'),terminal=True)
            out=P.deliver_browser_missions(h)
            self.assertEqual(out['turn_gen'],g+1);self.assertEqual(out['tool'],'agent_tools')
            self.assertFalse(out['task_verified']);self.assertTrue(out['response_ok']);self.assertEqual(out['coding_mission_id'],'c'*32)
            self.assertEqual(out['mission_delivery_pending']['mission_id'],'c'*32)

    def test_single_delivery_and_ack(self):
        with tempfile.TemporaryDirectory() as d:
            h=Path(d);self.result(h)
            with ThreadPoolExecutor(max_workers=6) as workers:
                rows=list(workers.map(lambda _:P.deliver_browser_missions(h),range(6)))
            self.assertEqual(sum(r is not None for r in rows),1)
            out=next(r for r in rows if r);self.assertIsNone(P.deliver_browser_missions(h))
            P.BUS_IO.acknowledge_mission_response(h,'c'*32,out['turn_gen'])
            self.assertIsNone(P.deliver_browser_missions(h))

    def test_builder_cannot_promote_to_verified(self):
        with tempfile.TemporaryDirectory() as d:
            h=Path(d);root=self.result(h)
            data=json.loads((root/'result.json').read_text());data['verified']=True
            (root/'result.json').write_text(json.dumps(data))
            out=P.deliver_browser_missions(h);self.assertFalse(out['task_verified'])

    def test_explicit_code_uses_original_user_args_and_is_immediate(self):
        with tempfile.TemporaryDirectory() as d, mock.patch.object(P,'_coding_mission_hand') as adapter:
            h=Path(d);g=P.begin_turn(h)
            adapter.return_value.CodingMissionHandle.return_value.start.return_value={'ok':True,'tool':'agent_tools','mission_id':'d'*32,'task_verified':False,'spoken':'Started.'}
            out=P._run_tool_inner({'tool':'agent_tools','args':{'op':'code','repo':'other','goal':'other'}},
                'In scratch repo receipt-proof: implement total.py and test it',hive=h,retrieve_roots=[],gen=g)
            call=adapter.return_value.CodingMissionHandle.return_value.start.call_args
            self.assertEqual(call.args[0]['repo'],'receipt-proof');self.assertIn('total.py',call.args[0]['goal'])
            self.assertEqual(out['mission_id'],'d'*32);self.assertFalse(out['task_verified'])

    def test_cancelled_turn_never_starts_worker(self):
        with tempfile.TemporaryDirectory() as d, mock.patch.object(P,'_coding_mission_hand') as adapter:
            h=Path(d);g=P.begin_turn(h);P.BUS_IO.cancel_turn(h)
            out=P._run_tool_inner({'tool':'agent_tools','args':{}},'In scratch repo never-start: implement a function',hive=h,retrieve_roots=[],gen=g)
            self.assertTrue(out['cancelled']);adapter.assert_not_called()

    def test_status_never_calls_model_or_starts_work(self):
        with tempfile.TemporaryDirectory() as d, mock.patch.object(P,'_coding_mission_hand') as adapter:
            # only a coding task exists; a blanket mock also invented a workflow, which owns status first
            adapter.return_value.read_json.side_effect=lambda p:{'mission_id':'e'*32} if 'coding-missions' in str(p) and str(p).endswith('latest.json') else {}
            adapter.return_value.CodingMissionHandle.return_value.status.return_value={'status':'RUNNING'}
            adapter.return_value.progress_line.return_value='Coding task is running.'
            talk=mock.Mock(side_effect=AssertionError('Status must not call a model'))
            out=P.apply_pipeline('Show coding task status',hive=Path(d),retrieve_roots=[],talk_fn=talk)
            self.assertEqual(out['tool'],'agent_tools');talk.assert_not_called()
            adapter.return_value.CodingMissionHandle.return_value.start.assert_not_called()
            self.assertIn('running',out['spoken'])

if __name__=='__main__': unittest.main()
