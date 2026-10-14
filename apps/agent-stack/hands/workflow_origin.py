"""Host-invoked bounded public primary-source inspection, never installation/execution.

Publisher-associated URLs remain reference data, not permission. No authentication,
cookies, arbitrary redirects, proxy/session fallback or model/provider changes.
"""
from __future__ import annotations
import ast
import base64
import hashlib
import json
import re
import time
from urllib.error import HTTPError
from urllib.parse import quote, urlparse
from urllib.request import Request,build_opener,HTTPRedirectHandler,ProxyHandler

SUPPORTED={'MIT','Apache-2.0','BSD-2-Clause','BSD-3-Clause','ISC','0BSD','CC0-1.0','Unlicense'}
MAX_BODY=500000
MAX_TOTAL=2000000
MAX_CODE=100000
MAX_FILES=3
DEADLINE=18.0
REASONS={'redirect_refused','unsafe_public_endpoint','public_response_budget','unreadable_public_content',
 'decoded_content_budget','invalid_public_encoding','unreadable_public_code','secret_like_public_content',
 'primary_read_deadline','public_request_count','invalid_public_response','unreadable_public_response',
 'retained_owner_workflow_required','publisher_association_required','unsafe_original_repository',
 'repository_identity_mismatch','archived_or_unavailable_repository','public_repository_required',
 'repository_recency_unknown','unsafe_default_reference','license_requires_owner_review','unproved_pinned_commit',
 'license_identity_mismatch','license_unreadable','source_tree_incomplete','code_blob_identity_mismatch',
 'code_blob_size_mismatch','code_blob_hash_mismatch','meaningful_primary_code_missing'}
SECRET=re.compile(r'(?i)(?:gh[pousr]_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9_-]{20,}|xox[abp]-[\w-]+|AKIA[0-9A-Z]{16}|(?:api[_-]?key|token|secret|password)\s*[:=]\s*["\'][^"\']{8,}["\'])')
BAD_PATH=re.compile(r'(^|/)(?:\.env[^/]*|\.ssh|credentials[^/]*|secrets?[^/]*|node_modules|vendor|\.git|tests?|docs?)(/|$)',re.I)


class OriginHold(ValueError):pass
class Stopped(OriginHold):pass


class _NoRedirect(HTTPRedirectHandler):
 def redirect_request(self,req,fp,code,msg,headers,newurl):
  target=urlparse(newurl)
  if (req is not None and target.scheme=='https' and target.netloc=='api.github.com'
      and not target.query and not target.fragment
      and re.fullmatch(r'/repositories/[1-9][0-9]{0,18}',target.path)
      and re.fullmatch(r'https://api.github.com/repos/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+',req.full_url)):
   return None
  raise OriginHold('redirect_refused')


def _public_get(path,*,timeout,max_bytes,redirects=None):
 if not path.startswith('/repos/') or len(path)>512 or any(c in path for c in ('\n','\r','\\','@')):
  raise OriginHold('unsafe_public_endpoint')
 request=Request('https://api.github.com'+path,headers={'Accept':'application/vnd.github+json','User-Agent':'Jarvis-public-primary-source'},method='GET')
 opener=build_opener(ProxyHandler({}),_NoRedirect())
 try:
  response=opener.open(request,timeout=timeout)
 except HTTPError as exc:
  # GitHub repository renames resolve to its immutable numeric repository ID.
  # Only this metadata-only, same-service relocation may be followed once.
  location=exc.headers.get('Location','');exc.close();target=urlparse(location)
  moved=re.fullmatch(r'/repositories/([1-9][0-9]{0,18})',target.path)
  if (redirects is None or exc.code not in {301,302,307,308}
      or not re.fullmatch(r'/repos/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+',path)
      or target.scheme!='https' or target.netloc!='api.github.com'
      or target.query or target.fragment or not moved):raise OriginHold('redirect_refused')
  second=Request(location,headers={'Accept':'application/vnd.github+json','User-Agent':'Jarvis-public-primary-source'},method='GET')
  try:response=opener.open(second,timeout=timeout)
  except HTTPError as repeated:
   repeated.close()
   if repeated.code in {301,302,307,308}:raise OriginHold('redirect_refused')
   raise
  with response:
   if response.geturl()!=location:raise OriginHold('redirect_refused')
   raw=response.read(max_bytes+1)
  if len(raw)>max_bytes:raise OriginHold('public_response_budget')
  try:identity=json.loads(raw)
  except (ValueError,UnicodeError):raise OriginHold('repository_identity_mismatch')
  if not isinstance(identity,dict) or type(identity.get('id')) is not int or identity['id']!=int(moved.group(1)):
   raise OriginHold('repository_identity_mismatch')
  redirects.append({'requested_path':path,'target_path':target.path,'repository_id':identity['id'],
                    'metadata_sha256':hashlib.sha256(raw).hexdigest()})
 else:
  with response:
   if response.geturl()!=request.full_url:raise OriginHold('redirect_refused')
   raw=response.read(max_bytes+1)
 if len(raw)>max_bytes:raise OriginHold('public_response_budget')
 return raw


