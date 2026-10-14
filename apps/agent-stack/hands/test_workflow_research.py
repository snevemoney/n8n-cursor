import importlib.util
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
            selected=result['selected'];self.assertEqual(selected['original_implementation_url'],'https://github.com/owner/repository')
            self.assertFalse(selected['implementation_verified']);self.assertTrue(selected['source_text_is_untrusted_data'])
            self.assertFalse(result['coverage']['full_corpus_scanned']);self.assertEqual(result['coverage']['readable_records'],1)
            self.assertEqual(reading.call_count,1);self.assertEqual(retrieval.call_count,3)
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
            self.assertEqual(result['selected']['implementation_source'],'existing_web_search_candidate')
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

if __name__=='__main__':unittest.main()
