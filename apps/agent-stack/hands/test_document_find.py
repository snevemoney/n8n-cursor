"""Document discovery must produce paths, not an unfiltered folder listing."""
from pathlib import Path
from unittest.mock import patch
import sys
import importlib.util
sys.path.insert(0, str(Path(__file__).parent))
import workspace_read as wr

ASK = "find all the actual books on my mac. all the epub files and pdf's"

def test_observed_ask():
    assert wr.args_from_utterance(ASK) == {'op': 'find', 'extensions': ['.epub', '.pdf'], 'path': ''}

def test_recursive_actual_paths(tmp_path):
    child = tmp_path / 'library'; child.mkdir()
    (child / 'novel.EPUB').write_text('fixture')
    (child / 'article.pdf').write_text('fixture')
    (tmp_path / 'photo.png').write_text('fixture')
    hidden = tmp_path / '.ssh'; hidden.mkdir()
    (hidden / 'private.pdf').write_text('fixture')
    (tmp_path / 'secret.pdf').write_text('fixture')
    (tmp_path / 'shortcut.pdf').symlink_to(child / 'article.pdf')
    got = wr.run({'op': 'find'}, roots=[tmp_path])
    assert got['complete'] and got['count'] == 2
    assert {Path(p).name for p in got['files']} == {'novel.EPUB', 'article.pdf'}
    assert 'not all confirmed books' in got['spoken'] and 'not a whole-Mac' in got['spoken']

def test_no_symlink_escape(tmp_path):
    root = tmp_path / 'allowed'; root.mkdir()
    other = tmp_path / 'private'; other.mkdir()
    (other / 'outside.pdf').write_text('fixture')
    (root / 'linked').symlink_to(other, target_is_directory=True)
    assert wr.run({'op': 'find'}, roots=[root])['files'] == []
    assert not wr.run({'op': 'find', 'path': str(other)}, roots=[root])['ok']

def test_missing_and_budget_are_incomplete(tmp_path):
    assert not wr.run({'op': 'find'}, roots=[tmp_path / 'missing'])['complete']
    (tmp_path / 'one.pdf').write_text('fixture')
    with patch.object(wr, 'FIND_MAX_ENTRIES', 0):
        got = wr.run({'op': 'find'}, roots=[tmp_path])
    assert not got['complete'] and 'incomplete' in got['spoken']

def test_root_overlap_and_extension_validation(tmp_path):
    child = tmp_path / 'child'; child.mkdir()
    (child / 'one.pdf').write_text('fixture')
    (child / 'two.epub').write_text('fixture')
    assert wr.run({'op': 'find', 'extensions': ['.pdf']}, roots=[tmp_path, child])['count'] == 1
    assert not wr.run({'op': 'find', 'extensions': ['.pem']}, roots=[tmp_path])['ok']

def test_actual_pipeline_overrides_guessed_listing(tmp_path):
    spec = importlib.util.spec_from_file_location('document_find_pipeline', Path(__file__).parents[1] / 'brain/pipeline.py')
    pipe = importlib.util.module_from_spec(spec); sys.modules[spec.name] = pipe; spec.loader.exec_module(pipe)
    assert pipe.wants_workspace_read(ASK)
    (tmp_path / 'book.epub').write_text('fixture')
    with patch.dict('os.environ', {'JARVIS_READ_ROOTS': str(tmp_path)}), patch.object(wr.Path, 'home', return_value=tmp_path):
        got = pipe._run_tool_inner({'tool': 'workspace_read', 'args': {'op': 'ls', 'path': str(tmp_path)}, 'speak': ''}, ASK, hive=tmp_path / 'hive', retrieve_roots=[])
    assert got['workspace_complete'] and got['workspace_files'] == [str(tmp_path / 'book.epub')]
    assert 'items:' not in got['spoken']


def test_quoted_and_negated_requests_do_not_trigger_document_search():
    for ask in ["don’t find all books", "do not list my PDFs", 'he said "find all PDFs"', '"find all PDFs" is an example']:
        assert not wr.DOCUMENT_FIND_RE.search(ask)
