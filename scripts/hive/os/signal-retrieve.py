#!/usr/bin/env python3
"""Retrieve-when-relevant: classify a prompt → ≤3 local signal refs, or NONE.

Lookup SSOT: docs/hive/outer-heaven/CONTENT/researcher/SIGNAL-DOMAIN-MAP.md
Filter first (classify-question-then-pick-retrieval + filter-then-llm).
Do not dump SIGNAL_INDEX / STEAL_SHEET / dossiers into briefs.
Do not invent /workspace packets or UNKNOWN HOW THEY BUILT.

WAKE: human-run or brief --signals --prompt (default off)
HOST: local
DONE-CHECK: --prompt match → ≤3 existing Mac paths; miss → NONE; --self-test exits 0
CAP: this retrieve wire · no landing farm · no game · no billed generate · no mint
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

# Repo root from this file (scripts/hive/os/…). Cloud checkout ≠ this Mac path.
ROOT = Path(__file__).resolve().parents[3]
DOMAIN_MAP = (
    ROOT
    / "docs/hive/outer-heaven/CONTENT/researcher/SIGNAL-DOMAIN-MAP.md"
)
STEAL_SHEET = (
    "docs/hive/outer-heaven/CONTENT/watch-later/STEAL_SHEET.md"
)
REF_CAP = 3
THEMES = (
    "design",
    "motion",
    "effects",
    "ui",
    "personal-agent",
    "business-agent",
    "animation",
    "image-video",
    "games",
    "websites",
    "matrix",
    "ai-tools",
    "md-files",
    "prompts",
    "workflows",
    "tasks",
    "code",
    "skills",
    "stack",
    "outbound",
    "book-door",
    "eval-harness",
    "vault-wiki",
    "money-spine",
    "ingest",
    "etc",
)
# Bare token is too common — require prompt_match / EXTRA_PATTERNS.
WEAK_THEME_NAMES = frozenset(
    {"prompts", "workflows", "tasks", "code", "skills", "stack", "etc", "ingest"}
)
# Longer / more specific wins a score tie. Process domains beat the broad first-11.
TIEBREAK = (
    "outbound",
    "book-door",
    "eval-harness",
    "vault-wiki",
    "money-spine",
    "ingest",
    "image-video",
    "animation",
    "personal-agent",
    "business-agent",
    "effects",
    "motion",
    "design",
    "ui",
    "websites",
    "games",
    "matrix",
    "ai-tools",
    "md-files",
    "prompts",
    "workflows",
    "tasks",
    "code",
    "skills",
    "stack",
    "etc",
)
WEAK_SINGLES = {
    "type",
    "tokens",
    "wrap",
    "clip",
    "grade",
    "color",
    "page",
    "site",
    "os",
    "our",
    "a",
    "the",
    "vs",
}
# Extra aliases beyond the map's Prompt match line (still one domain).
EXTRA_PATTERNS: dict[str, list[tuple[re.Pattern[str], int]]] = {
    "design": [
        (re.compile(r"\bdesign(er|s|ing)?\b"), 3),
        (re.compile(r"\b(award[\s-]?site|style bible|mockup|indigo slop|font lock|type/?tokens?)\b"), 3),
        (re.compile(r"\bagency page\b"), 3),
    ],
    "motion": [
        (re.compile(r"\bmotion\b"), 3),
        (re.compile(r"\b(scroll[\s-]?scrub|seedance|hero video|previs|still\s*(→|->|to)\s*clip)\b"), 3),
        (re.compile(r"\bplate scroll\b"), 2),
    ],
    "effects": [
        (re.compile(r"\b(effects?|vfx|ae vectors?|lighting sliders?|higgsfield)\b"), 3),
        (re.compile(r"\bbuild a plugin\b"), 3),
    ],
    "ui": [
        (re.compile(r"\b(ui|ux|user interface|client-facing chrome|cta-before-scroll)\b"), 3),
        (re.compile(r"\b(click the live|owned page|emit from a ref)\b"), 3),
        (re.compile(r"\b(decorator|orb)\b"), 2),
    ],
    "personal-agent": [
        (re.compile(r"\bpersonal[\s-]?agents?\b"), 4),
        (re.compile(r"\b(named desk|session bootstrap|second brain|skills-as-recipes|wiki as os)\b"), 3),
        (re.compile(r"\briley\b"), 2),
    ],
    "business-agent": [
        (re.compile(r"\bbusiness[\s-]?agents?\b"), 4),
        (re.compile(r"\b(consult(?:ant)? vs build|doctor vs pharmacist|audit[\s-]?first|four[\s-]?deal|book[\s-]?path|fde gym)\b"), 3),
        (re.compile(r"\b(consultant|paid audit|nate herk|liam ottley)\b"), 2),
    ],
    "animation": [
        (re.compile(r"\banimat(e|ion|ing)\b"), 4),
        (re.compile(r"\b(spoken beat|lottie|icon pack|ae vector|script[\s-]?beat)\b"), 3),
    ],
    "image-video": [
        (re.compile(r"\bimage[\s/-]?video\b"), 4),
        (re.compile(r"\b((?:image|video|clip)\s+(?:gen(?:erate)?|edit)|product ad|still edit|drop[\s-]?folder|long[\s-]?ep)\b"), 3),
        (re.compile(r"\b(generate|edit)\s+(an?\s+)?(image|video|photo|clip)\b"), 3),
    ],
    "games": [
        (re.compile(r"\b(godot|playable loop|world[\s-]?model|sprite engine|interactive world)\b"), 3),
        (re.compile(r"\b(build (?:the |a )?game|video games?)\b"), 4),
        (re.compile(r"\bgames?\b"), 3),
    ],
    "websites": [
        (re.compile(r"\b(website|webapp|landing page|cinematic (?:landing|site)|path [abc]|seedance scroll)\b"), 4),
        (re.compile(r"\b(landing|path c)\b"), 2),
    ],
    "matrix": [
        (re.compile(r"\b(system matrix|who wakes|hold[\s-]?outs?|watching . doing|spawn desks|dark[\s-]?factory|24/?7)\b"), 3),
        (re.compile(r"\b(code\s*/\s*surface\s*/\s*chat)\b"), 3),
        (re.compile(r"\bmatrix\b"), 4),
    ],
    "ai-tools": [
        (re.compile(r"\b(ai[\s-]?tools?|tool inventory|tool_matrix|agent_tool_inventory)\b"), 4),
        (re.compile(r"\b(which tools|n8n on[\s-]?demand|assigned tools|tool matrix)\b"), 3),
        (re.compile(r"\b(named tools?|desk tools?)\b"), 2),
    ],
    "md-files": [
        (re.compile(r"\b(operator_memory|signal-to-capability|doctrine notes|md[\s-]?files)\b"), 4),
        (re.compile(r"\b(grill captures?|matrix-process|operator memory)\b"), 3),
    ],
    "prompts": [
        (re.compile(r"\b(prompt[\s-]?packs?|nate[\s-]?claude|##prompts)\b"), 4),
        (re.compile(r"\b(grill into a prompt|grill-me-into-prompt)\b"), 3),
    ],
    "workflows": [
        (re.compile(r"\b(workflow index|compiled workflow|tape machine workflow|dry[\s-]?run(?:s)? folder)\b"), 4),
        (re.compile(r"\b(workflow compiler|workflows? index)\b"), 3),
    ],
    "tasks": [
        (re.compile(r"\b(desk[\s-]?missions[\s-]?now|hive jobs?|implement[\s-]?queue)\b"), 4),
        (re.compile(r"\b(state\.json jobs|current hive job)\b"), 3),
    ],
    "code": [
        (re.compile(r"\b(signal-retrieve\.py|grill-me\.py|cursor-chat-sessions\.py|outer-heaven-brief\.py|hive-state\.py)\b"), 4),
        (re.compile(r"\b(os scripts?|hive runners?)\b"), 3),
    ],
    "skills": [
        (re.compile(r"\b(invoke-scoreboard|grok-skills|skill cluster|skill ssot)\b"), 4),
        (re.compile(r"\b(retrieve factory cinematic|book/?hitl)\b"), 3),
    ],
    "stack": [
        (re.compile(r"\b(hive-funnels-stack|primitives\.json|cursor plus grok|our stack)\b"), 4),
        (re.compile(r"\b(stack doctrine|grok bot doctrine)\b"), 3),
    ],
    "outbound": [
        (re.compile(r"\b(outbound[\s-]?playbook|playbook[\s-]?before[\s-]?send|same[\s-]?day[\s-]?qa|list[\s-]?anneal)\b"), 4),
        (re.compile(r"\b(pack[\s-]?cards|human mouth|model never dials|approved to send)\b"), 3),
        (re.compile(r"\boutbound\b"), 3),
    ],
    "book-door": [
        (re.compile(r"\b(private[\s-]?book|missed[\s-]?call|review[\s-]?to[\s-]?book|book[\s-]?door)\b"), 4),
        (re.compile(r"\b(inquire then ask|second call books|gather[\s-]?report[\s-]?human)\b"), 3),
        (re.compile(r"\b(hard book path|callback is the product)\b"), 3),
    ],
    "eval-harness": [
        (re.compile(r"\b(golden[\s-]?test[\s-]?loop|eval[\s-]?then[\s-]?wrap|same[\s-]?prompt bench|eval[\s-]?harness)\b"), 4),
        (re.compile(r"\b(verify[\s-]?until|cheap check|trusted check|stop condition)\b"), 3),
        (re.compile(r"\b(macro[\s-]?action \+ metric|named workers)\b"), 2),
    ],
    "vault-wiki": [
        (re.compile(r"\b(wiki[\s-]?ingest|vault[\s-]?not[\s-]?prompt|syncthing[\s-]?vault|vault[\s-]?wiki)\b"), 4),
        (re.compile(r"\b(raw\s*(→|->|to)\s*wiki|purpose[\s-]?named vault|wiki index log)\b"), 3),
        (re.compile(r"\b(index \+ log|vault is files)\b"), 2),
    ],
    "money-spine": [
        (re.compile(r"\b(paid[\s-]?slice|checkout in one sitting|money[\s-]?spine|aha then charge)\b"), 4),
        (re.compile(r"\b(hours then fraction|fraction price|waitlist then real pay|stripe hitl)\b"), 3),
        (re.compile(r"\b(preview ≠ domain|preview != domain)\b"), 2),
    ],
    "ingest": [
        (re.compile(r"\b(ingest[\s-]?is[\s-]?steps|folder[\s-]?ingest|channel[\s-]?walk|social[\s-]?source[\s-]?ingest)\b"), 4),
        (re.compile(r"\b(count then gold[\s-]?q|packet\+learned|build tape)\b"), 3),
        (re.compile(r"\b(folder[\s-]?drop ingest|watched folder)\b"), 2),
    ],
    "etc": [
        (re.compile(r"\b(capabilities\.json|capability registry|packet store index)\b"), 4),
        (re.compile(r"\b(signal_index names|compiled capabilities)\b"), 3),
    ],
}

HEADING = re.compile(r"^## (" + "|".join(THEMES) + r")\s*$")
TICK = re.compile(r"`([^`]+)`")
ROW = re.compile(r"^\| (.+) \|\s*$")


@dataclass
class Ref:
    person: str
    machine: str
    path: str


@dataclass
class Domain:
    name: str
    prompt_match: str = ""
    refs: list[Ref] = field(default_factory=list)
    local_paths: list[str] = field(default_factory=list)


@dataclass
class Result:
    theme: str
    refs: list[Ref]


def _norm(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").strip())


def _is_workspace(p: str) -> bool:
    return "/workspace" in p.replace("\\", "/")


def _resolve_cell_path(cell: str) -> str | None:
    """First local file path in a table cell. Never invent /workspace."""
    for raw in TICK.findall(cell):
        t = raw.strip()
        if _is_workspace(t):
            continue
        if t.endswith(".md") or t.endswith(".json") or "/" in t:
            return t
    if "STEAL_SHEET" in cell and not _is_workspace(cell):
        return STEAL_SHEET
    return None


def _exists(rel: str) -> bool:
    if not rel or _is_workspace(rel):
        return False
    p = Path(rel)
    if p.is_absolute():
        return p.is_file()
    return (ROOT / rel).is_file()


def _split_row(line: str) -> list[str] | None:
    if not line.startswith("|") or line.startswith("|---") or line.startswith("| -----"):
        return None
    inner = line.strip()
    if inner.startswith("|"):
        inner = inner[1:]
    if inner.endswith("|"):
        inner = inner[:-1]
    cols = [c.strip() for c in inner.split("|")]
    if len(cols) < 3:
        return None
    if cols[0].lower() in {"who", "-----"} or set(cols[0]) <= {"-", " "}:
        return None
    return cols


def parse_domain_map(text: str) -> dict[str, Domain]:
    domains: dict[str, Domain] = {}
    current: Domain | None = None
    for line in text.splitlines():
        hm = HEADING.match(line)
        if hm:
            current = Domain(name=hm.group(1))
            domains[current.name] = current
            continue
        if current is None:
            continue
        if line.startswith("## "):
            current = None
            continue
        if line.startswith("**Prompt match:**"):
            current.prompt_match = _norm(line.split(":", 1)[1])
            continue
        if line.startswith("**Local paths"):
            for raw in TICK.findall(line):
                if not _is_workspace(raw):
                    current.local_paths.append(raw)
            if "STEAL_SHEET" in line and STEAL_SHEET not in current.local_paths:
                current.local_paths.append(STEAL_SHEET)
            continue
        cols = _split_row(line)
        if not cols or len(cols) < 3:
            continue
        who, demonstrated, loc = cols[0], cols[1], cols[2]
        rel = _resolve_cell_path(loc)
        if not rel:
            continue
        current.refs.append(Ref(person=_norm(who), machine=_norm(demonstrated), path=rel))
    return domains


def load_map(path: Path = DOMAIN_MAP) -> dict[str, Domain]:
    if not path.is_file():
        return {}
    return parse_domain_map(path.read_text(encoding="utf-8", errors="replace"))


def _match_phrases(prompt_l: str, prompt_match: str) -> int:
    score = 0
    chunks = re.split(r"\s*(?:/|·|,)\s*", prompt_match)
    for chunk in chunks:
        phrase = _norm(chunk).strip(" “”\"'").lower()
        phrase = re.sub(r"\s+", " ", phrase)
        if len(phrase) < 3:
            continue
        words = phrase.split()
        if len(words) == 1 and words[0] in WEAK_SINGLES:
            continue
        if phrase in prompt_l:
            score += 3 if len(words) >= 2 else 2
    return score


def classify(prompt: str, domains: dict[str, Domain]) -> str:
    text = _norm(prompt)
    if not text:
        return "none"
    low = text.lower()
    scores: dict[str, int] = {t: 0 for t in THEMES}
    for name, dom in domains.items():
        if name not in WEAK_THEME_NAMES and re.search(
            rf"\b{re.escape(name)}\b", low
        ):
            scores[name] += 4
        hyphen = name.replace("-", " ")
        if hyphen != name and re.search(rf"\b{re.escape(hyphen)}\b", low):
            scores[name] += 4
        scores[name] += _match_phrases(low, dom.prompt_match)
        for pat, w in EXTRA_PATTERNS.get(name, []):
            if pat.search(low):
                scores[name] += w
    best = max(scores.values())
    if best < 3:
        return "none"
    winners = [t for t in THEMES if scores[t] == best]
    if len(winners) == 1:
        return winners[0]
    for t in TIEBREAK:
        if t in winners:
            return t
    return "none"


def pick_refs(domain: Domain, cap: int = REF_CAP) -> list[Ref]:
    out: list[Ref] = []
    seen_people: set[str] = set()
    seen_paths: set[str] = set()
    for ref in domain.refs:
        if not _exists(ref.path):
            continue
        key = ref.person.lower()
        if key in seen_people or ref.path in seen_paths:
            continue
        out.append(ref)
        seen_people.add(key)
        seen_paths.add(ref.path)
        if len(out) >= cap:
            return out
    for rel in domain.local_paths:
        if len(out) >= cap:
            break
        if not _exists(rel) or rel in seen_paths:
            continue
        out.append(Ref(person="(map)", machine=domain.name, path=rel))
        seen_paths.add(rel)
    return out[:cap]


def retrieve(prompt: str, *, map_path: Path = DOMAIN_MAP) -> Result:
    domains = load_map(map_path)
    if not domains:
        return Result(theme="none", refs=[])
    theme = classify(prompt, domains)
    if theme == "none" or theme not in domains:
        return Result(theme="none", refs=[])
    return Result(theme=theme, refs=pick_refs(domains[theme]))


def format_text(result: Result) -> str:
    if result.theme == "none" or not result.refs:
        return "NONE"
    lines = [f"THEME: {result.theme}"]
    for i, ref in enumerate(result.refs, 1):
        lines.append(f"{i}. {ref.person} · {ref.machine} · {ref.path}")
    return "\n".join(lines)


def format_json(result: Result) -> str:
    payload = {
        "theme": result.theme,
        "refs": [
            {"person": r.person, "machine": r.machine, "path": r.path}
            for r in result.refs
        ],
    }
    if result.theme == "none" or not result.refs:
        payload = {"theme": "none", "refs": []}
    return json.dumps(payload, indent=2)


def self_test() -> list[str]:
    errs: list[str] = []
    if not DOMAIN_MAP.is_file():
        return [f"map missing: {DOMAIN_MAP}"]
    domains = load_map()
    for name in THEMES:
        if name not in domains:
            errs.append(f"map missing domain {name}")
            continue
        refs = pick_refs(domains[name])
        if not refs:
            errs.append(f"{name}: zero local refs")
        if len(refs) > REF_CAP:
            errs.append(f"{name}: {len(refs)} > {REF_CAP}")
        for ref in refs:
            if _is_workspace(ref.path):
                errs.append(f"{name}: invented /workspace {ref.path}")
            if not _exists(ref.path):
                errs.append(f"{name}: missing {ref.path}")
        invented = (
            "NNv80mMzFDs",
            "0Yin3Er9DX0",
            "GqAyhsnxQfE",
            "ZqlhRs_AfAQ",
            "icM0ewXGvAw",
            "bnzOiioEuJ4",
            "cNaOJg47Z2A",
        )
        blob = " ".join(r.path for r in refs)
        for vid in invented:
            if vid in blob:
                errs.append(f"{name}: invented packet {vid}")

    hit = retrieve("cinematic landing with Seedance scroll and CTA before scroll")
    if hit.theme != "websites":
        errs.append(f"websites prompt theme={hit.theme!r}")
    if not (1 <= len(hit.refs) <= REF_CAP):
        errs.append(f"websites prompt refs={len(hit.refs)}")
    miss = retrieve("what's for dinner tonight")
    if miss.theme != "none" or miss.refs:
        errs.append(f"dinner should be NONE, got {miss}")
    if format_text(miss) != "NONE":
        errs.append("dinner format != NONE")
    artifact_prompts = (
        ("which tools are in the TOOL_MATRIX and n8n on-demand inventory", "ai-tools"),
        ("open OPERATOR_MEMORY and SIGNAL-TO-CAPABILITY doctrine notes", "md-files"),
        ("where is the nate-claude prompt pack", "prompts"),
        ("open the workflow INDEX and the dry-run folder", "workflows"),
        ("what are the desk-missions-now hive jobs in state.json", "tasks"),
        ("run signal-retrieve.py and hive-state.py", "code"),
        ("show the INVOKE-SCOREBOARD grok-skills SSOT cluster", "skills"),
        ("Cursor plus Grok Bot hive-funnels-stack and primitives.json", "stack"),
        ("open capabilities.json capability registry not a packet dump", "etc"),
        ("certify the outbound playbook before anyone is approved to send and same-day QA", "outbound"),
        ("private-book-install missed-call book-door, inquire then ask principal then book", "book-door"),
        ("run golden-test-loop and eval-then-wrap-tools on a same-prompt bench", "eval-harness"),
        ("wiki-ingest raw to wiki index log plus vault-not-prompt syncthing-vault-sync", "vault-wiki"),
        ("paid-slice-funnel and checkout in one sitting before we charge", "money-spine"),
        ("run ingest-is-steps on a folder-ingest count then gold-q packet", "ingest"),
    )
    for prompt, want in artifact_prompts:
        got = retrieve(prompt)
        if got.theme != want:
            errs.append(f"{want} prompt theme={got.theme!r}")
        if not (1 <= len(got.refs) <= REF_CAP):
            errs.append(f"{want} prompt refs={len(got.refs)}")
        for ref in got.refs:
            if _is_workspace(ref.path):
                errs.append(f"{want}: invented /workspace {ref.path}")
    return errs


def main() -> int:
    ap = argparse.ArgumentParser(
        description="Classify a prompt and return ≤3 local signal refs, or NONE."
    )
    ap.add_argument("--prompt", default="", help="Operator prompt to classify")
    ap.add_argument("--format", choices=("text", "json"), default="text")
    ap.add_argument("--self-test", action="store_true")
    args = ap.parse_args()

    if args.self_test:
        errs = self_test()
        if errs:
            print("FAIL:", "; ".join(errs), file=sys.stderr)
            return 1
        print("OK: signal-retrieve self-test")
        return 0

    if not args.prompt.strip():
        print("NONE")
        return 0

    result = retrieve(args.prompt)
    print(format_json(result) if args.format == "json" else format_text(result))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
