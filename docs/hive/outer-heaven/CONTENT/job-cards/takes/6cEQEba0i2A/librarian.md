# Librarian — 6cEQEba0i2A
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/6cEQEba0i2A/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/6cEQEba0i2A/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** Give Me 10 Mins and I'll Save You Millions of Claude Tokens
**Channel:** Nate Herk | AI Automation
**Kind:** video (~2535 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT unless noted)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. Hook: one day 91M tokens saved via cache read; past week >300M (UNVERIFIED). Automatic if you use Claude/Claude Code. He will give a token dashboard. Topic: why sessions burn, 80/20 of prompt caching.
2. Cached tokens cost **10% of normal input**. 91M cached ≈ paying for ~9M. Subscription cache window = **1 hour**; idle ≥1h → session un-cached. API / sub-agents TTL = **5 minutes** default (can pay to bump to 1h). Sub-agents stay 5 min on any plan.
3. Thorik (Anthropic): they alert on prompt-cache hit rate and declare SEVs if too low. High hit: faster, cheaper to serve, limits feel generous, long sessions practical. Low hit = lose-lose. Deep article exists; he wants 80/20 only.
4. Layers (Thorik graphic): base system instructions globally cached; tools (read/write/bash/grep/glob) globally cached; per-project `CLAUDE.md`/memory cached per project; session state; user messages grow each turn. Prefix matching. Turn 1 = cache create (write, one-time). Later turns = cache read (10× cheaper) for the prefix; only new reply+message are fresh — **unless** you wait an hour or change the system prompt (full recache; expensive on turn 16).
5. Community suspicion they silently moved TTL 1h→5m: he says they did not; extra-usage/API territory is 5m; claude.ai web TTL undocumented (he assumes sub, not 100%).
6. Three habits (~95% of people, his claim): (a) don’t pause too long — if >1h, hand off to a new session; (b) start fresh on task switch — `/compact` **breaks cache**, or `/clear`, or his **session handoff** skill (summarize files/decisions/pickup → copy → `/clear` → paste; 205k-token HTML project; usually <1 min vs slow compact); (c) Claude chat: big docs → **Projects** (he is “pretty confident” project files cache better than paste). Keep alive, keep focused, start fresh when you switch.
7. What breaks cache: **model switch** (`/model`) — each model has its own cache; next request rereads full history with no hits. **`/opus plan`** (Opus plan / Sonnet execute) = a model switch every plan toggle — saves limits long-run (he thinks) but resets cache. Editing `CLAUDE.md` mid-session is OK — edit applies on restart, cache stays. Dashboard is **local** (laptop ≠ PC); GitHub repo via Skool → “set this up on localhost”; pulls past session files.
Gap: Thorik graphics, dashboard UI. Timestamp UNKNOWN. Claude/Skool on-tape.

## B. Atomic Knowledge

### Cache is a prefix; idle, model-switch, and compact break it
- **Claim:** Hits are 10% input; 1h TTL on the sub, 5m on API/sub-agents; waiting, switching model (including Opus-plan), or `/compact` recaches the whole prefix — expensive late in a session.
- **Reasoning:** Prefix match; system/tools/project are the expensive stem; conversation should grow.
- **Mechanism:** Cache create once → cache read; session handoff instead of compact; Projects for big docs; don’t `/model` mid-thread.
- **Evidence:** 4-turn graphic; 205k handoff demo; Thorik SEV quote.
- **Conditions:** Extra-usage/API = 5m. Web undocumented.
- **Exceptions:** Mid-session `CLAUDE.md` edit does not apply until restart (cache safe).
- **Action:** Steal the three habits + “Opus-plan breaks cache.” 91M/300M UNVERIFIED. No Skool dashboard as hive.
- **Confidence:** high as 80/20; web TTL unknown
- **Source:** `6cEQEba0i2A` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared + demonstrated (transcript-implied)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** community thought TTL silently dropped — he says no
- **Speech ≠ behavior:** none

## C. Mental Models
80/20 over Thorik-depth. High hit rate is a vendor SEV because it is also their cost. Handoff > compact. Don’t memorize API docs you do not use.

## D. Procedures
1. Stay inside the 1h window or hand off.
2. Task switch → handoff + `/clear` (not `/compact` if you care about cache).
3. Do not `/model` or Opus-plan mid-thread unless you accept a full recache.
4. Big docs → Project, not paste (web).
5. Optional: local token dashboard for visibility (device-local).
Avoid: 91M as FACT; Skool repo as SSOT; treating 5m API TTL as 1h.

## E. Examples
**205k handoff:** Situation — long HTML build. Action — summarize / copy / clear / paste. Outcome — feels continuous, <1 min. Lesson — replace compact when compact is slow and cache-breaking.

**Opus plan:** Situation — token-hack from older videos. Action — Opus plans, Sonnet executes. Outcome — each toggle is a model switch / fresh cache. Lesson — the hack has a cache tax.

## F. Decision Rules
- IF idle ≥1h (sub) or ≥5m (API/sub-agent) → new session + handoff, do not poke the cold one.
- IF you need a model switch → expect full recache.
- IF you only need a `CLAUDE.md` tweak → edit now, restart later.
- Refuse: 91M/300M as FACT; Skool; Claude as hive.

## G. Contrarian
Against “just `/compact`.” Against “Opus-plan is free savings.” Against reading the whole Thorik article first.

## H. Assumptions
10% / 1h / 5m are his read of Anthropic. Web TTL unknown. Complements `kB9iMD0EjT8` (same handoff skill) and `3QclAjmu5Tw` (limits).

## I. Questions
Exact claude.ai project cache? Is 10% still true on extra-usage? Dashboard schema?

## J. Connections
SYSTEM SYNTHESIS → `kB9iMD0EjT8`; `3QclAjmu5Tw`; `XTBWVVcF3Pk` (routing vs cache-break).

## K. Future-Use
TTL map + handoff-not-compact + Opus-plan cache tax as atoms.

## Steal / Operate-never

### Machine: keep the prefix hot; handoff instead of compact
- **Epistemic:** SOURCE
- **Workflow / loop:** work inside TTL → on pause or task-switch, session-handoff → `/clear` → paste → checkable stop = next turn is cache-read heavy (or dashboard shows reads >> creates)
- **Questions / signals:** Sub 1h or API 5m? Did I `/model`? Is this a new task?
- **Qualify / frame / objections:** 80/20; you do not need the SEV paper.
- **Procedure:** D above.
- **Example that proves it:** 205k handoff; Opus-plan cache reset.
- **Why it works:** Prefix recache late in a thread is the expensive move.
- **Conditions / exceptions:** Extra-usage 5m; web unknown.
- **Operate-never payload:** 91M/300M as FACT; Skool dashboard as hive; Claude as hive.
- **Hive run:** Same handoff idea on Cursor/Grok threads — do not install Claude.
- **Source:** `6cEQEba0i2A` @ UNKNOWN

### Operate-never
- Quote millions-saved as FACT. Skool GitHub as SSOT. Merge LESSONS. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
File TTL + “compact breaks cache” + Opus-plan tax. Do not adopt the Skool dashboard.
