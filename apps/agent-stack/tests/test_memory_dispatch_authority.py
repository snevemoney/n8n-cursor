"""The actual pipeline dispatch cannot turn a task into durable memory."""
import json
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from brain import pipeline as P

def test_dispatch_rejects_inferred_requirement(tmp_path, monkeypatch):
    store = tmp_path / "private-memory.json"
    monkeypatch.setenv("JARVIS_MEMORY_FILE", str(store))
    got = P._run_tool_inner({"tool":"memory","args":{"op":"remember","text":"Cursor is mandatory forever"}},
                            "Use Cursor for this campaign", hive=tmp_path, retrieve_roots=[])
    assert got["ok"] is False
    assert got["task_verified"] is False
    assert not store.exists()

def test_dispatch_preserves_literal_scope(tmp_path, monkeypatch):
    store = tmp_path / "private-memory.json"
    monkeypatch.setenv("JARVIS_MEMORY_FILE", str(store))
    got = P._run_tool_inner({"tool":"memory","args":{"op":"remember","text":"Cursor is mandatory forever"}},
                            "Remember use Cursor for this campaign", hive=tmp_path, retrieve_roots=[])
    assert got["ok"] is True
    assert json.loads(store.read_text()) == ["use Cursor for this campaign"]

def test_hot_reload_replaces_pre_guard_cached_hand(tmp_path, monkeypatch):
    from types import SimpleNamespace
    monkeypatch.setitem(sys.modules, "agent_stack_memory", SimpleNamespace(run=lambda args: {"ok":True}))
    store = tmp_path / "private-memory.json"
    monkeypatch.setenv("JARVIS_MEMORY_FILE", str(store))
    got = P._run_tool_inner({"tool":"memory","args":{"op":"remember","text":"inferred policy"}},
                            "Continue this handoff", hive=tmp_path, retrieve_roots=[])
    assert got["ok"] is False
    assert not store.exists()
