"""Jarvis-owned MCP OAuth for URL/HTTP servers (Hostinger first).

Discovery → dynamic client registration → PKCE authorize → localhost callback →
token store in gitignored ~/jarvis-int/.env.mcp (0600). Never prints token values.
Does not call Codex, Claude, or Cursor CLIs.
"""
from __future__ import annotations

import hashlib
import base64
import json
import os
import re
import secrets
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from typing import Any

UA = "JarvisMCP/1.0 (Macintosh; Jarvis-OAuth)"
ENV_PATH = Path(os.path.expanduser("~/jarvis-int/.env.mcp"))
ENV_PATH_ALT = Path(os.path.expanduser("~/jarvis-main/.env.mcp"))
START, END = "# BEGIN jarvis-mcp-oauth", "# END jarvis-mcp-oauth"

# Per-server profile: MCP URL + env key prefixes
SERVERS: dict[str, dict[str, str]] = {
    "hostinger": {
        "url": "https://mcp.hostinger.com",
        "access_env": "HOSTINGER_MCP_ACCESS_TOKEN",
        "refresh_env": "HOSTINGER_MCP_REFRESH_TOKEN",
        "client_env": "HOSTINGER_MCP_CLIENT_ID",
        "expires_env": "HOSTINGER_MCP_EXPIRES_AT",
        "scope": "mcp:use",
    },
    "n8n": {
        "url": "https://evenslouis.ca/n8n/mcp-server/http",
        "access_env": "N8N_MCP_ACCESS_TOKEN",
        "refresh_env": "N8N_MCP_REFRESH_TOKEN",
        "client_env": "N8N_MCP_CLIENT_ID",
        "expires_env": "N8N_MCP_EXPIRES_AT",
        "scope": "",  # filled from metadata when empty
    },
}


def _log(msg: str) -> None:
    """Structural logs only — never tokens."""
    print(msg, flush=True)


def _http_json(url: str, *, data: dict | None = None, headers: dict | None = None, method: str | None = None) -> dict:
    body = None if data is None else json.dumps(data).encode()
    h = {"User-Agent": UA, "Accept": "application/json", **(headers or {})}
    if body is not None:
        h.setdefault("Content-Type", "application/json")
    req = urllib.request.Request(url, data=body, headers=h, method=method or ("POST" if body else "GET"))
    with urllib.request.urlopen(req, timeout=30) as r:
        raw = r.read().decode("utf-8", errors="replace")
        return json.loads(raw) if raw.strip() else {}


def _http_form(url: str, form: dict[str, str], headers: dict | None = None) -> dict:
    body = urllib.parse.urlencode(form).encode()
    h = {"User-Agent": UA, "Accept": "application/json", "Content-Type": "application/x-www-form-urlencoded", **(headers or {})}
    req = urllib.request.Request(url, data=body, headers=h, method="POST")
    with urllib.request.urlopen(req, timeout=30) as r:
        raw = r.read().decode("utf-8", errors="replace")
        return json.loads(raw) if raw.strip() else {}


def well_known_urls(resource_url: str, suffix: str) -> list[str]:
    """RFC 9728/8414 well-known candidates: path-insert form first (host/.well-known/<suffix>/<path>), then path-append."""
    u = urllib.parse.urlsplit(resource_url.rstrip("/"))
    root = f"{u.scheme}://{u.netloc}"
    path = u.path.rstrip("/")
    first = f"{root}/.well-known/{suffix}{path}"
    return [first] if not path else [first, f"{root}{path}/.well-known/{suffix}"]


def resource_metadata_from_header(header: str) -> str:
    """resource_metadata URL out of a 401 WWW-Authenticate header (https only), else ''."""
    m = re.search(r'resource_metadata="(https://[^"\s]+)"', header or "")
    return m.group(1) if m else ""


def _first_json(urls: list[str], what: str) -> dict:
    last = ""
    for url in urls:
        try:
            return _http_json(url)
        except urllib.error.HTTPError as e:
            last = f"HTTP {e.code}"
        except (urllib.error.URLError, ValueError, OSError) as e:
            last = type(e).__name__
    raise RuntimeError(f"no {what} metadata found ({last}); tried {len(urls)} well-known location(s)")


