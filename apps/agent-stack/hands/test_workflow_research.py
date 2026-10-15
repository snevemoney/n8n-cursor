import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import Mock

spec=importlib.util.spec_from_file_location('workflow_research_test',Path(__file__).with_name('workflow_research.py'))
M=importlib.util.module_from_spec(spec);spec.loader.exec_module(M)
TEXT='# Agent memory method\nSaved video: https://www.youtube.com/watch?v=abcdefghijk\nOriginal repository: https://github.com/owner/repository\nImplementation: bounded memory retrieval using Python and provenance checks.\n'

class WorkflowResearchTests(unittest.TestCase):
    def run_fixture(self,root,text=TEXT,web=None,active=lambda:True,path=None):
        path=path or root/'source.md';path.write_text(text)
        retrieval=Mock(return_value={'hits':[{'abs':str(path)}],'unavailable':[]})
        reading=Mock(side_effect=lambda p,cap:(p.read_text()[:cap],None))
        result=M.run('research saved YouTube technical idea',retrieve_fn=retrieval,read_fn=reading,
                     roots=[root],web_fn=web,active_fn=active)
        return result,retrieval,reading
    def test_saved_record_is_selected_with_honest_provenance_not_execution(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp).resolve();result,retrieval,reading=self.run_fixture(root)
            self.assertTrue(result['ok']);self.assertEqual(result['status'],'SOURCE_CANDIDATE')
            self.assertFalse(result['task_verified']);self.assertEqual(result['actions'],[])
            selected=result['selected'];self.assertIsNone(selected['original_implementation_url'])
            self.assertEqual(selected['origin_candidates'][0]['url'],'https://github.com/owner/repository')
            self.assertFalse(selected['origin_association_verified'])
            self.assertFalse(selected['implementation_verified']);self.assertTrue(selected['source_text_is_untrusted_data'])
            self.assertFalse(result['coverage']['full_corpus_scanned']);self.assertEqual(result['coverage']['readable_records'],1)
            self.assertEqual(reading.call_count,2);self.assertEqual(retrieval.call_count,3)
            self.assertEqual(result['coverage']['metadata_records_read'],1)
    def test_arbitrary_model_path_and_secret_path_are_not_read(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp).resolve();allowed=root/'approved';allowed.mkdir()
            outside=root/'other.md';outside.write_text(TEXT)
            secret=allowed/'credentials.md';secret.write_text(TEXT)
            reader=Mock()
            result=M.run('goal',retrieve_fn=lambda *a,**k:{'hits':[{'abs':str(outside)},{'abs':str(secret)}]},
                         read_fn=reader,roots=[allowed],active_fn=lambda:True)
            self.assertFalse(result['ok']);reader.assert_not_called()
    def test_cloud_placeholder_and_empty_roots_are_honest(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp).resolve();path=root/'source.md';path.write_text(TEXT)
            result=M.run('goal',retrieve_fn=lambda *a,**k:{'hits':[{'abs':str(path)}]},
                         read_fn=lambda *a:(None,'cloud_placeholder'),roots=[root],active_fn=lambda:True)
            self.assertFalse(result['ok']);self.assertGreater(result['coverage']['unavailable_records'],0)
            retrieval=Mock();result=M.run('goal',retrieve_fn=retrieval,read_fn=Mock(),roots=[],active_fn=lambda:True)
            retrieval.assert_not_called();self.assertFalse(result['ok'])
    def test_one_existing_web_call_supplies_candidate_never_verified_fetch(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp).resolve();web=Mock(return_value={'cites':['https://github.com/original/memory']})
            result,_,_=self.run_fixture(root,TEXT.replace('https://github.com/owner/repository','no repository link'),web)
            self.assertTrue(result['ok']);web.assert_called_once();self.assertFalse(result['selected']['implementation_verified'])
            self.assertEqual(web.call_args.args[0]['query'],'https://www.youtube.com/watch?v=abcdefghijk original implementation github repository')
            self.assertIsNone(result['selected']['original_implementation_url'])
            self.assertEqual(result['selected']['origin_candidates'][0]['source'],'existing_web_search_candidate')
    def test_secret_and_financial_execution_methods_not_selected(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp).resolve()
            for extra in ('\npassword='+ 'A'*30,'\nA trading automation implementation.'):
                result,_,_=self.run_fixture(root,TEXT+extra)
                self.assertFalse(result['ok'])
    def test_cancel_after_read_never_searches_web(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp).resolve();path=root/'source.md';path.write_text(TEXT);flag=[True];web=Mock()
            def read(*a):flag[0]=False;return TEXT,None
            result=M.run('goal',retrieve_fn=lambda *a,**k:{'hits':[{'abs':str(path)}]},read_fn=read,
                         roots=[root],active_fn=lambda:flag[0],web_fn=web)
            self.assertEqual(result['status'],'CANCELLED');web.assert_not_called()
    def test_wrong_video_hosts_and_catalogue_are_not_primary_method(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp).resolve()
            wrong=TEXT.replace('www.youtube.com','www.youtube.com.evil.example')
            result,_,_=self.run_fixture(root,wrong);self.assertFalse(result['ok'])
            many=TEXT+'\n'.join('https://youtu.be/'+chr(65+i)*11 for i in range(4))
            result,_,_=self.run_fixture(root,many);self.assertFalse(result['ok'])

