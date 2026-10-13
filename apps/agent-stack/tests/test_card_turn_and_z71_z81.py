"""Cards bound to turns, Z71 stored-amount override from a private record, Z81 tool heartbeat constant."""
import importlib.util
from pathlib import Path

STACK = Path(__file__).resolve().parents[1]


def _load(name, rel):
    spec = importlib.util.spec_from_file_location(name, STACK / rel)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def test_z71_request_amount_overrides_stored_record(tmp_path, monkeypatch):
    rec = tmp_path / "records"
    rec.mkdir()
    (rec / "lead-mike-johnson.md").write_text("# Lead: Mike Johnson\nStatus: proposal sent\nInvoice amount: $3,400 (AI reputation build)\n")
    monkeypatch.setenv("JARVIS_RECORDS_DIR", str(rec))
    ea = _load("ea_t", "hands/entity_ack.py")
    got = ea.run("Create a new invoice for Mike Johnson for $2,500 for AI reputation build and send him an email",
                 notes=[], drafts=tmp_path / "drafts")
    assert "Found Mike Johnson" in got["spoken"]
    assert "$2,500 overrides the $3,400 on file" in got["spoken"]
    body = Path(got["cites"][0]).read_text()
    assert "$2,500" in body and "$3,400" not in body and got["sent"] is False


def test_lapse_card_is_background():
    lp = _load("lp_t", "hands/lapse.py")
    bus = {"open_q": {"state": "open", "deadline": 0, "ask": "a?", "pending": "b", "topic": "t"}}
    lp.tick(Path("/tmp"), mutate_fn=lambda h, f: f(bus), now=10.0)
    c = bus["inbox"]["items"][-1]
    assert c["background"] is True and c["turn_gen"] is None


def test_pane_binds_cards_to_turn():
    html = (STACK / "face" / "pane.html").read_text()
    assert "Number(c.turn_gen) !== cur" in html and "el.dataset.turnGen" in html


def test_z75_hush_gate_present():
    src = (STACK / "mouth" / "turn.py").read_text()
    assert 'verb="hush", host="local", wires=["hush", "listening"]' in src and "resumed_by" in src


def test_z60_conditional_book_is_an_approval():
    ap = _load("ap_t", "hands/approval.py")
    assert ap.wants("Jarvis, check my schedule and if there's no conflict, book a kickoff call with Dana for Monday at 10, put it on my calendar and confirm it to me via Telegram.")
    assert not ap.wants("Book a kickoff call with Dana for Monday.")


def test_load_keeps_last_good_copy(tmp_path):
    import sys as _s
    _s.path.insert(0, str(STACK / "brain"))
    pl = _load("pl_t", "brain/pipeline.py")
    f = tmp_path / "h.py"
    f.write_text("X = 1\n")
    assert pl._load("t_hand", f).X == 1
    f.write_text("X = (\n")  # mid-edit
    assert pl._load("t_hand", f).X == 1
