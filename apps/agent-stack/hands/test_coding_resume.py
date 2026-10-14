"""Real temporary Git/worktree recovery with synthetic model output, no paid calls."""
import asyncio
import importlib.util
import json
import os
import subprocess
import sys
import shlex
from pathlib import Path
from unittest.mock import Mock

import pytest


class Crash(BaseException):
    pass


@pytest.fixture
def coding(tmp_path, monkeypatch):
    path = Path(__file__).with_name('agent_tools.py')
    spec = importlib.util.spec_from_file_location('resume_hand', path)
    hand = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(hand)
    monkeypatch.setenv('JARVIS_SCRATCH_ROOTS', str(tmp_path/'scratch'))
    monkeypatch.setenv('JARVIS_ACTION_LOG','off')
    calls = {'models':0,'ranks':0,'writes':[],'tests':0,'commits':0}
    def rank(*a):
        calls['ranks'] += 1
        return []
    def model(*a):
        calls['models'] += 1
        return json.dumps({'plan':['implement helpers','test','commit'], 'files':{
            'a.py':'def add(a,b): return a+b\n',
            'b.py':'from a import add\nRESULT = add(17,26)\n',
            'test_checks.py':'import unittest\nfrom b import RESULT\nclass Check(unittest.TestCase):\n def test_result(self): self.assertEqual(RESULT,43)\n'},
            'test_cmd':'python3 -m unittest discover -v','commit_message':'fixture coding outcome'}), 'configured-model'
    monkeypatch.setattr(hand,'rank_skills',rank)
    monkeypatch.setattr(hand,'llm',model)
    original = hand.op_repo
    def repo(target,action,**kw):
        if action == 'write': calls['writes'].append(kw['path'])
        if action == 'commit': calls['commits'] += 1
        if action == 'test':
            calls['tests'] += 1
            # Only these known harmless fixture files execute. Production still
            # uses its existing sandbox; this verifies checkpoint sequencing.
            p = subprocess.run([sys.executable,'-m','unittest','discover','-v'], cwd=target,
                               capture_output=True,text=True,timeout=5,env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1'})
            return {'ok':p.returncode==0,'verified':p.returncode==0,'spoken':'fixture tests passed' if not p.returncode else 'fixture tests failed','output':p.stdout+p.stderr}
        return original(target,action,**kw)
    monkeypatch.setattr(hand,'op_repo',repo)
    root = tmp_path/'scratch'/'demo'
    args = {'op':'code','repo':str(root),'goal':'implement arithmetic helpers with test','branch':'jarvis/fixture'}
    saved = []
    def save(cp): saved.append(json.loads(json.dumps(cp)))
    return hand, root, args, calls, saved, save, repo


def crash_after(coding, monkeypatch, action, path=None):
    hand, root, args, calls, saved, save, repo = coding
    def crash(target,op,**kw):
        got = repo(target,op,**kw)
        if op == action and (path is None or kw.get('path') == path):
            raise Crash()
        return got
    monkeypatch.setattr(hand,'op_repo',crash)
    with pytest.raises(Crash): hand.run(args,checkpoint=save)
    monkeypatch.setattr(hand,'op_repo',repo)
    return saved[-1]


def test_crash_after_first_write_resumes_next_step_without_model_or_rewrite(coding,monkeypatch):
    hand, root, args, calls, saved, save, repo = coding
    cp = crash_after(coding,monkeypatch,'write','a.py')
    assert cp['phase'] == 'pending_write' and (root/'a.py').is_file() and not (root/'b.py').exists()
    got = hand.run(args,checkpoint=save,resume_checkpoint=cp)
    assert got['ok'] and calls['models'] == calls['ranks'] == 1
    assert calls['writes'].count('a.py') == calls['writes'].count('b.py') == 1
    assert calls['tests'] == calls['commits'] == 1
    assert saved[-1]['phase'] == 'complete' and hand._git(root,'rev-list','--count','HEAD').stdout.strip() == '1'


def test_crash_after_commit_reconciles_exact_head_without_duplicate_commit(coding,monkeypatch):
    hand, root, args, calls, saved, save, repo = coding
    cp = crash_after(coding,monkeypatch,'commit')
    head = hand._git(root,'rev-parse','HEAD').stdout.strip()
    got = hand.run(args,checkpoint=save,resume_checkpoint=cp)
    assert got['ok'] and calls['commits'] == calls['models'] == calls['ranks'] == 1
    assert hand._git(root,'rev-parse','HEAD').stdout.strip() == head
    assert 'reconciled' not in saved[-1]['commit_receipt'] and head[:12] in saved[-1]['commit_receipt']


@pytest.mark.parametrize('change',['tamper','external','branch','head','symlink'])
def test_unexpected_repo_change_blocks_without_further_mutations(coding,monkeypatch,change):
    hand, root, args, calls, saved, save, repo = coding
    cp = crash_after(coding,monkeypatch,'write','a.py')
    if change == 'tamper': (root/'a.py').write_text('external edit')
    if change == 'external': (root/'external.txt').write_text('human work')
    if change == 'branch': hand._git(root,'checkout','-q','-B','other')
    if change == 'head':
        hand._git(root,'add','-A');hand._git(root,'commit','-q','-m','external commit')
    if change == 'symlink': (root/'linked').symlink_to(root/'a.py')
    before = dict(calls)
    got = hand.run(args,checkpoint=save,resume_checkpoint=cp)
    assert got['blocked'] and not got['verified'] and calls == before
    assert not (root/'b.py').exists()


def test_secret_like_model_state_never_saved(coding,monkeypatch):
    hand, root, args, calls, saved, save, repo = coding
    monkeypatch.setattr(hand,'llm',lambda *a:(json.dumps({'files':{'bad.py':'api_key=synthetic_fixture_only'}}),'configured-model'))
    got = hand.run(args,checkpoint=save)
    assert got['blocked'] and not (root/'bad.py').exists()
    assert all('synthetic_fixture_only' not in json.dumps(cp) for cp in saved)


def _adapter(monkeypatch):
    path = Path(__file__).with_name('coding_mission.py')
    spec = importlib.util.spec_from_file_location('resume_adapter',path)
    mod = importlib.util.module_from_spec(spec)
    monkeypatch.setitem(sys.modules,spec.name,mod)
    spec.loader.exec_module(mod)
    return mod


def mission_fixture(coding,monkeypatch,tmp_path):
    hand,root,args,calls,saved,save,repo = coding
    adapter = _adapter(monkeypatch)
    original_load = adapter._load
    monkeypatch.setattr(adapter,'_load',lambda name,path: hand if name=='coding_agent_tools' else original_load(name,path))
    old = adapter.mission_path(tmp_path/'hive','a'*32)
    old.mkdir(parents=True)
    request = {'mission_id':old.name,'worker_kind':'coding','objective':'original coding task','code_args':args,'source_manifest':adapter.mission_source_manifest()}
    adapter.write_json(old/'request.json',request)
    adapter.write_json(old/'state.json',{'mission_id':old.name,'worker_kind':'coding','status':'QUEUED','verified':False})
    adapter.write_json(old/'control.json',{'cancel':False})
    return adapter,old


def test_actual_controller_checkpoint_and_cancelled_parent_child_resume(coding,monkeypatch,tmp_path):
    hand,root,args,calls,saved,save,repo = coding
    adapter,old = mission_fixture(coding,monkeypatch,tmp_path)
    def crash(target,action,**kw):
        got=repo(target,action,**kw)
        if action=='write' and kw.get('path')=='a.py': raise Crash()
        return got
    monkeypatch.setattr(hand,'op_repo',crash)
    with pytest.raises(Crash): asyncio.run(adapter.execute_mission(old))
    envelope = adapter.read_json(old/'checkpoint.json')
    assert envelope['checkpoint']['phase']=='pending_write' and envelope['checkpoint_digest']==hand.checkpoint_digest(envelope['checkpoint'])
    adapter.write_json(old/'result.json',{'mission_id':old.name,'status':'CANCELLED','verified':False,'terminal_commit_id':'original-terminal'})
    request_bytes=(old/'request.json').read_bytes();result_bytes=(old/'result.json').read_bytes()
    monkeypatch.setattr(hand,'op_repo',repo)
    spawned=Mock(return_value=Mock(pid=12345))
    monkeypatch.setattr(adapter,'_spawn_worker',spawned)
    monkeypatch.setattr(adapter,'_identity',lambda pid:None)
    handle=adapter.CodingMissionHandle(tmp_path/'hive')
    ack=handle.resume(old.name)
    assert handle.resume(old.name)['mission_id']==ack['mission_id'] and spawned.call_count==1
    child=adapter.mission_path(tmp_path/'hive',ack['mission_id'])
    result=asyncio.run(adapter.execute_mission(child))
    assert result['status']=='COMPLETED' and not result['verified'] and result['builder_verified']
    assert adapter.read_json(child/'request.json')['resume_of']==old.name
    assert (old/'request.json').read_bytes()==request_bytes and (old/'result.json').read_bytes()==result_bytes
    assert calls['models']==calls['ranks']==calls['commits']==1
    assert calls['writes'].count('a.py')==1


def test_resume_source_drift_rejected_before_child_spawn(coding,monkeypatch,tmp_path):
    hand,root,args,calls,saved,save,repo = coding
    cp=crash_after(coding,monkeypatch,'write','a.py')
    adapter,old=mission_fixture(coding,monkeypatch,tmp_path)
    adapter.write_json(old/'checkpoint.json',{'mission_id':old.name,'code_args':args,'checkpoint':cp,
        'checkpoint_digest':hand.checkpoint_digest(cp),'source_manifest':{'old':True}})
    spawned=Mock();monkeypatch.setattr(adapter.subprocess,'Popen',spawned)
    with pytest.raises(ValueError,match='source changed'): adapter.CodingMissionHandle(tmp_path/'hive').resume(old.name)
    assert not spawned.called and not (old/'resume_child.json').exists()


@pytest.mark.parametrize('reason',['completed','active','missing','digest'])
def test_resume_rejects_without_spawning_on_lifecycle_or_provenance_failure(coding,monkeypatch,tmp_path,reason):
    hand,root,args,calls,saved,save,repo=coding
    cp=crash_after(coding,monkeypatch,'write','a.py')
    adapter,old=mission_fixture(coding,monkeypatch,tmp_path)
    envelope={'mission_id':old.name,'code_args':args,'checkpoint':cp,
              'checkpoint_digest':hand.checkpoint_digest(cp),'source_manifest':adapter.mission_source_manifest()}
    if reason!='missing': adapter.write_json(old/'checkpoint.json',envelope)
    if reason=='completed': adapter.write_json(old/'result.json',{'status':'COMPLETED'})
    if reason=='active': monkeypatch.setattr(adapter,'_owned',lambda *a:True)
    if reason=='digest':
        envelope['checkpoint']['goal']='tampered field'
        adapter.write_json(old/'checkpoint.json',envelope)
    spawned=Mock();monkeypatch.setattr(adapter,'_spawn_worker',spawned)
    with pytest.raises(ValueError): adapter.CodingMissionHandle(tmp_path/'hive').resume(old.name)
    assert not spawned.called and not (old/'resume_child.json').exists()


def test_pending_commit_wrong_message_blocks_even_with_matching_files(coding,monkeypatch):
    hand,root,args,calls,saved,save,repo=coding
    cp=crash_after(coding,monkeypatch,'commit')
    hand._git(root,'commit','--amend','-q','-m','different human commit')
    before=calls['commits']
    result=hand.run(args,checkpoint=save,resume_checkpoint=cp)
    assert result['blocked'] and calls['commits']==before


def test_checkpoint_does_not_read_secret_path_or_follow_git_symlink(coding):
    hand,root,args,calls,saved,save,repo=coding
    root.mkdir(parents=True)
    (root/'.env').write_text('synthetic private fixture')
    with pytest.raises(hand._CheckpointBlocked,match='secret'): hand.code_repo_snapshot(root)
    (root/'.env').unlink()
    (root/'.git').symlink_to(root)
    with pytest.raises(hand._CheckpointBlocked,match='metadata'): hand.code_repo_snapshot(root)


@pytest.mark.parametrize('change',['new_hook','hooks_path','fsmonitor','include','metadata_symlink','sample_chmod','attributes'])
def test_git_execution_metadata_drift_blocks_before_any_git_query(coding,monkeypatch,tmp_path,change):
    hand,root,args,calls,saved,save,repo=coding
    cp=crash_after(coding,monkeypatch,'write','a.py')
    marker=tmp_path/'unexpected-execution'
    script=tmp_path/'harmless-fixture.sh'
    script.write_text('#!/bin/sh\n: > '+shlex.quote(str(marker))+'\n')
    script.chmod(0o755)
    config=root/'.git'/'config'
    if change=='new_hook':
        hook=root/'.git'/'hooks'/'pre-commit';hook.write_text(script.read_text());hook.chmod(0o755)
    elif change=='hooks_path':
        directory=tmp_path/'external-hooks';directory.mkdir()
        hook=directory/'pre-commit';hook.write_text(script.read_text());hook.chmod(0o755)
        config.write_text(config.read_text().replace('[core]\n','[core]\n\thooksPath = '+str(directory)+'\n',1))
    elif change=='fsmonitor':
        config.write_text(config.read_text().replace('[core]\n','[core]\n\tfsmonitor = '+str(script)+'\n',1))
    elif change=='include':
        config.write_text(config.read_text()+'\n[include]\n\tpath = '+str(script)+'\n')
    elif change=='metadata_symlink':
        outside=tmp_path/'original-config';outside.write_text(config.read_text())
        config.unlink();config.symlink_to(outside)
    elif change=='sample_chmod':
        sample=root/'.git'/'hooks'/'pre-commit.sample'
        sample.chmod(sample.stat().st_mode ^ 0o100)
    elif change=='attributes':
        (root/'.git'/'info'/'attributes').write_text('*.py filter=unapproved\n')
    queried=[]
    original=hand._git
    def query(*a,**kw):
        queried.append(a)
        return original(*a,**kw)
    monkeypatch.setattr(hand,'_git',query)
    got=hand.run(args,checkpoint=save,resume_checkpoint=cp)
    assert got['blocked'] and not queried and not marker.exists()
    assert not (root/'b.py').exists() and calls['commits']==0


def test_inherited_git_config_cannot_execute_fsmonitor_or_hook(coding,monkeypatch,tmp_path):
    hand,root,args,calls,saved,save,repo=coding
    cp=crash_after(coding,monkeypatch,'write','a.py')
    marker=tmp_path/'unexpected-global-execution'
    script=tmp_path/'global-fixture.sh'
    script.write_text('#!/bin/sh\n: > '+shlex.quote(str(marker))+'\n');script.chmod(0o755)
    global_config=tmp_path/'global-git-config'
    global_config.write_text('[core]\n\tfsmonitor = '+str(script)+'\n\thooksPath = '+str(tmp_path)+'\n')
    monkeypatch.setenv('GIT_CONFIG_GLOBAL',str(global_config))
    monkeypatch.setenv('GIT_CONFIG_COUNT','1')
    monkeypatch.setenv('GIT_CONFIG_KEY_0','core.fsmonitor')
    monkeypatch.setenv('GIT_CONFIG_VALUE_0',str(script))
    monkeypatch.setenv('GIT_CONFIG_PARAMETERS',"'core.fsmonitor="+str(script)+"'")
    got=hand.run(args,checkpoint=save,resume_checkpoint=cp)
    assert got['ok'] and calls['commits']==1 and not marker.exists()


def test_test_runner_cannot_authorize_git_config_drift_before_commit(coding,monkeypatch):
    hand,root,args,calls,saved,save,repo=coding
    def changed(target,action,**kw):
        got=repo(target,action,**kw)
        if action=='test': hand._git(Path(target),'config','user.name','Unexpected fixture identity')
        return got
    monkeypatch.setattr(hand,'op_repo',changed)
    result=hand.run(args,checkpoint=save)
    assert result['blocked'] and calls['commits']==0
    assert saved[-1]['phase']=='pending_test'


def test_model_cannot_write_git_execution_metadata(coding,monkeypatch):
    hand,root,args,calls,saved,save,repo=coding
    monkeypatch.setattr(hand,'llm',lambda *a:(json.dumps({'files':{'.git/hooks/pre-commit':'#!/bin/sh\nexit 0\n'}}),'configured-model'))
    result=hand.run(args,checkpoint=save)
    assert result['blocked'] and calls['commits']==0
    assert not (root/'.git'/'hooks'/'pre-commit').exists()
