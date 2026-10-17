"""Re-review 2026-10-15 (N1, N2, N3, N5, M5): grant needs a real command after it; more secret names; open-access
login missions start; 'place your order' refused; research never fetches private/loopback addresses."""
import importlib.util
import os
import sys
import unittest
from pathlib import Path
from unittest import mock

HERE = Path(__file__).resolve().parent


def _load(name, file):
    spec = importlib.util.spec_from_file_location(name, HERE / file)
    mod = importlib.util.module_from_spec(spec)
    sys.modules[name] = mod
    spec.loader.exec_module(mod)
    return mod


PERM = _load("perm_rr", "permissions.py")
W = _load("wr_rr", "workspace_read.py")
B = _load("br_rr", "browser_runtime.py")
WS = _load("ws_rr", "web_search.py")


class GrantNeedsCommand(unittest.TestCase):
    def test_everyday_prefixes_do_not_grant(self):
        for t in ["Permission granted, captain", "permission granted to the finance team to view reports",
                  "I allow you to leave early"]:
            self.assertFalse(PERM.is_grant(t), t)

    def test_owner_grant_plus_command(self):
        self.assertEqual(PERM.grant_split("permission granted, find books about AI"), (True, "find books about AI"))
        self.assertEqual(PERM.grant_split("I allow you to read that folder"), (True, "read that folder"))
        self.assertEqual(PERM.grant_split("permission granted"), (True, ""))


class MoreSecretNames(unittest.TestCase):
    def test_names(self):
        with mock.patch.object(W, "open_access", return_value=True):
            for n in ["service-account.json", "anthropic-key.txt", "firebase-adminsdk-abc.json", "terraform.tfstate",
                      "seed-phrase.txt", "wallet.dat", ".terraformrc", "Keychains", "mnemonic.txt"]:
                self.assertTrue(W._secret_name(n), n)
            for n in ["keynote.pdf", "monkey-business.md", "tokenomics.pdf"]:
                self.assertFalse(W._secret_name(n), n)


class BrowserLoginMissions(unittest.TestCase):
    def test_login_objective_allowed_when_open(self):
        self.assertFalse(B.unsafe_mission_intent("log in to my account and read my invoices", opened=True))
        self.assertTrue(B.unsafe_mission_intent("log in to my account and read my invoices", opened=False))
        self.assertTrue(B.unsafe_mission_intent("post this to X", opened=True))

    def test_place_your_order(self):
        with mock.patch.dict(os.environ, {"JARVIS_OPEN_ACCESS": "1"}):
            self.assertTrue(B.hard().search("Place your order"))


class ResearchFetchIsPublicOnly(unittest.TestCase):
    def test_private_and_non_http_urls_refused(self):
        for u in ["http://127.0.0.1:4018/api/bus", "http://localhost:8080/", "http://169.254.169.254/latest/meta-data",
                  "http://10.0.0.5/", "file:///etc/passwd", "ftp://example.com/x"]:
            self.assertFalse(WS.public_url(u), u)
        with mock.patch.object(WS.socket, "getaddrinfo", return_value=[(2, 1, 6, "", ("93.184.216.34", 0))]):
            self.assertTrue(WS.public_url("https://example.com/page"))


if __name__ == "__main__":
    unittest.main()
