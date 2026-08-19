# Big Boss — 7UNsK9LoORo
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/7UNsK9LoORo/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/7UNsK9LoORo/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Long (PACKET: 17:25, 4273 words, captions `en-orig`). Timestamp UNKNOWN on `full.txt` (no VTT in the take). Visual-only gaps: n8n canvas, Telegram thread, Drive `media` / `AI image generation` folders, ImageBB public URLs, FAL poll, granola/Hormozi/JBL/Eiffel stills. Title: Photoshop AI agent in n8n, no code, Nano Banana. Dated on PACKET as uploaded 2025-09-05 — older than the Claude-Code cluster; same “one chat, named tools” physics as the IlNwjnIzrOo short.

Beats, in order:

1. Hook: Photoshop AI agent in n8n, no code, Google **Nano Banana**. “Changing the game for ad creatives and UGC.” Resources free if you stay.
2. Master agent, “not too complex.” Input: **text or image**. Five tools: two image-gen (**combine**, **edit**); three Drive (**change name**, **search raw**, **search AI-generated**). Operated from a pocket via **Telegram**.
3. Demo 1: send a photo on Telegram → upload to Drive → agent asks **what to name it** → “call it Nate” → `change name` (default was today’s date) → `media/Nate`. Asks what’s next.
4. Demo 2: granola bag photo → name it `granola` → confirm in `media`.
5. Demo 3: “combine Nate and granola… photorealistic… man holding granola hiking on a mountain.” **Combine** tool. Memory already has IDs — **skips re-search**. Drive link: Kind granola spelling OK, his face, mountain. He notes a dedicated prompt-agent would be better than this main agent writing the image prompt.
6. Demo 4: files not just-uploaded — low-quality **Hormozi** + **JBL** speaker. “Combine… man listening to the speaker on a boat.” This time it **searches RAW**, gets IDs, then combine. Result in AI-images folder: JBL + Hormozi in acquisition.com beater, “not too bad.”
7. Demo 5 — **edit**: “photorealistic advertisement of the granola… held in front of the Eiffel Tower.” Search raw (or memory) → `edit image` → `granola ad Eiffel`. Words mostly right except the top line (“ingredients you can see and pronounce”) — raw was low quality + “prompting in this workflow is very minimal.” Model will get better.
8. Build tour — **input switch:** photo vs text. Photo path: download → Drive upload → agent. Text path: straight to agent. **Standardize** so the agent always sees `JSON message.text` (spoken `json message.ext` in captions).
9. **System prompt is minimal:** “personal assistant… use the tools.” Lists the five with short descriptions (tools also have their own). **One instruction:** if user submits a photo, ask the Drive-name question, then `change name`. Add instructions when you see fails. Model: **GPT 5.1**, fallback **Sonnet 3.5**. Memory: simple, session = **Telegram chat ID**.
10. File tools: `change name` = update by ID + new name (agent must find ID first). Search raw = folder `media`. Search AI = generated folder. Same node, different folder.
11. **Workflow-as-tool:** combine is a **custom n8n workflow** the main agent can call (`call an n8n workflow as a tool`). Modular: any future agent can plug the same combine. Input contract: **image prompt, image1 ID, image2 ID, image title**. Live Hormozi+speaker data shown. Edit fields → array of two IDs → split → Drive download both → **ImageBB** binary→**public URL** (Nano Banana API requires a public URL) → aggregate → one **FAL AI** request (prompt + two URLs). Prompt **sanitize**: strip newlines and double quotes so JSON does not break. FAL ack → wait **~10s** → poll; if not done wait **~30s** (he says should be ~4; images are fast) → loop until done → GET result URL as binary → Drive upload → respond to main agent (created, name, link).
12. Edit workflow: “very similar,” one ID not two. Same ImageBB → FAL → sanitize → poll → Drive → reply. Granola/Eiffel sub-execution walked.
13. **Pricing:** FAL = many image/video models, one credential. Nano Banana Edit, V3, V3 fast in recents. **~4 cents per image** — UNVERIFIED. Play with URLs/prompts on FAL **before** n8n. API docs via HTTP curl. Open Router had free Gemini Nano Banana for a while (Gemini web app free try); he thinks they pulled it. “**25 images for a dollar**” — UNVERIFIED.
14. **Production-ready next (not built here):** (a) **dedicated prompt agent** in the combine/edit workflows so the main five-tool brain is not also the prompt specialist; (b) **logger** — prior “ultimate media team” wrote steps / errors / tokens to a **Google Sheet** (input, tools, tokens); he tags that video; (c) **image → video** (V3 fast) as another workflow-as-tool, already in the media-agent tape. Beauty: one custom workflow, many agents.
15. CTA: free Skool YouTube resources + JSON import + sticky **setup guide**. Plus: monetize n8n, thousands of members, two courses + a third on monetizing, foundations → master n8n → sell/consult. Like + next.

