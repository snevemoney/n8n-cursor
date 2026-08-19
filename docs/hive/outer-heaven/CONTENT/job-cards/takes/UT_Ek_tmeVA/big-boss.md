# Big Boss — UT_Ek_tmeVA
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/UT_Ek_tmeVA/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/UT_Ek_tmeVA/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Short (PACKET: 1:10, 302 words, captions `en-orig`). Timestamp UNKNOWN on `full.txt`. Visual-only gaps: granola raw, Eiffel still, “ingredients you can see and pronounce” miss, AI image generation folder, file-ID search in raw files. Caption cuts mid-sentence into the CTA.

Beats, in order:

1. Same hook family: “I just built a nano banana Photoshop AI agent.”
2. This short is the `edit image` tool, not the combine loop.
3. Brief: “create a photorealistic advertisement of the granola image, make it look like it’s being held in front of the Eiffel Tower.”
4. Agent must find the granola file ID — “whether that’s in the memory or if it has to search the raw files.”
5. It searches the raw files (he calls that out).
6. Calls `edit image` to change appearance.
7. He opens folder `AI image generation` → file `granola ad Eiffel`.
8. Review: bag “looks exactly like that,” held in front of the Eiffel Tower. “If that’s not a good ad creative, then I don’t know what is.”
9. Words “pretty much spot-on except” the top line. Supposed to say “ingredients you can see and pronounce.”
10. Two excuses: (1) RAW file is low quality — he cannot read the source line; (2) “this image generation model is only going to get better”; plus “prompting in this current workflow is very minimal.”
11. CTA: play button to the full breakdown (caption splices into it).

Off-topic / not skipped: memory vs raw-file search; folder name `AI image generation`; future-model cope; thin prompt as a third cause.

## B. Atomic Knowledge

### Find-by-name before edit
- **Claim:** The agent must resolve a file ID from memory or by searching raw files before `edit image` runs.
- **Reasoning:** The brief says “the granola image,” not a new upload. No ID, no edit.
- **Mechanism:** Search raw files → get ID → `edit image`.
- **Evidence:** He narrates the search path when memory is not enough.
- **Conditions:** A named raw already exists (from the sibling ingest short).
- **Exceptions:** Memory hit is mentioned and not shown. Wrong-file miss not shown.
- **Action:** A named artifact is the handle. “The granola image” only works if granola was named.
- **Confidence:** high
- **Source:** `UT_Ek_tmeVA` @ UNKNOWN — “find the file ID of the granola image, whether that’s in the memory or if it has to search the raw files”
- **Epistemic:** SOURCE

### Source quality + thin prompt before blaming the model
- **Claim:** The top line of the ad is wrong. He blames the low-quality RAW (unreadable) and a minimal prompt; the model “will get better.”
- **Reasoning:** Garbage in, garbage out. A future model is a hope, not a fix.
- **Mechanism:** Visual compare: source pack vs generated ad line.
- **Evidence:** He cannot read the source line himself. Prompt called “very minimal.”
- **Conditions:** Honest when the operator can see the source is mush. Dishonest if used to ship a miss.
- **Exceptions:** He still calls it a “good ad creative” before listing the miss.
- **Action:** Fail the line-item. Do not accept “model will get better” as done.
- **Confidence:** high that he said both the praise and the excuses
- **Source:** `UT_Ek_tmeVA` @ UNKNOWN — “this is a pretty low quality image” / “prompting… is very minimal”
- **Epistemic:** SOURCE

### Folder + filename is the review surface
- **Claim:** He does not trust the chat ack. He opens `AI image generation` / `granola ad Eiffel`.
- **Reasoning:** The artifact has a place and a name. That is the stop.
- **Mechanism:** Folder click → file click → look.
- **Evidence:** Spoken path. Visual **UNVERIFIED**.
- **Conditions:** Agent wrote a predictable name. If the name is random, the stop breaks.
- **Exceptions:** No second edit after the miss.
- **Action:** Known folder + predictable name before taste talk.
- **Confidence:** high
- **Source:** `UT_Ek_tmeVA` @ UNKNOWN — “AI image generation folder… granola ad Eiffel”
- **Epistemic:** SOURCE

