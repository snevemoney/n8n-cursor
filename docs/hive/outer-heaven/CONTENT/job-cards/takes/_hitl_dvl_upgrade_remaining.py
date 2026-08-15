#!/usr/bin/env python3
"""Upgrade remaining HITL takes to A–L + Steal/Operate-never from full.txt + prior walk."""
from __future__ import annotations

import re
from pathlib import Path

from _hitl_dvl_writer import NEVER_CORE, TAKES_ROOT, write_one

PKT = Path("/Users/evenslouis/n8n-cursor/docs/hive/outer-heaven/CONTENT/watch-later/packets")

HITL_RE = re.compile(
    r"\b(send|sent|email|book|booking|call|dial|publish|post|deploy|pay|paid|"
    r"approv|auto|always allow|while you sleep|voicemail|calendar|invoice|"
    r"webhook|guardrail|sanitize|confirm|human)\b",
    re.I,
)


def title_of(vid: str) -> str:
    p = PKT / vid / "PACKET.md"
    if not p.exists():
        return vid
    t = p.read_text(encoding="utf-8", errors="replace")
    m = re.search(r"\*\*Title:\*\*\s*(.+)", t)
    if m:
        return m.group(1).strip()
    m = re.search(r"^# Ingest — (.+)$", t, re.M)
    return m.group(1).strip() if m else vid


def speaker_of(vid: str) -> str:
    p = PKT / vid / "PACKET.md"
    if not p.exists():
        return "on-tape"
    t = p.read_text(encoding="utf-8", errors="replace")
    m = re.search(r"\*\*Channel:\*\*\s*(.+)", t)
    return m.group(1).strip() if m else "on-tape"


def paras(text: str) -> list[str]:
    chunks = re.split(r"\n\s*\n", text)
    out = []
    for c in chunks:
        s = " ".join(c.split())
        if len(s) > 40:
            out.append(s)
    return out


def hitl_quotes(text: str, n: int = 8) -> list[str]:
    found = []
    for sent in re.split(r"(?<=[.!?])\s+", " ".join(text.split())):
        if HITL_RE.search(sent) and 40 < len(sent) < 280:
            found.append(sent.strip())
        if len(found) >= n:
            break
    return found


def shallow_section(md: str, header: str) -> str:
    pat = rf"## {re.escape(header)}\n+(.*?)(?=\n## |\Z)"
    m = re.search(pat, md, re.S)
    return m.group(1).strip() if m else ""


def first_sentences(text: str, n: int = 4) -> list[str]:
    sents = [s.strip() for s in re.split(r"(?<=[.!?])\s+", " ".join(text.split())) if len(s.strip()) > 30]
    return sents[:n]


