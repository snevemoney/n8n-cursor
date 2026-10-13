import sys, unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from brain import pipeline


class FailedTurnHistoryTests(unittest.TestCase):
    def test_provider_miss_not_replayed(self):
        bus = {"turns": [
            {"user": "Status check: are all your tools ready?", "jarvis": "Sir. UNKNOWN. OpenRouter returned no text. TimeoutError."},
            {"user": "hi", "jarvis": "Sir. Talk wire is dark."},
            {"user": "model?", "jarvis": "Sir. deepseek via OpenRouter."},
        ]}
        turns = pipeline.load_turns(bus)
        self.assertEqual([r["jarvis"] for r in turns], ["", "", "Sir. deepseek via OpenRouter."])
        self.assertEqual(turns[0]["user"], "Status check: are all your tools ready?")


if __name__ == "__main__":
    unittest.main()
