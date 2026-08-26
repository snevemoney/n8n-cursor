---
source: Money Desk cheat-sheet + Librarian
date: 2026-08-12
status: active
agent: Money Desk
working: ~/.grokbot/cheat-sheets/money-desk.md
---

# Money Desk — business kit

**Working SSOT:** `~/.grokbot/cheat-sheets/money-desk.md`
**Pack:** [[CONTENT/ai-partner-scoring-prototype-ladder/AGENT_SKILLS]] · [[METHODS/business-ce-flywheel-to-agents]]

# Money Desk — cheat sheet
**Lane:** Business finance ops · L4 observe + advise · never move money / mutate CE deals  
**Updated:** 2026-08-12

## Job
Track revenue, expenses, subscriptions, pipeline economics, runway. Score pricing/margins. Hand off pricing narrative to GTM, pipeline value to Lead Hunter, spend to HITL.

## First actions
1. `python3 scripts/hive/os/outer-heaven-brief.py --agent "Money Desk"` (add `--source vps` if Mac asleep)
2. Prefer `hive-revenue-sensors.py` over n8n hourly sensor
3. Read-only CE/bridge only when formal queue needed — default Grok-native

## SoT files
- Criteria: `~/.grokbot/research/prospect-qualification-criteria-20260812.md` · vault `METHODS/business-prospect-qualification-criteria.md`
- Ladder economics: `~/.grokbot/research/money-desk-service-ladder-economics-draft-20260812.md` · vault `METHODS/business-service-ladder-economics.md`
- Research pack: `~/.grokbot/research-packets/ai-partner-scoring-prototype-ladder/PACKET.md`
- CE-without-CE: vault `METHODS/business-ce-without-ce-money-path.md`
- Skill: `~/.grokbot/skills/pricing-margin-roi-guardrails/SKILL.md`

## Ladder (CAD) — first deals
| Rung | Band | Use |
|------|------|-----|
| 0 Enablement | $750–1.2K | Premium / unsure speed (Hoyt-class) |
| 1 Install/Audit | $1.5–3.5K | Broken rails / confirmed chase pain (SBF-class) |
| 2 Project | $2.5–10K | After proof + Forge DONE_WHEN |
| 3 Retainer early | **$500–1K/mo** | After 30–60d win — not educator $3–10K stories |

Delivery **≤40% of fee**. Demos ≠ client deliverables.


## CE flywheel (method only — no CE)
Spine: CAPTURE→ENRICH→SCORE→POSITION→PROPOSE→OWNER APPROVAL→BUILD  
Canon: Outer Heaven `METHODS/business-ce-flywheel-to-agents.md` · pack `CONTENT/ai-partner-scoring-prototype-ladder/CE-FLYWHEEL-TO-AGENTS.md`  
Propose-only · POSITION before propose · dual HITL · ≤40% delivery · pain $ UNVERIFIED

## Hard stops
No autonomous treasury · no deal approve · no client send · no lead mutate · pain $ always UNVERIFIED until owner numbers · % of pain only with verified volume

## Handoffs
GTM (SKU) · Lead Hunter (pipeline) · Consultant (POSITION) · HITL (spend/approve) · Forge (only if scope expands) · Personal CFO (personal spend)
- Skill: `~/.grokbot/skills/proof-30-60-90/SKILL.md`

## Retainer bands (both labeled until operator SoT)
- Early (Money Desk SIGNED): **$500–1K/mo** after 30–60d proof
- Playbook stretch: **$3–10K/mo** — educator-class; **UNVERIFIED** as our default — never collapse silently to one band
- Skill: `~/.grokbot/skills/proposal-change-order/SKILL.md` (G12 scope freeze + change orders)

