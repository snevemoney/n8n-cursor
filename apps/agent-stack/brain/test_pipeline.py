#!/usr/bin/env python3
"""Pipeline pick: one Cursor call. Do not loop agent -p on login UNKNOWN."""
from __future__ import annotations

import importlib.util
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

    def test_prose_pick_still_retries_once(self) -> None:
        calls: list[str] = []

        def prose_then_pick(prompt: str, mode: str = "ask", **kw):
            _ = (mode, kw)
            calls.append(prompt)
            if len(calls) == 1:
                return {"ok": True, "spoken": "I will think about it in paragraphs."}
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
                cursor_fn=prose_then_pick,
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


if __name__ == "__main__":
    unittest.main()
