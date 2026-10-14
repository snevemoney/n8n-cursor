"""BUS300-P0-005: asking for missing slots is not task proof."""
from pathlib import Path

TURN = Path(__file__).resolve().parents[1] / "mouth" / "turn.py"


def test_ask_nothing_improvised_is_not_task_verified():
    src = TURN.read_text(encoding="utf-8")
    assert '"task_verified": False, "outcome": "ASK_NOTHING_IMPROVISED"' in src
    assert '"task_verified": True, "outcome": "ASK_NOTHING_IMPROVISED"' not in src
