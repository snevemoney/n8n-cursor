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
    for rel in W._runtime_configuration_paths(lock,C):
        _,row=W._regular_bytes(repo/'apps/agent-stack'/rel);files['apps/agent-stack/'+rel]=row
    if len(files)>W.MAX_FILES or sum(row['size'] for row in files.values())>W.MAX_BYTES:raise ValueError('runtime_configuration_overlay_budget')
    if not C.validate_candidate(lock,repo/'apps/agent-stack',{},expected_digest=lock['digest'])['ok']:raise ValueError('runtime_configuration_changed')
    executor_files={}
    for rel in EXECUTOR_FILES+('hands/workflow_delivery.py','hands/workflow_research.py','hands/project_methods.py'):
        _,row=W._regular_bytes(repo/'apps/agent-stack'/rel);executor_files['apps/agent-stack/'+rel]=row
    if R._git(repo)!=identity:raise ValueError('runtime_changed')
    for rel,row in {**files,**executor_files}.items():
        if W._regular_bytes(repo/rel)[1]!=row:raise ValueError('runtime_changed')
    return {'verification_method':'host_verified_current_runtime','source_repo':str(repo),
            'git_dir':identity['git_dir'],'git_common_dir':identity['git_common_dir'],
            'source_head':identity['head'],'source_branch':identity['branch'],'identity':identity,'files':files,
            'configuration_lock':lock,'configuration_digest':lock['digest'],'dirty_preimages':dirty,'executor_files':executor_files}


def approve_source_revision(hive,mission_id,revision,expected_manifest,*,authority,evidence,dependencies=()):
    """Host review binds the exact intended source; dirty omissions require review."""
    if not isinstance(authority,SourceReviewAuthority) or not isinstance(evidence,dict) or not evidence:
        raise ValueError('independent_source_review_required')
    W=_load('workflow_workspace');root,_,binding,task=_task(hive,mission_id)
    exceptions=_source_exceptions(hive,mission_id,fetch_public=True,revision=revision)
    data,meta=W.revision_source(Path(binding['repo']),revision,dependencies=dependencies,source_exceptions=lambda:exceptions,active_fn=lambda:_task(hive,mission_id)[3]==task)
    manifest={rel:row for rel,(_,row) in data.items()}
    if not isinstance(expected_manifest,dict) or manifest!=expected_manifest:raise ValueError('reviewed_source_manifest_mismatch')
    row={'version':1,'authority':'independent_immutable_source_review','task_provenance':task,
         'source_repo':binding['repo'],'source_revision':revision,'source_tree':meta['source_tree'],
         'manifest':manifest,'evidence':evidence,'dirty_files_preserved':True}
    if _task(hive,mission_id)[3]!=task:raise ValueError('source_review_task_changed')
    row['digest']=_digest(row);_new_json(root/'source_revision_review.json',row);return row


def host_review_source_revision(hive, mission_id, *, dependencies=()):
    """Deterministically pin and double-read the immutable builder source.

    This parent-mission verifier runs before a separate coding worker exists.
    It accepts no model-selected revision or manifest and never checks out or
    mutates the owner repository.
    """
    W=_load('workflow_workspace');R=_load('workflow_repo_context')
    root,_,binding,task=_task(hive,mission_id);repo=Path(binding['repo'])
    identity=R._git(repo);revision=identity['head']
    files,metadata=W.revision_source(repo,revision,dependencies=dependencies,
        source_exceptions=lambda:_source_exceptions(hive,mission_id,fetch_public=True,revision=revision),
        active_fn=lambda:_task(hive,mission_id)[3]==task)
    manifest={rel:row for rel,(_,row) in files.items()}
    evidence={'verification_method':'deterministic_parent_immutable_source_review',
              'source_revision':revision,'source_tree':metadata['source_tree'],
              'manifest_sha256':_digest(manifest),'source_checkout_unchanged':True}
    return approve_source_revision(hive,mission_id,revision,manifest,
        authority=source_review_authority(),evidence=evidence,dependencies=dependencies)


def make_receipt(hive,mission_id,*,runtime_baseline,dependencies=()):
    """Resolve the approved revision once; freeze Git objects rather than checkout bodies."""
    W=_load('workflow_workspace');R=_load('workflow_repo_context')
    root,request,binding,task=_task(hive,mission_id);repo=Path(binding['repo']);identity=R._git(repo)
    if runtime_baseline.get('git_common_dir')!=identity['git_common_dir']:raise ValueError('runtime_project_mismatch')
    review=json.loads(W._regular_bytes(root/'source_revision_review.json',2_000_000)[0]);unsigned=dict(review);signature=unsigned.pop('digest',None)
    if (_digest(unsigned)!=signature or review.get('authority')!='independent_immutable_source_review'
        or review.get('task_provenance')!=task or review.get('source_repo')!=binding['repo']):raise ValueError('validated_source_revision_required')
    revision=review['source_revision']
    exceptions=_source_exceptions(hive,mission_id,fetch_public=True,revision=revision)
    data,metadata=W.revision_source(repo,revision,dependencies=dependencies,source_exceptions=lambda:exceptions,
                                   active_fn=lambda:_task(hive,mission_id)[3]==task)
    if {rel:row for rel,(_,row) in data.items()}!=review['manifest']:raise ValueError('reviewed_source_manifest_mismatch')
    bundle=W.seal_source(data,store_root=Path(hive)/'workflow-sources',source_revision=revision,
                         source_tree=metadata['source_tree'],active_fn=lambda:_task(hive,mission_id)[3]==task)
    files={rel:row for rel,(_,row) in data.items()};app={rel:row for rel,row in files.items() if rel.startswith('apps/agent-stack/')}
    dep={rel:row for rel,row in files.items() if not rel.startswith('apps/agent-stack/')}
    if _task(hive,mission_id)[3]!=task:raise ValueError('task_changed_during_source_freeze')
    return {'verified':True,'verification_method':'owner_verified_immutable_revision','source_repo':str(repo),
            'bound_source_repo':str(repo),'source_subtree':'apps/agent-stack','git_dir':identity['git_dir'],
            'git_common_dir':identity['git_common_dir'],'source_head':revision,'source_branch':identity['branch'],
            'source_revision_review_digest':signature,'source_bundle':bundle,'app_manifest':app,'tracked_app_paths':sorted(app),
            'excluded_tracked_app_paths':metadata['excluded'],'source_excluded_paths':metadata['excluded'],
            'locked_files':{'apps/agent-stack/'+rel:files['apps/agent-stack/'+rel] for rel in W.LOCKED},
            'source_exceptions':exceptions,'dependencies':dep,'integration_target':str(repo),'task_provenance':task,
            'checkout_modified':False,'checkout_dirty_files_preserved_in_place':True}


