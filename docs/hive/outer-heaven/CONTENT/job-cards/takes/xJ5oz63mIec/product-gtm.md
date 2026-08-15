# Product GTM — xJ5oz63mIec
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/xJ5oz63mIec/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/xJ5oz63mIec/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate Herk. Title: “How to Deploy Your Claude Automations (3 Methods).” Beats: (1) two sliders: **where it runs** (laptop vs Anthropic/Modal/Trigger/VPS) × **how deterministic** (script vs agent loop); WAT = workflow/agent/tools; no one best; (2) **Method 1 — `/loop` cron:** session-scoped `cron create/list/delete`; NL “remind me to take out the trash every 10 min”; desktop: 3-day cap, jitter, `/clear` **kills** the cron; terminal: `/clear` keeps crons if session lives; he injects `/clear` as a cron to fight rot (Code said it wouldn’t, it did); (3) **Method 2 — scheduled / cloud routines:** local needs machine+app; cloud routines 24/7, **≥1h** interval, ~5/day on Pro (UNVERIFIED); careless prompt = unwanted actions; (4) **Method 3 — Modal or Trigger.dev:** Python vs TS; schedule or webhook; Modal = cron-in-the-cloud; Trigger = durable engine that also crons; env vars on their side; he prefers Trigger for agentic, Modal if you think in Python. Timestamp UNKNOWN. **Caps / 15/day UNVERIFIED.**

## B. Atomic Knowledge
### Pick the slider, not the vendor
- **Claim:** Deploy is “laptop vs cloud” and “vending vs slot,” not a Trigger SKU. Unattended still needs a one-shot prompt (`ehg4fhydTgs`). Hive does not add Modal/Trigger/Hostinger/Claude cloud.
- **Reasoning:** Same vending/slot as `3XIGcM7VICc`. Same laptop-closed fence.
- **Mechanism:** Loop for frequent/local; routine for hourly cloud; script host for webhook/retry.
- **Evidence:** `/clear` kills desktop crons; 1h min on cloud routines; he names unwanted actions.
- **Conditions:** On-tape Claude. Ours: Cursor + Grok.
- **Exceptions:** Trash-reminder is a toy.
- **Action:** Steal the 2×2. Do not productize the three hosts.
- **Confidence:** high as map.
- **Source:** `xJ5oz63mIec` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Laptop vs cloud. Vending vs slot. Session-scoped cron. Jitter. One-shot unattended.

## D. Procedures
Name where it must run and whether it may wander. Hard steps HITL. No new host.

## E. Examples
**Situation:** Desktop `/clear`. **Action:** Cron dies. **Outcome:** Terminal keeps it. **Lesson:** The host’s rules are the product.

## F. Decision Rules
- If unattended → one-shot + fence.
- If vending → script, not an agent host.
- Refuse: Modal/Trigger/Claude-routines SKU; Hostinger; 24/7 as a client offer.

## G. Contrarian
Against “one best deploy.”

## H. Assumptions
Theirs: Claude Code. Ours: no Claude cloud. Falsifier: Evens names a schedule (still our desk).

## I. Questions
Sibling `ehg4fhydTgs` · `UGIZnh6HNLc`.

## J. Connections
**SYSTEM SYNTHESIS:** Vending/slot = `3XIGcM7VICc`. Routines = `ehg4fhydTgs`. Maps to `ask-principal`.

## K. Future-Use
Unassigned: “laptop×determinism slider.” Keep.

## Steal / Operate-never

### Machine: name where it runs and whether it may wander
- **Epistemic:** SOURCE
- **Workflow / loop:** vending or slot → laptop or cloud → one-shot if unattended → HITL on send
- **Questions / signals:** Does `/clear` kill it? Is the interval hourly?
- **Qualify / frame / objections:** “Run while you sleep” is the magnet.
- **Procedure:** No Modal/Trigger/Claude cloud product.
- **Example that proves it:** Desktop clear kills cron; 1h cloud min.
- **Why it works:** The host’s rules bite.
- **Conditions / exceptions:** Caps UNVERIFIED.
- **Operate-never payload:** Modal; Trigger; Claude routines; Hostinger
- **Hive run (existing skills only):** `ask-principal`
- **Source:** `xJ5oz63mIec` @ UNKNOWN

### Operate-never
- Productize the three hosts
- Unattended send
- New hunt; merge LESSONS; auto-write SKILL.md

## L. Role-Specific Applications
Do not anneal Trigger/Modal. Clients parked.