Off-topic / not skipped: UGC/ad-creative claim; ImageBB as a public-URL hack; FAL as Open-Router-for-pixels; Hormozi/JBL as props; V3 video hook; Plus monetize close.

## B. Atomic Knowledge

### One chat, five named tools
- **Claim:** Telegram is the operator surface. The agent is not “Photoshop.” It is a router over five tools: combine, edit, rename, search-raw, search-gen.
- **Reasoning:** Minimal prompt works because the tool list is short and each tool has a description. GPT 5.1 + one naming instruction is enough for the demo.
- **Mechanism:** Switch on photo vs text → standardized `message.text` → agent picks a tool → Drive or a child workflow.
- **Evidence:** Five demos, five tools, no sixth.
- **Conditions:** Works when the next message can refer to a **named** file. Breaks when IDs are unknown and search is off.
- **Exceptions:** Memory can skip search (Nate+granola). Hormozi+JBL had to search.
- **Action:** One job per tool = named desks, not a nameless media army. Do not install Telegram/n8n.
- **Confidence:** high
- **Source:** `7UNsK9LoORo` @ UNKNOWN — “the agent has five different tools to choose from”
- **Epistemic:** SOURCE

### Name the file before anyone edits
- **Claim:** Default Drive name is today’s date. The only standing instruction is: photo in → ask the name → `change name`. Later prompts (“combine Nate and granola”) need those tokens.
- **Reasoning:** A date-stamp is not a handle. The IlNwjnIzrOo short is the same machine.
- **Mechanism:** Ask → human token → update by ID → confirm in `media`.
- **Evidence:** Nate, granola; then those strings in the combine brief.
- **Conditions:** Required on first ingest. Optional if the file is already named and searchable.
- **Exceptions:** Share-settings are not on this tape (they were on the short).
- **Action:** Definition of done includes a named artifact in a known folder before style work.
- **Confidence:** high
- **Source:** `7UNsK9LoORo` @ UNKNOWN — “What would you like me to name that photo in your Google Drive?”
- **Epistemic:** SOURCE

### Memory skips re-search — search is the fallback
- **Claim:** If the session just uploaded Nate + granola, combine does not hit search. If the files are old (Hormozi, JBL), it searches RAW for IDs, then combines.
- **Reasoning:** IDs are the real currency. Memory is a cache, not a source of truth.
- **Mechanism:** Simple memory keyed by Telegram chat ID. Search tools scoped by folder.
- **Evidence:** He narrates the skip, then the search, on consecutive demos.
- **Conditions:** Same chat session. New chat = no memory.
- **Exceptions:** He does not show a wrong-ID miss.
- **Action:** Cache is fine; folder search is the checkable fallback. Do not treat memory as done.
- **Confidence:** high
- **Source:** `7UNsK9LoORo` @ UNKNOWN — “because it’s using its memory, it already knows that. So that’s why it didn’t hit the other file handling tools”
- **Epistemic:** SOURCE

### Standardize the inbound field
- **Claim:** Photo and text take different n8n paths but must arrive at the agent as the **same field** (`message.text`).
- **Reasoning:** The router should not care about the wire format. Two shapes, one contract.
- **Mechanism:** Switch → download/upload or passthrough → set fields.
- **Evidence:** First node tour. Caption says `json message.ext` — same beat.
- **Conditions:** Any multi-modal inbox (chat photo vs caption).
- **Exceptions:** He does not handle photo+caption as a third shape on tape.
- **Action:** One inbound contract per desk. `golden-test-loop` on the type.
- **Confidence:** high
- **Source:** `7UNsK9LoORo` @ UNKNOWN — “standardize the input so the agent looks at it no matter what comes through”
- **Epistemic:** SOURCE

