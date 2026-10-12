#!/usr/bin/env python3
"""Refresh the 4×4 session store. Same as session-matrix.py sync.

ChatGPT titles come from plaintext desktop sidecars (automations.json)
plus `sessions/chatgpt-titles.json`. Does not decrypt `.data` blobs.
Future refreshes keep a real title once one is known.

After write, posts a titles-only delta to Slack `#hive` when any of these
exist in the environment (never commit them):

  SLACK_HIVE_BOT_TOKEN + SLACK_HIVE_CHANNEL_ID
  SLACK_HIVE_TOKEN + SLACK_HIVE_CHANNEL
  SLACK_HIVE_WEBHOOK_URL

Skip with `--no-slack`. Default channel id if unset: C0BTH1TMFC5 (#hive).
"""
from __future__ import annotations

import runpy
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
if not any(c in sys.argv for c in ("write", "sync", "print")):
    sys.argv.append("sync")
runpy.run_path(str(HERE / "session-matrix.py"), run_name="__main__")
