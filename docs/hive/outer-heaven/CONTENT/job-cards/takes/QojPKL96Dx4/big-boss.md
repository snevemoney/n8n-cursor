# Big Boss — QojPKL96Dx4
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/QojPKL96Dx4/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/QojPKL96Dx4/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

PACKET: 16:09, 3969 words, captions `en-orig`. Timestamp UNKNOWN on `full.txt`. Visual-only: Pinecone Assistant UI, three PDFs, n8n HTTP node, token counts, lighting apology mid-edit.

Beats, in order:

1. Hook: RAG agent in **<5 minutes**. Three queries (Tesla Q2 2025 rev, Nvidia Q1 FY25, Nike Q4 FY25). Tool hits three times. Answers include **document + page + quote**. He Ctrl-F checks each quote in the PDF. Tesla page story is a little loose (quote on p.4; assistant said p.3–7).
2. Usual RAG cite needs a metadata pipeline. Here: drop file, chat.
3. CTA: free template in Skool. Follow along or plug-and-play.
4. Product: **Pinecone Assistant** (not only the vector store). Create “demo.” Pricing callout: active assistants **$0.05/hour**. Link to pricing. **$ UNVERIFIED.**
5. Playground: drag Tesla / Nike / Nvidia earnings PDFs. Same three questions work; hover cites in playground.
6. API: upload or chat. Today = chat only (files already in UI). n8n: AI agent + **HTTP** (no native Assistant node; there is a Vector Store node). Copy curl from Pinecone “chat with your assistant,” import, add API key (create key; shown once). Pro tip: reuse native Pinecone credential via predefined auth. Description: “talk to your knowledge base.” Body: replace Pride and Prejudice sample with `{{ $fromAI('search query') }}` so the agent writes the query.
7. Brain: OpenRouter, GPT-4.1 Mini. First Tesla deliveries question: **384k vehicles, −13% YoY** — he says he fact-checked. **No system prompt** → no sources in the answer even though Pinecone returned pages/PDF names.
8. System prompt: always cite document, page, section, **exact quote**. Re-run: sources appear; **quote still wrong** (Nike) because default content is a **summary**, not the span. Ctrl-F of that “quote” = 0 hits.
9. Fix: API docs → `include highlights` = true. Re-run Nike: Ctrl-F hits. Highlights live in a new content section; the assistant “content” is still a summary.
10. Same docs: playground model ≠ API model unless you set `model` in the HTTP body. Temperature etc. also in the body. Aside: watch his API video / Plus.
11. Compare three agents, same prompt, same docs: **Assistant** Tesla operating margin **4.1%** + cite + quote, **1,277 tokens**. **Pinecone vector store**: miss, ~**30k tokens**. **Supabase vector store**: miss, **~5k tokens** (“3×” vs assistant). He will not say Assistant is always best — you pay **$0.05/h** while active.
12. Shout: Mark Kashef showed him Assistants. CTA: free Skool template; Plus (200+ members, three courses). **UNVERIFIED.**

Off-topic / not skipped: Pride and Prejudice default query; nighttime lighting apology; “horrible math” on 15×; API-key-shown-once warning.

## B. Atomic Knowledge

### Cite + Ctrl-F is the product
- **Claim:** Trust comes from document + page + a quote you can find in the PDF. The hook is three Ctrl-Fs, not “the model said 4.1%.”
- **Reasoning:** RAG without a checkable span is a vibe.
- **Mechanism:** Assistant returns pointers; human (or a desk) Ctrl-Fs.
- **Evidence:** Tesla/Nvidia/Nike hook; later Nike fail when the “quote” was a summary.
- **Conditions:** You have the source files. Pages can be a range (Tesla 3–7 vs quote on 4).
- **Exceptions:** If highlights are off, the model will invent a quotable sentence.
- **Action:** Definition of done = three cites, three Ctrl-Fs. Not “assistant answered.”
- **Confidence:** high
- **Source:** `QojPKL96Dx4` @ UNKNOWN — “that’s how we can trust the answers are correct”
- **Epistemic:** SOURCE

### You must ask for the cite — the tool already had it
- **Claim:** Without a system prompt, the n8n agent answered Tesla deliveries correctly and **omitted** sources. Pinecone’s payload already had PDF name + pages. The agent “just didn’t know to actually tell us.”
- **Reasoning:** Behavior is a prompt job. Retrieval ≠ report.
- **Mechanism:** System message: always cite doc / page / section / exact quote.
- **Evidence:** Same question, before/after prompt.
- **Conditions:** HTTP tool returning rich citations.
- **Exceptions:** Playground hover-cites without a prompt — different UI.
- **Action:** Cite language is part of done, not a polish pass.
- **Confidence:** high
- **Source:** `QojPKL96Dx4` @ UNKNOWN — “there’s no system prompt… which is why we’re not getting any source information”
- **Epistemic:** SOURCE

