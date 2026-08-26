# Big Boss — Vm8QOo9MiC4
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/Vm8QOo9MiC4/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/Vm8QOo9MiC4/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Long (PACKET: 28:34, 6830 words, captions `en-orig`). Timestamp UNKNOWN on `full.txt` (no VTT in the take). Visual-only gaps: Starbucks clip, mug-throw, professor lecture, curl-cream UGC, Sam Altman cameo, frog storyboard, prompt-agent wall of text, JSON replace demo, Kie logs.

Beats, in order:

1. Promise: n8n + Sora 2 = “10× output,” higher quality, **no watermarks**, **6× cheaper** than OpenAI. Businesses use it for creatives. Audio comes with the video. Starbucks “discover your flavor” clip. Time and money claim.
2. Menu: text-to-video, image-to-video, cameos (Cuban / Altman), storyboards / consistent characters, prompting. Free Skool JSON so you do not build it.
3. Connect: Kie.ai (not FAL this time). Marketplace for image/video models. Price slide: FAL/OpenAI **$0.10/sec** vs Kie **$0.015/sec**; 10s = **$0.15** vs **$1**. Billing: grab **$5** credits “lasts.” API key page. Playground, then API.
4. HTTP from curl: import request, bearer key, then save as generic **header** credential so every branch reuses it. Turn off duplicate headers. Body: model, delete optional callback, prompt, aspect, 10 or 15 frames, `remove_watermark: true`. Docs say what is required.
5. First run: “young man throwing a coffee mug against the wall.” 200 + task id. Second curl = query task. State `generating`, then `success`. Two URLs: watermarked and not. Thin prompt → slow-mo, weird sound. He wanted that miss.
6. Pattern: submit, then ask “is it done.” Template adds **polling**: wait, query, if `generating` loop every **10s**; if `success` take the URL. 18 tries ≈ 180s on the professor clip. Mentions a **switch** for `failed` if you want it production-ready (he does not wire it in the happy path).
7. Image-to-video: public image URL (AI curl cream). UGC selfie-in-car prompt; product must not change; spoken line specified; portrait for Reels/TikTok. Poll same. Result: she says the line; product matches; **first millisecond is the still** (crop). **Sora rule: no person in the still** — even AI people — unlike V3. UGC farm pitch: five organic videos a day, no actors.
8. Cameos: Sora social profiles. Copy `Sam A` username (public). Gravity-in-two-sentences selfie. Restrictive: Shaq / Mark Cuban / “crazier” prompts rejected. You can register your own likeness. Output looks/sounds like him; tone is dead because the prompt was thin.
9. Storyboard / Sora 2 Pro: 10/15/25s split across scenes. He has not seen a huge Pro vs regular gap; stay cheap on Kie unless you scale TikTok/IG. Frog still + three forest/treasure scenes. 500s from Kie on storyboards; this one **35 minutes**. Character holds; prompts lacked camera/light so it is “funny.”
10. Prompt agent: while the frog cooks (~740s) he teaches cinematographer language — subject (appearance, clothes, age, gender, expression, motion), setting, camera (angle, lens, move), tone. Raw professor prompt vs optimized (24mm dolly, 35mm handheld, 50mm cutaways, lip sync). Second clip “more cinematic,” ~300s. Tailor the agent to UGC if that is the job. Future: Sheet of product photo / ICP / features / setting → 10 a day or 10 an hour.
11. Hygiene: agent newlines + double quotes break JSON. `replace` expressions strip both. Isolated pizza/quotes demo.
12. Errors: Kie `500` = their side (load, AWS) **or** content restrict. One Pro storyboard rejected; another ~7 min success. Ask comments for use cases. Skool JSON + setup guide. Plus: 200 members, three courses, weekly Q&A. Like/CTA.

Off-topic / not skipped: Starbucks as the money clip; watermark strip as a feature; TikTok Shop UGC; celebrity likeness; Plus agency course.

## B. Atomic Knowledge

