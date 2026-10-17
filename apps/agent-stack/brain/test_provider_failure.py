"""Canvas Z35 / provider retry (audit 2026-10-16): an empty paid tank, a refused key and rate limits are said plainly."""
import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location("agent_stack_online_provider_test", Path(__file__).with_name("online.py"))
O = importlib.util.module_from_spec(spec); spec.loader.exec_module(O)


class ProviderFailure(unittest.TestCase):
    def test_classes(self):
        self.assertEqual(O.provider_failure([429, 402, 500]), "credit_empty")
        self.assertEqual(O.provider_failure([401, 403]), "key_refused")
        self.assertEqual(O.provider_failure([429, 429]), "rate_limited")
        self.assertEqual(O.provider_failure([500, 429]), "")
        self.assertEqual(O.provider_failure([]), "")
        self.assertIn("402", O.PROVIDER_LINES["credit_empty"])


if __name__ == "__main__":
    unittest.main()
