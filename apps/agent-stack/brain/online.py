#!/usr/bin/env python3
"""Talk hosts and live wires. Local face only. No Ollama.

Talk harness is Cursor CLI (cloud). Memory is the store
(vault + repo + sessions + hive). No Ollama. Do not nag for xAI keys.
"""
from __future__ import annotations

import base64
import json
import os
import re
import shutil
import subprocess
import threading
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
HIVE = ROOT / "docs/hive/outer-heaven/.hive"
GOLDEN = "https://evenslouis.ca/scorpion/api/hive/golden-paths"
SCORPION_HEALTH = "https://evenslouis.ca/scorpion/healthz"
PRO_HEALTH = "https://evenslouis.ca/pro/api/health"
XAI_URL = "https://api.x.ai/v1/chat/completions"
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
GROKBOT_CONN = Path.home() / ".grokbot/local-exec-daemon-connection.json"
DEFAULT_VPS = "root@69.62.66.78"
DEFAULT_MODEL = "grok-4"
DEFAULT_OPENROUTER_MODEL = "nex-agi/nex-n2.5-mini:free"
SPEAK_CAP = 900