### Price and “no watermark” are the magnet
- **Claim:** Kie is 6× cheaper than FAL/OpenAI ($0.015 vs $0.10 per second); 10s is $0.15 vs $1; $5 credits last; watermark can be removed in the body.
- **Reasoning:** Cheap + clean file is why you leave the Sora app.
- **Mechanism:** Marketplace API, `remove_watermark: true`, two result URLs.
- **Evidence:** On-tape arithmetic. **$ UNVERIFIED.**
- **Conditions:** His Kie billing page that day.
- **Exceptions:** Storyboards ran 500–700s and one 35 min — time is not in the 10s slide.
- **Action:** Do not buy 6× as FACT. Watermark-strip stays operate-never adjacent.
- **Confidence:** high that he said it
- **Source:** `Vm8QOo9MiC4` @ UNKNOWN — “six times cheaper” / “remove watermark true”
- **Epistemic:** SOURCE / UNVERIFIED ($)

### Submit, then poll until a terminal state
- **Claim:** Create returns a task id. Query until `success`. Waiting a fixed 4 minutes is inefficient and dies if the job needs 5.
- **Reasoning:** Logs show 195–227s typical; storyboards much longer.
- **Mechanism:** Wait node + if `state == success` else loop ~10s. He names `failed` as a third state you should switch on.
- **Evidence:** Professor clip 18 tries ≈ 180s. Frog 35 min.
- **Conditions:** Kie query endpoint. Public result URL.
- **Exceptions:** Happy-path template does not notify on fail.
- **Action:** Poll-until-done is the loop. Failed-state is part of done. Do not install Kie.
- **Confidence:** high
- **Source:** `Vm8QOo9MiC4` @ UNKNOWN — “every 10 seconds go ask… if it’s done”
- **Epistemic:** SOURCE

### Thin prompts are a controlled miss
- **Claim:** “Young man throwing a coffee mug” returns a ridiculous slow-mo clip. He keeps it to teach prompting.
- **Reasoning:** You cannot expect a good shot from a sentence.
- **Mechanism:** Same two-call pattern; bad input, bad file.
- **Evidence:** He narrates sound/motion as the cost of a lazy prompt.
- **Conditions:** Text-to-video, no prompt agent.
- **Exceptions:** The later raw professor clip is “not bad” even before optimize.
- **Action:** Show a miss on purpose, then the specialist. Creative still does not auto-publish.
- **Confidence:** high
- **Source:** `Vm8QOo9MiC4` @ UNKNOWN — “you really can’t expect to get a good output if you don’t prompt it very well”
- **Epistemic:** SOURCE

### Image-to-video has a no-person rule and a first-frame still
- **Claim:** Sora 2 image-to-video wants a public URL, will not take a realistic person (even AI), and the first millisecond is the source still.
- **Reasoning:** Product lock (“nothing about the product should change”) is the useful bit. Person lock is the vendor rule. Crop the still.
- **Mechanism:** `image_urls` + spoken line + portrait.
- **Evidence:** Curl-cream UGC; V3 contrast (person+product allowed there).
- **Conditions:** Public HTTPS file, not local.
- **Exceptions:** Cameos put a person in via username, not via still.
- **Action:** Faceless product still → motion is stealable. Likeness / UGC-actor farm is operate-never.
- **Confidence:** high
- **Source:** `Vm8QOo9MiC4` @ UNKNOWN — “you can’t have it be a person in the image”
- **Epistemic:** SOURCE

### Cameos are likeness, and the vendor is jumpy
- **Claim:** Public Sora usernames (Sam Altman) drop a face/voice into the clip. Crazier prompts and other celebs get rejected. You can enroll your own face.
- **Reasoning:** He calls it sensitive. Gravity-Sam sounds miserable because the prompt was thin.
- **Mechanism:** Username in the prompt + same poll.
- **Evidence:** `Sam A` cameo tab; Shaq/Cuban rejects.
- **Conditions:** Public cameo flag on that profile that day.
- **Exceptions:** Image-to-video can also take cameos; he did not demo that combo.
- **Action:** Likeness is not our SKU. No celebrity farm. No auto-publish.
- **Confidence:** high
- **Source:** `Vm8QOo9MiC4` @ UNKNOWN — “Sora 2 may be a little bit more restrictive”
- **Epistemic:** SOURCE

