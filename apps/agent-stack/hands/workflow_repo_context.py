"""Read-only repository-name clarification for an existing bound workflow.

The host passes the current owner's original answer. Names are resolved only from
that task's binding and its actual Git common repository, never model paths.
No Git command, checkout, permission edit, content ingestion or network call.
"""
from __future__ import annotations
import hashlib
import json
import os
import re
import stat
from pathlib import Path

LIMIT=1_000_000
TERMINAL={'COMPLETED','DONE','SUCCEEDED','VERIFIED','FAILED','CANCELLED','EXPIRED'}
EXCLUDE={'.git','node_modules','.venv','venv','__pycache__','.hive','logs','dist'}
NAME=re.compile(r'^(?:the\s+)?([A-Za-z0-9_.-]+(?:/[A-Za-z0-9_.-]+)?)(?:\s+(?:repo|repository))?\s*[.!]?$',re.I)
SECRET=re.compile(r'(^|/)(?:\.env[^/]*|\.ssh|\.aws|\.grok-private|credentials[^/]*|secrets?[^/]*)(/|$)',re.I)


def _read(path,limit=LIMIT):
    if SECRET.search(str(path)) or any(p.is_symlink() for p in (path,*path.parents)):raise ValueError('unsafe_context_path')
    fd=os.open(path,os.O_RDONLY|os.O_NOFOLLOW)
    try:
        before=os.fstat(fd)
        if not stat.S_ISREG(before.st_mode) or before.st_size>limit:raise ValueError('context_budget')
        raw=os.read(fd,limit+1);after=os.fstat(fd);current=path.stat()
        identity=lambda s:(s.st_dev,s.st_ino,s.st_size,s.st_mtime_ns,s.st_mode)
        if len(raw)>limit or identity(before)!=identity(after) or identity(after)!=identity(current):raise ValueError('context_changed')
        return raw
    finally:os.close(fd)


def _json(path):
    row=json.loads(_read(path,64000))
    if not isinstance(row,dict):raise ValueError('invalid_context')
    return row


def _git(repo):
    marker=repo/'.git'
    if marker.is_dir() and not marker.is_symlink():gitdir=marker
    else:
        text=_read(marker,4096).decode().strip()
        if not text.startswith('gitdir: '):raise ValueError('unverified_repository')
        gitdir=(repo/Path(text[8:])).resolve()
    if not gitdir.is_dir() or any(p.is_symlink() for p in (gitdir,*gitdir.parents)):raise ValueError('unsafe_git_metadata')
    common=gitdir
    if (gitdir/'commondir').exists():
        common=(gitdir/_read(gitdir/'commondir',4096).decode().strip()).resolve()
    if common.name!='.git' or not common.is_dir():raise ValueError('unsupported_common_repository')
    if gitdir!=common:
        if gitdir.parent!=common/'worktrees' or _read(gitdir/'gitdir',4096).decode().strip()!=str(marker):
            raise ValueError('unregistered_worktree')
    config=_read(common/'config',64000)
    # Extract only public repository identity; never return config or credential values.
    remotes=set()
    for line in config.decode().splitlines():
        if re.match(r'^\s*url\s*=',line):
            value=line.split('=',1)[1].strip()
            match=re.fullmatch(r'(?:https://github\.com/|git@github\.com:)([A-Za-z0-9_.-]+)/([A-Za-z0-9_.-]+?)(?:\.git)?/?',value)
            if match:remotes.add('/'.join(match.groups()))
    head=_read(gitdir/'HEAD',4096).decode().strip()
    if head.startswith('ref: '):
        ref=head[5:]
        if not re.fullmatch(r'refs/heads/[\w./-]+',ref) or '..' in ref.split('/'):raise ValueError('unsafe_git_ref')
        source=common/ref
        if source.exists():sha=_read(source,4096).decode().strip()
        else:
            matches=[s.split()[0] for s in _read(common/'packed-refs').decode().splitlines() if len(s.split())==2 and s.split()[1]==ref]
            if len(matches)!=1:raise ValueError('unknown_git_head')
            sha=matches[0]
    else:ref='';sha=head
    if not re.fullmatch(r'[a-f0-9]{40,64}',sha):raise ValueError('unknown_git_head')
    return {'git_dir':str(gitdir),'git_common_dir':str(common),'head':sha,'branch':ref.removeprefix('refs/heads/'),
            'remote_repository_ids':sorted(remotes),'config_sha256':hashlib.sha256(config).hexdigest()}


