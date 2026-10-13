"""voice_engine (FINISH-LIST rank 14): say which TTS engine really speaks, read from mouth/voice.voice_report()."""
from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

STACK = Path(__file__).resolve().parents[1]
LABELS = {"elevenlabs": "ElevenLabs", "kokoro": "Kokoro", "kokoro-dark-python": "Kokoro (model found, voice Python missing)",
          "dark": "no voice engine"}


def _voice():
    if "mouth.voice" in sys.modules:
        return sys.modules["mouth.voice"]
    name = "agent_stack_voice_for_engine"
    if name not in sys.modules:
        spec = importlib.util.spec_from_file_location(name, STACK / "mouth" / "voice.py")
        mod = importlib.util.module_from_spec(spec)
        sys.modules[name] = mod
        spec.loader.exec_module(mod)
    return sys.modules[name]


def run(args: dict | None = None) -> dict:
    rep = _voice().voice_report()
    eng = str(rep.get("engine") or "dark")
    label = LABELS.get(eng, eng)
    if eng in ("dark", "kokoro-dark-python"):
        sp = f"I have no voice engine working right now ({label}), so I'm text only."
        if eng == "dark":
            sp = "I have no voice engine working right now, so I'm text only."
    else:
        sp = f"I'm speaking with {label}, voice {rep.get('voice')}."
        if not rep.get("key_present"):
            sp += " No ElevenLabs key is set."
    return {"ok": True, "engine": eng, "spoken": sp}


def args_from_utterance(u: str) -> dict:
    return {}


def log_meta(got: dict) -> dict:
    return {"ok": bool((got or {}).get("ok")), "engine": (got or {}).get("engine")}
