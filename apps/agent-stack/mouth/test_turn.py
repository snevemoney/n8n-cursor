#!/usr/bin/env python3
"""Mouth tests. Conversation is the default. No desk ASK. No Ollama."""
from __future__ import annotations

import importlib.util
import os
import tempfile
import unittest
from pathlib import Path

os.environ["AGENT_STACK_DRY_TTS"] = "1"
SCRIPT = Path(__file__).resolve().parent / "turn.py"


def _load():
    spec = importlib.util.spec_from_file_location("agent_stack_mouth", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {SCRIPT}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load()


def _fake_grok(prompt: str, context: str = "") -> dict:
    return {
        "ok": True,
        "unknown": False,
        "wire": "grok",
        "engine": "xai",
        "spoken": f"Grok says {prompt[:60]}",
    }


def _no_desk_ask(text: str) -> None:
    low = (text or "").lower()
    for leak in (
        "say yes to approve",
        "say yes to send",
        "send this to the grok desk",
        "do you want me to send this",
        "may i hand this",
        "queued for",
    ):
        if leak in low:
            raise AssertionError(f"desk ASK leaked: {text!r}")


class MouthTurnTest(unittest.TestCase):
    def test_self_test(self) -> None:
        out = MOD.self_test()
        self.assertTrue(out["ok"], out)

    def test_no_ollama_runtime(self) -> None:
        text = SCRIPT.read_text(encoding="utf-8")
        self.assertNotIn("import ollama", text)
        self.assertNotIn("11434", text)
        self.assertNotIn("mouth/brain.py", text)
        self.assertNotIn('parent / "brain.py"', text)
        brain = SCRIPT.parent.parent / "brain" / "online.py"
        if brain.is_file():
            brain_text = brain.read_text(encoding="utf-8")
            self.assertNotIn("11434", brain_text)
            self.assertNotIn("import ollama", brain_text)

    def test_deleted_desk_ask_classify(self) -> None:
        text = SCRIPT.read_text(encoding="utf-8")
        self.assertNotIn('return {"verb": "desk", "needs_ask": True', text)
        self.assertNotIn("May I hand this to the", text)

    def test_hey_whats_going_on_joke_never_hand_this(self) -> None:
        lines = ("hey", "what's going on", "tell me a joke", "send me a joke")
        with tempfile.TemporaryDirectory(prefix="agent-stack-hey-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            vault = hive / "vault"
            vault.mkdir()
            (vault / "OPERATOR_MEMORY.md").write_text("north stars\n", encoding="utf-8")
            for line in lines:
                plan = MOD.classify(line)
                self.assertEqual(plan["verb"], "converse", line)
                self.assertFalse(plan["needs_ask"], line)
                out = MOD.apply_turn(line, hive=hive, retrieve_roots=[vault], grok=_fake_grok)
                self.assertFalse(out["ask"], line)
                self.assertNotIn("hand this", (out["spoken"] or "").lower())
                self.assertNotIn("say yes", (out["spoken"] or "").lower())
                _no_desk_ask(out["spoken"])

    def test_leftover_yellow_bus_does_not_speak_hand_this(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-leftover-") as tmp:
            hive = Path(tmp)
            bus = hive / "bus"
            bus.mkdir()
            (bus / "state.json").write_text(
                '{"schema_version":1,"phase":"speak","job_status":"yellow",'
                '"utterance":"Hello","permission_ask":"May I hand this to the grok desk? Say yes to approve.",'
                '"spoken":"May I hand this to the grok desk? Say yes to approve.","turns":[]}\n',
                encoding="utf-8",
            )
            vault = hive / "vault"
            vault.mkdir()
            (vault / "OPERATOR_MEMORY.md").write_text("north stars\n", encoding="utf-8")
            out = MOD.apply_turn("hey", hive=hive, retrieve_roots=[vault], grok=_fake_grok)
            self.assertFalse(out["ask"])
            self.assertEqual(out["verb"], "converse")
            self.assertNotIn("hand this", (out["spoken"] or "").lower())
            self.assertNotIn("say yes", (out["spoken"] or "").lower())
            _no_desk_ask(out["spoken"])
            saved = MOD.load_json(bus / "state.json")
            self.assertFalse(saved.get("permission_ask"))

    def test_normal_sentences_converse_no_ask_no_queue(self) -> None:
        lines = ("what's my north star", "hey how are you", "hey", "what's going on", "remember this", "send me a joke")
        with tempfile.TemporaryDirectory(prefix="agent-stack-converse-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            vault = hive / "vault"
            vault.mkdir()
            (vault / "OPERATOR_MEMORY.md").write_text(
                "Four north stars start with maximum leverage, minimum noise.\n",
                encoding="utf-8",
            )
            for line in lines:
                plan = MOD.classify(line)
                self.assertEqual(plan["verb"], "converse", line)
                self.assertFalse(plan["needs_ask"], line)
                self.assertEqual(plan["host"], "online", line)
                out = MOD.apply_turn(line, hive=hive, retrieve_roots=[vault], grok=_fake_grok)
                self.assertFalse(out["ask"], line)
                self.assertIsNone(out.get("permission_ask"))
                self.assertNotIn("Queued", out["spoken"])
                _no_desk_ask(out["spoken"])
                self.assertFalse((hive / "bus" / "jobs.jsonl").is_file())

    def test_send_this_email_refuses(self) -> None:
        self.assertEqual(MOD.classify("send this email")["verb"], "refuse")
        self.assertFalse(MOD.classify("send this email")["needs_ask"])
        with tempfile.TemporaryDirectory(prefix="agent-stack-send-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            out = MOD.apply_turn("send this email", hive=hive)
            self.assertEqual(out["verb"], "refuse")
            self.assertFalse(out["ask"])
            _no_desk_ask(out["spoken"])
            self.assertFalse((hive / "bus" / "jobs.jsonl").is_file())

    def test_missing_grok_vault_or_names_wire(self) -> None:
        def dark(_prompt: str, context: str = "") -> dict:
            return {"ok": False, "unknown": True, "spoken": ""}

        with tempfile.TemporaryDirectory(prefix="agent-stack-dark-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            vault = hive / "vault"
            vault.mkdir()
            (vault / "OPERATOR_MEMORY.md").write_text(
                "Four north stars start with maximum leverage, minimum noise.\n",
                encoding="utf-8",
            )
            vaulted = MOD.apply_turn(
                "what's my north star",
                hive=hive,
                retrieve_roots=[vault],
                grok=dark,
            )
            self.assertFalse(vaulted["ask"])
            self.assertIn("Cursor harness", vaulted["spoken"])
            self.assertNotIn("XAI_API_KEY", vaulted["spoken"])
            _no_desk_ask(vaulted["spoken"])

            empty = hive / "empty"
            empty.mkdir()
            missing = MOD.apply_turn(
                "what should I work on",
                hive=hive,
                retrieve_roots=[empty],
                grok=dark,
            )
            self.assertFalse(missing["ask"])
            self.assertIn("Cursor harness", missing["spoken"])
            self.assertNotIn("XAI_API_KEY", missing["spoken"])
            _no_desk_ask(missing["spoken"])
            self.assertFalse((hive / "bus" / "jobs.jsonl").is_file())

    def test_follow_up_sends_history_and_identity(self) -> None:
        seen: list[str] = []

        def rec_grok(prompt: str, context: str = "") -> dict:
            seen.append(context)
            return {
                "ok": True,
                "unknown": False,
                "wire": "grok",
                "engine": "xai",
                "spoken": f"Grok says {prompt[:60]}",
            }

        with tempfile.TemporaryDirectory(prefix="agent-stack-hist-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            (hive / "agent-stack.json").write_text('{"operator": "Evens"}\n', encoding="utf-8")
            vault = hive / "vault"
            vault.mkdir()
            (vault / "OPERATOR_MEMORY.md").write_text(
                "Four north stars start with maximum leverage, minimum noise.\n",
                encoding="utf-8",
            )
            first = MOD.apply_turn(
                "tell me a joke about bitcoin",
                hive=hive,
                retrieve_roots=[vault],
                grok=rec_grok,
            )
            self.assertEqual(first["verb"], "converse")
            follow = MOD.apply_turn(
                "that was terrible",
                hive=hive,
                retrieve_roots=[vault],
                grok=rec_grok,
            )
            self.assertEqual(follow["verb"], "converse")
            self.assertFalse(follow["ask"])
            ctx = seen[-1]
            self.assertIn("tell me a joke about bitcoin", ctx)
            self.assertIn("Identity", ctx)
            self.assertIn("Evens", ctx)
            self.assertIn("Store (this is the brain)", ctx)
            _no_desk_ask(follow["spoken"])

    def test_converse_calls_cursor_harness(self) -> None:
        seen: list[tuple] = []

        def harness(prompt: str, mode: str = "ask", resume: str | None = None) -> dict:
            seen.append((prompt, mode, resume))
            return {
                "ok": True,
                "wire": "cursor",
                "engine": "cursor",
                "spoken": "Hey Evens. Vault and hive are on the table. What are we doing?",
                "chat_id": resume or "jarvis-1",
            }

        with tempfile.TemporaryDirectory(prefix="agent-stack-harness-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            (hive / "bus" / "state.json").write_text(
                '{"schema_version":1,"turns":[],"jarvis_chat_id":"jarvis-1"}\n',
                encoding="utf-8",
            )
            vault = hive / "vault"
            vault.mkdir()
            (vault / "OPERATOR_MEMORY.md").write_text("north stars\n", encoding="utf-8")
            first = MOD.apply_turn(
                "hey",
                hive=hive,
                retrieve_roots=[vault],
                cursor_fn=harness,
            )
            follow = MOD.apply_turn(
                "what did I just say",
                hive=hive,
                retrieve_roots=[vault],
                cursor_fn=harness,
            )
            saved = MOD.load_json(hive / "bus" / "state.json")
            self.assertEqual(saved.get("jarvis_chat_id"), "jarvis-1")
        self.assertEqual(first["verb"], "converse")
        self.assertEqual(first["wires"], ["cursor"])
        self.assertIn("Vault and hive", first["spoken"])
        self.assertEqual(follow["verb"], "converse")
        self.assertEqual(seen[0][2], "jarvis-1")
        self.assertEqual(seen[1][2], "jarvis-1")
        self.assertIn("hey", seen[1][0].lower())
        self.assertIn("Speak as Jarvis", seen[0][0])
        self.assertNotIn("XAI_API_KEY", first["spoken"])

    def test_repo_turn_calls_cursor_no_ask(self) -> None:
        self.assertEqual(MOD.classify("look at the code for the face")["verb"], "cursor")
        self.assertEqual(MOD.classify("fix this bug in serve.py")["args"]["mode"], "plan")
        self.assertEqual(MOD.classify("hey")["verb"], "converse")

        def fake_cursor(prompt: str, mode: str = "ask") -> dict:
            return {
                "ok": True,
                "wire": "cursor",
                "engine": "cursor",
                "spoken": f"Cursor {mode}: {prompt[:40]}",
                "mode": mode,
            }

        with tempfile.TemporaryDirectory(prefix="agent-stack-cursor-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            out = MOD.apply_turn(
                "look at the code for the face",
                hive=hive,
                grok=_fake_grok,
                cursor_fn=fake_cursor,
            )
            self.assertEqual(out["verb"], "cursor")
            self.assertFalse(out["ask"])
            self.assertEqual(out["wires"], ["cursor"])
            self.assertIn("Cursor ask", out["spoken"])
            _no_desk_ask(out["spoken"])
            self.assertFalse((hive / "bus" / "jobs.jsonl").is_file())

    def test_correction_and_project_stay_converse(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-corr-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            vault = hive / "vault"
            vault.mkdir()
            (vault / "OPERATOR_MEMORY.md").write_text(
                "Four north stars start with maximum leverage, minimum noise.\n",
                encoding="utf-8",
            )
            for line in ("no I meant the website lane", "what's my north star"):
                out = MOD.apply_turn(line, hive=hive, retrieve_roots=[vault], grok=_fake_grok)
                self.assertEqual(out["verb"], "converse", line)
                self.assertFalse(out["ask"], line)
                _no_desk_ask(out["spoken"])


if __name__ == "__main__":
    unittest.main()