### Short is a magnet; caption is incomplete at the end
- **Claim:** CTA to the long. Last caption sentence is spliced (“very minimal. you want to watch the full breakdown”).
- **Reasoning:** Impressed Eiffel + missing recipe = click. Do not invent the cut words.
- **Mechanism:** Play-button.
- **Evidence:** PACKET 302 words; line breaks mid-thought.
- **Conditions:** Skip nothing; do not reconstruct the missing clause.
- **Exceptions:** None — we have the CTA intent.
- **Action:** Pair with the long; do not treat this short as a build spec.
- **Confidence:** high
- **Source:** `UT_Ek_tmeVA` @ UNKNOWN — “click on that play button”
- **Epistemic:** SOURCE

## C. Mental Models

- **Search then tool.** Memory is optional; raw-file search is the fallback. **SOURCE**
- **Praise first, caveats second.** “Good ad creative” then the miss. **SOURCE**
- **Model-future is a comfort.** “Only going to get better” sits next to “prompt is minimal.” **SOURCE**
- **Unreadable source excuses unreadable output.** He cannot read the RAW line, so the ad miss is expected. **SOURCE**
- **Photoreal + landmark = ad.** Eiffel is the proof object, not a client. **INFERENCE**
- **“I don’t know what is” is the close, not a definition of done.** **INFERENCE**

## D. Procedures

1. **Precondition:** a named raw exists (granola). If not, stop and name it (`TWvjqpk3uSQ` loop).
2. **Brief:** photoreal + what to keep (the bag) + where (Eiffel) + job (advertisement).
3. **Resolve ID:** memory first; else search raw files. No ID → no edit.
4. **Edit:** specialist runs `edit image` (on-tape: nano banana).
5. **Land:** predictable folder + name (`AI image generation` / `granola ad Eiffel`).
6. **Open the file.** Compare bag identity, scene, and every readable word to the source.
7. **Attribute misses:** source unreadable? prompt thin? tool miss? Do not skip to “model will improve.”
8. **Human** ships or rejects (HITL). No second pass on this short.

**Qualify / frame:** same Photoshop-agent family, edit path not combine path. Kind + Eiffel are props.
**Objections:** “Good ad” — the headline line is wrong on his own telling. “Model will get better” — not a ship gate.
**Avoid:** nano banana / Drive / Telegram as hive OS. Cursor + Grok only.
**When to change:** if the source line is unreadable, fix the source or drop the word-match claim.

## E. Examples

**Situation:** He wants an Eiffel ad from an existing granola raw.  
**Action:** One photoreal brief; agent searches raw files for the ID; `edit image`; open `granola ad Eiffel`.  
**Reasoning:** Edit needs a handle, not a new drop.  
**Outcome:** Bag + tower still. Visual **UNVERIFIED**.  
**Lesson:** Find-by-name is the gate. Implicit rule: “the granola image” only works after granola was named.

**Situation:** Top line should read “ingredients you can see and pronounce.”  
**Action:** He notes the miss, then blames low-quality RAW and a minimal prompt, plus future models.  
**Reasoning:** He wants the still to stay impressive.  
**Outcome:** Caveats spoken; no rewrite.  
**Lesson:** Praise ≠ done. Implicit rule: if you cannot read the source, do not sell word-perfect output.

**Situation:** Caption dies into the CTA.  
**Action:** We keep the splice; we do not invent the missing words.  
**Reasoning:** Protocol: do not invent transcript.  
**Outcome:** CTA still clear.  
**Lesson:** Incomplete captions are a gap, not a license to fill.

## F. Decision Rules

- If the brief points at an existing file → resolve ID before edit.
- If the output text misses → check source readability and prompt thickness before upgrading the model.
- If the operator cannot read the RAW → drop the “spot-on words” claim.
- If chat says finished → open the named folder anyway.
- Optimize: one named raw → one edit → one opened file → listed misses.
- Refuse: shipping on “model will get better”; auto-post; install his stack.

## G. Contrarian

- Against “the model failed.” He puts source quality and prompt first (then still praises the still).
- Against “memory is enough.” He shows a raw-file search.
- Against “good ad” as a finish line — he immediately lists a word miss.
- Field assumes a new upload per edit. He reuses a named raw.

## H. Assumptions

**His:** Nano banana + Drive folders are the OS; Eiffel + bag = ad; future models fix type; a minimal prompt is acceptable for a demo.

