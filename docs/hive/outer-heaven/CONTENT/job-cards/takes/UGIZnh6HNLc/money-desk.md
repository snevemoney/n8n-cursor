# Money Desk — UGIZnh6HNLc
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/UGIZnh6HNLc/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/UGIZnh6HNLc/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
~5267 words. Nate: opened Trigger.dev ~90 min ago; Claude Code + Trigger as ‘core’ internal/client. Caption-only; timestamp UNKNOWN. Beats in order: 10-min Nate B. Jones YouTube check → highlights (concepts/quotes/stats) — ‘not impressive.’ Then ClickUp-watch agent: drop a company task → research comment; @ mention continues (Anthropic valuation; Nvidia stock). Non-deterministic tool loop. Why Trigger over Modal: schedule, retries, queue, orchestration, cleaner UI. Prod: six tasks — process-video / responder / researcher + scheduled YouTube-check, research-poller, follow-up-poller (two every 2 min, one every 8h). Failed ClickUp poller retries with delay. Live: add Nvidia → poller → researcher (search×3, read URL×2, ~45s) → task complete + brief; @UpAI ‘how is their stock’ → responder ~22s. All one-shot in ~45 min. Repo: `src/trigger/` AI-news + company-research TS. Fresh `trigger-demo`: School CLAUDE.md + trigger-ref.md (API/TS; CLAUDE.md points at it). Vague: ‘every Monday find dental practices I can sell websites to’ — **parked analog, no new icp_id**. CC asks: deliver where (ClickUp), where (nationwide), SERP/Maps? (none, don’t want a paid sub), new list, volume **25**. Plan: Mon 8am, Yelp Fusion ‘100% free,’ find-leads + create-lead (retry one task), idempotent no-dup. Yelp **killed free tier** → swap SerpAPI. `.env` placeholders; **never paste secrets in chat**. Trigger project `test`, copy project ref. Env vars must be re-added in Trigger (dev **and** prod) — `.env` doesn’t push. MCP file from School. Secret key → placeholder in env, not chat. Live flaky: many runs = one create per lead; 25 ClickUp rows (Tampa Dental: address/phone/rating/site); find batched 5+5+5… then 25 workers; ‘25 in 9s across five cities.’ Dev server must stay connected; prod = GitHub sync (private, `.env` excluded) → every master push deploys. Manual prod test: should skip processed — **dups appeared**; he asks to fix; place-ID search-before-create; still iterate; oneshot without plan = weak search + weird dedupe; after plan-ish fixes **48 rows**, some filtered. Takeaway: AI is a black box; you don’t write code, you **assure quality**. Close: Plus 3,000 UNVERIFIED. Dental hunt / auto-outreach / Trigger/CC as ours / secrets-in-chat = operate-never.

## B. Atomic Knowledge
### Env-in-Trigger-not-in-chat-not-in-git
- **Claim:** Local `.env` is hidden. Trigger only sees env you paste in the dashboard (dev+prod). Secret key goes in the file, never the chat. GitHub private + `.env` excluded or you leak.
- **Reasoning:** Yelp ‘100% free’ died mid-build → SerpAPI. One-shot dental list still duped until place-ID.
- **Mechanism:** If we ever ship a scheduled job: secrets in the runner, not the transcript. Dedup is a test, not a claim.
- **Evidence:** On-tape Tampa Dental; 25 then 50 with dups; 48 after filter.
- **Conditions:** A cloud cron.
- **Exceptions:** Trigger / CC / SerpAPI / dental hunt operate-never. Clients parked.
- **Action:** Steal env-not-chat. HOLD Trigger.
- **Confidence:** high as a never
- **Source:** UGIZnh6HNLc @ UNKNOWN
- **Epistemic:** SOURCE
### Split-find-from-create-then-prove-idempotent
- **Claim:** Find-leads and create-lead are two tasks so one fail retries. He claimed auto-idempotency; prod test duped. Fix = search ClickUp + place ID before create. Plan mode would have caught the thin search.
- **Reasoning:** 25 workers after 5+5+5 is the queue story. 9s / five cities UNVERIFIED.
- **Mechanism:** Split the write. Prove no-dup on a second run. Don’t analog 25 or 9s.
- **Evidence:** On-tape 25 then dups then 48 filtered.
- **Conditions:** A list job.
- **Exceptions:** Dental ICP / auto-outreach / 25-as-pipeline operate-never.
- **Action:** Steal split+prove-dedup. Do not hunt dentists.
- **Confidence:** high
- **Source:** UGIZnh6HNLc @ UNKNOWN
- **Epistemic:** SOURCE
### You-are-QA-not-the-author
- **Claim:** Vague Monday-dental oneshot ‘worked’ then lied (Yelp dead, dups). He talks it back onto the rails. Black box: watch the run, don’t trust the plan.
- **Reasoning:** Same as `xJ5oz63mIec` careless-prompt → unwanted action.
- **Mechanism:** HITL the list. No auto-email. Tape $ UNVERIFIED.
- **Evidence:** On-tape Nvidia 45s / follow-up 22s; Plus 3,000.
- **Conditions:** A oneshot build.
- **Exceptions:** CC / Trigger / Plus as ours operate-never.
- **Action:** Steal QA-the-run. HOLD the stack.
- **Confidence:** high
- **Source:** UGIZnh6HNLc @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
Belief: CC writes TS, Trigger runs it, you QA. Priority: env-not-chat, split tasks, prove dedup, no dental hunt. Experience: 90 min in; Yelp died; dups. Contrarian: oneshot without plan. Uncertainty: 9s / 3,000 / 2-min pollers.

