#!/usr/bin/env python3
"""Isolated Jarvis face for Playwright. Port 4019. DRY_TTS. Temp hive. Mocked hands.

Never binds 4018. Never drives Safari or Evens's live mouth.
Reuses face/serve.py Handler + pane.html + mouth.apply_turn.
"""
from __future__ import annotations

import importlib.util
import json
import os
import sys
import tempfile
from http.server import ThreadingHTTPServer
from pathlib import Path

HERE = Path(__file__).resolve().parent
FACE = HERE.parent
PORT_DEFAULT = 4019


def _refuse_live_mouth(port: int) -> None:
    if port == 4018:
        raise SystemExit("e2e face refuses 4018 — that is Evens's voice mouth. Use 4019.")


def _load_serve():
    path = FACE / "serve.py"
    spec = importlib.util.spec_from_file_location("agent_stack_face_e2e", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _fake_cursor(prompt: str, mode: str = "ask", resume: str | None = None) -> dict:
    return {
        "ok": True,
        "wire": "cursor",
        "spoken": "E2E mock. Repo is agent-stack. What next?",
        "chat_id": resume or "e2e-1",
    }


def _fake_status(which: str = "all") -> dict:
    return {
        "ok": True,
        "spoken": f"E2E mock status. slice={which}",
        "parts": [{"wire": "hive"}],
    }


def _install_mocks(serve, hive: Path) -> None:
    mouth = serve.mouth()
    serve.HIVE = hive
    if mouth.SEE is not None:
        mouth.SEE.safari_act = lambda text, hive=None: {
            "ok": True,
            "wire": "safari",
            "spoken": "Safari opened YouTube (e2e mock). Not a vault dump.",
        }
        mouth.SEE.snapshot = lambda **kw: {
            "safari": {"title": "YouTube", "url": "https://www.youtube.com"},
            "screen": {},
            "spoken": "Safari is on YouTube (e2e mock).",
        }
    if mouth.NAMED is not None:
        mouth.NAMED.watch_later = lambda **kw: {
            "ok": True,
            "wire": "watch_later",
            "spoken": "Watch Later is empty on this e2e mock. I will not invent titles.",
            "titles": [],
        }
        mouth.NAMED.web_search = lambda text, **kw: {
            "ok": True,
            "wire": "search",
            "spoken": "Sources: Example — https://example.com.",
            "cites": [{"title": "Example", "url": "https://example.com"}],
        }
        mouth.NAMED.news_from_disk = lambda text, roots=None: {
            "ok": False,
            "unknown": True,
            "wire": "news",
            "spoken": "UNKNOWN. No news on disk. I will not invent headlines.",
            "hits": [],
        }
        mouth.NAMED.make_route = lambda text: {
            "ok": True,
            "wire": "make",
            "spoken": "image-agent-hitl is on disk. Publish stays you.",
        }

    orig_turn = mouth.apply_turn
    orig_iter = mouth.apply_turn_iter

    def apply_turn(utterance, **kw):
        kw.setdefault("cursor_fn", _fake_cursor)
        kw.setdefault("status_fn", _fake_status)
        kw.setdefault("hive", hive)
        kw["speak"] = False
        return orig_turn(utterance, **kw)

    def apply_turn_iter(utterance, **kw):
        kw.setdefault("cursor_fn", _fake_cursor)
        kw.setdefault("status_fn", _fake_status)
        kw.setdefault("hive", hive)
        yield from orig_iter(utterance, **kw)

    mouth.apply_turn = apply_turn
    mouth.apply_turn_iter = apply_turn_iter


def main() -> int:
    os.environ["AGENT_STACK_DRY_TTS"] = "1"
    port = int(os.environ.get("AGENT_STACK_FACE_PORT") or PORT_DEFAULT)
    _refuse_live_mouth(port)
    tmp = Path(tempfile.mkdtemp(prefix="jarvis-e2e-face-"))
    (tmp / "bus").mkdir()
    (tmp / "vault").mkdir()
    (tmp / "vault" / "OPERATOR_MEMORY.md").write_text(
        "Four north stars start with maximum leverage, minimum noise.\n",
        encoding="utf-8",
    )
    (tmp / "agent-stack.json").write_text('{"operator":"Evens","face":"JARVIS"}\n', encoding="utf-8")
    serve = _load_serve()
    _install_mocks(serve, tmp)
    httpd = ThreadingHTTPServer((serve.HOST, port), serve.Handler)
    print(
        json.dumps(
            {
                "ok": True,
                "url": f"http://{serve.HOST}:{port}/",
                "bind": serve.HOST,
                "dry_tts": True,
                "hive": str(tmp),
                "note": "e2e only — not Evens's 4018 mouth",
            },
            indent=2,
        ),
        flush=True,
    )
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        httpd.shutdown()
        return 0
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
