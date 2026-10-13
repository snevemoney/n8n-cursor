"""MCP Phase A inventory (FINISH-LIST rank 10): server NAMES only, read from local configs.

Never starts a server, never returns commands, args, URLs or env values.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

try:  # py3.11+
    import tomllib
except ImportError:  # pragma: no cover
    tomllib = None

HOME = Path.home()
DEFAULT_PATHS = [
    ("claude", HOME / ".claude.json"),
    ("claude", HOME / ".claude" / "settings.json"),
    ("cursor", HOME / ".cursor" / "mcp.json"),
    ("codex", HOME / ".codex" / "config.toml"),
]
NAME_OK = re.compile(r"^[\w.\- @/]{1,64}$")
MAX_NAMES = 60


def _json_names(data) -> list[str]:
    names: list[str] = []
    if not isinstance(data, dict):
        return names
    servers = data.get("mcpServers")
    if isinstance(servers, dict):
        names.extend(servers.keys())
    projects = data.get("projects")
    if isinstance(projects, dict):
        for proj in projects.values():
            if isinstance(proj, dict) and isinstance(proj.get("mcpServers"), dict):
                names.extend(proj["mcpServers"].keys())
    return names


def _toml_names(text: str) -> list[str]:
    if tomllib is not None:
        data = tomllib.loads(text)
        servers = data.get("mcp_servers")
        return list(servers.keys()) if isinstance(servers, dict) else []
    return re.findall(r"^\[mcp_servers\.([^\]\.]+)\]", text, re.M)


def inventory(paths=None) -> tuple[list[dict], int]:
    seen: dict[tuple[str, str], dict] = {}
    skipped = 0
    for source, path in (paths or DEFAULT_PATHS):
        path = Path(path)
        try:
            text = path.read_text(encoding="utf-8")
            names = _toml_names(text) if path.suffix == ".toml" else _json_names(json.loads(text))
        except (OSError, ValueError, TypeError):
            skipped += 1
            continue
        for n in names:
            n = str(n).strip()
            if n and NAME_OK.match(n):
                seen.setdefault((n, source), {"name": n, "source": str(source)})
    servers = sorted(seen.values(), key=lambda s: (s["name"].lower(), s["source"]))[:MAX_NAMES]
    return servers, skipped


def run(args: dict | None = None, paths=None) -> dict:
    servers, skipped = inventory(paths)
    if servers:
        names = sorted({s["name"] for s in servers}, key=str.lower)
        sp = f"I see {len(names)} MCP servers configured: " + ", ".join(names[:15]) + ("…" if len(names) > 15 else ".")
    else:
        sp = "I don't see any MCP servers in the Claude, Cursor or Codex configs."
    if skipped:
        sp += f" ({skipped} config file{'s' if skipped != 1 else ''} skipped.)"
    return {"ok": True, "op": "list", "servers": servers, "skipped": skipped, "spoken": sp}


def log_meta(got: dict) -> dict:
    return {"op": "list", "ok": bool(got.get("ok")), "count": len(got.get("servers") or []), "skipped": int(got.get("skipped") or 0)}


def server_spec(name: str, paths=None) -> dict | None:
    """Internal only (Phase B client): command/args/env for one named stdio server. Never returned to the user."""
    for _source, path in (paths or DEFAULT_PATHS):
        path = Path(path)
        try:
            text = path.read_text(encoding="utf-8")
            if path.suffix == ".toml":
                if tomllib is None:
                    continue
                servers = (tomllib.loads(text).get("mcp_servers") or {})
            else:
                data = json.loads(text)
                servers = dict(data.get("mcpServers") or {}) if isinstance(data, dict) else {}
        except (OSError, ValueError, TypeError):
            continue
        spec = servers.get(name) if isinstance(servers, dict) else None
        if isinstance(spec, dict) and spec.get("command"):
            return {"command": str(spec["command"]), "args": [str(a) for a in (spec.get("args") or [])],
                    "env": {str(k): str(v) for k, v in (spec.get("env") or {}).items()}}
    return None
