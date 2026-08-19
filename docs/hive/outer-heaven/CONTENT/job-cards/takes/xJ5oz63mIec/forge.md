# Forge — xJ5oz63mIec
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/xJ5oz63mIec/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/xJ5oz63mIec/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate Herk **three ways to deploy agents while you sleep**. Axes: **where** (laptop vs cloud) × **how deterministic** (script vs agent loop). **WAT** = workflow / agent / tools; a skill is W+T. **1) Loop/cron inside Claude Code** (`cron create/list/delete`). Session-scoped. Desktop: ~3-day cap, **clear kills** the cron, jitter so “every 10 min” is not exact (up to ~30 min). Terminal: **clear keeps** crons, ~7-day, you can cron `/clear` to fight context rot. Machine + session must stay up. Example: YouTube-comment reply loop 10 min / kill at 24h. **2) Desktop scheduled tasks vs cloud routines.** Local = machine+app on; **catch-up** when you reopen (pause if you don’t want a burst). Cloud = Anthropic infra, laptop off; **15/day Max, 5 Pro, 25 team/ent** (tape); **1-hour min** interval; env vars on a **clone**; triggers = schedule / GitHub / API. Same move: inject a prompt into a full session (skills/MCP). He paused a Skool-wins routine for **Hermes**. Careless prompt = unwanted actions. **3) Modal (Python, “cron in the cloud”) vs Trigger.dev (TS, durable workflow).** Deploy W+T; the **A** only if you wrap **Agent SDK** (brain+hands, stateless unless session id, **API key** not the chat sub — later “monthly credit” nuance, Theo linked). Deterministic jobs may need **no** model. Bonus: **managed agents** (he doesn’t love; stay on Code if you already know it); **hooks** (pre/post tool, session start/end, ping-on-message). Skool resource CTA. Timestamp UNKNOWN. Claude / Modal / Trigger / Hermes / Skool on-tape. Caption-only: UIs unobserved beyond his words.

## B. Atomic Knowledge

### Pick the runner by laptop-must-stay-on and whether you need a brain or a script
- **Claim:** No single best deploy. Loop = full WAT, dies with the session. Local schedule = new session, still needs the machine (and will catch up). Cloud routine = 24/7, capped, 1h floor. Modal/Trigger = off-laptop W+T (or Agent SDK if you pay tokens).
- **Reasoning:** Jitter/caps/catch-up are the real constraints. Subscription ≠ API. Deterministic work shouldn’t buy an agent.
- **Mechanism:** Ask: machine on? session on? WAT needed? Then pick loop / local / Anthropic cloud / other cloud.
- **Evidence:** Trash-reminder cron; `/clear` lives in terminal; YouTube 10-min loop; 15 remote/day Max.
- **Conditions:** His Max/Pro numbers as taped. Hermes/Skool are *his* stack.
- **Exceptions:** Desktop vs terminal cron behavior differs. Tape caps UNVERIFIED.
- **Action:** Steal the two-axis picker + “don’t catch-up-blast.” Do not install Claude/Modal/Trigger/Hermes. Do not auto-reply comments. Cursor stays.
- **Confidence:** high on the picker; vendor caps are a pitch.
- **Source:** `xJ5oz63mIec` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
WAT. Skill = W+T. Laptop ≠ cloud. Catch-up is a feature and a foot-gun. Brain vs hands (API vs Agent SDK).

## D. Procedures
1. Don’t add Claude/Modal/Trigger/Hermes. 2. Don’t auto-reply YouTube/Skool. 3. Don’t leave local schedules unpaused after downtime. 4. Don’t inject an unwatched prompt into a live session. 5. Don’t send the Skool guide.

## E. Examples
**Situation:** Comment replies for 24h.  
**Action:** Terminal loop every 10 min, then kill.  
**Reasoning:** Full WAT, short life.  
**Outcome:** Session must stay open.  
**Lesson:** Operate-never for client/public reply.

**Situation:** Machine off 5 days.  
**Action:** Local tasks catch up on open.  
**Reasoning:** Backlog fires at once.  
**Outcome:** Burst unless paused.  
**Lesson:** Pause before travel.

## F. Decision Rules
- If it must live when the laptop sleeps → not a loop / not local schedule.
- If it’s a vending-machine job → script on a runner, not an agent.
- If the demo is comment-reply / Skool-engage → refuse.
- If tape caps / Hermes appear as ours → park.

## G. Contrarian
Field picks one “always-on agent.” He maps four runners and says most jobs don’t need the A.

## H. Assumptions
Anthropic caps as taped. Falsifier: we already have a runner. Clients parked.

## I. Questions
None. Don’t add a fourth cloud.

## J. Connections
SYSTEM SYNTHESIS: `UGIZnh6HNLc` Trigger vs Modal. `PQBYZQqan2g` cloud vs desk. `3XIGcM7VICc` vending vs slot. No vendor install.

## K. Future-Use
Two-axis picker. Pause catch-up. Deterministic → script. Don’t buy the stack.

## Steal / Operate-never

### Machine: choose runner by laptop-on and WAT; pause catch-up; don’t agent a script
- **Epistemic:** SOURCE
- **Workflow / loop:** map the job → loop / local / Anthropic cloud / other cloud → watch the first runs
- **Questions / signals:** Dies on sleep? Needs a brain? Will it catch up?
- **Qualify / frame / objections:** Caps, jitter, API vs sub.
- **Procedure:** No Claude/Modal/Trigger/Hermes. No public auto-reply.
- **Example that proves it:** Terminal `/clear` cron; local catch-up; 15 remote/day.
- **Why it works:** The constraint is the runner, not the model name.
- **Conditions / exceptions:** Tape caps UNVERIFIED.
- **Operate-never payload:** Install those vendors; comment-bot; Skool CTA; quote 15/day as FACT.
- **Hive run:** none. Deploy HITL.
- **Source:** `xJ5oz63mIec` @ UNKNOWN

### Operate-never
- Install Claude / Modal / Trigger / Hermes. Auto-engage. New hunt. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`.

## L. Role-Specific Applications
I will keep the two-axis picker. I will not add those runners. Deploy HITL.