def discover(mcp_url: str, metadata_url: str = "") -> dict[str, Any]:
    """RFC 9728 protected resource + AS metadata. Tries the path-insert and path-append well-known forms."""
    base = mcp_url.rstrip("/")
    pr = _first_json(([metadata_url] if metadata_url else []) + well_known_urls(base, "oauth-protected-resource"), "protected resource")
    auths = pr.get("authorization_servers") or []
    if not auths:
        raise RuntimeError("no authorization_servers in protected resource metadata")
    issuer = str(auths[0]).rstrip("/")
    meta = _first_json(well_known_urls(issuer, "oauth-authorization-server"), "authorization server")
    scopes = pr.get("scopes_supported") or meta.get("scopes_supported") or []
    return {
        "resource": pr.get("resource") or base,
        "issuer": meta.get("issuer") or issuer,
        "authorization_endpoint": meta["authorization_endpoint"],
        "token_endpoint": meta["token_endpoint"],
        "registration_endpoint": meta.get("registration_endpoint"),
        "scopes": scopes,
        "code_challenge_methods": meta.get("code_challenge_methods_supported") or ["S256"],
    }


def _pkce() -> tuple[str, str]:
    verifier = secrets.token_urlsafe(64)[:128]
    digest = hashlib.sha256(verifier.encode("ascii")).digest()
    challenge = base64.urlsafe_b64encode(digest).decode("ascii").rstrip("=")
    return verifier, challenge


def register_client(registration_endpoint: str, redirect_uri: str, client_name: str = "Jarvis") -> dict:
    """OAuth 2.0 Dynamic Client Registration (public client, auth method none)."""
    payload = {
        "client_name": client_name,
        "redirect_uris": [redirect_uri],
        "grant_types": ["authorization_code", "refresh_token"],
        "response_types": ["code"],
        "token_endpoint_auth_method": "none",
        "application_type": "native",
    }
    return _http_json(registration_endpoint, data=payload, method="POST")


def _read_env_file(path: Path) -> dict[str, str]:
    out: dict[str, str] = {}
    if not path.is_file():
        return out
    for line in path.read_text(encoding="utf-8").splitlines():
        raw = line.strip()
        if not raw or raw.startswith("#") or "=" not in raw:
            continue
        k, _, v = raw.partition("=")
        out[k.strip()] = v
    return out


def _write_env_keys(updates: dict[str, str]) -> Path:
    """Merge keys into .env.mcp between markers. Mode 0600. Never logs values."""
    path = ENV_PATH
    path.parent.mkdir(parents=True, exist_ok=True)
    prev = path.read_text(encoding="utf-8") if path.is_file() else ""
    existing: dict[str, str] = {}
    if START in prev and END in prev:
        block = prev.split(START, 1)[1].split(END, 1)[0]
        for line in block.splitlines():
            if "=" in line and not line.strip().startswith("#"):
                k, _, v = line.partition("=")
                existing[k.strip()] = v
        prev = re.sub(re.escape(START) + r"[\s\S]*?" + re.escape(END) + r"\n?", "", prev)
    existing.update({k: v for k, v in updates.items() if v is not None})
    # Keep stable key order
    order = [
        "N8N_MCP_ACCESS_TOKEN", "N8N_MCP_REFRESH_TOKEN", "N8N_MCP_CLIENT_ID", "N8N_MCP_EXPIRES_AT",
        "HOSTINGER_MCP_ACCESS_TOKEN", "HOSTINGER_MCP_REFRESH_TOKEN", "HOSTINGER_MCP_CLIENT_ID", "HOSTINGER_MCP_EXPIRES_AT",
    ]
    keys = [k for k in order if k in existing] + [k for k in existing if k not in order]
    lines = [START] + [f"{k}={existing[k]}" for k in keys] + [END, ""]
    body = prev.rstrip() + ("\n" if prev.strip() else "") + "\n".join(lines)
    tmp = path.with_suffix(".mcp.tmp")
    tmp.write_text(body, encoding="utf-8")
    os.chmod(tmp, 0o600)
    os.replace(tmp, path)
    os.chmod(path, 0o600)
    # Ensure symlink for jarvis-main if missing
    try:
        if not ENV_PATH_ALT.exists():
            ENV_PATH_ALT.symlink_to(path)
    except OSError:
        pass
    return path


