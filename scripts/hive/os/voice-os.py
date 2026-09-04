#!/usr/bin/env python3
"""Voice + screen desk for the existing agentic OS.

Mouth writes the bus. Face reads it. Live screen share stays in the browser.
File / browse / watch jobs remap hive skills. Hands (mouse takeover) stay parked.

Bind: 127.0.0.1:4018  ·  never 0.0.0.0
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[3]
HIVE = ROOT / "docs/hive/outer-heaven/.hive"
OS_DIR = ROOT / "docs/hive/outer-heaven/CONTENT/os"
SKILLS_DIR = ROOT / "scripts/hive/grok-skills"
SURFACE = ROOT / "apps/portfolio/public/obsidianOS"
HOST = "127.0.0.1"
PORT = 4018
MAX_READ = 24_000
HARD_REFUSE = re.compile(
    r"\b(send|pay|deploy|book|publish|dial|call the restaurant|twilio|retell|vapi|"
    r"claude code|fable|cowork|auto-?approve|take over (my )?(mouse|computer))\b",
    re.I,
)
SECRET_NAME = re.compile(
    r"(^\.env($|\.)|credentials|secret|\.pem$|id_rsa|\.ssh)",
    re.I,
)
YT_RE = re.compile(
    r"(?:youtu\.be/|v=|youtube\.com/watch\?v=)([A-Za-z0-9_-]{11})"
)
SKILL_RE = re.compile(
    r"\b(?:use|load|run)\s+(?:skill\s+)?([a-z0-9][a-z0-9-]{2,60})\b",
    re.I,
)


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _load_stack_mod():
    import importlib.util

    path = Path(__file__).resolve().parent / "agent-stack.py"
    spec = importlib.util.spec_from_file_location("hive_agent_stack", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


STACK = _load_stack_mod()


def allowed_roots(hive: Path = HIVE) -> list[Path]:
    roots = [ROOT]
    stack = STACK.load_json(hive / "agent-stack.json")
    vault = stack.get("vault") if isinstance(stack.get("vault"), dict) else {}
    for key in ("path", "oh"):
        raw = vault.get(key)
        if raw:
            roots.append(Path(str(raw)))
    roots.append(OS_DIR)
    roots.append(HIVE)
    return roots


def resolve_allowed(raw: str, hive: Path = HIVE) -> Path | None:
    if not raw or SECRET_NAME.search(Path(raw).name):
        return None
    path = Path(raw).expanduser()
    if not path.is_absolute():
        path = (ROOT / path).resolve()
    else:
        path = path.resolve()
    for root in allowed_roots(hive):
        try:
            path.relative_to(root.resolve())
            return path
        except ValueError:
            continue
    return None


def list_skills(limit: int = 40) -> list[dict]:
    rows: list[dict] = []
    if not SKILLS_DIR.is_dir():
        return rows
    for path in sorted(SKILLS_DIR.glob("*.md")):
        if path.name.upper() == "README.md":
            continue
        text = path.read_text(encoding="utf-8", errors="replace")[:400]
        desc = ""
        for line in text.splitlines():
            if line.startswith("description:"):
                desc = line.split(":", 1)[1].strip().strip(">").strip()
                break
            if line.startswith("description: >"):
                continue
            if desc == "" and line.startswith("  ") and "---" not in line:
                desc = line.strip()
                break
        rows.append({"id": path.stem, "path": str(path.relative_to(ROOT)), "desc": desc[:160]})
        if len(rows) >= limit:
            break
    return rows


def load_skill(slug: str) -> dict:
    path = SKILLS_DIR / f"{slug}.md"
    if not path.is_file():
        return {"ok": False, "error": f"no hive skill {slug}"}
    text = path.read_text(encoding="utf-8", errors="replace")[:MAX_READ]
    return {"ok": True, "id": slug, "text": text}


def classify(utterance: str) -> dict:
    text = (utterance or "").strip()
    if not text:
        return {"verb": "idle", "needs_ask": False, "args": {}}
    if HARD_REFUSE.search(text):
        return {
            "verb": "refuse",
            "needs_ask": False,
            "args": {"reason": "hard-step or operate-never (send/pay/deploy/book/Claude/phone)"},
        }
    yt = YT_RE.search(text)
    if yt or re.search(r"\b(watch|cursor-video-watch)\b", text, re.I):
        return {
            "verb": "watch",
            "needs_ask": True,
            "args": {"video_id": yt.group(1) if yt else ""},
        }
    if re.search(r"\b(browse|open (the )?(page|url|site|browser)|go to https?)\b", text, re.I):
        url = ""
        m = re.search(r"https?://\S+", text)
        if m:
            url = m.group(0).rstrip(").,")
        return {"verb": "browse", "needs_ask": True, "args": {"url": url}}
    skill = SKILL_RE.search(text)
    if skill:
        return {"verb": "skill", "needs_ask": False, "args": {"slug": skill.group(1).lower()}}
    if re.search(r"\b(list skills|what skills|hive skills)\b", text, re.I):
        return {"verb": "skills", "needs_ask": False, "args": {}}
    if re.search(r"\b(list|ls|show files|what files)\b", text, re.I):
        target = "docs/hive/outer-heaven/CONTENT/os"
        m = re.search(r"(?:in|under|from)\s+(\S+)", text, re.I)
        if m:
            target = m.group(1).strip(" .")
        return {"verb": "file_list", "needs_ask": False, "args": {"path": target}}
    if re.search(r"\b(read|open file|cat )\b", text, re.I):
        m = re.search(r"((?:[\w./-]+\.(?:md|json|txt|py|html)))", text)
        target = m.group(1) if m else "docs/hive/outer-heaven/CONTENT/os/hot.md"
        return {"verb": "file_read", "needs_ask": False, "args": {"path": target}}
    if re.search(r"\b(status|bus|what are you doing|phase)\b", text, re.I):
        return {"verb": "status", "needs_ask": False, "args": {}}
    return {"verb": "talk", "needs_ask": False, "args": {}}


def append_job(row: dict, hive: Path = HIVE) -> dict:
    path = hive / "bus" / "jobs.jsonl"
    path.parent.mkdir(parents=True, exist_ok=True)
    row = {**row, "id": row.get("id") or f"job-{now_iso()}", "ts": now_iso()}
    with path.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(row) + "\n")
    return row


def apply_turn(
    utterance: str,
    *,
    approved: bool = False,
    screen_note: str = "",
    hive: Path = HIVE,
) -> dict:
    plan = classify(utterance)
    verb = plan["verb"]
    args = plan["args"]
    narration = ""
    result: dict = {"verb": verb, "args": args}

    if verb == "refuse":
        narration = f"I will not do that. {args['reason']}. Check with you stays the feature."
        STACK.bus_write(
            phase="speak",
            job_status="done",
            utterance=utterance,
            permission_ask=None,
            hive=hive,
        )
        return {**result, "ok": True, "ask": False, "spoken": narration}

    if plan["needs_ask"] and not approved:
        ask = f"May I {verb}"
        if args.get("url"):
            ask += f" {args['url']}"
        if args.get("video_id"):
            ask += f" video {args['video_id']}"
        ask += "? Say yes to approve."
        STACK.bus_write(
            phase="speak",
            job_status="yellow",
            utterance=utterance,
            permission_ask=ask,
            hive=hive,
        )
        return {**result, "ok": True, "ask": True, "spoken": ask, "permission_ask": ask}

    if verb == "idle":
        narration = "Holding. Share the screen or hold talk when you want me."
    elif verb == "status":
        bus = STACK.load_json(hive / "bus" / "state.json") or STACK.default_bus()
        narration = f"Phase {bus.get('phase')}. Job {bus.get('job_status')}. Last: {bus.get('utterance') or 'none'}."
        result["bus"] = bus
    elif verb == "skills":
        rows = list_skills(12)
        narration = "Hive skills on this host: " + ", ".join(r["id"] for r in rows[:8]) + "."
        result["skills"] = rows
    elif verb == "skill":
        loaded = load_skill(args["slug"])
        result["skill"] = loaded
        narration = (
            f"Loaded {args['slug']}. Cursor and Grok already run this skill. I will not install a vendor copy."
            if loaded.get("ok")
            else f"No skill named {args['slug']}."
        )
    elif verb == "file_list":
        path = resolve_allowed(args["path"], hive=hive)
        if path is None or not path.exists():
            narration = "That path is outside the vault and repo, or it is missing."
        elif path.is_file():
            narration = f"{path.name} is a file. Ask me to read it."
            result["path"] = str(path)
        else:
            names = sorted(p.name for p in path.iterdir() if not p.name.startswith("."))[:40]
            narration = f"{len(names)} items in {path.name}: " + ", ".join(names[:12])
            result["entries"] = names
    elif verb == "file_read":
        path = resolve_allowed(args["path"], hive=hive)
        if path is None or not path.is_file():
            narration = "I can only read files inside the repo or the adopted vault."
        else:
            text = path.read_text(encoding="utf-8", errors="replace")[:MAX_READ]
            result["text"] = text
            result["path"] = str(path)
            narration = f"Read {path.name}, {len(text)} characters. First line: {text.splitlines()[0][:120] if text else 'empty'}."
    elif verb == "browse":
        url = args.get("url") or ""
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https") or not parsed.netloc:
            narration = "Give me an http URL to queue. I will not open a blank browser."
        else:
            job = append_job(
                {
                    "kind": "browse",
                    "url": url,
                    "host": "cursor-ide-browser",
                    "status": "queued",
                    "note": "Host executes with cursor-ide-browser. Not Playwright.",
                },
                hive=hive,
            )
            result["job"] = job
            narration = f"Queued browse {url} for the Cursor host. I do not drive the mouse."
    elif verb == "watch":
        vid = args.get("video_id") or ""
        if not vid:
            narration = "Name a YouTube id. I will queue cursor-video-watch, not invent frames."
        else:
            job = append_job(
                {
                    "kind": "watch",
                    "video_id": vid,
                    "host": "cursor-video-watch",
                    "status": "queued",
                    "packet": f"docs/hive/outer-heaven/CONTENT/watch-later/packets/{vid}/",
                },
                hive=hive,
            )
            result["job"] = job
            narration = f"Queued watch {vid}. Caption-only until the Cursor host captures frames."
    else:
        brief = OS_DIR / "sessions" / "BRIEF-2026-08-14-to-2026-09-04.md"
        hint = ""
        if brief.is_file():
            hint = " One brain is the vault plus this repo. I use Cursor and Grok skills, not Claude Code."
        seen = f" I can see your shared screen: {screen_note[:180]}." if screen_note else ""
        narration = f"Heard you.{seen}{hint} Hold talk again, or ask me to list skills, read a file, browse a URL, or watch a video."

    STACK.bus_write(
        phase="speak",
        job_status="done",
        utterance=utterance,
        permission_ask=None,
        hive=hive,
    )
    return {**result, "ok": True, "ask": False, "spoken": narration}


def self_test() -> dict:
    import tempfile

    with tempfile.TemporaryDirectory(prefix="voice-os-") as tmp:
        hive = Path(tmp)
        vault = {
            "ok": True,
            "source": "local",
            "path": str(ROOT),
            "oh": str(OS_DIR),
            "kind": "test",
        }
        adopted = STACK.adopt(hive=hive, vault=vault)
        if not adopted.get("ok"):
            return {"ok": False, "errors": adopted.get("errors")}
        refused = apply_turn("send this email and pay Stripe", hive=hive)
        if refused.get("verb") != "refuse":
            return {"ok": False, "errors": ["hard-step was not refused"]}
        asked = apply_turn("browse https://example.com/docs", hive=hive)
        if not asked.get("ask"):
            return {"ok": False, "errors": ["browse must ASK"]}
        ok_list = apply_turn("list files in docs/hive/outer-heaven/CONTENT/os", hive=hive)
        if not ok_list.get("ok") or ok_list.get("verb") != "file_list":
            return {"ok": False, "errors": ["file_list failed"]}
        if classify("watch https://youtu.be/ud7wzdiM0gk")["verb"] != "watch":
            return {"ok": False, "errors": ["watch classify failed"]}
        return {"ok": True, "errors": []}


class Handler(BaseHTTPRequestHandler):
    hive = HIVE

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

    def _read_json(self) -> dict:
        length = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(length) if length else b"{}"
        try:
            data = json.loads(raw.decode("utf-8"))
        except json.JSONDecodeError:
            return {}
        return data if isinstance(data, dict) else {}

    def do_GET(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        path = parsed.path
        if path == "/healthz":
            self._json(200, {"ok": True, "bind": f"{HOST}:{PORT}"})
            return
        if path == "/api/bus":
            self._json(200, STACK.load_json(self.hive / "bus" / "state.json") or STACK.default_bus())
            return
        if path == "/api/stack":
            self._json(200, STACK.load_json(self.hive / "agent-stack.json") or {})
            return
        if path == "/api/skills":
            self._json(200, {"skills": list_skills()})
            return
        if path in ("/", "/voice", "/voice.html"):
            target = SURFACE / "voice.html"
        else:
            rel = path.lstrip("/")
            target = (SURFACE / rel).resolve()
            try:
                target.relative_to(SURFACE.resolve())
            except ValueError:
                self._json(403, {"ok": False, "error": "outside surface"})
                return
        if not target.is_file():
            self._json(404, {"ok": False, "error": "missing", "path": str(target)})
            return
        ctype = "text/html; charset=utf-8"
        if target.suffix == ".css":
            ctype = "text/css"
        elif target.suffix == ".js":
            ctype = "application/javascript"
        elif target.suffix == ".json":
            ctype = "application/json"
        self._send(200, target.read_bytes(), ctype)

    def do_POST(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        data = self._read_json()
        if parsed.path == "/api/turn":
            out = apply_turn(
                str(data.get("utterance") or ""),
                approved=bool(data.get("approved")),
                screen_note=str(data.get("screen_note") or ""),
                hive=self.hive,
            )
            self._json(200, out)
            return
        if parsed.path == "/api/bus":
            out = STACK.bus_write(
                phase=data.get("phase"),
                job_status=data.get("job_status"),
                utterance=data.get("utterance"),
                permission_ask=data.get("permission_ask"),
                hive=self.hive,
            )
            self._json(200 if out.get("ok") else 400, out)
            return
        self._json(404, {"ok": False, "error": "no such route"})


def serve(hive: Path = HIVE, port: int = PORT) -> None:
    Handler.hive = hive
    httpd = ThreadingHTTPServer((HOST, port), Handler)
    print(json.dumps({"ok": True, "url": f"http://{HOST}:{port}/voice.html", "bind": HOST}, indent=2))
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        httpd.shutdown()


def main() -> int:
    ap = argparse.ArgumentParser(description="Voice desk for the hive agentic OS")
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("self-test")
    sv = sub.add_parser("serve")
    sv.add_argument("--port", type=int, default=PORT)
    tr = sub.add_parser("turn")
    tr.add_argument("utterance")
    tr.add_argument("--approved", action="store_true")
    args = ap.parse_args()
    if args.cmd == "self-test":
        out = self_test()
        print(json.dumps(out, indent=2))
        return 0 if out.get("ok") else 2
    if args.cmd == "turn":
        print(json.dumps(apply_turn(args.utterance, approved=args.approved), indent=2))
        return 0
    if os.environ.get("VOICE_OS_BIND") == "0.0.0.0":
        print(json.dumps({"ok": False, "error": "0.0.0.0 refused"}), indent=2)
        return 2
    serve(port=args.port)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
