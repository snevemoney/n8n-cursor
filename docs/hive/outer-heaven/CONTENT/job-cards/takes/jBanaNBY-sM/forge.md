# Forge — jBanaNBY-sM
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/jBanaNBY-sM/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/jBanaNBY-sM/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate Herk **ultimate media agent** in n8n, Telegram in. Manager agent (GPT-5 Mini via OpenRouter + OpenAI fallback) delegates: Drive, email, calendar, contacts, social search (Apify), creative (GPT Image 1 + VO3 Fast via FAL, poll), posting (Blotato → X/TikTok/IG), create-doc, think, web (Perplexity/Tavily/OpenWeather). Demo: upload photo → name “speaker” → edit studio/energetic → three 1024 proofs, confirm before 2048 → image-to-video JBL VFX + extra text-to-video → email Dexter Morgan (share-anyone + placeholder sign-off) → search 2 high-performing n8n videos per TikTok/IG/YouTube → Google Doc in `media analysis` → post JBL VFX to TikTok caption “music to my ears” (file must be public for Blotato). Logger sheet: timestamp/workflow/input/output/actions/tokens/model; success + error branches (`continue on error`). Subflows because binary. He tried a JSON-prompt agent inside the video subflow, removed it — happier with creative-agent autonomy. Setup: 9 JSON workflows from Skool zip; name + link each tool; Drive folders `media` / `media analysis`; sheet template. Sponsor codes Nate30 / 30 Nate Herk UNVERIFIED. Caption-only: nodes unobserved. n8n / Telegram / Blotato / Apify / FAL / OpenRouter / Skool on-tape.

## B. Atomic Knowledge

### Manager delegates; descriptions stay thin; think before ask
- **Claim:** Main agent must not write emails or summaries. Sole job: call the right tool. Tool descriptions on the manager are high-level; detail lives on the sub-agent so tokens don’t bloat every turn.
- **Reasoning:** Chunking the manager prompt makes every call more expensive.
- **Mechanism:** Seven notes: name uploaded photos; lookup contacts before send; media lives in Drive; Think before follow-up; share-anyone before post; VO3 length is ~8s don’t ask; always reply, never silence.
- **Evidence:** Live Telegram chain; Think used often.
- **Conditions:** His prompt pack. GPT-5 Mini.
- **Exceptions:** Fallback is also Mini via OpenAI — if OpenAI is down both die; he said swap Anthropic/Google.
- **Action:** Steal thin-router + think-before-ask + always-reply. Do not install n8n-cloud/Blotato/Apify as hive.
- **Confidence:** high on the spine.
- **Source:** `jBanaNBY-sM` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN (caption-only)
- **Failed / retried:** email signed “best your name”
- **Speech ≠ behavior:** none

### Binary in subflows; poll video; share-anyone before post
- **Claim:** Custom tools are “when executed by another workflow.” Create/edit image → OpenAI → binary → Telegram + Drive. Create/image-to-video → FAL VO3 Fast → poll until done → download → Telegram + Drive. Chat ID from Telegram trigger, not AI-defined. Posting: file ID + caption → Blotato; only platform changes. Doc: create then update by ID.
- **Reasoning:** Binary between flows is annoying; subflows isolate it. Telegram can get the file before the manager’s final text.
- **Mechanism:** Photo path vs text path; both emit `message.text`. Intermediate steps on. Error output so a fail still logs.
- **Evidence:** JBL video emailed; TikTok live 1 min later; logger last row matches.
- **Conditions:** Blotato needs a public Drive link. VO3 Fast cheaper/faster than V3.
- **Exceptions:** He dropped the inner JSON-prompt agent — inconsistent, one-use-case, stuffed the reference image.
- **Action:** Steal poll + share-before-post + error-log branch. Do not auto-post. Deploy HITL.
- **Confidence:** high on the pattern.
- **Source:** `jBanaNBY-sM` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** demonstrated
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** JSON-prompt agent removed
- **Speech ≠ behavior:** “15s VFX” in the email; he said it isn’t 15s

### Proofs before finals; memory is short; search Drive
- **Claim:** Creative returned three 1024 proofs and asked confirm before 2048. Five-window context — posting the JBL after other talk required Drive search by name.
- **Reasoning:** Autonomy still needs a cheap preview gate. Short memory ≠ amnesia if Drive is the DB.
- **Mechanism:** Preview names `speaker studio vibrant`; pick #1; image-to-video + optional text-to-video B-roll.
- **Evidence:** Three Drive files + two videos (branded vs B-roll).
- **Conditions:** GPT Image 1 + VO3 Fast as taped. Per-image / per-second $ UNVERIFIED.
- **Exceptions:** Text-to-video lost JBL branding.
- **Action:** Steal preview-confirm. Do not auto-render finals. Do not auto-post.
- **Confidence:** high.
- **Source:** `jBanaNBY-sM` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** demonstrated
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** none on proofs
- **Speech ≠ behavior:** none

## C. Mental Models
One manager, bucketed specialists. Binary is a plumbing problem, not an agent problem. Prompt quality lives on the creative agent, not a second JSON brain (he tried, removed). Logs on error or you fly blind. Cheap Mini can run the router. Autonomy ≠ skip share/public.

