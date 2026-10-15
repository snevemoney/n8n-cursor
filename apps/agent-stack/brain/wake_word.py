"""Wake word gate. Pure functions, no I/O, caller passes the clock.

Asleep: speech is ignored unless it holds a wake phrase ("hey jarvis").
Wake phrase plus words after it: those words are the command, kept verbatim.
Wake phrase alone: gate opens for `window` seconds for the next command.
Awake speech inside the window is a command. After the window: asleep again.
"""
from __future__ import annotations

import re

WAKE_PHRASES = ("hey jarvis", "ok jarvis", "okay jarvis")
DEFAULT_WINDOW = 8.0
_LEAD = " \t\n,.:;!?"


def normalize(text) -> str:
    text = str(text or "").lower()
    text = re.sub(r"[^a-z0-9' ]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def _pattern(phrase):
    words = [re.escape(word) for word in phrase.split()]
    body = r"[\W_]+".join(words)
    return re.compile(r"(?<![A-Za-z0-9'])" + body + r"(?![A-Za-z0-9'])", re.I)


def split_wake(text, phrases=WAKE_PHRASES):
    """Find the last wake phrase and preserve the original command remainder."""
    raw = str(text or "")
    end = None
    for phrase in phrases:
        for match in _pattern(phrase).finditer(raw):
            if end is None or match.end() > end:
                end = match.end()
    if end is None:
        return False, ""
    return True, raw[end:].lstrip(_LEAD).rstrip()


class WakeGate:
    def __init__(self, window: float = DEFAULT_WINDOW, phrases=WAKE_PHRASES):
        if window <= 0:
            raise ValueError("window must be positive")
        self.window = float(window)
        self.phrases = tuple(phrases)
        self.awake_until = None

    def is_awake(self, now: float) -> bool:
        return self.awake_until is not None and now <= self.awake_until

    def sleep(self) -> None:
        self.awake_until = None

    def feed(self, text, now: float) -> dict:
        found, command = split_wake(text, self.phrases)
        if found:
            self.awake_until = now + self.window
            if command:
                return {"action": "command", "command": command}
            return {"action": "wake", "command": ""}
        if self.is_awake(now):
            if not normalize(text):
                return {"action": "ignore", "command": ""}
            self.awake_until = now + self.window
            return {"action": "command", "command": str(text).strip()}
        self.sleep()
        return {"action": "ignore", "command": ""}
