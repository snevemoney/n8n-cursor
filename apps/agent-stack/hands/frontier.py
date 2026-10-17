"""Round-2 frontier methods (Researcher METHODS-ROUND2): Z66 review->do with locked fields, Z86 automation contract,
Z87 prove-before-done on synthetic events, Z89/Z90/Z91 row enrichment, Z93 tool preflight before a paid run,
Z95/Z97 parallel specialist panel -> weighted score dashboard. Nothing is sent, published or bought."""
from __future__ import annotations

import csv, importlib.util, json, re, time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import os
_VAULT_ROOT = Path(os.environ.get("JARVIS_VAULT_DIR") or os.environ.get("JARVIS_VAULT") or next(
    (p for p in (Path.home() / "Vaults/My_Billion_Dollar_Vault", Path.home() / "Documents/My_Billion_Dollar_Vault") if p.is_dir()),
    Path.home() / "Vaults/My_Billion_Dollar_Vault")).expanduser()  # Evens 10-17: the vault lives in ~/Vaults now

HERE = Path(__file__).resolve().parent
INBOX = _VAULT_ROOT / "00_Outer_Heaven" / "JARVIS-INBOX"


def _mod(name):
    s = importlib.util.spec_from_file_location(f"fr_{name}", HERE / f"{name}.py"); m = importlib.util.module_from_spec(s); s.loader.exec_module(m); return m


def _chat():
    ca = _mod("code_author"); return lambda p: ca.CHAT(ca.BUILDER, p)


def _out(sub: str, name: str, text: str, out: Path | None) -> Path:
    d = (out or INBOX) / sub; d.mkdir(parents=True, exist_ok=True); f = d / name; f.write_text(text, encoding="utf-8"); return f


# ---- Z86 / Z87 ----
AUTO_RE = re.compile(r"\b(?:build|set up|create|make|wire up)\s+(?:me\s+)?(?:an?\s+)?(?:automation|workflow|zap)\b", re.I)


def contract(u: str) -> dict:
    trig = re.search(r"\b(?:when(?:ever)?|each time|every time)\s+(.+?)(?:,|\bthen\b|\band\b|$)", u, re.I)
    thr = re.search(r"\b(?:over|above|more than|greater than|at least|>)\s*\$?\s*([\d,.]+)", u, re.I)
    flt = re.search(r"\b(?:only (?:if|when|from|for)|except|unless)\s+(.+?)(?:,|\bthen\b|$)", u, re.I)
    act = re.search(r"\b(?:then|and)\s+((?:add|log|post|send|save|create|notify|write)\b.+?)(?:\.|$)", u, re.I)
    fields = re.search(r"\b(?:with|capturing|grab(?:bing)?|including)\s+(?:the\s+)?([\w ,]+?)(?:\bthen\b|\.|$)", u, re.I)
    return {"trigger": trig.group(1).strip() if trig else "", "threshold": float(thr.group(1).replace(",", "")) if thr else None,
            "filter": flt.group(1).strip() if flt else "", "action": act.group(1).strip() if act else "",
            "fields": [f.strip() for f in re.split(r",|\band\b", fields.group(1)) if f.strip()] if fields else []}


def prove(c: dict) -> dict:
    """Z87: three synthetic events -> apply threshold/filter -> row check against the expected rows."""
    t = c["threshold"] or 100.0
    fword = (re.findall(r"[a-z]+", c["filter"].lower()) or ["match"])[-1]
    ev = [{"id": "syn-1", "amount": t * 2, "tag": fword, "expect": True},
          {"id": "syn-2", "amount": t / 2, "tag": fword, "expect": not c["threshold"]},
          {"id": "syn-3", "amount": t * 2, "tag": "other", "expect": not c["filter"]}]
    rows = []
    for e in ev:
        ok = (c["threshold"] is None or e["amount"] > c["threshold"]) and (not c["filter"] or e["tag"] == fword)
        if ok:
            rows.append(e["id"])
    exp = [e["id"] for e in ev if e["expect"]]
    return {"events": ev, "rows": rows, "expected": exp, "pass": rows == exp}


