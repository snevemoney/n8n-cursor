# Librarian — UT_Ek_tmeVA
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/UT_Ek_tmeVA/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/UT_Ek_tmeVA/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** I Built a Nano Banana AI Agent in n8n with no code
**Channel:** Nate Herk | AI Automation
**Kind:** short (~1:10 / ~302 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. Built a "nano banana" Photoshop AI agent.
2. Demo: "create a photorealistic advertisement of the granola image, make it look like it's being held in front of the Eiffel Tower."
3. Agent must find file ID of the granola image — memory or search raw files. It searched raw files.
4. Calls edit-image tool; writes to AI image generation folder as "granola ad Eiffel."
5. Result: granola bag looks like the source; held in front of the Eiffel Tower — "if that's not a good ad creative..."
6. Words mostly spot-on except top line ("ingredients you can see and pronounce" garbled).
7. Two causes: RAW file is low quality (he can't read it); model will get better; current prompting is very minimal.
8. CTA: full breakdown via play button.
Gap: node graph, model name beyond "nano banana." Timestamp UNKNOWN. n8n on-tape.

## B. Atomic Knowledge

### Raw-file search then edit-image
- **Claim:** Agent must resolve a file ID from memory or raw-files search, then call edit-image.
- **Reasoning:** The interesting step is retrieval of the source still, not the prompt poetry.
- **Mechanism:** Message → find file ID (memory | raw search) → edit-image tool → folder write.
- **Evidence:** "this one is going to have to find the file ID of the granola image, whether that's in the memory or if it has to search the raw files."
- **Conditions:** Source image exists in raw/memory
- **Exceptions:** None on tape
- **Action:** File retrieve-then-edit; park NanoBanana as hive
- **Confidence:** high as demo
- **Source:** `UT_Ek_tmeVA` @ UNKNOWN
- **Epistemic:** SOURCE

### Bad source + thin prompt explain the miss
- **Claim:** Garbled text is blamed on low-quality RAW (unreadable) and minimal prompting; model "only going to get better."
- **Reasoning:** He does not treat the miss as a fail of the machine — he files two causes.
- **Evidence:** "in the RAW files, this is a pretty low quality image" / "prompting that is in this current workflow is very minimal"
- **Conditions:** Text-on-product ads
- **Exceptions:** He still calls it a good ad creative
- **Action:** Persist cause-split; do not flatten "it worked" with the garbled line
- **Confidence:** medium
- **Source:** `UT_Ek_tmeVA` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Photoshop-agent = retrieve source + edit tool. Identity to the granola bag matters. Text-on-pack can miss if the raw is unreadable. Minimal prompt is a known gap.

## D. Procedures
1. Ask for an edit that names the source image and the new scene.
2. Resolve file ID (memory, else raw search).
3. Call edit-image.
4. Open the output folder; compare bag identity + scene + readable words.
Signals: searched raw files (visible). Avoid: shipping on "good ad creative" while the top line is wrong.

## E. Examples
**Granola + Eiffel:** Situation — granola still in raw. Action — photoreal ad, held in front of Eiffel. Reasoning — show edit-image. Outcome — bag+tower match; top words garbled. Lesson — retrieve-then-edit works; text-on-pack needs a readable raw + a real prompt.

## F. Decision Rules
- If file ID cannot be resolved → edit cannot start.
- If raw text is unreadable → do not expect the model to invent the line.
- Refuse: NanoBanana as hive; n8n-cloud.

## G. Contrarian
Against "the model failed" as the only story — he points at raw quality and thin prompt.

## H. Assumptions
Theirs: model will get better (unverified). Ours: granola/Eiffel is a demo, not a CPG hunt. Falsifier: `7UNsK9LoORo` long may show a better prompt. Do not flatten short vs long.

## I. Questions
What is NanoBanana exactly? Does the long fix the prompt? Memory vs raw-search policy?

## J. Connections
SYSTEM SYNTHESIS → `7UNsK9LoORo` / `TWvjqpk3uSQ` (Photoshop/NanoBanana long/short); `uC5tDwGhyVA` (still-match); `wiki-ingest` (raw/ is the source of truth).

## K. Future-Use
Retrieve-then-edit as an atom for any file-tool agent. Unassigned: hive image ads stay parked.

## Steal / Operate-never

### Machine: resolve source file, then edit; blame readable raw
- **Epistemic:** SOURCE
- **Workflow / loop:** name source + scene → find file ID (memory|raw) → edit-image → open folder → check identity + readable words. Checkable stop = bag matches AND words readable, or file the cause (bad raw / thin prompt)
- **Questions / signals:** Did it search raw? Can a human read the raw line?
- **Qualify / frame / objections:** "Good ad creative" is not the stop if words are wrong
- **Procedure:** do not expect OCR from an unreadable still
- **Example that proves it:** granola + Eiffel → bag matches, top line garbled because raw is low quality
- **Why it works:** separates retrieval, edit, and source-quality
- **Conditions / exceptions:** demo; n8n/NanoBanana on-tape
- **Operate-never payload:** NanoBanana/n8n as hive; CPG ad farm
- **Hive run:** `golden-test-loop` · `wiki-ingest` (raw as source)
- **Source:** `UT_Ek_tmeVA` @ UNKNOWN

### Operate-never
- NanoBanana / n8n-cloud as hive. Ad-creative farm. New `icp_id`.
- Merge `LESSONS-FROM-TAPE.md`. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
File retrieve-then-edit and the cause-split (bad raw vs thin prompt) as two atoms. Do not flatten "good creative" over the garbled line. Outer Heaven raw/ is the analog — unreadable source does not become FACT.