class RecoveredWatchRecords(unittest.TestCase):
 def test_actual_saved_watch_id_format_derives_canonical_url_with_explicit_provenance(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d).resolve();watch=root/'watch';watch.mkdir();file=watch/'abcdefghijk.md'
   text='# abcdefghijk — Saved personal assistant video\n## Method\nThe Python memory agent uses bounded browser observation checkpoints.\n'
   file.write_text(text)
   got=M.run('goal',retrieve_fn=lambda *a,**k:{'hits':[{'abs':str(file)}]},read_fn=lambda p,cap:(p.read_text(),None),roots=[root],active_fn=lambda:True)
   self.assertTrue(got['ok']);self.assertEqual(got['selected']['saved_youtube_url'],'https://www.youtube.com/watch?v=abcdefghijk')
   self.assertEqual(got['selected']['video_url_provenance'],'matching_saved_watch_record_id');self.assertFalse(got['selected']['implementation_verified'])
 def test_arbitrary_filename_or_mismatched_header_cannot_invent_video_provenance(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d).resolve();watch=root/'watch';watch.mkdir();file=watch/'abcdefghijk.md';file.write_text('# wrong-id\nPython memory agent implementation')
   got=M.run('goal',retrieve_fn=lambda *a,**k:{'hits':[{'abs':str(file)}]},read_fn=lambda p,cap:(p.read_text(),None),roots=[root],active_fn=lambda:True)
   self.assertFalse(got['ok'])
class ActualVaultPacketBridge(unittest.TestCase):
 def test_watch_later_videos_layout_is_discovered_without_content_index_hit(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d).resolve();videos=root/'videos';videos.mkdir();file=videos/'abcdefghijk.md'
   file.write_text('# abcdefghijk — saved assistant video\nThe Python agent harness uses memory checkpoints and browser observation.\n')
   got=M.run('goal',retrieve_fn=lambda *a,**k:{'hits':[]},read_fn=lambda p,cap:(p.read_text(),None),roots=[root],active_fn=lambda:True)
   self.assertTrue(got['ok']);self.assertEqual(got['selected']['source_record'],str(file))
   self.assertEqual(got['selected']['saved_youtube_url'],'https://www.youtube.com/watch?v=abcdefghijk')
   self.assertEqual(got['coverage']['discovered_records'],1)

 def test_real_content_only_vault_retriever_does_not_hide_explicit_watch_packet(self):
  from brain import pipeline as P
  with tempfile.TemporaryDirectory() as d:
   root=Path(d).resolve();watch=root/'watch';watch.mkdir();file=watch/'abcdefghijk.md'
   file.write_text('# abcdefghijk — saved technical video\nThe Python memory agent uses browser observation checkpoints.\n')
   self.assertEqual(P.RETRIEVE.candidate_files([root]),[])
   got=M.run('goal',retrieve_fn=P.RETRIEVE.search,read_fn=P.RETRIEVE.read_local_text,roots=[root],active_fn=lambda:True)
   self.assertTrue(got['ok']);self.assertEqual(got['selected']['source_record'],str(file));self.assertFalse(got['selected']['implementation_verified'])

