#!/usr/bin/env python3
"""Live mentor: one teaching beat, then the mission's ActiveSkillGraph.

School (`saylor-course-skills`) is the catalog namespace. Available is the
count index_rows() returns. It is not the active skill.
A mission builds the sufficient subset. Skill bodies are not loaded by default.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
MAP = ROOT / "docs/hive/outer-heaven/CONTENT/topics/saylor-leverage-map.md"
SPEAK = ROOT / "docs/hive/outer-heaven/CONTENT/topics/saylor-trigger-map.md"
CATALOG = ROOT / "docs/hive/outer-heaven/CONTENT/saylor-skill-triggers.md"
BEATS = ROOT / "docs/hive/outer-heaven/CONTENT/topics/saylor-live-beats.md"
JUDGMENT = ROOT / "scripts/hive/eng/judgment.py"
SKILL_DIR = ROOT / "scripts/hive/grok-skills"
LANES = ("hive-os", "agency")
CAP = 3
SCHOOL_NAMESPACE = "saylor-course-skills"
COURSE_RE = re.compile(r"\b(?:BUS|COMM|ECON|PRDV|CS|ARTH|ENGL|PHIL|MA|POLSC)\d+\b")
SHELF_RE = re.compile(
    r"("
    r"\b164\b|"
    r"full\s+catalog|"
    r"entire\s+shelf|"
    r"all\s+the\s+school\s+skills|"
    r"not\s+just\s+BUS206|"
    r"don'?t\s+just\s+(?:focus\s+on\s+)?BUS206|"
    r"school\s+is\s+the\s+catalog"
    r")",
    re.I,
)
NOVEL_RE = re.compile(
    r"\b(novel decomposition|decompose a novel|invent a (?:new )?method|brand new method)\b",
    re.I,
)
EXAM_RE = re.compile(r"\b(reconstruct(?:ing)?|take the exam|exam dump)\b", re.I)
COMPANY_RE = re.compile(
    r"\b(company-wide|company wide|whole company|across the company)\b",
    re.I,
)
BLAST_RE = re.compile(
    r"\b(blast(?:\s+radius)?|every desk|send to (?:all|everyone)|deploy everywhere)\b",
    re.I,
)
TOKEN_RE = re.compile(r"[a-z0-9]{5,}")
STOP = {
    "which", "write", "their", "about", "would", "could", "should", "there",
    "these", "those", "under", "where", "while", "other", "being", "after",
    "before", "every", "still", "named", "course", "school", "saylor", "task",
    "asks", "running", "reconstructing", "taking", "exam", "dumping", "change",
}
DEFAULT_BUDGETS = {"concurrency": 4, "cost": 40, "context": 0, "depth": 2}
PATH_CONTRACTS = {
    "saylor-course-skill": {
        "slug": "saylor-course-skill",
        "role": "catalog_namespace",
        "prerequisites": [],
        "triggers": ["hive/site/money sitting", "named course skill", "university catalog"],
        "negative_triggers": [
            "exam reconstruction",
            "catalog dump",
            "treating the namespace as the selected skill",
        ],
        "required_context": ["lane"],
        "inputs": [{"name": "sitting", "type": "text"}],
        "outputs": [{"name": "catalog_namespace", "type": "school"}],
        "parallel": False,
        "activation_depth": 0,
        "risk_relevance": "low",
        "completion": "not an active skill; the mission graph is the selection",
    },
    "saylor-mentor-pass": {
        "slug": "saylor-mentor-pass",
        "role": "graph_builder",
        "prerequisites": [],
        "triggers": ["hive", "site", "money", "live mentor"],
        "negative_triggers": ["exam reconstruction", "no hive/site/money"],
        "required_context": ["lane", "sitting"],
        "inputs": [
            {"name": "sitting", "type": "text"},
            {"name": "lane", "type": "lane"},
        ],
        "outputs": [
            {"name": "teaching_beat", "type": "card"},
            {"name": "active_skill_graph", "type": "graph"},
        ],
        "parallel": False,
        "activation_depth": 0,
        "risk_relevance": "medium",
        "completion": "one beat spoken and the graph lists the sufficient subset",
        "may_request_specialist": True,
    },
}

# sitting keywords → slug (deterministic triggers; the graph is not capped at 3)
HINTS: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r"\b(lane|what is this business|why two)\b", re.I), "intro-biz-survey-checklists"),
    (re.compile(r"\b(venture|toy|viable|idea)\b", re.I), "entrepreneurial-venture-viability-plan-team-market-finance"),
    (re.compile(r"\b(plan this cycle|firm plan|strategy)\b", re.I), "firm-strategy-process-advantage-execute"),
    (re.compile(r"\b(lead vs|manage the hive|17 dm)\b", re.I), "strat-lead-mgmt-checklists"),
    (re.compile(r"\b(copy|who/why|tone|email|report)\b", re.I), "bizcomm-audience-purpose-channel-tone-feedback"),
    (re.compile(r"\b(inbox|customer|complaint|cs script)\b", re.I), "custsvc-impression-needs-channel-complaint-experience"),
    (re.compile(r"\b(kpi|baseline|did (this|it) (work|move)|number mean)\b", re.I), "bizstat-describe-sample-infer-regress-checklists"),
    (re.compile(r"\b(dashboard|warehouse|which numbers)\b", re.I), "bi-sources-warehouse-present-model-privacy"),
    (re.compile(r"\b(people, process|five component|what systems|information system)\b", re.I), "mis-intro-five-components"),
    (re.compile(r"\b(fund|refuse|keep or kill|saas|spend)\b", re.I), "strategic-it-when-whether-then-strategy"),
    (re.compile(r"\b(project|slice|done-check|has an end)\b", re.I), "intro-pm-process-groups-people-checklists"),
    (re.compile(r"\b(offer|who (the site|it) is for|stp|ads vs)\b", re.I), "mktg-value-stp-mix-plan-checklists"),
    (re.compile(r"\b(spin|sales process|loyalty|close)\b", re.I), "grad-sales-process-spin-loyalty-brand"),
    (re.compile(r"\b(ethical|hitl|send this)\b", re.I), "bizethics-integrity-stakeholder-csr-dilemma"),
    (re.compile(r"\b(legal|allowed)\b", re.I), "bizlaw-sources-forum-wrongs-assets-entity-checklists"),
    (re.compile(r"\b(put in the system|where data lives)\b", re.I), "mis-intro-five-components"),
]


def load_evaluate():
    """Import the existing Jev gate. Do not open a socket from here."""
    if not JUDGMENT.is_file():
        return None
    spec = importlib.util.spec_from_file_location("hive_eng_judgment", JUDGMENT)
    if spec is None or spec.loader is None:
        return None
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.evaluate


def _call_gate(request: dict, evaluate=None) -> dict:
    fn = evaluate if evaluate is not None else load_evaluate()
    if fn is None:
        return {
            "lane": "deterministic",
            "action": "NO_ACTION",
            "reason": "judgment.py absent; optional activation not ranked",
            "jev_called": False,
            "jev_allowed": False,
            "verb": None,
            "provider": None,
            "provider_call": False,
        }
    decision = fn(request)
    decision["jev_called"] = False
    decision["provider_call"] = False
    return decision


def risk_relevance(slug: str) -> str:
    text = (slug or "").lower()
    if any(k in text for k in ("ethic", "law", "legal", "privacy", "security", "lifecycle", "stakeholder", "negotiat")):
        return "high"
    if any(
        k in text
        for k in (
            "hrm", "people", "strategy", "polc", "lead", "innov", "ops", "oscm",
            "pm-", "it-when", "data-mgmt", "bi-", "comm", "mktg", "acct",
            "finmgmt", "corpfin", "custsvc", "stat", "ob-",
        )
    ):
        return "medium"
    return "low"


def _tokens(text: str) -> set[str]:
    return {t for t in TOKEN_RE.findall((text or "").lower()) if t not in STOP}


def index_rows() -> list[dict[str, str]]:
    """Catalog index only. Skill markdown bodies stay unread."""
    if not CATALOG.is_file():
        return []
    rows: list[dict[str, str]] = []
    seen: set[str] = set()
    for line in CATALOG.read_text(encoding="utf-8").splitlines():
        if not line.startswith("| ") or line.startswith("| course") or line.startswith("|---"):
            continue
        parts = [p.strip() for p in line.strip("|").split("|")]
        if len(parts) < 4:
            continue
        slug = parts[1].strip("`")
        if not slug or slug == "slug" or slug in seen:
            continue
        seen.add(slug)
        rows.append(
            {
                "course": parts[0],
                "slug": slug,
                "triggers": parts[2],
                "negative_triggers": parts[3],
                "risk_relevance": risk_relevance(slug),
            }
        )
    return rows


def school_view() -> dict:
    found = len(index_rows())
    return {
        "namespace": SCHOOL_NAMESPACE,
        "role": "catalog",
        "available": found,
        "indexed": found,
        "loaded": False,
        "active_skill": None,
    }


def school_label(view: dict | None = None) -> str:
    view = view or school_view()
    return (
        f"{view['namespace']} catalog · available {view['available']} · "
        "not loaded · not the active skill"
    )


def _blank_node(slug: str, *, status: str, depth: int, dynamic: bool, row: dict | None = None) -> dict:
    row = row or {}
    relevance = row.get("risk_relevance") or risk_relevance(slug)
    intensity = "deep" if relevance == "high" else "standard" if relevance == "medium" else "light"
    triggers = row.get("triggers") or ""
    negative = row.get("negative_triggers") or ""
    return {
        "slug": slug,
        "course": row.get("course") or "",
        "status": status,
        "intensity": intensity,
        "prerequisites": [],
        "triggers": [triggers[:280]] if triggers else [],
        "negative_triggers": [negative[:280]] if negative else [],
        "required_context": ["lane", "facts_card"],
        "inputs": [
            {"name": "sitting", "type": "text"},
            {"name": "lane_fact", "type": "text"},
        ],
        "outputs": [{"name": "put_in_system", "type": "file_or_blank"}],
        "parallel": True,
        "parallel_group": None,
        "activation_depth": depth,
        "risk_relevance": relevance,
        "completion": "completed when the checklist is applied to the lane fact",
        "dynamic": dynamic,
    }


def _layout(graph: dict) -> None:
    conc = max(1, int(graph["budgets"]["concurrency"]))
    groups: list[list[str]] = []
    chunk: list[str] = []
    for node in graph["nodes"]:
        if node["status"] != "active":
            node["parallel_group"] = None
            continue
        if not node.get("parallel", True):
            if chunk:
                groups.append(chunk)
                chunk = []
            groups.append([node["slug"]])
            node["parallel_group"] = len(groups) - 1
            continue
        chunk.append(node["slug"])
        node["parallel_group"] = len(groups)
        if len(chunk) >= conc:
            groups.append(chunk)
            chunk = []
    if chunk:
        groups.append(chunk)
    graph["parallel_groups"] = groups
    synthesis = [
        {
            "id": f"syn-{i}",
            "after": group,
            "produces": {"name": "group_decision", "type": "decision"},
        }
        for i, group in enumerate(groups)
    ]
    if len(synthesis) > 1:
        synthesis.append(
            {
                "id": "syn-final",
                "after": [item["id"] for item in synthesis],
                "produces": {"name": "mission_put", "type": "decision"},
            }
        )
    graph["synthesis"] = synthesis
    graph["dependencies"] = [
        {"from": prereq, "to": node["slug"]}
        for node in graph["nodes"]
        for prereq in node.get("prerequisites") or []
        if node["status"] in {"active", "needs_prerequisite", "completed"}
    ]


def _finish_result(graph: dict) -> None:
    if graph.get("catalog_named"):
        graph["result"] = None
        return
    if graph.get("result") == "FRONTIER":
        return
    statuses = [node["status"] for node in graph["nodes"]]
    if not statuses:
        graph["result"] = "NO_METHOD_NEEDED"
        return
    if any(status in {"active", "completed"} for status in statuses):
        graph["result"] = None
        return
    if statuses and all(status == "not_applicable" for status in statuses):
        graph["result"] = "NOT_APPLICABLE"
        return
    if any(status == "needs_prerequisite" for status in statuses):
        graph["result"] = "NEEDS_PREREQUISITE"
        return
    graph["result"] = None


def _new_graph(lane: str, sitting: str) -> dict:
    return {
        "mission": sitting,
        "lane": lane,
        "school": school_view(),
        "quality_target": "sufficient_for_risk",
        "risk_target": "low",
        "one_skill_sufficient": False,
        "nodes": [],
        "dependencies": [],
        "parallel_groups": [],
        "synthesis": [],
        "contracts": PATH_CONTRACTS,
        "budgets": dict(DEFAULT_BUDGETS),
        "fanout": [],
        "bodies_loaded": 0,
        "refused_body_loads": [],
        "dynamic": [],
        "result": None,
        "catalog_named": False,
        "frontier": None,
        "jev": {"jev_called": False, "provider": None, "provider_call": False},
        "activation_depth": 0,
        "context_skills": [],
    }


def _distinctive_hits(sitting: str, rows: list[dict[str, str]]) -> list[tuple[int, str]]:
    doc_freq: dict[str, int] = {}
    parsed: list[tuple[str, set[str]]] = []
    for row in rows:
        tokens = _tokens(row["triggers"])
        parsed.append((row["slug"], tokens))
        for token in tokens:
            doc_freq[token] = doc_freq.get(token, 0) + 1
    sitting_tokens = _tokens(sitting)
    scored: list[tuple[int, str]] = []
    for slug, tokens in parsed:
        overlap = sitting_tokens & {token for token in tokens if doc_freq.get(token, 0) <= 3}
        if len(overlap) >= 2:
            scored.append((len(overlap), slug))
    scored.sort(key=lambda item: (-item[0], item[1]))
    return scored


def _hard_slugs(sitting: str) -> list[str]:
    found: list[str] = []
    for pattern, slug in HINTS:
        if pattern.search(sitting or "") and slug not in found:
            found.append(slug)
    return found


def _mission_shape(sitting: str) -> tuple[str, bool]:
    risk = "high" if (BLAST_RE.search(sitting or "") or COMPANY_RE.search(sitting or "")) else "low"
    company = COMPANY_RE.search(sitting or "") is not None
    return risk, company


def _row_map(rows: list[dict[str, str]]) -> dict[str, dict[str, str]]:
    return {row["slug"]: row for row in rows}


def _apply_negative(nodes: list[dict], sitting: str) -> None:
    if not EXAM_RE.search(sitting or ""):
        return
    for node in nodes:
        blob = " ".join(node.get("negative_triggers") or []).lower()
        if "exam" in blob:
            node["status"] = "not_applicable"


def build_active_skill_graph(
    lane: str,
    sitting: str,
    explicit: list[str] | None = None,
    evaluate=None,
) -> dict:
    """Sufficient subset for this mission. Does not read skill bodies."""
    graph = _new_graph(lane, sitting)
    rows = index_rows()
    by_slug = _row_map(rows)
    risk, company = _mission_shape(sitting)
    graph["risk_target"] = "high" if risk == "high" else "low"
    if SHELF_RE.search(sitting or ""):
        graph["catalog_named"] = True
        graph["one_skill_sufficient"] = False
        _layout(graph)
        _finish_result(graph)
        return graph
    if NOVEL_RE.search(sitting or ""):
        decision = _call_gate(
            {
                "kind": "generation",
                "role": "judge",
                "evidence": ["novel decomposition"],
            },
            evaluate,
        )
        graph["frontier"] = {
            "lane": decision.get("lane"),
            "action": decision.get("action"),
            "jev_called": False,
            "provider": decision.get("provider"),
            "reason": "novel decomposition stays frontier",
        }
        graph["jev"] = {
            "jev_called": False,
            "jev_allowed": decision.get("jev_allowed"),
            "verb": decision.get("verb"),
            "provider": None,
            "provider_call": False,
            "lane": decision.get("lane"),
        }
        graph["result"] = "FRONTIER"
        _layout(graph)
        return graph

    requested = [slug.strip() for slug in (explicit or []) if slug.strip()]
    hard = requested or _hard_slugs(sitting)
    scored = _distinctive_hits(sitting, rows)
    top_score = scored[0][0] if scored else 0
    tied = [slug for score, slug in scored if score == top_score] if scored else []
    optional = [slug for _, slug in scored if slug not in hard]

    if risk == "low" and not requested:
        if len(hard) == 1 and (not tied or tied == hard or (len(tied) == 1 and tied[0] == hard[0])):
            graph["one_skill_sufficient"] = True
        elif not hard and len(tied) == 1:
            hard = list(tied)
            graph["one_skill_sufficient"] = True
        elif not hard and len(tied) > 1:
            decision = _call_gate(
                {
                    "verb": "rank",
                    "role": "judge",
                    "evidence": [{"kind": "eligible_bundles", "bundles": tied}],
                },
                evaluate,
            )
            graph["jev"] = {
                "jev_called": False,
                "jev_allowed": decision.get("jev_allowed"),
                "verb": decision.get("verb"),
                "provider": None,
                "provider_call": False,
                "lane": decision.get("lane"),
            }
            if decision.get("jev_allowed"):
                hard = list(tied)
            graph["one_skill_sufficient"] = False
        elif len(hard) > 1:
            graph["one_skill_sufficient"] = False
        if graph["one_skill_sufficient"] and optional:
            decision = _call_gate(
                {
                    "verb": "filter",
                    "role": "judge",
                    "evidence": [{"kind": "optional", "slugs": optional}],
                },
                evaluate,
            )
            graph["jev"] = {
                "jev_called": False,
                "jev_allowed": decision.get("jev_allowed"),
                "verb": decision.get("verb"),
                "provider": None,
                "provider_call": False,
                "lane": decision.get("lane"),
            }
            if decision.get("jev_allowed"):
                for slug in optional:
                    if slug in hard:
                        continue
                    node = _blank_node(slug, status="skipped", depth=0, dynamic=False, row=by_slug.get(slug))
                    node["skip_reason"] = "filtered_optional"
                    graph["nodes"].append(node)

    if risk == "high":
        graph["one_skill_sufficient"] = False
        decision = _call_gate(
            {
                "verb": "rank",
                "role": "judge",
                "evidence": [
                    {
                        "kind": "eligible_bundles",
                        "bundles": ["containment", "company_wide"],
                        "company": company,
                    }
                ],
            },
            evaluate,
        )
        graph["jev"] = {
            "jev_called": False,
            "jev_allowed": decision.get("jev_allowed"),
            "verb": decision.get("verb"),
            "provider": None,
            "provider_call": False,
            "lane": decision.get("lane"),
        }
        if decision.get("jev_allowed"):
            want = {"high", "medium"} if company else {"high"}
            for row in rows:
                if row["risk_relevance"] in want and row["slug"] not in hard:
                    hard.append(row["slug"])

    seen: set[str] = set()
    cost = graph["budgets"]["cost"]
    for slug in hard:
        if slug in seen:
            continue
        if len([node for node in graph["nodes"] if node["status"] == "active"]) >= cost:
            break
        seen.add(slug)
        graph["nodes"].append(
            _blank_node(slug, status="active", depth=0, dynamic=False, row=by_slug.get(slug))
        )
    _apply_negative(graph["nodes"], sitting)
    _layout(graph)
    _finish_result(graph)
    return graph


def request_specialist(
    graph: dict,
    slug: str,
    *,
    reason: str,
    prerequisites: list[str] | None = None,
    from_depth: int = 0,
) -> dict:
    """A skill may ask for another specialist. Budgets cap the fan-out."""
    prerequisites = list(prerequisites or [])
    depth = int(from_depth) + 1
    budgets = graph["budgets"]
    record = {"slug": slug, "reason": reason, "depth": depth}
    if depth > budgets["depth"]:
        record["status"] = "skipped"
        record["skip_reason"] = "depth_budget"
        graph["fanout"].append(record)
        return graph
    active = [node for node in graph["nodes"] if node["status"] == "active"]
    if len(active) >= budgets["cost"]:
        record["status"] = "skipped"
        record["skip_reason"] = "cost_budget"
        graph["fanout"].append(record)
        return graph
    same_depth = [
        node
        for node in graph["nodes"]
        if node["status"] == "active" and node["activation_depth"] == depth
    ]
    if len(same_depth) >= budgets["concurrency"]:
        record["status"] = "skipped"
        record["skip_reason"] = "concurrency_budget"
        graph["fanout"].append(record)
        return graph
    satisfied = set(graph.get("context_skills") or [])
    satisfied |= {node["slug"] for node in graph["nodes"] if node["status"] in {"active", "completed"}}
    row = _row_map(index_rows()).get(slug)
    if any(prereq not in satisfied for prereq in prerequisites):
        node = _blank_node(slug, status="needs_prerequisite", depth=depth, dynamic=True, row=row)
        node["prerequisites"] = prerequisites
        graph["nodes"].append(node)
        record["status"] = "needs_prerequisite"
        graph["fanout"].append(record)
        graph["dynamic"].append(slug)
        _layout(graph)
        _finish_result(graph)
        return graph
    node = _blank_node(slug, status="active", depth=depth, dynamic=True, row=row)
    node["prerequisites"] = prerequisites
    graph["nodes"].append(node)
    graph["activation_depth"] = max(int(graph.get("activation_depth", 0)), depth)
    graph["dynamic"].append(slug)
    record["status"] = "active"
    graph["fanout"].append(record)
    graph["one_skill_sufficient"] = False
    _layout(graph)
    _finish_result(graph)
    return graph


def load_skill_body(graph: dict, slug: str) -> str | None:
    """Context budget gates body loads. The default budget loads nothing."""
    if graph["bodies_loaded"] >= graph["budgets"]["context"]:
        graph["refused_body_loads"].append(slug)
        return None
    path = SKILL_DIR / f"{slug}.md"
    if not path.is_file():
        graph["refused_body_loads"].append(slug)
        return None
    graph["bodies_loaded"] += 1
    return path.read_text(encoding="utf-8")


def mark_node(graph: dict, slug: str, status: str) -> dict:
    allowed = {"completed", "skipped", "not_applicable", "active", "needs_prerequisite"}
    if status not in allowed:
        raise ValueError(status)
    for node in graph["nodes"]:
        if node["slug"] == slug:
            node["status"] = status
            break
    _layout(graph)
    _finish_result(graph)
    return graph


def _parse_map_rows(lane: str) -> list[dict[str, str]]:
    if not MAP.is_file():
        return []
    text = MAP.read_text(encoding="utf-8")
    heading = "## Hive-os" if lane == "hive-os" else "## Agency"
    match = re.search(rf"^{re.escape(heading)}.*$", text, re.MULTILINE)
    if not match:
        return []
    rest = text[match.end() :]
    nxt = re.search(r"^## ", rest, re.MULTILINE)
    body = rest[: nxt.start()] if nxt else rest
    rows: list[dict[str, str]] = []
    for line in body.splitlines():
        if not line.startswith("| ") or line.startswith("| You") or line.startswith("|---"):
            continue
        parts = [p.strip() for p in line.strip("|").split("|")]
        if len(parts) < 4:
            continue
        rows.append(
            {
                "said": parts[0],
                "skill": parts[1],
                "put": parts[2],
                "leverage": parts[3],
            }
        )
    return rows


def _keys_for_slug(slug: str) -> list[str]:
    keys = [slug]
    if SPEAK.is_file():
        for line in SPEAK.read_text(encoding="utf-8").splitlines():
            if f"`{slug}`" not in line and slug[:28] not in line:
                continue
            parts = [p.strip() for p in line.strip("|").split("|")]
            skill_cell = parts[1] if len(parts) > 1 else ""
            keys.extend(COURSE_RE.findall(skill_cell))
    return keys


def _catalog_hits(sitting: str) -> list[str]:
    """Future courses: overlap sitting tokens with catalog use-when. No HINTS required."""
    if not CATALOG.is_file() or not (sitting or "").strip():
        return []
    tokens = set(re.findall(r"[a-z0-9]{4,}", sitting.lower()))
    scored: list[tuple[int, str]] = []
    for line in CATALOG.read_text(encoding="utf-8").splitlines():
        if not line.startswith("| ") or line.startswith("| course") or line.startswith("|---"):
            continue
        parts = [p.strip() for p in line.strip("|").split("|")]
        if len(parts) < 3:
            continue
        slug, when = parts[1].strip("`"), parts[2]
        if not slug or slug == "slug":
            continue
        overlap = len(tokens & set(re.findall(r"[a-z0-9]{4,}", when.lower())))
        if overlap >= 2:
            scored.append((overlap, slug))
    scored.sort(key=lambda item: (-item[0], item[1]))
    return [slug for _, slug in scored]


def pick_slugs(sitting: str, explicit: list[str]) -> list[str]:
    if SHELF_RE.search(sitting or ""):
        return []
    out: list[str] = []
    for slug in explicit:
        cleaned = slug.strip().strip("`")
        if cleaned and cleaned not in out:
            out.append(cleaned)
        if len(out) >= CAP:
            return out
    for pattern, slug in HINTS:
        if pattern.search(sitting or "") and slug not in out:
            out.append(slug)
        if len(out) >= CAP:
            return out
    for slug in _catalog_hits(sitting):
        if slug not in out:
            out.append(slug)
        if len(out) >= CAP:
            break
    return out[:CAP]


def render(lane: str, sitting: str, slugs: list[str] | None = None) -> dict:
    explicit = list(slugs or [])
    chosen = pick_slugs(sitting, explicit)
    rows = _parse_map_rows(lane)
    picked: list[dict[str, str]] = []
    for slug in chosen:
        keys = _keys_for_slug(slug)
        hit = next(
            (
                row
                for row in rows
                if any(key and key in row["skill"] for key in keys) or slug in row["said"]
            ),
            None,
        )
        if hit:
            picked.append({"slug": slug, **hit})
        else:
            picked.append(
                {
                    "slug": slug,
                    "said": sitting or "",
                    "skill": slug,
                    "put": "name the file or blank on the lane facts card",
                    "leverage": "desk on the speak-sheet executes; Evens HITL",
                }
            )
    if not picked:
        picked.append(
            {
                "slug": "(none matched)",
                "said": sitting or "",
                "skill": "",
                "put": "name LANE + one fact, or skip this pass",
                "leverage": "the catalog is not a selected skill",
            }
        )
    facts = (
        "CONTENT/topics/live-facts-hive-os.md"
        if lane == "hive-os"
        else "CONTENT/topics/live-facts-agency.md"
    )
    graph = build_active_skill_graph(lane, sitting, explicit)
    return {
        "lane": lane,
        "sitting": sitting,
        "facts": facts,
        "school": graph["school"],
        "skills": [row["slug"] for row in picked if row["slug"] != "(none matched)"][:CAP],
        "rows": picked[:CAP],
        "graph": graph,
        "next": "one guided action on the live fact, or HITL if this is send/pay/deploy/book/publish",
    }


def _parse_beats(path: Path | None = None) -> dict[str, dict[str, str]]:
    path = path or BEATS
    out: dict[str, dict[str, str]] = {}
    if not path.is_file():
        return out
    course = ""
    cur: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        match = re.match(r"^## ([A-Z]{2,6}\d{2,4})\s*$", line)
        if match:
            if course and cur:
                out[course] = cur
            course = match.group(1)
            cur = {"course": course}
            continue
        kv = re.match(r"^\*\*(When|Says|Now|Watch):\*\*\s+(.*)$", line)
        if kv and course:
            cur[kv.group(1).lower()] = kv.group(2).strip()
    if course and cur:
        out[course] = cur
    return out


def live_beat(lane: str, sitting: str, slugs: list[str] | None = None) -> dict:
    """One teaching idea. The school label is the catalog, not the selected skill."""
    explicit = list(slugs or [])
    graph = build_active_skill_graph(lane, sitting, explicit)
    school = graph["school"]
    if graph.get("catalog_named"):
        return {
            "mode": "live",
            "lane": lane,
            "sitting": sitting,
            "slug": None,
            "course": None,
            "school": school,
            "graph": graph,
            "says": (
                "School names the catalog of candidate capabilities. "
                "Available means they can be discovered. "
                "It does not select a skill and it does not load the manuals. "
                "A mission builds the graph it actually needs."
            ),
            "now": "Leave the catalog closed. Name the mission if one skill is not the whole job.",
            "watch": "A school label is not one selected skill. Hard step stays Evens.",
            "put": "the mission graph, not a course stamp",
            "leverage": school_label(school),
            "then": "do the work through the graph; do not stamp and leave",
        }
    if graph.get("result") == "NO_METHOD_NEEDED":
        return {
            "mode": "live",
            "lane": lane,
            "sitting": sitting,
            "slug": None,
            "course": None,
            "school": school,
            "graph": graph,
            "says": (
                "This sitting does not need a university skill. "
                "No method is a real result. "
                "Do not borrow a course label so the card looks filled in."
            ),
            "now": "Do the mechanical change. Leave the catalog closed.",
            "watch": "Do not invent a KPI or a course.",
            "put": "no course file",
            "leverage": "NO_METHOD_NEEDED",
            "then": "do the work; do not stamp a school",
        }
    if graph.get("result") == "NOT_APPLICABLE":
        return {
            "mode": "live",
            "lane": lane,
            "sitting": sitting,
            "slug": None,
            "course": None,
            "school": school,
            "graph": graph,
            "says": (
                "The skill that matched this sitting is not applicable. "
                "An exam reconstruction does not get that course beat. "
                "Leave the checklist closed."
            ),
            "now": "Do not teach the checklist. The node stays not applicable.",
            "watch": "A not-applicable node does not become the lens.",
            "put": "no course beat",
            "leverage": "NOT_APPLICABLE",
            "then": "do not teach a course the graph refused",
        }
    if graph.get("result") == "FRONTIER":
        return {
            "mode": "live",
            "lane": lane,
            "sitting": sitting,
            "slug": None,
            "course": None,
            "school": school,
            "graph": graph,
            "says": (
                "A novel split is frontier work. "
                "The judgment gate may say so. "
                "It does not invent the decomposition and it does not place a call."
            ),
            "now": "Keep the novel split on the frontier lane.",
            "watch": "Do not ask Jev to invent the method.",
            "put": "frontier note on the graph",
            "leverage": "frontier, not a course stamp",
            "then": "do not pretend a catalog skill is the novel method",
        }
    card = render(lane, sitting, explicit)
    row = card["rows"][0]
    courses = COURSE_RE.findall(f"{row.get('skill', '')} {row.get('said', '')} {row.get('slug', '')}")
    beats = _parse_beats()
    beat: dict[str, str] = {}
    for course in courses:
        if course in beats:
            beat = beats[course]
            break
    if not beat:
        for course, candidate in beats.items():
            when = (candidate.get("when") or "").lower()
            if when and any(tok in (sitting or "").lower() for tok in when.split() if len(tok) > 4):
                beat = candidate
                break
    if not beat:
        beat = {
            "course": row.get("skill") or "",
            "says": (
                f"{row.get('said') or sitting}. Decide {row.get('put')} before the next edit. "
                f"{row.get('leverage')}."
            ),
            "now": row.get("put") or "name LANE + one fact",
            "watch": "Do not dump the catalog. Do not invent a KPI.",
        }
    return {
        "mode": "live",
        "lane": lane,
        "sitting": sitting,
        "slug": row.get("slug"),
        "course": beat.get("course") or (courses[0] if courses else row.get("skill")),
        "school": school,
        "graph": graph,
        "says": beat.get("says") or "",
        "now": beat.get("now") or row.get("put"),
        "watch": beat.get("watch") or "marketing ≠ copy ≠ CS; hard step stays Evens",
        "put": row.get("put"),
        "leverage": row.get("leverage"),
        "then": "do the work through this lens; do not stamp and leave",
    }


def format_live(beat: dict) -> str:
    school = beat.get("school") or school_view()
    graph = beat.get("graph") or {}
    active = [node["slug"] for node in graph.get("nodes") or [] if node.get("status") == "active"]
    lines = [
        f"# Live mentor · {beat['lane']}",
        "",
        f"SITTING: {beat['sitting'] or '(name it)'}",
        f"SCHOOL: {school_label(school)}",
        f"LENS: {beat.get('course') or '(none)'}",
        f"GRAPH: {len(active)} active · loaded {graph.get('bodies_loaded', 0)} · "
        f"result {graph.get('result') or 'graph'}",
        f"SAYS: {beat['says']}",
        f"NOW: {beat['now']}",
        f"THEN: {beat['then']}",
        f"WATCH: {beat['watch']}",
    ]
    if active:
        lines.append("ACTIVE: " + ", ".join(active))
    return "\n".join(lines)


def emit_vault(card: dict, desk: str, host: str) -> str:
    graph = card.get("graph") or {}
    active = [node["slug"] for node in graph.get("nodes") or [] if node.get("status") == "active"]
    items = [
        f"LANE: {card['lane']}",
        f"SITTING: {card['sitting']}",
        f"SCHOOL: {school_label(card.get('school'))}",
        f"SKILLS: {', '.join(card['skills']) or 'none'}",
        f"GRAPH: {len(active)} active · loaded {graph.get('bodies_loaded', 0)}",
    ]
    for row in card["rows"][:CAP]:
        items.append(f"{row['slug']}: PUT {row['put']} · LEV {row['leverage']}")
    items.append(f"NEXT: {card['next']}")
    body = "\n".join(
        [
            "---",
            "kind: report",
            "skill: mentor",
            f"desk: {desk}",
            f"host: {host}",
            f"title: Mentor pass · {card['lane']}",
            "---",
            "",
            f"# Mentor pass · {card['lane']}",
            "",
            *[f"- {it}" for it in items],
            "",
        ]
    )
    rel = Path("CONTENT/os/reports/mentor.md")
    homes = [
        ROOT / "docs/hive/outer-heaven" / rel,
        Path.home() / ".grokbot/outer-heaven" / rel,
        Path.home() / "Documents/My_Billion_Dollar_Vault/00_Outer_Heaven" / rel,
    ]
    for path in homes:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(body, encoding="utf-8")
    emit = ROOT / "scripts/hive/os/emit-vault-receive.py"
    if emit.is_file():
        cmd = [
            sys.executable,
            str(emit),
            "--desk",
            desk,
            "--skill",
            "mentor",
            "--kind",
            "report",
            "--host",
            host,
            "--title",
            f"Mentor pass · {card['lane']}",
        ]
        for item in items:
            cmd.extend(["--item", item])
        subprocess.run(cmd, check=False, cwd=str(ROOT))
    return str(rel)


def self_test() -> list[str]:
    errs: list[str] = []
    if not MAP.is_file():
        errs.append("leverage map missing")
    card = render("hive-os", "who is this page for and what tone", [])
    if len(card["skills"]) > CAP:
        errs.append("picked more than 3")
    if "bizcomm-audience-purpose-channel-tone-feedback" not in card["skills"]:
        errs.append("copy sitting missed BUS210")
    put = " ".join(row.get("put", "") for row in card["rows"])
    if "Message line" not in put and "who/why" not in put.lower():
        errs.append("BUS210 row missed leverage-map PUT")
    agency = render("agency", "sales process SPIN for a named client", ["grad-sales-process-spin-loyalty-brand"])
    if agency["lane"] != "agency":
        errs.append("agency lane lost")
    if "next question" not in " ".join(row.get("put", "") for row in agency["rows"]):
        errs.append("BUS633 row missed agency PUT")
    dump = render("hive-os", "everything", list(f"slug-{i}" for i in range(8)))
    if len(dump["skills"]) > CAP:
        errs.append("explicit slugs exceeded cap")
    future = render(
        "hive-os",
        "which DBMS fits and write a data-management plan so retrieval is decision-grade",
        [],
    )
    if "grad-data-mgmt-dbms-sql-plan-warehouse" not in future["skills"]:
        errs.append("catalog overlap missed a future-shaped sitting")
    if not BEATS.is_file():
        errs.append("live-beats missing")
    beats = _parse_beats()
    if "BUS210" not in beats or "audience" not in (beats["BUS210"].get("says") or "").lower():
        errs.append("BUS210 live beat missing or thin")
    live = live_beat("hive-os", "who is this page for and what tone", [])
    if live.get("course") != "BUS210":
        errs.append(f"live beat missed BUS210 (got {live.get('course')})")
    if len((live.get("says") or "").split()) < 20:
        errs.append("live SAYS is not a teaching paragraph")
    if "who" not in (live.get("now") or "").lower() and "tone" not in (live.get("now") or "").lower():
        errs.append("live NOW missed who/why/tone")
    if live.get("mode") != "live":
        errs.append("live mode flag missing")
    found = len(index_rows())
    school = live.get("school") or {}
    if school.get("namespace") != SCHOOL_NAMESPACE or school.get("available") != found:
        errs.append("school is not the saylor-course-skills catalog")
    if school.get("indexed") != found:
        errs.append("available is not the index search count")
    if school.get("loaded") or school.get("active_skill") is not None:
        errs.append("school loaded a skill or selected one")
    live_md = format_live(live)
    school_line = next((line for line in live_md.splitlines() if line.startswith("SCHOOL:")), "")
    if re.search(r"^SCHOOL:\s*BUS\d+\s*$", school_line) or "BUS210" in school_line:
        errs.append("SCHOOL label is a selected course")
    if "not the active skill" not in school_line or str(found) not in school_line:
        errs.append("SCHOOL line missed the catalog namespace")
    if "164" in school_line:
        errs.append("SCHOOL line labels 164 over the harvest")
    graph = live.get("graph") or {}
    active = [node["slug"] for node in graph.get("nodes") or [] if node.get("status") == "active"]
    if active != ["bizcomm-audience-purpose-channel-tone-feedback"]:
        errs.append(f"copy graph was not the one sufficient skill ({active})")
    if graph.get("one_skill_sufficient") is not True:
        errs.append("copy sitting should be one sufficient skill")
    if graph.get("bodies_loaded") != 0:
        errs.append("copy graph loaded skill bodies")
    wide = build_active_skill_graph(
        "hive-os",
        "company-wide blast radius across the lifecycle before this change ships",
        [],
    )
    wide_active = [node["slug"] for node in wide["nodes"] if node["status"] == "active"]
    if len(wide_active) != 31:
        errs.append(f"high-blast graph size {len(wide_active)} is not 31")
    if len(wide_active) >= wide["school"]["available"]:
        errs.append("high-blast graph loaded the catalog")
    if wide["bodies_loaded"] != 0 or wide["school"]["loaded"]:
        errs.append("high-blast graph loaded bodies")
    if wide["one_skill_sufficient"]:
        errs.append("high-blast mission collapsed to one skill")
    if any(slug.startswith("austrian-") or slug.startswith("bitcoin-") or slug.startswith("what-is-money") for slug in wide_active):
        errs.append("money-theory skills entered the company-wide graph")
    if not wide["parallel_groups"] or max(len(group) for group in wide["parallel_groups"]) > wide["budgets"]["concurrency"]:
        errs.append("parallel groups broke the concurrency budget")
    if not any(item["id"] == "syn-final" for item in wide["synthesis"]):
        errs.append("high-blast graph missed a synthesis point")
    if wide["jev"].get("jev_called") or wide["jev"].get("provider") is not None:
        errs.append("high-blast graph called Jev")
    if wide["jev"].get("jev_allowed") is not True:
        errs.append("existing gate did not allow the bundle rank")
    none = build_active_skill_graph("hive-os", "change the css color of the hero", [])
    if none.get("result") != "NO_METHOD_NEEDED" or none["nodes"]:
        errs.append(f"css sitting was not NO_METHOD_NEEDED ({none.get('result')})")
    hero = build_active_skill_graph("hive-os", "render the hero still to a 6 second clip", [])
    if hero.get("result") != "NO_METHOD_NEEDED" or hero["nodes"]:
        errs.append(f"hero still was not NO_METHOD_NEEDED ({hero.get('result')})")
    exam = build_active_skill_graph("hive-os", "reconstruct the exam and fix the tone", [])
    if exam.get("result") != "NOT_APPLICABLE":
        errs.append(f"exam sitting was not NOT_APPLICABLE ({exam.get('result')})")
    exam_live = live_beat("hive-os", "reconstruct the exam and fix the tone", [])
    exam_md = format_live(exam_live)
    if exam_live.get("course") == "BUS210" or "BUS210" in exam_md or "Audience, purpose" in exam_md:
        errs.append("not-applicable card taught BUS210")
    if exam_live.get("graph", {}).get("result") != "NOT_APPLICABLE":
        errs.append("exam card lost NOT_APPLICABLE")
    shelf = live_beat("hive-os", "Don't just focus on BUS206. Focus on all the school skills 164 as well.", [])
    if shelf.get("course") == "BUS206" or shelf.get("school", {}).get("active_skill") is not None:
        errs.append("shelf sitting selected BUS206 or a skill")
    shelf_school = next(line for line in format_live(shelf).splitlines() if line.startswith("SCHOOL:"))
    if "164" in shelf_school or str(found) not in shelf_school:
        errs.append("shelf SCHOOL line is not the search count")
    if shelf["graph"]["bodies_loaded"] != 0 or shelf["graph"]["nodes"]:
        errs.append("shelf sitting loaded the catalog")
    frontier = build_active_skill_graph("hive-os", "decompose a novel method that no course covers", [])
    if frontier.get("result") != "FRONTIER" or (frontier.get("frontier") or {}).get("lane") != "frontier":
        errs.append(f"novel decomposition was not frontier ({frontier.get('result')})")
    if frontier["jev"].get("jev_called") or frontier["nodes"]:
        errs.append("novel decomposition was handed to Jev or the catalog")
    denied = build_active_skill_graph(
        "hive-os",
        "company-wide blast radius across the lifecycle before this change ships",
        [],
        evaluate=lambda _request: {
            "lane": "deterministic",
            "action": "NO_ACTION",
            "jev_allowed": False,
            "jev_called": False,
            "verb": None,
            "provider": None,
            "provider_call": False,
        },
    )
    if any(node["status"] == "active" for node in denied["nodes"]):
        errs.append("denied gate still expanded the high-blast bundle")
    empty = build_active_skill_graph("hive-os", "change the css color of the hero", [])
    request_specialist(empty, "ghost-skill", reason="need a specialist", prerequisites=["missing-course"])
    if empty.get("result") != "NEEDS_PREREQUISITE":
        errs.append(f"missing prerequisite was {empty.get('result')}")
    base = build_active_skill_graph("hive-os", "who is this page for and what tone", [])
    for index in range(6):
        request_specialist(base, f"specialist-{index}", reason="fan-out")
    added = [item for item in base["fanout"] if item.get("status") == "active"]
    skipped = [item for item in base["fanout"] if item.get("skip_reason") == "concurrency_budget"]
    if len(added) != base["budgets"]["concurrency"] or len(skipped) != 2:
        errs.append(f"fan-out concurrency failed ({len(added)} added, {len(skipped)} skipped)")
    capped = build_active_skill_graph("hive-os", "who is this page for and what tone", [])
    capped["budgets"]["cost"] = 1
    request_specialist(capped, "extra-skill", reason="cost")
    if not any(item.get("skip_reason") == "cost_budget" for item in capped["fanout"]):
        errs.append("cost budget did not stop fan-out")
    request_specialist(capped, "too-deep", reason="depth", from_depth=capped["budgets"]["depth"])
    if not any(item.get("skip_reason") == "depth_budget" for item in capped["fanout"]):
        errs.append("depth budget did not stop fan-out")
    if load_skill_body(base, "bizcomm-audience-purpose-channel-tone-feedback") is not None:
        errs.append("context budget loaded a skill body")
    if base["bodies_loaded"] != 0:
        errs.append("body load incremented under a zero context budget")
    mark_node(base, "bizcomm-audience-purpose-channel-tone-feedback", "completed")
    if not any(node["slug"].startswith("bizcomm") and node["status"] == "completed" for node in base["nodes"]):
        errs.append("completed status did not stick")
    contract = base["contracts"]["saylor-course-skill"]
    for key in ("prerequisites", "triggers", "negative_triggers", "required_context", "outputs", "parallel", "activation_depth", "risk_relevance", "completion"):
        if key not in contract:
            errs.append(f"path contract missed {key}")
    if contract.get("role") != "catalog_namespace":
        errs.append("course skill contract is not the catalog namespace")
    return errs


def main() -> int:
    parser = argparse.ArgumentParser(description="Saylor mentor pass (catalog namespace + mission graph)")
    parser.add_argument("--lane", choices=LANES)
    parser.add_argument("--sitting", default="")
    parser.add_argument("--slugs", default="", help="comma-separated slugs (teaching card cap 3)")
    parser.add_argument("--emit", action="store_true")
    parser.add_argument("--desk", default="consultant")
    parser.add_argument("--host", default="cursor", choices=("cursor", "grok"))
    parser.add_argument("--format", default="markdown", choices=("markdown", "json"))
    parser.add_argument("--live", action="store_true", help="one teaching beat this turn (not the end card)")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        errs = self_test()
        if errs:
            print("FAIL:", "; ".join(errs), file=sys.stderr)
            return 1
        print("OK: saylor-mentor-pass self-test")
        return 0
    if not args.lane:
        print("LANE required: hive-os | agency", file=sys.stderr)
        return 2
    slugs = [slug for slug in args.slugs.split(",") if slug.strip()]
    if args.live:
        beat = live_beat(args.lane, args.sitting, slugs)
        if args.format == "json":
            print(json.dumps(beat, indent=2))
            return 0
        print(format_live(beat))
        return 0
    card = render(args.lane, args.sitting, slugs)
    if args.emit:
        card["vault"] = emit_vault(card, args.desk, args.host)
    if args.format == "json":
        print(json.dumps(card, indent=2))
        return 0
    lines = [
        f"# Mentor pass · {card['lane']}",
        "",
        f"SITTING: {card['sitting'] or '(name it)'}",
        f"SCHOOL: {school_label(card.get('school'))}",
        f"FACTS: {card['facts']}",
        f"SKILLS: {', '.join(card['skills']) or '(none — skip or say one fact)'}",
        "",
    ]
    graph = card.get("graph") or {}
    active = [node["slug"] for node in graph.get("nodes") or [] if node.get("status") == "active"]
    lines.append(
        f"GRAPH: {len(active)} active · result {graph.get('result') or 'graph'} · "
        f"loaded {graph.get('bodies_loaded', 0)}"
    )
    if active:
        lines.append("ACTIVE: " + ", ".join(active))
    lines.append("")
    for row in card["rows"]:
        lines += [
            f"## {row['slug']}",
            f"- SAID: {row['said']}",
            f"- PUT-IN-SYSTEM: {row['put']}",
            f"- LEVERAGE: {row['leverage']}",
            "",
        ]
    lines += [f"NEXT: {card['next']}"]
    if card.get("vault"):
        lines += ["", f"EMIT: {card['vault']}"]
    print("\n".join(lines))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
