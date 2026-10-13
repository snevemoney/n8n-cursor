"""Real-work #31: owner/board asks read the ACTIVE_TASKS row directly (no model). Synthetic table only."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import pickup  # noqa: E402

TABLE = """| Surface | Owner | Since |
|---|---|---|
| Widget polish (board `~/x/COWORK-WIDGET-POLISH-20990101.md`) | Alpha desk + Beta reviewer | 01:00 |
| Docs sweep | Gamma | 02:00 |
"""


def test_owner_and_board_from_row():
    got = pickup.row_answer("Read my ACTIVE_TASKS.md and tell me who owns the widget polish cowork and which board file it uses.", TABLE)
    assert "Alpha desk" in got and "COWORK-WIDGET-POLISH-20990101.md" in got


def test_no_row_match_returns_empty():
    assert pickup.row_answer("who owns the moon base", TABLE) == ""
