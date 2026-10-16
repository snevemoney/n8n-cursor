"""Live 2026-10-16: every iCloud Drive search was refused as "a secret" because iCloud lives under ~/Library."""
import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location("agent_stack_workspace_read_icloud", Path(__file__).with_name("workspace_read.py"))
W = importlib.util.module_from_spec(spec); spec.loader.exec_module(W)
HOME = Path.home().resolve()


class ICloud(unittest.TestCase):
    def test_cloud_drives_are_his_documents(self):
        for rel in ("Library/Mobile Documents/com~apple~CloudDocs/Books/a.epub", "Library/CloudStorage/GoogleDrive-x/My Drive/b.pdf"):
            self.assertFalse(W._home_dot_path(HOME / rel), rel)

    def test_the_rest_of_library_and_dot_folders_stay_closed(self):
        for rel in ("Library/Cookies/Cookies.binarycookies", "Library/Keychains/login.keychain-db", ".ssh/id_rsa", ".config/gh/hosts.yml",
                    "Library/Mobile Documents/../Keychains/x"):
            self.assertTrue(W._home_dot_path((HOME / rel).resolve() if ".." in rel else HOME / rel), rel)


if __name__ == "__main__":
    unittest.main()
