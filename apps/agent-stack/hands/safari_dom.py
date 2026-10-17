"""Browser use in Evens's OWN Safari (his tabs, his logins), in the background, the way browser-use / Codex drive a
page (Evens 2026-10-16: "prepare Jarvis for any type of workflow possibility on a browser ... work in the background
without interrupting me ... its own floating cursor, it does not use my cursor").

- Jarvis works in its OWN tab (opened in the background; his current tab and his mouse are never touched). Actions
  go through Safari's `do JavaScript` into that tab: no focus, no real mouse, Safari need not be in front.
- Jarvis's blue overlay cursor glides to the element when that tab is visible (it is an overlay, not his pointer).
- Every action returns the page after it (numbered links/buttons/fields, text, login wall, page dialogs).
- Login walls are reported, never filled: Evens logs in himself.
- Buttons that send, post, pay, buy or delete are his kept stops: the click is held for his OK (`stop_reason`).
- `real=true` falls back to a real mouse click in the foreground (only for sites that ignore page events).
"""
from __future__ import annotations

import base64
import json
import mimetypes
import re
import subprocess
import time
from pathlib import Path

import importlib.util as _u

_spec = _u.spec_from_file_location("agent_stack_safari_js", Path(__file__).with_name("safari_js.py"))
J = _u.module_from_spec(_spec); _spec.loader.exec_module(J)

ACTIONS = ("snapshot", "navigate", "new_tab", "click", "double_click", "hover", "type", "select", "check", "key",
           "scroll", "find", "wait_for", "read", "back", "forward", "reload", "tabs", "use_tab", "show", "close_tab",
           "eval", "upload", "dialog")
OSA_TIMEOUT = 20
UPLOAD_MAX = 600_000  # bytes: the file rides in the osascript argument list
STOP_RE = re.compile(r"\b(send|post|publish|tweet|reply all|share now|buy|purchase|pay|place order|checkout|check out|"
                     r"subscribe|donate|transfer|delete|remove|merge|confirm (?:payment|order|purchase)|submit order)\b", re.I)


def osa(lines: list, *args: str, timeout: int = OSA_TIMEOUT) -> str:
    argv = ["osascript"]
    for ln in lines:
        argv += ["-e", ln]
    cp = subprocess.run(argv + list(args), capture_output=True, text=True, timeout=timeout)
    if cp.returncode != 0:
        raise RuntimeError(cp.stderr.strip() or "osascript failed")
    return cp.stdout.strip()


