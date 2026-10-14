"""Preparation/guard adapter for the existing workflow owner and coding executor.

This module never runs a model, tests, builder or live integration. The host supplies
actual loaded-runtime identity; model-selected paths/approved booleans are not authority.
"""
from __future__ import annotations
import hashlib
import importlib.util
import json
import os
import re
import subprocess
from pathlib import Path

STACK=Path(__file__).resolve().parents[1]


def _load(name):
    spec=importlib.util.spec_from_file_location('workflow_execution_'+name,Path(__file__).with_name(name+'.py'))
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);return module


def _sha(raw):return hashlib.sha256(raw).hexdigest()

def _digest(row):return _sha(json.dumps(row,sort_keys=True,separators=(',',':')).encode())


def _task(hive,mission_id):
    if not re.fullmatch(r'[a-f0-9]{32}',str(mission_id)):raise ValueError('invalid_mission')
    W=_load('workflow_workspace');root=Path(hive)/'coding-missions'/mission_id
    read=lambda name:W._regular_bytes(root/(name+'.json'),2_000_000 if name=='state' else 64000)[0]
    original=read('request');bound=read('binding');request=json.loads(original);binding=json.loads(bound)
    state=json.loads(read('state'));control=json.loads(read('control'));approval=json.loads(read('owner_approval'))
    if (request.get('mission_id')!=mission_id or request.get('worker_kind')!='research_build'
        or request.get('request_scope')!='transient_task' or control.get('cancel') is not False
        or state.get('mission_id')!=mission_id or state.get('worker_kind')!='research_build'
        or not isinstance(state.get('status'),str)
        or state.get('status') in {'COMPLETED','VERIFIED','DONE','SUCCEEDED','FAILED','CANCELLED','EXPIRED'}
        or (root/'result.json').exists() or approval.get('mission_id')!=mission_id
        or approval.get('kind')!='workflow_edits' or approval.get('scope')!='transient_task'
        or approval.get('authority')!='explicit_owner_answer' or approval.get('request_sha256')!=_sha(original)
        or approval.get('binding_sha256')!=_sha(bound) or approval.get('target')!=binding.get('repo')
        or approval.get('branch')!=binding.get('branch') or approval.get('configuration_changes_authorized') is not False
        or binding.get('branch') in {'main','master'}
        or not re.fullmatch(r'[\w./-]{1,80}',str(binding.get('branch','')))):
        raise ValueError('current_task_approval_required')
    return root,request,binding,{'request_sha256':_sha(original),'binding_sha256':_sha(bound),'approval_sha256':_sha(read('owner_approval'))}


def capture_runtime_baseline(runtime_repo,expected_identity):
    """Snapshot actual live bytes; expected_identity comes from host runtime ownership."""
    W=_load('workflow_workspace');C=_load('workflow_config_lock');R=_load('workflow_repo_context')
    repo=Path(runtime_repo);identity=R._git(repo)
    if not isinstance(expected_identity,dict) or identity!=expected_identity:raise ValueError('runtime_identity_unproved')
    files={}
    for rel in set(C.WHOLE_FILES+W.LOCKED):
        _,row=W._regular_bytes(repo/'apps/agent-stack'/rel);files['apps/agent-stack/'+rel]=row
    dirty={rel:files['apps/agent-stack/'+rel]['sha256'] for rel in W.LOCKED}
    lock=C.capture_lock(repo/'apps/agent-stack',dirty)
    if R._git(repo)!=identity:raise ValueError('runtime_changed')
    for rel,row in files.items():
        if W._regular_bytes(repo/rel)[1]!=row:raise ValueError('runtime_changed')
    return {'verification_method':'host_verified_current_runtime','source_repo':str(repo),
            'git_dir':identity['git_dir'],'git_common_dir':identity['git_common_dir'],
            'source_head':identity['head'],'source_branch':identity['branch'],'identity':identity,'files':files,
            'configuration_lock':lock,'configuration_digest':lock['digest'],'dirty_preimages':dirty}


