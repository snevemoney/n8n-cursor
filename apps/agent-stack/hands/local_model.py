"""Free local fallback for Jarvis (Evens 2026-10-16): when OpenRouter has no credits (HTTP 402), the turn goes to a small
local model through Ollama so Jarvis keeps working on simple things. Anything beyond it gets one honest sentence:
"This free local model can't ___. Add credits to OpenRouter to continue with more capable models."

Sized for his MacBook Air/Pro M3 with 8 GB RAM and other apps open: qwen3:4b (2.5 GB, tools, text only). The model never
sees screenshots and only gets tools that work by text and cannot damage anything (no shell, no file writes, no screen
control, no helpers). JARVIS_LOCAL_MODEL overrides the model; JARVIS_LOCAL_URL the server.
"""
from __future__ import annotations

import json
import os
import re
import urllib.request

LOCAL_MODEL = os.environ.get("JARVIS_LOCAL_MODEL") or "qwen3:4b"
LOCAL_BASE = (os.environ.get("JARVIS_LOCAL_URL") or "http://127.0.0.1:11434").rstrip("/")
ADD_CREDITS = "Add credits to OpenRouter to continue with more capable models."
SAFE_TOOLS = {"read_file", "list_dir", "find_files", "grep", "job", "web_search", "fetch_url", "safari", "app",
              "methods", "plan", "open", "say", "ask_owner", "done"}
LOCAL_STEP_CAP = 12
NUM_CTX = 4096          # live 10-16: the full prompt (~7k tokens) made Ollama reserve too much memory and froze the Mac
KEEP_ALIVE = "30s"      # free the model's memory 30 s after the last answer
KEEP_TURNS = 8
BRIEF = ("You are Jarvis, Evens's Mac assistant, running on a small free local model because OpenRouter has no credits. "
         "Answer in the language he used (English or French), plain and short, the answer only: never write out your "
         "thinking or talk about 'the user'. Use a tool only when it does what he asked (open apps, his Safari, native apps, read "
         "files, quick web lookups). Never pretend you did something. If a request needs more than you can do, say: "
         "\"This free local model can't <what>. Add credits to OpenRouter to continue with more capable models.\"")

# What the small model cannot do well, by what he asks for. Order matters: first match names the reason.
BEYOND = (
    (r"\b(fix|debug|refactor|implement|code|coding|script|function|bug|tests?|commit|pull request|\bpr\b|repo|"
     r"deploy|install|\.py\b|\.js\b|\.ts\b|operator\.py|jarvis'?s? code)\b", "write or fix code"),
    (r"\b(watch|learn|ingest)\b.*\b(video|youtube|signal|watch later)|youtube\.com/watch|youtu\.be/", "watch and learn videos"),
    (r"\b(effectcraft|filmcraft|designcraft|deckcraft|wordcraft|gridcraft|pdfcraft|photocraft|lightcraft|vectorcraft|"
     r"soundcraft|cadcraft|artcraft|motion graphic|animation|render|blender|slides?|deck|presentation)\b", "make ArtCraft content"),
    (r"\b(research|compare|investigate|deep dive|find the best|latest .* (news|release|version)s?)\b", "do deep research"),
    (r"\b(screenshot|look at my screen|what'?s on (my|the) screen|click (on|the)|drag|draw)\b", "see and control the screen"),
    (r"\b(workflow|end to end|all of them|every one|for hours|benchmark|batch)\b", "run long multi-step workflows"),
)


def cant(goal: str) -> str:
    """The add-credits sentence when this request is beyond the local model, else ''."""
    for rx, what in BEYOND:
        if re.search(rx, goal or "", re.I):
            return f"This free local model can't {what}. {ADD_CREDITS}"
    return ""


def _post(url: str, data: dict, headers: dict | None = None, timeout: float = 180.0) -> dict:
    req = urllib.request.Request(url, data=json.dumps(data).encode(), headers={"Content-Type": "application/json", **(headers or {})})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read() or b"{}")


def ready() -> bool:
    """Ollama is running and the model is pulled."""
    try:
        with urllib.request.urlopen(LOCAL_BASE + "/api/tags", timeout=3) as r:
            names = {m.get("name") for m in json.loads(r.read()).get("models") or []}
        return LOCAL_MODEL in names or f"{LOCAL_MODEL}:latest" in names
    except Exception:  # noqa: BLE001 - not installed / not running
        return False


