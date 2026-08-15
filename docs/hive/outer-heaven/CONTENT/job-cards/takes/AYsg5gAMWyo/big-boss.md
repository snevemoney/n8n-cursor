# Big Boss — AYsg5gAMWyo
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/AYsg5gAMWyo/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/AYsg5gAMWyo/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Nate Herk (PACKET: 26:04, 6230 words, captions `en-orig`). Timestamp UNKNOWN on `full.txt`. Visual-only gaps: Sheet rows, three-path n8n canvas, Kie.ai model list, generated stills/clips (gummies, hair shine, neck fan, forearm strengthener), first-frame freezes. On-tape models: VO3.1, Nano Banana, Sora 2, GPT-5 Mini, Kie.ai. **Do not install his stack. Do not auto-post.**

Beats, in order:

1. Hook: many video models dropped — build one sheet that can use all of them. Question: which is best for UGC ads.
2. Inputs: product photo, ICP, features, setting, **model pick**. Paths: VO3.1 / Nano+VO / Sora 2. Free Skool template.
3. Pre-recorded compare: creatine gummies (young adults, car-to-gym) and hair shine (gloss, no grease) on all three. Captions of the lines; we do not see the pixels.
4. Live product: real Amazon **neck fan**. ICP: middle-aged outdoor / landscapers / construction. Setting: woman in a garden. Value prop: dump rows, get “tons of UGC” daily.
5. Sheet trigger: status=`ready`, **return only the first matching row**. Switch on model.
6. Hard path (Nano+VO) walked in full: image-prompt agent (product must not change) → HTTP Kie Nano Banana → wait 5s + poll `state=success` → OpenAI **describe the still** → video-prompt agent (also writes dialogue from features) → HTTP VO3.1 fast → wait 10s + poll → Sheet update by unique row number (`finished` + URL).
7. Guardrails: strip newlines (and later quotes / curly quotes) so JSON to Kie does not break. Vertical 9:16. Prompts are “not perfect”; customize.
8. Why Nano first: Sora **rejects** a realistic human still (even AI-generated). VO does not. Sora workaround on tape = **cameos** (other video).
9. He watches the neck-fan Nano+VO clip: wearing not holding; voice/tone “impressive.”
10. Sora path: no analyze-image step; same prompt headers; 10s clips; poll 1.5–3 min typical. Output: good selfie; a **hallucinated extra object**; first frame = Amazon still.
11. VO-only path: same prompt as Sora except 8s vs 10s — he kept prompts consistent on purpose. ~80s. Weaker; “HDR orange glow.”
12. Rank on tape: **Nano+VO > Sora > VO**. Reasons: product fidelity (gummies jar→bag on VO; forearm matches only with Nano); first-frame slam on raw image-to-video.
13. **Do not auto-post** VO or Sora as-is — first milliseconds are the reference still; every thumb would look the same. Some people like it as a thumb; he thinks it looks bad.
14. Cost via Kie (his “cheapest I’ve seen”): Nano **2¢** + VO fast 8s **30¢** = **32¢**; Sora 10s **15¢**. ~2×. Will it convert 2×? Unknown. **$ UNVERIFIED.**
15. Future: models get better/cheaper (Sora 4 / V4 tease). GPT-5 Mini on all prompt agents.
16. Close: Skool JSON + Sheet copy + setup guide; Plus live-build / 10 hours to 10 seconds / one-person agency course / **200** Plus members. **UNVERIFIED.**

Off-topic / not skipped: Kie as “OpenRouter for image/video”; food-truck order-number metaphor; forearm example only at the end.

## B. Atomic Knowledge

### One ready row is the job
- **Claim:** The factory pulls the first Sheet row with status `ready` and the chosen model. It does not fire all six rows.
- **Reasoning:** One artifact you can watch beats a pile you will not grade.
- **Mechanism:** Get rows filtered + “return only the first matching row” → switch → one path.
- **Evidence:** “We don’t want to do all six of these at a time.”
- **Conditions:** Status column is the queue. Human marks ready.
- **Exceptions:** He says you could change it to batch. That is the farm door.
- **Action:** `slice-build` + `golden-test-loop`: one row, then rank.
- **Confidence:** high
- **Source:** `AYsg5gAMWyo` @ UNKNOWN — “return only the first matching row”
- **Epistemic:** SOURCE

