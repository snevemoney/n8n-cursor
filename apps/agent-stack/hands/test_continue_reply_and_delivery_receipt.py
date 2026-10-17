"""Regressions from Evens's 'Continue my saved-video build.' (2026-10-15):
- 14:01Z..14:17Z every reply said 'The worker is not confirmed active' although the worker started: the research-build
  owner receipt lacked worker_entrypoint, so _spawn_pending could never be true for the reply's status read.
- 10:24 ET delivery stopped on actual_completed_coding_receipt_required: status() adds 'active' to the receipt it returns."""
import unittest
from pathlib import Path
HERE=Path(__file__).resolve().parent
class Regressions(unittest.TestCase):
    def test_research_build_owner_receipt_has_entrypoint(self):
        src=(HERE.parent/'brain/mission_controller.py').read_text()
        line=[l for l in src.splitlines() if 'root/"owner.json"' in l and 'process.pid' in l]
        self.assertEqual(len(line),1);self.assertIn('"worker_entrypoint":str(self.adapter._worker_entrypoint(root))',line[0])
    def test_spawn_pending_requires_entrypoint(self):
        self.assertIn("owner.get('worker_entrypoint')!=str(entrypoint)",(HERE/'coding_mission.py').read_text())
    def test_delivery_ignores_liveness_keys(self):
        import importlib.util
        spec=importlib.util.spec_from_file_location('wd_t',HERE/'workflow_delivery.py');wd=importlib.util.module_from_spec(spec);spec.loader.exec_module(wd)
        self.assertTrue({'active','worker_liveness'}<=wd.LIVENESS_KEYS)
        receipt={'status':'COMPLETED','builder_verified':True}
        observed={**receipt,'active':False}
        self.assertEqual({k:v for k,v in observed.items() if k not in wd.LIVENESS_KEYS},receipt)
        self.assertNotIn('status',wd.LIVENESS_KEYS);self.assertNotIn('builder_verified',wd.LIVENESS_KEYS)
if __name__=='__main__':unittest.main()
