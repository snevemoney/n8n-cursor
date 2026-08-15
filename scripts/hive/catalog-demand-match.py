#!/usr/bin/env python3
"""Match operator need to catalog / lanes — USE | BUILD | RESEARCH | REFUSE | ASK."""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CATALOG_PATH = ROOT / "docs/hive/outer-heaven/CONTENT/BUSINESS_CATALOG.json"
LANES_PATH = ROOT / "scripts/hive/business-lanes.json"
TYPES_PATH = ROOT / "docs/hive/outer-heaven/CONTENT/watch-later/business-types.json"

NEXT_BY_VERDICT = {
    "USE": "Run existing lane skill chain; do not spawn duplicate business",
    "BUILD": "Handshake → pilot → catalog-lane-upgrade.py --operator-yes (Cursor writes)",
    "RESEARCH": "researcher-research-to-system + insert catalog lifecycle=researching",
    "REFUSE": "Stop — nearest legal analog only if any",
    "ASK": "One clarifying question via ask-principal",
}

# Phrase / regex kill list. Word-boundary so "waitlist" ≠ "list" and "playbook" ≠ "book".
KILL_PATTERNS: list[re.Pattern[str]] = [
    re.compile(p, re.I)
    for p in (
        r"\bofm\b",
        r"\big\s+farm\b",
        r"\bbetting\b",
        r"\bpolymarket\b",
        r"\bauto[- ]?dial(?:er|ing)?\b",
        r"\bi do ai\b",
        r"\bgeneric landing\b",
        r"\bclient pack\b",
        r"\bhow i make\b.*\b(?:85\s*k|\$\s*85)",
        r"\b(?:85\s*k|\$\s*85k)\b.*\b(?:proof|youtube|rpm)\b",
        r"\byoutube\s+rpm\b",
        r"\brpm\b.*\bproof\b",
        r"\bjob[- ]loss\b",
        r"\bmass[- ]?dm\b",
        r"\bseduction\b",
    )
]

# Specific machines first. Bare "book" / "list" / "ad" are not here — they steal the wrong SKU.
KEYWORD_MACHINES: list[tuple[str, list[str]]] = [
    ("paid-slice", ["paid-slice", "paid slice", "waitlist page", "our waitlist", "path c waitlist"]),
    ("checkout-proof", ["checkout-proof", "checkout proof", "stripe checkout"]),
    ("review-to-book", ["review-to-book", "review to book", "google review"]),
    ("missed-call-book", ["missed-call-book", "missed call book"]),
    ("one-channel-deep", ["one-channel-deep", "one channel deep"]),
    ("orchestrated-site-brief", ["orchestrated-site-brief", "orchestrated site"]),
    ("client-delivery-kit", ["client-delivery-kit", "client delivery kit", "delivery kit"]),
    ("clip-factory", ["clip-factory", "shorts", "podcast", "youtube edit"]),
    ("list-anneal", ["list-anneal", "outbound list", "b2b list", "anneal"]),
    ("private-book-install", ["private-book-install", "private book install", "calendly", "intake", "speed-to-lead"]),
    ("invoice-email-automation", ["invoice", "billing"]),
    ("inbox-to-task-routing", ["inbox-to-task", "email triage"]),
    ("folder-to-deck", ["folder-to-deck", "presentation", "slides"]),
    ("product-ad-from-photo", ["product-ad-from-photo", "ugc", "higgsfield", "dropship ad", "product ad"]),
    ("demand-validate", ["demand-validate", "demand validate"]),
    ("cinematic-recipe", ["cinematic-recipe", "cinematic"]),
    ("playbook-before-send", ["playbook-before-send", "playbook before send"]),
    ("meeting-to-task-routing", ["meeting-to-task", "meeting to task"]),
    ("morning-ceo-desk", ["morning-ceo-desk", "morning ceo"]),
    ("interview-gym", ["interview-gym", "interview gym"]),
    ("context-docs", ["context-docs", "context docs"]),
]

