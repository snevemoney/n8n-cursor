# Consultant — QrJhdTbK3TU
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/QrJhdTbK3TU/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/QrJhdTbK3TU/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

OpenAI built-in tools teaser (twin of `lokbsA5VXOk`). Beats: AI agent + OpenAI chat model → get API key → enable Responses API → built-in web search, file search, code interpreter. Web search: context size low/medium/high; optional allowed domains. Demo: who won the World Series this year → Dodgers over Blue Jays in seven, with source sites. File search: same Responses API, need vector store ID + filter from platform.openai.com storage; ask what happens if a ball at rest moves in golf → it depends on what caused the move. CTA to the long. No VTT. UNKNOWN. ~464 words.

## B. Atomic Knowledge

### Responses API unlocks built-in tools on the chat model
- **Claim:** Enabling Responses API on the OpenAI chat model is what exposes web search, file search, and code interpreter as built-ins.
- **Reasoning:** Without the toggle, you are back to rolling HTTP tools.
- **Mechanism:** Connect key → toggle Responses API → pick tool → set context size / domains or vector store ID.
- **Evidence:** “this is what gives us access to adding in those built-in tools”
- **Conditions:** OpenAI chat model node in n8n.
- **Exceptions:** Vendor feature; we do not install OpenAI.
- **Action:** Steal “search is a tool, not a hope.” Do not create the key.
- **Confidence:** high as on-tape mechanics
- **Source:** `QrJhdTbK3TU` @ UNKNOWN — “enable this little toggle that says use responses API”
- **Epistemic:** SOURCE
### Domain allowlist and a cite
- **Claim:** Web search can restrict allowed domains; the World Series answer comes back with the sites it used.
- **Reasoning:** Unrestricted search is a different, noisier product.
- **Mechanism:** Set domains (optional) → ask a current-fact question → read the cited sites.
- **Evidence:** “it also is pulling the actual websites that it got this information from.”
- **Conditions:** Sports fact demo. 2025 World Series on tape (UNVERIFIED as sports fact for us).
- **Exceptions:** Cites can be wrong. Sports Q is not a client job.
- **Action:** If you ever search, prefer an allowlist + visible sources.
- **Confidence:** high as a habit
- **Source:** `QrJhdTbK3TU` @ UNKNOWN — “web search allowed domains”
- **Epistemic:** SOURCE
### File search needs a store ID you created elsewhere
- **Claim:** File search is not “drop a file in the node”; you create a vector store on platform.openai.com and paste the ID as an array.
- **Reasoning:** The store is a separate object. Missing ID = no search.
- **Mechanism:** Create store in OpenAI storage → copy ID → node array → ask a doc question.
- **Evidence:** Golf ball-at-rest question on tape.
- **Conditions:** You have files in that store.
- **Exceptions:** Same empty-store class of bug as Gemini File Search.
- **Action:** Check the ID is the store you think it is.
- **Confidence:** high
- **Source:** `QrJhdTbK3TU` @ UNKNOWN — “what we need is a vector store ID and a filter”
- **Epistemic:** SOURCE


## C. Mental Models

He is selling ease: toggles instead of pipelines. He likes current-fact demos and golf-rules demos (checkable-ish). He walks credentials in public. He is in an OpenAI-in-n8n launch week.

## D. Procedures

On-tape: key → Responses API → web or file tool → (domains or store ID) → ask → read cites. Ours: do not get the key. Steal allowlist + cite + store-ID-as-stop.

## E. Examples

**Situation:** Need web or file search on an agent. **Action:** Responses API toggle; World Series web search; golf file search. **Outcome:** Answers + sources / a rule-shaped reply. **Lesson:** Built-in tools still have setup objects (store ID, domains). Implicit rule: show the websites.

## F. Decision Rules

If Responses API is off, stop debugging the prompt. If the store ID is empty, stop. If there are no source URLs on a web answer, fail the smoke test.

## G. Contrarian

Field default: build Tavily + vector DB. He toggles built-ins. Field default: trust the model’s memory for “who won.” He searches.

## H. Assumptions

OpenAI on-tape — do not install. World Series result UNVERIFIED. Golf Q underspecified. “Easiest way” is marketing.

## I. Questions

What does `lokbsA5VXOk` add (code interpreter)? Failure modes? Cost?

## J. Connections

**SYSTEM SYNTHESIS:** Twin `lokbsA5VXOk`. Cite habit with `KVFfApQZhE4`. Maps to `info-gain-cite` + `golden-test-loop`. Stack stays Cursor + Grok.

## K. Future-Use

Unassigned: allowlist+cite as default for any web tool; store-ID checklist.

## Steal / Operate-never

### Machine: Toggle search as a tool; allowlist + cite + store ID are the stops
- **Epistemic:** SOURCE
- **Workflow / loop:** Need current facts or a doc → attach a search tool (not the model’s memory) → set domains or store ID → ask → require sources → human checks
- **Questions / signals:** Is Responses/search actually on? What domains? What store ID? Where are the URLs?
- **Qualify / frame / objections:** Qualify: the question is not in the prompt’s head. Frame: built-in tool. Objection: “the model knows” — he still searches the Series.
- **Procedure:** Do not install OpenAI. Do not skip the store ID. Do not quote sports as FACT.
- **Example that proves it:** World Series web search with site cites; golf file search via vector store ID.
- **Why it works:** Facts that change or live in a PDF need a tool and a cite. Toggles do not remove the objects you must name.
- **Conditions / exceptions:** Vendor on-tape. Demos only.
- **Operate-never payload:** Create an OpenAI key. Trust uncited answers. Use World Series as proof.
- **Hive run (existing skills only):** `info-gain-cite` · `golden-test-loop` · `ask-principal`
- **Source:** `QrJhdTbK3TU` @ UNKNOWN


### Operate-never
- Create an OpenAI key / enable Responses API on a client.
- Treat uncited web answers as done.
- Unpark a client / new `icp_id` / new `business-lanes.json` row. Learning ≠ hunt.
- Quote tape $ / student counts / job-loss % / hours×rate as FACT.
- Send / pay / deploy / book / publish. Approve draft ≠ send.
- Install on-tape vendors (Claude, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus, n8n-cloud, Skool). Stack stays Cursor + Grok.
- Grok Bot / `sendPrompt`. Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. Overwrite `takes/consultant.md` or another desk's take.

## L. Role-Specific Applications

**Constraint first:** The stated ask is “easiest web/file search.” Felt problem is not an OpenAI toggle. Do not attach OpenAI to a parked client.

**Four-blank after constraint:** Toddler stop = named store/domains + visible sources.

**Skeptical-customer:** “Easiest” is smash. Clients parked.