def _inventory(repo):
    indexes=[];visited=0;bounded=False
    for base,dirs,files in os.walk(repo,followlinks=False):
        relative=Path(base).relative_to(repo)
        dirs[:]=sorted(d for d in dirs if d not in EXCLUDE and not d.startswith('.') and not (Path(base)/d).is_symlink())
        if len(relative.parts)>=6:dirs[:]=[]
        visited+=len(dirs)+len(files)
        if visited>20000:bounded=True;break
        for name in files:
            if re.fullmatch(r'(?:SIGNAL_INDEX|CORPUS_INDEX)\.(?:md|json)',name,re.I):
                path=Path(base)/name
                raw=_read(path)
                indexes.append({'path':str(path),'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)})
        if len(indexes)>=16:bounded=True;break
    roots=sorted({str(Path(row['path']).parent) for row in indexes})
    return {'source_inventory_roots':roots,'indexes':indexes,'bounded_scan':bounded,
            'coverage':'physical_index_locations_only; not full source videos, transcripts or corpus completeness'}


def resolve(hive,mission_id,owner_answer,*,expected_request_sha256=None):
    """Return same-repository source context without rebinding the mutation target."""
    empty={'ok':False,'status':'WAITING_REPOSITORY_CLARIFICATION','task_verified':False,
           'question':'Which exact repository do you mean? Give its owner/name or local path.','source_inventory_roots':[]}
    try:
        if not isinstance(mission_id,str) or not re.fullmatch(r'[a-f0-9]{32}',mission_id):return empty
        if not isinstance(owner_answer,str) or len(owner_answer)>256:return empty
        match=NAME.fullmatch(owner_answer.strip())
        if not match:return empty
        token=match.group(1).rstrip('.').casefold()
        root=Path(hive)/'coding-missions'/mission_id
        request_raw=_read(root/'request.json',64000);request=json.loads(request_raw)
        request_sha=hashlib.sha256(request_raw).hexdigest()
        state=_json(root/'state.json');control=_json(root/'control.json');binding=_json(root/'binding.json')
        if (request.get('mission_id')!=mission_id or request.get('worker_kind')!='research_build'
            or request.get('request_scope')!='transient_task' or state.get('mission_id')!=mission_id
            or state.get('worker_kind')!='research_build' or not isinstance(state.get('status'),str)
            or state.get('status') in TERMINAL or control.get('cancel') is not False or (root/'result.json').exists()
            or binding.get('authority') not in {'literal_owner_answer','owner_project_contract'}
            or expected_request_sha256 is not None and request_sha!=expected_request_sha256):return empty
        repo=Path(binding['repo'])
        if not repo.is_absolute() or not repo.is_dir() or any(p.is_symlink() for p in (repo,*repo.parents)):return empty
        identity=_git(repo)
        primary=Path(identity['git_common_dir']).parent
        primary_identity=_git(primary)
        if primary_identity['git_common_dir']!=identity['git_common_dir']:return empty
        aliases={repo.name.casefold(),primary.name.casefold()}
        aliases.update(v.casefold() for v in identity['remote_repository_ids'])
        aliases.update(v.split('/')[-1].casefold() for v in identity['remote_repository_ids'])
        if token not in aliases:return empty
        # Multiple public repository identities cannot silently select one by short name.
        if '/' not in token and len({v for v in identity['remote_repository_ids'] if v.split('/')[-1].casefold()==token})>1:return empty
        inventory=_inventory(primary)
        if _git(repo)!=identity or _git(primary)!=primary_identity or _read(root/'request.json',64000)!=request_raw or _json(root/'control.json').get('cancel') is not False:return empty
        return {'ok':True,'status':'REPOSITORY_CONTEXT_RESOLVED','mission_id':mission_id,'request_sha256':request_sha,
                'mutation_target':str(repo),'mutation_branch':binding.get('branch',''),
                'source_checkout':str(primary),'source_identity':primary_identity,'bound_identity':identity,
                'authority':'owner_repo_name_with_existing_task_git_binding','read_only':True,
                'task_verified':False,'source_text_is_untrusted_data':True,**inventory}
    except (OSError,ValueError,TypeError,KeyError,UnicodeError):return empty