## D. Procedures
1. Do not install Blotato, Apify, FAL, OpenRouter, n8n-cloud as hive defaults.
2. Do not use coupon codes. Do not send Skool.
3. Do not auto-post to X/TikTok/IG. Publish HITL.
4. Do not email real contacts from this template.
5. Photo in → ask name → Drive. Before post → share anyone. Video length → don’t ask (VO3 ~8s).
6. Manager descriptions thin; detail on the tool.
7. Return intermediate steps; continue on error; log both branches.
8. Chat ID from trigger. Poll FAL until done.
9. If JSON-prompt sub-agent fights the reference image → he removed it.
10. Setup: 9 workflows, name+link, folders `media` / `media analysis`, sheet IDs.

## E. Examples
**Situation:** “Send the JBL VFX to Dexter Morgan.”  
**Action:** Contact lookup → find file → share anyone → email.  
**Reasoning:** Send needs email + public link.  
**Outcome:** Mail sent; sign-off placeholders; “15s” wrong.  
**Lesson:** Prompt the sign-off; don’t trust the agent’s duration claim.

**Situation:** Post JBL after other talk.  
**Action:** Search Drive, make public, Blotato TikTok.  
**Reasoning:** Five-window memory won’t hold the file ID.  
**Outcome:** Submission ID; TikTok 1 min ago.  
**Lesson:** Drive is memory. Public is a hard gate.

**Situation:** JSON prompt agent in the video subflow.  
**Action:** Tried structured V3 JSON; yanked it.  
**Reasoning:** Inconsistent, stuffed reference image, one-use-case.  
**Outcome:** Creative agent writes concise energetic one-shot prompts; happier.  
**Lesson:** Extra brain ≠ better; autonomy on the specialist won.

**Situation:** Agent error with no error branch.  
**Action:** Continue on error + log.  
**Reasoning:** Else no Telegram, no sheet.  
**Outcome:** Visibility.  
**Lesson:** Fail must still notify.

## F. Decision Rules
- IF input is a photo → download, Drive, ask name, set `message.text`.
- IF action needs a person → contacts first.
- IF posting → file must be anyone-with-link.
- IF video → don’t ask duration.
- IF binary → subflow.
- IF manager prompt is getting fat → move detail down.
- IF OpenRouter dies → fallback (and don’t make fallback the same vendor).
- IF inner prompt-agent is inconsistent → remove it.
- IF publish/email → HITL / refuse for hive.

## G. Contrarian
Field stacks a JSON-prompt specialist for VO3. He added one, then deleted it. Field wants the manager to be smart; he wants it dumb and routing.

## H. Assumptions
n8n + Telegram + his zip. Tape $ (image cents, VO3 $/s, Blotato $29, Apify tiers) UNVERIFIED. Dexter is a joke contact. Falsifier: Blotato public-link rule changes. Hive does not post. Clients parked.

## I. Questions
Does share-anyone leak client media? What’s a hive-safe notify instead of Telegram+Blotato? Would a non-FAL poll look the same?

## J. Connections
SYSTEM SYNTHESIS: `AYsg5gAMWyo` / `Vm8QOo9MiC4` create-then-poll video. `tFFKuq2t0rI` two brains + mail. `xJ5oz63mIec` WAT. Publish HITL. No n8n-cloud as hive DB. Cursor + Grok.

## K. Future-Use
Thin manager + fat specialists. Preview before final. Poll. Error-log. Drive as media DB. No auto-post.

## Steal / Operate-never

### Machine: Telegram → thin manager → bucket tools → Drive DB → log both outcomes; post is a hard public gate
- **Epistemic:** SOURCE
- **Workflow / loop:** Telegram (photo|text) → manager → specialist/subflow → Drive + optional Telegram binary → clean steps → sheet (ok|err) → reply. Post only after share-anyone.
- **Questions / signals:** Photo or text? Need a contact? File public? Proof or final?
- **Qualify / frame / objections:** Fat manager burns tokens. JSON-prompt inner agent failed him.
- **Procedure:** No Blotato/Apify/FAL as hive. No coupons. No auto-post. No real email send.
- **Example that proves it:** Proofs before 2048; JBL email+TikTok; JSON agent removed; error branch exists so fails log.
- **Why it works:** Router stays cheap; binary isolated; Drive remembers; fail still speaks.
- **Conditions / exceptions:** VO3 ~8s. Blotato public. Tape $ UNVERIFIED.
- **Operate-never payload:** Blotato/Apify/FAL/OpenRouter install; auto-post; coupon; Skool; real outbound mail.
- **Hive run:** none. Publish HITL.
- **Source:** `jBanaNBY-sM` @ UNKNOWN

### Operate-never
- Do not install Blotato, Apify, FAL, OpenRouter, n8n-cloud.
- Do not auto-post to X / TikTok / Instagram.
- Do not email real people from this template.
- Do not quote per-image / per-second / $29 as FACT.
- Do not send Skool or use Nate30 / 30 Nate Herk.
- Clients parked. Deploy / publish HITL.

## L. Role-Specific Applications
Forge steals **thin router + Drive-as-DB + poll + error-log + preview-before-final**. We do not import the 9-workflow zip, do not post, do not scrape social via Apify. If we ever build a media desk, notify stays HITL and stack stays Cursor + Grok.
