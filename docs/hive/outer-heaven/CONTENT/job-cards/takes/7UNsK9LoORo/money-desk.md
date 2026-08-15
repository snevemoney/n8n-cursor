# Money Desk — 7UNsK9LoORo
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/7UNsK9LoORo/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/7UNsK9LoORo/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
~4273 words. Nate: no-code n8n ‘Photoshop’ agent — Telegram in, Nano Banana (via FAL) out, Drive as the library. Caption-only; timestamp UNKNOWN. Beats in order: master graph — text or image in; five tools: combine images, edit image, Drive rename, search RAW, search AI-generated; pocket via Telegram. Demo: send selfie → upload Drive (default name = today’s date) → agent asks name → ‘Nate’ → rename tool. Granola bag → name ‘granola.’ ‘Combine Nate + granola, photorealistic, man holding granola hiking.’ Combine tool; memory already has IDs so it skips search; Drive link: Kind spelling OK, his face, mountain. Second: low-quality Hormozi + JBL → ‘man listening on a boat’ — this time it searches RAW for IDs then combine; acquisition.com beater + speaker ‘not too bad.’ Edit: ‘granola ad in front of Eiffel’ — search RAW → edit tool → granola ad Eiffel; words mostly right except top line (‘ingredients you can see and pronounce’) because RAW is unreadable + prompt is minimal. He notes a dedicated prompt-writer agent would beat the generalist. Graph: Switch photo vs text; photo = download → Drive → agent; text = straight through; both normalized to `json.message.text`. System prompt tiny: personal assistant + tool list + one instruction (if photo, ask Drive name, then rename). Brain GPT-5.1, fallback Sonnet 3.5, memory = Telegram chat ID. Rename: update-by-ID (agent must find ID). Search RAW vs search AI = same node, different folder. Combine/edit are **n8n-workflow-as-tool** (modular — other agents can call them). Combine input contract: image prompt, image1 ID, image2 ID, new title. Live Hormozi+speaker payload shown. Edit Fields → array of two IDs → split → Drive download-by-ID → **ImageBB** binary→public URL (Nano Banana wants URLs) → aggregate → one FAL HTTP (prompt + two URLs; strip newlines/quotes so JSON doesn’t break) → 10s wait → poll FAL (he says 30s should maybe be 4) until done → GET result URL as binary → Drive upload → respond to main (name + link). Edit subgraph = same with one ID. FAL: many image/video models, one cred; Nano Banana Edit ~4¢/image UNVERIFIED; playground to refine prompts before n8n; curl docs. OpenRouter free Nano Banana was a thing, maybe gone; ‘25 images / $1’ UNVERIFIED. Customize: add a prompt-specialist agent before FAL; logger Sheet (input/tools/tokens) from Ultimate Media Team tape; next = image→V3-fast video as another workflow-as-tool. Close: free School JSON + setup sticky; Plus ‘thousands of members,’ two courses + third on monetize — UNVERIFIED.

