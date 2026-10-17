"""Google AI Studio, direct (Evens 2026-10-16: learn the Watch Later for $0-20 without lowering quality).

- Free tier: Gemini 3.6 Flash is free of charge on AI Studio; YouTube links are watched by Google (no download); the free
  tier allows about 8 hours of YouTube video per day — tracked here so the queue can switch or wait.
- Watch once, reuse it: the first call sends the video; every later pass (methods, capabilities, spot-check) continues the
  same stateful interaction (previous_interaction_id), so the video is not sent again and repeated context is cached.
- The key lives only in ~/.config/brain/gemini.env (0600). It is never printed, logged or returned.
"""
from __future__ import annotations

import datetime as dt
import json
import os
import re
import time
import urllib.error
import urllib.request
from pathlib import Path

KEY_FILE = Path.home() / ".config/brain/gemini.env"
FREE_STATE = Path.home() / "Library/Caches/jarvis/signals/gemini-free.json"
ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/interactions"
MODEL = os.environ.get("JARVIS_WATCH_MODEL_DIRECT") or "gemini-3.8-flash"  # live 10-16: 3.6 has no free quota for new projects; 3.8 does
FREE_SECONDS_PER_DAY = 8 * 3600
MAX_CONTINUE = 8


def _key() -> str:
    if os.environ.get("GEMINI_API_KEY"):
        return os.environ["GEMINI_API_KEY"].strip()
    try:
        for line in KEY_FILE.read_text().splitlines():
            m = re.match(r"\s*(?:export\s+)?GEMINI_API_KEY\s*=\s*['\"]?([^'\"\s#]*)", line)
            if m:
                return m.group(1)
    except OSError:
        pass
    return ""


def has_key() -> bool:
    return len(_key()) >= 20


def status() -> dict:
    """Safe to show: never contains the key."""
    used = _free_used()
    s = _state()
    return {"configured": has_key(), "model": MODEL, "free_seconds_used_today": used,
            "free_seconds_left_today": max(0, FREE_SECONDS_PER_DAY - used),
            "free_requests_used_today": int(s.get("requests", 0)), "free_requests_per_day": FREE_REQUESTS_PER_DAY,
            "blocked_until": s.get("blocked_until", 0)}


def _today() -> str:
    return dt.date.today().isoformat()


FREE_REQUESTS_PER_DAY = int(os.environ.get("JARVIS_GEMINI_FREE_RPD") or 20)  # live 10-16: 3.8-flash free tier = 20 requests/day
REQUESTS_PER_VIDEO = 6   # log + gap round + methods + sweep + continuations: never start a video the day cannot finish
LONG_WAIT_S = 900        # a 429 asking for longer than this is the daily quota, not the per-minute limit


class DailyQuota(RuntimeError):
    """Today's free requests are used; Google says when they come back."""


def _state() -> dict:
    try:
        s = json.loads(FREE_STATE.read_text())
    except (OSError, ValueError):
        return {"day": _today()}
    if s.get("day") != _today():  # new day: counters reset, a block that ends later still holds
        s = {"day": _today(), "blocked_until": s.get("blocked_until", 0)}
    return s


def _save(**kw) -> None:
    FREE_STATE.parent.mkdir(parents=True, exist_ok=True)
    FREE_STATE.write_text(json.dumps({**_state(), **kw}))


def _free_used() -> int:
    return int(_state().get("seconds", 0))


def free_room(seconds: int) -> bool:
    """Room left on the free tier for a whole video: not blocked, enough requests for every pass, within 8 h of video."""
    s = _state()
    return (time.time() >= float(s.get("blocked_until") or 0)
            and int(s.get("requests", 0)) + REQUESTS_PER_VIDEO <= FREE_REQUESTS_PER_DAY
            and int(s.get("seconds", 0)) + int(seconds) <= FREE_SECONDS_PER_DAY)


def _count_free(seconds: int) -> None:
    _save(seconds=_free_used() + int(seconds))


def _retry_seconds(text: str) -> float:
    m = re.search(r"retry in ((?:\d+h)?(?:\d+m)?(?:[\d.]+s)?)", text or "")
    if not m or not m.group(1):
        return 0
    parts = {unit: num for num, unit in re.findall(r"([\d.]+)([hms])", m.group(1))}
    return float(parts.get("h", 0)) * 3600 + float(parts.get("m", 0)) * 60 + float(parts.get("s", 0))


