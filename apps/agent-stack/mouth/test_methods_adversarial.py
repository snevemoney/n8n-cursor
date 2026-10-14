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
@pytest.mark.xfail(strict=True, reason='Whole-match free arguments still capture ordinary speech')
def test_ordinary_speech_collisions(ask):
    assert not router.wants(ask)


@pytest.mark.xfail(strict=True, reason='Z99 storage OSError falls through with original utterance')
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
