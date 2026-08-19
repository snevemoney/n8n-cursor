# Career Strategist — lokbsA5VXOk
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/lokbsA5VXOk/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/lokbsA5VXOk/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Video (10:31, 2655 words). Caption ingest. Beats in order: (1) agent with Perplexity + Supabase vector tools answers golf rule 17 + Bears record (2) second agent, no tools, no system prompt, same answers — not magic: OpenAI chat model has web search + file search via Responses API (3) n8n ≥1.118, OpenAI chat model node v1.3 required (4) he prefers OpenRouter; Responses API is not there yet even for OpenAI models — must use native OpenAI node (5) built-ins: web search, file search; also code interpreter + MCP (MCP not shown; may need custom request) (6) credential: platform.openai.com key + billing, not ChatGPT login (7) toggle Use Responses API (8) web search options: context low/med/high; city/country/region; allowed domains (9) off: World Series → cutoff June 2024; on: Dodgers 2025 + citations + visual recap (10) domain filter to his old agency site → fail; also fails on GPT-4.1 — switch to GPT-5 mini, then correctly “can’t find on that domain” (11) file search: vector store ID + filter (errors without filter; he screenshots the filter JSON) (12) storage UI: create store, drop golf PDF, copy ID as array (13) pricing callout: OpenAI 10¢/GB/day even idle; Gemini charges upload — he leans Gemini for metadata, has not A/B’d retrieval (14) ball-at-rest question: answers from doc, no citation by default; Gemini would cite; prompt could add cites; system message empty (15) extra options if Responses on: saved prompt ID, service tier, safety identifier, conversation ID (memory in OpenAI vs n8n/Postgres), prompt cache key, metadata, top logprobs (he does not understand) (16) Plus CTA. Visual/click: UNKNOWN. Gap: tutorial; no paid career outcome.

## B. Atomic Knowledge

### Built-in tools can replace attached tools — and hide the brain
- **Claim:** The same Q&A works with no agent tools and no system prompt if the chat-model node has Responses API web+file search on.
- **Reasoning:** Capability moved into the brain. An empty agent is not “no stack.”
- **Mechanism:** Toggle + vendor storage, not a Perplexity/Supabase pair.
- **Evidence:** “this agent with no tools is able to get us the exact same answer… We’re enabling web search and we’re enabling file search.” @ UNKNOWN
- **Conditions:** n8n OpenAI node v1.3+, Responses on.
- **Exceptions:** OpenRouter path cannot do this yet (on this tape).
- **Action:** When an agent looks empty, inspect the model node.
- **Confidence:** high as demo claim; pixels UNKNOWN
- **Source:** `lokbsA5VXOk` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** domain filter failed on 4.1; idle-store pricing named
- **Speech ≠ behavior:** “no tools” speech vs vendor tools inside the brain

### Vendor door ≠ consumer login; idle storage is a bill
- **Claim:** The key is platform.openai.com + billing, not ChatGPT. File search bills ~10¢/GB/day even if unused; Gemini’s upload-only price is why people liked it.
- **Reasoning:** Wrong door = no Responses. Idle vectors are a standing cost.
- **Mechanism:** Create vector store → ID array + required filter → query.
- **Evidence:** “This is not your typical chat gvt environment. This is platform.openai.com.” / “you’re still going to get billed” @ UNKNOWN
- **Conditions:** You turn file search on.
- **Exceptions:** He has not tested who retrieves better.
- **Action:** Separate consumer login from platform key; know idle cost.
- **Confidence:** high as his warning; rates UNVERIFIED
- **Source:** `lokbsA5VXOk` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** error without filter; he read docs
- **Speech ≠ behavior:** none

### Constraints are part of the demo
- **Claim:** Allowed-domain search can correctly refuse; older models may not support the filter; default file answers may not cite.
- **Reasoning:** He is glad the World-Series-on-old-site fail happened.
- **Mechanism:** Restrict domain → cannot answer; empty system prompt → no section cite.
- **Evidence:** “I’m limited to only this domain. I can’t find that.” @ UNKNOWN
- **Conditions:** Domain filter + a model that supports it.
- **Exceptions:** GPT-4.1 path failed the filter.
- **Action:** Test the refuse path; do not assume citations.
- **Confidence:** high as spoken fail
- **Source:** `lokbsA5VXOk` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** 4.1 filter fail → 5 mini
- **Speech ≠ behavior:** none

## C. Mental Models
New node versions unlock hidden APIs. Preferred router (OpenRouter) can lag the native node — lock-in is a real trade. Empty prompt + empty tools can still be a full vendor brain. Pricing of idle memory is a product decision. Citations are not free with file search. Conversation memory can live at the vendor (conversation ID) instead of your DB. He will not fake understanding top logprobs.

