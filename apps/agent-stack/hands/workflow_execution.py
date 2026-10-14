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
    read=lambda name:W._regular_bytes(root/(name+'.json'),64000)[0]
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
    files,excluded=W._snapshot(repo,'apps/agent-stack',hand,dep)
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
            'dependencies':dep,'integration_target':str(repo),'task_provenance':task}


def prepare_execution(hive,mission_id,*,source_receipt,runtime_baseline,scratch_root,active_fn):
    """Persist immutable authority/config contract before any owned-copy mutation."""
    root,request,binding,task=_task(hive,mission_id)
    if source_receipt.get('task_provenance')!=task or source_receipt.get('bound_source_repo')!=binding['repo']:
        raise ValueError('source_task_receipt_mismatch')
    C=_load('workflow_config_lock');W=_load('workflow_workspace')
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
    result=W.prepare(mission_id,source_receipt=source_receipt,scratch_root=scratch_root,active_fn=active,runtime_baseline=runtime_baseline)
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
        snapshot,_=W._snapshot(Path(source['source_repo']),'apps/agent-stack',W._hand(),source['dependencies'])
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
