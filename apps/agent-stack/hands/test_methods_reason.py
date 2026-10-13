import sys
from datetime import date, datetime, timedelta
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent))
import methods_reason as mr  # noqa: E402


def test_predict_then_reconcile_scores_once(tmp_path):
    mr.predict(tmp_path, "p1", "Launch ships Friday", 0.8)
    assert mr.reconcile(tmp_path, "p1", True)["brier"] == 0.04
    with pytest.raises(FileExistsError):
        mr.reconcile(tmp_path, "p1", False)
    mr.predict(tmp_path, "p2", "x", 0.9)
    mr.reconcile(tmp_path, "p2", False)
    assert mr.scoreboard(tmp_path) == {"n": 2, "mean_brier": 0.425}
    with pytest.raises(ValueError):
        mr.predict(tmp_path, "p3", "x", 1.5)


def test_permission_modes_and_tier3_always_gated():
    assert mr.permitted("read-only", "read")["allowed"] and not mr.permitted("read-only", "write")["allowed"]
    assert mr.permitted("full", "exec")["allowed"]
    assert not mr.permitted("full", "send")["allowed"]
    with pytest.raises(ValueError):
        mr.permitted("root", "read")


def test_drift_finds_avoided_intentions():
    now = date(2026, 10, 13)
    act = [(date(2026, 10, 1), "worked on the website redesign"), (date(2025, 1, 1), "gym session")]
    r = mr.drift(["finish website redesign", "exercise every morning gym"], act, now)
    assert r["kept"] == ["finish website redesign"] and r["avoided"] == ["exercise every morning gym"]


def test_schedule_check_recommends_not_booking_and_never_books():
    d = datetime(2026, 10, 14, 10, 0)
    cal = [(d, d + timedelta(hours=1))]
    r = mr.schedule_check((d + timedelta(minutes=30), d + timedelta(hours=1)), cal)
    assert r["recommend"] == "do not book" and "overlaps an existing event" in r["reasons"] and r["booked"] is False
    assert mr.schedule_check((d + timedelta(hours=3), d + timedelta(hours=4)), cal)["recommend"] == "ok to propose"
    assert mr.schedule_check((d + timedelta(hours=3), d + timedelta(hours=4)), cal, "Deep work Wednesday")["recommend"] == "do not book"


def test_slash_commands_and_self_extension_needs_approval(tmp_path):
    reg = {"today": "h"}
    assert mr.slash(reg, "/today")["ok"] and not mr.slash(reg, "/ghost")["ok"] and mr.slash(reg, "hello") is None
    prop = mr.propose_command("graduate-ideas", "Promote ideas", tmp_path)
    assert not prop["registered"]
    with pytest.raises(PermissionError):
        mr.register_command(reg, prop, approved=False)
    assert "graduate-ideas" in mr.register_command(reg, prop, approved=True) and "graduate-ideas" not in reg


def test_graduate_promote_append_dismiss(tmp_path):
    (tmp_path / "daily.md").write_text("- idea: Build a hero reel\n- idea: Old thought\n- idea: Extend billing\n- idea: Unsure\n")
    (tmp_path / "billing.md").write_text("billing\n")
    r = mr.graduate(tmp_path, "daily", {"Build a hero reel": "promote", "Old thought": "dismiss", "Extend billing": "append:billing"})
    assert r["pending"] == ["Unsure"] and len(r["actions"]) == 3
    assert "[[daily]]" in (tmp_path / "build-a-hero-reel.md").read_text() and "from [[daily]]" in (tmp_path / "billing.md").read_text()


def test_build_page_escapes_and_does_not_overwrite(tmp_path):
    p = mr.build_page(tmp_path, "leads", "Leads <1>", [["name"], ["<script>x</script>"]])
    text = Path(p).read_text()
    assert "<script>" not in text and "&lt;script&gt;" in text
    with pytest.raises(FileExistsError):
        mr.build_page(tmp_path, "leads", "again", [["a"]])


def test_office_dispatch_is_immutable():
    o = mr.office(["seo", "writer"])
    o2 = mr.dispatch(o, "seo", "audit page")
    assert o["seo"]["inbox"] == [] and o2["seo"]["inbox"] == ["audit page"]
    assert o2["orchestrator"]["steps"] == ["dispatched to seo: audit page"]
    with pytest.raises(ValueError):
        mr.dispatch(o, "nobody", "x")
