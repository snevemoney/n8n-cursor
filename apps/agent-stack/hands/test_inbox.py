#!/usr/bin/env python3
"""Inbox wire tests. Never invent calendar, mail, or invoices."""
from __future__ import annotations

import importlib.util
import os
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest import mock

SCRIPT = Path(__file__).resolve().parent / "inbox.py"


def _load():
    spec = importlib.util.spec_from_file_location("agent_stack_inbox", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {SCRIPT}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load()


class InboxTest(unittest.TestCase):
    def test_calendar_unknown_on_fail(self) -> None:
        with mock.patch.object(MOD, "_run", side_effect=OSError("no calendar")):
            out = MOD.calendar_today()
        self.assertTrue(out["unknown"])
        self.assertEqual(out["wire"], "calendar")
        self.assertIn("Calendar", out["spoken"])
        self.assertEqual(out["events"], [])
        self.assertNotIn("Mike", out["spoken"])
        self.assertNotIn("2500", out["spoken"])

    def test_calendar_parses_events_cap_five(self) -> None:
        lines = "\n".join(f"Event {i} @ 9:0{i} AM" for i in range(8))
        proc = mock.Mock(returncode=0, stdout=lines + "\n", stderr="")
        with mock.patch.object(MOD, "_run", return_value=proc):
            out = MOD.calendar_events("today")
        self.assertTrue(out["ok"])
        self.assertEqual(len(out["events"]), 5)
        self.assertIn("Event 0", out["spoken"])
        self.assertNotIn("Event 5", out["spoken"])

    def test_calendar_empty_is_honest(self) -> None:
        proc = mock.Mock(returncode=0, stdout="NONE\n", stderr="")
        with mock.patch.object(MOD, "_run", return_value=proc):
            out = MOD.calendar_events("tomorrow")
        self.assertTrue(out["ok"])
        self.assertEqual(out["events"], [])
        self.assertIn("no events", out["spoken"])
        self.assertIn("tomorrow", out["spoken"])

    def test_calendar_dry_never_invents(self) -> None:
        with mock.patch.dict(os.environ, {"AGENT_STACK_INBOX_DRY": "1"}):
            out = MOD.calendar_today()
        self.assertTrue(out["unknown"])
        self.assertIn("dry", out["spoken"])
        self.assertNotIn("standup", out["spoken"].lower())

    def test_mail_unread_count(self) -> None:
        proc = mock.Mock(returncode=0, stdout="3\n", stderr="")
        with mock.patch.object(MOD, "_run", return_value=proc):
            out = MOD.mail_unread()
        self.assertTrue(out["ok"])
        self.assertEqual(out["unread"], 3)
        self.assertIn("3 unread", out["spoken"])

    def test_mail_unknown_on_fail(self) -> None:
        proc = mock.Mock(returncode=1, stdout="", stderr="not allowed")
        with mock.patch.object(MOD, "_run", return_value=proc):
            out = MOD.mail_unread()
        self.assertTrue(out["unknown"])
        self.assertIn("Mail", out["spoken"])
        self.assertIsNone(out["unread"])
        self.assertNotIn("2500", out["spoken"])

    def test_invoice_never_invents_on_empty_vault(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-invoice-") as tmp:
            vault = Path(tmp)
            (vault / "OPERATOR_MEMORY.md").write_text("north stars only\n", encoding="utf-8")
            out = MOD.invoice_lookup("what's the unpaid invoice", retrieve_roots=[vault])
        self.assertTrue(out["unknown"])
        self.assertIn("UNKNOWN", out["spoken"])
        self.assertIn("vault", out["spoken"].lower())
        self.assertNotIn("2500", out["spoken"])
        self.assertNotIn("Mike Johnson", out["spoken"])

    def test_invoice_create_refuses_to_invent(self) -> None:
        out = MOD.invoice_lookup("create an invoice for Mike Johnson for $2500")
        self.assertTrue(out["unknown"])
        self.assertIn("will not invent", out["spoken"].lower())
        self.assertIn("Send stays", out["spoken"])

    def test_invoice_cites_vault_hit(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-invoice-hit-") as tmp:
            vault = Path(tmp)
            (vault / "OPERATOR_MEMORY.md").write_text(
                "Invoice note: studio retainers live in the vault ledger, not a made-up client.\n",
                encoding="utf-8",
            )
            out = MOD.invoice_lookup("invoice ledger", retrieve_roots=[vault])
        self.assertTrue(out["ok"])
        self.assertIn("vault ledger", out["spoken"])
        self.assertNotIn("Mike Johnson", out["spoken"])

    def test_timeout_is_unknown(self) -> None:
        with mock.patch.object(MOD, "_run", side_effect=subprocess.TimeoutExpired("osascript", 8)):
            cal = MOD.calendar_today()
            mail = MOD.mail_unread()
        self.assertTrue(cal["unknown"])
        self.assertTrue(mail["unknown"])


if __name__ == "__main__":
    unittest.main()
