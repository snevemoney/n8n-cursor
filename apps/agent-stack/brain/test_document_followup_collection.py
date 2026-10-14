"""The ordinary pipeline retains two real reads for a later reference-only turn."""
import importlib.util
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec=importlib.util.spec_from_file_location('followup_pipeline',Path(__file__).with_name('pipeline.py'))
P=importlib.util.module_from_spec(spec);spec.loader.exec_module(P)

class Followup(unittest.TestCase):
 def test_default_generation_two_reads_then_no_new_read_followup(self):
  with tempfile.TemporaryDirectory() as tmp:
   root=Path(tmp).resolve();hive=root/'hive';hive.mkdir();first=root/'first.py';second=root/'second.py'
   first.write_text('def first(): return "FIRST_ACTUAL_SOURCE"');second.write_text('def second(): return "SECOND_ACTUAL_SOURCE"')
   spec=importlib.util.spec_from_file_location('followup_workspace',Path(__file__).parents[1]/'hands/workspace_read.py');wr=importlib.util.module_from_spec(spec);spec.loader.exec_module(wr)
   def talk(prompt,context='',**kw):
    if 'SECOND_ACTUAL_SOURCE' not in context:return {'ok':True,'wire':'openrouter','tool':'workspace_read','args':{'op':'read','path':str(second)},'speak':''}
    return {'ok':True,'wire':'openrouter','tool':'converse','speak':'Both actual sources contain simple return functions.'}
   with patch.object(P,'_workspace_read_hand',return_value=wr),patch.object(wr,'default_roots',return_value=[root]),patch.object(P,'_vision_urls',return_value=[]):
    initial=P.apply_pipeline(f'Read {first} and {second} and compare their contents.',hive=hive,retrieve_roots=[root],talk_fn=talk)
    self.assertEqual(initial['hand_loop_meta']['hands'],2)
    contexts=[]
    def answer(prompt,context='',**kw):
     contexts.append((context,kw));return {'ok':True,'wire':'openrouter','tool':'converse','speak':'Neither file executes external calls.'}
    with patch.object(wr,'run_requested',side_effect=AssertionError('followup must not read new files')):
     result=P.apply_pipeline('Explain the comparison you just made. Did either file actually execute external calls?',hive=hive,retrieve_roots=[root],talk_fn=answer)
    self.assertIn('Neither file',result['spoken']);self.assertTrue(contexts)
    self.assertIn('FIRST_ACTUAL_SOURCE',contexts[-1][0]);self.assertIn('SECOND_ACTUAL_SOURCE',contexts[-1][0]);self.assertNotIn('hand_loop_meta',result)
    with patch.object(wr,'run_requested',side_effect=AssertionError('unexpected model tool cannot execute')):
     denied=P.apply_pipeline('Explain that comparison again.',hive=hive,retrieve_roots=[root],talk_fn=lambda *a,**k:{'ok':True,'wire':'openrouter','tool':'workspace_read','args':{'op':'read','path':str(first)},'speak':''})
    self.assertFalse(denied['ok']);self.assertIn('not run that action',denied['spoken'])
 def test_reference_classifier_does_not_grant_new_actions_or_unrelated_topic(self):
  for text in ('Read /tmp/new.py and compare it','Send that comparison','Explain quantum gravity','Search for these files','Explain this file /tmp/unrelated.py','Compare these new sources /tmp/third.py and /tmp/fourth.py'):
   self.assertFalse(P._document_snapshot_followup(text),text)
  for text in ('Explain the comparison you just made','Summarize both sources','Use the results you actually obtained to finish that comparison.', 'Check your last comparison carefully. Does launching an MCP server and exchanging handshake messages count as doing nothing or sending no data? Correct any overstatement using the code you just read, and distinguish listing tools from executing them.'):
   self.assertTrue(P._document_snapshot_followup(text),text)

if __name__=='__main__':unittest.main()
