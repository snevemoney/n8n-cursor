# Researcher — 7UNsK9LoORo
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/7UNsK9LoORo/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/7UNsK9LoORo/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Caption-only (`full.txt`, ~4273 words). Title: I Built a Photoshop AI Agent in n8n with no code (NanoBanana). Visual/click **UNKNOWN**. Timestamp **UNKNOWN**. Beats: (1) Telegram “Photoshop” agent: text or image in; five tools — combine images, edit image, Drive rename, search RAW, search AI-generated. (2) Demo: selfie → upload Drive (default name = today’s date) → “what do you want to name it?” → Nate. Granola bag → granola. “Combine Nate + granola, photorealistic, holding granola hiking.” Memory already has IDs so it skips search. Kind granola spelling OK. Second: search RAW for Hormozi + JBL → boat-listening composite. Edit: granola ad in front of Eiffel; filename granola ad Eiffel. Text scar: “ingredients you can see and pronounce” garbled — RAW is low-res + “prompting is very minimal.” He says a dedicated prompt agent would beat the generalist. (3) Graph: Telegram trigger → switch photo vs text → photo: download + Drive upload; text: pass through. Normalize to `json message.ext` (caption spelling) so the agent always sees one field. System prompt: personal assistant + tool list + **one** instruction (if photo, ask the name, then rename). Brain GPT 5.1, fallback Sonnet 3.5, memory = Telegram chat ID. Add instructions only when a fail appears. (4) File tools: rename by agent-chosen ID + new name; two search tools = same node, different folders (media vs AI images). (5) Combine = **n8n workflow-as-tool**. Inputs: image prompt, image1 ID, image2 ID, title. Edit fields → array of IDs → split → Drive download both → **ImageBB** binary→public URL (Nano Banana wants URLs) → aggregate → one **FAL.ai** HTTP (prompt + two URLs; strip newlines/quotes so JSON doesn’t break) → 10s wait → poll (he says 30s, “should be ~4”) until done → GET result URL as binary → Drive upload → respond with name+link. Edit-image subflow = same with one ID. (6) FAL: many image/video models, one key; Nano Banana Edit ~**4¢/image**; 25 images / $1. OpenRouter free Nano Banana “maybe taken off.” Play in FAL UI before n8n; copy HTTP curl from docs. (7) Production next: dedicated prompt agent in the subflow; Sheet logger (input/tools/tokens/error) from his “ultimate media team” tape; image→video (V3 fast) as another workflow-tool. Modular = plug the same subflow into many agents. Free Skool JSON + setup sticky; Plus pitch. **Do not flatten** vs `product-ad-from-photo` / `clip-factory` / `motion-pipeline` — steal the *shape*, not FAL/Telegram. All $ UNVERIFIED.

## B. Atomic Knowledge

### Normalize the channel, then give the agent five verbs
- **Claim:** Telegram in is messy (photo vs text). Switch + one field (`message.ext`) + chat-ID memory + a single “ask the name” rule is enough for GPT 5.1 to pick rename / search-raw / search-ai / combine / edit.
- **Reasoning:** Minimal prompt + tool descriptions; grow the prompt only on observed fails.
- **Mechanism:** Photo path uploads first (date-named) so there is always a Drive ID to rename.
- **Evidence:** First two uploads ask for names; combine uses memory IDs; Hormozi+JBL searches RAW.
- **Conditions:** One Telegram user in the demo. Caption field name may be `text` not `ext`.
- **Exceptions:** Low-res RAW + thin prompt → Eiffel text fail.
- **Action:** Steal normalize-then-five-verbs. Hive: `product-ad-from-photo` already owns ads; no Telegram/FAL.
- **Confidence:** high as the shape.
- **Source:** `7UNsK9LoORo` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** Eiffel copy garble
- **Speech ≠ behavior:** “no code” vs HTTP JSON, ImageBB, poll loops.

### Workflow-as-tool is the module; URL-ify binaries before the model
- **Claim:** Combine/edit are reusable n8n workflows the parent calls. Nano Banana (via FAL) wants public URLs → ImageBB is his free hop. Poll until done; return Drive link, not a hope.
- **Reasoning:** A second agent that only writes image prompts would beat a generalist. Same subflow can hang on a video agent later.
- **Mechanism:** IDs → download → ImageBB → FAL (sanitize quotes/newlines) → wait/poll → binary back to Drive.
- **Evidence:** Hormozi+JBL live data in the input node; granola-Eiffel sub-execution.
- **Conditions:** FAL ~4¢ UNVERIFIED. ImageBB is a third-party public host — operate-never for client photos.
- **Exceptions:** He notes other URL hops exist.
- **Action:** Steal workflow-as-tool + poll + sanitize-JSON. Do not ImageBB client assets.
- **Confidence:** high as the module.
- **Source:** `7UNsK9LoORo` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** poll interval “should be 4 not 30”
- **Speech ≠ behavior:** none.

