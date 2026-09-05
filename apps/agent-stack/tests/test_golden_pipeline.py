#!/usr/bin/env python3
"""Five golden conversations. Mock Cursor + see.py + store. Then stop."""
from __future__ import annotations

import importlib.util
import json
import os
import tempfile
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

os.environ["AGENT_STACK_DRY_TTS"] = "1"
os.environ["AGENT_STACK_CURSOR_DRY"] = "1"

STACK = Path(__file__).resolve().parents[1]
TURN_PATH = STACK / "mouth" / "turn.py"
SCARS_PATH = STACK / "memory" / "scars.py"
CANNED_CAN = "I run the hive catalog here, not Grok Bot"


def _load(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


TURN = _load("agent_stack_mouth_golden", TURN_PATH)
SCARS = _load("agent_stack_scars_golden", SCARS_PATH)


def _hive(tmp: str) -> tuple[Path, Path]:
    hive = Path(tmp)
    vault = hive / "vault"
    vault.mkdir(parents=True)
    (hive / "bus").mkdir(parents=True)
    (vault / "OPERATOR_MEMORY.md").write_text(
        "# Operator Memory\n\n"
        "Jarvis can read the vault, look at the Safari page, ask the repo, "
        "or report status. Hard steps stay Evens.\n"
        "North star: maximum leverage, minimum noise.\n",
        encoding="utf-8",
    )
    return hive, vault


class GoldenPipelineTest(unittest.TestCase):
    def test_1_what_can_you_do_uses_model_and_store(self) -> None:
        calls: list[str] = []

        def fake_cursor(prompt: str, mode: str = "ask", **kw):
            _ = (mode, kw)
            calls.append(prompt)
            self.assertIn("pipeline-pack.md", prompt)
            self.assertNotIn(prompt[:4000] if False else "I run the hive catalog here, not Grok Bot", prompt)
            self.assertLess(len(prompt), 2000)
            return {
                "tool": "vault_read",
                "args": {"query": "what Jarvis can do"},
                "speak": "From the store I can read the vault, look at Safari, ask the repo, or report status.",
            }

        with tempfile.TemporaryDirectory(prefix="golden-can-") as tmp:
            hive, vault = _hive(tmp)
            out = TURN.apply_turn(
                "What can you do?",
                hive=hive,
                retrieve_roots=[vault],
                cursor_fn=fake_cursor,
            )
        self.assertTrue(calls, "model must be called")
        self.assertNotEqual(out.get("verb"), "can")
        self.assertNotIn(CANNED_CAN, out.get("spoken") or "")
        self.assertIn("vault", (out.get("spoken") or "").lower())
        self.assertTrue(
            "vault_read" in (out.get("wires") or []) or "store" in (out.get("wires") or []),
            out,
        )
        self.assertNotIn("today", (out.get("verb") or ""))

    def test_2_follow_up_needs_turn_1(self) -> None:
        packs: list[str] = []

        def fake_cursor(prompt: str, mode: str = "ask", **kw):
            _ = (mode, kw)
            pack = None
            for token in prompt.split():
                token = token.strip(" .\"'")
                if token.endswith("pipeline-pack.md"):
                    pack = Path(token)
                    break
            body = pack.read_text(encoding="utf-8") if pack and pack.is_file() else ""
            packs.append(body)
            if "What did I just say" in prompt:
                self.assertIn("north star is leverage", body)
                return {
                    "tool": "vault_read",
                    "args": {"query": "north star leverage"},
                    "speak": "You said your north star is leverage.",
                }
            return {
                "tool": "vault_read",
                "args": {"query": "north star"},
                "speak": "Noted. Your north star is leverage.",
            }

        with tempfile.TemporaryDirectory(prefix="golden-follow-") as tmp:
            hive, vault = _hive(tmp)
            first = TURN.apply_turn(
                "My north star is leverage",
                hive=hive,
                retrieve_roots=[vault],
                cursor_fn=fake_cursor,
            )
            self.assertIn("leverage", (first.get("spoken") or "").lower())
            second = TURN.apply_turn(
                "What did I just say?",
                hive=hive,
                retrieve_roots=[vault],
                cursor_fn=fake_cursor,
            )
        self.assertGreaterEqual(len(packs), 2)
        self.assertIn("north star is leverage", packs[-1])
        self.assertIn("leverage", (second.get("spoken") or "").lower())

    def test_3_look_at_this_page_runs_safari_see(self) -> None:
        saw: list[str] = []

        def fake_cursor(prompt: str, mode: str = "ask", **kw):
            _ = (prompt, mode, kw)
            return {"tool": "safari_see", "args": {}, "speak": "I looked at the page."}

        def fake_see(utterance: str = ""):
            saw.append(utterance)
            return {
                "ok": True,
                "wire": "safari",
                "spoken": "The front tab is Example Docs at https://example.com/page",
                "title": "Example Docs",
                "url": "https://example.com/page",
            }

        with tempfile.TemporaryDirectory(prefix="golden-see-") as tmp:
            hive, vault = _hive(tmp)
            out = TURN.apply_turn(
                "Look at this page",
                hive=hive,
                retrieve_roots=[vault],
                cursor_fn=fake_cursor,
                see_fn=fake_see,
            )
        self.assertEqual(saw, ["Look at this page"])
        self.assertEqual(out.get("verb"), "safari_see")
        spoken = out.get("spoken") or ""
        self.assertIn("Example Docs", spoken)
        self.assertIn("https://example.com/page", spoken)

    def test_4_send_this_email_is_proposal_only(self) -> None:
        sent: list[str] = []
        cursor_calls: list[str] = []

        def fake_cursor(prompt: str, mode: str = "ask", **kw):
            _ = (mode, kw)
            cursor_calls.append(prompt)
            return {"tool": "refuse_hard_step", "args": {}, "speak": "I will send it now."}

        def fake_send(to: str) -> None:
            sent.append(to)

        with tempfile.TemporaryDirectory(prefix="golden-send-") as tmp:
            hive, vault = _hive(tmp)
            out = TURN.apply_turn(
                "Send this email",
                hive=hive,
                retrieve_roots=[vault],
                cursor_fn=fake_cursor,
            )
            _ = fake_send
        self.assertEqual(sent, [])
        self.assertEqual(out.get("verb"), "refuse_hard_step")
        self.assertIn("Proposal only", out.get("spoken") or "")
        self.assertNotIn("I will send it now", out.get("spoken") or "")
        self.assertFalse(out.get("ask"))

    def test_5_auth_fail_ttl_still_reaches_model(self) -> None:
        calls: list[str] = []

        def fake_cursor(prompt: str, mode: str = "ask", **kw):
            _ = (mode, kw)
            calls.append(prompt)
            return {
                "tool": "vault_read",
                "args": {"query": "north star"},
                "speak": "From the store: maximum leverage, minimum noise.",
            }

        past = (datetime.now(timezone.utc) - timedelta(minutes=1)).strftime("%Y-%m-%dT%H:%M:%SZ")
        with tempfile.TemporaryDirectory(prefix="golden-scar-") as tmp:
            hive, vault = _hive(tmp)
            live = hive / "bus" / "scars.jsonl"
            SCARS.record(
                scar_id="cursor-auth-dark",
                symptom="UNKNOWN. Cursor agent needs a one-time login.",
                cause="fake auth fail",
                live=live,
                expires_at=past,
            )
            self.assertFalse(SCARS.blocks_cursor(live))
            out = TURN.apply_turn(
                "What is my north star?",
                hive=hive,
                retrieve_roots=[vault],
                cursor_fn=fake_cursor,
            )
            pack = hive / "bus" / "pipeline-pack.md"
            self.assertTrue(pack.is_file())
            self.assertNotIn("argv.append", pack.read_text(encoding="utf-8")[:20])
        self.assertTrue(calls, "expired scar must not skip the model")
        self.assertIn("leverage", (out.get("spoken") or "").lower())
        self.assertNotIn(CANNED_CAN, out.get("spoken") or "")

    def test_6_conversation_without_tool_still_answers(self) -> None:
        def fake_cursor(prompt: str, mode: str = "ask", **kw):
            _ = (prompt, mode, kw)
            return {"speak": "I have the vault, this repo, and this sitting. What are we working on?"}

        with tempfile.TemporaryDirectory(prefix="golden-speak-") as tmp:
            hive, vault = _hive(tmp)
            out = TURN.apply_turn(
                "Hello Jarvis",
                hive=hive,
                retrieve_roots=[vault],
                cursor_fn=fake_cursor,
            )
        self.assertEqual(out.get("verb"), "converse")
        self.assertNotEqual(out.get("verb"), "can")
        self.assertNotIn(CANNED_CAN, out.get("spoken") or "")
        self.assertIn("sitting", (out.get("spoken") or "").lower())
        self.assertIn("store", (out.get("wires") or []))
        self.assertNotIn("Wires, not vibes", out.get("spoken") or "")
        self.assertNotIn("Then.", out.get("spoken") or "")

    def test_7_tts_first_delta_before_done(self) -> None:
        def fake_cursor(prompt: str, mode: str = "ask", **kw):
            _ = (prompt, mode, kw)
            return {
                "tool": "vault_read",
                "args": {"query": "north star"},
                "speak": "First sentence starts now. Second sentence can wait.",
            }

        with tempfile.TemporaryDirectory(prefix="golden-delta-") as tmp:
            hive, vault = _hive(tmp)
            events = list(
                TURN.apply_turn_iter(
                    "What is my north star?",
                    hive=hive,
                    retrieve_roots=[vault],
                    cursor_fn=fake_cursor,
                )
            )
        self.assertGreaterEqual(len(events), 2)
        first = events[0]
        last = events[-1]
        self.assertTrue(first.get("spoken_delta"))
        self.assertTrue(first.get("partial") or not first.get("done"))
        self.assertIn("First sentence", first.get("spoken_delta") or "")
        self.assertTrue(last.get("done"))
        self.assertIn("leverage", (last.get("spoken") or "").lower())

    def test_8_safari_see_invokes_see_py(self) -> None:
        saw: list[str] = []

        def fake_cursor(prompt: str, mode: str = "ask", **kw):
            _ = (prompt, mode, kw)
            return {"tool": "safari_see", "args": {"act": "scroll"}, "speak": "Scrolling."}

        real_scroll = TURN.PIPELINE.SEE.safari_scroll

        def wrap_scroll(direction: str = "down"):
            saw.append(direction)
            return {
                "ok": True,
                "wire": "safari",
                "path": "cgevent",
                "spoken": f"I scrolled the tab {direction}",
            }

        with tempfile.TemporaryDirectory(prefix="golden-see-py-") as tmp:
            hive, vault = _hive(tmp)
            TURN.PIPELINE.SEE.safari_scroll = wrap_scroll
            try:
                out = TURN.apply_turn(
                    "Scroll the page",
                    hive=hive,
                    retrieve_roots=[vault],
                    cursor_fn=fake_cursor,
                )
            finally:
                TURN.PIPELINE.SEE.safari_scroll = real_scroll
        self.assertEqual(saw, ["down"])
        self.assertEqual(out.get("verb"), "safari_see")
        self.assertIn("scrolled the tab", (out.get("spoken") or "").lower())

    def test_9_dark_cursor_does_not_speak_pack_or_asks(self) -> None:
        calls: list[str] = []

        def dark_cursor(prompt: str, mode: str = "ask", **kw):
            _ = (mode, kw)
            calls.append(prompt)
            return {
                "ok": False,
                "unknown": True,
                "wire": "cursor",
                "spoken": (
                    "UNKNOWN. Cursor agent needs a one-time login. "
                    "Run agent login in Terminal."
                ),
            }

        with tempfile.TemporaryDirectory(prefix="golden-no-pack-") as tmp:
            hive, vault = _hive(tmp)
            asks = vault / "CONTENT" / "os"
            asks.mkdir(parents=True)
            (asks / "ASKS.md").write_text(
                "- 22:48 — If you don't know how to build your own agentic OS, "
                "then you are falling behind. But not for the reason you think. "
                "It's not because you need some fancy dashboard or a Jarvis setup.\n",
                encoding="utf-8",
            )
            (hive / "agent-stack.json").write_text(
                '{"name":"hive","repo":"/repo","vault":{}}\n',
                encoding="utf-8",
            )
            first = TURN.apply_turn(
                "Hi Jarvis",
                hive=hive,
                retrieve_roots=[vault],
                cursor_fn=dark_cursor,
            )
            second = TURN.apply_turn(
                "He's Jarvis",
                hive=hive,
                retrieve_roots=[vault],
                cursor_fn=dark_cursor,
            )
        spoken = second.get("spoken") or ""
        self.assertEqual(len(calls), 1)
        self.assertIn("agent login", first.get("spoken") or "")
        for leak in ("adopted path missing", "22:48", "agentic OS"):
            self.assertNotIn(leak, spoken)
        self.assertNotIn("I heard you", spoken)
        self.assertNotIn("Before that you said", spoken)
        self.assertNotIn("one-time login", spoken.lower())
        self.assertNotIn("Last you said", spoken)
        self.assertNotIn("You were at", spoken)
        self.assertTrue(spoken.startswith("Sir."))
        self.assertIn("agent login", spoken.lower())

    def test_10_converse_is_default_not_a_template(self) -> None:
        def fake_cursor(prompt: str, mode: str = "ask", **kw):
            _ = (mode, kw)
            self.assertIn("Conversation is the product", prompt)
            return {"speak": "Quiet evening. Vault and this sitting are on the table."}

        with tempfile.TemporaryDirectory(prefix="golden-converse-") as tmp:
            hive, vault = _hive(tmp)
            out = TURN.apply_turn(
                "how's it going",
                hive=hive,
                retrieve_roots=[vault],
                cursor_fn=fake_cursor,
            )
        spoken = out.get("spoken") or ""
        self.assertEqual(out.get("verb"), "converse")
        self.assertIn("Quiet evening", spoken)
        self.assertNotIn("Wires, not vibes", spoken)
        self.assertNotIn("I'm here.", spoken)
        self.assertNotIn(CANNED_CAN, spoken)

    def test_11_marketing_is_not_auto_skill_dump(self) -> None:
        def fake_cursor(prompt: str, mode: str = "ask", **kw):
            _ = (mode, kw)
            return {"speak": "Marketing is how you pick who pays and what you say to them."}

        with tempfile.TemporaryDirectory(prefix="golden-mktg-") as tmp:
            hive, vault = _hive(tmp)
            talk = TURN.apply_turn(
                "what is marketing",
                hive=hive,
                retrieve_roots=[vault],
                cursor_fn=fake_cursor,
            )
            course = TURN.apply_turn(
                "brief me on BUS203",
                hive=hive,
                retrieve_roots=[vault],
                cursor_fn=lambda p, mode="ask", **kw: {
                    "tool": "vault_read",
                    "args": {"query": "brief me on BUS203"},
                    "speak": "From the course.",
                },
            )
        talk_spoken = talk.get("spoken") or ""
        course_spoken = course.get("spoken") or ""
        self.assertEqual(talk.get("verb"), "converse")
        self.assertIn("who pays", talk_spoken.lower())
        self.assertNotIn("BUS602", talk_spoken)
        self.assertNotIn("professional skills again", talk_spoken.lower())
        self.assertNotIn("## When", talk_spoken)
        self.assertIn("BUS203", course_spoken)

    def test_12_dark_cursor_does_not_echo_the_thread(self) -> None:
        os.environ["AGENT_STACK_CURSOR_DRY"] = "1"
        banned = ("Last you said", "You were at", "Still on that", "Going.")
        with tempfile.TemporaryDirectory(prefix="golden-thread-") as tmp:
            hive, vault = _hive(tmp)
            (hive / "bus" / "state.json").write_text(
                json.dumps({"schema_version": 1, "cursor_login_said": True, "turns": []})
                + "\n",
                encoding="utf-8",
            )
            first = TURN.apply_turn(
                "how's it going", hive=hive, retrieve_roots=[vault]
            )
            second = TURN.apply_turn(
                "what did I just say", hive=hive, retrieve_roots=[vault]
            )
            third = TURN.apply_turn(
                "yeah keep going", hive=hive, retrieve_roots=[vault]
            )
        a = first.get("spoken") or ""
        b = second.get("spoken") or ""
        c = third.get("spoken") or ""
        for spoken in (a, b, c):
            self.assertTrue(spoken.startswith("Sir."), spoken)
            self.assertIn("agent login", spoken.lower())
            self.assertNotIn("how's it going", spoken.lower())
            self.assertNotIn("what did i just say", spoken.lower())
            self.assertNotIn("Wires, not vibes", spoken)
            self.assertNotIn("BUS602", spoken)
            self.assertNotIn("LESSONS:", spoken)
            self.assertNotIn("professional skills again", spoken.lower())
            for phrase in banned:
                self.assertNotIn(phrase, spoken)

    def test_12b_logged_in_cursor_speaks_model_prose(self) -> None:
        replies = (
            "Quiet evening. The sitting is on the table.",
            "You asked how the evening was going.",
            "Same thread. I am still with you.",
        )
        calls: list[str] = []

        def fake_cursor(prompt: str, mode: str = "ask", **kw):
            _ = (mode, kw)
            calls.append(prompt)
            return {"speak": replies[len(calls) - 1]}

        with tempfile.TemporaryDirectory(prefix="golden-logged-in-") as tmp:
            hive, vault = _hive(tmp)
            first = TURN.apply_turn(
                "how's it going",
                hive=hive,
                retrieve_roots=[vault],
                cursor_fn=fake_cursor,
            )
            second = TURN.apply_turn(
                "what did I just say",
                hive=hive,
                retrieve_roots=[vault],
                cursor_fn=fake_cursor,
            )
            third = TURN.apply_turn(
                "yeah keep going",
                hive=hive,
                retrieve_roots=[vault],
                cursor_fn=fake_cursor,
            )
        self.assertEqual(len(calls), 3)
        self.assertIn("Quiet evening", first.get("spoken") or "")
        self.assertIn("evening was going", second.get("spoken") or "")
        self.assertIn("still with you", third.get("spoken") or "")
        for spoken in (
            first.get("spoken") or "",
            second.get("spoken") or "",
            third.get("spoken") or "",
        ):
            self.assertNotIn("Last you said", spoken)
            self.assertNotIn("You were at", spoken)
            self.assertNotIn("Still on that", spoken)

    def test_13_hard_step_still_proposal(self) -> None:
        with tempfile.TemporaryDirectory(prefix="golden-hard-") as tmp:
            hive, vault = _hive(tmp)
            out = TURN.apply_turn(
                "publish this now",
                hive=hive,
                retrieve_roots=[vault],
                cursor_fn=lambda p, mode="ask", **kw: {
                    "tool": "converse",
                    "speak": "I will publish it.",
                },
            )
        self.assertEqual(out.get("verb"), "refuse_hard_step")
        self.assertIn("Proposal only", out.get("spoken") or "")
        self.assertNotIn("I will publish it", out.get("spoken") or "")


if __name__ == "__main__":
    unittest.main()
