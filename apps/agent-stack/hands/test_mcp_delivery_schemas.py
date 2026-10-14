"""Existing stdio tools/list with an actual local fixture process, never a live connector."""
import importlib.util,json,sys,tempfile,unittest
from pathlib import Path
from types import SimpleNamespace

HERE=Path(__file__).parent
spec=importlib.util.spec_from_file_location('delivery_schema_mcp',HERE/'mcp_call.py');MC=importlib.util.module_from_spec(spec);spec.loader.exec_module(MC)
spec=importlib.util.spec_from_file_location('delivery_schema_runtime',HERE/'workflow_delivery.py');D=importlib.util.module_from_spec(spec);spec.loader.exec_module(D)
class Schemas(unittest.TestCase):
 def test_same_handshake_returns_names_and_actual_schemas_without_any_tool_execution(self):
  with tempfile.TemporaryDirectory() as tmp:
   root=Path(tmp);script=root/'fixture.py';log=root/'requests.jsonl'
   tools=[{'name':'obsidian_append_content','inputSchema':{'type':'object','properties':{'filepath':{'type':'string'},'content':{'type':'string'}},'required':['filepath','content']}}]
   script.write_text('import json,sys\nfrom pathlib import Path\nlog=Path('+repr(str(log))+')\ntools='+repr(tools)+'\nfor line in sys.stdin:\n m=json.loads(line)\n with log.open("a") as out:out.write(json.dumps(m)+"\\n")\n if "id" in m:\n  print(json.dumps({"jsonrpc":"2.0","id":m["id"],"result":{"tools":tools} if m["method"]=="tools/list" else {"protocolVersion":"2024-11-05","capabilities":{}}}),flush=True)\n')
   config={'command':sys.executable,'args':['-I','-S',str(script)]};captured=[]
   actual=MC._list_tools(config,3,metadata_fn=captured.extend);self.assertEqual(actual,['obsidian_append_content']);self.assertEqual(captured,tools)
   self.assertEqual([json.loads(line)['method'] for line in log.read_text().splitlines()],['initialize','notifications/initialized','tools/list'])
   self.assertEqual(MC._list_tools(config,3),actual)
 def test_runtime_requires_all_actual_argument_schemas_not_just_familiar_tool_names(self):
  def tool(name,properties):return {'name':'obsidian_'+name,'inputSchema':{'type':'object','properties':{k:{'type':'string'} for k in properties},'required':list(properties)}}
  rows=[tool('append_content',{'filepath','content'}),tool('get_file_contents',{'filepath'}),tool('list_files_in_dir',{'dirpath'})]
  inventory=SimpleNamespace(inventory=lambda:([{'name':'MCP_DOCKER'}],0),server_spec=lambda n:{'fixture':True})
  transport=SimpleNamespace(_list_tools=lambda spec,deadline,metadata_fn:metadata_fn(rows))
  hand=SimpleNamespace(MCP_DEADLINE_S=30,PERM=lambda:SimpleNamespace(log_action=lambda *a:None))
  runtime=D.Runtime(None,lambda:None);runtime.load=lambda name:{'agent_tools':hand,'mcp_inventory':inventory,'mcp_call':transport}[name]
  good=runtime.note_contract();self.assertTrue(good['schema_verified']);self.assertEqual(good['server'],'MCP_DOCKER')
  rows[0]['inputSchema']['required'].append('arbitrary_command')
  self.assertIsNone(runtime.note_contract())

if __name__=='__main__':unittest.main()
