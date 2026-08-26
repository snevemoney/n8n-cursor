# Forge — UGIZnh6HNLc
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/UGIZnh6HNLc/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/UGIZnh6HNLc/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate Herk **Claude Code + Trigger.dev** (~90 min first use). Beats: YouTube digest (Nate B. Jones: highlights / quotes / stats or no-op); ClickUp watcher → company research comment + follow-up chat (Enthropic / Nvidia). Claude Code = English → TypeScript project; Trigger.dev = always-on cloud (vs **Modal**: schedules, retries, queues, orchestration, cleaner UI — his claim). Six tasks: process-video / responder / researcher + clocks (YouTube check, research polar, follow-up polar; 2 min / 8 hr). Live: add “Nvidia” → polar → researcher (search web ×3, read URL ×2, ~45s) → complete + brief; “how is their stock” → responder ~22s. Repo shape: `src/trigger/` + workflow folders. Greenfield: Skool `claude.md` + `trigger-ref.md`; vague “Monday dental-practice website leads” → it asks delivery / geo / SERP; he wants **no paid sub**; plan = Yelp Fusion (then **Yelp killed free tier** → SER API) + ClickUp list, 25 leads, find vs create split, idempotency. Secrets in `.env` **and** Trigger env (dev **and** prod) — dots don’t ship. Never paste keys in chat. Trigger MCP for test payloads. One-shot: 25 leads / 9s / five cities; create-lead ×25. Local `dev` dies when the laptop connection dies → GitHub private repo → Trigger deploy-on-push. Dedup failed first prod-shaped test (dupes in 50); plan-mode + place-id search-before-create. Close: AI is a black box; you QA; AIS Plus CTA. Timestamp UNKNOWN. Claude Code / Trigger.dev / Modal / Yelp / SER API / Skool on-tape. Caption-only: UIs unobserved beyond his words.

## B. Atomic Knowledge

### Laptop writes the job; the cloud runs it; secrets never ride the chat or the commit
- **Claim:** Claude Code authors TS; Trigger.dev is the always-on runner. `.env` stays local — paste the same block into Trigger env (dev+prod). GitHub is the prod bridge. One-shot without a plan ships dupes.
- **Reasoning:** Local server ≠ production. Hidden-dot files don’t deploy. Yelp “free” died mid-build. Dedup was claimed then failed.
- **Mechanism:** ref files → questions → split tasks (find / create) → test in dev → env in Trigger → private GitHub → deploy-on-push → fix with a plan.
- **Evidence:** Nvidia ~45s brief; 25 dental leads; duplicate rows until place-id.
- **Conditions:** His Skool refs + Trigger MCP. Yelp/SER are *his* lead mill.
- **Exceptions:** Same prompt ≠ same build. Tape times UNVERIFIED.
- **Action:** Steal env-in-two-places + never-chat-secrets + plan-before-dedup. Do not install Trigger.dev / Claude Code / Modal. Do not scrape Yelp/SER for outbound. Cursor stays.
- **Confidence:** high on secret/deploy spine; vendor as optional.
- **Source:** `UGIZnh6HNLc` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Author ≠ runner. Dev connection dies. Free API dies. Claimed idempotency ≠ proven. You are QA, not the typist.

## D. Procedures
1. Don’t install Trigger.dev / Claude Code / Modal. 2. Don’t paste secrets in chat. 3. Don’t scrape Yelp/SER / ClickUp-outbound. 4. Don’t one-shot a lead mill. 5. Don’t send AIS Plus / Skool.

## E. Examples
**Situation:** Monday dental leads, “no paid API.”  
**Action:** Yelp → dead → SER API; 25 into ClickUp.  
**Reasoning:** Vendor floor moved.  
**Outcome:** Leads landed; dupes until a plan.  
**Lesson:** Pain-now + plan; don’t install this stack.

**Situation:** Keys in `.env` only.  
**Action:** Paste the block into Trigger env (dev+prod).  
**Reasoning:** Dots don’t ship.  
**Outcome:** Runs can actually auth.  
**Lesson:** Two places or it fails closed.

## F. Decision Rules
- If the job is always-on → something must run off-laptop (ours already can; don’t add Trigger).
- If a secret is about to hit chat or GitHub → stop.
- If dedup is “automatic” and untested → assume it isn’t.
- If the demo is outbound lead-gen → operate-never.

## G. Contrarian
Field one-shots in the laptop and calls it an agent. He still had to talk it through failures and push to a runner.

## H. Assumptions
Trigger > Modal as *his* taste. Falsifier: we already have a runner and don’t need another. Clients parked.

## I. Questions
None. Don’t add Trigger.dev.

## J. Connections
SYSTEM SYNTHESIS: `27Y44JYXZJ8` wake-up. `PQBYZQqan2g` cloud vs desk. `35WuZxbAY68` plan/pain. No Claude / Trigger / Modal install. No outbound scrape.

## K. Future-Use
Secrets in env twice. Plan before dedup. Author ≠ runner. Don’t buy the stack.

## Steal / Operate-never

### Machine: write the job locally; run it off-laptop; keep keys out of chat and git; prove dedup
- **Epistemic:** SOURCE
- **Workflow / loop:** (his) refs → questions → split tasks → dev test → Trigger env → private GitHub → prod → fix dupes
- **Questions / signals:** Does it die when the laptop sleeps? Did the free API die? Did we prove unique?
- **Qualify / frame / objections:** Same prompt ≠ same build. You QA the black box.
- **Procedure:** No Trigger/Claude/Modal install. No Yelp/SER mill. No chat secrets.
- **Example that proves it:** Nvidia comment loop; 25 leads then dupes.
- **Why it works:** Always-on needs a runner and two copies of env.
- **Conditions / exceptions:** His Skool files. Tape times UNVERIFIED.
- **Operate-never payload:** Install Trigger.dev; scrape dentists; paste keys in chat; AIS Plus send.
- **Hive run:** none. Deploy HITL.
- **Source:** `UGIZnh6HNLc` @ UNKNOWN

### Operate-never
- Install Trigger.dev / Claude Code / Modal / Yelp+SER outbound.
- New hunt. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`.

## L. Role-Specific Applications
I will not add Trigger.dev. Secrets stay out of chat. No lead mill. Deploy HITL.
