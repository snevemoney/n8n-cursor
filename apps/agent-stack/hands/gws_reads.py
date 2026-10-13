"""gws_reads — structured read-only Google helpers on top of `gws` (CANDIDATE, offline-proven only).

sent-mail duplicate guard   `gws gmail users messages list|get`  (Sent folder, recipient + subject + time window)
Docs / Sheets reads         `gws docs documents get`, `gws sheets +read`, found by name through a Drive lookup
Every argv is built here as one element per token, passes gws_natural.argv_is_read_only before it can run, and the
default runner refuses anything else. Mail, Doc and Sheet text is untrusted data: flattened, capped, never executed.
Nothing here sends, writes, shares or signs in. A missing sign-in is a plain sentence, never raw JSON.
"""
from __future__ import annotations

import importlib.util
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Callable

HERE = Path(__file__).resolve().parent
CLI_DEADLINE_S = 30
SENT_MAX_IDS = 5
SENT_DAYS_MIN, SENT_DAYS_MAX = 1, 30
DOC_SPEECH_CAP = 420
SHEET_ROWS = 6
SHEET_COLS = 6

EMAIL = re.compile(r"^[A-Za-z0-9._%+\-]{1,64}@[A-Za-z0-9\-]+(?:\.[A-Za-z0-9\-]+)*\.[A-Za-z]{2,24}$")
MSG_ID = re.compile(r"^[0-9a-fA-F]{8,32}$")
GOOGLE_ID = re.compile(r"^[A-Za-z0-9_\-]{10,100}$")
A1_RANGE = re.compile(r"^[A-Za-z0-9_ .]{1,40}(?:![A-Za-z]{1,3}\d{0,6}(?::[A-Za-z]{1,3}\d{0,6})?)?$|^[A-Za-z]{1,3}\d{1,6}(?::[A-Za-z]{1,3}\d{1,6})?$")

Runner = Callable[[list], tuple]


def _natural():
    key = "agent_stack_gws_natural"
    if key not in sys.modules:
        spec = importlib.util.spec_from_file_location(key, HERE / "gws_natural.py")
        mod = importlib.util.module_from_spec(spec)
        sys.modules[key] = mod
        spec.loader.exec_module(mod)
    return sys.modules[key]


# ---------------------------------------------------------------- the only way to run gws from here
def run_gws(argv: list) -> tuple:
    """(rc, stdout, stderr). Refuses, before spawning, anything that is not a structurally read-only gws call."""
    if not argv or argv[0] != "gws" or not _natural().argv_is_read_only(list(argv)):
        raise ValueError("not a read-only gws call")
    exe = shutil.which("gws", path=os.environ.get("PATH", "") + ":/opt/homebrew/bin:/usr/local/bin")
    if not exe:
        return 127, "", "gws is not installed"
    try:
        p = subprocess.run([exe, *argv[1:]], capture_output=True, text=True, timeout=CLI_DEADLINE_S,
                           cwd=str(Path.home()), stdin=subprocess.DEVNULL)
    except subprocess.TimeoutExpired:
        return 124, "", "gws timed out"
    return p.returncode, p.stdout or "", p.stderr or ""


def _call(runner: Runner | None, argv: list) -> tuple:
    if not _natural().argv_is_read_only(list(argv)):  # stubs are held to the same gate as the real runner
        raise ValueError("not a read-only gws call")
    return (runner or run_gws)(argv)


def _params(obj: dict) -> str:
    return json.dumps(obj, separators=(",", ":"))


def _failure(kind: str, rc: int, out: str, err: str) -> dict:
    s = _natural().speak(kind, out, err, rc)
    return {"auth_missing": s["auth_missing"], "spoken": s["spoken"]}


# ---------------------------------------------------------------- sent-mail duplicate guard
def _clean_term(s: str, cap: int = 100) -> str:
    s = re.sub(r'["\\{}()\[\]]', " ", _natural().flat(s, 400))
    return re.sub(r"\s+", " ", s).strip()[:cap].strip()


def norm_subject(s: str) -> str:
    s = _natural().flat(s, 300).lower()
    while True:
        t = re.sub(r"^(?:re|fwd?|aw)\s*:\s*", "", s)
        if t == s:
            return s
        s = t


def sent_query(to: str, subject: str, days: int = 3) -> str:
    to = (to or "").strip()
    if not EMAIL.match(to):
        raise ValueError("recipient is not a single plain email address")
    d = max(SENT_DAYS_MIN, min(SENT_DAYS_MAX, int(days or SENT_DAYS_MIN)))
    parts = ["in:sent", f"to:{to.lower()}"]
    subj = _clean_term(subject)
    if subj:
        parts.append(f'subject:"{subj}"')
    parts.append(f"newer_than:{d}d")
    return " ".join(parts)


