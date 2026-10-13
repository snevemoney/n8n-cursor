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


@pytest.mark.parametrize("prefix", ["ghp_", "github_pat_", "xai-", "refresh_token=", "client_secret=", "Bearer "])
def test_credential_formats_are_rejected_in_sources_and_price_provenance(project, prefix):
    fake = prefix + "exampleCredentialMarker0123456789"
    with pytest.raises(ValueError, match="Secret-looking"):
        pm.intake(project, "launch", fake, "fixture")
    out = pm.run("project launch quote: fixture; 0.10; 1; " + fake + "; 1", root=project)
    assert not out["ok"] and fake not in out["spoken"]
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


def test_complete_capture_review_compile_and_draft_workflow(project):
    captured = pm.run("project launch capture: brief; meeting:12; Launch date is Friday", root=project)
    raw = Path(captured["cites"][0])
    original = raw.read_bytes()
    ident = raw.stem
    assert not pm.run(f"project launch compile: brief: {ident}", root=project)["ok"]
    assessed = pm.run(f"project launch source review {ident} source-backed: meeting:12 confirms the stated date", root=project)
    assert assessed["ok"] and raw.read_bytes() == original
    compiled = pm.run(f"project launch compile: brief: {ident}", root=project)
    assert compiled["ok"] and "meeting:12" in Path(compiled["cites"][0]).read_text()
    draft = pm.run("project launch draft: Announcement => Friday is proposed", root=project)
    assert draft["ok"]
    queue = pm.queue(project, "launch")
    result = pm.run(f"project launch review {queue[0]['id']} approve revision 0", root=project)
    assert result["ok"] and not pm.queue(project, "launch")[0]["execution_authorized"]


def test_source_review_detects_tampering_and_conflict(project):
    row = pm.intake(project, "launch", "Original source", "record:1", topic="brief")
    raw = Path(row["path"])
    pm.source_review(project, "launch", row["id"], "conflicting", "record:2 disagrees")
    with pytest.raises(ValueError, match="conflicting"):
        pm.compile_topic(project, "launch", "brief", [row["id"]])
    data = json.loads(raw.read_text())
    data["text"] = "Replaced statement"
    raw.write_text(json.dumps(data))
    with pytest.raises(ValueError, match="contents"):
        pm.source_review(project, "launch", row["id"], "source-backed", "record:1")


def test_graph_refuses_symlink_root(tmp_path):
    real = tmp_path / "real"
    real.mkdir()
    link = tmp_path / "link"
    link.symlink_to(real, target_is_directory=True)
    with pytest.raises(ValueError, match="symlinks"):
        pm.graph(link)


def test_stage_board_preserves_history_and_proposes_without_booking(project):
    first = pm.run("project launch stage video generating revision 0: job:1 started", root=project)
    assert first["ok"] and "In the kitchen" in first["spoken"]
    stale = pm.run("project launch stage video complete revision 0: export:1", root=project)
    assert not stale["ok"]
    scheduled = pm.run("project launch stage video scheduled revision 1 at 2026-10-15T09:00:00-04:00: export:1 reviewed", root=project)
    assert scheduled["ok"] and "not booked" in scheduled["spoken"]
    row = pm.board(project, "launch")[0]
    assert row["history"][-1]["state"] == "generating" and not row["booked"]
    assert "Schedule proposed" in pm.run("project launch board", root=project)["spoken"]


def test_scheduling_requires_explicit_time_zone(project):
    out = pm.run("project launch stage video scheduled revision 0 at 2026-10-15T09:00:00: export:1", root=project)
    assert not out["ok"] and not pm.board(project, "launch")


def test_quote_command_changes_with_model_and_does_not_spend(project):
    one = pm.run("project launch quote: engine-a; 0.10; 3; catalog:1; 0.29", root=project)
    two = pm.run("project launch quote: engine-b; 0.04; 3; catalog:2; 0.29", root=project)
    assert one["ok"] and not one["quote"]["within_ceiling"]
    assert two["ok"] and two["quote"]["within_ceiling"]
    bad = pm.run("project launch quote: engine-b; nonsense; 3; catalog:2; 0.29", root=project)
    assert not bad["ok"] and not two["quote"]["executed"]


def test_lint_reports_explicit_conflicts_stale_inputs_and_unresolved_links(project):
    from datetime import datetime, timezone, timedelta
    row = pm.intake(project, "launch", "The delivery date conflicts with the contract", "contract:12", topic="brief", quality="conflicting")
    future = datetime.now(timezone.utc) + timedelta(days=15)
    (project / "launch" / "Outputs" / "brief.md").write_text("[[missing-topic]] #delivery")
    report = pm.knowledge_report(project, "launch", now=future)
    assert report["explicit_conflicts"][0]["source"] == row["id"]
    assert report["stale"][0]["source"] == row["id"]
    assert report["graph"]["unresolved"][0]["target"] == "missing-topic"
    assert report["graph"]["tags"]["brief"] == ["delivery"]
    assert not report["semantic_contradictions_checked"]
    assert "Semantic contradictions have not been checked" in pm.run("project launch lint", root=project)["spoken"]


def test_daily_summary_is_one_per_agent_day_and_preserves_original(project):
    first = pm.run("project launch close day: Reviewed the brief; waiting on the owner", root=project)
    before = Path(first["cites"][0]).read_bytes()
    second = pm.run("project launch close day: Replace the summary", root=project)
    assert first["ok"] and second["ok"] and "preserved" in second["spoken"]
    assert Path(second["cites"][0]).read_bytes() == before
    assert len(list((project / "launch" / "Process").glob("daily-*.md"))) == 1
