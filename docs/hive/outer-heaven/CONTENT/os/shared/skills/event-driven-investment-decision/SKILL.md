---
name: Event-driven investment decision
description: >-
  Use when a portfolio or watchlist name has an upcoming catalyst and you need a
  pre-event decision brief with expectations vs reality, move ranges, and hold
  vs partial profit.
---
# Event-driven investment decision engine

Advise-only. Never invent prices. Label FACT/ESTIMATE/INFERENCE/SPECULATION. Separate CONFIRMED / HIGH-CONFIDENCE / CREDIBLE RUMOR / LOW-CONFIDENCE SPECULATION.

## Platform / Install
- **Platform:** Grok Bot (Wealth Manager desk)
- **Install:** `none (process-only)`
- **Hard:** HITL L4 before any add/trim. **NO-SKILL** for auto-trade / broker-send routines.

## When
A portfolio or watchlist name has an upcoming catalyst and you need a pre-event decision brief with expectations vs reality, move ranges, and hold vs partial profit.

Warn BEFORE the event. Gather: event details, announcement tiers, position math (basis, P/L, size, cash, account), pre-event path, similar-event history.

Always output: What is coming; market expectations vs likely reality; event move RANGES + confidence + optional probabilities; position math; timeline (today / before / during-after / 1-2d / week); strategies A hold / B partial / C more profit with a preference; wait-or-sell comparison; sell-the-news + surprise detectors; if take profits where capital goes (cash valid); define upside, downside, profit-take, re-entry, invalidation, horizon, what changes the plan.

Never fake precision or certainty. First tick is not the verdict.

## Tools
| Need | Path |
|---|---|
| Packet / topic write | Outer Heaven CONTENT/topics + `/workspace/research/packets/intel/` — **PROVE** |
| Live quotes | broker / market source in packet — never invent — **PROVE** when packet has them |
| Auto-execute trades | **BLOCKED** / NO-SKILL — HITL L4 only |

## Dated example (2026-09-09 AAPL)
Topic `aapl-event-hold-20260909.md` · packet `packets/intel/2026-09-09-AAPL-event-decision.md` · preference Strategy A hold-all through keynote + 1–2 sessions. Supersede after post-event reassess.

## Anti-triggers
- Do not use for leisure tip culture / 0DTE / lottery.
- Do not mint a second trading desk or auto-routine from this skill.
- Beat SPY Tier A operating rules live in `beat-spy-tier-a-20260908.md` (playbook, not this brief engine).

## Prompts
**Pre-event brief**
```
Name / event:
Position math (from packet, not invented):
Strategies A/B/C + preference (dated):
Sell-the-news / surprise detectors:
HITL L4 required before any order
```

## YT daily stamp 2026-09-09
Metadata only (no L2). Title ids:
- Nanalyze — Applovin stock verdict (`yt:hqtZUfeLopQ`)
- Investing.com — analyze stocks in minutes without full reports (`yt:WOAokExYyhs`)
- Sebastian — Iren / Cleanspark / Cipher / Hut 8 datacenter rally (`yt:Uei2KZwcB84`)
- Professor Cubs — Claude finance plugins full install (`yt:hq4BkBr2CsE`)
- Raph — Claude finance plugins stock picking (`yt:fcQPTX8TbQY`)
- TheFinanceValueGuy — Claude stock market AI agents (`yt:GtNUj6zy2JA`)
- Rob The AI Guy — AI analyze & trade stocks 2026 (`yt:gEqU037Ac6Q`)
- Nate Herk — GPT-6 Astra 24/7 stock trader tutorial (`yt:TLQLfa7yH4I`)
**Steal:** triage titles for Applovin / Investing.com minutes / Iren·CLSK·CIFR·HUT + Claude finance-plugin / AI trade tutorials as process awareness only. **HARD:** advise-only; **NO** auto-trade routines; Tier-3 HITL before add/trim. $ / "best method" / verdict claims **UNVERIFIED**. **BLOCKED:** Claude desktop/plugins as hive face → **WORKAROUND:** Grok + Cursor + existing wealth packets. **Install:** `none (process-only)`.

