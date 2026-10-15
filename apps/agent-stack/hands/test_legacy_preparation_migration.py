"""Host maintenance on real temp Git repos. No provider/live/source artifacts."""
import fcntl
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
from unittest.mock import patch
import pytest

HERE=Path(__file__).parent
sys.path.insert(0,str(HERE))
import test_coding_workflow_guard as F
E,W,R=F.T.E,F.T.W,F.T.R

@pytest.fixture
def legacy(tmp_path):
    fixture=F.CodingWorkflowGuardTests();h,root,repo,runtime,scratch,hand=fixture.fixture(str(tmp_path))
    a,b=F.T.ExecutionTests().context(hand)
    with a,b,fixture.setup(hand):
        fixture.prepare(h,repo,runtime,scratch)
        contract=F.D.read_json(root/'execution_contract.json');contract.pop('executor_bundle')
        contract.pop('digest');contract['digest']=E._digest(contract);F.D.write_json(root/'execution_contract.json',contract)
        guard=F.D.read_json(root/'execution_guard.json');guard['contract_digest']=contract['digest'];F.D.write_json(root/'execution_guard.json',guard)
        owner=F.D.read_json(root/'execution_owner.json');owner.pop('executor');owner['execution_contract_digest']=contract['digest'];F.D.write_json(root/'execution_owner.json',owner)
        child=root.parent/('c'*32);child.mkdir()
        for name in ('worker.lock','steering.lock'):(child/name).touch()
        for name,row in {'request':{'mission_id':child.name,'worker_kind':'coding'},'result':{'status':'BLOCKED','verified':False,'offline_fixture':True},'checkpoint':{'phase':'pending_write','offline_fixture':True}}.items():F.D.write_json(child/(name+'.json'),row)
        F.D.write_json(root/'coding_child.json',{'mission_id':child.name})
        copy=Path(contract['working_copy']);body=b'def bounded_behavior(value):\n    return value + 1\n'
        partial=copy/'apps/agent-stack/hands/recovered_behavior.py';partial.write_bytes(body)
        ignore=copy/'.gitignore';ignore.write_bytes(b'__pycache__/\n*.pyc\nLibrary/\n.pytest_cache/\n')
        snapshot=hand.code_repo_snapshot(copy)
        partials={str(p.relative_to(copy)):hashlib.sha256(p.read_bytes()).hexdigest() for p in (partial,ignore)}
        baseline=E.capture_runtime_baseline(runtime,R._git(runtime))
        yield {'h':h,'root':root,'repo':repo,'runtime':runtime,'copy':copy,'child':child,'snapshot':snapshot,'partials':partials,'baseline':baseline,'hand':hand,'body':body}


def approve(case,**changes):
    values={'expected_snapshot':case['snapshot'],'partial_files':case['partials'],'runtime_baseline':case['baseline'],
            'authority':E.source_review_authority(),'evidence':{'offline_independent_exact_partial_review':True}}
    values.update(changes)
    return E.approve_legacy_migration(case['h'],F.ID,**values)


