"""Offline independent defect reproductions; strict XFAILs remain release findings."""
import sys
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch
import pytest
sys.path.insert(0, str(Path(__file__).parent))
import methods_config as mc
import methods_reason as mr
import methods_vault as mv
import gws_reads as gr
import fanout
import agent_tools as at


@pytest.mark.xfail(strict=True, reason='Predictable temp path follows existing symlink and truncates target')
def test_secret_temp_symlink_never_modifies_another_file(tmp_path):
    victim = tmp_path / 'unrelated.txt'
    victim.write_text('preserve me')
    (tmp_path / '.env.local.tmp').symlink_to(victim)
    with patch.object(mc, 'find_secret', return_value=('API_KEY', 'noncredential-fixture')):
        mc.route_secret('synthetic withheld input', tmp_path / '.env.local')
    assert victim.read_text() == 'preserve me'


@pytest.mark.xfail(strict=True, reason='Payload approved overrides trusted approved=False')
def test_fanout_payload_cannot_approve_model_authored_snippet():
    ran = []
    def run(args, **_kw):
        return fanout.run(args, snippet_author=lambda _: {'ok': True, 'code': 'pass', 'test': ''},
                          snippet_runner=lambda arg: ran.append(arg) or {'passed': True, 'spoken': 'stub'})
    with patch.object(at, 'PERM', return_value=SimpleNamespace(log_action=lambda *_: None)), \
         patch.object(at, '_load', return_value=SimpleNamespace(run=run)):
        at.op_fanout({'approved': True, 'tasks': [{'kind': 'snippet', 'ask': 'calculate a sum'}]}, approved=False)
    assert not ran


@pytest.mark.parametrize('response', ['{"unexpected":true}', '{"messages":[{"id":"invalid-id"}]}', '[]'])
@pytest.mark.xfail(strict=True, reason='Malformed Sent response becomes clear instead of unknown')
def test_malformed_sent_response_never_authorizes_send(response):
    got = gr.check_sent_duplicate('reader@example.com', 'subject', runner=lambda _: (0, response, ''))
    assert got['status'] == 'unknown'


@pytest.mark.xfail(strict=True, reason='Multiline topic injects more than one index line')
def test_vault_link_appends_exactly_one_routing_line(tmp_path):
    (tmp_path / 'index.md').write_text('original\n')
    (tmp_path / 'target.md').write_text('target')
    mv.link(tmp_path, 'index', 'pricing\n- injected: [[target]]\nextra', 'target')
    assert len((tmp_path / 'index.md').read_text().splitlines()) == 2


@pytest.mark.xfail(strict=True, reason='Invalid graduate decisions disappear from pending despite no action')
def test_invalid_graduation_decision_stays_pending(tmp_path):
    (tmp_path / 'daily.md').write_text('- idea: unfinished\n')
    got = mr.graduate(tmp_path, 'daily', {'unfinished': 'unknown'})
    assert got['pending'] == ['unfinished']
