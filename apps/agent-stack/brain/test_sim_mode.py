"""JARVIS_SIM=1: acting hands record their decision and touch nothing; read-only hands still run."""
import importlib.util
import os
import unittest
from pathlib import Path
from unittest import mock

spec = importlib.util.spec_from_file_location("agent_stack_pipeline_sim_test", Path(__file__).with_name("pipeline.py"))
P = importlib.util.module_from_spec(spec); spec.loader.exec_module(P)


class Sim(unittest.TestCase):
    def test_acting_hand_is_recorded_not_run(self):
        launched = []
        with mock.patch.dict(os.environ, {"JARVIS_SIM": "1"}), mock.patch.object(P.subprocess, "run", side_effect=lambda *a, **k: launched.append(a)):
            got = P.run_tool({"tool": "operator", "args": {"goal": "render a video"}}, "render a video")
        self.assertTrue(got["simulated"]); self.assertEqual(got["sim_args"], {"goal": "render a video"}); self.assertEqual(launched, [])

    def test_off_by_default(self):
        self.assertFalse(P.simulating())

    def test_read_only_hand_runs(self):
        with mock.patch.dict(os.environ, {"JARVIS_SIM": "1"}):
            got = P.run_tool({"tool": "brain_model", "args": {}}, "which model are you using?", hive=None, retrieve_roots=None)
        self.assertNotIn("simulated", got)


if __name__ == "__main__":
    unittest.main()
