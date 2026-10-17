"""P0 process liveness and partial receipts; no providers or live Jarvis actions."""
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import time
from unittest.mock import patch
import pytest

HERE = Path(__file__).parent

def module(name, file):
    spec=importlib.util.spec_from_file_location(name,HERE/file)
    mod=importlib.util.module_from_spec(spec);sys.modules[name]=mod;spec.loader.exec_module(mod)
    return mod

@pytest.fixture
def adapter():return module('p0_adapter','coding_mission.py')

@pytest.fixture
def task(adapter,tmp_path):
    root=adapter.mission_path(tmp_path,'a'*32);root.mkdir(parents=True)
    adapter.write_json(root/'request.json',{'worker_kind':'coding','mission_id':root.name})
    adapter.write_json(root/'state.json',{'status':'QUEUED','verified':False})
    return root

def test_queued_is_not_running_without_startup(adapter,task):
    with patch.object(adapter,'_spawn_pending',return_value=True):
        state=adapter.CodingMissionHandle(task.parent.parent).status(task.name)
    assert state['status']=='QUEUED' and state['active'] is False


def test_real_worker_startup_heartbeat_and_death(adapter,task):
    token='b'*32
    code='''import importlib.util,sys,time
from pathlib import Path
s=importlib.util.spec_from_file_location("process_adapter",sys.argv[1]);m=importlib.util.module_from_spec(s);sys.modules[s.name]=m;s.loader.exec_module(m)
with m.worker_lifecycle(Path(sys.argv[-2])):time.sleep(20)
'''
    proc=subprocess.Popen([sys.executable,'-c',code,str(HERE/'coding_mission.py'),'worker',str(task),token],start_new_session=True)
    try:
        owner={'pid':proc.pid,'token':token,'identity':adapter._identity(proc.pid)}
        adapter.write_json(task/'owner.json',owner)
        deadline=time.monotonic()+5
        while not (task/'worker_heartbeat.json').exists() and time.monotonic()<deadline:time.sleep(.02)
        state=adapter.CodingMissionHandle(task.parent.parent).status(task.name)
        assert state['status']=='RUNNING' and state['active'] is True
        startup=adapter.read_json(task/'worker_startup.json')
        assert startup['request_sha256']==hashlib.sha256((task/'request.json').read_bytes()).hexdigest()
        heartbeat=adapter.read_json(task/'worker_heartbeat.json');heartbeat['at']=time.time()-60
        adapter.write_json(task/'worker_heartbeat.json',heartbeat)
        stale=adapter.CodingMissionHandle(task.parent.parent).status(task.name)
        assert stale['status']=='UNAVAILABLE' and not stale['active']
    finally:
        proc.kill();proc.wait(timeout=3)
    dead=adapter.CodingMissionHandle(task.parent.parent).status(task.name)
    assert dead['status']=='UNAVAILABLE' and not dead['active']
    assert adapter.read_json(task/'request.json')['mission_id']==task.name


def test_libproc_identity_needs_private_startup_binding(adapter,task):
    token='b'*32
    identity='libproc:123:1700000000:42:123'
    owner={'pid':123,'token':token,'identity':identity}
    adapter.write_json(task/'owner.json',owner)
    with patch.object(adapter,'_identity',return_value=identity), patch.object(adapter.os,'getpgid',return_value=123):
        assert adapter._owned(owner,task) is False
        adapter.write_json(task/'worker_startup.json',{
            'pid':123,'token':token,'process_identity':identity,
            'worker_entrypoint':str(HERE/'coding_mission.py'),
            'request_sha256':hashlib.sha256((task/'request.json').read_bytes()).hexdigest(),
        })
        assert adapter._owned(owner,task) is True
        changed=dict(adapter.read_json(task/'worker_startup.json'),process_identity='libproc:123:1700000001:42:123')
        adapter.write_json(task/'worker_startup.json',changed)
        assert adapter._owned(owner,task) is False