## D. Procedures
1. Confirm n8n + OpenAI chat model version (1.3).
2. Get a platform API key + billing (not ChatGPT).
3. Toggle Use Responses API.
4. For web: set context size, geo, optional allowed domains.
5. Prove off vs on with a post-cutoff news question.
6. For files: create vector store, copy ID as JSON array, paste the required filter, optional max results.
7. Expect errors without the filter; screenshot docs if needed.
8. Do not assume citations; prompt if you need them.
9. Compare idle $/GB vs an upload-only vendor before leaving a store up.
10. Optional: saved prompts, tier, conversation ID, cache key.

Questions: Native node or router? Idle store cost? Does this model support domain filter? Signals: “I don’t have information after DATE.” Qualify: need live web or a PDF, not a personality.

## E. Examples
**Situation:** Two agents, one with Perplexity+Supabase, one with nothing.  
**Action:** Same golf + Bears questions.  
**Reasoning:** Tools moved into Responses.  
**Outcome:** Same answers; second cites Bears.com.  
**Lesson:** Inspect the brain.

**Situation:** Domain-locked to an old agency site, World Series question.  
**Action:** 4.1 cannot use the filter; 5 mini refuses correctly.  
**Reasoning:** Constraint must be testable.  
**Outcome:** “Can’t find on that domain.”  
**Lesson:** Failures are the demo.

## F. Decision Rules
- IF OpenRouter cannot see Responses → native OpenAI node (his tape; hive does not install).
- IF a vector store will sit idle → count daily GB cost.
- IF you need citations → do not trust the default file-search answer.
- IF domain filter errors → try a newer model before abandoning the feature.
- IF the agent looks empty → check the model toggle.

## G. Contrarian
Rejects “an agent with no tools and no prompt is magic / simple.” Also rejects pretending he A/B’d OpenAI vs Gemini retrieval — he says he has not.

## H. Assumptions
**Theirs:** n8n 1.118+ is current; OpenAI storage is the file path; Plus is the classroom. Survivorship: he already has keys and a golf PDF. **Ours:** All $ UNVERIFIED. Hive stack Cursor + Grok — this is on-tape n8n/OpenAI. Falsifier: OpenRouter adds Responses and the native-node lock-in dies. Speech≠behavior: “no tools” vs built-in tools.

## I. Questions
- Who wins retrieval, OpenAI or Gemini, with citations?
- What is the exact filter JSON?
- When is conversation-ID memory a career liability (vendor holds the thread)?

## J. Connections
- SYSTEM SYNTHESIS → `irg-2IfAjpo` (Gemini file search, cheaper twin).
- SYSTEM SYNTHESIS → `QojPKL96Dx4` / `kOKavHnlPik` (RAG family).
- SYSTEM SYNTHESIS → `4OOS96i2gfI` (this is an AI workflow / built-in tool, not “an agent”).

## K. Future-Use
Unassigned: “empty agent, full vendor brain” as a review smell. Idle-storage billing as a cost question in any second-brain pitch. Not a hunt. Not an OpenAI key.

## Steal / Operate-never

### Machine: inspect-the-brain + test the refuse path
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** see an “empty” agent → open the model node → note built-in tools / version / key door → prove off vs on → prove domain refuse → check idle storage price → do not assume cites
- **Questions / signals:** Platform key or ChatGPT? Filter present? Post-cutoff question fails?
- **Qualify / frame / objections:** Need live web or a file. Objection to “simple agent”: the brain is the stack.
- **Procedure:** Version check → toggle → web and/or file store ID + filter → compare idle $ vs upload-only.
- **Example that proves it:** No-tool agent matches tool agent; domain lock correctly fails (E).
- **Why it works:** Capability hid in the vendor node; constraints must be demonstrated (B/C).
- **Conditions / exceptions:** Router lag. Older models lack filters. MCP not shown.
- **Operate-never payload:** Creating an OpenAI platform key; pasting billing; leaving a paid vector store up; quoting 10¢/GB as FACT; n8n-cloud install; selling this as a $ agent.
- **Hive run (existing skills only):** `info-gain-cite` · `ask-principal` on any key · `golden-test-loop` (off/on/refuse)
- **Source:** `lokbsA5VXOk` @ UNKNOWN

### Operate-never
- Create or paste API keys. HITL only, and not as hive stack.
- Install n8n / OpenAI / OpenRouter. Cursor + Grok only.
- Send / pay / deploy / book / publish.
- Quote tape $ / World Series facts as FACT.
- Unpark clients / new `icp_id`.
- Auto-write `SKILL.md`. Merge `LESSONS-FROM-TAPE.md`.

## L. Role-Specific Applications
Employment still covers baseline. The career habit is “I inspect the model node before I believe an empty agent,” not “I ship Responses API.” Gym off/on/refuse tests. Do not open a platform key or a standing vector bill from this tape. Title is vendor, not a promotion case.
