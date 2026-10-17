"""Exercise the real mouth door; spies test routing, not task completion."""
import importlib.util
from pathlib import Path
from unittest.mock import patch
import pytest

@pytest.fixture
def mouth(tmp_path, monkeypatch):
    for key in ('JARVIS_TURN_LOG', 'JARVIS_ACTION_LOG'):
        monkeypatch.setenv(key, 'off')
    monkeypatch.setenv('AGENT_STACK_DRY_TTS', '1')
    spec = importlib.util.spec_from_file_location('panel_evidence_mouth', Path(__file__).with_name('turn.py'))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    mod.HIVE = tmp_path / 'hive'
    (mod.HIVE / 'bus').mkdir(parents=True)
    return mod

@pytest.mark.parametrize('ask', [
    'Audit side effects in /tmp/project/hands/plan.py and /tmp/project/hands/mcp_call.py. Inspect both with your tools.',
    'Evaluate src/worker.ts for race conditions.',
    'Assess the document I just opened.',
    'Grade this implementation against the tests.',
    'Rate config.toml for correctness.',
    'Audit ~/.env for errors.',
])
def test_source_questions_reach_normal_pipeline(mouth, ask):
    seen = []
    def pipeline(utterance, **kwargs):
        seen.append(utterance)
        yield {'ok': True, 'spoken': 'Pipeline sentinel', 'verb': 'converse', 'wires': []}
    frontier = mouth.PIPELINE._load('agent_stack_frontier', mouth.PIPELINE.STACK / 'hands/frontier.py')
    original_load = mouth.PIPELINE._load
    def load(name, path):
        return frontier if name == 'agent_stack_frontier' else original_load(name, path)
    with patch.object(mouth.PIPELINE, '_load', side_effect=load), patch.object(frontier, 'panel', return_value={'ok': True, 'tool': 'panel', 'spoken': 'Panel sentinel'}) as panel, patch.object(mouth.PIPELINE, 'apply_pipeline_iter', side_effect=pipeline):
        mouth.apply_turn(ask, hive=mouth.HIVE)
    assert not panel.called
    assert seen == [ask]

@pytest.mark.parametrize('ask', ['Rate my landing-page copy: Save time today.', 'Score this headline: Build a better morning.'])
def test_inline_copy_scoring_stays_on_panel(mouth, ask):
    frontier = mouth.PIPELINE._load('agent_stack_frontier', mouth.PIPELINE.STACK / 'hands/frontier.py')
    original_load = mouth.PIPELINE._load
    def load(name, path):
        return frontier if name == 'agent_stack_frontier' else original_load(name, path)
    with patch.object(mouth.PIPELINE, '_load', side_effect=load), patch.object(frontier, 'panel', return_value={'ok': True, 'tool': 'panel', 'spoken': 'Panel sentinel'}) as panel, patch.object(mouth.PIPELINE, 'apply_pipeline_iter', side_effect=AssertionError('unexpected pipeline')):
        out = mouth.apply_turn(ask, hive=mouth.HIVE)
    panel.assert_called_once_with(ask)
    assert 'Panel sentinel' in out['spoken']