### Default “quote” can be a summary — flip include_highlights
- **Claim:** Assistant `content` is a short answer/summary. Exact span needs `include highlights = true`. Nike “quote” Ctrl-F’d to **zero** until that flag.
- **Reasoning:** The lie looks like a cite. The flag is the difference between theater and a span.
- **Mechanism:** Read API docs; add the lever; re-run the same question.
- **Evidence:** Before/after Nike Ctrl-F.
- **Conditions:** Chat-with-assistant API. Docs must mention the flag (he shows them).
- **Exceptions:** A future default-on would change the trap. Not on tape.
- **Action:** Watchdog: if Ctrl-F misses, assume summary-mode before assuming the PDF is wrong.
- **Confidence:** high
- **Source:** `QojPKL96Dx4` @ UNKNOWN — “this right here is not an exact textbased quote”
- **Epistemic:** SOURCE

### Agent writes the search query (and how many)
- **Claim:** `fromAI('search query')` lets the agent choose the string and the **count**. Tesla deliveries vs 2024 → **two** Pinecone calls (Q2 2025 and Q2 2024).
- **Reasoning:** One user question can be two retrievals. Hard-coded Pride and Prejudice is the failure mode.
- **Mechanism:** Dynamic HTTP body.
- **Evidence:** He clicks run 1/2 and run 2/2 in the edit.
- **Conditions:** Agent has a tool description that says “knowledge base.”
- **Exceptions:** Bad queries still possible. Not stress-tested.
- **Action:** Inspect the actual search strings. Don’t trust “it used the tool.”
- **Confidence:** high
- **Source:** `QojPKL96Dx4` @ UNKNOWN — “the agent decides what do I want this search query to be and how many times”
- **Epistemic:** SOURCE

### Easy RAG is a vendor disk + a clock
- **Claim:** Assistant handles index / embed / chunk so you can drop a file. Active assistants cost **$0.05/hour**. He likes it to **spin up and play**, especially beginners. Not “always best.”
- **Reasoning:** You trade pipeline work and (in his compare) tokens for a running meter and their storage.
- **Mechanism:** Files live on Pinecone; API chat.
- **Evidence:** Pricing tooltip; three-way compare.
- **Conditions:** Non-PII playground docs (public earnings).
- **Exceptions:** PII / our filings as SSOT on their disk = operate-never.
- **Action:** Do not leave an assistant running. Do not upload hive secrets.
- **Confidence:** high as his pitch; $ UNVERIFIED
- **Source:** `QojPKL96Dx4` @ UNKNOWN — “active assistants have a fee of 5 cents per hour”
- **Epistemic:** SOURCE ($ UNVERIFIED)

### Same docs, three stores: assistant hit, vectors missed, tokens exploded
- **Claim:** Tesla operating margin Q2 2025 = **4.1%**. Assistant: correct + cite + quote, **1,277** tokens. Pinecone vector: wrong, ~**30k**. Supabase vector: wrong, ~**5k** (~3× assistant).
- **Reasoning:** DIY chunk/metadata is easy to get wrong; the managed path won **this** question.
- **Mechanism:** Same prompt, same PDFs, three backends.
- **Evidence:** One question each. He admits the 15× math is sloppy.
- **Conditions:** His chunk pipeline (unspecified). One financial figure.
- **Exceptions:** A better DIY pipeline might tie. He says he won’t dive deep.
- **Action:** Steal the compare shape. Do not conclude “Assistant always wins.” He says that.
- **Confidence:** medium (N=1 question); tokens **UNVERIFIED**
- **Source:** `QojPKL96Dx4` @ UNKNOWN — “we got an incorrect answer. And it cost us like 15 times more.”
- **Epistemic:** SOURCE

### Playground settings do not persist to the API
- **Claim:** Changing the chat model in the Assistant UI does not change the app. You must set `model` (and other levers) in the HTTP body.
- **Reasoning:** Two surfaces, two configs. Hover text says so.
- **Mechanism:** API docs + n8n body field.
- **Evidence:** He hovers, then points at the JSON.
- **Conditions:** Anyone copying the playground.
- **Exceptions:** A later native node might hide this. Not on tape (no native Assistant node).
- **Action:** If we ever call a vendor API, the body is the source of truth — not the demo UI.
- **Confidence:** high
- **Source:** `QojPKL96Dx4` @ UNKNOWN — “you have to set your model in your API calls”
- **Epistemic:** SOURCE