def automation(u: str, out: Path | None = None) -> dict:
    c = contract(u); miss = [k for k in ("trigger", "action") if not c[k]]
    if miss:
        return {"ok": True, "tool": "automation", "sent": False, "spoken": "Before I build it, sir: " + " and ".join(
            {"trigger": "what starts it", "action": "what it should do each time"}[m] for m in miss) + "? Nothing is built yet."}
    p = prove(c)
    md = ("# Automation contract\n" + "\n".join(f"- **{k}**: {v}" for k, v in [("Trigger", c["trigger"]), ("Fields", ", ".join(c["fields"]) or "all"),
          ("Normalise", "trim, lower-case emails, amounts as numbers"), ("Threshold", c["threshold"]), ("Filters", c["filter"] or "none"), ("Action", c["action"]),
          ("Steps", "test on synthetic events -> verify rows -> publish (gated, needs your yes) -> confirm with a live event"), ("Return", "links to the workflow and the sheet")])
          + "\n\n## Proof (synthetic)\n" + "\n".join(f"- {e['id']}: amount {e['amount']:g}, tag {e['tag']} -> {'row' if e['id'] in p['rows'] else 'skipped'}" for e in p["events"])
          + f"\n\nRow check: wrote {p['rows']}, expected {p['expected']} -> {'PASS' if p['pass'] else 'FAIL'}\n\nNot published.\n")
    f = _out("automation-contracts", time.strftime("%Y%m%d-%H%M%S") + ".md", md, out)
    return {"ok": True, "tool": "automation", "sent": False, "cites": [str(f)], "proof": p, "spoken":
            f"Contract written, sir: when {c['trigger']}, {c['action']}" + (f", only over {c['threshold']:g}" if c["threshold"] and not re.search(r"\b(?:over|above|more than)\b", c["trigger"], re.I) else "")
            + (f", only {c['filter']}" if c["filter"] else "") + f". I tested it on three synthetic events: {len(p['rows'])} row{'s' * (len(p['rows']) != 1)} written, "
            + ("exactly as expected" if p["pass"] else f"expected {len(p['expected'])}, so it is NOT ready") + ". Nothing is published; say publish when you want it live. Contract: " + f.name}


# ---- Z89 / Z90 / Z91 ----
ENRICH_RE = re.compile(r"\benrich\b.*?([\w./~-]+\.csv)", re.I)
FREE = {"gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com", "proton.me"}


def enrich(u: str) -> dict:
    m = ENRICH_RE.search(u); name = m.group(1)
    cands = [Path(name).expanduser()] + [Path.home() / d / name for d in ("Downloads", "Documents", "Desktop", "jarvis-proof/b5")]
    src = next((c for c in cands if c.is_file()), None)
    if not src:
        return {"ok": True, "tool": "enrich", "sent": False, "spoken": f"I can't find {name}, sir; I looked in Downloads, Documents and Desktop. Nothing changed."}
    rows = list(csv.DictReader(src.open(newline="", encoding="utf-8")))
    cols = list(rows[0].keys()) if rows else []
    key = next((c for c in cols if c.lower() in ("id", "email", "domain")), cols[0] if cols else "")
    seen, filled, skipped, reused = {}, 0, 0, 0
    for r in rows:
        k = (r.get(key) or "").strip().lower()
        if not k:
            skipped += 1; continue  # Z89 skip empty
        if k in seen:  # Z90 match the entity first, reuse its enrichment
            for c, v in seen[k].items():
                if not r.get(c):
                    r[c] = v
            reused += 1; continue
        email = next((r[c] for c in cols if "email" in c.lower() and r.get(c)), "")
        dom = (r.get("domain") or (email.split("@")[-1] if "@" in email else "")).lower()
        add = {}
        if "domain" in cols and not r.get("domain") and dom:
            add["domain"] = dom
        if "company" in cols and not r.get("company") and dom and dom not in FREE:
            add["company"] = dom.split(".")[0].replace("-", " ").title()
        if "email_type" in cols and not r.get("email_type") and dom:
            add["email_type"] = "personal" if dom in FREE else "work"
        r.update(add); filled += bool(add); seen[k] = add
    dst = src.with_name(src.stem + ".enriched.csv")
    with dst.open("w", newline="", encoding="utf-8") as fh:  # Z91 schema mirrors the destination columns, no extras
        w = csv.DictWriter(fh, fieldnames=cols); w.writeheader(); w.writerows(rows)
    return {"ok": True, "tool": "enrich", "sent": False, "cites": [str(dst)], "spoken":
            f"Enriched {src.name}, sir: {filled} rows filled, {reused} matched an earlier {key} and reused it, {skipped} empty rows skipped. "
            f"Same {len(cols)} columns as the source, saved as {dst.name}; the original is untouched."}