RETRY_WAITS = (30, 60, 120, 240)   # live 10-16: the free tier limits requests per minute; it answers again minutes later
MIN_GAP_S = 6                       # pace requests so a video's passes do not burst
_last = [0.0]


def _post(body: dict) -> dict:
    for wait in (*RETRY_WAITS, None):
        gap = MIN_GAP_S - (time.time() - _last[0])
        if gap > 0:
            time.sleep(gap)
        req = urllib.request.Request(ENDPOINT, data=json.dumps(body).encode(),
                                     headers={"Content-Type": "application/json", "x-goog-api-key": _key()})
        try:
            with urllib.request.urlopen(req, timeout=1800) as r:
                _last[0] = time.time()
                return json.loads(r.read() or b"{}")
        except urllib.error.HTTPError as exc:
            _last[0] = time.time()
            if exc.code != 429:
                raise
            try:
                detail = exc.read().decode(errors="replace")
            except Exception:  # noqa: BLE001 - the body is only a hint
                detail = ""
            delay = _retry_seconds(detail)
            if delay > LONG_WAIT_S:
                _save(blocked_until=time.time() + delay, requests=FREE_REQUESTS_PER_DAY)
                raise DailyQuota(f"Google free tier used for today; back in {delay / 3600:.1f} h") from exc
            if wait is None:
                raise
            time.sleep(max(wait, delay))
    raise RuntimeError("unreachable")


def _text(data: dict) -> str:
    """The model's text, whatever the exact response layout (the reference is not fully documented)."""
    if isinstance(data.get("output_text"), str):
        return data["output_text"]
    parts = []
    for key in ("outputs", "output", "steps"):
        for item in data.get(key) or []:
            if not isinstance(item, dict):
                continue
            if isinstance(item.get("text"), str) and item.get("type", "text") in ("text", "model_output", "output_text"):
                parts.append(item["text"])
            for c in item.get("content") or []:
                if isinstance(c, dict) and isinstance(c.get("text"), str):
                    parts.append(c["text"])
    return "".join(parts)


def _incomplete(data: dict) -> bool:
    s = str(data.get("status") or data.get("finish_reason") or "").lower()
    return s in ("incomplete", "max_tokens", "length")


class VideoSession:
    """One watched video; ask() as many passes as needed without re-sending the video."""

    def __init__(self, url: str, seconds: int, fps: float = 1.0, model: str = MODEL):
        self.url, self.seconds, self.fps, self.model = url, int(seconds or 0), float(fps or 1.0), model
        self.last_id = ""
        self.cached_tokens = 0
        self.input_tokens = 0

    def _video(self) -> dict:
        v = {"type": "video", "uri": self.url}
        if self.fps != 1.0:
            v["processing"] = {"type": "static", "fps": self.fps}
        return v

    def ask(self, prompt: str) -> str:
        first = not self.last_id
        body = {"model": self.model, "input": ([self._video()] if first else []) + [{"type": "text", "text": prompt}],
                "generation_config": {"thinking_level": "low", "temperature": 0.2}}
        if not first:
            body["previous_interaction_id"] = self.last_id
        out = ""
        for _ in range(MAX_CONTINUE):
            data = _post(body)
            _save(requests=int(_state().get("requests", 0)) + 1)
            if data.get("error"):
                raise RuntimeError(f"Gemini: {str(data['error'])[:300]}")
            self.last_id = str(data.get("id") or self.last_id)
            u = data.get("usage") or {}
            self.input_tokens += int(u.get("total_input_tokens") or u.get("input_tokens") or 0)
            self.cached_tokens += int(u.get("total_cached_tokens") or u.get("cached_tokens") or 0)
            out += _text(data)
            if not _incomplete(data):
                break
            body = {"model": self.model, "previous_interaction_id": self.last_id,
                    "input": [{"type": "text", "text": "Continue exactly where you stopped. Do not repeat anything."}],
                    "generation_config": {"thinking_level": "low", "temperature": 0.2}}
        if first:
            _count_free(self.seconds)
        return out
