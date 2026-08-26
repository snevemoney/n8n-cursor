# Consultant — IlNwjnIzrOo
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/IlNwjnIzrOo/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/IlNwjnIzrOo/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Teaser short for a longer media-army build. Beats in order: Telegram image in → Drive process → agent asks name + sharing → human says name it “speaker” → Drive “change name” tool → logs actions → link back to `media/speaker` → second message: edit to studio look, energetic, colorful, music-on-speaker feeling → creative agent uses edit-image → returns **three** images → human picks “first preview” → image-to-video VFX ad for a JBL speaker with beat-synced lights → aside: creative agent also tries a text-only video; speaker is “not too confident” → first finished clip is the image-to-video → CTA to the long video. Visual-only: the three stills, the VFX clip, and the Drive folder. No VTT. Timestamps UNKNOWN. Caption ingest ~545 words.

## B. Atomic Knowledge

### Telegram as the human socket
- **Claim:** The operator talks to the media system through Telegram, not the n8n canvas.
- **Reasoning:** A chat surface is how a non-builder fires jobs; the canvas stays backstage.
- **Mechanism:** Image in Telegram → Drive ingest → specialist tools (rename, edit, image-to-video).
- **Evidence:** On-tape: send image, name “speaker”, edit request, pick preview, request VFX ad.
- **Conditions:** Works when one human is choosing and the agent can ask before mutating files.
- **Exceptions:** Does not prove unattended posting or a second SKU from the teaser.
- **Action:** Keep a human socket. Do not treat the short as the product.
- **Confidence:** high for the demo path; low for production claims
- **Source:** `IlNwjnIzrOo` @ UNKNOWN — “we talked to our agent through Telegram”
- **Epistemic:** SOURCE
### Ask before rename
- **Claim:** The agent asks how to name the file and whether to change sharing before it writes Drive.
- **Reasoning:** Eager help without a name would dump date-stamped junk into `media`.
- **Mechanism:** Drive agent owns a `change name` tool; chat confirms; then mutate.
- **Evidence:** It renamed to speaker; link opens that exact upload in folder `media`.
- **Conditions:** Human is present to answer. Sharing settings are in scope of the ask.
- **Exceptions:** No proof it should auto-share publicly.
- **Action:** Name + share are checkable stops, not decorations.
- **Confidence:** high
- **Source:** `IlNwjnIzrOo` @ UNKNOWN — “asking us about how we want to name this and also if we want to change any sharing settings”
- **Epistemic:** SOURCE
### Three previews then a human pick
- **Claim:** The edit step returned three styles; the human picked the first preview before video.
- **Reasoning:** One-shot “studio look” is underspecified; variety plus a pick is the stop.
- **Mechanism:** Creative agent edit-image → three files → human names which preview → image-to-video.
- **Evidence:** “We have a couple different styles that we can choose from.”
- **Conditions:** Creative variance is cheap; the pick is the quality gate.
- **Exceptions:** Text-only extra video is optional and doubted on tape.
- **Action:** Steal the pick, not auto-post of all three.
- **Confidence:** high
- **Source:** `IlNwjnIzrOo` @ UNKNOWN — “creating three different images… take that first preview file”
- **Epistemic:** SOURCE
### Doubt is a stop on the extra path
- **Claim:** The creative agent also tries a text-only video; the speaker is not confident in it.
- **Reasoning:** Autonomy to try ≠ autonomy to ship. Confidence is named.
- **Mechanism:** Parallel try of image-to-video vs text-only; human will look later.
- **Evidence:** “I'm not too confident how good this one will be, but we'll definitely take a look.”
- **Conditions:** Agent has “full autonomy to use its tools” inside the media job.
- **Exceptions:** Autonomy here is tool choice, not publish.
- **Action:** Log the extra try; do not treat it as the deliverable.
- **Confidence:** high
- **Source:** `IlNwjnIzrOo` @ UNKNOWN — “not too confident how good this one will be”
- **Epistemic:** SOURCE


## C. Mental Models

