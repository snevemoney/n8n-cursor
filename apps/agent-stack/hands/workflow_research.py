"""Bounded saved-source research using existing retrieval and web-hand callbacks.

Source records are data. This adapter executes no code, changes no files, and
makes no independent implementation or full-video acceptance claim.
"""
from __future__ import annotations
import hashlib
import importlib.util
import json
import re
from pathlib import Path
from urllib.parse import urlparse, parse_qs

QUERIES = ('saved youtube technical implementation github repository',
           'youtube agent memory browser implementation source',
           'watch later software code implementation')
MAX_READ = 80000
MAX_RECORDS = 12
MAX_DISCOVERED_RECORDS = 512
MAX_DIRECTORY_ENTRIES = 2048
MAX_METADATA_READ = 2048
URL = re.compile(r'https?://[^\s<>\]\["\'}]+')
TECH = re.compile(r'\b(?:implementation|repository|github|source code|python|typescript|javascript|browser|memory|agent|mcp|automation|workflow)\b',re.I)
SECRET = re.compile(r'(?i)(?:sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|(?:api[_-]?key|password|secret|token)\s*[:=]\s*\S{12,})')
RISK = re.compile(r'\b(?:trading|trade execution|crypto|broker|investment|purchase|payment|send emails?)\b',re.I)
WORDS = re.compile(r'[a-z][a-z0-9-]{2,}', re.I)
GENERIC = frozenset('research technical idea saved youtube videos video find original implementation build working version project run tests fix failures create professional demonstration using artcraft document obsidian present finished results preserve existing code models goal workflow source github repository'.split())
STOPWORDS = frozenset('about after all also and are before can could did does for from has have how into its may more most not now our should some than that the their them then these they this those through until use user was were what when where which who will with would your private current'.split())
TOPICS = {
    'agent_execution': re.compile(r'\b(?:agent|assistant|jarvis|harness|tool(?:s|ing)?|planning|reasoning)\b', re.I),
    'coding': re.compile(r'\b(?:coding|programming|python|typescript|javascript|software|code editor|test failures?)\b', re.I),
    'continuity': re.compile(r'\b(?:checkpoint|resume|continuity|recover(?:y)?|interrupt(?:ion)?|cancel(?:lation)?|stop)\b', re.I),
    'memory': re.compile(r'\b(?:memory|recall|retriev(?:al|e)|knowledge|notes?|provenance)\b', re.I),
    'computer_use': re.compile(r'\b(?:browser|desktop|computer|screen|click|pointer|observation|observe)\b', re.I),
    'spreadsheet': re.compile(r'\b(?:spreadsheet|google sheets|row enrichment|enrich company)\b', re.I),
    'creative': re.compile(r'\b(?:video editing|motion graphics|illustration|design studio|creative production)\b', re.I),
}
PRIMARY_CODE_LABEL = re.compile(r'\b(?:original\s+(?:implementation|repository|code)|(?:source|demo|example|video)\s+code|code\s+for\s+(?:this|the)\s+video|github\s+(?:repo|repository)|repository\s+(?:for\s+(?:this|the)\s+video|link))\b', re.I)


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


def _context(objective, project_context):
    """Project evidence is supplied by the host's owner-binding path, not a source."""
    project = project_context if isinstance(project_context, dict) else {}
    verified = project.get('verified') is True and project.get('source') == 'owner_project_binding'
    parts = [str(objective or '')]
    if verified:
        parts += [str(project.get(key) or '') for key in ('name', 'summary')]
        parts += [str(item) for item in project.get('capabilities', []) if isinstance(item, str)]
    text = ' '.join(parts)
    return {'text': text, 'project_context_verified': verified,
            'terms': sorted(set(word.lower() for word in WORDS.findall(text)) - GENERIC - STOPWORDS),
            'topics': sorted(topic for topic, pattern in TOPICS.items() if pattern.search(text))}


def _relevance(text, context):
    # Distinct topic/term overlap beats repetitions of generic technical words.
    words = set(word.lower() for word in WORDS.findall(text))
    terms = sorted(words.intersection(context['terms']))
    topics = sorted(topic for topic in context['topics'] if TOPICS[topic].search(text))
    score = len(terms) * 4 + len(topics) * 12
    if context['project_context_verified']:
        score += len(topics) * 8
    low = False
    # A packet's relevance annotation is source evidence for ranking, not policy.
    for identity in ('jarvis', 'assistant'):
        if identity in context['terms'] and re.search(r'\b' + identity + r'\s+(?:relevance|fit)\s*:\s*\*{0,2}(?:low|none)\b', text, re.I):
            low = True
            score -= 60
    return score, {'matched_terms': terms[:20], 'matched_topics': topics,
                   'project_context_verified': context['project_context_verified'],
                   'low_relevance_annotation': low,
                   'basis': 'retained_objective_and_owner_bound_project' if context['project_context_verified'] else 'retained_objective_only'}


