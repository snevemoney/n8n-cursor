# Publishing Engine — QrJhdTbK3TU
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/QrJhdTbK3TU/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/QrJhdTbK3TU/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** Web search + file search on OpenAI Responses API
**Channel:** Nate Herk | AI Automation

## A. Source Map
1. Easiest way to add web search and file search to agents.
2. AI agent + OpenAI chat model → credential → toggle 'use responses API' to unlock web search, file search, code interpreter.
3. Web: set context size low/medium/high; optional allowed domains (Google, LinkedIn, Wikipedia).
4. Run: who won the World Series this year → LA Dodgers 2025 over Blue Jays in seven; cites websites.
5. File search: same Responses API, web off; needs vector store ID + filter from platform.openai.com storage.
6. Ask: what should happen if a ball at rest moves in golf → depends on what caused the move.
7. CTA: full breakdown. OpenAI on tape. 2025 Series result UNVERIFIED.
Timestamp UNKNOWN (no VTT unless noted). Tape $ / student counts / job-loss % = UNVERIFIED.

## B. Atomic Knowledge

### Toggle unlocks built-in tools
- **Claim:** Responses API toggle is what adds web search, file search, and code interpreter — not a custom tool graph.
- **Reasoning:** People would otherwise wire HTTP. He flips a switch.
- **Mechanism:** Connect key → toggle → pick tool → optional domain allowlist / vector store ID.
- **Evidence:** This is what gives us access to adding in those built-in tools.
- **Conditions:** You are on OpenAI's chat model in n8n.
- **Exceptions:** A non-OpenAI brain will not get this toggle.
- **Action:** Steal allowlist + cite. Do not install OpenAI as hive.
- **Confidence:** high
- **Source:** `QrJhdTbK3TU` @ UNKNOWN
- **Epistemic:** SOURCE

### Cite the site / name the store
- **Claim:** Web search returns the answer plus the websites. File search needs an explicit vector store ID.
- **Reasoning:** An unsourced 'Dodgers won' is a vibe. A store-less file search cannot run.
- **Mechanism:** Ask → tool → answer + sources or store ID.
- **Evidence:** It also is pulling the actual websites that it got this information from.
- **Conditions:** You care about provenance.
- **Exceptions:** A blocked domain list that is empty is not an allowlist.
- **Action:** Pack sources. Do not pack the Series as FACT.
- **Confidence:** high
- **Source:** `QrJhdTbK3TU` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
- Built-in tools beat a random HTTP (`rXpHzWXjHrw` says this too).
- Domain allowlist is a guardrail.
- Storage ID is a handle, like name-the-file.

## D. Procedures
- If web: set context size + allowed domains.
- If file: paste store ID as an array.
- Show the cited URLs.

## E. Examples
- Situation: World Series Q + golf-rules Q. Action: Responses API web, then file search on a store. Reasoning: Built-in tools. Outcome: Dodgers + sites; golf depends on cause. Lesson: Cite + store ID are the machine.

## F. Decision Rules
- If there are no URLs → fail the web pack.
- If store ID is missing → fail the file pack.
- Do not quote the Series as FACT.

## G. Contrarian
- Field would scrape. He toggles a vendor tool and shows citations.

## H. Assumptions
- Theirs: OpenAI storage is the RAG. On-tape. Ours: do not stand it up.
- Sports result may be wrong — UNVERIFIED.

## I. Questions
- What is 'high' context size in tokens?
- Who uploaded the golf rules?
- Is code interpreter shown in the long video?

## J. Connections
- **SYSTEM SYNTHESIS:** `KVFfApQZhE4` Gemini file search. `irg-2IfAjpo` long form.
- **SYSTEM SYNTHESIS:** `info-gain-cite` — we want sources from a run we did.

## K. Future-Use
- Unassigned: domain allowlist as a web-tool gate.
- Unassigned: store-ID as a handle.

## Steal / Operate-never

### Machine: toggle-then-cite
- **Epistemic:** SOURCE
- **Workflow / loop:** enable the search tool → set allowlist or store ID → ask → return answer + sources → checkable stop = URLs or store named, claim not posted as FACT
- **Questions / signals:** Which domains? Which store ID? Where are the citations?
- **Qualify / frame / objections:** Not 'the model knows sports.'
- **Procedure:** Package citations from a run we did. Do not use OpenAI as hive.
- **Example that proves it:** World Series answer comes back with websites; golf answer from a file store.
- **Why it works:** Provenance is the product. The toggle is costume.
- **Conditions / exceptions:** Vendor stays on tape. Sports/legal answers stay UNVERIFIED.
- **Operate-never payload:** Install OpenAI storage; quote the Series as FACT; RAG farm.
- **Hive run (existing skills only):** `info-gain-cite` · `ask-principal`
- **Source:** `QrJhdTbK3TU` @ UNKNOWN

**Operate-never**
- Publish / schedule live / paid boost without Evens.
- Republish Nate or any source creator.
- Quote tape $ / hours×rate / student counts as FACT or as our price.
- Send / pay / deploy / book.
- New icp_id / unpark a client / Grok Bot sendPrompt.
- Install on-tape vendors (n8n-cloud, Skool, Vapi, Claude, ChatGPT, Gemini, Coda, Abacus).
- Stand up OpenAI vector storage as ours.
- Quote the Series or golf rule as FACT.

## L. Role-Specific Applications
- I package citations + a store handle. I do not publish a sports blurb.
- I will not cut an OpenAI how-to as ours.
- Evens publishes. I do not.
