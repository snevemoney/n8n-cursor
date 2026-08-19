# Librarian — xJ5oz63mIec
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/xJ5oz63mIec/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/xJ5oz63mIec/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** How to Deploy Your Claude Automations (3 Methods)
**Channel:** Nate Herk | AI Automation
**Kind:** video (~5337 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT unless noted)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. Three ways to run agents while you sleep. Slider: **where it runs** (your machine vs cloud: Anthropic / Modal / Trigger / VPS) × **how deterministic** (script vs autonomous loop). No one best deploy; it depends.
2. Per method he scores: run location, **WAT** (workflow / agent / tools), computer-on, session-on.
3. **Method 1 — loop / cron:** `cron create|list|delete` or `/loop` or natural language. Session-scoped (five tabs = five loop sets; collide only if they write the same file). Desktop: next-in-N-seconds, **3-day** cap, jitter; `/clear` **kills** the cron. Terminal: `/clear` keeps crons; he ran a second cron that injects `/clear` every 5 min (Claude thought it wouldn't work; it did); typical **7-day** expiry. Jitter: recurring tasks may fire **up to 30 minutes late**. Example: YouTube-comment reply loop every 10 min, optional auto-kill at 24h. Pros: zero setup, full agentic loop, skills, self-shutdown. Cons: session open, machine on, expiry, jitter, desktop≠terminal.
4. WAT aside: skills = W, or W+T (LinkedIn post + image API). Loop gives all three. Computer on + session open.
5. Skool resource-guide CTA (free classroom).
6. **Method 2 — desktop scheduled + cloud routines:** Local = machine/app on; close app = dead. Cloud = Anthropic infra; **Max 15 remote runs/day, Pro 5, Team/Enterprise 25** (or extra usage). Both inject a prompt into a Code session (full loop). Example: Skool "wins engagement" (paused; moved to Hermes). Local catch-up: if PC off 5 days, opening the app **replays missed local tasks** — pause if you do not want that. Remote: schedule / GitHub event / API webhook. Cons: cloud **1-hour minimum** interval; local needs machine; **careless prompt scoping causes unwanted actions**.
7. **Method 3 — Modal or Trigger.dev:** Python (Modal) vs TypeScript (Trigger). Schedule or webhook. Dashboard for errors/duration. Analogy: Modal = cron in the cloud; Trigger = durable workflow engine that also crons. WAT here is usually W+T (skill), **not** the agent loop — AI is API/OpenRouter **pay-per-token**, not the subscription. Prefer this when the job needs **no AI**. Agent SDK bonus: Code-without-UI (brain+hands); default **stateless** unless you pass session ID; auto-compact, no `/clear` (new session); needs API key (more expensive). May 13: monthly credit can apply to Agent SDK but it is a **different dedicated budget** (Theo breakdown, on-tape).
8. Asides (not full methods): **managed agents** — he played, "don't love it"; if you already know Code, stay; value is for people who never opened Code. **Hooks** — deterministic event scripts (pre/post tool, session start/end, ping on assistant message). Wants a later hooks masterclass.
Gap: resource-guide file, Theo link. Timestamp UNKNOWN. 24/7 title vs 15 runs/day — do not flatten. Claude / Modal / Trigger / Hermes / Skool / YouTube auto-reply = on-tape.

## B. Atomic Knowledge

### Deploy is a slider, not a crown
- **Claim:** Pick host by (machine vs whose cloud) × (script vs agent). Loop = full WAT, laptop+session. Local schedule = full WAT, app+machine, catch-up risk. Cloud routine = full WAT, laptop off, **capped runs** + 1h floor. Modal/Trigger = usually W+T, always-on, token-billed if AI; Agent SDK adds A at API cost. Skills are W or W+T. Default simplest. Prompt-scope or it acts. Trust ≠ set-and-forget.
- **Reasoning:** "While you sleep" is a title. Caps, jitter, catch-up, and auto-reply are the body.
- **Mechanism:** Name the job → place it on the slider → pick loop / local / remote / script-host → write the never-happen line → watch before unattended.
- **Evidence:** Desktop 3-day vs terminal 7-day; `/clear` kills desktop cron only; 15/5/25; 30-min jitter; 5-day catch-up; comment-reply loop; "don't love" managed agents.
- **Conditions:** Plan caps UNVERIFIED as current product. Caption-only.
- **Exceptions:** Hive stack is Cursor+Grok; do not install Claude/Modal/Trigger as OS.
- **Action:** File slider + WAT + catch-up + jitter + cap. Do not auto-reply YouTube. Do not always-allow. Deploy HITL.
- **Confidence:** high as a deploy taxonomy
- **Source:** `xJ5oz63mIec` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared + demonstrated (transcript-implied)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** Claude said `/clear` cron wouldn't work; it did
- **Speech ≠ behavior:** "run while you sleep" / "24/7" vs 15 remote/day + 1h min + jitter + machine-on loops

## C. Mental Models
WAT. Skill = workflow ± tools. Vending later (`3XIGcM7VICc`) sits on this slider. Parking-lot trust (`ZRb7D6R64hM`). Plus/Skool is the room.

## D. Procedures
1. Draw the two axes before picking a host.
2. Loop only if you can leave the session up and accept jitter/expiry.
3. Prefer terminal if you need `/clear` without killing crons.
4. Pause local schedules before a long shutdown if catch-up would be bad.
5. Cloud routine: treat 15/day and 1h floor as real; webhook if not time-based.
6. Script-host when no reasoning is required.
7. Write "what must never happen" before unattended.
Avoid: YouTube auto-reply; Skool engagement bot; always-allow; Agent SDK as "free on Max."

## E. Examples
**Trash + /clear:** Situation — context rot on a 10-min loop. Action — terminal cron that injects `/clear`. Outcome — both crons survive. Lesson — desktop ≠ terminal; the model can be wrong about its own tools.

**Catch-up:** Situation — PC off 5 days. Action — reopen desktop. Outcome — missed local tasks fire. Lesson — pause is a feature.

## F. Decision Rules
- IF you need exact 9:17 → do not use jittered loop.
- IF the job is every 20 min → loop, not cloud routine.
- IF no AI is required → Modal/Trigger-shaped script (on-tape), not an agent.
- IF the action is a public reply → HITL.
- Refuse: Claude as hive; auto-comment; 24/7 as FACT; sendPrompt.

## G. Contrarian
Against one-best-deploy. Against managed agents if you already live in Code (his). Against MCP-first (CLI first lives on the sibling tape).

## H. Assumptions
Caption-only. Complements `UGIZnh6HNLc` (Trigger build) and `ZRb7D6R64hM` (levels). Do not flatten 24/7 vs 15.

## I. Questions
Exact Max remote cap today? Did the 24h comment-loop ever post a bad reply?

## J. Connections
SYSTEM SYNTHESIS → `UGIZnh6HNLc`; `ZRb7D6R64hM`; `PQBYZQqan2g` (cloud-off); `4OOS96i2gfI`.

## K. Future-Use
Slider + WAT + catch-up + jitter + cap as atoms.

## Steal / Operate-never

### Machine: place the job on the slider; write never-happen; watch before sleep
- **Epistemic:** SOURCE
- **Workflow / loop:** axes → method → never-happen line → watch N runs → only then unattended
- **Questions / signals:** Machine or whose cloud? Script or loop? Cap / jitter / catch-up?
- **Qualify / frame / objections:** Sleep-run is a privilege you earn with a parking-lot routine.
- **Procedure:** D above.
- **Example that proves it:** `/clear` cron; 5-day catch-up; 15/day remote.
- **Why it works:** The constraint is visible before the title.
- **Conditions / exceptions:** Caps UNVERIFIED as current. Hive does not adopt Claude host.
- **Operate-never payload:** Auto YouTube reply; Skool likes; always-allow; 24/7 as FACT; Claude/Modal/Trigger as hive OS.
- **Hive run:** File the slider onto existing always-on desks. Do not add a third host.
- **Source:** `xJ5oz63mIec` @ UNKNOWN

### Operate-never
- Claude / Modal / Trigger / Vapi as hive. Auto-reply comments. Always-allow. Quote 24/7 against the 15-run body. Merge LESSONS. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
Keep 24/7 vs 15 as dissent, not a flatten. Map WAT onto hive skills (W or W+T). Hard steps HITL.
