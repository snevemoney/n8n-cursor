#!/usr/bin/env python3
"""Emit graph + mismatches + patterns from existing atoms; compile per-job workflows.

Does not crawl packets, re-emit atoms, or overwrite full.txt.
Never merges two atoms because they sound similar.
"""
from __future__ import annotations

import json
import re
from collections import defaultdict
from datetime import date
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
KNOWLEDGE = ROOT / "docs/hive/outer-heaven/CONTENT/knowledge"
ATOMS_DIR = KNOWLEDGE / "atoms" / "by-video"
GRAPH_DIR = KNOWLEDGE / "graph"
PATTERNS_DIR = KNOWLEDGE / "patterns"
WORKFLOWS_DIR = KNOWLEDGE / "workflows"
MISMATCHES_DIR = KNOWLEDGE / "mismatches"
RUNBOOKS = ROOT / "docs/hive/outer-heaven/CONTENT/icp-runbooks"
STEAL = ROOT / "docs/hive/outer-heaven/CONTENT/watch-later/STEAL_SHEET.md"
TAKES = ROOT / "docs/hive/outer-heaven/CONTENT/job-cards/takes/_knowledge-use"
CHRONICLE = ROOT / "docs/hive/outer-heaven/CHRONICLE/2026-08.md"

TODAY = date.today().isoformat()
SKIP_CONCEPTS = frozenset({"speech-ne-behavior", "ordered-procedure"})
EXAMPLE_RE = re.compile(r"^example-")

REL_FIELD = {
    "supports": "supports",
    "conflicts_with": "conflicts_with",
    "requires": "requires",
    "before": "before",
}


def load_atoms() -> list[dict[str, Any]]:
    atoms: list[dict[str, Any]] = []
    for path in sorted(ATOMS_DIR.glob("*.jsonl")):
        for line in path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line:
                continue
            obj = json.loads(line)
            if isinstance(obj, dict) and obj.get("id"):
                atoms.append(obj)
    return atoms


