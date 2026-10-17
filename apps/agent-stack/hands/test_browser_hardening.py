"""Security review 2026-10-15 (H6): open access lets browser missions read any public site and log in; it never lets
them post, buy, submit, accept, transfer or remove."""
import importlib.util
import os
import unittest
from pathlib import Path
from unittest import mock

spec = importlib.util.spec_from_file_location("br_hard", Path(__file__).with_name("browser_runtime.py"))
B = importlib.util.module_from_spec(spec)
import sys
sys.modules["br_hard"] = B  # dataclasses resolve their module by name
spec.loader.exec_module(B)

CONSEQUENTIAL = ["Post", "Post comment", "Submit order", "Place order", "Accept and continue", "Transfer funds", "Tweet",
                 "Donate", "Remove card", "Buy now", "Send"]


class OpenBrowser(unittest.TestCase):
    def test_consequential_targets_refused_even_when_open(self):
        with mock.patch.dict(os.environ, {"JARVIS_OPEN_ACCESS": "1"}):
            for label in CONSEQUENTIAL:
                self.assertTrue(B.hard().search(label), label)

    def test_login_relaxed_only_when_open(self):
        with mock.patch.dict(os.environ, {"JARVIS_OPEN_ACCESS": "1"}):
            self.assertFalse(B.hard().search("Sign in"))
        with mock.patch.dict(os.environ, {"JARVIS_OPEN_ACCESS": "0"}):
            self.assertTrue(B.hard().search("Sign in"))

    def test_unsafe_objective_detected(self):
        for obj in ["post this to X", "submit the order", "place order for the shoes", "transfer funds to Bob"]:
            self.assertTrue(B.unsafe_mission_intent(obj), obj)
        self.assertFalse(B.unsafe_mission_intent("read the pricing page and summarize it, do not buy anything"))


if __name__ == "__main__":
    unittest.main()
