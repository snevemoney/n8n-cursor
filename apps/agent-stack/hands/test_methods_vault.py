import sys
import tarfile
from datetime import date, datetime
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent))
import methods_vault as mv  # noqa: E402


@pytest.fixture
def vault(tmp_path):
    (tmp_path / "manual.md").write_text("# Manual\nStart at [[index]]\n")
    (tmp_path / "index.md").write_text("# Index\n- billing invoices: [[billing]]\n- deploy steps: [[deploy]]\n")
    (tmp_path / "billing.md").write_text("---\ntype: decision\nupdated: 2026-10-01\n---\nWe decided to invoice monthly.\n- [ ] send reminders\n")
    (tmp_path / "deploy.md").write_text("---\nupdated: 2020-01-01\n---\nDeploy needs approval. contradicts: [[billing]]\n")
    return tmp_path


def test_search_ranks_relevant_note(vault):
    assert mv.search(vault, "invoice monthly")[0]["note"] == "billing.md"
    with pytest.raises(ValueError):
        mv.search(vault, "!!")


def test_routing_probe_passes_only_through_declared_routes(vault):
    ok = mv.routing_probe(vault, "index", {"where are the billing invoices": "billing", "how do deploy steps work": "deploy"})
    assert ok["ok"] and ok["passed"] == 2
    bad = mv.routing_probe(vault, "index", {"where is payroll": "billing"})
    assert not bad["ok"] and bad["rows"][0]["resolved"] is None


def test_link_is_one_appended_line_and_walk_reads_back(vault):
    (vault / "taxes.md").write_text("tax notes")
    before = (vault / "index.md").read_text()
    r = mv.link(vault, "index", "tax filing", "taxes")
    assert r["added"] and (vault / "index.md").read_text() == before + "- tax filing: [[taxes]]\n"
    assert not mv.link(vault, "index", "tax filing", "taxes")["added"]
    assert mv.walk(vault, "manual", "index", "tax filing please")["chain"] == ["manual", "index", "taxes"]
    assert mv.walk(vault, "manual", "index", "unknown topic")["broke_at"] == "index->target"
    with pytest.raises(ValueError):
        mv.link(vault, "index", "x", "missing")


def test_usefulness_three_tests(vault):
    r = mv.usefulness(vault, "Invoicing is monthly [[billing]]", 5, 2, "invoice monthly")
    assert r["all"]
    assert not mv.usefulness(vault, "no cite", 5, 2, "invoice monthly")["teammate_answer_with_sources"]
    assert not mv.usefulness(vault, "[[ghost]]", 5, 2, "x")["teammate_answer_with_sources"]


def test_daily_compile_flags_stale_and_contradictions(vault):
    r = mv.daily_compile(vault, date(2026, 10, 13))
    assert "deploy.md" in r["stale"] and "billing.md" not in r["stale"]
    assert r["conflicts"] == [("deploy.md", "billing")] and "1 flagged" in r["brief"]


def test_shared_memory_is_agent_neutral_and_blocks_secrets(tmp_path):
    mv.remember(tmp_path, "claude", "Prefs", "Evens prefers short answers")
    mv.remember(tmp_path, "codex", "Prefs", "Use ET time")
    assert len(mv.recall(tmp_path, "prefs")) == 2
    with pytest.raises(ValueError):
        mv.remember(tmp_path, "claude", "prefs", "api_key=abcdefghijklmnop1234")


def test_recap_and_top_automation(vault):
    assert "1 open" in mv.todo_recap(vault)["spoken"]
    top = mv.top_automation([{"task": "weekly report", "times_per_week": 1, "minutes": 40}, {"task": "triage", "times_per_week": 5, "minutes": 10}])
    assert top["top"] == "triage" and top["weekly_minutes"] == 50
    with pytest.raises(ValueError):
        mv.top_automation([])


def test_news_note_needs_sources_and_never_overwrites(tmp_path):
    items = [{"title": "Model X", "url": "https://example.com/a", "line": "faster"}]
    p = mv.news_note(tmp_path, "2026-10-13", items)
    assert mv.ideas_from(Path(p).read_text()) == ["Model X"]
    with pytest.raises(FileExistsError):
        mv.news_note(tmp_path, "2026-10-13", items)
    with pytest.raises(ValueError):
        mv.news_note(tmp_path, "2026-10-14", [{"title": "t", "url": "http://x", "line": "l"}])


def test_backup_cadence_and_verified_backup(vault, tmp_path):
    assert [mv.backup_due(date(2026, 10, 13) - __import__("datetime").timedelta(days=d), date(2026, 10, 13)) for d in (5, 40, 100)] == ["ok", "due-soon", "overdue"]
    r = mv.make_backup(vault, tmp_path / "bk", datetime(2026, 10, 13, 12, 0))
    assert r["files"] == 4 and "billing.md" in tarfile.open(r["path"]).getnames()


def test_vet_skill_repo_gate():
    good = {"license": "MIT", "archived": False, "last_push": "2026-09-01", "pinned_ref": "abc123"}
    assert mv.vet_skill_repo(good)["ok"]
    r = mv.vet_skill_repo({**good, "license": "AGPL-3.0", "pinned_ref": ""})
    assert not r["ok"] and "AGPL is held" in r["problems"]
