"""code_author (FINISH-LIST rows 7 + 20): the builder model writes code + a test for a "write ... and run its test" ask,
a critic from a different model family reviews the text, and NOTHING runs: the pick is armed behind "confirm"
(running model-chosen code is a confirm step). Never prints keys. Tests inject CHAT."""
from __future__ import annotations

import json
import os
import re
import urllib.request

AUTHOR_RE = re.compile(r"\b(?:write|create|make|build|implement)\b.{0,40}\b(?:python|function|script|code|class)\b", re.I)
BUILDER = (os.environ.get("JARVIS_BUILDER_MODEL") or os.environ.get("OPENROUTER_MODEL") or "deepseek/deepseek-chat-v3.1").strip()
CRITICS = {"deepseek": "mistralai/mistral-small-3.2-24b-instruct", "mistral": "deepseek/deepseek-chat-v3.1"}
TIMEOUT_S = 25
_FENCE = re.compile(r"```(?:python|py)?\s*\n(.*?)```", re.S | re.I)


def family(model: str) -> str:
    m = (model or "").lower().split("/")[-1] if "/" not in (model or "") else (model or "").lower().split("/")[0]
    for fam in ("deepseek", "mistral", "openai", "anthropic", "google", "x-ai", "meta", "qwen"):
        if fam in (model or "").lower():
            return {"mistralai": "mistral"}.get(fam, fam)
    return m or "unknown"


def critic_for(builder: str) -> str:
    """Cross-family critic: a deepseek builder gets mistral; anything else gets deepseek."""
    return CRITICS["deepseek"] if family(builder) == "deepseek" else CRITICS["mistral"]


def _openrouter(model: str, prompt: str) -> str | None:
    key = (os.environ.get("OPENROUTER_API_KEY") or "").strip()
    if not key:
        return None
    body = json.dumps({"model": model, "messages": [{"role": "user", "content": prompt}], "max_tokens": 700}).encode()
    req = urllib.request.Request("https://openrouter.ai/api/v1/chat/completions", data=body,
                                 headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT_S) as r:
            return json.load(r)["choices"][0]["message"]["content"]
    except Exception:
        return None


CHAT = _openrouter  # (model, prompt) -> text | None


def wants_author(utterance: str) -> bool:
    return bool(AUTHOR_RE.search(utterance or ""))


def author(ask: str) -> dict:
    builder = BUILDER
    text = CHAT(builder, "Write Python for this request. Reply with exactly two fenced python blocks: first the code, "
                         "then a short test using plain assert statements. No prose, no I/O, no network.\nRequest: " + ask)
    blocks = _FENCE.findall(text or "")
    if not blocks:
        return {"ok": False, "builder_model": builder,
                "spoken": "I couldn't write that code just now (the builder model gave no code), so nothing ran."}
    code, test = blocks[0].strip(), (blocks[1].strip() if len(blocks) > 1 else "")
    critic = critic_for(builder)
    verdict = CHAT(critic, "Review this Python and its test for bugs in two short sentences. Start with LGTM or ISSUE.\n\n"
                           f"```python\n{code}\n```\n```python\n{test}\n```") or "critic unavailable"
    verdict = " ".join(str(verdict).split())[:240]
    name = (re.search(r"^\s*def\s+(\w+)", code, re.M) or re.search(r"(\w+)", code)).group(1)
    spoken = (f"I had {builder} write {name} with a test; nothing has run. "
              f"Critic {critic} (a different model family from the builder) says: {verdict} "
              "Say \"confirm\" and I'll run it in the sandbox.")
    return {"ok": True, "code": code, "test": test, "builder_model": builder, "critic_model": critic,
            "verdict": verdict, "spoken": spoken}
