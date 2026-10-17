"""Review 2026-10-15: an unnamed read as the FIRST step still pauses for the owner (no extra model round)."""
import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location("unnamed_first_pipeline", Path(__file__).with_name("pipeline.py"))
P = importlib.util.module_from_spec(spec)
spec.loader.exec_module(P)


class FirstStep(unittest.TestCase):
    def test_unnamed_guard_result_pauses_for_owner(self):
        ran = {"ok": False, "tool": "workspace_read", "unnamed_path": True, "workspace_error": "unnamed path"}
        self.assertEqual(P._hand_loop_pause(ran), "owner_input_required")


if __name__ == "__main__":
    unittest.main()
