#!/usr/bin/env python3
"""Read-only Calendar, Mail, and Spotlight. Never send. Never tccutil."""
from __future__ import annotations

import os
import re
import signal
import subprocess
import time
from pathlib import Path

HOME = Path.home()
_CAL_CACHE: dict[str, tuple[float, dict]] = {}
_CAL_TTL = 90.0


def _run(argv: list[str], timeout: float = 12.0) -> subprocess.CompletedProcess[str]:
    """Bounded run. Kill the whole process group on timeout — a TCC-stalled
    osascript helper must not hold the pipes open past the cap."""
    proc = subprocess.Popen(
        argv,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        start_new_session=True,
    )
    try:
        out, err = proc.communicate(timeout=timeout)
    except subprocess.TimeoutExpired:
        try:
            os.killpg(proc.pid, signal.SIGKILL)
        except (ProcessLookupError, PermissionError, OSError):
            proc.kill()
        try:
            out, err = proc.communicate(timeout=2.0)
        except subprocess.TimeoutExpired:
            out, err = "", ""
        raise subprocess.TimeoutExpired(argv, timeout, output=out, stderr=err)
    return subprocess.CompletedProcess(argv, proc.returncode, out, err)


def _deny(app: str, err: str) -> dict:
    # Z72 (Acw 0:00, 4:37): facts first, then one quip; the raw AppleScript error ("Can't get start date of {}") stays in the log.
    line = (f"I can't read {app} yet, sir: macOS hasn't given me permission. Allow Terminal to control {app} in System Settings, "
            f"Privacy and Security, Automation, and ask again. A diary I'm not allowed to open; how very Victorian.")
    return {"ok": False, "state": "denied", "wire": app.lower(), "spoken": line, "error": (err or "").strip()[:300]}


WEEKDAYS = ("monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday")


def day_scope(utterance: str = "") -> tuple[str, int]:
    """Label + day offset from today. Default today."""
    low = " ".join((utterance or "").lower().split())
    if re.search(r"\btomorrow\b", low):
        return "Tomorrow", 1
    from datetime import date

    today = date.today().weekday()
    for i, name in enumerate(WEEKDAYS):
        if re.search(rf"\b{name}s?\b", low):
            return name.title(), (i - today) % 7
    return "Today", 0


def clear_calendar_cache() -> None:
    _CAL_CACHE.clear()


def calendar_today(cap: int = 5, utterance: str = "") -> dict:
    """Read events for one day. Never offer a day we cannot fetch."""
    label, offset = day_scope(utterance)
    limit = max(1, min(int(cap or 5), 8))
    key = f"{label}|{offset}|{limit}"
    now = time.time()
    hit = _CAL_CACHE.get(key)
    if hit and now - hit[0] < _CAL_TTL and str((hit[1] or {}).get("state") or "") in {"live", "empty"}:
        return dict(hit[1])
    script = (
        f"set dayStart to (current date)\n"
        f"set time of dayStart to 0\n"
        f"set dayStart to dayStart + ({int(offset)} * days)\n"
        f"set bits to {{}}\n"
        "tell application \"Calendar\"\n"
        "  try\n"
        "    set evs to (every event of every calendar whose "
        "start date ≥ dayStart and start date < dayStart + 1 * days)\n"
        "    repeat with e in evs\n"
        "      set end of bits to (time string of (start date of e)) & \" \" & (summary of e)\n"
        f"      if (count of bits) ≥ {limit} then exit repeat\n"
        "    end repeat\n"
        "    if (count of bits) is 0 then return \"EMPTY\"\n"
        "    set AppleScript's text item delimiters to \"||\"\n"
        "    return \"OK:\" & (bits as text)\n"
        "  on error errMsg\n"
        "    return \"DENY:\" & errMsg\n"
        "  end try\n"
        "end tell\n"
    )
    try:
        proc = _run(["osascript", "-e", script], timeout=12.0)
    except subprocess.TimeoutExpired:
        return {
            "ok": False,
            "state": "slow",
            "wire": "calendar",
            "spoken": f"Calendar is still opening. I do not have {label.lower()}'s events yet.",
        }
    except OSError as exc:
        return _deny("Calendar", str(exc))
    body = (proc.stdout or proc.stderr or "").strip()
    if proc.returncode != 0 or body.startswith("DENY:") or "not allowed" in body.lower():
        return _deny("Calendar", body.replace("DENY:", "", 1))
    def _keep(row: dict) -> dict:
        if str(row.get("state") or "") in {"live", "empty"}:
            _CAL_CACHE[key] = (time.time(), dict(row))
        return row

    if body == "EMPTY" or body.endswith(":EMPTY"):
        return _keep({
            "ok": True,
            "state": "empty",
            "wire": "calendar",
            "spoken": f"Nothing on {label.lower()}'s calendar.",
            "events": [],
        })
    raw = body.split(":", 1)[-1].strip() if body.startswith("OK:") else body
    events = [bit.strip() for bit in raw.split("||") if bit.strip()][:limit]
    if not events:
        return _keep({
            "ok": True,
            "state": "empty",
            "wire": "calendar",
            "spoken": f"Nothing on {label.lower()}'s calendar.",
            "events": [],
        })
    spoken = f"{label}: " + "; ".join(events) + "."
    return _keep({
        "ok": True,
        "state": "live",
        "wire": "calendar",
        "spoken": spoken,
        "events": events,
    })