def prepare_execution(hive,mission_id,*,source_receipt,runtime_baseline,scratch_root,active_fn):
    """Persist immutable authority/config contract before any owned-copy mutation."""
    root,request,binding,task=_task(hive,mission_id)
    if source_receipt.get('task_provenance')!=task or source_receipt.get('bound_source_repo')!=binding['repo']:
        raise ValueError('source_task_receipt_mismatch')
    C=_load('workflow_config_lock');W=_load('workflow_workspace')
    frozen=source_receipt.get('verification_method')=='owner_verified_immutable_revision'
    exceptions=_retained_source_exceptions(hive,mission_id,source_receipt) if frozen else _source_exceptions(hive,mission_id)
    if source_receipt.get('source_exceptions',{})!=exceptions:raise ValueError('source_exception_receipt_changed')
    runtime=Path(runtime_baseline['source_repo'])/'apps/agent-stack'
    if not C.validate_candidate(runtime_baseline['configuration_lock'],runtime,{},expected_digest=runtime_baseline['configuration_digest'])['ok']:
        raise ValueError('runtime_configuration_drift')
    if frozen:
        source_manifest=W.verify_source_bundle(source_receipt['source_bundle'])
        data={rel:W.frozen_source_bytes(source_receipt['source_bundle'],rel,source_manifest) for rel in source_manifest['files']}
        tree=source_manifest['source_tree']
    else:
        original=Path(source_receipt['source_repo']);rows={**source_receipt['app_manifest'],**source_receipt.get('dependencies',{})}
        data={rel:W._regular_bytes(original/rel) for rel in rows}
        if any(data[rel][1]!=row for rel,row in rows.items()):raise ValueError('source_manifest_mismatch')
        tree=source_receipt['source_head']
    for rel,row in runtime_baseline['files'].items():
        raw,now=W._regular_bytes(Path(runtime_baseline['source_repo'])/rel)
        if now!=row:raise ValueError('runtime_configuration_drift')
        data[rel]=(raw,row)
    executor_data=dict(data)
    required={'apps/agent-stack/'+name for name in EXECUTOR_FILES+('hands/workflow_delivery.py','hands/workflow_research.py','hands/project_methods.py')}
    if set(runtime_baseline.get('executor_files',{}))!=required:raise ValueError('complete_host_executor_required')
    for rel,row in runtime_baseline['executor_files'].items():
        raw,now=W._regular_bytes(Path(runtime_baseline['source_repo'])/rel)
        if now!=row:raise ValueError('host_executor_changed_during_preparation')
        executor_data[rel]=(raw,row)
    executor_bundle=W.seal_source(executor_data,store_root=Path(hive)/'workflow-sources',source_revision=source_receipt['source_head'],
                                  source_tree=tree,active_fn=active_fn)
    contract={'version':1,'mission_id':mission_id,**task,'source_receipt_digest':_digest(source_receipt),
              'runtime_configuration_digest':runtime_baseline['configuration_digest'],
              'runtime_baseline_digest':_digest(runtime_baseline),'source_repo':binding['repo'],'source_branch':source_receipt['source_branch'],
              'source_head':source_receipt['source_head'],'working_copy':str(Path(scratch_root)/('workflow-'+mission_id)),
              'source_receipt':source_receipt,'runtime_baseline':runtime_baseline,'executor_bundle':executor_bundle,'task_verified':False}
    contract['digest']=_digest(contract)
    raw=json.dumps(contract,sort_keys=True,separators=(',',':')).encode()
    if len(raw)>2_000_000:raise ValueError('execution_contract_budget')
    fd=os.open(root/'execution_contract.json',os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
    with os.fdopen(fd,'wb') as out:out.write(raw);out.flush();os.fsync(out.fileno())
    def active():
        try:return bool(active_fn()) and _task(hive,mission_id)[3]==task
        except Exception:return False
    result=W.prepare(mission_id,source_receipt=source_receipt,scratch_root=scratch_root,active_fn=active,runtime_baseline=runtime_baseline,source_exceptions=lambda:_retained_source_exceptions(hive,mission_id,source_receipt) if frozen else _source_exceptions(hive,mission_id))
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
        source=row['source_receipt']
        frozen=source.get('verification_method')=='owner_verified_immutable_revision'
        if frozen:
            reviewed=json.loads(W._regular_bytes(root/'source_revision_review.json',2_000_000)[0]);unsigned_review=dict(reviewed);review_digest=unsigned_review.pop('digest',None)
            if (review_digest!=source.get('source_revision_review_digest') or _digest(unsigned_review)!=review_digest
                or reviewed.get('task_provenance')!=task or reviewed.get('manifest')!={**source['app_manifest'],**source['dependencies']}
                or reviewed.get('source_revision')!=source['source_head']):raise ValueError('source_revision_review_changed')
            exceptions=_retained_source_exceptions(hive,mission_id,source)
            snapshot=W.verify_source_bundle(source['source_bundle'])['files']
        else:
            identity=R._git(Path(source['source_repo']))
            if identity['head']!=source['source_head'] or identity['branch']!=source['source_branch']:raise ValueError('source_changed')
            exceptions=_source_exceptions(hive,mission_id)
            snapshot,_=W._snapshot(Path(source['source_repo']),'apps/agent-stack',W._hand(),source['dependencies'],lambda:exceptions)
        if source.get('source_exceptions',{})!=exceptions:raise ValueError('source_exception_receipt_changed')
        if snapshot!={**source['app_manifest'],**source['dependencies']}:raise ValueError('source_changed')
        baseline=row['runtime_baseline']
        runtime_identity=R._git(Path(baseline['source_repo']))
        if any(runtime_identity.get(key)!=baseline['identity'].get(key) for key in ('git_dir','git_common_dir','branch')):raise ValueError('runtime_identity_changed')
        commit=subprocess.run(['/usr/bin/git','--no-replace-objects','-C',baseline['source_repo'],'cat-file','-t',runtime_identity['head']],capture_output=True,text=True,timeout=4)
        if commit.returncode or commit.stdout.strip()!='commit':raise ValueError('runtime_revision_unavailable')
        for rel,expected in baseline['files'].items():
            # Model/dirty bytes remain exact; unrelated engineering commits no longer revoke an immutable job.
            if (not frozen or rel in {'apps/agent-stack/'+name for name in set(C.WHOLE_FILES+W.LOCKED)}):
                if W._regular_bytes(Path(baseline['source_repo'])/rel)[1]!=expected:raise ValueError('runtime_preimage_changed')
        if not C.validate_candidate(baseline['configuration_lock'],Path(baseline['source_repo'])/'apps/agent-stack',{},expected_digest=baseline['configuration_digest'])['ok']:
            raise ValueError('runtime_configuration_changed')
        receipt=json.loads(W._regular_bytes(root/'execution_guard.json',2_000_000)[0])
        if (receipt.get('contract_digest')!=digest or receipt.get('working_copy')!=row['working_copy']
            or not expected_configuration_digest or receipt.get('configuration_digest')!=expected_configuration_digest):raise ValueError('guard_changed')
        return C.validate_candidate(receipt['configuration_lock'],Path(row['working_copy'])/'apps/agent-stack',proposedwrites or {},expected_digest=receipt['configuration_digest'])
    except (OSError,ValueError,TypeError,KeyError):return {'ok':False,'reason':'execution_authority_or_configuration_changed'}

def runtime_drift_reason(hive,mission_id):
    """Why the loaded runtime no longer matches this preparation's frozen baseline, else None.
    Read-only; mirrors the runtime half of guard()."""
    W=_load('workflow_workspace');C=_load('workflow_config_lock')
    root=Path(hive)/'coding-missions'/mission_id
    try:row=json.loads(W._regular_bytes(root/'execution_contract.json',2_000_000)[0])
    except (OSError,ValueError):return None
    baseline=row.get('runtime_baseline') or {}
    if (row.get('source_receipt') or {}).get('verification_method')!='owner_verified_immutable_revision':return None
    locked={'apps/agent-stack/'+name for name in set(C.WHOLE_FILES+W.LOCKED)}
    try:
        for rel,expected in baseline['files'].items():
            if rel in locked and W._regular_bytes(Path(baseline['source_repo'])/rel)[1]!=expected:return 'runtime_preimage_changed'
        check=C.validate_candidate(baseline['configuration_lock'],Path(baseline['source_repo'])/'apps/agent-stack',{},expected_digest=baseline['configuration_digest'])
    except (OSError,ValueError,TypeError,KeyError):return 'runtime_baseline_unreadable'
    if not check.get('ok'):return str(check.get('reason') or 'runtime_configuration_changed')
    bundle=row.get('executor_bundle') or {}
    if bundle.get('root'):
        frozen_stack=Path(bundle['root'])/'apps/agent-stack';live_stack=Path(baseline['source_repo'])/'apps/agent-stack'
        for name in EXECUTOR_FILES:
            try:
                if _sha((frozen_stack/name).read_bytes())!=_sha((live_stack/name).read_bytes()):return 'executor_changed'
            except OSError:return 'executor_changed'
    return None


def retire_runtime_drift_preparation(hive,mission_id,*,reason,now=None):
    """Owner continue after a runtime update: move (never delete) the stale preparation and its
    untouched working copy aside so canonical preparation re-runs against the current runtime."""
    import time
    root=Path(hive)/'coding-missions'/mission_id
    if not reason:raise ValueError('runtime_drift_unproven')
    stamp=time.strftime('%Y%m%d-%H%M%S',time.localtime(now or time.time()))
    history=root/'preparation-history'
    if history.is_symlink():raise ValueError('unsafe_preparation_history')
    archive=history/('runtime-drift-'+stamp);archive.mkdir(parents=True,exist_ok=False)
    contract=json.loads((root/'execution_contract.json').read_text()) if (root/'execution_contract.json').exists() else {}
    copy=Path(str(contract.get('working_copy') or ''))
    moved_copy=None
    if contract.get('working_copy') and copy.is_dir():
        if copy.name!='workflow-'+mission_id or copy.is_symlink():raise ValueError('unowned_preparation_copy')
        moved_copy=copy.with_name(copy.name+'-runtime-drift-'+stamp);os.rename(copy,moved_copy)
    moved=[]
    for name in ('execution_owner.json','execution_guard.json','execution_contract.json','coding_child.json'):
        if (root/name).exists():os.rename(root/name,archive/name);moved.append(name)
    (archive/'retired.json').write_text(json.dumps({'reason':reason,'at':time.time(),'files':moved,
        'working_copy':str(copy) if moved_copy else None,'moved_working_copy':str(moved_copy) if moved_copy else None},sort_keys=True))
    return {'archive':str(archive),'files':moved,'moved_working_copy':str(moved_copy) if moved_copy else None}


EXECUTOR_FILES=('hands/coding_mission.py','hands/agent_tools.py','hands/permissions.py',
                'brain/mission_controller.py','memory/bus_io.py','hands/workflow_execution.py',
                'hands/workflow_workspace.py','hands/workflow_config_lock.py','hands/workflow_repo_context.py',
                'hands/workflow_origin.py')


def prepared_executor(hive,mission_id,*,contract_digest,configuration_digest):
    """Mint only from the existing host preparation after its complete guard passes."""
    if guard(hive,mission_id,expected_contract_digest=contract_digest,
             expected_configuration_digest=configuration_digest,proposedwrites={}).get('ok') is not True:
        raise ValueError('prepared_executor_guard_rejected')
    W=_load('workflow_workspace');root,_,_,_=_task(hive,mission_id)
    contract=json.loads(W._regular_bytes(root/'execution_contract.json',2_000_000)[0])
    if contract.get('digest')!=contract_digest:raise ValueError('executor_contract_changed')
    bundle=contract.get('executor_bundle');manifest=W.verify_source_bundle(bundle)
    stack=Path(bundle['root'])/'apps/agent-stack'
    receipt={'version':1,'entrypoint':str(stack/'hands/coding_mission.py'),'stack':str(stack),'bundle':bundle,
             'source_manifest':{name:manifest['files']['apps/agent-stack/'+name]['sha256'] for name in EXECUTOR_FILES}}
    receipt['digest']=_digest(receipt)
    if not validate_executor(receipt):raise ValueError('prepared_executor_invalid')
    return receipt


def validate_executor(receipt):
    """Integrity only. Caller must also bind this receipt to the private host owner."""
    try:
        if not isinstance(receipt,dict) or set(receipt)!={'version','entrypoint','stack','bundle','source_manifest','digest'}:return False
        unsigned=dict(receipt);digest=unsigned.pop('digest')
        if receipt['version']!=1 or _digest(unsigned)!=digest:return False
        W=_load('workflow_workspace');manifest=W.verify_source_bundle(receipt['bundle'])
        stack=Path(receipt['bundle']['root'])/'apps/agent-stack'
        return (receipt['stack']==str(stack) and receipt['entrypoint']==str(stack/'hands/coding_mission.py')
                and receipt['source_manifest']=={name:manifest['files']['apps/agent-stack/'+name]['sha256'] for name in EXECUTOR_FILES})
    except (OSError,ValueError,KeyError,TypeError):return False


def _retained_source_exceptions(hive,mission_id,source):
    """Recheck exact private review/proof, not a mutable checkout or index."""
    expected=source.get('source_exceptions',{})
    if not expected:return {}
    W=_load('workflow_workspace');root,_,_,task=_task(hive,mission_id)
    review=json.loads(W._regular_bytes(root/'source_exception_review.json',128000)[0])
    proof=json.loads(W._regular_bytes(root/'source_exception_public.json',128000)[0])
    for record in (review,proof):
        unsigned=dict(record);digest=unsigned.pop('digest',None)
        if _digest(unsigned)!=digest:raise ValueError('source_exception_receipt_changed')
    if (review.get('authority')!='independent_exact_public_source_review' or review.get('task_provenance')!=task
        or review.get('mission_id')!=mission_id or proof.get('verification_method')!='independent_public_git_blob'):
        raise ValueError('source_exception_authority_changed')
    actual={review['relative']:{'file':review['file'],'public_proof':proof,'review_digest':review['digest']}}
    if actual!=expected or proof.get('review_digest')!=review['digest'] or proof.get('sha256')!=review['file']['sha256']:
        raise ValueError('source_exception_receipt_changed')
    return actual


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

def _source_exceptions(hive,mission_id,*,fetch_public=False,fetch_fn=None,revision=None):
    import base64
    W=_load('workflow_workspace');R=_load('workflow_repo_context');root,request,binding,task=_task(hive,mission_id)
    if not (root/'source_exception_review.json').exists():return {}
    review=json.loads(W._regular_bytes(root/'source_exception_review.json',128000)[0]);unsigned=dict(review);signature=unsigned.pop('digest',None)
    if (_digest(unsigned)!=signature or review.get('authority')!='independent_exact_public_source_review'
        or review.get('mission_id')!=mission_id or review.get('task_provenance')!=task or review.get('source_repo')!=binding['repo']
        or (revision is None and review.get('source_identity')!=R._git(Path(binding['repo'])))):raise ValueError('source_exception_review_changed')
    relative=review['relative']
    if revision is None:raw,row=W._regular_bytes(Path(binding['repo'])/relative,64000)
    else:
        if not re.fullmatch(r'[a-f0-9]{40}(?:[a-f0-9]{24})?',revision):raise ValueError('immutable_revision_required')
        current=R._git(Path(binding['repo']))
        if any(current.get(k)!=review['source_identity'].get(k) for k in ('git_dir','git_common_dir','remote_repository_ids')):raise ValueError('source_exception_repository_changed')
        got=subprocess.run(['/usr/bin/git','--no-replace-objects','-C',binding['repo'],'show',revision+':'+relative],capture_output=True,env={'PATH':'/usr/bin:/bin','HOME':'/nonexistent','GIT_CONFIG_NOSYSTEM':'1','GIT_CONFIG_GLOBAL':'/dev/null','GIT_OPTIONAL_LOCKS':'0'},timeout=4)
        if got.returncode or len(got.stdout)>64000:raise ValueError('source_exception_blob_unavailable')
        raw=got.stdout;row={'sha256':_sha(raw),'mode':review['file']['mode'],'size':len(raw)}
    if row!=review['file'] or W._hand()._SECRETISH.search(raw.decode()):raise ValueError('source_exception_content_changed')
    blob=hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()
    env={'PATH':'/usr/bin:/bin','HOME':'/nonexistent','GIT_CONFIG_NOSYSTEM':'1','GIT_CONFIG_GLOBAL':'/dev/null'}
    if revision is None:
        tracked=subprocess.run(['/usr/bin/git','-c','core.hooksPath=/dev/null','-c','core.fsmonitor=false','-c','core.attributesFile=/dev/null','-C',binding['repo'],'ls-files','--stage','--',relative],capture_output=True,text=True,env=env,timeout=4)
        if tracked.returncode or tracked.stdout.strip()!=('100644 '+blob+' 0\t'+relative):raise ValueError('public_source_tracked_blob_required')
    else:
        pinned=subprocess.run(['/usr/bin/git','--no-replace-objects','-C',binding['repo'],'ls-tree',revision,'--',relative],capture_output=True,text=True,env=env,timeout=4)
        if pinned.returncode or pinned.stdout.strip()!=('100644 blob '+blob+'\t'+relative):raise ValueError('public_source_tracked_blob_required')
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
        if _task(hive,mission_id)[3]!=task or (revision is None and R._git(Path(binding['repo']))!=review['source_identity']):raise ValueError('source_exception_task_changed')
        proof['digest']=_digest(proof);_new_json(proof_path,proof)
    else:raise ValueError('public_source_proof_required')
    unsigned=dict(proof);signature=unsigned.pop('digest',None)
    if (_digest(unsigned)!=signature or proof.get('review_digest')!=review['digest'] or proof.get('endpoint')!=endpoint
        or proof.get('sha256')!=row['sha256'] or proof.get('blob_sha')!=blob or proof.get('verification_method')!='independent_public_git_blob'):
        raise ValueError('public_source_proof_changed')
    return {relative:{'file':row,'public_proof':proof,'review_digest':review['digest']}}

def _rename_exclusive(source,target):
    """Atomic no-replace directory/file move (macOS renamex_np, Linux renameat2), never os.rename overwrite."""
    import ctypes
    rename=_load('workflow_workspace').rename_noreplace_fn()
    if rename is None:raise ValueError('exclusive_archive_move_unavailable')
    if rename(source,target)!=0:
        raise OSError(ctypes.get_errno(),'exclusive preparation archive move failed')

def recover_preparation(hive,mission_id,*,active_fn):
    if (Path(hive)/"coding-missions"/mission_id/"legacy_migration_review.json").exists():
        return _recover_legacy_migration(hive,mission_id,active_fn=active_fn)
    """Preserve an exact, clean pre-builder attempt; canonical preparation starts afresh."""
    W=_load('workflow_workspace');root,request,binding,task=_task(hive,mission_id);hand=W._hand()
    def active():
        if not active_fn() or _task(hive,mission_id)[3]!=task:raise ValueError('preparation_recovery_cancelled')
        if any((root/name).exists() for name in ('execution_guard.json','execution_owner.json','coding_child.json','result.json')):
            raise ValueError('preparation_recovery_builder_or_guard_present')
    # A failed owned copy may already contain the independently reviewed public
    # test. Authorize only its exact current proof, never a generic secret path.
    active()
    _source_exceptions(hive,mission_id,fetch_public=True)
    active()
    def reviewed_snapshot(path):
        expected=Path(path).resolve()
        def allowed(actual,relative,sha):
            if Path(actual).resolve()!=expected:return False
            row=_source_exceptions(hive,mission_id).get(relative)
            return bool(row and (sha is None or row['file']['sha256']==sha and row['public_proof']['sha256']==sha))
        with hand.source_exception_scope(allowed):return hand.code_repo_snapshot(path)
    active();canonical=root/'execution_contract.json';history=root/'preparation-history';pending=[]
    if history.exists():
        if history.is_symlink():raise ValueError('unsafe_preparation_history')
        pending=[p for p in history.iterdir() if p.is_dir() and (p/'plan.json').exists() and not (p/'completed.json').exists()]
        if len(pending)>1:raise ValueError('ambiguous_preparation_recovery')
    def finish_no_copy(archive,plan):
        contract=plan['contract'];canonical=root/'execution_contract.json';review=root/'source_revision_review.json'
        unsigned=dict(contract);signature=unsigned.pop('digest',None)
        if (plan.get('mode')!='blocked_before_copy' or plan.get('task_provenance')!=task
            or signature!=archive.name or _digest(unsigned)!=signature or plan.get('contract_sha256')!=_sha(json.dumps(contract,sort_keys=True,separators=(',',':')).encode())
            or any(contract.get(k)!=v for k,v in task.items())):
            raise ValueError('preparation_no_copy_plan_changed')
        active();archived_contract=archive/'execution_contract.json';archived_review=archive/'source_revision_review.json'
        if canonical.exists():
            raw,_=W._regular_bytes(canonical,2_000_000)
            if _sha(raw)!=plan['contract_file_sha256']:raise ValueError('preparation_contract_changed')
            _rename_exclusive(canonical,archived_contract)
        elif _sha(W._regular_bytes(archived_contract,2_000_000)[0])!=plan['contract_file_sha256']:
            raise ValueError('archived_contract_changed')
        active()
        if review.exists():
            raw,_=W._regular_bytes(review,2_000_000)
            if _sha(raw)!=plan['source_review_sha256']:raise ValueError('source_review_changed')
            _rename_exclusive(review,archived_review)
        elif _sha(W._regular_bytes(archived_review,2_000_000)[0])!=plan['source_review_sha256']:
            raise ValueError('archived_source_review_changed')
        active();_new_json(archive/'completed.json',{'task_provenance':task,'mode':'blocked_before_copy',
            'original_contract_digest':contract['digest'],'approved_exception_paths':plan['approved_exception_paths']})
        return {'recovered':True,'archive':str(archive),'preserved_copy':None,'reason':'blocked_before_copy'}
    if pending:
        archive=pending[0];plan=json.loads(W._regular_bytes(archive/'plan.json',2_000_000)[0]);contract=plan['contract']
        unsigned_plan=dict(plan);signature=unsigned_plan.pop('digest',None)
        if _digest(unsigned_plan)!=signature:raise ValueError('preparation_archive_plan_changed')
        if plan.get('mode')=='blocked_before_copy':return finish_no_copy(archive,plan)
    elif canonical.exists():
        raw,_=W._regular_bytes(canonical,2_000_000);contract=json.loads(raw);unsigned=dict(contract);signature=unsigned.pop('digest',None)
        if _digest(unsigned)!=signature or any(contract.get(k)!=v for k,v in task.items()):raise ValueError('preparation_contract_changed')
        original=Path(contract['working_copy'])
        if any(p.is_symlink() for p in (original,*original.parents)):raise ValueError('unsafe_preparation_copy')
        if original.name!='workflow-'+mission_id or original.parent not in hand.PERM().scratch_roots():raise ValueError('unowned_preparation_copy')
        archive=history/signature
        if archive.exists():raise ValueError('preparation_archive_already_completed')
        if not original.exists():
            state=json.loads(W._regular_bytes(root/'state.json',2_000_000)[0]);blocked=state.get('preparation') or {}
            exceptions=_source_exceptions(hive,mission_id)
            runtime=Path(contract['runtime_baseline']['source_repo'])
            sensitive={rel:row for rel,row in contract['runtime_baseline']['files'].items() if hand.PERM().is_secret_path(runtime/rel)}
            # The controller persists PREPARING before it calls recovery, so the retained blocked
            # preparation receipt (not the live status) proves why no copy exists. An empty sensitive
            # set means the current policy no longer flags the overlay; prepare_execution re-checks it.
            if (state.get('status') not in {'PREPARATION_BLOCKED','PREPARING','EXECUTION_BLOCKED','QUEUED'}
                or blocked.get('reason')!='runtime_secret_overlay_requires_review' or blocked.get('partial_working_copy')
                or any(exceptions.get(rel,{}).get('file')!=row for rel,row in sensitive.items())):
                raise ValueError('unproved_preparation_without_copy')
            review=root/'source_revision_review.json';review_raw,_=W._regular_bytes(review,2_000_000)
            active();history.mkdir(exist_ok=True,mode=0o700);archive.mkdir(mode=0o700)
            plan={'version':1,'mode':'blocked_before_copy','mission_id':mission_id,'task_provenance':task,
                  'contract':contract,'contract_sha256':_digest(contract),'contract_file_sha256':_sha(raw),
                  'source_review_sha256':_sha(review_raw),'approved_exception_paths':sorted(sensitive)}
            plan['digest']=_digest(plan);_new_json(archive/'plan.json',plan)
            return finish_no_copy(archive,plan)
        source=contract['source_receipt'];expected={**source['app_manifest'],**source.get('dependencies',{}),**contract['runtime_baseline']['files']}
        expected={rel:{'sha256':row['sha256'],'mode':row['mode']} for rel,row in expected.items()}
        snapshot=reviewed_snapshot(original)
        if snapshot['files']!=expected or snapshot['branch']!='jarvis/workflow-'+mission_id:raise ValueError('preparation_copy_changed')
        if (hand._git(original,'status','--porcelain').stdout.strip() or hand._git(original,'rev-list','--count','HEAD').stdout.strip()!='1'
            or hand._git(original,'log','-1','--format=%s').stdout.strip()!='jarvis: exact project source baseline '+mission_id):raise ValueError('unproved_preparation_baseline')
        active();history.mkdir(exist_ok=True,mode=0o700);archive.mkdir(mode=0o700)
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
        row=reviewed_snapshot(path);row['repo']=plan['snapshot']['repo'];return row
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
        source=contract['source_receipt']
        rows=(_retained_source_exceptions(hive,mission_id,source) if source.get('verification_method')=='owner_verified_immutable_revision'
              else _source_exceptions(hive,mission_id))
        row=rows.get(relative)
        return bool(row and (sha is None or row['file']['sha256']==sha and row['public_proof']['sha256']==sha))
    return allowed


_MIGRATION_MOVES=('execution_contract.json','execution_guard.json','execution_owner.json','coding_child.json',
                  'execution_dispatch.json','owner.json','worker_startup.json','worker_heartbeat.json')

def _migration_records(directory):
    W=_load('workflow_workspace');rows={};total=0
    for path in sorted(Path(directory).glob('*.json')):
        if path.name=='legacy_migration_review.json':continue
        raw,meta=W._regular_bytes(path,2_000_000);total+=len(raw)
        if total>8_000_000:raise ValueError('migration_receipt_budget')
        rows[path.name]={'sha256':_sha(raw),'mode':meta['mode']}
    return rows


def _migration_source_exceptions(hive,mission_id,source):
    if source.get('verification_method')=='owner_verified_immutable_revision':
        return _retained_source_exceptions(hive,mission_id,source)
    # Legacy contracts predate sealed source. Resolve their already approved
    # public-file exception through the reviewed Git object, never checkout IO.
    W=_load('workflow_workspace');root,_,_,task=_task(hive,mission_id)
    pin=json.loads(W._regular_bytes(root/'source_revision_review.json',2_000_000)[0]);unsigned=dict(pin);digest=unsigned.pop('digest',None)
    if (_digest(unsigned)!=digest or pin.get('authority')!='independent_immutable_source_review'
        or pin.get('task_provenance')!=task or not re.fullmatch(r'[a-f0-9]{40}(?:[a-f0-9]{24})?',str(pin.get('source_revision','')))):
        raise ValueError('migration_pinned_source_authority_changed')
    rows=_source_exceptions(hive,mission_id,revision=pin['source_revision'])
    manifest={**source['app_manifest'],**source.get('dependencies',{})}
    for name,row in rows.items():
        previous=source.get('source_exceptions',{}).get(name)
        if (row.get('file')!=manifest.get(name) or row['file']!=pin.get('manifest',{}).get(name)
            or row.get('public_proof',{}).get('sha256')!=row['file'].get('sha256')
            or previous and previous.get('file')!=row['file']):
            raise ValueError('migration_retained_public_source_changed')
    return rows


def _migration_snapshot(hive,mission_id,path,source):
    W=_load('workflow_workspace');hand=W._hand();expected=Path(path).resolve()
    rows=_migration_source_exceptions(hive,mission_id,source)
    def permitted(actual,name,sha):
        row=rows.get(str(name));return bool(Path(actual).resolve()==expected and row and
            (sha is None or row['file']['sha256']==sha and row['public_proof']['sha256']==sha))
    with hand.source_exception_scope(permitted):return hand.code_repo_snapshot(path)


def _migration_partial(root,contract,snapshot,partials,archive_only=None):
    """Only exact independently reviewed additions; existing bytes are never replaced."""
    W=_load('workflow_workspace');hand=W._hand();source=contract['source_receipt']
    baseline={**source['app_manifest'],**source.get('dependencies',{}),**contract['runtime_baseline']['files']}
    baseline={name:{'sha256':row['sha256'],'mode':row['mode']} for name,row in baseline.items()}
    files=snapshot['files']
    if any(files.get(name)!=row for name,row in baseline.items()):raise ValueError('migration_baseline_changed_or_deleted')
    additions={name:row for name,row in files.items() if name not in baseline}
    archive_only={} if archive_only is None else archive_only
    if (not isinstance(partials,dict) or not isinstance(archive_only,dict) or set(partials)&set(archive_only)
        or set(partials)|set(archive_only)!=set(additions)):raise ValueError('migration_full_diff_required')
    result={}
    for name,row in additions.items():
        path=Path(name)
        if name in archive_only:
            if (archive_only[name]!={'sha256':row['sha256'],'mode':row['mode']} or path.is_absolute()
                or '..' in path.parts or any(part.startswith('.') for part in path.parts)
                or hand.PERM().is_secret_path(root/path)):
                raise ValueError('migration_archive_only_identity_or_scope_changed')
            raw,meta=W._regular_bytes(root/path,64000)
            if meta['sha256']!=row['sha256'] or meta['mode']!=row['mode'] or hand._SECRETISH.search(raw.decode('utf-8')):
                raise ValueError('migration_archive_only_content_changed')
            continue
        if (not isinstance(partials[name],str) or partials[name]!=row['sha256'] or path.is_absolute() or '..' in path.parts
            or '.git' in path.parts or row['mode'] not in {0o644,0o755}):raise ValueError('migration_partial_identity_changed')
        if name!='.gitignore' and (not name.startswith('apps/agent-stack/') or any(part.startswith('.') for part in path.parts)):
            raise ValueError('migration_partial_scope_refused')
        target=root/path
        if hand.PERM().is_secret_path(target):raise ValueError('migration_secret_partial_refused')
        raw,meta=W._regular_bytes(target,64000)
        if meta['sha256']!=row['sha256'] or meta['mode']!=row['mode']:raise ValueError('migration_partial_identity_changed')
        if hand._SECRETISH.search(raw.decode('utf-8')):raise ValueError('migration_secret_partial_refused')
        if name=='.gitignore' and raw!=b'__pycache__/\n*.pyc\nLibrary/\n.pytest_cache/\n':raise ValueError('migration_gitignore_not_canonical')
        result[name]={'sha256':row['sha256'],'mode':row['mode'],'size':len(raw)}
    return result


def _migration_old_guard(copy,lock):
    """Old lock remains governed by its exact old, reviewed implementation."""
    import importlib.util
    W=_load('workflow_workspace');path=copy/'apps/agent-stack/hands/workflow_config_lock.py'
    raw,_=W._regular_bytes(path,128000)
    if _sha(raw)!=lock.get('guard_sha256'):raise ValueError('migration_old_guard_unproved')
    spec=importlib.util.spec_from_file_location('migration_old_configuration_guard',path)
    module=importlib.util.module_from_spec(spec)
    exec(compile(raw,str(path),'exec'),module.__dict__)
    if module.validate_candidate(lock,copy/'apps/agent-stack',{},expected_digest=lock.get('digest')).get('ok') is not True:
        raise ValueError('migration_old_configuration_changed')


def _migration_inactive(directory):
    W=_load('workflow_workspace');path=directory/'owner.json'
    if not path.exists():return
    owner=json.loads(W._regular_bytes(path,64000)[0]);pid=owner.get('pid')
    if not isinstance(pid,int) or pid<=0:raise ValueError('migration_worker_identity_unproved')
    try:os.kill(pid,0)
    except ProcessLookupError:return
    except PermissionError:raise ValueError('migration_worker_liveness_unproved')
    raise ValueError('migration_worker_active')


from contextlib import contextmanager
@contextmanager
def _migration_locks(root,copy,child):
    import fcntl
    from contextlib import ExitStack
    with ExitStack() as stack:
        paths=[root/'worker.lock',root/'steering.lock',root/'coding.lock']
        if child is not None:paths += [child/'worker.lock',child/'steering.lock']
        locks=root.parent/'worker-locks';locks.mkdir(exist_ok=True)
        paths.append(locks/('repo-'+_sha(str(copy).encode())+'.lock'))
        for path in paths:
            if any(p.is_symlink() for p in (path,*path.parents)):raise ValueError('migration_unsafe_lock_path')
            child_lock=child is not None and path.parent==child
            if child_lock and not path.is_file():raise ValueError('migration_child_lock_missing')
            fd=os.open(path,os.O_RDWR|os.O_NOFOLLOW|(0 if child_lock else os.O_CREAT),0o600)
            lock=stack.enter_context(os.fdopen(fd,'a'))
            try:fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
            except BlockingIOError:raise ValueError('migration_worker_or_repo_lock_active')
        _migration_inactive(root)
        if child is not None:_migration_inactive(child)
        yield


def approve_legacy_migration(hive,mission_id,expected_snapshot,partial_files,*,runtime_baseline,authority,evidence,archive_only=None):
    """Independent host maintenance review; never a model or workflow tool."""
    if not isinstance(authority,SourceReviewAuthority) or not isinstance(evidence,dict) or not evidence:
        raise ValueError('independent_source_review_required')
    W=_load('workflow_workspace');root,_,_,task=_task(hive,mission_id)
    contract=json.loads(W._regular_bytes(root/'execution_contract.json',2_000_000)[0]);unsigned=dict(contract);digest=unsigned.pop('digest',None)
    if _digest(unsigned)!=digest or contract.get('executor_bundle') or any(contract.get(k)!=v for k,v in task.items()):
        raise ValueError('legacy_migration_contract_required')
    copy=Path(contract['working_copy'])
    if copy.name!='workflow-'+mission_id or copy.parent not in W._hand().PERM().scratch_roots() or any(p.is_symlink() for p in (copy,*copy.parents)):
        raise ValueError('migration_unowned_copy')
    pointer=json.loads(W._regular_bytes(root/'coding_child.json',64000)[0]) if (root/'coding_child.json').exists() else {}
    ident=pointer.get('mission_id');child=None
    if ident is not None:
        if not re.fullmatch(r'[a-f0-9]{32}',str(ident)):raise ValueError('migration_child_identity_changed')
        child=root.parent/ident
    with _migration_locks(root,copy,child):
        snapshot=_migration_snapshot(hive,mission_id,copy,contract['source_receipt'])
        if snapshot!=expected_snapshot or snapshot.get('branch')!='jarvis/workflow-'+mission_id:raise ValueError('migration_snapshot_changed')
        hand=W._hand()
        if hand._git(copy,'rev-list','--count','HEAD').stdout.strip()!='1' or hand._git(copy,'log','-1','--format=%s').stdout.strip()!='jarvis: exact project source baseline '+mission_id:
            raise ValueError('migration_unproved_baseline')
        partials=_migration_partial(copy,contract,snapshot,partial_files,archive_only)
        committed=hand._git(copy,'ls-files','--stage','-z').stdout
        if committed!=snapshot['index'] or hand._git(copy,'diff','--cached','--name-only').stdout.strip():
            raise ValueError('migration_index_changed')
        guard_row=json.loads(W._regular_bytes(root/'execution_guard.json',2_000_000)[0])
        if guard_row.get('contract_digest')!=digest or guard_row.get('working_copy')!=str(copy):raise ValueError('migration_old_guard_receipt_changed')
        _migration_old_guard(copy,guard_row['configuration_lock'])
        if child is not None:
            state=json.loads(W._regular_bytes(child/('result.json' if (child/'result.json').exists() else 'state.json'),2_000_000)[0])
            if state.get('status') not in {'FAILED','BLOCKED','CANCELLED','UNAVAILABLE'}:raise ValueError('migration_child_not_failed_or_stopped')
        # Validating a new immutable receipt also verifies the explicit reviewed
        # project revision and the independently pinned current configuration.
        fresh_runtime=capture_runtime_baseline(Path(runtime_baseline['source_repo']),runtime_baseline['identity'])
        if _digest(fresh_runtime)!=_digest(runtime_baseline):raise ValueError('migration_runtime_changed')
        make_receipt(hive,mission_id,runtime_baseline=runtime_baseline)
        row={'version':1,'authority':'independent_legacy_partial_migration','mission_id':mission_id,'task_provenance':task,
             'old_contract':contract,'snapshot':snapshot,'copy_identity':[copy.stat().st_dev,copy.stat().st_ino],
             'partial_files':partials,'archive_only':archive_only or {},
             'archive_only_disposition':'host_transient_context_archived_not_restored_or_adopted',
             'runtime_baseline':runtime_baseline,
             'parent_records':_migration_records(root),'child_id':ident,
             'child_records':_migration_records(child) if child is not None else {},'evidence':evidence}
        row['digest']=_digest(row);_new_json(root/'legacy_migration_review.json',row);return row


def _migration_write_new(path,raw,mode):
    """Publish only a new reviewed file through pinned no-follow directories."""
    import stat
    path=Path(path);parent=path.parent
    if any(p.is_symlink() for p in (parent,*parent.parents)):raise ValueError('migration_unsafe_restore_path')
    directory=os.open(parent,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW)
    try:
        before=os.fstat(directory)
        fd=os.open(path.name,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,mode,dir_fd=directory)
        with os.fdopen(fd,'wb') as out:
            out.write(raw);out.flush();os.fchmod(out.fileno(),mode);os.fsync(out.fileno())
        if (before.st_dev,before.st_ino)!=(parent.stat().st_dev,parent.stat().st_ino):raise ValueError('migration_restore_directory_changed')
        os.fsync(directory)
    finally:os.close(directory)


def _recover_legacy_migration(hive,mission_id,*,active_fn):
    W=_load('workflow_workspace');R=_load('workflow_repo_context');root,_,_,task=_task(hive,mission_id)
    review=json.loads(W._regular_bytes(root/'legacy_migration_review.json',2_000_000)[0]);unsigned=dict(review);signature=unsigned.pop('digest',None)
    if _digest(unsigned)!=signature or review.get('authority')!='independent_legacy_partial_migration' or review.get('task_provenance')!=task:
        raise ValueError('migration_review_changed')
    contract=review['old_contract'];copy=Path(contract['working_copy']);moved=copy.with_name(copy.name+'-migration-'+signature[:16])
    archive=root/'migration-history'/signature;child=root.parent/review['child_id'] if review['child_id'] else None
    def active():
        if not active_fn() or _task(hive,mission_id)[3]!=task:raise ValueError('migration_cancelled_or_task_changed')
        _migration_inactive(root)
        for name in ('request.json','binding.json','owner_approval.json','source_revision_review.json','source_exception_review.json','source_exception_public.json','source_research.json','original_implementation.json'):
            if name in review['parent_records'] and _sha(W._regular_bytes(root/name,2_000_000)[0])!=review['parent_records'][name]['sha256']:
                raise ValueError('migration_source_or_authority_changed')
        if child is not None:
            _migration_inactive(child)
            if _migration_records(child)!=review['child_records']:raise ValueError('migration_child_changed')
    def snapshot(path):
        row=_migration_snapshot(hive,mission_id,path,contract['source_receipt']);row['repo']=str(copy);return row
    with _migration_locks(root,copy,child):
        active()
        if copy.name!='workflow-'+mission_id or copy.parent not in W._hand().PERM().scratch_roots() or any(p.is_symlink() for p in (copy,*copy.parents,archive,*archive.parents,moved,*moved.parents)):
            raise ValueError('migration_unowned_copy')
        if (archive/'completed.json').exists():
            completed=json.loads(W._regular_bytes(archive/'completed.json',128000)[0]);check=dict(completed);digest=check.pop('digest',None)
            if completed.get('review_digest')!=signature or _digest(check)!=digest:raise ValueError('migration_completion_changed')
            if any((root/name).exists() for name in _MIGRATION_MOVES if name not in {'execution_contract.json','execution_guard.json'}):
                raise ValueError('migration_already_consumed_by_worker')
            if snapshot(moved)!=review['snapshot']:raise ValueError('migration_preserved_copy_changed')
            current_contract=json.loads(W._regular_bytes(root/'execution_contract.json',2_000_000)[0])
            if guard(hive,mission_id,expected_contract_digest=completed['execution_contract_digest'],expected_configuration_digest=completed['configuration_digest'],proposedwrites={}).get('ok') is not True:
                raise ValueError('migration_completed_guard_changed')
            now=_migration_snapshot(hive,mission_id,copy,current_contract['source_receipt'])
            if _digest(now)!=completed['final_snapshot_digest']:raise ValueError('migration_completed_copy_changed')
            return {'recovered':True,'status':'PREPARED','archive':str(archive),'preserved_copy':str(moved),'task_verified':False}
        # A changed runtime or source authority cannot be accepted merely by
        # replaying the earlier review digest.
        baseline=capture_runtime_baseline(Path(review['runtime_baseline']['source_repo']),review['runtime_baseline']['identity'])
        if _digest(baseline)!=_digest(review['runtime_baseline']):raise ValueError('migration_runtime_changed')
        receipt=make_receipt(hive,mission_id,runtime_baseline=baseline)
        fresh_names=set(receipt['app_manifest'])|set(receipt.get('dependencies',{}))|set(baseline['files'])
        if set(review.get('archive_only',{}))&fresh_names:raise ValueError('migration_archive_only_in_fresh_source')
        candidate=moved if moved.exists() else copy
        if [candidate.stat().st_dev,candidate.stat().st_ino]!=review['copy_identity']:raise ValueError('migration_copy_identity_changed')
        if not archive.exists():
            if _migration_records(root)!=review['parent_records'] or snapshot(copy)!=review['snapshot']:raise ValueError('migration_preimage_changed')
            guard_row=json.loads(W._regular_bytes(root/'execution_guard.json',2_000_000)[0]);_migration_old_guard(copy,guard_row['configuration_lock'])
            _migration_partial(copy,contract,review['snapshot'],{k:v['sha256'] for k,v in review['partial_files'].items()},review.get('archive_only',{}))
            active();archive.parent.mkdir(exist_ok=True,mode=0o700);archive.mkdir(mode=0o700)
            _new_json(archive/'plan.json',{'review_digest':signature,'task_provenance':task,'original_copy':str(copy),'preserved_copy':str(moved)})
            (archive/'receipts').mkdir(mode=0o700);(archive/'retired').mkdir(mode=0o700)
        expected_plan={'review_digest':signature,'task_provenance':task,'original_copy':str(copy),'preserved_copy':str(moved)}
        if json.loads(W._regular_bytes(archive/'plan.json',64000)[0])!=expected_plan:raise ValueError('migration_plan_changed')
        for name,row in review['parent_records'].items():
            destination=archive/'receipts'/name
            if not destination.exists():
                raw,meta=W._regular_bytes(root/name,2_000_000)
                if _sha(raw)!=row['sha256'] or meta['mode']!=row['mode']:raise ValueError('migration_receipt_changed')
                active();_migration_write_new(destination,raw,row['mode'])
            if _sha(W._regular_bytes(destination,2_000_000)[0])!=row['sha256']:raise ValueError('migration_archive_changed')
        if not moved.exists():
            if snapshot(copy)!=review['snapshot']:raise ValueError('migration_preimage_changed')
            active();_rename_exclusive(copy,moved)
        if snapshot(moved)!=review['snapshot']:raise ValueError('migration_preserved_copy_changed')
        for name in _MIGRATION_MOVES:
            if name not in review['parent_records']:continue
            old=archive/'retired'/name
            if not old.exists():
                if _sha(W._regular_bytes(root/name,2_000_000)[0])!=review['parent_records'][name]['sha256']:raise ValueError('migration_execution_receipt_changed')
                active();_rename_exclusive(root/name,old)
            if _sha(W._regular_bytes(old,2_000_000)[0])!=review['parent_records'][name]['sha256']:raise ValueError('migration_retired_receipt_changed')
        if any((root/name).exists() for name in _MIGRATION_MOVES if name not in {'execution_contract.json','execution_guard.json'}):
            raise ValueError('migration_unexpected_worker_receipt')
        active();canonical=root/'execution_contract.json'
        if canonical.exists():
            fresh=json.loads(W._regular_bytes(canonical,2_000_000)[0]);guard_row=json.loads(W._regular_bytes(root/'execution_guard.json',2_000_000)[0])
            ready={'ok':True,'working_copy':str(copy),'execution_contract_digest':fresh['digest'],'configuration_digest':guard_row['configuration_digest']}
            if fresh.get('source_receipt_digest')!=_digest(receipt) or fresh.get('runtime_baseline_digest')!=_digest(baseline):raise ValueError('migration_fresh_contract_changed')
        else:
            if copy.exists():raise ValueError('migration_unproved_new_copy')
            ready=prepare_execution(hive,mission_id,source_receipt=receipt,runtime_baseline=baseline,scratch_root=copy.parent,active_fn=active_fn)
        if ready.get('ok') is not True:raise ValueError('migration_fresh_preparation_blocked')
        def checked(writes=None):
            active()
            if guard(hive,mission_id,expected_contract_digest=ready['execution_contract_digest'],expected_configuration_digest=ready['configuration_digest'],proposedwrites=writes).get('ok') is not True:
                raise ValueError('migration_fresh_configuration_changed')
        checked()
        fresh=json.loads(W._regular_bytes(root/'execution_contract.json',2_000_000)[0])
        base={**fresh['source_receipt']['app_manifest'],**fresh['source_receipt'].get('dependencies',{}),**fresh['runtime_baseline']['files']}
        base={name:{'sha256':row['sha256'],'mode':row['mode']} for name,row in base.items()}
        current=_migration_snapshot(hive,mission_id,copy,receipt)
        fresh_path=archive/'fresh_preparation.json'
        if not fresh_path.exists():
            if current['files']!=base:raise ValueError('migration_unjournalled_fresh_change')
            _new_json(fresh_path,{'contract_digest':ready['execution_contract_digest'],'snapshot':current})
        fresh_proof=json.loads(W._regular_bytes(fresh_path,2_000_000)[0])
        if fresh_proof.get('contract_digest')!=ready['execution_contract_digest']:raise ValueError('migration_fresh_proof_changed')
        comparable=dict(current);comparable['files']=fresh_proof['snapshot']['files']
        if comparable!=fresh_proof['snapshot']:raise ValueError('migration_fresh_git_identity_changed')
        allowed={name:{'sha256':row['sha256'],'mode':row['mode']} for name,row in review['partial_files'].items()}
        if (any(current['files'].get(name)!=row for name,row in base.items()) or
            any(name not in base and allowed.get(name)!=row for name,row in current['files'].items())):
            raise ValueError('migration_unexpected_fresh_change')
        if (current['branch']!='jarvis/workflow-'+mission_id or W._hand()._git(copy,'rev-list','--count','HEAD').stdout.strip()!='1'
            or W._hand()._git(copy,'log','-1','--format=%s').stdout.strip()!='jarvis: exact project source baseline '+mission_id):
            raise ValueError('migration_unproved_fresh_baseline')
        for index,(name,row) in enumerate(sorted(review['partial_files'].items())):
            raw,meta=W._regular_bytes(moved/name,64000)
            if meta!=row:raise ValueError('migration_partial_changed')
            pending=archive/f'restore-{index}.json'
            if not pending.exists():
                if (copy/name).exists():raise ValueError('migration_restore_target_exists')
                checked({name:raw.decode()});_new_json(pending,{'path':name,'file':row,'contract_digest':ready['execution_contract_digest']})
            record=json.loads(W._regular_bytes(pending,64000)[0])
            if record!={'path':name,'file':row,'contract_digest':ready['execution_contract_digest']}:raise ValueError('migration_restore_receipt_changed')
            checked({name:raw.decode()})
            if not (copy/name).exists():
                if not (copy/name).parent.is_dir():raise ValueError('migration_restore_parent_missing')
                _migration_write_new(copy/name,raw,row['mode'])
            if W._regular_bytes(copy/name,64000)[1]!=row:raise ValueError('migration_restored_file_changed')
            checked()
        final=_migration_snapshot(hive,mission_id,copy,receipt)
        expected_files={**base,**allowed}
        if final['files']!=expected_files:raise ValueError('migration_unexpected_fresh_change')
        active();completion={'review_digest':signature,'task_provenance':task,'status':'PREPARED',
            'preserved_copy':str(moved),'execution_contract_digest':ready['execution_contract_digest'],
            'configuration_digest':ready['configuration_digest'],'restored_files':review['partial_files'],
            'final_snapshot_digest':_digest(final),'archive_only':review.get('archive_only',{}),
            'archive_only_disposition':'host_transient_context_archived_not_restored_or_adopted','task_verified':False}
        completion['digest']=_digest(completion);_new_json(archive/'completed.json',completion)
        return {'recovered':True,'status':'PREPARED','archive':str(archive),'preserved_copy':str(moved),'task_verified':False}
