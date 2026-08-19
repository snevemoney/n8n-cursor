# Librarian — AYsg5gAMWyo
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/AYsg5gAMWyo/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/AYsg5gAMWyo/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** I Built the Ultimate UGC Content System with AI Agents
**Channel:** Nate Herk | AI Automation
**Kind:** video (~6230 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT unless noted)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. Sheet-driven UGC: product photo, ICP, features, setting, **model pick**. Three paths: VO3.1 / Nano Banana+VO3.1 / Sora 2. Free Skool JSON + sheet. Pre-runs: creatine gummies (young adult, car/gym); hair shine spray. Live: **Amazon neck-fan**, middle-aged outdoor/landscaper ICP, garden woman.
2. Sheet: status=`ready`, first matching row only. Switch on model. **Why Nano+VO:** product must look sellable; image-to-person then video. Sora **rejects realistic-looking humans** (even AI faces) — cameos workaround (other tape). VO does not reject.
3. Hard path: image-prompt agent (product unchanged; setting; output **prompt only**) → Kie.ai HTTP (OpenRouter-for-video; newlines stripped; vertical) → wait 5s → poll `state==success` (food-truck #43) → OpenAI **describe image** → video-prompt agent (ICP/features/setting + description + dialogue) → VO3.1-fast HTTP (newlines + quotes + curly-quotes stripped; he says the model id "V3" is actually 3.1) → wait 10s × N (8 polls ~80s) → Sheets update match-on-number, status finished + URL. Template prompts "not optimized."
4. Outputs: Nano+VO neck-fan — "impressive," worn not held. Sora — good selfie, **hallucinated extra object**, 1.5–3 min. VO-only — HDR orange glow; creatine **jar→bag** despite "don't change the product"; hoodie logo "nice touch." Forearm trainer: Nano matches product; VO-only shadows/orange + product drift. First frame of image-to-video **is the still** — auto-post would make every thumb identical ("I wouldn't auto-post").
5. Crown **today:** Nano+VO, then Sora, then VO. Cost via Kie (UNVERIFIED): Nano **$0.02** + VO-fast 8s **$0.30** = **$0.32**; Sora 10s **$0.15** (~2× volume). "Is it 2× conversions?" GPT-5 Mini on all prompt agents. 6–12 month models get better/cheaper. Plus "**over 200**" + live-build course. Skool setup guide.
Gap: full prompts, Kie auth. Timestamp UNKNOWN. VO/Sora/Nano/Kie/n8n/Skool on-tape. Creatine/hair/fan ICPs parked.

## B. Atomic Knowledge

### Sheet + switch + poll; don't auto-post the first-frame lie
- **Claim:** One row, one model, status gate. Hard path is image-consistency: generate a wearable still, describe it, then prompt the video so product+person match. Poll with ticket-id, not hope. Strip characters that break JSON. Sora blocks faces; VO drifts product and oranges. First frame = source still → identical thumbs if you auto-post. Cost is a conversion question, not a crown.
- **Reasoning:** He almost recommends auto-post then refuses because of the first-frame tell. That refusal is the steal.
- **Mechanism:** ready-row → switch → (optional still) → poll → describe → dialogue prompt → poll → write URL → human watch before publish.
- **Evidence:** jar→bag; Sora extra object; 3× wait then 8× wait; $0.32 vs $0.15.
- **Conditions:** Prices/times UNVERIFIED and Kie-dated. Prompts admitted unoptimized.
- **Exceptions:** Hive does not install Kie/n8n-cloud or hunt gummies. Publish HITL.
- **Action:** File status-gate, poll-loop, JSON-sanitize, first-frame-no-autopost, product-drift. Do not crown a model.
- **Confidence:** high as a batch-creative machine
- **Source:** `AYsg5gAMWyo` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared + demonstrated (transcript-implied)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** poll waiting×3 then ×8; jar→bag; Sora hallucination; orange VO
- **Speech ≠ behavior:** "ultimate / king" vs ranked with caveats; "auto post as well" vs "I probably wouldn't"

## C. Mental Models
OpenRouter-for-pixels. Food-truck ticket. First frame is a tell. 2× cost ≠ 2× sales. Plus-200 vs other counts.

## D. Procedures
1. Sheet columns: photo, ICP, features, setting, model, status, id.
2. Pull one `ready` row.
3. If the video model hates faces, generate a still first (or cameo).
4. Sanitize newlines/quotes before HTTP.
5. Poll on task id until success.
6. Watch the file; do not auto-post a still-as-frame1.
Avoid: creatine/fan ICP hunt; auto-post; n8n-cloud; $ as FACT.

## E. Examples
**Jar→bag:** Situation — "do not change the product." Action — VO-only from the jar still. Outcome — bag + hoodie logo. Lesson — the instruction lost; Nano path kept the jar.

**First frame:** Situation — image-to-video. Action — he notices every clip starts on the still. Outcome — no auto-post. Lesson — thumbnail sameness is a brand tell.

## F. Decision Rules
- IF status ≠ ready → do not pull.
- IF the model rejects faces → still-first or cameo, not hope.
- IF frame-1 is the still → do not auto-publish a feed.
- Refuse: Kie/n8n as hive; product ICPs; 2×-quality claim.

## G. Contrarian
Against Sora-from-a-real-looking-face (platform). Against VO-only for product accuracy (his rank).

## H. Assumptions
Caption-only. Complements `Vm8QOo9MiC4` (Sora+n8n). Keep Plus-200 dissent.

## I. Questions
Did curly-quote sanitize ever still fail? Live conversion numbers?

## J. Connections
SYSTEM SYNTHESIS → `7UNsK9LoORo` NanoBanana; publish HITL; `ask-principal`.

## K. Future-Use
Status-gate + poll + first-frame-no-autopost + product-drift as atoms.

## Steal / Operate-never

### Machine: one ready row; poll the ticket; watch before the feed
- **Epistemic:** SOURCE
- **Workflow / loop:** sheet → switch → still-if-needed → sanitize → poll → describe → video → human watch → maybe post
- **Questions / signals:** Face block? Product still itself? Frame-1 tell?
- **Qualify / frame / objections:** UGC mill is not a hive SKU. The steal is the gate and the refuse-autopost.
- **Procedure:** D above.
- **Example that proves it:** jar→bag; first-frame.
- **Why it works:** Consistency is a pipeline, not a prompt adjective.
- **Conditions / exceptions:** Kie $ UNVERIFIED. Hive does not sell gummies.
- **Operate-never payload:** Auto-post; creatine/fan hunt; n8n-cloud; crown VO/Sora as FACT.
- **Hive run:** File no-autopost. Do not stand the mill.
- **Source:** `AYsg5gAMWyo` @ UNKNOWN

### Operate-never
- Auto-post UGC. Kie/n8n-cloud as hive. Product ICPs. Quote $0.32 as unit economics. Merge LESSONS. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
Upgrade old take: add first-frame refuse and product-drift. Clients parked. Publish HITL.
