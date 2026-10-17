"""Durable coding adapter lifecycle, without paid calls or real repo mutation."""
import asyncio
import importlib.util
import json
import sys
import subprocess
import hashlib
from pathlib import Path
from unittest.mock import Mock

import pytest


@pytest.fixture
def adapter(tmp_path, monkeypatch):
    path = Path(__file__).with_name('coding_mission.py')
    spec = importlib.util.spec_from_file_location('test_coding_adapter', path)
    mod = importlib.util.module_from_spec(spec)
    monkeypatch.setitem(sys.modules, spec.name, mod)
    spec.loader.exec_module(mod)
    monkeypatch.setenv('JARVIS_SCRATCH_ROOTS', str(tmp_path/'scratch'))
    monkeypatch.setenv('JARVIS_ACTION_LOG', 'off')
    return mod


def queued(adapter, hive):
    mid = 'a'*32
    root = adapter.mission_path(hive, mid)
    root.mkdir(parents=True)
    adapter.write_json(root/'request.json', {'mission_id':mid, 'worker_kind':'coding',
                       'code_args':{'op':'code','repo':'demo','goal':'build'},
                       'source_manifest':adapter.mission_source_manifest()})
    adapter.write_json(root/'state.json', {'mission_id':mid,'worker_kind':'coding','status':'QUEUED','verified':False})
    adapter.write_json(root/'control.json', {'cancel':False})
    return root


def test_persistent_completed_result_is_unverified_and_not_replayed(adapter, tmp_path, monkeypatch):
    root = queued(adapter, tmp_path/'hive')
    runs = []
    def run(args, cancel_check, progress, **kwargs):
        runs.append(args)
        progress({'n':1,'what':'test','status':'verified'})
        return {'ok':True,'verified':True,'steps':[{'what':'test','status':'verified'}]}
    monkeypatch.setattr(adapter, 'run_coding', run)
    first = asyncio.run(adapter.execute_mission(root))
    second = asyncio.run(adapter.execute_mission(root))
    assert first == second and len(runs) == 1
    assert first['status'] == 'COMPLETED' and not first['verified'] and first['builder_verified']
    assert 'Independent acceptance' in first['spoken']
    assert adapter.read_json(root/'result.json')['terminal_commit_id'] == first['terminal_commit_id']
    assert (root/'trace.jsonl').is_file()


def test_cooperative_cancel_is_honest_terminal(adapter, tmp_path, monkeypatch):
    root = queued(adapter, tmp_path/'hive')
    def run(args, cancel_check, progress, **kwargs):
        adapter.write_json(root/'control.json', {'cancel':True})
        assert cancel_check()
        return {'ok':True,'verified':True}
    monkeypatch.setattr(adapter, 'run_coding', run)
    result = asyncio.run(adapter.execute_mission(root))
    assert result['status'] == 'CANCELLED' and not result['verified'] and not result['builder_verified']


def test_source_drift_and_interrupted_state_never_run_code(adapter, tmp_path, monkeypatch):
    root = queued(adapter, tmp_path/'hive')
    run = Mock()
    monkeypatch.setattr(adapter, 'run_coding', run)
    request = adapter.read_json(root/'request.json')
    request['source_manifest'] = {'stale':True}
    adapter.write_json(root/'request.json', request)
    assert asyncio.run(adapter.execute_mission(root))['status'] == 'FAILED'
    assert not run.called
    root2 = queued(adapter, tmp_path/'other')
    adapter.write_json(root2/'state.json', {'mission_id':'a'*32,'status':'RUNNING','work_started':True})
    result = asyncio.run(adapter.execute_mission(root2))
    assert result['status'] == 'FAILED' and 'reconciliation' in result['terminal_reason']
    assert not run.called


def test_start_ack_queues_exact_code_and_does_not_execute(adapter, tmp_path, monkeypatch):
    spawned = Mock(return_value=Mock(pid=12345))
    monkeypatch.setattr(adapter.subprocess, 'Popen', spawned)
    monkeypatch.setattr(adapter, '_identity', lambda pid: 'owned fixture')
    run = Mock()
    monkeypatch.setattr(adapter, 'run_coding', run)
    got = adapter.CodingMissionHandle(tmp_path/'hive').start({'steps':[{'op':'code','repo':'demo','goal':'write tests'}]}, 'in scratch repo demo: write tests')
    assert got['ok'] and not got['task_verified'] and got['tool'] == 'agent_tools'
    root = adapter.mission_path(tmp_path/'hive', got['mission_id'])
    request = adapter.read_json(root/'request.json')
    assert request['code_args']['goal'] == 'write tests'
    assert request['code_args']['repo'] == str(tmp_path/'scratch'/'demo')
    assert adapter.read_json(root/'state.json')['status'] == 'QUEUED'
    assert spawned.call_args.kwargs['start_new_session'] and not run.called


def test_cancel_never_signals_unowned_pid(adapter, tmp_path, monkeypatch):
    root = queued(adapter, tmp_path/'hive')
    adapter.write_json(root/'owner.json', {'pid':12345,'identity':'old','token':'b'*32})
    monkeypatch.setattr(adapter, '_identity', lambda pid: 'reused process')
    kill = Mock()
    monkeypatch.setattr(adapter.os, 'killpg', kill)
    handle = adapter.CodingMissionHandle(tmp_path/'hive')
    handle.steer(root.name, cancel=True)
    assert not kill.called and adapter.read_json(root/'control.json')['cancel']
    assert not (root/'result.json').exists()
    assert handle.status(root.name)['status'] == 'UNAVAILABLE'


