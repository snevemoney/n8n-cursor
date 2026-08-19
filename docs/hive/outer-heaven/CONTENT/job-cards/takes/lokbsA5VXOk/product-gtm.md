# Product GTM — lokbsA5VXOk
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/lokbsA5VXOk/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/lokbsA5VXOk/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate Herk. Title: “OpenAI Just Leveled Up n8n AI Agents.” Beats: (1) demo: golf PDF + Bears record — agent with Perplexity + Supabase vs agent with **no tools / no system prompt** that still answers because OpenAI chat model has **Responses API** web+file search built in; (2) n8n ≥1.118, OpenAI chat model v1.3; Open Router does **not** expose Responses yet — must be native OpenAI; (3) platform.openai.com key + billing, not ChatGPT; toggle Use Responses API → web / file / code interpreter (MCP not in the UI); (4) web: context low/med/high; city/country; allowed domains — World Series works with search, fails when locked to his dead agency domain `upai.com`; domain filter needs a newer model (4.1 failed, 5 mini worked); (5) file search: vector store ID as JSON array + a non-obvious **filter** (screenshot-the-docs) or it errors; max results; golf “ball at rest” pull — **no citation** by default vs Gemini metadata; (6) price: OpenAI **$0.10/GB/day even idle** vs Gemini charge-on-upload (sibling tape); he has not A/B’d retrieval quality; (7) extra Responses options: saved prompt ID, service tier, safety identifier, **conversation ID** (memory on OpenAI, not n8n Postgres), prompt cache key, metadata, top logprobs (he does not use); (8) AIS+ community CTA. Timestamp UNKNOWN. **$0.10/GB/day / 8–3 Bears / Dodgers 2025 UNVERIFIED.**

## B. Atomic Knowledge
### Built-in tools hide the bill and the cite
- **Claim:** “No tools” is a lie if the brain has vendor search. File search that bills idle GB/day is a different product than a store you only pay to upload.
- **Reasoning:** The empty agent looked magic. The magic is OpenAI’s index + web. Gemini’s cheaper idle + better cites is why he leans Gemini — untested.
- **Mechanism:** Toggle → domain lock to prove it → vector store + required filter → ask where it pulled; if no cite, prompt for it or pick the vendor that returns metadata.
- **Evidence:** World Series without search = cutoff; with search = Dodgers + links; domain lock = cannot answer; golf PDF answers without a section cite.
- **Conditions:** On-tape n8n + OpenAI. Hive does not install either as the stack.
- **Exceptions:** Older models ignore domain filter.
- **Action:** Steal “empty agent is still a vendor tool” and “idle GB is a tax.” Do not productize Responses API or n8n RAG.
- **Confidence:** high as demo; prices UNVERIFIED.
- **Source:** `lokbsA5VXOk` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Brain-with-tools ≠ empty. Idle storage tax. Cite or it did not happen. Domain lock as a proof. Memory location (vendor vs your DB) is a lock-in.

## D. Procedures
If a demo has no tools, open the model node. If file search, ask the idle price and the cite. If they want “only our site,” lock domains and use a model that honors it.

## E. Examples
**Situation:** Same golf+Bears question, two agents. **Action:** One has tools; one has Responses toggles. **Outcome:** Same answers. **Lesson:** The offer is not “no tools.”

**Situation:** Domain = dead agency site. **Action:** World Series fails. **Lesson:** The lock works — and proves the first answer was the open web.

## F. Decision Rules
- If the pitch is “no tools, still smart” → find the hidden vendor tool.
- If the store bills per GB/day idle → say that in the proposal (`Lg5TYWPSg6M` client’s card).
- Refuse: n8n+OpenAI RAG SKU; Open Router workaround; AIS+; $0.10 as FACT.

## G. Contrarian
Against Open Router as the default (here it cannot). Against assuming file search includes a cite.

## H. Assumptions
Theirs: n8n 1.118+, OpenAI billing. Ours: Cursor + Grok; n8n-cloud stays on-tape. Falsifier: Open Router ships Responses and idle GB goes to zero.

## I. Questions
Sibling Gemini file-search tape `irg-2IfAjpo`. Retrieval A/B he deferred.

## J. Connections
**SYSTEM SYNTHESIS:** Idle tax + client’s card = `Lg5TYWPSg6M`. Cite/eval = `8IUWeF3B-hk`. Maps to `ask-principal`.

## K. Future-Use
Unassigned: “empty node still has a vendor tool.” Keep.

## Steal / Operate-never

### Machine: open the brain node before you believe “no tools”
- **Epistemic:** SOURCE
- **Workflow / loop:** magic answer → open model settings → name the built-in tool + idle price + cite → lock a domain to prove it
- **Questions / signals:** Who embeds? Who bills when idle? Where does memory live?
- **Qualify / frame / objections:** “No tools” is the objection.
- **Procedure:** Do not add OpenAI/n8n to hive. Cursor + Grok.
- **Example that proves it:** Empty agent = Bears + rule 17; domain lock fails World Series.
- **Why it works:** Hidden tools are still a SKU and a bill.
- **Conditions / exceptions:** $ UNVERIFIED.
- **Operate-never payload:** n8n Responses RAG; OpenAI vector store; AIS+
- **Hive run (existing skills only):** `ask-principal`
- **Source:** `lokbsA5VXOk` @ UNKNOWN

### Operate-never
- Productize n8n / OpenAI file search / Perplexity / Supabase
- Quote $0.10/GB/day as FACT
- New hunt; merge LESSONS; auto-write SKILL.md

## L. Role-Specific Applications
Do not anneal “n8n agents with built-in search” into the sentence. Clients parked.
