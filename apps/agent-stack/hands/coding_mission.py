"""Coding worker adapter subordinate to the existing MissionController and Face.

No scheduler, model configuration, acceptance grader or terminal bus writer here.
"""
from __future__ import annotations
import asyncio
import hashlib
import importlib.util
import json
import os
import re
import signal
import subprocess
import sys
import time
import uuid
from pathlib import Path

STACK = Path(__file__).resolve().parents[1]
TERMINAL = {'COMPLETED', 'FAILED', 'CANCELLED', 'BLOCKED'}


def _load(name, path):
    path = Path(path)
    current = path.stat()
    stamp = (current.st_mtime_ns, current.st_size)
    if name not in sys.modules or getattr(sys.modules[name], '_coding_source_stamp', None) != stamp:
        spec = importlib.util.spec_from_file_location(name, path)
        mod = importlib.util.module_from_spec(spec)
        sys.modules[name] = mod
        exec(compile(path.read_bytes(), str(path), 'exec'), mod.__dict__)
        mod._coding_source_stamp = stamp
    return sys.modules[name]


def read_json(path):
    return _load('coding_bus_io', STACK/'memory'/'bus_io.py').load_json(Path(path))


def write_json(path, row):
    return _load('coding_bus_io', STACK/'memory'/'bus_io.py').write_json(Path(path), row)


def mission_path(hive, mission_id):
    if not re.fullmatch(r'[a-f0-9]{32}', str(mission_id)):
        raise ValueError('invalid coding mission ID')
    return Path(hive)/'coding-missions'/mission_id


def mission_source_manifest():
    names = ('hands/coding_mission.py', 'hands/agent_tools.py', 'hands/permissions.py',
             'brain/mission_controller.py', 'memory/bus_io.py')
    return {name:hashlib.sha256((STACK/name).read_bytes()).hexdigest() for name in names}


def run_coding(args, **kw):
    _load('agent_stack_permissions', STACK/'hands'/'permissions.py')
    return _load('coding_agent_tools', STACK/'hands'/'agent_tools.py').run(args, **kw)


def checkpoint_payload_guard(value, args):
    hand = _load('coding_agent_tools', STACK/'hands'/'agent_tools.py')
    text = json.dumps(value)
    if (not isinstance(value,dict) or value.get('version') != 1 or value.get('args') != args or
        len(text) > 2_000_000 or hand._SECRETISH.search(text)):
        raise ValueError('unsafe coding checkpoint payload')


def _identity(pid):
    """Start time and unique argv token prevent signalling a reused PID."""
    if not isinstance(pid, int) or pid <= 0:
        return None
    try:
        result = subprocess.run(['/bin/ps', '-ww', '-p', str(pid), '-o', 'lstart=', '-o', 'command='],
                                capture_output=True, text=True, timeout=2)
        if result.returncode or not result.stdout.strip():
            return None
        return result.stdout.strip()
    except (OSError, subprocess.TimeoutExpired):
        return None


def _owned(owner, root):
    pid = owner.get('pid')
    token = owner.get('token')
    identity = _identity(pid)
    if not identity or not isinstance(owner.get('identity'), str) or identity.split()[:5] != owner['identity'].split()[:5]:
        return False
    if not isinstance(token, str) or not re.fullmatch(r'[a-f0-9]{32}', token):
        return False
    expected = f'{Path(__file__).resolve()} worker {root.resolve()} {token}'
    if not identity.endswith(expected):
        return False
    try:
        return os.getpgid(pid) == pid
    except (OSError, TypeError):
        return False


def _spawn_worker(root, token):
    with (root/'worker.log').open('ab') as log:
        return subprocess.Popen([sys.executable, str(Path(__file__).resolve()), 'worker', str(root.resolve()), token],
                                stdin=subprocess.DEVNULL, stdout=log, stderr=log, start_new_session=True)


