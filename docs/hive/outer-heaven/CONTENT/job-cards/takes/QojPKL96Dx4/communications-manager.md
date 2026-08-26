# Communications Manager — QojPKL96Dx4
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/QojPKL96Dx4/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/QojPKL96Dx4/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
**Title (PACKET):** The NEW Easiest Way to Build RAG Agents in Minutes (no code)
**Speaker / channel:** Nate Herk | AI Automation
**Kind:** tutorial · 3969 words · captions in `full.txt` only · timestamps **UNKNOWN** (no VTT used).
**Gaps:** Caption ingest; ASR errors possible (Naden/Nitn = n8n). Visual UI not fully narrated. Timestamps UNKNOWN.

Beats, in order:
- Open: RAG agent in <5 minutes. Three queries (Tesla Q2 2025 / Nvidia Q1 FY25 / Nike Q4 FY25 revenue). Pinecone Assistant returns document + page + quote. He Control-Fs the PDFs. Free template + School.
- Build: new Pinecone Assistant (active fee $0.05/hour — UNVERIFIED) → drop three 10-Ks → playground chat works. n8n has no native Assistant node (vector store yes) → HTTP via import-curl from Pinecone ‘chat’ docs. API key shown once. Dynamic body: fromAI search_query so the agent writes the query.
- No system prompt → numbers without sources (Tesla 384k vehicles, −13% YoY — UNVERIFIED, he says he fact-checked). Prompt: always cite document, page, section, exact quote. Agent called the tool twice (2025 and 2024 deliveries) — it decides the query and the count.
- Cite still failed: Nike ‘quote’ did not Control-F. Pinecone `content` was a summary, not the span. Fix: API `include_highlights=true`. Then the quote hits. Playground model ≠ API model unless you set it in the request.
- A/B: same prompt/docs. Assistant: Tesla operating margin 4.1% + cite, 1,277 tokens. Pinecone vector store: wrong, ~30k tokens. Supabase vector: wrong, ~5k. He is not saying Assistant always wins — you pay the hourly. Shout-out Mark Kashef. School + Plus (200 members, three courses) — UNVERIFIED.

## B. Atomic Knowledge

### Page + quote, and the quote must Control-F — a summary is not a cite
- **Claim:** Without include_highlights the agent recited a Nike ‘quote’ that was not in the PDF. The Assistant’s content field was a paraphrase.
- **Reasoning:** RAG trust is a highlight, not a vibe. Five minutes to stand up is not five minutes to send.
- **Mechanism:** Demand document + page + exact span. If Control-F misses, omit. Do not mail ticker $.
- **Evidence:** Nike zero-hits; highlights=true then hits. Tesla page range 3–7 vs page 4.
- **Conditions:** Any retrieval answer that will be written down.
- **Exceptions:** All revenues / 384k / 4.1% / 5 minutes / $0.05/hr UNVERIFIED. Pinecone/n8n as ours is never.
- **Action:** Steal: highlights or omit. Do not send a 5-minute RAG reply.
- **Confidence:** high
- **Source:** `QojPKL96Dx4` @ UNKNOWN
- **Epistemic:** SOURCE

### The agent writes the search query — you write the cite rule
- **Claim:** fromAI filled search_query; it searched twice for YoY. Until the system prompt asked for sources, it kept the pages to itself.
- **Reasoning:** Tool output can already have pages; the writer still has to be told to show them.
- **Mechanism:** Put the cite rule in the draft instructions. Classifier may search; this desk does not auto-reply.
- **Evidence:** Two tool calls for 2025 vs 2024; prompt added names/pages.
- **Conditions:** HTTP-tool agents.
- **Exceptions:** Do not stand up a Pinecone mailer.
- **Action:** Cite rule in the card. No RAG auto-reply.
- **Confidence:** high
- **Source:** `QojPKL96Dx4` @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
- Assistant hides chunking; you still owe a highlight. **SOURCE**
- Playground model does not persist to the API. **SOURCE**
- Vector DIY can be wrong and more tokens on the same PDFs — his one run. **SOURCE**

## D. Procedures
- Drop files → chat → HTTP curl → fromAI query → include_highlights → cite prompt → Control-F. **SOURCE**
- This desk: quote+page or omit. No Pinecone. No send. **SYSTEM SYNTHESIS**

## E. Examples
- **Situation:** Nike Q4 revenue, ‘exact quote.’ → **Action:** First pass paraphrase; add include_highlights; Control-F hits. → **Reasoning:** Content ≠ span. → **Outcome:** Real quote. → **Lesson:** 5 minutes is not a send condition. Implicit rule: ticker $ stay UNVERIFIED.

## F. Decision Rules
- If Control-F fails → do not write the number.
- If the tool returns a summary → do not call it a quote.
- Refuse: Tesla/Nvidia/Nike $ as FACT. 5-minute reply-bot. School as our SKU.
- Optimize: cite-check before the sentence exists.

## G. Contrarian
- Field ships chunk RAG and hopes. He shows the Assistant still lies without highlights. **SOURCE**

## H. Assumptions
- 4.1% / token ratios are one demo. Falsifier: a highlight that still paraphrases.

## I. Questions
- Which draft numbers cannot Control-F today?

## J. Connections
- **SYSTEM SYNTHESIS:** `kOKavHnlPik` (chunk trap). `info-gain-cite`. `send-removed`.

## K. Future-Use
- Cite-or-omit as the card. Easy-RAG SKU stays his close.

## Steal / Operate-never

### Machine: Highlights or omit; 5 minutes is not a send; never mail ticker $
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** Need a figure → retrieve → Control-F → if miss, omit → Evens → stop.
- **Questions / signals:** Is this a summary pretending to be a quote?
- **Qualify / frame / objections:** Qualify: playground vs a letter. Frame: cite-check. Objection: ‘it took 5 minutes’ → still HITL.
- **Procedure:** 1) No Pinecone mailer. 2) No ticker $. 3) No send.
- **Example that proves it:** Nike quote with zero PDF hits until highlights=true.
- **Why it works:** Trust is a span, not a summary.
- **Conditions / exceptions:** RAG tapes. Exception: we do not operate n8n/Pinecone.
- **Operate-never payload:** Quote 4.1% / 384k as FACT. RAG auto-reply.
- **Hive run (existing skills only):** `info-gain-cite`. `send-removed`.
- **Source:** `QojPKL96Dx4` @ UNKNOWN


### Operate-never (this desk will not operate)
- RAG auto-reply. Quote Tesla/Nvidia/Nike $ or 5 minutes as FACT. Install Pinecone as ours.
- Gmail **send**. Connector write. Scheduled send. Auto-send. Ack-reply. Mass-DM. Postcard. Waitlist blast.
- Quote tape $ / student counts / job-loss % / ROI hours as FACT in a letter.
- New hunt ICP. Unpark Normand. Clients parked — no Path A this week.
- Install on-tape vendors (Vapi, Claude, Codex, ChatGPT, Gemini, Coda, Abacus, Skool, n8n-cloud). Stack stays Cursor + Grok. On-tape names stay on-tape.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. New `icp_id`.

## L. Role-Specific Applications
- I do not write a 5-minute RAG mailer. Quote+page or omit. I do not send. Clients parked.