### The sheet is the brief; agents write prompts, not pixels
- **Claim:** Humans fill photo, ICP, features, setting, model. Agents emit image/video prompts (and dialogue). Kie generates.
- **Reasoning:** Taste and product truth stay upstream. The model is a renderer.
- **Mechanism:** System prompts: “generate detailed image prompts, not the images”; video agent also writes the spoken blurb from features.
- **Evidence:** Neck-fan dialogue restates light / airflow / battery from the feature cells.
- **Conditions:** Works when the row is specific. He says templates are not optimized.
- **Exceptions:** VO still turned a gummy **jar into a bag** despite “do not change the product.”
- **Action:** Steal row-as-brief. Do not treat prompt agents as a publish button.
- **Confidence:** high
- **Source:** `AYsg5gAMWyo` @ UNKNOWN — “AI agents here that are trained to prompt”
- **Epistemic:** SOURCE

### Vendor blocks are data, not a workaround hunt
- **Claim:** Sora blocks a realistic human still, even if Nano just made it. That is why the winning path is Nano→VO, not Nano→Sora.
- **Reasoning:** A content policy is a stop. Cameos are his other-video escape, not a hive SKU.
- **Mechanism:** Extra still hop only on the Nano+VO branch; Sora/VO take the Sheet photo straight to video.
- **Evidence:** “If you tried to feed that into Sora 2, it would block you because of content restrictions.”
- **Conditions:** True as of this tape’s Sora.
- **Exceptions:** Cameos mentioned, not built here.
- **Action:** Record the block. Do not shop for a face-clone bypass.
- **Confidence:** high
- **Source:** `AYsg5gAMWyo` @ UNKNOWN — “even if it’s an AI generated human, it’s going to reject it”
- **Epistemic:** SOURCE

### Poll the vendor; do not guess done
- **Claim:** Kie returns a task ID. Wait (5s image / 10s video), GET until `state=success`, else loop. Image ~15s (3 waits); VO ~80s (8 waits) on the live fan.
- **Reasoning:** Same physics as Vapi poll-until-ended. “Submitted” is not the artifact.
- **Mechanism:** Food-truck ticket metaphor. False → back to wait.
- **Evidence:** He counts the loops on tape.
- **Conditions:** Vendor has a job ID and a success state.
- **Exceptions:** Queue time depends on “how many people in the world” hit Kie. 1–3 min ranges are feel. **UNVERIFIED** as SLA.
- **Action:** Checkable stop = success + URL written back to the same row number.
- **Confidence:** high
- **Source:** `AYsg5gAMWyo` @ UNKNOWN — “state equals success”
- **Epistemic:** SOURCE

### Sanitize the payload or the job never starts
- **Claim:** Newlines, double quotes, and curly quotes in agent output break the Kie JSON body. He `replace`s them before POST.
- **Reasoning:** Prompt models are sloppy; HTTP is not.
- **Mechanism:** Expression on the body; extra replace after a model emitted fancy quotes.
- **Evidence:** He deletes the expression live to show the line breaks; Sora prompt still had newlines — “good thing we have that guardrail.”
- **Conditions:** Any NL → JSON vendor.
- **Exceptions:** He almost cut off the last sentence of one system prompt and hoped it was fine.
- **Action:** Treat payload hygiene as a Forge check, not as “the model will behave.”
- **Confidence:** high
- **Source:** `AYsg5gAMWyo` @ UNKNOWN — “that will actually break our request”
- **Epistemic:** SOURCE

### Describe the still before you ask for motion
- **Claim:** After Nano, an OpenAI describe step feeds the video agent so dialogue and motion match wardrobe/scene. He has skipped it; quality felt worse.
- **Reasoning:** The video model sees the image, but the prompt agent does not unless you tell it.
- **Mechanism:** Describe environment + person + product → injected as “reference image description.”
- **Evidence:** Light-blue shirt and garden beds show up in the VO prompt.
- **Conditions:** Only on the image-then-video path.
- **Exceptions:** “Still works” without it. Feel, not an A/B table.
- **Action:** If we ever still→clip, pass a short describe. `motion-pipeline` previs.
- **Confidence:** medium
- **Source:** `AYsg5gAMWyo` @ UNKNOWN — “I have tried doing this without the analyze image step”
- **Epistemic:** SOURCE

