# Big Boss — xJ5oz63mIec
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/xJ5oz63mIec/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/xJ5oz63mIec/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Long (PACKET: 21:48, 5337 words, captions `en-orig`). Timestamp UNKNOWN on `full.txt` (no VTT in the take). Visual-only gaps: the 2×2 slider graphic, desktop cron countdown, Modal/Trigger dashboards, Agent SDK diagram, hooks list.

Beats, in order:

1. Promise: three simple ways to deploy agents so they run while you sleep. No one best way — it depends.
2. Slider: **where it runs** (your machine vs cloud: Anthropic / Modal / Trigger / VPS) × **how deterministic** (full agent loop vs same-every-time script).
3. Scorecard he will reuse: run location, WAT (what is deployed), computer-on?, session-on?
4. **Method 1 — loop:** ask Claude Code to `/loop` or natural-language cron. Tools: `cron create/list/delete`. Session-scoped (five tabs = five loop worlds). Desktop: next-in-N-seconds, **3-day** end, `/clear` **kills** the cron. Terminal: `/clear` **keeps** crons; he adds a second cron that injects `/clear` to fight context rot; claimed **7-day** life. Jitter: fires up to **30 minutes** late so APIs are not thundering-herded. Example: every 10 minutes reply to YouTube comments from the transcript, auto-kill at 24h.
5. Loop pros: zero setup, full WAT, can run skills, can self-stop, can slash-command. Cons: session open, machine on, expiry, fixed interval, desktop vs terminal nuance.
6. Skills in WAT: a skill is W, or W+T. Not a fourth letter.
7. Mid-roll: free Skool resource guide.
8. **Method 2 — desktop scheduled tasks + cloud routines:** same “inject a prompt into a Code session.” Local: machine + desktop app; **catch-up** if the computer was off (pause if you do not want a burst). Cloud: Anthropic infra, machine can be off; **Max 15/day**, Pro **5**, Team/Enterprise **25**, else extra usage. Cloud min interval **1 hour**. Cloud can be schedule / GitHub event / API webhook. Con: careless prompt scoping → unwanted actions.
9. **Method 3 — Modal or Trigger.dev:** you write a script (Python / TypeScript), push, cron or webhook, dashboard for errors. Modal = “cron in the cloud.” Trigger = “durable workflow engine that also does cron.” Deploy **W+T**, not A. AI there is **API tokens**, not the Claude subscription — often more expensive. Best when the process **needs no AI**. Bonus: Agent SDK on those hosts = A comes back (brain + hands); default **stateless** unless you pass session id; **API key**, not subscription. May 13 note: monthly credit can apply to Agent SDK via a **different dedicated budget** (Theo video).
10. Asides: managed agents (he tried, does not love; for people who never opened Code). Hooks = deterministic event scripts (pre/post tool, session start/end, notify-on-message). Layer hooks.
11. Close: resource guide + Skool. **$ UNVERIFIED** (15/5/25 caps; comment-loop not priced).

Off-topic / not skipped: Hermes agent replacing a Skool-wins routine; YouTube comment responder as the loop example; Theo’s SDK budget breakdown.

## B. Atomic Knowledge

### Pick the deploy shape on a slider, not a winner
- **Claim:** There is no best deploy. Choose by (machine vs cloud) × (agentic vs script).
- **Reasoning:** A comment-reply wants the full chair. A no-AI cadence wants a script. Mixing them is how you get surprise-send.
- **Mechanism:** His scorecard: location, WAT slice, computer-on, session-on.
- **Evidence:** He returns to the graphic after each method.
- **Conditions:** You already know if the job must decide or must repeat.
- **Exceptions:** Agent SDK on Modal/Trigger blurs the slider (A in someone else’s cloud).
- **Action:** Name the square before anyone “deploys.” Deploy stays HITL.
- **Confidence:** high
- **Source:** `xJ5oz63mIec` @ UNKNOWN — “there’s not one best way to deploy an automation. It depends on the type”
- **Epistemic:** SOURCE

### A session loop is not infrastructure
- **Claim:** Loop = full WAT inside an open session. Close the session or the machine and it dies.
- **Reasoning:** Zero setup is the pro. Fragility is the con. He still uses it for “just uploaded, reply for 24h.”
- **Mechanism:** `cron create`. Session-scoped. Desktop `/clear` kills; terminal `/clear` keeps.
- **Evidence:** Trash-reminder demos. YouTube comment loop + auto-kill 24h.
- **Conditions:** Operator wants the real chair (skills, files).
- **Exceptions:** Jitter up to 30 minutes — not for “exactly 9:17.”
- **Action:** Do not call a loop “running while I sleep” unless the machine and session are actually up. Comment auto-reply stays operate-never.
- **Confidence:** high
- **Source:** `xJ5oz63mIec` @ UNKNOWN — “if you close out of that terminal session, the loop dies”
- **Epistemic:** SOURCE