def test_full_partial_and_old_receipts_preserved_without_worker_history_rewrite(legacy):
    c=legacy;old={name:p.read_bytes() for name in ('execution_contract.json','execution_guard.json','execution_owner.json','coding_child.json','request.json','source_revision_review.json') if (p:=c['root']/name).exists()}
    child={p.name:p.read_bytes() for p in c['child'].iterdir() if p.is_file()};review=approve(c)
    got=E.recover_preparation(c['h'],F.ID,active_fn=lambda:True)
    assert got['recovered'] and got['status']=='PREPARED' and got['task_verified'] is False
    moved=Path(got['preserved_copy']);snap=c['hand'].code_repo_snapshot(moved);snap['repo']=c['snapshot']['repo'];assert snap==c['snapshot']
    assert (c['copy']/'apps/agent-stack/hands/recovered_behavior.py').read_bytes()==c['body']
    for name,raw in old.items():assert (Path(got['archive'])/'receipts'/name).read_bytes()==raw
    for name,raw in child.items():assert (c['child']/name).read_bytes()==raw
    assert (c['root']/'request.json').read_bytes()==old['request.json']
    assert not (c['root']/'execution_owner.json').exists() and not (c['root']/'coding_child.json').exists()
    fresh=F.D.read_json(c['root']/'execution_contract.json');assert fresh['executor_bundle']
    assert fresh['digest']!=json.loads(old['execution_contract.json'])['digest']
    assert E.recover_preparation(c['h'],F.ID,active_fn=lambda:True)['recovered']
    assert set(child)=={p.name for p in c['child'].iterdir()}
    (c['copy']/'apps/agent-stack/hands/recovered_behavior.py').write_text('def external_change():\n    return 2\n')
    with pytest.raises(ValueError,match='completed_copy_changed'):E.recover_preparation(c['h'],F.ID,active_fn=lambda:True)
    assert (c['copy']/'apps/agent-stack/hands/recovered_behavior.py').read_text()=='def external_change():\n    return 2\n'


@pytest.mark.parametrize('change',['snapshot','partial_hash','baseline_file','secret','authority','configuration'])
def test_unreviewed_changes_rejected_before_archive(legacy,change):
    c=legacy;kwargs={}
    if change=='snapshot':kwargs['expected_snapshot']={**c['snapshot'],'head':'0'*40}
    if change=='partial_hash':kwargs['partial_files']={**c['partials'],'apps/agent-stack/hands/recovered_behavior.py':'0'*64}
    if change=='baseline_file':(c['copy']/'apps/agent-stack/feature.py').write_text('external modification')
    if change=='secret':(c['copy']/'.env').write_text('not a credential, forbidden path')
    if change=='authority':kwargs['authority']={'approved':True}
    if change=='configuration':(c['runtime']/'apps/agent-stack/brain/online.py').write_text('# changed current model source')
    with pytest.raises((ValueError,c['hand']._CheckpointBlocked)):approve(c,**kwargs)
    assert c['copy'].exists() and not (c['root']/'migration-history').exists()


def test_cancelled_review_cannot_mutate_existing_preparation(legacy):
    c=legacy;approve(c)
    with pytest.raises(ValueError,match='cancelled'):E.recover_preparation(c['h'],F.ID,active_fn=lambda:False)
    assert c['copy'].exists() and not (c['root']/'migration-history').exists()


@pytest.mark.parametrize('which',['parent','child','repo'])
def test_actual_process_or_repo_lock_blocks_migration(legacy,which):
    c=legacy;approve(c)
    if which=='repo':
        path=c['root'].parent/'worker-locks'/('repo-'+hashlib.sha256(str(c['copy']).encode()).hexdigest()+'.lock')
        with path.open('a') as lock:
            fcntl.flock(lock,fcntl.LOCK_EX)
            with pytest.raises(ValueError,match='lock_active'):E.recover_preparation(c['h'],F.ID,active_fn=lambda:True)
    else:
        process=subprocess.Popen([sys.executable,'-I','-S','-c','import time;time.sleep(20)'])
        try:
            F.D.write_json((c['root'] if which=='parent' else c['child'])/'owner.json',{'pid':process.pid})
            with pytest.raises(ValueError,match='active'):E.recover_preparation(c['h'],F.ID,active_fn=lambda:True)
        finally:process.kill();process.wait(timeout=3)
    assert c['copy'].exists() and not (c['root']/'migration-history').exists()


