#!/usr/bin/env python3
"""Local brain: retrieve vault snippets → think here → answer.

Ollama on 127.0.0.1:11434 if a model is up. Otherwise a cited extract.
Never queue a question to Grok. UNKNOWN is an answer. A desk job is not.
"""
from __future__ import annotations

import importlib.util
import json
import os
import re
import urllib.error
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
OLLAMA = "http://127.0.0.1:11434"
UNKNOWN = "I don't have that in the vault. UNKNOWN."
GROK_TELL = re.compile(
    r"\b(grokbot|grok bot|queued for|send (this|it) to grok|hand this to|"
    r"i('ll| will) (send|ask|queue)|ask (grok|cursor) to)\b",
    re.I,
)
PREFER_MODELS = (
    "llama3.2:1b",
    "llama3.2:3b",
    "llama3.2:3b-instruct-q4_K_M",
    "scorpion:latest",
    "llama3.2:latest",
)


def _load_retrieve():
    path = HERE.parent / "memory" / "retrieve.py"
    spec = importlib.util.spec_from_file_location("agent_stack_retrieve", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


RETRIEVE = _load_retrieve()


def _clip(text: str, limit: int = 320) -> str:
    clean = re.sub(r"\s+", " ", (text or "").strip())
    if len(clean) <= limit:
        return clean
    return clean[: limit - 1].rsplit(" ", 1)[0] + "…"


def extractive(hits: list[dict]) -> str:
    if not hits:
        return UNKNOWN
    first = hits[0]
    snippet = _clip(str(first.get("snippet") or ""), 220)
    cite = first.get("path") or "vault"
    extra = ""
    if len(hits) > 1 and hits[1].get("path") and hits[1]["path"] != cite:
        extra = f" Also {hits[1]['path']}."
    return f"{snippet} Cited {cite}.{extra}"


def pick_model(names: list[str]) -> str | None:
    usable = [n for n in names if n and "embed" not in n.lower()]
    for prefer in PREFER_MODELS:
        if prefer in usable:
            return prefer
    return usable[0] if usable else None


def probe_ollama(*, timeout: float = 0.6) -> dict:
    if os.environ.get("AGENT_STACK_NO_OLLAMA") == "1":
        return {"ok": False, "reason": "disabled"}
    try:
        req = urllib.request.Request(f"{OLLAMA}/api/tags", method="GET")
        with urllib.request.urlopen(req, timeout=timeout) as res:
            data = json.loads(res.read().decode("utf-8"))
    except (OSError, TimeoutError, urllib.error.URLError, json.JSONDecodeError, ValueError):
        return {"ok": False, "reason": "unreachable"}
    names = []
    for row in data.get("models") or []:
        if isinstance(row, dict):
            names.append(str(row.get("name") or row.get("model") or ""))
    forced = (os.environ.get("AGENT_STACK_OLLAMA_MODEL") or "").strip()
    model = forced if forced and forced in names else pick_model(names)
    return {"ok": bool(model), "model": model, "models": names}


def _prompt(query: str, hits: list[dict]) -> str:
    blocks = []
    for i, hit in enumerate(hits[:3], start=1):
        blocks.append(f"[{i}] {hit.get('path')}: {hit.get('snippet')}")
    snippets = "\n".join(blocks)
    return (
        "You are Jarvis, Evens's local vault assistant. Answer ONLY from the snippets. "
        "Two sentences max. Cite the file path. If the snippets do not answer, say exactly: "
        f"{UNKNOWN} Never mention Grok, Cursor desks, queues, or sending work elsewhere.\n\n"
        f"Question: {query}\n\nSnippets:\n{snippets}\n\nAnswer:"
    )


def think_ollama(query: str, hits: list[dict], model: str, *, timeout: float = 20.0) -> str | None:
    payload = {
        "model": model,
        "prompt": _prompt(query, hits),
        "stream": False,
        "options": {"temperature": 0.1, "num_predict": 140},
    }
    raw = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"{OLLAMA}/api/generate",
        data=raw,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as res:
            data = json.loads(res.read().decode("utf-8"))
    except (OSError, TimeoutError, urllib.error.URLError, json.JSONDecodeError, ValueError):
        return None
    text = _clip(str(data.get("response") or ""), 360)
    if not text or GROK_TELL.search(text):
        return None
    return text


def answer(query: str, roots: list[Path] | None = None) -> dict:
    found = RETRIEVE.search(query, roots)
    hits = found.get("hits") or []
    if found.get("unknown") or not hits:
        return {
            "ok": True,
            "verb": "memory",
            "host": "local",
            "engine": "none",
            "unknown": True,
            "spoken": UNKNOWN,
            "cites": [],
        }
    ollama = probe_ollama()
    if ollama.get("ok") and ollama.get("model"):
        thought = think_ollama(query, hits, str(ollama["model"]))
        if thought and not GROK_TELL.search(thought):
            return {
                "ok": True,
                "verb": "memory",
                "host": "local",
                "engine": "ollama",
                "model": ollama["model"],
                "unknown": False,
                "spoken": thought,
                "cites": hits,
            }
    return {
        "ok": True,
        "verb": "memory",
        "host": "local",
        "engine": "extractive",
        "unknown": False,
        "spoken": extractive(hits),
        "cites": hits,
    }
