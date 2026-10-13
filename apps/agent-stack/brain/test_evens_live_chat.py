"""Regressions from live Orb chat 2026-10-13 (paraphrased; exact wording stays in the private proof folder)."""
import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import pipeline as P  # noqa: E402


def _pick(u, pending=False):
    return P.live_chat_route(u, pending) or P.model_free_route(u) or {}


def test_go_for_it_takes_a_pending_screen_confirm(tmp_path):
    P.confirm_arm(tmp_path, "screen_see", {}, "what do you see on my screen")
    got = P.confirm_take(tmp_path, "go for it")
    assert got and got["tool"] == "screen_see" and got["args"]["_confirmed"]


def test_allow_it_with_nothing_pending_claims_nothing():
    got = _pick("allow it.", pending=False)
    assert got["tool"] == "say" and "nothing" in got["speak"].lower()


def test_stop_watching_my_screen_is_a_real_handback():
    assert _pick("please stop watching my screen")["tool"] == "handback"


def test_how_much_did_that_cost_reads_the_cost_card():
    assert _pick("how much did it cost")["tool"] == "cost_card"


def test_each_thing_cost_reads_the_cost_card():
    assert _pick("what does every action you take cost")["tool"] == "cost_card"


def test_hand_it_back_is_handback():
    assert _pick("hand it back now")["tool"] == "handback"


def test_click_x_with_no_label_is_honest_and_offers_the_arrow():
    got = _pick("can you click the X to dismiss this")
    assert got["tool"] == "say" and "red arrow" in got["speak"]


def test_click_named_button_goes_to_pointer():
    assert _pick("could you click the settings button")["tool"] == "pointer"


def test_online_research_goes_to_cited_web_search():
    got = _pick("can you do an online research about Acme what is Acme")
    assert got["tool"] == "web_search" and got["args"]["query"].lower().startswith("acme")


def test_cut_off_online_research_still_clarifies():
    assert _pick("online research about").get("tool") != "web_search"


def _run(tool, utterance, hive):
    return P._run_tool_inner({"tool": tool, "args": {}, "speak": ""}, utterance, hive=hive, retrieve_roots=[])


def test_model_screen_see_for_non_screen_ask_is_not_armed(tmp_path):
    for u in ("choose", "never mind that company", "pull up my profile blurbs"):
        got = _run("screen_see", u, tmp_path)
        assert not got.get("awaiting_confirm"), u
        assert not (tmp_path / "bus" / "pending_confirm.json").exists()


def test_model_screen_see_for_screen_ask_still_asks_consent(tmp_path):
    got = _run("screen_see", "what do you see on my screen", tmp_path)
    assert got.get("awaiting_confirm")


def test_pull_up_my_named_thing_does_not_refuse_as_outside_folders(tmp_path):
    got = _run("workspace_read", "can you pull up my posting automations", tmp_path)
    assert "outside the allowed folders" not in str(got.get("spoken") or "")
    assert got.get("tool") == "vault_read"


def test_leading_no_before_a_verb_is_a_correction_not_a_negation():
    assert P.correction_text("no use the server for the drawing app") == "Use the server for the drawing app"
    assert P.correction_text("no, open the notes app") == "Open the notes app"
    assert P.correction_text("no thanks") == "no thanks"
    assert P.correction_text("no I don't want that") == "no I don't want that"


def test_pull_up_my_thing_routes_to_notes():
    assert _pick("can you pull up my posting automations")["tool"] == "vault_read"
    assert _pick("bring up my profile blurbs")["tool"] == "vault_read"
    assert _pick("pull up my screen") .get("tool") != "vault_read"


def test_model_invented_file_read_asks_instead_of_guessing(tmp_path):
    got = P._run_tool_inner({"tool": "workspace_read", "args": {"op": "read", "path": "~/.ssh/config"}, "speak": ""},
                            "choose", hive=tmp_path, retrieve_roots=[])
    assert got["tool"] == "say" and "which file" in got["spoken"].lower()


def test_bare_decide_asks_for_the_options_instead_of_repeating():
    got = _pick("you decide")
    assert got["tool"] == "say" and "options" in got["speak"]