## B. Atomic Knowledge
### Workflow-as-tool-keeps-the-brain-thin
- **Claim:** Main agent is Telegram + five tools + a tiny prompt. Combine/edit live in their own graphs so other agents can plug the same hop.
- **Reasoning:** Photo-name instruction is the only behavioral rule. GPT-5.1 + chat-ID memory. Dedicated prompt-writer would beat this generalist (Eiffel top-line fail).
- **Mechanism:** Normalize inbound. One instruction per failure you actually see. Modularize the expensive hop.
- **Evidence:** On-tape Nate+granola hike; Hormozi+JBL boat; granola Eiffel; 4¢/image.
- **Conditions:** A pocket creative loop.
- **Exceptions:** n8n / FAL / Nano Banana / ImageBB / Telegram / Drive / Plus are not ours. Auto-post the ad is operate-never.
- **Action:** Steal thin-brain-plus-modular-hop. HOLD the stack.
- **Confidence:** high as a shape
- **Source:** 7UNsK9LoORo @ UNKNOWN
- **Epistemic:** SOURCE
### Public-URL-then-poll-then-binary-back
- **Claim:** Banana wants public URLs. ImageBB is his free binary→URL. FAL is async: submit, wait, poll, GET binary, Drive, reply with link. Strip quotes/newlines or the JSON body dies.
- **Reasoning:** 10s then 30s poll — he says images are faster now. Two IDs = array+split so one request after aggregate.
- **Mechanism:** If you ever wrap an async image API: URL-ize, poll, don’t leave a URL as the user artifact if Drive is the library.
- **Evidence:** On-tape Hormozi+speaker live payload; granola public URL.
- **Conditions:** An async gen API.
- **Exceptions:** ImageBB/FAL/n8n not ours. Public-URL of a client face is a leak risk.
- **Action:** Steal poll-the-async. Do not ImageBB a real client.
- **Confidence:** high as a hop
- **Source:** 7UNsK9LoORo @ UNKNOWN
- **Epistemic:** SOURCE
### Memory-skips-search-until-it-cant
- **Claim:** Just-uploaded Nate+granola: memory has IDs, skip search. Older Hormozi+JBL: search RAW then combine. Rename defaults to today’s date until the user names it.
- **Reasoning:** Two search tools (RAW vs AI folder) so the agent doesn’t mix libraries.
- **Mechanism:** Ask the name on ingest. Search when memory is cold. Don’t dump the folder into context.
- **Evidence:** On-tape date-default then ‘Nate’ / ‘granola.’
- **Conditions:** A library plus a chat.
- **Exceptions:** Same filter-then-calc family (`QCjMBOEhpLE`). Telegram auto-send HITL.
- **Action:** Steal name-on-ingest. HITL the send.
- **Confidence:** high
- **Source:** 7UNsK9LoORo @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
Belief: pocket Photoshop = thin agent + two modular gen graphs. Priority: normalize input, name-on-ingest, poll FAL, specialize the prompt later. Experience: three live gens, one text fail. Contrarian: don’t fatten the system prompt until a failure. Uncertainty: 4¢, 25/$1, OpenRouter free gone, ‘thousands’ Plus.

## D. Procedures
His order: Telegram switch → Drive → ask name → tool (search if needed) → workflow-as-tool (ImageBB → FAL → poll → Drive) → link back. Our order: do not stand up. Steal thin-brain and poll-async. Caption-only: clicks UNKNOWN.

## E. Examples
**Situation:** Nate+granola, just uploaded. **Action:** combine, no search. **Reasoning:** memory has IDs. **Outcome:** hike shot, Kind text OK. **Lesson:** Warm memory skips the library hop.

**Situation:** Eiffel granola ad. **Action:** edit + tiny prompt. **Reasoning:** generalist writes the Banana prompt. **Outcome:** bag+tower, top line garbled. **Lesson:** Specialize the prompt writer; garbage RAW in, garbage text out.

**Situation:** FAL still running. **Action:** wait+poll. **Reasoning:** async. **Outcome:** binary lands in Drive. **Lesson:** Don’t treat submit as done.

## F. Decision Rules
IF photo in → ask name then rename. IF IDs unknown → search the right folder. IF JSON body → strip quotes/newlines. IF 4¢ / 25/$1 / thousands of members → UNVERIFIED. Refuse: n8n / FAL / Banana / ImageBB / Telegram auto-post / Plus as ours.

## G. Contrarian
Rejects a fat system prompt on day one. Rejects one mega-graph (workflow-as-tool). Rejects trusting Banana text on a low-res RAW.

## H. Assumptions
Demo faces/brands (Hormozi, JBL, Kind). ImageBB public URLs. 4¢ napkin. Plus ‘thousands’ vs other tapes’ 200/3000. Survivorship: three pretty gens. Falsifier: poll loops forever. Speech≠behavior: free JSON then Plus monetize course.

## I. Questions
What’s FAL Nano Banana $ now? Did ImageBB ToS allow this? Any checkout we can open from an ad this graph made?

## J. Connections
SYSTEM SYNTHESIS: workflow-as-tool = modular hop `7siRW0My05o` linear graphs. Poll = Arya silent-tool inverse (`Qt3zMBH-FNg`). Memory-skip-search = filter-then-calc. Logger = `lcNN3X9gXls` intermediate steps. n8n/FAL/Plus operate-never.

