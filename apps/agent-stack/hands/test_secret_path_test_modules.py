"""Regression: mission 01e8079 PREPARATION_BLOCKED because a test module's name contained 'tokens'."""
import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location("perm_secret_names", Path(__file__).with_name("permissions.py"))
P = importlib.util.module_from_spec(spec)
spec.loader.exec_module(P)


class SecretPathTestModules(unittest.TestCase):
    def test_test_module_names_are_not_secrets(self):
        for path in ("apps/agent-stack/tests/test_literal_tokens_and_budget.py",
                     "/Users/x/jarvis-main/apps/agent-stack/tests/test_literal_tokens_and_budget.py",
                     "hands/test_secret_scan.py", "brain/credentials_test.py", "face/token.test.cjs"):
            self.assertFalse(P.is_secret_path(path), path)

    def test_real_secret_shapes_still_match(self):
        for path in ("x/.env", ".env.local", "a/token.json", "tokens.py", "my_tokens.txt", "secrets/test_a.py",
                     "/Users/x/.ssh/test_x.py", "x/test_token.pem", "certs/server.key", "id_ed25519",
                     "/Users/x/.grok-private/jarvis-mode.json", "credentials.json", "Keychains/login"):
            self.assertTrue(P.is_secret_path(path), path)


if __name__ == "__main__":
    unittest.main()
