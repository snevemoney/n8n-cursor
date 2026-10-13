"""cap27 honesty: 'what did that last answer cost' quotes OpenRouter's metered usage or says it has none. No invented $."""
import importlib.util, json, re
from pathlib import Path
_s = importlib.util.spec_from_file_location("cc_last", Path(__file__).with_name("cost_card.py"))
C = importlib.util.module_from_spec(_s); _s.loader.exec_module(C)


def _log(tmp_path, rows):
    p = tmp_path / "t.jsonl"; p.write_text("\n".join(json.dumps(r) for r in rows) + "\n"); return p


def test_metered_cost_is_quoted_exactly(tmp_path):
    log = _log(tmp_path, [{"ts": "2026-10-13T20:00:00Z", "verb": "converse", "model": "deepseek/deepseek-chat-v3.1",
                           "usage_cost_usd": 0.0001234, "usage_tokens_in": 1500, "usage_tokens_out": 9}])
    got = C.run("What did that last answer cost?", log=log, fetch=lambda: b'{"data": []}')
    assert "$0.0001234" in got["spoken"] and "1500" in got["spoken"] and got["metered"]


def test_unmetered_turn_gives_no_number(tmp_path):
    log = _log(tmp_path, [{"ts": "x", "verb": "converse", "model": "m", "est_tokens_in": 900, "est_tokens_out": 9}])
    got = C.run("What did that last answer cost?", log=log, fetch=lambda: b'{"data": []}')
    assert not re.search(r"\$\s?\d|\d+\s+tokens", got["spoken"]) and "won't guess" in got["spoken"]


def test_tool_turn_is_free_and_cost_rows_are_skipped(tmp_path):
    log = _log(tmp_path, [{"ts": "a", "verb": "drafts", "model": None, "tools": ["drafts"]},
                          {"ts": "b", "verb": "cost_card", "model": None, "tools": ["cost_card"]}])
    got = C.run("how much did that cost", log=log, fetch=lambda: b'{"data": []}')
    assert "cost nothing" in got["spoken"] and "drafts" in got["spoken"]