### Search two folders so generate doesn’t collide with RAW
- **Claim:** RAW vs AI-generated are different Drive folders and different tools. Rename is ID+name. Memory can skip search on the last upload.
- **Reasoning:** One search tool over a mixed folder will grab the wrong generation.
- **Mechanism:** Identical Drive search nodes, folder swapped.
- **Evidence:** Second combine searched RAW; first combine used memory.
- **Conditions:** His two-folder layout.
- **Exceptions:** none.
- **Action:** Steal split-corpus search. Map `clip-factory` / Drive hygiene.
- **Confidence:** high.
- **Source:** `7UNsK9LoORo` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** none
- **Speech ≠ behavior:** none.

## C. Mental Models
The agent is a router; the art lives in the subflow. Public-URL is a tax for models that won’t take binary. Minimal prompt until a fail. Specialist prompt-writer > generalist. Modular tools beat a god-workflow. “No code” still has a JSON body.

## D. Procedures
1. Channel in → switch media vs text → normalize one field.
2. Photos: Drive upload (dated) → ask name → rename tool.
3. Combine: resolve two IDs (memory or RAW search) → subflow.
4. Edit: one ID → same subflow minus the second URL.
5. Subflow: download → public URL hop → FAL-style request with sanitized prompt → poll → Drive → link back.
6. Later: prompt specialist node; Sheet logger; optional image→video tool.
7. Hive: use `product-ad-from-photo` / `clip-factory`; no FAL/ImageBB/Telegram; no Skool JSON.

## E. Examples
- **Situation:** Nate + granola hike. **Action:** combine via memory IDs. **Outcome:** readable Kind bag. **Lesson:** memory skips search when the IDs are fresh.
- **Situation:** Hormozi + JBL boat. **Action:** RAW search then combine. **Outcome:** “not too bad.” **Lesson:** folder-scoped search.
- **Situation:** Granola × Eiffel. **Action:** edit tool. **Outcome:** scene OK, badge text wrong. **Lesson:** garbage-in RAW + thin prompt.
- **Situation:** FAL poll. **Action:** 10s then 30s loop. **Outcome:** he would shorten to ~4s. **Lesson:** poll to the model’s real latency.

## F. Decision Rules
- IF photo in → ask name before art.
- IF last IDs are in memory → don’t search.
- IF the model wants a URL → hop, then remember you just published the file.
- IF the generalist writes weak prompts → add a specialist node, don’t fatten the router.
- IF JSON might contain quotes/newlines → strip before the HTTP body.
- Refuse: FAL/ImageBB for hive assets; 4¢ as FACT; Plus; new ICP.

## G. Contrarian
“No code Photoshop” is Telegram + Drive + two HTTP APIs + a public image host. Hormozi/JBL as training data is a likeness/brand problem he does not name. ImageBB makes the RAW public. Plus is the closer.

## H. Assumptions
4¢/image, $1/25, GPT 5.1, Sonnet 3.5 fallback = **UNVERIFIED**.
**Desk dissent:** Steal router + workflow-as-tool. Do not install FAL/Nano Banana. Keep media skills as the hive path.

## I. Questions
- Exact FAL model slug (Nano Banana Edit)?
- ImageBB retention/public listing?
- Ultimate-media-team video id for the logger?

## J. Connections
- **SYSTEM SYNTHESIS:** `product-ad-from-photo` · `clip-factory` · `motion-pipeline` · `cinematic-recipe`. Skills: those four · `golden-test-loop`.

## K. Future-Use
Normalize-in. Five-verb router. Workflow-as-tool. Binary→URL hop (with a privacy warning). JSON sanitize. Poll. Split RAW/AI folders. Prompt specialist.

## Steal / Operate-never

### Machine: channel-router-plus-image-subflow
- **Epistemic:** SOURCE
- **Workflow / loop:** normalize Telegram/text → optional rename → resolve Drive IDs → call combine/edit subflow (URL hop → generate → poll → store) → link back → later specialist prompt + logger
- **Questions / signals:** Photo or text? IDs in memory? RAW or AI folder? Did the badge text survive?
- **Qualify / frame / objections:** ImageBB is a leak. “No code” is HTTP. Likeness of Hormozi is not a hive asset.
- **Procedure:** D.
- **Example that proves it:** Memory combine vs RAW search; Eiffel text fail.
- **Why it works:** The parent only routes; the subflow owns the brittle API.
- **Conditions / exceptions:** $ UNVERIFIED. Hive uses existing media skills, not FAL.
- **Operate-never payload:** ImageBB client photos; FAL spend; Skool JSON; new ICP.
- **Hive run (existing skills only):** `product-ad-from-photo` · `clip-factory` · `golden-test-loop`
- **Source:** `7UNsK9LoORo` @ UNKNOWN

**Operate-never**
- ImageBB/FAL/Telegram stack. Quote 4¢ as FACT. New `icp_id`. Send / pay / deploy / publish ads.

## L. Role-Specific Applications
Map the router+subflow onto `product-ad-from-photo`. Do not import the Skool JSON. Flag public-URL hops as a leak.