def test_libproc_pre_startup_is_queued_inactive_then_expires(adapter,task):
    identity='libproc:123:1700000000:42:123'
    owner={'pid':123,'token':'b'*32,'identity':identity,'created':time.time(),
           'worker_entrypoint':str(HERE/'coding_mission.py')}
    adapter.write_json(task/'owner.json',owner)
    with patch.object(adapter,'_identity',return_value=identity), patch.object(adapter.os,'getpgid',return_value=123):
        pending=adapter.CodingMissionHandle(task.parent.parent).status(task.name)
        assert pending['status']=='QUEUED' and pending['active'] is False
        assert pending['worker_liveness']=='starting'
        owner['created']=time.time()-adapter.STARTUP_MAX_AGE-1
        adapter.write_json(task/'owner.json',owner)
        expired=adapter.CodingMissionHandle(task.parent.parent).status(task.name)
        assert expired['status']=='UNAVAILABLE' and expired['active'] is False


def test_terminal_and_waiting_phases_never_active(adapter,task):
    for status in ('BLOCKED','COMPLETED','FAILED','CANCELLED','WAITING_APPROVAL','WAITING_PRIMARY_SOURCE'):
        got=adapter.worker_status(task,{'status':status,'progress':{'what':'prior success'}})
        assert not got['active'] and got['status']==status
        assert got['progress']['what']=='prior success'


def test_forged_or_wrong_request_startup_not_active(adapter,task):
    adapter.write_json(task/'owner.json',{'pid':123,'token':'b'*32})
    adapter.write_json(task/'worker_startup.json',{'pid':123,'token':'b'*32,'startup_id':'x','request_sha256':'wrong'})
    adapter.write_json(task/'worker_heartbeat.json',{'startup_id':'x','at':time.time()})
    with patch.object(adapter,'_owned',return_value=True):
        got=adapter.worker_status(task,{'status':'RUNNING'})
    assert got['status']=='UNAVAILABLE' and not got['active']

@pytest.mark.parametrize('failure',[{'ok':False,'gated':True,'spoken':'Approval needed'}, {'ok':False,'spoken':'missing target'}, RuntimeError('private detail')])
def test_success_receipt_survives_later_failure(tmp_path,failure):
    hand=module('p0_hand','agent_tools.py');artifact=tmp_path/'actual.txt';calls=[]
    def step(args,*a,**kw):
        calls.append(args['op'])
        if len(calls)==1:
            artifact.write_text('completed effect')
            return {'ok':True,'verified':True,'spoken':'written','artifact_sha256':hashlib.sha256(artifact.read_bytes()).hexdigest()}
        if isinstance(failure,Exception):raise failure
        return failure
    with patch.object(hand,'_step',step),patch.object(hand,'skill_first',return_value=''):
        got=hand.run({'steps':[{'op':'first'},{'op':'second'},{'op':'never'}]})
    assert calls==['first','second'] and artifact.read_text()=='completed effect'
    assert not got['ok'] and not got['verified'] and got['partial']
    assert len(got['results'])==2 and got['results'][0]['artifact_sha256']
    assert got['steps'][0]['status']=='verified' and got['steps'][2]['status']=='pending'
    assert 'private detail' not in got['spoken']
    if isinstance(failure,dict) and failure.get('gated'):assert got['gated'] and got['status']=='WAITING_APPROVAL'


def test_stop_after_completed_step_keeps_receipt():
    hand=module('p0_stop','agent_tools.py');stop=[False];calls=[]
    def step(*a,**kw):calls.append(1);return {'ok':True,'verified':True,'spoken':'effect done','receipt':'exact'}
    def progress(row):
        if row.get('status')=='verified':stop[0]=True
    with patch.object(hand,'_step',step),patch.object(hand,'skill_first',return_value=''):
        got=hand.run({'steps':[{'op':'first'},{'op':'never'}]},cancel_check=lambda:stop[0],progress=progress)
    assert calls==[1] and got['cancelled'] and not got['verified']
    assert got['results'][0]['receipt']=='exact' and got['steps'][0]['status']=='verified'