# Catalog ICPs only — do not invent. Longer / more specific phrases first.
ICP_HINTS: list[tuple[str, list[str]]] = [
    ("local-clinic", ["dental clinic", "dentist", "dental", "med-spa", "medspa", "physio", "clinic", "vet"]),
    ("owner-coach-fitness", ["fitness", "gym", "wellness coach", "trainer"]),
    ("exec-coach", ["exec coach", "executive coach"]),
    ("mktg-software", ["marketing software", "mktg-software"]),
    ("industrial-smb", ["industrial", "manufacturing", "castings", "robotics"]),
    ("creator-longform", ["podcast", "youtuber", "youtube creator", "course creator"]),
    ("agency-delivery", ["agency owner", "agency"]),
    ("law-adj", ["law firm", "lawyer", "attorney", "legal", "law-adj"]),
    ("restaurant", ["restaurant"]),
    ("local-pro", ["plumber", "hvac", "salon", "home service"]),
    ("us", ["path c", "our page", "our paid", "our waitlist", "our stripe"]),
    ("dropship", ["dropship"]),
]

PATH_C_HINTS = [
    "waitlist page",
    "our waitlist",
    "path c",
    "paid slice",
    "paid-slice",
    "stripe checkout",
    "checkout proof",
    "checkout-proof",
    "thin v1",
    "our page",
    "before stripe",
]


def _has_term(text: str, term: str) -> bool:
    """Whole-phrase match. Hyphen and space are equivalent. No substring steals."""
    parts = [re.escape(p) for p in re.split(r"[\s-]+", term.lower()) if p]
    if not parts:
        return False
    return re.search(r"\b" + r"[\s-]+".join(parts) + r"\b", text, re.I) is not None


def _any_term(text: str, terms: list[str]) -> bool:
    return any(_has_term(text, t) for t in terms)


def _load_catalog() -> list[dict]:
    if not CATALOG_PATH.is_file():
        return []
    return json.loads(CATALOG_PATH.read_text(encoding="utf-8")).get("entries", [])


def _load_lanes() -> list[dict]:
    return json.loads(LANES_PATH.read_text(encoding="utf-8")).get("lanes", [])


def _load_types() -> dict:
    if not TYPES_PATH.is_file():
        return {}
    return json.loads(TYPES_PATH.read_text(encoding="utf-8"))


def _handshake_card(entry: dict | None, machine: str | None) -> dict:
    """Plugin / terminal / browser / writer for BUILD path."""
    plugins = (entry or {}).get("required_plugins") or []
    skills = (entry or {}).get("required_skills") or []
    mid = machine or (entry or {}).get("parent_model_id") or "unknown"
    plugin_status = "missing"
    if "higgsfield" in plugins:
        plugin_status = "check Grok plugins — Higgsfield authorized on this bot (HITL OAuth)"
    elif not plugins:
        plugin_status = "ok (none required)"

    terminal_cmds = [
        'python3 scripts/hive/catalog-demand-match.py --need "..."',
    ]
    if entry:
        terminal_cmds.append(
            f"python3 scripts/hive/catalog-lane-upgrade.py --sku-id {entry['id']} --dry-run"
        )
    if mid == "product-ad-from-photo":
        terminal_cmds.append("See scripts/hive/grok-skills/product-ad-from-photo.md")
    if mid in ("paid-slice", "checkout-proof"):
        terminal_cmds.append("See scripts/hive/grok-skills/paid-slice-funnel.md")
    if mid == "private-book-install":
        terminal_cmds.append("pnpm --filter speed-to-lead-demo dev  # after PR #39 merge")
        plugin_status = "n8n on-demand calling (connected_n8n) — propose HITL, do not connect Twilio"
    if mid == "missed-call-book":
        plugin_status = "ask-principal before any voice vendor — no auto-book"

    browser = []
    if "higgsfield" in plugins:
        browser.append("https://higgsfield.ai — fallback if plugin not connected")
    if mid == "private-book-install":
        browser.append("Prospect site — screenshot leak above fold (Forge)")
        browser.append("n8n On-demand calling (live) — no new Twilio OAuth")
    if mid in ("paid-slice", "checkout-proof"):
        browser.append("Preview URL and custom domain — dual smoke; Stripe HITL")

    return {
        "plugin": plugin_status,
        "skills": skills or ["see steal sheet"],
        "terminal": terminal_cmds,
        "browser": browser or ["none"],
        "writer": "Cursor or Mac local-exec commits repo; Grok cloud recommends only",
    }


