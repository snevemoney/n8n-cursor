"""Offline real door → project artifacts integration; fail if it calls a model."""
import importlib.util
import json
from pathlib import Path
from unittest.mock import patch


def test_project_commands_use_real_door_without_network_or_live_state(tmp_path, monkeypatch):
    monkeypatch.setenv("AGENT_STACK_DRY_TTS", "1")
    monkeypatch.setenv("JARVIS_TURN_LOG", "off")
    monkeypatch.setenv("JARVIS_ACTION_LOG", "off")
    # Route-local receipts, chat artifacts and bus all use this isolated hive.
    spec = importlib.util.spec_from_file_location("project_route_mouth", Path(__file__).with_name("turn.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    hive = tmp_path / "hive"
    (hive / "bus").mkdir(parents=True)
    with patch.object(mod.PIPELINE, "apply_pipeline_iter", side_effect=AssertionError("project command called a model")):
        created = mod.apply_turn("project launch create: goal: review the brief; done: one reviewed draft", hive=hive)
        assert created["verb"] == "project_methods"
        assert created["execution"]["ok"]
        assert not created["execution"]["task_verified"]
        assert (hive / "project-artifacts" / "launch" / "PROJECT.md").is_file()
        saved = mod.apply_turn("project launch checkpoint: Next step? => Review the criteria", hive=hive)
        assert saved["verb"] == "project_methods"
        resumed = mod.apply_turn("project launch context", hive=hive)
        assert "Review the criteria" in resumed["spoken"]
        malformed = mod.apply_turn("project other create: only a vague wish", hive=hive)
        assert malformed["verb"] == "project_methods" and not malformed["execution"]["ok"]
    state = json.loads((hive / "bus" / "state.json").read_text())
    assert state["execution"]["tool"] == "project_methods"
