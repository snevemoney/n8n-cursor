"""Handlers for vault and reasoning cores: X02 X04 X13 X17 X23 X25 X28 X31 X36 X38 X41 X45 X46.
Writes stay under the agent-owned methods root (never the human vault unless Evens points the env var at it)."""
from __future__ import annotations

import re
from datetime import date

import methods_reason as mr
import methods_vault as mv
import project_methods as pm
from methods_router_common import methods_root, rx, vault_root

NO_VAULT = "There is no agent vault yet at the configured folder, so there is nothing to read."


def _have_vault():
    return vault_root().is_dir()


def x17(m):
    if not _have_vault():
        return NO_VAULT
    hits = mv.search(vault_root(), m["q"], k=3)
    return "Top notes: " + ", ".join(h["note"] for h in hits) + "." if hits else "No note matches that."


def x02(m):
    if not _have_vault():
        return NO_VAULT
    qs = {}
    for part in m["qs"].split("|"):
        q, sep, want = part.partition("=>")
        if sep:
            qs[q.strip()] = want.strip()
    if not qs:
        return "Give questions as 'question => target note' separated by a bar."
    got = mv.routing_probe(vault_root(), "index", qs)
    return f"Routing probe: {got['passed']} of {got['total']} questions resolve through declared routes."


def x04(m):
    if not _have_vault():
        return NO_VAULT
    got = mv.link(vault_root(), "index", m["topic"], m["note"])
    return ("Added one index line: " if got["added"] else "Already routed: ") + got["line"]


def x13(_m):
    if not _have_vault():
        return NO_VAULT
    return mv.daily_compile(vault_root(), date.today())["brief"]


def x23_pred(m):
    pid = pm.slug(m["claim"])[:40]
    mr.predict(methods_root() / "reason", pid, m["claim"], float(m["pct"]) / 100)
    return f"Prediction saved as {pid} at {m['pct']} percent."


def x23_out(m):
    got = mr.reconcile(methods_root() / "reason", m["pid"], m["res"].lower() == "happened")
    return f"Recorded. Brier score {got['brier']}, lower is better."


def x23_board(_m):
    got = mr.scoreboard(methods_root() / "reason")
    return f"{got['n']} scored predictions" + (f", mean Brier {got['mean_brier']}." if got["n"] else ".")


def x25(m):
    rows = [[c.strip() for c in r.split(",")] for r in m["rows"].split(";")]
    mr.build_page(methods_root() / "pages", m["name"], m["title"], rows)
    return f"Static page '{pm.slug(m['name'])}' written to the methods pages folder."


def x28(m):
    got = mr.permitted(m["mode"].lower(), m["action"].lower())
    return ("Allowed." if got["allowed"] else "Not allowed: " + got["why"] + ".")


def x31_note(m):
    mv.remember(methods_root() / "shared", "jarvis", m["topic"], m["t"])
    return "Noted in shared memory."


def x31_recall(m):
    lines = mv.recall(methods_root() / "shared", m["topic"])
    return " ".join(lines[-3:]) if lines else "Nothing noted on that topic."


def x36_recap(_m):
    if not _have_vault():
        return NO_VAULT
    return mv.todo_recap(vault_root())["spoken"]


def x36_top(m):
    items = [{"task": t.strip(), "times_per_week": int(n), "minutes": int(mi)}
             for t, n, mi in re.findall(r"([^;,]+),\s*(\d+) per week,\s*(\d+) min", m["items"])]
    got = mv.top_automation(items)
    return f"Automate first: {got['top']} ({got['weekly_minutes']} minutes a week). " + "; ".join(got["guide"]) + "."


def x38_due(m):
    return f"Vault backup status: {mv.backup_due(date.fromisoformat(m['day']), date.today())}."


def x38_run(_m):
    if not _have_vault():
        return NO_VAULT
    got = mv.make_backup(vault_root(), methods_root() / "backups", date.today())
    return f"Backed up {got['files']} notes and read the archive back."


def x41(_m):
    return ("Built cores: today, drift, schedule, graduate, but none is registered as a Jarvis command yet. "
            "Never built (prompt files not obtained): " + ", ".join(sorted(mr.UNBUILT)) + ".")


def x45_prop(m):
    got = mr.propose_command(m["name"], m["desc"], methods_root() / "proposals")
    return f"Proposal file written for /{got['name']}. Not registered."


def x45_reg(m):
    try:
        mr.register_command({}, {"name": m["name"], "path": ""}, approved=False)
    except PermissionError as e:
        return f"Not registered. {e}."
    return "Not registered."


def x46(m):
    if not _have_vault():
        return NO_VAULT
    decisions = {}
    for part in (m["dec"] or "").split(";"):
        idea, sep, act = part.partition("=>")
        if sep:
            decisions[idea.strip()] = act.strip()
    got = mr.graduate(vault_root(), m["daily"].strip(), decisions)
    return f"Graduated {len(got['actions'])}. Pending ideas: {'; '.join(got['pending']) or 'none'}."


HANDLERS = [
    ("X17", rx(r"vault search (?P<q>.+)"), x17),
    ("X02", rx(r"routing probe (?P<qs>.+=>.+)"), x02),
    ("X04", rx(r"vault link (?P<topic>.+?) to note (?P<note>[\w./ -]+)"), x04),
    ("X13", rx(r"(?:vault daily compile|morning vault brief)"), x13),
    ("X23", rx(r"predict: (?P<claim>.+?) at (?P<pct>\d{1,3}) ?%"), x23_pred),
    ("X23", rx(r"prediction (?P<pid>[a-z0-9-]+) (?P<res>happened|did not happen)"), x23_out),
    ("X23", rx(r"prediction scoreboard"), x23_board),
    ("X25", rx(r"build page (?P<name>[\w-]+) titled (?P<title>[^:]+): (?P<rows>.+;.+)"), x25),
    ("X28", rx(r"permission check (?P<mode>read-only|plan|auto|full) (?P<action>[a-z]+)"), x28),
    ("X31", rx(r"memory note (?P<topic>[\w -]{1,40}?): (?P<t>.+)"), x31_note),
    ("X31", rx(r"memory recall (?P<topic>[\w -]{1,40})"), x31_recall),
    ("X36", rx(r"vault todo recap"), x36_recap),
    ("X36", rx(r"top automation: (?P<items>.+ per week.+)"), x36_top),
    ("X38", rx(r"vault backup due since (?P<day>\d{4}-\d{2}-\d{2})"), x38_due),
    ("X38", rx(r"vault backup now"), x38_run),
    ("X41", rx(r"vault commands"), x41),
    ("X45", rx(r"propose command (?P<name>[\w-]+): (?P<desc>.+)"), x45_prop),
    ("X45", rx(r"register command (?P<name>[\w-]+)"), x45_reg),
    ("X46", rx(r"graduate (?P<daily>[\w./-]+)(?:: (?P<dec>.+=>.+))?"), x46),
]
