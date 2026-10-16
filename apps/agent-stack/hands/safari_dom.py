"""Browser use in Evens's OWN Safari (his tabs, his logins), the way browser-use / Codex drive a page
(Evens 2026-10-16: "Jarvis still can't navigate on my browser"; live: it ran gh + `open URL` instead of using the page).

The page is read through Safari's "do JavaScript" (his Safari allows JavaScript from Apple Events): every visible
link, button and field gets a number. Clicks are REAL mouse clicks at the element's screen position (the blue cursor
glides there, and sites that ignore scripted clicks still react); typing is real keystrokes into the focused field.
Every action returns the fresh page, so the model sees what its action did and can correct it.
"""
from __future__ import annotations

import json
import subprocess
import time

ACTIONS = ("snapshot", "navigate", "click", "type", "key", "scroll", "back", "tabs", "switch_tab", "read")
OSA_TIMEOUT = 15
MAX_ELEMENTS = 250

SNAPSHOT_JS = r"""(()=>{let n=0,out=[];
const sel='a[href],button,input:not([type=hidden]),select,textarea,summary,[role=button],[role=link],[role=tab],[role=menuitem],[role=option],[role=checkbox],[role=switch],[role=combobox],[role=searchbox],[contenteditable=true],[onclick]';
document.querySelectorAll('[data-jref]').forEach(e=>e.removeAttribute('data-jref'));
for(const e of document.querySelectorAll(sel)){const r=e.getBoundingClientRect();if(r.width<2||r.height<2)continue;
const st=getComputedStyle(e);if(st.visibility==='hidden'||st.display==='none'||st.opacity==='0')continue;
const lab=(e.getAttribute('aria-label')||e.innerText||e.value||e.placeholder||e.title||e.getAttribute('alt')||(e.querySelector('img')||{}).alt||e.getAttribute('href')||'').trim().replace(/\s+/g,' ').slice(0,90);
n++;e.setAttribute('data-jref',n);const off=(r.bottom<0||r.top>innerHeight)?' (scroll to see)':'';
out.push(n+' '+(e.getAttribute('role')||e.tagName.toLowerCase())+(e.type&&e.tagName!=='BUTTON'?'['+e.type+']':'')+' "'+lab+'"'+off);if(n>=%d)break;}
return JSON.stringify({url:location.href,title:document.title,elements:out.join('\n'),text:(document.body?document.body.innerText:'').replace(/\n{3,}/g,'\n\n').slice(0,2500)});})()""" % MAX_ELEMENTS

WHERE_JS = r"""(()=>{const e=document.querySelector('[data-jref="%s"]');if(!e)return JSON.stringify({error:'no element %s on this page; take a new snapshot'});
e.scrollIntoView({block:'center',inline:'center'});const r=e.getBoundingClientRect();
return JSON.stringify({cx:r.left+r.width/2,cy:r.top+r.height/2,iw:window.innerWidth,ih:window.innerHeight,
tag:e.tagName.toLowerCase()});})()"""

FOCUS_JS = r"""(()=>{const e=document.querySelector('[data-jref="%s"]');if(!e)return 'missing';e.scrollIntoView({block:'center'});e.focus();
if(e.select&&%s)e.select();return 'ok';})()"""

READ_JS = r"""(()=>JSON.stringify({url:location.href,title:document.title,text:(document.body?document.body.innerText:'').slice(0,12000)}))()"""


def _osa(lines: list, *args: str, timeout: int = OSA_TIMEOUT) -> str:
    argv = ["osascript"]
    for ln in lines:
        argv += ["-e", ln]
    cp = subprocess.run(argv + list(args), capture_output=True, text=True, timeout=timeout)
    if cp.returncode != 0:
        raise RuntimeError(cp.stderr.strip() or "osascript failed")
    return cp.stdout.strip()


def js(code: str) -> str:
    return _osa(["on run argv", 'tell application "Safari" to do JavaScript (item 1 of argv) in current tab of front window',
                 "end run"], code)