def frontmost_app(timeout: float = 4.0) -> dict:
    """Front app + window title. Read-only. TCC deny is a named state, not a crash."""
    script = (
        "tell application \"System Events\"\n"
        "  try\n"
        "    set p to first process whose frontmost is true\n"
        "    set appName to name of p\n"
        "    set winTitle to \"\"\n"
        "    try\n"
        "      set winTitle to name of front window of p\n"
        "    end try\n"
        "    return \"OK:\" & appName & \"||\" & winTitle\n"
        "  on error errMsg\n"
        "    return \"DENY:\" & errMsg\n"
        "  end try\n"
        "end tell\n"
    )
    try:
        proc = _run(["osascript", "-e", script], timeout=timeout)
    except subprocess.TimeoutExpired:
        return {"ok": False, "state": "slow", "wire": "screen", "app": "", "title": ""}
    except OSError as exc:
        return {**_deny("System Events", str(exc)), "app": "", "title": ""}
    body = (proc.stdout or proc.stderr or "").strip()
    if proc.returncode != 0 or body.startswith("DENY:") or "not allowed" in body.lower():
        return {**_deny("System Events", body.replace("DENY:", "", 1)), "app": "", "title": ""}
    raw = body.split(":", 1)[-1] if body.startswith("OK:") else body
    app, _, title = raw.partition("||")
    return {
        "ok": True,
        "state": "live",
        "wire": "screen",
        "app": app.strip(),
        "title": title.strip(),
    }


def mail_unread() -> dict:
    script = (
        "tell application \"Mail\"\n"
        "  try\n"
        "    set n to unread count of inbox\n"
        "    return \"OK:\" & n\n"
        "  on error errMsg\n"
        "    return \"DENY:\" & errMsg\n"
        "  end try\n"
        "end tell\n"
    )
    try:
        proc = _run(["osascript", "-e", script], timeout=10.0)
    except (OSError, subprocess.TimeoutExpired) as exc:
        return _deny("Mail", str(exc))
    body = (proc.stdout or proc.stderr or "").strip()
    if proc.returncode != 0 or body.startswith("DENY:") or "not allowed" in body.lower():
        return _deny("Mail", body.replace("DENY:", "", 1))
    raw = body.split(":", 1)[-1].strip() if ":" in body else body
    spoken = f"Mail inbox unread: {raw}."
    return {"ok": True, "state": "live", "wire": "mail", "spoken": spoken, "unread": raw}


def files_search(query: str, cap: int = 5) -> dict:
    q = " ".join((query or "").split())
    skip = {"find", "search", "file", "files", "show", "my", "the", "a", "an", "please"}
    words = [w for w in q.split() if w.lower() not in skip]
    look = " ".join(words) if words else q
    if not look or look.lower() in {"files", "file"}:
        return {
            "ok": True,
            "state": "live",
            "wire": "files",
            "spoken": "Name what to find on disk.",
            "hits": [],
        }
    try:
        proc = _run(["mdfind", "-onlyin", str(HOME), look], timeout=8.0)
    except (OSError, subprocess.TimeoutExpired) as exc:
        return {
            "ok": False,
            "state": "denied",
            "wire": "files",
            "spoken": f"Spotlight did not run. {exc}.",
            "hits": [],
        }
    paths = [ln.strip() for ln in (proc.stdout or "").splitlines() if ln.strip()][:cap]
    if not paths:
        return {
            "ok": True,
            "state": "live",
            "wire": "files",
            "spoken": f"No Spotlight hits for {look}.",
            "hits": [],
        }
    names = [Path(p).name for p in paths]
    spoken = "Disk: " + "; ".join(names) + "."
    return {"ok": True, "state": "live", "wire": "files", "spoken": spoken, "hits": paths}


