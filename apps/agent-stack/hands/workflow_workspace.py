"""Owned bounded project working copy; original checkout and Git metadata stay read-only."""
from __future__ import annotations
import hashlib
import importlib.util
import json
import os
import re
import stat
from pathlib import Path

STACK=Path(__file__).resolve().parents[1]
MAX_FILES=1000
MAX_BYTES=8_000_000
MAX_FILE=2_000_000
EXCLUDED={'.git','.hive','__pycache__','.pytest_cache','node_modules','logs'}
CRITICAL=('brain/pipeline.py','brain/online.py','brain/mission_controller.py','hands/agent_tools.py',
          'hands/coding_mission.py','hands/permissions.py','memory/bus_io.py','memory/retrieve.py',
          'mouth/turn.py','face/serve.py','hands/craft.py')
LOCKED=('brain/online.py','brain/shared_context.py','face/serve.py','hands/craft.py','memory/retrieve.py','mouth/persona.py')

class WorkspaceBlocked(ValueError):pass



def _hand():
    spec=importlib.util.spec_from_file_location('workflow_workspace_agent_tools',STACK/'hands'/'agent_tools.py')
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    return module


def _configuration_guard():
    spec=importlib.util.spec_from_file_location('workflow_workspace_config_lock',STACK/'hands/workflow_config_lock.py')
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    return module


def _regular_bytes(path,limit=MAX_FILE):
    if any(p.is_symlink() for p in (path,*path.parents)):raise WorkspaceBlocked('symlink_source')
    with os.fdopen(os.open(path,os.O_RDONLY|os.O_NOFOLLOW),'rb') as stream:
        before=os.fstat(stream.fileno())
        if not stat.S_ISREG(before.st_mode) or before.st_size>limit:raise WorkspaceBlocked('source_file_budget')
        raw=stream.read(limit+1);after=os.fstat(stream.fileno())
    current=path.stat()
    identity=lambda row:(row.st_dev,row.st_ino,row.st_size,row.st_mtime_ns,row.st_mode)
    if len(raw)>limit or identity(before)!=identity(after) or identity(after)!=identity(current):
        raise WorkspaceBlocked('source_changed_during_read')
    return raw,{'sha256':hashlib.sha256(raw).hexdigest(),'mode':stat.S_IMODE(before.st_mode),'size':len(raw)}


def _git_identity(repo,receipt,perm):
    marker=repo/'.git'
    if marker.is_dir() and not marker.is_symlink():git_dir=marker.resolve()
    else:
        raw,_=_regular_bytes(marker,4096)
        text=raw.decode('utf-8').strip()
        if not text.startswith('gitdir: '):raise WorkspaceBlocked('unproved_git_identity')
        git_dir=(repo/text[8:]).resolve() if not Path(text[8:]).is_absolute() else Path(text[8:]).resolve()
    if perm.is_secret_path(git_dir):raise WorkspaceBlocked('secret_git_metadata')
    if str(git_dir)!=receipt.get('git_dir'):raise WorkspaceBlocked('source_git_dir_mismatch')
    common=git_dir
    if (git_dir/'commondir').exists():
        raw,_=_regular_bytes(git_dir/'commondir',4096);common=(git_dir/raw.decode().strip()).resolve()
    if perm.is_secret_path(common):raise WorkspaceBlocked('secret_git_metadata')
    if str(common)!=receipt.get('git_common_dir'):raise WorkspaceBlocked('source_git_common_dir_mismatch')
    raw,_=_regular_bytes(git_dir/'HEAD',4096);head=raw.decode().strip();branch=''
    if head.startswith('ref: '):
        ref=head[5:]
        if not re.fullmatch(r'refs/heads/[A-Za-z0-9_./-]+',ref) or '..' in ref.split('/'):
            raise WorkspaceBlocked('unsupported_source_ref')
        branch=ref[len('refs/heads/'):]
        ref_file=common/ref
        if ref_file.exists():raw,_=_regular_bytes(ref_file,4096);head=raw.decode().strip()
        else:
            raw,_=_regular_bytes(common/'packed-refs',1_000_000)
            matches=[line.split()[0] for line in raw.decode().splitlines() if len(line.split())==2 and line.split()[1]==ref]
            if len(matches)!=1:raise WorkspaceBlocked('unproved_source_head')
            head=matches[0]
    if not re.fullmatch(r'[a-f0-9]{40,64}',head):raise WorkspaceBlocked('unproved_source_head')
    if head!=receipt.get('source_head') or branch!=receipt.get('source_branch'):
        raise WorkspaceBlocked('source_branch_or_head_changed')
    return {'head':head,'branch':branch}


