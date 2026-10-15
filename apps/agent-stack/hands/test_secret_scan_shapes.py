"""Review 2026-10-15: common credential shapes are caught; ordinary notes are not refused. Values are fake."""
import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location("secret_scan_shapes", Path(__file__).with_name("secret_scan.py"))
S = importlib.util.module_from_spec(spec)
spec.loader.exec_module(S)

CATCH = ("OPENAI_API_KEY=abcd1234efgh", "GITHUB_TOKEN=abcd1234", "DB_PASSWORD=hunter22",
         "export AWS_SECRET_ACCESS_KEY=" + "Ab1/" * 10,
         "Authorization: Bearer " + "abcDEF123._-" * 3, "the password is hunter2",
         "hf_" + "a1" * 17, "npm_" + "b2" * 17, "sk_live_" + "c3" * 10, "rk_test_" + "d4" * 10,
         "postgres://user:pa55word@db.example/app", "pwd: Xy9!kq")
KEEP = ("password: reset", "secret: handshake with Bob", "token: expires tomorrow", "the password: 'abc'",
        "remember that the token budget is tight", "my secret is that I like jazz", "password reset link sent")


class Shapes(unittest.TestCase):
    def test_catches_common_shapes(self):
        for t in CATCH:
            self.assertTrue(S.looks_secret(t), t)

    def test_keeps_ordinary_notes(self):
        for t in KEEP:
            self.assertFalse(S.looks_secret(t), t)

    def test_redact_hides_value(self):
        self.assertNotIn("abcd1234efgh", S.redact("OPENAI_API_KEY=abcd1234efgh"))


if __name__ == "__main__":
    unittest.main()