class RelevanceAndPrimaryOrigin(unittest.TestCase):
 def context(self):
  return {'verified':True,'source':'owner_project_binding','name':'Jarvis',
          'summary':'Private desktop assistant and agent execution harness',
          'capabilities':['coding','memory retrieval','browser observation','checkpoint recovery']}
 def run_records(self,root,objective,context=None,web=None,primary=None):
  reads=[]
  def read(path,cap):
   reads.append((path.name,cap));return path.read_text()[:cap],None
  got=M.run(objective,retrieve_fn=lambda *a,**k:{'hits':[]},read_fn=read,roots=[root],
            active_fn=lambda:True,project_context=context,web_fn=web,primary_metadata_fn=primary)
  return got,reads
 def record(self,watch,ident,title,body):
  path=watch/(ident+'.md');path.write_text('# '+ident+' — '+title+'\n'+body+'\n');return path
 def test_project_relevance_beats_verbose_google_sheets_and_unrelated_search_repo(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d).resolve();watch=root/'watch';watch.mkdir()
   self.record(watch,'aaaaaaaaaaa','Enrich company data in Google Sheets with Explorium MCP',
               'Jarvis relevance: low (n8n tutorial, no Jarvis).\n'+('agent MCP automation workflow implementation repository Python '*20))
   expected=self.record(watch,'zzzzzzzzzzz','Agent execution harness',
                        'Memory retrieval, browser observation and checkpoint recovery for a private desktop assistant using Python.')
   got,_=self.run_records(root,'Research a technical idea from my saved YouTube videos and build it in my project',
                          self.context(),web=lambda *a:{'cites':['https://github.com/gordicaleksa/pytorch-original-transformer']})
   self.assertEqual(got['selected']['source_record'],str(expected))
   self.assertTrue(got['selected']['relevance']['project_context_verified'])
   self.assertIn('continuity',got['selected']['relevance']['matched_topics'])
   self.assertIsNone(got['selected']['original_implementation_url'])
   self.assertFalse(got['selected']['origin_association_verified'])
   self.assertNotIn('https://github.com/gordicaleksa/pytorch-original-transformer',got['cites'])
   self.assertEqual(got['selected']['origin_candidates'][0]['source'],'existing_web_search_candidate')
 def test_metadata_ranking_finds_relevant_record_after_first_twelve(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d).resolve();watch=root/'watch';watch.mkdir()
   for number in range(20):
    self.record(watch,format(number,'011d'),'Spreadsheet row enrichment',
                'Google Sheets MCP automation workflow loops one company row at a time.')
   expected=self.record(watch,'zzzzzzzzzzz','Assistant checkpoint continuity',
                        'The Python agent harness preserves memory and browser observation across interruption and recovery.')
   got,reads=self.run_records(root,'Research a saved YouTube technical idea',self.context())
   self.assertEqual(got['selected']['source_record'],str(expected))
   self.assertEqual(got['coverage']['metadata_records_read'],21)
   self.assertEqual(got['coverage']['readable_records'],M.MAX_RECORDS)
   self.assertIn(('zzzzzzzzzzz.md',M.MAX_READ),reads)
   self.assertFalse(got['coverage']['full_corpus_scanned'])
   self.assertFalse(got['coverage']['full_video_audio_frames_reviewed'])
 def test_retained_objective_can_prefer_spreadsheet_project_without_forcing_jarvis(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d).resolve();watch=root/'watch';watch.mkdir()
   expected=self.record(watch,'aaaaaaaaaaa','Spreadsheet enrichment','Google Sheets spreadsheet automation loops row enrichment using Python.')
   self.record(watch,'zzzzzzzzzzz','Agent memory','Python agent memory browser checkpoint recovery.')
   got,_=self.run_records(root,'Research a spreadsheet row enrichment implementation from my saved YouTube videos')
   self.assertEqual(got['selected']['source_record'],str(expected))
   self.assertFalse(got['selected']['relevance']['project_context_verified'])
 def test_unverified_project_context_does_not_override_retained_objective(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d).resolve();watch=root/'watch';watch.mkdir()
   self.record(watch,'aaaaaaaaaaa','Spreadsheet','Google Sheets spreadsheet Python automation.')
   expected=self.record(watch,'zzzzzzzzzzz','Agent memory','Python agent memory browser checkpoint recovery.')
   got,_=self.run_records(root,'Research agent memory checkpoint continuity',
                          {'verified':False,'source':'owner_project_binding','summary':'spreadsheet '*100})
   self.assertEqual(got['selected']['source_record'],str(expected))
 def metadata(self,description,ident='abcdefghijk'):
  return {'ok':True,'output':json.dumps({'id':ident,'title':'Agent memory','channel':'Author','description':description})}
 def test_only_matching_primary_publisher_code_reference_establishes_association(self):
  associated=M.associate_primary_origin('https://youtu.be/abcdefghijk',
       self.metadata('Sponsor: https://github.com/sponsor/unrelated\nSource code for this video:\nhttps://github.com/author/agent-memory'))
  self.assertTrue(associated['origin_association_verified'])
  self.assertEqual(associated['original_implementation_url'],'https://github.com/author/agent-memory')
  self.assertFalse(associated['implementation_verified'])
  self.assertEqual(associated['origin_status'],'PRIMARY_SOURCE_ASSOCIATED')
 def test_wrong_video_bare_links_and_multiple_explicit_repos_remain_unassociated(self):
  for payload in (self.metadata('Source code: https://github.com/author/repo','zzzzzzzzzzz'),
                  self.metadata('My website: https://github.com/author/repo'),
                  self.metadata('Source code: https://github.com/author/first\nSource code: https://github.com/author/second')):
   got=M.associate_primary_origin('https://youtu.be/abcdefghijk',payload)
   self.assertFalse(got['origin_association_verified']);self.assertIsNone(got['original_implementation_url'])
 def test_fixed_probe_and_existing_callback_do_not_claim_repository_or_execution(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d).resolve();watch=root/'watch';watch.mkdir()
   self.record(watch,'abcdefghijk','Agent memory','Python memory agent browser checkpoint implementation.')
   requests=[]
   def primary(probe):
    requests.append(probe);return self.metadata('Source code: https://github.com/author/agent-memory')
   got,_=self.run_records(root,'Research agent memory checkpoint',self.context(),primary=primary)
   self.assertEqual(len(requests),1);self.assertEqual(requests[0]['argv'][1:4],['--skip-download','--ignore-config','--no-playlist'])
   self.assertFalse(requests[0]['download']);self.assertNotIn('--cookies',requests[0]['argv'])
   self.assertTrue(got['selected']['origin_association_verified'])
   self.assertFalse(got['selected']['implementation_verified']);self.assertFalse(got['task_verified'])
   self.assertIn('reuse conditions still need verification',got['spoken'])
 def test_cancel_after_metadata_probe_preserves_no_false_association(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d).resolve();watch=root/'watch';watch.mkdir()
   self.record(watch,'abcdefghijk','Agent memory','Python agent memory checkpoint implementation.')
   flag=[True]
   def primary(probe):
    flag[0]=False;return self.metadata('Source code: https://github.com/author/agent-memory')
   got=M.run('agent memory',retrieve_fn=lambda *a,**k:{'hits':[]},
             read_fn=lambda p,cap:(p.read_text()[:cap],None),roots=[root],active_fn=lambda:flag[0],primary_metadata_fn=primary)
   self.assertEqual(got['status'],'CANCELLED');self.assertNotIn('selected',got)
if __name__=='__main__':unittest.main()
