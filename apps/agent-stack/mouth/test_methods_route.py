"""In-process turn tests: every wired methods ask reaches methods_router; ordinary asks reach the normal path."""
import importlib.util
from pathlib import Path
from unittest.mock import patch

import pytest

ASKS = [  # (id, utterance, substring expected in the spoken reply)
    ("Z100", "key setup prompt for scout on acme using ACME_API_KEY", "ACME_API_KEY"),
    ("Z104", "character sheet: age_range=adult, build=slim, hair_color=brown, hair_style=short, eye_color=green, skin_tone=tan, outfit=casual, expression=neutral", "nothing generated"),
    ("Z105", "minimal edit of the product photo: make the background white", "Keep everything in the product photo exactly the same except"),
    ("Z106", "setup wizard os macos", "not the next step"),
    ("Z106", "setup wizard mic builtin", "not wired"),
    ("Z109", "provider check stt=local llm=local tts=local", "All three stages run on this machine"),
    ("Z110", "plugin catalog", "Nothing is enabled"),
    ("Z110", "enable plugin remote_control", "Not enabled"),
    ("Z112", "cheap route for summaries", "No route config"),
    ("Z116", "chore pr plan fix typo files a.py,test_a.py tests 3 passed", "Not pushed"),
    ("X07", "voice settings", "Not applied to the live voice"),
    ("X08", "shorten: One. Two. Three.", "One. Two."),
    ("X08", "ceiling check spent 5 next 3 ceiling 6", "Blocked"),
    ("X09", "persona lint: Certainly, I'll look into it.", "filler opener"),
    ("X17", "vault search kitchen", "no agent vault"),
    ("X02", "routing probe where is pricing => pricing-note", "no agent vault"),
    ("X04", "vault link pricing to note pricing-note", "no agent vault"),
    ("X13", "vault daily compile", "no agent vault"),
    ("X23", "predict: the launch ships on time at 70%", "Prediction saved"),
    ("X23", "prediction scoreboard", "scored predictions"),
    ("X25", "build page sales titled Sales: item,qty; pens,3", "written to the methods pages folder"),
    ("X28", "permission check read-only write", "not allow"),
    ("X31", "memory note pricing: keep the floor at the agreed level", "Noted"),
    ("X31", "memory recall pricing", "agreed level"),
    ("X36", "vault todo recap", "no agent vault"),
    ("X36", "top automation: invoices, 3 per week, 20 min; reports, 1 per week, 30 min", "invoices"),
    ("X38", "vault backup due since 2020-01-01", "overdue"),
    ("X38", "vault backup now", "no agent vault"),
    ("X41", "vault commands", "never built"),
    ("X45", "propose command recap: summarise the week", "Not registered"),
    ("X45", "register command recap", "Not registered"),
    ("X46", "graduate daily-2026-10-13", "no agent vault"),
]

ORDINARY = [
    "what's the weather like today", "tell me a joke", "remind me to call mom tomorrow",
    "what is the capital of France", "open the project launch plan", "can you set up a meeting with Sam",
    "I need a new prompt for my character", "please remember to buy milk", "search the web for pasta recipes",
    "write a python function that adds two numbers", "def shorten(text): return text[:10]",
    "https://example.com/vault/search?q=kitchen", "/opt/example/vault/index.md", "git push origin main",
    "quelle heure est-il maintenant", "peux-tu chercher mon fichier dans le coffre", "rappelle-moi d'appeler ma mère",
    "enable the new feature on my phone", "make a plugin for my site", "what is a voice setting on iPhone",
    "predict the weather for tomorrow", "set up the wizard hat for the party", "route me to the airport",
    "character sheet for my D&D game", "link to the article about vaults", "backup my photos please",
    "how do I build a page in Notion", "check the permission on this folder",
]