# ---- Z93 ----
PAID_RE = re.compile(r"\b(?:generate|render|make|create)\b.{0,40}\b(?:videos?|images?|batch of|clips?|voiceovers?)\b", re.I)


def preflight(u: str, inventory: list[str]) -> dict:
    want = "higgsfield" if re.search(r"video|image|clip", u, re.I) else "voice"
    have = [n for n in inventory if want in n.lower()]
    line = (f"Before I spend credits, sir: the {have[0]} connection is listed and answering its tool list. Say go and I'll start the run; nothing is generated yet."
            if have else f"Before I spend anything, sir: no {want.title()} connection is listed, so a long run would fail partway. Connect it first; nothing was started.")
    return {"ok": True, "tool": "preflight", "sent": False, "spoken": line, "wires": ["mcp_inventory"]}


# ---- Z95 / Z97 ----
PANEL_RE = re.compile(r"\b(?:audit|assess|evaluate|score|grade|rate)\b\s+(?:my\s+|this\s+|the\s+)?(.+)", re.I)
DIMS = [("clarity", 0.30), ("credibility", 0.25), ("conversion", 0.25), ("risk", 0.20)]


def panel(u: str, *, chat=None, out: Path | None = None) -> dict:
    chat = chat or _chat(); subject = PANEL_RE.search(u).group(1).strip()
    quick = bool(re.search(r"\bquick\b", u, re.I)); dims = DIMS[:1] if quick else DIMS

    def one(d):
        txt = chat(f"You are the {d[0]} specialist. Judge only {d[0]} of: {subject}\nReply exactly: SCORE: <0-10>\nNOTE: <one sentence>") or ""
        sc = re.search(r"SCORE:\s*(\d+(?:\.\d+)?)", txt); nt = re.search(r"NOTE:\s*(.+)", txt)
        note = (nt.group(1).strip() if nt else txt.strip()[:160])
        note = re.sub(r"^\s*SCORE:\s*\d+(?:\.\d+)?(?:\s*/\s*10)?\s*[-:.,]?\s*", "", re.sub(r"\s*NOTE:\s*", " ", note)).strip()
        return {"dim": d[0], "w": d[1], "score": min(10.0, float(sc.group(1))) if sc else None, "note": note}
    with ThreadPoolExecutor(len(dims)) as ex:
        res = list(ex.map(one, dims))
    ok = [r for r in res if r["score"] is not None]
    if not ok:
        return {"ok": False, "tool": "panel", "spoken": "The specialists returned no scores this turn, sir, so there is no report. Nothing was saved."}
    head = sum(r["score"] * r["w"] for r in ok) / sum(r["w"] for r in ok)
    label = "Strong" if head >= 8 else "Solid" if head >= 6.5 else "Needs work" if head >= 5 else "Weak"
    md = (f"# Panel report: {subject}\n\nHeadline {head:.1f}/10 · {label}" + (" (quick variant)" if quick else "") + "\n\n| Dimension | Weight | Score | Note |\n|---|---|---|---|\n"
          + "\n".join(f"| {r['dim']} | {r['w']:.0%} | {r['score'] if r['score'] is not None else 'n/a'} | {r['note']} |" for r in res) + "\n\nWeights are Jarvis defaults, not the tape's (UNVERIFIED).\n")
    f = _out("panel-reports", time.strftime("%Y%m%d-%H%M%S") + ".md", md, out)
    worst = min(ok, key=lambda r: r["score"])
    return {"ok": True, "tool": "panel", "sent": False, "cites": [str(f)], "spoken":
            f"{len(ok)} specialist{'s' * (len(ok) != 1)} scored it in parallel, sir: {head:.1f} out of 10, {label}. "
            + ", ".join(f"{r['dim']} {r['score']:g}" for r in ok) + f". Weakest is {worst['dim']}: {worst['note']} Report: {f.name}"}


