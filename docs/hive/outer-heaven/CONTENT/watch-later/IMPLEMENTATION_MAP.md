# Implementation map: Watch Later 15 (2026-08-13)

**Packet:** ~/.grokbot/research-packets/watchlater-15-20260813/  
**Skill:** scripts/hive/grok-skills/researcher-research-to-system.md  
**Coverage:** 15/1803

| # | Takeaway (from chapter) | Hive target | Agent(s) | Status |
|---|-------------------------|-------------|----------|--------|
| 1 | Quarantine IG/OTP/OFM farm | OPERATOR_MEMORY LESSONS | Librarian, Lead Hunter, Publishing | done |
| 2 | Slice work; no whole-product prompt | agent-doctrine-lanes.py Forge/Creative | Forge, Creative Studio | done |
| 3 | Prompting 2.0 session-start dump | doctrine Researcher/Forge/Big Boss | Researcher, Forge, Big Boss | done |
| 4 | Outcome ICP not “I do AI” | doctrine Consultant/GTM/Lead Hunter | Consultant, Product GTM, Lead Hunter | done |
| 5 | Time-to-aha; preview ≠ prod domain | doctrine Watchdog/GTM | Watchdog, Product GTM | done |
| 6 | Voice/outreach PIN + human confirm | doctrine HITL/Lead Hunter/Comms | HITL, Lead Hunter, Comms | done |
| 7 | Outer Heaven is the wiki — Cursor + Grok, no second wiki app | OPERATOR_MEMORY + learnings-implement | Librarian, Forge | done (reaffirmed) |
| 11 | Stack remap: Cursor + Grok Bot only (other AIs = on tape) | WORKFLOWS.md + CHAPTERS.md | Researcher | done |
| 8 | Founders triangle before new lane | OPERATOR_MEMORY | Big Boss, Researcher | done |
| 9 | MCP stateless = FACT only | OPERATOR_MEMORY FACTS | Forge | done |
| 10 | Researcher funnel + steal sheet after L2 | researcher-research-to-system §2b + steal-usecases | Researcher | done |
| 12 | Encode funnels as Grok `/` + Cursor skills | grok-skills + ~/.grokbot/skills + .cursor/skills/hive-funnels | all 17 | done |
| 13 | Router: Path A/B/C + lead-web-find ↔ list-anneal | website-offer-funnel + money-now skills | all 17 | done |
| 14 | Steal one-person use cases (not just thesis) | USE_CASES-one-person.md + one-person-usecases + usecase-to-sku | GTM, Consultant, LH, Publishing | done |
| 15 | Steal all 15 videos + memorize ICPs | STEAL_SHEET.md + business-types.json + steal-usecases + OM FACTS | Researcher, GTM, Consultant, LH, all 17 | done |
| 16 | Deep summaries of all 15 (whole argument, not SKU-only) | DEEP_SUMMARIES.md | Researcher, all 17 | done |

## Reprovision checklist

- [x] Edit OPERATOR_MEMORY, doctrine lanes, watch-later CONTENT
- [x] `python3 scripts/hive/build-grok-agent-routines.py --write`
- [x] `python3 scripts/hive/grokbot-setup-agents.py` (17 updated)
- [x] `python3 scripts/hive/grokbot-setup-routines.py --core --force-update` (17 created)
- [ ] Message @Librarian + @Forge + @Lead Hunter + @Watchdog + @Consultant in Grok (operator)
- [ ] Next scrape toward remaining 1788 rows

## Agent adaptation notes

- **Librarian** — new DON'TS (farms, betting SKU, income quotes).
- **Forge** — slice builds; session dump; don't rewrite MCP this week.
- **Creative Studio** — no one-shot cinematic/game/site.
- **Lead Hunter** — playbook before send; score lists; no dialer/farm.
- **HITL / Comms** — Jarvis pattern: ask human, then act.
- **Watchdog** — release blockers + custom-domain smoke.
- **Consultant / GTM** — outcome sentence + time-to-aha.
- **Big Boss** — 17 agents is the workforce; triangle before new lane.
- **Researcher** — L2 captions required; 15/1803 honesty.
- **Day Planner / Money / Wealth / Career / Publishing / Personal CFO** — no lane change except Publishing: no mass-DM; Career: judgment moat already covered.
