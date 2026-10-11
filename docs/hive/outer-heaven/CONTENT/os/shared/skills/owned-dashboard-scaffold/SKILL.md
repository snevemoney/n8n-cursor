---
name: Owned dashboard scaffold
description: >-
  Use when building competitor-intel OR ops/content calendar dashboards on an
  owned stack (Next/static + sqlite/JSON + n8n ACTIVE). Anti-triggers: GHL/Lovable
  ChatGPT Sites as prod host; ScrapeCreators as default; inventing traffic/$ KPIs;
  school-only viz theory without a scaffold (use grad-data-driven-comms instead).
---
# Owned dashboard scaffold

**Owner:** Forge (implement) · Researcher (method) · Watchdog/Money Desk (refuse rent)  
**Lane:** portfolio A2 CapEx · building mode · live `/` HOLD  
**Packet:** `/workspace/research/packets/portfolio-proof-a2a3-carter-20260914/`

## When
- CapEx asks for competitor-intel board (ads/organic paste, hook/pillar notes)
- CapEx asks for ReelForge-style ops/content calendar (idea→posted)
- Carter/GHL video shows a “ChatGPT site” dashboard — rebuild owned

## Do not use when
- Operator wants GHL CRM / AI Studio rent
- Job is graduate viz theory only → [grad-data-driven-comms-viz-story-dashboard](sand-workflow:grad-data-driven-comms-viz-story-dashboard)
- Job is Demkinn weekly delta watch only → [competitor-monitor](sand-workflow:competitor-monitor)
- Selling/sending to clients (building mode)

## Platform / Install
- **Platform:** Grok Bot + Cursor + Next or static HTML  
- **Install:** `none (process-only)` for this skill; app code lives in Forge repo when implemented

## Steps
1. Pick mode: `competitor-intel` XOR `ops-calendar`.
2. Declare **data locus (BUS206)** — sqlite file or `data/*.json` under the app/packet. Write it in README.
3. Schema from packet `A2_DASHBOARD_METHOD.md`.
4. Scaffold UI: table + detail + status filters. No fake ROI charts.
5. Ingest: n8n ACTIVE webhook **or** manual paste HITL. Document replace path before any paid scraper.
6. Run fail checks; label EXAMPLE fixtures; leave blank KPIs blank (BUS204).
7. Proof track: Documented (method) → Demonstrated (working scaffold) → Transferred (second desk/brief).

## PROVE / WORKAROUND / BLOCKED

| Need | Path |
|---|---|
| Static HTML+JSON fixture | Packet `demos/a2-*` — **PROVE** lite |
| Next + sqlite CapEx app | Forge implement — **WORKAROUND** pending / Documented method ready |
| n8n ACTIVE append | n8n-kit-forge / researcher — **PROVE** when ACTIVE |
| ScrapeCreators API | **BLOCKED/REFUSE** default — would work if funded + operator waive; prefer public paste + Whisper |
| GHL / Lovable host | **REFUSE** — owned Next/static WORKAROUND |
| X live competitor feed | **BLOCKED** until auth — manual paste WORKAROUND |
| Invented traffic/$ | **REFUSE** |

## Refuse (builder no-rent)
Paid ads cockpit · GHL funnel · Lovable variable rent · premium SaaS duplicate of hive · piracy

## Prompts
**Scaffold brief**
```
Mode: competitor-intel | ops-calendar
Data locus:
Ingest: n8n ACTIVE | manual paste
Stack: Next | static
Fail checks from A2_DASHBOARD_METHOD
EXAMPLE fixtures only until receipts
No GHL / ScrapeCreators / Lovable
```

## Sources
- CapEx order A2 2026-09-14 · Carter `yt:JiS8s2ErTco` patterns · builder-no-rent · school-quality-bar

## Enrich 2026-10-09 — Claude Dashboards beta (X `2108271552991252810` @claudeai)
FACT (post text only): "Ask Claude to turn your data into live dashboards" — beta. Where data lives, refresh model, sharing = UNVERIFIED.
- Treat like the GHL "ChatGPT site" case: a hosted chat-made dashboard is a **sketch**, not the system of record. Rebuild owned (Next/static + sqlite/JSON) when it matters.
- OK for a one-off look at non-sensitive sample data if the operator asks. Never paste client data or secrets into it. RESEARCH-OK / WATCH; no install.


## Enrich 2026-10-10: standalone vs API-backed HTML dashboard (`yt:lwU0kOiz02U` Learn BI)
A standalone AI-generated HTML file **contains all its data**: whoever has the file has everything. For anything sensitive, keep the layout but fetch from an authenticated API. PROVE: `html_dashboard.py` (same KPIs both ways; API returns 401 without a token).