### Desktop and terminal do not keep crons the same way
- **Claim:** Desktop: `/clear` kills the cron; UI said 3-day end. Terminal: `/clear` keeps crons; he even cron’d `/clear`; 7-day claim.
- **Reasoning:** Same word “loop,” two products. He uses terminal when he is “really going to use loops.”
- **Mechanism:** Session process vs desktop chat-clear.
- **Evidence:** Side-by-side experiment after `/clear` + `cron list`.
- **Conditions:** True as of this recording. He wonders if a relaunch would fix desktop to 7 days.
- **Exceptions:** Closing the session still kills both.
- **Action:** If we ever analog a loop, treat “clear” as a kill risk until proven.
- **Confidence:** high for the demo; medium as a lasting API
- **Source:** `xJ5oz63mIec` @ UNKNOWN — “in the desktop app, if you… clear your chat, it will kill that cron”
- **Epistemic:** SOURCE

### Cloud routines trade machine-off for a daily cap
- **Claim:** Anthropic cloud injects the same prompt into a cloned session. Machine can be off. Caps: 5 / 15 / 25 per day by plan. Min interval 1 hour.
- **Reasoning:** 24/7 is the pitch. Budget and interval are the leash. Extra usage if you blow the cap.
- **Mechanism:** Routines UI: local vs remote; remote also GitHub event or API.
- **Evidence:** Max 15/day on his plan. Skool-wins skill (paused, moved to Hermes).
- **Conditions:** Env vars must be set in the cloud clone (he points at another video).
- **Exceptions:** Local scheduled tasks **catch up** after days off — burst risk.
- **Action:** Cap + catch-up are why deploy is Evens. Unattended prompt injection is how unwanted actions happen.
- **Confidence:** high that he said the caps; **$ UNVERIFIED**
- **Source:** `xJ5oz63mIec` @ UNKNOWN — “careless prompt scoping can cause unwanted actions”
- **Epistemic:** SOURCE

### Local catch-up is a burst
- **Claim:** If the machine was off for days, local desktop tasks play catch-up when the app opens.
- **Reasoning:** Helpful if you wanted them. Dangerous if you did not (five days of “send the wins email”).
- **Mechanism:** Desktop scheduled tasks scan missed fires.
- **Evidence:** He warns: pause if you do not want catch-up.
- **Conditions:** Local only. Cloud does not need this.
- **Exceptions:** Not shown live.
- **Action:** Pause before a long off. Catch-up is not “resume safely.”
- **Confidence:** high
- **Source:** `xJ5oz63mIec` @ UNKNOWN — “it would play catch up, which is pretty cool. But definitely keep that in mind”
- **Epistemic:** SOURCE

### Modal / Trigger deploy W+T, not A — and often no AI at all
- **Claim:** Script in their cloud. Dashboard. Cron or webhook. You shipped the recipe and the tools. The chair stays home. If it needs no model, this is the square he would pick.
- **Reasoning:** Deterministic + machine-off. AI on those hosts is pay-per-token API, not the subscription — can be more expensive.
- **Mechanism:** Python (Modal) vs TypeScript (Trigger). Env vars on their side. Code (on tape) pushes dev → prod.
- **Evidence:** One-line analogy. WAT graphic: W+T only unless Agent SDK.
- **Conditions:** Process is already trusted in the chair (`vFepZE_wrfg`).
- **Exceptions:** Agent SDK bonus puts A back — API key, stateless unless session id.
- **Action:** Same doctrine: deploy W+T. A unsupervised in Modal is still A unsupervised.
- **Confidence:** high
- **Source:** `xJ5oz63mIec` @ UNKNOWN — “you’re basically just deploying the workflow and the tools. You don’t get that autonomous agent loop”
- **Epistemic:** SOURCE

### Agent SDK is Claude Code without the subscription chair
- **Claim:** SDK = brain + hands (tools, loop). Raw API = brain only. Default stateless. Needs API key. New dedicated monthly budget ≠ weekly Code usage.
- **Reasoning:** People confuse “I already pay for Claude” with “this endpoint is free.” He waited days to post because the May 13 change landed.
- **Mechanism:** Query → reason → tools → iterate → output. Pass session id to keep memory. `/clear` = new session.
- **Evidence:** Bonus section + Theo pointer.
- **Conditions:** You want A on a host that is not your laptop.
- **Exceptions:** He is “not diving in” as an official method.
- **Action:** Do not treat SDK as a loophole around HITL or around our stack.
- **Confidence:** high for the distinction; budget math UNVERIFIED
- **Source:** `xJ5oz63mIec` @ UNKNOWN — “you cannot use your Claude subscription if you’re using the Agent SDK”
- **Epistemic:** SOURCE

