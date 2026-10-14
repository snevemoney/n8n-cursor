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
        state = read_json(root/'result.json') or read_json(root/'state.json')
        if not state:
            raise ValueError('unknown coding mission')
        if state.get('status') not in TERMINAL and not _owned(read_json(root/'owner.json'), root):
            # An alive process with unproven identity is not silently killed or replayed.
            return dict(state, status='UNAVAILABLE', verified=False, terminal_reason='worker_identity_unproven')
        return state

    def steer(self, mission_id, *, cancel=False):
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


if __name__ == '__main__':
    if len(sys.argv) == 4 and sys.argv[1] == 'worker':
        asyncio.run(execute_mission(Path(sys.argv[2])))
    else:
        raise SystemExit('usage: coding_mission.py worker PATH TOKEN')
