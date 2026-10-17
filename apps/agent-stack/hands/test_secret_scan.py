"""Secret-looking text never lands in Jarvis's durable memory or drafts."""
import importlib.util
import json
import os
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent


def _load(name):
    spec = importlib.util.spec_from_file_location(f"secret_scan_{name}", HERE / f"{name}.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


FAKE = {  # obviously fake test values shaped like real secrets
    "github": "ghp_" + "A1b2C3d4E5f6G7h8I9j0K1l2M3n4",
    "openai": "sk-" + "testtesttesttesttesttest1234",
    "aws": "AKIA" + "ABCDEFGHIJKLMNOP",
    "slack": "xoxb-" + "123-456-abcdef",
    "kv": "password = " + "hunter2-not-real",
    "pem": "-----BEGIN " + "PRIVATE KEY-----",
    "jwt": "eyJhbGciOiJIUzI1NiJ9." + "eyJzdWIiOiIxMjM0In0." + "abcdefghijklmnop",
}


class ScannerTest(unittest.TestCase):
    def test_detects_common_secret_shapes(self):
        S = _load("secret_scan")
        for kind, value in FAKE.items():
            self.assertTrue(S.looks_secret(f"note: {value}"), kind)

    def test_ordinary_text_passes(self):
        S = _load("secret_scan")
        for text in ("Remember I prefer the valet voice", "The token budget is 4,000 words",
                     "Use the password manager for sign-ins", "ProofCheck launch is Friday"):
            self.assertFalse(S.looks_secret(text), text)


class RememberTest(unittest.TestCase):
    def test_remember_refuses_secret_and_writes_nothing(self):
        R = _load("remember")
        with tempfile.TemporaryDirectory() as tmp:
            store = Path(tmp) / "mem.json"
            os.environ["JARVIS_MEMORY_FILE"] = str(store)
            try:
                bad = R.run({}, utterance=f"remember that my github token is {FAKE['github']}")
                good = R.run({}, utterance="remember that ProofCheck launches Friday")
            finally:
                os.environ.pop("JARVIS_MEMORY_FILE", None)
            self.assertFalse(bad["ok"])
            self.assertIn("secret", bad["spoken"].lower())
            self.assertNotIn(FAKE["github"], bad["spoken"])
            self.assertTrue(good["ok"])
            self.assertEqual(json.loads(store.read_text()), ["ProofCheck launches Friday"])


class DraftsTest(unittest.TestCase):
    def test_draft_with_secret_is_not_saved(self):
        D = _load("drafts")
        with tempfile.TemporaryDirectory() as tmp:
            os.environ["JARVIS_DRAFTS_DIR"] = tmp
            try:
                got = D.run("draft an email to Sam with the server login",
                            chat=lambda system, prompt: f"Subject: login\nHere it is: {FAKE['kv']}")
            finally:
                os.environ.pop("JARVIS_DRAFTS_DIR", None)
            self.assertFalse(got["ok"])
            self.assertFalse(got.get("sent"))
            self.assertEqual(list(Path(tmp).glob("*.md")), [])
            self.assertNotIn("hunter2", got["spoken"])


if __name__ == "__main__":
    unittest.main()
