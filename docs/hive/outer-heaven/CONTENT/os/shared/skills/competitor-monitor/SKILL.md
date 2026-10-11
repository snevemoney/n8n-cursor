---
name: Competitor monitor (Demkinn #6)
description: >-
  Use when: Standing watch or weekly GTM. Demkinn #6. Owner Lead Hunter.
---
# Competitor monitor (Demkinn #6)

**Owner desk:** Lead Hunter  
**Lane:** hive-os (+ tag others)  
**Sources:** demkinn skills/06  
**Status:** partial  
**HITL:** none

**BLOCKED:** X live auth missing · operator ASIN/account watchlist not locked (10–20). Disk bookmarks + manual paste WORKAROUND only.

## Tools
| Need | Path |
|---|---|
| Watchlist (10–20 handles / ASINs) | **BLOCKED** until operator locks list — stub from disk bookmarks **WORKAROUND** |
| X live competitor feed | **BLOCKED** until X re-auth — manual paste / bookmarks **WORKAROUND** |
| Public web / landing diffs | WebSearch/WebFetch — **PROVE** |
| Amazon ASIN public page | WebFetch public PDP — **PROVE** (no Seller Central scrape) |
| Claim check on competitor $ claims | claim-verifier (#47) — **PROVE** |

## Prompts
**Weekly delta request**
```
Run Demkinn #6 competitor-monitor.
Lane: [amazon-own-store|ai-partner-websites|hive-os]
Watchlist: [paste 10–20 handles/ASINs OR say USE_STUB]
Window: [7d]
Report ONLY deltas: product/price/viral/landing/hire/partner/features.
Skip noise. No new icp_id. claim-verifier on any competitor $ before FACT.
If watchlist or X auth missing: write BLOCKED line + WORKAROUND from bookmarks.
```

**Add one competitor**
```
Add to #6 watchlist (pending operator lock):
Handle/ASIN: …
Why: …
Lane tag: …
Do not invent metrics.
```

## When
Standing watch or weekly GTM

## Do
1. Fix watchlist of 10–20 accounts (own Amazon lane + AI-agent creators; HOLD sellers-as-clients)
2. Track deltas only: product · price · viral · landing · hire · partner · features
3. Structured change report; skip noise
4. No new icp_id from competitor noise

## Don't
- Mint agents · auto-send · auto-pay/book/publish
- New icp_id / business-lanes row without operator yes
- $ FACT without claim-verifier (#47)
- Farms/NSFW sources

## Done when
Reusable artifact on disk (brief, packet, checklist, or skill note) — not chat-only.

## Watchlist stub (2026-08-26)

**STALE** disk bookmarks only (`x-bookmarks-20260813-1058.json` · synced 2026-08-13T14:58:06Z · 98 items · newest tweet 2026-08-11). X live still **BLOCKED**. Pending operator lock. Packet: `/workspace/research/packets/signals-20260826/COMPETITOR-WATCHLIST-STUB.md`

**16 handles** (bookmark `author_username` only — not the 2026-08-22 ACCOUNTS.md conceptual list):

| # | handle | dump n | why (from dump) | lane |
|---|---|---|---|---|
| 1 | @ClaudeDevs | 5 | Claude Code desktop / MCP / in-app browser | hive-os |
| 2 | @JulianGoldieSEO | 1 | NotebookLM automate course | hive-os |
| 3 | @higgsfield | 1 | AE MCP/plugin | ai-partner-websites |
| 4 | @tryrevyl | 2 | Atlas + Claude/Codex on live iOS | hive-os |
| 5 | @arrakis_ai | 1 | Karpathy LLM Wiki job-card system | hive-os |
| 6 | @viktoroddy | 1 | cinematic-site tutorial | ai-partner-websites |
| 7 | @0xMiraqle | 1 | cinematic 3-ref recipe (ignore jailbreak tone) | ai-partner-websites |
| 8 | @monokern | 1 | video-as-3D site | ai-partner-websites |
| 9 | @BusyFocusApp | 1 | Claude approve/deny widget | hive-os |
| 10 | @rom1trs | 1 | Claude skill → Seedance | ai-partner-websites |
| 11 | @TheoMediaAI | 1 | Fable previs for Seedance | ai-partner-websites |
| 12 | @JoshDaws | 1 | movie still → Seedance previs | ai-partner-websites |
| 13 | @mweinbach | 1 | agent-swarm flex | hive-os |
| 14 | @chesny | 1 | cinematic-site tweet · **$50k UNVERIFIED** | ai-partner-websites |
| 15 | @ibexdream | 1 | Midjourney → Seedance/Runway stack | ai-partner-websites |
| 16 | @AdamKPx | 1 | agents vibe-test apps (habit, no SaaS) | hive-os |

Amazon / ASIN: **none** in this dump. HOLD sellers-as-clients. Quarantine not listed: @SD_Tutorial NSFW · @1337_viking @Av1dlive jailbreak · @everestchris6 cold-mail · @sandy4kad $ UNVERIFIED. USE_STUB until Evens locks.


## Owned-tools wiring (2026-10-11 gap audit)
- Research pass: `oh-search "<competitor> pricing"` (private SearXNG) then `oh-fetch <url>`; video claims: `oh-transcribe <url>`. All log to use.jsonl.
- App/binary internals: use the `app-teardown-rea` skill (REA MCP / Ghidra), never on anything we lack the right to analyze.
