"""Security review 2026-10-15 (H4): a web page in the owner's browser must not drive Jarvis by POSTing to 127.0.0.1."""
import importlib.util
import sys
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location("serve_origin", Path(__file__).with_name("serve.py"))
S = importlib.util.module_from_spec(spec)
sys.modules["serve_origin"] = S
spec.loader.exec_module(S)


class TrustedRequest(unittest.TestCase):
    def test_own_pane_and_local_scripts_allowed(self):
        self.assertTrue(S.trusted_request({"Host": "127.0.0.1:4018", "Origin": "http://127.0.0.1:4018"}, 4018))
        self.assertTrue(S.trusted_request({"Host": "localhost:4018", "Origin": "http://localhost:4018"}, 4018))
        self.assertTrue(S.trusted_request({"Host": "127.0.0.1:4018"}, 4018))  # urllib / curl send no Origin

    def test_cross_site_pages_refused(self):
        for origin in ("https://evil.example", "http://127.0.0.1:8080", "null", "http://localhost:3000"):
            self.assertFalse(S.trusted_request({"Host": "127.0.0.1:4018", "Origin": origin}, 4018), origin)

    def test_dns_rebinding_refused(self):
        self.assertFalse(S.trusted_request({"Host": "attacker.example:4018"}, 4018))
        self.assertFalse(S.trusted_request({"Host": "attacker.example:4018", "Origin": "http://attacker.example:4018"}, 4018))

    def test_other_port_instance(self):
        self.assertTrue(S.trusted_request({"Host": "127.0.0.1:4019", "Origin": "http://127.0.0.1:4019"}, 4019))
        self.assertFalse(S.trusted_request({"Host": "127.0.0.1:4019", "Origin": "http://127.0.0.1:4018"}, 4019))


if __name__ == "__main__":
    unittest.main()
