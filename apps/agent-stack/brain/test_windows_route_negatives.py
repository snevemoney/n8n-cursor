"""Review 2026-10-15: MACWIN sits early in harness_route, so ordinary phrases must fall through."""
import importlib.util
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "hands"))
from test_macos_windows import WINDOWS  # noqa: E402
from test_macos_windows_scope import HIJACKS  # noqa: E402

spec = importlib.util.spec_from_file_location("windows_route_neg_pipeline", Path(__file__).with_name("pipeline.py"))
P = importlib.util.module_from_spec(spec)
spec.loader.exec_module(P)


class Negatives(unittest.TestCase):
    def test_hijack_phrases_fall_through(self):
        with patch.object(P.MACWIN, "windows", return_value=WINDOWS), patch.object(P.MACWIN, "run") as run:
            for u in HIJACKS:
                with tempfile.TemporaryDirectory() as tmp:
                    got = P.harness_route(u, retrieve_roots=[], prior_turns=[], vault_roots=[], hive=Path(tmp))
                self.assertNotEqual((got or {}).get("brain"), "windows", u)
        run.assert_not_called()


if __name__ == "__main__":
    unittest.main()
