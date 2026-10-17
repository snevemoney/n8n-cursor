"""Live 2026-10-15 09:39 replay: Jarvis said "I do not have a red arrow" and "I cannot open files" although the pointer and
apps hands exist. The model is told what its on-screen and Mac hands do; arrow phrasings reach the pointer."""
import importlib.util
import sys
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("cap_truth_pipeline", HERE / "pipeline.py")
P = importlib.util.module_from_spec(spec)
spec.loader.exec_module(P)
spec2 = importlib.util.spec_from_file_location("cap_truth_pointer", HERE.parent / "hands" / "pointer.py")
PT = importlib.util.module_from_spec(spec2)
sys.modules["cap_truth_pointer"] = PT
spec2.loader.exec_module(PT)


class ModelKnowsItsHands(unittest.TestCase):
    def test_pack_names_arrow_cursor_apps_and_files(self):
        with tempfile.TemporaryDirectory() as t:
            hive = Path(t); (hive / "bus").mkdir()
            pack = P.assemble_pack("Don't you have a red arrow you can use", hive=hive, retrieve_roots=[], turns=[]).lower()
        for phrase in ("red arrow", "blue cursor", "open, quit or switch", "on by", "except secret files"):
            self.assertIn(phrase, pack, phrase)


class ArrowPhrasings(unittest.TestCase):
    def test_arrow_requests_reach_pointer(self):
        for u in ["show me the red arrow on the Safari button", "use your red arrow to show me the share button",
                  "put your red arrow on the send button", "use your arrow to point at the settings icon"]:
            self.assertTrue(PT.wants_pointer(u), u)

    def test_capability_question_is_not_a_point_request(self):
        for u in ["don't you have a red arrow you can use", "what is a red arrow"]:
            self.assertFalse(PT.wants_pointer(u), u)

    def test_ordinary_arrow_speech_is_not_hijacked(self):  # review 2026-10-15
        for u in ["use the arrow to scroll", "use the arrow to select text", "draw an arrow on my slide",
                  "put an arrow at the end of the line", "draw an arrow on the diagram", "place the arrow to the left",
                  "show me an arrow to the right"]:
            self.assertFalse(PT.wants_pointer(u), u)


if __name__ == "__main__":
    unittest.main()
