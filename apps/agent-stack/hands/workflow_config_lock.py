"""Configuration-preservation gate: capture trusted source, reject writes before mutation.

Digests contain no environment values. The caller pins lock.digest in the existing
immutable mission request; this module is neither a model router nor an authority store.
"""
from __future__ import annotations
import ast
import hashlib
import json
import os
import re
import stat
from collections import Counter
from pathlib import Path

WHOLE_FILES=('brain/online.py','brain/jev_router.py','brain/jev_preflight.py','brain/profiles.py',
             'brain/reflex5.py','brain/shared_context.py','mouth/voice.py','mouth/persona.py',
             'hands/code_author.py','hands/web_search.py','hands/voice_engine.py','hands/methods_config.py',
             'hands/methods_voice.py','hands/pointer.py')
ANCHORS={'hands/agent_tools.py':('llm','rank_skills','_or_key','_load_brain_online'),
         'hands/browser_runtime.py':('ModelGateway',),'brain/pipeline.py':('online_talk',)}
EXCLUDED={'.git','.hive','__pycache__','.pytest_cache','node_modules','logs'}
MAX_FILES=1000
MAX_TOTAL=8_000_000
MAX_FILE=2_000_000
CONFIG_NAME=re.compile(r'(?:MODEL|PROVIDER|ENDPOINT|FALLBACK|VOICE|VISION|JEV|TTS|STT|KOKORO|ELEVEN|OPENROUTER|ANTHROPIC|XAI|LITELLM|CODE_SYS|MAX_ITERS)',re.I)
CONFIG_LITERAL=re.compile(r'(?:https?://[^\s]*(?:openrouter|openai|x\.ai|elevenlabs|llm\.evenslouis)|(?:anthropic|openai|x-ai|deepseek|mistralai|typesafe|google)/[\w.:-]+|kokoro|eleven_v[0-9])',re.I)
CONFIG_SUFFIXES={'.json','.toml','.yaml','.yml','.ini','.cfg','.sh'}
CONFIG_FIELD=re.compile(r'''(?i)["']?(?:model|provider|endpoint|base_url|fallbacks?|voice|voice_id|vision_model|jev|tts|stt)["']?\s*[:=]''')
SECRET_PATH=re.compile(r'(^|/)(?:\.env[^/]*|\.ssh|\.aws|\.grok-private|credentials[^/]*|secrets?[^/]*|[^/]*\.(?:pem|key))(/|$)',re.I)
ENV_NAME=re.compile(r'^[A-Z][A-Z0-9_]*$')

class ConfigLockError(ValueError):pass


