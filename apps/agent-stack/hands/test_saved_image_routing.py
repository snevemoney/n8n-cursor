from pathlib import Path
import tempfile,unittest,subprocess
from unittest import mock
from brain import pipeline as P

REQUEST='Open the screenshot you just found and describe it briefly. Then ask me what I would like to do with it.'
class SavedImageRouting(unittest.TestCase):
    def setup_reference(self,h,finder=False):
        g=P.begin_turn(h)
        if finder:g=P.begin_turn(h)
        P.mutate_bus(h,lambda b:{**b,'screenshot_reference':{'gen':g,'artifact':{'path':'/verified/Screenshot.png','kind':'saved_screenshot'}},'turns':[]})
        if finder:
            P.begin_turn(h)
            P.mutate_bus(h,lambda b:{**b,'turns':[{'user':'can you open it in finder for me?','jarvis':'Finder selected it.'}]})
        return P.begin_turn(h)
    def test_actual_original_workflow_routes_to_saved_image_not_fullscreen(self):
        with tempfile.TemporaryDirectory() as d, mock.patch.object(P.MACOS,'open_screenshot',return_value={'ok':True,'opened':True,'spoken':'The screenshot is open in Preview.'}) as view, mock.patch.object(P,'_screen_see_hand') as screen, mock.patch.object(P,'online_talk',return_value={'ok':True,'spoken':'A settings window. What should we do with it?'}) as online:
            h=Path(d);g=self.setup_reference(h,finder=True)
            def describe(artifact,**kw):
                self.assertTrue(kw['active_fn']());self.assertTrue(kw['follow_up']);return {'ok':True,'spoken':kw['vision_fn']('Caption actual image',images=['data:image/png;base64,fixture'])}
            screen.return_value.run_file.side_effect=describe
            got=P._run_tool_inner(P.model_free_route(REQUEST),REQUEST,hive=h,gen=g,retrieve_roots=[])
            view.assert_called_once();screen.return_value.run.assert_not_called();online.assert_called_once_with('Caption actual image','',images=['data:image/png;base64,fixture'],hands=False)
            self.assertTrue(got['ok']);self.assertIn('What should we do',got['spoken'])
    def test_model_path_never_substitutes_for_missing_reference(self):
        with tempfile.TemporaryDirectory() as d,mock.patch.object(P.MACOS,'open_screenshot') as view,mock.patch.object(P,'online_talk') as online:
            h=Path(d);g=P.begin_turn(h)
            got=P._run_tool_inner({'tool':'workspace_read','args':{'path':'/etc/secret','_confirmed':True}},REQUEST,hive=h,gen=g,retrieve_roots=[])
            self.assertFalse(got['ok']);view.assert_not_called();online.assert_not_called();self.assertIn('Which image',got['spoken'])
    def test_stop_before_request_prevents_view_and_vision(self):
        with tempfile.TemporaryDirectory() as d,mock.patch.object(P.MACOS,'open_screenshot') as view,mock.patch.object(P,'online_talk') as online:
            h=Path(d);g=self.setup_reference(h);P.BUS_IO.cancel_turn(h)
            got=P._run_tool_inner(P.model_free_route(REQUEST),REQUEST,hive=h,gen=g,retrieve_roots=[])
            self.assertTrue(got['cancelled']);view.assert_not_called();online.assert_not_called()
    def test_newer_turn_after_open_prevents_vision(self):
        with tempfile.TemporaryDirectory() as d,mock.patch.object(P,'online_talk') as online:
            h=Path(d);g=self.setup_reference(h)
            def view(a):P.begin_turn(h);return {'ok':True,'opened':True}
            with mock.patch.object(P.MACOS,'open_screenshot',side_effect=view):
                got=P._run_tool_inner(P.model_free_route(REQUEST),REQUEST,hive=h,gen=g,retrieve_roots=[])
            self.assertFalse(got['task_verified']);online.assert_not_called()
    def test_failed_open_never_claims_description(self):
        with tempfile.TemporaryDirectory() as d,mock.patch.object(P.MACOS,'open_screenshot',return_value={'ok':False,'opened':False,'spoken':'Viewer unavailable.'}),mock.patch.object(P,'online_talk') as online:
            h=Path(d);g=self.setup_reference(h)
            got=P._run_tool_inner(P.model_free_route(REQUEST),REQUEST,hive=h,gen=g,retrieve_roots=[])
            self.assertFalse(got['ok']);online.assert_not_called()
    def test_describe_only_does_not_launch_preview(self):
        with tempfile.TemporaryDirectory() as d,mock.patch.object(P.MACOS,'open_screenshot') as view,mock.patch.object(P,'_screen_see_hand') as screen:
            h=Path(d);g=self.setup_reference(h);screen.return_value.run_file.return_value={'ok':True,'spoken':'Actual description.'}
            got=P._run_tool_inner(P.model_free_route('Describe the screenshot briefly'),'Describe the screenshot briefly',hive=h,gen=g,retrieve_roots=[])
            self.assertTrue(got['ok']);view.assert_not_called()

class SavedImageOpen(unittest.TestCase):
    def artifact(self,home):
        (home/'Desktop').mkdir();p=home/'Desktop/Screenshot sample.png';p.write_bytes(b'\x89PNG\r\n\x1a\npixels')
        return P.MACOS.screenshot_fingerprint(p,home)
    def test_preview_matching_title_and_unchanged_file_prove_open(self):
        with tempfile.TemporaryDirectory() as d:
            h=Path(d);a=self.artifact(h)
            with mock.patch.object(P.MACOS,'_run',return_value=subprocess.CompletedProcess([],0,'','')) as run,mock.patch.object(P.MACOS,'frontmost_app',return_value={'ok':True,'app':'Preview','title':'Screenshot sample.png'}):
                got=P.MACOS.open_screenshot(a,h)
            self.assertTrue(got['opened']);self.assertEqual(run.call_args.args[0],['/usr/bin/open','-a','Preview',a['path']])
    def test_launch_accepted_is_not_a_verified_window(self):
        with tempfile.TemporaryDirectory() as d:
            h=Path(d);a=self.artifact(h)
            with mock.patch.object(P.MACOS,'_run',return_value=subprocess.CompletedProcess([],0,'','')),mock.patch.object(P.MACOS,'frontmost_app',return_value={'ok':True,'app':'Finder','title':'Desktop'}):
                got=P.MACOS.open_screenshot(a,h)
            self.assertTrue(got['ok']);self.assertFalse(got['opened']);self.assertIn('not yet verified',got['spoken'])
    def test_changed_file_cannot_be_opened(self):
        with tempfile.TemporaryDirectory() as d:
            h=Path(d);a=self.artifact(h);Path(a['path']).write_bytes(b'changed')
            with mock.patch.object(P.MACOS,'_run') as run:got=P.MACOS.open_screenshot(a,h)
            self.assertFalse(got['ok']);run.assert_not_called()

if __name__=='__main__':unittest.main()