def primary_origin_probe(video_url):
    """Fixed read-only public metadata request; this module launches nothing."""
    canonical = _video_url(video_url)
    if not canonical:
        raise ValueError('canonical saved YouTube source required')
    template = '{"id":%(id)j,"title":%(title)j,"channel":%(channel)j,"description":%(description)j}'
    return {'kind': 'youtube_public_metadata', 'url': canonical, 'download': False,
            'argv': ['yt-dlp', '--skip-download', '--ignore-config', '--no-playlist', '--print', template, canonical]}


def associate_primary_origin(video_url, tool_result):
    """Associate only an explicit code reference in this video's publisher metadata.

    The host invokes the fixed probe with its existing read-only CLI adapter.
    Association is distinct from inspecting a repository/license or executing it.
    """
    result = {'origin_association_verified': False, 'original_implementation_url': None,
              'implementation_verified': False, 'origin_status': 'WAITING_PRIMARY_SOURCE', 'origin_candidates': [],
              'primary_probe_status': 'PRIMARY_PROBE_UNAVAILABLE'}
    if not isinstance(tool_result, dict) or tool_result.get('ok') is not True:
        return result
    raw = tool_result.get('output')
    if tool_result.get('output_truncated') or isinstance(raw, str) and len(raw) > MAX_READ:
        result['primary_probe_status'] = 'PRIMARY_OUTPUT_TRUNCATED'
        return result
    if not isinstance(raw, str) or SECRET.search(raw):
        result['primary_probe_status'] = 'PRIMARY_OUTPUT_UNUSABLE'
        return result
    try:
        metadata = json.loads(raw)
    except (ValueError, TypeError):
        result['primary_probe_status'] = 'PRIMARY_INVALID_JSON'
        return result
    canonical = _video_url(video_url)
    if not canonical or not isinstance(metadata, dict) or metadata.get('id') != parse_qs(urlparse(canonical).query)['v'][0]:
        return result
    description = metadata.get('description')
    if not isinstance(description, str):
        return result
    lines = description.splitlines()
    associated = []
    for number, line in enumerate(lines):
        for raw_url in URL.findall(line):
            url = _implementation_url(raw_url)
            if not url:
                continue
            prefix = line.split(raw_url, 1)[0]
            if not prefix.strip() and number:
                prefix = lines[number - 1]
            explicit = bool(PRIMARY_CODE_LABEL.search(prefix))
            result['origin_candidates'].append({'url': url, 'source': 'publisher_video_description',
                'associated': explicit, 'description_line': number + 1})
            if explicit and url not in associated:
                associated.append(url)
    result['primary_probe_status'] = 'PRIMARY_METADATA_READ'
    result['primary_metadata_sha256'] = hashlib.sha256(raw.encode()).hexdigest()
    result['primary_video_url'] = canonical
    if len(associated) == 1:
        result.update(origin_association_verified=True, original_implementation_url=associated[0],
                      origin_status='PRIMARY_SOURCE_ASSOCIATED', association_basis='publisher_description_explicit_code_reference')
    elif len(associated) > 1:
        result['origin_status'] = 'PRIMARY_SOURCE_AMBIGUOUS'
    return result