# Saved screenshots are files, not guesses from the conversation or a new capture.
LATEST_SCREENSHOT_RE = re.compile(r"^(?:(?:what (?:was|is)|find|show)(?: me)?|where is)\s+(?:(?:my|the)\s+)?(?:last|latest|most recent)\s+(?:screenshotted image|screen ?shot|screenshot image)(?:\s+(?:saved|on my mac))?[.!?]?$", re.I)
FINDER_REFERENCE_RE = re.compile(r"^(?:(?:can|could|would) you\s+)?(?:please\s+)?(?:open|show|reveal)\s+(?:it|that|that (?:file|image|screenshot))\s+in\s+finder(?:\s+for me)?[.!?]?$", re.I)


def screenshot_fingerprint(path, home=None):
    """Bounded header + metadata only. Refuse symlinks and private/secret locations."""
    home = Path(home or HOME).resolve()
    path = Path(path)
    if path.is_symlink() or not path.is_absolute():
        raise ValueError('unsafe screenshot path')
    real = path.resolve(strict=True)
    if home not in real.parents or any(part.startswith('.') or part in {'Library','Private'} for part in real.relative_to(home).parts):
        raise ValueError('screenshot outside visible home folders')
    if not real.is_file() or not re.match(r'^(?:Screenshot|Screen Shot|Capture d[’\x27]écran)\b', real.name, re.I):
        raise ValueError('not a saved screenshot')
    suffix = real.suffix.lower()
    st = real.stat()
    cloud = bool(getattr(st, 'st_flags', 0) & 0x40000000)
    if cloud:
        header = b''  # Never hydrate a cloud file just to identify or reveal it.
    else:
        with real.open('rb') as handle:
            header = handle.read(12)
    image = (cloud and suffix in {'.png','.jpg','.jpeg','.heic','.heif'}) or ((suffix == '.png' and header.startswith(b'\x89PNG\r\n\x1a\n')) or
             (suffix in {'.jpg','.jpeg'} and header.startswith(b'\xff\xd8\xff')) or
             (suffix in {'.heic','.heif'} and header[4:8] == b'ftyp' and header[8:12] in {b'heic',b'heix',b'hevc',b'hevx',b'mif1'}))
    if not image:
        raise ValueError('not an image file')
    st = real.stat()
    return {'path':str(real),'size':st.st_size,'mtime_ns':st.st_mtime_ns,'inode':st.st_ino,'device':st.st_dev,
            'created':getattr(st,'st_birthtime',st.st_mtime),'kind':'saved_screenshot',
            'verification':'filename_and_metadata_only' if cloud else 'image_header_and_metadata','locally_available':not cloud}


def latest_screenshot(home=None):
    """Spotlight plus bounded Desktop/Downloads discovery; never reads image contents."""
    home=Path(home or HOME).resolve(); paths=[]; notes=[]
    try:
        proc=_run(['/usr/bin/mdfind','-onlyin',str(home),'kMDItemIsScreenCapture == 1'], timeout=4)
        if proc.returncode == 0:
            paths.extend(Path(x) for x in proc.stdout.splitlines()[:2000] if x.startswith('/'))
        else: notes.append('Spotlight unavailable')
    except (OSError,subprocess.TimeoutExpired): notes.append('Spotlight unavailable')
    for folder in (home/'Desktop',home/'Downloads'):
        try:
            for index,path in enumerate(folder.iterdir()):
                if index >= 2000:
                    notes.append('folder scan capped');break
                if re.match(r'^(?:Screenshot|Screen Shot|Capture d[’\x27]écran)\b',path.name,re.I): paths.append(path)
        except OSError: notes.append('a folder was inaccessible')
    found=[]
    for path in set(paths):
        try: found.append(screenshot_fingerprint(path,home))
        except (OSError,ValueError,RuntimeError): continue
    if not found:
        return {'ok':False,'spoken':'I could not verify a saved screenshot in Spotlight, Desktop or Downloads. I did not take a new screenshot.','artifact':None,'scope_notes':notes}
    found.sort(key=lambda x:(x['created'],x['mtime_ns'],x['path']),reverse=True)
    chosen=found[0]
    cloud_note = ' Its contents are in iCloud; I checked its filename and file metadata, not its image contents.' if not chosen['locally_available'] else ''
    return {'ok':True,'spoken':'The latest saved screenshot I found is '+Path(chosen['path']).name+' in '+Path(chosen['path']).parent.name+' folder.'+cloud_note,
            'artifact':chosen,'scope_notes':notes,'scope':'Spotlight plus Desktop and Downloads; other unindexed locations may be missing'}


