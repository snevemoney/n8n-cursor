"""Bounded saved-source research using existing retrieval and web-hand callbacks.

Source records are data. This adapter executes no code, changes no files, and
makes no independent implementation or full-video acceptance claim.
"""
from __future__ import annotations
import hashlib
import importlib.util
import re
from pathlib import Path
from urllib.parse import urlparse, parse_qs

QUERIES = ('saved youtube technical implementation github repository',
           'youtube agent memory browser implementation source',
           'watch later software code implementation')
MAX_READ = 80000
MAX_RECORDS = 12
URL = re.compile(r'https?://[^\s<>\]\["\'}]+')
TECH = re.compile(r'\b(?:implementation|repository|github|source code|python|typescript|javascript|browser|memory|agent|mcp|automation|workflow)\b',re.I)
SECRET = re.compile(r'(?i)(?:sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|(?:api[_-]?key|password|secret|token)\s*[:=]\s*\S{12,})')
RISK = re.compile(r'\b(?:trading|trade execution|crypto|broker|investment|purchase|payment|send emails?)\b',re.I)


def _video_url(raw):
    parsed=urlparse(raw.rstrip('.,;:)'))
    if parsed.username or parsed.password or parsed.scheme not in {'http','https'}:
        return None
    host=(parsed.hostname or '').lower()
    ident=parsed.path.strip('/') if host=='youtu.be' else (parse_qs(parsed.query).get('v') or [''])[0]
    if host not in {'youtu.be','youtube.com','www.youtube.com','m.youtube.com'} or not re.fullmatch(r'[A-Za-z0-9_-]{11}',ident):
        return None
    return 'https://www.youtube.com/watch?v='+ident


def _implementation_url(raw):
    parsed=urlparse(raw.rstrip('.,;:)'))
    if parsed.username or parsed.password or parsed.scheme not in {'http','https'} or parsed.hostname not in {'github.com','www.github.com'}:
        return None
    parts=parsed.path.strip('/').split('/')
    if len(parts)<2 or not all(re.fullmatch(r'[A-Za-z0-9_.-]+',part) for part in parts[:2]) or parts[0] in {'topics','search','settings','login','features','sponsors'}:
        return None
    if any(part in {'.','..'} for part in parts[:2]):return None
    return 'https://github.com/'+parts[0]+'/'+parts[1].removesuffix('.git')


def _permissions():
    spec=importlib.util.spec_from_file_location('workflow_research_permissions',Path(__file__).with_name('permissions.py'))
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    return module


