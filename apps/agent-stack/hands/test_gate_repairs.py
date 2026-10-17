"""Offline gate regression checks; synthetic fixtures, no account or credential calls."""
import json
import stat
import sys
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

import pytest

sys.path.insert(0, str(Path(__file__).parent))
import agent_tools as at
import gws_reads as gr
import methods_config as mc


def test_secret_temp_collision_preserves_target_and_private_permissions(tmp_path):
    victim = tmp_path / 'unrelated'
    victim.write_text('untouched')
    (tmp_path / '.env.local.tmp').symlink_to(victim)
    dest = tmp_path / '.env.local'
    with patch.object(mc, 'find_secret', return_value=('TEST_KEY', 'synthetic-fixture')):
        got = mc.route_secret('withheld synthetic input', dest)
    assert got['stored'] is True
    assert victim.read_text() == 'untouched'
    assert stat.S_IMODE(dest.stat().st_mode) == 0o600
    assert not list(tmp_path.glob('.env.local.*.tmp'))


@pytest.mark.parametrize('trusted,payload,expected', [(False, True, False), (True, False, True), (False, 'yes', False)])
def test_fanout_approval_is_trusted_caller_only(trusted, payload, expected):
    captured = []
    with patch.object(at, 'PERM', return_value=SimpleNamespace(log_action=lambda *_: None)), \
         patch.object(at, '_load', return_value=SimpleNamespace(run=lambda args, **kw: captured.append(args) or {})):
        at.op_fanout({'approved': payload, 'tasks': []}, approved=trusted)
    assert captured[0]['approved'] is expected


@pytest.mark.parametrize('data', [None, [], [None], {'messages': None}, {'messages': {}},
    {'messages': [None]}, {'messages': [{'id': 'invalid-id'}]}, {'unexpected': True},
    {'resultSizeEstimate': False}, {'messages': [], 'resultSizeEstimate': False},
    {'messages': [], 'nextPageToken': 1}, {'messages': [], 'nextPageToken': 'next'},
    {'messages': [], 'resultSizeEstimate': 2}, [{'messages': []}, {'unexpected': True}]])
def test_sent_malformed_or_incomplete_is_unknown(data):
    got = gr.check_sent_duplicate('reader@example.com', 'subject', runner=lambda _: (0, json.dumps(data), ''))
    assert got['status'] == 'unknown'


@pytest.mark.parametrize('data', [{'messages': []}, {'resultSizeEstimate': 0}, [{'messages': []}, {'resultSizeEstimate': 0}]])
def test_sent_explicit_empty_still_supports_duplicate_clear(data):
    got = gr.check_sent_duplicate('reader@example.com', 'subject', runner=lambda _: (0, json.dumps(data), ''))
    assert got['status'] == 'clear'