### Prompt agent writes the shot list; human still picks
- **Claim:** A specialist turns a raw sentence into cinematographer language (subject, wardrobe, age, motion, set, lens, move, tone).
- **Reasoning:** Same professor concept, two files — optimized feels more cinematic, more shots, longer (~300s vs ~180s).
- **Mechanism:** Agent → cleaned JSON → Sora. Tailor the system prompt to UGC if that is the job.
- **Evidence:** 24mm / 35mm / 50mm breakdown vs the one-liner.
- **Conditions:** He is “not a prompting expert.” This is a starter rubric.
- **Exceptions:** Storyboard scenes he wrote by hand were weak and the frog shows it.
- **Action:** Prompt-agent + human publish. Publishing Engine HITL. No 10/hour farm.
- **Confidence:** high for the compare; medium as a universal rubric
- **Source:** `Vm8QOo9MiC4` @ UNKNOWN — “sound like a professional cinematographer describing a shot”
- **Epistemic:** SOURCE

### Sanitize model text before it becomes JSON
- **Claim:** Newlines and double quotes in the agent output break the Sora body. `replace` both.
- **Reasoning:** Models emit them even when told not to.
- **Mechanism:** Isolated line1/line2/line3 + `"pizza pizza"` demo; copy the expressions.
- **Evidence:** He deletes the raw output, shows the break, then the clean side.
- **Conditions:** JSON HTTP body.
- **Exceptions:** None on tape.
- **Action:** Cheap guardrail. Forge/Watchdog analog: never trust raw LLM text in a payload.
- **Confidence:** high
- **Source:** `Vm8QOo9MiC4` @ UNKNOWN — “both new lines and double quotes will break the JSON body”
- **Epistemic:** SOURCE

### Five-hundred is the vendor or the filter, not always your prompt
- **Claim:** Kie `500` can mean overload, their cloud, or a silent content reject.
- **Reasoning:** One Pro storyboard rejected “internal error”; another succeeded in ~7 min.
- **Mechanism:** Logs with error code 500.
- **Evidence:** He cannot tell which. Storyboards also 500’d for him before.
- **Conditions:** Launch-crowd Sora + Kie.
- **Exceptions:** Poll loop without a `failed` branch will hang or mis-route.
- **Action:** Failed-state notification is part of the machine. Do not retry forever.
- **Confidence:** high as a warning
- **Source:** `Vm8QOo9MiC4` @ UNKNOWN — “it could also mean that your content is being restricted”
- **Epistemic:** SOURCE

### Storyboard is time-sliced consistency, and it is slow
- **Claim:** Scenes + durations that add to 10/15/25s keep a character (frog) across cuts. Expect 500–700s, here 35 min, plus 500s.
- **Reasoning:** He stops the live poll to teach prompting because staring is boring.
- **Mechanism:** Image URL + three scene prompts. Pro vs regular: stay cheap unless scale.
- **Evidence:** Frog recognizable; lighting/camera missing so quality is “funny.”
- **Conditions:** Kie storyboard endpoint that day.
- **Exceptions:** He has seen 500s kill the job.
- **Action:** Previs / still → clip (`motion-pipeline`). Long render after a pick. No overnight farm.
- **Confidence:** high
- **Source:** `Vm8QOo9MiC4` @ UNKNOWN — “it took 35 minutes, but it did finish”
- **Epistemic:** SOURCE

### UGC sheet-to-hourly is the farm pitch
- **Claim:** Product photo + ICP + features + setting in a Sheet → agents write script + video prompt → 10/day or 10/hour, no actors, TikTok Shop.
- **Reasoning:** This is the money close hiding in “future video.”
- **Mechanism:** Not built on tape. Hint only.
- **Evidence:** “however many you want.”
- **Conditions:** None shipped.
- **Exceptions:** Sora no-person rule fights “same ambassador every time” (he points at V3 for that).
- **Action:** Operate-never as a SKU. Steal only “structured inputs → prompt specialist → human ships.”
- **Confidence:** high that he pitched it
- **Source:** `Vm8QOo9MiC4` @ UNKNOWN — “10 coming out a day, 10 coming out an hour”
- **Epistemic:** SOURCE

