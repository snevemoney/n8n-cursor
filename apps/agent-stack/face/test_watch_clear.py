"""Z04 'share ends sight': turning watch off clears the frame, the seen app state, the page and the screenshot file."""
import importlib.util
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("senses_clear_t", HERE / "senses.py")
S = importlib.util.module_from_spec(spec); spec.loader.exec_module(S)


class FakeBus:
    def __init__(self, bus): self.bus = bus
    def act_if_current(self, hive, gen, apply, evens=False):
        self.bus = apply(self.bus); return self.bus


class WatchOffClearsSight(unittest.TestCase):
    def test_watch_off_drops_what_was_seen(self):
        hive = Path(tempfile.mkdtemp()); (hive / "bus").mkdir()
        shot = hive / "bus" / "see.jpg"; shot.write_bytes(b"jpg")
        fake = FakeBus({"watch": {"armed": True, "held": True, "frame_id": "f1", "captured_at": "t", "state": {"app": "Terminal"},
                                  "safari": {"url": "file:///private"}, "screen": {"path": str(shot), "bytes": 3}}})
        old = S.BUS_IO; S.BUS_IO = fake
        try:
            got = S.set_watch_arm(False, hive=hive, gen=1)
        finally:
            S.BUS_IO = old
        w = fake.bus["watch"]
        self.assertFalse(got["armed"]); self.assertEqual(got["spoken"], "Watch off.")
        for k in ("frame_id", "captured_at", "state", "safari", "screen"):
            self.assertNotIn(k, w)
        self.assertFalse(shot.exists())

    def test_a_screenshot_outside_the_bus_folder_is_never_deleted(self):
        hive = Path(tempfile.mkdtemp()); (hive / "bus").mkdir()
        outside = Path(tempfile.mkdtemp()) / "keep.jpg"; outside.write_bytes(b"x")
        fake = FakeBus({"watch": {"armed": True, "screen": {"path": str(outside)}}})
        old = S.BUS_IO; S.BUS_IO = fake
        try:
            S.set_watch_arm(False, hive=hive, gen=1)
        finally:
            S.BUS_IO = old
        self.assertTrue(outside.exists())


if __name__ == "__main__":
    unittest.main()
