import importlib.util
import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest import mock

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("jev_preflight", HERE / "jev_preflight.py")
JP = importlib.util.module_from_spec(spec)
spec.loader.exec_module(JP)


class JevPreflightTest(unittest.TestCase):
    def test_off_by_default_writes_nothing(self):
        with tempfile.TemporaryDirectory() as tmp, mock.patch.dict(os.environ, {}, clear=False):
            os.environ.pop(JP.FLAG, None)
            self.assertIsNone(JP.record(Path(tmp), "hi", tool="converse", hard_step=False))
            self.assertFalse((Path(tmp) / "bus" / JP.LOG_NAME).exists())

    def test_route_is_jev_lane_and_not_authoritative(self):
        row = JP.advise("what's on my plate", tool="converse", hard_step=False)
        self.assertEqual(row["lane"], "jev")
        self.assertEqual(row["action"], "ROUTE")
        self.assertFalse(row["authoritative"])

    def test_hard_step_escalates_to_human(self):
        row = JP.advise("send the invoice", tool="refuse_hard_step", hard_step=True)
        self.assertEqual(row["lane"], "human")
        self.assertEqual(row["action"], "ESCALATE")
        self.assertFalse(row["jev_allowed"])

    def test_enabled_appends_one_line_without_utterance_text(self):
        with tempfile.TemporaryDirectory() as tmp, mock.patch.dict(os.environ, {JP.FLAG: "1"}):
            JP.record(Path(tmp), "secret-ish words", tool="converse", hard_step=False)
            lines = (Path(tmp) / "bus" / JP.LOG_NAME).read_text().splitlines()
            self.assertEqual(len(lines), 1)
            self.assertNotIn("secret-ish", lines[0])
            self.assertEqual(json.loads(lines[0])["mode"], "SHADOW")

    def test_broken_judgment_never_raises(self):
        with mock.patch.object(JP, "_judgment", side_effect=RuntimeError("boom")):
            row = JP.advise("x", tool="converse", hard_step=False)
        self.assertEqual(row["action"], "NO_ACTION")


if __name__ == "__main__":
    unittest.main()