def _runtime_configuration_paths(lock,guard):
    """Every selector-bearing current runtime file, not only fixed whole-file locks."""
    if not isinstance(lock,dict) or not isinstance(lock.get('semantic_files'),dict) or not isinstance(lock.get('configuration_data_files'),dict):
        raise WorkspaceBlocked('runtime_configuration_lock_required')
    selected=set(guard.WHOLE_FILES+LOCKED)|set(lock['configuration_data_files'])
    selected.update(rel for rel,row in lock['semantic_files'].items() if row.get('sensitive') or row.get('anchors'))
    if any(Path(rel).is_absolute() or '..' in Path(rel).parts or not Path(rel).parts for rel in selected):raise WorkspaceBlocked('unsafe_runtime_overlay')
    return selected


def _snapshot(repo,subtree,hand,dependencies,source_exceptions=None):
    if source_exceptions is not None and not callable(source_exceptions):raise WorkspaceBlocked('host_source_exception_required')
    source_exceptions=source_exceptions() if source_exceptions is not None else {}
    app=repo/subtree
    if not app.is_dir() or any(p.is_symlink() for p in (app,*app.parents)):
        raise WorkspaceBlocked('source_subtree_unavailable')
    files={};excluded=[];total=0
    for directory,dirs,names in os.walk(app,followlinks=False):
        parent=Path(directory)
        for name in list(dirs):
            path=parent/name
            if path.is_symlink():raise WorkspaceBlocked('symlink_source')
            if name in EXCLUDED or hand.PERM().is_secret_path(path):dirs.remove(name);excluded.append(str(path.relative_to(repo)))
        for name in names:
            path=parent/name;rel=str(path.relative_to(repo))
            if hand.PERM().is_secret_path(path):
                exception=(source_exceptions or {}).get(rel)
                if not exception:excluded.append(rel);continue
                raw,row=_regular_bytes(path,64000)
                if row!=exception.get('file') or hand._SECRETISH.search(raw.decode()) or exception.get('public_proof',{}).get('verification_method')!='independent_public_git_blob':
                    raise WorkspaceBlocked('source_exception_changed')

            raw,row=_regular_bytes(path);total+=len(raw);files[rel]=row
            if len(files)>MAX_FILES or total>MAX_BYTES:raise WorkspaceBlocked('source_snapshot_budget_exceeded')
    for rel in dependencies:
        pure=Path(rel)
        if pure.is_absolute() or '..' in pure.parts or not pure.parts or any(part in EXCLUDED for part in pure.parts):
            raise WorkspaceBlocked('unsafe_dependency_path')
        path=repo/pure
        if hand.PERM().is_secret_path(path):raise WorkspaceBlocked('secret_dependency')
        raw,row=_regular_bytes(path);total+=len(raw);files[rel]=row
        if len(files)>MAX_FILES or total>MAX_BYTES:raise WorkspaceBlocked('source_snapshot_budget_exceeded')
    if any(subtree+'/'+rel not in files for rel in set(CRITICAL+LOCKED)):
        raise WorkspaceBlocked('incomplete_app_source')
    return files,sorted(excluded)


def verify_working_copy(working_copy,manifest):
    root=Path(working_copy)
    for rel,expected in manifest.get('protected_model_files',{}).items():
        try:_,actual=_regular_bytes(root/rel)
        except (OSError,WorkspaceBlocked):return False
        if actual!=expected:return False
    return bool(manifest.get('protected_model_files'))