def load_tokens(server: str) -> dict[str, str]:
    prof = SERVERS[server]
    env = _read_env_file(ENV_PATH)
    # also process env
    for k in (prof["access_env"], prof["refresh_env"], prof["client_env"], prof["expires_env"]):
        if os.environ.get(k):
            env.setdefault(k, os.environ[k])
    return {
        "access": env.get(prof["access_env"]) or "",
        "refresh": env.get(prof["refresh_env"]) or "",
        "client_id": env.get(prof["client_env"]) or "",
        "expires_at": env.get(prof["expires_env"]) or "0",
    }


def save_tokens(server: str, *, access: str, refresh: str, client_id: str, expires_at: int) -> None:
    prof = SERVERS[server]
    _write_env_keys({
        prof["access_env"]: access,
        prof["refresh_env"]: refresh,
        prof["client_env"]: client_id,
        prof["expires_env"]: str(int(expires_at)),
    })
    # Keep process env in sync for this turn
    os.environ[prof["access_env"]] = access
    os.environ[prof["refresh_env"]] = refresh
    os.environ[prof["client_env"]] = client_id
    os.environ[prof["expires_env"]] = str(int(expires_at))
    _log(f"{server}: tokens saved to {ENV_PATH} mode=0600 access_len={len(access)} refresh_len={len(refresh)}")


def refresh_access(server: str, meta: dict | None = None) -> str | None:
    """Refresh if possible. Returns new access token or None. Never prints values."""
    prof = SERVERS[server]
    tok = load_tokens(server)
    if not tok["refresh"] or not tok["client_id"]:
        return None
    if meta is None:
        meta = discover(prof["url"])
    try:
        resp = _http_form(meta["token_endpoint"], {
            "grant_type": "refresh_token",
            "refresh_token": tok["refresh"],
            "client_id": tok["client_id"],
        })
    except urllib.error.HTTPError as e:
        _log(f"{server}: refresh HTTP {e.code}")
        return None
    access = resp.get("access_token") or ""
    refresh = resp.get("refresh_token") or tok["refresh"]
    expires_in = int(resp.get("expires_in") or 3600)
    expires_at = int(time.time()) + expires_in
    if not access:
        return None
    save_tokens(server, access=access, refresh=refresh, client_id=tok["client_id"], expires_at=expires_at)
    _log(f"{server}: refreshed expires_in={expires_in}")
    return access


def ensure_access(server: str, skew_sec: int = 120) -> str | None:
    """Return a usable access token, refreshing when near expiry."""
    prof = SERVERS.get(server)
    if not prof:
        return None
    tok = load_tokens(server)
    try:
        exp = int(float(tok["expires_at"] or 0))
    except ValueError:
        exp = 0
    # expires_at may be ms
    if exp > 10_000_000_000:
        exp = exp // 1000
    now = int(time.time())
    if tok["access"] and exp and exp - now > skew_sec:
        os.environ[prof["access_env"]] = tok["access"]
        return tok["access"]
    if tok["refresh"] and tok["client_id"]:
        got = refresh_access(server)
        if got:
            return got
    if tok["access"]:
        os.environ[prof["access_env"]] = tok["access"]
        return tok["access"]
    return None


class _CallbackState:
    def __init__(self) -> None:
        self.code: str | None = None
        self.state: str | None = None
        self.error: str | None = None
        self.event = threading.Event()


