#!/usr/bin/env python3
"""Typed disk job: 4018 queues, Cursor parent actuates the living tab.

Not Chrome in Jarvis. Not Playwright. Not browser-use.
Daily browse / Watch Later / scroll / grab stay Safari (see.py).
Living-tab watch.json stays cursor-ide-browser in a Cursor parent.
IF Grok Bot → do not call Cursor MCP.

  python3 apps/agent-stack/hands/cursor_browser.py queue --text "watch this youtube https://www.youtube.com/watch?v=VIDEO"
  python3 apps/agent-stack/hands/cursor_browser.py actuate
  python3 apps/agent-stack/hands/cursor_browser.py status
  python3 apps/agent-stack/hands/cursor_browser.py --parent-prompt

Parent-chat step (this IDE or `agent -p` only if that process has
cursor-ide-browser): read the job, navigate the living YouTube tab,
sample 5–10s, max 36 frames, write result_path, then actuate again.
Do not invent frames. Do not tell a Grok desk to run this.
"""
from __future__ import annotations

import argparse
import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
HIVE = ROOT / "docs/hive/outer-heaven/.hive"
WATCH_ROOT = ROOT / "docs/hive/outer-heaven"
NAME = "cursor-browser-job.json"
SCHEMA_VERSION = 1
VERBS = ("watch", "open", "screenshot")
STATUSES = ("pending", "running", "done", "UNKNOWN")
DEFAULT_CAP = {"videos": 1, "sample_sec": 5, "max_frames": 36}
RESULT_WATCH = "CONTENT/watch-later/packets/{video_id}/watch.json"
QUEUE_SPOKEN = "I'll have Cursor watch that tab."
NO_CAPTURE = "UNKNOWN. No living-tab capture yet."
PARENT_NEEDED = (
    "UNKNOWN. This process has no living tab. "
    "Run the job from the Cursor parent chat."
)
STATUS_RE = re.compile(r"\bwhat did (?:you|cursor) watch\b", re.I)
QUEUE_PHRASE_RE = re.compile(
    r"\b("
    r"cursor-video-watch|"
    r"watch this youtube|"
    r"use the cursor browser|"
    r"cursor browser"
    r")\b",
    re.I,
)
WATCH_URL_RE = re.compile(
    r"https?://(?:www\.)?(?:youtube\.com/watch\S+|youtu\.be/\S+|youtube\.com/(?:embed|shorts)/\S+)",
    re.I,
)
VIDEO_ID_RE = re.compile(
    r"(?:youtube\.com/watch\?(?:[^#]*&)?v=|youtu\.be/|youtube\.com/(?:embed|shorts)/)([A-Za-z0-9_-]{11})",
    re.I,
)
SAFARI_ONLY_RE = re.compile(
    r"\b("
    r"(?:go (?:on|to)|open)\s+(?:the\s+)?youtube\b|"
    r"watch later|"
    r"scroll|"
    r"screenshot|screen\s*shot|screen\s*grab|"
    r"take a (?:screen\s*)?shot|"
    r"grab (?:the |my )?(?:screen|safari)"
    r")\b",
    re.I,
)


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def path_for(hive: Path) -> Path:
    return hive / "bus" / NAME


def has_living_tab_host() -> bool:
    """True only when this process is a Cursor parent with cursor-ide-browser.

    4018, `agent -p` without browser tools, and Grok desks are false.
    """
    flag = (os.environ.get("CURSOR_IDE_BROWSER") or "").strip().lower()
    return flag in {"1", "true", "yes", "parent"}


def video_id_from_text(text: str) -> str:
    hit = VIDEO_ID_RE.search(text or "")
    return (hit.group(1) if hit else "").strip()


def is_status_utterance(text: str) -> bool:
    return bool(STATUS_RE.search(text or ""))


def is_queue_utterance(text: str) -> bool:
    body = (text or "").strip()
    if not body:
        return False
    if is_status_utterance(body):
        return False
    if QUEUE_PHRASE_RE.search(body) or WATCH_URL_RE.search(body):
        return True
    return False


def is_safari_only_utterance(text: str) -> bool:
    body = (text or "").strip()
    if not body:
        return False
    if is_queue_utterance(body):
        return False
    return bool(SAFARI_ONLY_RE.search(body))


def job_verb_from_text(text: str) -> str:
    body = (text or "").strip()
    if re.search(r"\b(screenshot|screen\s*shot|screen\s*grab|take a (?:screen\s*)?shot)\b", body, re.I):
        if QUEUE_PHRASE_RE.search(body):
            return "screenshot"
    if re.search(r"\bopen\b", body, re.I) and QUEUE_PHRASE_RE.search(body) and not VIDEO_ID_RE.search(body):
        if not re.search(r"\bwatch\b", body, re.I):
            return "open"
    return "watch"