**Ours:** Captions complete enough except the spliced last sentence (302 words). Still quality and the exact miss **UNVERIFIED**. Domain-specific: creator ads, not a client SKU. No $ on this short.

**Falsifiers:** File-ID search grabs the wrong raw. Folder name is not stable. “Model will get better” is used to skip a rewrite forever.

**Disagreement (keep labeled):** Hive will not operate this Photoshop agent. The **find-by-name** and **source-before-model** machines are still stolen. **SYSTEM SYNTHESIS**

## I. Questions

- Did memory ever hit, or is raw-file search the real path?
- What would a non-minimal prompt have said?
- Sibling: `TWvjqpk3uSQ` (name/combine) and long `7UNsK9LoORo` — confirm bind.
- Would he rerun after fixing the RAW? Not on this short.

## J. Connections

- **SYSTEM SYNTHESIS** → `TWvjqpk3uSQ` (name loop that makes “granola” resolvable).
- **SYSTEM SYNTHESIS** → `IlNwjnIzrOo` (name → edit → human review).
- **SYSTEM SYNTHESIS** → `uC5tDwGhyVA` (still → UGC motion; product match).
- **SYSTEM SYNTHESIS** → `golden-test-loop` / doctrine 6: reject 70% “good ad.”
- **SYSTEM SYNTHESIS** → `ask-principal`: no publish.
- Do not force a Path A CPG client out of Kind + Eiffel.

## K. Future-Use

- “Source unreadable → drop word-match claim” as a Creative Studio don’t (unassigned).
- Memory vs search as a Researcher break/fix (unassigned).
- Predictable output filenames as a Watchdog smoke (unassigned).
- Thin-prompt label as a Forge reject reason (unassigned).

## Steal / Operate-never

### Machine: Resolve named raw → edit → open file → attribute the miss
- **Epistemic:** SOURCE (demo) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** trigger (edit an existing named asset) → confirm the name exists → resolve file ID (memory or search) → taste + scene brief → edit tool → land in known folder with a predictable name → open → compare identity, scene, words → list misses with cause (source / prompt / tool) → human ships or rejects (HITL).
- **Questions / signals:** “What is the file ID?” “Can we read the source line?” “Is the prompt thin?” “Did we open the folder?”
- **Qualify / frame / objections:** Same family as the combine short; this is the edit path. “Good ad” is the magnet. Objection: word miss — he already said it.
- **Procedure:** D steps 1–8. Checkable stops: (1) ID resolved, (2) file opened, (3) misses listed without “model will save us.”
- **Example that proves it:** Granola → Eiffel ad → bag/tower praised → “ingredients you can see and pronounce” misses because RAW is unreadable and prompt is thin. Lesson: find-by-name works; praise-then-excuse is not done.
- **Why it works:** Edits need handles. Word-perfect claims need readable sources. Conditions: a prior name loop, a folder he can open. Exceptions: no rewrite; caption splice; model-future cope.
- **Conditions / exceptions:** Cursor + Grok only. Clients parked. Kind / Eiffel are props. No tape $.
- **Operate-never payload:** Ship on future-model cope; auto-post; Telegram/Drive/nano banana OS; new hunt.
- **Hive run (existing skills only):** `golden-test-loop` · `clip-factory` · `motion-pipeline` (still only) · `ask-principal` · `slice-build` · `agent-job-card` (owns: list misses; never: “model will get better” as done).
- **Source:** `UT_Ek_tmeVA` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Auto-post / “model will get better” as ship
- Telegram + Drive + nano banana + n8n as hive OS
- Install Claude / Codex / ChatGPT / Gemini / Coda / Vapi / Abacus / Skool
- Quote any implied $ as FACT
- New `icp_id` / unpark Normand / CPG-ad hunt
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md` (Researcher owns that)

## L. Role-Specific Applications

I manage; I do not accept “good ad” with a wrong headline.

- **Done** on an edit slice: ID resolved + file opened + misses attributed. “I don’t know what is” is not done.
- **Delegate without being asked:** Creative Studio compares words to source; Watchdog opens the folder; Forge rejects future-model cope; Publishing Engine does not ship.
- **Skeptical review:** He praised, then explained the miss. I keep the miss. I will not approve nano banana because the bag sat in front of a tower.
- **One system this take:** find → edit → open → list misses. Not a second compose tool.
- Live hunt stays parked. Eiffel granola is not an ICP.
