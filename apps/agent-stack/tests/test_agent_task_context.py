"""The real dispatch supplies generation ownership to core agent tasks."""
import sys
from pathlib import Path
from types import SimpleNamespace
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from brain import pipeline as P

def test_stop_reaches_task_and_rejects_stale_progress(tmp_path, monkeypatch):
    gen = P.begin_turn(tmp_path)
    def run(args, *, cancel_check, progress):
        assert not cancel_check()
        progress({"n":1,"what":"model","status":"running"})
        assert P.load_json(tmp_path / "bus/state.json")["agent_task_progress"]["gen"] == gen
        P.cancel_turn(tmp_path)
        assert cancel_check()
        progress({"n":2,"what":"late write","status":"verified"})
        assert "agent_task_progress" not in P.load_json(tmp_path / "bus/state.json")
        return {"ok":False,"verified":False,"cancelled":True,"spoken":"Task cancelled."}
    hand = SimpleNamespace(run=run, log_meta=lambda got:{}, args_from_utterance=lambda u:{})
    monkeypatch.setattr(P, "_agent_tools_hand", lambda:hand)
    got = P._run_tool_inner({"tool":"agent_tools","args":{"op":"code"}},
                            "controlled core task", hive=tmp_path, retrieve_roots=[],gen=gen)
    assert got["cancelled"]
    assert not got["task_verified"]

def test_newer_turn_supersedes_old_task(tmp_path, monkeypatch):
    old = P.begin_turn(tmp_path)
    P.begin_turn(tmp_path)
    def run(args, *, cancel_check, progress):
        assert cancel_check()
        progress({"n":1,"what":"old task","status":"running"})
        return {"ok":False,"verified":False,"cancelled":True,"spoken":"Task cancelled."}
    monkeypatch.setattr(P,"_agent_tools_hand",lambda:SimpleNamespace(run=run,log_meta=lambda got:{},args_from_utterance=lambda u:{}))
    P._run_tool_inner({"tool":"agent_tools","args":{"op":"code"}},"controlled core task",
                     hive=tmp_path,retrieve_roots=[],gen=old)
    assert "agent_task_progress" not in P.load_json(tmp_path/"bus/state.json")
