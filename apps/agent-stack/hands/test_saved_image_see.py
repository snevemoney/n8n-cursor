"""Saved-image read/vision fencing with real local fixture bytes; no UI/cloud calls."""
import base64
import importlib.util
import json
import subprocess
import sys
from pathlib import Path
from unittest.mock import Mock

import pytest


@pytest.fixture
def saved_image(tmp_path,monkeypatch):
    hands=Path(__file__).parent
    spec=importlib.util.spec_from_file_location('saved_image_hand',hands/'screen_see.py')
    hand=importlib.util.module_from_spec(spec);spec.loader.exec_module(hand)
    ms=importlib.util.spec_from_file_location('agent_stack_macos_read',hands/'macos_read.py')
    mac=importlib.util.module_from_spec(ms);ms.loader.exec_module(mac)
    monkeypatch.setitem(sys.modules,ms.name,mac)
    home=tmp_path/'home';(home/'Desktop').mkdir(parents=True)
    monkeypatch.setattr(mac,'HOME',home)
    shot=home/'Desktop'/'Screenshot fixture.png'
    raw=base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aB6sAAAAASUVORK5CYII=')
    shot.write_bytes(raw)
    receipt=mac.screenshot_fingerprint(shot,home)
    return hand,mac,shot,raw,receipt,tmp_path/'hive'


def test_real_bounded_local_read_sends_exact_fixture_only_and_preserves_file(saved_image):
    hand,mac,shot,raw,receipt,hive=saved_image
    calls=[]
    def vision(prompt,images):
        calls.append((prompt,images))
        return 'A tiny fixture image is visible. What would you like to do with it?'
    result=hand.run_file(receipt,hive=hive,vision_fn=vision,active_fn=lambda:True,follow_up=True)
    assert result['ok'] and not result['task_verified'] and result['source']=='saved_screenshot'
    assert base64.b64decode(calls[0][1][0].split(',',1)[1])==raw
    assert 'untrusted data' in calls[0][0] and 'useful follow-up' in calls[0][0]
    assert shot.read_bytes()==raw and mac.same_screenshot(mac.screenshot_fingerprint(shot,mac.HOME),receipt)
    assert result['read_evidence']['identity_fields']==7
    assert str(shot) not in json.dumps(hand.log_meta(result))


def test_followup_is_not_requested_by_default(saved_image):
    hand,mac,shot,raw,receipt,hive=saved_image
    prompts=[]
    result=hand.run_file(receipt,hive=hive,vision_fn=lambda p,**k:prompts.append(p) or 'A tiny image.',active_fn=lambda:True)
    assert result['ok'] and 'Do not ask a follow-up question' in prompts[0]


@pytest.mark.parametrize('change',['replace','modify','symlink','not_image'])
def test_changed_or_invalid_file_never_reaches_vision(saved_image,change,tmp_path):
    hand,mac,shot,raw,receipt,hive=saved_image
    if change=='modify': shot.write_bytes(raw+b'changed')
    elif change=='replace': shot.unlink();shot.write_bytes(raw)
    elif change=='symlink':
        shot.unlink();outside=tmp_path/'outside.png';outside.write_bytes(raw);shot.symlink_to(outside)
    else: shot.write_bytes(b'not image')
    vision=Mock(return_value='invented caption')
    result=hand.run_file(receipt,hive=hive,vision_fn=vision,active_fn=lambda:True)
    assert not result['ok'] and not vision.called and not result['task_verified']


def test_cloud_or_permission_read_timeout_is_honest_and_bounded(saved_image,monkeypatch):
    hand,mac,shot,raw,receipt,hive=saved_image
    receipt=dict(receipt,locally_available=False,verification='filename_and_metadata_only')
    commands=[]
    def timeout(argv,timeout):
        commands.append((argv,timeout))
        raise subprocess.TimeoutExpired(argv,timeout,output='untrusted pixels',stderr=str(shot))
    monkeypatch.setattr(mac,'_run',timeout)
    vision=Mock()
    result=hand.run_file(receipt,hive=hive,vision_fn=vision,active_fn=lambda:True)
    assert result['reason']=='file_read_timeout' and not vision.called and commands[0][1]==4
    assert str(shot) not in json.dumps(result) and 'untrusted pixels' not in json.dumps(result)
    assert shot.read_bytes()==raw


def test_cancel_before_read_has_no_read_or_vision(saved_image,monkeypatch):
    hand,mac,shot,raw,receipt,hive=saved_image
    reader=Mock();vision=Mock();monkeypatch.setattr(mac,'_run',reader)
    result=hand.run_file(receipt,hive=hive,vision_fn=vision,active_fn=lambda:False)
    assert result['reason']=='stale_turn' and not reader.called and not vision.called