### Workflow-as-tool is a named specialist
- **Claim:** Combine and edit are **child workflows** with an input contract (prompt + IDs + title). The main agent does not contain FAL. Any later agent can plug the same child.
- **Reasoning:** Modular = one job, many callers. He says this is the beauty, and the hook to V3 video / the “ultimate media team.”
- **Mechanism:** n8n “workflow as a tool.” Child returns name + Drive link. Parent speaks to Telegram.
- **Evidence:** Node-by-node combine + “view sub-execution” on edit.
- **Conditions:** Contract must be explicit or the parent invents IDs.
- **Exceptions:** Main agent still writes the image prompt today — he calls that a weakness.
- **Action:** `interview-to-desk` / `agent-as-hire`: child workflow = a desk with owns/never. Do not nest a farm.
- **Confidence:** high
- **Source:** `7UNsK9LoORo` @ UNKNOWN — “if I ever want to create another agent that can combine images, I can just plug it into this workflow”
- **Epistemic:** SOURCE

### Public URL is a leak path
- **Claim:** Nano Banana (via FAL) wants a **public** image URL. He uploads binaries to **ImageBB** (free) to get one. Anyone with the URL has the still.
- **Reasoning:** Convenient workaround. Also a publication. Client faces / unreleased ads do not belong on a public image host.
- **Mechanism:** Drive download → ImageBB → URL into FAL JSON.
- **Evidence:** Hormozi and granola URLs opened on tape. “Cool little workaround.”
- **Conditions:** Demo / already-public props. Not a client SKU.
- **Exceptions:** He names “other ways” and does not show a private signed URL.
- **Action:** Public still-host is operate-never for anything we would not post. `ask-principal` if a URL must leave the machine.
- **Confidence:** high
- **Source:** `7UNsK9LoORo` @ UNKNOWN — “the nano banana API… has to take a public URL of an image”
- **Epistemic:** SOURCE

### Sanitize the JSON body
- **Claim:** Newlines and double quotes in the prompt will break the FAL request. He `replace`s them before send.
- **Reasoning:** The child workflow is a write to an HTTP JSON body. Ugly characters are a silent fail.
- **Mechanism:** Two replace functions on the prompt field. Same guard on edit.
- **Evidence:** Spoken twice (combine + edit).
- **Conditions:** Any prompt-into-JSON hop.
- **Exceptions:** He does not show a before/after break on tape.
- **Action:** Guard the body. Forge: a golden with a quoted / multiline prompt.
- **Confidence:** high
- **Source:** `7UNsK9LoORo` @ UNKNOWN — “if the prompt has new lines or… double quotation marks that it gets rid of that because that would break the JSON”
- **Epistemic:** SOURCE

### Poll until done — then shrink the wait
- **Claim:** FAL is async: submit → wait 10s → poll → if not done wait 30s (he would change to ~4) → loop → GET binary.
- **Reasoning:** A fire-and-forget HTTP would return “working.” The guardrail is the loop. Over-wait is waste, not correctness.
- **Mechanism:** Wait nodes + if-done branch.
- **Evidence:** Combine tour; “another cool guard rail.”
- **Conditions:** Any vendor that acks then renders.
- **Exceptions:** Images are “really quick”; video (V3) would need a longer poll — named, not built.
- **Action:** Checkable stop = binary back in Drive + link to parent. Do not call the ack “done.”
- **Confidence:** high
- **Source:** `7UNsK9LoORo` @ UNKNOWN — “it will just continuously check until it’s done”
- **Epistemic:** SOURCE

### Minimal prompt + add-on-fail
- **Claim:** System prompt is almost empty on purpose. One standing rule (name the photo). When it fails later, **add an instruction**. Do not pre-write a novel.
- **Reasoning:** Five tools + tool descriptions carry the load. Over-prompting the router fights the specialists.
- **Mechanism:** Test → fail → one new line. GPT 5.1 / Sonnet 3.5 fallback.
- **Evidence:** “as I’m testing more… just add instructions… when you realize it’s failing.”
- **Conditions:** Small tool list. A 40-tool agent would not get this luxury.
- **Exceptions:** He already wants a **second** agent for prompts — so “minimal” is for the router, not for the specialist.
- **Action:** Router stays thin. Specialists get the taste brief. `agent-job-card` owns/never.
- **Confidence:** high
- **Source:** `7UNsK9LoORo` @ UNKNOWN — “The system prompt is very minimal”
- **Epistemic:** SOURCE