### Hooks are deterministic side-effects on events
- **Claim:** Hooks fire on tool/session events. Not an agent deciding. Layer them (notify on message, pre/post tool, session end).
- **Reasoning:** Event-driven and repeatable — the other end of the slider from a full loop.
- **Mechanism:** Hook script on a named event.
- **Evidence:** Notification-noise example. He offers a future masterclass.
- **Conditions:** You already know the event.
- **Exceptions:** Not built on this tape.
- **Action:** Steal “side-effect on event,” not a hooks farm. Session-end → save confirm maps to `vDVSGVpB2vc`.
- **Confidence:** medium (thin demo)
- **Source:** `xJ5oz63mIec` @ UNKNOWN — “they’re much more deterministic”
- **Epistemic:** SOURCE

### Comment-reply loop is the ugly example on purpose
- **Claim:** Early YouTube comment agent: every 10 minutes, read comments, reply from transcript, optional 24h kill.
- **Reasoning:** Shows loop + self-stop. Also auto-publishes in the comment field.
- **Mechanism:** Session loop + transcript as context.
- **Evidence:** Spoken example, not a live run on this tape.
- **Conditions:** He presents it as a pro of loops.
- **Exceptions:** Hive: publish is HITL. Auto-reply is publish.
- **Action:** Steal the 24h kill and the “session must stay up.” Do not operate comment auto-reply.
- **Confidence:** high that he said it
- **Source:** `xJ5oz63mIec` @ UNKNOWN — “set up a loop for every 10 minutes to read the comments… and respond”
- **Epistemic:** SOURCE

## C. Mental Models

- **Slider, not a podium.** Depend on the job. **SOURCE**
- **WAT tells you what you actually shipped.** Skills sit in W or W+T. **SOURCE**
- **Open session = still you.** Loop is not “in the cloud.” **SOURCE**
- **Catch-up is a burst.** Off-then-on is not safe resume. **SOURCE**
- **Unattended prompt is a loaded gun.** Scope it or it acts. **SOURCE**
- **No-AI cadence belongs on a script host.** **SOURCE**
- **Subscription chair ≠ API hands.** **SOURCE**
- **24/7 is a cap and a jitter, not a money machine.** **INFERENCE**

## D. Procedures

1. **Qualify the square:** machine vs cloud; decide vs repeat.
2. **If it must decide:** keep a human in the chair or a review gate. Do not “sleep” it.
3. **If it must repeat and needs no model:** script host (analog: our scheduled jobs, Evens deploys).
4. **If you only have a session loop:** name the kill (time or count). Assume jitter. Assume clear may kill.
5. **If local scheduled:** pause before a long off so catch-up does not fire a week of sends.
6. **Scope the injected prompt** so it cannot send/pay/book/publish.
7. **Questions / signals:** “What WAT letters ship?” “What dies if I close the lid?” “What happens after five days off?”
8. **Objections:** “It runs while I sleep” — which square? “I already pay Claude” — SDK is another bill.
9. **Avoid:** auto-deploy; comment auto-reply; Agent SDK as hive OS.
10. **When to change:** If the job grew a send, move it off unattended.

## E. Examples

**Situation:** He wants trash reminders every minute, then `/clear`.  
**Action:** Desktop would die; terminal `cron list` still shows the job. He adds a `/clear` cron to fight rot.  
**Reasoning:** Same feature, two products.  
**Outcome:** Terminal is his loop chair.  
**Lesson:** Read the square’s fine print. Implicit rule: clear is not a safe “reset and keep.”

**Situation:** Computer off five days, local routines queued.  
**Action:** He warns they catch up unless paused.  
**Reasoning:** Missed fires are not discarded.  
**Outcome:** Burst on open (claimed).  
**Lesson:** Pause is part of done. Implicit rule: off-then-on can send.

**Situation:** Early Nate replies to YouTube comments every 10 minutes.  
**Action:** Session loop + 24h kill.  
**Reasoning:** Full chair, zero infra.  
**Outcome:** Auto-publish in comments.  
**Lesson:** Kill timer is stealable. Auto-reply is operate-never.

## F. Decision Rules

- If you cannot name the slider square → do not deploy.
- If A is in the runtime and send is in the tools → refuse.
- If the process needs no AI → do not pay a model to cron it.
- If local tasks exist → pause before a long off.
- If they say “24/7” → ask cap, jitter, and who pays tokens.
- Optimize: match shape to job. Not “always cloud.”
- Refuse (this desk): auto-deploy, comment auto-reply, SDK farm.

## G. Contrarian

- Against “one deploy method”: he built a slider.
- Against “agentic in prod is the future”: he prefers deterministic W+T on a host, and no-AI when possible (same as `vFepZE_wrfg`).
- Against “managed agents for everyone”: he bounced, told Code users to stay.
- Field assumes sleep = money. He showed caps, jitter, and catch-up bursts.