def _is_combinator(entry: dict) -> bool:
    if entry.get("source") == "catalog-combinator":
        return True
    if entry.get("lifecycle") == "operating":
        return False
    thin = entry.get("research_depth") == "thin"
    no_path = not entry.get("path")
    no_lane = entry.get("lane_id") in (None, "")
    return bool(thin and no_path and no_lane)


def _is_ready_sku(entry: dict) -> bool:
    if _is_combinator(entry):
        return False
    if entry.get("lifecycle") == "operating":
        return False
    return entry.get("research_depth") == "ready" and bool(entry.get("path"))


def _kill_hit(q: str) -> bool:
    return any(p.search(q) for p in KILL_PATTERNS)


def _detect_icp(q: str, types: dict) -> str | None:
    for icp_id, terms in ICP_HINTS:
        if _any_term(q, terms) or _has_term(q, icp_id):
            return icp_id
    for icp in types.get("icps") or []:
        iid = icp.get("id")
        if iid and _has_term(q, iid):
            return iid
    return None


def _path_c_need(q: str) -> bool:
    if _any_term(q, PATH_C_HINTS):
        return True
    # "waitlist" alone is Path C / our page — never a volume list.
    return _has_term(q, "waitlist")


def _volume_list_need(q: str) -> bool:
    if _path_c_need(q):
        return False
    return _any_term(q, ["list-anneal", "outbound list", "b2b list", "anneal", "outbound"]) or (
        _has_term(q, "list") and _any_term(q, ["outbound", "b2b", "anneal", "volume"])
    )


def _detect_machine(q: str, icp: str | None, types: dict, catalog: list[dict]) -> str | None:
    if _path_c_need(q):
        if _any_term(q, ["checkout-proof", "checkout proof"]) and not _any_term(
            q, ["paid-slice", "paid slice", "waitlist"]
        ):
            return "checkout-proof"
        return "paid-slice"

    # Explicit catalog machine / parent_model slug in the need (hyphen or spaces).
    slugs: set[str] = set()
    for e in catalog:
        for key in ("parent_model_id", "machine"):
            mid = e.get(key)
            if mid and mid != "portfolio-lane":
                slugs.add(mid)
    hit_slugs = [s for s in slugs if _has_term(q, s) or _has_term(q, s.replace("-", " "))]
    # Prefer longer / more specific slugs (review-to-book before book-ish names).
    hit_slugs.sort(key=len, reverse=True)

    def _resolve_machine(mid: str) -> str:
        # Plumber/HVAC default is site book CTA, not the restaurant PSTN machine.
        if mid == "missed-call-book" and icp == "local-pro":
            return "private-book-install"
        if mid == "private-book-install" and icp == "restaurant":
            return "missed-call-book"
        return mid

    for mid, keywords in KEYWORD_MACHINES:
        if _any_term(q, keywords):
            return _resolve_machine(mid)
    if hit_slugs:
        return _resolve_machine(hit_slugs[0])

    if _volume_list_need(q):
        return "list-anneal"

    # "book" without a more specific machine — route by ICP, never default plumber.
    if _has_term(q, "book") or _any_term(q, ["calendly", "intake", "missed call", "speed-to-lead"]):
        if icp == "restaurant" or _has_term(q, "restaurant"):
            return "missed-call-book"
        if icp == "local-clinic" or _any_term(q, ["clinic", "dental", "review"]):
            return "review-to-book"
        if icp in ("local-pro", "owner-coach-fitness", "law-adj"):
            return "private-book-install"
        if _any_term(q, ["plumber", "hvac"]):
            return "private-book-install"
        if icp is None and _any_term(q, ["calendly", "intake", "speed-to-lead", "plumber", "hvac"]):
            return "private-book-install"

    if icp:
        for row in types.get("icps") or []:
            if row.get("id") == icp and row.get("machine") and row["machine"] != "internal":
                return row["machine"]
    return None


