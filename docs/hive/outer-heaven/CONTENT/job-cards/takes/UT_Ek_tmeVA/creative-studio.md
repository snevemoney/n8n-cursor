# Creative Studio — UT_Ek_tmeVA
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/UT_Ek_tmeVA/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/UT_Ek_tmeVA/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nano Banana Photoshop-agent short. Beats: built the agent; demo edit-image: “photorealistic advertisement of the granola image, held in front of the Eiffel Tower”; agent must find file ID in memory or raw files; searches raw files; calls edit image; folder “AI image generation” → file “granola ad Eiffel”; bag looks exact; held in front of tower; “if that’s not a good ad creative…”; words mostly spot-on except top line (“ingredients you can see and pronounce” fails); two reasons: RAW file is low quality / unreadable; model will get better; current prompting is minimal; play-button magnet to full breakdown. Caption ingest.

## B. Atomic Knowledge

### Source-quality bounds the ad
- **Claim:** The failed top line is blamed on a low-quality RAW still plus thin prompting — not on “the agent is dumb.”
- **Reasoning:** You cannot read the source type; the model cannot honor it.
- **Mechanism:** Low-res RAW → edit-image → type drift on the hard line.
- **Evidence:** “in the RAW files, this is a pretty low quality image. So like I can't even read what that says… prompting that is in this current workflow is very minimal.”
- **Conditions:** Product type must survive the edit.
- **Exceptions:** A locked high-res still + a real brief should be the A-path.
- **Action:** Refuse to generate from an unreadable RAW.
- **Confidence:** high as his own postmortem.
- **Source:** `UT_Ek_tmeVA` @ 00:34
- **Epistemic:** SOURCE

### File-find then edit
- **Claim:** Agent must locate the granola file ID (memory or raw search) before edit-image.
- **Reasoning:** Edit is useless if it paints the wrong file.
- **Evidence:** “find the file ID of the granola image, whether that's in the memory or if it has to search the raw files. Looks like it just searched the raw files”
- **Conditions:** A named raw folder exists.
- **Exceptions:** Auto-name / first-file is the failure mode.
- **Action:** Named file in, named file out (`granola ad Eiffel`).
- **Confidence:** SOURCE for this demo.
- **Source:** `UT_Ek_tmeVA` @ 00:00
- **Epistemic:** SOURCE

## C. Mental Models
Ad creative = product identity + new scene. He judges type, not just “looks cool.” He excuses the miss with “model will get better” — hive should treat that as hope, not a pass. Minimal prompt is admitted.

## D. Procedures
1. Keep product stills in a raw folder.
2. Ask for a named scene (Eiffel hold).
3. Agent searches raw → edit-image.
4. Open the named output.
5. Read every word on the pack.
6. If source type is unreadable → fail the job, do not ship.

Avoid: accepting “model will get better” as a pass.

## E. Examples
**Situation:** Granola bag → Eiffel ad.  
**Action:** Raw search → edit-image → `granola ad Eiffel`.  
**Reasoning:** Photoreal hold as the ad.  
**Outcome:** Bag/scene good; top line wrong because RAW + thin prompt.  
**Lesson:** Identity can pass while type fails; type is the stop.

## F. Decision Rules
- If you cannot read the RAW type → do not run edit-image.
- If the output type drifts → fail, even if the scene is pretty.
- If the prompt is “very minimal” → that is a defect, not a flex.

## G. Contrarian
He still calls it a good ad creative while showing a type miss. Hive should keep the miss in the room.

## H. Assumptions
Nano Banana / n8n on tape — do not install as hive stack. One granola SKU. “Model will get better” is a hedge.

## I. Questions
What did the top line actually render? Visual-only miss not fully spelled. Full video differences?

## J. Connections
- SYSTEM SYNTHESIS → `TWvjqpk3uSQ` (combine Nate + granola on a mountain).
- SYSTEM SYNTHESIS → `uC5tDwGhyVA` (still-lock).
- SYSTEM SYNTHESIS → `cinematic-recipe` / `golden-test-loop` (type as fail).

## K. Future-Use
Readable-RAW gate before any product generate. Unassigned.

## Steal / Operate-never

### Machine: readable-RAW then scene-edit
- **Epistemic:** SOURCE
- **Workflow / loop:** named RAW still (readable type) → scene brief → find file → edit-image → read every word → pass/fail
- **Questions / signals:** Can you read the pack? Did the hard line survive?
- **Qualify / frame / objections:** Pretty scene ≠ pass
- **Procedure:** Do not generate from an unreadable still; do not accept “model will improve” as a ship
- **Example that proves it:** Granola + Eiffel → bag/scene good, ingredients line fails
- **Why it works:** Product ads die on type, not on the landmark
- **Conditions / exceptions:** Needs a named raw folder and a locked still
- **Operate-never payload:** Nano Banana / n8n-cloud install; auto-publish ads; granola mill
- **Hive run:** `cinematic-recipe`; `product-ad-from-photo`; `golden-test-loop`
- **Source:** `UT_Ek_tmeVA` @ 00:34

### Operate-never
- Install Nano Banana / n8n-cloud / switch stack.
- Auto-publish. New hunt. Quote “good ad creative” as FACT while type fails.
- Merge `LESSONS-FROM-TAPE.md`. Game-studio / fake 3D / cheap taste / NSFW.

## L. Role-Specific Applications
Video-first: Photoshop-agent title; the plate is **pack type readable**. This desk vetoes the Eiffel still if the ingredients line is garbage. Previs / bible before the next generate. HITL. Clients parked.
