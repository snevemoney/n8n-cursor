#!/usr/bin/env python3
"""Jev ADVISORY router for Jarvis (methods 1-8 of jev-methods-20261012).

What it does, per turn, before the slow talk call:
  1. Deterministic skill picker (code, ~0 ms): handler + confidence from closed regex rules.
  2. Decision cache (normalized utterance -> decision, short TTL). Hard steps are never cached.
  3. Optional live Jev call (typesafe/jev-1.13): ONE request carrying every routing question
     (<= 12), run on a daemon thread with a hard 300-800 ms budget. Any error or timeout returns
     None and the turn takes today's path, silently.
  4. Confidence read: `unclear` (picker, or live Jev >= 0.8 with an incomplete request) on a short
     non-follow-up ask -> one short clarifying question, no model call. Low confidence -> escalate,
     i.e. keep today's frontier path. Nothing else changes the reply.

Authority: NONE. The regex hard-step gate (pipeline.HARD_STEP_RE) runs before this module and
stays the authority. Jev never approves sends, merges, spend, deploys or publishes; it can only
add friction (clarify) or be ignored. The shadow log carries no user text and no key.
"""
from __future__ import annotations

import hashlib
import json
import os
import re
import threading
import time
import urllib.request
from collections import OrderedDict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable

MODE = "ADVISORY"
LOG_NAME = "jev-router.jsonl"
OPENROUTER_DECISIONS = "https://openrouter.ai/api/alpha/decisions"
LITELLM_BASE = "https://llm.evenslouis.ca/v1/chat/completions"
JEV_MODEL = "typesafe/jev-1.13"
MAX_QUESTIONS = 12
CLARIFY_LINE = "I only caught part of that. What would you like me to do?"

HANDLERS = ("memory", "converse", "status", "recall", "local_read", "tool", "craft", "hard_step", "unclear", "other")

