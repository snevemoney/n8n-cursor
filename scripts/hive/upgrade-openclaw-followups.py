#!/usr/bin/env python3
"""Deploy complexity-router, voice replies, and optional OpenClaw upgrade."""
from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path

OPENCLAW = Path("/root/.openclaw/openclaw.json")
HUB = Path(__file__).resolve().parent
SHORTCUTS_SRC = HUB / "outer-heaven-shortcuts"
if not (SHORTCUTS_SRC / "index.js").is_file():
    if (HUB / "index.js").is_file():
        SHORTCUTS_SRC = HUB
    elif (HUB / "hive-followups" / "index.js").is_file():
        SHORTCUTS_SRC = HUB / "hive-followups"
ROUTER_SRC = HUB / "complexity-router"
if not (ROUTER_SRC / "index.js").is_file() and (HUB / "hive-followups" / "complexity-router" / "index.js").is_file():
    ROUTER_SRC = HUB / "hive-followups" / "complexity-router"
SHORTCUTS_DST = Path("/root/.openclaw/plugins/hive-report-shortcut")
ROUTER_DST = Path("/root/.openclaw/plugins/complexity-router")
NODE22 = Path("/opt/node22/bin")


def deploy_plugins() -> None:
    SHORTCUTS_DST.mkdir(parents=True, exist_ok=True)
    shutil.copy2(SHORTCUTS_SRC / "index.js", SHORTCUTS_DST / "index.js")
    ROUTER_DST.mkdir(parents=True, exist_ok=True)
    shutil.copy2(ROUTER_SRC / "index.js", ROUTER_DST / "index.js")
    pkg = ROUTER_DST / "package.json"
    if not pkg.is_file():
        pkg.write_text(
            '{"name":"complexity-router","private":true,"type":"module"}\n',
            encoding="utf-8",
        )
    manifest = ROUTER_DST / "openclaw.plugin.json"
    if not manifest.is_file():
        shutil.copy2(HUB / "complexity-router" / "openclaw.plugin.json", manifest)
    print("deployed plugins")


def register_plugins() -> None:
    cfg = json.loads(OPENCLAW.read_text())
    plugins = cfg.setdefault("plugins", {})
    allow = set(plugins.get("allow", []))
    allow.update(["complexity-router", "hive-report-shortcut"])
    plugins["allow"] = sorted(allow)

    paths = plugins.setdefault("load", {}).setdefault("paths", [])
    for p in [str(ROUTER_DST), str(SHORTCUTS_DST)]:
        if p not in paths:
            paths.append(p)

    entries = plugins.setdefault("entries", {})
    entries["hive-report-shortcut"] = {"enabled": True}
    entries["complexity-router"] = {
        "enabled": True,
        "config": {
            "defaultTier": "complex",
            "tiers": {
                "complex": "openrouter/anthropic/claude-sonnet-4-6",
                "simple": "openrouter/anthropic/claude-haiku-4-5",
                "free": "openrouter/openrouter/free",
            },
            "markers": {
                "!smart": "complex",
                "!deep": "complex",
                "!fast": "simple",
                "!quick": "simple",
                "!free": "free",
            },
            "agentDefaults": {
                "naomi": "simple",
                "herald": "simple",
                "scout": "simple",
                "designer": "simple",
                "social": "simple",
                "creator": "simple",
            },
        },
    }
    OPENCLAW.write_text(json.dumps(cfg, indent=2) + "\n")
    print("registered complexity-router in openclaw.json")


def apply_streaming_config() -> None:
    """Apply best streaming config for installed OpenClaw version."""
    cfg = json.loads(OPENCLAW.read_text())
    tg = cfg.setdefault("channels", {}).setdefault("telegram", {})

    version_raw = subprocess.run(
        [str(NODE22 / "node"), str(NODE22 / "../lib/node_modules/openclaw/openclaw.mjs"), "--version"],
        capture_output=True,
        text=True,
        check=False,
    ).stdout.strip()

    major, minor, patch = parse_openclaw_version(version_raw)

    # Nested toolProgress streaming needs OpenClaw 2026.7+
    if (major, minor, patch) >= (2026, 7, 0):
        tg["streaming"] = {
            "mode": "progress",
            "preview": {"toolProgress": True, "commandText": "status"},
            "progress": {
                "commentary": False,
                "toolProgress": True,
                "commandText": "status",
            },
        }
        print(f"streaming: nested progress+toolProgress ({version_raw})")
    else:
        tg["streaming"] = "progress"
        print(f"streaming: string progress ({version_raw})")

    tg["replyToMode"] = "first"
    tg.pop("richMessages", None)
    OPENCLAW.write_text(json.dumps(cfg, indent=2) + "\n")


