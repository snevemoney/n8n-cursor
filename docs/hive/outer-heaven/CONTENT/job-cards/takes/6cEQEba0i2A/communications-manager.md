# Communications Manager — 6cEQEba0i2A
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/6cEQEba0i2A/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/6cEQEba0i2A/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
**Title (PACKET):** Give Me 10 Mins and I'll Save You Millions of Claude Tokens
**Speaker / channel:** Nate Herk | AI Automation
**Kind:** tutorial · 2535 words · captions in `full.txt` only · timestamps **UNKNOWN** (no VTT used).
**Gaps:** Caption ingest; ASR errors possible (Naden/Nitn = n8n). Visual UI not fully narrated. Timestamps UNKNOWN.

Beats, in order:
- Hook: 91M cached tokens that day ≈ paid as ~9M; 300M+ in a week — UNVERIFIED. Automatic if you use Claude/Claude Code. Token dashboard + session-handoff skill promised free in School.
- Cached tokens cost 10% of normal input. Subscription cache window = 1 hour; idle ≥1h then next message un-caches the session. API / sub-agents TTL = 5 minutes default (can pay to bump to 1h). Cannot change 5m on subs.
- Thoric/Thork (Anthropic): they alert on prompt-cache hit rate and declare SEVs if too low. High hit = faster, cheaper to serve, limits feel generous, long sessions practical. Low hit = lose-lose. 80/20 is enough; full article is overwhelming.
- Layers (Thork graphic): base system + tools globally cached; per-project CLAUDE.md/memory cached per project; session state; user messages grow each turn. Prefix matching.
- Turn 1: no cache, write system+project+msg1. Turn 2+ (inside TTL): only new reply+message processed. Wait an hour or change system prompt on turn 16 = recache everything (expensive).
- TTL confusion: weekly-limit extra usage = API 5m (dangerous). Community thought they silently switched sub TTL to 5m; he says they didn’t. Claude.ai web caching undocumented; he assumes like subscription. Docs mix Code vs API.
- Three habits (~95% of people): (1) don’t pause >1h — hand off to a new session. (2) Fresh session on task switch: /compact breaks cache, or /clear, or his handoff skill (summarize files/decisions/pickup → copy → /clear → paste). 205k-token project example; handoff <1 min vs slow compact. (3) Claude chat: big docs → Project, not paste (projects cached more optimally — inferred).
- What breaks cache: /model switch (each model has its own cache; identical content still misses). Opus-plan (Opus plan / Sonnet execute) = a model switch every plan toggle — saves long-run maybe, but resets cache. Editing CLAUDE.md mid-session is safe until restart. Dashboard is local-device; laptop ≠ PC. Setup: give repo to Claude Code, localhost.
- Close: know the 80/20; you don’t need the full Thoric essay if you’re not heavy API.

## B. Atomic Knowledge

### Cache is prefix + TTL; idle and model-switch recache the world
- **Claim:** Subscription cache lives ~1 hour. API/sub-agents default 5 minutes. Changing model or system prompt invalidates the prefix.
- **Reasoning:** You pay 10% on hits and full freight on creates. A late recache of a long thread is the expensive move.
- **Mechanism:** Keep the session alive and focused; hand off instead of idling; don’t /model mid-thread unless you accept the recache.
- **Evidence:** 91M cache-read day; turn diagrams; Thoric SEV quote; Opus-plan warning.
- **Conditions:** You are in a long Claude Code / API session.
- **Exceptions:** 91M / 300M / 10% / 205k UNVERIFIED. Dashboard/School install is never. This is not Grok cache.
- **Action:** Steal the three habits as an ops note if Evens uses Claude. Do not put token counts in a letter.
- **Confidence:** high as mechanism; counts UNVERIFIED
- **Source:** `6cEQEba0i2A` @ UNKNOWN
- **Epistemic:** SOURCE

