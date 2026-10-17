import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent))
import methods_voice as mv  # noqa: E402


def test_side_talk_ignored_until_wake_then_follow_up_then_sleep():
    s, a = mv.hear({}, "so anyway the meeting went long", 100.0)
    assert a["action"] == "ignore" and a["hud"] == "STANDBY" and a["orb"] == "asleep"
    s, a = mv.hear(s, "Hey Jarvis, what's on today", 101.0)
    assert a == {"action": "command", "command": "what's on today", "hud": "LISTENING", "orb": "awake"}
    s, a = mv.hear(s, "and tomorrow", 105.0)
    assert a["action"] == "command"
    s, a = mv.hear(s, "and tomorrow", 101.0 + 5 + 12 + 0.1)
    assert a["action"] == "ignore"
    _, a = mv.hear({}, "hey jarvis", 0)
    assert a["action"] == "wake"


def test_no_reaction_while_speaking_and_hud_states():
    _, a = mv.hear({"awake_until": 1e9}, "hey jarvis stop", 1, speaking=True)
    assert a["action"] == "ignore"
    assert [mv.hud_state(False, False), mv.hud_state(True, False), mv.hud_state(True, True)] == ["STANDBY", "LISTENING", "SPEAKING"]


def test_fixed_capture_truncation_is_flagged():
    assert mv.capture_window(3) == {"captured_sec": 3, "truncated": False}
    assert mv.capture_window(9)["truncated"]


def test_edge_tts_params():
    assert mv.edge_tts_args()[-2:] == ["--rate=-8%", "--pitch=-6Hz"]
    with pytest.raises(ValueError):
        mv.edge_tts_args(rate_pct=90)
    with pytest.raises(ValueError):
        mv.edge_tts_args(voice="x; whoami")


def test_hand_scale_grows_with_openness():
    closed = mv.hand_scale((0, 0), (0.01, 0), (0, 0), (0, 1))
    wide = mv.hand_scale((0, 0), (1.5, 0), (0, 0), (0, 1))
    assert closed["scale"] < wide["scale"] <= 2.0
    with pytest.raises(ValueError):
        mv.hand_scale((0, 0), (1, 0), (0, 0), (0, 0))


def test_desk_view_opens_asks_and_closes_after_answer():
    s, _ = mv.desk_view(None, "toggle")
    s, o = mv.desk_view(s, "ask", frame=b"jpg", question="what is this?")
    assert o["to_model"]["question"] == "what is this?"
    s, o = mv.desk_view(s, "answer", answer="a resistor")
    assert s == "closed" and o["camera"] == "off"
    with pytest.raises(ValueError):
        mv.desk_view("closed", "ask", frame=b"x", question="q")


def test_identify_then_compare_gives_reason_and_next_step():
    specs = {"A": {"ohms": 100, "watts": 0.25}, "B": {"ohms": 100, "watts": 1}}
    r = mv.compare("A", specs, ["ohms", "watts"], want="B")
    assert r["differences"] == [("watts", 0.25, 1)] and "Shall I" in r["spoken"]
    assert not mv.compare("Z", specs, ["ohms"])["ok"]
