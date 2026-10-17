"""Live 2026-10-15: with open access, "find … on my Mac" walked /Volumes (Backup 233 GB, SSD 699 GB, Recovery,
Time Machine snapshots) before the home folder, because '/Volumes' sorts before '/Users', and the 5 s budget ran out
with zero results. Home and allowed folders come first; external drives last; system volumes never."""
import importlib.util
import sys
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location("wr_order", Path(__file__).with_name("workspace_read.py"))
W = importlib.util.module_from_spec(spec)
sys.modules["wr_order"] = W
spec.loader.exec_module(W)


class ScanOrder(unittest.TestCase):
    def test_home_before_volumes(self):
        home = Path("/Users/someone")
        order = W._scan_order([Path("/Volumes"), home, Path("/Users/someone/jarvis-main"), Path("/Users/someone/Downloads")])  # public-guard: allow (made-up test path)
        self.assertEqual(order[-1], Path("/Volumes"))
        self.assertEqual(order[0], Path("/Users/someone/Downloads"))  # public-guard: allow (made-up test path)

    def test_system_volume_dirs_never_walked(self):
        for d in ("com.apple.TimeMachine.localsnapshots", "Recovery", "Backups.backupdb"):  # dot folders are skipped by the walk itself
            self.assertTrue(W._skip_dir(Path("/Volumes"), d), d)
        self.assertFalse(W._skip_dir(Path("/Volumes"), "SSD"))
        self.assertFalse(W._skip_dir(Path("/Users/someone"), "Recovery"))  # only at the /Volumes level


if __name__ == "__main__":
    unittest.main()
