# Money Desk — QojPKL96Dx4
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/QojPKL96Dx4/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/QojPKL96Dx4/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
~3969 words. Nate: Pinecone Assistant as the 5-minute RAG — drop PDFs, chat, citations — vs rolling your own vector pipeline. Caption-only; timestamp UNKNOWN. Beats in order: cold open — one chat, three queries (Tesla Q2 2025 total revenue; Nvidia Q1 FY25; Nike Q4 FY25). Agent hits Pinecone tool 3×; answers + document + pages + exact quote. He Ctrl+F each quote: Tesla quote on p4, agent said p3–7 of that doc; Nvidia p1 matches; Nike p1 matches. Usual RAG needs a metadata-tagging pipeline; here ‘drop a file and chat.’ Free School template. Pinecone → Assistant (not only vector store); $0.05/hour active-assistant fee UNVERIFIED; create ‘demo’; drag Tesla/Nike/Nvidia earnings PDFs; playground chat returns answers + hover citations. Power is the API: upload or chat — today chat only (files already in UI). n8n: no native Assistant tool (there is Vector Store) → HTTP Request. Connect → copy chat curl minus key rows → Import curl. API key: create, copy once, gone after close. Pro tip: if a native Pinecone cred exists, Authentication → predefined → Pinecone (or header). Tool name Pinecone; description ‘talk to your knowledge base.’ Body still has Pride and Prejudice inciting-incident — switch content to expression `{{ $fromAI('search_query') }}` so the agent writes the query. Brain: OpenRouter GPT-4.1 Mini. Test without system prompt: Tesla vehicles Q2 2025 vs Q4 2024 — 384k deliveries, model split, 13% YoY down; he fact-checks correct; no sources because no prompt. Night-edit insert: agent called the tool twice — ‘Tesla vehicle deliveries Q2 2025’ then ‘…2024’; agent chooses query and count. System prompt: earnings specialist; always cite document, page, section, exact quote — because RAG trust = provenance. Re-ask: same numbers + Tesla Q2 + pages; still no exact quote. Why: Assistant `content` is a short summary, not the PDF sentence. Nike Q4 vs last year: ‘exact quote’ fails Ctrl+F (0 hits) — it was the summary. Fix: API docs → include citation highlights → `include_highlights=true`. Re-run: quote now Ctrl+F hits; new `content` block is the found span. Playground model change does not persist — set `model` in the HTTP body (also temperature). Why Assistant vs Pinecone vector / Supabase vector (same prompt, same docs): Tesla operating margin Q2 2025 = 4.1%. Assistant: 4.1% + doc + pages + quote, 1,277 tokens. Pinecone vector: doesn’t know, ~30k tokens (~15×). Supabase vector: misses 4.1%, ~5k tokens (~3×). Assistant backend does index/embed/chunk. Not always best — $0.05/hour meter. Beginner spin-up / experiment. Credit: Mark Kashef. Close: School template; Plus 200, Agent Zero, 10h/10s, One-person agency annual — UNVERIFIED.

