# Librarian — 7UNsK9LoORo
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/7UNsK9LoORo/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/7UNsK9LoORo/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** I Built a Photoshop AI Agent in n8n with no code (NanoBanana)
**Channel:** Nate Herk | AI Automation
**Kind:** video (~4273 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT unless noted)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. Telegram “Photoshop” agent: text or image in; five tools — combine, edit, Drive rename, search raw, search AI-out. Pocket via Telegram.
2. Demo: selfie → “what do you want to name it?” → **Nate**; granola bag → **granola**; “combine Nate + granola, photorealistic, hiking.” Memory already has IDs so it skips search. Drive link: Kind granola spelling OK, his face, mountain. Then Hormozi (low-res) + JBL on a boat — this time it **searches RAW** for IDs. Edit: granola ad in front of Eiffel; text “ingredients you can see and pronounce” garbled (source low-res + thin prompt). He says a dedicated prompt-writer agent would beat the generalist.
3. Graph: switch photo vs text; normalize to `json.message.text`. System prompt minimal: list tools + one rule (if photo, ask the name, then rename). GPT-5.1, Sonnet 3.5 fallback, memory = Telegram chat ID. Rename/search tools take agent-filled file ID + name; two search folders (media vs AI-out).
4. **Workflow-as-tool:** combine is a child n8n workflow (prompt, image1 ID, image2 ID, title). Array of IDs → split → Drive download → **ImageBB** binary→public URL (Nano Banana wants URLs) → aggregate → **FAL** HTTP (strip newlines/quotes so JSON lives) → wait 10s → poll 30s (he’d drop to ~4s) → GET binary → Drive → respond with link. Edit = same with one ID. FAL playground to refine prompts; ~**4¢**/image; OpenRouter free Nano Banana “maybe gone”; **25 images / $1** (UNVERIFIED).
5. Production next: specialist prompt agent in the child; execution logger (media-team Sheets pattern); hook image→V3 video as another workflow-tool. Skool JSON + setup sticky. Plus thousands / courses (UNVERIFIED).
Gap: FAL JSON, ImageBB. Timestamp UNKNOWN. n8n/FAL/ImageBB/Telegram/Skool on-tape. “No code” vs HTTP/cURL/JSON-escape.

## B. Atomic Knowledge

### Specialist child workflows; the parent only routes
- **Claim:** The steal is workflow-as-tool + normalize-the-input + poll-until-done + public-URL hop. Keep the parent prompt tiny; add instructions when a fail appears. Memory skips search; search exists for old files. Generalist should not write the image prompt.
- **Reasoning:** Combine and edit share 90% of a graph — one child, two arities. JSON dies on quotes. Models want URLs, Drive has binaries.
- **Mechanism:** Telegram → switch → agent → child (ImageBB → FAL → poll → Drive).
- **Evidence:** Nate+granola from memory; Hormozi+JBL from search; Eiffel text fail; 10s/30s poll.
- **Conditions:** 4¢ / 25-for-$1 UNVERIFIED. ImageBB is a public-URL leak surface.
- **Exceptions:** Dedicated prompt agent not built on tape.
- **Action:** File workflow-as-tool + URL-hop + poll. Do not install n8n/FAL/ImageBB as hive. Do not put client faces on a public image host. “No code” is a title.
- **Confidence:** high as a modular-tool machine
- **Source:** `7UNsK9LoORo` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared + demonstrated (transcript-implied)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** Eiffel label text; OpenRouter free gone
- **Speech ≠ behavior:** “no code” / “Photoshop” vs FAL cURL, JSON replace, ImageBB

## C. Mental Models
Parent routes, child specializes. Memory is a cache, search is the source of truth. Public URL is a workaround with a leak. Add prompt lines from fails.

## D. Procedures
1. Normalize inbound so the agent always sees one field.
2. One instruction until a fail earns the next.
3. File IDs from memory or search — never guess.
4. Binary → hosted URL → model → poll → binary back.
5. Escape the prompt for JSON.
6. Split prompt-writing into its own agent when quality stalls.
Avoid: n8n-cloud; ImageBB for anything private; 4¢ as FACT; Skool JSON as hive.

## E. Examples
**Memory skip:** Situation — just named Nate + granola. Action — combine without search. Outcome — mountain shot. Lesson — session memory is an ID cache.

**Eiffel ad:** Situation — edit granola. Action — thin prompt + low-res source. Outcome — label text wrong. Lesson — specialist prompt + better source.

## F. Decision Rules
- IF two tools share a graph → one child workflow, different arity.
- IF the model wants a URL → do not send Drive binary.
- IF the source is unreadable → do not blame the model alone.
- Refuse: n8n/FAL as hive; public-host private photos; Plus.

## G. Contrarian
Against one fat agent that also writes image prompts. Against “no code” as the lesson.

## H. Assumptions
Complements `4OOS96i2gfI` (tools can be workflows) and `jBanaNBY-sM`. Caption-only.

## I. Questions
Did ImageBB retain the faces? What poll interval actually worked?

## J. Connections
SYSTEM SYNTHESIS → `4OOS96i2gfI`; `AYsg5gAMWyo`; `jBanaNBY-sM`; `xn6Z5PYyAIE`.

## K. Future-Use
Workflow-as-tool + binary-URL-hop + fail-driven prompt lines as atoms.

## Steal / Operate-never

### Machine: tiny parent + child workflow-tools + poll + URL hop
- **Epistemic:** SOURCE
- **Workflow / loop:** normalize → route → child (URL hop → generate → poll → store) → checkable stop = a Drive link you opened, not a Telegram “done”
- **Questions / signals:** Photo or text? IDs in memory? JSON-safe prompt?
- **Qualify / frame / objections:** Modular so many parents can call one child.
- **Procedure:** D above.
- **Example that proves it:** combine vs edit arity; Eiffel fail.
- **Why it works:** The parent stays a router; the dangerous HTTP lives once.
- **Conditions / exceptions:** 4¢ UNVERIFIED; ImageBB leak.
- **Operate-never payload:** n8n/FAL/ImageBB as hive; public-host client faces; “no code” as FACT; Plus.
- **Hive run:** Steal modular-child. Do not add FAL or Telegram ads.
- **Source:** `7UNsK9LoORo` @ UNKNOWN

### Operate-never
- n8n-cloud / FAL / ImageBB as hive. Public-URL private photos. Merge LESSONS. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
File workflow-as-tool next to the pyramid tape. Do not stand up a hive ad-creative agent.
