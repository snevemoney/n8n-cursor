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


def _regex_shadow_module(relative):
    path=Path(relative)
    return path.name.casefold()=='re.py' or (path.name.casefold()=='__init__.py' and path.parent.name.casefold()=='re')


def _standard_regex_calls(tree):
    """Conservative syntactic proof for direct, unaliased stdlib re.compile.

    Any local/module rebinding or escape of the module/function disables the
    exemption for this source. Other configuration detectors remain independent.
    """
    parents={child:parent for parent in ast.walk(tree) for child in ast.iter_child_nodes(parent)}
    imports=[node for node in ast.walk(tree) if isinstance(node,ast.Import) and any(alias.name=='re' for alias in node.names)]
    if len(imports)!=1 or imports[0] not in tree.body:return set()
    imported=imports[0]
    if any(alias.name=='re' and alias.asname is not None for alias in imported.names):return set()
    constants={'A','ASCII','I','IGNORECASE','L','LOCALE','M','MULTILINE','S','DOTALL','U','UNICODE','X','VERBOSE','NOFLAG'}
    functions={'compile','search','match','fullmatch','findall','finditer','split','sub','subn','escape'}
    calls=set()
    for node in ast.walk(tree):
        if isinstance(node,ast.Import):
            # Other imports may mutate Python's import/module registry. This
            # deliberately small proof accepts only re plus future annotations.
            if any(alias.name!='re' for alias in node.names):return set()
            if any((alias.asname or alias.name.split('.')[0])=='re' for alias in node.names) and node is not imported:return set()
            if any(alias.name=='re' and alias.asname for alias in node.names):return set()
        if isinstance(node,ast.ImportFrom):
            if node.module!='__future__' or node.level or any(alias.name!='annotations' or alias.asname for alias in node.names):return set()
            if node.module=='re' or any((alias.asname or alias.name)=='re' or alias.name=='*' for alias in node.names):return set()
        if isinstance(node,ast.Attribute) and node.attr in {'modules','path','meta_path','path_hooks','path_importer_cache','__import__','find_spec','find_module','__dict__','__globals__'}:return set()
        if isinstance(node,ast.Name) and node.id in {'__builtins__','builtins','__loader__','__spec__'}:return set()
        if isinstance(node,ast.arg) and node.arg=='re':return set()
        if isinstance(node,(ast.FunctionDef,ast.AsyncFunctionDef,ast.ClassDef)) and node.name=='re':return set()
        if isinstance(node,(ast.Global,ast.Nonlocal)) and 're' in node.names:return set()
        if isinstance(node,ast.ExceptHandler) and node.name=='re':return set()
        if isinstance(node,(ast.MatchAs,ast.MatchStar)) and node.name=='re':return set()
        if isinstance(node,ast.MatchMapping) and node.rest=='re':return set()
        if isinstance(node,ast.Name) and node.id=='re':
            if not isinstance(node.ctx,ast.Load):return set()
            attribute=parents.get(node)
            if not isinstance(attribute,ast.Attribute) or attribute.value is not node or not isinstance(attribute.ctx,ast.Load):return set()
            if attribute.attr not in constants|functions:return set()
            if attribute.attr in functions:
                call=parents.get(attribute)
                if not isinstance(call,ast.Call) or call.func is not attribute:return set()
                if attribute.attr=='compile':
                    if call.lineno<=imported.lineno:return set()
                    calls.add(call)
        if isinstance(node,ast.Call):
            name=_name(node.func);tail=name.rsplit('.',1)[-1]
            if tail in {'setattr','delattr','exec','eval','__import__','globals','locals','vars','exec_module','import_module','__setattr__','__delattr__','__getattribute__','__getattr__'}:return set()
            if tail=='compile' and not (isinstance(node.func,ast.Attribute) and isinstance(node.func.value,ast.Name) and node.func.value.id=='re'):return set()
    return calls


