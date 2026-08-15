# Forge — -cdexJWN8YA
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-cdexJWN8YA/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-cdexJWN8YA/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate Herk **Claude Code + ElevenLabs** voice agent. Cold open: 15-min “Nate’s AI” on 400 YT transcripts (Firecrawl answer live); **he will take the widget down** — demo only. Voice loop: mic → STT → LLM → optional tool/DB → TTS. Four pieces: **persona, voice, knowledge, tools**. Three doors: dashboard test, site widget (one snippet), phone (Twilio). Code beats clicks. Live: Neural consultancy landing in VS Code; plan mode; book via **cal.com** (not Calendly) — check availability + book; capture company/problem/team/role. Keys in `.env` (he had to refuse “you go click the dashboards”). Agent ID before widget. Iterate: bad Adam voice; missing first message; wrong clock; NATO-alphabet too slow; timezone bug (tool used UTC not Central — turn 16); prompt said read 2–3 slots. Handoff/`clear` between tests. Cal **2h minimum notice** explained the 6:30 first slot. Booked 7pm; confirmation email landed. Who pays: public widget burns *his* ElevenLabs credits; lock hostname/allowlist; conversation cap; rate-limit; optional auth; grounding or it hallucinates; premium voice + smart LLM = latency (localhost worse). Same engine, different door (phone later). Glydo/Whisper aside. Superpowers skill. Caption-only. Claude / ElevenLabs / cal.com / Vercel / Skool on-tape.

## B. Atomic Knowledge

### Four pieces, three doors, one engine; NL to the API instead of the dashboard
- **Claim:** A voice agent is a loop, not magic. Claude reads ElevenLabs docs and configures persona/voice/knowledge/tools. Widget is one HTML snippet. Phone is the same agent on Twilio.
- **Reasoning:** Manual dashboard = forgotten saves and bad endpoints. Humans know the outcome; plan mode asks the path.
- **Mechanism:** Plan → questions (account state, direct vs n8n middle, bubble, tone, extra fields) → architecture (cal prep, agent, two tools, widget) → `.env` keys → build → test on localhost.
- **Evidence:** Neural Diagnostic appears in the dashboard with two tools; widget on hard refresh.
- **Conditions:** Paid Claude. ElevenLabs + cal.com accounts. He prefers ElevenLabs because of his 4h voice clone.
- **Exceptions:** Steps 1–6 “only you can do” until he said do it anyway via API.
- **Action:** Steal loop + four pieces + one-engine-many-doors. Do not install Claude/ElevenLabs/cal.com. Do not embed a public widget.
- **Confidence:** high on the shape.
- **Source:** `-cdexJWN8YA` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** first-message miss; voice reject
- **Speech ≠ behavior:** “code beats clicks” then lots of dashboard for keys, voice, availability, security

### Iterate from the call experience; debug the tool, not the vibe
- **Claim:** First shot won’t be right. Describe what you heard. Three failure homes: cal.com returned one slot / agent queried a tiny window / agent misread many slots. Transcripts + tool logs beat guessing.
- **Reasoning:** He won’t read docs; the agent should. Handoff keeps context from rotting between tests.
- **Mechanism:** Session handoff → clear → “here’s the user experience.” UTC vs Central was the real bug; 2–3 slot prompt was secondary. 2h min-notice was Cal, not the tool.
- **Evidence:** After fix: 6:30–8:30 list; booked 7:00; mail received. Forced “don’t ask questions” still booked.
- **Conditions:** Localhost latency worse than live.
- **Exceptions:** Too many qualifying questions made the demo hard — sales prompt vs test prompt.
- **Action:** Steal experience-report debug + timezone on tool params. Do not auto-book real humans.
- **Confidence:** high.
- **Source:** `-cdexJWN8YA` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** demonstrated
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** first message; timezone; NATO; clock
- **Speech ≠ behavior:** none

### Public widget is a credit hose; lock the door
- **Claim:** Anyone talking 24h bills you. Snippet is stealable. Lock host, cap duration, throttle, maybe auth. Ground with real docs. Same agent can answer a phone later.
- **Reasoning:** Demo ≠ production. He took the 400-video agent down.
- **Mechanism:** ElevenLabs security allowlist + widget allow-domains; ask Claude to lock it.
- **Evidence:** Named: stolen HTML = your agent on their site.
- **Conditions:** No user API key on a marketing page.
- **Exceptions:** Authenticated app can bill the user.
- **Action:** Steal allowlist + cap + don’t-leave-it-up. Publish HITL. Do not quote credit burn as FACT.
- **Confidence:** high.
- **Source:** `-cdexJWN8YA` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** none
- **Speech ≠ behavior:** “15 minutes” cold open vs ~45 min iterated demo

