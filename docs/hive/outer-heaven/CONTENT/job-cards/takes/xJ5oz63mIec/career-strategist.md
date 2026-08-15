# Career Strategist — xJ5oz63mIec
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/xJ5oz63mIec/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/xJ5oz63mIec/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Caption ingest (~5337 words). Beats in order: (1) three ways to deploy so agents run while you sleep (2) slider: where it runs (your machine vs cloud) × how deterministic (full agent loop vs same-every-time script) — no single best (3) WAT: workflow / agent / tools; skills sit on W+T (4) Method 1 — Claude Code **loop/cron** (`cron create/list/delete`): session-scoped; desktop ~3-day cap + jitter; `/clear` **kills** desktop crons but **keeps** them in terminal; he runs loops in terminal; second cron to `/clear` against context rot; computer + session must stay up; you get full WAT (5) Method 2 — desktop scheduled tasks vs **cloud routines**: local dies if app closes; remote runs on Anthropic cloud; Max 15 remote runs/day, Pro 5, Team/Enterprise 25 (his telling); injects a prompt into a Claude Code session (full agent on a timer); env vars different because it is a cloud clone of the repo; he moved a Skool-wins routine to Hermes (6) Method 3 — Modal (Python serverless cron) or trigger.dev (TS durable workflows that also cron): you deploy W+T (the script), not the sitting-with-you agent — self-heal goes away, which he calls good (predictable); Claude Code writes the script + env; optional path that keeps A (7) aside: Anthropic managed agents (newer, their cloud). Visual-only: routines UI — unobserved. Gap: no uptime/error ledger.

## B. Atomic Knowledge

### Pick deploy by run-place × determinism, not by fashion
- **Claim:** Best method depends on the automation. Laptop loop = full agent, machine must stay on. Anthropic remote routine = full agent, run caps. Modal/Trigger = usually the compiled workflow+tools, no mid-run agent — behaves like traditional automation, which he wants after battle-test.
- **Reasoning:** Self-heal is real *while you are in the session*. After deploy, predictability is the feature (`vFepZE_wrfg` train-track).
- **Mechanism:** Slider + WAT. Skills = W, or W+T.
- **Evidence:** “there’s not one best way to deploy an automation. It depends on the type of automation.”
- **Conditions:** You know if the job needs a model at run time.
- **Exceptions:** He shows a Modal/Trigger option that keeps A — more non-deterministic, more risk.
- **Action:** Do not deploy while-you-sleep send. Prefer vending machines unattended (`3XIGcM7VICc`).
- **Confidence:** high as a map.
- **Source:** `xJ5oz63mIec`
- **Epistemic:** SOURCE

### Terminal loops survive `/clear`; desktop loops do not
- **Claim:** Session-scoped crons. Desktop: `/clear` or close tab kills them; ~3-day (maybe 7) life; first fire is jittered. Terminal: `/clear` keeps crons if the process lives; he uses that plus a `/clear` cron to fight rot.
- **Reasoning:** Context rot (`iTY8Q449YNQ`) vs keep-alive.
- **Mechanism:** `cron create` via NL or `/loop`.
- **Evidence:** trash-reminder after `/clear` still listed in terminal, not desktop.
- **Conditions:** You do not terminate the terminal session.
- **Exceptions:** Shared files = interference across sessions.
- **Action:** Laptop-must-stay-on is not a career strategy. Do not leave a send-loop running.
- **Confidence:** high for his observed difference.
- **Source:** `xJ5oz63mIec`
- **Epistemic:** SOURCE

### Remote routines are metered; compiled cloud is W+T
- **Claim:** Anthropic cloud routines: 15/5/25 per day by plan (UNVERIFIED). Modal = cron-in-the-cloud (Python). trigger.dev = durable engine that also crons (TS). Env vars must live on that host. Managed agents = another Anthropic cloud SKU.
- **Reasoning:** Clone-in-the-cloud ≠ your laptop keys.
- **Mechanism:** Prompt injection on a timer vs push a function.
- **Evidence:** Max 15 remote runs/day (his screen).
- **Conditions:** Paid plan for remote. Secrets handled as env, not pasted in chat.
- **Exceptions:** He is not doing a full Modal lesson here (other videos).
- **Action:** Any deploy/pay is HITL. Do not push hive automations to Modal/Trigger.
- **Confidence:** medium on plan numbers.
- **Source:** `xJ5oz63mIec`
- **Epistemic:** SOURCE (map) + UNVERIFIED (quotas)

