"""public_guard blocks private shared files, absolute home paths and secrets (Part B)."""
import importlib.util
import sys
import unittest
from pathlib import Path

REPO = Path(__file__).resolve().parents[3]
spec = importlib.util.spec_from_file_location("public_guard", REPO / "scripts/guard/public_guard.py")
G = importlib.util.module_from_spec(spec)
sys.modules["public_guard"] = G
spec.loader.exec_module(G)


class PublicGuardTest(unittest.TestCase):
    def test_private_shared_files_blocked(self):
        for p in ("docs/hive/outer-heaven/CONTENT/os/shared/ACTIVE_TASKS.md",
                  "docs/hive/outer-heaven/CONTENT/os/shared/MAC_SHARED_MEMORY.md",
                  "x/SECURITY_TODO.md", "x/JARVIS_CONTEXT.grok-shared.md",
                  "apps/agent-stack/face/gold_vault.local.json", "logs/jarvis-turns.jsonl"):
            self.assertTrue(G.check_names([p]), p)
        self.assertEqual(G.check_names(["docs/hive/outer-heaven/CONTENT/os/shared/AGENT_RULES.md"]), [])

    def test_absolute_home_path_blocked_home_relative_ok(self):
        user = "eve" + "nslouis"
        self.assertTrue(G.scan_text("a.py", [(1, f'VAULT = "/Users/{user}/Documents/v"')]))
        self.assertTrue(G.scan_text("a.py", [(1, "cd /home/alice/proj")]))
        self.assertEqual(G.scan_text("a.py", [(1, 'VAULT = "~/Documents/v"'), (2, "Path.home() / 'x'")]), [])
        self.assertEqual(G.scan_text("a.py", [(1, "/Users/x/y  # public-guard: allow")]), [])

    def test_secrets_blocked_without_echoing_value(self):
        fake = "sk-or-v1-" + "a" * 40
        out = G.scan_text("cfg.env", [(3, f"OPENROUTER_API_KEY={fake}")])
        self.assertTrue(out)
        self.assertNotIn(fake, " ".join(out))
        self.assertTrue(G.scan_text("k", [(1, "-----BEGIN OPENSSH PRIVATE KEY-----")]))
        self.assertTrue(G.scan_text("k", [(1, "token: ghp_" + "b" * 36)]))

    def test_added_lines_parser(self):
        diff = "+++ b/a.py\n@@ -0,0 +5,2 @@\n+one\n+two\n"
        self.assertEqual(G.added_lines(diff), {"a.py": [(5, "one"), (6, "two")]})


if __name__ == "__main__":
    unittest.main()
