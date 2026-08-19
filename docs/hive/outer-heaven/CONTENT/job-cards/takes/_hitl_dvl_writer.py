#!/usr/bin/env python3
"""HITL Operator deep-video-learning take writer. Desk-local helper."""
from __future__ import annotations

from pathlib import Path

TAKES_ROOT = Path(
    "/Users/evenslouis/n8n-cursor/docs/hive/outer-heaven/CONTENT/job-cards/takes"
)
PKT = "docs/hive/outer-heaven/CONTENT/watch-later/packets"

NEVER_CORE = [
    "Auto-send / auto-book / auto-voice-book / auto-publish / auto-pay / auto-deploy.",
    "Quote tape $ / student counts / job-loss % / token burns as FACT.",
    "Install on-tape vendors (Claude Code, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus, n8n-cloud, Skool) as our stack. Cursor + Grok only.",
    "New `icp_id`. Unpark Normand. Outreach / hunt because a tape was interesting.",
    "Always-allow MCP / classifier / guardrail-pass as Evens.",
    "Merge `LESSONS-FROM-TAPE.md`. Send / pay / deploy / book / publish.",
]


def atom_md(a: dict, vid: str) -> str:
    return "\n".join(
        [
            f"### {a['concept']}",
            f"- **Claim:** {a['claim']}",
            f"- **Reasoning:** {a['why']}",
            f"- **Mechanism:** {a['mech']}",
            f"- **Evidence:** {a['ev']}",
            f"- **Conditions:** {a.get('cond', 'On-tape demo / short captions.')}",
            f"- **Exceptions:** {a.get('exc', 'Tape $ and vendor names stay on-tape.')}",
            f"- **Action:** {a['act']}",
            f"- **Confidence:** {a.get('conf', 'medium — caption ingest, timestamp UNKNOWN')}",
            f"- **Source:** `{vid}` @ {a.get('ts', 'UNKNOWN')}",
            f"- **Epistemic:** {a.get('ep', 'SOURCE')}",
        ]
    )


def ex_md(e: dict) -> str:
    return (
        f"**{e.get('name', 'On-tape run')}** — Situation: {e['sit']} → "
        f"Action: {e['act']} → Reasoning: {e['why']} → Outcome: {e['out']} → "
        f"Lesson: {e['les']}"
    )


def machine_md(m: dict, vid: str) -> str:
    return "\n".join(
        [
            f"### Machine: {m['name']}",
            f"- **Epistemic:** {m.get('ep', 'SYSTEM SYNTHESIS')}",
            f"- **Workflow / loop:** {m['loop']}",
            f"- **Questions / signals:** {m.get('qs', '—')}",
            f"- **Qualify / frame / objections:** {m.get('qf', '—')}",
            f"- **Procedure:** {m['proc']}",
            f"- **Example that proves it:** {ex_md(m['ex'])}",
            f"- **Why it works:** {m['why']}",
            f"- **Conditions / exceptions:** {m.get('cond', 'Hard steps stay HITL.')}",
            f"- **Operate-never payload:** {m['never']}",
            f"- **Hive run (existing skills only):** {m.get('hive', '`ask-principal` · `send-removed` · `confirm-then-actuate` · `input-required-gate`')}",
            f"- **Source:** `{vid}` @ {m.get('ts', 'UNKNOWN')}",
        ]
    )


def render(vid: str, t: dict) -> str:
    atoms = "\n\n".join(atom_md(a, vid) for a in t["atoms"])
    examples = "\n\n".join(f"- {ex_md(e)}" for e in t["E"])
    procs = "\n".join(f"- {p}" for p in t["D"])
    rules = "\n".join(f"- {r}" for r in t["F"])
    assum = "\n".join(f"- {h}" for h in t["H"])
    qs = "\n".join(f"- {q}" for q in t["I"])
    conns = "\n".join(f"- {j}" for j in t["J"])
    fut = "\n".join(f"- {k}" for k in t["K"])
    machines = "\n\n".join(machine_md(m, vid) for m in t["machines"])
    never = "\n".join(f"- {n}" for n in (t.get("never_extra", []) + NEVER_CORE))
    beats = "\n".join(f"- {b}" for b in t["A"])
    models = "\n".join(f"- {c}" for c in t["C"])
    contra = "\n".join(f"- {g}" for g in t["G"])
    return f"""# HITL Operator — {vid}
Status: filled
Protocol: deep-video-learning
**Source:** `{t.get('source', f'{PKT}/{vid}/full.txt')}`
**Packet LEARNED:** `{PKT}/{vid}/LEARNED.md`
**ICP:** parked unless Evens named one.

Evens is the visionary. Operate ≠ learn. Role did not filter what was learned. Stack stays Cursor + Grok. Clients parked. No send / pay / deploy / book / publish. Tape $ UNVERIFIED.

## A. Source Map

**Title (PACKET):** {t['title']}
**Speaker / channel:** {t.get('speaker', 'Nate Herk | AI Automation (on-tape)')}
**Kind / words:** {t.get('kind', 'caption ingest')} · {t.get('words', '?')} words
**Gaps:** {t.get('gaps', 'No VTT cited in this take. Timestamps UNKNOWN. Visual-only UI clicks inferred only as INFERENCE.')}

Beats in order:

{beats}

## B. Atomic Knowledge

{atoms}

## C. Mental Models

{models}

## D. Procedures

{procs}

## E. Examples

{examples}

## F. Decision Rules

{rules}

## G. Contrarian

{contra}

## H. Assumptions

{assum}

## I. Questions

{qs}

## J. Connections

{conns}

## K. Future-Use

{fut}

## Steal / Operate-never

Informed by A–K. Auto-send / auto-book stay operate-never. The machine is still stolen.

{machines}

### Operate-never (this desk will not operate)

{never}

## L. Role-Specific Applications

{t['L']}
"""


def write_one(vid: str, t: dict) -> Path:
    out = TAKES_ROOT / vid / "hitl-operator.md"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(render(vid, t), encoding="utf-8")
    return out
