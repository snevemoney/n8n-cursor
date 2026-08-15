# Creative Studio — 7UNsK9LoORo
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/7UNsK9LoORo/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/7UNsK9LoORo/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate: “Photoshop AI agent” in n8n, **Nano Banana** via FAL. Beats: Telegram in (text or photo) → Drive; five tools — combine, edit, rename, search raw, search AI-out; default name = today’s date until he says “Nate” / “granola”; memory skips ID search on the last upload; combine selfie + granola → photoreal hike; later Hormosi (low-res) + JBL → boat; edit granola → Eiffel ad — logo words mostly right, “ingredients you can see and pronounce” garbled because the raw is unreadable; agent writes its own image prompt (he says a dedicated prompt agent would be better); switch standardizes photo vs text to `json.message.text`; system prompt is one line: if photo, ask the Drive name; GPT-5.1 + Sonnet 3.5 fallback + Telegram chat-id memory; combine/edit are **workflow-as-tool** (modular); IDs → array → split → Drive download → **ImageBB** public URL (Nano needs URL not binary) → one FAL request → wait 10s / poll 30s (he would cut to ~4) → GET binary → Drive → link back; strip newlines/quotes so JSON does not break; ~**4¢/image**, “25 for a dollar” (UNVERIFIED); Open Router free Nano was gone; customize: prompt specialist, Google Sheet logger (sister media-team tape), image→V3 video as another tool. Skool JSON + Plus. Visual: Telegram thread, Drive folders, granola/Eiffel still.

## B. Atomic Knowledge

### One input field, two doors
- **Claim:** Photo and text must land in the same field or the agent forks. The switch only exists to normalize; the brain always reads `message.text`.
- **Evidence:** “standardize the input so the agent looks at it no matter what comes through.”
- **Conditions:** Telegram trigger.
- **Exceptions:** A second specialist can own the image prompt later.
- **Action:** One door on the plate; do not ship two competing CTAs.
- **Confidence:** SOURCE.
- **Source:** `7UNsK9LoORo` @ UNKNOWN
- **Epistemic:** SOURCE

### Public URL is the real adapter
- **Claim:** Nano Banana wants a public URL. Binary in Drive is not enough. ImageBB is his free workaround, then one aggregated FAL call.
- **Evidence:** “the nano banana API… has to take a public URL… uploading these images as binary and then it gives us back a public URL.”
- **Conditions:** FAL + ImageBB on tape.
- **Exceptions:** Other URL hosts exist; he picked free/easy.
- **Action:** Learn the adapter; do not install FAL / ImageBB / n8n.
- **Confidence:** SOURCE.
- **Source:** `7UNsK9LoORo` @ UNKNOWN
- **Epistemic:** SOURCE

### Garbage raw in, garbage type out
- **Claim:** The Eiffel ad fails the top line because the granola raw is too low-res to read. Model + “minimal prompting” is the second excuse; the first is the source still.
- **Evidence:** “in the RAW files, this is a pretty low quality image. So, like I can’t even read what that says.”
- **Conditions:** Product-pack type as the hero.
- **Exceptions:** Face + bag on a mountain can still “look good” when type is not the job.
- **Action:** Plate a readable pack shot before you ask for an ad.
- **Confidence:** SOURCE.
- **Source:** `7UNsK9LoORo` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Workflow-as-tool = reuse, not a bigger brain. Memory is a cache of IDs, not taste. Poll-until-done is a guardrail. Main agent with five jobs should not also write the image prompt. 4¢ is a playground, not a rate.

## D. Procedures
(Learn.) Telegram → name the file → search or remember IDs → combine/edit → poll → Drive link. Add a prompt specialist only after the main agent fails taste. Log steps if you need a sheet.
Avoid: n8n / FAL / ImageBB / Nano / V3; 4¢ as FACT; Skool/Plus; auto-post the ad.

## E. Examples
**Situation:** Nate + granola hike.  
**Action:** Memory already has IDs; combine tool only.  
**Lesson:** Last-upload memory is a shortcut, not a DAM.

**Situation:** Hormosi + JBL boat.  
**Action:** Search raw → IDs → combine.  
**Lesson:** Low-res celebrity still is a taste risk; do not steal the face.

## F. Decision Rules
- If the pack type is unreadable → do not generate the ad yet.
- If the main agent writes the prompt and taste is weak → split a prompt chair (learn).
- If JSON has newlines/quotes → strip before the HTTP body.
- If $ / 4¢ / 25-for-$1 from this tape → UNVERIFIED.

## G. Contrarian
He calls the Eiffel still “a good ad creative” in the same breath as the broken headline. The product is a file clerk with a generator, not Photoshop.

## H. Assumptions
4¢, 25/$1, Plus “thousands” UNVERIFIED. On-tape n8n / FAL / ImageBB / Telegram / GPT. Clients parked.

## I. Questions
Visual of the granola/Eiffel still? What did the dedicated prompt agent look like on the media-team tape? ImageBB retention?

## J. Connections
- SYSTEM SYNTHESIS → `jBanaNBY-sM` (media-team logger / V3).
- SYSTEM SYNTHESIS → `AYsg5gAMWyo` (UGC system).
- SYSTEM SYNTHESIS → `cinematic-recipe` (readable pack before generate).

## K. Future-Use
Readable-raw-then-generate as the ad-still stamp. Unassigned.

## Steal / Operate-never

### Machine: name the file, then generate from a readable raw
- **Epistemic:** SOURCE
- **Workflow / loop:** ingest → human names the asset → IDs from search or memory → one prompt job (later: specialist) → poll → Drive link → HITL taste
- **Questions / signals:** Can you read the pack type? Did JSON strip run? Did poll return binary?
- **Qualify / frame / objections:** Five tools are a clerk; taste is a second chair
- **Procedure:** Same input field; workflow-as-tool for combine/edit
- **Example that proves it:** Hike combine “works”; Eiffel type fails on a muddy raw
- **Why it works:** Public URL is the adapter; memory skips a search; raw quality is the ceiling
- **Conditions / exceptions:** $ UNVERIFIED; no auto-post
- **Operate-never payload:** n8n / FAL / ImageBB; 4¢ as FACT; Hormosi face as our still
- **Hive run:** `cinematic-recipe`; `clip-factory`; `ask-principal`
- **Source:** `7UNsK9LoORo` @ UNKNOWN

### Operate-never
- Install n8n / FAL / ImageBB / Nano Banana. Join Skool/Plus.
- Quote 4¢ as FACT. Auto-post ads. New hunt.
- Merge `LESSONS-FROM-TAPE.md`. Game-studio / fake 3D / cheap taste / NSFW.

## L. Role-Specific Applications
Video-first: **granola in a hand on a mountain** is the combine plate; Eiffel is the “type failed” plate. Do not ship Hormosi. Telegram thread is the UI, not a Photoshop window. HITL. Clients parked.
