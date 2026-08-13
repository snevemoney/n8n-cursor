#!/usr/bin/env python3
"""Upgrade OpenClaw + Outer Heaven agents with Hermes-like UX (2026-08).

- Telegram progress streaming (tool status drafts, edit transport)
- Memory search enabled (OpenRouter embeddings)
- Expanded LLM-free shortcuts plugin
- HERMES_VOICE.md + per-agent SOUL append
"""
from __future__ import annotations

import json
import re
import shutil
import subprocess
from datetime import datetime, timezone
from pathlib import Path

OPENCLAW = Path("/root/.openclaw/openclaw.json")
PLUGIN_SRC = Path(__file__).resolve().parent / "outer-heaven-shortcuts"
PLUGIN_DST = Path("/root/.openclaw/plugins/hive-report-shortcut")
PHIL_ENV = Path("/opt/philanthropy/.env.local")
STAMP = datetime.now(timezone.utc).strftime("%Y-%m-%d")

HERMES_VOICE = """# HERMES_VOICE.md — how Outer Heaven should feel in chat

Last updated: 2026-08-08

Hermes agents feel like texting a sharp friend who actually does things. Outer Heaven matches that bar.

## Voice
- Warm, direct, human — not corporate, not sycophantic.
- **Lead with the answer or result.** Skip "Great question", "I'd be happy to help", "Let me know if you need anything else".
- Short paragraphs. Bullets when scanning matters.
- One clarifying question max — then execute.

## Telegram UX
- **Voice notes:** transcribed text is the user's message. Reply normally in text unless they ask for voice back (`[[audio_as_voice]]` only when requested).
- **Tool use:** a brief status line is fine ("Checking Scorpion…") then deliver the outcome — not a play-by-play essay.
- **Shortcuts:** `help`, `status`, `hive report`, `agents` are instant (no LLM). Don't re-handle them in prose.

## Memory
- Memory search is on — use prior session facts when relevant; don't narrate "I remember from memory".
- Durable facts → `MEMORY.md`; daily noise → `memory/YYYY-MM-DD.md`.

## Boundaries
- HITL: money, client send, prod deploy, delete data, secrets, `openclaw.json`.
- Sacred: topic IDs, Big Boss SOUL/TOOLS append-only, OpenClaw souls.
"""

SOUL_APPEND_MARKER = "## Conversation style (Hermes-like"
SOUL_APPEND = """
## Conversation style (Hermes-like, 2026-08-08)
Read `HERMES_VOICE.md` in workspace-bigboss (or this workspace copy). In short:
- Talk like a capable friend — lead with results, not preamble.
- Voice notes → reply to the transcribed intent.
- Brief tool status OK; then show outcome.
- One clarifying question max, then act.
"""

AGENTS = [
    "bigboss",
    "solidsnake",
    "liquidsnake",
    "venomsnake",
    "sigint",
    "naomi",
    "herald",
    "forge",
    "ledger",
    "business",
    "scout",
    "radar",
    "voice",
    "designer",
    "social",
    "creator",
    "ocelot",
]


def load_openrouter_key() -> str | None:
    if not PHIL_ENV.is_file():
        return None
    for line in PHIL_ENV.read_text().splitlines():
        if line.startswith("OPENROUTER_API_KEY="):
            return line.split("=", 1)[1].strip()
    return None


def patch_openclaw(or_key: str | None) -> None:
    cfg = json.loads(OPENCLAW.read_text())
    defaults = cfg.setdefault("agents", {}).setdefault("defaults", {})
    tg = cfg.setdefault("channels", {}).setdefault("telegram", {})

    defaults["memorySearch"] = {
        "enabled": True,
        "provider": "local",
    }

    tg["streaming"] = "progress"
    tg["replyToMode"] = "first"
    tg["historyLimit"] = 80
    tg.pop("richMessages", None)

    env = cfg.setdefault("env", {}).setdefault("vars", {})
    if or_key:
        env["OPENROUTER_API_KEY"] = or_key

    for agent in cfg.get("agents", {}).get("list", []):
        agent["memorySearch"] = {"enabled": True}

    OPENCLAW.write_text(json.dumps(cfg, indent=2) + "\n")
    print("patched openclaw.json (memory + telegram progress streaming)")


