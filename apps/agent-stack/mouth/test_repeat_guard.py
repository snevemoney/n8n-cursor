"""A conversational reply that repeats Jarvis's previous line word for word, to a different ask, is replaced by an honest line.
Evens 2026-10-13: 'I don't care about your Margot' got the previous reply back (converse echo)."""
import importlib.util
import json
from pathlib import Path


def _mod(monkeypatch):
    monkeypatch.setenv("AGENT_STACK_DRY_TTS", "1")
    monkeypatch.setenv("JARVIS_TURN_LOG", "off")
    monkeypatch.setenv("JARVIS_ACTION_LOG", "off")
    spec = importlib.util.spec_from_file_location("repeat_guard_mouth", Path(__file__).with_name("turn.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _hive(tmp_path, spoken, utterance):
    hive = tmp_path / "hive"
    (hive / "bus").mkdir(parents=True)
    (hive / "bus" / "state.json").write_text(json.dumps({"spoken": spoken, "utterance": utterance}))
    return hive


PREV = "Handing the wheel back, sir. It is yours."


def test_verbatim_repeat_to_a_new_ask_is_replaced(tmp_path, monkeypatch):
    mod = _mod(monkeypatch)
    hive = _hive(tmp_path, PREV, "stop I'll take over")
    got = mod.apply_turn("what do you think of lighthouses", hive=hive, talk_fn=lambda *a, **k: PREV)
    assert PREV not in got["spoken"]
    assert "repeat" in got["spoken"].lower()


def test_same_ask_twice_may_repeat(tmp_path, monkeypatch):
    mod = _mod(monkeypatch)
    hive = _hive(tmp_path, PREV, "what is two plus two")
    got = mod.apply_turn("what is two plus two", hive=hive, talk_fn=lambda *a, **k: PREV)
    assert "repeat" not in got["spoken"].lower() or PREV in got["spoken"]


def test_helper_ignores_short_and_different_lines():
    spec = importlib.util.spec_from_file_location("rg_h", Path(__file__).with_name("turn.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    assert not mod._is_repeat("Yes.", "Yes.", "a", "b")
    assert not mod._is_repeat("Four, sir.", PREV, "x", "y")
    assert mod._is_repeat(PREV, PREV.upper(), "x", "y")
