#!/usr/bin/env python3
"""Pipeline pick: one Cursor call. Do not loop agent -p on login UNKNOWN."""
from __future__ import annotations

import importlib.util
import json
import os
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parent / "pipeline.py"
TURN = Path(__file__).resolve().parent.parent / "mouth" / "turn.py"


def _load(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


PIPE = _load("agent_stack_pipeline_test", SCRIPT)
MOUTH = _load("agent_stack_mouth_pipeline_test", TURN)


class PipelineDarkCursorTest(unittest.TestCase):
    def test_first_sentence_keeps_sir_with_beat(self) -> None:
        first, rest = PIPE.first_sentence("Sir. Wires, not vibes. The store is on disk.")
        self.assertEqual(first, "Sir. Wires, not vibes.")
        self.assertEqual(rest, "The store is on disk.")

    def test_login_unknown_does_not_retry_p(self) -> None:
        calls: list[str] = []

        def dark_cursor(prompt: str, mode: str = "ask", **kw):
            _ = (mode, kw)
            calls.append(prompt)
            return {
                "ok": False,
                "unknown": True,
                "wire": "cursor",
                "spoken": PIPE.LOGIN_UNKNOWN,
            }

        with tempfile.TemporaryDirectory(prefix="pipeline-login-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir(parents=True)
            (hive / "vault").mkdir(parents=True)
            out = MOUTH.apply_turn(
                "Hello what happened",
                hive=hive,
                retrieve_roots=[hive / "vault"],
                cursor_fn=dark_cursor,
            )
            last = PIPE.LAST_WIRE.read(hive) if PIPE.LAST_WIRE is not None else {}
        self.assertEqual(len(calls), 1)
        self.assertTrue(out.get("unknown") or out.get("verb") == "pipeline")
        self.assertIn("agent login", out.get("spoken") or "")
        self.assertNotIn("returned no reply", out.get("spoken") or "")
        self.assertNotIn("XAI_API_KEY", out.get("spoken") or "")
        self.assertEqual((last.get("wire") or {}).get("path"), "cursor")
        self.assertIn("agent login", str((last.get("wire") or {}).get("error") or ""))

    def test_prose_pick_is_converse_no_retry(self) -> None:
        calls: list[str] = []

        def prose_cursor(prompt: str, mode: str = "ask", **kw):
            _ = (mode, kw)
            calls.append(prompt)
            return {"ok": True, "spoken": "I will think about it in paragraphs."}

        with tempfile.TemporaryDirectory(prefix="pipeline-prose-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir(parents=True)
            (hive / "vault").mkdir(parents=True)
            out = MOUTH.apply_turn(
                "how's it going",
                hive=hive,
                retrieve_roots=[hive / "vault"],
                cursor_fn=prose_cursor,
            )
        self.assertEqual(len(calls), 1)
        self.assertEqual(out.get("verb"), "converse")
        self.assertIn("paragraphs", out.get("spoken") or "")
        self.assertNotIn("Wires, not vibes", out.get("spoken") or "")
        self.assertNotIn("JSON only", calls[0])

    def test_garbage_pick_still_retries_once(self) -> None:
        calls: list[str] = []

        def empty_then_pick(prompt: str, mode: str = "ask", **kw):
            _ = (mode, kw)
            calls.append(prompt)
            if len(calls) == 1:
                return {"ok": True, "spoken": ""}
            return {
                "tool": "status",
                "args": {"which": "cursor"},
                "speak": "Cursor agent is present.",
            }

        def fake_status(which: str = "all") -> dict:
            return {"ok": True, "spoken": f"Wires {which}.", "wire": "status"}

        with tempfile.TemporaryDirectory(prefix="pipeline-retry-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir(parents=True)
            (hive / "vault").mkdir(parents=True)
            out = MOUTH.apply_turn(
                "What is the status",
                hive=hive,
                retrieve_roots=[hive / "vault"],
                cursor_fn=empty_then_pick,
                status_fn=fake_status,
            )
        self.assertEqual(len(calls), 2)
        self.assertIn("JSON only", calls[1])
        self.assertEqual(out.get("verb"), "status")
        self.assertIn("Wires", out.get("spoken") or "")

    def test_login_unknown_once_then_store_converse(self) -> None:
        calls: list[str] = []

        def dark_cursor(prompt: str, mode: str = "ask", **kw):
            _ = (mode, kw)
            calls.append(prompt)
            return {
                "ok": False,
                "unknown": True,
                "wire": "cursor",
                "spoken": PIPE.LOGIN_UNKNOWN,
            }

        with tempfile.TemporaryDirectory(prefix="pipeline-login-once-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir(parents=True)
            (hive / "vault").mkdir(parents=True)
            first = MOUTH.apply_turn(
                "Hi Jarvis",
                hive=hive,
                retrieve_roots=[hive / "vault"],
                cursor_fn=dark_cursor,
            )
            second = MOUTH.apply_turn(
                "Hello didn't you hear me",
                hive=hive,
                retrieve_roots=[hive / "vault"],
                cursor_fn=dark_cursor,
            )
        self.assertEqual(len(calls), 1)
        self.assertIn("agent login", first.get("spoken") or "")
        second_spoken = second.get("spoken") or ""
        self.assertNotIn("I heard you", second_spoken)
        self.assertNotIn("Before that you said", second_spoken)
        self.assertNotIn("already said", second_spoken.lower())
        self.assertNotIn("one-time login", second_spoken.lower())
        self.assertNotIn("adopted path missing", second_spoken.lower())
        self.assertNotIn("returned no reply", second_spoken)
        self.assertNotEqual(second.get("verb"), "can")
        self.assertTrue(second_spoken.startswith("Sir."))
        self.assertRegex(second_spoken.lower(), r"(here|working on|evens|disk)")

    def test_safari_see_calls_see_py_front(self) -> None:
        called: list[str] = []

        def fake_cursor(prompt: str, mode: str = "ask", **kw):
            _ = (prompt, mode, kw)
            return {"tool": "safari_see", "args": {"act": "front"}, "speak": "Looking."}

        def fake_front():
            called.append("front")
            return {"ok": True, "wire": "safari", "spoken": "The front tab is Example.", "title": "Example"}

        real = MOUTH.PIPELINE.SEE.safari_front
        MOUTH.PIPELINE.SEE.safari_front = fake_front
        try:
            with tempfile.TemporaryDirectory(prefix="pipeline-see-") as tmp:
                hive = Path(tmp)
                (hive / "bus").mkdir(parents=True)
                (hive / "vault").mkdir(parents=True)
                out = MOUTH.apply_turn(
                    "Look at this page",
                    hive=hive,
                    retrieve_roots=[hive / "vault"],
                    cursor_fn=fake_cursor,
                )
        finally:
            MOUTH.PIPELINE.SEE.safari_front = real
        self.assertEqual(called, ["front"])
        self.assertEqual(out.get("verb"), "safari_see")
        self.assertIn("Example", out.get("spoken") or "")

    def test_pack_includes_full_school_shelf(self) -> None:
        with tempfile.TemporaryDirectory(prefix="pipeline-school-pack-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir(parents=True)
            pack = PIPE.write_pack("the whole shelf", hive=hive, retrieve_roots=[], turns=[])
            body = pack.read_text(encoding="utf-8")
        self.assertIn("School shelf", body)
        self.assertIn("164", body)
        self.assertIn("Count: **42**", body)
        self.assertNotIn("## When", body)
        self.assertIn("BUS203", body)
        self.assertIn("mktg-value-stp-mix-plan-checklists", body)

    def test_vault_read_whole_shelf_is_not_bus206_only(self) -> None:
        def fake_cursor(prompt: str, mode: str = "ask", **kw):
            _ = (prompt, mode, kw)
            return {
                "tool": "vault_read",
                "args": {"query": "the whole shelf"},
                "speak": "From the school shelf.",
            }

        with tempfile.TemporaryDirectory(prefix="pipeline-shelf-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir(parents=True)
            (hive / "vault").mkdir(parents=True)
            out = MOUTH.apply_turn(
                "the whole shelf",
                hive=hive,
                retrieve_roots=[hive / "vault"],
                cursor_fn=fake_cursor,
            )
        spoken = out.get("spoken") or ""
        self.assertIn("164", spoken)
        self.assertIn("on disk", spoken.lower())
        self.assertNotIn("## When", spoken)
        self.assertIn("school", (out.get("wires") or []))
        self.assertLess(spoken.lower().count("bus206"), 3)

    def test_store_converse_does_not_speak_asks_or_pack(self) -> None:
        calls: list[str] = []

        def dark_cursor(prompt: str, mode: str = "ask", **kw):
            _ = (mode, kw)
            calls.append(prompt)
            return {
                "ok": False,
                "unknown": True,
                "wire": "cursor",
                "spoken": PIPE.LOGIN_UNKNOWN,
            }

        with tempfile.TemporaryDirectory(prefix="pipeline-no-pack-") as tmp:
            hive = Path(tmp)
            vault = hive / "vault"
            (hive / "bus").mkdir(parents=True)
            (vault / "CONTENT/os").mkdir(parents=True)
            (vault / "OPERATOR_MEMORY.md").write_text(
                "Jarvis can read the vault. North star: leverage.\n",
                encoding="utf-8",
            )
            (vault / "CONTENT/os/ASKS.md").write_text(
                "- 22:48 — If you don't know how to build your own agentic OS, "
                "then you are falling behind. But not for the reason you think. "
                "It's not because you need some fancy dashboard or a Jarvis setup.\n",
                encoding="utf-8",
            )
            (hive / "agent-stack.json").write_text(
                '{"name":"hive","repo":"/repo","vault":{}}\n',
                encoding="utf-8",
            )
            first = MOUTH.apply_turn(
                "Hi Jarvis",
                hive=hive,
                retrieve_roots=[vault],
                cursor_fn=dark_cursor,
            )
            second = MOUTH.apply_turn(
                "He's Jarvis",
                hive=hive,
                retrieve_roots=[vault],
                cursor_fn=dark_cursor,
            )
            why = MOUTH.apply_turn(
                "Why can't you think?",
                hive=hive,
                retrieve_roots=[vault],
                cursor_fn=dark_cursor,
            )
        spoken = second.get("spoken") or ""
        self.assertEqual(len(calls), 1)
        self.assertIn("agent login", first.get("spoken") or "")
        for leak in (
            "adopted path missing",
            "22:48",
            "agentic OS",
            "I heard you",
            "Before that you said",
            "one-time login",
        ):
            self.assertNotIn(leak, spoken)
        self.assertTrue(spoken.startswith("Sir."))
        self.assertRegex(spoken.lower(), r"(here|working on|evens|disk)")
        self.assertIn("one-time login", (why.get("spoken") or "").lower())


class Live4018MouthContractTest(unittest.TestCase):
    """Same door 4018 uses: apply_turn, no cursor_fn, skip-cursor store talk."""

    LEAKS = (
        "adopted path missing",
        "22:48",
        "agentic OS",
        "I already said Cursor needs",
        "structured long-term memory",
        "Watchdog GRADE",
        "factory close",
        "On disk:",
        "Per-agent business cheat sheets",
        "cache SSOT",
        "METHODS/",
        "Grok shared workflows",
    )

    def _live_hive(self, tmp: str) -> tuple[Path, Path]:
        hive = Path(tmp)
        vault = hive / "vault"
        (hive / "bus").mkdir(parents=True)
        (vault / "CONTENT/os").mkdir(parents=True)
        (vault / "OPERATOR_MEMORY.md").write_text(
            "This document is the **structured long-term memory** for Evens — "
            "decisions, goals, and lessons. The store still works on disk.\n",
            encoding="utf-8",
        )
        (vault / "CONTENT/os/ASKS.md").write_text(
            "- 22:48 — If you don't know how to build your own agentic OS, "
            "then you are falling behind. But not for the reason you think.\n",
            encoding="utf-8",
        )
        (hive / "agent-stack.json").write_text(
            '{"name":"hive","repo":"/repo","vault":{}}\n',
            encoding="utf-8",
        )
        (hive / "bus" / "state.json").write_text(
            json.dumps(
                {
                    "schema_version": 1,
                    "phase": "speak",
                    "job_status": "done",
                    "utterance": "Hey do you work now",
                    "spoken": (
                        "Sir. Wires, not vibes. This document is the **structured "
                        "long-term memory** for Evens. Vault: adopted path missing. "
                        "- 22:48 — If you don't know how to build your own agentic OS. "
                        "I already said Cursor needs a one-time login."
                    ),
                    "cursor_login_said": True,
                    "turns": [
                        {
                            "user": "Hello Jarvis",
                            "jarvis": (
                                "I heard you: Hello Jarvis. Before that you said: stop. "
                                "Vault: adopted path missing - 22:48 — agentic OS."
                            ),
                        }
                    ],
                }
            )
            + "\n",
            encoding="utf-8",
        )
        return hive, vault

    def test_apply_turn_without_cursor_fn_never_speaks_pack_or_vault(self) -> None:
        os.environ["AGENT_STACK_CURSOR_DRY"] = "1"
        os.environ["AGENT_STACK_DRY_TTS"] = "1"
        utterances = (
            "Hello Jarvis",
            "He's Jarvis",
            "Hey do you work now",
            (
                "Hello Jarvis I already said Cursor needs a one-time login. "
                "22:48 — agentic OS. Vault: adopted path missing"
            ),
        )
        with tempfile.TemporaryDirectory(prefix="pipeline-live-4018-") as tmp:
            hive, vault = self._live_hive(tmp)
            for utter in utterances:
                out = MOUTH.apply_turn(utter, hive=hive, retrieve_roots=[vault])
                spoken = out.get("spoken") or ""
                for leak in self.LEAKS:
                    self.assertNotIn(leak, spoken, f"{utter!r} spoke {spoken!r}")
                self.assertTrue(spoken.startswith("Sir."), spoken)
                self.assertRegex(spoken.lower(), r"(here|working on|evens|disk)")
                self.assertNotIn("Watchdog", spoken)
                self.assertNotIn("factory close", spoken.lower())
                self.assertNotIn("On disk:", spoken)

    def test_store_converse_answers_vault_not_hot(self) -> None:
        os.environ["AGENT_STACK_CURSOR_DRY"] = "1"
        os.environ["AGENT_STACK_DRY_TTS"] = "1"
        with tempfile.TemporaryDirectory(prefix="pipeline-answer-store-") as tmp:
            hive, vault = self._live_hive(tmp)
            (vault / "OPERATOR_MEMORY.md").write_text(
                "North star: maximum leverage, minimum noise.\n",
                encoding="utf-8",
            )
            (vault / "CONTENT/os/hot.md").write_text(
                "- 2026-08-27T05:05:00Z · factory close — Watchdog GRADE **pass**.\n",
                encoding="utf-8",
            )
            work = MOUTH.apply_turn(
                "Hey do you work now",
                hive=hive,
                retrieve_roots=[vault],
            )
            star = MOUTH.apply_turn(
                "What is my north star?",
                hive=hive,
                retrieve_roots=[vault],
            )
        work_spoken = work.get("spoken") or ""
        star_spoken = star.get("spoken") or ""
        self.assertNotIn("Watchdog", work_spoken)
        self.assertNotIn("factory close", work_spoken.lower())
        self.assertRegex(work_spoken.lower(), r"(here|working on)")
        self.assertIn("leverage", star_spoken.lower())
        self.assertNotIn("Watchdog", star_spoken)

    def test_cheat_sheet_wiki_stays_off_spoken(self) -> None:
        os.environ["AGENT_STACK_CURSOR_DRY"] = "1"
        os.environ["AGENT_STACK_DRY_TTS"] = "1"
        wiki = (
            "Per-agent business cheat sheets live under CONTENT/business-kits/ "
            "(cache SSOT → git → vault). Skills: Grok shared workflows + [[x]]; "
            "METHODS/ only after proven."
        )
        with tempfile.TemporaryDirectory(prefix="pipeline-no-cheats-") as tmp:
            hive, vault = self._live_hive(tmp)
            (vault / "OPERATOR_MEMORY.md").write_text(wiki + "\n", encoding="utf-8")
            out = MOUTH.apply_turn(
                "Where do the cheat sheets live?",
                hive=hive,
                retrieve_roots=[vault],
            )
        spoken = out.get("spoken") or ""
        for leak in (
            "Per-agent business cheat sheets",
            "cache SSOT",
            "METHODS/",
            "Grok shared workflows",
        ):
            self.assertNotIn(leak, spoken, spoken)
        self.assertTrue(spoken.startswith("Sir."), spoken)
        self.assertLess(len(spoken), 280)

    def test_store_converse_safari_see_calls_see_py(self) -> None:
        os.environ["AGENT_STACK_CURSOR_DRY"] = "1"
        os.environ["AGENT_STACK_DRY_TTS"] = "1"
        saw: list[str] = []

        def fake_see(utterance: str = ""):
            saw.append(utterance)
            return {
                "ok": True,
                "wire": "safari",
                "spoken": "I scrolled the tab down",
            }

        with tempfile.TemporaryDirectory(prefix="pipeline-store-see-") as tmp:
            hive, vault = self._live_hive(tmp)
            out = MOUTH.apply_turn(
                "Scroll the page",
                hive=hive,
                retrieve_roots=[vault],
                see_fn=fake_see,
            )
        self.assertEqual(saw, ["Scroll the page"])
        self.assertEqual(out.get("verb"), "safari_see")
        self.assertIn("scrolled the tab", (out.get("spoken") or "").lower())

    def test_two_asks_cannot_both_equal_lanes_default(self) -> None:
        os.environ["AGENT_STACK_CURSOR_DRY"] = "1"
        os.environ["AGENT_STACK_DRY_TTS"] = "1"
        lanes = PIPE.RETRIEVE.LANES_DEFAULT
        saw: list[str] = []

        def fake_see(utterance: str = ""):
            saw.append(utterance)
            return {
                "ok": True,
                "wire": "safari",
                "spoken": "YouTube is open",
            }

        with tempfile.TemporaryDirectory(prefix="pipeline-no-lanes-loop-") as tmp:
            hive, vault = self._live_hive(tmp)
            greet = MOUTH.apply_turn("Hello Jarvis", hive=hive, retrieve_roots=[vault])
            can = MOUTH.apply_turn("What can you do?", hive=hive, retrieve_roots=[vault])
            school = MOUTH.apply_turn(
                "Tell me about marketing",
                hive=hive,
                retrieve_roots=[vault],
            )
            tube = MOUTH.apply_turn(
                "YouTube",
                hive=hive,
                retrieve_roots=[vault],
                see_fn=fake_see,
            )
        greet_spoken = greet.get("spoken") or ""
        can_spoken = can.get("spoken") or ""
        school_spoken = school.get("spoken") or ""
        tube_spoken = tube.get("spoken") or ""
        self.assertNotEqual(greet_spoken, can_spoken)
        self.assertNotEqual(can_spoken, school_spoken)
        self.assertNotEqual(greet_spoken, school_spoken)
        self.assertNotEqual(greet_spoken, lanes)
        self.assertNotEqual(can_spoken, lanes)
        self.assertNotIn(lanes, greet_spoken)
        self.assertNotIn(lanes, can_spoken)
        self.assertNotIn(lanes, school_spoken)
        self.assertNotIn(lanes, tube_spoken)
        self.assertNotIn("On disk: Website / AI Partner", greet_spoken)
        self.assertNotIn("On disk: Website / AI Partner", can_spoken)
        self.assertIn("here", greet_spoken.lower())
        self.assertRegex(can_spoken.lower(), r"(vault|safari|school|status)")
        self.assertNotIn("BUS203", school_spoken)
        self.assertNotIn("BUS602", school_spoken)
        self.assertNotIn("## When", school_spoken)
        self.assertNotIn("Wires, not vibes", school_spoken)
        self.assertNotIn("professional skills again", school_spoken.lower())
        self.assertNotIn("Repetition is a kind of scholarship", school_spoken)
        self.assertNotIn("Per-agent business cheat sheets", school_spoken)
        self.assertNotIn("cache SSOT", school_spoken)
        self.assertNotIn("METHODS/", school_spoken)
        self.assertNotIn("From grad-mktg", school_spoken)
        self.assertLess(len(school_spoken), 280)
        self.assertEqual(tube.get("verb"), "safari_see")
        self.assertEqual(saw, ["YouTube"])
        self.assertIn("youtube", tube_spoken.lower())


if __name__ == "__main__":
    unittest.main()