### Dedicated prompt specialist + logger + video are volunteer nexts
- **Claim:** He would add (1) a prompt-only agent in the child workflow, (2) a Sheet logger like the media-team tape, (3) image-to-video via V3 as another plug-in tool. None of the three are in this ship set.
- **Reasoning:** Main agent “has tons of other jobs.” Logging is how you see tokens / errors. Video is a later door. Same “eager extra job” smell as IlNwjnIzrOo’s unsupervised text-to-video.
- **Mechanism:** Add an agent node before FAL; Sheet append; another workflow-as-tool.
- **Evidence:** Closing customize beat + Plus/Skool.
- **Conditions:** After the five-tool loop is headed and private.
- **Exceptions:** He already built those in the sibling media-agent. This tape only points.
- **Action:** Volunteer jobs stay labeled volunteer. No V3 farm. No Sheet as a vanity dashboard (`0WDkwMxj13s`).
- **Confidence:** high that they are nexts, not this demo
- **Source:** `7UNsK9LoORo` @ UNKNOWN — “it would be better to have a second agent in this workflow that would specialize in that”
- **Epistemic:** SOURCE

### FAL cents are a magnet, not a price analog
- **Claim:** ~4¢/image, 25 images/$1, Open Router free window maybe closed. Play on FAL’s site before n8n.
- **Reasoning:** Who-pays is him (or the downloader). UGC/ad-creative “game changing” is the title.
- **Mechanism:** One FAL key, many models (Nano Banana, V3…).
- **Evidence:** Pricing beat. No invoice shown.
- **Conditions:** His account. Not ours.
- **Exceptions:** Gemini web-app free try is a different door.
- **Action:** Tape $ UNVERIFIED. Do not price a hive SKU from 4¢.
- **Confidence:** low as a number; high as a magnet
- **Source:** `7UNsK9LoORo` @ UNKNOWN — “it’s only about 4 cents per image”
- **Epistemic:** SOURCE (claim) / UNVERIFIED (price)

## C. Mental Models

- **Router + specialists.** Thin prompt, fat tools. **SOURCE**
- **Name is the handle.** Date-stamp is not. **SOURCE**
- **Memory is a cache; folder search is truth.** **SOURCE**
- **One inbound contract.** **SOURCE**
- **Child workflow = plug-in desk.** **SOURCE**
- **Public URL is a publish.** **SOURCE**
- **Sanitize the write.** **SOURCE**
- **Ack ≠ done; poll.** **SOURCE**
- **Add instructions on fail, not before.** **SOURCE**
- **“Pocket Photoshop / UGC” is the magnet.** **INFERENCE**

## D. Procedures

1. **Ingest** on one chat (photo or text).
2. **Standardize** the inbound field.
3. **If photo:** land in a known folder; **ask name**; rename; link-back.
4. **Router** picks one of five (or hive analog: one specialist).
5. **IDs:** memory if fresh; else search the right folder.
6. **Child job** gets a contract (prompt + IDs + title). Router does not own the vendor HTTP.
7. **No public host** for anything we would not post. If a vendor demands a URL, that is a stop / HITL.
8. **Sanitize** the JSON body.
9. **Poll** until binary is back; ack is not done.
10. **Human reviews** the Drive link. Volunteer prompt-agent / logger / video are not in the ship set.
11. **On fail:** one new router instruction, or fix the child — not a sixth random tool.

**Qualify / frame / objections:** Content-ops demo, not a client SKU. Hormozi / JBL / granola / Eiffel are props. Objection: “pocket Photoshop” — five tools + a public URL leak. Objection: UGC farm — operate-never. Voice/Vapi n/a; Telegram always-on is the same refuse. Steal the **name → search-or-memory → child contract → poll → human pick**.
**Avoid:** ImageBB + FAL + Telegram install; auto-post; quote 4¢ / $1 / 25 as FACT; Skool JSON as a hive SKU; new hunt.
**When to change:** if the file is unnamed, stop. If the URL would be public, stop. If the child wants to start V3 unasked, reject.