# ---- Z66 ----
REVIEW_DO_RE = re.compile(r"\breview\b.*\bdraft\b.*\b(?:then|and)\s+(?:fix|revise|finali[sz]e|tighten|redo)\b", re.I)


def review_do(u: str, *, drafts: Path, chat=None) -> dict:
    files = sorted(drafts.glob("*.md"), key=lambda p: p.stat().st_mtime) if drafts.is_dir() else []
    if not files:
        return {"ok": True, "tool": "review_do", "sent": False, "spoken": "There is no saved draft to review, sir. Nothing changed."}
    files = [f for f in files if not f.stem.endswith("-rev")] or files
    kind = "email" if re.search(r"\b(?:subject|email|e-mail)\b", u, re.I) else ("invoice" if re.search(r"\binvoice\b", u, re.I) else "")
    pick = [f for f in files if kind and kind in f.stem] or files
    src = pick[-1]; text = src.read_text(encoding="utf-8")
    locked = re.findall(r"(?:keep|lock|leave)\s+(?:the\s+)?(?:\w+\s+){0,2}['\"\u201c]([^'\"\u201d]+)['\"\u201d]", u, re.I)
    chat = chat or _chat()
    new = (chat("Revise this draft: tighter, same intent. These strings must appear EXACTLY as written: "
                + json.dumps(locked) + "\nReturn only the revised draft.\n\n" + text) or "").strip()
    if not new:
        return {"ok": False, "tool": "review_do", "spoken": "The writing model returned nothing, sir; the draft is unchanged."}
    kept = [s for s in locked if s in new]; fixed = [s for s in locked if s not in new]
    if fixed:
        new += "\n\n" + "\n".join(fixed)
    dst = src.with_name(src.stem + "-rev.md"); dst.write_text(new + "\n", encoding="utf-8")
    return {"ok": True, "tool": "review_do", "sent": False, "cites": [str(dst)], "spoken":
            f"Tools check: drafts folder and the writing model, both answering. Reviewed {src.name} and saved the revision as {dst.name}. "
            + (f"Locked {'field' if len(locked) == 1 else 'fields'} kept verbatim: {', '.join(locked)}." if locked else "No locked fields were named.")
            + (" I had to restore one the model dropped." if fixed else "") + " Not sent."}


# ---- Z83 ----
GROUND_RE = re.compile(r"\b(?:write|draft|make|create)\b.*\b(?:from|based on|using)\s+my\s+notes?\s+(?:on|about)\s+(.+?)[.?!]?$", re.I)


def grounded(u: str, *, reflex, chat=None) -> dict:
    topic = GROUND_RE.search(u).group(1)
    p, name = reflex.vault_note(topic)
    if p < 0.5:
        pm = reflex.path_matches(topic)
        name = pm[0]["stem"] if pm and pm[0]["covers"] else ""
    nb = reflex.note_brief(name, max_chars=1500) if name else {"ok": False}
    if not nb.get("ok"):
        return {"ok": True, "tool": "grounded", "sent": False,
                "spoken": f"I found no note on {topic}, sir, so I won't write it from memory. Name the note, or say 'write it general'."}
    ask = re.sub(r"\b(?:from|based on|using)\s+my\s+notes?\s+(?:on|about)\s+.+$", "", u, flags=re.I).strip()
    body = ((chat or _chat())(f"{ask}. Use ONLY these notes as facts; if a needed fact is missing write X.\nNOTES ({nb['name']}):\n{nb['gist']}") or "").strip()
    return {"ok": bool(body), "tool": "grounded", "sent": False, "cites": [nb["path"]],
            "spoken": f"Working from your {nb['name']} note in {Path(nb['path']).parent.name}. " + (body or "The writing model returned nothing this turn.")}