def _digest(value):
    return hashlib.sha256(json.dumps(value,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()).hexdigest()


def _read(path):
    if any(p.is_symlink() for p in (path,*path.parents)) or SECRET_PATH.search(str(path)):
        raise ConfigLockError('unsafe_configuration_source')
    with os.fdopen(os.open(path,os.O_RDONLY|os.O_NOFOLLOW),'rb') as stream:
        before=os.fstat(stream.fileno())
        if not stat.S_ISREG(before.st_mode) or before.st_size>MAX_FILE:raise ConfigLockError('configuration_source_budget')
        raw=stream.read(MAX_FILE+1);after=os.fstat(stream.fileno())
    current=path.stat()
    identity=lambda s:(s.st_dev,s.st_ino,s.st_size,s.st_mtime_ns,s.st_mode)
    if identity(before)!=identity(after) or identity(after)!=identity(current) or len(raw)>MAX_FILE:
        raise ConfigLockError('configuration_source_changed_during_read')
    return raw,{'sha256':hashlib.sha256(raw).hexdigest(),'mode':stat.S_IMODE(before.st_mode),'size':len(raw)}


def _name(node):
    if isinstance(node,ast.Name):return node.id
    if isinstance(node,ast.Attribute):return _name(node.value)+'.'+node.attr
    return ''


def _contains_config(node):
    for child in ast.walk(node):
        if isinstance(child,(ast.Name,ast.Attribute)) and CONFIG_NAME.search(_name(child)):return True
        if isinstance(child,ast.Constant) and isinstance(child.value,str) and (CONFIG_LITERAL.search(child.value) or ENV_NAME.fullmatch(child.value) and CONFIG_NAME.search(child.value)):return True
    return False


def _semantics(text,rel):
    try:tree=ast.parse(text)
    except (SyntaxError,ValueError):raise ConfigLockError('configuration_python_invalid')
    anchors={}
    for node in tree.body:
        if isinstance(node,(ast.FunctionDef,ast.AsyncFunctionDef,ast.ClassDef)) and node.name in ANCHORS.get(rel,()):
            anchors[node.name]=_digest(ast.dump(node,include_attributes=False))
    sensitive=[];env=set();imports=[];selector_functions={};selector_controls=[]
    for node in ast.walk(tree):
        if isinstance(node,(ast.If,ast.IfExp,ast.For,ast.AsyncFor,ast.While,ast.Try,ast.With,ast.AsyncWith,ast.Match)):
            selector=(_contains_config(node) or any(isinstance(child,ast.keyword) and child.arg and CONFIG_FIELD.fullmatch(child.arg+':') for child in ast.walk(node)))
            if selector:
                # Module/class control flow can select a provider before any
                # function runs. Bind its enclosing statement, not leaf nodes.
                selector_controls.append(_digest(ast.dump(node,include_attributes=False)))
        if isinstance(node,(ast.Import,ast.ImportFrom)):
            imports.append({'module':getattr(node,'module',None),'level':getattr(node,'level',0),
                            'names':sorted(alias.name for alias in node.names)})
        if isinstance(node,(ast.FunctionDef,ast.AsyncFunctionDef)):
            selector=(_contains_config(node) or any(isinstance(child,ast.keyword) and child.arg and CONFIG_FIELD.fullmatch(child.arg+':') for child in ast.walk(node)))
            if selector:
                # Bind the whole selector-bearing function, including enclosing
                # branches/conditions: call multisets cannot prove routing parity.
                selector_functions.setdefault(node.name,[]).append(_digest(ast.dump(node,include_attributes=False)))
    for node in ast.walk(tree):
        if isinstance(node,(ast.Assign,ast.AnnAssign,ast.AugAssign,ast.Delete)) and _contains_config(node):
            sensitive.append(('assignment',_digest(ast.dump(node,include_attributes=False))))
        if isinstance(node,ast.Constant) and isinstance(node.value,str) and CONFIG_LITERAL.search(node.value):
            sensitive.append(('provider_literal',_digest(node.value)))
        if isinstance(node,ast.Subscript) and isinstance(node.slice,ast.Constant) and isinstance(node.slice.value,str) and CONFIG_FIELD.fullmatch(node.slice.value+':'):
            sensitive.append(('configuration_subscript',_digest(ast.dump(node,include_attributes=False))))
        if isinstance(node,ast.Dict):
            for key,value in zip(node.keys,node.values):
                if isinstance(key,ast.Constant) and isinstance(key.value,str) and CONFIG_FIELD.fullmatch(key.value+':'):
                    sensitive.append(('model_mapping',_digest((key.value,ast.dump(value,include_attributes=False)))))
        if isinstance(node,ast.Call):
            name=_name(node.func);tail=name.rsplit('.',1)[-1]
            if tail in {'setattr','delattr','exec','eval','compile','__import__','globals','locals','vars','exec_module','import_module'}:
                sensitive.append(('dynamic_configuration',_digest(ast.dump(node,include_attributes=False))))
            if 'environ' in name or tail in {'getenv','putenv','unsetenv'}:
                for arg in node.args[:1]:
                    if isinstance(arg,ast.Constant) and isinstance(arg.value,str) and ENV_NAME.fullmatch(arg.value) and CONFIG_NAME.search(arg.value):
                        env.add(arg.value);sensitive.append(('configuration_environment',_digest(ast.dump(node,include_attributes=False))))
            selected=[]
            if tail=='llm' and len(node.args)>1:selected.append(('model',ast.dump(node.args[1],include_attributes=False)))
            if tail in {'chat','route','select'} and len(node.args)>1 and ('gateway' in name.lower() or 'router' in name.lower()):
                selected.append(('role',ast.dump(node.args[1],include_attributes=False)))
                if tail=='chat' and len(node.args)>2:selected.append(('model',ast.dump(node.args[2],include_attributes=False)))
            for keyword in node.keywords:
                if keyword.arg and re.fullmatch(r'(?:model|model_id|provider|endpoint|base_url|fallbacks?|voice|voice_id|vision_model|jev_model)',keyword.arg,re.I):
                    selected.append((keyword.arg,ast.dump(keyword.value,include_attributes=False)))
            if selected:sensitive.append(('model_call_selection',_digest((name,selected))))
    return {'anchors':anchors,'sensitive':sorted(sensitive),'env_names':sorted(env),
            'selector_functions':{name:sorted(values) for name,values in selector_functions.items()},
            'selector_controls':sorted(selector_controls),
            'imports':imports}


def _inventory(app):
    app=Path(app)
    if not app.is_dir() or any(p.is_symlink() for p in (app,*app.parents)):raise ConfigLockError('unsafe_app_root')
    rows={};raws={};total=0
    for directory,dirs,names in os.walk(app,followlinks=False):
        parent=Path(directory)
        for name in list(dirs):
            if (parent/name).is_symlink():raise ConfigLockError('symlink_configuration_source')
            if name in EXCLUDED or SECRET_PATH.search(str(parent/name)):dirs.remove(name)
        for name in names:
            path=parent/name;rel=str(path.relative_to(app))
            if SECRET_PATH.search(str(path)):continue
            relevant=name.endswith('.py') or path.suffix.lower() in CONFIG_SUFFIXES or rel in WHOLE_FILES or rel in ANCHORS
            if not relevant:continue
            raw,row=_read(path);total+=len(raw)
            if total>MAX_TOTAL or len(rows)>=MAX_FILES:raise ConfigLockError('configuration_inventory_budget')
            if path.suffix.lower() in CONFIG_SUFFIXES and not (CONFIG_FIELD.search(raw.decode('utf-8',errors='replace')) or CONFIG_LITERAL.search(raw.decode('utf-8',errors='replace'))):continue
            rows[rel]=row;raws[rel]=raw
    if not set(WHOLE_FILES+tuple(ANCHORS)).issubset(rows):raise ConfigLockError('required_configuration_source_missing')
    semantic={}
    for rel,raw in raws.items():
        if rel.endswith('.py'):
            result=_semantics(raw.decode('utf-8'),rel)
            if set(ANCHORS.get(rel,()))!=set(result['anchors']):raise ConfigLockError('required_configuration_anchor_missing')
            semantic[rel]=result
    return rows,raws,semantic


def _imports_allowed(rel,current,baseline):
    production=not Path(rel).name.lower().startswith('test')
    if not production:return
    known={_digest(row) for row in baseline}
    for row in current:
        if _digest(row) in known:continue
        modules=([row['module']] if row['module'] else [])+row['names']
        if any(part.lower().startswith('test') for module in modules for part in module.split('.')):
            raise ConfigLockError('production_test_import_refused')


def capture_lock(app_root,dirty_preimages):
    rows,raws,semantic=_inventory(app_root)
    dirty={}
    if not isinstance(dirty_preimages,dict):raise ConfigLockError('dirty_preimages_required')
    for raw_rel,value in dirty_preimages.items():
        rel=_relative(raw_rel)
        expected=value.get('sha256') if isinstance(value,dict) else value
        raw,row=_read(Path(app_root)/rel)
        if expected!=row['sha256']:raise ConfigLockError('dirty_preimage_mismatch')
        dirty[rel]=row
    env=sorted({name for result in semantic.values() for name in result['env_names']})
    lock={'version':1,'guard_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
          'policy_digest':_digest({'whole_files':WHOLE_FILES,'anchors':ANCHORS}),
          'whole_files':{rel:rows[rel] for rel in WHOLE_FILES},'semantic_files':semantic,
          'configuration_data_files':{rel:row for rel,row in rows.items() if Path(rel).suffix.lower() in CONFIG_SUFFIXES},
          'dirty_preimages':dirty,'environment_presence':{name:name in os.environ for name in env},
          'coverage':{'complete_source_inventory':True,'production_python_files':sum(not Path(rel).name.lower().startswith('test') for rel in semantic),
                      'python_files_including_tests':len(semantic),'test_named_files_are_not_exempt':True,
                      'whole_file_count':len(WHOLE_FILES),'selector_file_count':len(ANCHORS),
                      'dirty_preimages_are_not_configuration_coverage':True}}
    lock['digest']=_digest(lock)
    return lock


def _relative(raw):
    path=Path(str(raw))
    if path.is_absolute() or '..' in path.parts or not path.parts or SECRET_PATH.search(str(path)):
        raise ConfigLockError('unsafe_proposed_path')
    normalized=str(path)
    if normalized.startswith('apps/agent-stack/'):
        normalized=normalized[len('apps/agent-stack/'):]
    return normalized


def validate_candidate(lock,source_app,proposedwrites,*,expected_digest=None):
    """Return a guard receipt. This API never performs a source write."""
    try:
        if not isinstance(lock,dict) or lock.get('version')!=1:raise ConfigLockError('configuration_lock_required')
        unsigned={key:value for key,value in lock.items() if key!='digest'}
        if _digest(unsigned)!=lock.get('digest') or expected_digest is not None and expected_digest!=lock['digest']:
            raise ConfigLockError('configuration_lock_digest_mismatch')
        if lock.get('guard_sha256')!=hashlib.sha256(Path(__file__).read_bytes()).hexdigest():raise ConfigLockError('configuration_guard_changed')
        if lock.get('policy_digest')!=_digest({'whole_files':WHOLE_FILES,'anchors':ANCHORS}) or set(lock.get('whole_files',{}))!=set(WHOLE_FILES):
            raise ConfigLockError('configuration_protection_set_incomplete')
        rows,raws,semantic=_inventory(source_app)
        for rel,row in lock['whole_files'].items():
            if rows.get(rel)!=row:raise ConfigLockError('current_whole_file_configuration_drift')
        current_data={rel:row for rel,row in rows.items() if Path(rel).suffix.lower() in CONFIG_SUFFIXES}
        if current_data!=lock.get('configuration_data_files',{}):raise ConfigLockError('configuration_data_file_drift')
        for rel,current in semantic.items():
            recorded=lock.get('semantic_files',{}).get(rel)
            if recorded is None:
                if current['sensitive'] or current['anchors']:raise ConfigLockError('new_current_configuration_surface')
            elif _digest({k:v for k,v in current.items() if k!='imports'})!=_digest({k:v for k,v in recorded.items() if k!='imports'}):raise ConfigLockError('current_selector_configuration_drift')
            _imports_allowed(rel,current['imports'],recorded.get('imports',[]) if recorded else [])
        if any(rel not in semantic for rel,result in lock['semantic_files'].items() if result['sensitive'] or result['anchors']):
            raise ConfigLockError('configuration_selector_source_missing')
        if isinstance(proposedwrites,dict):writes=list(proposedwrites.items())
        elif isinstance(proposedwrites,list):writes=[(row['path'],row['content']) for row in proposedwrites]
        else:raise ConfigLockError('proposed_writes_required')
        seen=set()
        for raw,body in writes:
            rel=_relative(raw)
            rel=next((name for name in rows if name.casefold()==rel.casefold()),rel)
            for destination in (Path(source_app)/rel,Path(source_app).parents[1]/rel):
                if any(path.is_symlink() for path in (destination,*destination.parents)):
                    raise ConfigLockError('symlink_proposed_path')
            if rel in seen:raise ConfigLockError('duplicate_proposed_path')
            seen.add(rel)
            if rel=='hands/workflow_config_lock.py':raise ConfigLockError('configuration_guard_write_refused')
            if not isinstance(body,str) or len(body.encode())>MAX_FILE:raise ConfigLockError('proposed_content_budget')
            candidate=body.encode()
            if rel in lock['whole_files']:
                if hashlib.sha256(candidate).hexdigest()!=lock['whole_files'][rel]['sha256']:
                    raise ConfigLockError('whole_file_configuration_write_refused')
            if Path(rel).suffix.lower() in CONFIG_SUFFIXES:
                sensitive=bool(CONFIG_FIELD.search(body) or CONFIG_LITERAL.search(body))
                recorded=lock.get('configuration_data_files',{}).get(rel)
                if recorded is not None and hashlib.sha256(candidate).hexdigest()!=recorded['sha256']:
                    raise ConfigLockError('configuration_data_write_refused')
                if sensitive and recorded is None:raise ConfigLockError('new_configuration_data_refused')
            if rel.lower().endswith('.py'):
                proposed=_semantics(body,rel);baseline=lock['semantic_files'].get(rel)
                if baseline is None:
                    if proposed['sensitive'] or proposed['anchors']:raise ConfigLockError('new_configuration_surface_refused')
                elif _digest({k:v for k,v in proposed.items() if k!='imports'})!=_digest({k:v for k,v in baseline.items() if k!='imports'}):raise ConfigLockError('selector_configuration_write_refused')
                _imports_allowed(rel,proposed['imports'],baseline.get('imports',[]) if baseline else [])
        return {'ok':True,'task_verified':False,'lock_digest':lock['digest'],'writes_checked':len(writes),'configuration_preserved':True}
    except Exception as exc:
        return {'ok':False,'task_verified':False,'reason':str(exc) if isinstance(exc,ConfigLockError) else 'configuration_guard_unavailable',
                'configuration_preserved':False,'writes_checked':0}
