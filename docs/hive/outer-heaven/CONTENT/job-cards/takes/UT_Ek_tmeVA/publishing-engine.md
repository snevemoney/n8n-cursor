# Publishing Engine — UT_Ek_tmeVA
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/UT_Ek_tmeVA/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/UT_Ek_tmeVA/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** I Built a Nano Banana AI Agent in n8n with no code
**Channel:** Nate Herk | AI Automation

## A. Source Map
1. Hook: just built a nano-banana Photoshop AI agent.
2. Demo: “create a photorealistic advertisement of the granola image, held in front of the Eiffel Tower.”
3. Agent finds the granola file ID (memory or raw-files search); searches raw files.
4. Calls edit-image tool; writes `granola ad Eiffel` into an AI image-generation folder.
5. Result: same bag, held in front of the Eiffel Tower — “if that’s not a good ad creative…”
6. Words mostly spot-on except the top line (“ingredients you can see and pronounce” fails).
7. Two reasons: raw file is low quality (he cannot even read it); the image model will get better; current prompting is minimal.
8. CTA: watch the full breakdown.
Timestamp UNKNOWN.

## B. Atomic Knowledge

### File-ID then edit, not “make an ad”
- **Claim:** The agent must find the source file (memory or raw search) before it can edit.
- **Reasoning:** Edit without the right file ID is a different image, not an ad of *this* granola.
- **Mechanism:** Instruction → search raw files → file ID → edit-image tool → named output in a folder.
- **Evidence:** “find the file ID of the granola image, whether that's in the memory or if it has to search the raw files.”
- **Conditions:** A raw folder exists. A name/search can hit it.
- **Exceptions:** A text-to-image with no source file is a different machine (`IlNwjnIzrOo` tries both).
- **Action:** Pack the source-file lock. Do not pack “AI made an ad.”
- **Confidence:** high
- **Source:** `UT_Ek_tmeVA` @ UNKNOWN
- **Epistemic:** SOURCE

### Readable source beats prompt theater
- **Claim:** The failed top line is blamed on a low-quality raw file plus minimal prompting — and he still calls the ad good.
- **Reasoning:** The model cannot read what he cannot read. Prompting is secondary here.
- **Mechanism:** Low-res raw → garbled ingredients line. Better model / better prompt later.
- **Evidence:** “in the RAW files, this is a pretty low quality image. So like I can't even read what that says.”
- **Conditions:** Product text matters.
- **Exceptions:** A hero product with no text may pass without a readable raw.
- **Action:** Refuse to publish an ad whose source text is unreadable.
- **Confidence:** high
- **Source:** `UT_Ek_tmeVA` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
- Photoshop-agent = find file + edit tool + folder name, not a magic ad button.
- He will ship a “good enough” ad while naming the text fail.
- Model quality is a future excuse; raw quality is a now constraint.

## D. Procedures
- Name the source file. Search raw if memory misses.
- Write output to a dated/named folder (`granola ad Eiffel`).
- Read the product text in the result. If the raw was unreadable, do not call the text “spot-on.”
- Point to the long video; do not treat the short as the SOP.

## E. Examples
- **Situation:** Granola bag + Eiffel instruction. **Action:** Search raw → edit-image. **Reasoning:** Need *this* bag. **Outcome:** Bag+tower; ingredients line fails. **Lesson:** Source-file lock + readable raw are the machine; the landmark is costume.

## F. Decision Rules
- If file ID is wrong → fail.
- If raw text is unreadable → do not publish the ad as proof of copy.
- Never treat nano-banana as a hive SKU.

## G. Contrarian
- Field would hide the garbled ingredients. He shows it and blames the raw.

## H. Assumptions
- Theirs: “pretty much spot-on except the top” is acceptable for a short. Ours: that fail is the teach.
- On-tape model will “only get better” — do not wait on that as a plan.
- Clients parked.

## I. Questions
- What is in memory vs raw files?
- Does the long video raise the prompt above “minimal”?
- Who names the output file — agent or human? (`TWvjqpk3uSQ` asks the human.)

## J. Connections
- **SYSTEM SYNTHESIS:** Same granola/Telegram spine as `TWvjqpk3uSQ` / `IlNwjnIzrOo` / `jBanaNBY-sM`.
- **SYSTEM SYNTHESIS:** Readable-source = `uC5tDwGhyVA` still-vs-frame.

## K. Future-Use
- Unassigned: raw-quality gate before any product ad pack.
- Unassigned: named output folder as the walkthrough artifact.

## Steal / Operate-never

### Machine: lock-source-file-then-edit
- **Epistemic:** SOURCE
- **Workflow / loop:** instruction names the SKU → search memory/raw → file ID → edit → named folder → read the text → checkable stop = right bag + readable copy or labeled fail
- **Questions / signals:** Did it search raw? Can a human read the source? Did the ingredients line survive?
- **Qualify / frame / objections:** “Good ad creative” is not enough if the legal/ingredients line is wrong.
- **Procedure:** Human names the file (`TWvjqpk3uSQ`). This desk packages the before/after.
- **Example that proves it:** Granola + Eiffel; bag matches; top line fails because raw is unreadable.
- **Why it works:** Identity is a file ID, not a vibe prompt.
- **Conditions / exceptions:** No raw folder → no lock. Landmark backgrounds are optional costume.
- **Operate-never payload:** Nano-banana/Sora as SKU; publish the granola ad; UGC mill.
- **Hive run (existing skills only):** `clip-factory` · `one-channel-deep` · `ask-principal`
- **Source:** `UT_Ek_tmeVA` @ UNKNOWN

**Operate-never**
- Publish the granola/Eiffel ad. Install the image model.
- Auto-post. Republish Nate.
- Send / pay / deploy / book. New `icp_id`.

## L. Role-Specific Applications
- I package source-still + output + a readable-text fail note. I do not call garbled ingredients “spot-on.”
- I will not cut this as our ad.
- Evens publishes. I do not.