def upgrade_openclaw() -> None:
    node_ver = subprocess.run(
        [str(NODE22 / "node"), "-v"],
        capture_output=True,
        text=True,
        check=False,
    ).stdout.strip()
    print(f"node: {node_ver}")

    # OpenClaw 2026.7+ requires Node >=22.22.3; skip upgrade if below
    minor = 0
    if node_ver.startswith("v22."):
        try:
            minor = int(node_ver.split(".")[1])
        except ValueError:
            minor = 0
    if minor < 22:
        print("skip openclaw npm upgrade — need Node 22.22.3+ for 2026.7.x (VPS on 2026.4.2 is OK)")
        return

    print("upgrading openclaw via npm...")
    subprocess.run(
        [str(NODE22 / "npm"), "install", "-g", "openclaw@2026.7.1-2"],
        check=True,
    )
    ver = subprocess.run(
        [str(NODE22 / "node"), str(NODE22 / "../lib/node_modules/openclaw/openclaw.mjs"), "--version"],
        capture_output=True,
        text=True,
        check=False,
    )
    print("openclaw version:", ver.stdout.strip())


def parse_openclaw_version(raw: str) -> tuple[int, int, int]:
    import re

    m = re.search(r"(\d+)\.(\d+)\.(\d+)", raw)
    if not m:
        return (0, 0, 0)
    return (int(m.group(1)), int(m.group(2)), int(m.group(3)))


def validate_config() -> bool:
    r = subprocess.run(
        [str(NODE22 / "node"), str(NODE22 / "../lib/node_modules/openclaw/openclaw.mjs"), "doctor"],
        capture_output=True,
        text=True,
        check=False,
    )
    if "Config invalid" in r.stdout + r.stderr:
        print("doctor reported invalid config — falling back to string streaming")
        cfg = json.loads(OPENCLAW.read_text())
        cfg["channels"]["telegram"]["streaming"] = "progress"
        OPENCLAW.write_text(json.dumps(cfg, indent=2) + "\n")
        return False
    print("config valid")
    return True


def patch_hermes_voice() -> None:
    marker = "## Outbound voice (Telegram"
    block = """
## Outbound voice (Telegram, 2026-08-08)
When the operator asks to **read it aloud**, **voice reply**, **send as voice note**, or similar:
- Put `[[audio_as_voice]]` on its own line **before** the spoken text (OpenClaw Telegram delivery tag).
- Keep the text concise — it's TTS, not an essay.
- If they didn't ask for voice, reply in text only.
"""
    for agent in [
        "bigboss", "solidsnake", "liquidsnake", "venomsnake", "sigint", "naomi",
        "herald", "forge", "ledger", "business", "scout", "radar", "voice",
        "designer", "social", "creator", "ocelot",
    ]:
        soul = Path(f"/root/.openclaw/workspace-{agent}/SOUL.md")
        if soul.is_file() and marker not in soul.read_text(encoding="utf-8"):
            text = soul.read_text(encoding="utf-8").rstrip()
            soul.write_text(text + "\n\n" + block.strip() + "\n", encoding="utf-8")
    print("SOUL voice blocks appended")


def main() -> None:
    subprocess.run(["/root/bin/backup-openclaw-workspaces.sh"], check=False)
    deploy_plugins()
    upgrade_openclaw()
    register_plugins()
    apply_streaming_config()
    validate_config()
    patch_hermes_voice()
    print("done — run: pm2 restart openclaw")


if __name__ == "__main__":
    main()
