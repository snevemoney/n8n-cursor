"""Open access hardening (independent security review 2026-10-15): only the owner's clear grant flips it, it expires,
revoke is forgiving, and edits never reach shell/agent config dotfiles."""
import importlib.util
import json
import os
import tempfile
import unittest
from datetime import datetime, timedelta
from pathlib import Path
from unittest import mock

spec = importlib.util.spec_from_file_location("perm_hard", Path(__file__).with_name("permissions.py"))
PERM = importlib.util.module_from_spec(spec)
spec.loader.exec_module(PERM)

AMBIENT = ["Access granted, welcome to the system", "access is granted to the admin group only",
           "You have access to the lobby", "yes you're permitted to park here", "okay you are cleared for takeoff",
           "I allow it", "i permit this", "access granted", "you're allowed to do that"]
OWNER = ["permission granted", "Permission granted.", "Jarvis, permission granted, go ahead", "I allow you to do this",
         "I allow you", "ok I give you full access", "full access granted", "I grant you permission",
         "i allow you to read that folder"]


class Grant(unittest.TestCase):
    def test_ambient_media_lines_do_not_grant(self):
        for t in AMBIENT:
            self.assertFalse(PERM.is_grant(t), t)
            self.assertEqual(PERM.grant_split(t), (False, ""), t)

    def test_owner_phrasings_still_grant(self):
        for t in OWNER:
            self.assertTrue(PERM.is_grant(t), t)

    def test_carried_command_kept(self):
        self.assertEqual(PERM.grant_split("permission granted, find books about AI"), (True, "find books about AI"))
        self.assertEqual(PERM.grant_split("i allow you to read that folder"), (True, "read that folder"))


class Revoke(unittest.TestCase):
    def test_polite_revokes(self):
        for t in ["lock it down please", "Jarvis, lock it down now", "permission revoked, thanks", "lock it down, sir"]:
            self.assertTrue(PERM.is_revoke(t), t)


class Expiry(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.env = mock.patch.dict(os.environ, {"JARVIS_MODE_FILE": str(Path(self.tmp.name) / "mode.json"),
                                                "JARVIS_ACTION_LOG": "off"})
        self.env.start()

    def tearDown(self):
        self.env.stop(); self.tmp.cleanup()

    def test_grant_records_expiry_and_expires(self):
        data = PERM.set_open_access(True)
        self.assertIn("expires", data)
        self.assertTrue(PERM.open_access())
        past = (datetime.now() - timedelta(seconds=1)).isoformat(timespec="seconds")
        f = Path(os.environ["JARVIS_MODE_FILE"]); d = json.loads(f.read_text()); d["expires"] = past
        f.write_text(json.dumps(d))
        self.assertFalse(PERM.open_access())

    def test_legacy_grant_without_expiry_is_closed(self):
        Path(os.environ["JARVIS_MODE_FILE"]).write_text(json.dumps({"open_access": True}))
        self.assertFalse(PERM.open_access())

    def test_revoke_clears(self):
        PERM.set_open_access(True); PERM.set_open_access(False)
        self.assertFalse(PERM.open_access())


class EditScope(unittest.TestCase):
    def test_dotfiles_and_agent_config_never_open_edit(self):
        home = Path.home()
        for rel in [".zshrc", ".zprofile", ".gitconfig", ".config/gh/hosts.yml", ".claude/settings.json", ".mcp.json",
                    ".docker/config.json", ".cursor/mcp.json", "Library/LaunchAgents/x.plist"]:
            self.assertFalse(PERM.open_edit_ok(home / rel), rel)

    def test_ordinary_home_files_still_open_edit(self):
        self.assertTrue(PERM.open_edit_ok(Path.home() / "Documents" / "notes.md"))


if __name__ == "__main__":
    unittest.main()
