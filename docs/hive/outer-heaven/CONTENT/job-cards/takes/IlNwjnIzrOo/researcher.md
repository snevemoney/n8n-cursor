# Researcher — IlNwjnIzrOo
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/IlNwjnIzrOo/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/IlNwjnIzrOo/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
“Ultimate media agent that can do anything” short. Beats: (1) Talk via Telegram; send an image. (2) Process into Google Drive; agent asks name + sharing settings. (3) He names it **speaker**; Drive agent has **change name**; Telegram returns a link; folder **media**. (4) Edit: studio-looking, energetic, colorful, “feeling of listening to music on a speaker” — “whatever that means, the media team will figure it out.” (5) Creative agent uses **edit image**; returns **three** styles. (6) He picks the first preview; asks for a VFX ad with music/lights synced to the beat for a **JBL speaker**. (7) Aside: creative agent has “full autonomy”; also tries a text-only video he is “not too confident” about. (8) First result is image-to-video; he plays audio. (9) Close: set up this exact system for free + play button. Timestamp UNKNOWN. Siblings: `TWvjqpk3uSQ`, `jBanaNBY-sM`, `uC5tDwGhyVA`.

## B. Atomic Knowledge

### Name and share, then edit
- **Claim:** Ingest asks for a filename and sharing; a specialized Drive agent owns rename.
- **Reasoning:** Eager helper still needs human handles (same as `TWvjqpk3uSQ`).
- **Mechanism:** Telegram image → Drive → ask name/share → change-name → link in media/.
- **Evidence:** “name it speaker” + change-name tool + media folder.
- **Conditions:** Multi-agent split (Drive vs creative).
- **Exceptions:** “Do anything” title vs a rename step.
- **Action:** Keep human name + explicit share settings.
- **Confidence:** high.
- **Source:** `IlNwjnIzrOo` @ UNKNOWN
- **Epistemic:** SOURCE

### Three previews then human pick
- **Claim:** Edit returns three styles; he picks the first, then asks for motion.
- **Reasoning:** Choice before the expensive/long VFX.
- **Mechanism:** edit-image → 3 → pick preview 1 → image-to-video VFX brief.
- **Evidence:** “creating three different images… take that first preview file… the one that we liked the best.”
- **Conditions:** Creative agent can emit a pack.
- **Exceptions:** He does not let the agent pick the winner.
- **Action:** Always pack-then-pick before motion.
- **Confidence:** high.
- **Source:** `IlNwjnIzrOo` @ UNKNOWN
- **Epistemic:** SOURCE

### Full autonomy still distrusts text-only video
- **Claim:** He grants “full autonomy” and still flags the text-only video as low confidence; he leads with image-to-video.
- **Reasoning:** Image-to-video is the one he is “very impressed” by.
- **Mechanism:** Agent tries both; human ranks.
- **Evidence:** “I’m not too confident how good this one will be” vs “this first one is the one that was actually the image turned into video.”
- **Conditions:** Agent may spawn extra attempts.
- **Exceptions:** Autonomy ≠ publish; he still picks.
- **Action:** Treat extra text-only as a side try; do not ship it by default.
- **Confidence:** high.
- **Source:** `IlNwjnIzrOo` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
“Do anything” is a title. The loop is name → edit pack → pick → motion. “Media team will figure it out” is a joke that still leaves taste to a specialist agent. Logging actions is promised (“I’ll show you later”) — not shown here.

## D. Procedures
1. Ingest image; ask name + sharing.
2. Rename via the Drive-specialist.
3. Vague taste brief → edit-image → three styles.
4. Human picks one.
5. Motion brief (VFX + music sync). Allow a text-only side try; prefer image-to-video.
6. Play before any “for free / publish” CTA.

## E. Examples
- **Situation:** Speaker photo → JBL-ish ad. **Action:** Name speaker → three studio edits → pick first → VFX from that still. **Reasoning:** Pack then pick; still-to-video over text-only. **Outcome:** Impressed by image-to-video; audio played. **Lesson:** Autonomy produced extras; the human still chose. Implicit rule: three previews are the product, not “one perfect.”

## F. Decision Rules
- If ingest → ask name + share.
- If edit → require a pack and a pick.
- If agent also tries text-only → keep it second.
- Refuse: auto-publish; JBL client hunt; “can do anything” as FACT.

## G. Contrarian
Title says ultimate/anything; body is a constrained still→pick→clip. He undercuts his own text-only attempt on camera.

## H. Assumptions
Three styles are meaningfully different (not shown in text). JBL is a demo noun. “For free” is a magnet. Telegram is the remote.
**Desk dissent:** none yet. Old shallow take already had this machine — this walk keeps it and adds share-settings + text-only distrust as first-class.

## I. Questions
- What were the three styles?
- Did the text-only video get shown?
- Sharing settings — what did he pick? (asked, not answered in text)

## J. Connections
- **SYSTEM SYNTHESIS:** `TWvjqpk3uSQ` (name+combine). `uC5tDwGhyVA` (still→UGC fidelity). `jBanaNBY-sM` (army long). `clip-factory` · `motion-pipeline` · `product-ad-from-photo` · `cinematic-recipe`.

## K. Future-Use
Three-previews-then-pick as the default creative gate.

## Steal / Operate-never

### Machine: name-share-pack-pick-then-motion
- **Epistemic:** SOURCE
- **Workflow / loop:** image in → ask name+share → rename → edit pack of 3 → human pick → image-to-video (text-only optional, low trust) → play → HITL publish
- **Questions / signals:** What do we name it? Share settings? Which of the three? Are we about to ship the text-only try?
- **Qualify / frame / objections:** “Full autonomy” → he still picks. “Do anything” → this is one product still.
- **Procedure:** D.
- **Example that proves it:** Speaker → three studio stills → first preview → JBL VFX; text-only distrusted.
- **Why it works:** Human handles + a pick gate before the long render.
- **Conditions / exceptions:** Telegram/Drive/creative split. Demo brand. Free CTA.
- **Operate-never payload:** Telegram army; auto-publish VFX; JBL ICP; quote “ultimate / for free / three” as FACT.
- **Hive run:** `clip-factory` · `motion-pipeline` · `product-ad-from-photo` · `ask-principal`
- **Source:** `IlNwjnIzrOo` @ UNKNOWN

**Operate-never**
- Telegram/n8n army SKU. Auto-publish. New `icp_id`. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
Overwrite the shallow take with this A–L. Same steal, deeper why (share ask, pack, text-only distrust). No hunt.
