"""Independent review reproductions. XFAILs are unresolved integration defects, not passes."""
import sys
from pathlib import Path
from unittest.mock import patch
from types import SimpleNamespace

import pytest
from test_methods_route import ASKS, mod

sys.path.insert(0, str(Path(__file__).parents[1] / 'hands'))
import methods_router as router


@pytest.mark.parametrize('ask', [row[1] for row in ASKS])
@pytest.mark.parametrize('wrap', [lambda s: 'Explain what "' + s + '" means',
                                  lambda s: 'Do not execute this: ' + s,
                                  lambda s: '```\n' + s + '\n```',
                                  lambda s: 'Someone said ' + s + ' yesterday'])
def test_quoted_negated_and_code_commands_are_not_routed(ask, wrap):
    assert not router.wants(wrap(ask))


@pytest.mark.parametrize('ask', ['memory recall is hard', 'cheap route for commuters',
                                'graduate high-school', 'vault search is slow',
                                'enable plugin someday'])
def test_ordinary_speech_collisions(ask):
    assert not router.wants(ask)


def test_secret_storage_failure_never_reaches_normal_pipeline(mod):
    marker = 'synthetic withheld input'
    fake_router = SimpleNamespace(wants=lambda _: True, run=lambda _: (_ for _ in ()).throw(OSError('storage unavailable')))
    original = mod.PIPELINE._load
    received = []
    def load(name, path):
        return fake_router if name == 'agent_stack_methods_router' else original(name, path)
    def pipeline(*args, **kwargs):
        received.append((args, kwargs))
        yield {'spoken': 'normal path', 'verb': 'converse', 'partial': False}
    with patch.object(mod.PIPELINE, '_load', side_effect=load), \
         patch.object(mod.PIPELINE, 'apply_pipeline_iter', side_effect=pipeline), \
         patch.object(mod, '_crash_fallback', return_value=None):
        list(mod.apply_turn_iter(marker, hive=mod.HIVE))
    assert not received, 'Original input reached the normal pipeline after interceptor failure'


@pytest.mark.parametrize('ask', ['memory recall project launch', 'vault search kitchen floor',
                                 'graduate daily-2026-10-14', 'enable plugin calendar',
                                 'cheap route for research'])
def test_intended_arguments_are_preserved(ask):
    assert router.wants(ask)


def test_secret_failure_redacts_reflex_and_never_calls_model(mod):
    token = 'sk-' + 'SyntheticTestingToken99999'
    ask = 'here is my key ' + token
    with patch.object(router.mc, 'route_secret', side_effect=OSError(token)), \
         patch.object(mod.PIPELINE, 'apply_pipeline_iter', side_effect=AssertionError('model called')), \
         patch.object(mod, '_crash_fallback', side_effect=AssertionError('fallback called')):
        events = list(mod.apply_turn_iter(ask, hive=mod.HIVE))
    assert events[-1]['execution']['secret'] is True
    assert events[-1]['execution']['ok'] is False
    assert token not in str(events)
    for path in mod.HIVE.rglob('*'):
        if path.is_file():
            assert token not in path.read_text(errors='replace')


@pytest.mark.parametrize('ask', ['memory recall "recall is hard"',
                                 'vault search "search is slow"',
                                 'cheap route for "custom-workload"',
                                 'graduate "meeting-ideas"'])
def test_explicit_free_form_arguments_remain_supported(ask):
    assert router.wants(ask)
