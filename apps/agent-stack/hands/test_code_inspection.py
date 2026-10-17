import hashlib
import importlib.util
import json
from pathlib import Path
import pytest
from hands.test_coding_resume import coding, Crash


@pytest.mark.parametrize('durable',[False,True])
def test_large_existing_source_is_inspected_then_exactly_edited_and_committed(coding,monkeypatch,durable):
    hand, root, args, calls, saved, save, repo = coding
    root.mkdir(parents=True)
    original='# preserved line\n'*2500+'\ndef answer(): return 41\n'
    (root/'library.py').write_text(original)
    (root/'test_library.py').write_text('import unittest\nfrom library import answer\nclass Check(unittest.TestCase):\n def test_answer(self): self.assertEqual(answer(),42)\n')
    responses=[{'read_paths':[{'path':'library.py','start_line':2498,'line_count':10}]},
               {'edits':[{'path':'library.py','old':'def answer(): return 41','new':'def answer(): return 42'}],
                'test_cmd':'python3 -m unittest discover -v','commit_message':'exact inspected repair'}]
    histories=[]
    def model(history,*a):
        histories.append(json.loads(json.dumps(history)))
        return json.dumps(responses.pop(0)),'configured-model'
    monkeypatch.setattr(hand,'llm',model)
    got=hand.run(args,checkpoint=save) if durable else hand.run(args)
    assert got['ok'],got
    assert (root/'library.py').read_text()==original.replace('return 41','return 42')
    receipts=[r['content'] for r in histories[1] if r['content'].startswith('Actual repository inspection results:')]
    assert len(receipts)==1 and 'def answer(): return 41' in receipts[0]
    assert hashlib.sha256(original.encode()).hexdigest() in receipts[0]
    assert calls['writes']==(['.gitignore'] if durable else [])+['library.py'] and calls['commits']==1
    assert hand._git(root,'status','--porcelain').stdout==''


def test_resume_after_inspected_exact_edit_does_not_repeat_read_or_write(coding,monkeypatch):
    hand, root, args, calls, saved, save, repo = coding
    root.mkdir(parents=True);(root/'a.py').write_text('VALUE = 41\n')
    (root/'test_value.py').write_text('import unittest\nfrom a import VALUE\nclass Check(unittest.TestCase):\n def test_value(self): self.assertEqual(VALUE,42)\n')
    monkeypatch.setattr(hand,'llm',lambda *a:(json.dumps({'edits':[{'path':'a.py','old':'41','new':'42'}], 'test_cmd':'python3 -m unittest discover -v'}),'configured-model'))
    def crash(target,op,**kw):
        got=repo(target,op,**kw)
        if op=='write' and kw.get('path')=='a.py':raise Crash()
        return got
    monkeypatch.setattr(hand,'op_repo',crash)
    with pytest.raises(Crash):hand.run(args,checkpoint=save)
    cp=saved[-1];monkeypatch.setattr(hand,'op_repo',repo)
    monkeypatch.setattr(hand,'llm',lambda *a: (_ for _ in ()).throw(AssertionError('unexpected replay')))
    got=hand.run(args,checkpoint=save,resume_checkpoint=cp)
    assert got['ok'],got
    assert calls['writes'].count('a.py')==1 and (root/'a.py').read_text()=='VALUE = 42\n'


def test_unsafe_reads_and_ambiguous_edits_preserve_existing_files(coding,tmp_path):
    hand, root, *_=coding;root.mkdir(parents=True)
    (root/'a.py').write_text('value value\n');(root/'link.py').symlink_to(root/'a.py')
    before=(root/'a.py').read_bytes()
    for name in ('../outside.py','link.py','.env','/etc/passwd'):
        rows=hand._code_reads(root,{'read_paths':[name]})
        assert rows[0].get('error')
    with pytest.raises(hand._CheckpointBlocked):hand._code_files(root,{'edits':[{'path':'a.py','old':'value','new':'other'}]})
    with pytest.raises(hand._CheckpointBlocked):hand._code_reads(root,{'read_paths':['a.py'],'files':{'b.py':'x'}})
    assert (root/'a.py').read_bytes()==before and not (root/'b.py').exists()


def test_stale_exact_edit_and_binary_inspection_rejected(coding):
    hand,root,*_=coding;root.mkdir(parents=True)
    (root/'a.py').write_text('value = 1\n')
    files, hashes=hand._code_files(root,{'edits':[{'path':'a.py','old':'1','new':'2'}]})
    (root/'a.py').write_text('human work\n')
    with pytest.raises(hand._CheckpointBlocked):hand._check_edit_preimage(root,'a.py',hashes['a.py'])
    (root/'binary.py').write_bytes(b'a\x00b')
    assert hand._code_reads(root,{'read_paths':['binary.py']})[0].get('error')
    assert (root/'a.py').read_text()=='human work\n'


def test_inventory_lists_large_source_without_binary_cache_or_symlink(coding):
    hand,root,*_=coding;root.mkdir(parents=True)
    (root/'large.py').write_text('# source\n'*5000)
    cache=root/'__pycache__';cache.mkdir();(cache/'junk.pyc').write_bytes(b'CACHE_BINARY')
    (root/'escape').symlink_to('/etc')
    view=hand._tree(root)
    assert 'large.py (45000 bytes)' in view and 'request read_paths' in view
    assert 'CACHE_BINARY' not in view and 'escape' not in view and len(view)<=6000
