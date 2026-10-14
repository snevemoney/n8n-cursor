import base64
import hashlib
import importlib.util
import json
from pathlib import Path
import unittest
from unittest.mock import patch

spec=importlib.util.spec_from_file_location('workflow_origin_test',Path(__file__).with_name('workflow_origin.py'))
M=importlib.util.module_from_spec(spec);spec.loader.exec_module(M)
ID='a'*32;COMMIT='b'*40;TREE='c'*40;PREFIX='/repos/owner/original'
REQUEST={'mission_id':ID,'worker_kind':'research_build','request_scope':'transient_task','objective':'Original build request'}
SOURCE={'selected':{'source_record_verified':True,'origin_association_verified':True,'original_implementation_url':'https://github.com/owner/original'}}

class OriginTests(unittest.TestCase):
 def fixture(self):
  body=b'def add(a, b):\n    """Return the sum from an owned function."""\n    return a + b\n'
  sha=hashlib.sha1(b'blob '+str(len(body)).encode()+b'\0'+body).hexdigest()
  def content(raw,**more):return {'encoding':'base64','content':base64.b64encode(raw).decode(),**more}
  rows={PREFIX:{'full_name':'owner/original','archived':False,'disabled':False,'private':False,'pushed_at':'2026-10-14T00:00:00Z','default_branch':'main','license':{'spdx_id':'MIT'}},
        PREFIX+'/commits/main':{'sha':COMMIT,'commit':{'tree':{'sha':TREE}}},
        PREFIX+'/license?ref='+COMMIT:content(b'MIT License. Permission is hereby granted, free of charge, to any person obtaining a copy of this software.',license={'spdx_id':'MIT'}),
        PREFIX+'/readme?ref='+COMMIT:content(b'# Original bounded addition implementation. Read this source as reference data.'),
        PREFIX+'/git/trees/'+TREE+'?recursive=1':{'sha':TREE,'truncated':False,'tree':[{'path':'src/add.py','type':'blob','mode':'100644','size':len(body),'sha':sha}]},
        PREFIX+'/git/blobs/'+sha:content(body,sha=sha)}
  calls=[]
  def fetch(path,*,timeout,max_bytes):
   calls.append((path,timeout,max_bytes));return json.dumps(rows[path]).encode()
  return rows,calls,fetch

 def inspect(self,fetch,**kw):
  return M.inspect(REQUEST,SOURCE,mission_id=ID,request_sha256='d'*64,source_research_sha256='e'*64,active_fn=kw.pop('active_fn',lambda:True),fetch_fn=fetch,**kw)

 def test_pinned_public_primary_read_records_actual_hashes_no_execution_or_fullproof(self):
  rows,calls,fetch=self.fixture();got=self.inspect(fetch)
  self.assertTrue(got['verified'],got);self.assertFalse(got['task_verified']);self.assertEqual(got['repository']['commit'],COMMIT)
  self.assertEqual(got['license']['spdx_id'],'MIT');self.assertEqual(len(got['code_files']),1)
  self.assertIn('def add',got['implementation_excerpt']);self.assertLessEqual(len(got['implementation_excerpt']),2400)
  self.assertEqual(got['actions'],[]);self.assertEqual(got['public_requests'],6)
  self.assertTrue(all(path.startswith(PREFIX) and timeout<=3 and limit<=M.MAX_BODY for path,timeout,limit in calls))
  self.assertTrue(all('?ref='+COMMIT in path for path,_,_ in calls if '/license?' in path or '/readme?' in path))

 def test_archive_unknown_or_copyleft_license_stops_before_code(self):
  for field,value in [('archived',True),('license',{'spdx_id':'NOASSERTION'}),('license',{'spdx_id':'AGPL-3.0'}),('private',True)]:
   with self.subTest(field=field,value=value):
    rows,calls,fetch=self.fixture();rows[PREFIX][field]=value;got=self.inspect(fetch)
    self.assertFalse(got['verified']);self.assertEqual(len(calls),1);self.assertNotIn('implementation_excerpt',got)

 def test_wrong_repo_unsafe_ref_wrong_commit_or_blob_and_truncated_tree_rejected(self):
  for mutation in ('repo','ref','commit','blob','tree'):
   with self.subTest(mutation=mutation):
    rows,calls,fetch=self.fixture()
    if mutation=='repo':rows[PREFIX]['full_name']='other/repository'
    if mutation=='ref':rows[PREFIX]['default_branch']='../private'
    if mutation=='commit':rows[PREFIX+'/commits/main']['sha']='bogus'
    if mutation=='blob':rows[next(k for k in rows if '/git/blobs/' in k)]['content']=base64.b64encode(b'Changed actual code content').decode()
    if mutation=='tree':rows[PREFIX+'/git/trees/'+TREE+'?recursive=1']['truncated']=True
    self.assertFalse(self.inspect(fetch)['verified'])

 def test_association_and_raw_owner_scope_required_no_arbitrary_url_fetch(self):
  rows,calls,fetch=self.fixture()
  for source in ({'selected':{'origin_association_verified':False}}, {'selected':{**SOURCE['selected'],'original_implementation_url':'https://github.com/owner/original/../../private'}}):
   got=M.inspect(REQUEST,source,mission_id=ID,request_sha256='d'*64,source_research_sha256='e'*64,active_fn=lambda:True,fetch_fn=fetch)
   self.assertFalse(got['verified'])
  self.assertEqual(calls,[])

 def test_stop_after_network_return_does_not_deliver_false_verified_receipt(self):
  rows,calls,fetch=self.fixture()
  got=self.inspect(fetch,active_fn=lambda:not calls)
  self.assertEqual(got['status'],'CANCELLED');self.assertFalse(got['verified']);self.assertNotIn('implementation_excerpt',got)

 def test_secret_content_never_echoed_in_receipt(self):
  rows,calls,fetch=self.fixture();secret='sk-'+('x'*40)
  rows[PREFIX+'/readme?ref='+COMMIT]['content']=base64.b64encode(secret.encode()).decode()
  got=self.inspect(fetch);self.assertFalse(got['verified']);self.assertNotIn(secret,json.dumps(got))

 def test_bounded_response_and_remote_error_details_are_not_echoed(self):
  def oversized(path,**kw):return b'x'*(M.MAX_BODY+1)
  self.assertFalse(self.inspect(oversized)['verified'])
  def broken(path,**kw):raise OSError('sensitive remote details should not escape')
  got=self.inspect(broken);self.assertNotIn('sensitive remote details',json.dumps(got));self.assertFalse(got['verified'])
  def hostile_seam(path,**kw):raise M.OriginHold('credential-like remote content')
  got=self.inspect(hostile_seam);self.assertNotIn('credential-like remote content',json.dumps(got))

 def test_malformed_metadata_and_only_stub_source_fail_closed(self):
  rows,calls,fetch=self.fixture();rows[PREFIX]['license']='MIT'
  self.assertFalse(self.inspect(fetch)['verified'])
  rows,calls,fetch=self.fixture();tree=rows[PREFIX+'/git/trees/'+TREE+'?recursive=1']['tree'][0]
  body=b'def unfinished():\n    """This is only a placeholder, not implementation."""\n    pass\n'
  sha=hashlib.sha1(b'blob '+str(len(body)).encode()+b'\0'+body).hexdigest();tree.update(sha=sha,size=len(body))
  rows[PREFIX+'/git/blobs/'+sha]={'encoding':'base64','content':base64.b64encode(body).decode(),'sha':sha}
  self.assertFalse(self.inspect(fetch)['verified'])

 def test_public_reader_fixed_host_no_auth_redirect_or_proxy_fallback(self):
  class Response:
   def __enter__(self):return self
   def __exit__(self,*a):pass
   def geturl(self):return 'https://api.github.com/repos/owner/original'
   def read(self,n):return b'{}'
  class Opener:
   def open(self,request,timeout):
    self.request=request;return Response()
  opener=Opener()
  with patch.object(M,'build_opener',return_value=opener) as build:
   self.assertEqual(M._public_get(PREFIX,timeout=1,max_bytes=100),b'{}')
  self.assertEqual(opener.request.full_url,'https://api.github.com'+PREFIX)
  self.assertFalse(any(k.lower() in {'authorization','cookie'} for k in opener.request.headers))
  self.assertIsInstance(build.call_args.args[0],M.ProxyHandler)
  with self.assertRaises(M.OriginHold):M._NoRedirect().redirect_request(None,None,302,'',{},'https://evil.invalid')

if __name__=='__main__':unittest.main()