def _make_handler(state: _CallbackState, expected_state: str):
    class Handler(BaseHTTPRequestHandler):
        def log_message(self, fmt: str, *args) -> None:  # quiet
            return

        def do_GET(self) -> None:  # noqa: N802
            parsed = urllib.parse.urlparse(self.path)
            if parsed.path not in ("/callback", "/"):
                self.send_response(404)
                self.end_headers()
                return
            qs = urllib.parse.parse_qs(parsed.query)
            if qs.get("error"):
                state.error = qs.get("error", ["unknown"])[0]
                self._page(400, "Sign-in failed. You can close this window.")
                state.event.set()
                return
            code = (qs.get("code") or [None])[0]
            st = (qs.get("state") or [None])[0]
            if not code or st != expected_state:
                state.error = "state_mismatch_or_missing_code"
                self._page(400, "Sign-in failed (state). You can close this window.")
                state.event.set()
                return
            state.code = code
            state.state = st
            self._page(200, "Authentication complete. You may close this window.")
            state.event.set()

        def _page(self, code: int, msg: str) -> None:
            body = f"<!doctype html><html><body><p>{msg}</p></body></html>".encode()
            self.send_response(code)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

    return Handler


def login(server: str = "hostinger", *, open_browser: bool = True, wait_sec: int = 600) -> dict:
    """Full OAuth login. Opens default browser when open_browser=True. Returns status only."""
    if server not in SERVERS:
        return {"ok": False, "error": "unknown_server"}
    prof = SERVERS[server]
    meta = discover(prof["url"])
    if "S256" not in (meta.get("code_challenge_methods") or []):
        return {"ok": False, "error": "S256_required"}
    if not meta.get("registration_endpoint"):
        return {"ok": False, "error": "no_registration_endpoint"}

    # Bind callback first so redirect_uri is known for DCR
    state_token = secrets.token_urlsafe(24)
    verifier, challenge = _pkce()
    cb = _CallbackState()
    # Port 0 → ephemeral
    httpd = HTTPServer(("127.0.0.1", 0), _make_handler(cb, state_token))
    port = httpd.server_address[1]
    redirect_uri = f"http://127.0.0.1:{port}/callback"
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    _log(f"{server}: callback listening on 127.0.0.1:{port}")

    try:
        reg = register_client(meta["registration_endpoint"], redirect_uri, client_name="Jarvis MCP")
        client_id = reg.get("client_id") or ""
        if not client_id:
            return {"ok": False, "error": "registration_no_client_id"}
        _log(f"{server}: registered client_id_len={len(client_id)}")

        scope = (prof.get("scope") or "").strip()
        if not scope and meta.get("scopes"):
            scope = " ".join(meta["scopes"][:5])
        q = {
            "response_type": "code",
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "state": state_token,
            "code_challenge": challenge,
            "code_challenge_method": "S256",
            "resource": meta["resource"],
        }
        if scope:
            q["scope"] = scope
        auth_url = meta["authorization_endpoint"] + "?" + urllib.parse.urlencode(q)
        _log(f"{server}: authorize URL ready (PKCE S256, resource set)")
        if open_browser:
            # Approved browser open only — macOS `open`
            import subprocess
            subprocess.run(["open", auth_url], check=False)
            _log(f"{server}: opened default browser via open(1); waiting up to {wait_sec}s")

        if not cb.event.wait(timeout=wait_sec):
            return {"ok": False, "error": "timeout_waiting_for_callback"}
        if cb.error or not cb.code:
            return {"ok": False, "error": cb.error or "no_code"}

        token_form = {
            "grant_type": "authorization_code",
            "code": cb.code,
            "redirect_uri": redirect_uri,
            "client_id": client_id,
            "code_verifier": verifier,
            "resource": meta["resource"],
        }
        try:
            resp = _http_form(meta["token_endpoint"], token_form)
        except urllib.error.HTTPError as e:
            _log(f"{server}: token exchange HTTP {e.code}")
            return {"ok": False, "error": f"token_http_{e.code}"}

        access = resp.get("access_token") or ""
        refresh = resp.get("refresh_token") or ""
        expires_in = int(resp.get("expires_in") or 3600)
        if not access:
            return {"ok": False, "error": "no_access_token"}
        save_tokens(
            server,
            access=access,
            refresh=refresh,
            client_id=client_id,
            expires_at=int(time.time()) + expires_in,
        )
        return {"ok": True, "server": server, "expires_in": expires_in, "has_refresh": bool(refresh)}
    finally:
        httpd.shutdown()
        try:
            httpd.server_close()
        except Exception:
            pass


