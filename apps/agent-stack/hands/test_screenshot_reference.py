from pathlib import Path
import tempfile, unittest, subprocess
from unittest import mock
from hands import macos_read as M
from brain import pipeline as P

class SavedScreenshot(unittest.TestCase):
    def shot(self, home, name='Screenshot 2026-10-14.png'):
        folder=home/'Desktop';folder.mkdir(exist_ok=True);f=folder/name;f.write_bytes(b'\x89PNG\r\n\x1a\nfixture header');return f.resolve()
    def test_real_file_evidence_never_text_download(self):
        with tempfile.TemporaryDirectory() as d:
            home=Path(d);f=self.shot(home);(home/'Desktop/Screenshot newer.txt').write_text('not image')
            with mock.patch.object(M,'_run',return_value=subprocess.CompletedProcess([],0,'','')):
                got=M.latest_screenshot(home)
            self.assertEqual(got['artifact']['path'],str(f));self.assertEqual(got['artifact']['kind'],'saved_screenshot')
    def test_missing_and_symlink_are_not_invented(self):
        with tempfile.TemporaryDirectory() as d:
            home=Path(d);(home/'Desktop').mkdir();(home/'Desktop/Screenshot fake.png').symlink_to('/etc/hosts')
            with mock.patch.object(M,'_run',side_effect=OSError('index unavailable')):
                got=M.latest_screenshot(home)
            self.assertFalse(got['ok']);self.assertIsNone(got['artifact'])
    def test_changed_file_cannot_be_revealed(self):
        with tempfile.TemporaryDirectory() as d:
            home=Path(d);f=self.shot(home);receipt=M.screenshot_fingerprint(f,home);f.write_bytes(f.read_bytes()+b'changed')
            with mock.patch.object(M,'_run') as run: got=M.reveal_screenshot(receipt,home)
            self.assertFalse(got['ok']);run.assert_not_called()
    def test_launch_alone_is_not_finder_success(self):
        with tempfile.TemporaryDirectory() as d:
            home=Path(d);f=self.shot(home);receipt=M.screenshot_fingerprint(f,home)
            with mock.patch.object(M,'_run',side_effect=[subprocess.CompletedProcess([],0,'',''),subprocess.CompletedProcess([],0,'/wrong/file','')]):
                got=M.reveal_screenshot(receipt,home)
            self.assertFalse(got['ok']);self.assertFalse(got['task_verified'])
    def test_icloud_availability_change_is_not_file_identity_change(self):
        with tempfile.TemporaryDirectory() as d:
            home=Path(d);f=self.shot(home);receipt=M.screenshot_fingerprint(f,home)
            fresh={**receipt,'locally_available':False,'verification':'filename_and_metadata_only'}
            with mock.patch.object(M,'screenshot_fingerprint',return_value=fresh), mock.patch.object(M,'_run',side_effect=[subprocess.CompletedProcess([],0,'',''),subprocess.CompletedProcess([],0,str(f)+'\n','')]):
                got=M.reveal_screenshot(receipt,home)
            self.assertTrue(got['task_verified'])
    def test_folder_name_survives_user_facing_path_scrubbing(self):
        with tempfile.TemporaryDirectory() as d:
            home=Path(d);self.shot(home)
            with mock.patch.object(M,'_run',return_value=subprocess.CompletedProcess([],0,'','')):
                got=M.latest_screenshot(home)
            self.assertIn('Desktop folder.',got['spoken']);self.assertNotIn(str(home),got['spoken'])
    def test_exact_selection_postcondition(self):
        with tempfile.TemporaryDirectory() as d:
            home=Path(d);f=self.shot(home);receipt=M.screenshot_fingerprint(f,home)
            with mock.patch.object(M,'_run',side_effect=[subprocess.CompletedProcess([],0,'',''),subprocess.CompletedProcess([],0,str(f)+'\n','')]) as run:
                got=M.reveal_screenshot(receipt,home)
            self.assertTrue(got['task_verified']);self.assertEqual(run.call_args_list[0].args[0],['/usr/bin/open','-R',str(f)])

class ScreenshotRouting(unittest.TestCase):
    def test_original_exchange_runs_tools_and_ignores_model_path(self):
        with tempfile.TemporaryDirectory() as d:
            h=Path(d);receipt={'path':'/verified/screenshot.png','kind':'saved_screenshot'}
            with mock.patch.object(P.MACOS,'latest_screenshot',return_value={'ok':True,'spoken':'Latest saved screenshot found.','artifact':receipt}) as lookup, mock.patch.object(P.MACOS,'reveal_screenshot',return_value={'ok':True,'spoken':'Finder selection verified.','task_verified':True}) as reveal:
                talk=mock.Mock(side_effect=AssertionError('must not invent file or action'))
                first=P.apply_pipeline('what was my last screenshotted image?',hive=h,retrieve_roots=[],talk_fn=talk,gen=P.begin_turn(h))
                second=P.apply_pipeline('can you open it in finder for me?',hive=h,retrieve_roots=[],talk_fn=talk,gen=P.begin_turn(h))
            lookup.assert_called_once_with();reveal.assert_called_once_with(receipt);talk.assert_not_called();self.assertEqual(first['verb'],'workspace_read');self.assertTrue(second['ok']);self.assertIn('Finder selection verified',second['spoken'])
    def test_unknown_pronoun_is_not_a_finder_action(self):
        with tempfile.TemporaryDirectory() as d, mock.patch.object(P.MACOS,'reveal_screenshot') as reveal:
            h=Path(d);got=P.apply_pipeline('can you open it in finder for me?',hive=h,retrieve_roots=[],talk_fn=mock.Mock(side_effect=AssertionError('no prose model')),gen=P.begin_turn(h))
            reveal.assert_not_called();self.assertFalse(got['ok']);self.assertIn('verified screenshot',got['spoken'])
    def test_stale_reference_does_not_survive_intervening_turn(self):
        with tempfile.TemporaryDirectory() as d, mock.patch.object(P.MACOS,'reveal_screenshot') as reveal:
            h=Path(d);gen=P.begin_turn(h);P.mutate_bus(h,lambda b:{**b,'screenshot_reference':{'gen':gen-2,'artifact':{'path':'invented'}}})
            got=P._run_tool_inner({'tool':'workspace_read','args':{'path':'invented'}},'open it in finder',hive=h,retrieve_roots=[],gen=gen)
            self.assertFalse(got['ok']);reveal.assert_not_called()
    def test_cancelled_request_cannot_reveal(self):
        with tempfile.TemporaryDirectory() as d, mock.patch.object(P.MACOS,'reveal_screenshot') as reveal:
            h=Path(d);gen=P.begin_turn(h);P.BUS_IO.cancel_turn(h)
            got=P._run_tool_inner({'tool':'workspace_read','args':{}},'open it in finder',hive=h,retrieve_roots=[],gen=gen)
            self.assertTrue(got['cancelled']);reveal.assert_not_called()

if __name__=='__main__':unittest.main()