## E. Examples

**Situation:** Selfie lands in Telegram with a date-stamp name.  
**Action:** Agent asks; he says Nate; Drive shows `media/Nate`.  
**Reasoning:** Later “combine Nate and granola” needs a handle.  
**Outcome:** Named file, then a mountain still.  
**Lesson:** Name-and-folder is the first checkable stop. Implicit rule: do not combine unnamed blobs.

**Situation:** Hormozi + JBL already in RAW, not in memory.  
**Action:** Search RAW → IDs → combine → boat still.  
**Reasoning:** Cache miss is normal.  
**Outcome:** New file in the generated folder.  
**Lesson:** Search is the fallback. Implicit rule: memory skip is a convenience, not a design.

**Situation:** Granola Eiffel ad; top line garbles.  
**Action:** He blames low-res raw + minimal prompt; says a prompt specialist + better model will help.  
**Reasoning:** Router is the wrong brain for taste.  
**Outcome:** Still “good enough” for the demo; not a ship.  
**Lesson:** Taste is a specialist + a human look. Implicit rule: “words are pretty much spot-on except…” is not done.

**Situation:** FAL needs a public URL.  
**Action:** ImageBB the binary; open the URL on tape.  
**Reasoning:** Vendor contract.  
**Outcome:** It works; the still is on the public internet.  
**Lesson:** Workaround = publish. Implicit rule: props only; never a client face.

## F. Decision Rules

- If the file is unnamed → ask before edit/combine.
- If IDs are unknown → search the right folder; do not guess.
- If photo vs text → same inbound field.
- If the vendor wants a public URL → HITL or refuse.
- If the prompt can break JSON → sanitize.
- If the vendor acked → poll; not done.
- If the router is writing image prompts poorly → specialist, don’t fatten the router.
- If a next is logger / V3 / UGC → volunteer, not ship.
- Optimize: time-to-named-file → one headed still.
- Refuse: Telegram always-on, ImageBB farm, auto-post, Plus-as-SKU.

## G. Contrarian

- Against “one fat Photoshop agent”: five tools + child workflows.
- Against “write a huge system prompt”: one instruction, add on fail.
- Against “the main brain should also be the art director”: he wants a second agent.
- Against “ack means done”: poll.
- Field assumes the Skool JSON is the system. He treats this video as a template + a Plus close.

## H. Assumptions

**His:** Telegram + Drive + n8n + FAL + ImageBB is the right OS; Nano Banana is “insane”; 4¢ is cheap enough; modular workflows will be reused; Skool JSON + setup sticky is enough to copy; UGC/ads are the use.

**Ours:** Captions complete enough (4273 words). Still quality / 4¢ / 25-for-$1 **UNVERIFIED**. Domain-specific: creator media ops, 2025 n8n tape. Hive stack is Cursor + Grok; Creative already has still→clip skills. Hormozi/JBL are props, not ICPs.

**Falsifiers:** ImageBB ToS / leak burns a client. Sanitize misses a character and FAL 400s silently. Memory returns the wrong Nate. Poll loops forever. V3 extra job auto-posts.

**Disagreement (keep labeled):** Hive will not operate a Telegram / FAL / ImageBB Photoshop. The **name → ID → child contract → poll → human review** machine is still stolen. **SYSTEM SYNTHESIS**

## I. Questions

- Sibling “ultimate media team” / IlNwjnIzrOo / V3 tape ids — PACKET may bind; do not invent.
- Did ImageBB URLs expire or stay public? Not on tape.
- GPT 5.1 + Sonnet 3.5 — dated; do not treat as current seating.
- Logger Sheet: who reads it? Pointed, not shown.

## J. Connections

- **SYSTEM SYNTHESIS** → quality-bar `IlNwjnIzrOo` (Telegram, name speaker, three previews, volunteer video). This is the long image-agent; that short is the magnet.
- **SYSTEM SYNTHESIS** → `3GAxd90fEE4` (WAT / workflow-as-tool; one job per tool).
- **SYSTEM SYNTHESIS** → `-cdexJWN8YA` (standardize the loop; who pays if public).
- **SYSTEM SYNTHESIS** → `0WDkwMxj13s` (logger vs dashboard; send/public = capability).
- **SYSTEM SYNTHESIS** → `clip-factory` / `motion-pipeline` (still → clip; human ships) · `agent-as-hire` · `golden-test-loop` · `ask-principal` · `slice-build` · `one-channel-deep`.

