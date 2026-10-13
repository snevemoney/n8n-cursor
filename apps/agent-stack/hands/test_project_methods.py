import importlib.util
import json
from pathlib import Path

import pytest

spec = importlib.util.spec_from_file_location("project_methods", Path(__file__).with_name("project_methods.py"))
pm = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pm)


@pytest.fixture
def project(tmp_path):
    pm.create(tmp_path, "Launch", "Review the supplied brief", "One reviewed draft")
    return tmp_path


def test_project_contract_preserves_existing_work(project):
    path = project / "launch" / "PROJECT.md"
    before = path.read_bytes()
    with pytest.raises(ValueError, match="already exists"):
        pm.create(project, "Launch", "Different goal", "Overwrite it")
    assert path.read_bytes() == before
    assert all((project / "launch" / p).is_dir() for p in ["Inputs", "Process", "Outputs", "Feedback"])


def test_immutable_intake_dedupes_without_overwriting_provenance(project):
    a = pm.intake(project, "Launch", "The reviewed brief contains three steps", "source-one", topic="brief", quality="source-backed")
    before = Path(a["path"]).read_bytes()
    b = pm.intake(project, "Launch", "The reviewed brief contains three steps", "source-two", topic="brief", quality="source-backed")
    assert b["duplicate"] and b["id"] == a["id"]
    assert Path(a["path"]).read_bytes() == before
    assert json.loads(before)["source"] == "source-one"


def test_compile_grounded_topic_and_read_back(project):
    source = pm.intake(project, "Launch", "Friday is the proposed date", "meeting-notes:12", kind="decision", topic="launch-date", quality="source-backed")
    result = pm.compile_topic(project, "Launch", "launch-date", [source["id"]])
    text = Path(result["path"]).read_text()
    assert "meeting-notes:12" in text and "> Friday is the proposed date" in text
    assert "status: candidate" in text
    with pytest.raises(FileExistsError):
        pm.compile_topic(project, "Launch", "launch-date", [source["id"]])


@pytest.mark.parametrize("quality", ["unverified", "conflicting"])
def test_untrusted_source_cannot_be_promoted_to_fact(project, quality):
    source = pm.intake(project, "Launch", "Unproven statement", "test", topic="date", quality=quality)
    with pytest.raises(ValueError, match="cannot be compiled"):
        pm.compile_topic(project, "Launch", "date", [source["id"]])
    assert not list((project / "launch" / "Outputs").iterdir())


def test_review_edit_redo_approve_is_not_execution_authority(project):
    row = pm.enqueue(project, "Launch", "Launch message", "Draft one", ["brief:12"])
    edited = pm.review(project, "Launch", row["id"], "edit", replacement="Draft two")
    assert edited["state"] == "awaiting-review" and edited["history"][0]["prior_body"] == "Draft one"
    redone = pm.review(project, "Launch", row["id"], "redo", expected_revision=1)
    assert redone["state"] == "revision-requested"
    approved = pm.review(project, "Launch", row["id"], "approve", expected_revision=2)
    assert approved["state"] == "reviewed-approved"
    assert approved["execution_authorized"] is False
    assert len(pm.queue(project, "Launch")[0]["history"]) == 3
    assert len(list((project / "launch" / "Feedback").glob("*.json"))) == 1


def test_reject_preserves_draft_and_stale_revision_cannot_overwrite(project):
    row = pm.enqueue(project, "Launch", "Draft", "Keep this")
    rejected = pm.review(project, "Launch", row["id"], "reject")
    assert rejected["body"] == "Keep this"
    with pytest.raises(ValueError, match="changed"):
        pm.review(project, "Launch", row["id"], "approve")
    assert pm.queue(project, "Launch")[0]["state"] == "reviewed-rejected"


def test_symlink_escape_and_traversal_refused(project, tmp_path):
    outside = tmp_path / "outside"
    outside.mkdir()
    (project / "launch" / "Feedback" / "deadbeefdeadbeef.json").symlink_to(outside / "victim.json")
    with pytest.raises(ValueError, match="symlinks"):
        pm.review(project, "Launch", "deadbeefdeadbeef", "approve")
    with pytest.raises(ValueError):
        pm.child(project, "..", "victim")
    assert not (outside / "victim.json").exists()


