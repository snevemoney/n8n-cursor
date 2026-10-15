"""Security review 2026-10-15 (H7): open access widens the folders, never the secrets."""
import importlib.util
import os
import tempfile
import unittest
from pathlib import Path
from unittest import mock

spec = importlib.util.spec_from_file_location("wr_hard", Path(__file__).with_name("workspace_read.py"))
W = importlib.util.module_from_spec(spec)
spec.loader.exec_module(W)


class SecretsStayClosed(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.home = Path(self.tmp.name).resolve() / "home"
        self.home.mkdir()
        self.patches = [mock.patch.object(W, "open_access", return_value=True),
                        mock.patch.object(Path, "home", return_value=self.home)]
        for p in self.patches:
            p.start()

    def tearDown(self):
        for p in self.patches:
            p.stop()
        self.tmp.cleanup()

    def _mk(self, rel: str) -> Path:
        f = self.home / rel
        f.parent.mkdir(parents=True, exist_ok=True)
        f.write_text("x")
        return f

    def test_secret_files_refused_under_open_access(self):
        for rel in ["secrets.yaml", "github_token.txt", "api_token", "aws_credentials", "prod.env", "app.env",
                    ".pgpass", ".zsh_history", ".config/gh/hosts.yml", ".docker/config.json", ".kube/config",
                    ".claude/settings.json", ".cursor/mcp.json", ".mcp.json", "passwords.csv", "openai_api_key.txt",
                    "Library/Cookies/cookies.sqlite", "application_default_credentials.json"]:
            f = self._mk(rel)
            got, why = W._resolve(str(f), [self.home])
            self.assertIsNone(got, rel)
            self.assertIn(why, {"that looks like a secret"}, rel)

    def test_ordinary_files_readable_under_open_access(self):
        for rel in ["Documents/tokenomics.pdf", "Books/AI Superpowers.epub", "code/proj/.github/workflows/ci.yml",
                    "notes/secret-sauce-notes.md"]:
            f = self._mk(rel)
            got, why = W._resolve(str(f), [self.home])
            self.assertEqual(got, f.resolve(), (rel, why))


if __name__ == "__main__":
    unittest.main()
