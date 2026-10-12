import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest import mock
from concurrent.futures import ThreadPoolExecutor

STACK=Path(__file__).resolve().parents[1]
def load(name,path):
    spec=importlib.util.spec_from_file_location(name,path);mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod);return mod
PIPE=load('pipeline_browser_mission_test',STACK/'brain/pipeline.py')

class BrowserMissionOwnership(unittest.TestCase):
    def test_unrequested_work_cannot_start(self):
        with tempfile.TemporaryDirectory() as tmp, mock.patch.object(PIPE,'browser_runtime') as runtime:
            out=PIPE.run_tool({'tool':'browser_mission','args':{'action':'start'}},'Hello',hive=Path(tmp),retrieve_roots=[])
            self.assertFalse(out['ok']);runtime.assert_not_called()

    def test_explicit_browser_request_overrides_prior_prose_failure(self):
        with tempfile.TemporaryDirectory() as tmp, mock.patch.object(PIPE,'browser_runtime') as runtime:
            runtime.return_value.pipeline_tool.return_value={'ok':True,'tool':'browser_mission','mission_id':'c'*32,'spoken':'Research started.','task_verified':False,'wires':['browser_mission'],'cites':[]}
            out=PIPE.apply_pipeline('Research example.com in a browser mission',hive=Path(tmp),retrieve_roots=[],
                talk_fn=lambda *a,**k:{'spoken':'A prior mission failed.','wire':'openrouter','engine':'openrouter'})
            self.assertEqual(out['mission_id'],'c'*32)
            self.assertEqual(out['spoken'],'Research started.')

    def test_explicit_start_bypasses_conversation_model_and_keeps_receipt(self):
        with tempfile.TemporaryDirectory() as tmp, mock.patch.object(PIPE,'browser_runtime') as runtime:
            runtime.return_value.pipeline_tool.return_value={'ok':True,'tool':'browser_mission','mission_id':'d'*32,'spoken':'Research started.','task_verified':False,'wires':['browser_mission'],'cites':[]}
            talk=mock.Mock(side_effect=AssertionError('Explicit start must not wait for conversation model'))
            out=PIPE.apply_pipeline('Research three public sites as a browser mission',hive=Path(tmp),retrieve_roots=[],talk_fn=talk)
            self.assertEqual(out['mission_id'],'d'*32);self.assertFalse(out['task_verified']);talk.assert_not_called()
            self.assertEqual(out['brain'],'browser_runtime')

    def test_start_receipt_is_not_verified_success(self):
        with tempfile.TemporaryDirectory() as tmp, mock.patch.object(PIPE,'browser_runtime') as runtime:
            runtime.return_value.pipeline_tool.return_value={'ok':True,'tool':'browser_mission','mission_id':'a'*32,'spoken':'Research started.','task_verified':False,'wires':['browser_mission'],'cites':[]}
            out=PIPE.apply_pipeline('Compare monthly pricing across these websites',hive=Path(tmp),retrieve_roots=[],
                talk_fn=lambda *a,**k:{'tool':'browser_mission','args':{'action':'start'},'wire':'openrouter','engine':'openrouter'})
            self.assertEqual(out['tool'],'browser_mission');self.assertFalse(out['task_verified']);self.assertEqual(out['mission_id'],'a'*32)

    def test_browser_progress_bypasses_model_and_does_not_start_work(self):
        with tempfile.TemporaryDirectory() as tmp, mock.patch.object(PIPE,'browser_runtime') as runtime:
            runtime.return_value.pipeline_tool.return_value={'ok':True,'spoken':'1 of 3 browser flows are verified. The mission is running.','mission_id':'a'*32,'task_verified':False,'evidence':{'status':'RUNNING'}}
            talk=mock.Mock(side_effect=AssertionError('Progress must not call a model'))
            out=PIPE.apply_pipeline('How many browser research flows have finished?',hive=Path(tmp),retrieve_roots=[],talk_fn=talk)
            self.assertEqual(out['tool'],'browser_mission');self.assertEqual(out['args'],{'action':'status'})
            self.assertFalse(out['task_verified']);talk.assert_not_called()
            self.assertEqual(out['brain'],'browser_runtime');self.assertEqual(out['source'],'mission_state');self.assertEqual(out['outcome'],PIPE.TOOL_LOOP)
            self.assertEqual(runtime.return_value.pipeline_tool.call_args.args[0],{'action':'status'})

    def test_general_conversation_does_not_use_browser_status(self):
        with tempfile.TemporaryDirectory() as tmp, mock.patch.object(PIPE,'browser_runtime') as runtime:
            out=PIPE.apply_pipeline('What is two plus two?',hive=Path(tmp),retrieve_roots=[],talk_fn=lambda *a,**k:{'spoken':'Two plus two equals four.','wire':'openrouter','engine':'openrouter'})
            runtime.assert_not_called();self.assertNotEqual(out['tool'],'browser_mission')

    def put_result(self,hive):
        root=hive/'browser-missions'/('a'*32);root.mkdir(parents=True)
        (root/'result.json').write_text(json.dumps({'mission_id':'a'*32,'terminal_commit_id':'one','spoken':'Three sites are verified.','verified':True}))
        (root/'request.json').write_text(json.dumps({'objective':'Compare three sites'}))
        (hive/'bus').mkdir();(hive/'bus/state.json').write_text(json.dumps({'turn_gen':4,'phase':'speak','job_status':'done','terminal_response_gen':4,'spoken':'Earlier reply'}))

    def test_completion_uses_one_fresh_canonical_generation(self):
        with tempfile.TemporaryDirectory() as tmp:
            hive=Path(tmp);self.put_result(hive)
            with ThreadPoolExecutor(max_workers=8) as workers:
                results=list(workers.map(lambda _:PIPE.deliver_browser_missions(hive),range(8)))
            bus=PIPE.load_json(hive/'bus/state.json')
            self.assertEqual(sum(x is not None for x in results),1)
            self.assertEqual(bus['turn_gen'],5);self.assertEqual(bus['terminal_response_gen'],5)
            self.assertEqual(len(bus['mission_terminal_commits']),1)
            self.assertIsNone(PIPE.deliver_browser_missions(hive))

    def test_completion_does_not_interrupt_active_conversation(self):
        with tempfile.TemporaryDirectory() as tmp:
            hive=Path(tmp);self.put_result(hive)
            PIPE.BUS_IO.mutate_bus(hive,lambda b:b|{'job_status':'working','phase':'think'})
            self.assertIsNone(PIPE.deliver_browser_missions(hive))
            self.assertEqual(PIPE.peek_gen(hive),4)