def _decoded(row,limit):
 if row.get('encoding')!='base64' or not isinstance(row.get('content'),str):raise OriginHold('unreadable_public_content')
 content=''.join(row['content'].split())
 if len(content)>limit*2:raise OriginHold('decoded_content_budget')
 try:raw=base64.b64decode(content,validate=True)
 except (ValueError,TypeError):raise OriginHold('invalid_public_encoding')
 if len(raw)>limit:raise OriginHold('decoded_content_budget')
 try:text=raw.decode('utf-8')
 except UnicodeError:raise OriginHold('unreadable_public_code')
 if SECRET.search(text):raise OriginHold('secret_like_public_content')
 return raw,text


def _code_path(path):
 return (isinstance(path,str) and len(path)<240 and re.fullmatch(r'[A-Za-z0-9_./-]+',path)
         and not path.startswith('/') and '..' not in path.split('/') and not BAD_PATH.search(path)
         and not path.rsplit('/',1)[-1].lower().startswith('test')
         and path.endswith(('.py','.js','.ts','.tsx','.go','.rs')))


def _meaningful(path,text):
 if len(text.strip())<40:return False
 if path.endswith('.py'):
  try:tree=ast.parse(text)
  except SyntaxError:return False
  return any(isinstance(n,(ast.FunctionDef,ast.AsyncFunctionDef)) and any(
   not isinstance(statement,ast.Pass) and not (isinstance(statement,ast.Expr) and isinstance(statement.value,ast.Constant))
   for statement in n.body) for n in ast.walk(tree))
 return bool(re.search(r'\b(?:function|class|func|fn|impl)\b|=>',text))


def repository_matches_publisher(origin, published_url):
 name=(origin.get('repository') or {}).get('full_name')
 original=published_url.removeprefix('https://github.com/').rstrip('/')
 if name==original and not origin.get('repository_identity_redirects'):return True
 rows=origin.get('repository_identity_redirects')
 identity=(origin.get('repository') or {}).get('id')
 return bool(isinstance(name,str) and re.fullmatch(r'[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+',name)
   and type(identity) is int and identity>0 and isinstance(rows,list) and len(rows)==1
   and rows[0].get('requested_path')=='/repos/'+original
   and rows[0].get('target_path')=='/repositories/'+str(identity)
   and rows[0].get('repository_id')==identity
   and re.fullmatch(r'[a-f0-9]{64}',str(rows[0].get('metadata_sha256','')))
   and any(r.get('endpoint')=='/repos/'+original and r.get('body_sha256')==rows[0]['metadata_sha256'] for r in origin.get('read_evidence',[]) if isinstance(r,dict))
   and origin.get('canonical_implementation_url')=='https://github.com/'+name)