## D. Procedures
His order: CLAUDE.md+ref → vague ask → keys in env → Trigger env both envs → MCP test → GitHub→prod → catch dups. Our order: do not stand up. Steal env-not-chat + prove-dedup. Caption-only: clicks UNKNOWN.

## E. Examples
**Situation:** Monday dental 25. **Action:** Yelp then SerpAPI. **Reasoning:** no paid sub. **Outcome:** Yelp dead; 25 rows. **Lesson:** Vendor ‘free’ dies mid-tape.

**Situation:** Prod test. **Action:** run twice. **Reasoning:** claimed idempotent. **Outcome:** dups. **Lesson:** Prove no-dup.

**Situation:** Nvidia task. **Action:** researcher + @ follow-up. **Reasoning:** tool loop. **Outcome:** 45s + 22s comments. **Lesson:** Watch the run.

## F. Decision Rules
IF secret → file/dashboard, never chat. IF second run dups → not shipped. IF 25 / 9s / 3,000 → UNVERIFIED. Refuse: Trigger/CC as ours; dental hunt; auto-outreach.

## G. Contrarian
Rejects Modal-as-default (for him). Rejects oneshot-without-plan. Rejects ‘idempotent because the model said so.’

## H. Assumptions
90-min first open. ClickUp already wired (‘cheat’). Dental is a demo ICP. Survivorship: School md files. Falsifier: SerpAPI $ blows the ‘no sub’ ask. Speech≠behavior: don’t-pay then SerpAPI.

## I. Questions
What’s live Yelp/SerpAPI $ now? Any checkout we can open from a Monday list? Did place-ID hold on week two?

## J. Connections
SYSTEM SYNTHESIS: env-not-chat = `oWdJMJp2HgM`. QA-the-run = `xJ5oz63mIec`. Dental = Path B analog, parked. CC on-tape only. Auto-send = `playbook-before-send`.

## K. Future-Use
Unassigned: paste-all-env-once into Trigger. Dev-server-connected ≠ prod.

## Steal / Operate-never

### Machine: Env-not-chat-split-write-prove-dedup
- **Epistemic:** SOURCE
- **Workflow / loop:** trigger: a scheduled list → action: keys in the runner; find ≠ create; second run must add zero dups → checkable stop: a human opens the 25 before anyone is emailed
- **Questions / signals:** Where do secrets live? Did run two dup? Who sends?
- **Qualify / frame / objections:** Frame: you are QA. Objection: ‘25 in 9s’ — UNVERIFIED, then dups.
- **Procedure:** Do not stand up Trigger/CC. Do not hunt dentists. HITL send. Tape $ UNVERIFIED. Clients parked.
- **Example that proves it:** Yelp died; 25 then dups then 48. UNVERIFIED.
- **Why it works:** Free tiers die. Models lie about idempotency. A list is not a send.
- **Conditions / exceptions:** Works as a gate. Exception: Trigger / CC / dental ICP / auto-outreach / 25-as-FACT operate-never.
- **Operate-never payload:** Trigger.dev · Claude Code · dental hunt · SerpAPI as ours · secrets in chat · auto-email
- **Hive run (existing skills only):** `playbook-before-send` · `ask-principal` · `website-offer-funnel` (clients parked) · `pricing-margin-roi-guardrails`
- **Source:** UGIZnh6HNLc @ UNKNOWN


### Operate-never (this desk will not operate)
- Quote 25 leads / 9s / 45s / 3,000 members as FACT or as our analog.
- Trigger.dev / Claude Code as ours. Dental/website hunt. Secrets in chat. Auto-outreach.

- Move money, approve a charge, refund, or fee. Live Stripe. Auto-send / auto-pay / auto-book / auto-deploy / auto-publish.
- Quote any tape $ / student count / job-loss % / prize / 10x as FACT or as our price analog.
- Nate Skool / Plus / AIS Plus / Hostinger NATEHERK / Uppit / Glaido / sold templates as a SKU. Do not map through `usecase-to-sku`. Do not join / install / import.
- Install Claude Code / Codex / Claude / ChatGPT / Gemini / Coda / Vapi / ElevenLabs / n8n-cloud / Trigger.dev / Hermes / Base44 / Sora / NanoBanana / Poppy / Lovable as ours. Cursor + Grok only. Vendor on tape is a mention, not a Bot dispatch.
- New hunt ICP. Unpark a client. Live hunt stays `local-pro` / Normand. Clients parked. No new `icp_id`.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Overwrite `takes/money-desk.md`.

## L. Role-Specific Applications
HOLD Trigger.dev and Claude Code. Steal env-not-chat, split-write, prove-dedup. Do not hunt dentists. Send stays HITL. Early rung $500–1K/mo CAD.

**Lens only (after A–K + Steal).** This desk votes PASS/HOLD on margin. It does not move money.

- `pricing-margin-roi-guardrails`: tape $ stays **UNVERIFIED**. Our early rung stays **$500–1K/mo CAD** after a 30–60d win. Delivery ≤40% of fee. Vendor / educator $ does not move Normand Path A.
- `outcome-offer-funnel` + `checkout-proof`: count checkout + warm conversions we can open. Quarantine YouTube receipts.
- `paid-slice-funnel`: thin V1; Stripe HITL; preview ≠ domain.
- `ask-principal` + `input-required-gate`: confirm ≠ execute. Pay / refund / fee stay HITL.
- `website-offer-funnel`: Path A/B/C spine still exists; this tape does not open a client unless Evens names one.
- Proposed, not written: `unit-econ-card` (price, COGS, contribution, aha-gate — tape $ never fills the line) · `token-receipt` (session cost versus artifact; leftover quota is not a KPI).

**Business parked:** no new `icp_id`. No `business-lanes.json` row. Hunt stays `local-pro` / Normand.
