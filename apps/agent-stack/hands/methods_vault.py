"""Markdown-vault cores (X02, X04, X05, X13, X17, X31, X36, X37, X38).

All functions take an explicit root. They read a vault and write only under roots the
caller owns (never the human vault by default). No network, no scheduler.
"""
from __future__ import annotations

import math
import os
import re
import tarfile
from collections import Counter
from datetime import date, datetime, timedelta
from pathlib import Path

try:
    from . import project_methods as pm
except ImportError:
    import project_methods as pm

WORD = re.compile(r"[a-z0-9]{2,}")
LINK = re.compile(r"\[\[([^\]|#]+)")
ROUTE = re.compile(r"^-\s*([^:\[\]]+?)\s*:\s*\[\[([^\]]+)\]\]\s*$", re.M)


def notes(root):
    return sorted(p for p in Path(root).rglob("*.md") if not any(s.startswith(".") for s in p.relative_to(root).parts))


def frontmatter(text):
    m = re.match(r"---\n(.*?)\n---\n", text, re.S)
    out = {}
    for line in (m.group(1).splitlines() if m else []):
        key, sep, val = line.partition(":")
        if sep:
            out[key.strip()] = val.strip()
    return out


def target(root, name):
    p = Path(root) / (name if name.endswith(".md") else name + ".md")
    return p if p.is_file() and Path(root).resolve() in p.resolve().parents else None


# ---- X17: local search over the vault (qmd-style, TF-IDF) -------------------------------
def search(root, query, k=5):
    docs = {p: Counter(WORD.findall(p.read_text(errors="ignore").lower())) for p in notes(root)}
    q = WORD.findall(query.lower())
    if not q:
        raise ValueError("Give a search term")
    df = {t: sum(1 for c in docs.values() if t in c) for t in q}
    scored = [(sum(c[t] * (1 + math.log((1 + len(docs)) / (1 + df[t]))) for t in q), p) for p, c in docs.items()]
    return [{"note": str(p.relative_to(root)), "score": round(s, 3)} for s, p in sorted(scored, key=lambda x: (-x[0], str(x[1]))) if s > 0][:k]


# ---- X02: routing probes ------------------------------------------------------------------
def declared_routes(index_text):
    return {m.group(1).strip().lower(): m.group(2).strip() for m in ROUTE.finditer(index_text)}


def resolve(routes, question):
    q = set(WORD.findall(question.lower()))
    best = max(routes.items(), key=lambda kv: len(q & set(WORD.findall(kv[0]))), default=None)
    return best[1] if best and q & set(WORD.findall(best[0])) else None


def routing_probe(root, index_name, questions):
    """questions: {question: expected target}. Passes only when a declared route resolves to it and it exists."""
    idx = target(root, index_name)
    if idx is None:
        raise ValueError("Index file not found")
    routes = declared_routes(idx.read_text())
    rows = [{"question": q, "resolved": (got := resolve(routes, q)), "expected": want,
             "pass": got == want and target(root, want) is not None} for q, want in questions.items()]
    return {"rows": rows, "passed": sum(r["pass"] for r in rows), "total": len(rows), "ok": all(r["pass"] for r in rows)}


# ---- X04: link = smallest routing edit + read-back walk ---------------------------------------
def link(root, index_name, topic, name):
    idx, dest = target(root, index_name), target(root, name)
    if idx is None or dest is None:
        raise ValueError("Index and target must both exist")
    line = f"- {pm.clean_text(topic)}: [[{name}]]"
    text = idx.read_text()
    if line in text:
        return {"added": False, "line": line}
    idx.write_text(text.rstrip("\n") + "\n" + line + "\n")  # one appended line, nothing else touched
    return {"added": True, "line": line}


def walk(root, manual, index_name, question):
    """manual -> index -> target read-back; fails at the first broken hop."""
    man, idx = target(root, manual), target(root, index_name)
    if man is None or index_name not in LINK.findall(man.read_text()):
        return {"ok": False, "broke_at": "manual->index"}
    dest = resolve(declared_routes(idx.read_text()), question) if idx else None
    if dest is None:
        return {"ok": False, "broke_at": "index->target"}
    if target(root, dest) is None:
        return {"ok": False, "broke_at": "target missing"}
    return {"ok": True, "chain": [manual, index_name, dest]}


# ---- X05: three usefulness tests ----------------------------------------------------------------
def usefulness(root, answer, switches_before, switches_after, decision_phrase):
    cites = LINK.findall(answer)
    t1 = bool(cites) and all(target(root, c) for c in cites)
    t2 = switches_after < switches_before
    t3 = any(frontmatter(p.read_text()).get("type") == "decision" and decision_phrase.lower() in p.read_text().lower() for p in notes(root))
    return {"teammate_answer_with_sources": t1, "fewer_app_switches": t2, "recalls_decision": t3, "all": t1 and t2 and t3}