# --- 1. deterministic skill picker (m46 pattern): ordered rules, first match wins -----------------
_RULES: list[tuple[str, float, re.Pattern]] = [
    ("hard_step", 1.0, re.compile(r"\b(send|email|text|pay|purchase|buy|deploy|merge|publish|post|delete|wire\s+money|transfer)\b.{0,40}\b(it|this|that|the|to|now|invoice|pr|money|\$)", re.I)),
    ("memory", 0.9, re.compile(r"^\s*(?:(?:can|could|would)\s+you\s+)?(?:please\s+)?(?:remember|forget|recall)\b|^\s*what\s+do\s+you\s+remember\b", re.I)),
    ("status", 0.9, re.compile(r"\b(run\s+status|status\s+(?:check|report)|are\s+(?:all\s+)?(?:your\s+)?tools\s+ready|system\s+status|are\s+you\s+(?:up|online|working))\b", re.I)),
    ("recall", 0.9, re.compile(r"\b(what\s+did\s+(?:I|you|we)\s+(?:just\s+)?(?:say|ask|tell)|remind\s+me\s+what|earlier\s+you\s+said|last\s+thing\s+(?:I|you)\s+said)\b", re.I)),
    # web_search hand: explicit web lookups (advisory label only).
    ("web_search", 0.9, re.compile(r"\b(?:search|check)\s+(?:the\s+)?(?:web|internet|online)\b|\blook\s+(?:it\s+)?up\s+online\b|\bweb\s+search\b|\bgoogle\s+(?:the|for|what|who|how)\b", re.I)),
    # workspace_read hand: repo/branch/file/folder asks are a local read (advisory label only).
    ("local_read", 0.9, re.compile(r"\b(?:what|which)\s+(?:repo|repos|branch)\b|\b(?:read|open)\b.{0,40}\.(?:md|txt|py|json)\b|\blist\b.{0,30}\b(?:downloads|desktop|documents)\b", re.I)),
    # code_run hand (advisory label only).
    ("local_read", 0.9, re.compile(r"\b(?:write|run)\b.{0,40}\bpython\b.{0,60}\b(?:run|test|tests)\b|\brun\s+this\s+python\b|\brun\s+the\s+tests?\s+for\s+this\s+python\b", re.I)),
    # desk_dispatch hand (advisory label only).
    ("local_read", 0.9, re.compile(r"\b(?:ask|dispatch\s+(?:this\s+)?to|hand\s+(?:this\s+)?to)\s+(?:the\s+)?(?:jev|watchdog|forge|librarian|consultant|claude|codex|capex|scout)\b", re.I)),
    # mcp_inventory hand: which MCP servers is a local config read, names only (advisory label only).
    ("local_read", 0.9, re.compile(r"\b(?:which|what|list|show)\b.{0,25}\bmcp\b", re.I)),
    # skills hand: which skills / read one skill is a local read (advisory label only).
    ("local_read", 0.9, re.compile(r"\b(?:which|what)\s+skills\b|\b(?:list|show)\b.{0,20}\bskills\b|\b(?:read|open|show)\s+(?:the\s+)?[\w.\-]+\s+skill\b", re.I)),
    ("local_read", 0.9, re.compile(r"\b(read|open|show)\s+(?:me\s+)?(?:my|the)\s+(?:vault|note|notes|file|lane|doc)\b|\bin\s+(?:my|the)\s+vault\b", re.I)),
    ("tool", 0.85, re.compile(r"\b(open|click|type\s+into|look\s+at\s+(?:my|the)\s+screen|safari|watch\s+mode|cursor\s+agent|screenshot)\b", re.I)),
    ("craft", 0.85, re.compile(r"\b(gridcraft|photocraft|artcraft|\w+craft)\b.*\b(make|create|save|export|edit|build|write)\b|\b(make|create|save|export|edit|build|write)\b.*\b\w+craft\b", re.I)),
    ("converse", 0.9, re.compile(
        r"^\s*(?:(?:can|could)\s+you\s+)?(?:explain|describe|define|summari[sz]e|tell\s+me\s+(?:about|what|a|how|why)|what\s+(?:is|are|does|do|can)\b|"
        r"why\s+(?:is|are|do|does)\b|how\s+(?:does|do|is|are)\b|name\s+(?:\w+\s+)?things|give\s+me\s+(?:a|an|one)\b|"
        r"(?:are\s+you|am\s+I|is\s+\w+)\s+allowed\s+to\b|who\s+(?:can|may|is\s+allowed\s+to|gets\s+to)\b|what\s+should\s+I\b|where\s+do(?:es)?\b|"
        r"what'?s\s+the\s+plan\b|what\s+model\b|thanks?\b|thank\s+you\b|how\s+are\s+you\b|good\s+(?:morning|evening|night|afternoon)\b|tell\s+me\s+a\s+joke\b)",
        re.I)),
]
_FILLER = {"um", "uh", "er", "erm", "hmm", "so", "and", "the", "a", "an", "but", "like", "well", "okay", "ok", "then", "that", "this", "it", "to", "of", "i", "mean"}
_FOLLOW_OK = re.compile(r"^\s*(yes|yeah|yep|no|nope|sure|go\s+on|continue|do\s+it|stop|cancel|again|why|how|more|and\s+then\??)\s*[.!?]*\s*$", re.I)


def _words(utterance: str) -> list[str]:
    return re.findall(r"[a-z0-9']+", (utterance or "").lower())


def pick_skill(utterance: str) -> dict[str, Any]:
    """Deterministic handler pick. Free, offline, never raises."""
    text = (utterance or "").strip()
    words = _words(text)
    if not words:
        return {"handler": "unclear", "confidence": 0.95, "rule": "empty"}
    if _FOLLOW_OK.match(text):
        return {"handler": "converse", "confidence": 0.6, "rule": "follow_up"}
    if len(words) <= 3 and all(w in _FILLER for w in words):
        return {"handler": "unclear", "confidence": 0.9, "rule": "filler"}
    for handler, conf, rx in _RULES:
        if rx.search(text):
            return {"handler": handler, "confidence": conf, "rule": handler}
    return {"handler": "other", "confidence": 0.4, "rule": "none"}


