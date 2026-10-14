"""Offline transport checks: real metadata JSON must survive the CLI speech cap."""
import importlib.util
import json
from pathlib import Path
from types import SimpleNamespace
import unittest
from unittest.mock import patch

ROOT=Path(__file__).parents[1]
def load(name,path):
 spec=importlib.util.spec_from_file_location(name,path);mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod);return mod
A=load('metadata_cli',ROOT/'hands/agent_tools.py')
R=load('metadata_research',ROOT/'hands/workflow_research.py')
class MetadataOutput(unittest.TestCase):
 def setUp(self):
  self.video='https://www.youtube.com/watch?v=K_cha25S4Qo'
  self.raw=json.dumps({'id':'K_cha25S4Qo','description':'context '*450+'\nSource code: https://github.com/example/original'})
 def call(self,**kw):
  with patch.object(A,'PERM',return_value=SimpleNamespace(log_action=lambda *a:None)),patch.object(A.shutil,'which',return_value='/fixture/yt-dlp'),patch.object(A.subprocess,'run',return_value=SimpleNamespace(stdout=self.raw,stderr='',returncode=0)):
   return A.op_cli(R.primary_origin_probe(self.video)['argv'],**kw)
 def test_default_speech_cap_is_unchanged_and_marked(self):
  got=self.call();self.assertTrue(got['ok']);self.assertTrue(got['output_truncated']);self.assertEqual(len(got['output']),A.OUT_CAP+1)
  self.assertEqual(R.associate_primary_origin(self.video,got)['primary_probe_status'],'PRIMARY_OUTPUT_TRUNCATED')
 def test_host_bounded_probe_keeps_valid_json_and_original_code_link(self):
  got=self.call(max_output_chars=R.MAX_READ);self.assertFalse(got['output_truncated']);self.assertEqual(json.loads(got['output'])['id'],'K_cha25S4Qo')
  selected=R.associate_primary_origin(self.video,got);self.assertTrue(selected['origin_association_verified']);self.assertEqual(selected['original_implementation_url'],'https://github.com/example/original')
 def test_invalid_and_oversized_metadata_never_claim_association(self):
  for result,status in [({'ok':True,'output':'{'},'PRIMARY_INVALID_JSON'),({'ok':True,'output':'x'*(R.MAX_READ+1)},'PRIMARY_OUTPUT_TRUNCATED'),({'ok':False,'output':self.raw},'PRIMARY_PROBE_UNAVAILABLE')]:
   selected=R.associate_primary_origin(self.video,result);self.assertFalse(selected['origin_association_verified']);self.assertEqual(selected['primary_probe_status'],status)
if __name__=='__main__':unittest.main()