## B. Atomic Knowledge
### Cite-the-span-not-the-summary
- **Claim:** Assistant `content` is a short answer. The quote you can Ctrl+F only appears when `include_highlights=true`. A system prompt that says ‘exact quote’ will invent from the summary if the highlight lever is off.
- **Reasoning:** Nike ‘quote’ was 0 hits until highlights. Tesla pages were a range (p3–7) around a p4 sentence — still a pointer, not a lie, but not a pin.
- **Mechanism:** Read the API. Turn highlights on. Prompt the agent to print document/page/quote. Verify with Ctrl+F before you trust.
- **Evidence:** On-tape Tesla 384k / 13% YoY; 4.1% margin; 1,277 vs ~30k vs ~5k tokens.
- **Conditions:** You are shipping a RAG answer to a human.
- **Exceptions:** Pinecone / n8n / OpenRouter are not ours. Earnings $ are UNVERIFIED as our books. Auto-send the answer is operate-never.
- **Action:** Steal highlights-plus-Ctrl+F. Do not install Pinecone Assistant as ours.
- **Confidence:** high as a procedure
- **Source:** QojPKL96Dx4 @ UNKNOWN
- **Epistemic:** SOURCE
### Managed-RAG-vs-you-own-the-chunks
- **Claim:** Assistant hides index/embed/chunk. DIY vector (Pinecone store or Supabase) missed 4.1% and burned 3–15× tokens on the same prompt/docs. Meter is $0.05/hour active.
- **Reasoning:** Beginner spin-up is the pitch. He will not say Assistant always wins — the hour-fee is the exception.
- **Mechanism:** If you need a 5-minute cite-loop, managed. If you need control of chunk/metadata, DIY and budget tokens.
- **Evidence:** On-tape 1,277 vs ~30k vs ~5k; $0.05/hr. UNVERIFIED as our bench.
- **Conditions:** You are choosing a vector product.
- **Exceptions:** Does not authorize Pinecone/n8n/Supabase as ours. 15× is his napkin (he admits bad math).
- **Action:** Steal measure-tokens-and-the-hit. HOLD the vendor.
- **Confidence:** high as a comparison; $ UNVERIFIED
- **Source:** QojPKL96Dx4 @ UNKNOWN
- **Epistemic:** SOURCE
### Agent-writes-the-query-n-times
- **Claim:** `$fromAI('search_query')` lets the agent pick the string and the hop count. Tesla YoY became two searches (2025 and 2024). Playground model ≠ API model — set it in the body.
- **Reasoning:** Without a system prompt the numbers can be right and the provenance missing. The tool already had pages; the agent wasn’t told to speak them.
- **Mechanism:** Dynamic query. Prompt for provenance. Align playground and API model.
- **Evidence:** On-tape Pride-and-Prejudice leftover in the curl; two-run Tesla deliveries.
- **Conditions:** HTTP-wrapper around a managed assistant.
- **Exceptions:** Import-curl + live API key in the node is a secret-hygiene footgun (see `oWdJMJp2HgM` sanitize).
- **Action:** Steal agent-picks-query. Do not bake the key. HITL any send.
- **Confidence:** high
- **Source:** QojPKL96Dx4 @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
Belief: managed Assistant is the fastest path to cited RAG for beginners. Priority: highlights + prompt + Ctrl+F; token card vs DIY. Experience: Kashef tip; night-edit for the two-query reveal. Contrarian: native Pinecone vector lost on the same docs. Uncertainty: $0.05/hr and 15× napkin.

## D. Procedures
His order: create Assistant → drop PDFs → playground sanity → copy chat curl → n8n HTTP → key (or predefined cred) → `$fromAI('search_query')` → model in body → system prompt cite-or-it-didn’t-happen → `include_highlights=true` → Ctrl+F the span → compare token card to DIY if you care. Our order: do not stand up Pinecone. Steal cite-the-span and measure-the-miss. Caption-only: clicks UNKNOWN.

## E. Examples
**Situation:** Nike Q4 ‘exact quote.’ **Action:** Ctrl+F. **Reasoning:** prompt asked for a quote. **Outcome:** 0 hits — it was the summary. **Lesson:** Highlights lever, not a nicer prompt.

**Situation:** Tesla 4.1% margin, three stores. **Action:** same prompt. **Reasoning:** who owns chunking. **Outcome:** Assistant hit + 1,277 tok; vector miss + ~30k; Supabase miss + ~5k. **Lesson:** Managed can be cheaper and righter on a toy corpus.

**Situation:** No system prompt. **Action:** Tesla deliveries. **Reasoning:** tool already returned pages. **Outcome:** right numbers, no citation spoken. **Lesson:** Provenance is a prompt job on top of the tool.

## F. Decision Rules
IF you need a quote a human can find → highlights on + Ctrl+F. IF playground model changed → set API model. IF DIY vector misses and burns tokens → don’t assume more pipeline is better. IF $0.05/hr / 384k / 4.1% / 200 members → UNVERIFIED. Refuse: Pinecone / n8n / School / Plus as ours; auto-send the RAG answer.

## G. Contrarian
Rejects ‘RAG is always a chunk pipeline first.’ Rejects trusting a spoken quote without Ctrl+F. Rejects playground settings as the production settings.

## H. Assumptions
Three earnings PDFs are a toy. He fact-checks himself. 15× is admitted bad math. $0.05/hr may have changed. Survivorship: Assistant won on this corpus. Falsifier: highlights still paraphrase. Speech≠behavior: free template then Plus.

## I. Questions
What’s Pinecone Assistant pricing now? Any receipt we can open that managed RAG cut a wrong-answer cost? Did the Tesla page-range (3–7 vs 4) ever bite a user?