def test_over_budget_cannot_report_whole_task_completed():
    hand=module('p0_limit','agent_tools.py')
    with patch.object(hand,'_step',return_value={'ok':True,'verified':True}),patch.object(hand,'skill_first',return_value=''):
        got=hand.run({'steps':[{'op':'read'}]*13})
    assert len(got['results'])==12 and not got['ok'] and got['partial']


def test_control_stop_immediately_clears_activity(adapter,task):
    adapter.write_json(task/'control.json',{'cancel':True})
    with patch.object(adapter,'_owned',return_value=True):
        got=adapter.worker_status(task,{'status':'RUNNING','progress':{'what':'saved write'}})
    assert got['status']=='CANCELLED' and not got['active']
    assert got['progress']['what']=='saved write'



def test_frozen_executor_entrypoint_requires_host_validation(adapter,task,tmp_path):
    from types import SimpleNamespace
    path=tmp_path/'sealed/hands/coding_mission.py'
    receipt={'entrypoint':str(path),'source_manifest':{'hands/coding_mission.py':'sha'}}
    request=adapter.read_json(task/'request.json');request['executor']=receipt
    adapter.write_json(task/'request.json',request)
    original=adapter._load
    def load(name,path):
        if name=='coding_workflow_execution':return SimpleNamespace(validate_executor=lambda row:row==receipt)
        return original(name,path)
    with patch.object(adapter,'_load',load):
        assert adapter._worker_entrypoint(task)==path
    def invalid(name,path):
        if name=='coding_workflow_execution':return SimpleNamespace(validate_executor=lambda row:False)
        return original(name,path)
    with patch.object(adapter,'_load',invalid):
        with pytest.raises(ValueError):adapter._worker_entrypoint(task)


def test_model_cannot_supply_executor_authority(adapter):
    with pytest.raises(ValueError,match='model arguments'):
        adapter.run_coding({'executor':{'entrypoint':'/tmp/forged'}})


def test_workflow_queue_cannot_fall_back_to_live_executor(adapter):
    with pytest.raises(ValueError,match='host frozen executor'):
        adapter.CodingMissionHandle(Path('/tmp'))._queue({},'goal',workflow_context={'forged':True})


@pytest.mark.parametrize('malformed',[None,[],False,'not a receipt',17])
def test_malformed_later_receipt_preserves_completed_step(malformed):
    hand=module('p0_malformed','agent_tools.py')
    replies=iter([{'ok':True,'verified':True,'receipt':'actual completed effect'},malformed])
    with patch.object(hand,'_step',side_effect=lambda *a,**kw:next(replies)),patch.object(hand,'skill_first',return_value=''):
        got=hand.run({'steps':[{'op':'first'},{'op':'second'},{'op':'never'}]})
    assert not got['ok'] and not got['verified'] and got['partial']
    assert got['results'][0]['receipt']=='actual completed effect'
    assert got['steps'][0]['status']=='verified' and got['steps'][1]['status']=='failed'
    assert got['steps'][2]['status']=='pending' and len(got['results'])==2


