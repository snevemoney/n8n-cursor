#!/usr/bin/env python3
"""The constitution stays short and present. A missing rule file is a fail."""
from __future__ import annotations

import json
import subprocess
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
MDC = ROOT / ".cursor/rules/hive-engineering-rules.mdc"
AGENTS = ROOT / "AGENTS.md"
FIX = 'When Evens says "fix the system," do not respond by creating a document describing how to fix the system.'


class HiveRulesTest(unittest.TestCase):
    def test_cursor_rule_is_always_on_and_short(self) -> None:
        text = MDC.read_text(encoding="utf-8")
        self.assertIn("alwaysApply: true", text)
        self.assertIn(FIX, text)
        self.assertIn("hive-matrix.py next", text)
        self.assertIn("signal.py", text)
        self.assertIn("a saved signal is not a Hive rule", text)
        self.assertLess(len(text.splitlines()), 80)

    def test_root_agents_matches_constitution(self) -> None:
        text = AGENTS.read_text(encoding="utf-8")
        self.assertIn(FIX, text)
        self.assertIn("Builder ≠ verifier", text)
        self.assertIn("hive-matrix.py next", text)
        self.assertIn("signal.py", text)
        self.assertIn("a saved signal is not a Hive rule", text)
        self.assertLess(len(text.splitlines()), 50)

    def test_roles_exist_and_stay_short(self) -> None:
        for name in ("BIG-BOSS.md", "BUILDER.md", "VERIFIER.md", "REVIEWER.md"):
            path = ROOT / "roles" / name
            lines = path.read_text(encoding="utf-8").splitlines()
            self.assertGreater(len(lines), 3)
            self.assertLess(len(lines), 30, name)

    def test_jarvis_and_jev_facts(self) -> None:
        jarvis = (ROOT / "apps/agent-stack/AGENTS.md").read_text(encoding="utf-8")
        hands = (ROOT / "apps/agent-stack/hands/AGENTS.md").read_text(encoding="utf-8")
        self.assertIn("127.0.0.1:4018", jarvis)
        self.assertIn("computer.next_op", jarvis)
        self.assertIn("voice.mac_op", jarvis)
        self.assertIn("observe again", hands)
        self.assertIn("Book never", hands)

    def test_active_adapters_do_not_say_same_brain(self) -> None:
        for rel in (
            "CLAUDE.md",
            "CHATGPT.md",
            "AGENTS.md",
            "scripts/hive/os/session-matrix.py",
            ".cursor/skills/hive-spawn-desks/SKILL.md",
        ):
            text = (ROOT / rel).read_text(encoding="utf-8")
            self.assertNotIn("Same brain", text, rel)

    def test_vault_status_is_not_one_store(self) -> None:
        proc = subprocess.run(
            [sys.executable, str(ROOT / "scripts/hive/os/vault-config.py"), "--status"],
            capture_output=True,
            text=True,
            cwd=str(ROOT),
        )
        self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)
        data = json.loads(proc.stdout)
        self.assertFalse(data["one_store"])
        self.assertNotEqual(data["cache"], data["mirror"])


if __name__ == "__main__":
    unittest.main()