def inspect(request,source_research,*,mission_id,request_sha256,source_research_sha256,active_fn,fetch_fn=None):
 """Return primary-study evidence only; caller persists it under retained owner lock."""
 result={'mission_id':mission_id,'request_sha256':request_sha256,'source_research_sha256':source_research_sha256,
         'verified':False,'task_verified':False,'verification_method':'public_primary_source_read',
         'status':'WAITING_ORIGINAL_IMPLEMENTATION','actions':[],'sent':False}
 end=time.monotonic()+DEADLINE;total=0;calls=0;evidence=[];redirects=[]
 def active():
  try:return callable(active_fn) and bool(active_fn())
  except Exception:return False
 def check():
  if not active():raise Stopped('owner_stopped')
  if time.monotonic()>=end:raise OriginHold('primary_read_deadline')
 def get(path):
  nonlocal total,calls
  check();calls+=1
  if calls>5+MAX_FILES:raise OriginHold('public_request_count')
  if total>=MAX_TOTAL:raise OriginHold('public_response_budget')
  options={'timeout':min(3.0,max(.05,end-time.monotonic())), 'max_bytes':min(MAX_BODY,MAX_TOTAL-total)}
  raw=fetch_fn(path,**options) if fetch_fn else _public_get(path,redirects=redirects,**options)
  if calls+len(redirects)>6+MAX_FILES:raise OriginHold('public_request_count')
  check()
  if not isinstance(raw,bytes) or len(raw)>MAX_BODY:raise OriginHold('invalid_public_response')
  total+=len(raw)
  if total>MAX_TOTAL:raise OriginHold('public_response_budget')
  try:row=json.loads(raw)
  except (ValueError,UnicodeError):raise OriginHold('unreadable_public_response')
  if not isinstance(row,dict):raise OriginHold('unreadable_public_response')
  evidence.append({'endpoint':path,'body_sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)})
  return row
 try:
  check()
  if (not isinstance(request,dict) or request.get('mission_id')!=mission_id or request.get('worker_kind')!='research_build'
      or request.get('request_scope')!='transient_task' or not re.fullmatch(r'[a-f0-9]{32}',str(mission_id))
      or not re.fullmatch(r'[a-f0-9]{64}',str(request_sha256)) or not re.fullmatch(r'[a-f0-9]{64}',str(source_research_sha256))):
   raise OriginHold('retained_owner_workflow_required')
  selected=source_research.get('selected') if isinstance(source_research,dict) else None
  if not isinstance(selected,dict) or selected.get('source_record_verified') is not True or selected.get('origin_association_verified') is not True:
   raise OriginHold('publisher_association_required')
  url=selected.get('original_implementation_url','')
  match=re.fullmatch(r'https://github\.com/([A-Za-z0-9][A-Za-z0-9_-]{0,38})/([A-Za-z0-9][A-Za-z0-9_.-]{0,99})/?',url)
  if not match or '..' in match.group(2):raise OriginHold('unsafe_original_repository')
  owner,repo=match.groups();prefix='/repos/'+owner+'/'+repo;result['original_implementation_url']=url
  metadata=get(prefix)
  canonical=metadata.get('full_name','')
  if redirects:
   if (len(redirects)!=1 or redirects[0].get('requested_path')!=prefix
       or type(metadata.get('id')) is not int or redirects[0].get('repository_id')!=metadata['id']
       or not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9_-]{0,38}/[A-Za-z0-9][A-Za-z0-9_.-]{0,99}',str(canonical))
       or '..' in canonical.split('/')[-1]
       or metadata.get('url')!='https://api.github.com/repos/'+canonical
       or metadata.get('html_url')!='https://github.com/'+canonical):raise OriginHold('repository_identity_mismatch')
   owner,repo=canonical.split('/');prefix='/repos/'+canonical
  elif str(canonical).casefold()!=(owner+'/'+repo).casefold():raise OriginHold('repository_identity_mismatch')
  result['canonical_implementation_url']='https://github.com/'+owner+'/'+repo
  result['repository_identity_redirects']=list(redirects)
  if metadata.get('archived') is not False or metadata.get('disabled') is True:raise OriginHold('archived_or_unavailable_repository')
  if metadata.get('private') is not False:raise OriginHold('public_repository_required')
  pushed=metadata.get('pushed_at');ref=metadata.get('default_branch','')
  if not isinstance(pushed,str) or not re.fullmatch(r'\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ',pushed):raise OriginHold('repository_recency_unknown')
  if not isinstance(ref,str) or not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9_./-]{0,199}',ref) or '..' in ref.split('/'):
   raise OriginHold('unsafe_default_reference')
  spdx=(metadata.get('license') or {}).get('spdx_id')
  if spdx not in SUPPORTED:raise OriginHold('license_requires_owner_review')
  commit=get(prefix+'/commits/'+quote(ref,safe=''));sha=commit.get('sha','')
  tree_sha=((commit.get('commit') or {}).get('tree') or {}).get('sha','')
  if not re.fullmatch(r'[a-f0-9]{40}',str(sha)) or not re.fullmatch(r'[a-f0-9]{40}',str(tree_sha)):
   raise OriginHold('unproved_pinned_commit')
  license_row=get(prefix+'/license?ref='+sha)
  if (license_row.get('license') or {}).get('spdx_id')!=spdx:raise OriginHold('license_identity_mismatch')
  license_raw,license_text=_decoded(license_row,50000)
  if len(license_text.strip())<40:raise OriginHold('license_unreadable')
  readme_row=get(prefix+'/readme?ref='+sha);readme_raw,readme_text=_decoded(readme_row,60000)
  tree=get(prefix+'/git/trees/'+tree_sha+'?recursive=1')
  if tree.get('truncated') is not False or tree.get('sha')!=tree_sha or not isinstance(tree.get('tree'),list):
   raise OriginHold('source_tree_incomplete')
  choices=[r for r in tree['tree'] if isinstance(r,dict) and r.get('type')=='blob' and r.get('mode') in {'100644','100755'}
           and type(r.get('size')) is int and 0<r['size']<=MAX_CODE and _code_path(r.get('path'))
           and re.fullmatch(r'[a-f0-9]{40}',str(r.get('sha','')))]
  choices.sort(key=lambda r:(not r['path'].startswith(('src/','lib/','app/')),r['path']))
  code=[];excerpts=[]
  for row in choices[:MAX_FILES]:
   blob=get(prefix+'/git/blobs/'+row['sha'])
   if blob.get('sha')!=row['sha']:raise OriginHold('code_blob_identity_mismatch')
   raw,text=_decoded(blob,MAX_CODE)
   if len(raw)!=row['size']:raise OriginHold('code_blob_size_mismatch')
   expected=hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()
   if expected!=row['sha']:raise OriginHold('code_blob_hash_mismatch')
   if not _meaningful(row['path'],text):continue
   code.append({'path':row['path'],'git_blob_sha':row['sha'],'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)})
   excerpts.append(row['path']+'\n'+text[:1600])
  if not code:raise OriginHold('meaningful_primary_code_missing')
  check()
  body_sha=hashlib.sha256(json.dumps(code,sort_keys=True,separators=(',',':')).encode()).hexdigest()
  result.update(verified=True,status='ORIGINAL_IMPLEMENTATION_INSPECTED',body_sha256=body_sha,
                repository={'full_name':owner+'/'+repo,'id':metadata.get('id'),'archived':False,'pushed_at':pushed,'default_branch':ref,'commit':sha,'tree':tree_sha},
                license={'spdx_id':spdx,'sha256':hashlib.sha256(license_raw).hexdigest(),'verified':True},
                readme_sha256=hashlib.sha256(readme_raw).hexdigest(),code_files=code,
                implementation_excerpt='\n\n'.join(excerpts)[:2400],source_text_is_untrusted_data=True,
                coverage='Pinned license, README and bounded implementation subset; not full repository, video or live-match proof.',
                spoken='I inspected the linked public implementation at a pinned commit, its license, and a bounded source subset. No code was installed or executed.')
 except Stopped:
  result.update(status='CANCELLED',reason='owner_stopped',spoken='The source inspection was stopped. No code was installed or executed.')
 except (OriginHold,OSError,ValueError,TypeError,KeyError,AttributeError,HTTPError):
  # Do not include arbitrary remote errors, response bodies, URLs with credentials,
  # or secret-like content. Only a fixed local reason vocabulary is surfaced.
  import sys
  exc=sys.exc_info()[1]
  result.update(reason=str(exc) if isinstance(exc,OriginHold) and str(exc) in REASONS else 'primary_source_read_unavailable',
                spoken='The original implementation is not verified yet. No code was installed or executed.')
  if isinstance(exc,HTTPError) and type(exc.code) is int and 100<=exc.code<=599:
   result['public_http_status']=exc.code
 result['read_evidence']=evidence;result['public_requests']=calls+len(redirects);result['public_bytes']=total
 return result
