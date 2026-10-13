#!/usr/bin/env python3
"""REA (reverse-engineering MCP, rea-agents@6.3.0) wiring for Jarvis. Off unless JARVIS_REA=1.

REA-ROLLOUT step 3. This only *describes* the MCP server entry and a read-only
tool allowlist; it never spawns npx, never opens a socket, and never changes
the spoken reply. A caller that loads mcpServers merges `mcp_servers(base)`.
With the flag unset the base dict is returned unchanged (same object).
"""
from __future__ import annotations

import os
from typing import Any

FLAG = "JARVIS_REA"
SERVER_NAME = "rea"
PINNED = "rea-agents@6.3.0"
SERVER_ENTRY: dict[str, Any] = {"command": "npx", "args": ["-y", PINNED, "--mcp"]}
# Read/inspect tools only. Anything that writes names/comments/bookmarks or
# drives a live process/browser stays out until an operator widens this.
READ_ONLY_TOOLS = frozenset({
    "open_binary", "binary_overview", "list_procedures", "procedure_pseudo_code",
    "procedure_assembly", "list_strings", "search_strings", "xrefs",
    "inspect_artifact", "inspect_macho", "inspect_signature", "list_segments",
    "analyze_web_bundle", "analyze_javascript_application", "close_binary",
})


def enabled() -> bool:
    return os.environ.get(FLAG, "") == "1"


def mcp_servers(base: dict[str, Any] | None = None) -> dict[str, Any]:
    """Return base mcpServers, plus `rea` only when JARVIS_REA=1. Never overwrites an existing entry."""
    base = {} if base is None else base
    if not enabled() or SERVER_NAME in base:
        return base
    merged = dict(base)
    merged[SERVER_NAME] = {"command": SERVER_ENTRY["command"], "args": list(SERVER_ENTRY["args"])}
    return merged


def tool_allowed(tool: str) -> bool:
    """Gate for a routed REA tool call. False when off or not read-only."""
    name = tool.split("__", 1)[-1] if tool.startswith(SERVER_NAME + "__") else tool
    return enabled() and name in READ_ONLY_TOOLS