The speaker treats a media “army” as specialized tools behind one chat. He values logging (“I'll show you guys later”). He is willing to give the creative agent tool autonomy and still withhold confidence on a side experiment. He sells the long video, not the short as a second product. He is comfortable with vague creative briefs (“whatever that means. the media team will figure it out”) because a human still picks among three.

## D. Procedures

1. Receive image on Telegram. 2. Ingest to Drive. 3. Ask name + sharing. 4. Run `change name`. 5. Confirm with a clickable link. 6. Accept an edit brief. 7. Return multiple stills. 8. Wait for which preview. 9. Image-to-video with a named ad brief. 10. Optionally try text-only; flag low confidence. 11. Show the image-to-video first. 12. Point to the long setup video. Avoid: posting without a pick; treating the teaser as the install.

## E. Examples

**Situation:** Image of a speaker lands in Telegram. **Action:** Process to Drive, ask name, rename to “speaker,” confirm in `media`. **Reasoning:** Name + folder beat date-stamped clutter. **Outcome:** Same picture, named, linked. **Lesson:** Confirm the file identity before creative work.

**Situation:** “Studio looking… energetic, colorful… listening to music on a speaker.” **Action:** Edit-image returns three; human picks first preview; then VFX JBL ad. **Reasoning:** Vague brief needs options + a pick. **Outcome:** Image-to-video impressed him; text-only is pending/doubted. **Lesson:** Variety → pick → motion. Implicit rule: doubt names a review, not a ship.

## F. Decision Rules

If the file has no human name, ask before writing Drive. If the brief is aesthetic, return more than one still. If the human names a preview, that file is the source of truth for video. If the agent invents a second path, keep it, but do not lead with it when confidence is low. If this is a short, send viewers to the long — do not treat the short as the SKU.

## G. Contrarian

Field default: one-shot generate-and-post. He shows a pick among three and a doubted extra. Field default: agent = one brain. He splits Drive rename vs creative edit. Field default: teaser is a second product. He uses it as a pointer.

## H. Assumptions

Assumes Telegram + Drive + a creative model that can emit three stills and image-to-video. Assumes a human is watching. Survivorship: the clip that “impressed” him is the one he shows; the text-only may have been worse. Visual quality is not in captions. $ and “army that can do anything” are marketing, not measured. Hive disagreement: we will not operate Vapi/n8n-cloud/auto-post; we still steal the pick + doubt stop.

## I. Questions

Did the text-only video ever get shown in the long? What are the sharing-setting defaults? Who owns the JBL ad — demo or client work? What does “logging all of its actions” look like as a checkable artifact?

## J. Connections

**SYSTEM SYNTHESIS:** Long twin is `jBanaNBY-sM` (full media army). Same pick-among-three machine as `TWvjqpk3uSQ` / `UT_Ek_tmeVA` (Nano Banana stills). Maps to `product-ad-from-photo` + `clip-factory` (human ships) + `ask-principal` on publish. Not a Path A SKU.

## K. Future-Use

Unassigned: action-log format as a skeptical-buyer artifact; “three stills then pick” as a toddler observable for any image job; teaser-to-long as a coverage-loop pattern (short is not a second desk).

## Steal / Operate-never

### Machine: Pick among three + doubted extra
- **Epistemic:** SOURCE
- **Workflow / loop:** Telegram image → Drive name/share ask → edit-image → three stills → human names preview → image-to-video → optional text-only (flagged) → show the confident path → CTA long
- **Questions / signals:** What do we name it? Change sharing? Which preview? (Doubt: is the text-only even worth opening?)
- **Qualify / frame / objections:** Qualify: human is in chat. Frame: media team will interpret a fuzzy brief. Objection: “can it do anything?” — tape answers with a logged, picked path, not a post.
- **Procedure:** Never skip the name ask. Never skip the pick. Lead with the path you would stand behind.
- **Example that proves it:** Studio-look speaker → three stills → first preview → JBL VFX ad. Text-only tried, confidence low.
- **Why it works:** Fuzzy creative briefs fail as one-shots; a pick is a checkable stop. Doubt is information.
- **Conditions / exceptions:** Human present. Not a publish loop. Teaser ≠ install.
- **Operate-never payload:** Auto-post the three stills or the VFX ad. Treat the short as a second SKU. Unpark a client for a “media army.”
- **Hive run (existing skills only):** `product-ad-from-photo` · `clip-factory` (human ships) · `ask-principal` · `warm-draft-hitl`
- **Source:** `IlNwjnIzrOo` @ UNKNOWN


### Operate-never
- Auto-post stills or the VFX ad from this teaser.
- Treat the short as a second SKU or a Path A media-army offer.
- Unpark a client / new `icp_id` / new `business-lanes.json` row. Learning ≠ hunt.
- Quote tape $ / student counts / job-loss % / hours×rate as FACT.
- Send / pay / deploy / book / publish. Approve draft ≠ send.
- Install on-tape vendors (Claude, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus, n8n-cloud, Skool). Stack stays Cursor + Grok.
- Grok Bot / `sendPrompt`. Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. Overwrite `takes/consultant.md` or another desk's take.

## L. Role-Specific Applications

**Constraint first:** The stated ask on tape is “ultimate media agent that can do anything.” Felt problem for a parked Path A is not a Telegram art director. Do not re-scope a client as a JBL ad factory because a short showed three stills. Doctor, not pharmacist.

**Four-blank after constraint:** If Evens ever names a creative job, the toddler stop is: named file in a named folder, three stills, human pick recorded, one motion file, publish HITL. No hours×rate. Tape $ absent here anyway.

**Skeptical-customer:** “It created three, I picked one, I'm not confident in the extra” is the honest demo. “Army that does everything” is the smash. Clients parked. No new `icp_id`. Stack on-tape (Telegram / Drive / n8n / image models) stays on-tape.