def _prefer_geo(entries: list[dict], q: str) -> list[dict]:
    if "montreal" in q:
        hit = [e for e in entries if "montreal" in (e.get("geo") or "").lower()]
        if hit:
            return hit
    return entries


def _pick_entry(catalog: list[dict], machine: str, icp: str | None, q: str) -> dict | None:
    candidates = [
        e
        for e in catalog
        if e.get("parent_model_id") == machine or e.get("machine") == machine
    ]
    if not candidates:
        return None

    if icp:
        icp_hits = [e for e in candidates if e.get("icp_id") == icp]
        if icp_hits:
            candidates = icp_hits
        else:
            # Named ICP + machine with no ready row — do not steal another ICP's SKU.
            return None

    ready = _prefer_geo([e for e in candidates if _is_ready_sku(e)], q)
    if ready:
        return ready[0]

    operating = [e for e in candidates if e.get("lifecycle") == "operating"]
    if operating:
        return operating[0]

    combos = _prefer_geo([e for e in candidates if _is_combinator(e)], q)
    if combos:
        return combos[0]
    return candidates[0]


def _match_payload(entry: dict, machine: str) -> dict:
    combinator = _is_combinator(entry)
    operating = entry.get("lifecycle") == "operating"
    status = "operating" if operating else ("catalog-not-operating" if combinator else "ready")
    return {
        "kind": "catalog",
        "id": entry["id"],
        "lifecycle": entry.get("lifecycle"),
        "machine": machine,
        "icp_id": entry.get("icp_id"),
        "path": entry.get("path"),
        "source": entry.get("source"),
        "lane_id": entry.get("lane_id"),
        "catalog_status": status,
    }


def _result(
    verdict: str,
    reason: str,
    need: str,
    matches: list[dict],
    handshake: dict | None = None,
) -> dict:
    out = {
        "verdict": verdict,
        "reason": reason,
        "need": need,
        "matches": matches[:8],
        "next": NEXT_BY_VERDICT[verdict],
    }
    if handshake is not None:
        out["handshake"] = handshake
    return out


def match_need(need: str) -> dict:
    q = need.lower().strip()
    if _kill_hit(q):
        return _result("REFUSE", "Matches kill list — not our lane", need, [])

    lanes = _load_lanes()
    catalog = _load_catalog()
    types = _load_types()
    matches: list[dict] = []

    for lane in lanes:
        if lane.get("status") == "active":
            lid = lane["id"]
            if lid.replace("-", " ") in q or _has_term(q, lid):
                matches.append({"kind": "lane", "id": lid, "lifecycle": "operating"})

    icp = _detect_icp(q, types)
    machine = _detect_machine(q, icp, types, catalog)

    if machine:
        entry = _pick_entry(catalog, machine, icp, q)
        if entry:
            matches.append(_match_payload(entry, machine))
        elif icp:
            # Machine+ICP named but only a combinator / missing ready row exists under another ICP.
            other = _pick_entry(catalog, machine, None, q)
            if other and _is_combinator(other):
                matches.append(_match_payload(other, machine))
            elif not other:
                matches.append(
                    {
                        "kind": "catalog",
                        "id": f"{machine}__{icp}__unlisted",
                        "lifecycle": "catalog",
                        "machine": machine,
                        "icp_id": icp,
                        "catalog_status": "catalog-not-operating",
                    }
                )

    # Dedupe
    seen: set[tuple] = set()
    uniq: list[dict] = []
    for m in matches:
        key = (m["kind"], m.get("id"))
        if key in seen:
            continue
        seen.add(key)
        uniq.append(m)

    operating = [m for m in uniq if m.get("lifecycle") == "operating" or m.get("kind") == "lane"]
    primary = next((m for m in uniq if m.get("kind") == "catalog"), None)
    combinatorish = bool(
        primary
        and (
            primary.get("catalog_status") == "catalog-not-operating"
            or primary.get("source") == "catalog-combinator"
        )
    )

    if operating and not combinatorish:
        verdict = "USE"
        reason = "Operating lane or machine already serves this need"
    elif combinatorish:
        verdict = "RESEARCH"
        reason = "catalog-not-operating — combinator/thin row, not a live hunt"
    elif primary and _is_ready_lookup(catalog, primary.get("id")):
        verdict = "BUILD"
        reason = "Catalog row exists — handshake tools/skills then pilot then upgrade"
    elif primary and primary.get("lifecycle") in ("catalog", "building", "researching"):
        # Ready SKU without combinator flag
        if primary.get("catalog_status") == "ready":
            verdict = "BUILD"
            reason = "Catalog row exists — handshake tools/skills then pilot then upgrade"
        else:
            verdict = "RESEARCH"
            reason = "catalog-not-operating — parked catalog row, not a live hunt"
    elif uniq:
        verdict = "RESEARCH"
        reason = "Partial match — deepen before upgrade"
    elif len(q.split()) < 3 and not machine:
        verdict = "ASK"
        reason = "Need more specificity (who, outcome, channel)"
    else:
        verdict = "RESEARCH"
        reason = "Not in catalog — Researcher packet + demand-validate before lane"

    primary_entry = None
    primary_machine = machine
    if primary and primary.get("kind") == "catalog":
        for e in catalog:
            if e["id"] == primary.get("id"):
                primary_entry = e
                primary_machine = primary.get("machine") or machine
                break
    if not primary_machine and uniq:
        primary_machine = uniq[0].get("machine") or uniq[0].get("id")

    handshake = None
    if verdict in ("USE", "BUILD"):
        handshake = _handshake_card(primary_entry, primary_machine)

    return _result(verdict, reason, need, uniq, handshake)