class SafariDOM:
    """`hands(req)` sends one Jarvis Hands event; `cursor(x, y)` glides the blue cursor. Both come from the operator."""

    def __init__(self, hands, cursor, run_js=js, osa=_osa):
        self.hands, self.cursor, self.js, self.osa = hands, cursor, run_js, osa

    def _front(self) -> None:
        self.osa(['tell application "Safari"', "activate",
                  "if (count of windows) = 0 then make new document", "end tell"])

    def snapshot(self, lead: str = "") -> dict:
        try:
            d = json.loads(self.js(SNAPSHOT_JS) or "{}")
        except (ValueError, RuntimeError) as exc:
            return {"text": f"{lead}could not read the page: {exc}"}
        return {"text": (f"{lead}Safari page: {d.get('title')} — {d.get('url')}\nElements (use the number to click/type):\n"
                         f"{d.get('elements') or '(none)'}\n\nPage text:\n{d.get('text') or ''}")}

    def act(self, a: dict) -> dict:
        action = str(a.get("action") or "snapshot")
        if action not in ACTIONS:
            return {"text": f"unknown action {action}; use one of {', '.join(ACTIONS)}"}
        try:
            return getattr(self, "_" + action)(a)
        except subprocess.TimeoutExpired:
            return {"text": "Safari did not answer in time (it may be showing a dialog); take a computer screenshot to see"}
        except RuntimeError as exc:
            return {"text": f"Safari error: {exc}"}

    def _snapshot(self, a):
        return self.snapshot()

    def _read(self, a):
        d = json.loads(self.js(READ_JS) or "{}")
        return {"text": f"{d.get('title')} — {d.get('url')}\n{d.get('text') or ''}"}

    def _navigate(self, a):
        url = str(a.get("url") or "").strip()
        if not url:
            return {"text": "navigate needs url"}
        if "://" not in url:
            url = "https://" + url
        self._front()
        # the tab he is on changes address: no new tab per request (live 10-16: 18 Spotify tabs)
        self.osa(["on run argv", 'tell application "Safari" to set URL of current tab of front window to (item 1 of argv)',
                  "end run"], url)
        self._settle(2.5)
        return self.snapshot("Navigated. ")

    def _settle(self, s: float) -> None:
        time.sleep(s)

    def _click(self, a):
        ref = str(a.get("ref") or "").strip()
        self._front()
        where = json.loads(self.js(WHERE_JS % (ref, ref)) or "{}")
        if where.get("error"):
            return {"text": where["error"]}
        time.sleep(0.3)  # scrollIntoView settles before we read the spot again
        where = json.loads(self.js(WHERE_JS % (ref, ref)) or "{}")
        x, y = self.to_screen(where)
        self.cursor(x, y)
        got = self.hands({"op": "click", "x": x, "y": y, "count": 1, "button": "left"})
        if "trusted\": false" in str(got.get("text", "")).replace(" ", "") or "not installed" in str(got.get("text", "")):
            return got
        self._settle(1.5)
        return self.snapshot(f"Clicked {ref}. ")

    def to_screen(self, where: dict) -> tuple:
        """Page point -> global mouse point. Safari hides screenX/screenY from pages (live 10-16: both 0, every click
        landed in the corner of the main display), so the window frame comes from Safari's own AppleScript bounds:
        {left, top, right, bottom} in global top-left points; the toolbar is the frame height minus innerHeight."""
        b = [int(v) for v in self.osa(['tell application "Safari" to get bounds of front window']).replace(" ", "").split(",")]
        left, top, right, bottom = b
        x = left + (right - left - float(where["iw"])) / 2 + float(where["cx"])
        y = top + (bottom - top - float(where["ih"])) + float(where["cy"])
        return int(round(x)), int(round(y))

    def _type(self, a):
        ref, text = str(a.get("ref") or "").strip(), str(a.get("text") or "")
        self._front()
        if ref and self.js(FOCUS_JS % (ref, "true" if a.get("replace", True) else "false")) == "missing":
            return {"text": f"no element {ref}; take a new snapshot"}
        self.hands({"op": "type", "text": text})
        if a.get("submit"):
            self.hands({"op": "key", "keys": "return"})
            self._settle(2.0)
        else:
            self._settle(0.6)
        return self.snapshot("Typed. ")

    def _key(self, a):
        self._front()
        self.hands({"op": "key", "keys": str(a.get("keys") or a.get("text") or "")})
        self._settle(1.0)
        return self.snapshot("Pressed. ")

    def _scroll(self, a):
        amount = int(a.get("amount") or 600) * (-1 if str(a.get("direction") or "down") == "up" else 1)
        self.js(f"window.scrollBy(0,{amount});'ok'")
        self._settle(0.5)
        return self.snapshot("Scrolled. ")

    def _back(self, a):
        self.js("history.back();'ok'")
        self._settle(2.0)
        return self.snapshot("Went back. ")

    def _tabs(self, a):
        out = self.osa(['tell application "Safari"', "set o to \"\"", "set w to front window", "set i to 0",
                        "repeat with t in tabs of w", "set i to i + 1",
                        "set o to o & i & \" | \" & (name of t) & \" | \" & (URL of t) & linefeed", "end repeat",
                        "return o", "end tell"])
        return {"text": "Tabs in his front Safari window (switch_tab with index):\n" + out}

    def _switch_tab(self, a):
        i = int(a.get("index") or 1)
        self._front()
        self.osa([f'tell application "Safari" to set current tab of front window to tab {i} of front window'])
        self._settle(0.8)
        return self.snapshot(f"Switched to tab {i}. ")