def reauth_status(server: str) -> dict:
    """Offline diagnosis from the stored env. Booleans and names only, never a value."""
    prof = SERVERS.get(server)
    if not prof:
        return {"server": server, "reason": "unknown server", "needs_login": False, "can_refresh": False,
                "has_access": False, "has_refresh": False, "has_client_id": False}
    t = load_tokens(server)
    has_a, has_r, has_c = bool(t["access"]), bool(t["refresh"]), bool(t["client_id"])
    can_refresh = has_r and has_c
    if can_refresh:
        reason = "refresh token and client id are present; ensure_access can refresh without a browser"
    elif has_r:
        reason = (f"refresh token present but {prof['client_env']} is missing: the token was issued to another client "
                  "(a CLI login), so Jarvis cannot refresh it; Jarvis must register its own client and log in once")
    else:
        reason = "no refresh token stored; a Jarvis login is needed"
    return {"server": server, "has_access": has_a, "has_refresh": has_r, "has_client_id": has_c,
            "can_refresh": can_refresh, "needs_login": not can_refresh, "reason": reason, "url": prof["url"]}


def reauth_plan(server: str) -> str:
    st = reauth_status(server)
    if st["reason"] == "unknown server":
        return f"{server}: not a server Jarvis can sign in to."
    prof = SERVERS[server]
    if st["can_refresh"]:
        return f"{server}: no login needed. `python3 -m hands.mcp_oauth refresh {server}` refreshes in place (no browser)."
    return "\n".join([
        f"{server} re-auth plan (nothing has been run): {st['reason']}.",
        f"1. Evens approves one browser consent for {prof['url']} (the only human step; Jarvis never opens it unasked).",
        "2. Preflight, unauthenticated GET only: discover() reads the well-known metadata (path-insert form first).",
        "3. Dynamic client registration, PKCE S256, loopback callback on 127.0.0.1 (ephemeral port).",
        f"4. Tokens are written to the gitignored .env.mcp (0600) as {prof['access_env']}, {prof['refresh_env']}, "
        f"{prof['client_env']}, {prof['expires_env']}; the old CLI-issued access/refresh values are overwritten.",
        f"5. Run: python3 apps/agent-stack/hands/mcp_oauth.py login {server}   then   probe: tools/list on {server}.",
        "6. Write tools stay gated by the READ_TOOL name rule; this plan adds no write access.",
    ])


def probe_tools(server: str) -> dict:
    """Direct tools/list using stored token (status + count only)."""
    from . import agent_tools as at  # type: ignore
    # Prefer ensure_access
    ensure_access(server)
    got = at.op_mcp_list(server)
    spoken = (got.get("spoken") or "")[:200]
    return {"ok": bool(got.get("ok")), "spoken": spoken, "tools": got.get("tools") or got.get("names")}


if __name__ == "__main__":
    import sys
    cmd = (sys.argv[1] if len(sys.argv) > 1 else "login").strip()
    srv = (sys.argv[2] if len(sys.argv) > 2 else "hostinger").strip()
    if cmd == "login":
        open_br = "--no-browser" not in sys.argv
        result = login(srv, open_browser=open_br, wait_sec=600)
        # status only
        _log(json.dumps({k: result.get(k) for k in ("ok", "server", "expires_in", "has_refresh", "error")}))
        sys.exit(0 if result.get("ok") else 1)
    if cmd == "plan":
        _log(reauth_plan(srv))
        sys.exit(0)
    if cmd == "refresh":
        got = refresh_access(srv)
        _log(json.dumps({"ok": bool(got), "server": srv, "access_len": len(got or "")}))
        sys.exit(0 if got else 1)
    _log("usage: mcp_oauth.py login|refresh|plan [server]")
    sys.exit(2)
