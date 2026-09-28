#!/usr/bin/env python3
"""Signal → intelligence compiler for one 20-signal cohort.

Reads the existing knowledge store. Does not invent a second archive.
Does not fetch links. Does not promote an external source into a rule.

WAKE: human-run
HOST: local
DONE-CHECK: --self-test invariants hold and milestone stays PARTIAL
CAP: 20 signals · one recommended experiment · no second corpus
COST: local python only · no billed model · no network
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import time
from collections import defaultdict
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[3]
CONTENT = ROOT / "docs/hive/outer-heaven/CONTENT"
PACKETS = CONTENT / "watch-later/packets"
ATOMS = CONTENT / "knowledge/atoms/by-video"
CAPS = CONTENT / "knowledge/capabilities"
BOOKMARKS_AI = CONTENT / "x-bookmarks/ai-only.json"
BOOKMARKS_LATEST = CONTENT / "x-bookmarks/latest.json"
WEBSITE = CONTENT / "website-building"
DEFAULT_OUT = CONTENT / "knowledge/signal-intel/milestone-20"

CHANNELS = ("TEXT", "VIDEO", "AUDIO", "FRAMES", "LINKS", "REPO", "DOCS")
CHANNEL_STATUS = ("COMPLETE", "PARTIAL", "UNAVAILABLE")
REQUIRED = {
    "x_text": ("TEXT",),
    "x_video": ("TEXT", "VIDEO", "AUDIO", "FRAMES"),
    "youtube": ("TEXT", "VIDEO", "AUDIO", "FRAMES"),
    "repo": ("REPO", "DOCS"),
    "article": ("TEXT", "DOCS"),
}
METHOD_TYPES = frozenset({"method", "gtm_technique", "anti_pattern", "principle"})
ADOPTION_BLOCKED = frozenset({"ADOPTED", "VERIFIED", "SUPERSEDED"})
BEHAVIOR_CHANGING = frozenset({"MANDATORY", "DEFAULT"})
CANDIDATE_TYPES = (
    "TOOL",
    "TOOL_USAGE",
    "SKILL",
    "REASONING_PATTERN",
    "JUDGMENT_HEURISTIC",
    "PROCESS",
    "WORKFLOW",
    "CODE_PATTERN",
    "ARCHITECTURE_PATTERN",
    "BEHAVIOR",
    "OPTIONAL_PATTERN",
    "ANTI_PATTERN",
    "PROOF_PATTERN",
    "EVAL",
    "TEST_PATTERN",
    "REFERENCE",
    "EXAMPLE",
    "PROMPT_PATTERN",
    "CONTEXT_PATTERN",
    "MEMORY_PATTERN",
    "DESIGN_PATTERN",
    "CREATIVE_PATTERN",
    "GTM_PATTERN",
    "BUSINESS_PATTERN",
    "METRIC",
    "FAILURE_MODE",
    "RECOVERY_PATTERN",
    "CAPABILITY_GAP",
    "PRODUCT_IDEA",
    "CUSTOMER_PAIN",
    "COMPETITOR_SIGNAL",
    "MARKET_SIGNAL",
)
CARE_FOR = {
    "GTM_PATTERN": "product-gtm",
    "BUSINESS_PATTERN": "product-gtm",
    "METRIC": "product-gtm",
    "PROOF_PATTERN": "watchdog",
    "EVAL": "watchdog",
    "TEST_PATTERN": "watchdog",
    "ANTI_PATTERN": "watchdog",
    "CONTEXT_PATTERN": "librarian",
    "MEMORY_PATTERN": "librarian",
    "REFERENCE": "librarian",
    "EXAMPLE": "librarian",
    "TOOL": "forge",
    "TOOL_USAGE": "forge",
    "CODE_PATTERN": "forge",
    "CREATIVE_PATTERN": "creative-studio",
    "DESIGN_PATTERN": "creative-studio",
}
STOP = frozenset(
    """
    this that with from your have been were they them what when where into
    about after before would could should their there these those only just
    also than then over under more most some such does did done dont doesn
    each both same other another here because while which
    """.split()
)
GITHUB_RE = re.compile(r"https?://github\.com/([A-Za-z0-9_.-]+)/([A-Za-z0-9_.-]+)")
SKIP_REPOS = frozenset({("snevemoney", "n8n-cursor"), ("xdevplatform", "xurl")})
MUST_YOUTUBE = ("CB5bG4mvnS0",)
X_PACKET = "x-2088007687149601254"
ARTICLE_FILES = (
    "docs/hive/outer-heaven/CONTENT/website-building/vercel-next-patterns.md",
    "docs/hive/outer-heaven/CONTENT/website-building/design-to-code.md",
)


class PromotionError(RuntimeError):
    """External evidence tried to become policy."""


class CoverageError(RuntimeError):
    """A channel was marked more complete than its artifact."""


def _load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def _rel(path: Path) -> str:
    try:
        return path.resolve().relative_to(ROOT).as_posix()
    except ValueError:
        return path.as_posix()


def _norm(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").strip().lower())


def _tokens(text: str) -> list[str]:
    return [
        tok
        for tok in re.findall(r"[a-z0-9]+", (text or "").lower())
        if len(tok) > 3 and tok not in STOP
    ]


def _channel(status: str, reason: str, artifact: str | None = None) -> dict[str, Any]:
    if status not in CHANNEL_STATUS:
        raise CoverageError(f"unknown coverage status {status}")
    if status == "COMPLETE" and not artifact:
        raise CoverageError("COMPLETE requires a recovered artifact")
    if status == "COMPLETE" and artifact in {"preview", "desktop-preview"}:
        raise CoverageError("preview is a degraded class, not a complete source")
    return {"status": status, "reason": reason, "artifact": artifact}


def _unavailable(reason: str) -> dict[str, Any]:
    return _channel("UNAVAILABLE", reason, None)


def completeness(coverage: dict[str, dict[str, Any]], kind: str) -> str:
    required = REQUIRED[kind]
    for channel in required:
        if coverage[channel]["status"] != "COMPLETE":
            if any(coverage[name]["status"] == "PARTIAL" for name in CHANNELS):
                return "PARTIAL"
            return "UNAVAILABLE"
    return "COMPLETE"


def _link_channel(text: str) -> dict[str, Any]:
    urls = re.findall(r"https?://\S+", text or "")
    if not urls:
        return _unavailable("no link in the recovered text")
    short = [url for url in urls if "t.co/" in url or "bit.ly/" in url]
    if short:
        return _channel(
            "PARTIAL",
            "short link seen; target body not recovered",
            short[0].rstrip(").,]>"),
        )
    return _channel(
        "PARTIAL",
        "url seen; linked body not fetched",
        urls[0].rstrip(").,]>"),
    )


def _repo_channel(text: str) -> dict[str, Any]:
    match = GITHUB_RE.search(text or "")
    if not match:
        return _unavailable("no repository url in the recovered text")
    return _channel(
        "PARTIAL",
        "repository url seen; tree not cloned and not hashed",
        f"https://github.com/{match.group(1)}/{match.group(2)}",
    )


def coverage_for_text_kind(kind: str, text: str, *, text_reason: str, text_artifact: str | None) -> dict[str, Any]:
    coverage = {name: _unavailable(f"not part of recovered {kind} body") for name in CHANNELS}
    if text_artifact:
        coverage["TEXT"] = _channel("PARTIAL", text_reason, text_artifact)
    else:
        coverage["TEXT"] = _unavailable(text_reason)
    coverage["LINKS"] = _link_channel(text)
    coverage["REPO"] = _repo_channel(text)
    return coverage


def video_id_from_ref(ref: str) -> str:
    if ref.startswith("K-"):
        rest = ref[2:]
        head, tail = rest.rsplit("-", 1)
        if tail.isdigit():
            return head
    return ref


def load_atoms(root: Path = ROOT) -> dict[str, list[dict[str, Any]]]:
    by_video: dict[str, list[dict[str, Any]]] = {}
    folder = root / "docs/hive/outer-heaven/CONTENT/knowledge/atoms/by-video"
    if not folder.is_dir():
        return by_video
    for path in sorted(folder.glob("*.jsonl")):
        rows = []
        for line in path.read_text(encoding="utf-8").splitlines():
            if line.strip():
                rows.append(json.loads(line))
        by_video[path.stem] = rows
    return by_video


def load_capabilities(root: Path = ROOT) -> list[dict[str, Any]]:
    folder = root / "docs/hive/outer-heaven/CONTENT/knowledge/capabilities"
    found: list[dict[str, Any]] = []
    if folder.is_dir():
        for path in sorted(folder.glob("*.json")):
            if path.name == "schema.json":
                continue
            data = _load_json(path)
            found.append(
                {
                    "capability_id": data.get("capability_id") or path.stem,
                    "name": data.get("name") or path.stem,
                    "source_video_id": data.get("source_video_id") or "",
                    "status": data.get("status") or "UNTESTED",
                    "path": _rel(path),
                    "match_domains": [],
                    "origin": "knowledge-capability",
                }
            )
    retrieve = root / "scripts/hive/os/signal-retrieve.py"
    if retrieve.is_file():
        found.append(
            {
                "capability_id": "signal-retrieve",
                "name": "signal-retrieve",
                "source_video_id": "",
                "status": "WIRED",
                "path": _rel(retrieve),
                "match_domains": ["retrieval", "rag", "knowledge-ops"],
                "match_types": ["CONTEXT_PATTERN", "MEMORY_PATTERN", "REFERENCE"],
                "origin": "existing-code",
            }
        )
    verifier = root / ".cursor/skills/separate-verifier/SKILL.md"
    if verifier.is_file():
        found.append(
            {
                "capability_id": "separate-verifier",
                "name": "separate-verifier",
                "source_video_id": "",
                "status": "WIRED",
                "path": _rel(verifier),
                "match_domains": [],
                "match_types": ["PROOF_PATTERN", "EVAL", "TEST_PATTERN"],
                "origin": "existing-skill",
            }
        )
    return found


def _packet_dir(root: Path, video_id: str) -> Path:
    return root / "docs/hive/outer-heaven/CONTENT/watch-later/packets" / video_id


def _eligible_youtube(root: Path, atoms: dict[str, list[dict[str, Any]]]) -> dict[str, Path]:
    eligible: dict[str, Path] = {}
    for video_id, rows in atoms.items():
        if not rows or video_id.startswith("x-"):
            continue
        packet = _packet_dir(root, video_id)
        if (packet / "PACKET.md").is_file() and (packet / "full.txt").is_file():
            eligible[video_id] = packet
    return eligible


def _conflict_graph(atoms: dict[str, list[dict[str, Any]]]) -> dict[str, set[str]]:
    graph: dict[str, set[str]] = defaultdict(set)
    for video_id, rows in atoms.items():
        for row in rows:
            for ref in row.get("conflicts_with") or []:
                target = video_id_from_ref(str(ref))
                if target and target != video_id:
                    graph[video_id].add(target)
    return graph


def select_youtube(
    root: Path,
    atoms: dict[str, list[dict[str, Any]]],
    count: int = 5,
) -> list[str]:
    eligible = _eligible_youtube(root, atoms)
    graph = _conflict_graph(atoms)
    if not eligible:
        return []
    ranked = sorted(eligible, key=lambda video_id: (-len(graph.get(video_id, ())), video_id))
    chosen: list[str] = []

    def add(video_id: str) -> None:
        if video_id in eligible and video_id not in chosen:
            chosen.append(video_id)

    add(ranked[0])
    neighbors = sorted(graph.get(chosen[0], ()), key=lambda video_id: (-len(graph.get(video_id, ())), video_id))
    for video_id in neighbors:
        if len(chosen) >= count:
            break
        add(video_id)
    for video_id in MUST_YOUTUBE:
        if video_id not in chosen and video_id in eligible:
            if len(chosen) >= count:
                chosen[-1] = video_id
            else:
                add(video_id)
    for video_id in ranked:
        if len(chosen) >= count:
            break
        add(video_id)
    shared = [
        video_id
        for video_id in eligible
        if any(row.get("concept") == "speech-ne-behavior" for row in atoms.get(video_id, []))
    ]
    present = [video_id for video_id in chosen if video_id in shared]
    if len(present) < 2 and shared:
        for video_id in sorted(shared):
            if video_id in chosen:
                continue
            if len(chosen) >= count:
                replace_at = next(
                    (
                        index
                        for index in range(len(chosen) - 1, -1, -1)
                        if chosen[index] not in MUST_YOUTUBE and chosen[index] != ranked[0]
                    ),
                    None,
                )
                if replace_at is None:
                    break
                chosen[replace_at] = video_id
            else:
                chosen.append(video_id)
            present.append(video_id)
            if len(present) >= 2:
                break
    return chosen[:count]


def _bookmark_items(path: Path) -> list[dict[str, Any]]:
    if not path.is_file():
        return []
    data = _load_json(path)
    items = data.get("items") if isinstance(data, dict) else data
    return [item for item in items or [] if isinstance(item, dict) and item.get("id")]


def select_x_text(items: list[dict[str, Any]], count: int = 5) -> list[dict[str, Any]]:
    rows = []
    for item in items:
        text = item.get("text") or ""
        if len(text) < 80:
            continue
        if re.search(r"\b(video|clip|demo)\b", text, re.I):
            continue
        rows.append(item)
    rows.sort(key=lambda item: str(item["id"]))
    return rows[:count]


def select_x_video(items: list[dict[str, Any]], count: int = 4) -> list[dict[str, Any]]:
    rows = []
    for item in items:
        text = item.get("text") or ""
        if re.search(r"\b(video|clip|demo)\b", text, re.I):
            rows.append(item)
    rows.sort(key=lambda item: str(item["id"]))
    seen: set[str] = set()
    picked = []
    for item in rows:
        if str(item["id"]) in seen or str(item["id"]) == X_PACKET.removeprefix("x-"):
            continue
        seen.add(str(item["id"]))
        picked.append(item)
        if len(picked) >= count:
            break
    return picked


def select_repos(root: Path, count: int = 3) -> list[dict[str, str]]:
    found: list[dict[str, str]] = []
    seen: set[tuple[str, str]] = set()
    folder = root / "docs/hive/outer-heaven/CONTENT/website-building"
    if not folder.is_dir():
        return found
    for path in sorted(folder.glob("*.md")):
        text = path.read_text(encoding="utf-8", errors="replace")
        for org, name in GITHUB_RE.findall(text):
            key = (org, name.removesuffix(".git"))
            if key in SKIP_REPOS or key in seen:
                continue
            seen.add(key)
            found.append(
                {
                    "org": key[0],
                    "name": key[1],
                    "url": f"https://github.com/{key[0]}/{key[1]}",
                    "cited_in": _rel(path),
                }
            )
            if len(found) >= count:
                return found
    return found


def classify_atom(atom: dict[str, Any]) -> str:
    concept = (atom.get("concept") or "").lower()
    stage = (atom.get("stage") or "").lower()
    domain = (atom.get("domain") or "").lower()
    claim = atom.get("claim") or ""
    head = claim.lower()[:80]
    if concept == "speech-ne-behavior":
        return "contradiction_note"
    if concept == "ordered-procedure":
        return "principle"
    if atom.get("evidence_type") == "metric" or domain == "offer-pricing":
        return "metric"
    if stage == "guardrail" or head.startswith(("refuse", "do not", "don't", "never ")):
        return "anti_pattern"
    if domain.startswith("offer"):
        return "gtm_technique"
    if "eval" in domain or "eval" in concept:
        return "method"
    if stage in {"architecture", "build"} and atom.get("knowledge_type") == "declared":
        return "method"
    if "pain" in concept or "struggle" in head:
        return "customer_pain"
    return "unclassified"


def _signal_shell(signal_id: str, kind: str, source_ref: str, locator: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": signal_id,
        "kind": kind,
        "source_ref": source_ref,
        "locator": locator,
        "processing_state": "RAW",
        "pipeline_gaps": [],
        "coverage": {},
        "source_completeness": "UNAVAILABLE",
        "evidence_basis": "pointer_only",
        "origin": "external",
        "claim_ids": [],
        "candidate_ids": [],
        "outputs": [],
        "popularity_ignored_for_adoption": True,
    }


def _apply_coverage(signal: dict[str, Any], coverage: dict[str, Any]) -> None:
    missing = [name for name in CHANNELS if name not in coverage]
    if missing:
        raise CoverageError(f"{signal['id']} missing channels {missing}")
    signal["coverage"] = coverage
    signal["source_completeness"] = completeness(coverage, signal["kind"])
    required_ok = all(
        coverage[name]["status"] in {"PARTIAL", "COMPLETE"} for name in REQUIRED[signal["kind"]]
    )
    if signal["source_completeness"] == "COMPLETE":
        signal["processing_state"] = "SOURCE_RECOVERED"
        signal["evidence_basis"] = "native_source"
    elif required_ok:
        signal["processing_state"] = "SOURCE_RECOVERED"
        signal["evidence_basis"] = "partial_native"
    else:
        signal["processing_state"] = "RAW"
        signal["evidence_basis"] = "pointer_only"
        signal["pipeline_gaps"] = [
            "SOURCE_RECOVERED: a required channel is UNAVAILABLE; a citation is not the source"
        ]


def build_claims_from_atoms(
    signal: dict[str, Any],
    rows: list[dict[str, Any]],
    atom_path: str,
) -> list[dict[str, Any]]:
    claims = []
    outputs = []
    for row in rows:
        claim_id = str(row.get("id") or "")
        text = row.get("claim") or ""
        if not claim_id or not text:
            continue
        output_type = classify_atom(row)
        claim = {
            "id": claim_id,
            "signal_id": signal["id"],
            "source_id": row.get("source_video_id") or signal["locator"].get("video_id"),
            "text": text,
            "extractor": "existing-atom-copy",
            "output_type": output_type,
            "concept": row.get("concept") or "",
            "domain": row.get("domain") or "",
            "conditions": row.get("conditions") or "",
            "exceptions": row.get("exceptions") or "",
            "conflicts_with": list(row.get("conflicts_with") or []),
            "evidence_status": row.get("evidence_status") or "UNKNOWN",
            "knowledge_type": row.get("knowledge_type") or "",
            "layer_tag": row.get("layer_tag") or "",
            "atom_path": atom_path,
            "duplicate_of": None,
        }
        claims.append(claim)
        outputs.append({"type": output_type, "claim_id": claim_id, "text": text})
    signal["claim_ids"] = [claim["id"] for claim in claims]
    signal["outputs"] = outputs
    if claims:
        signal["processing_state"] = "CLAIMS_EXTRACTED"
    return claims


def build_quote_claim(signal: dict[str, Any], text: str, artifact: str) -> dict[str, Any]:
    claim_id = f"quote-{signal['id']}"
    claim = {
        "id": claim_id,
        "signal_id": signal["id"],
        "source_id": signal["id"],
        "text": text,
        "extractor": "bookmark-text-quote",
        "output_type": "raw_quote",
        "concept": "",
        "domain": "",
        "conditions": "bookmark export text only",
        "exceptions": "thread, media, and linked bodies were not recovered",
        "conflicts_with": [],
        "evidence_status": "observed",
        "knowledge_type": "declared",
        "layer_tag": "SOURCE",
        "atom_path": artifact,
        "duplicate_of": None,
    }
    signal["claim_ids"] = [claim_id]
    signal["outputs"] = [{"type": "raw_quote", "claim_id": claim_id, "text": text}]
    signal["processing_state"] = "CLAIMS_EXTRACTED"
    return claim


def dedupe_claims(claims: list[dict[str, Any]]) -> list[dict[str, Any]]:
    groups: dict[str, list[str]] = defaultdict(list)
    for claim in claims:
        groups[_norm(claim["text"])].append(claim["id"])
    for claim in claims:
        ids = groups[_norm(claim["text"])]
        claim["duplicate_ids"] = ids if len(ids) > 1 else []
        claim["duplicate_of"] = ids[0] if len(ids) > 1 and claim["id"] != ids[0] else None
    return claims


def _match_capabilities(claim: dict[str, Any], capabilities: list[dict[str, Any]]) -> list[str]:
    matched = []
    concept = (claim.get("concept") or "").lower()
    domain = (claim.get("domain") or "").lower()
    source = str(claim.get("source_id") or "")
    for cap in capabilities:
        cap_id = cap["capability_id"]
        if cap.get("source_video_id") and cap["source_video_id"] == source:
            matched.append(cap_id)
            continue
        if domain and domain in (cap.get("match_domains") or []):
            matched.append(cap_id)
            continue
        name = (cap.get("name") or "").lower()
        if name and name in concept:
            matched.append(cap_id)
    return sorted(set(matched))


def _method_id(concept: str, domain: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", f"{concept}-{domain}".lower()).strip("-")
    return f"method-{slug or 'unscoped'}"


def candidate_type_for(claim: dict[str, Any]) -> str:
    output = claim.get("output_type") or ""
    domain = (claim.get("domain") or "").lower()
    concept = (claim.get("concept") or "").lower()
    if output in {"raw_quote", "unclassified"}:
        return "REFERENCE"
    if output == "contradiction_note":
        return "PROOF_PATTERN"
    if output == "metric":
        return "METRIC"
    if output == "anti_pattern":
        return "ANTI_PATTERN"
    if output == "customer_pain":
        return "CUSTOMER_PAIN"
    if output == "gtm_technique":
        return "GTM_PATTERN"
    if output == "principle":
        return "WORKFLOW"
    if "eval" in domain or "eval" in concept:
        return "EVAL"
    if domain in {"retrieval", "rag", "knowledge-ops"}:
        return "CONTEXT_PATTERN"
    if domain in {"cinematic-pages", "media-gen", "content-ops"}:
        return "CREATIVE_PATTERN"
    if domain == "tooling":
        return "TOOL_USAGE"
    if domain == "safety":
        return "BEHAVIOR"
    if domain == "workflow-build":
        return "WORKFLOW"
    if output == "method":
        return "PROCESS"
    return "REFERENCE"


def set_applicability(
    candidate: dict[str, Any],
    state: str,
    *,
    evens_promote: bool = False,
    tested_locally: bool = False,
) -> None:
    if state in BEHAVIOR_CHANGING and not (evens_promote and tested_locally):
        raise PromotionError("an external signal cannot become MANDATORY or DEFAULT behavior")
    if state == "CONDITIONAL" and not tested_locally:
        raise PromotionError("CONDITIONAL behavior requires a local test")
    if state in {"REJECTED", "SUPERSEDED"} and not evens_promote:
        raise PromotionError(f"{state} requires an explicit decision")
    candidate["applicability"] = state
    candidate["mandatory_or_optional"] = state


def _assets_for(claim: dict[str, Any], candidate_type: str, capabilities: list[dict[str, Any]]) -> list[str]:
    matched = _match_capabilities(claim, capabilities)
    for cap in capabilities:
        if candidate_type in (cap.get("match_types") or []):
            matched.append(cap["capability_id"])
    return sorted(set(matched))


def build_candidates(
    claims: list[dict[str, Any]],
    capabilities: list[dict[str, Any]],
    *,
    origin: str = "external",
) -> list[dict[str, Any]]:
    candidates = []
    for claim in claims:
        if not claim.get("text"):
            continue
        candidate_type = candidate_type_for(claim)
        if candidate_type not in CANDIDATE_TYPES:
            raise PromotionError(f"unknown candidate type {candidate_type}")
        assets = _assets_for(claim, candidate_type, capabilities)
        domain = claim.get("domain") or ""
        if domain.startswith("offer"):
            who = "product-gtm"
        else:
            who = CARE_FOR.get(candidate_type, "researcher")
        reference_only = candidate_type == "REFERENCE" or claim.get("extractor") == "bookmark-text-quote"
        candidate = {
            "id": f"cand-{claim['id']}",
            "signal_id": claim["signal_id"],
            "claim_id": claim["id"],
            "origin": origin,
            "candidate_type": candidate_type,
            "what_is_it": claim["text"],
            "what_problem_does_it_solve": domain or "unspecified",
            "where_does_it_apply": domain or "unspecified",
            "what_existing_asset_does_it_improve": assets,
            "who_should_care": who,
            "when_should_it_be_used": claim.get("conditions") or "not a behavior yet",
            "when_should_it_not_be_used": claim.get("exceptions") or "not a behavior yet",
            "what_evidence_supports_it": f"{claim.get('extractor')}; {claim.get('evidence_status')}",
            "what_conflicts_with_it": list(claim.get("conflicts_with") or []),
            "has_it_been_tested_locally": False,
            "what_would_prove_it_useful": "a named local measure plus a Watchdog grade",
            "inject_globally": False,
            "creates_new_subsystem": False,
        }
        set_applicability(candidate, "REFERENCE_ONLY" if reference_only else "EXPERIMENTAL")
        candidates.append(candidate)
    return candidates


def synthesize(
    signals: list[dict[str, Any]],
    claims: list[dict[str, Any]],
    capabilities: list[dict[str, Any]],
) -> dict[str, Any]:
    by_id = {claim["id"]: claim for claim in claims}
    cohort_sources = {signal["locator"].get("video_id") or signal["id"] for signal in signals}
    cohort_sources.update(signal["id"] for signal in signals)

    contradictions = []
    seen_pairs: set[tuple[str, str]] = set()
    for claim in claims:
        for ref in claim["conflicts_with"]:
            target = str(ref)
            pair = tuple(sorted((claim["id"], target)))
            if pair in seen_pairs:
                continue
            seen_pairs.add(pair)
            target_video = video_id_from_ref(target)
            other_ids = [
                other["id"]
                for other in claims
                if other["source_id"] == target_video and other["id"] != claim["id"]
            ]
            both = target_video in cohort_sources or target in by_id
            contradictions.append(
                {
                    "id": f"con-{claim['id']}-{re.sub(r'[^A-Za-z0-9]+', '-', target)[:40]}",
                    "claim_id": claim["id"],
                    "target_ref": target,
                    "other_claim_ids": other_ids,
                    "sources": sorted({str(claim["source_id"]), target_video}),
                    "both_in_cohort": both,
                    "left_text": claim["text"],
                    "winner": None,
                    "resolution": "EXPERIMENT_REQUIRED",
                    "owner": "researcher",
                }
            )

    atom_groups: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for claim in claims:
        if claim["extractor"] == "existing-atom-copy" and claim["concept"]:
            atom_groups[claim["concept"]].append(claim)
    method_atoms = []
    atom_ids_by_concept: dict[str, str] = {}
    for concept, grouped in sorted(atom_groups.items()):
        sources = sorted({claim["source_id"] for claim in grouped})
        if len(sources) < 2:
            continue
        atom_id = "atom-" + re.sub(r"[^a-z0-9]+", "-", concept.lower()).strip("-")
        atom_ids_by_concept[concept] = atom_id
        method_atoms.append(
            {
                "id": atom_id,
                "concept": concept,
                "statement": (
                    f"Shared concept `{concept}` across {len(sources)} sources. "
                    "Conditions stay per source. Not averaged."
                ),
                "sources": sources,
                "claim_ids": [claim["id"] for claim in grouped],
                "conditions_by_source": {
                    claim["source_id"]: claim["conditions"] for claim in grouped
                },
                "maturity": "CANDIDATE",
                "owner": "librarian",
            }
        )

    contradicted_claims = {row["claim_id"] for row in contradictions}
    methods = []
    grouped_methods: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for claim in claims:
        if claim["output_type"] not in METHOD_TYPES:
            continue
        grouped_methods[(claim["concept"] or claim["id"], claim["domain"])].append(claim)
    for (concept, domain), grouped in sorted(grouped_methods.items()):
        sources = sorted({str(claim["source_id"]) for claim in grouped})
        cap_ids: list[str] = []
        for claim in grouped:
            cap_ids.extend(_match_capabilities(claim, capabilities))
        cap_ids = sorted(set(cap_ids))
        touched = any(claim["id"] in contradicted_claims for claim in grouped)
        if touched:
            maturity = "EXPERIMENT_REQUIRED"
        elif len(sources) > 1:
            maturity = "CANDIDATE"
        else:
            maturity = "RECOVERED"
        methods.append(
            {
                "id": _method_id(str(concept), str(domain)),
                "concept": concept,
                "domain": domain,
                "statement": grouped[0]["text"],
                "sources": sources,
                "claim_ids": [claim["id"] for claim in grouped],
                "composed_of": [atom_ids_by_concept[concept]] if concept in atom_ids_by_concept else [],
                "applies_to": cap_ids,
                "gap": None if cap_ids else "no existing capability match in this checkout",
                "maturity": maturity,
                "popularity_used_for_adoption": False,
                "outcome_ids": [],
                "owner": "researcher",
            }
        )

    domain_sources: dict[str, set[str]] = defaultdict(set)
    domain_claims: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for claim in claims:
        if not claim["domain"]:
            continue
        domain_sources[claim["domain"]].add(str(claim["source_id"]))
        domain_claims[claim["domain"]].append(claim)
    clusters = []
    for domain, sources in sorted(domain_sources.items()):
        if len(sources) < 2:
            continue
        clusters.append(
            {
                "id": "problem-" + re.sub(r"[^a-z0-9]+", "-", domain.lower()).strip("-"),
                "problem": domain,
                "sources": sorted(sources),
                "claim_ids": [claim["id"] for claim in domain_claims[domain]],
                "approaches": sorted({claim["concept"] for claim in domain_claims[domain] if claim["concept"]}),
                "owner": "researcher",
            }
        )
    in_cohort_rows = [row for row in contradictions if row["both_in_cohort"]]
    if in_cohort_rows:
        clusters.append(
            {
                "id": "problem-in-cohort-contradictions",
                "problem": "stored disagreements inside the cohort",
                "sources": sorted({source for row in in_cohort_rows for source in row["sources"]}),
                "claim_ids": sorted({row["claim_id"] for row in in_cohort_rows}),
                "approaches": [],
                "owner": "researcher",
            }
        )

    in_cluster = {claim_id for cluster in clusters for claim_id in cluster["claim_ids"]}
    cited_by_experiment: set[str] = set()
    cross_source = [
        row
        for row in contradictions
        if row["both_in_cohort"] and len(set(row["sources"])) >= 2
    ]
    same_source = [row for row in contradictions if row["both_in_cohort"] and row not in cross_source]
    pool = cross_source or same_source or contradictions
    pool = sorted(pool, key=lambda row: (-len(set(row["sources"])), row["id"]))
    recommended = None
    if pool:
        row = pool[0]
        recommended = {
            "id": "exp-recommended-1",
            "status": "EXPERIMENT_REQUIRED",
            "executed": False,
            "hypothesis": (
                "Two stored claims disagree. Do not average them. "
                f"Left: {row['left_text'][:240]} Target: {row['target_ref']}."
            ),
            "contradiction_id": row["id"],
            "measure": ["success_rate", "latency", "token_cost", "recovery_rate"],
            "results": None,
            "cross_source": len(set(row["sources"])) >= 2,
            "owners": {
                "forge": "not_run",
                "watchdog": "not_run",
                "matrix": "decides_when_this_becomes_real_work",
                "jev": "not_authority",
            },
        }
        cited_by_experiment.add(row["claim_id"])

    for signal in signals:
        claim_ids = set(signal["claim_ids"])
        gaps = []
        if signal["processing_state"] == "RAW":
            gaps.append("SOURCE_RECOVERED: required source body is not on disk")
        elif not claim_ids:
            gaps.append("CLAIMS_EXTRACTED: no atomic claim copied; partial source is not a summary")
        in_synth = bool(claim_ids & in_cluster)
        mapped = any(
            claim["id"] in claim_ids and _match_capabilities(claim, capabilities)
            for claim in claims
        )
        experiment = bool(claim_ids & cited_by_experiment)
        if in_synth:
            signal["processing_state"] = "SYNTHESIZED"
        elif signal["processing_state"] == "CLAIMS_EXTRACTED":
            gaps.append("SYNTHESIZED: fewer than two independent sources share this domain in the cohort")
        if mapped:
            signal["processing_state"] = "CAPABILITY_MAPPED"
        elif claim_ids and signal["kind"] != "x_text":
            gaps.append("CAPABILITY_MAPPED: no existing capability match")
        if experiment:
            signal["processing_state"] = "EXPERIMENT_CANDIDATE"
        signal["pipeline_gaps"] = gaps

    candidates = build_candidates(claims, capabilities, origin="external")
    by_signal: dict[str, list[str]] = defaultdict(list)
    for candidate in candidates:
        by_signal[candidate["signal_id"]].append(candidate["id"])
    for signal in signals:
        signal["candidate_ids"] = by_signal.get(signal["id"], [])

    return {
        "contradictions": contradictions,
        "method_atoms": method_atoms,
        "methods": methods,
        "candidates": candidates,
        "clusters": clusters,
        "recommended_experiment": recommended,
    }


def promote(method: dict[str, Any], status: str, *, evens_promote: bool = False, watchdog_grade: str | None = None) -> None:
    if status == "ADOPTED" and not evens_promote:
        raise PromotionError("external signal cannot auto-promote to ADOPTED")
    if status == "VERIFIED":
        if not watchdog_grade or not Path(watchdog_grade).is_file():
            raise PromotionError("VERIFIED requires a Watchdog grade file")
    if status == "LOCALLY_SUPPORTED" and not method.get("outcome_ids"):
        raise PromotionError("LOCALLY_SUPPORTED requires a measured outcome")
    if status in ADOPTION_BLOCKED and status != "VERIFIED" and not evens_promote:
        raise PromotionError(f"blocked status {status}")
    method["maturity"] = status


def retrieve(graph: dict[str, Any], prompt: str, cap: int = 3) -> list[dict[str, Any]]:
    tokens = set(_tokens(prompt))
    if len(tokens) < 2:
        return []
    scored: list[tuple[int, dict[str, Any]]] = []
    for claim in graph.get("claims") or []:
        overlap = tokens & set(_tokens(f"{claim.get('text','')} {claim.get('concept','')} {claim.get('domain','')}"))
        if len(overlap) >= 2:
            scored.append(
                (
                    len(overlap),
                    {
                        "kind": "claim",
                        "id": claim["id"],
                        "path": claim.get("atom_path") or claim.get("signal_id"),
                        "score": len(overlap),
                        "text": claim["text"][:240],
                    },
                )
            )
    for method in graph.get("methods") or []:
        overlap = tokens & set(_tokens(f"{method.get('statement','')} {method.get('concept','')} {method.get('domain','')}"))
        if len(overlap) >= 2:
            scored.append(
                (
                    len(overlap),
                    {
                        "kind": "method",
                        "id": method["id"],
                        "path": method["id"],
                        "score": len(overlap),
                        "maturity": method.get("maturity"),
                        "text": (method.get("statement") or "")[:240],
                    },
                )
            )
    for candidate in graph.get("candidates") or []:
        blob = " ".join(
            str(candidate.get(key) or "")
            for key in ("what_is_it", "candidate_type", "where_does_it_apply", "who_should_care")
        )
        overlap = tokens & set(_tokens(blob))
        if len(overlap) >= 2:
            scored.append(
                (
                    len(overlap),
                    {
                        "kind": "candidate",
                        "id": candidate["id"],
                        "claim_id": candidate["claim_id"],
                        "path": candidate["id"],
                        "score": len(overlap),
                        "candidate_type": candidate["candidate_type"],
                        "applicability": candidate["applicability"],
                        "text": candidate["what_is_it"][:240],
                    },
                )
            )
    scored.sort(key=lambda item: (-item[0], item[1]["id"]))
    refs = []
    seen: set[str] = set()
    covered_claims: set[str] = set()
    for _score, ref in scored:
        if ref["id"] in seen:
            continue
        if ref["kind"] == "claim" and ref["id"] in covered_claims:
            continue
        if "SIGNAL_INDEX" in str(ref["path"]):
            continue
        seen.add(ref["id"])
        if ref["kind"] == "candidate" and ref.get("claim_id"):
            covered_claims.add(ref["claim_id"])
        refs.append(ref)
        if len(refs) >= cap:
            break
    return refs


def answer(graph: dict[str, Any], prompt: str) -> dict[str, Any]:
    refs = retrieve(graph, prompt)
    if not refs:
        return {"answer": "NONE", "refs": []}
    claim_ids = {ref["id"] for ref in refs if ref["kind"] == "claim"}
    claim_ids.update(ref["claim_id"] for ref in refs if ref["kind"] == "candidate" and ref.get("claim_id"))
    claims = [claim for claim in graph["claims"] if claim["id"] in claim_ids]
    picked = [row for row in graph.get("candidates") or [] if row["id"] in {ref["id"] for ref in refs}]
    domains = sorted({claim["domain"] for claim in claims if claim.get("domain")})
    domains.extend(row["where_does_it_apply"] for row in picked if row.get("where_does_it_apply") not in {"", "unspecified"})
    domains = sorted(set(domains))
    contradictions = [
        row["id"]
        for row in graph.get("contradictions") or []
        if row["claim_id"] in claim_ids or claim_ids.intersection(row.get("other_claim_ids") or [])
    ]
    maturities = sorted({ref.get("maturity") for ref in refs if ref.get("maturity")})
    experiment = graph.get("recommended_experiment")
    return {
        "answer": "GRAPH",
        "problems": domains,
        "methods": [ref["id"] for ref in refs if ref["kind"] == "method"][:3],
        "candidates": [
            {"id": row["id"], "type": row["candidate_type"], "applicability": row["applicability"]}
            for row in picked
        ][:3],
        "contradictions": contradictions[:3],
        "local_status": maturities,
        "next_experiment": None if not experiment else {
            "id": experiment["id"],
            "executed": experiment["executed"],
            "status": experiment["status"],
        },
        "refs": refs,
    }


def _retrieval_method(latency_ms: float, worked: bool, ref_count: int) -> tuple[dict[str, Any], dict[str, Any], dict[str, Any]]:
    outcome = {
        "id": "out-retrieve-milestone-20",
        "experiment_id": "exp-signal-intel-retrieve",
        "worked": worked,
        "context": "later prompt about speech versus behavior, unrelated to the bookmark ids",
        "latency_ms": round(latency_ms, 3),
        "token_cost": 0,
        "cost_usd": 0,
        "ref_count": ref_count,
        "note": "supports the retrieval method only; external methods stay unrepromoted",
    }
    experiment = {
        "id": "exp-signal-intel-retrieve",
        "status": "EXPERIMENTING",
        "executed": True,
        "hypothesis": "A later unrelated prompt returns at most 3 graph refs, or none.",
        "measure": ["hit", "ref_count", "latency_ms", "token_cost"],
        "results": {
            "hit": worked,
            "ref_count": ref_count,
            "latency_ms": outcome["latency_ms"],
            "token_cost": 0,
        },
        "owners": {"forge": "ran_local_retrieve", "watchdog": "not_run"},
    }
    method = {
        "id": "method-signal-intel-retrieve",
        "concept": "signal-intel-retrieve",
        "domain": "retrieval",
        "statement": "Retrieve at most 3 method-graph refs for a later task, or none.",
        "sources": ["milestone-20"],
        "claim_ids": [],
        "composed_of": [],
        "applies_to": ["signal-retrieve"],
        "gap": None,
        "maturity": "RECOVERED",
        "popularity_used_for_adoption": False,
        "outcome_ids": [outcome["id"]],
        "owner": "librarian",
    }
    promote(method, "LOCALLY_SUPPORTED")
    return method, experiment, outcome


def build_milestone(root: Path = ROOT, *, retrieve_latency_ms: float | None = None) -> dict[str, Any]:
    atoms = load_atoms(root)
    capabilities = load_capabilities(root)
    ai_items = _bookmark_items(root / "docs/hive/outer-heaven/CONTENT/x-bookmarks/ai-only.json")
    latest_items = _bookmark_items(root / "docs/hive/outer-heaven/CONTENT/x-bookmarks/latest.json")
    signals: list[dict[str, Any]] = []
    claims: list[dict[str, Any]] = []

    for item in select_x_text(ai_items):
        signal = _signal_shell(
            f"sig-x-text-{item['id']}",
            "x_text",
            item.get("url") or "",
            {"bookmark_id": item["id"], "author": item.get("author_username") or ""},
        )
        artifact = "docs/hive/outer-heaven/CONTENT/x-bookmarks/ai-only.json"
        text = item.get("text") or ""
        _apply_coverage(
            signal,
            coverage_for_text_kind(
                "x_text",
                text,
                text_reason="post text from the bookmark export; thread not recovered",
                text_artifact=artifact,
            ),
        )
        claims.append(build_quote_claim(signal, text, artifact))
        signals.append(signal)

    packet = _packet_dir(root, X_PACKET)
    signal = _signal_shell(
        f"sig-x-video-{X_PACKET}",
        "x_video",
        f"https://x.com/i/web/status/{X_PACKET.removeprefix('x-')}",
        {"video_id": X_PACKET},
    )
    speech = packet / "xclip-speech.txt"
    full = packet / "full.txt"
    coverage = {name: _unavailable("not recovered for this X clip") for name in CHANNELS}
    if full.is_file():
        coverage["TEXT"] = _channel(
            "PARTIAL",
            "caption window plus clip speech; pixels unobserved",
            _rel(full),
        )
    if speech.is_file():
        coverage["AUDIO"] = _channel(
            "PARTIAL",
            "speech file present; duration not re-checked this run",
            _rel(speech),
        )
    coverage["VIDEO"] = _unavailable("X video file not in the packet; pixels unobserved")
    coverage["FRAMES"] = _unavailable("no watch.json frame list")
    text_blob = full.read_text(encoding="utf-8", errors="replace")[:4000] if full.is_file() else ""
    coverage["LINKS"] = _link_channel(text_blob)
    coverage["REPO"] = _repo_channel(text_blob)
    coverage["DOCS"] = _unavailable("external docs linked from the clip were not fetched")
    _apply_coverage(signal, coverage)
    atom_path = root / "docs/hive/outer-heaven/CONTENT/knowledge/atoms/by-video" / f"{X_PACKET}.jsonl"
    if atom_path.is_file():
        claims.extend(build_claims_from_atoms(signal, atoms.get(X_PACKET, []), _rel(atom_path)))
    signals.append(signal)

    for item in select_x_video(latest_items):
        signal = _signal_shell(
            f"sig-x-video-{item['id']}",
            "x_video",
            item.get("url") or "",
            {"bookmark_id": item["id"], "author": item.get("author_username") or ""},
        )
        text = item.get("text") or ""
        artifact = "docs/hive/outer-heaven/CONTENT/x-bookmarks/latest.json"
        coverage = coverage_for_text_kind(
            "x_video",
            text,
            text_reason="post text only; the video file was not recovered",
            text_artifact=artifact,
        )
        coverage["VIDEO"] = _unavailable("video/demo mentioned; media file absent")
        coverage["AUDIO"] = _unavailable("no speech file for this post")
        coverage["FRAMES"] = _unavailable("no frames extracted")
        _apply_coverage(signal, coverage)
        claims.append(build_quote_claim(signal, text, artifact))
        signals.append(signal)

    for video_id in select_youtube(root, atoms):
        packet_dir = _packet_dir(root, video_id)
        signal = _signal_shell(
            f"sig-yt-{video_id}",
            "youtube",
            f"https://www.youtube.com/watch?v={video_id}",
            {"video_id": video_id},
        )
        full = packet_dir / "full.txt"
        coverage = {name: _unavailable("not recovered for this video") for name in CHANNELS}
        coverage["TEXT"] = _channel(
            "PARTIAL",
            "caption transcript on disk; not the whole video",
            _rel(full),
        )
        coverage["VIDEO"] = _unavailable("no native video file; transcript is not the video")
        coverage["AUDIO"] = _unavailable("no separate full-duration audio artifact")
        coverage["FRAMES"] = _unavailable("no adaptive frame list; transcript is not visual evidence")
        blob = full.read_text(encoding="utf-8", errors="replace")[:4000]
        coverage["LINKS"] = _link_channel(blob)
        coverage["REPO"] = _repo_channel(blob)
        coverage["DOCS"] = _unavailable("linked docs were not fetched")
        _apply_coverage(signal, coverage)
        atom_file = root / "docs/hive/outer-heaven/CONTENT/knowledge/atoms/by-video" / f"{video_id}.jsonl"
        claims.extend(build_claims_from_atoms(signal, atoms.get(video_id, []), _rel(atom_file)))
        signals.append(signal)

    for repo in select_repos(root):
        signal = _signal_shell(
            f"sig-repo-{repo['org']}-{repo['name']}",
            "repo",
            repo["url"],
            repo,
        )
        coverage = {name: _unavailable("repository body not recovered") for name in CHANNELS}
        coverage["TEXT"] = _channel(
            "PARTIAL",
            "local note cites the url; repository text was not copied",
            repo["cited_in"],
        )
        coverage["LINKS"] = _channel("PARTIAL", "github url seen; not fetched", repo["url"])
        coverage["REPO"] = _unavailable("no local clone or tree hash")
        _apply_coverage(signal, coverage)
        signal["pipeline_gaps"] = ["CLAIMS_EXTRACTED: repo body absent, so no claims were invented"]
        signals.append(signal)

    for rel in ARTICLE_FILES:
        path = root / rel
        signal = _signal_shell(
            "sig-article-" + Path(rel).stem,
            "article",
            rel,
            {"local_note": rel},
        )
        coverage = {name: _unavailable("external article not recovered") for name in CHANNELS}
        if path.is_file():
            coverage["TEXT"] = _channel(
                "PARTIAL",
                "local note only; external article body not stored",
                rel,
            )
        coverage["DOCS"] = _unavailable("external article/docs body not stored")
        _apply_coverage(signal, coverage)
        signal["pipeline_gaps"] = ["CLAIMS_EXTRACTED: local note is not the article, so no claims were invented"]
        signals.append(signal)

    claims = dedupe_claims(claims)
    synthesized = synthesize(signals, claims, capabilities)

    started = time.perf_counter()
    probe_graph = {
        "claims": claims,
        "methods": synthesized["methods"],
        "candidates": synthesized["candidates"],
        "contradictions": synthesized["contradictions"],
        "recommended_experiment": synthesized["recommended_experiment"],
    }
    probe_refs = retrieve(probe_graph, "do not average speech and behavior mismatches")
    elapsed_ms = (time.perf_counter() - started) * 1000 if retrieve_latency_ms is None else retrieve_latency_ms
    retrieval_method, retrieval_experiment, outcome = _retrieval_method(
        elapsed_ms,
        worked=bool(probe_refs),
        ref_count=len(probe_refs),
    )
    methods = synthesized["methods"] + [retrieval_method]
    experiments = [item for item in (synthesized["recommended_experiment"], retrieval_experiment) if item]

    graph = {
        "cohort_version": "milestone-20",
        "signals": signals,
        "claims": claims,
        "method_atoms": synthesized["method_atoms"],
        "methods": methods,
        "candidates": synthesized["candidates"],
        "contradictions": synthesized["contradictions"],
        "clusters": synthesized["clusters"],
        "experiments": experiments,
        "outcomes": [outcome],
        "recommended_experiment": synthesized["recommended_experiment"],
        "capabilities": [
            {
                "capability_id": cap["capability_id"],
                "status": cap["status"],
                "path": cap["path"],
                "origin": cap["origin"],
            }
            for cap in capabilities
        ],
        "edges": _edges(
            signals,
            claims,
            synthesized["method_atoms"],
            methods,
            synthesized["candidates"],
            synthesized["contradictions"],
            experiments,
            outcome,
        ),
    }
    graph["grade"] = grade_milestone(graph)
    graph["synthesis_md"] = render_synthesis(graph)
    return graph


def _edges(
    signals: list[dict[str, Any]],
    claims: list[dict[str, Any]],
    method_atoms: list[dict[str, Any]],
    methods: list[dict[str, Any]],
    candidates: list[dict[str, Any]],
    contradictions: list[dict[str, Any]],
    experiments: list[dict[str, Any]],
    outcome: dict[str, Any],
) -> list[dict[str, str]]:
    edges: list[dict[str, str]] = []
    claim_signal = {claim["id"]: claim["signal_id"] for claim in claims}
    for claim in claims:
        edges.append({"from": claim_signal[claim["id"]], "rel": "contains", "to": claim["id"]})
    for atom in method_atoms:
        for claim_id in atom["claim_ids"]:
            edges.append({"from": claim_signal.get(claim_id, claim_id), "rel": "supports", "to": atom["id"]})
    for candidate in candidates:
        edges.append({"from": candidate["claim_id"], "rel": "decomposes_to", "to": candidate["id"]})
        for cap_id in candidate["what_existing_asset_does_it_improve"]:
            edges.append({"from": candidate["id"], "rel": "applies_to", "to": cap_id})
    for method in methods:
        for atom_id in method["composed_of"]:
            edges.append({"from": method["id"], "rel": "composed_of", "to": atom_id})
        for cap_id in method["applies_to"]:
            edges.append({"from": method["id"], "rel": "applies_to", "to": cap_id})
        for claim_id in method["claim_ids"]:
            edges.append({"from": claim_signal.get(claim_id, claim_id), "rel": "suggests", "to": method["id"]})
    for row in contradictions:
        edges.append({"from": row["claim_id"], "rel": "contradicts", "to": row["target_ref"]})
    for experiment in experiments:
        edges.append({"from": experiment["id"], "rel": "produced", "to": outcome["id"] if experiment["executed"] else "no-outcome"})
    return edges


def grade_milestone(graph: dict[str, Any]) -> dict[str, Any]:
    signals = graph["signals"]
    kinds = defaultdict(int)
    for signal in signals:
        kinds[signal["kind"]] += 1
    complete_channels = []
    for signal in signals:
        for name, channel in signal["coverage"].items():
            if channel["status"] == "COMPLETE":
                complete_channels.append(f"{signal['id']}:{name}")
    external = [method for method in graph["methods"] if method["id"] != "method-signal-intel-retrieve"]
    adopted = [method["id"] for method in graph["methods"] if method["maturity"] in ADOPTION_BLOCKED]
    multi_output = [
        signal["id"]
        for signal in signals
        if len({output["type"] for output in signal["outputs"]}) >= 2
    ]
    quote_ok = all(
        claim["text"] == next(signal["outputs"][0]["text"] for signal in signals if signal["id"] == claim["signal_id"])
        for claim in graph["claims"]
        if claim["extractor"] == "bookmark-text-quote"
    )
    both = [row for row in graph["contradictions"] if row["both_in_cohort"]]
    candidates = graph.get("candidates") or []
    candidate_types = {row["candidate_type"] for row in candidates}
    forced_behavior = [
        row["id"]
        for row in candidates
        if row.get("applicability") in BEHAVIOR_CHANGING or row.get("inject_globally") or row.get("creates_new_subsystem")
    ]
    method_claim_ids = {claim_id for method in graph["methods"] for claim_id in method.get("claim_ids") or []}
    quote_without_method = [
        signal["id"]
        for signal in signals
        if signal["kind"] == "x_text"
        and signal["claim_ids"]
        and signal.get("candidate_ids")
        and not (set(signal["claim_ids"]) & method_claim_ids)
    ]
    dinner = retrieve(graph, "what's for dinner tonight")
    later = retrieve(graph, "do not average speech and behavior mismatches")
    recommended = graph.get("recommended_experiment")
    stages = {
        "source_completeness": "PASS" if signals and not complete_channels else "FAIL",
        "claims": "PASS" if any(claim["extractor"] == "existing-atom-copy" for claim in graph["claims"]) else "FAIL",
        "typed_outputs": "PASS" if multi_output else "FAIL",
        "dedupe": "PASS",
        "clustering": "PASS" if graph["clusters"] else "FAIL",
        "contradictions": "PASS" if both else "FAIL",
        "method_atoms": "PASS" if graph["method_atoms"] else "FAIL",
        "capability_mapping": "PASS" if any(method["applies_to"] for method in external) else "FAIL",
        "recommended_experiment": "PASS" if recommended and recommended["executed"] is False else "FAIL",
        "experiment_execution": "BLOCKED",
        "measured_outcome": "PASS" if graph["outcomes"] and graph["outcomes"][0]["token_cost"] == 0 else "FAIL",
        "method_status_update": "PASS" if not adopted else "FAIL",
        "later_retrieval": "PASS" if later and not dinner and len(later) <= 3 else "FAIL",
        "improvement_candidates": "PASS" if len(candidate_types) >= 3 else "FAIL",
        "signal_not_method": "PASS" if quote_without_method else "FAIL",
        "applicability_guard": "PASS" if candidates and not forced_behavior else "FAIL",
    }
    if recommended and recommended["results"] is not None:
        stages["experiment_execution"] = "FAIL"
    external_promoted = [
        method["id"]
        for method in external
        if method["maturity"] in {"LOCALLY_SUPPORTED", *ADOPTION_BLOCKED}
    ]
    invariants_ok = (
        all(status != "FAIL" for status in stages.values())
        and quote_ok
        and not external_promoted
        and kinds["x_text"] == 5
        and kinds["x_video"] == 5
        and kinds["youtube"] == 5
        and kinds["repo"] == 3
        and kinds["article"] == 2
        and len(signals) == 20
    )
    return {
        "author": "forge",
        "watchdog_grade": "ABSENT",
        "milestone": "PARTIAL",
        "ready_to_scale": False,
        "invariants_ok": invariants_ok,
        "counts": {
            "signals": len(signals),
            "kinds": dict(kinds),
            "claims": len(graph["claims"]),
            "clusters": len(graph["clusters"]),
            "contradictions": len(graph["contradictions"]),
            "contradictions_in_cohort": len(both),
            "method_atoms": len(graph["method_atoms"]),
            "methods": len(graph["methods"]),
            "candidates": len(candidates),
            "candidate_types": sorted(candidate_types),
            "complete_channels": complete_channels,
        },
        "stages": stages,
        "quote_claims_are_source_text": quote_ok,
        "external_methods_blocked": external_promoted,
        "note": "PARTIAL is the result. Files existing is not adoption. The recommended experiment was not run.",
    }


def render_synthesis(graph: dict[str, Any]) -> str:
    domain_clusters = [
        cluster for cluster in graph["clusters"] if cluster["id"] != "problem-in-cohort-contradictions"
    ]
    ranked = sorted(domain_clusters or graph["clusters"], key=lambda row: (-len(row["sources"]), row["id"]))
    top = ranked[0] if ranked else None
    recommended = graph.get("recommended_experiment")
    if recommended and domain_clusters:
        claim_by_id = {claim["id"]: claim for claim in graph["claims"]}
        contradiction = next(
            (row for row in graph["contradictions"] if row["id"] == recommended.get("contradiction_id")),
            None,
        )
        if contradiction:
            domain = (claim_by_id.get(contradiction["claim_id"]) or {}).get("domain")
            matched = next((cluster for cluster in domain_clusters if cluster["problem"] == domain), None)
            if matched:
                top = matched
    lines = [
        "# Milestone 20 synthesis",
        "",
        "Generated from stored claims. Not averaged. Not adopted.",
        "",
        "The vision-versus-accessibility browser example is not this cohort. Those sources were not recovered here.",
        "",
        "CANDIDATES",
    ]
    type_counts: dict[str, int] = defaultdict(int)
    for candidate in graph.get("candidates") or []:
        type_counts[candidate["candidate_type"]] += 1
    if not type_counts:
        lines.append("- none")
    for name, count in sorted(type_counts.items()):
        lines.append(f"- {name}: {count}")
    lines.extend(
        [
            "applicability: EXPERIMENTAL or REFERENCE_ONLY. None are MANDATORY or DEFAULT.",
            "A quote can be a REFERENCE and contain zero methods.",
            "",
        ]
    )
    if not top:
        lines.append("PROBLEM")
        lines.append("none — no domain has two independent sources in this cohort")
    else:
        claims = {claim["id"]: claim for claim in graph["claims"]}
        lines.append("PROBLEM")
        lines.append(top["problem"])
        lines.append("")
        lines.append(f"sources: {', '.join(top['sources'])}")
        lines.append("")
        lines.append("APPROACHES")
        by_concept: dict[str, list[dict[str, Any]]] = defaultdict(list)
        for claim_id in top["claim_ids"]:
            claim = claims[claim_id]
            by_concept[claim["concept"] or claim["id"]].append(claim)
        for concept, grouped in sorted(by_concept.items()):
            lines.append("")
            lines.append(f"APPROACH {concept}")
            lines.append("sources: " + ", ".join(sorted({str(claim["source_id"]) for claim in grouped})))
            for claim in grouped:
                lines.append(f"- {claim['source_id']}: {claim['text']}")
                if claim["conditions"]:
                    lines.append(f"  conditions: {claim['conditions']}")
                if claim["exceptions"]:
                    lines.append(f"  exceptions: {claim['exceptions']}")
        lines.append("")
        lines.append("CONTRADICTIONS")
        shown = 0
        for row in graph["contradictions"]:
            if row["claim_id"] not in set(top["claim_ids"]):
                continue
            lines.append(f"- {row['id']}: winner=none resolution={row['resolution']} in_cohort={row['both_in_cohort']}")
            shown += 1
        if not shown:
            lines.append("- none inside this problem")
    lines.extend(["", "LOCAL CURRENT SYSTEM"])
    mapped = [method for method in graph["methods"] if method["applies_to"] and method["id"] != "method-signal-intel-retrieve"]
    if mapped:
        for method in mapped:
            lines.append(f"- {method['id']} applies_to {', '.join(method['applies_to'])} maturity {method['maturity']}")
    else:
        lines.append("- no external method mapped onto an existing capability")
    lines.extend(["", "GAP"])
    gaps = [method for method in graph["methods"] if method.get("gap")]
    if gaps:
        lines.append(f"- {gaps[0]['id']}: {gaps[0]['gap']}")
    else:
        lines.append("- none recorded")
    experiment = graph.get("recommended_experiment")
    lines.extend(["", "BEST EXPERIMENT"])
    if experiment:
        lines.append(experiment["hypothesis"])
        lines.append(f"status: {experiment['status']} executed: {str(experiment['executed']).lower()}")
    else:
        lines.append("none")
    lines.extend(["", "MEASURE"])
    if experiment:
        lines.append(", ".join(experiment["measure"]))
        lines.append("results: null — not run")
    lines.extend(
        [
            "",
            "MILESTONE",
            "PARTIAL. Recommended experiment is not executed. Retrieval has one local outcome. Nothing is ADOPTED. Candidates are not behavior.",
            "",
        ]
    )
    return "\n".join(lines)


def write_milestone(graph: dict[str, Any], out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    for name, key in (
        ("signals.json", "signals"),
        ("claims.json", "claims"),
        ("method-atoms.json", "method_atoms"),
        ("methods.json", "methods"),
        ("candidates.json", "candidates"),
        ("contradictions.json", "contradictions"),
        ("clusters.json", "clusters"),
        ("experiments.json", "experiments"),
        ("outcomes.json", "outcomes"),
        ("edges.json", "edges"),
    ):
        payload = graph[key]
        (out_dir / name).write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    (out_dir / "grade.json").write_text(json.dumps(graph["grade"], indent=2, sort_keys=True) + "\n", encoding="utf-8")
    (out_dir / "synthesis.md").write_text(graph["synthesis_md"], encoding="utf-8")
    cohort = [
        {"id": signal["id"], "kind": signal["kind"], "source_ref": signal["source_ref"], "state": signal["processing_state"]}
        for signal in graph["signals"]
    ]
    (out_dir / "cohort.json").write_text(json.dumps(cohort, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def format_answer(payload: dict[str, Any]) -> str:
    if payload.get("answer") == "NONE":
        return "NONE"
    lines = [
        "PROBLEMS",
        ", ".join(payload["problems"]) or "none",
        "METHODS",
        ", ".join(payload["methods"]) or "none",
        "CANDIDATES",
        ", ".join(f"{row['type']}:{row['applicability']}" for row in payload.get("candidates") or []) or "none",
        "CONTRADICTIONS",
        ", ".join(payload["contradictions"]) or "none",
        "LOCAL STATUS",
        ", ".join(payload["local_status"]) or "external status unchanged",
        "NEXT EXPERIMENT",
        "none" if not payload["next_experiment"] else json.dumps(payload["next_experiment"], sort_keys=True),
        "REFS",
    ]
    for ref in payload["refs"]:
        lines.append(f"- {ref['kind']} {ref['id']} {ref['path']}")
    return "\n".join(lines)


def self_test(root: Path = ROOT) -> list[str]:
    errs: list[str] = []
    graph = build_milestone(root, retrieve_latency_ms=0)
    grade = graph["grade"]
    if not grade["invariants_ok"]:
        errs.append(f"invariants failed {grade['stages']} counts={grade['counts']}")
    if grade["milestone"] != "PARTIAL" or grade["ready_to_scale"] is not False:
        errs.append("milestone must stay PARTIAL and not ready to scale")
    if grade["watchdog_grade"] != "ABSENT":
        errs.append("builder recorded a watchdog grade")
    try:
        promote({"id": "x", "outcome_ids": []}, "ADOPTED")
        errs.append("ADOPTED without Evens was allowed")
    except PromotionError:
        pass
    try:
        promote({"id": "x", "outcome_ids": ["o"]}, "VERIFIED", watchdog_grade=str(root / "missing-grade.md"))
        errs.append("VERIFIED without a grade file was allowed")
    except PromotionError:
        pass
    try:
        _channel("COMPLETE", "preview", "preview")
        errs.append("preview was accepted as COMPLETE")
    except CoverageError:
        pass
    if "Not averaged" not in graph["synthesis_md"] or "ADOPTED" not in graph["synthesis_md"]:
        errs.append("synthesis missed the no-average / not-adopted lines")
    if "not this cohort" not in graph["synthesis_md"]:
        errs.append("synthesis presented an unrecovered browser example as this cohort")
    recommended = graph["recommended_experiment"]
    if not recommended or not recommended.get("cross_source"):
        errs.append("recommended experiment is not a cross-source disagreement")
    if any(signal["processing_state"] != "RAW" for signal in graph["signals"] if signal["kind"] == "repo"):
        errs.append("an unrecovered repo was marked recovered")
    if any(method["maturity"] == "ADOPTED" for method in graph["methods"]):
        errs.append("a method was adopted")
    try:
        set_applicability({"id": "x"}, "MANDATORY")
        errs.append("MANDATORY applicability was allowed")
    except PromotionError:
        pass
    try:
        set_applicability({"id": "x"}, "CONDITIONAL")
        errs.append("CONDITIONAL applicability was allowed without a local test")
    except PromotionError:
        pass
    internal = build_candidates(
        [
            {
                "id": "internal-fixture",
                "signal_id": "sig-internal-fixture",
                "text": "a fresh grade disagreed with the builder",
                "extractor": "internal-outcome",
                "output_type": "contradiction_note",
                "concept": "independent-grade",
                "domain": "evaluation",
                "conditions": "after a builder claims pass",
                "exceptions": "do not inject into every desk",
                "conflicts_with": [],
                "evidence_status": "observed",
                "source_id": "fixture",
            }
        ],
        [],
        origin="internal",
    )
    if len(internal) != 1 or internal[0]["origin"] != "internal":
        errs.append("internal signal did not become one candidate")
    if internal and (
        internal[0]["applicability"] != "EXPERIMENTAL"
        or internal[0]["has_it_been_tested_locally"]
        or internal[0]["candidate_type"] != "PROOF_PATTERN"
    ):
        errs.append("internal disagreement was promoted into behavior")
    if any(row["applicability"] in BEHAVIOR_CHANGING for row in graph["candidates"]):
        errs.append("a cohort candidate is mandatory or default")
    return errs


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Compile one 20-signal intelligence cohort.")
    parser.add_argument("command", choices=("compile", "retrieve", "grade", "self-test"))
    parser.add_argument("--prompt", default="")
    parser.add_argument("--out", default=str(DEFAULT_OUT))
    parser.add_argument("--format", choices=("text", "json"), default="text")
    args = parser.parse_args(argv)

    if args.command == "self-test":
        errs = self_test()
        if errs:
            print("FAIL: " + "; ".join(errs), file=sys.stderr)
            return 1
        print("OK: signal-intel invariants hold; milestone PARTIAL")
        return 0

    graph = build_milestone()
    out_dir = Path(args.out)
    if args.command == "compile":
        write_milestone(graph, out_dir)
        print(json.dumps({"out": str(out_dir), "milestone": graph["grade"]["milestone"], "invariants_ok": graph["grade"]["invariants_ok"]}, sort_keys=True))
        return 0 if graph["grade"]["invariants_ok"] else 1
    if args.command == "grade":
        payload = graph["grade"]
        if args.format == "json":
            print(json.dumps(payload, indent=2, sort_keys=True))
        else:
            print(f"milestone {payload['milestone']} invariants_ok {payload['invariants_ok']} ready_to_scale {payload['ready_to_scale']}")
        return 0 if payload["invariants_ok"] else 1
    if not args.prompt.strip():
        print("NONE")
        return 0
    payload = answer(graph, args.prompt)
    if args.format == "json":
        print(json.dumps(payload, indent=2, sort_keys=True))
    else:
        print(format_answer(payload))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
