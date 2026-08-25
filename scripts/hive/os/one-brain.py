#!/usr/bin/env python3
"""One brain: shared truth + thin handoff across Cursor and desks.

wake     read hot.md + latest emit + yellow jobs + last chat titles
close    write a sitting handoff (or a sessionEnd receipt)
hot      write the last-keep card only
status   compact wake
capture  run the existing Mac capture cycle (local only)
automation
         print the Cursor Automation spec (create in the UI)
self-test

Not a transcript dump. Cloud Agents cannot see ~/.cursor; they join
after close-desk capture writes the vault they can clone.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import os
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[3]
CFG_PATH = Path(__file__).resolve().parent / "one-brain.json"
UQ_RE = re.compile(r"<user_query>(.*?)</user_query>", re.S)

_vc_path = Path(__file__).resolve().parent / "vault-config.py"
_spec = importlib.util.spec_from_file_location("vault_config", _vc_path)
assert _spec and _spec.loader
vc = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(vc)


def load_cfg() -> dict[str, Any]:
    return json.loads(CFG_PATH.read_text(encoding="utf-8"))


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def today() -> str:
    return datetime.now().strftime("%Y-%m-%d")


def os_root(explicit: Path | None = None) -> Path:
    if explicit is not None:
        explicit.mkdir(parents=True, exist_ok=True)
        return explicit
    env = os.environ.get("ONE_BRAIN_OS", "").strip()
    if env:
        p = Path(env).expanduser()
        p.mkdir(parents=True, exist_ok=True)
        return p
    cache = vc.cache_root() / "CONTENT" / "os"
    if cache.is_dir() or os.environ.get("OUTER_HEAVEN_CACHE"):
        cache.mkdir(parents=True, exist_ok=True)
        return cache
    voh = vc.vault_outer_heaven()
    if voh:
        root = voh / "CONTENT" / "os"
        root.mkdir(parents=True, exist_ok=True)
        return root
    repo = ROOT / "docs/hive/outer-heaven/CONTENT/os"
    repo.mkdir(parents=True, exist_ok=True)
    return repo


def _read_text(path: Path) -> str:
    if not path.is_file():
        return ""
    return path.read_text(encoding="utf-8", errors="replace")


def _read_json(path: Path, default: Any) -> Any:
    if not path.is_file():
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return default


def load_latest(root: Path) -> dict[str, Any]:
    data = _read_json(root / "latest.json", {})
    if not isinstance(data, dict):
        return {}
    return data


def save_latest(root: Path, data: dict[str, Any]) -> None:
    data["at"] = now_iso()
    path = root / "latest.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def hot_bullets(root: Path, max_chars: int) -> list[str]:
    text = _read_text(root / "hot.md")
    bullets = [ln[2:].strip() for ln in text.splitlines() if ln.startswith("- ")]
    out: list[str] = []
    used = 0
    for b in bullets:
        if used + len(b) + 1 > max_chars:
            break
        out.append(b)
        used += len(b) + 1
    return out


def yellow_jobs(root: Path) -> list[str]:
    jobs_path = root / "jobs.json"
    if not jobs_path.is_file():
        jobs_path = ROOT / "docs/hive/outer-heaven/CONTENT/os/jobs.json"
    data = _read_json(jobs_path, {})
    rows = data.get("jobs") if isinstance(data, dict) else data
    names: list[str] = []
    for row in rows or []:
        if not isinstance(row, dict):
            continue
        if row.get("state") in ("yellow", "waiting"):
            names.append(str(row.get("name") or "unnamed"))
    return names[:8]


def first_ask(path: Path, limit: int) -> str:
    try:
        with path.open(encoding="utf-8", errors="replace") as fh:
            for line in fh:
                try:
                    event = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if event.get("role") != "user":
                    continue
                content = event.get("message", {}).get("content")
                texts: list[str] = []
                if isinstance(content, str):
                    texts.append(content)
                elif isinstance(content, list):
                    for part in content:
                        if isinstance(part, dict) and part.get("type") == "text":
                            texts.append(str(part.get("text") or ""))
                blob = "\n".join(texts)
                match = UQ_RE.search(blob)
                ask = (match.group(1) if match else blob).strip()
                ask = re.sub(r"\s+", " ", ask)
                if ask:
                    return ask[:limit]
    except OSError:
        return ""
    return ""


def list_chats(limit: int, ask_chars: int, chats_root: Path | None = None) -> list[dict[str, str]]:
    if chats_root is not None:
        root = chats_root
    else:
        env = os.environ.get("ONE_BRAIN_CHATS", "").strip()
        root = Path(env).expanduser() if env else Path.home() / ".cursor/projects"
    if not root.is_dir():
        return []
    files: list[Path] = []
    for proj in root.iterdir():
        transcripts = proj / "agent-transcripts"
        if not transcripts.is_dir():
            continue
        for session in transcripts.iterdir():
            top = session / f"{session.name}.jsonl"
            if top.is_file():
                files.append(top)
    files.sort(key=lambda p: p.stat().st_mtime, reverse=True)
    rows: list[dict[str, str]] = []
    for path in files[:limit]:
        rows.append(
            {
                "id": path.parent.name[:12],
                "ask": first_ask(path, ask_chars),
            }
        )
    return rows


def last_receipts(root: Path, n: int = 8) -> list[dict[str, Any]]:
    path = root / load_cfg()["sessions_file"]
    if not path.is_file():
        return []
    rows: list[dict[str, Any]] = []
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        if not line.strip():
            continue
        try:
            rec = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(rec, dict):
            rows.append(rec)
    return rows[-n:]


def previous_sitting_yellow(root: Path) -> str:
    recs = last_receipts(root, 1)
    if not recs:
        return ""
    last = recs[-1]
    if last.get("emitted"):
        return ""
    if last.get("kind") == "receipt" and not last.get("emitted"):
        return f"previous sitting {last.get('session_id') or '?'} closed without handoff"
    return ""


def collect_wake(
    root: Path,
    chats_root: Path | None = None,
    include_chats: bool = True,
) -> dict[str, Any]:
    cfg = load_cfg()
    latest = load_latest(root)
    card = {
        "store": str(root),
        "hot": hot_bullets(root, int(cfg["hot_max_chars"])),
        "last_emit": latest.get("last_emit") or "",
        "last_emit_at": latest.get("at") or "",
        "yellow_jobs": yellow_jobs(root),
        "chats": list_chats(int(cfg["chat_list_limit"]), int(cfg["ask_chars"]), chats_root)
        if include_chats
        else [],
        "previous_gap": previous_sitting_yellow(root),
        "at": now_iso(),
    }
    return card


def format_card(card: dict[str, Any], max_chars: int) -> str:
    lines = [
        "ONE BRAIN — shared truth + thin handoff. Not a transcript dump.",
        f"STORE: {card.get('store')}",
    ]
    hot = card.get("hot") or []
    if hot:
        lines.append("HOT:")
        lines.extend(f"- {b}" for b in hot)
    else:
        lines.append("HOT: (empty — no sitting has emitted yet)")
    emit = card.get("last_emit") or "none"
    when = card.get("last_emit_at") or ""
    lines.append(f"LAST-EMIT: {emit}" + (f" · {when}" if when else ""))
    jobs = card.get("yellow_jobs") or []
    lines.append("YELLOW: " + (", ".join(jobs) if jobs else "none"))
    gap = card.get("previous_gap") or ""
    if gap:
        lines.append(f"GAP: {gap}")
    chats = card.get("chats") or []
    if chats:
        lines.append("CHATS (titles only — fetch one with --id if named):")
        for row in chats:
            ask = row.get("ask") or "(no ask)"
            lines.append(f"- {row.get('id')} · {ask}")
    lines.append("NEXT: work the bite. Close with `one-brain.py close --title … --item …`.")
    lines.append("NEVER: dump JSONL · send/pay/deploy/book/publish.")
    text = "\n".join(lines)
    if len(text) > max_chars:
        text = text[: max_chars - 1].rstrip() + "…"
    return text


def append_receipt(root: Path, rec: dict[str, Any]) -> Path:
    path = root / load_cfg()["sessions_file"]
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(rec, ensure_ascii=False) + "\n")
    return path


def write_hot(root: Path, lines: list[str]) -> Path:
    cfg = load_cfg()
    bullets = [f"- {ln}" for ln in lines if ln]
    while bullets and sum(len(b) + 1 for b in bullets) > int(cfg["hot_max_chars"]):
        bullets.pop()
    body = "\n".join(
        [
            "---",
            "tags: [os]",
            "---",
            "",
            "# hot",
            "",
            "#os",
            "",
            "> [!tip] Read me first",
            "> Latest state. If this answers it, do not crawl the wiki.",
            "",
            *bullets,
            "",
        ]
    )
    path = root / "hot.md"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(body.rstrip() + "\n", encoding="utf-8")
    return path


def write_inbox(root: Path, rec: dict[str, Any]) -> Path:
    inbox = root / "inbox"
    inbox.mkdir(parents=True, exist_ok=True)
    n = 1
    while True:
        path = inbox / f"{rec['date']}-{rec['skill']}-{n}.md"
        if not path.exists():
            break
        n += 1
    items = rec.get("items") or []
    body = [
        "---",
        f"kind: {rec['kind']}",
        f"skill: {rec['skill']}",
        f"desk: {rec['desk']}",
        f"host: {rec['host']}",
        f"at: {rec['at']}",
        f"date: {rec['date']}",
        "---",
        "",
        f"# {rec['title']}",
        "",
    ]
    if rec.get("text"):
        body += [str(rec["text"]), ""]
    if items:
        body += ["## ITEMS", ""]
        body += [f"- {it}" for it in items]
        body.append("")
    path.write_text("\n".join(body), encoding="utf-8")
    return path


def emit_builtin(root: Path, rec: dict[str, Any]) -> dict[str, str]:
    rec = dict(rec)
    rec["at"] = rec.get("at") or now_iso()
    rec["date"] = rec.get("date") or today()
    inbox = write_inbox(root, rec)
    latest = load_latest(root)
    latest["last_emit"] = f"inbox/{inbox.name}"
    latest["daily"] = f"daily/{rec['date']}.md"
    inbox_list = latest.setdefault("inbox", [])
    if isinstance(inbox_list, list):
        inbox_list.insert(0, f"inbox/{inbox.name}")
        latest["inbox"] = inbox_list[:20]
    save_latest(root, latest)
    write_hot(
        root,
        [
            f"{rec['at']} · {rec['desk']} emitted `{rec['skill']}` — {rec['title']}",
            (rec.get("items") or [rec.get("text") or ""])[0][:120],
        ],
    )
    return {"inbox": str(inbox), "via": "builtin"}


def emit_handoff(root: Path, rec: dict[str, Any]) -> dict[str, str]:
    hive = Path(__file__).resolve().parent / "emit-vault-receive.py"
    if hive.is_file() and not os.environ.get("ONE_BRAIN_OS"):
        cmd = [
            sys.executable,
            str(hive),
            "--desk",
            rec["desk"],
            "--skill",
            rec["skill"],
            "--kind",
            rec["kind"],
            "--title",
            rec["title"],
            "--host",
            rec["host"],
        ]
        if rec.get("text"):
            cmd += ["--text", rec["text"]]
        for item in rec.get("items") or []:
            cmd += ["--item", item]
        proc = subprocess.run(cmd, cwd=str(ROOT), capture_output=True, text=True)
        if proc.returncode == 0:
            return {"inbox": proc.stdout.strip() or "emit-vault-receive", "via": "hive"}
    return emit_builtin(root, rec)


def cmd_wake(args: argparse.Namespace) -> int:
    cfg = load_cfg()
    root = os_root(Path(args.os_root) if args.os_root else None)
    chats_root = Path(args.chats_root) if args.chats_root else None
    card = collect_wake(root, chats_root=chats_root, include_chats=not args.no_chats)
    text = format_card(card, int(cfg["context_max_chars"]))
    if args.hook:
        hook_in = _hook_stdin()
        session_id = str(hook_in.get("session_id") or "")
        env = {"HIVE_ONE_BRAIN_SESSION": session_id} if session_id else {}
        print(json.dumps({"env": env, "additional_context": text}))
        return 0
    if args.json:
        print(json.dumps({"card": card, "text": text}, indent=2))
        return 0
    print(text)
    return 0


def _hook_stdin() -> dict[str, Any]:
    raw = sys.stdin.read() if not sys.stdin.isatty() else ""
    if not raw.strip():
        return {}
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return {}
    return data if isinstance(data, dict) else {}


def cmd_close(args: argparse.Namespace) -> int:
    cfg = load_cfg()
    root = os_root(Path(args.os_root) if args.os_root else None)
    hook_in = _hook_stdin() if args.hook else {}
    session_id = args.session_id or hook_in.get("session_id") or os.environ.get(
        "HIVE_ONE_BRAIN_SESSION", ""
    )
    if args.hook and not args.title:
        rec = {
            "kind": "receipt",
            "at": now_iso(),
            "session_id": session_id,
            "reason": hook_in.get("reason") or "completed",
            "duration_ms": hook_in.get("duration_ms"),
            "emitted": False,
            "host": args.host,
        }
        path = append_receipt(root, rec)
        print(json.dumps({"receipt": str(path), "emitted": False, "session_id": session_id}))
        return 0
    if not args.title:
        raise SystemExit("close requires --title --item (or --hook for a receipt only)")
    items = list(args.items or [])
    rec = {
        "kind": args.kind or cfg["default_close_kind"],
        "skill": args.skill or cfg["default_close_skill"],
        "desk": args.desk,
        "host": args.host,
        "title": args.title,
        "text": args.text or "",
        "items": items,
    }
    wrote = emit_handoff(root, rec)
    append_receipt(
        root,
        {
            "kind": "handoff",
            "at": now_iso(),
            "session_id": session_id,
            "emitted": True,
            "title": args.title,
            "inbox": wrote.get("inbox"),
            "via": wrote.get("via"),
            "host": args.host,
        },
    )
    print(json.dumps({**wrote, "session_id": session_id}, indent=2))
    return 0


def cmd_hot(args: argparse.Namespace) -> int:
    root = os_root(Path(args.os_root) if args.os_root else None)
    keep = args.keep.strip() if args.keep else "none-this-session"
    path = write_hot(
        root,
        [
            f"date: {today()}",
            f"keep: {keep}",
            f"path: {args.path or ''}".rstrip(),
            f"why: {args.why or 'operator keep'}".rstrip(),
        ],
    )
    print(json.dumps({"hot": str(path), "keep": keep}))
    return 0


def cmd_capture() -> int:
    script = ROOT / "scripts/hive/outer-heaven/run-capture-cycle.sh"
    if not script.is_file():
        raise SystemExit("run-capture-cycle.sh missing — Mac capture is not in this clone")
    print("Running local capture cycle (Mac transcripts → CURSOR_CHATS). HITL: no push.", file=sys.stderr)
    return subprocess.call(["bash", str(script)], cwd=str(ROOT))


def cmd_automation() -> int:
    cfg = load_cfg()
    spec = {
        "name": "One brain — weekday morning consume",
        "create": "https://cursor.com/automations/new",
        "trigger": {
            "type": "cron",
            "expression": cfg["morning_cron"],
            "timezone": cfg["morning_tz"],
            "note": "Weekdays 07:00 America/New_York. After last night's close-desk, before first sitting.",
        },
        "repo": "snevemoney/n8n-cursor",
        "tools": {
            "pull_request_creation": False,
            "send_to_slack": False,
            "computer_use": False,
        },
        "prompt": (
            "You are the morning consume of the one-brain machine.\n"
            "1. Run: python3 scripts/hive/os/one-brain.py wake --no-chats\n"
            "   (Cloud Agents cannot see ~/.cursor on the Mac. Do not dump transcripts.)\n"
            "2. Report the card only: HOT, LAST-EMIT, YELLOW, GAP.\n"
            "3. If GAP says a sitting closed without handoff, list that as WAITING ON EVEN.\n"
            "4. Do not open a PR. Do not send, pay, deploy, book, or publish.\n"
            "5. If wake fails, write the error and stop.\n"
            "Close-desk capture is local Mac only: python3 scripts/hive/os/one-brain.py capture\n"
            "after the last sitting, laptop still on. Do not schedule that here."
        ),
        "also_create_local": {
            "sessionStart": ".cursor/hooks/one-brain-start.sh",
            "sessionEnd": ".cursor/hooks/one-brain-stop.sh",
            "close": "python3 scripts/hive/os/one-brain.py close --title '…' --item '…'",
        },
        "never": cfg["never"],
    }
    print(json.dumps(spec, indent=2))
    return 0


def cmd_self_test() -> int:
    import tempfile
    import unittest

    class OneBrainSelfTest(unittest.TestCase):
        def setUp(self) -> None:
            self.td = tempfile.TemporaryDirectory()
            self.root = Path(self.td.name) / "os"
            self.chats = Path(self.td.name) / "projects"
            self.root.mkdir(parents=True)
            os.environ["ONE_BRAIN_OS"] = str(self.root)

        def tearDown(self) -> None:
            os.environ.pop("ONE_BRAIN_OS", None)
            self.td.cleanup()

        def test_wake_empty(self) -> None:
            card = collect_wake(self.root, chats_root=self.chats)
            text = format_card(card, 1800)
            self.assertIn("ONE BRAIN", text)
            self.assertIn("HOT: (empty", text)
            self.assertNotIn(".jsonl", text)

        def test_close_then_wake(self) -> None:
            emit_builtin(
                self.root,
                {
                    "kind": "activity",
                    "skill": "said",
                    "desk": "forge",
                    "host": "cursor",
                    "title": "one brain wired",
                    "items": ["session start reads hot.md"],
                },
            )
            card = collect_wake(self.root, chats_root=self.chats)
            self.assertTrue(card["hot"])
            self.assertIn("inbox/", card["last_emit"])
            self.assertIn("one brain wired", format_card(card, 1800))

        def test_receipt_gap(self) -> None:
            append_receipt(
                self.root,
                {
                    "kind": "receipt",
                    "session_id": "abc",
                    "emitted": False,
                    "at": now_iso(),
                },
            )
            card = collect_wake(self.root, chats_root=self.chats, include_chats=False)
            self.assertIn("closed without handoff", card["previous_gap"])

        def test_chat_titles_only(self) -> None:
            sess = self.chats / "demo" / "agent-transcripts" / "sid-1"
            sess.mkdir(parents=True)
            (sess / "sid-1.jsonl").write_text(
                json.dumps(
                    {
                        "role": "user",
                        "message": {
                            "content": [{"type": "text", "text": "<user_query>secret dump</user_query>"}]
                        },
                    }
                )
                + "\n"
                + "THIS IS THE FULL TRANSCRIPT BODY\n",
                encoding="utf-8",
            )
            rows = list_chats(5, 80, self.chats)
            self.assertEqual(rows[0]["ask"], "secret dump")
            text = format_card(collect_wake(self.root, chats_root=self.chats), 1800)
            self.assertNotIn("FULL TRANSCRIPT BODY", text)

    suite = unittest.defaultTestLoader.loadTestsFromTestCase(OneBrainSelfTest)
    result = unittest.TextTestRunner(verbosity=1).run(suite)
    print(json.dumps({"self_test": "pass" if result.wasSuccessful() else "fail", "tests": result.testsRun}))
    return 0 if result.wasSuccessful() else 1


def build_parser() -> argparse.ArgumentParser:
    cfg = load_cfg()
    ap = argparse.ArgumentParser(description="One brain: shared truth + thin handoff")
    sub = ap.add_subparsers(dest="cmd", required=True)
    wake = sub.add_parser("wake", help="Read the shared card (hot + last emit + titles)")
    wake.add_argument("--hook", action="store_true", help="sessionStart JSON in / JSON out")
    wake.add_argument("--json", action="store_true")
    wake.add_argument("--no-chats", action="store_true")
    wake.add_argument("--os-root")
    wake.add_argument("--chats-root")
    close = sub.add_parser("close", help="Write the sitting handoff or a sessionEnd receipt")
    close.add_argument("--hook", action="store_true", help="sessionEnd JSON in")
    close.add_argument("--title")
    close.add_argument("--item", action="append", dest="items", default=[])
    close.add_argument("--text", default="")
    close.add_argument("--skill", default=cfg["default_close_skill"])
    close.add_argument("--kind", default=cfg["default_close_kind"])
    close.add_argument("--desk", default="forge")
    close.add_argument("--host", default="cursor", choices=("cursor", "grok", "cloud"))
    close.add_argument("--session-id", dest="session_id")
    close.add_argument("--os-root")
    hot = sub.add_parser("hot", help="Write last-keep only")
    hot.add_argument("--keep", default="")
    hot.add_argument("--path", default="")
    hot.add_argument("--why", default="")
    hot.add_argument("--os-root")
    sub.add_parser("status", help="Alias of wake")
    sub.add_parser("capture", help="Run local Mac capture cycle")
    sub.add_parser("automation", help="Print Cursor Automation spec")
    sub.add_parser("self-test", help="Isolated unit tests")
    return ap


def main() -> int:
    ap = build_parser()
    args = ap.parse_args()
    if args.cmd in ("wake", "status"):
        if args.cmd == "status":
            args.hook = False
            args.json = False
            args.no_chats = False
            args.os_root = None
            args.chats_root = None
        return cmd_wake(args)
    if args.cmd == "close":
        return cmd_close(args)
    if args.cmd == "hot":
        return cmd_hot(args)
    if args.cmd == "capture":
        return cmd_capture()
    if args.cmd == "automation":
        return cmd_automation()
    return cmd_self_test()


if __name__ == "__main__":
    raise SystemExit(main())
