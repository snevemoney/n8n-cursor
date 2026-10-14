import unittest
from unittest import mock
import agent_tools as H
class MCPOutcomeTests(unittest.TestCase):
 def test_actual_write_receipt_is_not_outcome_verification(self):
  with mock.patch.object(H,'_load') as load,mock.patch.object(H,'_mcp_call',return_value=(True,'{"id":"real-tool-receipt"}')) as call:
   load.return_value.server_spec.return_value={'command':'configured'}
   row=H.op_mcp('vectorcraft','doc_new',{'name':'Private proof'},approved=True)
   call.assert_called_once();self.assertTrue(row['ok']);self.assertTrue(row['action_executed']);self.assertFalse(row['verified']);self.assertFalse(row['outcome_verified'])
 def test_unapproved_write_never_calls_connector(self):
  with mock.patch.object(H,'_mcp_call') as call:
   row=H.op_mcp('vectorcraft','doc_new',{},approved=False);self.assertTrue(row['gated']);call.assert_not_called()
if __name__=='__main__':unittest.main()
