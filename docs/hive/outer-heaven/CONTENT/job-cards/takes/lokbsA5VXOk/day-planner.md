# Day Planner — lokbsA5VXOk
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/lokbsA5VXOk/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/lokbsA5VXOk/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate: n8n OpenAI **Responses API** — built-in web search + file search. Beats: two-tool agent (Perplexity + Supabase) vs **no-tool** agent that still answers golf Rule 17 + Bears 8–3 because the **chat-model brain** has search toggles; n8n ≥1.118, OpenAI chat node **v1.3**; Open Router **cannot** do Responses yet (he prefers it); platform.openai.com key + **billing**; toggle Use Responses API (web / file / code interpreter; MCP not in UI); web: context low/med/high, geo, **allowed domains**; fail demo: no search → cutoff June 2024; on → Dodgers 2025 WS (UNVERIFIED); domain `upat.ai` + GPT-4.1 **filter unsupported** → switch **5 mini** → correctly “can’t find”; file search: Storage → vector store ID as array; **filter required** or error (docs screenshot); max results; **$0.10/GB/day even idle** vs Gemini upload-only (he leans Gemini for metadata, **hasn’t A/B’d retrieval**); golf “ball at rest” — no default citations; extra options only with Responses: saved prompt ID, service tier, safety ID, **conversation ID = memory in OpenAI not n8n**, prompt cache, metadata, top logprobs (he doesn’t get); Plus CTA. Caption-only. Timestamp UNKNOWN. Bears/WS scores UNVERIFIED.

## B. Atomic Knowledge
### Built-in search ≠ agent tools; idle vectors still bill; allowlist is a fence
- **Claim:** Same answers can come from model-native tools with an empty system prompt; a domain allowlist is a real fence (and older models reject it); OpenAI file stores bill **while unused**.
- **Reasoning:** Fewer nodes look like magic; the bill and the citation gap are the cost.
- **Mechanism:** Responses toggle → web and/or file → optional allowlist/filter.
- **Evidence:** “inside the AI agent itself, we have no system prompts… OpenAI is going to charge you 10 cents per gigabyte per day.”
- **Conditions:** n8n OpenAI chat v1.3 + billed key.
- **Exceptions:** Open Router path doesn’t have this (yet, on tape).
- **Action:** Steal allowlist-as-fence + idle-store-bills. Do not buy OpenAI storage. Do not stand up n8n search agents.
- **Confidence:** high as the demo path; $0.10 UNVERIFIED.
- **Source:** `lokbsA5VXOk` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** demonstrated (speech)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** 4.1 domain filter fail → 5 mini
- **Speech ≠ behavior:** prefers Open Router, demos native OpenAI

## C. Mental Models
Fewer tools = cleaner agent. He will screenshot the ugly filter. Gemini cheaper until proven worse. Priority: show the toggle. Uncertainty: retrieval quality, MCP.

## D. Procedures
1. If someone says “the agent has no tools” → look at the **model** toggles.
2. Domain allowlist = fence; if the model errors, the model is too old (his 4.1 miss).
3. Vector ID as array; don’t skip the filter.
4. Ask: am I paying for idle GB?
5. Don’t trust an answer without a cite (Gemini gap he names).
Avoid: OpenAI billing; n8n Plus; Perplexity as our web; quote $0.10 as FACT.

## E. Examples
**Allowlist miss then fence:** Situation → WS on `upat.ai`. Action → 4.1 errors, 5 mini says can’t find. Reasoning → site has no WS. Outcome → correct refusal. Lesson → steal the fence; the first error was a model mismatch.

**No-search cutoff:** Situation → WS without Responses. Action → June 2024 shrug. Reasoning → no web. Outcome → enable → Dodgers claim. Lesson → search is a capability, not a truth; score UNVERIFIED.

## F. Decision Rules
- IF “no tools” but it knows the news → the brain has search.
- IF a store sits unused → assume a daily bill (on-tape OpenAI).
- IF no citation → do not treat as sourced.
- IF Open Router is the habit → this feature is unavailable (tape).

## G. Contrarian
He still likes Open Router and still demos the thing it can’t do. Field: more agent tools. He: toggle the model.

## H. Assumptions
Theirs: $0.10/GB/day and Gemini cheaper. Ours: UNVERIFIED; no OpenAI/n8n cloud. Falsifier: a store that doesn’t bill idle. Survivorship: one golf PDF.

## I. Questions
Gemini file-search tape id? Did conversation-ID memory leak across users?

## J. Connections
- SYSTEM SYNTHESIS → `XTBWVVcF3Pk` (question→method) · `send-removed` · stack rule (no OpenAI default).

## K. Future-Use
Allowlist-as-fence. Idle-store-bills. Unassigned Responses extras.

## Steal / Operate-never

### Machine: look at model toggles; allowlist fence; idle store = bill; no cite = not sourced
- **Epistemic:** SOURCE
- **Workflow / loop:** “agent answered the news” → inspect model tools → if web, prefer an allowlist → if files, name the idle bill → demand a cite or mark unverified
- **Questions / signals:** Tools on the agent or the brain? Which domains? Is the store idle?
- **Qualify / frame / objections:** “No tools, still magic” is the fail. 5-mini “can’t find” is the pass.
- **Procedure:** No OpenAI key. No n8n search agent. No Plus.
- **Example that proves it:** Situation → WS on empty site. Action → allowlist + newer model. Reasoning → fence. Outcome → refusal. Lesson → steal the fence.
- **Why it works:** A domain fence is checkable; an idle GB is a silent pay.
- **Conditions / exceptions:** n8n + OpenAI only on tape. $ UNVERIFIED.
- **Operate-never payload:** OpenAI billing; n8n cloud; Plus; quote $0.10 as FACT.
- **Hive run (existing skills only):** `ask-principal` · `coverage-loop`.
- **Source:** `lokbsA5VXOk` @ UNKNOWN

### Operate-never
- Create an OpenAI key / pay storage.
- Install n8n-cloud / Plus.
- Send / pay / deploy / book / publish.

## L. Role-Specific Applications
**One next:** `coverage-loop` score this packet as allowlist-fence + idle-store-bills. Clients parked.