## C. Mental Models
Outcome in plan mode; keys in `.env`; feel on the call; bug in the tool trace. Widget is a door, not the product. Public AI is a budget problem.

## D. Procedures
1. Do not install Claude, ElevenLabs, cal.com, Glydo, Vercel-as-required.
2. Do not leave a public voice widget up. Do not auto-book.
3. Do not send Skool. Do not use his clone/voice.
4. If studying: plan the four pieces + door; keys in env; accept plan; test; handoff; report the *heard* bug; check timezone + booking limits before blaming the LLM.
5. Confirm name/email; don’t NATO-spell if it yaps.
6. Before any public door: allowlist, cap, throttle, ground.
7. Book / publish / deploy HITL.

## E. Examples
**Situation:** Agent said only 6:30 today; calendar looked 4–9.  
**Action:** Named three failure homes; agent read turn 16 — query was UTC.  
**Reasoning:** Experience first, then which layer.  
**Outcome:** Slots 6:30–8:30; 4–6 blocked by 2h notice.  
**Lesson:** Tool param timezone + booking limits before “the model is dumb.”

**Situation:** Claude said dashboard steps 1–6 are human-only.  
**Action:** “Do everything; make a `.env`.”  
**Reasoning:** API exists.  
**Outcome:** Agent created; widget live.  
**Lesson:** Push the harness off the click-path.

**Situation:** 400-video site agent.  
**Action:** Demo, then take down.  
**Reasoning:** Not actually offering it.  
**Outcome:** Firecrawl answer in-call.  
**Lesson:** Knowledge can be transcripts; production is a separate decision.

## F. Decision Rules
- IF you know the outcome but not the wiring → plan mode.
- IF it asks you to click the whole dashboard → demand `.env` + API.
- IF the call feels wrong → say the feeling, don’t open docs first.
- IF slots look wrong → timezone / query window / parser / min-notice.
- IF the widget is public → lock host + cap + throttle or don’t ship.
- IF book/publish → HITL.

## G. Contrarian
Field configures ElevenLabs by clicking. He talks the agent into existence, then still pays the iterate tax. Field leaves the widget up for the thumbnail; he tears the cold-open one down.

## H. Assumptions
Paid Claude + ElevenLabs + cal.com. Tape time (Apr 28, 2026) and credit scare UNVERIFIED. Neural is a demo consultancy — do not unpark. Caption-only. Clients parked.

## I. Questions
What’s a hive-safe “door” that isn’t ElevenLabs? How would we cap a public agent without their dashboard? Do we already refuse auto-book?

## J. Connections
SYSTEM SYNTHESIS: `BO-jFbN4p8Y` Vapi poll + no auto-call. `tDGiWn0flK8` plan + `.env`. `iTY8Q449YNQ` handoff. `0WDkwMxj13s` if it can act it will. Book HITL. Cursor + Grok. No ElevenLabs/Vapi.

## K. Future-Use
Four pieces. Experience-debug. Timezone on tools. Public = lock or down. No auto-book.

## Steal / Operate-never

### Machine: plan a voice loop → API-configure → hear-it debug → lock or take down
- **Epistemic:** SOURCE
- **Workflow / loop:** outcome (widget books cal.com) → plan questions → keys in `.env` → build persona/voice/knowledge/tools → localhost call → handoff → fix the layer that failed → allowlist/cap before any public door
- **Questions / signals:** Which door? Who pays per minute? Did the tool use the right tz? What’s min-notice?
- **Qualify / frame / objections:** n8n-in-the-middle is extra pieces. Dashboard-only is slower. Public widget is stealable HTML.
- **Procedure:** No Claude/ElevenLabs/cal.com install. No public widget. No auto-book. No Skool.
- **Example that proves it:** UTC bug on turn 16; 2h notice; 7pm book + email; 400-video agent taken down.
- **Why it works:** NL reaches the API; the call is the test; security is a first-class iterate.
- **Conditions / exceptions:** Localhost latency. First-message flake. Tape $ UNVERIFIED.
- **Operate-never payload:** ElevenLabs/Claude/cal.com; public widget; auto-book; Glydo; Skool; voice-clone of Nate.
- **Hive run:** none. Book/publish HITL.
- **Source:** `-cdexJWN8YA` @ UNKNOWN

### Operate-never
- Do not install Claude Code, ElevenLabs, cal.com, Glydo, Vercel-as-hive.
- Do not embed a public voice widget or auto-book anyone.
- Do not leave a demo agent up.
- Do not send Skool.
- Clients parked. Book / publish / deploy HITL.

## L. Role-Specific Applications
Forge steals **four-piece loop**, **experience-first debug**, **public=lock-or-down**. We do not stand up ElevenLabs or book from a widget. Hive book stays HITL. Cursor + Grok.