class BrowserCompletionQueue(BrowserMissionOwnership):
    def test_queue_waits_for_matching_ack_and_preserves_payload(self):
        with tempfile.TemporaryDirectory() as tmp:
            hive=Path(tmp);self.put_result(hive)
            PIPE.deliver_browser_missions(hive)
            root=hive/'browser-missions'/('b'*32);root.mkdir()
            (root/'result.json').write_text(json.dumps({'mission_id':'b'*32,'terminal_commit_id':'two','spoken':'Second verified result.','verified':True}))
            self.assertIsNone(PIPE.deliver_browser_missions(hive))
            PIPE.BUS_IO.mutate_bus(hive,lambda b:b|{'turn_gen':6,'spoken':'Unrelated conversation reply'})
            pending=PIPE.load_json(hive/'bus/state.json')['mission_delivery_pending']
            self.assertEqual(pending['spoken'],'Three sites are verified.')
            PIPE.BUS_IO.acknowledge_mission_response(hive,'a'*32,4)
            self.assertIsNone(PIPE.deliver_browser_missions(hive))
            PIPE.BUS_IO.acknowledge_mission_response(hive,'a'*32,5)
            out=PIPE.deliver_browser_missions(hive)
            self.assertEqual(out['turn_gen'],7);self.assertEqual(out['spoken'],'Second verified result.')

    def test_literal_stop_cancels_active_browser_worker(self):
        with tempfile.TemporaryDirectory() as tmp:
            hive=Path(tmp);self.put_result(hive)
            root=hive/'browser-missions'/('b'*32);root.mkdir()
            (root/'request.json').write_text('{}')
            (root/'control.json').write_text('{}')
            PIPE.cancel_turn(hive)
            self.assertTrue(PIPE.load_json(root/'control.json')['cancel'])
            self.assertEqual(PIPE.load_json(hive/'browser-missions'/('a'*32)/'result.json')['terminal_commit_id'],'one')

if __name__=='__main__':unittest.main()