## H. Assumptions

**His:** Claude Code is the chair; Modal/Trigger are the obvious hosts; 15 cloud runs/day is enough; comment auto-reply is a cute example; Skool guide is the conversion.

**Ours:** Captions complete enough (5337 words). Caps and jitter UNVERIFIED as current product. Domain-specific: his Claude week. Clients parked.

**Falsifiers:** Desktop/terminal cron behavior changes. Catch-up sends something ruinous. SDK budget is not actually usable.

**Disagreement (keep labeled):** Hive will not operate Claude deploy hosts or auto-reply. The **slider + W+T-only + pause-before-off + scoped prompt** machines are still stolen. **SYSTEM SYNTHESIS**

## I. Questions

- Exact current desktop cron TTL (3 vs 7)?
- What did the Skool-wins routine do that he moved to Hermes?
- Agent SDK dedicated budget — numbers? He deferred to Theo.
- Hooks masterclass — not this id.

## J. Connections

- **SYSTEM SYNTHESIS** → `vFepZE_wrfg` (deploy W+T not A; Trigger/Modal pointed here).
- **SYSTEM SYNTHESIS** → `vfWTyEreOEc` (`/loop`, routines, status, skills).
- **SYSTEM SYNTHESIS** → `ask-principal` / `input-required-gate` (deploy, unattended).
- **SYSTEM SYNTHESIS** → `send-removed` (comment reply is publish).
- **SYSTEM SYNTHESIS** → `golden-test-loop` (trust in chair before any host).
- **SYSTEM SYNTHESIS** → doctrine #10 (act → ask principal → never money/PII).

## K. Future-Use

- Slider as a Watchdog question on any “run while we sleep” pitch (unassigned).
- Pause-before-off as a Day Planner checkbox (unassigned).
- Session-end hook → save confirm (`vDVSGVpB2vc`) (Forge).
- No-AI cadence list for hive jobs that should never call a model (unassigned).

## Steal / Operate-never

### Machine: Name the slider square → ship only W+T → scope the prompt → pause catch-up
- **Epistemic:** SOURCE (methods) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** trigger (“we should deploy this”) → name machine-vs-cloud and decide-vs-repeat → if decide, keep HITL → if repeat and no AI, script host (Evens deploys) → if session loop, name a kill and assume jitter → scope injected prompts so they cannot send/pay/book/publish → pause local schedules before a long off. Checkable stops: square named; WAT letters listed; kill named; prompt cannot hard-step.
- **Questions / signals:** “What dies if I close the lid?” “What WAT ships?” “Catch-up or discard?”
- **Qualify / frame / objections:** Deploy catalog, not a 24/7 money machine. Objection: I already pay Claude — SDK is another bill.
- **Procedure:** D steps 1–6.
- **Example that proves it:** Terminal keeps crons after clear; desktop does not. Five-day catch-up warning. Comment loop + 24h kill. Lesson: fine print is the machine; sleep is the magnet.
- **Why it works:** Shape mismatch is how you get surprise-send. Conditions: job type is known; first runs trusted in chair. Exceptions: Agent SDK blurs the square; product TTLs may change.
- **Conditions / exceptions:** Cursor + Grok only. Clients parked. Deploy HITL.
- **Operate-never payload:** Auto-deploy; YouTube comment auto-reply; unsupervised A on Modal/Trigger; quote 15/5/25 runs or SDK budget as FACT.
- **Hive run (existing skills only):** `ask-principal` · `input-required-gate` · `agent-as-hire` · `golden-test-loop` · `send-removed` · `coverage-loop`.
- **Source:** `xJ5oz63mIec` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Auto-deploy to Modal / Trigger / Anthropic cloud / VPS
- Auto-reply YouTube comments / any unattended publish
- Install Claude Agent SDK / managed agents as hive OS
- Quote 15/5/25 daily runs / 3-day / 7-day / 30-min jitter as FACT
- Nate Skool guide as a hive SKU
- New hunt ICP. Clients parked. No Normand
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md` (Researcher owns that)

## L. Role-Specific Applications

I manage; I do not flip his three methods on.

- **Done** on a “deploy” ask: slider square named + WAT letters listed + prompt cannot hard-step. “Runs while we sleep” is not done.
- **Delegate without being asked:** Watchdog asks the slider questions; Forge keeps A out of the runtime; Communications does not get a comment loop; Day Planner pauses anything local before a long off.
- **Skeptical review:** Three methods is a shopping cart. Caps, jitter, and catch-up are the honest parts. I will not approve 24/7 because the thumbnail said sleep.
- **One system this take:** a written square + a kill. Not Modal. Not a comment bot.
- Live hunt stays parked. I do not rotate to “deploy week.”
