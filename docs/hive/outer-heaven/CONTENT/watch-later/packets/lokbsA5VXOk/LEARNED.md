# LEARNED — lokbsA5VXOk
Protocol: deep-video-learning
Status: filled
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/lokbsA5VXOk/full.txt`
**Desks merged:** Researcher 2026-08-14. Librarian not yet. Keep later dissent as labeled rows. Do not flatten.
**ICP:** parked. Tape $ UNVERIFIED. No new `icp_id`.
**Note:** Derived from Researcher A–K + Steal after a full `full.txt` walk. Other desks add labeled rows; do not overwrite dissent.

## A. Source Map
Caption-only (`full.txt`, ~2655 words). Title: OpenAI leveled up n8n AI agents (Responses API). Visual/click **UNKNOWN** — he narrates toggles/IDs; do not invent a UI path. Timestamp **UNKNOWN**. Beats: (1) Cold open: two agents, same questions (golf flag-stick rule + Bears record). Agent A: Perplexity + Supabase vector, “helpful assistant,” no other system prompt — rule 17 + 8–3 from tools. Agent B: **no tools, no system prompt** — same answers (rule 17; Bears.com). Not magic: OpenAI chat model **web search + file search** via Responses API. (2) n8n **1.118+**, OpenAI chat model node **v1.3** required. OpenRouter (even OpenAI models) **does not** expose Responses yet — he prefers OpenRouter normally. Built-in tools: web search, file search; also code interpreter + MCP (MCP not in the toggle; skip / would need more coding). (3) Setup: platform.openai.com key + billing (not ChatGPT UI) → paste credential → toggle **use responses API** → web search / file search / code interpreter. Web search options: context size low/med/high; city/country/region; allowed domains. (4) Demo: Responses off → “who won the World Series this year” → cutoff after June 2024. On + web search → Dodgers 2025 over Blue Jays in 7, citations + “visual recap” mention. Domain restrict to upat.ai (old agency site, no WS info) **fails on GPT-4.1**; switch **GPT-5 mini** → “limited to this domain, can’t find.” (5) File search: vector store ID + filter. Create store on platform → Storage → upload (golf rules PDF) → copy ID into an **array** (`["id"]` or comma more). **No filter → error** (for him); docs JSON filter — “screenshot this.” Max results optional. (6) Pricing aside: OpenAI **$0.10/GB/day** even idle vs Gemini file search **upload-only** (points to Gemini tape). Has **not** A/B tested retrieval quality; leans Gemini for more metadata. Golf “ball at rest moves” demo: answers from doc, **no citation/section by default** (empty system prompt); Gemini would cite. Prompting could add cites. (7) Extra Responses options (only when toggle on): saved prompt ID, service tier, safety identifier, **conversation ID** (memory in OpenAI vs n8n simple/Postgres memory), prompt cache key, metadata, top logprobs (he doesn’t understand). Plus CTA. Do **not** flatten vs `Fu6vOfzFmcw` Drive→Supabase, `QrJhdTbK3TU` OpenAI Responses, `KVFfApQZhE4` Gemini, `ZwQ8rJhVCr4` four-method.

## B. Atomic Knowledge

### Brain-native tools vs agent-attached tools
- **Claim:** Same Q&A can come from Perplexity+Supabase tools **or** from OpenAI Responses built-in web/file search with zero agent tools and a empty-ish “helpful assistant.”
- **Reasoning:** Tools moved into the chat-model brain.
- **Mechanism:** Toggle Responses → enable web and/or file search on the OpenAI node.
- **Evidence:** Cold-open twin agents; “this is not magic.”
- **Conditions:** n8n 1.118+ / node v1.3 / native OpenAI credential. Not OpenRouter (as of tape).
- **Exceptions:** Other RAG paths stay separate. MCP built-in not shown.
- **Action:** Steal the *classification*: instance-tool vs model-native tool. Do not install n8n-cloud/OpenAI because tape.
- **Confidence:** high as demo-from-speech.
- **Source:** `lokbsA5VXOk` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared (demo transcript-implied)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** domain filter fail on 4.1 (below)
- **Speech ≠ behavior:** none.

### Domain filter is model-gated; 4.1 failed, 5 mini worked
- **Claim:** Allowed-domains filter on web search did not work on GPT-4.1 (and “probably some older models”); GPT-5 mini honored “only upat.ai” and refused World Series.
- **Reasoning:** Feature × model matrix, not a universal toggle.
- **Mechanism:** Restrict domain → rerun → switch model after fail.
- **Evidence:** “You can’t use that filter if you’re using GPT 4.1… glad it happened.”
- **Conditions:** His n8n node that day.
- **Exceptions:** May rot. Caption-only.
- **Action:** Steal “filter × model” as a test, not a FACT forever.
- **Confidence:** medium (one fail, one success, speech-only).
- **Source:** `lokbsA5VXOk` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** 4.1 fail → 5 mini retry
- **Speech ≠ behavior:** none.

### File search needs store ID array + filter or it errors
- **Claim:** Vector store ID must be an array; without the docs-shaped filter it errored for him; max results optional.
- **Reasoning:** n8n field + OpenAI tool schema mismatch; he reverse-read docs.
- **Mechanism:** platform Storage → create store → upload → paste `["vs_…"]` + filter JSON.
- **Evidence:** “if you just try to do this without filters, it’s going to error. At least it was erroring for me.”
- **Conditions:** His node version. Filter JSON is on-screen, not in `full.txt` — **do not invent the JSON**.
- **Exceptions:** Gemini path has different knobs (`KVFfApQZhE4`).
- **Action:** Steal “ID is an array + filter required (then).” Do not paste a guessed filter.
- **Confidence:** high as his scar; JSON unobserved.
- **Source:** `lokbsA5VXOk` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN (screenshot mentioned, not captured)
- **Failed / retried:** no-filter error
- **Speech ≠ behavior:** none.

### Idle OpenAI store bills; Gemini upload-only; cites differ
- **Claim:** OpenAI file search **$0.10/GB/day** even unused; Gemini charged on upload; he has not tested which retrieves better; Gemini returns more metadata/citations by default; OpenAI golf answer had no section cite with empty system prompt.
- **Reasoning:** Cost + cite UX, not quality crown.
- **Mechanism:** Point to Gemini video; show missing source in node output.
- **Evidence:** “I haven’t explicitly tested them out yet… leaning towards Gemini because it comes back with a lot more metadata.”
- **Conditions:** Prices as of tape — **UNVERIFIED** / may rot.
- **Exceptions:** Do not flatten four RAG tapes into “use Gemini.”
- **Action:** Steal the *disagreement row*: cost vs cite vs untested quality.
- **Confidence:** high as his caveat; $ UNVERIFIED.
- **Source:** `lokbsA5VXOk` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** unobserved quality test
- **Speech ≠ behavior:** none.

### Conversation ID = memory in OpenAI, not n8n
- **Claim:** Responses options include conversation ID so memory lives at OpenAI instead of n8n simple/Postgres memory; also saved prompts, service tier, cache key, metadata, logprobs (unused by him).
- **Reasoning:** Toggle-gated extra fields.
- **Mechanism:** Enable Responses → extra options appear.
- **Evidence:** He lists them; turns toggle off to show they vanish.
- **Conditions:** Native OpenAI node.
- **Exceptions:** Hive may not want vendor-held memory.
- **Action:** Learn the knob. Operate-never: move hive memory to OpenAI because tape.
- **Confidence:** high as option list; no memory demo.
- **Source:** `lokbsA5VXOk` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** unobserved
- **Speech ≠ behavior:** none.

## C. Mental Models
Prefer OpenRouter except when a native API feature isn’t bridged — then swallow vendor lock for the toggle. Built-in tools can empty the agent canvas. Failures on tape are teaching (4.1 domain, no-filter error). Cost/cite can decide before quality is tested. Don’t over-claim MCP if the toggle isn’t there.

## D. Procedures
1. Confirm n8n ≥1.118 and OpenAI chat model node v1.3 (his versions).
2. Credential from platform.openai.com (not ChatGPT), billing on.
3. Toggle use Responses API.
4. Web search: set context size; optional geo; optional allowed domains — **test the model** (4.1 failed domain filter for him).
5. Prove live vs cutoff: same question with toggle off then on.
6. File search: create vector store → upload → ID as array → add filter (docs; do not invent) → optional max results.
7. Expect no citations unless you prompt; compare Gemini metadata on the sibling tape.
8. Know idle $0.10/GB/day (UNVERIFIED).
9. Extra: conversation ID / cache / saved prompt if needed.
10. Hive: no OpenRouter-vs-OpenAI spend; no Plus; no new ICP.

## E. Examples
- **Situation:** Flag-stick + Bears. **Action:** Tools agent vs brain-native agent. **Outcome:** Same answers. **Lesson:** Capability can hide in the model node.
- **Situation:** World Series + cutoff. **Action:** Toggle off (June 2024 cutoff) → on (Dodgers 2025 + cites). **Outcome:** Demo of web search. **Lesson:** Same prompt, different brain tools.
- **Situation:** Domain = upat.ai. **Action:** 4.1 fail → 5 mini “can’t find on restricted domain.” **Outcome:** Filter works only on some models. **Lesson:** Feature × model.
- **Situation:** Golf PDF, empty system prompt. **Action:** File search answers without section cite. **Outcome:** He prefers Gemini’s metadata pending a real test. **Lesson:** Don’t crown a RAG winner from one tape.

## F. Decision Rules
- IF you need Responses tools → native OpenAI node, not OpenRouter (as of tape).
- IF domain filter errors/ignores → change model before blaming n8n.
- IF file search errors → check array + filter before blaming the PDF.
- IF idle store cost matters → he points at Gemini (UNVERIFIED $).
- IF you need citations by default → he says Gemini today; or prompt OpenAI.
- IF MCP toggle missing → don’t pretend it’s one-click (he skipped).
- Refuse: install n8n-cloud; quote $0.10/GB as FACT; flatten RAG paths; new ICP.

## G. Contrarian
Empty agent (no tools, no prompt) can still search — the brain has the tools. OpenRouter-first creator uses OpenAI node anyway. He advertises OpenAI file search and immediately says Gemini is cheaper / better metadata and **untested** on quality.

## H. Assumptions
n8n 1.118 / node 1.3 / $0.10/GB/day / Dodgers 2025 / Bears 8–3 = tape-dated, $ UNVERIFIED. Filter JSON not in `full.txt`. Speech≠behavior: OpenRouter preference vs this demo.
**Desk dissent:** Four RAG tapes stay four rows. Do not pick a winner.

## I. Questions
- Exact filter JSON (screenshot only)?
- Did he ever A/B OpenAI vs Gemini retrieval?
- Conversation-ID memory vs n8n Postgres — which did he keep in production?

## J. Connections
- **SYSTEM SYNTHESIS:** `QrJhdTbK3TU` (OpenAI Responses) · `KVFfApQZhE4` (Gemini file search) · `Fu6vOfzFmcw` (Drive→Supabase) · `ZwQ8rJhVCr4` (four-method) · `QojPKL96Dx4` (easiest RAG, remaining). Skills: `wiki-ingest` · `info-gain-cite` · `golden-test-loop`.

## K. Future-Use
Model×filter matrix. Array+filter scar. Idle-store cost as a decision input. Conversation-ID as vendor memory (operate-never by default).

## Stolen machines

### Machine: responses-brain-tools-vs-agent-tools
- **Epistemic:** SOURCE
- **Workflow / loop:** version-check → platform key → Responses toggle → web and/or file search → prove cutoff vs live → if domain filter fails, swap model → file store as array + filter → compare cite/cost to Gemini tape
- **Questions / signals:** Node v1.3? OpenRouter blocking the feature? Filter error? Citations present? Idle GB?
- **Qualify / frame / objections:** Empty canvas ≠ no tools. Cheaper Gemini ≠ proven better retrieval.
- **Procedure:** D.
- **Example that proves it:** Twin golf/Bears agents; WS cutoff; 4.1 domain fail; no-filter error; no default cite.
- **Why it works:** Built-in tools remove glue nodes; failures on tape are the real SOP.
- **Conditions / exceptions:** Dated versions/prices. Do not flatten with Drive/Supabase/Gemini/four-method.
- **Operate-never payload:** n8n-cloud install; OpenAI spend because tape; quote $0.10/GB as FACT; invent filter JSON; move hive memory to OpenAI; new ICP.
- **Hive run (existing skills only):** `info-gain-cite` · `golden-test-loop` · `wiki-ingest`
- **Source:** `lokbsA5VXOk` @ UNKNOWN

**Operate-never**
- Install OpenAI/n8n-cloud/Plus. Flatten RAG paths. Quote tape $ as FACT. Send / pay / deploy. New `icp_id`.

## THINK / BEHAVE / TRICKS / USE
**Added:** 2026-08-14 last-mile. Caption-only. Visual/click UNKNOWN unless `watch.json`. Do not flatten this speaker into a hive personality.

### THINK
Decision order, what they ask before they build, what they ignore, how they choose tools, when they kill vs continue — see §C Mental Models and §F Decision Rules above. Desk that must think this way: see TAPE-WIRE-NOTES.

### BEHAVE
What they repeatedly check, skip, retry, and speech≠behavior — see §A / §E / speech≠behavior rows. Sequence-from-speech only. `multimodal-youtube-learning`: no invented clicks.

### TRICKS
Do / don’t and implicit shortcuts — see §D Procedures and Stolen machines. Shown system (files, loops, UI, offer, CTA) mapped to Cursor+Grok primitives on the named workflow. Caption-only = transcript-implied / unobserved.

### USE
Each trick lands as a desk **action** on Cursor + Grok Bot (not a quote). Operate-never on their vendors. Reproduce card: `job-cards/takes/_knowledge-use/{{slug}}.md`.