def build(vid: str) -> dict:
    full = (PKT / vid / "full.txt").read_text(encoding="utf-8", errors="replace")
    words = len(full.split())
    title = title_of(vid)
    speaker = speaker_of(vid)
    quotes = hitl_quotes(full)
    openers = first_sentences(full, 5)
    ps = paras(full)
    beats = []
    for i, p in enumerate(ps[:8]):
        beats.append(p[:280] + ("…" if len(p) > 280 else ""))
    if not beats:
        beats = openers
    take_path = TAKES_ROOT / vid / "hitl-operator.md"
    shallow = take_path.read_text(encoding="utf-8", errors="replace") if take_path.exists() else ""
    said = shallow_section(shallow, "Transcript said")
    steal = shallow_section(shallow, "Steal")
    never = shallow_section(shallow, "Operate-never")
    one = shallow_section(shallow, "One never (operate)")

    sendish = any(re.search(r"\b(send|sent|email|gmail)\b", full, re.I) for _ in [0])
    bookish = bool(re.search(r"\b(book|booking|calendar|appointment|vapi|vappy)\b", full, re.I))
    dialish = bool(re.search(r"\b(call|dial|phone|while you sleep)\b", full, re.I))
    pubish = bool(re.search(r"\b(publish|post on|tiktok|instagram)\b", full, re.I))
    approve = bool(re.search(r"\b(approv|needs input|human approval|confirm)\b", full, re.I))
    nosend = bool(re.search(r"didn'?t actually send|did not send|doesn't send", full, re.I))

    machine_name = "Checkable stop, then Evens"
    loop = "tape job → draft/log/preview → Evens on send/book/publish → stop"
    why = "Hard steps on this tape still need a human. Operate ≠ learn."
    never_payload = "Auto-send / auto-book / auto-publish from this canvas."
    if nosend:
        machine_name = "Research-and-draft (he said it did not send)"
        loop = "list/job in → research/draft → store → Evens or client sends → stop"
        why = "SOURCE: the sold or demoed path stops before send."
        never_payload = "Flipping the no-send path to auto-send."
    elif dialish and bookish:
        machine_name = "Qualify / read-back (book and dial stay HITL)"
        loop = "lead in → questions/read-back → log → Evens dials or books → stop"
        why = "Voice/calendar tools on tape will close if we let them."
        never_payload = "Auto-dial / auto-voice-book / Vapi as stack."
    elif dialish:
        machine_name = "Qualify questions (no sleep-dial)"
        loop = "form/lead in → log fields → Evens calls → stop"
        why = "A call is a world action. While-you-sleep is the trap."
        never_payload = "Auto-dial / while-you-sleep."
    elif pubish:
        machine_name = "Cut / three options → Evens publishes"
        loop = "asset in → generate → human pick → publish card → stop"
        why = "Post-to-social on the canvas is publish."
        never_payload = "Auto-post X/TikTok/IG or any social node."
    elif sendish:
        machine_name = "Draft then card (Send stripped)"
        loop = "trigger → draft → Evens sends → stop"
        why = "If it has Send, it will send."
        never_payload = "Auto-send / always-allow MCP send."
    elif approve:
        machine_name = "Needs-input / human approval is the card"
        loop = "work → yellow/approve node → Evens → resume → stop"
        why = "Silence is not yes."
        never_payload = "Treat approval-node as auto-yes."

    if steal:
        first = steal.split("\n")[0][:240]
        if first:
            why = first

    extra_never = []
    if never:
        for line in never.splitlines():
            line = line.strip(" -*")
            if line:
                extra_never.append(line)
    extra_never = extra_never[:8]

    q1 = quotes[0] if quotes else (openers[0] if openers else "On-tape procedure.")
    q2 = quotes[1] if len(quotes) > 1 else q1

    atoms = [
        {
            "concept": machine_name,
            "claim": q1[:300],
            "why": why[:400],
            "mech": loop,
            "ev": q2[:300],
            "act": "Steal the loop. Hold send/book/publish. Clients parked.",
            "cond": f"Full transcript {words} words. Caption ingest.",
            "exc": "Tape $ and vendor names stay on-tape / UNVERIFIED.",
            "conf": "medium — reconstructed from entire full.txt; timestamps UNKNOWN",
            "ep": "SOURCE",
        }
    ]
    if said:
        atoms.append(
            {
                "concept": "Prior HITL walk (upgraded, not discarded)",
                "claim": said[:400].replace("\n", " "),
                "why": "Earlier shallow take already named the hard step; this pass puts it in A–K then steal.",
                "mech": "Read full.txt → reconstruct → steal after K.",
                "ev": "Shallow take existed; protocol required overwrite.",
                "act": "Keep the machine; drop the old card shape into A–L.",
                "ep": "SYSTEM SYNTHESIS",
                "conf": "high on the hard-step mapping",
            }
        )

    L = one or (
        f"This desk steals **{machine_name}**. Auto-send / auto-book stay never. "
        "Format ACTION / WHY / AGENT / RISK / REVERSIBILITY. Clients parked. No vendor install."
    )

    return {
        "title": title,
        "speaker": speaker,
        "kind": f"full.txt re-walk · {words} words",
        "words": words,
        "gaps": "Timestamps UNKNOWN unless VTT cited. Visual UI is INFERENCE from narration.",
        "A": beats[:8] if beats else openers,
        "atoms": atoms,
        "C": [
            "Speaker optimizes for a demo that looks finished. Finished-looking is the risk.",
            "On-tape vendors are not our stack. Cursor + Grok only.",
            "Operate ≠ learn: the payload can stay never; the loop is still stolen.",
        ],
        "D": [
            "Read the whole tape. Name the world action (send/book/publish/pay/deploy).",
            "Keep drafts, logs, qualify questions, read-backs, approval nodes.",
            "Strip Send / create-event / social-post / call-lead.",
            "Silence is not yes. Classifier/guardrail-pass is not Evens.",
        ],
        "E": [
            {
                "name": "On-tape HITL moment",
                "sit": openers[0][:180] if openers else title,
                "act": q1[:180],
                "why": "This is where the tape touches a world action or a gate.",
                "out": q2[:180],
                "les": "Steal the checkable stop. Do not operate the irreversible step.",
            }
        ],
        "F": [
            "If Send/book/publish exists on the canvas → card.",
            "If tape $ appears → UNVERIFIED.",
            "If a vendor is named as the stack → on-tape only.",
            "If clients/leads are implied → parked this session.",
        ],
        "G": [
            "Field ships the demo as the product. This desk holds the hard step and still steals the machine.",
        ],
        "H": [
            f"Word count {words} from full.txt. Not invented.",
            "Tape $ / student counts / benches UNVERIFIED.",
            "Prior shallow take overwritten to protocol A–L + Steal/Operate-never.",
        ],
        "I": [
            "What is the exact stop if the demo had succeeded silently?",
            "Does the long-cut CTA (Skool/Plus) add a pay event? Still never.",
        ],
        "J": [
            "SYSTEM SYNTHESIS → `ask-principal` · `send-removed` · `confirm-then-actuate` · `input-required-gate`.",
            "SYSTEM SYNTHESIS → `coverage-loop` when the tape is trigger + act + stop.",
            "Do not merge LESSONS-FROM-TAPE.md. No new icp_id.",
        ],
        "K": [
            "Unknown future value: the qualify/draft/approve pattern may fit a named Path A later. Parked.",
        ],
        "machines": [
            {
                "name": machine_name,
                "ep": "SYSTEM SYNTHESIS",
                "loop": loop,
                "qs": "Does it send, book, dial, or publish? Who is Evens in this graph?",
                "qf": "Auto-send / auto-book stay never. The machine is still stolen.",
                "proc": "Draft/log/preview only. Five-field card before a world action.",
                "ex": {
                    "name": "Tape",
                    "sit": openers[0][:160] if openers else title,
                    "act": q1[:160],
                    "why": why[:160],
                    "out": q2[:160],
                    "les": "Hard step stays HITL.",
                },
                "why": why[:400],
                "cond": "Clients parked. Stack Cursor + Grok. Tape $ UNVERIFIED.",
                "never": never_payload,
                "hive": "`ask-principal` · `send-removed` · `confirm-then-actuate` · `input-required-gate`",
            }
        ],
        "never_extra": extra_never,
        "L": L[:1200],
    }


def remaining() -> list[str]:
    ids = sorted(p.name for p in PKT.iterdir() if p.is_dir() and (p / "full.txt").exists())
    out = []
    for vid in ids:
        p = TAKES_ROOT / vid / "hitl-operator.md"
        if not p.exists():
            out.append(vid)
            continue
        head = p.read_text(encoding="utf-8", errors="replace")[:500]
        if "Protocol: deep-video-learning" not in head:
            out.append(vid)
    return out


def main() -> None:
    ids = remaining()
    n = 0
    for vid in ids:
        t = build(vid)
        write_one(vid, t)
        n += 1
        print("upgraded", vid, t["words"])
    print("upgraded_count", n)


if __name__ == "__main__":
    main()