def _is_ready_lookup(catalog: list[dict], sku_id: str | None) -> bool:
    if not sku_id:
        return False
    for e in catalog:
        if e.get("id") == sku_id:
            return _is_ready_sku(e)
    return False


def format_text(result: dict) -> str:
    lines = [f"VERDICT: {result['verdict']}", result.get("reason") or ""]
    nxt = result.get("next") or NEXT_BY_VERDICT.get(result.get("verdict", ""), "")
    if nxt:
        lines.append(f"NEXT: {nxt}")
    hs = result.get("handshake") or {}
    if hs:
        lines.append(f"HANDSHAKE plugin: {hs.get('plugin')}")
        lines.append(f"HANDSHAKE writer: {hs.get('writer')}")
        for cmd in hs.get("terminal") or []:
            lines.append(f"  terminal: {cmd}")
        for url in hs.get("browser") or []:
            lines.append(f"  browser: {url}")
    return "\n".join(lines)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--need", help="Operator need in natural language")
    ap.add_argument("--format", choices=["json", "text"], default="json")
    ap.add_argument("--self-test", action="store_true")
    args = ap.parse_args()
    if args.self_test:
        fix = Path(__file__).resolve().parent / "tests" / "fixtures" / "demand-match-matrix.json"
        cases = json.loads(fix.read_text(encoding="utf-8"))
        failed = 0
        for case in cases:
            got = match_need(case["need"])
            exp_v = case["verdict"]
            ok = got["verdict"] == exp_v
            sku = case.get("sku_contains")
            if sku:
                ids = " ".join(m.get("id") or "" for m in got.get("matches") or [])
                ok = ok and sku in ids
            ban = case.get("sku_excludes")
            if ban:
                ids = " ".join(m.get("id") or "" for m in got.get("matches") or [])
                ok = ok and ban not in ids
            if not ok:
                failed += 1
                print(
                    f"FAIL {case['name']}: got {got['verdict']} "
                    f"{[m.get('id') for m in got.get('matches') or []]} expected {exp_v} {sku or ''}"
                )
        if failed:
            print(f"catalog-demand-match self-test: {failed} failed")
            return 1
        print(f"catalog-demand-match self-test: OK ({len(cases)} cases)")
        return 0
    if not args.need:
        ap.error("--need is required unless --self-test")
    result = match_need(args.need)
    if args.format == "json":
        print(json.dumps(result, indent=2))
    else:
        print(format_text(result))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