def same_screenshot(left, right):
    # iCloud local availability is observation status, not file identity.
    keys = ('path','size','mtime_ns','inode','device','created','kind')
    return all(left.get(key) == right.get(key) for key in keys)


def reveal_screenshot(artifact,home=None):
    """Only a previously verified screenshot receipt; launch is not visibility proof."""
    try:
        fresh=screenshot_fingerprint(artifact.get('path',''),home)
        if not same_screenshot(fresh, artifact): raise ValueError('the screenshot changed since lookup')
        proc=_run(['/usr/bin/open','-R',fresh['path']],timeout=4)
        if proc.returncode != 0: raise ValueError('Finder reveal request failed')
        # Read selection back without interpolating a path or user text into AppleScript.
        visible=False; evidence={'selection_readback_attempts':0}
        for attempt in range(3):
            check=_run(['/usr/bin/osascript','-e','tell application "Finder"\nset selectedItems to get selection\nif (count of selectedItems) is 1 then return POSIX path of ((item 1 of selectedItems) as alias)\nreturn ""\nend tell'],timeout=1)
            evidence={'selection_readback_attempts':attempt+1,'returncode':check.returncode,
                      'selection_present':bool(check.stdout.strip()),'permission_denied':'-1743' in (check.stderr or '')}
            try:
                selected=Path(check.stdout.strip())
                visible=check.returncode == 0 and selected.is_absolute() and selected.samefile(fresh['path'])
            except (OSError,ValueError): visible=False
            if visible or evidence['permission_denied']: break
            if attempt < 2: time.sleep(.15)
        unchanged=same_screenshot(screenshot_fingerprint(fresh['path'],home), fresh)
        evidence.update({'selection_matched':visible,'file_unchanged':unchanged})
        if not visible or not unchanged:
            return {'ok':False,'spoken':'I requested Finder to reveal the screenshot, but could not verify its selection.','task_verified':False,'artifact':fresh,'verification_evidence':evidence}
        return {'ok':True,'spoken':'Finder has selected '+Path(fresh['path']).name+'.','task_verified':True,'artifact':fresh,'postcondition':'exact Finder selection read back','verification_evidence':evidence}
    except (OSError,ValueError,RuntimeError,subprocess.TimeoutExpired) as exc:
        return {'ok':False,'spoken':'I could not reveal that screenshot in Finder: '+str(exc)+'.','task_verified':False}


SAVED_IMAGE_RE = re.compile(
    r"^(?:(?:can|could|would) you\s+)?(?:please\s+)?(?:open|show|describe|analyse|analyze|explain)\s+"
    r"(?:(?:the|that|my|saved|last|latest)\s+)?(?:screenshot|image|it)(?:\s+you\s+just\s+found)?"
    r"(?:\s+and\s+(?:describe|explain|summarize)\s+(?:it|the image|the screenshot))?"
    r"(?:\s+(?:briefly|quickly))?(?:[.!]?\s+then\s+ask\s+me\s+(?:what|how)\b.{0,100})?[.!?]?$", re.I)


def open_screenshot(artifact, home=None):
    """Requested local image viewing through the existing bounded Mac hand."""
    try:
        fresh=screenshot_fingerprint(artifact.get('path',''),home)
        if not same_screenshot(fresh,artifact): raise ValueError('the screenshot changed since lookup')
        proc=_run(['/usr/bin/open','-a','Preview',fresh['path']],timeout=4)
        if proc.returncode: raise ValueError('the image viewer did not accept the file')
        observed=frontmost_app(timeout=1)
        names={Path(fresh['path']).name,Path(fresh['path']).stem}
        verified=observed.get('ok') and observed.get('app')=='Preview' and observed.get('title') in names
        unchanged=same_screenshot(screenshot_fingerprint(fresh['path'],home),fresh)
        return {'ok':True,'opened':bool(verified and unchanged),'artifact':fresh,
                'spoken':'The screenshot is open in Preview.' if verified and unchanged else 'I asked Preview to open the screenshot; its window is not yet verified.',
                'view_evidence':{'request_accepted':True,'matching_viewer_title':bool(verified),'file_unchanged':unchanged}}
    except (OSError,ValueError,RuntimeError,subprocess.TimeoutExpired) as exc:
        return {'ok':False,'opened':False,'spoken':'I could not open the saved screenshot: '+str(exc)+'.'}
