"""A live browser for the operator, the way browser-use and Codex drive one (Evens 2026-10-16: "if I asked Codex it
would use its browser use and do what I asked end to end").

One Playwright MCP server per operator job, kept open for the whole job, so the page, tabs, login and history persist
between steps. The model works the page by its structure: browser_snapshot returns the accessibility tree with element
refs, and browser_click / browser_type act on a ref, not on guessed pixels. The window is headed: Evens sees it.
"""
from __future__ import annotations

import json
import os
import select
import subprocess
import time
from pathlib import Path

NODE = os.environ.get("JARVIS_PLAYWRIGHT_NODE") or "/opt/homebrew/opt/node@24/bin/node"
CLI = os.environ.get("JARVIS_PLAYWRIGHT_MCP") or str(
    Path.home() / ".npm/_npx/9833c18b2d85bc59/node_modules/@playwright/mcp/cli.js")
CALL_TIMEOUT_S = 60.0
TEXT_CAP = 9000


class BrowserSession:
    """Persistent JSON-RPC stdio client for @playwright/mcp."""

    def __init__(self, argv: list | None = None):
        self.argv = argv or [NODE, CLI]
        self.proc: subprocess.Popen | None = None
        self.next_id = 1
        self.tools: list = []

    # -- transport -----------------------------------------------------------------------------------
    def _send(self, msg: dict) -> None:
        self.proc.stdin.write((json.dumps(msg) + "\n").encode())
        self.proc.stdin.flush()

    def _recv(self, want_id: int, timeout: float) -> dict:
        end = time.monotonic() + timeout
        buf = b""
        while time.monotonic() < end:
            ready, _, _ = select.select([self.proc.stdout], [], [], max(0.0, end - time.monotonic()))
            if not ready:
                break
            chunk = os.read(self.proc.stdout.fileno(), 1 << 16)
            if not chunk:
                raise RuntimeError("the browser server closed")
            buf += chunk
            while b"\n" in buf:
                line, buf = buf.split(b"\n", 1)
                try:
                    msg = json.loads(line)
                except ValueError:
                    continue
                if msg.get("id") == want_id:
                    return msg
        raise TimeoutError("the browser did not answer in time")

    def _request(self, method: str, params: dict, timeout: float = CALL_TIMEOUT_S) -> dict:
        rid = self.next_id
        self.next_id += 1
        self._send({"jsonrpc": "2.0", "id": rid, "method": method, "params": params})
        msg = self._recv(rid, timeout)
        if "error" in msg:
            raise RuntimeError(str(msg["error"].get("message") or msg["error"]))
        return msg.get("result") or {}

    # -- lifecycle -----------------------------------------------------------------------------------
    def start(self) -> None:
        if self.proc and self.proc.poll() is None:
            return
        self.proc = subprocess.Popen(self.argv, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
        self._request("initialize", {"protocolVersion": "2025-06-18", "capabilities": {},
                                     "clientInfo": {"name": "jarvis-operator", "version": "1"}}, timeout=90)
        self._send({"jsonrpc": "2.0", "method": "notifications/initialized"})
        self.tools = [t.get("name") for t in self._request("tools/list", {}).get("tools") or []]

    def close(self) -> None:
        if self.proc and self.proc.poll() is None:
            try:
                self.call("browser_close", {})
            except Exception:  # noqa: BLE001 - closing is best effort
                pass
            self.proc.terminate()
        self.proc = None

    # -- calls ---------------------------------------------------------------------------------------
    def call(self, tool: str, args: dict | None = None) -> dict:
        """{"text": str, "image": data URL or None}. Any Playwright MCP tool by name."""
        self.start()
        name = tool if tool.startswith("browser_") else "browser_" + tool
        result = self._request("tools/call", {"name": name, "arguments": args or {}})
        texts, image = [], None
        for part in result.get("content") or []:
            if part.get("type") == "text":
                texts.append(part.get("text") or "")
            elif part.get("type") == "image" and part.get("data"):
                image = f"data:{part.get('mimeType') or 'image/png'};base64,{part['data']}"
        text = "\n".join(texts)
        if len(text) > TEXT_CAP:
            text = text[:TEXT_CAP] + "\n[page text cut; call browser_snapshot again after scrolling, or browser_find]"
        if result.get("isError"):
            text = "error: " + text
        return {"text": text or "ok", "image": image}
