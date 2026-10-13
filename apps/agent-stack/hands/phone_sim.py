"""Simulated phone desk (Z06 hotline PIN, Z07 'check with my boss', Z40 two-phase errand). NOTHING DIALS: telephony is on HOLD
(operator decision), so every card says SIMULATED and no number is called. States follow whIp1SOahOM 9:35-10:00 cards:
CONFIRM (inquiry scope shown) -> RINGING -> ENDED + outcome tags."""
from __future__ import annotations

import json, re, time
from pathlib import Path

STATE = Path.home() / ".jarvis" / "phone_sim.json"
CALL_RE = re.compile(r"\b(?:call|ring|phone)\s+(?:up\s+)?(?P<who>(?:the\s+)?[A-Z][\w'&]*(?:\s+[A-Z][\w'&]*){0,3}|[\w' ]{3,40}?)\s+"
                     r"(?:and\s+|to\s+)(?P<goal>ask|get|find out|check|book|request)\b(?P<rest>.*)$", re.I)
GO_RE = re.compile(r"^\s*(?:(?:hey\s+)?jarvis[,.]?\s*)?(?:do it|go ahead and (?:call|ring)|ring them)\s*[.!]?\s*$", re.I)
CANCEL_RE = re.compile(r"^\s*(?:(?:hey\s+)?jarvis[,.]?\s*)?cancel(?: the call)?\s*[.!]?\s*$", re.I)
HOTLINE_RE = re.compile(r"\bhotline\b.*\b(?:pin|code)s?\b\D*((?:\d{3,6}\D*){1,4})", re.I)
PIN = "4018"


def _load() -> dict:
    try:
        return json.loads(STATE.read_text())
    except Exception:  # noqa: BLE001
        return {}


def _save(d: dict) -> None:
    STATE.parent.mkdir(parents=True, exist_ok=True)
    STATE.write_text(json.dumps(d, indent=1))


def wants(u: str) -> bool:
    return bool(CALL_RE.search(u or "") or HOTLINE_RE.search(u or "") or (_load().get("state") == "CONFIRM" and (GO_RE.search(u or "") or CANCEL_RE.search(u or ""))))


def card(st: dict) -> dict:
    return {"title": f"📞 {st['state']} · SIMULATED", "fields": [f"Who: {st.get('who','')}", f"Scope: {st.get('scope','')}"]
            + [f"Outcome: {', '.join(st.get('tags') or [])}"] * bool(st.get("tags")), "body": st.get("line", ""), "ts": time.time()}


def run(u: str) -> dict:
    m = HOTLINE_RE.search(u or "")
    if m:  # Z06: two wrong codes -> hang up -> desk report
        codes = re.findall(r"\d{3,6}", m.group(1))
        log, strikes = [], 0
        for c in codes:
            if c == PIN:
                log.append(f"{c}: accepted"); break
            strikes += 1; log.append(f"{c}: wrong ({strikes}/2)")
            if strikes >= 2:
                log.append("hung up"); break
        ok = any(x.endswith("accepted") for x in log)
        st = {"state": "ENDED", "who": "inbound caller", "scope": "hotline PIN check", "tags": ["pin-ok"] if ok else ["2-strikes", "hung-up", "desk-report"],
              "line": "; ".join(log)}
        spoken = ("Simulated hotline: code accepted, sir; the caller would be through." if ok else
                  f"Simulated hotline: two wrong codes ({', '.join(codes[:2])}), so I hung up. Desk report filed: unknown caller failed the PIN twice.")
        return {"ok": True, "tool": "phone_sim", "spoken": spoken, "card": card(st), "sent": False, "simulated": True}
    st = _load()
    if st.get("state") == "CONFIRM" and CANCEL_RE.search(u or ""):
        st.update(state="ENDED", tags=["cancelled", "not-dialled"], line="Cancelled before dialling.", consumed=True); _save(st)
        return {"ok": True, "tool": "phone_sim", "spoken": "Cancelled, sir. Nobody was rung.", "card": card(st), "sent": False, "simulated": True}
    if st.get("state") == "CONFIRM" and GO_RE.search(u or ""):  # Z40 phase 2 + Z07 cold-open line
        st.update(state="ENDED", tags=["inquiry-only", "simulated", "quote-not-real"],
                  line=f"RINGING → ENDED. Script: \"Hello, I'm calling on behalf of Evens about {st['scope']}. I'll check with my boss and call you back "
                       f"before anything is booked.\"")
        _save(st)
        return {"ok": True, "tool": "phone_sim", "sent": False, "simulated": True, "card": card(st),
                "spoken": (f"Simulated call to {st['who']}: ringing, then ended. I'd only {st['scope']}, then say I'll check with my boss "
                           "and call back. No real call went out; telephony is on hold, so no quote came back.")}
    m = CALL_RE.search(u or "")
    who = m.group("who").strip()
    scope = (m.group("goal") + m.group("rest")).strip().rstrip(".?!")
    st = {"state": "CONFIRM", "who": who, "scope": scope, "line": "Inquiry only: gathers information, books nothing.", "ts": time.time()}
    _save(st)
    return {"ok": True, "tool": "phone_sim", "sent": False, "simulated": True, "card": card(st),
            "spoken": f"Inquiry call to {who}, sir: I'll only {scope}, nothing booked. Say 'do it' to ring or 'cancel'. This is a simulation; nothing dials yet."}
