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

def test_z52_slots():
    s = _m("slots")
    assert s.ask_for("Jarvis, create a deal and send it to me")["spoken"] == "A deal for whom, sir \u2014 and covering what?"
    assert s.ask_for("Create an invoice for Mike Johnson")["missing"] == ["what"]
    assert s.ask_for("Send an invoice to Mike Johnson for $400 covering the oil change") is None
    assert s.ask_for("What is a deal?") is None

def test_z58_today_recap():
    import importlib.util as u
    sp = u.spec_from_file_location("t_results", H.parent / "memory" / "results.py"); r = u.module_from_spec(sp); sp.loader.exec_module(r)
    rows = [{"hand": "drafts", "ask": "Draft an email to Zubair", "ok": True}, {"hand": "drafts", "ask": "Draft an email to Zubair", "ok": True},
            {"hand": "web_search", "ask": "Search the web: oil change prices", "ok": True}]
    line = r.spoken_today(rows)
    assert "2 distinct jobs" in line and "1 web search" in line and "1 draft" in line
    assert r.wants_results("Jarvis, what did we work on today?")

def test_z56_lapse(tmp_path):
    lp = _m("lapse"); bus = {}
    def mut(h, fn):
        bus.update(fn(bus))
    lp.open_q(bus, topic="calendar", ask="Did I get that right?", pending="The kickoff call booking, Monday at 10, is not on your calendar yet.", now=100)
    assert lp.tick(tmp_path, mutate_fn=mut, now=150) is None
    t = lp.tick(tmp_path, mutate_fn=mut, inbox=tmp_path, now=100 + lp.ttl() + 1)
    assert t == "The calendar question lapsed, sir. The kickoff call booking, Monday at 10, is not on your calendar yet."
    assert bus["inbox"]["items"][-1]["title"].endswith("Question lapsed") and bus["open_q"]["state"] == "lapsed"
    assert lp.tick(tmp_path, mutate_fn=mut, now=10**10) is None  # one line only
    lp.open_q(bus, topic="x", ask="?", pending="p", now=100); lp.answered(bus)
    assert lp.tick(tmp_path, mutate_fn=mut, now=10**10) is None