# --- 4. one call, every routing question (<= 12) ---------------------------------------------------
QUESTIONS: dict[str, dict[str, Any]] = {
    "handler": {"type": "choice", "instructions": "Which handler fits this voice turn to the assistant Jarvis?",
                "criteria": {"converse": "a plain question or chat answered in words", "status": "asks for live system status",
                             "recall": "asks what was said earlier", "local_read": "asks to read a note, file or vault",
                             "tool": "asks Jarvis to act on the computer or an app", "unclear": "too short, cut off or ambiguous to act on",
                             "other": "none of these"}},
    "needs_expensive": {"type": "noul", "instructions": "Does answering need a frontier model rather than a short reply?",
                        "criteria": {"true": "open reasoning or a long answer", "false": "a short, fixed or lookup answer"}},
    "addressed_to_jarvis": {"type": "noul", "instructions": "Is this addressed to the assistant?",
                            "criteria": {"true": "a request or question for the assistant", "false": "background speech"}},
    "request_complete": {"type": "noul", "instructions": "Is the request complete enough to act on?",
                         "criteria": {"true": "complete", "false": "cut off or missing what to act on"}},
    "hard_step_hint": {"type": "noul", "instructions": "Does it ask to send, pay, deploy, merge, publish or delete something?",
                       "criteria": {"true": "yes", "false": "no"}},
}
assert len(QUESTIONS) <= MAX_QUESTIONS


def validate_questions(questions: dict[str, Any]) -> None:
    if not questions or len(questions) > MAX_QUESTIONS:
        raise ValueError(f"1..{MAX_QUESTIONS} questions per call")
    for name, q in questions.items():
        if q.get("type") not in {"choice", "noul", "score"} or "instructions" not in q:
            raise ValueError(f"bad question {name}")


def _flag(name: str, default: str = "1") -> bool:
    return os.environ.get(name, default).strip().lower() not in {"0", "false", "off", "no", ""}


def budget_ms() -> int:
    try:
        raw = int(float(os.environ.get("JARVIS_JEV_BUDGET_MS", "600")))
    except ValueError:
        raw = 600
    return max(300, min(800, raw))


def _endpoint() -> tuple[str, str, str] | None:
    """(kind, url, key) or None. Keys are read from env only and never logged or returned to callers."""
    lite = (os.environ.get("LITELLM_KEY_JARVIS") or "").strip()
    if lite and _flag("JARVIS_JEV_LITELLM", "1"):
        return "litellm", os.environ.get("JARVIS_JEV_LITELLM_URL", LITELLM_BASE), lite
    key = (os.environ.get("OPENROUTER_API_KEY") or "").strip()
    if key:
        return "openrouter", os.environ.get("JARVIS_JEV_URL", OPENROUTER_DECISIONS), key
    return None


def _post(kind: str, url: str, key: str, utterance: str, timeout_s: float) -> dict[str, Any]:
    state = {"utterance": utterance[:400]}
    if kind == "litellm":
        body = {"model": "jev", "messages": [{"role": "user", "content": json.dumps(state)}], "questions": QUESTIONS}
    else:
        body = {"model": JEV_MODEL, "state": state, "questions": QUESTIONS}
    req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"), method="POST",
                                 headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json",
                                          "X-OpenRouter-Title": "jarvis-jev-router"})
    with urllib.request.urlopen(req, timeout=timeout_s) as resp:  # noqa: S310 (fixed https url)
        data = json.loads(resp.read().decode("utf-8"))
    answers = data.get("answers")
    if answers is None and isinstance(data.get("choices"), list):  # OpenAI-shaped proxy reply
        content = ((data["choices"][0] or {}).get("message") or {}).get("content") or "{}"
        answers = (json.loads(content) if isinstance(content, str) else content).get("answers")
    if not isinstance(answers, dict):
        raise ValueError("no answers")
    return answers


def _summarize(answers: dict[str, Any]) -> dict[str, Any]:
    h = answers.get("handler") or {}
    def noul(k):
        v = (answers.get(k) or {}).get("noul")
        return round(float(v), 3) if isinstance(v, (int, float)) else None
    conf = h.get("confidence")
    return {"handler": h.get("choice"), "confidence": round(float(conf), 3) if isinstance(conf, (int, float)) else None,
            "needs_expensive": noul("needs_expensive"), "addressed": noul("addressed_to_jarvis"),
            "complete": noul("request_complete"), "hard_hint": noul("hard_step_hint")}


