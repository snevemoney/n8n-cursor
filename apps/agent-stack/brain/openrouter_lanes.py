"""Shared OpenRouter transport. Capability, model, and contract stay separate.

NORMAL_CONVERSATION and JEV_JUDGMENT may use the same credential slot.
They are not the same runtime path. This module routes only
NORMAL_CONVERSATION. It does not load Jev question packs and it does not
call the judgment lane.

A present credential does not prove a model id.
NORMAL_CONVERSATION stays OPEN until a real ordinary Face conversation works.
JEV_BOUNDED_JUDGMENT is not closed here.
"""
from __future__ import annotations

import importlib.util
import os
import uuid
from pathlib import Path
from typing import Any

PROVIDER = "openrouter"
CAPABILITY_CONVERSATION = "conversation"
LANE_CONVERSATION = "NORMAL_CONVERSATION"
LANE_JEV = "JEV_JUDGMENT"
CONVERSATION_MODEL = "qwen/qwen3.8-27b:free"
CONVERSATION_TEMPERATURE = 0.2
CONVERSATION_MAX_TOKENS = 512
CONVERSATION_CLOSURE = "OPEN"
JEV_CLOSURE = "OPEN"
CONTEXT_CAP = 4000

_REGISTRY = None


def _registry():
    """The existing OpenRouter registry. No second credential store."""
    global _REGISTRY
    if _REGISTRY is not None:
        return _REGISTRY
    path = Path(__file__).resolve().parents[3] / "scripts" / "hive" / "sync-vps-llm-keys.py"
    spec = importlib.util.spec_from_file_location("hive_sync_vps_llm_keys_lanes", path)
    if spec is None or spec.loader is None:
        return None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    _REGISTRY = module
    return module


def chat_completions_url() -> str:
    """Transport URL from the registry. Not a conversation-only endpoint."""
    registry = _registry()
    base = str(getattr(registry, "OPENROUTER_BASE_URL", "") or "").rstrip("/")
    if not base:
        return ""
    return base + "/chat/completions"


def credential_env_name() -> str:
    """Name of the registry slot. The secret is not copied."""
    registry = _registry()
    if registry is None:
        return ""
    return str(getattr(registry, "OPENROUTER_API_KEY_ENV", "") or "")


def credential_value() -> str:
    """Value of the registry slot. Empty when the slot is unset."""
    name = credential_env_name()
    if not name:
        return ""
    return os.environ.get(name, "").strip()


def credential_present() -> bool:
    return bool(credential_value())


def conversation_model() -> str:
    """Pinned conversational model. The credential does not select it."""
    return CONVERSATION_MODEL


def conversation_closed() -> bool:
    """CLOSED_PROVEN only after a real ordinary Face conversation. Not this module."""
    return False


def jev_closed() -> bool:
    """A conversation result does not close bounded judgment."""
    return False


def route_conversation() -> dict[str, Any]:
    """Model and contract for ordinary talk. Does not open the judgment lane."""
    return {
        "provider": PROVIDER,
        "lane": LANE_CONVERSATION,
        "capability": CAPABILITY_CONVERSATION,
        "model": conversation_model(),
        "credential_present": credential_present(),
        "model_proven": False,
        "closure": CONVERSATION_CLOSURE,
        "jev_called": False,
        "question_packs_loaded": False,
    }


def redact_value(value: Any, secret: str) -> Any:
    if not secret:
        return value
    if isinstance(value, str):
        return value.replace(secret, "")
    if isinstance(value, list):
        return [redact_value(item, secret) for item in value]
    if isinstance(value, dict):
        return {key: redact_value(item, secret) for key, item in value.items()}
    return value


def _context_used(context: str, secret: str) -> dict[str, Any]:
    text = redact_value(context or "", secret)
    chars = len(text)
    if chars <= CONTEXT_CAP:
        return {"text": text, "chars": chars, "truncated": False}
    return {"text": text[:CONTEXT_CAP], "chars": chars, "truncated": True}


def conversation_receipt(
    *,
    provider_call: bool,
    model: str,
    context_used: str,
    response: str,
    correlation: dict[str, Any] | None,
    usage: Any = None,
    secret: str = "",
) -> dict[str, Any]:
    """Provider-backed conversation receipt. Jev fields stay empty."""
    link = correlation if isinstance(correlation, dict) else {}
    turn_id = str(link.get("turn_id") or "").strip() or str(uuid.uuid4())
    conversation_id = link.get("conversation_id")
    if conversation_id is not None:
        conversation_id = str(conversation_id).strip() or None
    face = link.get("face") if isinstance(link.get("face"), dict) else None
    body: dict[str, Any] = {
        "provider": PROVIDER,
        "capability": CAPABILITY_CONVERSATION,
        "model": model,
        "provider_call": provider_call is True,
        "lane": LANE_CONVERSATION,
        "closure": CONVERSATION_CLOSURE,
        "model_proven": False,
        "jev_called": False,
        "question_pack": None,
        "question_packs_loaded": False,
        "turn_id": turn_id,
        "conversation_id": conversation_id,
        "context_used": _context_used(context_used, secret),
        "response": redact_value(response or "", secret),
        "face_correlation": redact_value(face, secret) if face is not None else None,
    }
    if usage is not None:
        body["usage"] = redact_value(usage, secret)
    return body
