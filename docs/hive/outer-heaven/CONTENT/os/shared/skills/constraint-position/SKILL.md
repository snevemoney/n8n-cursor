---
name: Constraint position
description: >-
  Use when a prospect FACT pack is ready — or on Wed fleet-skill-gtm-observe
  with icp_id=none — to lock constraint, adoption risks, brand-fit (#14), and a
  reversible next step before any SKU or warm draft.
---
# Constraint → POSITION

## When
After Researcher FACT pack. Before Product GTM four-blank SKU and before any HITL warm draft.

**Also (fleet Wed observe):** `fleet-skill-gtm-observe` with `icp_id=none` — file an observe note only; do not invent a prospect, KPI, $, or traffic.

## Inputs
- Named URL + contact path
- MUST/SHOULD score vs criteria
- Public evidence of rails (book/apply/contact/SLA)

## Steps
1. Write stated ask vs felt problem. Felt problem wins.
2. One-sentence constraint where ops would sigh (or mark UNVERIFIED).
3. Adoption risks: tool loyalty, committee, intentional scarcity, #14 private vs public book.
4. Verdict: diagnosis / Rung 0 / Rung 1 / HOLD / DISQUALIFY + one discovery question that gates Rung 1.
5. Reversible next step for operator (warm ask, discovery call, or park). No build language.
6. Hand Product GTM only if economics path is open; else Money Desk CONDITIONAL HOLD.

## Fleet Wed observe (Offer/ICP · building mode)
1. Confirm `OPERATOR_FOCUS` / brief: if `icp_id=none`, **no new icp_id**, no Janet reuse, no CE, no send.
2. Cite latest `competitor-door-watch-YYYYMMDD.md` + optional same-day public curl of Path A doors (list SSOT). Alert only on price / pack / CTA / positioning — not layout.
3. Defend standing ICP in one line: Canadian owner-operator professional services with Book CTA lag / dead apply path. POSITION = audit → cinematic → optional retainer. Four blanks stay ACQUIRE / inquiries-or-booked / conversion / 60d cinematic live+lift — leave blank if unfilled; never invent.
4. Write observe note under `~/.grokbot/research/gtm-observe-YYYYMMDD.md` (ICP/offer/market signal only).
5. Enrich this skill only when the pass adds a durable rule. Log `SKILL_USAGE_LOG` + `append-action-log.py --action used-skill`.
6. Operator path only on a **new** observe delta. Quiet if none (token-meter). Lead Hunter drafts stay HITL. Consultant critic only if a grade is needed.

7. **2026-09-23 observe:** ACTIVATION_DISCOVERY dispositions (ADOPTED+VERIFIED cite-only, NEEDS_VERIFICATION CapEx) and operator GO **live `/` LIVE** do **not** clear sell or warm send. Keep implemented ≠ verified ≠ live ≠ marketable. Cite latest `competitor-door-watch-YYYYMMDD.md` (2026-09-22 quiet); alert only on price/pack/CTA/positioning. Quiet if doors unchanged and `icp_id=none`.

8. **2026-09-30 observe:** Prefer citing the latest Tue `competitor-door-watch-YYYYMMDD.md` (do not re-run a full door watch on Wed unless confirming a claimed delta). If Tue note is quiet (`alert=false`) and `icp_id=none` and four blanks still BLANK → **Quiet / no WakeParent**. Discovery batch accept ≠ ADOPTED; door taxonomy stays **CANDIDATE** (technical class ≠ buyer proof). METHOD_PROMOTION lifecycle: RECOVERED→CANDIDATE→APPLICABLE→EXPERIMENT_REQUIRED→LOCALLY_SUPPORTED→VERIFIED→ADOPTED — observe must not skip ahead.


## Anti-patterns
Feature-list offers; default Rung 1 on intentional premium SLA; inventing volume/prices; skipping #14; treating Stage 5 or live `/` as sell clear; Squarespace/elou asks; catalog dump; fan-out.

## Tools
| Need | Path |
|---|---|
| Pain | paid-pain-points — **PROVE** |
| Door list | `~/.grokbot/research/competitor-door-watch-list.md` — **PROVE** |
| Door watch | competitor-door-watch — **PROVE** (Tue routine; cite, don't duplicate spam) |

## Prompts
**Position**
```
Pains:
Constraint statement · who it's for · who it's not · proof stub
```

**Observe (icp_id=none)**
```
Doors cited · ICP one-liner · POSITION · four blanks (BLANK ok) · reversible next · no $ invent
```
Freshness step (2026-10-07): before calling Quiet, scan research notes newer than the last observe note for an icp_id, building-mode, or ICP change; cite them in one line. None found = Quiet holds.

## Grok Bot harness (2026-09-01 — update, not a rebuild)

Org: Evens talks to Big Boss. Consultant audits/scope. Other desks only via mention or handoff. No 17 DMs.

After a meaningful run, append one JSON line (never overwrite, never log secrets):
`python3 /home/box/.grokbot/outer-heaven/append-action-log.py --agent "<desk>" --action "<slug>" --target "<what>" --result "<one line>"`
Log file: `/home/box/.grokbot/outer-heaven/ACTION_LOG.jsonl`

Failed or finished scheduled work doorbells the Big Boss / Day Planner / Consultant exec group only. Stay quiet if nothing failed. No logger desk. Mac out unless Evens asks local. HITL: money, client send, prod deploy, secrets.