## K. Future-Use
Unassigned: ImageBB-as-public-URL footgun. Prompt-specialist-before-the-gen-API.

## Steal / Operate-never

### Machine: Thin-telegram-brain-plus-async-gen-subgraph
- **Epistemic:** SOURCE
- **Workflow / loop:** trigger: photo or text in chat → action: normalize; name-on-ingest; search only if IDs cold; modular gen (URL-ize → submit → poll → library) → checkable stop: a Drive link the human can open, not a raw URL left in chat as ‘done’
- **Questions / signals:** Photo or text? Do we have IDs? Is the gen API async? Who writes the image prompt?
- **Qualify / frame / objections:** Frame: thin brain, fat hop. Objection: ‘just prompt Banana from the main agent’ — Eiffel line failed.
- **Procedure:** Do not stand up n8n/FAL. Do not ImageBB a client. HITL any post. Tape 4¢ UNVERIFIED.
- **Example that proves it:** Nate+granola memory-skip; Hormozi search; Eiffel text fail. UNVERIFIED $.
- **Why it works:** The agent should pick tools. The subgraph should wait until the pixels exist.
- **Conditions / exceptions:** Works as a shape. Exception: n8n / FAL / Banana / ImageBB / Telegram post / Plus / 4¢ as FACT operate-never.
- **Operate-never payload:** n8n Photoshop agent · FAL/Banana · ImageBB client faces · auto-Telegram · Plus thousands · 4¢ analog
- **Hive run (existing skills only):** `playbook-before-send` · `golden-test-loop` · `ask-principal` · `pricing-margin-roi-guardrails`
- **Source:** 7UNsK9LoORo @ UNKNOWN


### Operate-never (this desk will not operate)
- Quote 4¢ / 25-for-$1 / thousands of members as FACT or as our analog.
- n8n / FAL / ImageBB as ours. Auto-post creatives. Public-URL a real face.

- Move money, approve a charge, refund, or fee. Live Stripe. Auto-send / auto-pay / auto-book / auto-deploy / auto-publish.
- Quote any tape $ / student count / job-loss % / prize / 10x as FACT or as our price analog.
- Nate Skool / Plus / AIS Plus / Hostinger NATEHERK / Uppit / Glaido / sold templates as a SKU. Do not map through `usecase-to-sku`. Do not join / install / import.
- Install Claude Code / Codex / Claude / ChatGPT / Gemini / Coda / Vapi / ElevenLabs / n8n-cloud / Trigger.dev / Hermes / Base44 / Sora / NanoBanana / Poppy / Lovable as ours. Cursor + Grok only. Vendor on tape is a mention, not a Bot dispatch.
- New hunt ICP. Unpark a client. Live hunt stays `local-pro` / Normand. Clients parked. No new `icp_id`.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Overwrite `takes/money-desk.md`.

## L. Role-Specific Applications
HOLD the Photoshop agent and FAL. Steal thin-brain, name-on-ingest, poll-async. Post stays HITL. Early rung $500–1K/mo CAD.

**Lens only (after A–K + Steal).** This desk votes PASS/HOLD on margin. It does not move money.

- `pricing-margin-roi-guardrails`: tape $ stays **UNVERIFIED**. Our early rung stays **$500–1K/mo CAD** after a 30–60d win. Delivery ≤40% of fee. Vendor / educator $ does not move Normand Path A.
- `outcome-offer-funnel` + `checkout-proof`: count checkout + warm conversions we can open. Quarantine YouTube receipts.
- `paid-slice-funnel`: thin V1; Stripe HITL; preview ≠ domain.
- `ask-principal` + `input-required-gate`: confirm ≠ execute. Pay / refund / fee stay HITL.
- `website-offer-funnel`: Path A/B/C spine still exists; this tape does not open a client unless Evens names one.
- Proposed, not written: `unit-econ-card` (price, COGS, contribution, aha-gate — tape $ never fills the line) · `token-receipt` (session cost versus artifact; leftover quota is not a KPI).

**Business parked:** no new `icp_id`. No `business-lanes.json` row. Hunt stays `local-pro` / Normand.
