"""Dry-run drafts (probe/eval use): draft text comes back, no file is saved, the duplicate guard is skipped."""
import importlib.util
from pathlib import Path

spec = importlib.util.spec_from_file_location("drafts_dry_t", Path(__file__).with_name("drafts.py"))
D = importlib.util.module_from_spec(spec); spec.loader.exec_module(D)


def test_dry_run_saves_nothing_and_skips_dup_guard(tmp_path, monkeypatch):
    monkeypatch.setenv("JARVIS_DRAFTS_DIR", str(tmp_path))
    (tmp_path / "20990101-000000-email.md").write_text("Subject: x\nhi zubair the report is done\n")
    monkeypatch.setattr(D, "duplicates", lambda *a, **k: (_ for _ in ()).throw(AssertionError("dup guard ran")))
    got = D.run("Dry run: draft an email to Zubair saying the report is done.", chat=lambda *a, **k: "Subject: Done\nHi Zubair, done.")
    assert got["dry_run"] and got["sent"] is False and got["file"] is None
    assert "not sent" in got["spoken"] and "Zubair" in got["spoken"]
    assert sorted(p.name for p in tmp_path.iterdir()) == ["20990101-000000-email.md"]


def test_plain_draft_is_not_dry():
    assert not D.is_dry("Draft an email to Zubair saying the report is done.")
