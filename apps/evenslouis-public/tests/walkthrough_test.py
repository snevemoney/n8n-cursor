#!/usr/bin/env python3
"""Local checks for the intended evenslouis.ca / walkthrough. Preview only."""

from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "public" / "index.html").read_text(encoding="utf-8")
ROBOTS = (ROOT / "public" / "robots.txt").read_text(encoding="utf-8")

failures: list[str] = []


def ok(cond: bool, msg: str) -> None:
    if not cond:
        failures.append(msg)


ok("<h1>Hive OS — walkthrough</h1>" in HTML, "H1 must be exactly Hive OS — walkthrough")
ok("This page is a record, not an offer. Building mode." in HTML, "lead copy missing")
ok("Grok Bot + Cursor" in HTML, "stack line missing")
ok("Outer Heaven" in HTML, "memory line missing")
ok("Building mode. No outbound this cycle." in HTML, "building-mode / no-outbound line missing")

for desk in (
    "Big Boss",
    "Day Planner",
    "HITL Operator",
    "Watchdog",
    "Forge",
    "Creative Studio",
    "Publishing Engine",
    "Lead Hunter",
    "Product GTM",
    "Consultant",
    "Researcher",
    "Communications Manager",
    "Librarian",
    "Money Desk",
    "Personal CFO",
    "Wealth Manager",
    "Career Strategist",
):
    ok(desk in HTML, f"desk missing: {desk}")

ok("Publishing pipeline check" in HTML, "named routine missing")
ok("Mondays 9:00 AM America/Toronto" in HTML, "routine schedule missing")
ok("does not auto-publish" in HTML, "routine must say it does not auto-publish")

ok("Hunt / scope" not in HTML, "do not use Hunt / scope grouping")
ok("Available for new projects" not in HTML, "hire badge residual")
ok("Ready to build something?" not in HTML, "hire closer residual")
ok("I build software that runs your business" not in HTML, "hire hero residual")
ok("Discovery" not in HTML or "We define scope" not in HTML, "Discovery/Build/Ship residual")
ok(not re.search(r"\bStripe\b", HTML), "Stripe must not appear")
ok(not re.search(r"href=[\"']/work/ironlane", HTML), "do not href Ironlane from /")
ok(not re.search(r"href=[\"']/work/ashford", HTML), "do not href Ashford from /")
ok(not re.search(r"href=[\"']/work/quay", HTML), "do not href Quay from /")
ok("Ironlane Studio" in HTML and "Proof / concept" in HTML, "proof craft must stay labeled")
ok("They are not this OS." in HTML, "proofs must not substitute for the OS")

for banned in ("n8n", "Scorpion", "OpenClaw", "Client Engine"):
    ok(banned not in HTML, f"do not name legacy stack: {banned}")

ok(not re.search(r'<(a|button)[^>]*>\s*(Book|Buy|Hire|Contact)\b', HTML, re.I), "no Book/Buy/Hire/Contact CTA control")
ok('href="/contact"' not in HTML, "no Contact href")
ok("mailto:" not in HTML, "no email CTA")
ok("<form" not in HTML.lower(), "no contact form")
kpi_html = HTML.replace("or a traffic claim", "")
ok(not re.search(r"\b(conversion|revenue|lift)\b", kpi_html, re.I), "no invented KPI words")
ok("traffic claim" in HTML, "must refuse traffic claims in the not-list")

ok('name="robots" content="noindex, nofollow"' in HTML, "preview must keep noindex")
ok("Disallow: /" in ROBOTS, "preview robots.txt must disallow")

if failures:
    print("FAIL")
    for item in failures:
        print(f"  - {item}")
    sys.exit(1)

print("PASS apps/evenslouis-public walkthrough checks")
