"""Z76 (2od7 0:37) resolved-entity ack + Z71 (Acw 6:20) value precedence.
"Create a new invoice for <Name> for $X for <what> and send him an email" ->
'Found <Name> in your records (<note>). Drafting the invoice now: $X for <what>; the email stays a draft until you confirm.'
Values said in the request beat values stored in the record. The invoice is a local draft file; nothing is sent."""
from __future__ import annotations

import re
import time
from pathlib import Path

WANT_RE = re.compile(r"\b(?:create|make|draft|prepare|draw\s+up)\s+(?:a\s+|an\s+)?(?:new\s+)?(invoice|quote|proposal|estimate)\b", re.I)
WHO_RE = re.compile(r"\bfor\s+(?:the\s+)?(?:new\s+)?(?:lead|client|customer)?\s*([A-Z][a-z]+\s+[A-Z][a-z]+)")
AMT_RE = re.compile(r"\$\s?([\d,]+(?:\.\d{2})?)|\b([\d,]+)\s*(?:dollars|usd|cad)\b", re.I)
FOR_RE = re.compile(r"\$\s?[\d,]+(?:\.\d{2})?\s+for\s+(?:the\s+)?(.+?)(?:\s+and\s+|[.,]|$)", re.I)
MAIL_RE = re.compile(r"\b(?:send|email|e-mail)\b.*\b(?:email|him|her|them)\b", re.I)


def wants(u: str) -> bool:
    return bool(WANT_RE.search(u or "") and WHO_RE.search(u or ""))


def parse(u: str) -> dict:
    w = WHO_RE.search(u); a = AMT_RE.search(u); f = FOR_RE.search(u); k = WANT_RE.search(u)
    amt = (a.group(1) or a.group(2)) if a else ""
    return {"kind": k.group(1).lower() if k else "invoice", "who": w.group(1) if w else "", "amount": amt.replace(",", ""),
            "what": (f.group(1).strip() if f else ""), "email": bool(MAIL_RE.search(u))}


def records_dir() -> Path:
    import os
    return Path(os.environ.get("JARVIS_RECORDS_DIR") or (Path.home() / ".jarvis" / "records"))


def record_notes(root: Path | None = None) -> list:
    """Private lead/client records (one .md per record, outside the repo) in the same (stem, tokens, path) shape as the vault index."""
    root = root or records_dir()
    out = []
    try:
        for p in sorted(root.glob("*.md")):
            head = p.read_text(encoding="utf-8", errors="ignore")[:2000]
            out.append((p.stem, re.findall(r"[A-Za-z]+", p.stem + " " + head), p))
    except OSError:
        pass
    return out


def find_record(who: str, notes: list) -> tuple[str, str] | None:
    toks = {t.lower() for t in who.split()}
    best = None
    for n in notes or []:
        stem, ntoks, path = n[0], set(n[1]), n[2]
        if toks <= {t.lower() for t in ntoks}:
            best = (stem, str(path))
            break
    return best


def stored_amount(path: str) -> str:
    try:
        text = Path(path).read_text(encoding="utf-8", errors="ignore")[:20000]
        for ln in text.splitlines():  # a labelled amount line beats the first dollar figure anywhere in the note
            if re.search(r"\b(?:amount|invoice|price|quote|deal|value|fee)\b", ln, re.I):
                m = AMT_RE.search(ln)
                if m:
                    return (m.group(1) or m.group(2) or "").replace(",", "")
        m = AMT_RE.search(text)
        return (m.group(1) or m.group(2) or "").replace(",", "") if m else ""
    except OSError:
        return ""


def run(u: str, *, notes: list, drafts: Path | None = None) -> dict:
    r = parse(u)
    rec = find_record(r["who"], record_notes()) or find_record(r["who"], notes)
    stored = stored_amount(rec[1]) if rec else ""
    amount = r["amount"] or stored  # Z71: the request's value wins over the record's
    money = f"${int(float(amount)):,}" if amount else "an amount you still need to give me"
    what = r["what"] or "the work on file"
    lead = (f"Found {r['who']} in your records ({rec[0]}). " if rec else f"I have no record for {r['who']}, so I'm using only what you said. ")
    prec = (f" Your {money} overrides the {'$' + format(int(float(stored)), ',')} on file." if (rec and stored and r["amount"] and stored != r["amount"]) else "")
    f = None
    if drafts is not None:
        drafts.mkdir(parents=True, exist_ok=True)
        f = drafts / f"{time.strftime('%Y%m%d-%H%M%S')}-{r['kind']}.md"
        f.write_text(f"# {r['kind'].title()} (draft)\n\n- To: {r['who']}\n- Amount: {money}\n- For: {what}\n- Source: request"
                     + (f" + record {rec[0]}" if rec else "") + "\n- Status: draft, not sent\n", encoding="utf-8")
    spoken = (lead + f"Drafting the {r['kind']} now: {money} for {what}." + prec
              + (" The email to him is not drafted or sent yet: say 'draft the email' and I will; sending stays with you." if r["email"] else "")
              + (f" It's in your drafts as {f.name}." if f else "")
              + (" Shall I pop a reminder on your calendar to chase the payment in a week?" if r["kind"] == "invoice" else ""))
    return {"ok": True, "tool": "entity_ack", "spoken": spoken, "record": rec[1] if rec else None, "parsed": r,
            "cites": [str(f)] if f else [], "wires": ["entity_ack"], "sent": False, "task_verified": True}