def test_crash_after_owned_copy_move_resumes_exact_review_without_duplicate(legacy):
    c=legacy;approve(c);move=E._rename_exclusive;calls=[]
    def interrupted(source,target):
        move(source,target);calls.append((source,target))
        if len(calls)==1:raise RuntimeError('offline process loss after preserved copy move')
    with patch.object(E,'_rename_exclusive',side_effect=interrupted):
        with pytest.raises(RuntimeError):E.recover_preparation(c['h'],F.ID,active_fn=lambda:True)
    assert not c['copy'].exists() and Path(calls[0][1]).exists()
    got=E.recover_preparation(c['h'],F.ID,active_fn=lambda:True)
    assert got['recovered'] and (c['copy']/'apps/agent-stack/hands/recovered_behavior.py').read_bytes()==c['body']
    assert len(list((c['root']/'migration-history').iterdir()))==1


@pytest.mark.parametrize('change',['partial','source_review','runtime'])
def test_post_review_drift_denies_migration_without_moving_copy(legacy,change):
    c=legacy;approve(c)
    if change=='partial':(c['copy']/'apps/agent-stack/hands/recovered_behavior.py').write_text('external edit')
    if change=='source_review':
        row=F.D.read_json(c['root']/'source_revision_review.json');row['evidence']={'different review':True};F.D.write_json(c['root']/'source_revision_review.json',row)
    if change=='runtime':(c['runtime']/'apps/agent-stack/brain/online.py').write_text('# changed live config')
    with pytest.raises(ValueError):E.recover_preparation(c['h'],F.ID,active_fn=lambda:True)
    assert c['copy'].exists() and not (c['root']/'migration-history').exists()


def test_crash_after_exact_new_file_publication_reconciles_without_second_write(legacy):
    c=legacy;approve(c);write=E._migration_write_new;published=[]
    target=c['copy']/'apps/agent-stack/hands/recovered_behavior.py'
    def interrupted(path,raw,mode):
        write(path,raw,mode)
        if path==target:
            published.append(path);raise RuntimeError('offline loss after exact publication')
    with patch.object(E,'_migration_write_new',side_effect=interrupted):
        with pytest.raises(RuntimeError):E.recover_preparation(c['h'],F.ID,active_fn=lambda:True)
    assert target.read_bytes()==c['body'] and len(published)==1
    def no_second_publication(path,raw,mode):
        if path==target:raise AssertionError('must reconcile exact already-written file')
        return write(path,raw,mode)
    with patch.object(E,'_migration_write_new',side_effect=no_second_publication):
        got=E.recover_preparation(c['h'],F.ID,active_fn=lambda:True)
    assert got['recovered'] and target.read_bytes()==c['body']



def test_legacy_exception_reads_pinned_git_proof_never_bound_checkout(legacy):
    c=legacy;source=json.loads(json.dumps(F.D.read_json(c['root']/'execution_contract.json')['source_receipt']))
    source['verification_method']='owner_verified_project_checkout'
    relative='apps/agent-stack/feature.py';meta=source['app_manifest'][relative]
    proof={relative:{'file':meta,'public_proof':{'sha256':meta['sha256']},'review_digest':'offline seam'}}
    source['source_exceptions']=proof
    pin=F.D.read_json(c['root']/'source_revision_review.json');calls=[]
    def pinned_only(hive,mission_id,**kw):
        assert kw.get('revision')==pin['source_revision']
        calls.append(kw['revision']);return proof
    actual=W._regular_bytes
    def no_checkout_body(path,*args,**kw):
        if Path(path)==c['repo']/relative:raise AssertionError('bound checkout body must not be read')
        return actual(path,*args,**kw)
    perm=c['hand'].PERM();previous=perm.is_secret_path
    perm.is_secret_path=lambda path:previous(path) or Path(path).name=='feature.py';c['hand'].PERM=lambda:perm
    with patch.object(E,'_source_exceptions',side_effect=pinned_only),patch.object(W,'_regular_bytes',side_effect=no_checkout_body):
        snapshot=E._migration_snapshot(c['h'],F.ID,c['copy'],source)
        assert snapshot['files'][relative]['sha256']==meta['sha256'] and calls==[pin['source_revision']]
        bad=json.loads(json.dumps(proof));bad[relative]['public_proof']['sha256']='0'*64
        with patch.object(E,'_source_exceptions',return_value=bad):
            with pytest.raises(ValueError,match='retained_public_source'):E._migration_snapshot(c['h'],F.ID,c['copy'],source)