def _compact(messages: list) -> list:
    """Short brief + the newest turns, text only, for a small model in little memory."""
    rest = [m for m in messages if m.get("role") != "system"][-KEEP_TURNS:]
    while rest and rest[0].get("role") == "tool":
        rest = rest[1:]
    import time as _t  # it has no shell: the Mac's clock rides in the brief (live 10-17: "no tool can get the time")
    out = [{"role": "system", "content": BRIEF + _t.strftime(" It is %A %B %d %Y, %H:%M on his Mac.")}]
    for m in rest:
        c = m.get("content")
        if isinstance(c, list):
            parts = [p.get("text", "") for p in c if isinstance(p, dict) and p.get("type") == "text"]
            if any(isinstance(p, dict) and p.get("type") == "image_url" for p in c):
                parts.append("[a screenshot was here; the free local model cannot see images]")
            c = "\n".join(x for x in parts if x)
        row = {"role": m.get("role"), "content": str(c or "")[:1500]}
        if m.get("tool_calls"):
            row["tool_calls"] = [{"function": {"name": (tc.get("function") or {}).get("name"),
                                               "arguments": _args((tc.get("function") or {}).get("arguments"))}}
                                 for tc in m["tool_calls"] if isinstance(tc, dict)]
        out.append(row)
    for row in reversed(out):  # qwen3 soft switch: answer directly (the API's think=false is not always honoured)
        if row["role"] == "user":
            row["content"] = f"{row['content']} /no_think"
            break
    return out


def _args(raw) -> dict:
    if isinstance(raw, dict):
        return raw
    try:
        v = json.loads(raw or "{}")
        return v if isinstance(v, dict) else {}
    except ValueError:
        return {}


REASONING_RE = re.compile(r"\s*(?:okay|ok|alright|hmm|so)[,.]?\s+(?:let'?s|let me|so|i need|first)\b|\s*(?:let me (?:think|figure|see|break)|"
                          r"first,? i (?:need|should|will)|the user (?:is|wants|asked|said|mentioned|wrote)|i need to (?:figure|check|think))\b", re.I)


THINKING_RE = re.compile(r"\bthe user(?:'s)?\b|\b(?:let me (?:check|think|see|figure)|wait, (?:no|in the|the))\b", re.I)


def call(messages: list, tools: list) -> dict:
    """One operator turn on the local model (Ollama native chat: small context, unloads when idle), returned in the
    same shape as online.call_openrouter_messages."""
    safe = [t for t in tools if (t.get("function") or {}).get("name") in SAFE_TOOLS]
    try:
        data = _post(LOCAL_BASE + "/api/chat",
                     {"model": LOCAL_MODEL, "messages": _compact(messages), "tools": safe, "stream": False,
                      "keep_alive": KEEP_ALIVE, "options": {"num_ctx": NUM_CTX, "temperature": 0.2,
                                                                          "num_predict": 800}})
    except Exception as exc:  # noqa: BLE001
        return {"ok": False, "unknown": True, "error": f"local model: {type(exc).__name__}"}
    msg = data.get("message") or ((data.get("choices") or [{}])[0].get("message") or {})
    calls = []
    for i, tc in enumerate(msg.get("tool_calls") or []):
        fn = tc.get("function") or {}
        name = fn.get("name") or ""
        if name not in SAFE_TOOLS:
            return {"ok": True, "tool": "", "args": {}, "call_id": "", "model": "local:" + LOCAL_MODEL,
                    "text": f"This free local model can't use {name or 'that tool'}. {ADD_CREDITS}"}
        calls.append({"tool": name, "args": _args(fn.get("arguments")), "call_id": str(tc.get("id") or f"local_{i}")})
    if calls:
        return {"ok": True, "calls": calls, "tool": calls[0]["tool"], "args": calls[0]["args"],
                "call_id": calls[0]["call_id"], "text": "", "model": "local:" + LOCAL_MODEL}
    text = re.sub(r"(?s)^.*</think>", "", str(msg.get("content") or "")).strip()  # drop leftover reasoning
    # Ollama 0.40 + qwen3: think=false still reasons but INTO the answer; left on, reasoning goes to message.thinking,
    # which is never read here (live probe 10-17: clean tool call with it on, reasoning in content with it off)
    if REASONING_RE.match(text) or THINKING_RE.search(text[:400]):  # live 10-17 10:18: "Okay, the user is asking…" was spoken
        # live 10-17: with credits at $0 the local model's thinking ("Okay, let's break this down. The user is saying…")
        # was spoken to Evens. Thinking is never a reply.
        return {"ok": True, "tool": "", "args": {}, "call_id": "", "model": "local:" + LOCAL_MODEL, "refused": True,
                "text": f"I couldn't work that out with the free local model. {ADD_CREDITS}"}
    return {"ok": bool(text), "tool": "", "args": {}, "call_id": "", "text": text, "model": "local:" + LOCAL_MODEL,
            **({} if text else {"unknown": True, "error": "local model: empty"})}