def url_from_text(text: str) -> str:
    hit = WATCH_URL_RE.search(text or "")
    if not hit:
        return ""
    return hit.group(0).rstrip(").,]>\"'")


def result_path_for(verb: str, video_id: str) -> str:
    if verb == "watch" and video_id:
        return RESULT_WATCH.format(video_id=video_id)
    return ""


def result_file(job: dict, *, root: Path | None = None) -> Path | None:
    rel = str((job or {}).get("result_path") or "").strip()
    if not rel:
        return None
    base = root or WATCH_ROOT
    return (base / rel).resolve()


def parent_step(job: dict | None = None) -> str:
    row = job if isinstance(job, dict) else {}
    vid = str(row.get("video_id") or "").strip() or "VIDEO_ID"
    dest = str(row.get("result_path") or RESULT_WATCH.format(video_id=vid))
    return (
        "In the Cursor parent chat (this IDE — not a Task, not Grok): "
        "use cursor-ide-browser on the living YouTube tab. "
        f"One video. Sample 5–10s. Max 36 frames. Write {dest}. "
        "Do not invent frames. Then: "
        "python3 apps/agent-stack/hands/cursor_browser.py actuate"
    )


def empty_job() -> dict:
    return {
        "schema_version": SCHEMA_VERSION,
        "id": "",
        "created_at": "",
        "verb": "watch",
        "url": "",
        "video_id": "",
        "cap": dict(DEFAULT_CAP),
        "status": "UNKNOWN",
        "result_path": "",
        "parent_step": parent_step({}),
    }


def validate(job: dict | None) -> list[str]:
    errors: list[str] = []
    row = job if isinstance(job, dict) else {}
    if not row:
        return ["job missing"]
    if row.get("schema_version") != SCHEMA_VERSION:
        errors.append("schema_version")
    if not str(row.get("id") or "").strip():
        errors.append("id")
    if not str(row.get("created_at") or "").strip():
        errors.append("created_at")
    if row.get("verb") not in VERBS:
        errors.append("verb")
    if row.get("status") not in STATUSES:
        errors.append("status")
    cap = row.get("cap") if isinstance(row.get("cap"), dict) else {}
    if int(cap.get("videos") or 0) != 1:
        errors.append("cap.videos")
    if int(cap.get("max_frames") or 0) > 36 or int(cap.get("max_frames") or 0) < 1:
        errors.append("cap.max_frames")
    sample = int(cap.get("sample_sec") or 0)
    if sample < 5 or sample > 10:
        errors.append("cap.sample_sec")
    return errors


def read(hive: Path) -> dict:
    dest = path_for(hive)
    if not dest.is_file():
        return {}
    try:
        data = json.loads(dest.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}
    return data if isinstance(data, dict) else {}


def write(hive: Path, job: dict) -> dict:
    dest = path_for(hive)
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(job, ensure_ascii=True, indent=2) + "\n", encoding="utf-8")
    return job


def _new_id(video_id: str, stamp: str) -> str:
    vid = (video_id or "none").strip() or "none"
    compact = stamp.replace("-", "").replace(":", "")
    return f"cb-{vid}-{compact}"[:80]


def queue(hive: Path, utterance: str, *, safari_url: str = "") -> dict:
    """Write a pending (or UNKNOWN) job. Never invent a title or frames."""
    text = (utterance or "").strip()
    verb = job_verb_from_text(text)
    url = url_from_text(text) or (safari_url or "").strip()
    video_id = video_id_from_text(text) or video_id_from_text(url)
    if url and not VIDEO_ID_RE.search(url) and video_id:
        url = f"https://www.youtube.com/watch?v={video_id}"
    if video_id and not url:
        url = f"https://www.youtube.com/watch?v={video_id}"
    stamp = now_iso()
    job = {
        "schema_version": SCHEMA_VERSION,
        "id": _new_id(video_id, stamp),
        "created_at": stamp,
        "verb": verb,
        "url": url,
        "video_id": video_id,
        "cap": dict(DEFAULT_CAP),
        "status": "pending" if (url or video_id) else "UNKNOWN",
        "result_path": result_path_for(verb, video_id),
        "parent_step": "",
    }
    job["parent_step"] = parent_step(job)
    write(hive, job)
    spoken = QUEUE_SPOKEN if job["status"] == "pending" else NO_CAPTURE
    return {
        "ok": job["status"] == "pending",
        "unknown": job["status"] != "pending",
        "wire": "cursor_browser",
        "path": "cursor-browser-job",
        "job_id": job["id"],
        "url": url or None,
        "spoken": spoken,
        "job": job,
    }


def watch_json_ok(path: Path | None) -> dict:
    """Read an existing watch.json. Empty if missing or invented-looking."""
    if path is None or not path.is_file():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}
    if not isinstance(data, dict):
        return {}
    frames = data.get("frames")
    transcript = data.get("transcript")
    if not isinstance(frames, list) and not isinstance(transcript, list):
        return {}
    return data