def test_cancel_after_read_suppresses_vision(saved_image,monkeypatch):
    hand,mac,shot,raw,receipt,hive=saved_image
    flag=[True];read=mac._run
    def stopped(*a,**kw):
        result=read(*a,**kw);flag[0]=False;return result
    monkeypatch.setattr(mac,'_run',stopped)
    vision=Mock()
    result=hand.run_file(receipt,hive=hive,vision_fn=vision,active_fn=lambda:flag[0])
    assert result['reason']=='stale_turn' and not vision.called


def test_cancel_immediately_before_vision_suppresses_call(saved_image):
    hand,mac,shot,raw,receipt,hive=saved_image
    active=iter([True,True,True,False])
    vision=Mock()
    result=hand.run_file(receipt,hive=hive,vision_fn=vision,active_fn=lambda:next(active))
    assert result['reason']=='stale_turn' and not vision.called


def test_cancel_after_vision_discards_caption(saved_image):
    hand,mac,shot,raw,receipt,hive=saved_image
    flag=[True]
    def vision(*a,**kw): flag[0]=False;return 'Caption that must not be delivered.'
    result=hand.run_file(receipt,hive=hive,vision_fn=vision,active_fn=lambda:flag[0])
    assert result['reason']=='stale_turn' and 'Caption that' not in result['spoken']


@pytest.mark.parametrize('answer',[None,'',{'unknown':True,'spoken':'guess'}])
def test_unknown_vision_never_fabricates_caption(saved_image,answer):
    hand,mac,shot,raw,receipt,hive=saved_image
    result=hand.run_file(receipt,hive=hive,vision_fn=lambda *a,**k:answer,active_fn=lambda:True)
    assert not result['ok'] and result['reason']=='vision_unavailable'
    assert shot.read_bytes()==raw


def test_oversized_receipt_refused_before_cloud_read(saved_image,monkeypatch):
    hand,mac,shot,raw,receipt,hive=saved_image
    receipt=dict(receipt,size=hand.MAX_BYTES+1)
    reader=Mock();vision=Mock();monkeypatch.setattr(mac,'_run',reader)
    result=hand.run_file(receipt,hive=hive,vision_fn=vision,active_fn=lambda:True)
    assert result['reason']=='file_too_large' and not reader.called and not vision.called


def test_changed_identity_after_bounded_read_refused(saved_image,monkeypatch):
    hand,mac,shot,raw,receipt,hive=saved_image
    wrong=dict(receipt,inode=receipt['inode']+1)
    payload={'before':receipt,'after':wrong,'mime':'image/png','data':base64.b64encode(raw).decode()}
    monkeypatch.setattr(mac,'_run',lambda *a,**k:subprocess.CompletedProcess([],0,json.dumps(payload),''))
    vision=Mock()
    result=hand.run_file(receipt,hive=hive,vision_fn=vision,active_fn=lambda:True)
    assert result['reason']=='file_changed' and not vision.called


def test_reader_uses_current_runtime_and_sanitizes_error_metadata(saved_image,monkeypatch):
    hand,mac,shot,raw,receipt,hive=saved_image
    commands=[]
    def failed(argv,timeout):
        commands.append((argv,timeout))
        return subprocess.CompletedProcess(argv,2,json.dumps({'error':{'stage':'before_fingerprint','type':'PermissionError','mismatch_fields':['inode','secret-path',str(shot)],'detail':'pixels secret'}}),str(shot))
    monkeypatch.setattr(mac,'_run',failed)
    vision=Mock()
    result=hand.run_file(receipt,hive=hive,vision_fn=vision,active_fn=lambda:True)
    assert commands[0][0][:3]==[sys.executable,'-I','-S'] and commands[0][1]==4
    assert result['read_evidence']=={'exitcode':2,'stage':'before_fingerprint','type':'PermissionError','mismatch_fields':['inode']}
    assert not vision.called and str(shot) not in json.dumps(result) and 'pixels secret' not in json.dumps(result)


def test_invalid_reader_diagnostic_cannot_leak_details(saved_image,monkeypatch):
    hand,mac,shot,raw,receipt,hive=saved_image
    monkeypatch.setattr(mac,'_run',lambda *a,**kw:subprocess.CompletedProcess([],9,json.dumps({'error':{'stage':str(shot),'type':'user secret','mismatch_fields':None}}),'pixels secret'))
    result=hand.run_file(receipt,hive=hive,vision_fn=Mock(),active_fn=lambda:True)
    assert result['read_evidence']=={'exitcode':9,'stage':'reader','type':'ReaderError','mismatch_fields':[]}
    assert str(shot) not in json.dumps(result) and 'pixels secret' not in json.dumps(result)
