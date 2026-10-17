import sys
import unittest
from pathlib import Path
from unittest import mock
sys.path.insert(0,str(Path(__file__).resolve().parent))  # bare 'import agent_tools' needs its own folder
import agent_tools as H
class MCPOutcomeTests(unittest.TestCase):
 def test_actual_write_receipt_is_not_outcome_verification(self):
  with mock.patch.object(H,'_load') as load,mock.patch.object(H,'_mcp_call',return_value=(True,'{"id":"real-tool-receipt"}')) as call:
   load.return_value.server_spec.return_value={'command':'configured'}
   row=H.op_mcp('vectorcraft','doc_new',{'name':'Private proof'},approved=True)
   call.assert_called_once();self.assertTrue(row['ok']);self.assertTrue(row['action_executed']);self.assertFalse(row['verified']);self.assertFalse(row['outcome_verified'])
 def test_unapproved_write_never_calls_connector(self):
  # locked mode pinned: open access is on by default (Evens 2026-10-15) and lets doc_new run unasked; a leaked JARVIS_MODE_FILE turned it on here
  with mock.patch.object(H,'_open_access',return_value=False),mock.patch.object(H,'_mcp_call') as call:
   row=H.op_mcp('vectorcraft','doc_new',{},approved=False);self.assertTrue(row['gated']);call.assert_not_called()
if __name__=='__main__':unittest.main()