def test_owned_cancel_commits_one_cancelled_result(adapter, tmp_path, monkeypatch):
    root = queued(adapter, tmp_path/'hive')
    token = 'b'*32
    identity = f'Thu Oct 14 10:00:00 2026 python {Path(adapter.__file__).resolve()} worker {root.resolve()} {token}'
    adapter.write_json(root/'owner.json', {'pid':12345,'identity':identity,'token':token})
    monkeypatch.setattr(adapter, '_identity', lambda pid: identity)
    monkeypatch.setattr(adapter.os, 'getpgid', lambda pid: pid)
    kill = Mock()
    monkeypatch.setattr(adapter.os, 'killpg', kill)
    handle = adapter.CodingMissionHandle(tmp_path/'hive')
    result = handle.steer(root.name, cancel=True)
    assert kill.call_count == 1 and result['status'] == 'CANCELLED' and not result['verified']
    assert handle.steer(root.name, cancel=True) == result and kill.call_count == 1


def test_start_rejects_noncode_outside_scratch_and_main(adapter, tmp_path):
    handle = adapter.CodingMissionHandle(tmp_path/'hive')
    for args in ({'op':'cli','argv':['git','push']}, {'op':'code','repo':'/etc','goal':'x'},
                 {'op':'code','repo':'demo','goal':'x','branch':'main'}):
        with pytest.raises(ValueError):
            handle.start(args, 'original objective')
    assert not (tmp_path/'hive').exists()


def test_real_worker_entrypoint_cancelled_before_execution(adapter, tmp_path):
    root = queued(adapter, tmp_path/'hive')
    adapter.write_json(root/'control.json', {'cancel':True})
    process = subprocess.run([sys.executable, adapter.__file__, 'worker', str(root), 'b'*32],
                             capture_output=True, text=True, timeout=10)
    assert process.returncode == 0, process.stderr
    result = adapter.read_json(root/'result.json')
    assert result['status'] == 'CANCELLED' and not result['verified']
    assert not (tmp_path/'scratch'/'demo').exists()


def test_real_owned_process_group_is_terminated_without_model_call(adapter, tmp_path):
    root = queued(adapter, tmp_path/'hive')
    token = 'b'*32
    # A harmless owned sleeping process carries the same immutable identity suffix;
    # this tests OS group cancellation, not model execution or coding acceptance.
    process = subprocess.Popen([sys.executable, '-c', 'import time; time.sleep(30)',
                                adapter.__file__, 'worker', str(root.resolve()), token], start_new_session=True)
    try:
        identity = adapter._identity(process.pid)
        if identity is None:
            pytest.skip('process identity inspection unavailable in this execution sandbox; owned-kill test requires host permissions')
        adapter.write_json(root/'owner.json', {'pid':process.pid,'identity':identity,'token':token})
        assert identity.endswith(f'{Path(adapter.__file__).resolve()} worker {root.resolve()} {token}'), repr(identity)
        assert adapter._owned(adapter.read_json(root/'owner.json'), root), (identity, str(Path(adapter.__file__).resolve()), str(root.resolve()), adapter.os.getpgid(process.pid))
        result = adapter.CodingMissionHandle(tmp_path/'hive').steer(root.name, cancel=True)
        assert process.wait(timeout=3) < 0
        assert result['status'] == 'CANCELLED' and not result['verified']
    finally:
        if process.poll() is None:
            process.kill()
            process.wait(timeout=3)


def test_same_repo_lock_blocks_all_code_execution(adapter, tmp_path, monkeypatch):
    import fcntl
    root = queued(adapter, tmp_path/'hive')
    locks = root.parent/'worker-locks'
    locks.mkdir()
    repo = str(Path('demo').resolve())
    run = Mock()
    monkeypatch.setattr(adapter, 'run_coding', run)
    with (locks/('repo-' + hashlib.sha256(repo.encode()).hexdigest() + '.lock')).open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        result = asyncio.run(adapter.execute_mission(root))
    assert result['status'] == 'BLOCKED' and result['terminal_reason'] == 'coding_repo_already_owned'
    assert not run.called


def test_three_owned_worker_slots_block_fourth_without_execution(adapter, tmp_path, monkeypatch):
    import fcntl
    root = queued(adapter, tmp_path/'hive')
    locks = root.parent/'worker-locks'
    locks.mkdir()
    handles = []
    run = Mock()
    monkeypatch.setattr(adapter, 'run_coding', run)
    try:
        for number in range(3):
            slot = (locks/f'slot-{number}.lock').open('a')
            fcntl.flock(slot, fcntl.LOCK_EX | fcntl.LOCK_NB)
            handles.append(slot)
        result = asyncio.run(adapter.execute_mission(root))
        assert result['status'] == 'BLOCKED' and result['terminal_reason'] == 'coding_worker_capacity_exhausted'
        assert not run.called
    finally:
        for slot in handles:
            slot.close()


def test_completed_reports_repo_and_actual_builder_receipt(adapter, tmp_path, monkeypatch):
    root = queued(adapter, tmp_path/'hive')
    monkeypatch.setattr(adapter, 'run_coding', lambda *a, **k: {'ok':True,'verified':True,'steps':[
        {'what':'iter 1 test','status':'verified','result':'fixture tests passed'},
        {'what':'commit','status':'verified','result':'committed abc1234 fixture commit'}]})
    result = asyncio.run(adapter.execute_mission(root))
    assert result['coding_evidence']['repo'] == 'demo'
    assert result['coding_evidence']['commit_receipt'] == 'committed abc1234 fixture commit'
    assert 'abc1234' in result['spoken'] and 'Builder tests passed' in result['spoken']
    assert adapter.progress_line(result) == result['spoken'] and not result['verified']