def run(objective, *, retrieve_fn, read_fn, roots, active_fn, web_fn=None,
        project_context=None, primary_metadata_fn=None):
    base={'tool':'workflow_research','task_verified':False,'verified':False,'sent':False,'actions':[],
          'wires':['saved_source_retrieval'],'cites':[]}
    coverage={'query_count':0,'readable_records':0,'metadata_records_read':0,'discovered_records':0,
              'unavailable_records':0,'bounded_search':True, 'metadata_limit':MAX_DISCOVERED_RECORDS,
              'full_read_limit':MAX_RECORDS,'discovery_limit_reached':False,
              'directory_entry_limit':MAX_DIRECTORY_ENTRIES,'directory_limit_reached':False,
              'full_corpus_scanned':False,'full_video_audio_frames_reviewed':False}
    context = _context(objective, project_context)
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
    candidates=[];discovered={}
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
                entries=list(itertools.islice(watch.iterdir(), MAX_DIRECTORY_ENTRIES))
                if len(entries)>=MAX_DIRECTORY_ENTRIES:coverage['directory_limit_reached']=True
                for record in sorted(entries):
                    if record.suffix == ".md" and re.fullmatch(r"[A-Za-z0-9_-]{11}", record.stem):
                        hits.append({"abs":str(record), "source":"owner_bound_watch_packet"})
        for hit in hits:
            if len(discovered)>=MAX_DISCOVERED_RECORDS:
                coverage['discovery_limit_reached']=True;break
            if not isinstance(hit,dict):continue
            raw=hit.get('abs')
            if not isinstance(raw,str):continue
            path=Path(raw)
            try:
                real=path.resolve(strict=True)
                if (permissions.is_secret_path(real) or 'Library' in real.parts or any(p.startswith('.') for p in real.parts)
                    or path.is_symlink() or any(p.is_symlink() for p in path.parents) or not any(real==root or root in real.parents for root in approved)):continue
                if real in discovered or real.suffix.lower() not in {'.md','.txt'}:continue
                if any(p.startswith('.') for p in real.relative_to(next(root for root in approved if real==root or root in real.parents)).parts):continue
                discovered[real]=True
            except (OSError,ValueError,StopIteration):continue
    coverage['discovered_records']=len(discovered)
    ranked=[]
    def read_current(real, cap):
        try:
            if (real.is_symlink() or any(p.is_symlink() for p in real.parents)
                or real.resolve(strict=True) != real or not real.is_file()
                or permissions.is_secret_path(real)
                or not any(real==root or root in real.parents for root in approved)):
                return None, None
            before=real.stat()
            text,error=read_fn(real,cap)
            after=real.stat()
        except Exception:
            return None, None
        if (error or not isinstance(text,str) or not text or len(text)>cap or
            (before.st_ino,before.st_size,before.st_mtime_ns)!=(after.st_ino,after.st_size,after.st_mtime_ns)):
            return None, None
        return text, before
    for real in sorted(discovered):
        if not active():return stopped()
        text,before=read_current(real,MAX_METADATA_READ)
        if not active():return stopped()
        if text is None:
            coverage['unavailable_records']+=1;continue
        coverage['metadata_records_read']+=1
        if SECRET.search(text) or RISK.search(text):continue
        score,reason=_relevance(text,context)
        ranked.append((score,str(real),real))
    # Rank over available bounded metadata first; full reads are still bounded.
    for _,_,real in sorted(ranked,key=lambda row:(-row[0],row[1]))[:MAX_RECORDS]:
        if not active():return stopped()
        text,before=read_current(real,MAX_READ)
        if not active():return stopped()
        if text is None:
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
        score,reason=_relevance(text,context)
        candidates.append({'saved_youtube_url':videos[0],'source_record':str(real),
            'read_text_sha256':hashlib.sha256(text.encode()).hexdigest(),'read_truncated':before.st_size>len(text.encode()),
            'source_method':'saved_record_text_only','video_url_provenance':video_provenance,'method_excerpt':excerpt,
            'original_implementation_url':None,
            'origin_candidates':[{'url':url,'source':'saved_record_link','associated':False} for url in implementations],
            'origin_association_verified':False,'origin_status':'WAITING_PRIMARY_SOURCE','relevance':reason,
            'implementation_verified':False,'source_record_verified':True,'source_text_is_untrusted_data':True,
            '_score':score})
    if not candidates:
        return {**base,'ok':False,'status':'WAITING_SOURCE_EVIDENCE','coverage':coverage,
                'spoken':'I searched the available saved-source records, but could not bind a readable technical video method. No implementation has run.'}
    selected=max(candidates,key=lambda row:row['_score']);selected.pop('_score',None)
    if callable(web_fn):
        if not active():return stopped()
        query=selected['saved_youtube_url']+' original implementation github repository'
        try:web=web_fn({'query':query})
        except Exception:web={}
        if not active():return stopped()
        for cite in (web.get('cites') or []) if isinstance(web,dict) else []:
            raw=cite.get('url') if isinstance(cite,dict) else cite
            if isinstance(raw,str) and (url:=_implementation_url(raw)):
                if not any(row['url']==url for row in selected['origin_candidates']):
                    selected['origin_candidates'].append({'url':url,'source':'existing_web_search_candidate','associated':False})
    selected['primary_origin_probe']=primary_origin_probe(selected['saved_youtube_url'])
    if callable(primary_metadata_fn):
        if not active():return stopped()
        try:primary=primary_metadata_fn(selected['primary_origin_probe'])
        except Exception:primary={}
        if not active():return stopped()
        association=associate_primary_origin(selected['saved_youtube_url'],primary)
        previous=selected['origin_candidates']
        selected.update(association)
        selected['origin_candidates']=previous+association['origin_candidates']
    if not active():return stopped()
    cites=[selected['saved_youtube_url']]
    if selected['original_implementation_url']:cites.append(selected['original_implementation_url'])
    line = ('I selected a technical method from a readable saved YouTube record and found its code reference in the video publisher metadata. Repository contents and reuse conditions still need verification; no code or demo has run.'
            if selected['origin_association_verified'] else
            'I selected a technical method from a readable saved YouTube record. Its original implementation still needs primary-source verification; no code or demo has run.')
    return {**base,'ok':True,'status':'SOURCE_CANDIDATE','selected':selected,'coverage':coverage,'cites':cites,'spoken':line}