class SafariDOM:
    """`state` is the job's dict (persisted by the operator): the working tab and the tabs Jarvis opened.
    `hands(req)` sends a real input event (only for real=true); `cursor(x, y)` glides the blue overlay cursor."""

    def __init__(self, state: dict, hands, cursor, osa_fn=osa):
        self.state, self.hands, self.cursor, self.osa = state, hands, cursor, osa_fn

    # ---- tabs ---------------------------------------------------------------------------------------------
    def _tab(self) -> tuple:
        """(window id, tab index) of the working tab; his current tab if none chosen yet."""
        t = self.state.get("safari_tab")
        if t:
            return int(t[0]), int(t[1])
        out = self.osa(['tell application "Safari"', "if (count of windows) = 0 then make new document",
                        "return (id of front window as text) & \",\" & (index of current tab of front window as text)",
                        "end tell"])
        w, i = out.split(",")
        self.state["safari_tab"] = [int(w), int(i)]
        return int(w), int(i)

    def js(self, code: str) -> dict:
        w, i = self._tab()
        raw = self.osa(["on run argv", f'tell application "Safari" to do JavaScript (item 1 of argv) in tab {i} of window id {w}',
                        "end run"], code)
        try:
            return json.loads(raw or "{}")
        except ValueError:
            return {"result": raw}

    def _visible(self) -> bool:
        w, i = self._tab()
        try:
            return self.osa([f'tell application "Safari" to return ((index of current tab of window id {w}) = {i}) '
                             f'and (visible of window id {w})']) == "true"
        except RuntimeError:
            return False

    def _glide(self, where: dict) -> None:
        """Jarvis's own cursor, only when he can see the tab (it never moves his pointer)."""
        if "cx" in where and self._visible():
            x, y = self.to_screen(where)
            self.cursor(x, y)

    def to_screen(self, where: dict) -> tuple:
        """Page point -> global point. Safari hides screenX/screenY from pages (live 10-16: both 0), so the frame
        comes from Safari's AppleScript bounds {left, top, right, bottom}; toolbar = frame height - innerHeight."""
        w, _ = self._tab()
        left, top, right, bottom = [int(v) for v in self.osa(
            [f'tell application "Safari" to get bounds of window id {w}']).replace(" ", "").split(",")]
        return (int(round(left + (right - left - float(where["iw"])) / 2 + float(where["cx"]))),
                int(round(top + (bottom - top - float(where["ih"])) + float(where["cy"]))))

    # ---- the page ------------------------------------------------------------------------------------------
    def snapshot(self, lead: str = "") -> dict:
        d = self.js(J.wrap(J.SNAPSHOT))
        if d.get("error"):
            return {"text": f"{lead}could not read the page: {d['error']}"}
        w, i = self._tab()
        login = ("\nLOGIN NEEDED: this page wants him signed in. Tell Evens in one line to log in to this site in Safari "
                 "(never type his password), wait for his reply, then snapshot again.") if d.get("login") else ""
        dlg = ("\nThe page showed: " + "; ".join(d["dialogs"])) if d.get("dialogs") else ""
        return {"text": (f"{lead}Safari tab {i} of window {w}: {d.get('title')} — {d.get('url')} (loading: {d.get('ready')}, "
                         f"scroll {d.get('scroll')}){login}{dlg}\nElements (use the number):\n{d.get('elements') or '(none)'}"
                         f"\n\nPage text:\n{d.get('text') or ''}")}

    def stop_reason(self, a: dict) -> str:
        """Non-empty when this action would send, post, pay, buy or delete (his kept stops)."""
        action = str(a.get("action") or "")
        if action not in ("click", "double_click", "type", "key", "eval"):
            return ""
        if action == "eval":
            return "runs a page script" if STOP_RE.search(str(a.get("code") or "")) else ""
        if action in ("type", "key") and not (a.get("submit") or "enter" in str(a.get("keys") or "").lower()
                                              or "return" in str(a.get("keys") or "").lower()):
            return ""
        if not a.get("ref"):
            return ""
        try:
            info = self.js(J.element_script(int(a["ref"]), J.INFO))
        except (RuntimeError, ValueError, subprocess.TimeoutExpired):
            return ""
        label = str(info.get("label") or "")
        if action in ("type", "key"):
            return f"submits the form around '{label}'" if info.get("form") and STOP_RE.search(label) else ""
        return f"clicks '{label}'" if STOP_RE.search(label) else ""

    def act(self, a: dict) -> dict:
        action = str(a.get("action") or "snapshot")
        if action not in ACTIONS:
            return {"text": f"unknown action {action}; use one of {', '.join(ACTIONS)}"}
        try:
            return getattr(self, "_" + action)(a)
        except subprocess.TimeoutExpired:
            return {"text": "Safari did not answer in time (a dialog may be open); take a computer screenshot to look"}
        except (RuntimeError, ValueError, KeyError) as exc:
            return {"text": f"Safari error: {exc}"}

    def _el(self, a: dict, body: str, lead: str, settle: float = 1.2) -> dict:
        ref = int(a.get("ref") or 0)
        if not ref:
            return {"text": f"{a.get('action')} needs ref=N from a snapshot"}
        before = self._signature()
        got = self.js(J.element_script(ref, body))
        if got.get("error"):
            return {"text": got["error"]}
        self._glide(got)
        time.sleep(settle)
        extra = (" The page showed: " + "; ".join(got["dialogs"]) + ".") if got.get("dialogs") else ""
        want = str(a.get("text") or "") if a.get("action") == "type" else ""
        if want and want.strip().lower() not in str(got.get("value") or "").lower() and not got.get("submitted"):
            extra += (f" CHECK: the field did not take the text (it shows {str(got.get('value') or '')[:60]!r}); "
                      "try type with real=true.")
        elif a.get("action") in ("click", "double_click", "check") and before and before == self._signature():
            extra += " CHECK: nothing changed on the page after that; it may need real=true, or a different element."
        return self.snapshot(f"{lead}{extra} ")

    def _signature(self) -> tuple:
        try:
            d = self.js(J.STATE)
            return (d.get("url"), len(str(d.get("text") or "")), hash(str(d.get("text") or "")[:20000]))
        except (RuntimeError, ValueError):
            return ()

    def _snapshot(self, a):
        return self.snapshot()

    def _click(self, a):
        if a.get("real"):
            return self._real_click(a)
        return self._el(a, J.CLICK, f"Clicked {a.get('ref')}.", 1.5)

    def _double_click(self, a):
        return self._el(a, J.DBLCLICK, f"Double-clicked {a.get('ref')}.", 1.2)

    def _hover(self, a):
        return self._el(a, J.HOVER, f"Hovering {a.get('ref')}.", 0.8)

    def _type(self, a):
        if a.get("real"):
            return self._real_type(a)
        return self._el(a, J.type_script(str(a.get("text") or ""), a.get("replace", True) is not False,
                                         bool(a.get("submit"))), "Typed.", 2.0 if a.get("submit") else 0.5)

    def _select(self, a):
        return self._el(a, J.select_script(str(a.get("text") or a.get("option") or "")), "Selected.", 0.8)

    def _check(self, a):
        want = a.get("checked", True) is not False
        body = ("const on=('checked' in e)?e.checked:(e.getAttribute('aria-checked')==='true');"
                f"if(on!=={'true' if want else 'false'}){{" + J.CLICK.split("return JSON.stringify")[0] + "}" +
                "return JSON.stringify(Object.assign(pt(e),{ok:1}))")
        return self._el(a, body, "Set the checkbox.", 0.8)

    def _key(self, a):
        got = self.js(J.key_script(str(a.get("keys") or a.get("text") or ""), int(a["ref"]) if a.get("ref") else None))
        if got.get("error"):
            return {"text": got["error"]}
        time.sleep(1.0)
        return self.snapshot("Pressed. ")

    def _scroll(self, a):
        got = self.js(J.scroll_script(str(a.get("direction") or "down"), int(a.get("amount") or 700),
                                      int(a["ref"]) if a.get("ref") else None))
        if got.get("error"):
            return {"text": got["error"]}
        time.sleep(0.5)
        return self.snapshot("Scrolled. ")

    def _find(self, a):
        got = self.js(J.find_script(str(a.get("text") or "")))
        return {"text": got.get("error") or json.dumps({"lines": got.get("lines"), "elements": got.get("elements")})[:6000]}

    def _wait_for(self, a):
        """Until the text shows up (or the page finishes loading), up to timeout_s."""
        want = str(a.get("text") or "").lower()
        end = time.monotonic() + min(60, int(a.get("timeout_s") or 15))
        while time.monotonic() < end:
            d = self.js(J.STATE)
            if (want and want in str(d.get("text") or "").lower()) or (not want and d.get("ready") == "complete"):
                return self.snapshot("Ready. ")
            time.sleep(1.0)
        return self.snapshot(f"Waited, and {'did not see ' + repr(want) if want else 'the page is still loading'}. ")

    def _read(self, a):
        d = self.js(J.READ)
        lang = f" (page language: {d['lang']})" if d.get("lang") else ""
        return {"text": d.get("error") or f"{d.get('title')} — {d.get('url')}{lang}\n{d.get('text') or ''}"}

    def _history(self, how: str, lead: str):
        self.js(J.wrap(f"{how};return JSON.stringify({{ok:1}})"))
        time.sleep(2.0)
        return self.snapshot(lead)

    def _back(self, a):
        return self._history("history.back()", "Went back. ")

    def _forward(self, a):
        return self._history("history.forward()", "Went forward. ")

    def _reload(self, a):
        return self._history("location.reload()", "Reloaded. ")

    def _navigate(self, a):
        url = self._url(a)
        w, i = self._tab()
        self.osa(["on run argv", f'tell application "Safari" to set URL of tab {i} of window id {w} to (item 1 of argv)',
                  "end run"], url)
        return self._settled("Navigated. ")

    def _new_tab(self, a):
        """Jarvis's own tab, at the end of his front window, NOT made current: he keeps his tab and his work.
        If that page is already open in one of his tabs, work in that tab instead (Evens 10-16: no duplicate tabs)."""
        url = self._url(a)
        same = self._find_open(url)
        if same:
            self.state["safari_tab"] = list(same)
            return self.snapshot(f"That page was already open (window {same[0]} tab {same[1]}); working in it, no new tab. ")
        out = self.osa(["on run argv", 'tell application "Safari"', "if (count of windows) = 0 then make new document",
                        "set w to front window", "tell w to make new tab at end of tabs with properties {URL:(item 1 of argv)}",
                        "return (id of w as text) & \",\" & ((count of tabs of w) as text)", "end tell", "end run"], url)
        w, i = out.split(",")
        self.state["safari_tab"] = [int(w), int(i)]
        self.state.setdefault("safari_own", []).append([int(w), int(i)])
        return self._settled("Opened my own tab in the background. ")

    def _find_open(self, url: str):
        """(window id, tab index) of an open tab showing the same page (host + path, ignoring query/fragment)."""
        def norm(u):
            m = re.match(r"https?://(?:www\.)?([^/?#]+)(/[^?#]*)?", u or "")
            return (m.group(1).lower(), (m.group(2) or "/").rstrip("/") or "/") if m else None
        want = norm(url)
        if not want:
            return None
        try:
            out = self.osa(['tell application "Safari"', 'set o to ""', "repeat with w in windows", "set i to 0",
                            "repeat with t in tabs of w", "set i to i + 1",
                            'set o to o & (id of w) & "|" & i & "|" & (URL of t) & linefeed', "end repeat", "end repeat",
                            "return o", "end tell"])
        except (RuntimeError, subprocess.TimeoutExpired):
            return None
        for ln in out.splitlines():
            parts = ln.split("|", 2)
            if len(parts) == 3 and norm(parts[2]) == want:
                return int(parts[0]), int(parts[1])
        return None

    def _url(self, a) -> str:
        url = str(a.get("url") or "").strip()
        if not url:
            raise ValueError("needs url")
        return url if "://" in url else "https://" + url

    def _settled(self, lead: str) -> dict:
        end = time.monotonic() + 12
        time.sleep(1.0)
        while time.monotonic() < end:
            try:
                if self.js(J.STATE).get("ready") == "complete":
                    break
            except RuntimeError:
                pass
            time.sleep(0.7)
        return self.snapshot(lead)

    def _tabs(self, a):
        out = self.osa(['tell application "Safari"', 'set o to ""', "repeat with w in windows",
                        "set i to 0", "repeat with t in tabs of w", "set i to i + 1",
                        'set o to o & (id of w) & "|" & i & "|" & (name of t) & "|" & (URL of t) & linefeed',
                        "end repeat", "end repeat", "return o", "end tell"])
        cur = self.state.get("safari_tab")
        rows = []
        for ln in out.splitlines():
            parts = ln.split("|", 3)
            if len(parts) == 4:
                mark = " (my working tab)" if cur and [int(parts[0]), int(parts[1])] == cur else ""
                rows.append(f"window {parts[0]} tab {parts[1]}: {parts[2]} — {parts[3]}{mark}")
        return {"text": "Safari tabs (use_tab window=W index=N works there without switching his view):\n" + "\n".join(rows)}

    def _use_tab(self, a):
        w = int(a.get("window") or self._tab()[0])
        self.state["safari_tab"] = [w, int(a.get("index") or 1)]
        return self.snapshot("Working in that tab now. ")

    def _show(self, a):
        """Put the working tab on his screen (Evens 10-16: "let me see / put it on my screen"): that tab current,
        its window in front, Safari active, then CHECK that Safari is really the front app (retry once)."""
        w, i = self._tab()
        front = ""
        for _ in range(2):
            self.osa(['tell application "Safari"', f"set current tab of window id {w} to tab {i} of window id {w}",
                      f"set index of window id {w} to 1", "activate", "end tell"])
            time.sleep(0.6)
            front = self.osa(['tell application "System Events" to name of first process whose frontmost is true'])
            if front == "Safari":
                break
        seen = ("Verified: Safari is the front app with this tab showing. " if front == "Safari" else
                f"Could not bring Safari to the front ({front or 'another app'} stayed in front); say so honestly. ")
        return self.snapshot(seen)

    def _close_tab(self, a):
        w, i = self._tab()
        if [w, i] not in self.state.get("safari_own", []):
            return {"text": "that is his tab, not one I opened; leave it open"}
        self.osa([f'tell application "Safari" to close tab {i} of window id {w}'])
        self.state["safari_own"] = [t for t in self.state.get("safari_own", []) if t != [w, i]]
        self.state.pop("safari_tab", None)
        return {"text": "closed my tab"}

    def _eval(self, a):
        got = self.js(J.eval_script(str(a.get("code") or "return document.title")))
        return {"text": json.dumps(got)[:8000]}

    def _upload(self, a):
        p = Path(str(a.get("path") or "")).expanduser()
        if not p.is_file():
            return {"text": f"no file at {p}"}
        if p.stat().st_size > UPLOAD_MAX:
            return {"text": f"{p.name} is over {UPLOAD_MAX // 1000} KB; click the field with real=true and use the file picker with computer"}
        mime = mimetypes.guess_type(p.name)[0] or "application/octet-stream"
        return self._el(a, J.upload_script(p.name, mime, base64.b64encode(p.read_bytes()).decode()), f"Attached {p.name}.", 0.8)

    def _dialog(self, a):
        """The next confirm() on the page answers OK (only after his OK for anything that sends/pays/deletes)."""
        self.js(J.wrap(J.LIB + "guard();W.__jconfirm=true;return JSON.stringify({ok:1})"))
        return {"text": "the next confirmation on this page will answer OK"}

    def _real_type(self, a):
        """Foreground fallback for pages that ignore typed-in values (live 10-16: Facebook's friends search): the tab
        comes in front, a real click focuses the field, real keystrokes type."""
        got = self._real_click({"ref": a.get("ref")})
        if "Real click" not in got.get("text", ""):
            return got
        if a.get("replace", True) is not False:
            self.hands({"op": "key", "keys": "cmd+a"})
        self.hands({"op": "type", "text": str(a.get("text") or "")})
        if a.get("submit"):
            self.hands({"op": "key", "keys": "return"})
        time.sleep(1.5)
        return self.snapshot("Typed for real. ")

    def _real_click(self, a):
        """Foreground fallback: real mouse at the element (brings the tab forward; he sees it happen)."""
        got = self.js(J.element_script(int(a.get("ref") or 0), J.HOVER))
        if got.get("error"):
            return {"text": got["error"]}
        self._show(a)
        self.osa(['tell application "Safari" to activate'])
        time.sleep(0.4)
        got = self.js(J.element_script(int(a["ref"]), J.HOVER))
        x, y = self.to_screen(got)
        self.cursor(x, y)
        self.hands({"op": "click", "x": x, "y": y, "count": 1, "button": "left"})
        time.sleep(1.5)
        return self.snapshot(f"Real click on {a['ref']}. ")
