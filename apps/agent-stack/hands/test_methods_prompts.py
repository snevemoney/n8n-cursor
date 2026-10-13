import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent))
import methods_prompts as mp  # noqa: E402

GOOD = {"age_range": "adult", "build": "slim", "hair_color": "black", "hair_style": "short",
        "eye_color": "brown", "skin_tone": "tan", "outfit": "casual", "expression": "smiling"}


def test_character_form_is_deterministic_and_enumerated():
    a, b = mp.character(GOOD), mp.character(dict(reversed(list(GOOD.items()))))
    assert a["prompt"] == b["prompt"] and a["fingerprint"] == b["fingerprint"]
    with pytest.raises(ValueError):
        mp.character({**GOOD, "hair_color": "neon"})
    with pytest.raises(ValueError):
        mp.character({k: v for k, v in GOOD.items() if k != "build"})


def test_free_generation_counter_never_invents_an_allowance():
    assert mp.character(GOOD)["free_left"] is None
    assert mp.character(GOOD, free_allowance=3, free_used=1)["free_left"] == 2
    assert mp.character(GOOD, free_allowance=3, free_used=5)["needs_paid_generation"]


def test_minimal_edit_prompt_one_change_and_rights_gate():
    assert mp.minimal_edit("the reference", "the jacket is red") == "Keep everything in the reference exactly the same except the jacket is red."
    with pytest.raises(ValueError):
        mp.minimal_edit("ref", "the jacket is red and also the sky")
    with pytest.raises(PermissionError):
        mp.minimal_edit("ref", "swap the face", third_party=True)
    assert mp.minimal_edit("ref", "swap the face", third_party=True, rights_ok=True)


def test_short_answers_and_prepaid_ceiling():
    assert mp.shorten("One. Two. Three.", 2) == "One. Two."
    assert mp.ceiling_gate("4.50", "0.40", "5")["allowed"]
    assert not mp.ceiling_gate("4.80", "0.40", "5")["allowed"]
    with pytest.raises(ValueError):
        mp.ceiling_gate("x", 1, 1)


def test_persona_lint_and_fix():
    assert "filler opener" in mp.persona_lint("Certainly, here is the list.")
    assert "states intention instead of result" in mp.persona_lint("Let me check that for you.")
    assert mp.persona_lint("Done. Three files changed.") == []
    assert mp.persona_fix("Certainly, it is sent.") == "It is sent."


def test_disagreement_must_be_one_line():
    assert mp.persona_lint("I disagree: the date is wrong.") == []
    assert "disagreement longer than one line" in mp.persona_lint("I disagree.\nHere is why at length.")
