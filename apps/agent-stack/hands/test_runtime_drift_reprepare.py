"""Regression (2026-10-15 10:01 ET, mission 01e8079): after a Jarvis restart with new code,
'Continue my saved-video build.' died on 'workflow execution guard rejected' (runtime_preimage_changed
on hands/pointer.py) forever. Continue must retire the stale preparation and re-prepare, preserving evidence."""
import importlib.util,json,tempfile,unittest
from pathlib import Path
HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('wx_drift',HERE/'workflow_execution.py');wx=importlib.util.module_from_spec(spec);spec.loader.exec_module(wx)
MID='a'*32

class RuntimeDrift(unittest.TestCase):
    def setUp(self):
        self.tmp=Path(tempfile.mkdtemp()).resolve();self.hive=self.tmp/'hive';self.root=self.hive/'coding-missions'/MID;self.root.mkdir(parents=True)
        self.runtime=self.tmp/'rt';(self.runtime/'apps/agent-stack/hands').mkdir(parents=True)
        self.ptr=self.runtime/'apps/agent-stack/hands/pointer.py';self.ptr.write_text('old\n')
        W=wx._load('workflow_workspace');self.sha=W._regular_bytes(self.ptr)[1]
        self.copy=self.tmp/'scratch'/('workflow-'+MID);self.copy.mkdir(parents=True);(self.copy/'f').write_text('x')
        contract={'working_copy':str(self.copy),'source_receipt':{'verification_method':'owner_verified_immutable_revision'},
                  'runtime_baseline':{'source_repo':str(self.runtime),'files':{'apps/agent-stack/hands/pointer.py':self.sha},
                                      'configuration_lock':{},'configuration_digest':'d'}}
        (self.root/'execution_contract.json').write_text(json.dumps(contract))
        for n in ('execution_owner.json','execution_guard.json','coding_child.json'):(self.root/n).write_text('{}')
        (self.root/'source_research.json').write_text('{"keep":1}')

    def test_locked_file_change_is_drift(self):
        self.ptr.write_text('new\n')
        self.assertEqual(wx.runtime_drift_reason(self.hive,MID),'runtime_preimage_changed')

    def test_retire_moves_never_deletes(self):
        out=wx.retire_runtime_drift_preparation(self.hive,MID,reason='runtime_preimage_changed',now=1792072910)
        arch=Path(out['archive'])
        for n in ('execution_owner.json','execution_guard.json','execution_contract.json','coding_child.json'):
            self.assertFalse((self.root/n).exists());self.assertTrue((arch/n).exists())
        self.assertTrue((self.root/'source_research.json').exists())
        self.assertFalse(self.copy.exists());self.assertEqual((Path(out['moved_working_copy'])/'f').read_text(),'x')
        self.assertEqual(json.loads((arch/'retired.json').read_text())['reason'],'runtime_preimage_changed')

    def test_retire_requires_reason(self):
        with self.assertRaises(ValueError):wx.retire_runtime_drift_preparation(self.hive,MID,reason=None)

    def test_controller_retires_before_guarded_queue(self):
        src=(HERE.parent/'brain/mission_controller.py').read_text()
        i=src.index('runtime_drift_reason(hive,ident)');j=src.index('retire_runtime_drift_preparation(hive,ident');k=src.index('coding.queue_workflow_code(ident)')
        self.assertTrue(i<j<k);self.assertIn('"coding worker still active"',src[i:j])

if __name__=='__main__':unittest.main()