def test_real_queued_child_runs_sealed_entrypoint_and_reports_capacity_block(tmp_path):
    """Real detached controller process; repo lock guarantees no model/key lookup."""
    import fcntl
    sys.path.insert(0,str(HERE))
    import test_coding_workflow_guard as fixture_module
    fixture=fixture_module.CodingWorkflowGuardTests();D=fixture_module.D;T=fixture_module.T
    h,root,repo,runtime,scratch,hand=fixture.fixture(str(tmp_path));a,b=T.ExecutionTests().context(hand)
    spawned=[];actual_spawn=D._spawn_worker
    def spawn(path,token):
        process=actual_spawn(path,token);spawned.append(process);return process
    with a,b,fixture.setup(hand):
        owner=fixture.prepare(h,repo,runtime,scratch)
        # This mutable checkout is no longer an executable worker authority.
        mutable=repo/'apps/agent-stack/hands/coding_mission.py'
        mutable.write_text(mutable.read_text()+'\nraise RuntimeError("mutable entrypoint must not run")\n')
        locks=h/'coding-missions/worker-locks';locks.mkdir(exist_ok=True)
        locked=locks/('repo-'+hashlib.sha256(owner['working_copy'].encode()).hexdigest()+'.lock')
        with locked.open('a') as lock:
            fcntl.flock(lock,fcntl.LOCK_EX)
            try:
                with patch.object(D,'_spawn_worker',side_effect=spawn):
                    ack=D.CodingMissionHandle(h).queue_workflow_code(root.name)
                child=D.mission_path(h,ack['mission_id'])
                spawned[0].wait(timeout=10)
                state=D.CodingMissionHandle(h).status(child.name)
                assert state['status']=='BLOCKED' and state['active'] is False
                assert state['terminal_reason']=='coding_repo_already_owned'
                request=D.read_json(child/'request.json');startup=D.read_json(child/'worker_startup.json')
                assert startup['pid']==spawned[0].pid
                assert startup['request_sha256']==hashlib.sha256((child/'request.json').read_bytes()).hexdigest()
                assert D.read_json(child/'worker_heartbeat.json')['startup_id']==startup['startup_id']
                assert D.read_json(child/'owner.json')['worker_entrypoint']==request['executor']['entrypoint']
                assert request['executor']['entrypoint']!=str(mutable)
                assert request['source_manifest']==request['executor']['source_manifest']
                assert not (child/'checkpoint.json').exists()
            finally:
                for process in spawned:
                    if process.poll() is None:process.kill();process.wait(timeout=3)


def test_successful_checked_preparation_moves_old_errors_to_history(tmp_path):
    """No transport/model outcome is manufactured as workflow completion."""
    import asyncio
    from unittest.mock import Mock
    sys.path.insert(0,str(HERE));sys.path.insert(0,str(HERE.parent))
    import test_coding_workflow_guard as fixture_module
    from brain.mission_controller import MissionController
    fixture=fixture_module.CodingWorkflowGuardTests();D=fixture_module.D;T=fixture_module.T
    h,root,repo,runtime,scratch,hand=fixture.fixture(str(tmp_path));a,b=T.ExecutionTests().context(hand)
    with a,b,fixture.setup(hand),patch.object(D,'_spawn_worker',return_value=Mock(pid=876543)),patch.object(D,'_identity',return_value='offline fixture'):
        fixture.prepare(h,repo,runtime,scratch)
        before=(root/'request.json').read_bytes();mc=MissionController(D)
        retained_state=D.read_json(root/'state.json')
        retained_state.update(status='PREPARATION_BLOCKED',execution_error='old preparation source missing',
                              preparation={'ok':False,'reason':'old parity blocker'})
        D.write_json(root/'state.json',retained_state)
        D.write_json(root/'execution_dispatch.json',{'mission_id':root.name,'request_sha256':hashlib.sha256(before).hexdigest(),'source_manifest':mc._workflow_manifest()})
        with patch.object(D.CodingMissionHandle,'status',return_value={'status':'BLOCKED','terminal_reason':'offline child requires recovery'}):
            got=asyncio.run(mc.execute(root))
        assert got['status']=='CODING_RECOVERY_REQUIRED' and not got['task_verified']
        assert 'execution_error' not in got and 'preparation' not in got
        assert got['prior_errors'][-1]['execution_error']=='old preparation source missing'
        assert got['prior_errors'][-1]['preparation']['reason']=='old parity blocker'
        assert got['coding_failure']=='offline child requires recovery'
        assert (root/'request.json').read_bytes()==before
