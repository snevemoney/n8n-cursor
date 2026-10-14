"""Own behavior implementation keeps source inspection separate from reuse permission."""
import base64
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

ROOT=Path(__file__).parent
def load(name,path):
 spec=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
F=load('reference_origin_fixtures',ROOT/'test_workflow_origin.py');M=F.M;C=load('reference_coding',ROOT/'coding_mission.py')
class ReferenceBehavior(unittest.TestCase):
 def inspect(self,objective):
  rows,_,fetch=F.OriginTests().fixture();rows[F.PREFIX]['license']={'spdx_id':'NOASSERTION'}
  rows[F.PREFIX+'/license?ref='+F.COMMIT].update(license={'spdx_id':'NOASSERTION'},content=base64.b64encode(b'Custom upstream source license. This inspection grants no permission to reuse that code.').decode())
  request={**F.REQUEST,'objective':objective}
  selected={**F.SOURCE['selected'],'method_excerpt':'Optional action modules can be absent without breaking application startup.'}
  source={'selected':selected};request_raw=json.dumps(request).encode();source_raw=json.dumps(source).encode()
  got=M.inspect(request,source,mission_id=F.ID,request_sha256=hashlib.sha256(request_raw).hexdigest(),source_research_sha256=hashlib.sha256(source_raw).hexdigest(),active_fn=lambda:True,fetch_fn=fetch)
  return request_raw,source_raw,got
 def test_custom_license_inspected_but_never_approved_and_upstream_code_withheld(self):
  request,source,got=self.inspect('Research a saved idea, build a working version in my project, run tests, preserve my existing code and models.')
  self.assertTrue(got['verified'],got);self.assertFalse(got['task_verified']);self.assertFalse(got['reuse_authorized']);self.assertTrue(got['license']['inspected']);self.assertFalse(got['license']['verified']);self.assertEqual(got['implementation_excerpt'],'')
  with tempfile.TemporaryDirectory() as temp:
   hive=Path(temp).resolve();root=hive/'coding-missions'/F.ID;root.mkdir(parents=True)
   (root/'request.json').write_bytes(request);(root/'source_research.json').write_bytes(source);(root/'original_implementation.json').write_text(json.dumps(got))
   goal=C.workflow_code_goal(hive,F.ID)
   self.assertIn('Do not copy, translate, adapt, install or vendor upstream code',goal);self.assertNotIn('def add',goal);self.assertIn('Optional action modules',goal)
   changed=copy.deepcopy(got);changed['implementation_excerpt']='def forbidden_upstream(): return 1';(root/'original_implementation.json').write_text(json.dumps(changed))
   with self.assertRaises(ValueError):C.workflow_code_goal(hive,F.ID)
 def test_copy_or_install_requests_keep_existing_license_review_gate(self):
  for verb in ('copy','port','reuse','adapt','translate','install','vendor','fork','clone'):
   _,_,got=self.inspect(f'Build a working version and {verb} the upstream code.')
   self.assertFalse(got['verified']);self.assertEqual(got['reason'],'license_requires_owner_review')
 def test_known_restricted_license_remains_held_and_mode_cannot_be_model_assigned(self):
  rows,_,fetch=F.OriginTests().fixture();rows[F.PREFIX]['license']={'spdx_id':'AGPL-3.0'}
  request={**F.REQUEST,'objective':'Build a working version independently.'}
  got=M.inspect(request,F.SOURCE,mission_id=F.ID,request_sha256='d'*64,source_research_sha256='e'*64,active_fn=lambda:True,fetch_fn=fetch)
  self.assertFalse(got['verified']);self.assertFalse(M.independent_behavior_requested(None))
if __name__=='__main__':unittest.main()
