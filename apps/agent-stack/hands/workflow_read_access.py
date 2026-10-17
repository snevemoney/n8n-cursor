"""Host-only, task-lifetime filesystem READ receipt; never grants writes or OS access.

Call grant only with the original current owner utterance, never model arguments.
Consumers must retain workspace_read's credential/secret and OS permission guards.
"""
from __future__ import annotations
import fcntl
import hashlib
import json
import os
import re
import stat
import tempfile
from pathlib import Path
_VAULT_ROOT = Path(os.environ.get("JARVIS_VAULT_DIR") or os.environ.get("JARVIS_VAULT") or next(
    (p for p in (Path.home() / "Vaults/My_Billion_Dollar_Vault", Path.home() / "Documents/My_Billion_Dollar_Vault") if p.is_dir()),
    Path.home() / "Vaults/My_Billion_Dollar_Vault")).expanduser()  # Evens 10-17: the vault lives in ~/Vaults now

LIMIT=64000
TERMINAL={'COMPLETED','DONE','SUCCEEDED','SUCCESS','VERIFIED','CANCELLED','FAILED','BLOCKED','EXPIRED'}
ALLOW=re.compile(r'^(?:allow read access to my (?:whole|entire) filesystem for this workflow|i allow you to read (?:everything on my mac[.!]? every file and folders?[.!]? the whole filesystem|(?:my |the )?(?:whole|entire) filesystem(?: for this workflow)?))\s*[.!]?$',re.I)
RESUME=re.compile(r'^(?:continue|resume)(?: the)? workflow\s*[.!]?$',re.I)


def _digest(raw):return hashlib.sha256(raw).hexdigest()


def _path(hive,mission_id):
    if not isinstance(mission_id,str) or not re.fullmatch(r'[a-f0-9]{32}',mission_id):raise ValueError('invalid_mission')
    path=Path(hive)/'coding-missions'/mission_id
    if not path.is_dir() or any(p.is_symlink() for p in (path,*path.parents)):raise ValueError('unsafe_mission')
    return path


def _read(path):
    fd=os.open(path,os.O_RDONLY|os.O_NOFOLLOW)
    try:
        before=os.fstat(fd)
        if not stat.S_ISREG(before.st_mode) or before.st_size>LIMIT:raise ValueError('unsafe_receipt_file')
        raw=os.read(fd,LIMIT+1)
        after=os.fstat(fd)
        if len(raw)>LIMIT or (before.st_ino,before.st_size,before.st_mtime_ns)!=(after.st_ino,after.st_size,after.st_mtime_ns):raise ValueError('changed_receipt_file')
        row=json.loads(raw)
        if not isinstance(row,dict):raise ValueError('invalid_receipt_file')
        return row,raw,{'sha256':_digest(raw),'inode':after.st_ino,'mtime_ns':after.st_mtime_ns}
    finally:os.close(fd)


def _task(root,mission_id):
    if (root/'result.json').exists() or (root/'result.json').is_symlink():raise ValueError('terminal_workflow')
    request,raw,_=_read(root/'request.json')
    state,_,_=_read(root/'state.json')
    control,_,identity=_read(root/'control.json')
    if (request.get('mission_id')!=mission_id or request.get('worker_kind')!='research_build'
        or request.get('request_scope')!='transient_task' or not isinstance(request.get('objective'),str)
        or not request['objective'].strip() or state.get('mission_id')!=mission_id
        or state.get('worker_kind')!='research_build' or not isinstance(state.get('status'),str)
        or state['status'] in TERMINAL or control.get('cancel') is not False):raise ValueError('inactive_workflow')
    linked_path=root/'mixed_parent.json'
    if linked_path.exists():
        linked,_,_=_read(linked_path)
        child=_path(root.parent.parent,linked.get('mission_id'))
        if (child/'result.json').exists():
            contract,_,_=_read(child/'request.json');result,_,_=_read(child/'result.json')
            if ((contract.get('project_scope') or {}).get('request_sha256')==_digest(raw)
                and result.get('status')=='COMPLETED' and result.get('verified') is True and result.get('independent_acceptance') is True):
                raise ValueError('terminal_workflow')
    return _digest(raw),identity


def _write(path,row):
    raw=json.dumps(row,sort_keys=True,separators=(',',':')).encode()
    fd,name=tempfile.mkstemp(prefix='.read-access-',dir=path.parent)
    try:
        os.fchmod(fd,0o600)
        with os.fdopen(fd,'wb') as stream:stream.write(raw);stream.flush();os.fsync(stream.fileno())
        os.replace(name,path)
    finally:
        if os.path.exists(name):os.unlink(name)


