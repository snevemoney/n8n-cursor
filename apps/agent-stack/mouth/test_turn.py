#!/usr/bin/env python3
"""Mouth tests. Conversation is the default. No desk ASK. No Ollama."""
from __future__ import annotations

import importlib.util
import os
import tempfile
import unittest
from pathlib import Path
from unittest import mock

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

    def test_speak_local_is_repo_voice_not_macos(self) -> None:
        text = SCRIPT.read_text(encoding="utf-8")
        self.assertNotIn('say", "-v", "Samantha"', text)
        self.assertNotIn('say", "-v", "Daniel"', text)
        self.assertIn("voice.py", text)
        self.assertIn("VOICE.speak_local", text)

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
                if line == "hey":
                    self.assertEqual(plan["verb"], "greet", line)
                else:
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
            out = MOD.apply_turn("what's going on", hive=hive, retrieve_roots=[vault], grok=_fake_grok)
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
                if line == "hey":
                    self.assertEqual(plan["verb"], "greet", line)
                    out = MOD.apply_turn(line, hive=hive, retrieve_roots=[vault], grok=_fake_grok)
                    self.assertEqual(out["verb"], "greet")
                    self.assertFalse(out["ask"])
                    _no_desk_ask(out["spoken"])
                    continue
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
                "what's going on",
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
        self.assertIn("what's going on", seen[1][0].lower())
        self.assertIn("Speak as Jarvis", seen[0][0])
        self.assertEqual(seen[0][1], "ask")
        self.assertIn("Ask mode", seen[0][0])
        self.assertNotIn("XAI_API_KEY", first["spoken"])

    def test_mode_switch_and_screen_share(self) -> None:
        self.assertEqual(MOD.classify("agent mode")["verb"], "mode")
        self.assertEqual(MOD.classify("switch to plan mode")["args"]["mode"], "plan")
        self.assertEqual(MOD.classify("ask mode")["args"]["mode"], "ask")
        self.assertEqual(MOD.classify("put yourself in ask mode")["args"]["mode"], "ask")
        self.assertEqual(MOD.classify("hey")["verb"], "greet")

        seen: list[tuple] = []

        def harness(prompt: str, mode: str = "ask", resume: str | None = None) -> dict:
            seen.append((prompt, mode, resume))
            return {"ok": True, "wire": "cursor", "spoken": f"mode {mode}", "chat_id": "c1"}

        def fake_see():
            return {
                "safari": {"title": "Hive", "url": "https://evenslouis.ca"},
                "screen": {"path": "/tmp/see.jpg"},
            }

        with tempfile.TemporaryDirectory(prefix="agent-stack-mode-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            set_mode = MOD.apply_turn("switch to plan mode", hive=hive)
            self.assertEqual(set_mode["verb"], "mode")
            self.assertIn("Plan mode", set_mode["spoken"])
            self.assertEqual(MOD.load_json(hive / "bus" / "state.json").get("harness_mode"), "plan")
            out = MOD.apply_turn(
                "look at my screen",
                hive=hive,
                cursor_fn=harness,
                see_fn=fake_see,
            )
        self.assertEqual(out["verb"], "converse")
        self.assertEqual(seen[0][1], "plan")
        self.assertIn("/tmp/see.jpg", seen[0][0])
        self.assertIn("https://evenslouis.ca", seen[0][0])
        self.assertIn("scripts/hive/grok-skills", seen[0][0])

    def test_repo_turn_calls_cursor_no_ask(self) -> None:
        self.assertEqual(MOD.classify("look at the code for the face")["verb"], "cursor")
        self.assertEqual(MOD.classify("fix this bug in serve.py")["args"]["mode"], "plan")
        self.assertEqual(MOD.classify("hey")["verb"], "greet")

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

    def test_log_bugs_stop_mode_browser_crumb(self) -> None:
        self.assertEqual(MOD.classify("Stop")["verb"], "stop")
        self.assertEqual(MOD.classify("It")["verb"], "crumb")
        put = MOD.classify("Put yourself in agent mode and look at my browser")
        self.assertEqual(put["verb"], "mode")
        self.assertEqual(put["args"]["mode"], "agent")
        self.assertIn("look at my browser", put["args"]["rest"])
        self.assertTrue(MOD.SEE_RE.search("look at my browser"))

        seen: list[tuple] = []

        def harness(prompt: str, mode: str = "ask", resume: str | None = None) -> dict:
            seen.append((prompt, mode, resume))
            return {"ok": True, "wire": "cursor", "spoken": "Safari is the hive site.", "chat_id": "c2"}

        def fake_see():
            return {"safari": {"title": "Hive", "url": "https://evenslouis.ca"}, "screen": {"path": "/tmp/see.jpg"}}

        with tempfile.TemporaryDirectory(prefix="agent-stack-log-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            stopped = MOD.apply_turn("Stop", hive=hive)
            self.assertEqual(stopped["verb"], "stop")
            self.assertIn("Stopped", stopped["spoken"])
            crumb = MOD.apply_turn("It", hive=hive)
            self.assertEqual(crumb["verb"], "crumb")
            out = MOD.apply_turn(
                "Put yourself in agent mode and look at my browser",
                hive=hive,
                cursor_fn=harness,
                see_fn=fake_see,
            )
            saved = MOD.load_json(hive / "bus" / "state.json")
        self.assertIn("Safari", out["spoken"])
        self.assertEqual(saved.get("harness_mode"), "agent")
        self.assertTrue(seen)
        self.assertEqual(seen[0][1], "ask")
        self.assertIn("https://evenslouis.ca", seen[0][0])

    def test_calendar_mail_invoice_are_local_wires(self) -> None:
        self.assertEqual(MOD.classify("what's on my calendar")["verb"], "calendar")
        self.assertEqual(MOD.classify("meetings tomorrow")["args"]["when"], "tomorrow")
        self.assertEqual(MOD.classify("any unread mail")["verb"], "mail")
        self.assertEqual(MOD.classify("what's the unpaid invoice")["verb"], "invoice")
        self.assertEqual(MOD.classify("create an invoice for Mike")["verb"], "invoice")

        with tempfile.TemporaryDirectory(prefix="agent-stack-inbox-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            vault = hive / "vault"
            vault.mkdir()
            (vault / "OPERATOR_MEMORY.md").write_text("north stars only\n", encoding="utf-8")
            with mock.patch.object(
                MOD.INBOX,
                "calendar_events",
                return_value={"ok": True, "wire": "calendar", "spoken": "Calendar.app today: Standup @ 9:00 AM.", "events": ["Standup @ 9:00 AM"]},
            ):
                cal = MOD.apply_turn("what's on my calendar", hive=hive)
            self.assertEqual(cal["verb"], "calendar")
            self.assertIn("Standup", cal["spoken"])
            self.assertEqual(cal["wires"], ["calendar"])
            with mock.patch.object(
                MOD.INBOX,
                "mail_unread",
                return_value={"ok": True, "wire": "mail", "spoken": "Mail.app inbox has 2 unread.", "unread": 2},
            ):
                mail = MOD.apply_turn("any unread mail", hive=hive)
            self.assertEqual(mail["verb"], "mail")
            self.assertIn("2 unread", mail["spoken"])
            invoice = MOD.apply_turn(
                "what's the unpaid invoice",
                hive=hive,
                retrieve_roots=[vault],
            )
            self.assertEqual(invoice["verb"], "invoice")
            self.assertIn("UNKNOWN", invoice["spoken"])
            self.assertNotIn("Mike Johnson", invoice["spoken"])
            self.assertNotIn("2500", invoice["spoken"])
            created = MOD.apply_turn("create an invoice for Mike Johnson for $2500", hive=hive)
            self.assertEqual(created["verb"], "invoice")
            self.assertIn("will not invent", created["spoken"].lower())

    def test_agent_skill_resumes_second_chat(self) -> None:
        seen: list[tuple] = []

        def harness(prompt: str, mode: str = "ask", resume: str | None = None) -> dict:
            seen.append((mode, resume))
            return {"ok": True, "wire": "cursor", "spoken": "Skill loaded.", "chat_id": resume or "agent-9"}

        with tempfile.TemporaryDirectory(prefix="agent-stack-agent-chat-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            (hive / "bus" / "state.json").write_text(
                '{"schema_version":1,"turns":[],"harness_mode":"agent",'
                '"jarvis_chat_id":"talk-1","jarvis_agent_chat_id":"agent-9"}\n',
                encoding="utf-8",
            )
            out = MOD.apply_turn("use skill hive-funnels", hive=hive, cursor_fn=harness)
            saved = MOD.load_json(hive / "bus" / "state.json")
        self.assertEqual(out["verb"], "converse")
        self.assertEqual(seen[0][0], "agent")
        self.assertEqual(seen[0][1], "agent-9")
        self.assertEqual(saved.get("jarvis_chat_id"), "talk-1")
        self.assertEqual(saved.get("jarvis_agent_chat_id"), "agent-9")

    def test_apply_turn_iter_yields_done_event(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-iter-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            evs = list(MOD.apply_turn_iter("hey", hive=hive))
        self.assertEqual(len(evs), 1)
        self.assertTrue(evs[0]["done"])
        self.assertIn("Hey Evens", evs[0]["spoken"])
        self.assertIn("Hey Evens", evs[0]["spoken_delta"])


if __name__ == "__main__":
    unittest.main()