## C. Mental Models

- **Cheap marketplace + poll loop = the integration.** Not the Sora app. **SOURCE**
- **Miss first, then the specialist.** Mug-throw is pedagogy. **SOURCE**
- **Vendor rules are product.** No-person, cameo nerves, 500s. **SOURCE**
- **Cinematographer language is the skill people sell to marketing teams.** **SOURCE**
- **Sanitize at the wire.** **SOURCE**
- **“Create anything / 10× / 6×” is the title.** The tape is curl + wait. **INFERENCE**

## D. Procedures

1. **One shot type** (text / image / cameo / storyboard). Do not mix until the poll works.
2. **Submit → task id → poll** every N seconds until success **or** fail.
3. **If image:** public URL, no person, crop the first frame.
4. **If cameo/likeness:** stop for this desk.
5. **Raw vs optimized** on the same concept before you scale.
6. **Replace newlines and quotes** before JSON.
7. **Log 500s** as vendor/filter; do not infinite-loop.
8. **Human picks the file.** No auto-post.
9. **Qualify / frame:** cheap-Sora shopping-cart. Starbucks/UGC are props.
10. **Objections:** “6× cheaper, no watermark” — UNVERIFIED + operate-never strip.
11. **Avoid:** Kie/FAL/Sora install; cameo farm; 10/hour Sheet.
12. **When to change:** if the next step is TikTok/IG, park. Publish is HITL.

## E. Examples

**Situation:** Mug-throw one-liner.  
**Action:** He runs the two HTTP calls and plays the file.  
**Reasoning:** Show the miss.  
**Outcome:** Slow-mo, weird audio.  
**Lesson:** Pattern works; quality does not. Implicit rule: a 200 is not a good clip.

**Situation:** Same professor sentence, then the cinematographer agent.  
**Action:** Side-by-side play.  
**Reasoning:** Rubric vs raw.  
**Outcome:** More shots, more cinematic, longer render.  
**Lesson:** Specialist prompt is the lever. Implicit rule: compare two files, do not trust the rubric alone.

**Situation:** Curl-cream still, UGC script.  
**Action:** Image-to-video, portrait, locked product + line.  
**Reasoning:** Shop-ad analog.  
**Outcome:** Line + product match; first frame is the still; person-in-still would have been rejected.  
**Lesson:** Vendor rules shape the machine. Implicit rule: faceless product in, actor farm out.

## F. Decision Rules

- If there is no poll → you do not have a job, you have a hope.
- If `failed` is unhandled → not production-ready (his words).
- If the still has a face → Sora image-to-video is the wrong door.
- If the ask is a celebrity or “your avatar on social” → operate-never.
- If the agent wrote JSON → sanitize.
- Optimize: one text-to-video **draft** with poll-until-done.
- Refuse: Kie farm, watermark-strip pitch, auto-publish.

## G. Contrarian

- Against “Sora app is the product”: he treats Kie + poll as the product.
- Against “Pro is required”: he has not seen a huge gap; stay cheap.
- Against fixed waits: poll.
- Field assumes UGC-without-actors is the offer. We steal the shot-list, not the farm.

## H. Assumptions

**His:** Kie quality ≥ OpenAI; $5 lasts; Skool JSON is enough; marketing departments will pay for prompt teaching; watermark-off is a feature.

**Ours:** Captions complete enough (6830 words). Clip quality **UNVERIFIED**. $0.10 / $0.015 / 6× / $5 / 10× / 35 min / 180s = **UNVERIFIED**. Domain-specific: creative-API tutorial + a farm hint.

**Falsifiers:** Kie output is worse or watermarked anyway. Poll misses `failed` and posts garbage. Cameo TOS tightens to a ban. JSON sanitize is not enough for other break characters.

**Disagreement (keep labeled):** Hive will not operate Kie/Sora/FAL, cameos, or a UGC actor farm. The **poll-until-done**, **prompt-specialist**, **sanitize-the-wire**, and **raw-vs-optimized** machines are still stolen. **SYSTEM SYNTHESIS**

## I. Questions