## Astra trader + DC rally L2 2026-09-09 (`yt:TLQLfa7yH4I` L2 / `yt:Uei2KZwcB84` L2) PARTIAL
Packets: `repass-20260909/TLQLfa7yH4I/`, `repass-20260909/Uei2KZwcB84/` supersede metadata-only stamps.
- Astra: bounded window + calendar wakes + progress-log handoff; Alpaca auto-trade **BLOCKED**/NO-SKILL; beat-SPY $ **UNVERIFIED**. Artifact: `recreation/ASTRA_TRADER_HITL_CARD.md`.
- Sebastian DC/miner basket: ops vs price vs BTC regime brief; host %/ops **UNVERIFIED**; trade **BLOCKED**. Artifact: `recreation/DC_STOCKS_EVENT_BRIEF.md`. Scoped≠full 32m.

## Enrich wave-P 2026-09-09 — Claude finance RKLB DCF (marker: wave-P-20260909-rklb)
Packet `repass-20260909/GtNUj6zy2JA/` supersedes metadata-only stamp for this id.
Delta vs fcQ/hq4: worked Rocket Lab DCF + space-economy Market Researcher + Pro usage-burn warning.
Artifact: `recreation/CLAUDE_FINANCE_RKLB_DCF_GATE.md`.
**HARD:** advise-only; trade **BLOCKED**; Desktop/Cowork install **BLOCKED** this pass; fair-value demo $ **UNVERIFIED**.


## CapEx tracks (Documented / Demonstrated / Transferred) — DoD 2026-09-09

Capability tracks for this skill. **Do not** treat Astra HITL card templates, install-gate markdown, or skill enrich as PASS.

| Track | Bar | Counterexample |
|---|---|---|
| **Documented** | Event→triage→HITL advise-only doctrine + FACT/ESTIMATE labels + NO auto-trade | Inventory touch; stamp-only metadata |
| **Demonstrated** | Executable fixture ingest → HITL decision card (md+json) **and** fail-closed BLOCK when trade/auto_execute present without HITL, with logged output | Template-only `ASTRA_TRADER_HITL_CARD.md`; enrich-only; skeleton without runner output |
| **Transferred** | **Another desk** runs the card runner on a **different** event fixture (not CapEx market_event/bad_auto_trade) and lands CARD_OK+BLOCK logs | Replaying CapEx fixtures; enrich-only; copying STATUS |

### Hard rules
- **checklist-only ≠ Demonstrated.** Recreation HITL templates stay **Documented** until a runner writes event_run artifacts.
- **enrich-only ≠ Transferred.** Touching this SKILL.md or stamping YT daily does **not** move Transferred.
- Fail-closed: trade action / auto_execute without HITL → BLOCK. Never invent prices. Never auto-trade.

### Certified Demonstrated — 2026-09-09
CapEx demo: `/workspace/research/packets/skill-capability-transfer-20260909/demos/event-invest/`
- Runner: `event_hitl.py`
- Fixtures: `fixtures/market_event.json` (CARD_OK), `fixtures/bad_auto_trade.json` (BLOCK)
- Proof: `out/event_run.json` + `out/event_run.log` + `out/card_market_event.{md,json}` + `out/card_bad_auto_trade.{md,json}`
- Packets reused: `TLQLfa7yH4I`, `GtNUj6zy2JA`, `packets/intel/2026-09-09-AAPL-event-decision.md`

### Certified Transferred — 2026-09-09 (Wealth Manager)
Transfer demo: `/workspace/research/packets/skill-capability-transfer-20260909/demos/event-invest-transfer/`
- Runner: `event_hitl_transfer.py`
- Fixtures: `fixtures/market_event_amd_cpi.json` (CARD_OK), `fixtures/bad_auto_trade_soxl.json` (BLOCK)
- Proof: `out/event_run.json` + cards + `TRANSFER_REPORT.md` + `skill_alone_enough.md`
- **Transferred = YES.** Do not replay CapEx AAPL/RKLB fixtures.

### Done-when (E / Transferred)
```
Done when (Demonstrated): event_hitl.py (or successor) exit 0 with ≥1 CARD_OK + ≥1 BLOCK and out/*.log on disk.
Done when (Transferred): different desk + different event JSON → new out/ with same fail-closed contract.
Enrich-only / template-only / re-fixture replay ≠ Transferred.
```


## CapEx TRANSFER 2026-09-09 (Wealth Manager)
Proof: `packets/skill-capability-transfer-20260909/demos/event-invest-transfer/` — AMD CPI Path B **CARD_OK**; SOXL 3× auto-BUY **BLOCK**. Do not replay AAPL/RKLB CapEx fixtures. Advise-only; no Alpaca.
