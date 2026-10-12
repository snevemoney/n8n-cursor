#!/usr/bin/env python3
"""Dry 8/8 computer-use plate. No live HID. No Watch click."""
from __future__ import annotations

import importlib.util
import json
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
RUN = HERE / "run.py"
PLATE = HERE / "plate.yaml"


def _load():
    spec = importlib.util.spec_from_file_location("agent_stack_computer_plate", RUN)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {RUN}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load()


class ComputerPlateTest(unittest.TestCase):
    def test_plate_has_eight_rows_and_two_holdouts(self) -> None:
        plate = MOD.load_plate(PLATE)
        self.assertEqual(len(plate["rows"]), 8)
        self.assertEqual(
            [row["id"] for row in plate["rows"] if row.get("holdout")],
            ["click_go", "type_hive"],
        )
        text = PLATE.read_text(encoding="utf-8")
        self.assertNotIn("click Next", text.split("click_go", 1)[1].split("type_hive", 1)[0])

    def test_dry_plate_is_eight_of_eight(self) -> None:
        out = MOD.run_plate(live=False)
        self.assertEqual(out.get("n_runs"), 8, out)
        self.assertEqual(out.get("n_ok"), 8, json.dumps(out.get("rows"), indent=2))
        self.assertTrue(out.get("ok"), out)
        self.assertFalse(out.get("live"))
        by_id = {row["id"]: row for row in out["rows"]}
        self.assertTrue(by_id["click_go"]["holdout"])
        self.assertTrue(by_id["type_hive"]["holdout"])
        self.assertFalse(by_id["click_next"]["holdout"])
        self.assertEqual(by_id["refuse_send"]["op"], "hard")
        self.assertEqual(by_id["watch_off"]["op"], "deny")

    def test_run_tool_door_stays_on_stroke(self) -> None:
        src = (HERE.parents[1] / "brain" / "pipeline.py").read_text(encoding="utf-8")
        start = src.find('if tool == "mac_act":')
        end = src.find("def _watch_stopped", start)
        body = src[start:end]
        self.assertIn("commit_watch_stroke", body)
        self.assertNotIn("SEE.mac_act(\n            op,", body)


if __name__ == "__main__":
    unittest.main()
