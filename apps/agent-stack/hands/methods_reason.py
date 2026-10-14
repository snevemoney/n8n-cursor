"""Reasoning and control cores (X23, X25, X27, X28, X41-X46). Draft/advice only; nothing books, sends or registers on its own."""
from __future__ import annotations

import html
import json
import re
from datetime import date, datetime, timedelta
from pathlib import Path

try:
    from . import project_methods as pm
    from . import methods_vault as mv
except ImportError:
    import project_methods as pm
    import methods_vault as mv

WORD = mv.WORD


# ---- X23: predict then reconcile ------------------------------------------------------------
def predict(store, pid, claim, prob):
    if not 0 <= float(prob) <= 1:
        raise ValueError("Probability must be between 0 and 1")
    pm.write_new(pm.child(Path(store), "predictions", pm.slug(pid) + ".json"),
                 json.dumps({"claim": pm.clean_text(claim), "prob": float(prob), "at": pm.stamp()}))


def reconcile(store, pid, happened):
    """Brier score (lower is better). The outcome is recorded once; a second call refuses."""
    pred = json.loads(pm.child(Path(store), "predictions", pm.slug(pid) + ".json").read_text())
    brier = round((pred["prob"] - (1.0 if happened else 0.0)) ** 2, 4)
    pm.write_new(pm.child(Path(store), "outcomes", pm.slug(pid) + ".json"), json.dumps({"happened": bool(happened), "brier": brier}))
    return {"claim": pred["claim"], "prob": pred["prob"], "happened": bool(happened), "brier": brier}


def scoreboard(store):
    rows = [json.loads(p.read_text())["brier"] for p in sorted((Path(store) / "outcomes").glob("*.json"))] if (Path(store) / "outcomes").is_dir() else []
    return {"n": len(rows), "mean_brier": round(sum(rows) / len(rows), 4) if rows else None}


# ---- X28: permission mode per request ----------------------------------------------------------
MODES = {"read-only": {"read"}, "plan": {"read", "plan"}, "auto": {"read", "plan", "write"}, "full": {"read", "plan", "write", "exec"}}
TIER3 = {"send", "spend", "deploy", "merge", "delete", "publish", "credential"}


def permitted(mode, action):
    """Tier-3 actions need Evens regardless of mode; unknown modes/actions are refused."""
    if mode not in MODES:
        raise ValueError("Pick auto, read-only, plan or full")
    if action in TIER3:
        return {"allowed": False, "why": "needs Evens's explicit approval in every mode"}
    ok = action in MODES[mode]
    return {"allowed": ok, "why": "" if ok else f"{mode} mode does not allow {action}"}


# ---- X42: /drift ---------------------------------------------------------------------------------
def drift(intentions, activity, now, window_days=45):
    """activity: [(date, text)]. An intention with no matching activity inside the window is 'avoided'."""
    recent = " ".join(t.lower() for d, t in activity if timedelta(0) <= now - d <= timedelta(days=window_days))
    words = set(WORD.findall(recent))
    out = {"kept": [], "avoided": []}
    for i in intentions:
        keys = [w for w in WORD.findall(i.lower()) if len(w) > 3]
        out["kept" if keys and any(k in words for k in keys) else "avoided"].append(i)
    return out


# ---- X43: /schedule (advice only, never books) ------------------------------------------------------
def schedule_check(meeting, calendar, notes_text="", *, max_per_day=4, min_gap_min=15):
    """meeting/calendar events are (start, end) datetimes. Thresholds are our defaults, tune with Evens."""
    s, e = meeting
    reasons = []
    for cs, ce in calendar:
        if s < ce and cs < e:
            reasons.append("overlaps an existing event")
        elif 0 <= (s - ce).total_seconds() < min_gap_min * 60 or 0 <= (cs - e).total_seconds() < min_gap_min * 60:
            reasons.append("back-to-back with another event")
    if sum(1 for cs, _ in calendar if cs.date() == s.date()) >= max_per_day:
        reasons.append("that day is already full")
    if re.search(r"deep work|focus block|do not book", notes_text, re.I):
        reasons.append("your notes protect that time")
    return {"recommend": "do not book" if reasons else "ok to propose", "reasons": sorted(set(reasons)), "booked": False}