def prepare(mission_id,*,source_receipt,scratch_root,active_fn,runtime_baseline=None,source_exceptions=None):
    base={'tool':'workflow_workspace','verified':False,'task_verified':False,'sent':False,'actions':[]}
    def active():
        try:return callable(active_fn) and bool(active_fn())
        except Exception:return False
    target=None
    try:
        if not active():raise WorkspaceBlocked('cancelled')
        if not re.fullmatch(r'[a-f0-9]{32}',str(mission_id)):raise WorkspaceBlocked('invalid_mission_id')
        if not isinstance(source_receipt,dict) or source_receipt.get('verified') is not True or source_receipt.get('verification_method')!='owner_verified_current_checkout':
            raise WorkspaceBlocked('source_authority_unresolved')
        repo=Path(str(source_receipt.get('source_repo') or '')).expanduser()
        if not repo.is_absolute() or any(p.is_symlink() for p in (repo,*repo.parents)):
            raise WorkspaceBlocked('unsafe_source_root')
        repo=repo.resolve(strict=True)
        if source_receipt.get('bound_source_repo')!=str(repo):raise WorkspaceBlocked('source_rebind_required')
        subtree=source_receipt.get('source_subtree')
        if subtree!='apps/agent-stack':raise WorkspaceBlocked('explicit_app_subtree_required')
        hand=_hand()
        if hand.PERM().is_secret_path(repo):raise WorkspaceBlocked('secret_source_root')
        _git_identity(repo,source_receipt,hand.PERM())
        dependencies=source_receipt.get('dependencies') or {}
        if not isinstance(dependencies,dict):raise WorkspaceBlocked('invalid_dependency_manifest')
        files,excluded=_snapshot(repo,subtree,hand,dependencies,source_exceptions)
        expected=source_receipt.get('app_manifest')
        app_files={rel:row for rel,row in files.items() if rel.startswith(subtree+'/')}
        if expected!=app_files or any(files.get(rel)!=row for rel,row in dependencies.items()):
            raise WorkspaceBlocked('source_manifest_mismatch')
        tracked=source_receipt.get('tracked_app_paths')
        if not isinstance(tracked,list) or not set(tracked).issubset(app_files):raise WorkspaceBlocked('incomplete_tracked_app_source')
        locked={subtree+'/'+rel:files[subtree+'/'+rel] for rel in LOCKED}
        if source_receipt.get('locked_files')!=locked:raise WorkspaceBlocked('protected_source_manifest_mismatch')
        source_files=dict(files);overlay={};runtime_repo=None
        if runtime_baseline is not None:
            if not isinstance(runtime_baseline,dict) or runtime_baseline.get('verification_method')!='host_verified_current_runtime':
                raise WorkspaceBlocked('runtime_authority_unresolved')
            runtime_repo=Path(runtime_baseline['source_repo'])
            if runtime_baseline.get('git_common_dir')!=source_receipt['git_common_dir']:
                raise WorkspaceBlocked('runtime_repository_mismatch')
            _git_identity(runtime_repo,runtime_baseline,hand.PERM())
            overlay=runtime_baseline.get('files',{})
            if not isinstance(overlay,dict) or not overlay:raise WorkspaceBlocked('runtime_configuration_manifest_required')
            guard=_configuration_guard()
            required={subtree+'/'+rel for rel in _runtime_configuration_paths(runtime_baseline.get('configuration_lock'),guard)}
            if set(overlay)!=required:raise WorkspaceBlocked('incomplete_runtime_configuration_overlay')
            if not guard.validate_candidate(runtime_baseline.get('configuration_lock'),runtime_repo/subtree,{},
                    expected_digest=runtime_baseline.get('configuration_digest'))['ok']:
                raise WorkspaceBlocked('runtime_configuration_lock_invalid')
            for rel,row in overlay.items():
                if not isinstance(rel,str) or not rel.startswith(subtree+'/') or '..' in Path(rel).parts:
                    raise WorkspaceBlocked('unsafe_runtime_overlay')
                if hand.PERM().is_secret_path(runtime_repo/rel):
                    reviewed=(source_exceptions() if source_exceptions else {}).get(rel)
                    if not reviewed or reviewed.get('file')!=row:raise WorkspaceBlocked('runtime_secret_overlay_requires_review')
                _,actual=_regular_bytes(runtime_repo/rel)
                if actual!=row:raise WorkspaceBlocked('runtime_configuration_changed')
                files[rel]=row
            if len(files)>MAX_FILES or sum(row['size'] for row in files.values())>MAX_BYTES:
                raise WorkspaceBlocked('source_snapshot_budget_exceeded')
            locked.update(overlay)
        scratch=Path(scratch_root).expanduser()
        if not scratch.is_absolute() or any(p.is_symlink() for p in (scratch,*scratch.parents)):
            raise WorkspaceBlocked('unsafe_scratch_root')
        scratch=scratch.resolve()
        if scratch not in hand.PERM().scratch_roots():raise WorkspaceBlocked('existing_scratch_root_required')
        target=scratch/('workflow-'+mission_id)
        if target.exists():raise WorkspaceBlocked('working_copy_already_exists')
        if hand._repo_ok(target)!='allow':raise WorkspaceBlocked('working_copy_permission_required')
        if not active():raise WorkspaceBlocked('cancelled')
        target.mkdir(parents=True,mode=0o700)
        for rel,row in files.items():
            if not active():raise WorkspaceBlocked('cancelled')
            raw,now=_regular_bytes((runtime_repo if rel in overlay else repo)/rel)
            if now!=row:raise WorkspaceBlocked('source_changed_during_copy')
            destination=target/rel;destination.parent.mkdir(parents=True,exist_ok=True)
            with os.fdopen(os.open(destination,os.O_WRONLY|os.O_CREAT|os.O_EXCL,row['mode']),'wb') as out:out.write(raw)
            destination.chmod(row['mode'])
        after,_=_snapshot(repo,subtree,hand,dependencies,source_exceptions)
        if after!=source_files:raise WorkspaceBlocked('source_changed_during_copy')
        _git_identity(repo,source_receipt,hand.PERM())
        if runtime_repo is not None:
            _git_identity(runtime_repo,runtime_baseline,hand.PERM())
            for rel,row in overlay.items():
                if _regular_bytes(runtime_repo/rel)[1]!=row:raise WorkspaceBlocked('runtime_configuration_changed')
        if not active():raise WorkspaceBlocked('cancelled')
        branch='jarvis/workflow-'+mission_id
        for action,kw in [('init',{}),('branch',{'name':branch}),('commit',{'message':'jarvis: exact project source baseline '+mission_id})]:
            if not active():raise WorkspaceBlocked('cancelled')
            result=hand.op_repo(str(target),action,**kw)
            if not result.get('verified'):raise WorkspaceBlocked('working_copy_'+action+'_unverified')
            if not active():raise WorkspaceBlocked('cancelled')
        def reviewed(actual,relative,sha):
            row=(source_exceptions() if source_exceptions else {}).get(relative)
            return bool(Path(actual).resolve()==target.resolve() and row and (sha is None or row['file']['sha256']==sha))
        with hand.source_exception_scope(reviewed):snapshot=hand.code_repo_snapshot(target)
        if snapshot['files']!= {rel:{'sha256':row['sha256'],'mode':row['mode']} for rel,row in files.items()}:
            raise WorkspaceBlocked('working_copy_manifest_mismatch')
        if not active():raise WorkspaceBlocked('cancelled')
        manifest={'mission_id':mission_id,'source_checkout':str(repo),'source_subtree':subtree,
            'source_git':{'head':source_receipt['source_head'],'branch':source_receipt['source_branch']},
            'integration_target':source_receipt.get('integration_target'),'working_copy':str(target),'working_branch':branch,
            'working_baseline_head':snapshot['head'],'files':files,'protected_model_files':locked,
            'original_source_files':source_files,'runtime_configuration_overlay':overlay,
            'runtime_configuration_source':str(runtime_repo) if runtime_repo else None,
            'excluded':excluded,'dependencies':list(dependencies),'source_before_after_matched':True,
            'rollback':'discard this owned working copy only after approval; source checkout was never changed'}
        return {**base,'ok':True,'status':'WORKING_COPY_READY','working_copy':str(target),'branch':branch,'manifest':manifest,
                'actions':[{'kind':'owned_working_copy','files':len(files)}, {'kind':'owned_git_branch','branch':branch},
                           {'kind':'owned_baseline_commit','head':snapshot['head']}],
                'spoken':'An owned working version of the existing project source is ready. The source checkout is unchanged; no feature has been built or verified.'}
    except Exception as exc:
        # Do not include paths, file contents or arbitrary subprocess errors in speech.
        return {**base,'ok':False,'status':'BLOCKED','reason':str(exc) if isinstance(exc,WorkspaceBlocked) else 'workspace_preparation_unavailable',
                'partial_working_copy':str(target) if target and target.exists() else None,
                'actions':[{'kind':'partial_owned_working_copy'}] if target and target.exists() else [],
                'spoken':'The project working copy could not be prepared safely. The original source was not changed; no implementation was run.'}
