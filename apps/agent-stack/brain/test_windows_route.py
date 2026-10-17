"""Window / display / Terminal questions route to the macos_windows hand, not to talk or file search."""
import importlib.util
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("windows_route_pipeline", Path(__file__).with_name("pipeline.py"))
P = importlib.util.module_from_spec(spec)
spec.loader.exec_module(P)


class WindowsRoute(unittest.TestCase):
    def route(self, utterance):
        with tempfile.TemporaryDirectory() as tmp:
            return P.harness_route(utterance, retrieve_roots=[], prior_turns=[], vault_roots=[], hive=Path(tmp))

    def test_routes_to_windows_hand(self):
        fake = {"ok": True, "spoken": "You have 2 displays: DELL P2422H (main); Color LCD.", "wires": ["windows"]}
        open_apps = [{"app": "Cursor", "title": ""}]
        with patch.object(P.MACWIN, "windows", return_value=open_apps), \
                patch.object(P.MACWIN, "run", return_value=fake) as run:
            for u in ("how many displays do I have", "what windows are open", "switch to Cursor"):
                got = self.route(u)
                self.assertIsNotNone(got, u)
                self.assertEqual(got["brain"], "windows", u)
                self.assertIn("displays", got["pick"]["speak"])
            self.assertEqual(run.call_count, 3)

    def test_unrelated_talk_does_not_hit_windows(self):
        with patch.object(P.MACWIN, "run") as run:
            self.route("explain how displays work")
            self.route("open a window of opportunity for the launch")
        run.assert_not_called()


if __name__ == "__main__":
    unittest.main()
