import json
from pathlib import Path
import tempfile
import unittest
from hands import test_workflow_execution as fixtures

class StateBudgetTests(unittest.TestCase):
 def test_actual_manifest_sized_state_keeps_authority_checks(self):
  with tempfile.TemporaryDirectory() as tmp:
   f=fixtures.ExecutionTests();hive,root,repo,runtime,scratch,hand=f.fixture(tmp)
   state=json.loads((root/'state.json').read_text())
   state['preparation']={'manifest':{'files':{f'apps/agent-stack/source_{i}.py':{'sha256':'a'*64,'size':1000,'mode':420} for i in range(1000)}}}
   (root/'state.json').write_text(json.dumps(state));self.assertGreater((root/'state.json').stat().st_size,64000)
   a,b=f.context(hand)
   with a,b:
    self.assertEqual(fixtures.E._task(hive,fixtures.ID)[0],root)
    state['status']='COMPLETED';(root/'state.json').write_text(json.dumps(state))
    with self.assertRaises(ValueError):fixtures.E._task(hive,fixtures.ID)

 def test_oversized_state_remains_bounded(self):
  with tempfile.TemporaryDirectory() as tmp:
   f=fixtures.ExecutionTests();hive,root,repo,runtime,scratch,hand=f.fixture(tmp)
   state=json.loads((root/'state.json').read_text());state['padding']='x'*2_000_000
   (root/'state.json').write_text(json.dumps(state));a,b=f.context(hand)
   with a,b:
    with self.assertRaises(ValueError):fixtures.E._task(hive,fixtures.ID)