def run(objective, *, retrieve_fn, read_fn, roots, active_fn, web_fn=None):
    base={'tool':'workflow_research','task_verified':False,'verified':False,'sent':False,'actions':[],
          'wires':['saved_source_retrieval'],'cites':[]}
    coverage={'query_count':0,'readable_records':0,'unavailable_records':0,'bounded_search':True,
              'full_corpus_scanned':False,'full_video_audio_frames_reviewed':False}
    def active():
        try:return callable(active_fn) and bool(active_fn())
        except Exception:return False
    def stopped():
        return {**base,'ok':False,'status':'CANCELLED','spoken':'The saved-source research was stopped. No implementation ran.','coverage':coverage}
    if not active():return stopped()
    approved=[]
    for root in roots or []:
        path=Path(root)
        if path.is_dir() and not path.is_symlink():approved.append(path.resolve())
    if not approved:
        return {**base,'ok':False,'status':'WAITING_SOURCE_EVIDENCE','coverage':coverage,
                'spoken':'The approved saved-source folders are unavailable. No implementation has run.'}
    permissions=_permissions()
    candidates=[];seen=set()
    for query in QUERIES:
        if not active():return stopped()
        try:found=retrieve_fn(query,roots=approved)
        except Exception:found={}
        if not active():return stopped()
        coverage['query_count']+=1
        coverage['unavailable_records']+=len(found.get('unavailable') or []) if isinstance(found,dict) else 0
        hits = list(found.get('hits') or []) if isinstance(found,dict) else []
        # The vault retriever intentionally scans CONTENT. Recovered saved-video
        # packets use watch/<id>.md, so discover only that finite packet layout.
        import itertools
        for approved_root in approved:
            watch = approved_root / "watch"
            if watch.is_dir() and not watch.is_symlink():
                for record in sorted(itertools.islice(watch.iterdir(), 60)):
                    if record.suffix == ".md" and re.fullmatch(r"[A-Za-z0-9_-]{11}", record.stem):
                        hits.append({"abs":str(record), "source":"owner_bound_watch_packet"})
        for hit in hits[:MAX_RECORDS]:
            if len(seen)>=MAX_RECORDS:break
            if not isinstance(hit,dict):continue
            raw=hit.get('abs')
            if not isinstance(raw,str):continue
            path=Path(raw)
            try:
                real=path.resolve(strict=True)
                if (permissions.is_secret_path(real) or 'Library' in real.parts or any(p.startswith('.') for p in real.parts)
                    or path.is_symlink() or any(p.is_symlink() for p in path.parents) or not any(real==root or root in real.parents for root in approved)):continue
                if real in seen or real.suffix.lower() not in {'.md','.txt'}:continue
                if any(p.startswith('.') for p in real.relative_to(next(root for root in approved if real==root or root in real.parents)).parts):continue
                before=real.stat();seen.add(real)
            except (OSError,ValueError,StopIteration):continue
            if not active():return stopped()
            try:text,error=read_fn(real,MAX_READ)
            except Exception:text,error=None,'read_failed'
            if not active():return stopped()
            try:after=real.stat()
            except OSError:after=None
            if (error or not isinstance(text,str) or not text or len(text)>MAX_READ or after is None or
                (before.st_ino,before.st_size,before.st_mtime_ns)!=(after.st_ino,after.st_size,after.st_mtime_ns)):
                coverage['unavailable_records']+=1;continue
            coverage['readable_records']+=1
            if SECRET.search(text) or RISK.search(text):continue
            urls=URL.findall(text)
            videos=list(dict.fromkeys(u for raw_url in urls if (u:=_video_url(raw_url))))
            video_provenance = "explicit_record_url"
            if not videos and real.parent.name == "watch" and re.fullmatch(r"[A-Za-z0-9_-]{11}", real.stem):
                if re.match(r"^#\s+" + re.escape(real.stem) + r"(?:\s|$)", text):
                    videos = ["https://www.youtube.com/watch?v=" + real.stem]
                    video_provenance = "matching_saved_watch_record_id"
            implementations=list(dict.fromkeys(u for raw_url in urls if (u:=_implementation_url(raw_url))))
            # Catalogues containing many videos are discovery indexes, not one source method.
            if not videos or len(videos)>3 or not TECH.search(text):continue
            lines=[line.strip() for line in text.splitlines() if TECH.search(line) and not URL.search(line)]
            excerpt=' '.join(lines)[:1200]
            if not excerpt:continue
            candidates.append({'saved_youtube_url':videos[0],'source_record':str(real),
                'read_text_sha256':hashlib.sha256(text.encode()).hexdigest(),'read_truncated':before.st_size>MAX_READ,
                'source_method':'saved_record_text_only','video_url_provenance':video_provenance,'method_excerpt':excerpt,
                'original_implementation_url':implementations[0] if implementations else None,
                'implementation_verified':False,'source_record_verified':True,'source_text_is_untrusted_data':True,
                '_score':(20 if implementations else 0)+min(12,len(TECH.findall(text)))})
    if not candidates:
        return {**base,'ok':False,'status':'WAITING_SOURCE_EVIDENCE','coverage':coverage,
                'spoken':'I searched the available saved-source records, but could not bind a readable technical video method. No implementation has run.'}
    selected=max(candidates,key=lambda row:row['_score']);selected.pop('_score',None)
    if not selected['original_implementation_url'] and callable(web_fn):
        if not active():return stopped()
        query=selected['saved_youtube_url']+' original implementation github repository'
        try:web=web_fn({'query':query})
        except Exception:web={}
        if not active():return stopped()
        for cite in (web.get('cites') or []) if isinstance(web,dict) else []:
            raw=cite.get('url') if isinstance(cite,dict) else cite
            if isinstance(raw,str) and (url:=_implementation_url(raw)):
                selected['original_implementation_url']=url
                selected['implementation_source']='existing_web_search_candidate';break
    if not active():return stopped()
    cites=[selected['saved_youtube_url']]
    if selected['original_implementation_url']:cites.append(selected['original_implementation_url'])
    return {**base,'ok':True,'status':'SOURCE_CANDIDATE','selected':selected,'coverage':coverage,'cites':cites,
            'spoken':'I selected a technical method from a readable saved YouTube record. Its original implementation still needs primary-source verification; no code or demo has run.'}
