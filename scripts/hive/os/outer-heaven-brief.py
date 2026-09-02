#!/usr/bin/env python3
"""Shared institutional brief for all Grok Bot agents — direct vault/cache read."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / "scripts/hive/os"))

import importlib.util

_vc_path = ROOT / "scripts/hive/os/vault-config.py"
_spec = importlib.util.spec_from_file_location("vault_config", _vc_path)
assert _spec and _spec.loader
vc = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(vc)

SHARED_CONTEXT_PATH = Path.home() / ".grokbot/shared-context.json"
MAX_BRIEF_CHARS = 4500
JOB_CARD_MAX_CHARS = 800
MENTOR_MAX_CHARS = 520
SPEAK_SHEET = (
    ROOT
    / "docs/hive/outer-heaven/CONTENT/topics/saylor-trigger-map.md"
)

# Display name → job-cards filename slug
AGENT_JOB_CARD_SLUG: dict[str, str] = {
    "Big Boss": "big-boss",
    "Day Planner": "day-planner",
    "Watchdog": "watchdog",
    "HITL Operator": "hitl-operator",
    "Money Desk": "money-desk",
    "Lead Hunter": "lead-hunter",
    "Product GTM": "product-gtm",
    "Researcher": "researcher",
    "Forge": "forge",
    "Creative Studio": "creative-studio",
    "Consultant": "consultant",
    "Librarian": "librarian",
    "Wealth Manager": "wealth-manager",
    "Personal CFO": "personal-cfo",
    "Career Strategist": "career-strategist",
    "Communications Manager": "communications-manager",
    "Publishing Engine": "publishing-engine",
}


def _read_tail(path: Path, max_lines: int = 80) -> str:
    if not path.is_file():
        return ""
    lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
    return "\n".join(lines[-max_lines:])


def _extract_section(text: str, heading: str, max_chars: int = 1200) -> str:
    pattern = rf"^## {re.escape(heading)}\s*$"
    m = re.search(pattern, text, re.MULTILINE)
    if not m:
        return ""
    rest = text[m.end() :]
    nxt = re.search(r"^## ", rest, re.MULTILINE)
    body = rest[: nxt.start()] if nxt else rest
    body = body.strip()
    return body[:max_chars] + ("…" if len(body) > max_chars else "")


def _chronicle_summaries(root: Path, n: int = 3) -> list[str]:
    chron_dir = root / "CHRONICLE"
    if not chron_dir.is_dir():
        return []
    files = sorted(chron_dir.glob("*.md"), reverse=True)
    summaries: list[str] = []
    for f in files:
        text = f.read_text(encoding="utf-8", errors="replace")
        for block in re.split(r"\n---\n", text):
            if "## Summary" not in block:
                continue
            sm = re.search(r"## Summary\s*\n\n(.+?)(?:\n## |\Z)", block, re.DOTALL)
            if sm:
                s = sm.group(1).strip().replace("\n", " ")[:280]
                if s:
                    summaries.append(s)
            if len(summaries) >= n:
                return summaries
    return summaries


def _graph_hubs(root: Path, top_n: int = 10) -> list[str]:
    idx = root / ".hive/graph-index.json"
    if not idx.is_file():
        idx = Path(vc.vault_root() or "") / ".hive/graph-index.json"
    if not idx.is_file():
        return []
    try:
        data = json.loads(idx.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return []
    nodes = data.get("nodes") or {}
    scored: list[tuple[int, str]] = []
    for name, meta in nodes.items():
        links = meta.get("links") if isinstance(meta, dict) else []
        score = len(links) if isinstance(links, list) else 0
        scored.append((score, name))
    scored.sort(reverse=True)
    return [name for _, name in scored[:top_n]]


def _cursor_chat_titles(root: Path, n: int = 10) -> list[str]:
    idx = root / "CURSOR_CHATS_INDEX.md"
    if not idx.is_file():
        return []
    titles: list[str] = []
    for line in idx.read_text(encoding="utf-8", errors="replace").splitlines():
        if line.startswith("|") and "title" not in line.lower() and "---" not in line:
            parts = [p.strip() for p in line.split("|") if p.strip()]
            if len(parts) >= 2:
                titles.append(parts[1][:80])
        if len(titles) >= n:
            break
    return titles


def _hunt_stats_lines() -> list[str]:
    script = ROOT / "scripts/hive/hunt-log-stats.py"
    if not script.is_file():
        return []
    try:
        out = subprocess.run(
            [sys.executable, str(script), "--format", "text"],
            capture_output=True,
            text=True,
            timeout=10,
            cwd=str(ROOT),
        )
        if out.returncode != 0:
            return []
        return [ln.strip() for ln in out.stdout.splitlines() if ln.strip()][:6]
    except (subprocess.TimeoutExpired, OSError):
        return []


def _catalog_stats_lines() -> list[str]:
    path = ROOT / "docs/hive/outer-heaven/CONTENT/BUSINESS_CATALOG.json"
    if not path.is_file():
        return []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        stats = data.get("stats") or {}
        return [
            f"catalog total={stats.get('total', '?')} operating={stats.get('operating', '?')} catalog={stats.get('catalog', '?')}"
        ]
    except (json.JSONDecodeError, OSError):
        return []


def _tool_assignment_line(agent: str) -> str:
    path = ROOT / "docs/hive/outer-heaven/CONTENT/AGENT_TOOL_INVENTORY.json"
    if not path.is_file():
        return ""
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return ""
    row = (data.get("agents") or {}).get(agent) or {}
    use = ", ".join((row.get("use") or [])[:8])
    never = ", ".join((row.get("never") or [])[:5])
    if not use:
        return ""
    return f"Use: {use}. Never: {never}."


def _operator_focus_line() -> str:
    path = ROOT / "docs/hive/outer-heaven/CONTENT/OPERATOR_FOCUS.json"
    if not path.is_file():
        return ""
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        icp = data.get("icp_id") or "(none)"
        city = data.get("city") or ""
        factory = data.get("factory") or "process"
        loop = data.get("loop") or []
        loop_s = "→".join(loop) if isinstance(loop, list) else str(loop)
        return (
            f"OPERATOR_FOCUS: factory={factory} loop={loop_s} "
            f"icp_id={icp} city={city} Path C=ProofCheck"
        )
    except (json.JSONDecodeError, OSError):
        return ""


def _product_state_lines() -> list[str]:
    script = ROOT / "scripts/hive/product-state.py"
    if not script.is_file():
        return []
    try:
        out = subprocess.run(
            [sys.executable, str(script), "--list"],
            capture_output=True,
            text=True,
            timeout=15,
            cwd=str(ROOT),
        )
        if out.returncode != 0:
            return []
        return [ln.strip() for ln in out.stdout.splitlines() if ln.strip()][:8]
    except (subprocess.TimeoutExpired, OSError):
        return []


def _capture_freshness(root: Path) -> str:
    p = root / "last-capture.json"
    if not p.is_file():
        p = vc.cache_root() / "last-capture.json"
    if not p.is_file():
        return "unknown"
    try:
        data = json.loads(p.read_text(encoding="utf-8"))
        return str(data.get("timestamp", "unknown"))
    except (json.JSONDecodeError, OSError):
        return "unknown"


def _read_note(root: Path, rel: str, max_chars: int = 3000) -> str:
    rel = rel.lstrip("/")
    for base in (root, vc.cache_root(), vc.vault_outer_heaven() or Path(), vc.REPO_MIRROR):
        if not base or not Path(base).is_dir():
            continue
        path = Path(base) / rel
        if path.is_file():
            text = path.read_text(encoding="utf-8", errors="replace")
            return text[:max_chars] + ("…" if len(text) > max_chars else "")
    return ""


def _speak_rows_for(agent: str, limit: int = 4) -> list[str]:
    """Filter speak-sheet to this desk. Cap 4. No catalog dump."""
    if not SPEAK_SHEET.is_file():
        return []
    needle = (agent or "").lower()
    hits: list[str] = []
    general: list[str] = []
    for line in SPEAK_SHEET.read_text(encoding="utf-8").splitlines():
        if not line.startswith("| ") or line.startswith("| You") or line.startswith("|---"):
            continue
        parts = [p.strip() for p in line.strip("|").split("|")]
        if len(parts) < 3:
            continue
        plain, skill, desk = parts[0], parts[1], parts[2]
        if not plain or plain.startswith("**"):
            continue
        bit = f"{plain} → {skill}"
        if needle and needle in desk.lower():
            hits.append(bit)
        elif "consultant" in desk.lower():
            general.append(bit)
        if len(hits) >= limit:
            return hits[:limit]
    if hits:
        return hits[:limit]
    return general[:limit]


def _mentor_block(agent: str) -> str:
    rows = _speak_rows_for(agent, 4)
    parts = [
        "LIVE this turn: one school, teach, then do. Not an end stamp. LANE first.",
        "Router `saylor-course-skill` · pass `saylor-mentor-pass --live` · beats `saylor-live-beats`.",
    ]
    if rows:
        parts.append("This desk: " + " · ".join(rows))
    block = " ".join(parts)
    if len(block) > MENTOR_MAX_CHARS:
        block = block[: MENTOR_MAX_CHARS - 1] + "…"
    return block


def _job_card_brief(root: Path, agent: str, max_chars: int = JOB_CARD_MAX_CHARS) -> str:
    """Owns/never excerpt from CONTENT/job-cards/{slug}.md for brief injection."""
    slug = AGENT_JOB_CARD_SLUG.get(agent)
    if not slug:
        return ""
    text = _read_note(root, f"CONTENT/job-cards/{slug}.md", max_chars=8000)
    if not text:
        return ""
    own = _extract_section(text, "You own", 380)
    never = _extract_section(text, "You never", 380)
    if not own and not never:
        return ""
    parts = []
    if own:
        parts.append(f"**You own:** {own.replace(chr(10), ' ')}")
    if never:
        parts.append(f"**You never:** {never.replace(chr(10), ' ')}")
    tools = _extract_section(text, "Tools", 280)
    if tools:
        parts.append(f"**Tools:** {tools.replace(chr(10), ' ')}")
    block = " ".join(parts)
    if len(block) > max_chars:
        block = block[: max_chars - 1] + "…"
    return block


def _signal_retrieve_block(prompt: str) -> str:
    """Optional retrieve-when-relevant. Default callers pass nothing → empty."""
    if not (prompt or "").strip():
        return ""
    script = ROOT / "scripts/hive/os/signal-retrieve.py"
    if not script.is_file():
        return ""
    try:
        out = subprocess.run(
            [sys.executable, str(script), "--prompt", prompt],
            capture_output=True,
            text=True,
            timeout=10,
            cwd=str(ROOT),
        )
        if out.returncode != 0:
            return ""
        return (out.stdout or "").strip()
    except (subprocess.TimeoutExpired, OSError):
        return ""


def build_brief(
    *,
    agent: str = "Big Boss",
    project: str = "proofcheck",
    source: str = "auto",
    read_note: str | None = None,
    include_hunt_stats: bool = False,
    signals_prompt: str | None = None,
) -> dict:
    root = vc.read_root(source if source != "auto" else "auto")
    mem_path = root / "OPERATOR_MEMORY.md"
    mem_text = mem_path.read_text(encoding="utf-8", errors="replace") if mem_path.is_file() else ""

    brief: dict = {
        "generatedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "agent": agent,
        "project": project,
        "sourceRoot": str(root),
        "northStars": _extract_section(mem_text, "Four north stars", 900),
        "decisions": _extract_section(mem_text, "DECISIONS (seeded)", 600),
        "goals": _extract_section(mem_text, "GOALS (seeded)", 600),
        "chronicleRecent": _chronicle_summaries(root, 3),
        "graphHubs": _graph_hubs(root, 10),
        "recentCursorChats": _cursor_chat_titles(root, 10),
        "productState": _product_state_lines(),
        "huntStats": _hunt_stats_lines() if include_hunt_stats or agent in ("Big Boss", "Lead Hunter") else [],
        "catalogStats": _catalog_stats_lines(),
        "operatorFocus": _operator_focus_line(),
        "captureFreshness": _capture_freshness(root),
        "vaultAccess": vc.vault_access_card(),
        "vaultResolve": vc.resolve_vault(),
    }
    if read_note:
        brief["noteExcerpt"] = _read_note(root, read_note)

    job_card = _job_card_brief(root, agent)
    brief["jobCard"] = job_card
    brief["mentor"] = _mentor_block(agent)
    brief["toolAssignment"] = _tool_assignment_line(agent)

    md_parts = [
        f"# Outer Heaven brief — {agent}",
        f"Project: {project} | Source: {root}",
        f"Capture: {brief['captureFreshness']}",
        "",
    ]
    if job_card:
        md_parts.extend(["## Job card", job_card, ""])
    if brief.get("mentor"):
        md_parts.extend(["## Mentor (1–3, do not dump)", brief["mentor"], ""])
    if brief.get("toolAssignment"):
        md_parts.extend(["## Tools", brief["toolAssignment"], ""])
    if brief.get("vaultAccess"):
        md_parts.extend(["## Vault (Mac closed)", brief["vaultAccess"], ""])
    md_parts.extend(
        [
            "## North stars",
            brief["northStars"] or "(see OPERATOR_MEMORY.md)",
            "",
            "## Recent chronicle",
        ]
    )
    for s in brief["chronicleRecent"]:
        md_parts.append(f"- {s}")
    if not brief["chronicleRecent"]:
        md_parts.append("- (none indexed)")
    md_parts.extend(["", "## Graph hubs", ", ".join(brief["graphHubs"]) or "(no index)", ""])
    md_parts.extend(["## Recent Cursor chats"])
    for t in brief["recentCursorChats"]:
        md_parts.append(f"- {t}")
    md_parts.extend(["", "## Product state"])
    for ln in brief["productState"]:
        md_parts.append(f"- {ln}")
    if brief.get("operatorFocus"):
        md_parts.extend(["", "## Operator focus", brief["operatorFocus"]])
    if brief.get("catalogStats"):
        md_parts.extend(["", "## Catalog"])
        for ln in brief["catalogStats"]:
            md_parts.append(f"- {ln}")
    if brief.get("huntStats"):
        md_parts.extend(["", "## Hunt pipeline"])
        for ln in brief["huntStats"]:
            md_parts.append(f"- {ln}")
    if read_note and brief.get("noteExcerpt"):
        md_parts.extend(["", f"## Note: {read_note}", brief["noteExcerpt"]])
    if signals_prompt:
        sig = _signal_retrieve_block(signals_prompt)
        brief["signals"] = sig
        if sig:
            md_parts.extend(["", "## Signals (retrieve-when-relevant)", sig])

    markdown = "\n".join(md_parts)
    if len(markdown) > MAX_BRIEF_CHARS:
        markdown = markdown[: MAX_BRIEF_CHARS - 1] + "…"
    brief["markdown"] = markdown
    brief["hash"] = hashlib.sha256(markdown.encode()).hexdigest()[:16]
    return brief


def publish_shared_context(brief: dict) -> Path:
    SHARED_CONTEXT_PATH.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "timestamp": brief["generatedAt"],
        "hash": brief["hash"],
        "agent": brief["agent"],
        "sourceRoot": brief["sourceRoot"],
        "captureFreshness": brief["captureFreshness"],
        "markdown": brief["markdown"],
    }
    SHARED_CONTEXT_PATH.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    cache_brief = vc.cache_root() / "brief.json"
    cache_brief.write_text(json.dumps(brief, indent=2) + "\n", encoding="utf-8")
    return SHARED_CONTEXT_PATH


def fetch_vps_brief() -> str:
    host = "root@69.62.66.78"
    cmd = (
        "OUTER_HEAVEN_MIRROR=/root/My_Billion_Dollar_Vault/00_Outer_Heaven "
        "bash /root/domain-paths/n8n-cursor/scripts/hive/outer-heaven/vps-outer-heaven-brief.sh"
    )
    try:
        out = subprocess.run(
            ["ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=10", host, cmd],
            capture_output=True,
            text=True,
            timeout=30,
        )
        if out.returncode == 0 and out.stdout.strip():
            return out.stdout.strip()
    except (subprocess.TimeoutExpired, OSError):
        pass
    mirror = vc.cache_root() / "brief.json"
    if mirror.is_file():
        try:
            data = json.loads(mirror.read_text(encoding="utf-8"))
            return data.get("markdown", "")
        except json.JSONDecodeError:
            pass
    return ""


def self_test() -> list[str]:
    errors: list[str] = []
    b = build_brief(agent="Watchdog")
    if not b.get("markdown"):
        errors.append("empty markdown brief")
    if not b.get("hash"):
        errors.append("missing brief hash")
    if b.get("signals") or "## Signals (retrieve-when-relevant)" in (b.get("markdown") or ""):
        errors.append("default brief dumped signals (must stay off)")
    if "saylor-mentor-pass" not in (b.get("markdown") or ""):
        errors.append("brief missing mentor bind")
    if "LIVE this turn" not in (b.get("markdown") or ""):
        errors.append("brief mentor is still an end stamp")
    c = build_brief(agent="Consultant")
    if "saylor-course-skill" not in (c.get("markdown") or ""):
        errors.append("Consultant brief missing course-skill router")
    if (c.get("markdown") or "").count("`") > 40:
        errors.append("Consultant brief looks like a catalog dump")
    cr = vc.cache_root()
    if not cr.is_dir():
        errors.append("cache root missing")
    return errors


def main() -> int:
    ap = argparse.ArgumentParser(description="Outer Heaven shared brief for Grok agents")
    ap.add_argument("--agent", default="Big Boss")
    ap.add_argument("--project", default="proofcheck")
    ap.add_argument("--source", default="auto", choices=["auto", "cache", "vault", "mirror", "vps"])
    ap.add_argument("--read", metavar="REL_PATH", help="Optional vault-relative note to include")
    ap.add_argument("--format", default="markdown", choices=["markdown", "json"])
    ap.add_argument("--hunt-stats", action="store_true", help="Include hunt-log-stats in brief")
    ap.add_argument(
        "--signals",
        action="store_true",
        help="Include ≤3 signal refs when --prompt is set (default off; not every brief)",
    )
    ap.add_argument(
        "--prompt",
        default="",
        help="Operator prompt for --signals retrieve (ignored unless --signals)",
    )
    ap.add_argument("--publish", action="store_true", help="Write ~/.grokbot/shared-context.json")
    ap.add_argument("--self-test", action="store_true")
    args = ap.parse_args()

    if args.self_test:
        errs = self_test()
        if errs:
            print("FAIL:", "; ".join(errs), file=sys.stderr)
            return 1
        print("OK: outer-heaven-brief self-test")
        return 0

    if args.source == "vps":
        text = fetch_vps_brief()
        if not text:
            print("VPS brief unavailable; falling back to local", file=sys.stderr)
            brief = build_brief(
                agent=args.agent,
                project=args.project,
                read_note=args.read,
                include_hunt_stats=args.hunt_stats,
                signals_prompt=(args.prompt if args.signals else None),
            )
        else:
            print(text)
            return 0
    else:
        brief = build_brief(
            agent=args.agent,
            project=args.project,
            source=args.source,
            read_note=args.read,
            include_hunt_stats=args.hunt_stats,
            signals_prompt=(args.prompt if args.signals else None),
        )

    if args.publish:
        path = publish_shared_context(brief)
        print(f"published {path}", file=sys.stderr)

    if args.format == "json":
        print(json.dumps(brief, indent=2))
    else:
        print(brief["markdown"])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