### Keep the prompt constant if the question is “which model”
- **Claim:** VO-only and Sora paths share headers; he only swapped duration (8 vs 10) and model name so the compare is about the renderer.
- **Reasoning:** If prompts wander, you are scoring prompt drift, not models.
- **Mechanism:** Copy-paste system prompt; change the two knobs.
- **Evidence:** “Limit the variability… to truly see the power of these models.”
- **Conditions:** The research question is a bake-off.
- **Exceptions:** Nano path necessarily has an extra still hop — not a fair pixel-identical start.
- **Action:** One variable at a time. Rank after watch.
- **Confidence:** high
- **Source:** `AYsg5gAMWyo` @ UNKNOWN — “as many things consistent as we can”
- **Epistemic:** SOURCE

### First frame is a ship decision
- **Claim:** Image-to-video opens on the reference still. That makes a free thumb and a bad feed if every post starts the same. He would **not auto-post** VO or Sora for that reason. Nano+VO starts on a staged still, so the slam looks like the scene.
- **Reasoning:** Publish is a human look. Automation can create; it must not ship.
- **Mechanism:** Optional auto-post branch mentioned and rejected for two of three paths.
- **Evidence:** Jar/bag miss and orange glow are additional reject reasons.
- **Conditions:** Short-form UGC on a grid.
- **Exceptions:** “Some people argue that it’s good because then you have a thumbnail.”
- **Action:** `one-channel-deep` + `ask-principal`. No auto-post.
- **Confidence:** high
- **Source:** `AYsg5gAMWyo` @ UNKNOWN — “I probably wouldn’t auto post”
- **Epistemic:** SOURCE

### Cost-per-clip is a compare input, not a FACT
- **Claim:** Via Kie he quotes 32¢ (Nano+VO fast) vs 15¢ (Sora 10s). Asks if quality/conversion is 2× — does not answer.
- **Reasoning:** Cheap doubles volume; volume is the farm.
- **Mechanism:** Verbal arithmetic on vendor list prices.
- **Evidence:** “Is it two times higher quality and will it result in two times more conversions?”
- **Conditions:** His Kie prices on this date. **$ UNVERIFIED.**
- **Exceptions:** No conversion data. No ad spend. Products are props (Amazon fan, gummies).
- **Action:** Do not quote 2¢ / 15¢ / 32¢ as ours. Do not optimize for clip count.
- **Confidence:** high that he said it; none as economics
- **Source:** `AYsg5gAMWyo` @ UNKNOWN — “total cost per piece of content… 32”
- **Epistemic:** SOURCE

### Rank after you watch, and product fidelity can veto pretty
- **Claim:** His order is Nano+VO, Sora, VO. VO’s orange glow and jar→bag / source-mismatch are “huge no no” for a product ad.
- **Reasoning:** UGC that lies about the SKU is not an ad.
- **Mechanism:** Same three products, watch, then rank. Forearm example: Nano matches the photo; VO does not.
- **Evidence:** “The product photo also once again does not exactly match the source image.”
- **Conditions:** You still have the source photo to compare.
- **Exceptions:** Sora neck-fan added a mystery object and still ranked second. Hallucination did not kill it on tape.
- **Action:** Watchdog compares still-to-source before anyone talks publish.
- **Confidence:** high for the rule; medium for the rank traveling
- **Source:** `AYsg5gAMWyo` @ UNKNOWN — “huge no no for me”
- **Epistemic:** SOURCE

## C. Mental Models

- **Sheet row = brief.** **SOURCE**
- **One ready item at a time.** Batch is a choice he declines. **SOURCE**
- **Agents prompt; vendors render.** **SOURCE**
- **Policy blocks are information.** **SOURCE**
- **Poll for success, then write the same row.** **SOURCE**
- **Sanitize JSON or you never get a clip.** **SOURCE**
- **Fair compare = freeze the prompt.** **SOURCE**
- **First frame can disqualify auto-post.** **SOURCE**
- **Wrong product shape vetoes a pretty clip.** **SOURCE**
- **“King of models” is a watched rank, not a brand.** **INFERENCE**
- **Daily tons of UGC is the farm door.** **INFERENCE**

