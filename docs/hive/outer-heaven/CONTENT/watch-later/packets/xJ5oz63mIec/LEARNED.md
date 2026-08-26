# LEARNED — xJ5oz63mIec
Protocol: deep-video-learning
Status: filled
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/xJ5oz63mIec/full.txt`
**Desks merged:** Researcher 2026-08-14. Librarian not yet. Keep later dissent as labeled rows. Do not flatten.
**ICP:** parked. Tape $ UNVERIFIED. No new `icp_id`.
**Note:** Derived from Researcher A–K + Steal after a full `full.txt` walk. Other desks add labeled rows; do not overwrite dissent.

## A. Source Map
Caption-only (`full.txt`, ~553 lines). Title: How to Deploy Your Claude Automations (3 Methods). Visual/click **UNKNOWN**. Timestamp **UNKNOWN**. Beats: (1) Slider: **where it runs** (your machine vs cloud: Anthropic / Modal / Trigger / VPS) × **how deterministic** (full agent loop vs same-every-time script). No one best. Per method: run-where, **WAT** (workflow / agent / tools), machine-on?, session-on? Skills = W, or W+T. (2) **Method 1 — loop.** `cron create/list/delete`. Session-scoped (five tabs = five loop worlds unless same file). NL or `/loop`. Desktop: next-in-Xs, **3-day** cap, jitter; `/clear` **kills** cron. Terminal: `/clear` keeps crons; he runs a second cron that injects `/clear` every 5 min (Claude thought it wouldn’t work; it did); **7-day** cap. Jitter up to **30 min** after scheduled (anti-thundering-herd). Example: every 10 min reply YouTube comments from transcript, kill at 24h. Pros: zero setup, full WAT, explicit skills, self-stop, slash in-loop. Cons: session open, machine on, 7-day, interval+jitter, desktop≠terminal. (3) **Method 2 — desktop scheduled + cloud routines.** Local = machine/app on; **catch-up** after days off (pause if you don’t want a burst). Cloud = Anthropic infra; machine off OK; **Max 15/day**, Pro 5, team/enterprise 25, else extra usage. 1-hour min interval (use loop if faster). Prompt inject into a Code session (full WAT). Cloud = repo clone + different env. API/GitHub-event/schedule for remote. Careless prompt = unwanted actions. Local: machine+app on, new session (not the old tab). Cloud: nothing on. (4) **Method 3 — Modal / Trigger.** You write Python (Modal) or TS (Trigger); schedule or webhook; dashboard. Modal = cron-in-the-cloud / serverless Python. Trigger = durable workflow engine that also crons; more “agentic” split. WAT here is usually **W+T only** (no A); AI if any is **API $** not the Claude sub — or no AI at all (his preference for this bucket). Bonus: **Claude Agent SDK** on Modal/Trigger restores A (brain+hands vs raw chat API). SDK default **stateless**; pass session id; auto-compact; no `/clear` (new session). Cannot use Claude sub — API key. May 13 note: monthly credit can apply to Agent SDK as a **different dedicated budget** (Theo breakdown). (5) Not methods: **managed agents** — he tried, doesn’t love; for people who never opened Code. **Hooks** — deterministic event scripts (pre/post tool, session start/end, message → noise). Skool guide. **Do not flatten** vs `UGIZnh6HNLc` (Trigger deep) · `vfWTyEreOEc` (loop/routines as features) · `PQBYZQqan2g` (Grok Bot cloud). Caps / 15/day UNVERIFIED.

## B. Atomic Knowledge

### Chooser is a 2-axis slider, not a winner
- **Claim:** Pick by (machine vs whose-cloud) × (script vs agent). Loop = machine + full WAT + session. Local schedule = machine + full WAT + new session. Cloud routine = Anthropic + full WAT + caps. Modal/Trigger = their cloud + usually W+T + API $ if AI.
- **Reasoning:** Type of automation decides; thumbnail “easiest” is a lie across tapes.
- **Mechanism:** WAT map + on/off table he returns to.
- **Evidence:** Comment-reply loop; Skool wins local (paused → Hermes); 15/day Max spoken.
- **Conditions:** Caps / jitter / 3-vs-7-day UNVERIFIED beyond speech.
- **Exceptions:** Agent SDK on Modal/Trigger adds A but API-bills.
- **Action:** Steal the slider. Keep Trigger-deep tape separate.
- **Confidence:** high as the chooser.
- **Source:** `xJ5oz63mIec` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** `/clear` cron — model said no, he proved yes (terminal)
- **Speech ≠ behavior:** “simple” vs four products + SDK + hooks + managed.

### Terminal loop survives /clear; desktop does not
- **Claim:** Desktop `/clear` kills crons; terminal does not. Desktop showed 3-day; terminal 7-day. Jitter ≤30 min. Second cron can inject `/clear` to fight context rot.
- **Reasoning:** Session-scoped scheduler lives in the process.
- **Mechanism:** cron create/list/delete; close tab = death.
- **Evidence:** Trash reminder still listed after terminal `/clear`.
- **Conditions:** Machine must stay on. Auto-comment loop is operate-never for hive.
- **Exceptions:** Same-file writes still collide across sessions.
- **Action:** Steal terminal-vs-desktop cron scar. No 10-min public reply bot.
- **Confidence:** high as the scar.
- **Source:** `xJ5oz63mIec` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** Claude “clear cron won’t work”
- **Speech ≠ behavior:** “zero setup” vs jitter + expiry + desktop trap.

### Cloud routine ≠ Modal script; SDK is a paid A
- **Claim:** Anthropic cloud routine = prompt inject + daily cap + 1h min. Modal/Trigger script often has no agent (cheap, deterministic). Agent SDK = Code-like loop, stateless unless session id, **not** the subscription (dedicated budget footnote).
- **Reasoning:** Hands cost tokens; scripts should not pretend to be Code.
- **Mechanism:** Env on their dashboard; webhook/GitHub event optional.
- **Evidence:** 15/5/25 spoken; local catch-up warning; Theo link.
- **Conditions:** May 13 credit change — verify. Hive: no Anthropic/Modal/Trigger spend.
- **Exceptions:** Managed agents exist; he rejects for Code users.
- **Action:** Steal “script host vs prompt inject vs SDK.” Caps HITL.
- **Confidence:** high as the map; $ UNVERIFIED.
- **Source:** `xJ5oz63mIec` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** managed agents “don’t love”
- **Speech ≠ behavior:** “run while you sleep” vs Pro 5/day and machine-on loops.

## C. Mental Models
Deploy is a slider. WAT tells you what you actually shipped. Skills are W or W+T. Jitter and caps are the real SLA. Catch-up can stampede. Stateless SDK until you pass a session. You are still the prompt-scope cop.

## D. Procedures
1. Place the job on the slider (where × determinism).
2. Need <1h and full agent + laptop on → terminal loop (+ optional `/clear` cron).
3. Need machine-off + full agent → cloud routine; count the daily cap.
4. Need durable/no-AI → Modal/Trigger script; env on host; GitHub.
5. Need agent on their cloud → Agent SDK + session id + API budget.
6. Pause local schedules before a long off if catch-up would be bad.
7. Hive: no auto-comment; no vendor spend.

## E. Examples
- **Situation:** New upload comments. **Action:** 10-min loop, kill 24h. **Outcome:** spoken. **Lesson:** and operate-never for hive send.
- **Situation:** `/clear` on desktop vs terminal. **Action:** cron list. **Outcome:** dead vs alive. **Lesson:** use terminal for loops.
- **Situation:** Computer off 5 days. **Action:** reopen desktop. **Outcome:** local tasks catch up. **Lesson:** pause first.
- **Situation:** Managed agents. **Action:** tried. **Outcome:** stick with Code. **Lesson:** wrapper ≠ better.

## F. Decision Rules
- IF desktop loop + `/clear` → you just killed it.
- IF need every 20 min on Anthropic cloud → you can’t (1h min); use loop.
- IF no AI needed → don’t pay token host.
- IF SDK → not the weekly Code bar.
- Refuse: auto-reply YouTube; quote 15/day as FACT; new ICP.

## G. Contrarian
Three methods plus SDK plus hooks plus managed. Skool guide is the funnel. Auto-comment is the ugly “full WAT” demo.

## H. Assumptions
3-day vs 7-day, 30-min jitter, 15/5/25, May 13 credit = **UNVERIFIED**.
**Desk dissent:** Trigger-easiest (`UGIZnh6HNLc`) vs this chooser. Grok Bot (`PQBYZQqan2g`) is a fourth “whose cloud.” Hive Cursor+Grok.

## I. Questions
- Did desktop 3-day update to 7 after relaunch?
- Same comment-bot as another tape?
- Agent SDK credit = usable for hive? (no — don’t)

## J. Connections
- **SYSTEM SYNTHESIS:** `UGIZnh6HNLc` · `vfWTyEreOEc` · `PQBYZQqan2g` · `/loop` family. Skills: `workflow-compiler` · `golden-test-loop` · `ask-principal` · `send-removed`.

## K. Future-Use
2-axis deploy slider. WAT. Terminal-cron-survives-clear. Jitter. Catch-up stampede. Script-vs-inject-vs-SDK. Daily caps.

## Stolen machines

### Machine: where-x-determinism-deploy-chooser
- **Epistemic:** SOURCE
- **Workflow / loop:** place on slider → pick loop / local schedule / Anthropic routine / script host / SDK → set env on the place that actually runs → watch caps/jitter/catch-up → HITL anything public
- **Questions / signals:** Machine off? Need A? Interval <1h? Will `/clear` die? Catch-up wanted?
- **Qualify / frame / objections:** No single easiest. Trigger tape is the deep host how.
- **Procedure:** D.
- **Example that proves it:** terminal vs desktop `/clear`; 15/day; comment loop; managed-agents reject.
- **Why it works:** You stop buying the wrong cloud for the job.
- **Conditions / exceptions:** All caps UNVERIFIED. Hive: no those clouds required.
- **Operate-never payload:** Auto-comment; Anthropic/Modal/Trigger spend as “must”; new ICP.
- **Hive run (existing skills only):** `workflow-compiler` · `golden-test-loop` · `ask-principal` · `send-removed`
- **Source:** `xJ5oz63mIec` @ UNKNOWN

**Operate-never**
- Auto-reply public comments. Buy a host because the slider exists. New `icp_id`. Deploy unattended.

## THINK / BEHAVE / TRICKS / USE
**Added:** 2026-08-14 last-mile. Caption-only. Visual/click UNKNOWN unless `watch.json`. Do not flatten this speaker into a hive personality.

### THINK
Decision order, what they ask before they build, what they ignore, how they choose tools, when they kill vs continue — see §C Mental Models and §F Decision Rules above. Desk that must think this way: see TAPE-WIRE-NOTES.

### BEHAVE
What they repeatedly check, skip, retry, and speech≠behavior — see §A / §E / speech≠behavior rows. Sequence-from-speech only. `multimodal-youtube-learning`: no invented clicks.

### TRICKS
Do / don’t and implicit shortcuts — see §D Procedures and Stolen machines. Shown system (files, loops, UI, offer, CTA) mapped to Cursor+Grok primitives on the named workflow. Caption-only = transcript-implied / unobserved.

### USE
Each trick lands as a desk **action** on Cursor + Grok Bot (not a quote). Operate-never on their vendors. Reproduce card: `job-cards/takes/_knowledge-use/{{slug}}.md`.
