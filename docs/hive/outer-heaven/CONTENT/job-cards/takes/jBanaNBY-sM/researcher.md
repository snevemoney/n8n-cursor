# Researcher — jBanaNBY-sM
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/jBanaNBY-sM/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/jBanaNBY-sM/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Caption-only (`full.txt`, ~885 lines). Title: I Built the Ultimate Army of Media Agents in n8n (free template). Visual/click **UNKNOWN**. Timestamp **UNKNOWN**. Beats: (1) Telegram in: photo → Drive + “what do you call this?” + sharing ask; rename via Drive agent `change name` → folder `media` / `speaker`. (2) Edit: “studio / energetic / colorful / JBL speaker feel” → GPT-5 Mini brain + Think tool → creative agent `edit image` → **three** 1024 proofs; confirm before 2048 finals. (3) Image→video: first preview → VFX ad + beat-sync lights; V3 Fast; creative also tries **text-to-video** (no JBL branding, B-roll). GPT Image 1 for stills. (4) Email Dexter Morgan: Drive find + contact agent + share anyone-with-link + send; sign-off “best your name” placeholders (his prompt miss). Fake `dextermiami.com` / `dexterl.com`. Claims 15s; he doubts duration. (5) Social search: two high-performing n8n videos each on TikTok / IG / YouTube via **Apify** actors (ampify/Amplify on tape); compile via main-agent `create doc` → `media analysis` folder. Promo codes Nate30 / 30 Nate Herk. (6) Post JBL VFX to TikTok caption “music to my ears”; 5-window memory so it must re-search Drive; file must be public for **Blotato**; submission ID. (7) Architecture: Telegram switch photo vs text → both become `message.text`; intermediate steps ON; Sheets logger (timestamp / workflow / input / output / actions / tokens / model); **continue on error** so fail still logs. Manager prompt: do not write emails/summaries — only delegate. High-level tool blurbs (token cheap); detail lives on sub-agents. Seven notes: name photos; lookup contacts first; media lives in Drive; Think before follow-up; share-anyone before post; VO3 ~8s don’t ask length; always reply. GPT-5 Mini OpenRouter + fallback Mini via OpenAI (he notes both die if OpenAI dies). (8) Sub-workflows for binary: create/edit image (OpenAI), create/image-to-video (FAL + poll V3 Fast), post X/TT/IG (Blotato platform swap), create doc (create then update). Chat ID from Telegram trigger, not AI-defined. (9) Scar: tried JSON V3 prompt agent in subflow → inconsistent / stuffed reference image → **removed**; autonomy on creative agent happier. Image prompts detailed; video prompts concise, one seamless, sounds/dialogue. (10) Cost: Mini cheaper in / dearer out; Image 1 ~1¢/4¢/17¢ (he used medium ~5¢); V3 Fast text 25¢/s, audio-on 40¢/s, experimental. Blotato $29 + 30% 6mo; Apify 30% 3mo. Setup: 9 JSON files, name+link tools, Drive folders `media` / `media analysis`, Sheets template. Plus CTA / $6k hackathons. **Do not flatten** vs `AYsg5gAMWyo` · `Vm8QOo9MiC4` · `pxzo2lXhWJE` · `vFepZE_wrfg`. $ / 30% / 5¢ / 40¢ UNVERIFIED.

## B. Atomic Knowledge

### Manager delegates; sub-workflows own binary
- **Claim:** Main agent is a router. Photo/text normalize to one field. Creative/post/doc are executed-by-another-workflow because binary is ugly across flows. Telegram can fire from the subflow before the manager replies.
- **Reasoning:** One fat agent writing emails + generating video = token + error soup.
- **Mechanism:** High-level tool descriptions on manager; detailed when-to-use on the sub. Chat ID pinned from trigger. Think tool before questions.
- **Evidence:** Rename `speaker`; three proofs then confirm; VFX + leftover text-to-video; Dexter share+email; TikTok post after public-share.
- **Conditions:** n8n + Telegram + Drive + OpenRouter/OpenAI + FAL + Blotato + Apify on-tape.
- **Exceptions:** Create-doc lives on the **main** agent (didn’t fit a bucket).
- **Action:** Steal router + binary-sub + error-log. No Blotato/Apify install. No auto-post.
- **Confidence:** high as the split.
- **Source:** `jBanaNBY-sM` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** JSON prompt agent removed; email placeholder sign-off
- **Speech ≠ behavior:** “ultimate” / “full autonomy” vs he still confirms proofs and picks #1.

### Error branch + intermediate steps = visibility
- **Claim:** Return intermediate steps. Continue on error. Success and error both write Sheets (actions, prompt/completion tokens, model per object). Silent fail = no log.
- **Reasoning:** Media runs are long; you need the action trail to retune.
- **Mechanism:** Agent settings → intermediate steps + error output.
- **Evidence:** Logger row for TikTok post with tool I/O.
- **Conditions:** Hive: `golden-test-loop` / log, not this sheet.
- **Exceptions:** none that skip the error branch.
- **Action:** Steal continue-on-error + action log. HITL before post/email.
- **Confidence:** high as the scar pattern.
- **Source:** `jBanaNBY-sM` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** unobserved
- **Speech ≠ behavior:** “logs everything even errors” — caption does not show a failed run.