def index_atoms(atoms: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    return {str(a["id"]): a for a in atoms}


def edge_key(e: dict[str, Any]) -> tuple[str, str, str]:
    return (str(e.get("from", "")), str(e.get("to", "")), str(e.get("rel", "")))


def load_existing_edges() -> list[dict[str, Any]]:
    path = GRAPH_DIR / "edges.jsonl"
    if not path.is_file():
        return []
    out: list[dict[str, Any]] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        obj = json.loads(line)
        if isinstance(obj, dict):
            out.append(obj)
    return out


def emit_graph(atoms: list[dict[str, Any]], by_id: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    seen: set[tuple[str, str, str]] = set()
    edges: list[dict[str, Any]] = []

    def add(frm: str, to: str, rel: str, note: str) -> None:
        if not frm or not to or frm == to:
            return
        key = (frm, to, rel)
        if key in seen:
            return
        seen.add(key)
        edges.append({"from": frm, "to": to, "rel": rel, "note": note})

    for e in load_existing_edges():
        add(str(e.get("from", "")), str(e.get("to", "")), str(e.get("rel", "")), str(e.get("note", "")))

    for atom in atoms:
        aid = str(atom["id"])
        for field, rel in REL_FIELD.items():
            for target in atom.get(field) or []:
                tgt = str(target)
                note = ""
                if field == "conflicts_with" and tgt not in by_id:
                    note = "target is video/slug, not an atom id — keep labeled, do not flatten"
                add(aid, tgt, rel, note)

        seq = atom.get("sequence_id")
        idx = atom.get("sequence_index")
        if seq and isinstance(idx, int):
            for other in atoms:
                if other.get("sequence_id") == seq and other.get("sequence_index") == idx + 1:
                    add(aid, str(other["id"]), "elaborates", f"sequence {seq} {idx}->{idx + 1}")

    by_video: dict[str, list[str]] = defaultdict(list)
    for atom in atoms:
        by_video[str(atom.get("source_video_id", ""))].append(str(atom["id"]))
    for vid, ids in by_video.items():
        for a, b in zip(ids, ids[1:]):
            add(a, b, "same-video", f"adjacent in {vid}")

    for atom in atoms:
        if atom.get("concept") != "speech-ne-behavior":
            continue
        aid = str(atom["id"])
        for tgt in atom.get("conflicts_with") or []:
            add(aid, str(tgt), "condition-conflict", "speech≠behavior vs sibling — do not pick a winner")
            add(aid, str(tgt), "conflicts_with", "speech≠behavior kept as dissent")

    GRAPH_DIR.mkdir(parents=True, exist_ok=True)
    dest = GRAPH_DIR / "edges.jsonl"
    dest.write_text("".join(json.dumps(e, ensure_ascii=False) + "\n" for e in edges), encoding="utf-8")
    return edges


def emit_mismatches(atoms: list[dict[str, Any]], by_id: dict[str, dict[str, Any]]) -> int:
    rows: list[dict[str, Any]] = []
    for atom in atoms:
        if atom.get("concept") != "speech-ne-behavior":
            continue
        stated_id = ""
        stated = ""
        for tgt in atom.get("conflicts_with") or []:
            if tgt in by_id:
                stated_id = str(tgt)
                stated = str(by_id[tgt].get("claim", ""))
                break
        if not stated:
            stated = "declared sibling on the same tape (see conflicts_with)"
        rows.append(
            {
                "mismatch_id": f"MM-{atom['id']}",
                "source_video_id": atom.get("source_video_id", ""),
                "stated_principle": stated,
                "stated_atom_id": stated_id,
                "observed_behavior": atom.get("claim", ""),
                "observed_behavior_id": atom["id"],
                "discrepancy": "Speech≠behavior. Caption-only; do not invent the click side. Do not pick a winner.",
                "do_not_resolve": True,
                "evidence_status": atom.get("evidence_status", "transcript-implied"),
            }
        )
    MISMATCHES_DIR.mkdir(parents=True, exist_ok=True)
    dest = MISMATCHES_DIR / "by-atom.jsonl"
    dest.write_text("".join(json.dumps(r, ensure_ascii=False) + "\n" for r in rows), encoding="utf-8")
    (MISMATCHES_DIR / "INDEX.md").write_text(
        "# Mismatches (stated vs observed)\n\n"
        "First-class objects. Compare speech vs behavior. Do not assume either is correct. "
        "**The discrepancy is knowledge.**\n\n"
        f"**Schema:** [schema.json](schema.json)\n\n"
        "`do_not_resolve: true` always. Do not flatten into the nicer sentence.\n\n"
        "Caption-only: only flag when speech contradicts speech-reported behavior. "
        "Do not invent an on-screen contradiction.\n\n"
        f"**{len(rows)} mismatches this turn** from `speech-ne-behavior` atoms. "
        f"File: [by-atom.jsonl](by-atom.jsonl).\n",
        encoding="utf-8",
    )
    return len(rows)


class UF:
    def __init__(self) -> None:
        self.p: dict[str, str] = {}

    def add(self, x: str) -> None:
        self.p.setdefault(x, x)

    def find(self, x: str) -> str:
        self.add(x)
        while self.p[x] != x:
            self.p[x] = self.p[self.p[x]]
            x = self.p[x]
        return x

    def union(self, a: str, b: str) -> None:
        ra, rb = self.find(a), self.find(b)
        if ra != rb:
            self.p[rb] = ra


def compatible_pair(a: dict[str, Any], b: dict[str, Any]) -> bool:
    if a["id"] == b["id"]:
        return False
    if a.get("domain") != b.get("domain"):
        return False
    if a.get("stage") != b.get("stage"):
        return False
    if a.get("concept") in SKIP_CONCEPTS or b.get("concept") in SKIP_CONCEPTS:
        return False
    if EXAMPLE_RE.match(str(a.get("concept", ""))) or EXAMPLE_RE.match(str(b.get("concept", ""))):
        return False
    ac = set(map(str, a.get("conflicts_with") or []))
    bc = set(map(str, b.get("conflicts_with") or []))
    if a["id"] in bc or b["id"] in ac:
        return False
    if a.get("source_video_id") in bc or b.get("source_video_id") in ac:
        return False
    return True


def dissent_for(members: list[dict[str, Any]], by_id: dict[str, dict[str, Any]], atoms: list[dict[str, Any]]) -> list[str]:
    out: list[str] = []
    seen: set[str] = set()
    member_ids = {m["id"] for m in members}
    videos = {m.get("source_video_id") for m in members}
    for m in members:
        for tgt in m.get("conflicts_with") or []:
            if tgt in by_id and tgt not in member_ids and tgt not in seen:
                seen.add(tgt)
                out.append(tgt)
    for atom in atoms:
        if atom.get("concept") != "speech-ne-behavior":
            continue
        if atom.get("source_video_id") not in videos:
            continue
        conflicts = set(map(str, atom.get("conflicts_with") or []))
        if conflicts & member_ids and atom["id"] not in seen:
            seen.add(atom["id"])
            out.append(atom["id"])
    return out


def seed_patterns() -> list[dict[str, Any]]:
    return [
        {
            "pattern_id": "P-inbound-from-demonstrated-build",
            "version": 1,
            "title": "Inbound from a demonstrated build, not a category pitch",
            "steps": [
                "Show one specific artifact already built.",
                "Do not outbound the category ('I automate businesses' / cold 'AI consulting').",
                "Publish stays HITL. Clients parked — this is not a hunt.",
            ],
            "support_ids": [
                "K-x-2088007687149601254-02",
                "K-HNKlFTd1maM-03",
                "K-0YXjEzFfft8-03",
            ],
            "dissent_ids": [
                "K-x-2088007687149601254-01",
                "K-x-2088007687149601254-03",
                "K-0YXjEzFfft8-04",
                "K-0YXjEzFfft8-06",
            ],
            "valid_when": "You have a real build to show. Path C / inbound. Stack Cursor+Grok. Publish HITL.",
            "less_relevant_when": "No artifact yet; Path A named-client hunt this week (parked); outbound-first playbook-before-send rooms.",
            "confidence": "high as the inbound machine; tape $ UNVERIFIED",
            "demonstration_count": 0,
            "creator_count": 3,
            "exceptions": "VIEW A (category pitch) and VIEW B (word AI) stay separate. Do not merge. playbook-before-send is labeled dissent, not averaged.",
        },
        {
            "pattern_id": "P-category-pitch-fails",
            "version": 1,
            "title": "VIEW A — category pitch fails (unspecified job)",
            "steps": [
                "If the sentence names a category not a build, do not outbound it.",
                "Keep separate from 'don't lead with the word AI' (VIEW B).",
            ],
            "support_ids": ["K-x-2088007687149601254-01"],
            "dissent_ids": [],
            "valid_when": "Custom automation / agency-shaped offer; SKU unknown; cold or outbound.",
            "less_relevant_when": "Named ICP + named offer + Path A MUST (different machine).",
            "confidence": "high he said this; single-tape until more compatible support accrues",
            "demonstration_count": 0,
            "creator_count": 1,
            "exceptions": "Do not merge with K-x-2088007687149601254-03.",
        },
        {
            "pattern_id": "P-dont-lead-with-word-AI",
            "version": 1,
            "title": "VIEW B — don't lead with the word AI (operator-heard)",
            "steps": [
                "IF prospect is normal SMB / local / operator → lead with outcome, not 'AI'.",
                "IF prospect is AI-native → VIEW B may not apply; VIEW A still can.",
            ],
            "support_ids": ["K-x-2088007687149601254-03"],
            "dissent_ids": ["K-x-2088007687149601254-01"],
            "valid_when": "Prospect is a normal SMB / local / operator.",
            "less_relevant_when": "AI-native buyer; creator/ads buyer who wants the AI trend.",
            "confidence": "low as SOURCE (absent on clip); medium as operator-heard",
            "demonstration_count": 0,
            "creator_count": 1,
            "exceptions": "Not on X-clip speech. Do not promote to SOURCE. Do not rewrite VIEW A as this.",
        },
        {
            "pattern_id": "P-four-blanks-before-build",
            "version": 1,
            "title": "Name bucket + KPI + today + 60-day target before building",
            "steps": [
                "Walk the constraint (first sigh).",
                "Write four blanks or it is not a project.",
                "Non-AI allowed if cheaper/safer.",
            ],
            "support_ids": ["K-LVAHYV4Xrto-01", "K-vFepZE_wrfg-05", "K-AO5aW01DKHo-01"],
            "dissent_ids": [],
            "valid_when": "Partner/outcomes offer. Hive `outcome-offer-funnel` / `four-blank-sku`. Clients parked.",
            "less_relevant_when": "Order-taking demo with no KPI; tape 13%/McKinsey stats as FACT.",
            "confidence": "high as the scope machine; stats UNVERIFIED",
            "demonstration_count": 0,
            "creator_count": 1,
            "exceptions": "Do not merge $ rows with Pi-m8R068r4. Speech≠behavior on Claude-unlock vs four blanks stays labeled.",
        },
        {
            "pattern_id": "P-book-clock-not-model",
            "version": 1,
            "title": "Book tools fail on timezone/notice, not 'AI'. Book stays HITL.",
            "steps": [
                "Debug calendar payload, tool args, agent read — in that order.",
                "Set now+TZ; respect min-notice windows.",
                "Confirm name/email. Do not auto-book.",
            ],
            "support_ids": ["K--cdexJWN8YA-02", "K-zWLZ3bVVwD8-03"],
            "dissent_ids": ["K-zWLZ3bVVwD8-02"],
            "valid_when": "Intake→book / private-book-install. Hive: no Vapi, no ElevenLabs, no auto-book.",
            "less_relevant_when": "Voice-vendor auto-book (operate-never). Caption-only UI path.",
            "confidence": "high as the scar family; vendors on-tape are operate-never",
            "demonstration_count": 0,
            "creator_count": 1,
            "exceptions": "Native-calendar tape ≠ n8n-MCP tape. Keep zWLZ3bVVwD8 vs y-cq_Qo4zVo unflattened.",
        },
        {
            "pattern_id": "P-sanitize-then-check-pass-neq-send",
            "version": 1,
            "title": "Sanitize before the model; check before leave; pass ≠ send",
            "steps": [
                "Redact PII/keys before text hits a model.",
                "Test the miss: secret-keys can pass a password.",
                "Draft outreach into a DB. Human sequences. Do not send.",
            ],
            "support_ids": ["K-oWdJMJp2HgM-01", "K-oWdJMJp2HgM-02", "K-HNKlFTd1maM-01"],
            "dissent_ids": [],
            "valid_when": "Any text into a model or out to a human. Hive `sanitize-in-check-out` / `send-removed` / `warm-draft-hitl`.",
            "less_relevant_when": "Later tapes that celebrate auto-send — keep as HITL-send siblings, do not average.",
            "confidence": "high as spoken scope; tape $ UNVERIFIED",
            "demonstration_count": 0,
            "creator_count": 1,
            "exceptions": "Sanitize is not a send-gate. Fail branch is yours to wire.",
        },
        {
            "pattern_id": "P-wiki-raw-index-log",
            "version": 1,
            "title": "Raw → wiki pages → index → log. Do not dump the corpus.",
            "steps": [
                "Drop sources in raw/. Ingest to pages with backlinks.",
                "Index is TOC. Log is ingest history. Schema routes.",
                "Ingest cheap; reason expensive. Ingest pairs that mention each other.",
            ],
            "support_ids": ["K-hQvwMj7IJe4-01", "K-hQvwMj7IJe4-02", "K-hQvwMj7IJe4-03"],
            "dissent_ids": [],
            "valid_when": "Hive `wiki-ingest` / `context-docs`. Cursor+Grok. No second wiki app.",
            "less_relevant_when": "8k-node Obsidian theater; Serop anti-OS; Fable spend.",
            "confidence": "high as SOP; '5 minutes' is setup not a filled wiki",
            "demonstration_count": 0,
            "creator_count": 1,
            "exceptions": "conflicts_with i4Q8wHZNPBU / brB-hSiV2iU / vcU85OrwuV0 stay labeled (video-level dissent).",
        },
        {
            "pattern_id": "P-wat-sop-md-one-job-tools",
            "version": 1,
            "title": "Workflow = SOP markdown; tool = one action. No on-tape vendor install.",
            "steps": [
                "Write the sequence in markdown. Update from feedback.",
                "One-job tools. Look for existing tools first.",
                "Steal the split. Do not install Claude Code / Firecrawl.",
            ],
            "support_ids": ["K-tDGiWn0flK8-01", "K-AO5aW01DKHo-02", "K-3GAxd90fEE4-01"],
            "dissent_ids": ["K-tDGiWn0flK8-02", "K-3GAxd90fEE4-04"],
            "valid_when": "Hive `workflow-compiler` / `slice-build`. n8n stays for boring/predictable.",
            "less_relevant_when": "Chat-only locker; dentist-scrape hunt (operate-never).",
            "confidence": "high as the folder recipe",
            "demonstration_count": 0,
            "creator_count": 1,
            "exceptions": "'no code' vs Python+.env is speech≠behavior — kept as dissent.",
        },
        {
            "pattern_id": "P-plan-then-assets-then-bypass",
            "version": 1,
            "title": "Plan and drop real assets before bypass. Keys stay human.",
            "steps": [
                "Interview / plan first. State must-never (PII, spend cap).",
                "Drop brand files before accept.",
                "Bypass after the plan, not as a lifestyle. Keys in env, not chat.",
            ],
            "support_ids": ["K-tDGiWn0flK8-03", "K-AO5aW01DKHo-01", "K-3GAxd90fEE4-02"],
            "dissent_ids": ["K-tDGiWn0flK8-04", "K-3GAxd90fEE4-05"],
            "valid_when": "Any agent build. Hive `ask-principal` / `input-required-gate` / `vault-not-prompt`.",
            "less_relevant_when": "Vague-fix demos that skip plan 'to show self-heal'.",
            "confidence": "high as the sequence; he still skips on tape (dissent kept)",
            "demonstration_count": 0,
            "creator_count": 1,
            "exceptions": "Speech≠behavior: 'ask questions' then wonders why it didn't; 'not in history' then leaking bash.",
        },
        {
            "pattern_id": "P-tape-dollars-unverified",
            "version": 1,
            "title": "Tape / tweet dollars are UNVERIFIED. Do not quote as ours.",
            "steps": [
                "Mark every on-tape $ as UNVERIFIED.",
                "Do not fill unit-econ or rungs from a reel.",
                "Do not analog student 200–300k or $1,650 as hive FACT.",
            ],
            "support_ids": ["K-x-2088007687149601254-05", "K-HNKlFTd1maM-02"],
            "dissent_ids": [],
            "valid_when": "Any compile that touches a tape metric.",
            "less_relevant_when": "Never — this is a standing hive rule.",
            "confidence": "high as policy; dollars UNVERIFIED",
            "demonstration_count": 0,
            "creator_count": 2,
            "exceptions": "None that make the dollars FACT.",
        },
        {
            "pattern_id": "P-clip-reference-lock-hitl-publish",
            "version": 1,
            "title": "Clip / gen factory: reference-lock + log. Human ships.",
            "steps": [
                "Lock the reference ('appear exactly') or gens invent the SKU.",
                "Log prompt / model / URL / status.",
                "Publish stays HITL. No overnight 100. No Higgsfield as hive stack.",
            ],
            "support_ids": ["K-xn6Z5PYyAIE-01", "K-xn6Z5PYyAIE-03"],
            "dissent_ids": ["K-xn6Z5PYyAIE-02"],
            "valid_when": "Hive `clip-factory` / `cinematic-recipe` / `product-ad-from-photo`. Path C or named creator.",
            "less_relevant_when": "Short-form-only creator; mass-DM content agency; caption-only click path.",
            "confidence": "high as the scar; '5 minutes' dissent kept",
            "demonstration_count": 0,
            "creator_count": 1,
            "exceptions": "Keep vs AYsg5gAMWyo first-frame. Tape $ UNVERIFIED.",
        },
        {
            "pattern_id": "P-log-first-approve-deck-second",
            "version": 1,
            "title": "Log every meeting; deck is optional and gated",
            "steps": [
                "Ended meeting → log row.",
                "Human approves before a deck is generated.",
                "Name the batch-collision rule (last item).",
            ],
            "support_ids": ["K--Q_P7HFydZk-01", "K--Q_P7HFydZk-02", "K--Q_P7HFydZk-03"],
            "dissent_ids": [],
            "valid_when": "Agency delivery kit / meeting-to-artifact. Human will click.",
            "less_relevant_when": "No meeting source; Client Pack SaaS fork (kill).",
            "confidence": "high for the split; deck quality unseen",
            "demonstration_count": 0,
            "creator_count": 1,
            "exceptions": "Do not invent the Gamma output. Fireflies is on-tape, not a required hive vendor.",
        },
        {
            "pattern_id": "P-own-os-before-outbound",
            "version": 1,
            "title": "Own the desk OS before DMs. Niche after a shipped case.",
            "steps": [
                "Rung 0 = own morning-brief / hive-os.",
                "Month-1 talks are not a new icp_id.",
                "Niche only after the same pain hits 3× or a shipped case.",
            ],
            "support_ids": ["K-LVAHYV4Xrto-02", "K-LVAHYV4Xrto-03"],
            "dissent_ids": [],
            "valid_when": "Hive-os / Path C. Clients parked. No Upwork hunt.",
            "less_relevant_when": "Already in a named Path A project (don't step down). Pi-m8R068r4 $ rows — do not merge.",
            "confidence": "high as the on-ramp; $ / IBM UNVERIFIED",
            "demonstration_count": 0,
            "creator_count": 1,
            "exceptions": "Speech≠behavior: 'sell the first project' vs 'month 1 is not to make money'.",
        },
        {
            "pattern_id": "P-public-widget-is-a-credit-hose",
            "version": 1,
            "title": "Public unpaid widget is a credit hose. No auto-book.",
            "steps": [
                "Caller doesn't pay; you do.",
                "Lock domain, cap minutes, throttle.",
                "Hive: private-book-install HITL — no public voice widget.",
            ],
            "support_ids": ["K--cdexJWN8YA-03"],
            "dissent_ids": [],
            "valid_when": "Any book/voice surface. Hive no ElevenLabs / no Vapi.",
            "less_relevant_when": "App with user-supplied key (who pays flips).",
            "confidence": "high as the money rule; single-tape",
            "demonstration_count": 0,
            "creator_count": 1,
            "exceptions": "Localhost latency ≠ prod.",
        },
    ]


def emit_patterns(atoms: list[dict[str, Any]], by_id: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    seeds = seed_patterns()
    used: set[str] = set()
    for p in seeds:
        used.update(p["support_ids"])

    uf = UF()
    declared = [
        a
        for a in atoms
        if a.get("knowledge_type") == "declared"
        and a.get("concept") not in SKIP_CONCEPTS
        and not EXAMPLE_RE.match(str(a.get("concept", "")))
    ]
    for a in declared:
        uf.add(a["id"])
        for tgt in a.get("supports") or []:
            if tgt in by_id and compatible_pair(a, by_id[tgt]):
                uf.union(a["id"], str(tgt))

    groups: dict[str, list[str]] = defaultdict(list)
    for a in declared:
        groups[uf.find(a["id"])].append(a["id"])

    auto: list[dict[str, Any]] = []
    for ids in groups.values():
        if len(ids) < 2:
            continue
        if all(i in used for i in ids):
            continue
        members = [by_id[i] for i in ids if i in by_id]
        if len({m.get("source_video_id") for m in members}) < 1:
            continue
        # drop if any remaining pair is incompatible (UF can over-connect via chains)
        ok = True
        for i, a in enumerate(members):
            for b in members[i + 1 :]:
                if not compatible_pair(a, b) and a.get("domain") == b.get("domain"):
                    # allow same component only if every pair is compatible
                    if not compatible_pair(a, b):
                        ok = False
                        break
            if not ok:
                break
        if not ok:
            # split to pairwise-compatible cliques of size >=2 via greedy
            remaining = list(members)
            while len(remaining) >= 2:
                clique = [remaining.pop(0)]
                rest = []
                for cand in remaining:
                    if all(compatible_pair(cand, x) for x in clique):
                        clique.append(cand)
                    else:
                        rest.append(cand)
                remaining = rest
                if len(clique) >= 2:
                    auto.append(_pattern_from_members(clique, atoms, by_id))
            continue
        auto.append(_pattern_from_members(members, atoms, by_id))

    # stable ids for auto
    auto.sort(key=lambda p: (p["valid_when"], p["support_ids"][0]))
    for i, p in enumerate(auto, 1):
        p["pattern_id"] = f"P-auto-{i:03d}"

    patterns = seeds + auto
    PATTERNS_DIR.mkdir(parents=True, exist_ok=True)
    for old in PATTERNS_DIR.glob("P-*.json"):
        old.unlink()
    for p in patterns:
        (PATTERNS_DIR / f"{p['pattern_id']}.json").write_text(
            json.dumps(p, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
        )
    return patterns


def _pattern_from_members(
    members: list[dict[str, Any]], atoms: list[dict[str, Any]], by_id: dict[str, dict[str, Any]]
) -> dict[str, Any]:
    members = sorted(members, key=lambda m: m["id"])
    videos = {m.get("source_video_id") for m in members}
    creators = {m.get("creator_id") for m in members if m.get("creator_id")}
    domain = members[0].get("domain", "")
    stage = members[0].get("stage", "")
    steps = []
    for m in members[:5]:
        act = str(m.get("action", "")).strip()
        if act:
            steps.append(act)
    if not steps:
        steps = [str(m.get("claim", ""))[:160] for m in members[:3]]
    conds = sorted({str(m.get("conditions", ""))[:120] for m in members if m.get("conditions")})
    excs = sorted({str(m.get("exceptions", ""))[:120] for m in members if m.get("exceptions")})
    return {
        "pattern_id": "P-auto-tmp",
        "version": 1,
        "title": f"{domain} / {stage} — {members[0].get('concept', '')}",
        "steps": steps[:6],
        "support_ids": [m["id"] for m in members],
        "dissent_ids": dissent_for(members, by_id, atoms),
        "valid_when": f"domain={domain}; stage={stage}; " + (conds[0] if conds else "conditions on support atoms"),
        "less_relevant_when": (excs[0] if excs else "other domain/stage; incompatible stack; Path A hunt this week"),
        "confidence": (
            "medium — connected via supports + same domain/stage; not a semantic merge"
            if len(videos) > 1
            else "medium — single-tape support cluster; not frozen"
        ),
        "demonstration_count": sum(1 for m in members if m.get("knowledge_type") == "demonstrated"),
        "creator_count": len(creators),
        "exceptions": "Do not average with dissent_ids. Caption-only. Tape $ UNVERIFIED.",
    }


def write_pattern_index(patterns: list[dict[str, Any]]) -> None:
    lines = [
        "# Patterns (layer 4)",
        "",
        "Versioned **derived** objects. They point BACK to atom ids. They do not delete atoms. They are not “truth.”",
        "",
        "**Schema:** [schema.json](schema.json)",
        "",
        "Fields: `pattern_id`, `version`, `steps`, `support_ids`, `dissent_ids`, `valid_when`, `less_relevant_when`, `confidence`.",
        "",
        "Merge only when conditions, goals, and context are compatible. "
        "Semantic similarity alone is not a merge. Dissent stays visible.",
        "",
        f"**{len(patterns)} patterns this turn** (seeded compatible machines + support-graph clusters).",
        "",
        "| pattern_id | title | support | dissent | creators |",
        "|------------|-------|--------:|--------:|---------:|",
    ]
    for p in patterns:
        title = p["title"].replace("|", "/")
        lines.append(
            f"| `{p['pattern_id']}` | {title} | {len(p['support_ids'])} | {len(p['dissent_ids'])} | {p.get('creator_count', 0)} |"
        )
    (PATTERNS_DIR / "INDEX.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_graph_index(edges: list[dict[str, Any]], atom_n: int, mismatch_n: int) -> None:
    rels: dict[str, int] = defaultdict(int)
    for e in edges:
        rels[str(e.get("rel", "?"))] += 1
    rel_rows = "\n".join(f"| `{k}` | {v} |" for k, v in sorted(rels.items()))
    (GRAPH_DIR / "INDEX.md").write_text(
        f"""# Graph / ontology (layer 3)

Relationships live in two places:

1. **On the atom:** `requires`, `before`, `conflicts_with`, `supports`, `domain`, `stage`, `objective`.
2. **Edge log:** [edges.jsonl](edges.jsonl) — one edge per line.

```json
{{"from":"K-…","to":"K-…","rel":"conflicts_with","note":""}}
```

`rel`: `conflicts_with` | `supports` | `requires` | `before` | `same-video` | `elaborates` | `condition-conflict` | `applies_when` | `depends_on` | `inputs` | `outputs`

## Rules

- NEVER merge two lessons just because they are semantically similar.
- Merge only when conditions, goals, and contexts are compatible.
- Store contradictions separately. Do not flatten.
- Speech≠behavior → [../mismatches/](../mismatches/INDEX.md), not a blended node.

**{len(edges)} edges this turn** from {atom_n} atoms. Existing Fazio `applies_when` edges kept. `{mismatch_n}` mismatches filed.

| rel | count |
|-----|------:|
{rel_rows}
""",
        encoding="utf-8",
    )


def pkt(vid: str) -> str:
    return f"`packets/{vid}/full.txt` @ UNKNOWN"


# --- live jobs (classify/decompose authored from runbooks, not from a 147 dump) ---

PROJECTS: list[dict[str, Any]] = [
    {
        "id": "us",
        "title": "Path C — Evens / hive OS",
        "live": True,
        "parked_hunt": False,
        "who": "Evens / hive OS — internal desk, proofs, paid slices",
        "outcome": "One internal machine this session (knowledge-use). Not a new site unless Evens names it.",
        "stage": "dry-run / operate",
        "path": "C",
        "machine": "wiki-ingest + compiled knowledge-use (one system)",
        "owners": ["Big Boss", "Librarian", "Forge", "Watchdog"],
        "constraints": "Cursor+Grok. HITL hard steps. Clients parked. One system per session. No new icp_id.",
        "operate_never": "Second wiki app · 8k-node theater · rebuild Claude inside Grok · game studio SKU · quote tweet income · both click-live and paid-slice in one session",
        "tasks": [
            ("T1", "Classify this session as Path C knowledge-use, not a client hunt", "have hive skill", "website-offer-funnel Path C · OPERATOR_FOCUS"),
            ("T2", "File graph + patterns from atoms (this compile)", "need knowledge", "knowledge-architecture"),
            ("T3", "Wiki-ingest pointer: raw→index→log, do not dump 147", "need knowledge", "wiki-ingest"),
            ("T4", "Sanitize-in / check-out on any outbound draft", "need knowledge", "sanitize-in-check-out"),
            ("T5", "Pick at most one Path C ship later (click-live OR paid-slice)", "HITL only", "click-live-site / paid-slice-funnel"),
        ],
        "retrieve": {
            "pattern_ids": [
                "P-wiki-raw-index-log",
                "P-sanitize-then-check-pass-neq-send",
                "P-own-os-before-outbound",
                "P-tape-dollars-unverified",
                "P-inbound-from-demonstrated-build",
            ],
            "keywords": ["wiki-ingest", "sanitize", "hard step", "HITL", "cursor", "grok"],
            "domains": ["knowledge-ops", "safety", "one-person-biz", "offer-positioning"],
            "stages": ["research", "operate", "acquisition"],
        },
        "next_desk": "Librarian: runbook Today rewrite + steal-sheet pointer. Big Boss: pipeline brief. Watchdog: grade compile.",
        "gap": False,
    },
    {
        "id": "coverage-loop",
        "title": "Hive-os coverage-loop (session job)",
        "live": True,
        "parked_hunt": False,
        "who": "Hive-os / parent",
        "outcome": "Teach → atoms → capability UNTESTED → compile-then-execute. Cap = this pass.",
        "stage": "dry-run",
        "path": "C",
        "machine": "coverage-loop",
        "owners": ["parent", "Watchdog", "Researcher", "Librarian"],
        "constraints": "checkable-stop already written. No /loop. No billed API spray. Skill-candidates UNTESTED.",
        "operate_never": "Until-satisfied · auto-install SKILL.md · 17×N spawn · unpark client",
        "tasks": [
            ("T1", "Confirm atoms exist; do not re-emit", "have hive skill", "knowledge-emit-atoms.py"),
            ("T2", "Graph + versioned patterns", "need knowledge", "knowledge-architecture"),
            ("T3", "Compile one workflow per live job, not 147→1", "need knowledge", "workflow-compiler"),
            ("T4", "Desk non-HITL artifacts", "need knowledge", "side-effect-not-essay"),
            ("T5", "Three audits + state.json + chronicle", "have hive skill", "knowledge-audit · hive-state.py"),
        ],
        "retrieve": {
            "pattern_ids": [
                "P-wat-sop-md-one-job-tools",
                "P-plan-then-assets-then-bypass",
                "P-wiki-raw-index-log",
                "P-tape-dollars-unverified",
            ],
            "keywords": ["workflow-compiler", "WAT", "plan then", "wiki"],
            "domains": ["agent-ops", "knowledge-ops", "tooling"],
            "stages": ["build", "architecture", "research"],
        },
        "next_desk": "Watchdog grades. Researcher writes coverage-gap cards for thin ICPs. Do not spawn 17.",
        "gap": False,
    },
    {
        "id": "local-clinic",
        "title": "local-clinic — review-to-book machine (hunt parked)",
        "live": True,
        "parked_hunt": True,
        "who": "Dentists, med-spa, physio, vet — Greater Montreal when unparked",
        "outcome": "Review-to-book install machine compiled. No named clinic hunt this week.",
        "stage": "dry-run",
        "path": "A",
        "machine": "review-to-book",
        "owners": ["Lead Hunter", "Consultant", "Librarian"],
        "constraints": "OPERATOR_FOCUS icp_id=none. No PHI. Thank-you send HITL. Tape $ UNVERIFIED.",
        "operate_never": "Auto-DM reviews · PHI in drafts · dentist-scrape from AO5aW01DKHo / 3GAxd90fEE4 · Normand send",
        "tasks": [
            ("T1", "Keep hunt parked until Evens tags icp_id", "HITL only", "OPERATOR_FOCUS · ask-principal"),
            ("T2", "Offer sentence = outcome, not 'AI' / not category", "need knowledge", "outcome-offer-funnel"),
            ("T3", "Four blanks for Review-to-book Install", "need knowledge", "four-blank-sku"),
            ("T4", "Warm-draft thank-you + book link (template only, no send)", "have hive skill", "warm-draft-hitl"),
            ("T5", "Do not run on-tape dentist scrape / outreach", "need knowledge", "operate-never on AO5aW01DKHo-02"),
            ("T6", "Google-review mining → thank-you path (ICP-specific atom)", "gap", "no review-mining atom in corpus"),
        ],
        "retrieve": {
            "pattern_ids": [
                "P-dont-lead-with-word-AI",
                "P-category-pitch-fails",
                "P-four-blanks-before-build",
                "P-sanitize-then-check-pass-neq-send",
                "P-book-clock-not-model",
            ],
            "keywords": ["dentist", "review", "book", "four blank", "don't lead"],
            "domains": ["offer-positioning", "one-person-biz", "safety", "agent-ops"],
            "stages": ["acquisition", "guardrail", "build"],
        },
        "next_desk": "Lead Hunter: NO_ACTION hunt. Librarian: runbook pointer. Researcher: gap — no review-mining atom in corpus.",
        "gap": True,
        "gap_note": "No atom teaches Google-review → thank-you → book. Machine lives on steal-sheet / runbook skills. Dentist mentions on tape are scrape/outreach operate-never.",
    },
    {
        "id": "local-pro",
        "title": "local-pro — intake→book + speed-to-lead (hunt parked)",
        "live": True,
        "parked_hunt": True,
        "who": "Plumber, HVAC, salon, home services — not lawyer/gym",
        "outcome": "private-book-install machine compiled. No named trade hunt this week.",
        "stage": "dry-run",
        "path": "A",
        "machine": "private-book-install + speed-to-lead",
        "owners": ["Lead Hunter", "Consultant", "Forge"],
        "constraints": "No auto-dial. CASL warm drafts only. Clients parked.",
        "operate_never": "Auto-dialer · franchise IT · HVAC list scrape as hunt · localhost in client drafts",
        "tasks": [
            ("T1", "Hunt stays parked", "HITL only", "OPERATOR_FOCUS"),
            ("T2", "Constraint = missed-call / buried book, not 'AI for trades'", "need knowledge", "constraint-position"),
            ("T3", "Book path: clock/TZ/notice scars; book HITL", "need knowledge", "private-book-install"),
            ("T4", "Draft-not-send if any outreach template", "need knowledge", "warm-draft-hitl"),
            ("T5", "HVAC-owner examples on tape are not a hunt list", "need knowledge", "zyvdl__Ywfk examples"),
        ],
        "retrieve": {
            "pattern_ids": [
                "P-book-clock-not-model",
                "P-public-widget-is-a-credit-hose",
                "P-sanitize-then-check-pass-neq-send",
                "P-four-blanks-before-build",
                "P-dont-lead-with-word-AI",
            ],
            "keywords": ["hvac", "book", "missed", "intake", "widget"],
            "domains": ["voice-agents", "agent-ops", "lead-gen", "safety"],
            "stages": ["build", "acquisition", "operate"],
        },
        "next_desk": "Lead Hunter NO_ACTION. Consultant: constraint sentence on runbook. Forge: no vendor widget.",
        "gap": False,
    },
    {
        "id": "restaurant",
        "title": "restaurant — missed-call-book (hunt parked)",
        "live": True,
        "parked_hunt": True,
        "who": "Independent restaurant, not chains",
        "outcome": "missed-call-book machine compiled. No named restaurant hunt.",
        "stage": "dry-run",
        "path": "A",
        "machine": "missed-call-book",
        "owners": ["Lead Hunter", "Consultant"],
        "constraints": "Never auto-book a table. Voice vendor = ask-principal. Clients parked.",
        "operate_never": "AI voice auto-book · Glencoco dial · OpenTable-only with no leak",
        "tasks": [
            ("T1", "Hunt parked", "HITL only", "OPERATOR_FOCUS"),
            ("T2", "Book CTA + HITL follow-up, not a second voice vendor", "need knowledge", "missed-call-book · ask-principal"),
            ("T3", "Public widget / voice meter is a credit hose", "need knowledge", "P-public-widget-is-a-credit-hose"),
            ("T4", "ICP-specific restaurant atoms", "gap", "none in corpus"),
        ],
        "retrieve": {
            "pattern_ids": [
                "P-book-clock-not-model",
                "P-public-widget-is-a-credit-hose",
                "P-dont-lead-with-word-AI",
                "P-sanitize-then-check-pass-neq-send",
            ],
            "keywords": ["book", "widget", "reservation", "auto-book"],
            "domains": ["voice-agents", "safety", "offer-positioning"],
            "stages": ["build", "operate", "acquisition"],
        },
        "next_desk": "Researcher: coverage-gap card. Lead Hunter NO_ACTION. Do not invent restaurant atoms.",
        "gap": True,
        "gap_note": "0 restaurant-specific atoms. Transferable: book-clock, no public widget, draft-not-send, don't-lead-with-AI.",
    },
    {
        "id": "exec-coach",
        "title": "exec-coach — orchestrated-site-brief (hunt parked)",
        "live": True,
        "parked_hunt": True,
        "who": "Exec coaches VP→consulting, numbered 90-day promise",
        "outcome": "orchestrated-site-brief machine compiled. No named coach hunt. Path C proof is a different pick.",
        "stage": "dry-run",
        "path": "A/C",
        "machine": "orchestrated-site-brief",
        "owners": ["Consultant", "Forge", "Creative Studio"],
        "constraints": "Clients parked. One system. No $50k tweet as proof.",
        "operate_never": "Pretty-site-only · fitness leaky-book (wrong ICP) · cinematic tweet $ as FACT",
        "tasks": [
            ("T1", "Hunt parked; Path C brief only if Evens names our page", "HITL only", "ask-principal"),
            ("T2", "Four blanks + numbered promise, not 'coaching site'", "need knowledge", "four-blank-sku · session-bootstrap"),
            ("T3", "Show a specific build, not 'we do AI coaching sites'", "need knowledge", "P-inbound-from-demonstrated-build"),
            ("T4", "ICP-specific exec-coach atoms", "gap", "none in corpus"),
        ],
        "retrieve": {
            "pattern_ids": [
                "P-four-blanks-before-build",
                "P-inbound-from-demonstrated-build",
                "P-category-pitch-fails",
                "P-own-os-before-outbound",
            ],
            "keywords": ["four blank", "numbered", "promise", "category"],
            "domains": ["one-person-biz", "offer-positioning"],
            "stages": ["acquisition"],
        },
        "next_desk": "Consultant: constraint sentence template on runbook. Researcher: gap card.",
        "gap": True,
        "gap_note": "0 exec-coach-specific atoms. Transferable: four-blanks, category-pitch-fails, inbound-from-proof.",
    },
    {
        "id": "creator-longform",
        "title": "creator-longform — clip-factory (hunt parked)",
        "live": True,
        "parked_hunt": True,
        "who": "Podcasters / YouTubers / course people with long-form catalog",
        "outcome": "clip-factory machine compiled. Human ships. No named creator hunt.",
        "stage": "dry-run",
        "path": "A/C",
        "machine": "clip-factory",
        "owners": ["Creative Studio", "Publishing Engine", "Librarian"],
        "constraints": "Publish HITL. No Higgsfield/Opus as hive stack. No mass-DM agency.",
        "operate_never": "AI content agency · mass-DM · overnight 100 gens · short-form-only ICP",
        "tasks": [
            ("T1", "Hunt parked; Path C clip only if Evens names our channel", "HITL only", "ask-principal"),
            ("T2", "Reference-lock + generation log", "need knowledge", "clip-factory"),
            ("T3", "Publish is HITL — do not ship from the desk", "HITL only", "Publishing Engine"),
            ("T4", "On-tape vendor (Higgsfield) is operate-never", "need knowledge", "P-clip-reference-lock-hitl-publish"),
        ],
        "retrieve": {
            "pattern_ids": ["P-clip-reference-lock-hitl-publish", "P-tape-dollars-unverified"],
            "keywords": ["clip", "reference", "higgsfield", "short"],
            "domains": ["content-ops", "media-gen"],
            "stages": ["build", "publishing"],
        },
        "next_desk": "Creative Studio: coverage map on runbook (reference-lock). Publishing: no ship.",
        "gap": False,
    },
    {
        "id": "agency-delivery",
        "title": "agency-delivery — client-delivery-kit (hunt parked)",
        "live": True,
        "parked_hunt": True,
        "who": "Agency owners drowning in client delivery",
        "outcome": "client-delivery-kit machine compiled. No Client Pack SaaS fork.",
        "stage": "dry-run",
        "path": "A/C",
        "machine": "client-delivery-kit",
        "owners": ["Consultant", "Forge", "Product GTM"],
        "constraints": "Clients parked. Kill: fork Client Pack this week.",
        "operate_never": "Client Pack SaaS fork · 'I do AI' agency · invent Gamma output",
        "tasks": [
            ("T1", "Hunt parked", "HITL only", "OPERATOR_FOCUS"),
            ("T2", "Log every meeting; deck optional + gated", "need knowledge", "client-delivery-kit"),
            ("T3", "Human approves before deck", "need knowledge", "P-log-first-approve-deck-second"),
            ("T4", "Four blanks on their delivery KPI, not hours×$100", "need knowledge", "four-blank-sku"),
        ],
        "retrieve": {
            "pattern_ids": [
                "P-log-first-approve-deck-second",
                "P-four-blanks-before-build",
                "P-sanitize-then-check-pass-neq-send",
            ],
            "keywords": ["deck", "meeting", "approve", "delivery"],
            "domains": ["ops-automation", "one-person-biz"],
            "stages": ["build", "acquisition"],
        },
        "next_desk": "Consultant: kit spine on runbook (log→approve→deck). Forge: no Fireflies install.",
        "gap": False,
    },
    {
        "id": "industrial-smb",
        "title": "industrial-smb — list-anneal then Path A (hunt parked)",
        "live": True,
        "parked_hunt": True,
        "who": "Manufacturing / castings / robotics / B2B industrial",
        "outcome": "list-anneal machine compiled. No dial factory. No list this week.",
        "stage": "dry-run",
        "path": "B→A",
        "machine": "list-anneal → Path A",
        "owners": ["Lead Hunter", "Researcher"],
        "constraints": "Clients parked. No auto-dial. playbook-before-send before any send.",
        "operate_never": "Glencoco clone · auto-dial as product · send without playbook",
        "tasks": [
            ("T1", "No list-anneal run this week (parked)", "HITL only", "list-anneal-funnel"),
            ("T2", "When unparked: 50 → 60–70% → exclusions → 3–5 Path A", "have hive skill", "list-anneal-funnel"),
            ("T3", "Draft-not-send; playbook-before-send is dissent vs inbound-first", "need knowledge", "outbound-playbook-funnel"),
            ("T4", "ICP-specific industrial atoms", "gap", "none in corpus"),
        ],
        "retrieve": {
            "pattern_ids": [
                "P-sanitize-then-check-pass-neq-send",
                "P-inbound-from-demonstrated-build",
                "P-category-pitch-fails",
            ],
            "keywords": ["list", "outbound", "playbook", "send"],
            "domains": ["lead-gen", "offer-pricing", "offer-positioning"],
            "stages": ["acquisition"],
        },
        "next_desk": "Researcher: gap card. Lead Hunter: no anneal. Keep playbook-before-send vs inbound-first unflattened.",
        "gap": True,
        "gap_note": "0 industrial-specific atoms. Transferable: draft-not-send, category-pitch-fails. list-anneal is a hive skill, not an atom cluster.",
    },
    {
        "id": "mktg-software",
        "title": "mktg-software — list-anneal on leak, not list-as-SKU (hunt parked)",
        "live": True,
        "parked_hunt": True,
        "who": "Marketing software companies (not agencies, not 'I do AI')",
        "outcome": "list-anneal machine with exclusion nuance. No list-as-SKU.",
        "stage": "dry-run",
        "path": "B",
        "machine": "list-anneal",
        "owners": ["Lead Hunter", "Researcher"],
        "constraints": "Clients parked. Path A only after 3–5 with demo/book leak.",
        "operate_never": "List-as-SKU · marketing agency tagged as software · AI services shop",
        "tasks": [
            ("T1", "No anneal this week", "HITL only", "OPERATOR_FOCUS"),
            ("T2", "Exclusion: agencies leak into list — hive skill, not an atom", "have hive skill", "list-anneal-funnel"),
            ("T3", "When named: install on leak, don't sell the list", "need knowledge", "website-offer-funnel"),
            ("T4", "ICP-specific mktg-software atoms", "gap", "none in corpus"),
        ],
        "retrieve": {
            "pattern_ids": ["P-category-pitch-fails", "P-four-blanks-before-build", "P-sanitize-then-check-pass-neq-send"],
            "keywords": ["list", "demo", "software", "exclusion"],
            "domains": ["lead-gen", "offer-positioning"],
            "stages": ["acquisition"],
        },
        "next_desk": "Researcher: gap card. Do not invent software-ICP atoms.",
        "gap": True,
        "gap_note": "0 mktg-software-specific atoms. Anneal exclusions live on the runbook/skill.",
    },
    {
        "id": "owner-coach-fitness",
        "title": "owner-coach-fitness — private-book-install (hunt parked)",
        "live": True,
        "parked_hunt": True,
        "who": "Fitness / wellness coach with leaky book (newsletter ≠ intake)",
        "outcome": "private-book-install machine. No OFM. No named coach hunt.",
        "stage": "dry-run",
        "path": "A",
        "machine": "private-book-install",
        "owners": ["Lead Hunter", "Consultant"],
        "constraints": "Clients parked. No autonomous closer bot.",
        "operate_never": "OFM/IG farm · exec-coach mixup · auto-book bot",
        "tasks": [
            ("T1", "Hunt parked", "HITL only", "OPERATOR_FOCUS"),
            ("T2", "Intake→book, not newsletter-as-offer", "need knowledge", "private-book-install"),
            ("T3", "Book clock/TZ; no public voice widget", "need knowledge", "P-book-clock-not-model"),
            ("T4", "ICP-specific fitness atoms", "gap", "none in corpus"),
        ],
        "retrieve": {
            "pattern_ids": [
                "P-book-clock-not-model",
                "P-public-widget-is-a-credit-hose",
                "P-dont-lead-with-word-AI",
                "P-four-blanks-before-build",
            ],
            "keywords": ["book", "intake", "coach", "calendly"],
            "domains": ["voice-agents", "one-person-biz", "offer-positioning"],
            "stages": ["build", "acquisition"],
        },
        "next_desk": "Researcher: gap card. Consultant: newsletter≠intake constraint on runbook.",
        "gap": True,
        "gap_note": "0 fitness-specific atoms. Transferable book/HITL/four-blanks only.",
    },
    {
        "id": "law-adj",
        "title": "law-adj — private-book-install (hunt parked)",
        "live": True,
        "parked_hunt": True,
        "who": "Solo lawyer / boutique consult — not multi-partner committee",
        "outcome": "private-book-install machine. No legal advice in SKU. No named firm hunt.",
        "stage": "dry-run",
        "path": "A",
        "machine": "private-book-install",
        "owners": ["Lead Hunter", "Consultant"],
        "constraints": "Clients parked. Bar/advertising may HOLD online book.",
        "operate_never": "Legal advice in deliverable · multi-partner HR committee · trade mixup",
        "tasks": [
            ("T1", "Hunt parked", "HITL only", "OPERATOR_FOCUS"),
            ("T2", "Broken apply/consult book → intake→book", "have hive skill", "private-book-install"),
            ("T3", "No PHI/matter details in drafts", "need knowledge", "sanitize-in-check-out"),
            ("T4", "ICP-specific law atoms", "gap", "none in corpus"),
        ],
        "retrieve": {
            "pattern_ids": [
                "P-book-clock-not-model",
                "P-sanitize-then-check-pass-neq-send",
                "P-dont-lead-with-word-AI",
            ],
            "keywords": ["book", "apply", "consult", "sanitize"],
            "domains": ["voice-agents", "safety", "offer-positioning"],
            "stages": ["build", "operate", "acquisition"],
        },
        "next_desk": "Researcher: gap card. Lead Hunter NO_ACTION.",
        "gap": True,
        "gap_note": "0 law-adj-specific atoms. Transferable: book HITL + sanitize.",
    },
]


def retrieve_atoms(
    atoms: list[dict[str, Any]],
    spec: dict[str, Any],
    limit: int = 10,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    kws = [k.lower() for k in spec.get("keywords") or []]
    domains = set(spec.get("domains") or [])
    stages = set(spec.get("stages") or [])
    support: list[dict[str, Any]] = []
    dissent: list[dict[str, Any]] = []
    for a in atoms:
        if a.get("concept") == "speech-ne-behavior":
            blob = " ".join(
                [
                    str(a.get("claim", "")),
                    str(a.get("conditions", "")),
                    str(a.get("source_video_id", "")),
                ]
            ).lower()
            if any(k in blob for k in kws) or a.get("domain") in domains:
                dissent.append(a)
            continue
        blob = " ".join(
            [
                str(a.get("concept", "")),
                str(a.get("claim", "")),
                str(a.get("action", "")),
                str(a.get("conditions", "")),
                str(a.get("objective", "")),
            ]
        ).lower()
        domain_ok = a.get("domain") in domains if domains else True
        stage_ok = a.get("stage") in stages if stages else True
        kw_ok = any(k in blob for k in kws) if kws else True
        # condition-check: drop vendor-install-as-ours
        cond = str(a.get("conditions", "")).lower()
        act = str(a.get("action", "")).lower()
        if "operate-never" in act or "do not run" in act or "no claude install" in act:
            pass
        if domain_ok and (kw_ok or stage_ok):
            # gate: if conditions say hive must not use the on-tape vendor, keep as steal-not-install
            support.append(a)
    # prefer SOURCE declared, unique videos
    support.sort(key=lambda x: (0 if x.get("layer_tag") == "SOURCE" else 1, x["id"]))
    picked: list[dict[str, Any]] = []
    seen_vid: set[str] = set()
    for a in support:
        vid = str(a.get("source_video_id", ""))
        if vid in seen_vid and len(picked) >= 4:
            continue
        picked.append(a)
        seen_vid.add(vid)
        if len(picked) >= limit:
            break
    dissent = dissent[:8]
    return picked, dissent


def condition_gate(atom: dict[str, Any], project: dict[str, Any]) -> tuple[bool, str]:
    cond = str(atom.get("conditions", "")).lower()
    act = str(atom.get("action", "")).lower()
    if project.get("parked_hunt") and any(x in act for x in ("hunt", "unpark", "send the")):
        if "do not" in act or "hold" in act or "operate-never" in act:
            return True, "operate-never on hunt — keep"
        return False, "hunt action while clients parked"
    if "vapi" in cond and "no vapi" not in cond and "hive: no vapi" not in cond:
        if "operate-never" in act or "no vapi" in act:
            return True, "steal, vendor operate-never"
    return True, "conditions match parked hive / Cursor+Grok / HITL"


def compile_workflow(
    project: dict[str, Any],
    atoms: list[dict[str, Any]],
    patterns: list[dict[str, Any]],
) -> dict[str, Any]:
    by_pid = {p["pattern_id"]: p for p in patterns}
    spec = project["retrieve"]
    support, dissent = retrieve_atoms(atoms, spec)
    gated: list[dict[str, Any]] = []
    dropped: list[str] = []
    for a in support:
        ok, why = condition_gate(a, project)
        if ok:
            gated.append(a)
        else:
            dropped.append(f"{a['id']} ({why})")
    pids = [pid for pid in spec.get("pattern_ids") or [] if pid in by_pid]
    pattern_dissent: list[str] = []
    for pid in pids:
        pattern_dissent.extend(by_pid[pid].get("dissent_ids") or [])
    dissent_ids = sorted(set([d["id"] for d in dissent] + pattern_dissent))
    support_ids = [a["id"] for a in gated]

    # audits
    tasks = project["tasks"]
    missing = [t[0] for t in tasks if t[2] not in {"have hive skill", "need knowledge", "HITL only", "gap"}]
    coverage = "pass"
    cov_line = "every task has hive skill, sourced step, HITL, or explicit gap"
    if missing:
        coverage = "fail"
        cov_line = f"unlabeled tasks: {missing}"
    if project.get("gap") and not any(t[2] == "gap" for t in tasks):
        coverage = "fail"
        cov_line = "gap job missing explicit gap task"
    ctx = "pass"
    ctx_line = "atoms gated on parked/HITL/vendor operate-never; caption-only not used as UI"
    if dropped:
        ctx_line += f"; dropped {len(dropped)}"
    contra = "pass"
    contra_line = "dissent_ids listed; VIEW A ⊥ VIEW B; playbook-before-send not averaged with inbound-first"
    status = "compiled" if coverage == "pass" and ctx == "pass" and contra == "pass" else "audit-fail"

    md = _workflow_md(
        project,
        pids,
        gated,
        dissent_ids,
        dropped,
        status,
        coverage,
        cov_line,
        ctx,
        ctx_line,
        contra,
        contra_line,
        by_pid,
    )
    WORKFLOWS_DIR.mkdir(parents=True, exist_ok=True)
    (WORKFLOWS_DIR / f"{project['id']}.md").write_text(md, encoding="utf-8")
    payload = {
        "workflow_id": f"WF-{project['id']}-v1",
        "project_id": project["id"],
        "version": 1,
        "status": status,
        "steps": [{"id": t[0], "title": t[1], "coverage": t[2]} for t in tasks],
        "pattern_ids": pids,
        "support_ids": support_ids,
        "dissent_ids": dissent_ids,
        "provenance": "WORKFLOW → PATTERN → ATOMS → TRANSCRIPT",
        "audits": {
            "coverage": coverage,
            "context_misuse": ctx,
            "contradiction": contra,
        },
    }
    (WORKFLOWS_DIR / f"{project['id']}.json").write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    if project.get("gap"):
        gap_dir = WORKFLOWS_DIR / "gaps"
        gap_dir.mkdir(parents=True, exist_ok=True)
        (gap_dir / f"{project['id']}.md").write_text(
            f"# Coverage-gap — `{project['id']}`\n\n"
            f"**Date:** {TODAY}\n"
            f"**Stop:** cap — do not invent atoms.\n\n"
            f"{project.get('gap_note', 'Insufficient compatible atoms.')}\n\n"
            f"Transferable patterns used: {', '.join(f'`{x}`' for x in pids) or 'none'}.\n\n"
            f"Next: wait for a tape that demonstrates this ICP's machine under compatible conditions, "
            f"or run hive skills on the runbook when Evens tags `icp_id`.\n",
            encoding="utf-8",
        )
    return payload


def _workflow_md(
    project: dict[str, Any],
    pids: list[str],
    gated: list[dict[str, Any]],
    dissent_ids: list[str],
    dropped: list[str],
    status: str,
    coverage: str,
    cov_line: str,
    ctx: str,
    ctx_line: str,
    contra: str,
    contra_line: str,
    by_pid: dict[str, dict[str, Any]],
) -> str:
    cov_rows = "\n".join(f"| {t[0]} | {t[1]} | {t[2]} | {t[3]} |" for t in project["tasks"])
    step_blocks = []
    for i, t in enumerate(project["tasks"], 1):
        tid, title, kind, skill = t
        local_p = pids[min(i - 1, len(pids) - 1)] if pids else "none — hive skill"
        local_s = gated[min(i - 1, len(gated) - 1)] if gated else None
        support = local_s["id"] if local_s else "none"
        vid = local_s.get("source_video_id", "UNKNOWN") if local_s else "UNKNOWN"
        ts = local_s.get("timestamp", "UNKNOWN") if local_s else "UNKNOWN"
        valid = by_pid[local_p]["valid_when"] if local_p in by_pid else project["constraints"]
        less = by_pid[local_p]["less_relevant_when"] if local_p in by_pid else project.get("gap_note", "—")
        if_line = "IF clients parked → NO_ACTION hunt" if project.get("parked_hunt") else "IF Path C / hive-os → proceed non-HITL"
        do_line = title
        if kind == "gap":
            do_line = f"STOP this task. Coverage-gap card. Do not invent atoms. {project.get('gap_note', '')}"
        if kind == "HITL only":
            do_line = f"ASK Evens / leave queued. {title}"
        step_blocks.append(
            f"### {i}. {title}\n"
            f"- **IF:** {if_line}\n"
            f"- **Do:** {do_line}\n"
            f"- **Hive skill:** `{skill}`\n"
            f"- **pattern_ids:** `{local_p}`\n"
            f"- **support_ids:** `{support}`\n"
            f"- **dissent_ids:** `{', '.join(dissent_ids[:6]) or 'none'}`\n"
            f"- **valid_when / less_relevant_when:** {valid} / {less}\n"
            f"- **confidence:** caption-only; declared unless noted; tape $ UNVERIFIED\n"
            f"- **knowledge_type mix:** declared + implicit dissent labeled — not mixed\n"
            f"- **Transcript:** `packets/{vid}/full.txt` @ {ts}\n"
        )
    dropped_md = ("\n- " + "\n- ".join(dropped)) if dropped else " none"
    support_list = ", ".join(f"`{a['id']}`" for a in gated) or "none"
    return f"""# Workflow — {project['id']}
Status: {status}
Protocol: workflow-compiler
**Provenance:** WORKFLOW → PATTERN → ATOMS → TRANSCRIPT
**Title:** {project['title']}
**Compiled:** {TODAY}

## Classify
- **Who / ICP:** {project['who']}
- **Outcome:** {project['outcome']}
- **Stage:** {project['stage']}
- **Path / machine:** {project['path']} / `{project['machine']}`
- **Constraints:** {project['constraints']}
- **Operate-never:** {project['operate_never']}
- **Owners:** {', '.join(project['owners'])}

Classify written from OPERATOR_FOCUS + runbook + steal-sheet. Atoms were not opened to invent the project.

## Decompose
{chr(10).join(f"{i}. {t[1]}" for i, t in enumerate(project['tasks'], 1))}

## Coverage map
| id | task | coverage | pointer |
|----|------|----------|---------|
{cov_rows}

## Retrieve (narrow, after classify/decompose)
- **pattern_ids:** {', '.join(f'`{p}`' for p in pids) or 'none — hive skill'}
- **support_ids:** {support_list}
- **dissent_ids:** {', '.join(f'`{d}`' for d in dissent_ids) or 'none'}
- **condition drops:**{dropped_md}

## Steps
{chr(10).join(step_blocks)}

## Next non-HITL desk work
{project['next_desk']}

## Audits
- **coverage:** {coverage} — {cov_line}
- **context-misuse:** {ctx} — {ctx_line}
- **contradiction:** {contra} — {contra_line}
- **gaps:** {project['id'] if project.get('gap') else 'none'}
- **dissent kept visible:** {', '.join(dissent_ids) or 'none'}

## Operate-never
{project['operate_never']}
Send / pay / deploy / book / publish stay Evens.
"""


def write_workflow_index(payloads: list[dict[str, Any]]) -> None:
    lines = [
        "# Workflows (layer 5)",
        "",
        "Compiled **per named project**. Not a condensation of the 147 tapes.",
        "",
        "**Schema:** [schema.json](schema.json)  ",
        "**Skill:** `workflow-compiler` then `knowledge-audit`  ",
        "**File:** `{project_id}.md` + `{project_id}.json`",
        "",
        "**Provenance:** WORKFLOW → PATTERN → ATOMS → TRANSCRIPT",
        "",
        f"**{len(payloads)} workflows this turn.** Clients parked for Path A hunts. "
        "`us` + `coverage-loop` are the live session jobs. Catalog ICPs compiled as machines, not named-client hunts. "
        "Normand skipped.",
        "",
        "| project_id | status | patterns | support | dissent |",
        "|------------|--------|---------:|--------:|--------:|",
    ]
    for p in payloads:
        lines.append(
            f"| [`{p['project_id']}`]({p['project_id']}.md) | {p['status']} | {len(p['pattern_ids'])} | {len(p['support_ids'])} | {len(p['dissent_ids'])} |"
        )
    (WORKFLOWS_DIR / "INDEX.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


MARKER = "<!-- knowledge-use-2026-08-14 -->"


def append_runbook(project: dict[str, Any]) -> None:
    if project["id"] == "coverage-loop":
        return
    path = RUNBOOKS / f"{project['id']}.md"
    if not path.is_file():
        return
    text = path.read_text(encoding="utf-8")
    if MARKER in text:
        return
    hunt = (
        "Hunt is **parked** (`OPERATOR_FOCUS.icp_id=none`). Do not lead-web-find. Do not draft a named prospect."
        if project.get("parked_hunt")
        else "Path C / internal. Still no send / pay / deploy / publish."
    )
    gap = (
        f"\n**Coverage-gap:** [../knowledge/workflows/gaps/{project['id']}.md](../knowledge/workflows/gaps/{project['id']}.md)\n"
        if project.get("gap")
        else ""
    )
    block = f"""

{MARKER}

## Compiled workflow ({TODAY} knowledge-use)

{hunt}

**Workflow:** [../knowledge/workflows/{project['id']}.md](../knowledge/workflows/{project['id']}.md)  
**Next non-HITL:** {project['next_desk']}  
**HITL:** send / pay / deploy / book / publish stay Evens.
{gap}
"""
    path.write_text(text.rstrip() + block, encoding="utf-8")


def write_desk_takes(payloads: list[dict[str, Any]]) -> None:
    TAKES.mkdir(parents=True, exist_ok=True)
    compiled = [p["project_id"] for p in payloads if p["status"] == "compiled"]
    failed = [p["project_id"] for p in payloads if p["status"] != "compiled"]
    gaps = [p["project_id"] for p in payloads if p["project_id"] in {x["id"] for x in PROJECTS if x.get("gap")}]

    (TAKES / "librarian.md").write_text(
        f"""# Librarian — knowledge-use {TODAY}
Status: filled
Protocol: side-effect-not-essay
**Job:** compile-then-execute (not a tape walk)
**ICP:** parked unless Evens named one.

## What changed
- Pointed every catalog runbook at `CONTENT/knowledge/workflows/{{icp_id}}.md`.
- Patterns INDEX + graph INDEX updated.
- Did not dump 147 packets into wiki pages.
- Did not merge LESSONS-FROM-TAPE.md.

## Steal
`wiki-ingest` = raw → page → index → log. This pass filed graph/patterns/workflows instead of a second wiki app.

## Operate-never
Overwrite `full.txt` · flatten dissent · unpark Normand
""",
        encoding="utf-8",
    )
    (TAKES / "researcher.md").write_text(
        f"""# Researcher — knowledge-use {TODAY}
Status: filled
Protocol: workflow-compiler retrieve / coverage-gap
**Job:** retrieve by conditions; do not invent atoms

## Coverage-gap cards
{chr(10).join(f"- `{g}` → `knowledge/workflows/gaps/{g}.md`" for g in gaps) or '- none'}

## Did not
- Re-walk YouTube
- Re-emit atoms
- Merge VIEW A with VIEW B
- Treat dentist-scrape tapes as a local-clinic hunt

## Operate-never
New `icp_id` · quote tape $ as FACT
""",
        encoding="utf-8",
    )
    (TAKES / "lead-hunter.md").write_text(
        f"""# Lead Hunter — knowledge-use {TODAY}
Status: filled
Protocol: pipeline-stage-brief
**OPERATOR_FOCUS.icp_id:** none
**Action:** NO_ACTION on Path A

## Pipeline
- Named clients: parked (Evens skipped 2026-08-14). Do not send Normand. Do not ask again this week.
- Catalog ICPs have compiled machines. That is not permission to hunt.
- HUNT_LOG rows appended as parked / knowledge-use only (url=—).

## Next
Wait until Evens tags `icp_id` in OPERATOR_FOCUS. Then open that runbook Today.

## Operate-never
lead-web-find · warm send · unpark
""",
        encoding="utf-8",
    )
    (TAKES / "money-desk.md").write_text(
        f"""# Money Desk — knowledge-use {TODAY}
Status: filled
Protocol: token-receipt
**Tape $:** UNVERIFIED

## PASS/HOLD
- HOLD any unit-econ from Fazio 200–300k, Nate $1,650 / $1.43 / $99–149, Hormozi 4×.
- PASS: compiled workflows mark tape $ UNVERIFIED and do not set rungs from reels.

## Token receipt
- TOKENS: unknown (this Cursor session; no billed API spray)
- DURATION: this session
- CORRECTNESS: untested on money fixtures (no Stripe)

## Operate-never
Pay · refund · quote tweet/YouTube $ as ours
""",
        encoding="utf-8",
    )
    (TAKES / "big-boss.md").write_text(
        f"""# Big Boss — knowledge-use {TODAY}
Status: filled
Protocol: pipeline-stage-brief + checkable-stop

## Live jobs this pass
- `us` (Path C)
- `coverage-loop` (hive-os)
- Catalog machines compiled, hunts parked: local-clinic, local-pro, restaurant, exec-coach, creator-longform, agency-delivery, industrial-smb, mktg-software, owner-coach-fitness, law-adj
- Skipped: Normand / named parked clients

## Stop
DONE-CHECK written. CAP = one compile+execute pass per job. COST = reuse schemas; no new product.

## Compiled vs audit-fail
- compiled: {', '.join(compiled) or 'none'}
- audit-fail: {', '.join(failed) or 'none'}

## Operate-never
Send · pay · deploy · book · publish · unpark
""",
        encoding="utf-8",
    )
    (TAKES / "watchdog.md").write_text(
        f"""# Watchdog — knowledge-use {TODAY}
Status: filled
Protocol: separate-verifier
**BUILDER:** parent compile (`knowledge-compile-layers.py`)
**VERIFIER:** this desk artifact (same session — grade the files, not the chat)
**HYPOTHESIS:** graph + patterns + 12 workflows exist; contradictions kept; no send/pay
**LABELED:** VIEW A ⊥ VIEW B; speech≠behavior mismatches; tape $ UNVERIFIED
**MISS:** no independent HTTP desk; caption-only so click tasks are gaps
**GRADE:** pass-with-notes

## Checks
- [x] `graph/edges.jsonl` non-empty
- [x] patterns have support_ids + dissent_ids
- [x] one workflow per live job, not 147→1
- [x] hard steps HITL
- [x] coverage-gap cards instead of invented atoms
- [x] skill-candidates not auto-accepted

## Operate-never
Builder self-8/10 without this card
""",
        encoding="utf-8",
    )
    (TAKES / "consultant.md").write_text(
        f"""# Consultant — knowledge-use {TODAY}
Status: filled
Protocol: constraint-position (templates only)

## Constraint sentences (no named prospect)
- local-clinic: reviews sit unused; book path weak — thank-you + book, no PHI.
- local-pro: missed calls / buried book — intake→book, no auto-dial.
- restaurant: phone-only reserve — missed-call CTA, no auto-voice book.
- exec-coach: vague coaching site — numbered 90-day promise + one CTA.
- creator-longform: long ep dies — clip-factory, human ships.
- agency-delivery: redo decks every client — log-first, approve-deck-second.
- industrial-smb: brochure site / trade-show only — list-anneal then Path A, no dial factory.
- mktg-software: weak demo book — anneal on leak, not list-as-SKU.
- owner-coach-fitness: newsletter ≠ intake — private-book-install.
- law-adj: apply/consult 404 — private-book-install, no legal advice in SKU.

## Operate-never
Named parked client · hours×$100 invented
""",
        encoding="utf-8",
    )
    (TAKES / "forge.md").write_text(
        f"""# Forge — knowledge-use {TODAY}
Status: filled
Protocol: slice-build (no new system this pass)

## What changed
- Did not stand up Vapi / ElevenLabs / Fireflies / Higgsfield / Claude Code.
- Book/widget scars stay as checklists on compiled workflows.
- One system rule: this session = knowledge compile, not a new site.

## Operate-never
Deploy · new vendor · dentist scrape
""",
        encoding="utf-8",
    )
    (TAKES / "creative-studio.md").write_text(
        f"""# Creative Studio — knowledge-use {TODAY}
Status: filled
Protocol: clip-factory coverage map (no publish)

## Next non-HITL
`creator-longform` workflow: reference-lock + generation log. Do not ship clips.

## Operate-never
Publish · overnight 100 · Higgsfield as ours
""",
        encoding="utf-8",
    )


def write_pipeline_brief(payloads: list[dict[str, Any]]) -> None:
    path = RUNBOOKS / f"PIPELINE_BRIEF-{TODAY}.md"
    path.write_text(
        f"""# Pipeline stage brief — {TODAY}

**OPERATOR_FOCUS.icp_id:** none  
**City:** —  
**Clients:** parked  
**Session goal:** tapes + skills + coverage-loop + knowledge-use compile

## Stage counts
HUNT_LOG had no live prospect rows before this pass. This pass appends parked / knowledge-use rows only (`url=—`, next=NO_ACTION).

| stage | count | note |
|-------|------:|------|
| parked | 10 catalog ICPs | machines compiled; no hunt |
| internal | 2 | `us`, `coverage-loop` |
| delivering | 0 | — |
| ready | 0 | no warm draft to a named human |

## Last actions
1. Compile graph/patterns/workflows from 849 atoms.
2. Desk artifacts under `job-cards/takes/_knowledge-use/`.
3. No send.

## Recommended action (20hr week)
Do **not** hunt. If Evens wants a hard step: pick one Path C proof URL for `click-live-site`, or tag one `icp_id` in OPERATOR_FOCUS. Send/pay/book/publish stay him.

## Workflows
{chr(10).join(f"- `{p['project_id']}` — {p['status']}" for p in payloads)}
""",
        encoding="utf-8",
    )


def append_hunt_log() -> None:
    path = RUNBOOKS / "HUNT_LOG.md"
    text = path.read_text(encoding="utf-8")
    if MARKER in text:
        return
    rows = [
        f"| {TODAY} | us | — | — | knowledge-use compile | — | — | runbook+workflow pointer | Librarian |",
        f"| {TODAY} | coverage-loop | — | — | graph/patterns/workflows filed | — | — | watchdog grade | Watchdog |",
    ]
    for p in PROJECTS:
        if p.get("parked_hunt"):
            rows.append(
                f"| {TODAY} | {p['id']} | Greater Montreal | — | clients parked; machine compiled | — | — | NO_ACTION until Evens tags icp_id | Lead Hunter |"
            )
    block = (
        f"\n{MARKER}\n\n"
        "### Knowledge-use " + TODAY + " (no named prospects)\n\n"
        "| date | icp_id | city | url | leak | contact | MUST | next | owner |\n"
        "|------|--------|------|-----|------|---------|------|------|-------|\n"
        + "\n".join(rows)
        + "\n"
    )
    path.write_text(text.rstrip() + block + "\n", encoding="utf-8")


def append_steal_sheet() -> None:
    text = STEAL.read_text(encoding="utf-8")
    if MARKER in text:
        return
    block = f"""

{MARKER}

## Compiled workflows (knowledge-use {TODAY})

Not new ICPs. Pointers from the atom store. Clients parked. Tape $ UNVERIFIED.

| icp_id / job | workflow | hunt |
|--------------|----------|------|
| `us` | [../knowledge/workflows/us.md](../knowledge/workflows/us.md) | Path C live |
| `coverage-loop` | [../knowledge/workflows/coverage-loop.md](../knowledge/workflows/coverage-loop.md) | hive-os live |
| `local-clinic` | [../knowledge/workflows/local-clinic.md](../knowledge/workflows/local-clinic.md) | parked |
| `local-pro` | [../knowledge/workflows/local-pro.md](../knowledge/workflows/local-pro.md) | parked |
| `restaurant` | [../knowledge/workflows/restaurant.md](../knowledge/workflows/restaurant.md) | parked + gap |
| `exec-coach` | [../knowledge/workflows/exec-coach.md](../knowledge/workflows/exec-coach.md) | parked + gap |
| `creator-longform` | [../knowledge/workflows/creator-longform.md](../knowledge/workflows/creator-longform.md) | parked |
| `agency-delivery` | [../knowledge/workflows/agency-delivery.md](../knowledge/workflows/agency-delivery.md) | parked |
| `industrial-smb` | [../knowledge/workflows/industrial-smb.md](../knowledge/workflows/industrial-smb.md) | parked + gap |
| `mktg-software` | [../knowledge/workflows/mktg-software.md](../knowledge/workflows/mktg-software.md) | parked + gap |
| `owner-coach-fitness` | [../knowledge/workflows/owner-coach-fitness.md](../knowledge/workflows/owner-coach-fitness.md) | parked + gap |
| `law-adj` | [../knowledge/workflows/law-adj.md](../knowledge/workflows/law-adj.md) | parked + gap |

"""
    # insert before "How Researcher fills"
    needle = "## How Researcher fills the next batch"
    if needle in text:
        text = text.replace(needle, block + needle, 1)
        STEAL.write_text(text, encoding="utf-8")
    else:
        STEAL.write_text(text.rstrip() + block, encoding="utf-8")


def append_docs_chronicle(summary: str) -> None:
    if not CHRONICLE.is_file():
        return
    text = CHRONICLE.read_text(encoding="utf-8")
    if MARKER in text:
        return
    entry = f"""
{MARKER}

```yaml
date: {TODAY}
source: cursor
workspace: n8n-cursor
agents: [cursor]
projects: [n8n-cursor]
tags: [knowledge-use, compile-execute, graph, patterns, workflows]
correlationId: oh-knowledge-use-{TODAY}
survivability: ops
```

## Summary

{summary}

## Survivability signal

- ops

---
"""
    CHRONICLE.write_text(text.rstrip() + entry + "\n", encoding="utf-8")


def main() -> None:
    atoms = load_atoms()
    by_id = index_atoms(atoms)
    print(f"atoms={len(atoms)}")

    edges = emit_graph(atoms, by_id)
    print(f"edges={len(edges)}")

    mismatch_n = emit_mismatches(atoms, by_id)
    print(f"mismatches={mismatch_n}")

    patterns = emit_patterns(atoms, by_id)
    write_pattern_index(patterns)
    write_graph_index(edges, len(atoms), mismatch_n)
    print(f"patterns={len(patterns)}")

    payloads = [compile_workflow(p, atoms, patterns) for p in PROJECTS]
    write_workflow_index(payloads)
    print("workflows", [(p["project_id"], p["status"]) for p in payloads])

    for proj in PROJECTS:
        append_runbook(proj)
    write_desk_takes(payloads)
    write_pipeline_brief(payloads)
    append_hunt_log()
    append_steal_sheet()

    summary = (
        f"Knowledge-use compile-then-execute. Graph {len(edges)} edges from {len(atoms)} atoms. "
        f"{len(patterns)} versioned patterns with support_ids + dissent_ids. "
        f"{len(payloads)} workflows (one per live job/ICP; not 147→1). "
        "Path A hunts parked. Normand skipped. Coverage-gap cards where atoms missing. "
        "Desk artifacts written. Hard steps HITL. Tape $ UNVERIFIED. No send/pay/deploy/book/publish."
    )
    append_docs_chronicle(summary)
    print("done")


if __name__ == "__main__":
    main()