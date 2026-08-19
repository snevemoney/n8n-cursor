# Day Planner — UGIZnh6HNLc
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/UGIZnh6HNLc/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/UGIZnh6HNLc/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate: **Claude Code + Trigger.dev** “easiest host.” Beats: 1.5h first open; YouTube digest (Nate B. Jones) 10 min; ClickUp company research agent (Anthropic, then Nvidia) + @ mention follow-up; vs Modal: schedules, retries, queue, UI; tasks vs scheduled (2 min / 8h); failed run retries; live step times; new project + Skool `claude.md` + `trigger-ref.md`; vague **Monday dental-website leads** — it asks dest/location/API; Yelp Fusion “free” then **Yelp killed free** → SERP API; split find vs create (retry one); idempotency claimed; `.env` local, **paste same vars into Trigger dev+prod**; never secrets in chat (placeholder); Trigger MCP + secret key in env; test: 25 leads, 25 create-runs, **9 seconds**; local dev server must stay up; GitHub sync → prod (`.env` excluded); manual prod test → **duplicates** (50 rows); place-id search-before-create; one-shot without plan = weak search + bad dedupe; **you QA the black box**. Plus **3k**. Caption-only. Timestamp UNKNOWN. Dental list = **hunt**.

## B. Atomic Knowledge
### Secrets never in chat; split find/create; dedupe is a test; plan before the host
- **Claim:** Hosting is “push the file to a scheduler with retries.” The danger is the **job** (25 dentists) and the **leak** (keys in chat/Git). Claimed idempotency failed until a second test. Dev≠prod (local tunnel vs GitHub).
- **Reasoning:** One fat graph dies on one fail; 25 workers need a unique key. Vague one-shot skips the plan.
- **Mechanism:** Plan → env only → split tasks → run twice looking for dupes → only then think about a schedule (we still don’t hunt).
- **Evidence:** “never give secrets right here in the chat.” / “some of the leads were duplicates.”
- **Conditions:** A scheduler you already own (we don’t add Trigger.dev).
- **Exceptions:** We do not dental-hunt, Skool-md, or Claude.
- **Action:** Steal env-not-chat + split-retry + dedupe-test + plan-first. Do not Trigger.dev. Do not hunt.
- **Confidence:** high as the hygiene.
- **Source:** `UGIZnh6HNLc` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared + demonstrated (speech)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** Yelp free dead; dupes; many mystery runs
- **Speech ≠ behavior:** “works perfectly 25 in 9s” vs later dupes

## C. Mental Models
Always-on is the pitch. Priority: ship to cloud. We care about leak + hunt. Uncertainty: 1.5h / Plus 3k.

## D. Procedures
1. Plan the unique key before the scheduler.
2. Keys in env / host secrets — never chat, never git.
3. Split fetch vs write so one retry doesn’t rerun the world.
4. Run twice; if dupes, you’re not done.
5. Local “connected” ≠ production.
Avoid: Trigger.dev; dental list; Skool files; Claude; Plus.

## E. Examples
**Yelp → SERP:** Situation → “don’t want to pay.” Action → Yelp dead. Reasoning → vendor tiers die. Outcome → paid SERP. Lesson → steal “free API” is a risk.

**Dupes:** Situation → second prod test. Action → 50 rows. Reasoning → weak unique. Outcome → place-id fix. Lesson → steal run-twice.

## F. Decision Rules
- IF the scheduled job is a lead list → never (parked).
- IF a key is about to hit chat → stop.
- IF first run “perfect” → run again for dupes.
- IF only local tunnel is up → not hosted.

## G. Contrarian
Rejects Modal-as-default (his). Field: n8n cron. He: Trigger.dev. We reject the host and the hunt.

## H. Assumptions
Theirs: 25 dentists is a demo. Ours: hunt. Falsifier: a Monday cron we turn on. Survivorship: one afternoon.

## I. Questions
Same ClickUp research as other tapes? Modal tape id?

## J. Connections
- SYSTEM SYNTHESIS → `i4Q8wHZNPBU` (tokenless cron) · `send-removed` · `golden-test-loop`.

## K. Future-Use
Env-not-chat. Dedupe-test. Unassigned Trigger.dev.

## Steal / Operate-never

### Machine: plan + env-not-chat → split fetch/write → run twice for dupes; never schedule a hunt
- **Epistemic:** SOURCE
- **Workflow / loop:** write unique key → secrets in env → split tasks → two runs → stop (no Monday cron)
- **Questions / signals:** Key in chat? “Perfect” first run? Lead list?
- **Qualify / frame / objections:** Dental Monday cron is the fail. Dedupe-test is the pass.
- **Procedure:** No Trigger.dev. No Claude. No Skool. No hunt.
- **Example that proves it:** Situation → 25 then 50. Action → place-id. Reasoning → claimed idempotent. Outcome → still needed a fix. Lesson → steal run-twice.
- **Why it works:** A second run is checkable; “automate anything” is not.
- **Conditions / exceptions:** Clients parked.
- **Operate-never payload:** Trigger.dev; Claude; dental hunt; secrets in chat; Plus; Skool md as hive.
- **Hive run (existing skills only):** `golden-test-loop` · `send-removed`.
- **Source:** `UGIZnh6HNLc` @ UNKNOWN

### Operate-never
- Trigger.dev / Claude / hunt / secrets-in-chat / Plus.
- Send / pay / deploy / book / publish.

## L. Role-Specific Applications
**One next:** `coverage-loop` score this packet as env-not-chat + dedupe-test. Clients parked.