### Handoff beats compact when you must leave
- **Claim:** Summarize important files, open decisions, where to pick up; /clear; paste. He prefers it to /compact.
- **Reasoning:** Compact is slow and breaks cache anyway. A one-minute brief preserves the thread without the old prefix.
- **Mechanism:** Handoff skill → copy → clear → paste.
- **Evidence:** 205k-token HTML project demo.
- **Conditions:** Task still the same after the break.
- **Exceptions:** A handoff that then auto-continues into send is never.
- **Action:** If we context-switch a letter thread, write a pickup brief; do not keep a stale 2-hour chat.
- **Confidence:** high
- **Source:** `6cEQEba0i2A` @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
- 80/20 of caching is enough; depth articles are for heavy API. **SOURCE**
- Keep it alive, keep it focused, start fresh on switch. **SOURCE**
- Opus-plan is a hidden model switch. **SOURCE**

## D. Procedures
- If idle ≥1h → new session + handoff, don’t poke the corpse. **SOURCE**
- If switching tasks → /clear (or compact, knowing it breaks cache). **SOURCE**
- If pasting a pile of docs in chat → Project instead. **SOURCE**
- If about to /model or Opus-plan → accept recache. **SOURCE**
- This desk: no token-dashboard letter. **SYSTEM SYNTHESIS**

## E. Examples
- **Situation:** 205k-token session, need to continue later. → **Action:** Handoff summary → /clear → paste. → **Reasoning:** Compact is slow; idle un-caches. → **Outcome:** Feels like he didn’t lose the thread. → **Lesson:** Brief the next session. Implicit rule: model switch = new cache.

## F. Decision Rules
- If TTL may be 5m (API/extra usage/sub-agents) → don’t walk away.
- If you only needed Opus for plan → know you paid a recache.
- Refuse: 91M/300M as FACT. School dashboard as ours. Token-savings claim in mail.
- Optimize: hit rate via stable prefix + short idle.

## G. Contrarian
- Field assumed Anthropic silently cut TTL to 5m. He says subscription is still an hour. **SOURCE**

## H. Assumptions
- Web Claude.ai cache is admitted unknown. All million-token figures UNVERIFIED. Falsifier: handoff that drops a critical decision.

## I. Questions
- Does Cursor/Grok have an analog to prefix-cache, or is this Claude-only color?

## J. Connections
- **SYSTEM SYNTHESIS:** `3QclAjmu5Tw` (limits). Token-hacks videos he references. Session hygiene ≠ send.

## K. Future-Use
- Handoff-brief as a desk habit when a draft thread gets long. Cache-break list as an unassigned Claude ops card.

## Steal / Operate-never

### Machine: Keep-alive / handoff / don’t-model-switch; never quote millions of tokens as FACT
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** Long session → stay inside TTL or write a handoff → new session → stop. No dashboard install. No send.
- **Questions / signals:** Have we idled an hour? Did we /model? Are we pasting a book into chat?
- **Qualify / frame / objections:** Qualify: 80/20 habits vs Thoric-depth. Frame: save the window, not a mailer. Objection: ‘Opus-plan saves limits’ → he says it recaches.
- **Procedure:** 1) Don’t idle. 2) Handoff on leave. 3) Projects for big docs. 4) No School repo.
- **Example that proves it:** 205k project handoff <1 min vs compact.
- **Why it works:** Prefix+TTL is the real session killer, not ‘Claude got worse.’
- **Conditions / exceptions:** Claude Code / API only. Exceptions: our stack is Cursor+Grok — learn, don’t install.
- **Operate-never payload:** Token dashboard as ours. Quote 91M. Hermes. Auto-continue into Gmail.
- **Hive run (existing skills only):** `ask-principal`. Stack stays Cursor + Grok.
- **Source:** `6cEQEba0i2A` @ UNKNOWN


### Operate-never (this desk will not operate)
- Install token dashboard / session-handoff skill from School. Quote 91M/300M tokens.
- Gmail **send**. Connector write. Scheduled send. Auto-send. Ack-reply. Mass-DM. Postcard. Waitlist blast.
- Quote tape $ / student counts / job-loss % / ROI hours as FACT in a letter.
- New hunt ICP. Unpark Normand. Clients parked — no Path A this week.
- Install on-tape vendors (Vapi, Claude, Codex, ChatGPT, Gemini, Coda, Abacus, Skool, n8n-cloud). Stack stays Cursor + Grok. On-tape names stay on-tape.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. New `icp_id`.

## L. Role-Specific Applications
- I do not write a ‘we saved 91 million tokens’ line. If a draft thread is stale, I start a clean brief. I do not send.
