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
    monkeypatch.setenv("JARVIS_PROJECT_ROOT", str(hive / "project-artifacts"))
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
        for command in [
            "project launch draft: Payment message => Draft only: do not send or pay",
            "project launch board",
            "project launch stage outline generating revision 0: job:1 started",
            "project launch quote: engine; 0.10; 2; catalog:1; 0.30",
            "project launch graph",
            "project launch lint",
            "project launch close day: Drafted the payment message; nothing sent",
        ]:
            result = mod.apply_turn(command, hive=hive)
            assert result["verb"] == "project_methods", command
            assert result["execution"]["ok"], result["spoken"]
            assert not result["execution"]["sent"]
        item = json.loads(next((hive / "project-artifacts" / "launch" / "Feedback").glob("*.json")).read_text())
        reviewed = mod.apply_turn(f"project launch review {item['id']} approve revision 0", hive=hive)
        assert reviewed["execution"]["ok"] and not reviewed["execution"]["sent"]
        malformed = mod.apply_turn("project other create: only a vague wish", hive=hive)
        assert malformed["verb"] == "project_methods" and not malformed["execution"]["ok"]
    state = json.loads((hive / "bus" / "state.json").read_text())
    assert state["execution"]["tool"] == "project_methods"
