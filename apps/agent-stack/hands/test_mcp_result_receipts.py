"""Actual local stdio fixture only; never connects to a user's MCP server."""
import importlib.util,json,sys,tempfile,unittest
from pathlib import Path
S=importlib.util.spec_from_file_location('result_hand',Path(__file__).with_name('agent_tools.py'));H=importlib.util.module_from_spec(S);S.loader.exec_module(H)
class Receipts(unittest.TestCase):
 def test_host_receives_actual_large_result_while_default_output_stays_capped(self):
  with tempfile.TemporaryDirectory() as temp:
   path=Path(temp)/'server.py';body={'content':[{'type':'text','text':json.dumps({'files':['entry-'+str(i)+'.md' for i in range(900)]})}]}
   path.write_text('import sys,json\nbody='+repr(body)+'\nfor line in sys.stdin:\n m=json.loads(line)\n if "id" in m:print(json.dumps({"jsonrpc":"2.0","id":m["id"],"result":body if m["method"]=="tools/call" else {}}),flush=True)\n')
   spec={'command':sys.executable,'args':['-I','-S',str(path)]};rows=[]
   ok,text=H._mcp_call(spec,'get_fixture',{},3,result_fn=rows.append)
   self.assertTrue(ok);self.assertLessEqual(len(text),H.OUT_CAP+100);self.assertEqual(rows,[body]);self.assertEqual(len(json.loads(rows[0]['content'][0]['text'])['files']),900)
 def test_oversized_callback_body_fails_closed_without_callback(self):
  rows=[]
  with self.assertRaises(ValueError):H._host_mcp_result(rows.append,{'content':[{'type':'text','text':'x'*66000}]})
  self.assertEqual(rows,[])
if __name__=='__main__':unittest.main()
