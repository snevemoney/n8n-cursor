"""Owner repository clarification follows real retained Git metadata, not model guesses."""
import importlib.util,json,tempfile,unittest
from pathlib import Path
from unittest import mock
from brain import pipeline as P
spec=importlib.util.spec_from_file_location('repo_fixture',P.STACK/'hands/test_workflow_repo_context.py');fixtures=importlib.util.module_from_spec(spec);spec.loader.exec_module(fixtures)
class RepositoryContextTests(unittest.TestCase):
 def test_alias_resolves_same_repository_and_runs_real_saved_source_phase(self):
  with tempfile.TemporaryDirectory() as tmp:
   h,root,primary,candidate,git,content=fixtures.RepoContextTests().fixture(tmp)
   (h/'coding-missions/latest_workflow.json').write_text(json.dumps({'mission_id':fixtures.ID}))
   watch=candidate/'watch';watch.mkdir();record=watch/'abcdefghijk.md';record.write_text('# abcdefghijk Jarvis persistent memory checkpoints\nPython agent implementation uses atomic checkpoint files and test recovery.\n')
   (root/'source_roots.json').write_text(json.dumps({'roots':[str(candidate)]}))
   before=(root/'request.json').read_bytes();binding=(root/'binding.json').read_bytes()
   retrieve=mock.Mock();retrieve.resolve_roots.return_value=[];retrieve.search.return_value={'hits':[]}
   retrieve.read_local_text.side_effect=lambda path,cap:(path.read_text()[:cap],None)
   with mock.patch.object(P,'RETRIEVE',retrieve),mock.patch.object(P._agent_tools_hand(),'op_cli',return_value={'ok':False,'output':''}),mock.patch.object(P,'_web_search_hand') as web:
    web.return_value.run.return_value={'cites':[{'url':'https://github.com/unrelated/transformer'}]}
    answer='project-alpha repo';pick=P._workflow_followup_route(answer,h)
    result=P._run_tool_inner(pick,answer,hive=h,retrieve_roots=[])
   context=json.loads((root/'repo_context.json').read_text());source=json.loads((root/'source_research.json').read_text())
   self.assertEqual(context['source_checkout'],str(primary));self.assertEqual(context['mutation_target'],str(candidate))
   self.assertEqual(source['selected']['saved_youtube_url'],'https://www.youtube.com/watch?v=abcdefghijk')
   self.assertIsNone(source['selected']['original_implementation_url']);self.assertFalse(result['task_verified'])
   self.assertEqual((root/'request.json').read_bytes(),before);self.assertEqual((root/'binding.json').read_bytes(),binding)
 def test_failed_hand_is_archived_as_failed_action(self):
  with tempfile.TemporaryDirectory() as tmp:
   h=Path(tmp).resolve()
   with mock.patch.object(P,'run_tool',return_value={'ok':False,'tool':'workspace_read','spoken':'File was not found.','wires':['workspace_read'],'cites':[],'sent':False,'task_verified':False}),mock.patch.object(P,'model_free_route',return_value={'tool':'workspace_read','args':{},'speak':''}):
    events=list(P.apply_pipeline_iter('Read absent.txt',hive=h,retrieve_roots=[]))
   wire=P.load_json(h/'bus/last-wire.json')
   self.assertEqual(wire['wire']['outcome'],'ACTION_FAILED');self.assertFalse(wire['ok'])
if __name__=='__main__':unittest.main()
