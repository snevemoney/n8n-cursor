# Day Planner — UT_Ek_tmeVA
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/UT_Ek_tmeVA/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/UT_Ek_tmeVA/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Short: Nano Banana Photoshop agent in n8n. Demo: “photorealistic ad of the granola image held in front of the Eiffel Tower”; agent finds file ID (memory or raw-files search — it searched raw); calls edit-image; writes `granola ad Eiffel` into an AI image folder; he likes the ad; text miss at top (“ingredients you can see and pronounce”); two reasons: low-quality source in RAW, model will get better, prompt in this workflow is minimal. CTA to full breakdown (`TWvjqpk3uSQ` / `7UNsK9LoORo`). Timestamp UNKNOWN. Vendor: NanoBanana — on-tape.

## B. Atomic Knowledge
### Find the file, then edit — do not re-upload from chat
- **Claim:** The agent must find the granola file ID in memory or raw files, then call edit-image.
- **Reasoning:** The source already lives in the folder.
- **Mechanism:** Search raw files → file ID → edit-image tool.
- **Evidence:** “find the file ID of the granola image, whether that’s in the memory or if it has to search the raw files.”
- **Conditions:** A named source file exists.
- **Exceptions:** No file → cannot edit.
- **Action:** One edit block; human opens the folder.
- **Confidence:** high as the demo path.
- **Source:** `UT_Ek_tmeVA` @ UNKNOWN
- **Epistemic:** SOURCE

### Text miss is blamed on source quality + thin prompt
- **Claim:** Words are “pretty much spot-on” except the top line; RAW is low quality; prompt is minimal; model will improve.
- **Reasoning:** Fail has causes he can name.
- **Mechanism:** Compare output text to intended copy.
- **Evidence:** “this is supposed to say ingredients you can see and pronounce.”
- **Conditions:** Copy is readable on the source.
- **Exceptions:** If source is unreadable, do not expect the model to invent the line.
- **Action:** Checkable stop = readable intended copy, not “looks like an ad.”
- **Confidence:** high he named the miss.
- **Source:** `UT_Ek_tmeVA` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Folder + file ID is the source of truth. A pretty ad with a wrong headline is still a miss. He excuses the model and the prompt rather than stopping the publish — we will stop. Priority: show the tool, then CTA.

## D. Procedures
1. Name the source file.
2. Search memory/raw for file ID.
3. Edit-image with a specific scene.
4. Open the output folder.
5. Read the text. If the headline is wrong → fail, do not post.
Avoid: NanoBanana install; “model will get better” as a pass.

## E. Examples
**Granola at the Eiffel:** Situation → granola bag in RAW. Action → NL request for a photoreal ad in front of the Eiffel; agent searches raw, edits. Reasoning → file ID then tool. Outcome → bag looks right; top line wrong. Lesson → identity + readable copy are the stop.

## F. Decision Rules
- If source text is unreadable → do not expect a correct headline.
- If the headline is wrong → fail, even if the bag looks right.
- If the vendor is NanoBanana → on-tape only.

## G. Contrarian
Rejects “re-generate from a chat upload every time.” He searches the existing file. Also quietly rejects perfect-copy-now — we do not.

## H. Assumptions
Theirs: model + prompt will improve enough. Ours: a wrong headline is a fail today. Falsifier: file-ID search grabs the wrong granola. Survivorship: one pretty demo.

## I. Questions
Full node graph in `7UNsK9LoORo`? Same granola as the long Photoshop tape? Who writes the prompt if “minimal” is the miss?

## J. Connections
- SYSTEM SYNTHESIS → `TWvjqpk3uSQ` · `7UNsK9LoORo` · `cinematic-recipe` · `golden-test-loop` (named text fail).

## K. Future-Use
File-ID-then-edit as a parked media step. Unassigned. Teaser ≠ second job.

## Steal / Operate-never

### Machine: file-ID search → edit → read-the-headline stop
- **Epistemic:** SOURCE
- **Workflow / loop:** name file → search raw/memory → edit-image → open folder → read headline → pass/fail
- **Questions / signals:** Did it grab the right file? Is the intended copy readable on the source?
- **Qualify / frame / objections:** “Looks like an ad” is not a pass. Wrong headline is a fail.
- **Procedure:** One edit. Human reads text. No publish. No NanoBanana install.
- **Example that proves it:** Situation → granola in RAW. Action → Eiffel ad request. Reasoning → file ID then edit. Outcome → bag good, top line wrong. Lesson → text is the stop.
- **Why it works:** Source file keeps identity; a headline check is cheap.
- **Conditions / exceptions:** Unreadable source → fail before the model. Vendor on-tape.
- **Operate-never payload:** Install NanoBanana; auto-publish; “model will get better” as a ship rule.
- **Hive run (existing skills only):** `cinematic-recipe` · `golden-test-loop`.
- **Source:** `UT_Ek_tmeVA` @ UNKNOWN

### Operate-never
- Install NanoBanana / switch stack.
- Publish the miss.
- Quote “good ad creative” as FACT.
- Send / pay / deploy / book / publish.

## L. Role-Specific Applications
**One next:** `coverage-loop` score this packet as headline-check after one edit. Clients parked — I do not put a NanoBanana publish on the weekday board.
