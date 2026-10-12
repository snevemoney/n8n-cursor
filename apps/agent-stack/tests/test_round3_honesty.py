"""Round 3: honest action claims, safe citations, retrieval relevance threshold."""
import importlib.util
import os
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def _load(name: str, rel: str):
    spec = importlib.util.spec_from_file_location(name, ROOT / rel)
    mod = importlib.util.module_from_spec(spec)
    sys.modules[name] = mod
    spec.loader.exec_module(mod)
    return mod


craft = _load("r3_craft", "hands/craft.py")
online = _load("r3_online", "brain/online.py")
turn = _load("r3_turn", "mouth/turn.py")
sc = _load("r3_shared", "brain/shared_context.py")


class HonestClaims(unittest.TestCase):
    def test_gridcraft_now_open_without_open_tool_is_dropped(self):
        steps = [{"tool": "save_workbook", "ok": True, "observed": True}]
        out = craft.honest_claim("Saved the sheet. It is now open in GridCraft.", steps, "GridCraft")
        self.assertNotIn("now open", out)
        self.assertIn("Saved the sheet.", out)
        self.assertIn("not claiming", out)

    def test_live_4018_gridcraft_reply_keeps_true_clause(self):
        live = ('Sir. I\'ve created a new workbook with "Proof" in cell A1 and "1" in cell B1, saved it as '
                'jarvis-proof-20261011.xlsx, and it\'s now open in GridCraft showing the workbook with 2 cells populated.')
        steps = [{"tool": "new_workbook", "ok": True}, {"tool": "set_cells", "ok": True}, {"tool": "save_workbook", "ok": True}]
        out = craft.honest_claim(live, steps, "GridCraft")
        self.assertNotIn("now open", out)
        self.assertIn("saved it as jarvis-proof-20261011.xlsx", out)

    def test_open_claim_kept_when_open_tool_succeeded(self):
        steps = [{"tool": "open_workbook", "ok": True, "observed": True}]
        text = "It is now open in GridCraft."
        self.assertEqual(craft.honest_claim(text, steps, "GridCraft"), text)

    def test_failed_open_tool_is_not_proof(self):
        steps = [{"tool": "open_workbook", "ok": False}]
        self.assertNotIn("now open", craft.honest_claim("It is now open in GridCraft.", steps, "GridCraft"))

    def test_talk_reply_cannot_claim_it_opened_or_sent(self):
        out = online.unverified_claim("Save it under ~/Documents/ArtCraft. Your project is now open in GridCraft.")
        self.assertNotIn("now open", out)
        self.assertIn("~/Documents/ArtCraft", out)
        out = online.unverified_claim("I've sent the email to Evens.")
        self.assertNotIn("sent the email", out)
        self.assertIn("no tool ran", out)

    def test_instructions_are_not_claims(self):
        text = "Open it in ArtCraft with File, Open."
        self.assertEqual(online.unverified_claim(text), text)


class SafeCites(unittest.TestCase):
    def test_no_absolute_paths_in_turn_cites(self):
        home = os.path.expanduser("~")
        cites = [
            {"path": f"{home}/Documents/Vault/note.md", "abs": f"{home}/Documents/Vault/note.md", "title": "n"},
            {"file": "/opt/private/x/AGENT_RULES.md"},
            f"{home}/brain/JARVIS_CONTEXT.md",
            {"file": "MAC_SHARED_MEMORY.md", "heading": "ArtCraft"},
        ]
        out = turn.safe_cites(cites)
        self.assertEqual(out[0], {"path": "~/Documents/Vault/note.md", "title": "n"})
        self.assertEqual(out[1], {"file": "AGENT_RULES.md"})
        self.assertEqual(out[2], "~/brain/JARVIS_CONTEXT.md")
        self.assertEqual(out[3], {"file": "MAC_SHARED_MEMORY.md", "heading": "ArtCraft"})
        self.assertNotIn(home, repr(out))

    def test_turn_event_uses_safe_cites(self):
        src = (ROOT / "mouth/turn.py").read_text()
        self.assertNotIn('"cites": cites or []', src)


class RetrievalThreshold(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        d = Path(self.tmp.name)
        (d / "MAC_SHARED_MEMORY.md").write_text(
            "# Mac\n## The fleet (platforms)\n- Jarvis runs a model via OpenRouter on the Mac.\n"
            "## Operating frame\n- Model routing: running cheap models first.\n"
            "## ArtCraft\n- Save ArtCraft projects in ~/Documents/ArtCraft and open them from the app.\n"
        )
        self.old = {k: os.environ.get(k) for k in ("JARVIS_SHARED_DIR", "JARVIS_SHARED_CONTEXT")}
        os.environ["JARVIS_SHARED_DIR"] = str(d)
        os.environ.pop("JARVIS_SHARED_CONTEXT", None)

    def tearDown(self):
        for k, v in self.old.items():
            if v is None:
                os.environ.pop(k, None)
            else:
                os.environ[k] = v
        self.tmp.cleanup()

    def test_model_question_pulls_nothing(self):
        self.assertEqual(sc.retrieve_entries("What model are you running on right now?"), [])
        self.assertEqual(sc.retrieve_entries("Who are you?"), [])

    def test_one_shared_word_is_below_threshold(self):
        self.assertEqual(sc.retrieve_entries("Which fleet desk handles invoices and payroll today?"), [])

    def test_artcraft_still_retrieved(self):
        rows = sc.retrieve_entries("Where should I save an ArtCraft project and how do I open it?")
        self.assertTrue(rows)
        self.assertIn("ArtCraft", rows[0]["heading"])


if __name__ == "__main__":
    unittest.main()
