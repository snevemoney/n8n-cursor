"""Fixture checks for brief precedence. Does not publish or read live memory."""
from __future__ import annotations

import importlib.util
import tempfile
import unittest
from pathlib import Path

_SPEC = importlib.util.spec_from_file_location(
    "outer_heaven_brief",
    Path(__file__).with_name("outer-heaven-brief.py"),
)
assert _SPEC and _SPEC.loader
ohb = importlib.util.module_from_spec(_SPEC)
_SPEC.loader.exec_module(ohb)


class PrecedenceTests(unittest.TestCase):
    def test_last_decisions_block_wins(self) -> None:
        old = "H" * 700
        text = (
            "## DECISIONS (seeded)\n"
            + old
            + "\n## GOALS (seeded)\n"
            + "g" * 10
            + "\n## DECISIONS (seeded)\n"
            + "live / HOLD from later authority\n"
        )
        out = ohb._extract_section(text, "DECISIONS (seeded)", 600, which="last")
        self.assertIn("live / HOLD from later authority", out)
        self.assertNotIn("H" * 50, out)

    def test_first_match_still_available(self) -> None:
        text = "## DECISIONS (seeded)\nfirst\n## DECISIONS (seeded)\nsecond\n"
        out = ohb._extract_section(text, "DECISIONS (seeded)", 600, which="first")
        self.assertEqual(out, "first")

    def test_standing_locks_not_cut_at_600(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / ohb.STANDING_LOCKS_REL
            path.parent.mkdir(parents=True)
            body = "Live `/` HOLD\n" + ("x" * 800)
            path.write_text(body, encoding="utf-8")
            got = ohb._standing_locks(Path(tmp))
        self.assertIn("Live `/` HOLD", got)
        self.assertGreater(len(got), 600)


if __name__ == "__main__":
    unittest.main()
