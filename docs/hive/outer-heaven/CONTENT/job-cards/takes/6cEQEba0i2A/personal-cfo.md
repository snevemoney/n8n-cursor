# Personal CFO — 6cEQEba0i2A
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/6cEQEba0i2A/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/6cEQEba0i2A/LEARNED.md`
**ICP:** parked unless Evens named one.
**Walk:** VIDEO-FIRST from `full.txt` (2535 words, video 10:48). json3 present. Tape $ UNVERIFIED. No spend. Clients parked. Stack Cursor + Grok.

## A. Source Map
Caption-only. Visual/click UNKNOWN.
1. Hook: one day 91M tokens saved via cache read; past week >300M — UNVERIFIED. Automatic if you use Claude/Claude Code. Will give a token dashboard. **SOURCE**
2. Cached tokens cost ~10% of normal input. 91M cached ≈ paying as if ~9M. Sub cache window = 1 hour idle → uncache. API / sub-agents TTL = 5 minutes (can pay to bump to 1h). **SOURCE**
3. Thariq/Anthropic: they page on low cache-hit rate (SEVs) because high hit = faster, cheaper to serve, limits feel bigger. Low hit = lose-lose. Article is deep; he wants 80/20. **SOURCE**
4. Layers: global system + tools cached; per-project CLAUDE.md/memory; session; user messages grow. Turn 1 = cache write; later turns read prefix if TTL holds. Cache create = first write; cache read = 10× cheaper reuse. Change system prompt or wait an hour on turn 16 = recache everything. **SOURCE**
5. Confusion: extra-usage (over weekly, now API) defaults to 5-min TTL — “very dangerous.” People thought Anthropic silently switched sub TTL to 5 min; he says they did not. Claude.ai web TTL undocumented (he assumes sub). **SOURCE**
6. Three habits (~95% of people): don’t pause >1h — hand off to a new session; start fresh on task switch (`/compact` breaks cache, or `/clear`, or his session-handoff skill); Claude chat big pastes → use a Project (caching probably better). **SOURCE**
7. What breaks cache: model switch (prefix). `/opus plan` (Opus plan / Sonnet exec) is a model switch every toggle — may still save long-run but resets cache; he apologizes for prior advice. Editing CLAUDE.md mid-session is safe until restart. **SOURCE**
8. Dashboard: local, device-specific, GitHub in Skool; tell Claude Code to set up on localhost; reads past sessions. Handoff skill included. Know the 80/20, not the whole article. Like. **SOURCE**

## B. Atomic Knowledge

### Idle >1h or a model switch recaches the whole prefix
- **Claim:** The expensive move is letting TTL die or switching models mid-conversation so turn 16 pays for 1–15 again.
- **Reasoning:** Cache is prefix match; create once, read cheap, until the prefix breaks.
- **Mechanism:** Keep the session alive and focused; on task switch, handoff+clear instead of sitting idle; do not flip models to “save.”
- **Evidence:** 91M/300M/10% / 1h vs 5min named; `/opus plan` apology.
- **Conditions:** Claude Code subscription vs API/extra-usage.
- **Exceptions:** Counts UNVERIFIED. Hive is not on Claude. Extra-usage 5-min is the trap if anyone is on API.
- **Action:** Steal idle/handoff/don’t-switch-to-save. Do not install his dashboard. Do not buy extra usage.
- **Confidence:** high as mechanism
- **Source:** `6cEQEba0i2A` @ UNKNOWN
- **Epistemic:** SOURCE — counts UNVERIFIED

### Session handoff + clear instead of compact
- **Claim:** A one-minute summary of files/decisions/next, then `/clear`, keeps work moving without a long compact or a dead cache.
- **Reasoning:** Compact is slow and breaks cache; idle >1h also breaks it.
- **Mechanism:** Handoff → copy → clear → paste.
- **Evidence:** 205k-token project example; skill in Skool.
- **Conditions:** Long sessions on one task.
- **Exceptions:** His skill is a magnet. `/compact` still exists.
- **Action:** Maps to existing session-handoff / session-bootstrap. Do not join Skool.
- **Confidence:** high
- **Source:** `6cEQEba0i2A` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Most people do not need the caching paper; they need: don’t idle, don’t switch models to save, don’t paste novels into chat. Extra-usage is where the 5-minute knife is. Uncertainty: 91M/300M UNVERIFIED.

## D. Procedures
1. One task per session.
2. If you will be gone > TTL → handoff and stop.
3. Do not switch models mid-thread to be cheap.
4. Big docs live in a project/file, not a paste.
5. Avoid: extra-usage API; his localhost dashboard as a new service; Skool.

## E. Examples
**Situation:** 205k-token session; he needs to continue later. **Action:** Session handoff, `/clear`, paste. **Reasoning:** Compact is slow; idle recaches. **Outcome:** He feels he lost nothing. **Lesson:** Written handoff is the cheap continuity. Implicit: `/opus plan` as a “hack” can cost more than it saves.

## F. Decision Rules
- If idle will exceed TTL → handoff, do not wait. **SOURCE**
- If you are on extra-usage/API → treat TTL as 5 min. **SOURCE**
- If you switch models → assume cache is dead. **SOURCE**
- Refuse: quote 91M/300M as FACT; buy extra usage; new dashboard seat.

## G. Contrarian
Field used `/opus plan` as a token hack. He recants: it breaks cache. **SOURCE**

## H. Assumptions
Assumes Claude Code billing physics. Hive: apply the idle/handoff idea to long Cursor runs; do not import Claude TTL as ours without checking.

## I. Questions
- What is Claude.ai project cache actually?
- Did `/opus plan` ever save him net?

## J. Connections
- **SYSTEM SYNTHESIS:** `kB9iMD0EjT8` (handoff). `J_jswzXhYJA` (distrust token widget). `batch-credit-cap`.

## K. Future-Use
TTL-aware session hygiene as unassigned. No dashboard install.

## Steal / Operate-never

### Machine: keep-cache-alive-or-handoff (advise-only)
- **Epistemic:** SOURCE
- **Workflow / loop:** start one task → work inside TTL → if pause or task switch → write handoff → clear → checkable stop = no extra-usage, no model-flip hack, no Skool dashboard
- **Questions / signals:** Are we on sub TTL or 5-min API? Did we switch models? Is this a new task?
- **Qualify / frame / objections:** “Compact to save” → he prefers handoff. “Opus plan hack” → cache reset.
- **Procedure:** D.
- **Example that proves it:** 91M cache-read day (his dashboard); 205k session handoff.
- **Why it works:** Prefix reuse is 10¢ on the dollar until you break the prefix. Conditions: Claude billing. Exceptions: counts UNVERIFIED; not our vendor.
- **Operate-never payload:** Quote 91M/300M; buy extra usage; install dashboard; Skool.
- **Hive run:** `session-bootstrap` · `batch-credit-cap` · `ask-principal`
- **Source:** `6cEQEba0i2A` @ UNKNOWN

### Operate-never
- Move money, approve a charge, buy a seat, or cancel a lock-in.
- Quote tape $ / hours / student counts as FACT or household income.
- Install on-tape vendors. Cursor + Grok only.
- Auto-send / auto-pay / auto-book / auto-deploy / auto-publish / auto-dial.
- New hunt / unpark client / new `icp_id`. Merge `LESSONS-FROM-TAPE.md`. Auto-write `SKILL.md`.


## L. Role-Specific Applications
Steal idle-kills-the-discount and handoff-instead-of-compact. Do not buy extra usage where TTL becomes 5 minutes. 91M is not household. Still no dated runway.

Employment covers baseline (OPERATOR_MEMORY). No dated runway-months number — I will not fake one. Career Strategist owns quit math; this desk owns the months.
