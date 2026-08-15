# Librarian — UGIZnh6HNLc
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/UGIZnh6HNLc/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/UGIZnh6HNLc/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** The EASIEST Way to Host Your Claude Code Agents
**Channel:** Nate Herk | AI Automation
**Kind:** video (~5267 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT unless noted)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. Opened Trigger.dev "~an hour and a half ago"; already has automations. Combo Claude Code + Trigger will be "core" internally and for clients (on-tape).
2. Demo 1: scrape Nate B. Jones YouTube — new video → highlights / quotes / stats; else nothing. "~10 minutes," "not that impressive."
3. Demo 2: ClickUp company task → researcher agent comments; follow-up chat (Anthropic valuation; live Nvidia + "how is their stock"). Non-deterministic: tools + "when is good enough." Live: six tasks — process video, responder, researcher; scheduled YouTube checker / research polar / follow-up polar (2 min / 2 min / 8 hours). Failed polar showed auto-retry. Live researcher: search-web twice then a third time, then two read-URL; ~45s. Follow-up ~22s. All one-shot in "~45 minutes."
4. Why Trigger over Modal: scheduled runs, retries, queuing, orchestration, cleaner UI. Shape: Code writes TypeScript in `src/trigger/` → get it off the laptop onto Trigger so it runs always.
5. Greenfield: blank `trigger-demo` in VS Code. Free Skool classroom: `claude.md` + `trigger-ref.md` (API/TS patterns; CLAUDE.md points at the ref). Vague Monday dental-website-lead hunt nationwide, ClickUp, 25 leads, no paid APIs. It interviews (delivery, location, SERP). Plan: Yelp Fusion (claimed free) find-leads + create-lead (retry isolation + claimed idempotency). Yelp killed free tier → SER API. `.env` placeholders; keys never in chat. Dev vs prod. Trigger project ref. Env vars must be pasted into Trigger for **both** development and production (dotfiles do not push). Trigger MCP to test. Secret key → `.env` not chat. 25 leads / 9 seconds / five cities (his). Create-lead fired once per lead.
6. Local dev server must stay connected or scheduled tasks die. Push via GitHub → Trigger syncs master to production. `.env` excluded. Manual deploy fallback. Prod test: Monday 8am schedule so he force-runs — **duplicates appear**. He asks it to fix idempotency (ClickUp search + place ID). Search criteria too small; after more plan-mode work, 48 rows with some filtered. Lesson: one-shot looked good; plan harder. Close: AI is a black box; you no longer write the code, you **assure the quality**. Plus / 3,000 UNVERIFIED.
Gap: graphs, MCP file, exact retry delay. Timestamp UNKNOWN. Claude / Trigger / Skool / Plus / dental ICP / ClickUp hunt = on-tape.

## B. Atomic Knowledge

### Host is not the lesson; QA is
- **Claim:** Code writes the TS; Trigger hosts always-on. The durable lesson is you are the quality assurer of a black box that runs differently every time. Interview before build. Split find vs create so one task can retry. Secrets stay in `.env` + host env (dev **and** prod). Dev connection ≠ production. Claimed idempotency failed live; plan mode after the miss.
- **Reasoning:** Always-on without a named stop is a send door. Duplicates after a "works perfectly" line is the tape proving the close.
- **Mechanism:** CLAUDE.md + trigger-ref → vague ask → questions → two tasks → `.env` local + host env both envs → GitHub sync → force-run → watch for dupes → plan-mode fix → you approve prod.
- **Evidence:** Yelp-dead pivot; 25 creates; 50-with-dupes; "you having to be the person that assures the quality."
- **Conditions:** 10/20/45 min, 9 seconds, 3,000 UNVERIFIED. One-shot ≠ replayable.
- **Exceptions:** Hive already ships from this repo; do not add Trigger as cloud OS.
- **Action:** File QA-assurer + env-both-envs + claimed-idempotency-failed. Do not install Trigger. Do not hunt dental. Deploy stays HITL.
- **Confidence:** high as a host-vs-QA machine
- **Source:** `UGIZnh6HNLc` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared + demonstrated (transcript-implied)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** Yelp free dead; env not on host; many test runs; duplicates after "idempotent"
- **Speech ≠ behavior:** "automatically doing the item potency" vs live duplicates; "10 minutes" vs OAuth + env + GitHub + plan-mode

## C. Mental Models
Local Code sleeps; cloud host does not. Interview > one-shot. Two tools beat one brittle script. Black box + you are QA. Plus is the room.

## D. Procedures
1. Drop project rules + host API ref before a vague ask.
2. Let it interview; answer delivery / volume / paid-vs-free.
3. Split find vs write so retries isolate.
4. Keys in `.env` and host env for **dev and prod**. Never paste secrets in chat.
5. Test in dev with the connection open; prod only after GitHub sync you approved.
6. Force-run and look for duplicates before trusting "idempotent."
Avoid: one-shot to prod; dental/ClickUp hunt; Trigger as hive; auto-outreach.

## E. Examples
**Yelp → SER:** Situation — "I don't want to pay." Action — it planned Yelp Fusion. Outcome — free tier dead, swap SER. Lesson — the interview still guesses APIs; you still own keys and cost.

**Idempotency miss:** Situation — he believed dedupe was automatic. Action — prod-shaped test. Outcome — duplicates; place-ID search after the fact. Lesson — "works perfectly" is not a stop.

## F. Decision Rules
- IF it claims idempotent → force-run twice before prod.
- IF a secret is about to enter chat → `.env` only.
- IF the laptop must stay open for the schedule → you are not hosted yet.
- Refuse: Trigger/Modal/Claude as hive; dental ICP; 10/20/45/3000 as FACT; sendPrompt.

## G. Contrarian
Against Modal-as-default (his: Trigger more flexible). Against one-shot-as-proof (the tape then falsifies it).

## H. Assumptions
Caption-only. Complements `xJ5oz63mIec` (deploy slider) and `4OOS96i2gfI` (climb). Do not flatten "core for clients" into a hive install.

## I. Questions
What was the exact polar fail? Did place-ID hold on a third run?

## J. Connections
SYSTEM SYNTHESIS → `xJ5oz63mIec`; `golden-test-loop`; `ask-principal`; Watchdog.

## K. Future-Use
QA-assurer + env-both-envs + claimed-idempotency-failed as atoms.

## Steal / Operate-never

### Machine: interview, split write, prove idempotency, you are QA
- **Epistemic:** SOURCE
- **Workflow / loop:** rules+ref → interview → split tasks → secrets in two places → dev prove → watch dupes → you approve GitHub/prod
- **Questions / signals:** Dev connected or hosted? Both envs have keys? Ran twice?
- **Qualify / frame / objections:** Always-on is plumbing. The product is a named stop you checked.
- **Procedure:** D above.
- **Example that proves it:** 25 "perfect" then 50 with dupes.
- **Why it works:** Isolation + a human who does not believe the first green run.
- **Conditions / exceptions:** Times and 3,000 UNVERIFIED. Hive does not install Trigger.
- **Operate-never payload:** Trigger/Modal as hive; dental hunt; auto-outreach; secrets in chat; deploy without HITL.
- **Hive run:** File the QA line onto Watchdog. Do not host here.
- **Source:** `UGIZnh6HNLc` @ UNKNOWN

### Operate-never
- Install Trigger.dev / Modal / Claude Code as hive host. 2-minute polars that send. Dental/ClickUp mill. Quote 10/20/45/3000 as FACT. Merge LESSONS. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
Upgrade the old short take: host-vs-QA stays; add interview / env-both-envs / idempotency-failed. Do not install Trigger. Hard steps HITL.
