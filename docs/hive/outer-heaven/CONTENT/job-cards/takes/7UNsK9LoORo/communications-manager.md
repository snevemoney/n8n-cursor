# Communications Manager — 7UNsK9LoORo
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/7UNsK9LoORo/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/7UNsK9LoORo/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
**Title (PACKET):** I Built a Photoshop AI Agent in n8n with no code (NanoBanana)
**Speaker / channel:** Nate Herk | AI Automation
**Kind:** tutorial · 4273 words · captions in `full.txt` only · timestamps **UNKNOWN** (no VTT used).
**Gaps:** Caption ingest; ASR errors possible (Naden/Nitn = n8n). Visual UI not fully narrated. Timestamps UNKNOWN.

Beats, in order:
- Open: n8n ‘Photoshop’ agent, Nano Banana, ads/UGC, free School template. Master agent: text or image in; five tools — combine, edit, Drive rename, search raw, search AI-gens. Pocket = Telegram.
- Demo: Telegram photo → Drive upload → ‘what do you want to name it?’ → Nate. Granola bag → granola. Combine Nate+granola → photoreal hike. Memory skips a re-search. Hormozi (low-res) + JBL on a boat via search-then-combine. Edit: granola ad in front of Eiffel; label text wrong (‘ingredients you can see and pronounce’) — raw was unreadable; prompt is thin.
- Build: switch photo vs text; normalize to json.message.text. System prompt tiny: list tools; if photo, ask the Drive name. GPT 5.1 + Sonnet 3.5 fallback; memory = Telegram chat id. Rename/search tools take file id + name; folders split raw vs AI.
- Combine is a callable n8n workflow: prompt + two ids + title → array → download → ImageBB public URLs (Nano Banana wants URLs) → one FAL.ai request → wait 10s then poll 30s → GET binary → Drive → link back. Edit = same with one id. He says a dedicated prompt-writer agent would look better. School: YouTube resources + JSON + sticky setup note.

## B. Atomic Knowledge

### A Telegram image bot is not a mailer — and Hormozi-in-an-ad is not ours to send
- **Claim:** The machine is: normalize input → name the file → tool picks combine/edit → public URL → poll → Drive link. Memory made it skip a search. The Eiffel ad misspelled the pack.
- **Reasoning:** UGC/ad creatives are a different desk. Combining a real face with a product is a likeness problem if we ever operated it.
- **Mechanism:** Do not install n8n/FAL/ImageBB/Telegram. Do not mail a fake Hormozi ad. Do not treat ‘photoreal’ as a send.
- **Evidence:** Hike granola; boat Hormozi; Eiffel typography miss.
- **Conditions:** Image-tool tapes.
- **Exceptions:** Nano Banana / n8n as ours is never. Likeness of living people in ads is never without Evens — and we still don’t run this.
- **Action:** Steal: normalize one field; poll until done; thin prompt shows in the type. No Telegram agent.
- **Confidence:** high
- **Source:** `7UNsK9LoORo` @ UNKNOWN
- **Epistemic:** SOURCE

### A workflow-as-tool is modular — it is still a vendor we do not run
- **Claim:** He likes calling a second n8n workflow so the next agent can reuse combine. ImageBB is a ‘free workaround’ that puts the face on a public URL.
- **Reasoning:** Public URL of Evens (or a client) is a leak.
- **Mechanism:** Never upload hive faces to a random host to please an image API.
- **Evidence:** ImageBB → FAL; poll loop.
- **Conditions:** Any binary-to-URL hop.
- **Exceptions:** Do not copy the hop.
- **Action:** No public-URL faces. No send.
- **Confidence:** high
- **Source:** `7UNsK9LoORo` @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
- Thin system prompt + five tools; add a line when it fails. **SOURCE**
- Memory can skip a search — good until the id is wrong. **SOURCE**
- Unreadable raw in → unreadable type out. **SOURCE**

## D. Procedures
- Telegram → switch → Drive → ask name → combine/edit subflow → poll → link. **SOURCE**
- This desk: no Telegram Photoshop. No Hormozi ad. **SYSTEM SYNTHESIS**

## E. Examples
- **Situation:** Granola + Eiffel ad. → **Action:** Edit tool; pretty bag; broken headline. → **Reasoning:** Raw was mush; prompt was thin. → **Outcome:** He still calls it a good creative. → **Lesson:** Do not send the first gen. Implicit rule: public-URL faces are a never.

## F. Decision Rules
- If a face must leave the machine → Evens, and not via ImageBB.
- If the proof is a Hormozi mashup → omit.
- Refuse: n8n/FAL as ours. Telegram sender. UGC blast.
- Optimize: clip-factory without clone; Evens reviews stills.

## G. Contrarian
- Field wants one-click ads. He still needs a poll and a better prompt agent. **SOURCE**

## H. Assumptions
- Demos are his Drive. Falsifier: a Telegram bot that posts the ad.

## I. Questions
- Are we about to public-URL a face?

## J. Connections
- **SYSTEM SYNTHESIS:** `AYsg5gAMWyo` (UGC). `clip-factory`. `R0qF17BVl9w`.

## K. Future-Use
- No-Telegram-image-bot as an ops note. Likeness stays HITL.

## Steal / Operate-never

### Machine: Normalize + poll; never Telegram-send an ad; never public-URL a face
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** Image tape → write the never → no n8n → no send.
- **Questions / signals:** Would this upload a face? Post to Telegram as us?
- **Qualify / frame / objections:** Qualify: demo vs mail. Frame: ImageBB leak. Objection: ‘no code Photoshop’ → not our SKU.
- **Procedure:** 1) No n8n/FAL. 2) No ImageBB faces. 3) No Telegram agent. 4) No send.
- **Example that proves it:** Eiffel headline fails; Hormozi boat is a likeness mashup.
- **Why it works:** A combine tool is not a campaign.
- **Conditions / exceptions:** Image-agent tapes. Exception: Cursor + Grok.
- **Operate-never payload:** Mail a fake-Hormozi creative. Install the School JSON as ours.
- **Hive run (existing skills only):** `clip-factory` (no clone). `ask-principal`.
- **Source:** `7UNsK9LoORo` @ UNKNOWN


### Operate-never (this desk will not operate)
- Install n8n / FAL / ImageBB / Telegram agent. Public-URL hive faces. Send UGC. Hormozi likeness in a letter.
- Gmail **send**. Connector write. Scheduled send. Auto-send. Ack-reply. Mass-DM. Postcard. Waitlist blast.
- Quote tape $ / student counts / job-loss % / ROI hours as FACT in a letter.
- New hunt ICP. Unpark Normand. Clients parked — no Path A this week.
- Install on-tape vendors (Vapi, Claude, Codex, ChatGPT, Gemini, Coda, Abacus, Skool, n8n-cloud). Stack stays Cursor + Grok. On-tape names stay on-tape.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. New `icp_id`.

## L. Role-Specific Applications
- I do not operate a Telegram Photoshop. I do not send. Clients parked.