def grant(hive,mission_id,owner_answer):
    """Authorize this retained workflow only. Nonapproval chat never replaces a grant."""
    if not isinstance(owner_answer,str) or len(owner_answer)>2048 or not ALLOW.fullmatch(' '.join(owner_answer.strip().split())):
        return {'ok':False,'reason':'explicit_workflow_read_permission_required','task_verified':False}
    try:
        root=_path(hive,mission_id)
        fd=os.open(root/'read_access.lock',os.O_CREAT|os.O_RDWR|os.O_NOFOLLOW,0o600)
        with os.fdopen(fd,'a') as lock:
            fcntl.flock(lock,fcntl.LOCK_EX)
            request_sha,control=_task(root,mission_id)
            if (root/'read_access.json').exists() or (root/'read_access.json').is_symlink():
                previous,_,_=_read(root/'read_access.json')
                if previous.get('request_sha256')!=request_sha:raise ValueError('original_request_changed')
            receipt={'version':1,'mission_id':mission_id,'request_sha256':request_sha,
                     'control_identity':control,'scope':'filesystem_read_this_workflow',
                     'roots':['/'],'writes_allowed':False,'secret_access_allowed':False,
                     'authority':'original_current_owner_utterance','owner_answer_sha256':_digest(owner_answer.encode())}
            receipt['digest']=_digest(json.dumps(receipt,sort_keys=True,separators=(',',':')).encode())
            if _task(root,mission_id)!=(request_sha,control):raise ValueError('task_changed')
            _write(root/'read_access.json',receipt)
        return {'ok':True,'mission_id':mission_id,'request_sha256':request_sha,'scope':receipt['scope'],
                'task_verified':False,'writes_allowed':False,'secret_access_allowed':False}
    except (OSError,ValueError,TypeError):
        return {'ok':False,'reason':'workflow_read_grant_unavailable','task_verified':False}


def roots(hive,mission_id):
    """Return expanded roots only for an intact active task; never read user files."""
    try:
        root=_path(hive,mission_id)
        request_sha,control=_task(root,mission_id)
        row,_,_=_read(root/'read_access.json')
        digest=row.pop('digest',None)
        if (digest!=_digest(json.dumps(row,sort_keys=True,separators=(',',':')).encode())
            or row.get('version')!=1 or row.get('mission_id')!=mission_id
            or row.get('request_sha256')!=request_sha or row.get('control_identity')!=control
            or row.get('scope')!='filesystem_read_this_workflow' or row.get('roots')!=['/']
            or row.get('writes_allowed') is not False or row.get('secret_access_allowed') is not False
            or row.get('authority')!='original_current_owner_utterance'
            or not re.fullmatch(r'[a-f0-9]{64}',str(row.get('owner_answer_sha256','')))):
            return []
        if _task(root,mission_id)!=(request_sha,control):return []
        return ['/']
    except (OSError,ValueError,TypeError):return []


def resume(hive,mission_id,owner_answer):
    """Restore a previous intact READ grant after host-controlled explicit resume.

    The host must first clear Stop via WorkflowMissionHandle.continue_workflow;
    this function never changes task state or creates a grant where none exists.
    """
    if not isinstance(owner_answer,str) or len(owner_answer)>2048 or not RESUME.fullmatch(' '.join(owner_answer.strip().split())):
        return {'ok':False,'reason':'explicit_workflow_resume_required','task_verified':False}
    try:
        root=_path(hive,mission_id)
        fd=os.open(root/'read_access.lock',os.O_CREAT|os.O_RDWR|os.O_NOFOLLOW,0o600)
        with os.fdopen(fd,'a') as lock:
            fcntl.flock(lock,fcntl.LOCK_EX)
            request_sha,control=_task(root,mission_id)
            row,_,_=_read(root/'read_access.json')
            digest=row.pop('digest',None)
            if (digest!=_digest(json.dumps(row,sort_keys=True,separators=(',',':')).encode())
                or row.get('version')!=1 or row.get('mission_id')!=mission_id
                or row.get('request_sha256')!=request_sha
                or row.get('scope')!='filesystem_read_this_workflow' or row.get('roots')!=['/']
                or row.get('writes_allowed') is not False or row.get('secret_access_allowed') is not False
                or row.get('authority')!='original_current_owner_utterance'
                or not re.fullmatch(r'[a-f0-9]{64}',str(row.get('owner_answer_sha256','')))):
                raise ValueError('invalid_prior_read_grant')
            row['control_identity']=control
            row['resume_answer_sha256']=_digest(owner_answer.encode())
            row['digest']=_digest(json.dumps(row,sort_keys=True,separators=(',',':')).encode())
            if _task(root,mission_id)!=(request_sha,control):raise ValueError('task_changed')
            _write(root/'read_access.json',row)
        return {'ok':True,'mission_id':mission_id,'request_sha256':request_sha,'scope':row['scope'],
                'task_verified':False,'writes_allowed':False,'secret_access_allowed':False}
    except (OSError,ValueError,TypeError):
        return {'ok':False,'reason':'prior_workflow_read_grant_unavailable','task_verified':False}