# --- 5. decision cache -----------------------------------------------------------------------------
class DecisionCache:
    def __init__(self, ttl_s: float = 90.0, size: int = 128, clock: Callable[[], float] = time.monotonic):
        self.ttl_s, self.size, self.clock = ttl_s, size, clock
        self._d: "OrderedDict[str, tuple[float, dict]]" = OrderedDict()
        self._lock = threading.Lock()

    @staticmethod
    def key(utterance: str) -> str:
        return hashlib.sha256(" ".join(_words(utterance)).encode()).hexdigest()[:24]

    def get(self, utterance: str) -> dict | None:
        k = self.key(utterance)
        with self._lock:
            hit = self._d.get(k)
            if not hit:
                return None
            if self.clock() - hit[0] > self.ttl_s:
                self._d.pop(k, None)
                return None
            self._d.move_to_end(k)
            return dict(hit[1])

    def put(self, utterance: str, decision: dict) -> bool:
        if decision.get("handler") == "hard_step" or (decision.get("hard_hint") or 0) >= 0.5:
            return False  # never cache anything that touches a hard step
        k = self.key(utterance)
        with self._lock:
            self._d[k] = (self.clock(), dict(decision))
            self._d.move_to_end(k)
            while len(self._d) > self.size:
                self._d.popitem(last=False)
        return True


def _ttl() -> float:
    try:
        return max(5.0, min(600.0, float(os.environ.get("JARVIS_JEV_CACHE_TTL_SEC", "90"))))
    except ValueError:
        return 90.0


CACHE = DecisionCache(ttl_s=_ttl())


# --- 1+2. preflight handle: start before the slow call, read with a hard budget -------------------
class Preflight:
    def __init__(self, utterance: str, *, live: bool | None = None, post=None, clock=time.monotonic):
        self.t0 = clock()
        self.clock = clock
        self.budget_s = budget_ms() / 1000.0
        self.picker = pick_skill(utterance)
        self.live = None
        self.source = "picker"
        self.cache_hit = False
        self.timed_out = False
        self.not_waited = False
        self.error = None
        self.live_ms = None
        self._done = threading.Event()
        cached = CACHE.get(utterance)
        if cached is not None:
            self.live, self.cache_hit, self.source = cached, True, "cache"
            self._done.set()
            return
        want_live = _flag("JARVIS_JEV_LIVE", "1") if live is None else live
        ep = _endpoint() if want_live else None
        if not ep or self.picker["handler"] == "hard_step":
            self._done.set()  # hard steps never leave the box for advice
            return
        self.source = ep[0]
        poster = post or _post

        def run() -> None:
            t = time.monotonic()
            try:
                summary = _summarize(poster(ep[0], ep[1], ep[2], utterance, self.budget_s))
                self.live = summary
                CACHE.put(utterance, summary)
            except Exception as exc:  # noqa: BLE001 -- advisory: any failure is silent fallback
                self.error = type(exc).__name__
            finally:
                self.live_ms = int((time.monotonic() - t) * 1000)
                self._done.set()

        threading.Thread(target=run, daemon=True, name="jev-preflight").start()

    def result(self, *, wait: bool = True) -> dict[str, Any] | None:
        """Live/cached summary, or None. Waits at most what is left of the budget."""
        if not self._done.is_set() and wait:
            left = self.budget_s - (self.clock() - self.t0)
            if left > 0:
                self._done.wait(left)
        if not self._done.is_set():
            self.timed_out = wait  # not waiting (confident picker) is not a timeout
            self.not_waited = not wait
            return None
        return self.live

    def decide(self, *, follow_up: bool = False) -> dict[str, Any]:
        """Advisory action: 'clarify' | 'escalate' | 'proceed'. Never 'approve'."""
        pk = self.picker
        # A confident picker does not wait on the network (no latency added).
        live = self.result(wait=pk["confidence"] < 0.85)
        action, why = "proceed", "picker"
        if pk["handler"] == "hard_step":
            action, why = "proceed", "hard_step_gate_owns"
        elif not follow_up and pk["handler"] == "unclear":
            action, why = "clarify", "picker_unclear"
        elif (not follow_up and live and live.get("handler") == "unclear" and (live.get("confidence") or 0) >= 0.8
              and (live.get("complete") if live.get("complete") is not None else 1) < 0.3 and pk["confidence"] < 0.85
              and self.short):
            action, why = "clarify", "jev_unclear"
        elif live and (live.get("confidence") or 0) < 0.6 and pk["confidence"] < 0.85:
            action, why = "escalate", "low_confidence"
        return {"action": action, "why": why}

    short = False

    def summary(self) -> dict[str, Any]:
        live = self.live or {}
        return {"picker": self.picker.get("handler"), "picker_conf": self.picker.get("confidence"),
                "source": self.source, "cache_hit": self.cache_hit, "timed_out": self.timed_out, "not_waited": self.not_waited,
                "error": self.error, "live_ms": self.live_ms, "budget_ms": int(self.budget_s * 1000),
                "jev_handler": live.get("handler"), "jev_conf": live.get("confidence"),
                "needs_expensive": live.get("needs_expensive"), "hard_hint": live.get("hard_hint")}


