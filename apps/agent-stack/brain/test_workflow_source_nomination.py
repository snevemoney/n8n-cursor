"""Actual local read -> host source nomination; no public or model calls."""
import hashlib,importlib.util,json,tempfile,unittest
from pathlib import Path
from unittest.mock import patch

def load(name,path):
 spec=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
ROOT=Path(__file__).parents[1];P=load('nomination_pipeline',ROOT/'brain/pipeline.py');D=load('nomination_coding',ROOT/'hands/coding_mission.py');W=load('nomination_reader',ROOT/'hands/workspace_read.py')
OBJECTIVE='Research a technical idea from my saved YouTube videos, build a working implementation in my project, run tests, create ArtCraft demo and document it in Obsidian. Preserve existing code and models.'

class Nomination(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.root=Path(self.tmp.name).resolve();self.hive=self.root/'hive';self.folder=self.root/'watch';self.folder.mkdir()
  self.path=self.folder/'abcdefghijk.md';self.path.write_text('# abcdefghijk\nTechnical agent workflow implementation with checkpoint recovery.\nhttps://www.youtube.com/watch?v=abcdefghijk\nOriginal code: https://github.com/publisher/implementation\n')
  self.handle=D.WorkflowMissionHandle(self.hive);self.ack=self.handle.start_workflow(OBJECTIVE);self.ident=self.ack['mission_id'];self.task=D.mission_path(self.hive,self.ident)
  self.mc=D._load('coding_mission_controller',ROOT/'brain/mission_controller.py').MissionController(D)
  self.mc.bind_saved_source_root(self.hive,self.ident,str(self.folder),'Use '+str(self.folder),default_roots=[self.root])
  self.gen=9;P.BUS_IO.mutate_bus(self.hive,lambda b:{**b,'turn_gen':self.gen})
  self.ask=f'Inspect {self.path} for assignment {self.ident} and select its useful technical method.'
 def tearDown(self):self.tmp.cleanup()
 def read(self):
  with patch.object(P,'_coding_mission_hand',return_value=D),patch.object(P,'_workspace_read_hand',return_value=W),patch.object(W,'default_roots',return_value=[self.root]):
   result=P._run_tool_inner({'tool':'workspace_read','args':{'op':'read','path':str(self.path)}},self.ask,hive=self.hive,retrieve_roots=[self.root],gen=self.gen)
  self.assertTrue(result['ok']);self.assertTrue(result['document_context']['ok'])
 def nominate(self):return self.mc.nominate_saved_source(self.hive,self.ident,str(self.path),owner_utterance=self.ask,gen=self.gen)
 def test_real_read_replaces_candidate_preserves_history_and_never_invents_association(self):
  self.read();prior={'selected':{'saved_youtube_url':'previous-fixture'}};D.write_json(self.task/'source_research.json',prior)
  old=(self.task/'source_research.json').read_bytes();original=(self.task/'request.json').read_bytes();result=self.nominate()
  proof=D.read_json(self.task/'source_research.json');self.assertEqual(proof['selected']['source_record'],str(self.path));self.assertTrue(proof['selected']['source_record_verified'])
  self.assertFalse(proof['selected']['origin_association_verified']);self.assertIsNone(proof['selected']['original_implementation_url'])
  self.assertEqual(proof['read_request_sha256'],hashlib.sha256(self.ask.encode()).hexdigest());self.assertEqual(proof['request_sha256'],hashlib.sha256(original).hexdigest())
  self.assertEqual((self.task/'request.json').read_bytes(),original);self.assertEqual((self.task/'source-research-history'/(hashlib.sha256(old).hexdigest()+'.json')).read_bytes(),old)
  self.assertFalse(result['task_verified']);self.assertFalse((self.task/'original_implementation.json').exists())
 def test_unread_changed_cancelled_wrong_request_or_prepared_task_reject(self):
  with self.assertRaises(ValueError):self.nominate()
  self.read();originalask=self.ask;self.ask='Select a method';
  with self.assertRaises(ValueError):self.nominate()
  self.ask=originalask;self.path.write_text('changed technical agent workflow')
  with self.assertRaises(ValueError):self.nominate()
  self.read();P.BUS_IO.mutate_bus(self.hive,lambda b:{**b,'cancel_gen':self.gen})
  with self.assertRaises(ValueError):self.nominate()
  P.BUS_IO.mutate_bus(self.hive,lambda b:{**b,'cancel_gen':0});self.path.write_text('# abcdefghijk\nTechnical agent workflow implementation https://www.youtube.com/watch?v=abcdefghijk');self.read()
  D.write_json(self.task/'execution_contract.json',{})
  with self.assertRaises(ValueError):self.nominate()
 def test_actual_consumer_routes_nomination_but_model_flags_cannot_supply_proof(self):
  self.read();args={'action':'research_build_select_source','mission_id':self.ident,'source_record':str(self.path)}
  hd=P._agent_tools_hand()
  with patch.object(P,'_coding_mission_hand',return_value=D),patch.object(hd,'op_cli',return_value={'ok':False,'output':''}):
   result=P._run_tool_inner({'tool':'agent_tools','args':args},self.ask,hive=self.hive,retrieve_roots=[self.root],gen=self.gen)
   self.assertTrue(result['source_bound']);self.assertFalse(result['task_verified'])
   denied=P._run_tool_inner({'tool':'agent_tools','args':{**args,'origin_association_verified':True}},self.ask,hive=self.hive,retrieve_roots=[self.root],gen=self.gen)
  self.assertFalse(denied['ok']);self.assertFalse(D.read_json(self.task/'source_research.json')['selected']['origin_association_verified'])

if __name__=='__main__':unittest.main()
