# Consultant — lokbsA5VXOk
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/lokbsA5VXOk/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/lokbsA5VXOk/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

OpenAI Responses API in n8n. Beats: two agents, same questions (golf flag-stick rule + Bears record). Agent A: Perplexity + Supabase vector, no system prompt beyond helpful assistant — rule 17 (he opens the PDF), Bears 8–3. Agent B: no tools, no system prompt, same answers because the **OpenAI chat model** has Responses API web search + file search on. Needs n8n OpenAI chat-model **v1.3** (~1.118+). OpenRouter does not expose Responses yet. File search = drop a file; OpenAI embeds/indexes/stores. Also names code interpreter + MCP (not shown). Web search: context size low/med/high, geo, allowed domains. File search: $0.10/GB/day even idle vs Gemini (upload-only, more metadata) — he has not A/B retrieval. Default answer does **not cite** page/section unless prompted. Extra options: saved prompt IDs, service tier, safety ID, conversation ID (memory in OpenAI), cache key, metadata. Plus close. No VTT. UNKNOWN. ~2655 words. Pair `QrJhdTbK3TU`.

## B. Atomic Knowledge

### Built-in search is still a vendor store, not magic
- **Claim:** A no-tools agent that answers from the web/PDF is not tool-less. The brain has toggles. Default file-search does not cite the page.
- **Reasoning:** Hiding tools inside the model makes the graph look clean and the audit trail disappear.
- **Mechanism:** If the answer cannot point at the PDF rule / a named source, it fails. Prefer cite-back over a silent store.
- **Evidence:** “this is not magic” / “by default… it's not actually exactly citing”
- **Conditions:** Rule 17 / 8–3 UNVERIFIED. n8n 1.118 / v1.3 on-tape.
- **Exceptions:** He leans Gemini cheaper + more metadata without a retrieval test.
- **Action:** Steal cite-or-fail. Do not install OpenAI Responses. Do not upload PII into a vendor store.
- **Confidence:** high
- **Source:** `lokbsA5VXOk` @ UNKNOWN — “this is not magic”
- **Epistemic:** SOURCE
### OpenRouter ≠ OpenAI node for this feature
- **Claim:** He likes OpenRouter; Responses is OpenAI-node-only today. Switching stack for a toggle is a different product.
- **Reasoning:** Feature-chasing vendors is how a Cursor+Grok shop becomes an OpenAI shop.
- **Mechanism:** Note the constraint. Do not switch.
- **Evidence:** On-tape.
- **Conditions:** His n8n channel habit.
- **Exceptions:** APIs change. Treat as dated.
- **Action:** Stay Cursor+Grok. Learn the cite physics.
- **Confidence:** high
- **Source:** `lokbsA5VXOk` @ UNKNOWN — OpenRouter does not expose Responses
- **Epistemic:** SOURCE


## C. Mental Models

He is teaching a vendor feature as an agent upgrade. He is honest about no-cite default and untested Gemini vs OpenAI retrieval. He still closes Plus. He treats built-in tools as simpler than wiring Perplexity+Supabase.

## D. Procedures

1. If you must retrieve, name the source. 2. Do not call a hidden toggle “no tools.” 3. Price idle vector stores. Avoid: OpenAI file-search for hive PII. Avoid: OpenRouter-switch-then-OpenAI-anyway.

## E. Examples

**Situation:** Same two questions, two graphs. **Action:** A uses tools; B uses Responses toggles. **Outcome:** Same answers; B does not cite the PDF by default. **Lesson:** The store moved into the model. Implicit rule: cite-or-fail.

## F. Decision Rules

If the graph shows no tools, look at the model toggles. If the answer has no page, it is a vibe. If the pitch is “switch to OpenAI,” stack never.

## G. Contrarian

Field default: fewer nodes = smarter agent. He shows the tools just moved. Field default: hide the idle $0.10/GB. He says it.

## H. Assumptions

8–3 / rule 17 / $0.10/GB UNVERIFIED as our FACT. OpenAI/Gemini/n8n-cloud on-tape. Pair `QrJhdTbK3TU` / `irg-2IfAjpo` / `ZwQ8rJhVCr4`.

## I. Questions

Did Gemini actually retrieve better? What happens when the PDF is wrong?

## J. Connections

**SYSTEM SYNTHESIS:** Maps to `info-gain-cite` + `wiki-ingest` + `golden-test-loop`. Same cite physics as File Search / Pinecone Assistant.

## K. Future-Use

Unassigned: idle-store pricing as a discovery question; conversation-ID-as-vendor-memory.

## Steal / Operate-never

### Machine: Cite the page; hidden model-tools are still tools
- **Epistemic:** SOURCE
- **Workflow / loop:** Ask the question → require a named source (PDF rule / URL) → if the graph is empty, inspect model toggles → do not upload hive PII into a vendor index
- **Questions / signals:** Can a toddler point at the rule? Is the store idle-billed? Whose data leaves the box?
- **Qualify / frame / objections:** Qualify: they need retrieval, not a magic agent. Frame: not magic. Objection: “but there are no tools” — look at the brain.
- **Procedure:** Cite-or-fail. No OpenAI Responses install. No PII upload.
- **Example that proves it:** Flag-stick rule 17 + Bears 8–3; Agent B has no tools and still answers; default no cite.
- **Why it works:** Buyers confuse a clean graph with no retrieval. Cite is the toddler stop.
- **Conditions / exceptions:** Vendor APIs dated. Retrieval quality untested on tape.
- **Operate-never payload:** Install OpenAI Responses / n8n-cloud. Upload PII. Quote 8–3 as FACT. Switch stack.
- **Hive run (existing skills only):** `info-gain-cite` · `wiki-ingest` · `golden-test-loop` · `ask-principal`
- **Source:** `lokbsA5VXOk` @ UNKNOWN


### Operate-never
- Install OpenAI Responses / n8n-cloud.
- Upload PII into OpenAI file search.
- Quote 8–3 / rule 17 as FACT.
- Call a no-tools graph magic.
- Unpark a client / new `icp_id` / new `business-lanes.json` row. Learning ≠ hunt.
- Quote tape $ / student counts / job-loss % / hours×rate as FACT.
- Send / pay / deploy / book / publish. Approve draft ≠ send.
- Install on-tape vendors (Claude, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus, n8n-cloud, Skool). Stack stays Cursor + Grok.
- Grok Bot / `sendPrompt`. Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. Overwrite `takes/consultant.md` or another desk's take.

## L. Role-Specific Applications

**Constraint first:** The stated ask is “level up n8n agents.” Felt problem is still a leak, not a Responses toggle. Do not re-scope a parked Path A as OpenAI-in-the-brain.

**Four-blank after constraint:** Toddler stop = the answer points at a page/URL. 8–3 stays out.

**Skeptical-customer:** Two identical answers are smash. No-cite default is the honest demo. Clients parked.