## D. Procedures

1. **Fill one row:** photo, who, features, setting, model, status=ready.
2. **Run one.** First matching ready only.
3. **If the path needs a human-in-scene still** and the video vendor blocks faces → either skip that vendor or generate a still for a vendor that allows it. Do not hunt a clone bypass.
4. **Prompt → sanitize → submit → poll success → (optional describe) → motion prompt → sanitize → submit → poll → write URL on the same row number.**
5. **Watch** source photo vs first frame vs spoken claims.
6. **Rank** only after watch. Product mismatch = fail.
7. **Do not auto-post.** Especially if first frame is the raw catalog still.
8. **Cost column is UNVERIFIED.** Do not use it to justify volume.
9. **CTA on tape** is Skool/Plus. Ours is none.

**Qualify / frame:** Faceless UGC mill demo. Amazon fan is a prop.
**Objections:** “Ultimate system” — three paths, one row, human rank. “Auto-post the branch” — he says he would not.
**Avoid:** Kie/Sora/VO as hive stack; clone/cameo; gummy ad farm; quoting ¢ as FACT.
**When to change:** Vendor rejects the still → stop that path. Product shape drifts → fail the clip.

## E. Examples

**Situation:** Real Amazon neck-fan row, model = Nano+VO.  
**Action:** Image prompt → Nano still of woman wearing the fan → describe → VO clip.  
**Reasoning:** Need a wearable scene Sora would block if you tried to reuse that still.  
**Outcome:** He is impressed (wear vs hold).  
**Lesson:** Extra still hop is the machine when the video model hates faces. Implicit rule: impressed ≠ posted.

**Situation:** Same fan, Sora 2.  
**Action:** Sheet photo + video prompt → 10s clip.  
**Reasoning:** Fair-ish compare; no describe step.  
**Outcome:** Authentic selfie; hallucinated extra object; first frame = listing photo.  
**Lesson:** Hallucination and first-frame slam are reject signals. Implicit rule: do not auto-post this path.

**Situation:** Creatine gummies on VO-only.  
**Action:** “Do not change the product” in the prompt.  
**Reasoning:** Fidelity.  
**Outcome:** Jar becomes a bag; hoodie gains a logo; orange glow.  
**Lesson:** Prompted fidelity can still fail. Implicit rule: compare to source or you ship a different SKU.

## F. Decision Rules

- If more than one row is ready → still run one unless Evens asks for a batch (he should not).
- If Sora (or any vendor) blocks the still → do not jailbreak faces.
- If JSON might contain newlines/quotes → strip before POST.
- If `state` ≠ success → wait, do not write `finished`.
- If first frame is the catalog still → no auto-post.
- If the product shape/color/text drifted → fail.
- If the question is “which model” → freeze the prompt.
- Optimize: one compared clip.
- Refuse: UGC farm, faceless mill, Kie account as ours, Plus template.

## G. Contrarian

- Against “use all the models at once”: one row, one path, then compare.
- Against “auto-post the factory”: he rejects it for first-frame reasons.
- Against “Sora is king because it is cheaper”: he still ranks Nano+VO first.
- Against “the prompt said don’t change it, so it didn’t”: jar/bag.
- Field assumes the sheet is a business. It is a bake-off harness.

## H. Assumptions

**His:** Kie is the right multiplexer; GPT-5 Mini is enough; 9:16 selfie UGC converts; Amazon listing photos are fair inputs; Skool free + Plus live is the close; models will get cheaper.

**Ours:** Captions complete (6230 words). All clips **UNVERIFIED** visually. ¢ prices / 1–3 min / 200 Plus members = **UNVERIFIED**. Domain: faceless ads. Kill-as-SKU: UGC/clone farms.

**Falsifiers:** All three paths miss the product. Poll never succeeds. Auto-post lands a bag-as-jar ad. Sora policy changes and the Nano hop becomes unnecessary (rank would need a re-walk).

