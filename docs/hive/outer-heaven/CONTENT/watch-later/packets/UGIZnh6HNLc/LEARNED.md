# LEARNED — UGIZnh6HNLc
Protocol: deep-video-learning
Status: filled
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/UGIZnh6HNLc/full.txt`
**Desks merged:** Researcher 2026-08-14. Librarian not yet. Keep later dissent as labeled rows. Do not flatten.
**ICP:** parked. Tape $ UNVERIFIED. No new `icp_id`.
**Note:** Derived from Researcher A–K + Steal after a full `full.txt` walk. Other desks add labeled rows; do not overwrite dissent.

## A. Source Map
Caption-only (`full.txt`, ~671 lines). Title: The EASIEST Way to Host Your Claude Code Agents. Visual/click **UNKNOWN**. Timestamp **UNKNOWN**. Beats: (1) Trigger.dev opened ~1.5h ago; already YouTube-digest + ClickUp researcher. Claude writes the project; Trigger hosts so it runs off-laptop. Why not Modal: schedule, retries, queue, orchestration, cleaner UI. Prod project: tools (process video, responder, researcher) + scheduled (YouTube checker, research polar, follow-up polar). Schedules: two every 2 min, one every 8h. Failed ClickUp polar shows delay+retry. Live: add Nvidia task → polar → researcher (search web ×2 then +1, read URL ×2, ~45s) → complete + brief. Follow-up “how is their stock” → responder ~22s. All one-shot in ~45 min. (2) Fresh `trigger demo`. Skool: `claude.md` + `trigger-ref.md` (API/TS examples). Vague: Monday dental-website leads. Claude asks: deliver where (ClickUp), where (nationwide), SER/Maps (none, no paid sub), new list, volume 25. Plan: Mon 8am, Yelp Fusion “100% free,” find-leads + create-lead (retry one task), idempotency. Yelp **killed free tier** mid-build → SER API. `.env` placeholders; keys never in chat. Trigger new project “test”; copy project ref. Dev vs prod. Env vars must be pasted into Trigger (dev **and** prod) because `.env` does not push. MCP config file from Skool; secret key into `.env` not chat. Test: 25 create-lead runs; Tampa Dental + address/phone/rating/site; “25 in 9s across five cities.” (3) Local dev server must stay connected or scheduled jobs die — hence GitHub → Trigger auto-deploy on master push. `.env` excluded. Manual deploy fallback. Prod test: should skip processed; **duplicates appeared**. Fix: search ClickUp + place ID before create. Ones-shot skipped plan → weak search + weird dedupe; after plan-ish fixes, 48 rows with filter-outs. Takeaway: AI is a black box; you are QA. Plus 3,000. **Do not flatten** vs `xJ5oz63mIec` (three methods) · scrape/outbound operate-never. All $ UNVERIFIED.

## B. Atomic Knowledge

### Claude writes TS; Trigger runs; .env never ships
- **Claim:** Local Code is the factory. Trigger is the always-on host (vs Modal). Secrets stay in `.env` locally **and** Trigger env (dev+prod). Dotfiles do not commit. Never paste keys in chat.
- **Reasoning:** Hidden files + two places the runtime actually reads.
- **Mechanism:** `claude.md` + trigger-ref → TS in `src/trigger` → project ref → env paste → MCP test → GitHub sync.
- **Evidence:** Yelp-dead pivot to SER; 25 ClickUp tasks; `.env` excluded line.
- **Conditions:** Skool markdown on-tape. Hive: no Trigger/Yelp/SER spend.
- **Exceptions:** Manual deploy if GitHub sync fails.
- **Action:** Steal two-place secrets + GitHub-as-prod-wire. No keys in chat.
- **Confidence:** high as the recipe.
- **Source:** `UGIZnh6HNLc` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** Yelp dead; first test before Trigger env
- **Speech ≠ behavior:** “easiest” vs Yelp death + MCP + secret-key + GitHub + duplicate scar.

### Split tasks so retry is cheap; idempotency is a lie until proven
- **Claim:** Find vs create as two tools so one failure retries one job. He claimed auto-idempotency; prod test **duplicated**. Fix = search + place ID; already-made rows stay dirty.
- **Reasoning:** Queue/retry is why Trigger over a single script.
- **Mechanism:** Polar every 2 min; create-lead × N; place-id guard after the scar.
- **Evidence:** 50 rows with dupes; later 48 with filter-outs.
- **Conditions:** Live demo, one-shot on purpose.
- **Exceptions:** none that skip the re-test.
- **Action:** Steal split-for-retry + prove-dedupe. `golden-test-loop`.
- **Confidence:** high as the scar.
- **Source:** `UGIZnh6HNLc` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** duplicates; several create-lead bursts
- **Speech ≠ behavior:** “automatically taken care of” vs “apparently it was happening.”

### Vague NL still needs questions; you are the QA
- **Claim:** Vague Monday-leads prompt worked because `claude.md` forced questions (deliver, geo, APIs, volume). Skipping plan made search+dedupe weak. Models differ run-to-run. You assure quality.
- **Reasoning:** Black box + live demo luck.
- **Mechanism:** Ask-back → plan → build → test in dev → push.
- **Evidence:** “I don’t want to pay” → Yelp then SER anyway.
- **Conditions:** Dental-lead scrape is operate-never for hive hunt.
- **Exceptions:** He already had ClickUp memory (“cheated”).
- **Action:** Steal ask-back-before-build. No lead scrape.
- **Confidence:** high as the builder rule.
- **Source:** `UGIZnh6HNLc` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** Yelp; dupes; many Trigger runs
- **Speech ≠ behavior:** “oneshot / 10 minutes” vs 1.5h + talk-it-through.

## C. Mental Models
Host ≠ write. Dev server ≠ prod. Secrets in two places. Split for retry. Idempotency is a test, not a claim. Plan harder than the thumbnail. You are QA.

## D. Procedures
1. Drop builder docs. Vague ask; answer the ask-backs.
2. Split find vs write. Claim idempotency; **prove** it twice.
3. Keys in `.env` + Trigger env (dev and prod). Never chat.
4. MCP/test in dev. GitHub private + Trigger connect. Manual fallback.
5. Local connection off = jobs die until prod deploy.
6. Hive: no scrape list; no Trigger spend.

## E. Examples
- **Situation:** Nvidia ClickUp. **Action:** polar → researcher. **Outcome:** brief ~45s; stock follow-up ~22s. **Lesson:** agent not 1-2-3.
- **Situation:** Yelp free. **Action:** plan. **Outcome:** API dead; SER. **Lesson:** vendor lie mid-build.
- **Situation:** 25 leads. **Action:** prod retest. **Outcome:** duplicates. **Lesson:** prove place-id.
- **Situation:** Secret in chat. **Action:** refuse; placeholder in env. **Lesson:** never.

## F. Decision Rules
- IF `.env` only local → Trigger run will fail.
- IF one script does find+write → retry is expensive.
- IF “idempotent” untested → assume dupes.
- IF keys in chat → stop.
- Refuse: dental scrape as a client machine; Skool JSON; new ICP.

## G. Contrarian
“Easiest host” is Skool files + dead Yelp + paid SER + GitHub + duplicate debug. Plus CTA. 2-min polars are a cost/noise choice he does not price.

## H. Assumptions
1.5h, 10/20/45 min, 9s/25, 45s/22s, Yelp “100% free” = **UNVERIFIED** / contradicted on tape.
**Desk dissent:** Trigger vs Modal vs Anthropic cloud (`xJ5oz63mIec`). Scrape vs operate-never.

## I. Questions
- Same ClickUp researcher as another tape?
- SER API $ on the 25?
- Place-id fix pushed to prod on tape? (spoken intent)

## J. Connections
- **SYSTEM SYNTHESIS:** `xJ5oz63mIec` method 3 · `zyvdl__Ywfk` outbound · n8n poll (`KGXFkUlBHxw`). Skills: `golden-test-loop` · `workflow-compiler` · `ask-principal` · `slice-build`.

## K. Future-Use
Two-place secrets. Split-for-retry. Prove-dedupe. Ask-back builder. Dev-server≠prod. Vendor-API-dies mid-plan.

## Stolen machines

### Machine: write-local-host-cloud-prove-idempotency
- **Epistemic:** SOURCE
- **Workflow / loop:** docs in → ask-backs → split tasks → keys in env×2 → test dev → prove no dupes → GitHub → Trigger prod
- **Questions / signals:** Where do secrets live? Can one task retry? Did the second run dupe?
- **Qualify / frame / objections:** Modal still exists. Scrape is not a hive hunt.
- **Procedure:** D.
- **Example that proves it:** Yelp death; 25 then duplicates; secret-not-in-chat.
- **Why it works:** Host gives retry/schedule; you still own QA and secrets.
- **Conditions / exceptions:** Trigger/Claude on-tape. Hive: no those vendors, no lead scrape.
- **Operate-never payload:** SER/Yelp hunt; keys in chat; Skool JSON; new ICP.
- **Hive run (existing skills only):** `golden-test-loop` · `workflow-compiler` · `slice-build` · `ask-principal`
- **Source:** `UGIZnh6HNLc` @ UNKNOWN

**Operate-never**
- Scrape dental/Yelp lists. Paste secrets. New `icp_id`. Deploy because the tape said easiest.

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
