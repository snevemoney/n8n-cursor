#!/usr/bin/env python3
"""Unit tests for the fullstack-agent → agentic OS adopt/bus."""
from __future__ import annotations

import importlib.util
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / "os" / "agent-stack.py"


def _load():
    spec = importlib.util.spec_from_file_location("agent_stack", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {SCRIPT}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load()


class AgentStackAdoptTest(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory(prefix="agent-stack-test-")
        self.hive = Path(self.tmp.name)
        self.vault = {
            "ok": True,
            "source": "local",
            "path": "/Users/evenslouis/Documents/My_Billion_Dollar_Vault",
            "oh": "/Users/evenslouis/Documents/My_Billion_Dollar_Vault/00_Outer_Heaven",
            "kind": "live-vault",
        }

    def tearDown(self) -> None:
        self.tmp.cleanup()

    def test_adopt_writes_os_kind_and_ask(self) -> None:
        out = MOD.adopt(hive=self.hive, vault=self.vault)
        self.assertTrue(out["ok"], out)
        stack = MOD.load_json(self.hive / "agent-stack.json")
        self.assertEqual(stack["kind"], "agentic-os")
        self.assertEqual(stack["permission_mode"], "ask")
        self.assertEqual(stack["pieces"]["memory"], "adopted")
        self.assertEqual(stack["pieces"]["mouth"], "wired")
        self.assertEqual(stack["pieces"]["face"], "wired")
        self.assertEqual(stack["pieces"]["hands"], "wired")
        self.assertTrue(stack["session_brief"].endswith("BRIEF-2026-08-14-to-2026-09-04.md"))
        self.assertFalse((self.hive / "CLAUDE.md").exists())

    def test_validate_rejects_missing_vault_path(self) -> None:
        stack = MOD.default_stack(self.vault, hive=self.hive)
        stack["vault"] = {"ok": False, "path": ""}
        errors = MOD.validate(stack, MOD.default_bus())
        self.assertTrue(any("vault.path" in e for e in errors), errors)

    def test_validate_rejects_claude_host(self) -> None:
        stack = MOD.default_stack(self.vault, hive=self.hive)
        stack["hosts"] = ["cursor", "grok", "claude"]
        errors = MOD.validate(stack, MOD.default_bus())
        self.assertTrue(any("claude" in e for e in errors), errors)

    def test_bus_cycle(self) -> None:
        MOD.adopt(hive=self.hive, vault=self.vault)
        wrote = MOD.bus_write(phase="listen", job_status="yellow", hive=self.hive)
        self.assertTrue(wrote["ok"], wrote)
        checked = MOD.cmd_validate(hive=self.hive)
        self.assertTrue(checked["ok"], checked)
        self.assertEqual(checked["bus"]["phase"], "listen")
        self.assertEqual(checked["bus"]["job_status"], "yellow")
        armed = MOD.bus_write(hands_armed=True, hive=self.hive)
        self.assertTrue(armed["ok"], armed)
        self.assertTrue(armed["bus"]["hands_armed"])

    def test_self_test(self) -> None:
        out = MOD.self_test()
        self.assertTrue(out["ok"], out)

    def test_repo_root_is_workspace(self) -> None:
        self.assertTrue((MOD.ROOT / "pnpm-workspace.yaml").is_file(), MOD.ROOT)
        self.assertTrue(str(MOD.HIVE).endswith("docs/hive/outer-heaven/.hive"), MOD.HIVE)


if __name__ == "__main__":
    unittest.main()
