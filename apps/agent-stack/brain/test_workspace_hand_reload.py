"""Real source/bytecode/cache reload without restarting the host or using user files."""
import importlib.util
import os
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

spec=importlib.util.spec_from_file_location('workspace_reload_pipeline',Path(__file__).with_name('pipeline.py'))
P=importlib.util.module_from_spec(spec);spec.loader.exec_module(P)

class WorkspaceReloadTests(unittest.TestCase):
 def fixture(self,tmp):
  stack=Path(tmp).resolve();(stack/'hands').mkdir();path=stack/'hands/workspace_read.py'
  path.write_text('def version():\n    return "old"\n');return stack,path

 def test_legacy_cached_module_then_same_second_same_size_new_bytes_load_actual_new_api(self):
  with tempfile.TemporaryDirectory() as tmp:
   stack,path=self.fixture(tmp);name='agent_stack_workspace_read'
   legacy_spec=importlib.util.spec_from_file_location(name,path);legacy=importlib.util.module_from_spec(legacy_spec);legacy_spec.loader.exec_module(legacy)
   self.assertEqual(legacy.version(),'old');self.assertTrue(any((path.parent/'__pycache__').glob('workspace_read*.pyc')))
   previous=sys.modules.get(name)
   try:
    sys.modules[name]=legacy
    before=path.stat();path.write_text('def version():\n    return "new"\n');os.utime(path,ns=(before.st_atime_ns,before.st_mtime_ns+1))
    with patch.object(P,'STACK',stack):loaded=P._workspace_read_hand()
    self.assertEqual(loaded.version(),'new');self.assertIsNot(loaded,legacy)
    path.write_text('def version():\n    return "end"\n');os.utime(path,ns=(before.st_atime_ns,before.st_mtime_ns+2))
    with patch.object(P,'STACK',stack):loaded2=P._workspace_read_hand()
    self.assertEqual(loaded2.version(),'end');self.assertIsNot(loaded2,loaded)
   finally:
    if previous is None:sys.modules.pop(name,None)
    else:sys.modules[name]=previous

 def test_failed_new_source_preserves_previous_complete_module_without_publishing_partial(self):
  with tempfile.TemporaryDirectory() as tmp:
   stack,path=self.fixture(tmp);name='agent_stack_workspace_read';previous=sys.modules.pop(name,None)
   try:
    with patch.object(P,'STACK',stack):
     loaded=P._workspace_read_hand();path.write_text('PARTIAL = True\nraise RuntimeError("fixture failure")\n')
     with self.assertRaises(RuntimeError):P._workspace_read_hand()
     self.assertIs(sys.modules[name],loaded);self.assertFalse(hasattr(sys.modules[name],'PARTIAL'))
     path.write_text('def version():\n    return "fixed"\n');self.assertEqual(P._workspace_read_hand().version(),'fixed')
   finally:
    if previous is None:sys.modules.pop(name,None)
    else:sys.modules[name]=previous

 def test_receipt_retains_already_bounded_reader_text_beyond_six_thousand(self):
  body='first'+('x'*7000)+'ACTUAL-END'
  row=P._hand_loop_receipt({'tool':'workspace_read'},{'workspace_text':body,'workspace_truncated':False})
  self.assertEqual(row['result']['workspace_text'],body);self.assertFalse(row['text_capped'])
  row=P._hand_loop_receipt({'tool':'workspace_read'},{'workspace_text':'x'*13000,'workspace_truncated':True})
  self.assertEqual(len(row['result']['workspace_text']),12000);self.assertTrue(row['text_capped']);self.assertTrue(row['result']['workspace_truncated'])

if __name__=='__main__':unittest.main()