## K. Future-Use

- Inbound-field contract as a Watchdog smoke (unassigned).
- Sanitize-golden for any JSON prompt hop (unassigned).
- Prompt-specialist vs router as a Creative job-card line (unassigned).
- Public-URL refuse as a default (unassigned).

## Steal / Operate-never

### Machine: Name → ID → child contract → poll → human review
- **Epistemic:** SOURCE (demo) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** trigger (photo or text on one chat) → standardize inbound → if photo, land in known folder + **ask name** + rename + link-back → router picks one named tool → IDs from memory or folder search → child workflow gets prompt+IDs+title → **no public host** without HITL → sanitize JSON → submit → **poll until binary** → Drive + link to human → human reviews. Volunteer prompt-agent / logger / V3 stay out of the ship set. Checkable stops: named file; correct folder; headed still; no extra video.
- **Questions / signals:** “What do we name this?” “Do we have IDs or do we search?” “Which child?” “Would this URL be public?” “Did we get binary or just an ack?” “Is V3 requested?”
- **Qualify / frame / objections:** Content ops, not a SKU. Props, not ICPs. Objection: pocket Photoshop — five tools + a leak. Objection: UGC/ads — operate-never farm. Telegram always-on = operate-never; steal the qualify (name / ID / contract / poll).
- **Procedure:** D steps 1–11. Checkable stops: (1) named file in known folder, (2) IDs from search-or-memory, (3) child contract filled, (4) binary reviewed, (5) no ImageBB on anything private, (6) no volunteer video.
- **Example that proves it:** Nate+granola memory-skip vs Hormozi+JBL search; Eiffel garble shows taste is not the router’s job. Lesson: handle + ID + specialist. Implicit rule: public URL is a publish.
- **Why it works:** Later prompts need a handle. Routers stay thin. Children own vendor quirks (poll, sanitize). Humans still pick. Conditions: one operator, named tools, headed review. Exceptions: his 4¢ / Skool JSON / Plus close are magnets; ImageBB is a demo leak.
- **Conditions / exceptions:** Cursor + Grok only. n8n / Telegram / Drive / FAL / ImageBB / Nano Banana / Skool stay on tape. Clients parked. Tape $ UNVERIFIED. No auto-post. Voice/Vapi/auto-dial n/a; always-on Telegram is the same refuse.
- **Operate-never payload:** ImageBB public farm; FAL/UGC factory; Telegram always-on; auto-post; “Photoshop agent” as a hive SKU; install his stack; new hunt.
- **Hive run (existing skills only):** `agent-as-hire` (five tools / child contract) · `agent-job-card` (router vs specialist; no volunteer ship) · `golden-test-loop` (type + sanitize + headed still) · `clip-factory` / `motion-pipeline` (still → clip if ever asked; human ships) · `one-channel-deep` · `ask-principal` (any URL leaving the machine / publish) · `slice-build` (one edit loop).
- **Source:** `7UNsK9LoORo` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- ImageBB public + FAL farm / Telegram always-on / auto-post. Cursor + Grok only
- Nate Skool JSON / Plus / UGC Photoshop as a hive SKU
- Quote 4¢ / 25-for-$1 / Open Router free as FACT
- New hunt ICP. Clients parked. No Normand. No JBL/Hormozi hunt
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md` (Researcher owns that)

## L. Role-Specific Applications

I manage; I do not pocket-Photoshop the hive.

- **Done** on this slice: named file in a known folder + one headed still from a named child job. ImageBB, V3, and a Telegram bot are not done.
- **Delegate without being asked:** Creative Studio packages stills; Publishing does not ship; Watchdog checks name + no public URL; Forge tests a quoted prompt against sanitize; HITL holds any URL that leaves the machine.
- **Skeptical review:** “No-code Photoshop / UGC” is the title’s job. I will not approve a public-image farm because granola looked fine in front of the Eiffel Tower.
- **One system this take:** one private still, HITL. Not a pocket Photoshop. Not UGC.
- Live hunt stays parked. I do not rotate to ad-creative because Nano Banana slapped.
