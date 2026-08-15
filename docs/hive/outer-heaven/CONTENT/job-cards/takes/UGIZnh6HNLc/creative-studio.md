# Creative Studio — UGIZnh6HNLc
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/UGIZnh6HNLc/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/UGIZnh6HNLc/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate: Claude Code × **Trigger.dev** (~1.5h first sit). Beats: Nate B. Jones YouTube check → highlights/quotes/stats (10 min, “not impressive”); ClickUp company card → researcher comment + **@ reply** (Anthropic valuation; Nvidia stock) — non-deterministic tool loop; Code writes the TS, Trigger is always-on (vs Modal: schedules, retries, queue, orchestration, cleaner UI); six tasks: process-video / responder / researcher + clocks (YT, research poll **2 min**, follow-up poll); failed run shows delay+retry; live step timings (~45s / ~22s); folders `src/trigger/...`; Skool `CLAUDE.md` + `trigger-ref.md`; vague **Monday dental website leads** — Code asks dest/geo/API/volume; Yelp Fusion “free” then **Yelp killed free** → SERP; two tools (find / create) + idempotency story; `.env` placeholders; Trigger **dev vs prod**; project ref; keys in Trigger env (dev **and** prod) because `.env` does not push; MCP for Trigger; **never paste secrets in chat**; 25 leads in 9s / five cities; each lead = one create-worker; GitHub private + sync to prod (every master push); manual prod test → **dupes** (Tampa twice) → search-before-create + place ID; oneshot without plan is why; “AI is a black box… you assure the quality.” Plus **3,000**. Visual: Trigger run timeline, ClickUp Nvidia brief, dental list.

## B. Atomic Knowledge

### Laptop writes; cloud runs; `.env` does not travel
- **Claim:** The TS file is local. Always-on is Trigger. Hidden `.env` will not arrive — you paste the same keys into Trigger dests, never into the chat.
- **Evidence:** “those API keys don’t actually get pushed anywhere… practice to never give secrets right here in the chat.”
- **Conditions:** Dev server must stay connected until you promote.
- **Exceptions:** MCP can trigger a test once the secret is in env.
- **Action:** Learn the hole; do not buy Trigger / SERP / Yelp.
- **Confidence:** SOURCE.
- **Source:** `UGIZnh6HNLc` @ UNKNOWN
- **Epistemic:** SOURCE

### Idempotency is a claim until the second run
- **Claim:** He said place-dedupe was free. Prod test made 50 with dupes. Fix = search ClickUp + place ID, and it does not heal the old rows.
- **Evidence:** “I thought that you had worked on item potency… some of the leads were duplicates.”
- **Conditions:** Small search set, oneshot, no plan mode.
- **Exceptions:** Split find/create still lets one side retry — that part held.
- **Action:** Second run is the test; first 25 is a demo.
- **Confidence:** SOURCE.
- **Source:** `UGIZnh6HNLc` @ UNKNOWN
- **Epistemic:** SOURCE

### Poll is not magic pickup
- **Claim:** ClickUp “watches” because a clock task polls (2 min). Sister managed-agents tape: no cron. Here the cron is Trigger’s.
- **Evidence:** “these two run every 2 minutes… I found a new task and I’m going to send that to the company researcher.”
- **Conditions:** Comment-reply is a second scheduled worker.
- **Exceptions:** YouTube 8h digest is a different clock.
- **Action:** Match the trigger (learn); no dental hunt.
- **Confidence:** SOURCE.
- **Source:** `UGIZnh6HNLc` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
One-shot prompt ≠ a plan. Free API dies mid-build. 25 workers for 25 rows is the queue story. You are QA, not the typist. Dev connected ≠ prod live.

## D. Procedures
(Learn.) Ref files in the folder → plan the clock and the unique key → keys in host env not chat → test twice for dupes → GitHub then prod.
Avoid: Trigger / Modal / SERP; dental/nationwide hunt; secrets in chat; 3,000 / 9s as FACT; Plus.

## E. Examples
**Situation:** Nvidia card.  
**Action:** Poll → research → complete + comment; “how is their stock?” → follow-up worker.  
**Lesson:** Conversation is a second task, not memory.

**Situation:** Monday dental.  
**Action:** 25 then 50 with dupes.  
**Lesson:** The still is the duplicate Tampa row.

## F. Decision Rules
- If the unique key was not specified in the plan → expect dupes.
- If a key is in chat → stop; move to env.
- If the job is a new lead list → operate-never (parked).
- If $ / 9s / 3,000 from this tape → UNVERIFIED.

## G. Contrarian
“Core piece of my workflow” after 90 minutes, then a dead Yelp tier and a broken dedupe he blamed on oneshot.

## H. Assumptions
1.5h, 10/20/45 min, 9s, 3,000 UNVERIFIED. On-tape Claude / Trigger / ClickUp. Clients parked.

## I. Questions
Visual of the retry delay? What did the Nate B. Jones digest look like? Place-ID after-fix still?

## J. Connections
- SYSTEM SYNTHESIS → `27Y44JYXZJ8` (no cron on managed; cron here is Trigger).
- SYSTEM SYNTHESIS → `zyvdl__Ywfk` (leads = hunt, parked).
- SYSTEM SYNTHESIS → `oWdJMJp2HgM` (secrets not in chat).

## K. Future-Use
Second-run dedupe + env-not-chat. Unassigned.

## Steal / Operate-never

### Machine: plan the unique key, put secrets in the host, test twice
- **Epistemic:** SOURCE
- **Workflow / loop:** (learn) clock + unique id in the plan → split find/create → keys in host env → run #2 for dupes → promote only after
- **Questions / signals:** `.env` in git? Dev server only? Same Tampa twice?
- **Qualify / frame / objections:** Always-on is a host; pickup is a poll
- **Procedure:** Never dental/nationwide; never secrets in the prompt
- **Example that proves it:** Nvidia comment loop; 25 then duplicate 50
- **Why it works:** Queue retries one tool; QA is the human
- **Conditions / exceptions:** $ UNVERIFIED; clients parked
- **Operate-never payload:** Trigger.dev / SERP; dental hunt; keys in chat
- **Hive run:** `golden-test-loop`; `ask-principal`; no new hunt
- **Source:** `UGIZnh6HNLc` @ UNKNOWN

### Operate-never
- Install Trigger / Modal / Claude Code. New dental hunt. Secrets in chat.
- Quote 9s / 3,000 as FACT. Join Plus.
- Merge `LESSONS-FROM-TAPE.md`. Game-studio / fake 3D / cheap taste / NSFW.

## L. Role-Specific Applications
Video-first: the **live run timeline** and the **duplicate Tampa row** are the plates. Do not ship “agents in the cloud.” ClickUp comment is a still, not a client. HITL. Clients parked.
