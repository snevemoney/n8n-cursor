"""Offline official-API relocation proof; no network or repository execution."""
import copy
import importlib.util
import json
from pathlib import Path
import unittest
from unittest.mock import patch
from urllib.error import HTTPError

ROOT=Path(__file__).parent
spec=importlib.util.spec_from_file_location('origin_fixtures',ROOT/'test_workflow_origin.py');F=importlib.util.module_from_spec(spec);spec.loader.exec_module(F)
M=F.M
class Response:
 def __init__(self,url,raw):self.url=url;self.raw=raw
 def __enter__(self):return self
 def __exit__(self,*a):pass
 def geturl(self):return self.url
 def read(self,n):return self.raw[:n]
class IdentityTests(unittest.TestCase):
 def setup_opener(self,rows,location='https://api.github.com/repositories/123',identity=123,metadata_overrides=None):
  calls=[]
  class Opener:
   def open(self,request,timeout):
    url=request.full_url;calls.append(url)
    if url=='https://api.github.com'+F.PREFIX:raise HTTPError(url,301,'Moved',{'Location':location},None)
    if url=='https://api.github.com/repositories/123':
     meta=copy.deepcopy(rows[F.PREFIX]);meta.update(id=identity,full_name='owner/renamed',url='https://api.github.com/repos/owner/renamed',html_url='https://github.com/owner/renamed')
     meta.update(metadata_overrides or {})
     return Response(url,json.dumps(meta).encode())
    path=url.removeprefix('https://api.github.com').replace('/repos/owner/renamed',F.PREFIX)
    return Response(url,json.dumps(rows[path]).encode())
  return Opener(),calls
 def test_actual_http_shape_resolves_id_then_pins_code_and_keeps_publisher_link(self):
  rows,_,_=F.OriginTests().fixture();opener,calls=self.setup_opener(rows)
  with patch.object(M,'build_opener',return_value=opener):
   got=M.inspect(F.REQUEST,F.SOURCE,mission_id=F.ID,request_sha256='d'*64,source_research_sha256='e'*64,active_fn=lambda:True)
  self.assertTrue(got['verified'],got);self.assertEqual(got['original_implementation_url'],'https://github.com/owner/original');self.assertEqual(got['canonical_implementation_url'],'https://github.com/owner/renamed')
  self.assertEqual(got['repository']['id'],123);self.assertTrue(M.repository_matches_publisher(got,'https://github.com/owner/original'))
  self.assertIn('https://api.github.com/repos/owner/renamed/commits/main',calls);self.assertEqual(len(calls),7)
  for key,value in [('id',124),('full_name','evil/replacement')]:
   bad=copy.deepcopy(got);bad['repository'][key]=value;self.assertFalse(M.repository_matches_publisher(bad,'https://github.com/owner/original'))
 def test_redirect_budget_includes_all_three_bounded_code_reads(self):
  rows,_,_=F.OriginTests().fixture();original=rows[F.PREFIX+'/git/trees/'+F.TREE+'?recursive=1']['tree'][0]
  rows[F.PREFIX+'/git/trees/'+F.TREE+'?recursive=1']['tree']=[{**original,'path':f'src/module{n}.py'} for n in range(3)]
  opener,calls=self.setup_opener(rows)
  with patch.object(M,'build_opener',return_value=opener):
   got=M.inspect(F.REQUEST,F.SOURCE,mission_id=F.ID,request_sha256='d'*64,source_research_sha256='e'*64,active_fn=lambda:True)
  self.assertTrue(got['verified'],got);self.assertEqual(len(got['code_files']),3);self.assertEqual(len(calls),9);self.assertEqual(got['public_requests'],9)

 def test_redirect_scope_and_id_mismatch_are_rejected(self):
  rows,_,_=F.OriginTests().fixture()
  for location,identity in [('https://evil.invalid/repositories/123',123),('https://api.github.com/repos/owner/elsewhere',123),('http://api.github.com/repositories/123',123),('https://api.github.com/repositories/123?token=bad',123),('https://api.github.com/repositories/123',999)]:
   with self.subTest(location=location):
    opener,calls=self.setup_opener(rows,location,identity)
    with patch.object(M,'build_opener',return_value=opener):
     got=M.inspect(F.REQUEST,F.SOURCE,mission_id=F.ID,request_sha256='d'*64,source_research_sha256='e'*64,active_fn=lambda:True)
    self.assertFalse(got['verified']);self.assertNotIn('implementation_excerpt',got)
 def test_unchanged_name_still_requires_consistent_canonical_identity_after_redirect(self):
  rows,_,_=F.OriginTests().fixture()
  for changed in ({'full_name':'owner/original','url':'https://evil.invalid/unrelated','html_url':'https://evil.invalid/unrelated'}, {'full_name':'owner/original','url':'https://api.github.com/repos/owner/original','html_url':'https://github.com/other/repository'}):
   opener,_=self.setup_opener(rows,metadata_overrides=changed)
   with patch.object(M,'build_opener',return_value=opener):
    got=M.inspect(F.REQUEST,F.SOURCE,mission_id=F.ID,request_sha256='d'*64,source_research_sha256='e'*64,active_fn=lambda:True)
   self.assertFalse(got['verified']);self.assertEqual(got['reason'],'repository_identity_mismatch')

 def test_child_endpoint_redirects_and_repeated_redirects_never_follow(self):
  class AlwaysMoved:
   def open(self,request,timeout):raise HTTPError(request.full_url,301,'Moved',{'Location':'https://api.github.com/repositories/123'},None)
  for path in (F.PREFIX+'/license',F.PREFIX):
   with patch.object(M,'build_opener',return_value=AlwaysMoved()):
    with self.assertRaises(M.OriginHold):M._public_get(path,timeout=1,max_bytes=100,redirects=[])
if __name__=='__main__':unittest.main()
