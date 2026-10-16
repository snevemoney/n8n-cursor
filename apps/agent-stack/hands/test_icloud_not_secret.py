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


class SlowFolder(unittest.TestCase):
    """Live 2026-10-16: an iCloud listing blocked inside os.walk; the 5 s find budget never ran and the turn hit
    the 60 s wall ("talk wire is dark"). The search must answer at its budget with what it found."""

    def test_a_blocking_listing_cannot_hold_the_answer(self):
        import tempfile
        import time
        from unittest import mock
        real_walk = W.os.walk

        def walk(root, **kw):
            if Path(root).name == "hang":
                time.sleep(10)
            return real_walk(root, **kw)
        with tempfile.TemporaryDirectory() as t:
            home = Path(t).resolve()
            (home / "a").mkdir(); (home / "a" / "AI book.pdf").write_bytes(b"%PDF-1.4"); (home / "hang").mkdir()
            with mock.patch.object(W.os, "walk", side_effect=walk), mock.patch.object(W, "FIND_SECONDS", 1.0):
                t0 = time.monotonic()
                got = W._find_documents({"op": "find", "extensions": [".pdf"]}, [home / "a", home / "hang"])
                took = time.monotonic() - t0
        self.assertLess(took, 3.0)
        self.assertEqual(len(got["files"]), 1)
        self.assertFalse(got["complete"])


class NamedICloud(unittest.TestCase):
    """Live 2026-10-16 13:40: "list my books from icloud folder" searched every folder (After Effects manuals)."""

    def test_icloud_is_a_named_folder(self):
        cloud = str(Path.home() / "Library" / "Mobile Documents" / "com~apple~CloudDocs")
        for u in ("list my books from icloud folder", "find the epub books in my iCloud Drive", "find pdfs in i cloud"):
            self.assertEqual(W.args_from_utterance(u).get("path"), cloud, u)
        self.assertEqual(W.args_from_utterance("list the files in my icloud folder"), {"op": "ls", "path": cloud})
        self.assertEqual(W.args_from_utterance("find books in my downloads").get("path"), str(Path.home() / "Downloads"))
