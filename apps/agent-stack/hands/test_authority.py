"""The one gate (Evens 10-15): ordinary work runs; only the five kept stops and machine damage ask; secrets are refused."""
import importlib.util
import sys
import tempfile
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location("authority_t", Path(__file__).with_name("authority.py"))
A = importlib.util.module_from_spec(spec)
sys.modules["authority_t"] = A
spec.loader.exec_module(A)


class Shell(unittest.TestCase):
    def test_everyday_commands_run(self):
        for c in ["ls -la", "git status", "python3 --version", "npm test", "open -a Blender", "brew list",
                  "grep -r 'token budget' notes", "curl -s https://example.com", "cat README.md | head -5",
                  "osascript -e 'tell application \"QuickTime Player\" to play document 1'"]:
            self.assertEqual(A.authorize("shell", {"command": c})[0], A.ALLOW, c)

    def test_kept_stops_ask(self):
        for c in ["git push origin main", "rm -rf build", "ls && rm notes.txt", "gh pr create -t x", "mail bob < a.txt",
                  "curl -X POST https://api.x.com", "cat ~/.ssh/id_rsa", "sudo reboot", "find . -name '*.log' -delete",
                  "echo hi | sendmail bob", "osascript -e 'tell application \"Mail\" to send outgoing message 1'",
                  "osascript -e 'tell application \"Finder\" to delete file \"a\"'"]:
            self.assertEqual(A.authorize("shell", {"command": c})[0], A.ASK, c)


class Files(unittest.TestCase):
    def test_home_writes_run_outside_ask_secrets_and_system_refused(self):
        with tempfile.TemporaryDirectory() as t:
            home = Path(t)
            self.assertEqual(A.authorize("write_file", {"path": str(home / "notes/a.md")}, home=home)[0], A.ALLOW)
            self.assertEqual(A.authorize("write_file", {"path": "/tmp/elsewhere.txt"}, home=home)[0], A.ASK)
            self.assertEqual(A.authorize("write_file", {"path": "/etc/hosts"}, home=home)[0], A.DENY)
            self.assertEqual(A.authorize("read_file", {"path": str(home / ".env")}, home=home)[0], A.DENY)
            self.assertEqual(A.authorize("read_file", {"path": str(home / "README.md")}, home=home)[0], A.ALLOW)


class Mcp(unittest.TestCase):
    def test_send_like_mcp_tools_ask(self):
        self.assertEqual(A.authorize("mcp", {"tool": "slack_send_message"})[0], A.ASK)
        self.assertEqual(A.authorize("mcp", {"tool": "search_code"})[0], A.ALLOW)


if __name__ == "__main__":
    unittest.main()