**Disagreement (keep labeled):** We will not operate a UGC mill or his n8n/Kie factory. We steal one-row, sanitize, poll, freeze-prompt, watch-then-rank, no auto-post. **SYSTEM SYNTHESIS**

## I. Questions

- What does the unused auto-post branch actually call?
- Cameo path: quality vs policy — not on this tape.
- Who is the “influencer” legally if the face is generated?
- Did any of these clips run as paid ads? Not on tape.
- Forearm and hair examples: full Sheet rows not read aloud.

## J. Connections

- **SYSTEM SYNTHESIS** → `clip-factory` + `motion-pipeline` + `one-channel-deep` (create → human ships).
- **SYSTEM SYNTHESIS** → `golden-test-loop` (watch vs source).
- **SYSTEM SYNTHESIS** → `slice-build` (one row).
- **SYSTEM SYNTHESIS** → `ask-principal` (publish).
- **SYSTEM SYNTHESIS** → `IlNwjnIzrOo` (options then pick; no volunteer ship).
- **SYSTEM SYNTHESIS** → `CB5bG4mvnS0` (try to break / headed QA analog: watch the clip).
- Do not add a creator-ads ICP from gummies.

## K. Future-Use

- First-frame check as a Publishing Engine reject (unassigned).
- Payload sanitize as a Forge HTTP checklist (unassigned).
- Product-fidelity compare as Creative Studio QA (unassigned).
- “Vendor block = data” for Researcher packets (unassigned).

## Steal / Operate-never

### Machine: One ready row → sanitize → poll → watch vs source → human ships
- **Epistemic:** SOURCE (demo + rank) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** fill one row → pull first `ready` → path by model → prompt agents (not pixels) → strip dangerous JSON → submit → poll success → optional describe → motion → write URL on the same number → watch source vs clip → fail on product drift or first-frame slam → Evens ships or kills → never auto-post.
- **Questions / signals:** “Only one row?” “Did the vendor reject the face?” “State=success?” “Does the SKU still look like the photo?” “Would every thumb be this still?”
- **Qualify / frame / objections:** UGC mill tape. “Ultimate” is the title. Objection: daily tons of ads — that is the farm.
- **Procedure:** D steps 1–7. Checkable stops: (1) one row, (2) success URL on that row, (3) source-match pass, (4) no auto-post.
- **Example that proves it:** VO gummies jar→bag = fail despite a fluent line. Lesson: pretty speech cannot save a different product.
- **Why it works:** Queue + one item makes rank possible. Polling makes “finished” honest. Frozen prompts make a bake-off real. Conditions: human will watch. Exceptions: Nano path is not pixel-identical; ¢ unverified; cameos unbuilt.
- **Conditions / exceptions:** Cursor + Grok only. Kie/Sora/VO/n8n/Skool on tape. Clients parked. Faceless mill is kill.
- **Operate-never payload:** Auto-post; clone/cameo farm; quote 32¢/15¢ as FACT; Plus template.
- **Hive run (existing skills only):** `slice-build` · `golden-test-loop` · `clip-factory` / `motion-pipeline` · `one-channel-deep` · `ask-principal` · `click-live-site` (if a URL is ever public).
- **Source:** `AYsg5gAMWyo` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Faceless UGC / clone / mass-ad farm / auto-post
- Install Claude / Codex / ChatGPT / Gemini / Coda / Vapi / Abacus / Skool / Kie-as-ours
- Quote “king of models” / 2¢ / 15¢ / 32¢ / 1.5–3 min / 200 Plus as FACT
- New `icp_id` / unpark Normand / gummy or Amazon-gadget hunt
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md` (Researcher owns that)

## L. Role-Specific Applications

I manage; I do not run a gummy factory.

- **Done** on a creative compare: one row, two models max, watched, source-match, no post. “Tons daily” is not done.
- **Delegate without being asked:** Creative Studio packages the still/clip; Watchdog scores fidelity + first frame; Publishing Engine does not ship; I do not add a nameless UGC agent.
- **Skeptical review:** “Ultimate UGC” is the magnet. I will not approve Sora/VO because a neck fan looked authentic.
- **One system this take:** a **draft** compare of two models on **one** real product still we already have. Not a sheet of gummies.
- Live hunt stays parked. I do not rotate to supplement ads or landscaper fans.
