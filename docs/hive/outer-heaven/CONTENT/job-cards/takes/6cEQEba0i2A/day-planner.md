# Day Planner — 6cEQEba0i2A
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/6cEQEba0i2A/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/6cEQEba0i2A/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate: prompt caching / session burn. Beats: 91M cached in a day / 300M in a week (UNVERIFIED) via cache-read; cached input = 10% cost (UNVERIFIED); Claude Code TTL **1 hour** — idle ≥1h un-caches the session; API/sub-agents TTL **5 minutes** (can pay for 1h); Thoric/Anthropic SEV on low cache-hit; layers: global system+tools, per-project CLAUDE.md, growing user turns; cache create vs cache read; changing system prompt or waiting an hour on turn 16 recaches everything; extra-usage (over weekly cap) drops to 5-min TTL — “very dangerous”; three habits: don’t pause too long (handoff to a new session); start fresh on task switch (`/compact` breaks cache — he prefers **session-handoff** then `/clear`); big docs belong in a Project not a chat paste; Skool dashboard+skill CTA. Timestamp UNKNOWN. Vendor: Claude — on-tape.

## B. Atomic Knowledge
### Idle > TTL recaches the whole prefix
- **Claim:** After 1h (Code) or 5m (API/sub-agents / extra-usage), the next message pays to rebuild the prefix; a late system-prompt edit does the same.
- **Reasoning:** Cache is prefix-match; break the prefix, pay again.
- **Mechanism:** Turns accumulate; only the new reply+message should be fresh — unless TTL/prompt change.
- **Evidence:** “if you leave a session sitting for an hour or longer, then you’re going to pay more.”
- **Conditions:** You are on a cached harness.
- **Exceptions:** A true new task should start fresh anyway.
- **Action:** Steal idle-handoff. We are not on Claude — the habit is: don’t leave a fat context sitting, then poke it.
- **Confidence:** high as the TTL rule he states; 91M/10% UNVERIFIED.
- **Source:** `6cEQEba0i2A` @ UNKNOWN
- **Epistemic:** SOURCE

### Handoff + clear beats compact-in-place
- **Claim:** `/compact` breaks cache and is slow; a 1-minute session-handoff (files, decisions, next) + `/clear` + paste keeps the work and resets the bill.
- **Reasoning:** 205k-token session example (UNVERIFIED).
- **Mechanism:** Summarize → copy → clear → paste.
- **Evidence:** “my replacement for doing /compact.”
- **Conditions:** Task continues but the window is stale or huge.
- **Exceptions:** A brand-new task → clear without the paste.
- **Action:** Same four-liner as `kB9iMD0EjT8`. No Skool dashboard.
- **Confidence:** high as his habit.
- **Source:** `6cEQEba0i2A` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Cache-hit is how limits “feel generous.” Extra-usage is a trap (5-min TTL). Keep it alive, keep it focused, start fresh on switch. He does not want you to learn the whole Thoric article — 80/20. Priority: three habits. Uncertainty: Claude.ai web cache undocumented.

## D. Procedures
1. If idle past the window → new session + handoff, don’t poke the corpse.
2. Task switch → clear (handoff if continuing).
3. Big docs → a project/store, not a paste.
4. Don’t edit the system prompt mid-deep-session without expecting a recache.
Avoid: Claude; Skool token dashboard; quote 91M as FACT.

## E. Examples
**205k then handoff:** Situation → long HTML build. Action → session-handoff <1 min, clear, paste. Reasoning → compact is slow and breaks cache. Outcome → “haven’t actually lost anything.” Lesson → steal the note; reset the window.

## F. Decision Rules
- If idle ≥ window → do not send “one more” into the old session.
- If the task changed → fresh session.
- If we are over a weekly cap analog → treat TTL as shorter (his extra-usage warning).

## G. Contrarian
Rejects “just compact and keep going.” Also rejects learning all of cache internals. Field assumption: longer session = cheaper.

## H. Assumptions
Theirs: 1h/5m/10% are current. Ours: UNVERIFIED; stack is not Claude. Falsifier: TTL changed again (he says people already suspected that). Survivorship: one dashboard week.

## I. Questions
Same handoff skill as `kB9iMD0EjT8`? What else breaks cache (he starts a list — rest of tape)? Web Claude TTL?

## J. Connections
- SYSTEM SYNTHESIS → `kB9iMD0EjT8` · `3QclAjmu5Tw` (shared cap) · `session-bootstrap` · `morning-day-plan` (don’t leave a block idle then poke).

## K. Future-Use
Idle-handoff + don’t-paste-big-docs. Unassigned dashboard.

## Steal / Operate-never

### Machine: stay inside TTL or handoff+clear; projects not pastes
- **Epistemic:** SOURCE
- **Workflow / loop:** work in one focused session → if idle or task-switch, write handoff → new session → do not recache a 16-turn prefix
- **Questions / signals:** How long idle? Did the task change? Are we past a cap?
- **Qualify / frame / objections:** “One more message in the old chat” is the fail after TTL.
- **Procedure:** Handoff four-liner. No Claude. No Skool.
- **Example that proves it:** Situation → 205k session. Action → handoff + clear. Reasoning → compact breaks cache. Outcome → continue cheap. Lesson → steal the reset.
- **Why it works:** Prefix recache is how mornings die; a note is cheaper than a corpse session.
- **Conditions / exceptions:** We are not on Claude TTL. Tape millions UNVERIFIED.
- **Operate-never payload:** Claude as stack; Skool dashboard; quote 91M/300M/10% as FACT.
- **Hive run (existing skills only):** `session-bootstrap` · `kB9iMD0EjT8` handoff.
- **Source:** `6cEQEba0i2A` @ UNKNOWN

### Operate-never
- Install Claude / switch stack.
- Quote tape token millions as FACT.
- Send / pay / deploy / book / publish.

## L. Role-Specific Applications
**One next:** `coverage-loop` score this packet as idle-handoff (no Claude cache dashboard). Clients parked.
