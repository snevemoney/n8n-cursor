# Creative Studio — AYsg5gAMWyo
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/AYsg5gAMWyo/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/AYsg5gAMWyo/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate: **Ultimate UGC Content System** (VO3.1 / Nano Banana+VO3.1 / Sora 2). Caption-only. Visual/click UNKNOWN. Beats: Sheet row = product photo + ICP + features + setting + model; status=`ready`, first matching row; switch three paths; **Nano+VO** is the long path: image-prompt agent (do not alter product) → Key AI Nano Banana → wait/poll (food-truck #43) → OpenAI describe still → video-prompt+dialogue agent → VO3.1 fast 9:16 → poll → Sheet `finished` + URL; Sora rejects realistic-looking humans (cameos workaround, sister tape); live neck-fan (Amazon still, gardener ICP); he likes Nano+VO still (gold text/circles match); Sora clip “confused where this thing came from”; VO-only = **HDR orange glow**, creatine **jar→bag**, first frame = raw product still (bad feed of identical thumbs); rank **Nano+VO > Sora > VO-only**; cost via Key: Nano **$0.02** + VO-fast 8s **$0.30** = **$0.32** vs Sora 10s **$0.15** (UNVERIFIED) — 2× spend vs 2× volume; GPT-5 Mini on prompts; templates “not optimized”; Skool JSON + Sheet; Plus **200** UNVERIFIED. n8n / Key AI / Skool on tape. **Auto-post branch exists — he would not auto-post VO/Sora because of first-frame.**

## B. Atomic Knowledge

### Product must survive the generate
- **Claim:** If the jar becomes a bag, you cannot sell it. Nano Banana’s job is “person wearing/holding **this** SKU,” then VO animates that still.
- **Evidence:** “we need to make sure that the product image looks actually good in our final copy. Otherwise, we’re not going to be able to sell any of that.” Jar→bag on VO-only; Nano path kept gold text/circles.
- **Conditions:** Paid UGC / product ads.
- **Exceptions:** Non-SKU mood films.
- **Action:** Still-check the SKU before any post.
- **Confidence:** SOURCE.
- **Source:** `AYsg5gAMWyo` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** demonstrated
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN (caption-only)
- **Failed / retried:** VO-only jar→bag; Sora extra object hallucination.
- **Speech ≠ behavior:** none

### First frame is the feed
- **Claim:** Image-to-video starts on the reference. Raw Amazon pack as frame-0 = every thumb identical. Nano still as frame-0 looks like a real selfie start.
- **Evidence:** “the first frame is the reference image… every single thumbnail on your feed would look the exact same and that I think would just come across really bad.”
- **Conditions:** Short-form UGC.
- **Exceptions:** Some people want the pack as thumb — he rejects that.
- **Action:** Do not auto-post VO/Sora from pack-shot.
- **Confidence:** SOURCE.
- **Source:** `AYsg5gAMWyo` @ UNKNOWN
- **Epistemic:** SOURCE

### Sanitize the JSON body or the render never starts
- **Claim:** Newlines, straight quotes, and curly quotes break Key AI. Three replaces are the guardrail.
- **Evidence:** “that will actually break our request”; extra replace for “double curly quotes.”
- **Conditions:** Prompt-in-HTTP.
- **Exceptions:** None on tape.
- **Action:** Strip before POST; poll on task id.
- **Confidence:** SOURCE.
- **Source:** `AYsg5gAMWyo` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
A/B models with **the same** sheet row or you are not comparing models. Template prompts are a start, not the voice. Cheap Sora volume vs SKU-faithful Nano+VO. Orange HDR is a look reject. Analyze-image before video prompt is optional but “higher quality.”

## D. Procedures
1. Sheet: photo, ICP, features, setting, model, status=ready.
2. One row. Switch path.
3. If Nano+VO: image prompt (product frozen) → generate → poll → describe still → video+line → VO → poll → write URL.
4. If Sora: no fake-human still; pack or cameo.
5. Watch the first frame + SKU. Do not auto-post.
Avoid: Key/n8n/Skool; 0.32/0.15/200 as FACT; auto-post; fake-3D / cheap UGC as our look.

## E. Examples
**Situation:** Neck fan, gardener, Amazon photo.  
**Action:** Nano still (green fan, gold text) → VO line about light/air/battery.  
**Outcome:** He calls voice/tonality impressive.  
**Lesson:** Worn product is harder than held — still must match.

**Situation:** Creatine VO-only.  
**Action:** Same prompt family.  
**Outcome:** Jar becomes bag; hoodie gets logo.  
**Lesson:** Brand font surviving is not SKU surviving.

**Situation:** Identical pack-shot thumbs.  
**Action:** He would not auto-post.  
**Lesson:** First frame is Creative Studio’s veto.

## F. Decision Rules
- If SKU mutates → kill the cut.
- If frame-0 is the pack-shot → do not publish a series.
- If Sora + realistic face still → expect reject (cameo or skip).
- If $ / 200 from this tape → UNVERIFIED.

## G. Contrarian
“Ultimate UGC” still should not auto-post. Sora is cheaper and he still ranks Nano+VO first because the **still** is honest. Orange VO glow is a no.

## H. Assumptions
$0.02 / $0.30 / $0.32 / $0.15 / 200 members UNVERIFIED. On-tape n8n / Key / VO / Sora / Skool. Clients parked. Caption-only: clips, orange glow, jar/bag = unobserved.

## I. Questions
What did the orange glow look like on the still? Exact 9:16 crop? Did he ever post one?

## J. Connections
- SYSTEM SYNTHESIS → `clip-factory` (draft pack, HITL post).
- SYSTEM SYNTHESIS → `cinematic-recipe` (look reject: HDR orange).
- SYSTEM SYNTHESIS → `7UNsK9LoORo` (vision stills).

## K. Future-Use
SKU-lock + first-frame veto. Unassigned.

## Steal / Operate-never

### Machine: sheet row → SKU-faithful still → line → HITL (never auto-post)
- **Epistemic:** SOURCE
- **Workflow / loop:** ready row → path switch → (optional) person+SKU still → describe → 8s line → poll → watch frame-0 + SKU → human posts
- **Questions / signals:** Jar still a jar? Orange glow? Identical thumbs?
- **Qualify / frame / objections:** Cheap volume ≠ convertible UGC
- **Procedure:** Product-frozen image prompt; strip JSON junk; one row at a time
- **Example that proves it:** Neck-fan match vs creatine bag; first-frame warning
- **Why it works:** UGC converts when the object is real and the thumb is not a catalog tile
- **Conditions / exceptions:** $ UNVERIFIED; Sora face-block
- **Operate-never payload:** n8n/Key/Skool; auto-post; 32¢ as FACT
- **Hive run:** `clip-factory`; `cinematic-recipe`; `ask-principal`
- **Source:** `AYsg5gAMWyo` @ UNKNOWN

### Operate-never
- Auto-post UGC. Install n8n / Key AI / Skool.
- Quote 32¢ / 15¢ / 200 as FACT. Ship orange-HDR / jar-mutated SKU.
- New hunt. Merge `LESSONS-FROM-TAPE.md`. Game-studio / cheap taste / NSFW.

## L. Role-Specific Applications
Video-first: plate **Nano still vs VO-only bag** and the **identical first-frame thumbs**. This desk vetoes auto-post and orange glow. Dialogue is a line card, unsent. HITL. Clients parked.