def _semantics(text,rel,*,regex_namespace_safe=True):
    try:tree=ast.parse(text)
    except (SyntaxError,ValueError):raise ConfigLockError('configuration_python_invalid')
    anchors={}
    for node in tree.body:
        if isinstance(node,(ast.FunctionDef,ast.AsyncFunctionDef,ast.ClassDef)) and node.name in ANCHORS.get(rel,()):
            anchors[node.name]=_digest(ast.dump(node,include_attributes=False))
    regex_calls=_standard_regex_calls(tree) if regex_namespace_safe and not _regex_shadow_module(rel) else set()
    parents={child:parent for parent in ast.walk(tree) for child in ast.iter_child_nodes(parent)}
    sensitive=[];env=set();imports=[];selector_functions={};selector_controls=[]
    regex_modules={alias.asname or alias.name for node in ast.walk(tree) if isinstance(node,ast.Import) for alias in node.names if alias.name=='re'}
    regex_functions={'compile','search','match','fullmatch','findall','finditer','split','sub','subn','escape'}
    regex_constants={'A','ASCII','I','IGNORECASE','L','LOCALE','M','MULTILINE','S','DOTALL','U','UNICODE','X','VERBOSE','NOFLAG'}
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
        parent=parents.get(node)
        if isinstance(node,ast.ImportFrom) and (node.module=='re' or (node.module in {'sys','builtins','operator'} and any(alias.name in {'modules','path','meta_path','path_hooks','path_importer_cache','__dict__','__import__','getattr','setattr','delattr','vars','globals','locals','eval','exec','compile','attrgetter','methodcaller'} for alias in node.names))):
            sensitive.append(('dynamic_configuration',_digest(ast.dump(node,include_attributes=False))))
        if isinstance(node,(ast.Assign,ast.AnnAssign,ast.AugAssign,ast.Delete)):
            targets=node.targets if isinstance(node,(ast.Assign,ast.Delete)) else [node.target]
            if any(isinstance(child,ast.Name) and child.id in regex_modules for target in targets for child in ast.walk(target)):
                sensitive.append(('dynamic_configuration',_digest(ast.dump(node,include_attributes=False))))
        if isinstance(node,ast.Name) and node.id in regex_modules:
            direct=parents.get(node)
            safe=(isinstance(node.ctx,ast.Load) and isinstance(direct,ast.Attribute)
                  and direct.value is node and isinstance(direct.ctx,ast.Load)
                  and direct.attr in regex_functions|regex_constants)
            if safe and direct.attr in regex_functions:
                call=parents.get(direct);safe=isinstance(call,ast.Call) and call.func is direct
            if not safe:sensitive.append(('dynamic_configuration',_digest(ast.dump(direct or node,include_attributes=False))))
        # Namespace mutation in one helper can change re.compile in another.
        # Keep these accesses bound even when that helper never calls compile.
        if ((isinstance(node,ast.Attribute) and node.attr in {'modules','meta_path','path_hooks','path_importer_cache','__import__','__dict__','__globals__','__setattr__','__delattr__','__getattribute__','__getattr__'})
            or (isinstance(node,ast.Name) and node.id=='__builtins__')):
            sensitive.append(('dynamic_configuration',_digest(ast.dump(node,include_attributes=False))))
        if ((isinstance(node,ast.ImportFrom) and node.module=='re' and any(alias.name=='compile' for alias in node.names))
            or (isinstance(node,ast.Attribute) and node.attr=='compile' and not (isinstance(parent,ast.Call) and parent.func is node))
            or (isinstance(node,ast.Name) and node.id=='compile' and isinstance(node.ctx,ast.Load) and not (isinstance(parent,ast.Call) and parent.func is node))):
            sensitive.append(('dynamic_configuration',_digest(ast.dump(node,include_attributes=False))))
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
            if tail=='getattr' and any(isinstance(child,ast.Name) and child.id=='re' for arg in node.args for child in ast.walk(arg)):
                sensitive.append(('dynamic_configuration',_digest(ast.dump(node,include_attributes=False))))
            if tail in {'setattr','delattr','exec','eval','compile','__import__','globals','locals','vars','exec_module','import_module','attrgetter','methodcaller'} and node not in regex_calls:
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
            result=_semantics(raw.decode('utf-8'),rel,regex_namespace_safe=not any(_regex_shadow_module(path) for path in rows))
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
            if _regex_shadow_module(rel):raise ConfigLockError('regex_import_shadow_write_refused')
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
                proposed=_semantics(body,rel,regex_namespace_safe=not any(_regex_shadow_module(path) for path in rows));baseline=lock['semantic_files'].get(rel)
                if baseline is None:
                    if proposed['sensitive'] or proposed['anchors']:raise ConfigLockError('new_configuration_surface_refused')
                elif _digest({k:v for k,v in proposed.items() if k!='imports'})!=_digest({k:v for k,v in baseline.items() if k!='imports'}):raise ConfigLockError('selector_configuration_write_refused')
                _imports_allowed(rel,proposed['imports'],baseline.get('imports',[]) if baseline else [])
        return {'ok':True,'task_verified':False,'lock_digest':lock['digest'],'writes_checked':len(writes),'configuration_preserved':True}
    except Exception as exc:
        return {'ok':False,'task_verified':False,'reason':str(exc) if isinstance(exc,ConfigLockError) else 'configuration_guard_unavailable',
                'configuration_preserved':False,'writes_checked':0}