# ---- X41 / X45: slash commands; self-extension only by approved proposal -----------------------------------------
COMMANDS = {"today": "today", "drift": "drift", "schedule": "schedule", "graduate": "graduate"}
UNBUILT = {"context", "close-day", "ghost", "challenge", "emerge", "ideas", "trace", "connect"}


def slash(registry, text):
    m = re.match(r"^/([a-z-]+)\s*(.*)$", text.strip())
    if not m:
        return None
    name = m.group(1)
    if name in registry:
        return {"ok": True, "command": name, "handler": registry[name]}
    if name in UNBUILT:
        return {"ok": False, "command": name, "spoken": "That command's prompt file was never obtained, so it is not built."}
    return {"ok": False, "command": name, "spoken": "Unknown command."}


def propose_command(name, description, proposals_dir):
    name = pm.slug(name)
    path = pm.child(Path(proposals_dir), name + ".md")
    pm.write_new(path, f"# /{name}\nStatus: proposed (not registered)\n\n{pm.clean_text(description)}\n")
    return {"name": name, "path": str(path), "registered": False}


def register_command(registry, proposal, *, approved):
    if not approved:
        raise PermissionError("A new command needs the owner's approval before it is registered")
    return {**registry, proposal["name"]: proposal["path"]}


# ---- X46: /graduate ------------------------------------------------------------------------------------------------
def graduate(root, daily_name, decisions):
    """decisions: {idea: 'promote' | 'dismiss' | 'append:<note>'}. Standalone notes backlink to the daily note."""
    root = Path(root)
    daily = mv.target(root, daily_name)
    if daily is None:
        raise ValueError("Daily note not found")
    ideas = re.findall(r"^- idea: (.+)$", daily.read_text(), re.M)
    done = []
    for idea in ideas:
        act = decisions.get(idea)
        if act == "promote":
            p = pm.child(root, pm.slug(idea) + ".md")
            pm.write_new(p, f"---\ntype: idea\nsource: [[{daily_name}]]\n---\n# {idea}\n\nPromoted from [[{daily_name}]].\n")
        elif act and act.startswith("append:"):
            dest = mv.target(root, act[7:])
            if dest is None:
                raise ValueError("Append target not found")
            dest.write_text(dest.read_text().rstrip("\n") + f"\n- {idea} (from [[{daily_name}]])\n")
        elif act == "dismiss":
            pass
        else:
            continue
        done.append((idea, act.split(":")[0]))
    handled = {idea for idea, _ in done}
    return {"actions": done, "pending": [i for i in ideas if i not in handled]}


# ---- X25: small page over personal data -----------------------------------------------------------------------------------
def build_page(out_dir, name, title, rows):
    head, body = "".join(f"<th>{html.escape(str(h))}</th>" for h in rows[0]), "".join(
        "<tr>" + "".join(f"<td>{html.escape(str(c))}</td>" for c in r) + "</tr>" for r in rows[1:])
    page = f"<!doctype html><meta charset=utf-8><title>{html.escape(title)}</title><h1>{html.escape(title)}</h1><table><tr>{head}</tr>{body}</table>"
    path = pm.child(Path(out_dir), pm.slug(name) + ".html")
    pm.write_new(path, page)
    return str(path)


# ---- X27: agent office model (stations with inbox, chat, step log) ----------------------------------------------------------
def office(agents):
    return {"orchestrator": {"inbox": [], "chat": [], "steps": []},
            **{pm.slug(a): {"inbox": [], "chat": [], "steps": []} for a in agents}}


def _with(off, who, field, item):
    if who not in off:
        raise ValueError("Unknown station")
    return {**off, who: {**off[who], field: [*off[who][field], item]}}


def dispatch(off, specialist, task):
    """Orchestrator hands a task to one specialist; both step logs record it. Returns a new office."""
    off = _with(off, specialist, "inbox", task)
    off = _with(off, "orchestrator", "steps", f"dispatched to {specialist}: {task}")
    return _with(off, specialist, "steps", f"received: {task}")
