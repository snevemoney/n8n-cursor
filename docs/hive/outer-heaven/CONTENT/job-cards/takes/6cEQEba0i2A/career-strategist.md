# Career Strategist — 6cEQEba0i2A
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/6cEQEba0i2A/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/6cEQEba0i2A/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Video (10:43, 2535 words). Prompt cache / session limits. Beats: (1) 91M cached tokens that day, 300M+ in a week (UNVERIFIED) — automatic on Claude/Claude Code (2) cached input ~10% cost; 91M ≈ 9M fresh (his math) (3) sub TTL **1 hour**; idle >1h un-caches; API/sub-agents TTL **5 min** (API can buy 1h) (4) Anthropic (Thork): they page on low cache-hit SEVs — faster, cheaper serve, limits feel bigger (5) layers: global system+tools; per-project CLAUDE.md; session; growing user messages (6) turn 1 = cache write; later turns = prefix hit + new reply/message; **change system prompt or wait 1h = recache the whole prefix** (expensive at turn 16) (7) extra-usage/API default 5 min is dangerous; rumor they silently moved sub to 5 min — he says they did not (8) **three habits for “95% of people”:** don’t pause >1h (handoff to a new session); start fresh on task switch (`/compact` breaks cache — he prefers a **session-handoff skill**: summary of files/decisions/where-to-pick-up, `/clear`, paste); Claude.ai big docs → **Projects** not chat paste (9) what breaks cache: **model switch** (prefix mismatch); `/opus plan` (Opus plan / Sonnet exec) resets cache each toggle — may still save limits long-run but know the recache; editing CLAUDE.md mid-session is ok because it applies on restart (10) token dashboard GitHub (local, per-device) + handoff skill in Skool (11) 80/20: you do not need the whole Thork essay. All M-token and $ UNVERIFIED.

## B. Atomic Knowledge

### Cache is a prefix; idle, prompt-edit, and model-switch break it
- **Claim:** Hits are cheap (~10% input). Misses rewrite the whole conversation prefix. Hour idle, system-prompt change, or model switch = miss.
- **Reasoning:** Prefix matching.
- **Mechanism:** layers in A.
- **Evidence:** “if you leave a session sitting for an hour or longer, then you’re going to pay more.” / model switch = no cache hits. @ UNKNOWN
- **Conditions:** Claude subscription vs API (different TTL).
- **Exceptions:** Hive is not on Claude — analog for any cached long-context tool.
- **Action:** Don’t idle a fat session; don’t flip models mid-thread for fun.
- **Confidence:** high as his 80/20; numbers UNVERIFIED.
- **Source:** `6cEQEba0i2A` @ UNKNOWN
- **Epistemic:** SOURCE

### Handoff > compact when you must continue
- **Claim:** He summarizes to a portable brief, clears, pastes — feels lossless, usually <1 min vs slow compact.
- **Reasoning:** Compact also breaks cache; handoff is a chosen break.
- **Mechanism:** summary of work/files/open decisions → clear → paste.
- **Evidence:** “that has been basically my replacement for doing /compact.” @ UNKNOWN
- **Conditions:** Long project, need to continue.
- **Exceptions:** Truly done threads can just die.
- **Action:** Career analog: write the vault card before you `/clear` a gym thread.
- **Confidence:** high as his habit.
- **Source:** `6cEQEba0i2A` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Limits feel like intelligence; often they are cache hygiene. Vendors SEV their hit rate because it is their cost too. 80/20 over encyclopedias. Local dashboards lie if you change machines.

## D. Procedures
Keep the session alive and on one task. If >1h gap or task switch: handoff summary → new session. Big docs in a project space. Know that plan/exec model split recaches.  
Avoid: installing his dashboard/skill as hive must; quoting 91M as FACT.

## E. Examples
**Situation:** 205k-token HTML project, need to continue.  
**Action:** Session-handoff summary, clear, paste.  
**Reasoning:** Keep decisions/files.  
**Outcome:** Feels continuous.  
**Lesson:** The brief is the handle. Implicit rule: compact is not the only reset.

## F. Decision Rules
- If you will pause > TTL, handoff first.
- If you switch models, expect a recache tax.
- If you only need the 80/20, skip the vendor essay.
- Pay/subscribe HITL.

## G. Contrarian
Rejects “I need to understand all of prompt caching.” Rejects `/opus plan` as a free lunch (he once taught it as a hack).

## H. Assumptions
**Theirs:** 91M/300M, 10%, 1h/5m, 95% of people. **Ours:** UNVERIFIED; Claude-specific. Falsifier: a vendor that caches across model switches.

## I. Questions
- Claude.ai project cache — he is not sure.
- Does Cursor have an analog TTL we should name? (not on tape)

## J. Connections
- SYSTEM SYNTHESIS → `3QclAjmu5Tw` (session as a budget).
- SYSTEM SYNTHESIS → `f4mI3d-nTrI` (stateless handle).
- SYSTEM SYNTHESIS → `context-docs` (the handoff *is* a card).

## K. Future-Use
Unassigned: handoff-card format (files, decisions, pick-up) as gym/session hygiene.

## Steal / Operate-never

### Machine: one-task session → handoff card before TTL/clear
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** one job per thread → if pause or switch → write files/decisions/next → new thread → do not idle a fat prefix
- **Questions / signals:** Are we about to change the model or the system prompt? Has it been an hour?
- **Qualify / frame / objections:** Token dashboards are observe-only. 91M is not a brag we quote.
- **Procedure:** Three habits in A. No Claude install.
- **Example that proves it:** 205k handoff (E).
- **Why it works:** Prefix reuse is the discount; breaks are expensive (B/C).
- **Conditions / exceptions:** Vendor TTLs differ. Pay HITL.
- **Operate-never payload:** Quote 91M/300M as FACT; install Claude; Skool dashboard as hive must; quit-job.
- **Hive run:** `context-docs` · `session-bootstrap` · `ask-principal` (pay)
- **Source:** `6cEQEba0i2A` @ UNKNOWN

### Operate-never
- Quote token millions as FACT. Pay/install Claude from this desk.
- Employment send. Quit-job. Unpark clients. Merge LESSONS.

## L. Role-Specific Applications
Employment still covers baseline. Career analog: a gym thread dies unless you write the handoff card (what we practiced, what still fails, next rep). Do not brag token counts. Clients parked.