## J. Connections
SYSTEM SYNTHESIS: cite-then-verify = `golden-test-loop` / Ctrl+F. Agent-writes-query = filter-then-calc `QCjMBOEhpLE`. Key-in-node = sanitize `oWdJMJp2HgM`. Token card = `2OD14-0cot4` model-per-step. Pinecone/n8n/Plus operate-never.

## K. Future-Use
Unassigned: playground-≠-API as a settings-drift footgun. Hourly-meter vs token-meter as a COGS observe.

## Steal / Operate-never

### Machine: Highlights-plus-CtrlF-before-you-trust-the-RAG
- **Epistemic:** SOURCE
- **Workflow / loop:** trigger: a number from a PDF → action: managed or DIY search → require document/page/span → Ctrl+F the span → checkable stop: the quote exists on the page, not only in the summary
- **Questions / signals:** Is highlights on? Did the agent pick the query N times? What’s the token card vs DIY?
- **Qualify / frame / objections:** Frame: managed chunking vs you-own-the-chunks. Objection: ‘the prompt asked for a quote’ — Nike still failed until the API lever.
- **Procedure:** Provenance prompt. Highlights. Verify. Do not stand up Pinecone. HITL send. Tape $ UNVERIFIED.
- **Example that proves it:** Nike 0-hit quote → highlights hit; 4.1% 1277 vs ~30k miss. UNVERIFIED.
- **Why it works:** Summaries are fluent and unfindable. Trust is a span a human can open.
- **Conditions / exceptions:** Works as a verify loop. Exception: Pinecone / n8n / School / Plus / $0.05/hr / earnings $ as FACT operate-never.
- **Operate-never payload:** Pinecone Assistant as ours · n8n template · School/Plus · auto-send RAG · 4.1% as analog
- **Hive run (existing skills only):** `golden-test-loop` · `playbook-before-send` · `ask-principal` · `pricing-margin-roi-guardrails`
- **Source:** QojPKL96Dx4 @ UNKNOWN


### Operate-never (this desk will not operate)
- Quote $0.05/hr / 1,277 / 30k / 384k / 4.1% / 200 members as FACT or as our analog.
- Stand up Pinecone / n8n. School/Plus as a SKU. Auto-send the cited answer.

- Move money, approve a charge, refund, or fee. Live Stripe. Auto-send / auto-pay / auto-book / auto-deploy / auto-publish.
- Quote any tape $ / student count / job-loss % / prize / 10x as FACT or as our price analog.
- Nate Skool / Plus / AIS Plus / Hostinger NATEHERK / Uppit / Glaido / sold templates as a SKU. Do not map through `usecase-to-sku`. Do not join / install / import.
- Install Claude Code / Codex / Claude / ChatGPT / Gemini / Coda / Vapi / ElevenLabs / n8n-cloud / Trigger.dev / Hermes / Base44 / Sora / NanoBanana / Poppy / Lovable as ours. Cursor + Grok only. Vendor on tape is a mention, not a Bot dispatch.
- New hunt ICP. Unpark a client. Live hunt stays `local-pro` / Normand. Clients parked. No new `icp_id`.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Overwrite `takes/money-desk.md`.

## L. Role-Specific Applications
HOLD Pinecone Assistant and the n8n template. Steal highlights-plus-Ctrl+F and measure-managed-vs-DIY. Send stays HITL. Early rung $500–1K/mo CAD.

**Lens only (after A–K + Steal).** This desk votes PASS/HOLD on margin. It does not move money.

- `pricing-margin-roi-guardrails`: tape $ stays **UNVERIFIED**. Our early rung stays **$500–1K/mo CAD** after a 30–60d win. Delivery ≤40% of fee. Vendor / educator $ does not move Normand Path A.
- `outcome-offer-funnel` + `checkout-proof`: count checkout + warm conversions we can open. Quarantine YouTube receipts.
- `paid-slice-funnel`: thin V1; Stripe HITL; preview ≠ domain.
- `ask-principal` + `input-required-gate`: confirm ≠ execute. Pay / refund / fee stay HITL.
- `website-offer-funnel`: Path A/B/C spine still exists; this tape does not open a client unless Evens names one.
- Proposed, not written: `unit-econ-card` (price, COGS, contribution, aha-gate — tape $ never fills the line) · `token-receipt` (session cost versus artifact; leftover quota is not a KPI).

**Business parked:** no new `icp_id`. No `business-lanes.json` row. Hunt stays `local-pro` / Normand.
