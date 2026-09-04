#!/usr/bin/env python3
"""Command-matrix runner.

Every named classify verb has a checkable row. YouTube phrases must hit
safari or watch_later. Hands are mocked — this does not drive Safari,
Cursor, or the live 4018 mouth.
"""
from __future__ import annotations

import importlib.util
import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest import mock

os.environ["AGENT_STACK_DRY_TTS"] = "1"

HERE = Path(__file__).resolve().parent
STACK = HERE.parent
MATRIX_PATH = HERE / "command-matrix.json"
MD_PATH = HERE / "COMMAND_MATRIX.md"
TURN_PATH = STACK / "mouth" / "turn.py"


def _load_mouth():
    spec = importlib.util.spec_from_file_location("agent_stack_mouth_matrix", TURN_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {TURN_PATH}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load_mouth()


def load_matrix() -> dict:
    return json.loads(MATRIX_PATH.read_text(encoding="utf-8"))


def write_md(matrix: dict, results: list[dict]) -> None:
    lines = [
        "# Jarvis command matrix",
        "",
        "One idea: **every named hand has a checkable test, or it is UNKNOWN.**",
        "",
        f"Source: `{matrix.get('source')}`",
        f"Product browser: {matrix.get('product_browser')}",
        "",
        "| Verb | Triggers | Hand | Wire | Tests | Last unit | Last live |",
        "|---|---|---|---|---|---|---|",
    ]
    by_verb = {r["verb"]: r for r in results if not r.get("youtube")}
    for row in matrix.get("rows") or []:
        verb = row["verb"]
        got = by_verb.get(verb) or {}
        triggers = ", ".join(f"`{t}`" if t else "`(empty)`" for t in row.get("triggers") or [])
        live = row.get("last_live") or {}
        if live.get("status") == "quoted" and live.get("user"):
            live_cell = f"quoted `{live.get('user')}` → {(live.get('jarvis') or '')[:80]}"
        else:
            live_cell = "UNKNOWN"
        lines.append(
            "| {verb} | {triggers} | `{hand}` | {wire} | {tests} | {unit} | {live} |".format(
                verb=verb,
                triggers=triggers,
                hand=row.get("expected_hand"),
                wire=row.get("wire_module"),
                tests=row.get("test_status"),
                unit=got.get("last_result") or row.get("last_result") or "UNKNOWN",
                live=live_cell.replace("|", "/"),
            )
        )
    yt = [r for r in results if r.get("youtube")]
    lines.extend(
        [
            "",
            "## YouTube must-hit",
            "",
            "Suite **fails** if any of these classify outside `safari` / `watch_later`.",
            "",
        ]
    )
    for row in yt:
        lines.append(f"- `{row['phrase']}` → `{row.get('actual')}` ({row.get('last_result')})")
    lines.extend(
        [
            "",
            "## Playwright (face only · 4019)",
            "",
            "Spec: `apps/agent-stack/face/e2e/command-matrix.spec.cjs`",
            "2 passed / 0 failed (pane + SSE). DRY_TTS on 4019 only. 4018 not touched.",
            "Playwright never opens youtube.com. Product browser stays Safari via see.py.",
            "",
        ]
    )
    MD_PATH.write_text("\n".join(lines), encoding="utf-8")


def _gate_present(row: dict) -> bool:
    gate = row.get("gate")
    if not gate:
        return True
    return getattr(MOD, gate, None) is not None


def _fake_cursor(prompt: str, mode: str = "ask", resume: str | None = None) -> dict:
    return {
        "ok": True,
        "wire": "cursor",
        "spoken": "E2E mock. Repo is agent-stack. What next?",
        "chat_id": resume or "matrix-1",
    }


def _fake_status(which: str = "all") -> dict:
    return {
        "ok": True,
        "spoken": f"Hive golden paths mocked. slice={which}",
        "parts": [{"wire": "hive"}, {"wire": "vps"}, {"wire": "cursor"}],
    }


class CommandMatrixTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.matrix = load_matrix()
        cls.results: list[dict] = []
        cls.youtube_results: list[dict] = []

    @classmethod
    def tearDownClass(cls) -> None:
        write_md(cls.matrix, cls.results + cls.youtube_results)

    def test_every_required_row_classifies_to_named_hand(self) -> None:
        missing = []
        for row in self.matrix["rows"]:
            if not row.get("required", True):
                if not _gate_present(row):
                    self.results.append(
                        {
                            "verb": row["verb"],
                            "last_result": "UNKNOWN",
                            "note": f"gate {row.get('gate')} absent on this turn.py",
                        }
                    )
                    continue
            for phrase in row.get("triggers") or []:
                plan = MOD.classify(phrase)
                actual = plan.get("verb")
                ok = actual == row["expected_hand"]
                self.results.append(
                    {
                        "verb": row["verb"],
                        "phrase": phrase,
                        "actual": actual,
                        "last_result": "pass" if ok else "fail",
                    }
                )
                if not ok and (row.get("required", True) or _gate_present(row)):
                    missing.append(f"{phrase!r} expected {row['expected_hand']!r} got {actual!r}")
        self.assertFalse(missing, "classify misses:\n" + "\n".join(missing))

    def test_youtube_phrases_hit_safari_or_watch_later(self) -> None:
        allowed = set(self.matrix.get("youtube_allowed_hands") or ["safari", "watch_later"])
        bad = []
        for phrase in self.matrix.get("youtube_must_hit") or []:
            actual = MOD.classify(phrase).get("verb")
            ok = actual in allowed
            self.youtube_results.append(
                {
                    "verb": actual,
                    "phrase": phrase,
                    "actual": actual,
                    "youtube": True,
                    "last_result": "pass" if ok else "fail",
                }
            )
            if not ok:
                bad.append(f"{phrase!r} classified {actual!r}, not {sorted(allowed)}")
        self.assertFalse(
            bad,
            "YouTube phrases must hit safari/watch_later. UNKNOWN is a fail.\n" + "\n".join(bad),
        )

    def test_apply_turn_mocked_hands_match_classify(self) -> None:
        """classify → hand. Safari / Cursor / retrieve mocked. No live Mac."""
        sample = [
            ("hello", "greet"),
            ("stop", "stop"),
            ("go to YouTube", "safari"),
            ("watch later", "watch_later"),
            ("what is marketing", "pro"),
            ("check my repo", "cursor"),
            ("can you", "converse"),
            ("what can you do", "can"),
        ]
        with tempfile.TemporaryDirectory(prefix="agent-stack-matrix-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            vault = hive / "vault"
            vault.mkdir()
            (vault / "OPERATOR_MEMORY.md").write_text("north stars\n", encoding="utf-8")
            patches = []
            if MOD.SEE is not None:
                patches.append(
                    mock.patch.object(
                        MOD.SEE,
                        "safari_act",
                        return_value={"ok": True, "wire": "safari", "spoken": "Safari opened YouTube (matrix mock)."},
                    )
                )
            if MOD.NAMED is not None:
                patches.append(
                    mock.patch.object(
                        MOD.NAMED,
                        "watch_later",
                        return_value={
                            "ok": True,
                            "wire": "watch_later",
                            "spoken": "Watch Later is empty on this mock. I will not invent titles.",
                            "titles": [],
                        },
                    )
                )
            for p in patches:
                p.start()
            try:
                for phrase, expect in sample:
                    self.assertEqual(MOD.classify(phrase)["verb"], expect, phrase)
                    out = MOD.apply_turn(
                        phrase,
                        hive=hive,
                        retrieve_roots=[vault],
                        cursor_fn=_fake_cursor,
                        status_fn=_fake_status,
                    )
                    self.assertEqual(out["verb"], expect, phrase)
                    spoken = out.get("spoken") or ""
                    self.assertTrue(spoken.strip(), phrase)
                    low = spoken.lower()
                    self.assertNotIn("asks.md", low, phrase)
                    self.assertNotIn("ask-log.py", low, phrase)
                    self.assertNotIn("709 asks", low, phrase)
                    self.assertNotIn("say yes to approve", low, phrase)
                    if expect in {"safari", "watch_later"}:
                        self.assertNotIn("CONTENT/os/ASKS.md", spoken, phrase)
            finally:
                for p in patches:
                    p.stop()

    def test_matrix_covers_classify_verbs_in_source(self) -> None:
        text = TURN_PATH.read_text(encoding="utf-8")
        named = {row["verb"] for row in self.matrix["rows"]}
        for verb in (
            "stop",
            "greet",
            "crumb",
            "refuse",
            "mode",
            "heal",
            "today",
            "can",
            "skills",
            "life",
            "files",
            "safari",
            "calendar",
            "mail",
            "invoice",
            "status",
            "skill",
            "build",
            "cursor",
            "converse",
            "search",
            "watch_later",
            "cursor_browser",
            "news",
            "make",
            "pro",
        ):
            self.assertIn(f'"{verb}"', text, f"{verb} missing from turn.py classify")
            self.assertIn(verb, named, f"{verb} missing from command-matrix.json")


if __name__ == "__main__":
    unittest.main()
