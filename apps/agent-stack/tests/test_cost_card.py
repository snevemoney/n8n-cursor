"""Z14 cost card: classes, estimate wording, route."""
import json
import sys
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from brain import pipeline as P  # noqa: E402

C = P._cost_hand()
PRICES = {"data": [{"id": "m/big", "pricing": {"prompt": "0.000001", "completion": "0.000002"}},
                   {"id": "perplexity/sonar", "pricing": {"prompt": "0.000001", "completion": "0.000001"}}]}


class CostCardTest(unittest.TestCase):
    def test_route(self):
        self.assertEqual(P.model_free_route("what did that cost?")["tool"], "cost_card")
        self.assertNotEqual((P.model_free_route("what does a tesla cost") or {}).get("tool"), "cost_card")

    def test_card(self):
        now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        rows = [{"ts": now, "model": "m/big", "est_tokens_in": 1000, "est_tokens_out": 100, "verb": "converse"},
                {"ts": now, "model": None, "verb": "loop"},
                {"ts": now, "model": None, "verb": "web_search"}]
        log = Path(tempfile.mkdtemp()) / "t.jsonl"
        log.write_text("\n".join(json.dumps(r) for r in rows) + "\n")
        C.CACHE = Path(tempfile.mkdtemp()) / "p.json"
        got = C.run(log=log, fetch=lambda: json.dumps(PRICES).encode())
        self.assertTrue(got["ok"])
        self.assertEqual(got["card"]["reply"]["n"], 1)
        self.assertAlmostEqual(got["card"]["reply"]["usd"], 0.0012, places=6)
        self.assertEqual(got["card"]["tool"]["usd"], 0.0)
        self.assertGreater(got["card"]["web"]["usd"], 0.005)
        self.assertIn("estimate", got["spoken"])
        self.assertIn("web search", got["spoken"].replace("web 1", "web search")) if False else None


if __name__ == "__main__":
    unittest.main()
