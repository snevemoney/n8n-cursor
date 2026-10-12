#!/usr/bin/env python3
"""Last-wire is for Jarvis heal. Not spoken. Not a vault dump."""
from __future__ import annotations

import importlib.util
import tempfile
import unittest
from pathlib import Path

BUS_IO_PATH = Path(__file__).resolve().parent / "bus_io.py"

SCRIPT = Path(__file__).resolve().parent / "last_wire.py"


def _load():
    spec = importlib.util.spec_from_file_location("agent_stack_last_wire", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {SCRIPT}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load()


def _bus():
    spec = importlib.util.spec_from_file_location("agent_stack_bus_io_lw", BUS_IO_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError("cannot load bus_io")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


BIO = _bus()


class LastWireTest(unittest.TestCase):
    def test_write_read_keeps_path_not_as_spoken_file(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-last-wire-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            gen = BIO.begin_turn(hive)
            row = MOD.write(
                hive,
                verb="safari",
                ok=False,
                human_line="Safari could not scroll.",
                wire={"path": "cgevent", "error": "CGEvent page key dark", "url": None, "scar": None},
                utterance="scroll",
                gen=gen,
            )
            self.assertEqual(row["verb"], "safari")
            self.assertFalse(row["ok"])
            self.assertFalse(row["retried"])
            self.assertEqual(row["wire"]["path"], "cgevent")
            got = MOD.read(hive)
            self.assertEqual(got["wire"]["path"], "cgevent")
            self.assertEqual(got["utterance"], "scroll")
            self.assertIn("cgevent", (hive / "bus" / "last-wire.json").read_text(encoding="utf-8"))

    def test_inspect_line_names_path_when_asked(self) -> None:
        line = MOD.inspect_line(
            {
                "verb": "safari",
                "ok": False,
                "wire": {"path": "cgevent", "scar": None, "url": None, "error": "page key dark"},
            }
        )
        self.assertIn("path=cgevent", line)
        self.assertIn("Last hand: safari", line)

    def test_write_read_keeps_job_id(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-last-wire-job-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            gen = BIO.begin_turn(hive)
            row = MOD.write(
                hive,
                verb="cursor_browser",
                ok=True,
                human_line="I'll have Cursor watch that tab.",
                wire={"path": "cursor-browser-job", "job_id": "cb-dQw4w9WgXcQ-test", "url": None, "scar": None, "error": None},
                utterance="watch this youtube",
                gen=gen,
            )
            self.assertEqual(row["wire"]["job_id"], "cb-dQw4w9WgXcQ-test")
            got = MOD.read(hive)
            self.assertEqual(got["wire"]["job_id"], "cb-dQw4w9WgXcQ-test")
            self.assertIn("job=cb-dQw4w9WgXcQ-test", MOD.inspect_line(got))

    def test_write_keeps_outcome_and_source(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-last-wire-out-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            gen = BIO.begin_turn(hive)
            row = MOD.write(
                hive,
                verb="vault_read",
                ok=True,
                human_line="The live note has lamp code 7K2.",
                wire={
                    "path": "openrouter",
                    "source": "live_vault",
                    "outcome": "MODEL_TALK",
                    "evidence": "CONTENT/os/jarvis-bite2-fixtures/nested-fact.md",
                    "provider": "openrouter",
                    "tool": "converse",
                },
                utterance="what lamp code",
                gen=gen,
            )
            got = MOD.read(hive)
        self.assertEqual(row["wire"]["source"], "live_vault")
        self.assertEqual(got["wire"]["outcome"], "MODEL_TALK")
        self.assertIn("source=live_vault", MOD.inspect_line(got))
        self.assertIn("outcome=MODEL_TALK", MOD.inspect_line(got))


class ProviderModelReceiptTest(unittest.TestCase):
    def test_receipt_retains_model_without_accepting_credentials(self):
        with tempfile.TemporaryDirectory() as tmp:
            hive=Path(tmp)
            (hive/"bus").mkdir()
            gen=BIO.begin_turn(hive)
            MOD.write(hive,verb="converse",ok=True,human_line="An answer.",wire={"provider":"openrouter","model":"fixture/model","api_key":"must-not-be-recorded"},gen=gen)
            receipt=MOD.read(hive)
        self.assertEqual(receipt["wire"]["model"],"fixture/model")
        self.assertNotIn("api_key",receipt["wire"])
        self.assertNotIn("must-not-be-recorded",str(receipt))
