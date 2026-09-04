#!/usr/bin/env python3
"""Face sitting: localhost pane that reads the file bus.

Bind 127.0.0.1 only. Not evenslouis.ca. Not a second hive.
"""
from __future__ import annotations

import importlib.util
import json
import os
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
HIVE = ROOT / "docs/hive/outer-heaven/.hive"
OS_DIR = ROOT / "docs/hive/outer-heaven/CONTENT/os"
HOST = "127.0.0.1"
PORT = int(os.environ.get("AGENT_STACK_FACE_PORT") or "4018")


def _load_mouth():
    path = HERE.parent / "mouth" / "turn.py"
    spec = importlib.util.spec_from_file_location("agent_stack_mouth", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOUTH = _load_mouth()


def load_json(path: Path) -> dict:
    if not path.is_file():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}
    return data if isinstance(data, dict) else {}


def observe_jobs() -> list[dict]:
    rows: list[dict] = []
    os_jobs = load_json(OS_DIR / "jobs.json")
    for job in os_jobs.get("jobs") or []:
        if isinstance(job, dict):
            rows.append(
                {
                    "id": job.get("name") or "job",
                    "status": job.get("state") or "done",
                    "note": job.get("last_line") or "",
                }
            )
    state = load_json(HIVE / "state.json")
    for job in state.get("jobs") or []:
        if isinstance(job, dict):
            rows.append(
                {
                    "id": job.get("id") or job.get("name") or "hive-job",
                    "status": job.get("status") or job.get("state") or "working",
                    "note": job.get("note") or "",
                }
            )
    bus = load_json(HIVE / "bus" / "state.json")
    if bus:
        rows.insert(
            0,
            {
                "id": "mouth",
                "status": bus.get("job_status") or "done",
                "note": bus.get("permission_ask") or bus.get("utterance") or "idle",
            },
        )
    return rows[:20]


def mark_pieces_wired() -> None:
    stack_path = HIVE / "agent-stack.json"
    stack = load_json(stack_path)
    pieces = stack.get("pieces") if isinstance(stack.get("pieces"), dict) else {}
    if not pieces:
        return
    pieces["mouth"] = "wired"
    pieces["face"] = "wired"
    pieces["hands"] = "parked"
    stack["pieces"] = pieces
    stack_path.write_text(json.dumps(stack, indent=2) + "\n", encoding="utf-8")


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt: str, *args) -> None:  # noqa: A003
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))

    def _send(self, code: int, body: bytes, ctype: str) -> None:
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _json(self, code: int, payload: dict) -> None:
        self._send(code, (json.dumps(payload, indent=2) + "\n").encode("utf-8"), "application/json")

    def do_GET(self) -> None:  # noqa: N802
        path = urlparse(self.path).path
        if path == "/healthz":
            self._json(200, {"ok": True, "bind": f"{HOST}:{PORT}", "kind": "agent-stack-face"})
            return
        if path == "/api/bus":
            self._json(200, load_json(HIVE / "bus" / "state.json") or {"phase": "idle", "job_status": "done"})
            return
        if path == "/api/jobs":
            self._json(200, {"jobs": observe_jobs()})
            return
        if path == "/api/stack":
            self._json(200, load_json(HIVE / "agent-stack.json"))
            return
        target = HERE / ("pane.html" if path in ("/", "/face", "/pane.html") else path.lstrip("/"))
        try:
            target.resolve().relative_to(HERE.resolve())
        except ValueError:
            self._json(403, {"ok": False, "error": "outside face"})
            return
        if not target.is_file():
            self._json(404, {"ok": False, "error": "missing"})
            return
        ctype = "text/html; charset=utf-8"
        if target.suffix == ".css":
            ctype = "text/css"
        self._send(200, target.read_bytes(), ctype)

    def _read_json(self) -> dict:
        length = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(length) if length else b"{}"
        try:
            data = json.loads(raw.decode("utf-8"))
        except json.JSONDecodeError:
            data = {}
        return data if isinstance(data, dict) else {}

    def do_POST(self) -> None:  # noqa: N802
        path = urlparse(self.path).path
        data = self._read_json()
        if path == "/api/listen":
            bus = MOUTH.set_listen(HIVE, bool(data.get("live")))
            self._json(200, {"ok": True, **bus})
            return
        if path != "/api/turn":
            self._json(404, {"ok": False, "error": "no such route"})
            return
        out = MOUTH.apply_turn(
            str(data.get("utterance") or ""),
            approved=bool(data.get("approved")),
            hive=HIVE,
            speak=False,
        )
        self._json(200, out)


def serve(port: int = PORT) -> None:
    if os.environ.get("VOICE_OS_BIND") == "0.0.0.0":
        raise SystemExit("0.0.0.0 refused")
    mark_pieces_wired()
    httpd = ThreadingHTTPServer((HOST, port), Handler)
    print(json.dumps({"ok": True, "url": f"http://{HOST}:{port}/", "bind": HOST}, indent=2))
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        httpd.shutdown()


def self_test() -> dict:
    if os.environ.get("VOICE_OS_BIND") == "0.0.0.0":
        return {"ok": False, "errors": ["0.0.0.0 refused"]}
    if HOST != "127.0.0.1":
        return {"ok": False, "errors": ["face must bind 127.0.0.1"]}
    if not (HERE / "pane.html").is_file():
        return {"ok": False, "errors": ["pane.html missing"]}
    import threading
    import urllib.error
    import urllib.request

    httpd = ThreadingHTTPServer((HOST, 0), Handler)
    port = int(httpd.server_address[1])
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    try:
        with urllib.request.urlopen(f"http://{HOST}:{port}/healthz", timeout=2) as res:
            body = json.loads(res.read().decode("utf-8"))
        if not body.get("ok"):
            return {"ok": False, "errors": ["healthz not ok"], "body": body}
        with urllib.request.urlopen(f"http://{HOST}:{port}/", timeout=2) as home:
            html = home.read().decode("utf-8")
            code = home.status
        banned = ("Desk · Face", "<h2>Observe</h2>", "<h2>Mouth</h2>", "Hold Home", "Hold Talk")
        needed = ("<canvas", "J.A.R.V.I.S.", "TAP SPACE", "LISTENING FOR", "getUserMedia", "scheduleRestart", "Use Chrome")
        if code != 200 or any(token not in html for token in needed) or any(token in html for token in banned):
            return {"ok": False, "errors": ["GET / missing tape visualizer"], "status": code}
        return {"ok": True, "errors": [], "port": port, "bind": HOST, "home": 200}
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        return {"ok": False, "errors": [str(exc)]}
    finally:
        httpd.shutdown()
        httpd.server_close()


if __name__ == "__main__":
    if "--self-test" in sys.argv or os.environ.get("AGENT_STACK_FACE_SELF_TEST") == "1":
        out = self_test()
        print(json.dumps(out, indent=2))
        raise SystemExit(0 if out.get("ok") else 2)
    serve()