def actuate(hive: Path, *, has_browser: bool | None = None, root: Path | None = None) -> dict:
    """Cursor-parent step. Missing living tab → UNKNOWN. Never write a fake watch.json."""
    job = read(hive)
    if not job:
        return {
            "ok": False,
            "unknown": True,
            "wire": "cursor_browser",
            "path": "cursor-browser-job",
            "spoken": NO_CAPTURE,
            "job": {},
        }
    dest = result_file(job, root=root)
    captured = watch_json_ok(dest)
    if captured:
        job["status"] = "done"
        write(hive, job)
        vid = str(job.get("video_id") or captured.get("video_id") or "").strip()
        frames = captured.get("frames") if isinstance(captured.get("frames"), list) else []
        spoken = f"Cursor watched {vid or 'the tab'}."
        if frames:
            spoken = f"Cursor watched {vid or 'the tab'}. {len(frames)} frames on disk."
        return {
            "ok": True,
            "unknown": False,
            "wire": "cursor_browser",
            "path": "cursor-browser-job",
            "job_id": job.get("id"),
            "url": job.get("url") or None,
            "result_path": job.get("result_path") or None,
            "spoken": spoken,
            "job": job,
        }
    living = has_living_tab_host() if has_browser is None else bool(has_browser)
    if not living:
        job["status"] = "UNKNOWN"
        write(hive, job)
        return {
            "ok": False,
            "unknown": True,
            "wire": "cursor_browser",
            "path": "cursor-browser-job",
            "job_id": job.get("id"),
            "url": job.get("url") or None,
            "spoken": PARENT_NEEDED,
            "job": job,
        }
    job["status"] = "running"
    write(hive, job)
    return {
        "ok": False,
        "unknown": True,
        "wire": "cursor_browser",
        "path": "cursor-browser-job",
        "job_id": job.get("id"),
        "url": job.get("url") or None,
        "spoken": "The living tab is yours. I will not invent frames.",
        "job": job,
    }


def read_result(hive: Path, *, root: Path | None = None) -> dict:
    """4018 'what did you watch'. Result on disk or UNKNOWN. No invented frames."""
    job = read(hive)
    if not job:
        return {
            "ok": False,
            "unknown": True,
            "wire": "cursor_browser",
            "path": "cursor-browser-job",
            "spoken": NO_CAPTURE,
            "job": {},
        }
    dest = result_file(job, root=root)
    captured = watch_json_ok(dest)
    if captured:
        if job.get("status") != "done":
            job["status"] = "done"
            write(hive, job)
        vid = str(job.get("video_id") or captured.get("video_id") or "").strip()
        frames = captured.get("frames") if isinstance(captured.get("frames"), list) else []
        spoken = f"Cursor watched {vid or 'the tab'}."
        if frames:
            spoken = f"Cursor watched {vid or 'the tab'}. {len(frames)} frames on disk."
        return {
            "ok": True,
            "unknown": False,
            "wire": "cursor_browser",
            "path": "cursor-browser-job",
            "job_id": job.get("id"),
            "url": job.get("url") or None,
            "result_path": job.get("result_path") or None,
            "spoken": spoken,
            "job": job,
        }
    return {
        "ok": False,
        "unknown": True,
        "wire": "cursor_browser",
        "path": "cursor-browser-job",
        "job_id": job.get("id"),
        "url": job.get("url") or None,
        "spoken": NO_CAPTURE,
        "job": job,
    }


def main() -> int:
    ap = argparse.ArgumentParser(description="Jarvis ↔ Cursor living-tab job")
    ap.add_argument("action", nargs="?", default="status", choices=("queue", "actuate", "status"))
    ap.add_argument("--text", default="", help="utterance to queue")
    ap.add_argument("--hive", default="", help="hive root (default outer-heaven .hive)")
    ap.add_argument("--has-browser", action="store_true", help="this process is a Cursor parent")
    ap.add_argument("--parent-prompt", action="store_true", help="print the parent-chat step")
    args = ap.parse_args()
    hive = Path(args.hive).expanduser() if args.hive else HIVE
    if args.parent_prompt:
        print(parent_step(read(hive) or None))
        return 0
    if args.action == "queue":
        out = queue(hive, args.text)
    elif args.action == "actuate":
        out = actuate(hive, has_browser=args.has_browser or None)
    else:
        out = read_result(hive)
    print(json.dumps({k: v for k, v in out.items() if k != "job"}, indent=2))
    if out.get("job"):
        print(json.dumps(out["job"], indent=2))
    return 0 if out.get("ok") or out.get("job") else 2


if __name__ == "__main__":
    raise SystemExit(main())
