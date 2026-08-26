# Career Strategist — QrJhdTbK3TU
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/QrJhdTbK3TU/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/QrJhdTbK3TU/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Short (1:48, 464 words). OpenAI Responses API tools on an n8n agent. Beats: (1) easiest web search + file search (2) AI agent + OpenAI chat model; need API key (3) toggle **use responses API** to unlock web search, file search, code interpreter (4) web: context size low/medium/high; optional allowed domains (Google, LinkedIn, Wikipedia) (5) demo: who won the World Series this year → LA Dodgers 2025 over Blue Jays in seven; cites sites (on-tape sports claim, UNVERIFIED) (6) file search: same Responses API, web off; needs vector store ID + filter (7) create store on platform.openai.com storage; paste ID as array (8) ask: ball at rest moves in golf → depends on what caused the move (9) CTA. OpenAI on-tape.

## B. Atomic Knowledge

### Responses API is the feature gate
- **Claim:** Built-in web/file/code tools appear only after “use responses API” is on.
- **Reasoning:** Old chat completions path does not expose them here.
- **Mechanism:** toggle → tools.
- **Evidence:** “this is what gives us access to adding in those built-in tools which are web search, file search, and code interpreter.” @ UNKNOWN
- **Conditions:** OpenAI credential.
- **Exceptions:** Hive does not operate OpenAI; steal “feature behind a toggle.”
- **Action:** Look for the gate before assuming the model cannot search.
- **Confidence:** high as UI on tape.
- **Source:** `QrJhdTbK3TU` @ UNKNOWN
- **Epistemic:** SOURCE

### Domain allowlist + store ID are the steering wheels
- **Claim:** Web can be limited to named domains; file search needs an explicit vector store ID (array) and filter.
- **Reasoning:** Unbounded web vs a private store.
- **Mechanism:** allowed domains / storage UI → ID → node.
- **Evidence:** “if you only want to search certain domains” / “what we need is a vector store ID and a filter.” @ UNKNOWN
- **Conditions:** You created the store and copied the ID.
- **Exceptions:** Empty allowlist = open web (his World Series run).
- **Action:** Decide open-web vs allowlist vs private store *before* the question.
- **Confidence:** high as config.
- **Source:** `QrJhdTbK3TU` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Search is a tool, not a personality. Sports questions prove live web. Golf questions prove the store. Citations (sites) are part of the web receipt.

## D. Procedures
Connect key → enable Responses API → set context size → optional domain list → run web question.  
Or: disable web, enable file search, paste store ID array, ask a doc question.  
Avoid: file search without a store ID.

## E. Examples
**Situation:** Who won the World Series this year?  
**Action:** Web search on; returns Dodgers 2025 + sites.  
**Reasoning:** Needs live data.  
**Outcome:** Cited answer (UNVERIFIED).  
**Lesson:** Web is for now-questions.

**Situation:** Ball at rest in golf.  
**Action:** File search on a store.  
**Reasoning:** Rules live in the PDF.  
**Outcome:** Cause-dependent answer.  
**Lesson:** Same node, different tool.

## F. Decision Rules
- If the fact changes this year, use web (and label UNVERIFIED).
- If the fact is in our file, use the store, not the open web.
- If you need only Wikipedia, allowlist it.

## G. Contrarian
Rejects custom HTTP search stacks as the first move (“easiest way”).

## H. Assumptions
**Theirs:** Dodgers 2025, OpenAI storage, golf answer. **Ours:** sports result UNVERIFIED; vendor. Falsifier: wrong store ID silently searching nothing.

## I. Questions
- Code interpreter demo? Mentioned, not shown.
- How filters on the store work?

## J. Connections
- SYSTEM SYNTHESIS → `KVFfApQZhE4` (Gemini analog).
- SYSTEM SYNTHESIS → `lokbsA5VXOk` (OpenAI leveled up n8n).
- SYSTEM SYNTHESIS → `info-gain-cite`.

## K. Future-Use
Unassigned: allowlist vs private-store chooser for any research ask.

## Steal / Operate-never

### Machine: pick the search scope before the question
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** is this live-world, allowlisted sites, or our file? → enable only that tool → ask → keep citations → stop
- **Questions / signals:** Does the answer need “this year”? Do we already have the PDF?
- **Qualify / frame / objections:** Open web is not a vault. Vault is not the news.
- **Procedure:** One tool on at a time in his demos. Cite.
- **Example that proves it:** World Series vs golf ball (E).
- **Why it works:** Scope mismatch is how agents hallucinate a store or a season (B/C).
- **Conditions / exceptions:** On-tape vendors. Hive uses Researcher + Grok, not OpenAI install.
- **Operate-never payload:** OpenAI as hive; quote Dodgers/2025 as FACT; quit-job.
- **Hive run:** `info-gain-cite` · `context-docs` · Researcher packet
- **Source:** `QrJhdTbK3TU` @ UNKNOWN

### Operate-never
- Install OpenAI / switch stack.
- Quote on-tape sports or $ as FACT.
- Employment send. Quit-job. Unpark clients.
- Merge LESSONS. Auto-write `SKILL.md`.

## L. Role-Specific Applications
Employment still covers baseline. Career analog: live market chatter vs the vault of what we actually ran — do not mix scopes in a gym answer. Citations stay on. Clients parked.