@pytest.fixture()
def mod(tmp_path, monkeypatch):
    monkeypatch.setenv("AGENT_STACK_DRY_TTS", "1")
    monkeypatch.setenv("JARVIS_TURN_LOG", "off")
    monkeypatch.setenv("JARVIS_ACTION_LOG", "off")
    monkeypatch.setenv("JARVIS_METHODS_ROOT", str(tmp_path / "methods"))
    monkeypatch.delenv("JARVIS_METHODS_VAULT", raising=False)
    monkeypatch.delenv("JARVIS_ROUTE_CFG", raising=False)
    spec = importlib.util.spec_from_file_location("methods_route_mouth", Path(__file__).with_name("turn.py"))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    hive = tmp_path / "hive"
    (hive / "bus").mkdir(parents=True)
    m.HIVE = hive
    return m


def test_every_wired_ask_routes_to_methods_router_without_a_model(mod):
    with patch.object(mod.PIPELINE, "apply_pipeline_iter", side_effect=AssertionError("methods ask called a model")):
        for mid, ask, want in ASKS:
            got = mod.apply_turn(ask, hive=mod.HIVE)
            assert got["verb"] == "methods_router", (mid, ask, got.get("spoken"))
            assert want.lower() in got["spoken"].lower(), (mid, ask, got["spoken"])
            assert got["execution"]["sent"] is False and got["execution"]["task_verified"] is False


def test_vault_asks_work_with_a_vault(mod, tmp_path, monkeypatch):
    vault = tmp_path / "vault"
    vault.mkdir()
    (vault / "index.md").write_text("- pricing: [[pricing-note]]\n")
    (vault / "pricing-note.md").write_text("# pricing\nkitchen floor\n- [ ] email the vendor\n")
    monkeypatch.setenv("JARVIS_METHODS_VAULT", str(vault))
    with patch.object(mod.PIPELINE, "apply_pipeline_iter", side_effect=AssertionError("called a model")):
        s = mod.apply_turn("vault search kitchen", hive=mod.HIVE)
        assert s["verb"] == "methods_router" and "pricing-note.md" in s["spoken"]
        assert "1 of 1" in mod.apply_turn("routing probe where is pricing => pricing-note", hive=mod.HIVE)["spoken"]
        assert "open items" in mod.apply_turn("vault todo recap", hive=mod.HIVE)["spoken"]
        assert "Backed up" in mod.apply_turn("vault backup now", hive=mod.HIVE)["spoken"]


def test_ordinary_asks_still_reach_the_normal_path(mod):
    seen = []

    def fake(*a, **k):
        seen.append(a)
        raise RuntimeError("normal path reached")

    with patch.object(mod.PIPELINE, "apply_pipeline_iter", side_effect=fake):
        for ask in ORDINARY:
            before = len(seen)
            try:
                got = mod.apply_turn(ask, hive=mod.HIVE)
            except RuntimeError:
                got = {}
            assert got.get("verb") != "methods_router", ask
            _ = before


def test_router_wants_is_false_for_ordinary_text_and_errors_are_spoken(mod, tmp_path):
    import sys
    sys.path.insert(0, str(Path(__file__).parents[1] / "hands"))
    import methods_router as r
    assert len(ORDINARY) >= 20 and not [a for a in ORDINARY if r.wants(a)]
    bad = r.run("key setup prompt for scout on acme using lowercase_name")
    assert bad["ok"] is False and "Nothing was changed" in bad["spoken"] and bad["secret"] is False
    assert r.run("persona lint: Fine.")["spoken"].endswith("clean.")
    # a failed import must fall through to the normal turn
    with patch.object(mod.PIPELINE, "_load", side_effect=ImportError("gone")), \
            patch.object(mod.PIPELINE, "apply_pipeline_iter", side_effect=RuntimeError("normal path reached")):
        try:
            got = mod.apply_turn("vault commands", hive=mod.HIVE)
        except RuntimeError as e:
            assert "normal path" in str(e)
        else:
            assert got["verb"] != "methods_router"