# ---- X13: daily compile with stale + contradiction flags + morning brief ---------------------------------
def daily_compile(root, now, stale_days=14):
    stale, conflicts = [], []
    for p in notes(root):
        text = p.read_text(errors="ignore")
        raw = frontmatter(text).get("updated")
        try:
            updated = date.fromisoformat(raw) if raw else datetime.fromtimestamp(p.stat().st_mtime).date()
        except ValueError:
            updated = datetime.fromtimestamp(p.stat().st_mtime).date()
        if (now - updated).days > stale_days:
            stale.append(str(p.relative_to(root)))
        conflicts += [(str(p.relative_to(root)), c) for c in re.findall(r"contradicts:\s*\[\[([^\]]+)\]\]", text)]
    brief = f"{len(stale)} notes older than {stale_days} days; {len(conflicts)} flagged contradictions."
    return {"stale": stale, "conflicts": conflicts, "brief": brief}


# ---- X31: shared memory any agent or model reads ----------------------------------------------------------
def remember(root, agent, topic, text):
    path = pm.child(Path(root), "memory", pm.slug(topic) + ".md")
    path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    with open(path, "a", encoding="utf-8") as f:
        f.write(f"- [{pm.slug(agent)}] {pm.clean_text(text)}\n")
    return str(path)


def recall(root, topic):
    path = pm.child(Path(root), "memory", pm.slug(topic) + ".md")
    return path.read_text().splitlines() if path.is_file() else []


# ---- X36: morning recap + "#1 thing to automate" -------------------------------------------------------------
def todo_recap(root):
    items = [(str(p.relative_to(root)), m) for p in notes(root) for m in re.findall(r"^- \[ \] (.+)$", p.read_text(errors="ignore"), re.M)]
    return {"open": items, "spoken": f"{len(items)} open items." + (f" First: {items[0][1]}." if items else "")}


def top_automation(candidates):
    """candidates: [{'task', 'times_per_week', 'minutes'}] supplied by the owner; ranks by weekly minutes."""
    ranked = sorted(candidates, key=lambda c: -c["times_per_week"] * c["minutes"])
    if not ranked:
        raise ValueError("Give at least one recurring task")
    top = ranked[0]
    return {"top": top["task"], "weekly_minutes": top["times_per_week"] * top["minutes"],
            "guide": [f"Write the steps of '{top['task']}' once", "Mark which step needs a human", "Draft the automation and test it on one run"]}


# ---- X37: daily AI-news note feeds content ideas ----------------------------------------------------------------------
def news_note(root, day, items):
    """items: [{'title','url','line'}]. Fetching is out of scope; each item must carry its source."""
    if not items:
        raise ValueError("No items")
    rows = []
    for it in items:
        if not re.match(r"https://", it.get("url", "")):
            raise ValueError("Every news item needs an https source")
        rows.append(f"- {pm.clean_text(it['title'])} ({it['url']}): {pm.clean_text(it['line'])}")
    path = pm.child(Path(root), "ai-news-" + day + ".md")
    pm.write_new(path, f"---\ntype: news\nupdated: {day}\n---\n" + "\n".join(rows) + "\n")
    return str(path)


def ideas_from(note_text):
    return [m.group(1) for m in re.finditer(r"^- (.+?) \(https://", note_text, re.M)]


# ---- X38: vault hygiene -------------------------------------------------------------------------------------------------
def backup_due(last, now, soon_days=30, overdue_days=90):
    age = (now - last).days
    return "overdue" if age >= overdue_days else "due-soon" if age >= soon_days else "ok"


def make_backup(src, dest_dir, now):
    """tar.gz of the vault (symlinks skipped), then read back to verify."""
    src, dest = Path(src), Path(dest_dir)
    dest.mkdir(parents=True, exist_ok=True, mode=0o700)
    out = dest / f"vault-{now.isoformat()}.tar.gz"
    if out.exists():
        raise ValueError("Backup already exists")
    with tarfile.open(out, "w:gz") as tf:
        for p in notes(src):
            if not p.is_symlink():
                tf.add(p, arcname=str(p.relative_to(src)))
    with tarfile.open(out) as tf:
        count = len(tf.getnames())
    return {"path": str(out), "files": count}


def vet_skill_repo(meta):
    """AGENT_RULES 18 gate on metadata the caller fetched: license, archived, last push, pinned ref."""
    problems = [msg for ok, msg in [(bool(meta.get("license")), "no license"), (not meta.get("archived", True), "archived or unknown"),
                                    (bool(meta.get("last_push")), "no last push date"), (bool(meta.get("pinned_ref")), "no pinned version")] if not ok]
    if "agpl" in str(meta.get("license", "")).lower():
        problems.append("AGPL is held")
    return {"ok": not problems, "problems": problems}
