---
domain: business
status: verified
correlationId: manual-money-desk-20260812
survival_score: high
last_verified: 2026-08-12
apps_used: [grok, cursor]
---

# CE-without-CE money path (Grok-native)

Client Engine (`/pro`) is **legacy UI**. Keep its money-path axioms and gates; run the daily loop through Grok agents. Open `/pro` only for formal Tier-3 ledger buttons.

## CE axioms to keep

1. Stages: **CAPTURE → ENRICH → SCORE → POSITION → PROPOSE → (OWNER APPROVAL) → BUILD**
2. Machine **reads**: open HITL/actions queue, lead lookup, notes
3. Machine **writes** that are safe: **propose HITL only** — never auto spend / send / approve / mutate leads
4. Proof = observational; value = subtract friction (tools/admin), not feature lists
5. No bypass of money fields (`approvedAt`, `proposalSentAt`, `dealOutcome`, etc.)

## Agent map (who does CE’s job)

| CE idea | Grok agent | What they do |
|---------|------------|--------------|
| New / scored leads | **Lead Hunter** | Lookup, pipeline value, handoff |
| Position / audit math | **Consultant** + **Researcher** | Constraint, ROI framing, packs |
| SKU / pricing draft | **Product GTM** | Offer ladder; Money Desk supplies ROI % / margins |
| Queue watch / anomalies | **Money Desk** | Observe + advise; prefer `hive-revenue-sensors.py` over n8n hourly sensor |
| “Approve this?” | **HITL Operator** | Propose-only → operator decides **in Grok chat** |
| Build after yes | **Forge** | Code / product only after explicit operator greenlight |
| Formal CE ledger row | Operator on `/pro` | Only when a real queue item needs the button |

## Daily operator loop (no CE UI)

1. **Money Desk / HITL** — summarize open money-relevant proposals (deal, SKU, send). Stay quiet if none.
2. **You** — yes/no in Grok (Tier 3). Draft stays propose-only until then.
3. **Forge / GTM / Lead Hunter** — execute the non-money work after yes.
4. **`/pro`** — only if a formal CE HITL row still requires the UI approve (e.g. `tier3.deal.approve` still parked there).

## Machine API patterns (legacy bridge — optional)

When Philanthropy/tools work: `ce_list_actions`, `ce_lookup_lead`, `hitl_propose_action`.  
On 401: SSH read-only `GET http://127.0.0.1:3205/api/hive/actions` + Bearer `CE_HIVE_TOKEN` (VPS env only — never paste token in chat).

## Hard stops (never from agents)

- Deal approve, invoice/client send, lead status mutate
- Secrets / OAuth / prod deploy / merge main
- Autonomous treasury or float moves

## When to use

- Onboarding any agent that used to “open CE”
- Money Desk / HITL / Lead Hunter / Product GTM handoffs
- Replacing daily `/pro` browsing with Grok chat decisions

Tag chronicle: `business-hours`, `money-path`

## Related canon (Librarian 2026-08-12)

- Full CE study SoT (read-only, **do not duplicate**): `~/.grokbot/research-packets/ai-partner-scoring-prototype-ladder/CE-FEATURE-TO-AGENTS.md`
- Outer Heaven pointer: [[CONTENT/ai-partner-scoring-prototype-ladder/CE-FEATURE-TO-AGENTS]]
- Flywheel addendum SoT: `~/.grokbot/research-packets/ai-partner-scoring-prototype-ladder/CE-FLYWHEEL-TO-AGENTS.md`
- METHOD distillate: [[METHODS/business-ce-flywheel-to-agents]] · pointer [[CONTENT/ai-partner-scoring-prototype-ladder/CE-FLYWHEEL-TO-AGENTS]]
- Scoring pack: [[CONTENT/ai-partner-scoring-prototype-ladder/INDEX]]
- Wiki: [[OUTER_HEAVEN_LLM_WIKI]] / [[CONTENT/OUTER_HEAVEN_LLM_WIKI]]
