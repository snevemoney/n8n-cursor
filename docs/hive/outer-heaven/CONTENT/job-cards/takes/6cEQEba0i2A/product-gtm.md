# Product GTM — 6cEQEba0i2A
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/6cEQEba0i2A/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/6cEQEba0i2A/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate Herk. Title: “Give Me 10 Mins and I'll Save You Millions of Claude Tokens.” Beats: (1) dashboard: 91M cache-read one day / 300M week (UNVERIFIED) — automatic on Claude/Claude Code; (2) cached input ≈ 10% of fresh; sub TTL **1 hour** idle = full recache; API/sub-agents TTL **5 min** (API can pay for 1 hr); Thork: they page on low cache-hit (SEV) — hit rate makes it feel faster, cheaper to serve, limits feel bigger; (3) layers: global system+tools / per-project CLAUDE.md+memory / growing conversation; turn 1 = cache create; later turns = cache read + new delta; change system prompt or wait an hour at turn 16 = expensive recache; (4) extra-usage after weekly cap = API 5-min TTL (dangerous); rumor they silently cut sub to 5 min — he says they did not; claude.ai cache undocumented (he assumes sub-like); (5) three habits = 95%: do not pause >1 hr (handoff to a new session); new task = `/clear` or session-handoff, not a bloated `/compact`; big docs in **projects** not chat paste; (6) what breaks cache: `/model` switch (prefix); **Opus-plan → Sonnet-exec breaks cache every toggle** — may still save long-run but understand the recache; mid-session CLAUDE.md edit is safe until restart; (7) local token dashboard GitHub via Skool — per machine, not portable; session-handoff skill CTA. Timestamp UNKNOWN. **91M / 300M / 10% / 205k context UNVERIFIED.**

## B. Atomic Knowledge
### Session death is usually cache + task-switch, not “AI is expensive”
- **Claim:** Most people do not need the Thork paper. They need: stay inside TTL, do not recache a long thread, start fresh on a new job.
- **Reasoning:** Cache create is a one-time write; cache read is the cheap reuse. Idle, model-switch, and system-prompt change throw the write away.
- **Mechanism:** Keep-alive + focused + handoff/`clear` on switch. Projects for big docs. Know that Opus-plan mode is a model switch.
- **Evidence:** Four-turn prefix graphic he walks; 205k session he handoff-clears.
- **Conditions:** On-tape Claude. Hive does not run it.
- **Exceptions:** He still thinks Opus-plan can win long-run despite recache.
- **Action:** Steal “handoff beats compact” and “do not sell token panic.” Do not ship his dashboard.
- **Confidence:** high as 80/20; vendor TTLs may change.
- **Source:** `6cEQEba0i2A` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Create vs read. TTL is a cliff. Prefix match. 80/20 vs the paper. Handoff > compact. Local dashboard ≠ source of truth across machines.

## D. Procedures
If the thread is the same job and inside TTL, keep it. If the job changed or the hour died, handoff + clear. Do not paste a book into chat. Do not `/model` mid-thread unless you accept a recache.

## E. Examples
**Situation:** 205k-token HTML build. **Action:** Session handoff → copy → `/clear` → paste. **Outcome:** Feels continuous, cache reset on purpose. **Lesson:** Compact is not the only reset.

**Situation:** Opus-plan / Sonnet-exec. **Action:** Each toggle is a model switch. **Lesson:** The “save tokens” trick recaches the whole history.

## F. Decision Rules
- If you are selling “I will save you millions of tokens” → that is his title magnet, not our offer.
- If the buyer’s pain is session walls → the fix is habits + maybe a different stack, not a dashboard SKU.
- Refuse: token dashboard; Skool; 91M as FACT; Claude cache consulting as Path C.

## G. Contrarian
Against needing the full cache paper. Against `/compact` as the default reset. Against Opus-plan as a free lunch.

## H. Assumptions
Theirs: 1-hr sub / 5-min API; 10% cache price. Ours: we do not operate Claude. Falsifier: they change TTL again without saying.

## I. Questions
Sibling `3QclAjmu5Tw` (limits weather). Is claude.ai actually project-cached? He does not know.

## J. Connections
**SYSTEM SYNTHESIS:** Handoff skill = `kB9iMD0EjT8`. Token panic ≠ offer = `8MEJen0nblQ` (do not sell AI). Maps to `ask-principal`.

## K. Future-Use
Unassigned: “handoff on task-switch” as a hive session habit (already how we work). Keep.

## Steal / Operate-never

### Machine: keep-alive, then handoff — do not sell the cache
- **Epistemic:** SOURCE
- **Workflow / loop:** same job + inside TTL → continue → job change or hour dead → handoff note → clear → do not recache a novel by editing the system prompt at turn 16
- **Questions / signals:** Are we still on the same job? Did we switch models?
- **Qualify / frame / objections:** “Sessions die” → habits, not a token product.
- **Procedure:** Cursor + Grok. No Claude dashboard.
- **Example that proves it:** 205k handoff-clear; Opus-plan recache.
- **Why it works:** The expensive event is throwing away the prefix.
- **Conditions / exceptions:** Counts UNVERIFIED. TTL may move.
- **Operate-never payload:** Token-dashboard SKU; Skool; “millions of tokens” as our headline
- **Hive run (existing skills only):** `ask-principal`
- **Source:** `6cEQEba0i2A` @ UNKNOWN

### Operate-never
- Productize Claude cache / his GitHub dashboard
- Quote 91M / 300M as FACT
- New hunt; merge LESSONS; auto-write SKILL.md

## L. Role-Specific Applications
Do not anneal token-savings into the ICP sentence. Clients parked.