### Autonomy beat structured JSON in the video subflow
- **Claim:** He planned a prompt-agent that emits V3 JSON. It stuffed the reference image and was use-case-brittle. Dropped it. Creative Mini writes detailed image / concise video prompts; FAL just executes.
- **Reasoning:** Extra brain in the binary path added inconsistency.
- **Mechanism:** Optional: move trigger, insert a specialist prompt agent if a niche format is required.
- **Evidence:** History save ~20 min earlier still had the JSON agent.
- **Conditions:** Keep vs `AYsg5gAMWyo` first-frame / Key; `Vm8QOo9MiC4` Sora poll.
- **Exceptions:** Specific brand JSON later is allowed — he says so.
- **Action:** Steal “execute workflow, prompt upstream.” Operate-never: auto-post + scrape actors.
- **Confidence:** high as the scar.
- **Source:** `jBanaNBY-sM` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** JSON agent inconsistency
- **Speech ≠ behavior:** “not complicated” vs nine workflows + Drive folder wiring.

## C. Mental Models
Manager is a switchboard. Binary lives in a child flow. Proofs before finals. Public-share is a post precondition. High-level descriptions save tokens. Fallback that shares a vendor is not a fallback. JSON-in-the-pipe can lose to a prompted specialist. Always reply.

## D. Procedures
1. Telegram: photo → Drive + name ask; text → agent.
2. Route: Drive / email / calendar / contact / social / creative / posting / web / create-doc / Think.
3. Images: proofs 1024 → human pick → optional 2048.
4. Video: don’t ask length (VO3 ~8s); poll FAL; save Drive + Telegram.
5. Before post: anyone-with-link. Before email: contact lookup + share.
6. Log success **and** error. Intermediate steps on.
7. Import 9 JSONs; click-test each tool opens the child; folders `media` / `media analysis`; Sheets template.
8. Hive: map to `clip-factory` / `motion-pipeline` / `product-ad-from-photo`. No Apify scrape. No Blotato. Post/email HITL.

## E. Examples
- **Situation:** Upload speaker. **Action:** name + Drive. **Outcome:** `media/speaker`. **Lesson:** name before edit.
- **Situation:** Studio edit. **Action:** three proofs. **Outcome:** pick #1. **Lesson:** confirm before final.
- **Situation:** VFX + leftover T2V. **Action:** both V3 Fast. **Outcome:** branded vs B-roll. **Lesson:** agent may extra-call.
- **Situation:** Email Dexter. **Action:** contact + share + send. **Outcome:** placeholder sign-off. **Lesson:** prompt the closer.
- **Situation:** JSON prompt agent. **Action:** removed. **Outcome:** happier Mini prompts. **Lesson:** extra brain ≠ better video.

## F. Decision Rules
- IF binary → child workflow, not the manager.
- IF post → share-anyone first.
- IF photo in → ask name.
- IF error → still log + Telegram.
- IF fallback models share one vendor → not a real fallback.
- Refuse: auto-post; Apify scrape as hive default; Blotato; new ICP; send without HITL.

## G. Contrarian
“Ultimate army” is a template funnel (Skool + Plus). Dexter is a gag contact. 15s claim vs his own doubt. OpenRouter+OpenAI Mini “fallback” is the same brain vendor. Affiliate codes sit next to the cost slide.

## H. Assumptions
5¢ / 17¢ / 25–40¢/s / $29 / 30% / $6k prizes / nine files = **UNVERIFIED**.
**Desk dissent:** vs `AYsg5gAMWyo` Key/first-frame · `Vm8QOo9MiC4` Sora 6× · `pxzo2lXhWJE` Tavily specialists · `vFepZE_wrfg` WAT. Hive Cursor+Grok; no Claude/Vapi/Blotato.

## I. Questions
- Same Think-tool tape he “links up here”?
- Blotato vs native n8n social — still the path?
- Did the 2048 final ever render on tape?

## J. Connections
- **SYSTEM SYNTHESIS:** `AYsg5gAMWyo` · `Vm8QOo9MiC4` · `pxzo2lXhWJE` · `a5sJNwfZ528`. Skills: `clip-factory` · `motion-pipeline` · `product-ad-from-photo` · `golden-test-loop` · `ask-principal`.

## K. Future-Use
Router-not-writer. Binary child. Proofs-then-final. Share-before-post. Error-still-logs. High-level blurbs. JSON-agent scar. Fake fallback.

## Steal / Operate-never

### Machine: telegram-router-binary-child-log-both
- **Epistemic:** SOURCE
- **Workflow / loop:** normalize in → manager routes → child owns binary → proofs HITL → share-anyone → post/email HITL → log success+error
- **Questions / signals:** Photo or text? Need Drive ID? Public yet? Fallback same vendor?
- **Qualify / frame / objections:** Manager must not write the email. Extra prompt-agent in the video pipe can regress.
- **Procedure:** D.
- **Example that proves it:** speaker rename; three proofs; Dexter placeholders; JSON agent yanked; TikTok after public.
- **Why it works:** Delegation + binary isolation + a log that survives failure.
- **Conditions / exceptions:** n8n on-tape. Hive: clip/motion skills, no scrape/post vendors.
- **Operate-never payload:** Auto-post; Apify actors; Blotato; send/email without HITL; new ICP.
- **Hive run (existing skills only):** `clip-factory` · `motion-pipeline` · `product-ad-from-photo` · `golden-test-loop` · `ask-principal`
- **Source:** `jBanaNBY-sM` @ UNKNOWN

**Operate-never**
- Auto-post to TikTok/X/IG. Apify scrape. Blotato. Send email without HITL. New `icp_id`. Switch stack.

## L. Role-Specific Applications
Map router + binary-child + error-log onto hive clip/motion. Keep Key/Sora/WAT rows unflattened. File JSON-prompt scar. Post/email stay HITL.
