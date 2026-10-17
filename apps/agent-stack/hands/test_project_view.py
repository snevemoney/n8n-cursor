import sys
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0, str(Path(__file__).parent))
import project_methods as pm
import project_view as pv

def prepared(tmp_path):
    pm.create(tmp_path, 'launch', 'draft a brief', 'one reviewed brief')
    return pm.enqueue(tmp_path, 'launch', 'Launch brief', 'A saved draft.')

def test_receipt_has_actual_draft_and_current_revision(tmp_path):
    row = prepared(tmp_path)
    view = pv.snapshot(pm, tmp_path, 'project launch review queue')
    assert view['items'][0]['body'] == 'A saved draft.'
    assert view['items'][0]['revision'] == 0 and view['complete']
    assert not view['execution_authorized']
    pm.review(tmp_path, 'launch', row['id'], 'edit', replacement='Updated', expected_revision=0)
    assert pv.snapshot(pm, tmp_path, 'project launch review queue')['items'][0]['revision'] == 1

def test_nonreview_commands_do_not_open_panel(tmp_path):
    assert pv.snapshot(pm, tmp_path, 'project launch quote: a;1;1;b;1') is None

def test_unreadable_queue_is_visible_error_not_false_empty(tmp_path):
    prepared(tmp_path)
    with patch.object(pm, 'queue', return_value=[{'id':'untrusted', 'revision':0}]):
        view = pv.snapshot(pm, tmp_path, 'project launch review queue')
    assert view['error'] and not view['complete'] and view['items'] == []

def test_real_turn_persists_view_on_existing_bus(tmp_path):
    import importlib.util
    spec = importlib.util.spec_from_file_location('project_view_turn', Path(__file__).parents[1] / 'mouth/turn.py')
    turn = importlib.util.module_from_spec(spec); sys.modules[spec.name] = turn; spec.loader.exec_module(turn)
    root = tmp_path / 'projects'; prepared(root)
    hive = tmp_path / 'hive'
    with patch.dict('os.environ', {'JARVIS_PROJECT_ROOT': str(root), 'JARVIS_POINTER_OFF':'1', 'JARVIS_TURN_LOG':'off'}):
        got = turn.apply_turn('project launch review queue', hive=hive, retrieve_roots=[])
    import json
    bus = json.loads((hive / 'bus/state.json').read_text())
    assert bus['execution_gen'] == bus['turn_gen']
    assert bus['execution']['project_view']['items'][0]['title'] == 'Launch brief'
    assert not got['execution']['project_view']['execution_authorized']

def test_panel_failure_preserves_committed_draft_without_model_fallback(tmp_path):
    import importlib.util
    spec = importlib.util.spec_from_file_location('project_view_failure_turn', Path(__file__).parents[1] / 'mouth/turn.py')
    turn = importlib.util.module_from_spec(spec); sys.modules[spec.name] = turn; spec.loader.exec_module(turn)
    root = tmp_path / 'projects'; prepared(root)
    original = turn.PIPELINE._load
    def load(name, path):
        if name == 'agent_stack_project_view':
            raise OSError('synthetic panel load error')
        return original(name, path)
    with patch.dict('os.environ', {'JARVIS_PROJECT_ROOT': str(root), 'JARVIS_POINTER_OFF':'1', 'JARVIS_TURN_LOG':'off'}), patch.object(turn.PIPELINE, '_load', side_effect=load), patch.object(turn, '_crash_fallback', side_effect=AssertionError('no fallback allowed')):
        got = turn.apply_turn('project launch draft: Another => New draft', hive=tmp_path / 'hive', retrieve_roots=[])
    assert 'review panel is unavailable' in got['spoken']
    assert any(row['body'] == 'New draft' for row in pm.queue(root, 'launch'))