- Is the no-watermark file actually clean, or just a second encode? (Not inspected.)
- What failed the Shaq/Cuban prompts — TOS or model?
- Exact replace expressions — in the Skool JSON, not in `full.txt`.
- Sibling VO 3.1 tape he teases — do not invent the id.
- Real $ per 15s after retries/500s — not on tape.

## J. Connections

- **SYSTEM SYNTHESIS** → `motion-pipeline` / `clip-factory` (still → clip; human ships).
- **SYSTEM SYNTHESIS** → `golden-test-loop` (raw vs optimized).
- **SYSTEM SYNTHESIS** → `one-channel-deep` (no 10/hour).
- **SYSTEM SYNTHESIS** → `ask-principal` (publish, any $5 top-up).
- **SYSTEM SYNTHESIS** → `cinematic-recipe` (taste language; $ claims UNVERIFIED).
- Do not force a TikTok-shop ICP.

## K. Future-Use

- Failed-state switch as a Watchdog notify (unassigned).
- Sheet-of-four-inputs as a structured brief, not a farm (unassigned).
- First-frame crop as a Creative SOP (unassigned).
- 500 = vendor-or-filter as a Researcher break/fix (unassigned).

## Steal / Operate-never

### Machine: One shot type → submit → poll to success/fail → prompt specialist → sanitize JSON → human picks
- **Epistemic:** SOURCE (demos) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** trigger (need a motion draft) → pick text or faceless still → optional prompt specialist (subject/set/camera) → strip newlines/quotes → submit → poll ~10s until success or fail → review the file (crop first frame if image-to-video) → compare raw vs optimized if quality matters → Evens publishes or kills.
- **Questions / signals:** “Is there a person in the still?” “What is the terminal state?” “Did we sanitize?” “Is this a cameo?”
- **Qualify / frame / objections:** Cheap-Sora cart. “10× / 6× / no watermark” is the magnet. Objection: UGC without actors — answer: farm + likeness stay killed.
- **Procedure:** D steps 1–8. Checkable stops: (1) poll handles fail, (2) no face in still, (3) JSON clean, (4) human pick, (5) no post.
- **Example that proves it:** Professor one-liner vs cinematographer rewrite — same line, more cinematic, longer render. Lesson: specialist is the lever; poll is the wait.
- **Why it works:** Async video needs a terminal state. Taste needs a rubric and a compare. Models break JSON. Conditions: one operator, one draft. Exceptions: 35-min storyboard; 500s; cameo rejects; $ unverified.
- **Conditions / exceptions:** Cursor + Grok only. Kie / FAL / Sora / Skool stay on tape. Higgsfield/AE we already have if we motion. Clients parked.
- **Operate-never payload:** Kie/FAL/Sora farm; cameos; watermark-strip; auto-publish; 10/hour Sheet; quote $0.10 / $0.015 / 6× / $5 / 10× as FACT; new hunt.
- **Hive run (existing skills only):** `motion-pipeline` · `clip-factory` · `golden-test-loop` · `cinematic-recipe` · `one-channel-deep` · `ask-principal`.
- **Source:** `Vm8QOo9MiC4` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Kie / FAL / Sora farm, cameos, watermark-strip, auto-publish
- Install those vendors / Skool JSON as hive OS
- Quote $0.10 / $0.015 / 6× / $5 / 10× as FACT
- New `icp_id` / unpark Normand / UGC-ad hunt
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md` (Researcher owns that)

## L. Role-Specific Applications

I manage; I do not stand up a cheap-Sora farm because a Starbucks clip slapped.

- **Done** on this slice: one text-to-video **draft** with poll-until-done and a fail state named. Not cameos. Not a watermark-strip pitch.
- **Delegate without being asked:** Creative owns still→clip; Publishing does not post; Watchdog owns the fail branch; I do not open a Kie lane.
- **Skeptical review:** “10× / 6× / no watermarks” is the cold open. 35 minutes for a frog. I will not approve hourly UGC.
- **One system this take:** poll + prompt specialist + human pick. Not a Sheet-to-TikTok mill.
- Live hunt stays parked. I do not rotate to TikTok Shop because curl cream talked.