### Earnings numbers on tape are UNVERIFIED
- **Claim:** Tesla 384k deliveries, −13% YoY; operating margin 4.1%; the three revenue questions in the hook.
- **Reasoning:** He says he fact-checked some. We did not open the PDFs.
- **Mechanism:** Assistant + his Ctrl-F.
- **Evidence:** Spoken.
- **Conditions:** Those specific PDFs, those quarters.
- **Exceptions:** Tesla page-range vs page-4 quote already shows slack in the pointer.
- **Action:** Do not reuse as FACT. `info-gain-cite` if Evens ever wants a figure.
- **Confidence:** low as fact
- **Source:** `QojPKL96Dx4` @ UNKNOWN — “Tesla delivered a total of 384,000 vehicles”
- **Epistemic:** SOURCE (UNVERIFIED)

## C. Mental Models

- **Trust is a Ctrl-F.** **SOURCE**
- **Retrieval can be right while the report is mute or lying.** Prompt + highlights. **SOURCE**
- **Easy path = their disk + their clock.** **SOURCE**
- **One question is not a RAG platform bake-off.** He still shows it. **SOURCE**
- **Read the API docs when the quote fails.** Tool ≠ skill (doctrine 2). **SOURCE**
- **Mark Kashef / Skool are the distribution, not the method.** **INFERENCE**
- **$0.05/h is a smell if you forget to turn it off.** **INFERENCE**

## D. Procedures

1. **Name the files** you will trust (ours, not random PII).
2. **Ask the question** the PDFs can answer.
3. **Require** doc + page + exact span in the system prompt.
4. **Turn on highlights** (or the equivalent span flag).
5. **Read the search strings** the agent actually sent (count + text).
6. **Ctrl-F the span.** Zero hits → assume summary-mode, not “PDF wrong.”
7. **Optional compare** vs raw vector on the **same** question; record tokens + hit/miss.
8. **Do not leave** a metered assistant on. Do not upload secrets.
9. **API body** is the config (model, flags). Ignore playground persistence.

**Qualify / frame:** Easy-RAG shopping tape. Public earnings PDFs. Not a client SKU.
**Objections:** “5 minutes, use this” — clock + their disk; DIY lost on one question, not forever. “It cited” — Nike summary-quote failed Ctrl-F.
**Avoid:** Pinecone Assistant as hive RAG; quote $0.05/h / 5 min / 4.1% as FACT; Skool template.
**When to change:** Evens wants cite-and-Ctrl-F on **our** files in Cursor/Grok. Still no vendor disk as SSOT.

## E. Examples

**Situation:** Three earnings questions, no custom metadata pipeline.  
**Action:** Drop PDFs in Assistant; agent returns doc/page/quote; he Ctrl-Fs.  
**Reasoning:** Span you can find is the trust.  
**Outcome:** Hook looks like <5 min RAG. Tesla page is a range, not a pin.  
**Lesson:** Cite + Ctrl-F is done. Implicit rule: a page range is weaker than a pin.

**Situation:** Correct Tesla deliveries, no system prompt.  
**Action:** Answer without sources; payload had them. Add cite prompt.  
**Reasoning:** Model won’t report what you didn’t ask.  
**Outcome:** Sources appear; Nike “quote” still fails Ctrl-F.  
**Lesson:** Prompt ≠ highlights. Implicit rule: two switches, both required.

**Situation:** Same 4.1% question, three backends.  
**Action:** Assistant hits (1277 tokens); two vector paths miss (30k / 5k).  
**Reasoning:** Managed chunking won this figure.  
**Outcome:** He still will not say “always best” because of the hourly clock.  
**Lesson:** Compare is a table, not a conversion. Implicit rule: keep the meter in the same row as the win.

## F. Decision Rules

- If there is no Ctrl-F-able span → not done.
- If highlights are off → do not call it a quote.
- If the agent used the tool → read the queries.
- If files are PII or hive SSOT → do not put them on a vendor assistant.
- If the clock is $0.05/h → assume it will keep billing (doctrine 7 shape).
- If playground ≠ API → believe the body.
- Optimize: cite + span + human check on **our** files.
- Refuse: Pinecone as RAG plane; Skool JSON; earnings $ as FACT.

## G. Contrarian

- Against “RAG is always a long pipeline”: he shows drop-file for a demo.
- Against “Assistant is always best”: he says the clock; DIY might be right later.
- Against “the model cited so it’s true”: Nike summary-quote.
- Field assumes native vector node is enough. He used HTTP + docs.

## H. Assumptions

**His:** Three public PDFs are a fair RAG demo; 4.1% is correct; Kashef’s find generalizes; $0.05/h is “not too bad”; Skool is the download path.

