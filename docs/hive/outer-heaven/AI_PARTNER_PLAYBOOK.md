# AI Partner Playbook

**Identity:** AI Partner — sell outcomes, not features or automation theater.

**Portfolio (operator):** Multiple businesses — SSOT `scripts/hive/business-lanes.json`. Big Boss covers every **ACTIVE** lane in the morning brief. This doc is **`ai-partner-websites` only** (client-facing website / AI Partner services).

**Hunt prospects (not new lanes):** Tag `icp_id` from `CONTENT/watch-later/business-types.json` · run **Today** from `CONTENT/icp-runbooks/{icp_id}.md` · append `CONTENT/icp-runbooks/HUNT_LOG.md` · default city **Greater Montreal**. Skill `icp-runbook`. Do **not** add a `business-lanes.json` row from a YouTube/X ICP without operator yes.

**Doctrine:** `scripts/hive/grok-skills/ai-native-operator-doctrine.md` · per-agent lane lines in `scripts/hive/agent-doctrine-lanes.py`.

---

## Three buckets (every engagement)

| Bucket | Question |
|--------|----------|
| **ACQUIRE** | More leads / better conversion? |
| **GROW** | Higher LTV / retention? |
| **CUT** | Fewer hours, errors, tickets? |

## Service ladder

| Rung | Offer | Typical $ |
|------|-------|-----------|
| 0 | Enablement (teach + templates) | $100–500/hr |
| 1 | Audit (find clog/leak + roadmap) | $500–3K |
| 2 | Project (one loop fixed with receipts) | $2.5K–10K |
| 3 | Retainer (monitor + improve) | $3K–10K/mo |

## Four-blank scope (before any build)

1. **Bucket** — ACQUIRE | GROW | CUT  
2. **KPI** — one number  
3. **Baseline today** — honest current state  
4. **60-day target** — operator/client confirms "yes, that's a win"

No build until all four are filled. Chatbot requests → map **clog** (work piles up) and **leak** (money escapes) first.

## Proof standard (receipts)

- **Not proof:** workflow screenshot, architecture diagram, "it's deployed"
- **Proof:** "Used to take X, now Y" + walkthrough of working result (URL, video, log)
- Keep **known-good examples**; regression-test new versions before customers touch them

## How to work with agents (don't chat — manage)

1. State the problem and **definition of done**
2. Agent asks clarifying questions until scope is sure
3. Agent argues against its own plan (skeptic, competitor, maintainer)
4. Agent executes (AI-first); operator finishes the last mile
5. Agent verifies like a human — clicks, mobile, forms — not "looks good"
6. **Don'ts** from mistakes go into OPERATOR_MEMORY and skills

## Send / money / deploy

If it has a Send button, assume it will send. **Remove send** from agent architecture; HITL Operator holds Tier 3.

## Model discipline

- Cheap/fast: read, summarize, classify  
- Expensive: decisions, architecture, client strategy  

## Month 1 motion

Five real owner conversations for pattern recognition. Warm outreach > cold pitch. Proof on your own annoying task first (operator practice lanes: own store, own inbox loops).

## Related

- `scripts/hive/business-lanes.json` — portfolio lanes (not hunt ICPs)
- `CONTENT/icp-runbooks/INDEX.md` — hunt runbooks + disambiguation
- `CONTENT/watch-later/STEAL_SHEET.md` — steal machines + `icp_id` catalog
- `docs/hive/outer-heaven/OPERATOR_MEMORY.md`
- `docs/hive/outer-heaven/HIVEMIND_DNA.md`
- `scripts/hive/grok-skills/ai-native-operator-doctrine.md`
- `docs/os/RESEARCH.md`