def delivery_targets(owner_request,mission_id):
    """Only literal current-owner paths may select fresh output names."""
    folder=Path.home()/'ArtCraft Studio'/'00 Private'/'Projects'/('JARVIS-'+mission_id)
    default={'native':str(folder/'source/Implementation.deckcraft'),'export':str(folder/'exports/Implementation.pdf'),
        'preview':str(folder/'previews/Implementation.png'),
        'note':str(_VAULT_ROOT/'00_Outer_Heaven/shared/inbox'/('Jarvis-implementation-'+mission_id+'.md'))}
    literals=[m.group(2) for m in re.finditer(r"([\"'])(/[^\"'\n]+)\1",owner_request or '')]
    chosen={}
    suffix={'.deckcraft':'native','.pdf':'export','.png':'preview','.md':'note'}
    for raw in literals:
        path=Path(raw);kind=suffix.get(path.suffix.lower())
        if kind:
            if kind in chosen:raise ValueError('one exact path per delivery output required')
            chosen[kind]=path
    if not chosen:return default
    if set(chosen)!=set(default):raise ValueError('all four exact delivery targets required')
    project=chosen['native'].parent.parent
    private=Path.home()/'ArtCraft Studio'/'00 Private'/'Projects'
    if (project.parent!=private or not re.fullmatch(r'JARVIS-[a-f0-9]{32}',project.name)
        or chosen['native']!=project/'source/Implementation-Jarvis-native.deckcraft'
        or chosen['export']!=project/'exports/Implementation-Jarvis-native.pdf'
        or chosen['preview']!=project/'previews/Implementation-Jarvis-native.png'
        or chosen['note']!=_VAULT_ROOT/'00_Outer_Heaven/shared/inbox'/('Jarvis-implementation-'+project.name[7:]+'-Jarvis-native.md')):
        raise ValueError('fresh private delivery targets outside exact owner scope')
    if any(p.is_symlink() for target in chosen.values() for p in (target,*target.parents)):
        raise ValueError('linked delivery target requires review')
    return {k:str(v) for k,v in chosen.items()}


def delivery_scope(hive,mission_id):
    """Validate exact output intent from current owner intake; no permission mint."""
    try:
        root=_path(hive,mission_id);request_sha,control=_task(root,mission_id)
        row,_,_=_read(root/'delivery_scope.json');check=dict(row);proof=check.pop('digest',None)
        request,_,_=_read(root/'request.json')
        expected=delivery_targets(request['objective'],mission_id)
        if (proof!=_digest(json.dumps(check,sort_keys=True,separators=(',',':')).encode())
            or row.get('request_sha256')!=request_sha or row.get('mission_id')!=mission_id
            or row.get('authority')!='original_owner_requested_private_deliverables' or row.get('create_only') is not True
            or row.get('artifact_ids')!={phase:mission_id+':'+phase for phase in ('native','export','preview','note')}
            or any(row.get(k)!=v for k,v in expected.items()) or _task(root,mission_id)!=(request_sha,control)):
            return {}
        return row
    except (OSError,ValueError,TypeError):return {}


def files(hive,mission_id):
    """Read only exact task outputs with actual completed readback receipts."""
    scope=delivery_scope(hive,mission_id)
    if not scope:return []
    try:
        root=_path(hive,mission_id);state,_,_=_read(root/'delivery.json');completed=state.get('completed') or {};found=[]
        for phase in ('native','export','preview','note'):
            proof=completed.get(phase) or {};path=Path(scope[phase])
            if any(p.is_symlink() for p in (path,*path.parents)):continue
            if phase=='note':
                sha=proof.get('sha256') if proof.get('readback_verified') is True and proof.get('path')=='00_Outer_Heaven/shared/inbox/'+path.name else None
            else:
                receipt=proof.get('file') or {};sha=receipt.get('sha256') if receipt.get('path')==str(path) else None
            if isinstance(sha,str) and path.is_file() and path.stat().st_size<=5_000_000 and _digest(path.read_bytes())==sha:found.append(str(path))
        return found if delivery_scope(hive,mission_id)==scope else []
    except (OSError,ValueError,TypeError):return []
