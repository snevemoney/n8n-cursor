import sys
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0, str(Path(__file__).parent))
import workspace_read as wr
import document_read as dr

def test_explicit_file_with_spaces_outside_default_roots(tmp_path):
    other = tmp_path / 'unrelated'; other.mkdir()
    path = tmp_path / 'My Project Plan.md'; path.write_text('First line\nImportant second line')
    got = wr.run_requested({'op':'read','path':str(other/'invented.md')}, f'read "{path}"', roots=[other])
    assert got['ok'] and got['text'] == path.read_text() and got['path'] == str(path)
    assert not wr.run({'op':'read','path':str(path)}, roots=[other])['ok']

def test_explicit_folder_and_common_folder_alias(tmp_path):
    folder = tmp_path / 'My Folder'; folder.mkdir()
    (folder / 'project.md').write_text('notes')
    got = wr.run_requested({}, f'list the folder "{folder}"', roots=[])
    assert got['ok'] and got['names'] == ['project.md']
    with patch.object(wr.Path, 'home', return_value=tmp_path):
        assert wr.requested_path('read my Documents folder') == tmp_path / 'Documents'

def test_model_argument_alone_cannot_authorize_new_root(tmp_path):
    allowed = tmp_path / 'allowed'; allowed.mkdir()
    path = tmp_path / 'elsewhere.md'; path.write_text('fixture')
    assert not wr.run_requested({'op':'read','path':str(path)}, 'what is the weather', roots=[allowed])['ok']
    assert wr.requested_path(f'do not read {path}') is None
    assert wr.requested_path(f'he said "read {path}"') is None

def test_secret_and_symlink_secret_are_flagged_not_refused(tmp_path):  # Evens 10-16: flag, never stop
    secret = tmp_path / '.env'; secret.write_text('synthetic fixture')
    link = tmp_path / 'ordinary.md'; link.symlink_to(secret)
    for path in (secret,link):
        got = wr.run_requested({}, f'read {path}', roots=[])
        assert got['ok'] and got.get('secret') and 'Heads up' in got['spoken']

def test_missing_is_exact_not_an_unrelated_listing(tmp_path):
    got = wr.run_requested({}, f'read "{tmp_path}/missing file.md"', roots=[tmp_path])
    assert not got['ok'] and 'not found' in got['spoken'] and 'names' not in got

def test_document_bridge_uses_existing_reader_and_reports_limits(tmp_path):
    path = tmp_path / 'book.pdf'; path.write_bytes(b'%PDF synthetic fixture')
    calls=[]
    def runner(server,tool,args):
        calls.append((server,tool,args))
        return {'ok':True,'output':'Extracted chapter'}
    got = dr.read(path,12000,runner)
    assert got['ok'] and got['text'] == 'Extracted chapter' and not got['truncated']
    assert calls == [('markitdown','convert_to_markdown',{'uri':path.as_uri()})]
    assert dr.read(path,12000,lambda *args: {'ok':True,'output':'x'*3000})['truncated']
    assert not dr.read(path,12000,lambda *args: {'ok':False,'spoken':'Connector unavailable'})['ok']

def test_format_read_never_decodes_pdf_bytes(tmp_path):
    path = tmp_path / 'book.pdf'; path.write_bytes(b'%PDF synthetic fixture')
    wr.run_requested({}, f'read {tmp_path}/missing.md', roots=[])
    sys.modules['agent_stack_document_read'] = dr
    with patch.object(dr,'read',return_value={'ok':True,'text':'Actual document text','truncated':False}):
        got = wr.run_requested({}, f'read "{path}"', roots=[])
    assert got['text'] == 'Actual document text' and got['reader'] == 'markitdown'

def test_pipeline_retains_exact_read_text_and_path(tmp_path):
    import importlib.util
    spec = importlib.util.spec_from_file_location('requested_file_pipeline',Path(__file__).parents[1]/'brain/pipeline.py')
    pipe=importlib.util.module_from_spec(spec);sys.modules[spec.name]=pipe;spec.loader.exec_module(pipe)
    path=tmp_path/'My notes.md';path.write_text('Line one\nA conclusion on line two')
    utterance=f'read "{path}"'
    assert pipe.wants_workspace_read(utterance)
    got=pipe._run_tool_inner({'tool':'workspace_read','args':{},'speak':''},utterance,hive=tmp_path/'hive',retrieve_roots=[])
    assert got['workspace_text'] == path.read_text() and got['workspace_path'] == str(path)

def test_token_shaped_text_never_enters_spoken_or_text_receipt(tmp_path):
    path=tmp_path/'notes.md'
    synthetic='noncredential-fixture-value-abcdefghijklmnop'
    path.write_text('TEST_PASSWORD='+synthetic+'\nUseful ordinary note')
    got=wr.run_requested({},f'read "{path}"',roots=[])
    assert got['ok'] and synthetic not in got['spoken'] and synthetic not in got['text']
    assert '[REDACTED TOKEN]' in got['text'] and 'Useful ordinary note' in got['text']

def test_mac_request_discovers_user_documents_instead_of_scanning_repo_first(tmp_path):
    downloads=tmp_path/'Downloads';downloads.mkdir()
    (downloads/'Book.epub').write_text('fixture')
    with patch.object(wr.Path,'home',return_value=tmp_path):
        got=wr.run_requested({},'find all books on my Mac',roots=[])
    assert got['count']==1 and got['files']==[str(downloads/'Book.epub')]
    assert 'your Mac home folder' in got['spoken']