def test_explicit_private_host_context_is_archived_only_never_adopted(legacy):
    c=legacy;name='00-JARVIS-TASK-CONTEXT.md';note=c['copy']/name
    body=(b'Transient host maintenance context for this retained task only.\n'+b' '*1594)[:1594]
    note.write_bytes(body);note.chmod(0o600)
    snapshot=c['hand'].code_repo_snapshot(c['copy']);row={'sha256':hashlib.sha256(body).hexdigest(),'mode':0o600}
    approve(c,expected_snapshot=snapshot,archive_only={name:row})
    got=E.recover_preparation(c['h'],F.ID,active_fn=lambda:True)
    assert got['recovered'] and got['task_verified'] is False
    saved=Path(got['preserved_copy'])/name
    assert saved.read_bytes()==body and saved.stat().st_mode&0o777==0o600
    assert not (c['copy']/name).exists()
    completed=F.D.read_json(Path(got['archive'])/'completed.json')
    assert completed['archive_only']=={name:row}
    assert completed['archive_only_disposition']=='host_transient_context_archived_not_restored_or_adopted'


def test_host_context_missing_wrong_hash_or_unlisted_disposition_denied(legacy):
    c=legacy;name='00-JARVIS-TASK-CONTEXT.md';note=c['copy']/name;body=b'Exact transient task input, not a project requirement.\n'
    note.write_bytes(body);note.chmod(0o600)
    snapshot=c['hand'].code_repo_snapshot(c['copy']);row={'sha256':hashlib.sha256(body).hexdigest(),'mode':0o600}
    for disposition in ({},{name:{**row,'sha256':'0'*64}},{name:{**row,'mode':0o644}},{name:row,'unlisted.md':row}):
        with pytest.raises(ValueError):approve(c,expected_snapshot=snapshot,archive_only=disposition)
        assert not (c['root']/'legacy_migration_review.json').exists()
        assert not (c['root']/'migration-history').exists() and note.read_bytes()==body


def test_old_guard_bytes_validate_old_lock_while_fresh_guard_has_new_identity(legacy,tmp_path):
    import importlib.util
    c=legacy;old_guard=F.D.read_json(c['root']/'execution_guard.json')
    original=(c['copy']/'apps/agent-stack/hands/workflow_config_lock.py').read_bytes()
    revised=original+b'\n# Current host guard revision fixture; selector semantics unchanged.\n'
    module_path=tmp_path/'current_guard.py';module_path.write_bytes(revised)
    spec=importlib.util.spec_from_file_location('migration_current_guard_fixture',module_path)
    current=importlib.util.module_from_spec(spec);spec.loader.exec_module(current)
    (c['runtime']/'apps/agent-stack/hands/workflow_config_lock.py').write_bytes(revised)
    previous_load=E._load
    def load(name):return current if name=='workflow_config_lock' else previous_load(name)
    with patch.object(E,'_load',side_effect=load),patch.object(W,'_configuration_guard',return_value=current):
        baseline=E.capture_runtime_baseline(c['runtime'],R._git(c['runtime']))
        assert baseline['configuration_lock']['guard_sha256']!=old_guard['configuration_lock']['guard_sha256']
        approve(c,runtime_baseline=baseline)
        got=E.recover_preparation(c['h'],F.ID,active_fn=lambda:True)
    assert got['recovered']
    archived=F.D.read_json(Path(got['archive'])/'receipts/execution_guard.json')
    assert archived==old_guard
    assert (Path(got['preserved_copy'])/'apps/agent-stack/hands/workflow_config_lock.py').read_bytes()==original
    assert (c['copy']/'apps/agent-stack/hands/workflow_config_lock.py').read_bytes()==revised