**Ours:** Pinecone / OpenRouter / GPT / Supabase / n8n / Skool on tape. All $ / tokens / 5 min / 4.1% / 384k = **UNVERIFIED**. Domain: n8n tutorial, Sep 2025.

**Falsifiers:** Highlights default on and the trap dies. A tuned DIY pipeline beats Assistant on the same Q. Clock forgotten for a week.

**Disagreement (keep labeled):** Hive will not operate Pinecone Assistant. The **cite+Ctrl-F**, **highlights flag**, and **inspect the query** machines are still stolen. **SYSTEM SYNTHESIS**

## I. Questions

- What was his DIY chunk/metadata setup (the one that missed 4.1%)?
- Tesla page 3–7 vs quote on 4 — acceptable slack?
- Idle vs active: when does the $0.05/h start/stop?
- Upload-via-API path — not in this video.

## J. Connections

- **SYSTEM SYNTHESIS** → `QCjMBOEhpLE` (filter/cite vs dump; close SoT).
- **SYSTEM SYNTHESIS** → `info-gain-cite` · `golden-test-loop` (Ctrl-F) · `wiki-ingest` · `input-required-gate`.
- **SYSTEM SYNTHESIS** → doctrine 2 (read the docs when it breaks) and 8 (one known-good Q before platform).
- Do not hunt CFOs because Tesla margin appeared.

## K. Future-Use

- Highlights-flag checklist for Watchdog on any “quote” (unassigned).
- Query-string inspection as Researcher packet habit (unassigned).
- Hourly-meter smell for Money Desk observe-only (unassigned).
- Playground≠API as Forge config rule (unassigned).

## Steal / Operate-never

### Machine: Drop files → require cite → highlights on → Ctrl-F → inspect queries → kill the clock
- **Epistemic:** SOURCE (demo + Nike miss + three-way compare) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** trigger (need an answer from files) → files we own → require doc/page/**span** in the prompt → turn on the span flag → let the agent write queries → read those queries → Ctrl-F every span → if miss, assume summary-mode → optional same-Q compare vs raw vector (tokens + hit) → **turn the meter off** → do not make the vendor disk SSOT.
- **Questions / signals:** “Can I Ctrl-F this?” “Were highlights on?” “What did it actually search?” “Is this PII?” “Is the assistant still active?”
- **Qualify / frame / objections:** Easy-RAG tape. Objection: 5 minutes so we should buy it — clock + their disk; DIY lost N=1. Objection: it cited — Nike quote was a summary.
- **Procedure:** D steps 1–9. Checkable stops: (1) three Ctrl-Fs or the run fails, (2) highlights on, (3) queries read, (4) no hive files on their disk, (5) no $0.05/h left running.
- **Example that proves it:** Nike Q4 revenue “quote” → 0 Ctrl-F hits → add `include highlights` → span appears in the PDF. Lesson: cite theater vs span.
- **Why it works:** Trust is a findable span. Retrieval can be mute (no prompt) or lying (summary-as-quote). Conditions: public PDFs, HTTP API, his chunkers for the miss. Exceptions: page ranges; N=1 compare; $ UNVERIFIED.
- **Conditions / exceptions:** Cursor + Grok only. Clients parked. Pinecone/OpenRouter/Supabase/n8n/Skool on tape.
- **Operate-never payload:** Pinecone Assistant as RAG plane; upload filings/PII; leave $0.05/h running; quote 5 min / 4.1% / 1277 tokens as FACT; Skool template.
- **Hive run (existing skills only):** `info-gain-cite` · `golden-test-loop` · `wiki-ingest` · `input-required-gate` · `ask-principal` · `slice-build`.
- **Source:** `QojPKL96Dx4` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Pinecone Assistant / raw Pinecone / Supabase / OpenRouter / n8n as hive RAG
- Leave an assistant running / upload hive SSOT
- Quote $0.05/h / 5 min / 4.1% / 384k / 1277 / 30k / 5k as FACT
- Nate Skool / Mark Kashef stack as hive SKU
- New `icp_id` / unpark Normand
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md` (Researcher owns that)

## L. Role-Specific Applications

I manage; I do not pay a nickel an hour because drop-in was easy.

- **Done** on a RAG slice: findable spans on **our** files + queries read + meter off. A playground chat is not done.
- **Delegate without being asked:** Researcher cites; Watchdog Ctrl-Fs; Forge rejects summary-quotes; Money Desk parks $0.05/h as UNVERIFIED and as a smell.
- **Skeptical review:** Easy path is their disk. Nike “quote” failed. Vector miss is N=1. I will not approve Pinecone Assistant as our plane.
- **One system this take:** three quotes, three Ctrl-Fs, on our files. Not a Pinecone Assistant.
- Live hunt stays parked.