def deploy_plugin() -> None:
    PLUGIN_DST.mkdir(parents=True, exist_ok=True)
    shutil.copy2(PLUGIN_SRC / "index.js", PLUGIN_DST / "index.js")
    print("deployed outer-heaven-shortcuts plugin")


def append_soul(path: Path) -> None:
    if not path.is_file():
        return
    text = path.read_text(encoding="utf-8")
    if SOUL_APPEND_MARKER in text:
        return
    path.write_text(text.rstrip() + "\n\n" + SOUL_APPEND.strip() + "\n", encoding="utf-8")
    print(f"SOUL append: {path.parent.name}")


def write_hermes_voice() -> None:
    bb = Path("/root/.openclaw/workspace-bigboss")
    (bb / "HERMES_VOICE.md").write_text(HERMES_VOICE.strip() + "\n", encoding="utf-8")
    print("wrote workspace-bigboss/HERMES_VOICE.md")
    for agent in AGENTS:
        if agent == "bigboss":
            continue
        dest = Path(f"/root/.openclaw/workspace-{agent}/HERMES_VOICE.md")
        if dest.parent.is_dir():
            dest.write_text(
                HERMES_VOICE.strip()
                + "\n\n(Canon copy — see workspace-bigboss/HERMES_VOICE.md)\n",
                encoding="utf-8",
            )


def patch_identity_vibes() -> None:
    vibes = {
        "bigboss": "Decisive chief of staff — warm when winning, blunt when drifting.",
        "forge": "Builder energy — ships, verifies, shows diffs not drama.",
        "ocelot": "CRM sharp — qualifies fast, never oversells.",
        "herald": "Comms lead — clear, on-brand, no fluff.",
        "naomi": "Ops pulse — calm, precise, catches drift early.",
        "sigint": "Research hound — cites sources, admits gaps.",
        "voice": "Writer — tight prose, strong hooks, zero filler.",
    }
    for agent, vibe in vibes.items():
        ident = Path(f"/root/.openclaw/workspace-{agent}/IDENTITY.md")
        if not ident.is_file():
            continue
        text = ident.read_text(encoding="utf-8")
        marker = "## Hermes-like vibe"
        if marker in text:
            continue
        block = f"\n{marker} (2026-08-08)\n{vibe}\n"
        ident.write_text(text.rstrip() + block, encoding="utf-8")
        print(f"IDENTITY vibe: {agent}")


def update_hive_context() -> None:
    path = Path("/root/.openclaw/workspace-bigboss/HIVE_CONTEXT.md")
    if not path.is_file():
        return
    text = path.read_text(encoding="utf-8")
    block = """
## Hermes-like UX (2026-08-08)
- **Instant commands (no LLM):** `help`, `status`, `hive report`, `agents` — plugin `hive-report-shortcut`
- **Telegram streaming:** `progress` mode (live preview edits — Hermes-like responsiveness on OpenClaw 2026.4.x)
- **Voice notes:** supported inbound; reply in text unless operator asks for voice
- **Memory search:** enabled (local embeddings — no API billing)
- **Voice canon:** `HERMES_VOICE.md` in each workspace
"""
    if "Hermes-like UX" not in text:
        path.write_text(text.rstrip() + "\n" + block.strip() + "\n", encoding="utf-8")
        print("updated HIVE_CONTEXT.md")


def main() -> None:
    subprocess.run(["/root/bin/backup-openclaw-workspaces.sh"], check=False)
    or_key = load_openrouter_key()
    deploy_plugin()
    patch_openclaw(or_key)
    write_hermes_voice()
    for agent in AGENTS:
        append_soul(Path(f"/root/.openclaw/workspace-{agent}/SOUL.md"))
    patch_identity_vibes()
    update_hive_context()
    hub_copy = Path("/root/bin/upgrade-openclaw-hermes-ux.py")
    src = Path(__file__).resolve()
    if src != hub_copy.resolve():
        shutil.copy2(src, hub_copy)
        hub_copy.chmod(0o755)
    print("upgrade complete — restart openclaw: pm2 restart openclaw")


if __name__ == "__main__":
    main()
