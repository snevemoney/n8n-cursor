# Day Planner — 7UNsK9LoORo
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/7UNsK9LoORo/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/7UNsK9LoORo/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate: n8n “Photoshop” agent — **Nano Banana** via **FAL**, Telegram, Drive. Beats: text **or** image in; five tools (combine, edit, rename, search raw, search AI); Telegram demo: upload → “what name?” → Nate / granola → combine hiking; memory skips re-search; Hormozi+JBL boat (search raw for IDs); granola Eiffel ad — **typo** on “ingredients you can see and pronounce” (low-res raw + thin prompt); switch standardizes `json.message`; **minimal** system prompt + **add a line when it fails**; GPT-5.1 + Sonnet 3.5 fallback; memory = **Telegram chat ID**; file tools take **ID + new name**; **workflow-as-tool** (modular combine); ImageBB binary→public URL (Banana needs a URL); aggregate two URLs → one FAL call; dedicated prompt-agent would be better (he says). Skool template. Caption-only. Timestamp UNKNOWN.

## B. Atomic Knowledge
### Modular tool-workflows; standardize the inbound; add the prompt line when it fails
- **Claim:** The agent is thin; the combine/edit graphs are reusable tools; inbound photo vs text must share one field; you grow the prompt from **failures**, not a novel on day one.
- **Reasoning:** Memory (chat ID) avoids a search; low-res + thin prompt = typo ad.
- **Mechanism:** Telegram → switch → agent → Drive/FAL.
- **Evidence:** “add instructions to your system prompt when you realize it’s failing.”
- **Conditions:** Telegram + Drive + an image API.
- **Exceptions:** Public-URL hop (ImageBB) is a leak surface.
- **Action:** Steal modular-tool + fail-then-add-line. Do not Telegram-bot. Do not FAL/Banana. Do not publish the ad.
- **Confidence:** high as the pattern.
- **Source:** `7UNsK9LoORo` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** demonstrated (speech)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** Eiffel typo
- **Speech ≠ behavior:** “if that’s not a good ad” vs the typo

## C. Mental Models
Five tools beat a giant prompt. Pocket = Telegram. Priority: demo cute ads. We care about the fail-line and the public-URL hop. Uncertainty: FAL $.

## D. Procedures
1. One inbound field for text and photo.
2. Split “find ID” from “do the edit.”
3. When it fails, add **one** instruction, retest.
4. Don’t upload binaries to a random public host if you can avoid it (his ImageBB).
Avoid: Telegram agent; FAL pay; publish UGC; Skool.

## E. Examples
**Name-then-combine:** Situation → selfie + granola. Action → ask name, then combine. Reasoning → one instruction in the prompt. Outcome → hiking shot. Lesson → steal the ask-name line.

**Eiffel typo:** Situation → “ad in front of the tower.” Action → edit tool, thin prompt, low-res raw. Outcome → garbled ingredients. Lesson → fail → add a line; don’t ship.

## F. Decision Rules
- IF photo and text don’t share a field → the agent will miss one.
- IF the combine graph is copied into every agent → extract a tool-workflow (his).
- IF the ad has a typo → not a creative, a fail.

## G. Contrarian
He ships a tiny prompt on purpose. Field: more prompt. He: add on fail.

## H. Assumptions
Theirs: ImageBB is fine. Ours: public URL is a leak; no Telegram. Falsifier: a one-shot prompt that never needed a fail-line. Survivorship: three images.

## I. Questions
Nano Banana tape elsewhere? FAL cost?

## J. Connections
- SYSTEM SYNTHESIS → `golden-test-loop` · `send-removed` (Telegram) · `slice-build` (modular).

## K. Future-Use
Fail-then-add-line. Workflow-as-tool. Unassigned ImageBB hop.

## Steal / Operate-never

### Machine: one inbound field → thin prompt → fail adds a line → extract the heavy graph as a tool
- **Epistemic:** SOURCE
- **Workflow / loop:** standardize in → try → on fail, one new instruction → if the graph repeats, extract it
- **Questions / signals:** Photo or text? Public URL? Typo?
- **Qualify / frame / objections:** “Pocket Photoshop” is the fail. Eiffel typo is the tell.
- **Procedure:** No Telegram. No FAL. No publish.
- **Example that proves it:** Situation → granola ad. Action → thin prompt. Reasoning → model+res. Outcome → typo. Lesson → steal the fail-line.
- **Why it works:** A single new instruction is checkable; a novel prompt is not.
- **Conditions / exceptions:** Image APIs on tape.
- **Operate-never payload:** Telegram bot; FAL/Banana pay; publish ads; Skool.
- **Hive run (existing skills only):** `golden-test-loop` · `slice-build`.
- **Source:** `7UNsK9LoORo` @ UNKNOWN

### Operate-never
- Telegram / image-API pay / publish creatives.
- Send / pay / deploy / book / publish.

## L. Role-Specific Applications
**One next:** `coverage-loop` score this packet as fail-then-add-line (no Telegram). Clients parked.