def sent_list_argv(to: str, subject: str, days: int = 3, limit: int = SENT_MAX_IDS) -> list:
    return ["gws", "gmail", "users", "messages", "list", "--params",
            _params({"userId": "me", "q": sent_query(to, subject, days), "maxResults": max(1, min(SENT_MAX_IDS, int(limit)))})]


def sent_get_argv(msg_id: str) -> list:
    if not MSG_ID.match(msg_id or ""):
        raise ValueError("not a Gmail message id")
    return ["gws", "gmail", "users", "messages", "get", "--params",
            _params({"userId": "me", "id": msg_id, "format": "metadata", "metadataHeaders": ["To", "Cc", "Bcc", "Subject", "Date"]})]


def _headers(data) -> dict:
    hs = (((data or {}).get("payload") or {}).get("headers") or []) if isinstance(data, dict) else []
    return {str(h.get("name", "")).lower(): str(h.get("value", "")) for h in hs if isinstance(h, dict)}


def _unknown(why: str, auth: bool = False) -> dict:
    return {"status": "unknown", "count": 0, "auth_missing": auth, "matches": [],
            "spoken": why + " Treat the message as possibly already sent and ask Evens before sending."}


def check_sent_duplicate(to: str, subject: str, days: int = 3, runner: Runner | None = None) -> dict:
    """Read-only. status: duplicate (same recipient + same subject in Sent) | possible (Sent hit, headers differ or unreadable)
    | clear (nothing in Sent) | unknown (could not check). Only `clear` may proceed (safe_to_send)."""
    try:
        argv = sent_list_argv(to, subject, days)
    except ValueError as e:
        return _unknown(f"I didn't check Sent mail: {e}.")
    rc, out, err = _call(runner, argv)
    nat = _natural()
    data = nat._parse(out) if rc == 0 else None
    if rc != 0 or data is None or (isinstance(data, dict) and isinstance(data.get("error"), (dict, str))):
        f = _failure("generic", rc, out, err)
        return _unknown("I couldn't check Sent mail. " + f["spoken"], f["auth_missing"])
    if isinstance(data, list):  # --page-all style: one document per page
        ids = [m.get("id") for page in data if isinstance(page, dict) for m in (page.get("messages") or []) if isinstance(m, dict)]
    else:
        ids = [m.get("id") for m in (data.get("messages") or []) if isinstance(m, dict)] if isinstance(data, dict) else []
    ids = [i for i in ids if isinstance(i, str) and MSG_ID.match(i)][:SENT_MAX_IDS]
    if not ids:
        return {"status": "clear", "count": 0, "auth_missing": False, "matches": [],
                "spoken": f"No sent mail to {to} with that subject in the last {max(SENT_DAYS_MIN, min(SENT_DAYS_MAX, int(days or 1)))} days."}
    want_to, want_subj, matches, unreadable = to.strip().lower(), norm_subject(subject), [], 0
    for mid in ids:
        rc2, out2, _e2 = _call(runner, sent_get_argv(mid))
        h = _headers(nat._parse(out2)) if rc2 == 0 else {}
        if not h:
            unreadable += 1
            continue
        recips = " ".join(h.get(k, "") for k in ("to", "cc", "bcc")).lower()
        if want_to in recips and norm_subject(h.get("subject", "")) == want_subj:
            matches.append({"id": mid, "subject": nat.flat(h.get("subject", ""), 80), "when": nat._when(h.get("date", ""))})
    if matches:
        m = matches[0]
        when = f" {m['when']}" if m["when"] else ""
        return {"status": "duplicate", "count": len(matches), "auth_missing": False, "matches": matches,
                "spoken": f"Already sent: a message to {to} titled \"{m['subject']}\" went out{when}. I won't send it again without Evens."}
    return {"status": "possible", "count": len(ids), "auth_missing": False, "matches": [],
            "spoken": (f"Sent mail has {len(ids)} close match{'es' if len(ids) != 1 else ''} to {to}, but I can't confirm the subject"
                       + (" (some headers did not load)" if unreadable else "") + ". Treat it as a possible duplicate and ask Evens.")}


def safe_to_send(verdict: dict) -> bool:
    """The one rule a future sender must obey: only a clean `clear` lets the send proceed; the send itself still needs Evens."""
    return isinstance(verdict, dict) and verdict.get("status") == "clear"