def make_receipt(hive,mission_id,*,runtime_baseline,dependencies=()):
    """Build authority/snapshot receipt from host-owned retained state, not model claims."""
    W=_load('workflow_workspace');R=_load('workflow_repo_context')
    root,request,binding,task=_task(hive,mission_id);repo=Path(binding['repo']);identity=R._git(repo)
    if identity['branch']!=binding['branch']:raise ValueError('bound_source_branch_changed')
    if runtime_baseline.get('git_common_dir')!=identity['git_common_dir']:raise ValueError('runtime_project_mismatch')
    hand=W._hand();dep={}
    for rel in dependencies:
        path=Path(rel)
        if path.is_absolute() or '..' in path.parts or hand.PERM().is_secret_path(path):raise ValueError('unsafe_dependency')
        dep[str(path)]=W._regular_bytes(repo/path)[1]
    # Existing app's fixture dependency graph is captured exactly when present.
    events=repo/'fixtures/events'
    if events.exists():
        for path in events.rglob('*'):
            if path.is_symlink():raise ValueError('unsafe_fixture_dependency')
            if path.is_file():
                rel=str(path.relative_to(repo))
                if hand.PERM().is_secret_path(path):raise ValueError('secret_fixture_dependency')
                dep[rel]=W._regular_bytes(path)[1]
                if len(dep)>W.MAX_FILES:raise ValueError('dependency_budget')
    exceptions=_source_exceptions(hive,mission_id,fetch_public=True)
    files,excluded=W._snapshot(repo,'apps/agent-stack',hand,dep,lambda:exceptions)
    # Read-only Git index query uses an isolated environment and disables executable metadata hooks.
    env={'PATH':'/usr/bin:/bin','HOME':'/nonexistent','GIT_CONFIG_NOSYSTEM':'1','GIT_CONFIG_GLOBAL':'/dev/null','GIT_PAGER':'cat'}
    got=subprocess.run(['/usr/bin/git','-c','core.hooksPath=/dev/null','-c','core.fsmonitor=false','-c','core.attributesFile=/dev/null',
                        '-C',str(repo),'ls-files','-z','--','apps/agent-stack'],capture_output=True,env=env,timeout=5)
    if got.returncode or len(got.stdout)>2_000_000:raise ValueError('tracked_source_unavailable')
    tracked=[p for p in got.stdout.decode().split('\0') if p]
    # Exclude only paths actually omitted by the existing snapshot policy.
    # Missing ordinary tracked files must still fail closed.
    excluded_paths={Path(path) for path in excluded}
    excluded_tracked=[path for path in tracked if any(Path(path)==omit or omit in Path(path).parents for omit in excluded_paths)]
    eligible_tracked=[path for path in tracked if path not in set(excluded_tracked)]
    if not set(eligible_tracked).issubset(files):raise ValueError('tracked_source_missing')
    if R._git(repo)!=identity or _task(hive,mission_id)[3]!=task:raise ValueError('task_or_source_changed')
    app={rel:row for rel,row in files.items() if rel.startswith('apps/agent-stack/')}
    return {'verified':True,'verification_method':'owner_verified_current_checkout','source_repo':str(repo),
            'bound_source_repo':str(repo),'source_subtree':'apps/agent-stack','git_dir':identity['git_dir'],
            'git_common_dir':identity['git_common_dir'],'source_head':identity['head'],'source_branch':identity['branch'],
            'app_manifest':app,'tracked_app_paths':eligible_tracked,'excluded_tracked_app_paths':excluded_tracked,'source_excluded_paths':excluded,'locked_files':{'apps/agent-stack/'+rel:files['apps/agent-stack/'+rel] for rel in W.LOCKED},
            'source_exceptions':exceptions,'dependencies':dep,'integration_target':str(repo),'task_provenance':task}


