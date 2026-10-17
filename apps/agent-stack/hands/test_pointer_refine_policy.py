"""Live 2026-10-15 11:26: the first look found 'Help menu' at confidence 1.0, the cheap zoomed second look said
not found, and Jarvis refused to point. The second look tightens the box; it only vetoes an unsure first look."""
import importlib.util
import sys
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location("ptr_refine", Path(__file__).with_name("pointer.py"))
P = importlib.util.module_from_spec(spec)
sys.modules["ptr_refine"] = P
spec.loader.exec_module(P)


class RefinePolicy(unittest.TestCase):
    def test_confirmed_refine_moves_to_tighter_point(self):
        self.assertEqual(P.refined_point((100, 20), {"on_control": True, "x": 104, "y": 21}, 1.0), (104, 21))

    def test_sure_first_look_survives_a_refine_miss(self):
        self.assertEqual(P.refined_point((1105, 1101), {"on_control": False}, 1.0), (1105, 1101))

    def test_unsure_first_look_is_vetoed_by_refine_miss(self):
        self.assertIsNone(P.refined_point((1105, 1101), {"on_control": False}, 0.75))

    def test_no_refine_keeps_first(self):
        self.assertEqual(P.refined_point((5, 6), None, 0.8), (5, 6))


if __name__ == "__main__":
    unittest.main()
