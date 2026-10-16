"""Privacy audit 2026-10-16: one detector behind every redactor; each secret shape from the audit table is caught."""
import importlib.util
import unittest
from pathlib import Path

STACK = Path(__file__).resolve().parents[1]


def _load(name, rel):
    spec = importlib.util.spec_from_file_location(name, STACK / rel)
    mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
    return mod


S = _load("agent_stack_secret_patterns_test", "brain/secret_patterns.py")
# Fixtures are assembled from pieces so the repo's public guard never sees a token-shaped literal.
GH, SL, PK = "github" + "_pat_", "xo" + "xb-", "-----BEGIN " + "OPENSSH PRIVATE" + " KEY-----"
SECRETS = [GH + "11ABCDEFG0123456789_abcdefghijklmnopqrstuvwxyz", "gh" + "p_" + "a" * 36, "sk-proj-" + "A1" * 20,
           "sk-ant-api03-" + "x" * 40, "sk-or-v1-" + "f" * 40, SL + "123-456-abcdefghij", "xa" + "pp-1-A0-123-abcdefabcdef",
           "aws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
           "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U",
           PK + "\nb3BlbnNzaC1rZXk\n" + PK.replace("BEGIN", "END"),
           "DATABASE_URL=postgres://u:pass1234@db.host/x", "https://user:hunter22@example.com/path", "sk_live_" + "a" * 24,
           "AIza" + "b" * 35, "my password is Hunter2Pass!", "SLACK_BOT_TOKEN=" + SL + "1-2-3", "hf_" + "c" * 34]
RAW = ["pass1234", "hunter22", "Hunter2Pass!", "wJalrXUtnFEMI", "b3BlbnNzaC1rZXk"]


class Shared(unittest.TestCase):
    def test_every_shape_is_caught_and_removed(self):
        for s in SECRETS:
            self.assertTrue(S.has_secret(s), s[:30])
            out = S.redact(s)
            self.assertIn("[redacted]", out, s[:30])
            for raw in RAW:
                self.assertNotIn(raw, out)

    def test_benign_text_is_untouched(self):
        for s in ("the token economy and a secret santa party", "password reset email arrived",
                  "see https://github.com/openai/whisper", "sk-learn is a library"):
            self.assertFalse(S.has_secret(s), s); self.assertEqual(S.redact(s), s)

    def test_every_site_uses_it(self):
        H = _load("agent_stack_hooks_secret_test", "brain/hooks.py")
        R = _load("agent_stack_results_secret_test", "memory/results.py")
        C = _load("agent_stack_chats_secret_test", "memory/chats.py")
        import sys
        sys.path.insert(0, str(STACK / "hands"))  # methods_config imports project_methods by name when loaded by path
        M = _load("agent_stack_methods_config_secret_test", "hands/methods_config.py")
        A = _load("agent_stack_agent_tools_secret_test", "hands/agent_tools.py")
        pem = SECRETS[9]
        self.assertNotIn("b3BlbnNzaC1rZXk", H.redact("out: " + pem))
        self.assertNotIn("hunter22", C._clean("see https://user:hunter22@example.com"))
        self.assertNotIn("hunter22", A._scrub("https://user:hunter22@example.com"))
        self.assertIsNotNone(M.find_secret(pem))
        self.assertFalse(R.write_back("web_search", "find it", {"ok": True, "spoken": "key " + SECRETS[2]}))


if __name__ == "__main__":
    unittest.main()