def test_secrets_refused_before_persisting(project):
    with pytest.raises(ValueError, match="Secret-looking"):
        pm.intake(project, "Launch", "api_key=" + "z" * 20, "example")
    assert not list((project / "launch" / "Inputs").iterdir())


def test_checkpoints_can_be_read_after_reloading_module(project):
    pm.checkpoint(project, "Launch", "What is done?", "The brief was reviewed")
    files = list((project / "launch" / "Process").glob("answer-*.json"))
    assert len(files) == 1
    assert json.loads(files[0].read_text())["answer"] == "The brief was reviewed"


def test_graph_backlinks_unresolved_and_ambiguous_without_writes(tmp_path):
    (tmp_path / "a.md").write_text("[[b]] [[missing]] [[repeat]]")
    (tmp_path / "b.md").write_text("[[a]]")
    (tmp_path / "orphan.md").write_text("An isolated note")
    for folder in ["one", "two"]:
        (tmp_path / folder).mkdir()
        (tmp_path / folder / "repeat.md").write_text("Same name")
    before = {str(p): p.read_bytes() for p in tmp_path.rglob("*.md")}
    result = pm.graph(tmp_path)
    assert result["backlinks"]["b"] == ["a"]
    assert result["unresolved"] == [{"from": "a", "target": "missing"}]
    assert result["ambiguous"] == [{"from": "a", "target": "repeat"}]
    assert "orphan" in result["orphans"]
    assert before == {str(p): p.read_bytes() for p in tmp_path.rglob("*.md")}


def test_price_quote_is_exact_and_engine_specific():
    one = pm.quote("0.10", 3, model="engine-a", source="provider-catalog:1", ceiling="0.29")
    two = pm.quote("0.04", 3, model="engine-b", source="provider-catalog:2", ceiling="0.29")
    assert one["total"] == "0.30" and not one["within_ceiling"]
    assert two["total"] == "0.12" and two["within_ceiling"]
    assert not one["executed"] and not two["executed"]


@pytest.mark.parametrize("price,count", [("NaN", 1), ("Infinity", 1), ("-1", 1), ("1", 0), ("1", True)])
def test_invalid_quote_never_allows_generation(price, count):
    with pytest.raises(ValueError):
        pm.quote(price, count, model="engine", source="observed", ceiling=2)


def test_audit_requires_discrete_anchors_and_citations():
    with pytest.raises(ValueError):
        pm.anchored_audit({"claim": {"score": 4, "sources": ["x"]}})
    with pytest.raises(ValueError):
        pm.anchored_audit({"claim": {"score": 5}})
    result = pm.anchored_audit({"claim": {"score": 1, "sources": ["capture:1"]}, "missing": {"score": 0}})
    assert result["next_one"] == "missing" and not result["verified"]


def test_command_surface_creates_and_resumes_real_project(tmp_path):
    created = pm.run("Jarvis, project launch create: goal: review the brief; done: one reviewed draft", root=tmp_path)
    assert created["ok"] and Path(created["cites"][0]).is_file()
    saved = pm.run("project launch checkpoint: What is next? => Review the acceptance criteria", root=tmp_path)
    assert saved["ok"]
    resumed = pm.run("project launch context", root=tmp_path)
    assert "Review the acceptance criteria" in resumed["spoken"]
    assert not resumed["task_verified"]
    assert pm.run("project management is difficult", root=tmp_path) is None


def test_command_errors_do_not_invent_success_or_leak_secrets(project):
    result = pm.run("project launch capture: brief; note:1; password=" + "x" * 20, root=project)
    assert not result["ok"] and "x" * 20 not in result["spoken"]
    missing = pm.run("project absent context", root=project)
    assert not missing["ok"] and not missing["sent"]


def test_command_review_has_no_execution_side_effect(project):
    row = pm.enqueue(project, "launch", "Message", "Draft only")
    result = pm.run(f"project launch review {row['id']} approve revision 0", root=project)
    assert result["ok"] and "Nothing was sent" in result["spoken"]
    assert not pm.queue(project, "launch")[0]["execution_authorized"]