def start(utterance: str, **kw) -> Preflight | None:
    """Start the preflight. Off with JARVIS_JEV_ROUTER=0. Never raises."""
    if not _flag("JARVIS_JEV_ROUTER", "1"):
        return None
    try:
        pf = Preflight(utterance, **kw)
        pf.short = len(_words(utterance)) <= 4
        return pf
    except Exception:  # noqa: BLE001
        return None


def advise(pf: Preflight | None, *, follow_up: bool = False) -> dict[str, Any]:
    if pf is None:
        return {"action": "proceed", "why": "off"}
    try:
        return pf.decide(follow_up=follow_up)
    except Exception as exc:  # noqa: BLE001
        return {"action": "proceed", "why": f"error:{type(exc).__name__}"}


# --- 6. shadow log: latency, path, outcome; no user text ------------------------------------------
def log_turn(hive: Path, pf: Preflight | None, *, advice: dict | None, latency_ms: int | None, path: str | None,
             outcome: str | None, tool: str | None, hard_step: bool) -> dict | None:
    if not _flag("JARVIS_JEV_LOG", "1"):
        return None
    row = {"ts": datetime.now(timezone.utc).isoformat(), "mode": MODE, "authoritative": False,
           "latency_ms": latency_ms, "path": path, "outcome": outcome, "tool": tool, "hard_step": bool(hard_step),
           "advice": (advice or {}).get("action"), "advice_why": (advice or {}).get("why")}
    if pf is not None:
        try:
            row.update(pf.summary())
        except Exception:  # noqa: BLE001
            pass
    try:
        out = Path(hive) / "bus" / LOG_NAME
        out.parent.mkdir(parents=True, exist_ok=True)
        with out.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(row, ensure_ascii=True) + "\n")
    except OSError:
        pass
    return row


# --- 6b. labelled replay set ----------------------------------------------------------------------
REPLAY_SET = Path(__file__).with_name("jev_replay_set.jsonl")


def replay(path: Path = REPLAY_SET, picker=pick_skill) -> dict[str, Any]:
    rows = [json.loads(l) for l in path.read_text(encoding="utf-8").splitlines() if l.strip()]
    hits, misses = 0, []
    for r in rows:
        got = picker(r["utterance"])["handler"]
        ok = got == r["label"] or (r["label"] in {"converse", "other"} and got in {"converse", "other"} and r.get("loose"))
        hits += ok
        if not ok:
            misses.append({"id": r["id"], "label": r["label"], "got": got})
    return {"n": len(rows), "correct": hits, "accuracy": round(hits / max(1, len(rows)), 3), "misses": misses}


if __name__ == "__main__":
    print(json.dumps(replay(), indent=1))
