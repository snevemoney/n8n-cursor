import importlib.util, time
from pathlib import Path
H = Path(__file__).resolve().parent.parent / "hands"
def _m(n):
    sp = importlib.util.spec_from_file_location("t_" + n, H / f"{n}.py"); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m

def test_z51_dup_guard(tmp_path):
    d = _m("drafts"); day = time.strftime("%Y%m%d")
    for i in range(3):
        (tmp_path / f"{day}-12000{i}-email.md").write_text("Subject: Jarvis Scorecard Complete\n\nHi Zubair, the Jarvis scorecard is complete.\n")
    u = "Draft an email to Zubair saying the Jarvis scorecard is done."
    h = d.duplicates(u, "email", folder=tmp_path); assert len(h) == 3
    line = d.dup_line(u, h); assert "3 times today" in line and "Zubair" in line and "Shall I still draft" in line
    assert d.duplicates("Draft an email to Dana saying the scorecard is done", "email", folder=tmp_path) == []
    assert d.duplicates("Draft an email to Zubair about lunch tomorrow", "email", folder=tmp_path) == []

def test_z54_no_source_line():
    s = _m("screen_see").run({}, hive=None); assert s["spoken"].startswith("The screen was not shared, sir")
    g = _m("screen_see").run({}, hive=Path("/tmp"), grab_fn=lambda h, bounds=None: {"ok": False}); assert g["spoken"].startswith("The screen was not shared, sir")

def test_z60_readback_and_record(tmp_path):
    a = _m("approval")
    u = "Yeah go ahead, book the kickoff call with Dana Monday at 10. If I don't have any conflict put it on my calendar and send me a confirmation via telegram."
    assert a.wants(u) and not a.wants("book the kickoff call Monday at 10")
    got = a.run(u, inbox=tmp_path)
    assert "if there's no conflict" in got["spoken"] and "Monday at 10" in got["spoken"] and "Telegram" in got["spoken"]
    assert got["record"]["what"] == "kickoff call with Dana" and got["sent"] is False
    assert "not executed" in Path(got["cites"][0]).read_text()
