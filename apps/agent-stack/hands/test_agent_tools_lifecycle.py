"""Cancellation fences for coding/task operations; no models or real commits."""
import importlib.util
import json
from pathlib import Path

import pytest


@pytest.fixture
def hand(monkeypatch, tmp_path):
    spec = importlib.util.spec_from_file_location("lifecycle_hand", Path(__file__).with_name("agent_tools.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    monkeypatch.setattr(mod, "rank_skills", lambda *a: [])
    calls = []
    def repo(target, action, **kw):
        calls.append(action)
        root = Path(target)
        if action == "init":
            root.mkdir(exist_ok=True)
        if action == "write":
            (root / kw["path"]).write_text(kw["content"])
        return {"ok": True, "verified": True, "spoken": action, "output": "test fixture passed"}
    monkeypatch.setattr(mod, "op_repo", repo)
    monkeypatch.setattr(mod, "llm", lambda *a: (json.dumps({"files": {"answer.py": "ANSWER = 43"}}), "configured-model"))
    return mod, calls, tmp_path / "scratch"


def test_cancel_before_init_has_no_mutations(hand):
    mod, calls, root = hand
    got = mod.op_code(str(root), "build", cancel_check=lambda: True)
    assert got["cancelled"] and not got["verified"]
    assert not calls and not root.exists()


def test_model_return_after_stop_cannot_write_or_commit(hand, monkeypatch):
    mod, calls, root = hand
    stopped = [False]
    def model(*a):
        stopped[0] = True
        return json.dumps({"files": {"late.py": "late mutation"}}), "configured-model"
    monkeypatch.setattr(mod, "llm", model)
    got = mod.run({"steps": [{"op": "code", "repo": str(root), "goal": "build"}]}, cancel_check=lambda: stopped[0])
    assert got["status"] == "CANCELLED" and not got["ok"] and not got["verified"]
    assert calls == ["init", "branch"]
    assert not (root / "late.py").exists()


def test_stop_after_test_prevents_commit(hand):
    mod, calls, root = hand
    stopped = [False]
    rows = []
    def progress(row):
        rows.append(row)
        if row["what"] == "iter 1 test" and row["status"] == "verified":
            stopped[0] = True
    got = mod.op_code(str(root), "build", cancel_check=lambda: stopped[0], progress=progress)
    assert got["cancelled"] and "commit" not in calls
    assert (root / "answer.py").exists()
    assert rows[-1]["what"] == "iter 1 test"


def test_stop_after_first_write_prevents_remaining_writes(hand, monkeypatch):
    mod, calls, root = hand
    stopped = [False]
    monkeypatch.setattr(mod, "llm", lambda *a: (json.dumps({"files": {"first.py": "first", "second.py": "second"}}), "configured-model"))
    def progress(row):
        if row["what"] == "iter 1 write first.py" and row["status"] == "verified":
            stopped[0] = True
    got = mod.op_code(str(root), "build", cancel_check=lambda: stopped[0], progress=progress)
    assert got["cancelled"]
    assert (root / "first.py").exists() and not (root / "second.py").exists()
    assert calls == ["init", "branch", "write"]


def test_default_code_flow_preserved_and_progress_structured(hand):
    mod, calls, root = hand
    rows = []
    got = mod.run({"steps": [{"op": "code", "repo": str(root), "goal": "build"}]}, progress=rows.append)
    assert got["ok"] and got["verified"]
    assert calls == ["init", "branch", "write", "test", "commit"]
    assert (root / "answer.py").read_text() == "ANSWER = 43"
    assert rows and all({"n", "what", "status"} <= row.keys() for row in rows)


def test_task_loop_stops_before_next_operation(hand, monkeypatch):
    mod, calls, root = hand
    stopped = [False]
    fired = []
    def cli(argv, cwd=None, **kw):  # op_cli takes approved= since the open-access CLI policy
        fired.append(argv)
        stopped[0] = True
        return {"ok": True, "verified": True, "spoken": "observed"}
    monkeypatch.setattr(mod, "op_cli", cli)
    got = mod.run({"steps": [{"op": "cli", "argv": ["first"]}, {"op": "cli", "argv": ["second"]}]}, cancel_check=lambda: stopped[0])
    assert got["cancelled"] and fired == [["first"]]


def test_cancellation_check_error_fails_closed(hand):
    mod, calls, root = hand
    def broken():
        raise OSError("control unavailable")
    assert mod.op_code(str(root), "build", cancel_check=broken)["cancelled"]
    assert not calls
