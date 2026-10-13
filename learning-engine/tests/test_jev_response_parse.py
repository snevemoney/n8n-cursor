from __future__ import annotations

import unittest

from learning_engine.stage_c.providers.jev import extract_cost_usd, flagged_from_answers
from learning_engine.stage_c.providers.openai_decisions import (
    extract_cost_usd as openai_cost,
)
from learning_engine.stage_c.providers.openai_decisions import (
    flagged_from_answers as openai_flagged,
)


class ResponseParseTest(unittest.TestCase):
    def test_jev_cost_comes_from_usage_not_an_estimate(self) -> None:
        payload = {
            "answers": {"useful": {"type": "noul", "noul": 0.91}},
            "usage": {"cost": 0.000019992, "input_tokens": 476, "output_tokens": 70},
        }
        self.assertEqual(extract_cost_usd(payload), 0.000019992)
        self.assertTrue(flagged_from_answers(payload)[0])
        self.assertIsNone(extract_cost_usd({"answers": {}, "usage": {}}))

    def test_openai_cost_from_response_fields_only(self) -> None:
        payload = {
            "answers": [{"name": "useful", "type": "predicate", "probability": 0.2}],
            "provider_metadata": {"gateway": {"cost": "0.0000096"}},
        }
        self.assertEqual(openai_cost(payload), 0.0000096)
        flagged, conf = openai_flagged(payload)
        self.assertFalse(flagged)
        self.assertAlmostEqual(conf or 0.0, 0.2)
