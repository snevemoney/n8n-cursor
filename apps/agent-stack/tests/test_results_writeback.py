"""Z11 post-action memory writeback."""
import json
import os
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from brain import pipeline as P  # noqa: E402

R = P._results_mem()


class WritebackTest(unittest.TestCase):
    def setUp(self):
        self.log = Path(tempfile.mkdtemp()) / "r.jsonl"
        os.environ["JARVIS_RESULTS_LOG"] = str(self.log)

    def tearDown(self):
        os.environ.pop("JARVIS_RESULTS_LOG", None)

    def test_producer_written_offer_and_secret_skipped(self):
        self.assertTrue(R.write_back("drafts", "draft an email to Zubair", {"ok": True, "spoken": "Draft email, not sent: hi"}))
        self.assertFalse(R.write_back("drafts", "x", {"ok": True, "spoken": 'Say "confirm" to run it.'}))
        self.assertFalse(R.write_back("web_search", "x", {"ok": True, "spoken": "key sk-abcdefghijklmnop"}))
        self.assertFalse(R.write_back("converse", "x", {"ok": True, "spoken": "chat"}))
        rows = [json.loads(l) for l in self.log.read_text().splitlines()]
        self.assertEqual([r["hand"] for r in rows], ["drafts"])
        self.assertIn("Zubair", rows[0]["ask"])

    def test_status_answer_does_not_create_a_result_note_or_card(self):
        self.assertFalse(R.write_back("pickup", "what still needs finishing on Jarvis", {
            "ok": True, "spoken": "Work remains", "read_only_summary": True}))
        self.assertFalse(self.log.exists())

    def test_run_tool_writes_and_recall_reads(self):
        hive = Path(tempfile.mkdtemp())
        got = P.run_tool({"tool": "multistep"}, "Do these: 1) tell me today's date, 2) what time is it", hive=hive, retrieve_roots=None)
        self.assertTrue(got["ok"])
        self.assertIn("multistep", self.log.read_text())
        self.assertEqual(P.model_free_route("what did you do today?")["tool"], "results_recall")
        self.assertIn("multistep", R.spoken_recent())


if __name__ == "__main__":
    unittest.main()