def prepare_execution(hive,mission_id,*,source_receipt,runtime_baseline,scratch_root,active_fn):
    """Persist immutable authority/config contract before any owned-copy mutation."""
    root,request,binding,task=_task(hive,mission_id)
    if source_receipt.get('task_provenance')!=task or source_receipt.get('bound_source_repo')!=binding['repo']:
        raise ValueError('source_task_receipt_mismatch')
    C=_load('workflow_config_lock');W=_load('workflow_workspace')
    if source_receipt.get('source_exceptions',{})!=_source_exceptions(hive,mission_id):raise ValueError('source_exception_receipt_changed')
    runtime=Path(runtime_baseline['source_repo'])/'apps/agent-stack'
    if not C.validate_candidate(runtime_baseline['configuration_lock'],runtime,{},expected_digest=runtime_baseline['configuration_digest'])['ok']:
        raise ValueError('runtime_configuration_drift')
    contract={'version':1,'mission_id':mission_id,**task,'source_receipt_digest':_digest(source_receipt),
              'runtime_configuration_digest':runtime_baseline['configuration_digest'],
              'runtime_baseline_digest':_digest(runtime_baseline),'source_repo':binding['repo'],'source_branch':source_receipt['source_branch'],
              'source_head':source_receipt['source_head'],'working_copy':str(Path(scratch_root)/('workflow-'+mission_id)),
              'source_receipt':source_receipt,'runtime_baseline':runtime_baseline,'task_verified':False}
    contract['digest']=_digest(contract)
    raw=json.dumps(contract,sort_keys=True,separators=(',',':')).encode()
    if len(raw)>2_000_000:raise ValueError('execution_contract_budget')
    fd=os.open(root/'execution_contract.json',os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
    with os.fdopen(fd,'wb') as out:out.write(raw);out.flush();os.fsync(out.fileno())
    def active():
        try:return bool(active_fn()) and _task(hive,mission_id)[3]==task
        except Exception:return False
    result=W.prepare(mission_id,source_receipt=source_receipt,scratch_root=scratch_root,active_fn=active,runtime_baseline=runtime_baseline,source_exceptions=lambda:_source_exceptions(hive,mission_id))
    if not result.get('ok'):return result
    app=Path(result['working_copy'])/'apps/agent-stack'
    # Current selector AST must still match live; altered harness selectors need manual independent review.
    parity=C.validate_candidate(runtime_baseline['configuration_lock'],app,{},expected_digest=runtime_baseline['configuration_digest'])
    if not parity['ok']:return {**result,'ok':False,'status':'BLOCKED','reason':'working_copy_selector_review_required','task_verified':False}
    lock=C.capture_lock(app,{rel:runtime_baseline['files']['apps/agent-stack/'+rel]['sha256'] for rel in W.LOCKED})
    guard_receipt={'contract_digest':contract['digest'],'configuration_lock':lock,'configuration_digest':lock['digest'],'working_copy':result['working_copy']}
    fd=os.open(root/'execution_guard.json',os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
    with os.fdopen(fd,'w') as out:json.dump(guard_receipt,out,sort_keys=True);out.flush();os.fsync(out.fileno())
    return {**result,'execution_contract_digest':contract['digest'],'configuration_digest':lock['digest']}


def guard(hive,mission_id,*,expected_contract_digest,expected_configuration_digest,proposedwrites=None):
    """Host callback before every builder write/test/commit; no action performed here."""
    try:
        W=_load('workflow_workspace');C=_load('workflow_config_lock');R=_load('workflow_repo_context')
        root,request,binding,task=_task(hive,mission_id)
        row=json.loads(W._regular_bytes(root/'execution_contract.json',2_000_000)[0]);digest=row.pop('digest')
        if digest!=expected_contract_digest or _digest(row)!=digest or any(row.get(k)!=v for k,v in task.items()):raise ValueError('contract_changed')
        source=row['source_receipt'];identity=R._git(Path(source['source_repo']))
        if identity['head']!=source['source_head'] or identity['branch']!=source['source_branch']:raise ValueError('source_changed')
        if source.get('source_exceptions',{})!=_source_exceptions(hive,mission_id):raise ValueError('source_exception_receipt_changed')
        snapshot,_=W._snapshot(Path(source['source_repo']),'apps/agent-stack',W._hand(),source['dependencies'],lambda:_source_exceptions(hive,mission_id))
        if snapshot!={**source['app_manifest'],**source['dependencies']}:raise ValueError('source_changed')
        baseline=row['runtime_baseline']
        if R._git(Path(baseline['source_repo']))!=baseline['identity']:raise ValueError('runtime_identity_changed')
        for rel,expected in baseline['files'].items():
            if W._regular_bytes(Path(baseline['source_repo'])/rel)[1]!=expected:raise ValueError('runtime_preimage_changed')
        if not C.validate_candidate(baseline['configuration_lock'],Path(baseline['source_repo'])/'apps/agent-stack',{},expected_digest=baseline['configuration_digest'])['ok']:
            raise ValueError('runtime_configuration_changed')
        receipt=json.loads(W._regular_bytes(root/'execution_guard.json',2_000_000)[0])
        if (receipt.get('contract_digest')!=digest or receipt.get('working_copy')!=row['working_copy']
            or not expected_configuration_digest or receipt.get('configuration_digest')!=expected_configuration_digest):raise ValueError('guard_changed')
        return C.validate_candidate(receipt['configuration_lock'],Path(row['working_copy'])/'apps/agent-stack',proposedwrites or {},expected_digest=receipt['configuration_digest'])
    except (OSError,ValueError,TypeError,KeyError):return {'ok':False,'reason':'execution_authority_or_configuration_changed'}

_SOURCE_REVIEW_KEY=object()
class SourceReviewAuthority:
    def __init__(self,key):
        if key is not _SOURCE_REVIEW_KEY:raise ValueError('independent_source_review_required')
def source_review_authority():
    """Trusted independent host only; never a model tool."""
    return SourceReviewAuthority(_SOURCE_REVIEW_KEY)

def _new_json(path,row):
    raw=json.dumps(row,sort_keys=True,separators=(',',':')).encode()
    fd=os.open(path,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
    with os.fdopen(fd,'wb') as out:out.write(raw);out.flush();os.fsync(out.fileno())

def approve_source_exception(hive,mission_id,relative,expected_sha256,*,authority,evidence):
    if not isinstance(authority,SourceReviewAuthority) or not isinstance(evidence,dict) or not evidence:raise ValueError('independent_source_review_required')
    W=_load('workflow_workspace');R=_load('workflow_repo_context');root,request,binding,task=_task(hive,mission_id)
    path=Path(relative)
    if (path.is_absolute() or '..' in path.parts or not str(path).startswith('apps/agent-stack/')
        or path.suffix!='.py' or not re.fullmatch(r'test_[A-Za-z0-9_]+\.py',path.name)
        or any(part.startswith('.') or re.fullmatch(r'credentials?|secrets?|keys?|passwords?',part,re.I) for part in path.parts)):
        raise ValueError('source_exception_class_refused')
    raw,row=W._regular_bytes(Path(binding['repo'])/path,64000);hand=W._hand()
    if row['sha256']!=expected_sha256 or hand._SECRETISH.search(raw.decode()):raise ValueError('source_exception_content_refused')
    identity=R._git(Path(binding['repo']))
    record={'version':1,'mission_id':mission_id,'relative':str(path),'source_repo':binding['repo'],'source_identity':identity,
            'file':row,'task_provenance':task,'authority':'independent_exact_public_source_review','evidence':evidence}
    record['digest']=_digest(record);_new_json(root/'source_exception_review.json',record);return record

def _source_exceptions(hive,mission_id,*,fetch_public=False,fetch_fn=None):
    import base64
    W=_load('workflow_workspace');R=_load('workflow_repo_context');root,request,binding,task=_task(hive,mission_id)
    if not (root/'source_exception_review.json').exists():return {}
    review=json.loads(W._regular_bytes(root/'source_exception_review.json',128000)[0]);unsigned=dict(review);signature=unsigned.pop('digest',None)
    if (_digest(unsigned)!=signature or review.get('authority')!='independent_exact_public_source_review'
        or review.get('mission_id')!=mission_id or review.get('task_provenance')!=task or review.get('source_repo')!=binding['repo']
        or review.get('source_identity')!=R._git(Path(binding['repo']))):raise ValueError('source_exception_review_changed')
    relative=review['relative'];raw,row=W._regular_bytes(Path(binding['repo'])/relative,64000)
    if row!=review['file'] or W._hand()._SECRETISH.search(raw.decode()):raise ValueError('source_exception_content_changed')
    blob=hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()
    env={'PATH':'/usr/bin:/bin','HOME':'/nonexistent','GIT_CONFIG_NOSYSTEM':'1','GIT_CONFIG_GLOBAL':'/dev/null'}
    tracked=subprocess.run(['/usr/bin/git','-c','core.hooksPath=/dev/null','-c','core.fsmonitor=false','-c','core.attributesFile=/dev/null','-C',binding['repo'],'ls-files','--stage','--',relative],capture_output=True,text=True,env=env,timeout=4)
    if tracked.returncode or tracked.stdout.strip()!=('100644 '+blob+' 0\t'+relative):raise ValueError('public_source_tracked_blob_required')
    repository=review['source_identity']['remote_repository_ids']
    if len(repository)!=1:raise ValueError('public_source_repository_ambiguous')
    endpoint='/repos/'+repository[0]+'/git/blobs/'+blob
    proof_path=root/'source_exception_public.json'
    if proof_path.exists():proof=json.loads(W._regular_bytes(proof_path,128000)[0])
    elif fetch_public:
        fetch=fetch_fn or _load('workflow_origin')._public_get
        body=fetch(endpoint,timeout=4,max_bytes=100000)
        if isinstance(body,(bytes,str)):body=json.loads(body)
        if body.get('sha')!=blob or body.get('encoding')!='base64':raise ValueError('public_source_blob_unproved')
        public=base64.b64decode(body.get('content',''),validate=False)
        if public!=raw:raise ValueError('public_source_blob_mismatch')
        proof={'review_digest':signature,'endpoint':endpoint,'blob_sha':blob,'sha256':row['sha256'],'public_response_digest':_digest(body),'verification_method':'independent_public_git_blob'}
        proof['digest']=_digest(proof);_new_json(proof_path,proof)
    else:raise ValueError('public_source_proof_required')
    unsigned=dict(proof);signature=unsigned.pop('digest',None)
    if (_digest(unsigned)!=signature or proof.get('review_digest')!=review['digest'] or proof.get('endpoint')!=endpoint
        or proof.get('sha256')!=row['sha256'] or proof.get('blob_sha')!=blob or proof.get('verification_method')!='independent_public_git_blob'):
        raise ValueError('public_source_proof_changed')
    return {relative:{'file':row,'public_proof':proof,'review_digest':review['digest']}}

def _rename_exclusive(source,target):
    """macOS atomic no-replace directory/file move, never os.rename overwrite."""
    import ctypes,errno
    library=ctypes.CDLL(None,use_errno=True)
    rename=getattr(library,'renamex_np',None)
    if rename is None:raise ValueError('exclusive_archive_move_unavailable')
    rename.argtypes=[ctypes.c_char_p,ctypes.c_char_p,ctypes.c_uint];rename.restype=ctypes.c_int
    if rename(os.fsencode(source),os.fsencode(target),4)!=0:
        raise OSError(ctypes.get_errno(),'exclusive preparation archive move failed')

def recover_preparation(hive,mission_id,*,active_fn):
    """Preserve an exact, clean pre-builder attempt; canonical preparation starts afresh."""
    W=_load('workflow_workspace');root,request,binding,task=_task(hive,mission_id);hand=W._hand()
    def active():
        if not active_fn() or _task(hive,mission_id)[3]!=task:raise ValueError('preparation_recovery_cancelled')
        if any((root/name).exists() for name in ('execution_guard.json','execution_owner.json','coding_child.json','result.json')):
            raise ValueError('preparation_recovery_builder_or_guard_present')
    active();canonical=root/'execution_contract.json';history=root/'preparation-history';pending=[]
    if history.exists():
        if history.is_symlink():raise ValueError('unsafe_preparation_history')
        pending=[p for p in history.iterdir() if p.is_dir() and (p/'plan.json').exists() and not (p/'completed.json').exists()]
        if len(pending)>1:raise ValueError('ambiguous_preparation_recovery')
    if pending:
        archive=pending[0];plan=json.loads(W._regular_bytes(archive/'plan.json',2_000_000)[0]);contract=plan['contract']
        unsigned_plan=dict(plan);signature=unsigned_plan.pop('digest',None)
        if _digest(unsigned_plan)!=signature:raise ValueError('preparation_archive_plan_changed')
    elif canonical.exists():
        raw,_=W._regular_bytes(canonical,2_000_000);contract=json.loads(raw);unsigned=dict(contract);signature=unsigned.pop('digest',None)
        if _digest(unsigned)!=signature or any(contract.get(k)!=v for k,v in task.items()):raise ValueError('preparation_contract_changed')
        original=Path(contract['working_copy'])
        if any(p.is_symlink() for p in (original,*original.parents)):raise ValueError('unsafe_preparation_copy')
        if original.name!='workflow-'+mission_id or original.parent not in hand.PERM().scratch_roots():raise ValueError('unowned_preparation_copy')
        archive=history/signature
        if archive.exists():raise ValueError('preparation_archive_already_completed')
        source=contract['source_receipt'];expected={**source['app_manifest'],**source.get('dependencies',{}),**contract['runtime_baseline']['files']}
        expected={rel:{'sha256':row['sha256'],'mode':row['mode']} for rel,row in expected.items()}
        snapshot=hand.code_repo_snapshot(original)
        if snapshot['files']!=expected or snapshot['branch']!='jarvis/workflow-'+mission_id:raise ValueError('preparation_copy_changed')
        if (hand._git(original,'status','--porcelain').stdout.strip() or hand._git(original,'rev-list','--count','HEAD').stdout.strip()!='1'
            or hand._git(original,'log','-1','--format=%s').stdout.strip()!='jarvis: exact project source baseline '+mission_id):raise ValueError('unproved_preparation_baseline')
        history.mkdir(exist_ok=True,mode=0o700);archive.mkdir(mode=0o700)
        plan={'version':1,'mission_id':mission_id,'task_provenance':task,'contract':contract,'contract_sha256':_sha(raw),
              'snapshot':snapshot,'original_copy':str(original),'archived_copy':str(original.with_name(original.name+'-preparation-'+signature[:16]))}
        plan['digest']=_digest(plan)
        _new_json(archive/'plan.json',plan)
    else:return {'recovered':False}
    unsigned_contract=dict(contract);signature=unsigned_contract.pop('digest',None)
    if plan.get('task_provenance')!=task or signature!=archive.name or _digest(unsigned_contract)!=signature or any(contract.get(k)!=v for k,v in task.items()):raise ValueError('preparation_recovery_scope_changed')
    original=Path(plan['original_copy']);moved=Path(plan['archived_copy'])
    if original.name!='workflow-'+mission_id or moved!=original.with_name(original.name+'-preparation-'+archive.name[:16]) or original.parent not in hand.PERM().scratch_roots():raise ValueError('unowned_preparation_copy')
    def relocated_snapshot(path):
        row=hand.code_repo_snapshot(path);row['repo']=plan['snapshot']['repo'];return row
    candidate=original if original.exists() else moved
    if any(p.is_symlink() for p in (candidate,*candidate.parents,archive,*archive.parents)):raise ValueError('unsafe_preparation_archive')
    if relocated_snapshot(candidate)!=plan['snapshot'] or hand._git(candidate,'status','--porcelain').stdout.strip():raise ValueError('preparation_copy_changed')
    active()
    if original.exists():_rename_exclusive(original,moved)
    if relocated_snapshot(moved)!=plan['snapshot']:raise ValueError('preparation_copy_changed')
    active();archived_contract=archive/'execution_contract.json'
    if canonical.exists():
        if _sha(W._regular_bytes(canonical,2_000_000)[0])!=plan['contract_sha256']:raise ValueError('preparation_contract_changed')
        _rename_exclusive(canonical,archived_contract)
    if _sha(W._regular_bytes(archived_contract,2_000_000)[0])!=plan['contract_sha256']:raise ValueError('archived_contract_changed')
    active();_new_json(archive/'completed.json',{'task_provenance':task,'preserved_snapshot_sha256':_digest(plan['snapshot']),'archived_copy':str(moved),'original_contract_digest':contract['digest']})
    return {'recovered':True,'archive':str(archive),'preserved_copy':str(moved)}

def source_exception_guard(hive,mission_id,repo):
    """Host-only exact owned-copy callback, revalidated on every use."""
    W=_load('workflow_workspace');root,request,binding,task=_task(hive,mission_id)
    contract=json.loads(W._regular_bytes(root/'execution_contract.json',2_000_000)[0])
    expected=Path(contract['working_copy']).resolve()
    if Path(repo).resolve()!=expected:raise ValueError('source_exception_working_copy_mismatch')
    def allowed(actual,relative,sha):
        if Path(actual).resolve()!=expected:return False
        row=_source_exceptions(hive,mission_id).get(relative)
        return bool(row and (sha is None or row['file']['sha256']==sha and row['public_proof']['sha256']==sha))
    return allowed