class CodingMissionHandle:
    def __init__(self, hive):
        self.hive = Path(hive)

    def start(self, code_args, objective):
        _load('agent_stack_permissions', STACK/'hands'/'permissions.py')
        hand = _load('coding_agent_tools', STACK/'hands'/'agent_tools.py')
        steps = code_args.get('steps') or ([code_args] if code_args.get('op') else [])
        if len(steps) != 1 or steps[0].get('op') != 'code':
            raise ValueError('one explicit scratch coding step required')
        step = steps[0]
        repo = Path(str(step.get('repo') or '')).expanduser()
        if not str(step.get('repo') or '').strip() or not str(step.get('goal') or '').strip():
            raise ValueError('repo and coding goal required')
        if not repo.is_absolute():
            repo = hand.PERM().scratch_roots()[0]/repo
        if any(p.is_symlink() for p in (repo, *repo.parents)):
            raise ValueError('symlink coding path requires review')
        repo = repo.resolve()
        roots = hand.PERM().scratch_roots()
        if not any(root in repo.parents for root in roots) or hand._repo_ok(repo) != 'allow':
            raise ValueError('coding mission requires an allowed scratch subdirectory')
        branch = str(step.get('branch') or 'jarvis/code')
        if hand.PERM().decide('git_branch', branch) != 'allow':
            raise ValueError('coding branch needs approval')
        if not isinstance(objective, str) or not objective.strip() or len(objective) > 10000:
            raise ValueError('bounded original objective required')
        args = {'op':'code', 'repo':str(repo), 'goal':str(step['goal']), 'branch':branch}
        return self._queue(args, objective)

    def _queue(self, args, objective, *, resume_of=None, resume_checkpoint=None):
        hand = _load('coding_agent_tools', STACK/'hands'/'agent_tools.py')
        mission_id = uuid.uuid4().hex
        root = mission_path(self.hive, mission_id)
        root.mkdir(parents=True)
        # Only the narrow explicit code arguments cross into unattended execution.
        request = {'mission_id':mission_id, 'worker_kind':'coding', 'objective':objective,
                   'code_args':args, 'source_manifest':mission_source_manifest(), 'created':time.time()}
        if resume_of:
            request.update(resume_of=resume_of, resume_checkpoint=resume_checkpoint,
                           resume_checkpoint_digest=hand.checkpoint_digest(resume_checkpoint))
        write_json(root/'request.json', request)
        write_json(root/'control.json', {'cancel':False})
        write_json(root/'state.json', {'mission_id':mission_id, 'worker_kind':'coding', 'status':'QUEUED', 'verified':False})
        if resume_of:
            # Reserve the child before spawn so an interrupted resume request
            # cannot launch a second continuation of the same checkpoint.
            write_json(mission_path(self.hive,resume_of)/'resume_child.json', {'mission_id':mission_id})
        token = uuid.uuid4().hex
        try:
            process = _spawn_worker(root, token)
            write_json(root/'owner.json', {'pid':process.pid, 'token':token, 'identity':_identity(process.pid), 'created':time.time()})
        except OSError:
            self._finish_unavailable(root, 'worker_start_failed')
            raise RuntimeError('coding worker could not start')
        write_json(self.hive/'coding-missions'/'latest.json', {'mission_id':mission_id})
        return {'ok':True, 'tool':'agent_tools', 'mission_id':mission_id, 'task_verified':False,
                'resume_of':resume_of,
                'spoken':'I’ve resumed the scratch coding task from its checked checkpoint.' if resume_of else 'I’ve started the scratch coding task. I’ll report its tests and commit when it finishes.',
                'wires':['agent_tools','coding_mission'], 'cites':[], 'sent':False}

    def resume(self, mission_id):
        """Explicit checked continuation creates one child; parent evidence is immutable."""
        import fcntl
        root = mission_path(self.hive, mission_id)
        if not (root/'request.json').is_file():
            raise ValueError('unknown coding mission')
        with (root/'resume.lock').open('a') as lock:
            fcntl.flock(lock, fcntl.LOCK_EX)
            child = read_json(root/'resume_child.json').get('mission_id')
            if child:
                if not read_json(mission_path(self.hive,child)/'request.json'):
                    raise ValueError('reserved coding continuation is unavailable')
                return {'ok':True, 'tool':'agent_tools', 'mission_id':child, 'resume_of':mission_id,
                        'task_verified':False, 'spoken':'That checked coding continuation already exists.',
                        'wires':['agent_tools','coding_mission'], 'cites':[], 'sent':False}
            with (root/'worker.lock').open('a') as worker_lock:
                try:
                    fcntl.flock(worker_lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
                except BlockingIOError:
                    raise ValueError('coding mission is still active')
                request = read_json(root/'request.json')
                result = read_json(root/'result.json') or read_json(root/'state.json')
                if result.get('status') == 'COMPLETED':
                    raise ValueError('completed coding missions cannot be resumed')
                owner = read_json(root/'owner.json')
                if _owned(owner, root):
                    raise ValueError('coding worker is still active')
                pid = owner.get('pid')
                if isinstance(pid, int) and pid > 0:
                    try:
                        os.kill(pid, 0)
                    except ProcessLookupError:
                        pass
                    except PermissionError:
                        raise ValueError('worker liveness cannot be proven')
                    else:
                        raise ValueError('worker identity is unproven but process still exists')
                envelope = read_json(root/'checkpoint.json')
                current_manifest = mission_source_manifest()
                if not envelope or envelope.get('source_manifest') != current_manifest or request.get('source_manifest') != current_manifest:
                    raise ValueError('checkpoint missing or coding source changed')
                _load('agent_stack_permissions', STACK/'hands'/'permissions.py')
                hand = _load('coding_agent_tools', STACK/'hands'/'agent_tools.py')
                cp = envelope.get('checkpoint')
                if (envelope.get('mission_id') != mission_id or envelope.get('code_args') != request.get('code_args') or
                    not isinstance(cp,dict) or hand.checkpoint_digest(cp) != envelope.get('checkpoint_digest')):
                    raise ValueError('checkpoint provenance mismatch')
                if hand._SECRETISH.search(json.dumps(cp)):
                    raise ValueError('checkpoint contains secret-like text')
                args = request['code_args']
                repo = Path(args['repo'])
                if (not any(r in repo.resolve().parents for r in hand.PERM().scratch_roots()) or
                    hand._repo_ok(repo) != 'allow' or hand.PERM().decide('git_branch',args['branch']) != 'allow'):
                    raise ValueError('current coding permission denied')
                try:
                    # Reconcile now and again under the child worker's repo lock.
                    hand.reconcile_code_checkpoint(cp, args)
                except hand._CheckpointBlocked as exc:
                    raise ValueError('unsafe coding checkpoint: ' + str(exc))
                child_ack = self._queue(args, request['objective'], resume_of=mission_id, resume_checkpoint=cp)
                write_json(root/'resume_child.json', {'mission_id':child_ack['mission_id']})
                return child_ack

    def _finish_unavailable(self, root, reason):
        import fcntl
        with (root/'steering.lock').open('a') as lock:
            fcntl.flock(lock, fcntl.LOCK_EX)
            existing = read_json(root/'result.json')
            if existing:
                return existing
            state = read_json(root/'state.json')
            state.update(status='CANCELLED' if read_json(root/'control.json').get('cancel') else 'FAILED',
                         verified=False, builder_verified=False, terminal_reason=reason,
                         spoken='The coding task was stopped. Its outcome is not verified.' if read_json(root/'control.json').get('cancel') else 'The coding worker is unavailable. Its outcome is not verified.',
                         terminal_commit_id=uuid.uuid4().hex, finished=time.time())
            write_json(root/'result.json', state)
            write_json(root/'state.json', state)
            return state

    def status(self, mission_id):
        root = mission_path(self.hive, mission_id)
        if read_json(root/'request.json').get('worker_kind') == 'research_build':
            return WorkflowMissionHandle(self.hive).workflow_status(mission_id)
        state = read_json(root/'result.json') or read_json(root/'state.json')
        if not state:
            raise ValueError('unknown coding mission')
        if state.get('status') not in TERMINAL and not _owned(read_json(root/'owner.json'), root):
            # An alive process with unproven identity is not silently killed or replayed.
            return dict(state, status='UNAVAILABLE', verified=False, terminal_reason='worker_identity_unproven')
        return state

    def steer(self, mission_id, *, cancel=False):
        if read_json(mission_path(self.hive,mission_id)/'request.json').get('worker_kind') == 'research_build':
            handle = WorkflowMissionHandle(self.hive)
            return handle.cancel(mission_id) if cancel else handle.workflow_status(mission_id)
        import fcntl
        root = mission_path(self.hive, mission_id)
        if not (root/'request.json').is_file():
            raise ValueError('unknown coding mission')
        with (root/'steering.lock').open('a') as lock:
            fcntl.flock(lock, fcntl.LOCK_EX)
            if read_json(root/'result.json'):
                return read_json(root/'result.json')
            control = read_json(root/'control.json')
            control['cancel'] = bool(cancel or control.get('cancel'))
            write_json(root/'control.json', control)
        if cancel:
            owner = read_json(root/'owner.json')
            if _owned(owner, root):
                try:
                    os.killpg(owner['pid'], signal.SIGKILL)
                except ProcessLookupError:
                    pass
                return self._finish_unavailable(root, 'user_cancel_owned_worker_terminated')
            # Cooperative cancellation remains set; no unowned process is signalled.
        return control

    def cancel_active(self):
        ids = []
        for root in (self.hive/'coding-missions').glob('*'):
            if root.is_dir() and (root/'request.json').exists() and not (root/'result.json').exists():
                self.steer(root.name, cancel=True)
                ids.append(root.name)
        return ids


def progress_line(state):
    if state.get('status') in TERMINAL and state.get('spoken'):
        return str(state['spoken'])
    row = state.get('progress') or {}
    return 'The coding task is ' + str(state.get('status') or 'unknown').lower() + (': ' + str(row.get('what')) if row.get('what') else '.')


async def execute_mission(root):
    controller = _load('coding_mission_controller', STACK/'brain'/'mission_controller.py')
    return await controller.MissionController(sys.modules[__name__]).execute(root)


WORKFLOW_QUESTION = "Which project or repository should I use? Give its exact folder path; I have kept the full research, build, demo and Obsidian request."
WORKFLOW_DELIVERABLES = ('saved_youtube_research', 'original_implementation', 'working_project_version',
                         'tests_and_failure_repair', 'professional_artcraft_demo', 'bounded_obsidian_document', 'present_results')


def wants_workflow(utterance):
    text = utterance or ''
    return bool(re.search(r"\bresearch\b", text, re.I) and re.search(r"\bsaved\b.{0,30}\byoutube\b", text, re.I)
                and re.search(r"\bbuild\b", text, re.I) and re.search(r"\btests?\b", text, re.I)
                and re.search(r"\bartcraft\b", text, re.I) and re.search(r"\bobsidian\b", text, re.I))


def _owner_path_matches(answer, selected):
    """Only complete owner path tokens resolve authority; prefixes never match."""
    import shlex
    try:
        tokens=shlex.split(answer or '')
    except ValueError:
        return False
    candidates=[tokens[-1].rstrip(',;!?')] if tokens and tokens[-1].startswith(('/', '~/')) else []
    candidates.extend(match.group(2) for match in re.finditer(r"([\"'])(.*?)\1",answer or ''))
    # Unquoted paths with spaces are accepted only as the complete answer after
    # an explicit lead. Extra prose or a longer neighbour cannot bind a prefix.
    lead=re.fullmatch(r"\s*(?:use|the project is|my project is|project(?: path)?[: ]|repository(?: path)?[: ])\s+(.+?)\s*",answer or '',re.I)
    if lead:
        candidates.append(lead.group(1).strip().strip('"\''))
    candidates.append((answer or '').strip().strip('"\''))
    try:
        expected=selected.resolve(strict=True)
    except (OSError,RuntimeError):
        return False
    for candidate in candidates:
        if not candidate.startswith(('/', '~/')):
            continue
        try:
            if Path(candidate).expanduser().resolve(strict=True)==expected:
                return True
        except (OSError,RuntimeError):
            pass
    return False


class WorkflowMissionHandle:
    """Transient compound intake in the existing mission namespace; no worker here."""
    def __init__(self, hive):
        self.hive = Path(hive)

    def _reply(self, request, state):
        return {**state, 'ok':True, 'tool':'agent_tools', 'mission_id':request['mission_id'],
                'objective':request['objective'], 'goal_preserved':True, 'task_verified':False,
                'verified':False, 'wires':['workflow_intake'], 'cites':[], 'sent':False, 'actions':[]}

    def start_workflow(self, objective):
        import fcntl
        pm = _load('workflow_project_methods', STACK/'hands'/'project_methods.py')
        pm.clean_text(objective)
        namespace=self.hive/'coding-missions'
        namespace.mkdir(parents=True,exist_ok=True,mode=0o700)
        with (namespace/'intake.lock').open('a') as lock:
            fcntl.flock(lock,fcntl.LOCK_EX)
            previous=read_json(namespace/'latest_workflow.json').get('mission_id')
            if previous and re.fullmatch(r'[a-f0-9]{32}',str(previous)):
                request=read_json(mission_path(self.hive,previous)/'request.json')
                if request.get('worker_kind')=='research_build' and request.get('objective')==objective:
                    return self.workflow_status(previous)
            return self._start_workflow_locked(objective)

    def _start_workflow_locked(self, objective):
        pm = _load('workflow_project_methods', STACK/'hands'/'project_methods.py')
        pm.clean_text(objective)  # validate secrets/bounds; keep exact original bytes below
        if not wants_workflow(objective):
            raise ValueError('explicit saved-video research/build workflow required')
        ident = uuid.uuid4().hex
        root = mission_path(self.hive, ident)
        root.mkdir(parents=True, mode=0o700)
        request = {'mission_id':ident, 'worker_kind':'research_build', 'objective':objective,
                   'request_scope':'transient_task', 'deliverables':list(WORKFLOW_DELIVERABLES),
                   'approval_boundaries':['existing_permissions','owned_isolated_branch_before_mutations',
                       'no_model_or_provider_changes','no_sends_spend_push_merge_deploy_or_secret_reads'],
                   'obsidian_scope':'one requested implementation document; no permanent vault policy',
                   'created':time.time()}
        # Original request is immutable, like existing project-methods intake.
        pm.write_new(root/'request.json', json.dumps(request, ensure_ascii=False))
        state = {'mission_id':ident, 'worker_kind':'research_build', 'status':'WAITING_PROJECT',
                 'verified':False, 'task_verified':False, 'question':WORKFLOW_QUESTION,
                 'spoken':WORKFLOW_QUESTION, 'goal_preserved':True, 'actions':[]}
        write_json(root/'state.json',state)
        write_json(root/'control.json',{'cancel':False})
        write_json(self.hive/'coding-missions'/'latest_workflow.json',{'mission_id':ident})
        return self._reply(request,state)

    def workflow_status(self, mission_id):
        root=mission_path(self.hive,mission_id)
        request=read_json(root/'request.json')
        if request.get('worker_kind')!='research_build':
            raise ValueError('unknown workflow intake')
        state=read_json(root/'state.json')
        if read_json(root/'control.json').get('cancel'):
            state={**state,'status':'CANCELLED','spoken':'The workflow was stopped. Its full request is preserved; no implementation was run.', 'question':''}
        return self._reply(request,state)

    def bind_project(self, mission_id, repo, branch, answer, verified_contract=None):
        import fcntl
        pm=_load('workflow_project_methods', STACK/'hands'/'project_methods.py')
        pm.clean_text(answer)
        raw=str(repo or '')
        selected=Path(raw).expanduser()
        perm=_load('agent_stack_permissions',STACK/'hands'/'permissions.py')
        contract_root=Path(os.environ.get('JARVIS_PROJECT_ROOT') or Path.home()/'.jarvis'/'projects').resolve()
        contract_ok=False
        if isinstance(verified_contract,dict) and verified_contract.get('source')=='owner_project_contract':
            contract_path=Path(str(verified_contract.get('path') or ''))
            if (contract_path.is_absolute() and contract_path.name=='contract.json' and contract_root in contract_path.resolve().parents
                and not perm.is_secret_path(contract_path) and not any(p.is_symlink() for p in (contract_path,*contract_path.parents))):
                try:
                    if contract_path.stat().st_size<=64000:
                        content=contract_path.read_bytes()
                        declared=json.loads(content)
                        contract_ok=(hashlib.sha256(content).hexdigest()==verified_contract.get('sha256')
                                     and declared.get('repo')==raw and declared.get('owner_declared') is True)
                except (OSError,ValueError,TypeError):
                    pass
        # Parent supplies a receipt-backed contract, or the actual owner names a literal path.
        if not selected.is_absolute() or (not _owner_path_matches(answer,selected) and not contract_ok):
            raise ValueError('explicit owner project path or verified project contract required')
        if any(p.is_symlink() for p in (selected,*selected.parents)):
            raise ValueError('project symlink needs review')
        selected=selected.resolve(strict=True)
        if not selected.is_dir():
            raise ValueError('project folder required')
        perm=_load('agent_stack_permissions',STACK/'hands'/'permissions.py')
        if perm.is_secret_path(selected):
            raise ValueError('secret project path refused')
        root=mission_path(self.hive,mission_id)
        with (root/'steering.lock').open('a') as lock:
            fcntl.flock(lock,fcntl.LOCK_EX)
            current=self.workflow_status(mission_id)
            if current['status']=='CANCELLED':
                raise ValueError('stopped workflow requires explicit continuation')
            if (root/'binding.json').exists():
                existing=read_json(root/'binding.json')
                if existing.get('repo')!=str(selected) or existing.get('branch')!=branch:
                    raise ValueError('existing project binding preserved; explicit rebind required')
                return current
            binding={'repo':str(selected),'branch':str(branch or ''),'owner_answer':answer,
                     'authority':'owner_project_contract' if contract_ok else 'literal_owner_answer',
                     'execution_gate':'owned_repo_lock_and_current_permissions_required'}
            # Intake never checks out branches or edits the selected project.
            isolated=bool(re.fullmatch(r'[\w./-]{1,80}',str(branch or '')) and branch not in {'main','master'})
            allowed=perm.decide('edit',str(selected))=='allow'
            status='WAITING_SOURCE' if isolated and allowed else ('WAITING_APPROVAL' if not allowed else 'WAITING_ISOLATION')
            question=('Which saved YouTube source should I use? The project is bound; no work has run.' if status=='WAITING_SOURCE'
                      else 'The project is selected. I still need an allowed isolated branch before implementation.')
            pm.write_new(root/'binding.json',json.dumps(binding,ensure_ascii=False))
            state={k:v for k,v in current.items() if k not in {'ok','tool','wires','cites','sent','objective'}}
            state.update(status=status,question=question,spoken=question,project_bound=True,source_bound=False,
                         isolated_branch_required=True,task_verified=False,verified=False)
            write_json(root/'checkpoint.json',{'worker_kind':'research_build','phase':'project_bound',
                        'mission_id':mission_id,'binding':binding,'original_request_unchanged':True})
            write_json(root/'state.json',state)
            return self.workflow_status(mission_id)

    def approve_project(self, mission_id, answer):
        """Owner approval belongs to this immutable task and exact project branch."""
        import fcntl
        root=mission_path(self.hive,mission_id)
        with (root/'steering.lock').open('a') as lock:
            fcntl.flock(lock,fcntl.LOCK_EX)
            current=self.workflow_status(mission_id)
            if current['status']=='CANCELLED':
                raise ValueError('stopped workflow requires explicit continuation')
            binding=read_json(root/'binding.json')
            match=re.fullmatch(r'\s*(?:please\s+)?(?:approve|authorize|allow)\s+(?:the\s+)?workflow\s+edits\s+for\s+("[^"\n]+"|\'[^\'\n]+\'|(?:/|~/)[^\s]+)\s+on\s+branch\s+([\w./-]+)[.!]?\s*',answer or '',re.I)
            if not match or not binding or not _owner_path_matches(answer,Path(binding.get('repo',''))) or match.group(2)!=binding.get('branch'):
                raise ValueError('explicit approval for the bound project and branch required')
            branch=binding['branch']
            if branch in {'main','master'} or not re.fullmatch(r'[\w./-]{1,80}',branch):
                raise ValueError('an owned isolated branch is still required')
            request=(root/'request.json').read_bytes();bound=(root/'binding.json').read_bytes()
            receipt={'scope':'transient_task','mission_id':mission_id,'kind':'workflow_edits',
                     'target':binding['repo'],'branch':branch,'authority':'explicit_owner_answer',
                     'request_sha256':hashlib.sha256(request).hexdigest(),
                     'binding_sha256':hashlib.sha256(bound).hexdigest(),'owner_answer':answer,
                     'granted_at':time.time(),'configuration_changes_authorized':False}
            write_json(root/'owner_approval.json',receipt)
            state={k:v for k,v in current.items() if k not in {'ok','tool','wires','cites','sent','objective'}}
            source=read_json(root/'source_research.json')
            status='WAITING_ORIGINAL_IMPLEMENTATION' if source.get('selected') else 'WAITING_SOURCE'
            line=('Your approval is recorded for this workflow, project and branch. The saved source is preserved; its original implementation still needs verification. No build has run.'
                  if source.get('selected') else 'Your approval is recorded for this workflow, project and branch. Which saved YouTube source should I use? No build has run.')
            state.update(status=status,spoken=line,question=line,owner_approved=True,verified=False,task_verified=False)
            write_json(root/'state.json',state)
            write_json(root/'checkpoint.json',{'worker_kind':'research_build','phase':'owner_project_approved',
                'mission_id':mission_id,'request_sha256':receipt['request_sha256'],'original_request_unchanged':True})
        return self.workflow_status(mission_id)

    def project_approval(self, mission_id):
        """Executor reads authority from the retained task, never from model flags."""
        root=mission_path(self.hive,mission_id)
        row=read_json(root/'owner_approval.json')
        binding=read_json(root/'binding.json')
        if (read_json(root/'control.json').get('cancel') or row.get('mission_id')!=mission_id
            or row.get('scope')!='transient_task' or row.get('authority')!='explicit_owner_answer'
            or row.get('target')!=binding.get('repo') or row.get('branch')!=binding.get('branch')
            or row.get('branch') in {'main','master'}
            or row.get('request_sha256')!=hashlib.sha256((root/'request.json').read_bytes()).hexdigest()
            or row.get('binding_sha256')!=hashlib.sha256((root/'binding.json').read_bytes()).hexdigest()):
            return None
        return row

    def continue_workflow(self, mission_id, answer):
        import fcntl
        if not re.fullmatch(r'\s*(?:please\s+)?(?:resume|continue)\s+(?:the\s+)?(?:workflow|task|mission)\s*[.!]?\s*', answer or '', re.I):
            raise ValueError('explicit workflow continuation required')
        root=mission_path(self.hive,mission_id)
        with (root/'steering.lock').open('a') as lock:
            fcntl.flock(lock,fcntl.LOCK_EX)
            current=self.workflow_status(mission_id)
            if current['status']!='CANCELLED':
                return current
            binding=read_json(root/'binding.json')
            write_json(root/'control.json',{'cancel':False})
            status='WAITING_PROJECT' if not binding else ('WAITING_SOURCE' if self.project_approval(mission_id) else 'WAITING_APPROVAL')
            question=WORKFLOW_QUESTION if not binding else 'The project is preserved. Which saved YouTube source should I use? No implementation has run.'
            write_json(root/'control.json',{'cancel':False})
            current.update(status=status,question=question,spoken=question)
            write_json(root/'state.json',current)
            write_json(root/'checkpoint.json',{'worker_kind':'research_build','phase':'explicit_intake_continuation',
                'mission_id':mission_id,'owner_answer':answer,'original_request_unchanged':True})
        return self.workflow_status(mission_id)

    def cancel(self, mission_id):
        import fcntl
        root=mission_path(self.hive,mission_id)
        with (root/'steering.lock').open('a') as lock:
            fcntl.flock(lock,fcntl.LOCK_EX)
            state=self.workflow_status(mission_id)
            write_json(root/'control.json',{'cancel':True})
            state.update(status='CANCELLED',question='',spoken='The workflow was stopped. Its full request is preserved; no implementation was run.')
            write_json(root/'state.json',state)
            write_json(root/'checkpoint.json',{'worker_kind':'research_build','phase':'cancelled_intake',
                        'mission_id':mission_id,'original_request_unchanged':True})
        return self.workflow_status(mission_id)


if __name__ == '__main__':
    if len(sys.argv) == 4 and sys.argv[1] == 'worker':
        asyncio.run(execute_mission(Path(sys.argv[2])))
    else:
        raise SystemExit('usage: coding_mission.py worker PATH TOKEN')