## C. Mental Models
Sleep-run is a slider, not a badge. Full agent on a laptop is a space heater. Remote agent is a quota. Compiled script is a train track. WAT tells you what you actually shipped. Jitter exists so everyone does not fire on :00.

## D. Procedures
1. Ask: must the machine be on? Must a model decide at run time?
2. If yes/yes and you are iterating: laptop loop in terminal (his).
3. If yes-agent / no-laptop: cloud routine, watch the daily cap.
4. If no-agent at run: Modal/Trigger script after battle-test.
5. Put secrets in host env. Do not `/clear` on desktop if you need the cron.
6. Do not unattended-send.

Questions: WAT — did we deploy A? What happens if the laptop lid closes? What is the daily cap?

Signals: desktop `/clear` killed the job; “it will heal itself in prod” (he says it will not).

## E. Examples
**Situation:** Trash reminder every 10 min.  
**Action:** Desktop vs terminal `/clear` test.  
**Reasoning:** Session-scope + host difference.  
**Outcome:** Terminal keeps the cron.  
**Lesson:** Host semantics matter more than the NL.

**Situation:** Skool wins engagement routine.  
**Action:** He paused it and moved to Hermes.  
**Reasoning:** Unstated.  
**Outcome:** On-tape migration.  
**Lesson:** Do not copy a community-engagement cron.

## F. Decision Rules
- If it emails/posts, it is not a sleep-loop without HITL.
- If you need self-heal, you are still in the build seat, not prod.
- If the laptop must stay on, that is not leverage — it is a babysitter.
- If you only need W+T, do not pay for a full remote agent.

## G. Contrarian
Rejects one-best-deploy. Rejects “deployed agent still self-heals.” Skills are not a fourth WAT letter. Terminal ≠ desktop for the same `/clear`.

## H. Assumptions
**Theirs:** 15/5/25 caps; 3 vs 7 day; Modal/Trigger are the grown-up hosts. **Ours:** Quotas UNVERIFIED. Claude/Modal/Trigger/Hermes/Skool on-tape. Falsifier: a job that *must* stay fully agentic in prod (he treats that as the risky option).

## I. Questions
- What failed on the Skool routine that moved to Hermes?
- How often do laptop loops die on sleep/lid?

## J. Connections
- SYSTEM SYNTHESIS → `vFepZE_wrfg` (WAT; deploy W+T).
- SYSTEM SYNTHESIS → `3XIGcM7VICc` (vending vs slot).
- SYSTEM SYNTHESIS → `iTY8Q449YNQ` (context rot / clear).
- Stack Cursor + Grok. No Modal/Trigger deploy.

## K. Future-Use
Unassigned: run-place × determinism as a Day Planner check before anyone says “just cron it.” Not a 10-minute loop.

## Steal / Operate-never

### Machine: slider first — then maybe a host
- **Epistemic:** SOURCE
- **Workflow / loop:** name run-place and determinism → if unattended send, stop → if W+T only, compiled host after test → if agent-on-timer, know the cap and the lid
- **Questions / signals:** Did we deploy A? Lid-close kill? Daily cap?
- **Qualify / frame / objections:** Sleep-run is not automatically better.
- **Procedure:** Secrets in env. HITL on deploy/pay. No community-engagement cron.
- **Example that proves it:** `/clear` split (E); WAT laptop full-stack (B).
- **Why it works:** Prod without the sitting agent is a track, not a crew (B/C).
- **Conditions / exceptions:** Optional A-on-Modal is the risk path.
- **Operate-never payload:** Deploying a send loop; paying Modal/Trigger; quoting 15 runs as FACT; Always-Allow cron.
- **Hive run (existing skills only):** `ask-principal` · `3XIGcM7VICc` vending default
- **Source:** `xJ5oz63mIec`

### Operate-never
- Deploy / pay cloud hosts as the operator.
- Unattended email, Slack, or Skool engagement.
- Install on-tape vendors. Cursor + Grok only.
- Auto-write `SKILL.md`. Merge `LESSONS-FROM-TAPE.md`.

## L. Role-Specific Applications
Employment covers baseline. Career steal is the slider (where it runs × needs a model) and “self-heal dies at deploy.” Do not stand up sleep-loops or buy Modal. Unattended send stays operate-never. Clients parked.
