# Researcher — QrJhdTbK3TU
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/QrJhdTbK3TU/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/QrJhdTbK3TU/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
OpenAI Responses-API tools short (web search + file search). Beats: (1) Agent + OpenAI chat model; API key if needed. (2) Toggle **use responses API** → built-in web search, file search, code interpreter. (3) Web: context size low/medium/high; allowed domains (Google/LinkedIn/Wikipedia). (4) Run: “who won the World Series this year” → LA Dodgers 2025 over Blue Jays in seven; cites sites. (5) File search: same Responses API; web off; needs vector store ID + filter; create store at platform.openai.com storage; paste ID as array. (6) Ask: what if a ball at rest moves in golf — answer depends on what caused the move. (7) Play-button. Timestamp UNKNOWN. OpenAI on-tape. 2025 Series result UNVERIFIED.

## B. Atomic Knowledge

### Responses toggle unlocks built-in tools
- **Claim:** The Responses API toggle is what adds web search / file search / code interpreter to the OpenAI chat model node.
- **Reasoning:** Without it you just have a brain; with it the brain can search.
- **Mechanism:** Credential → toggle → optional domain allow-list + context size → run.
- **Evidence:** World Series answer with source sites.
- **Conditions:** OpenAI key; n8n OpenAI chat model node.
- **Exceptions:** Domain allow-list can hide the true source (if you only allow Wikipedia, etc.).
- **Action:** Steal allow-list + cite-the-sites. Do not treat 2025 Series as FACT.
- **Confidence:** high as a node lesson.
- **Source:** `QrJhdTbK3TU` @ UNKNOWN
- **Epistemic:** SOURCE

### File search is a store ID, not “the files in n8n”
- **Claim:** File search needs a vector store ID (and filter) created in OpenAI storage, pasted as an array.
- **Reasoning:** Same console as the API key.
- **Mechanism:** Create store → copy ID → node array → ask a doc question (golf rules).
- **Evidence:** Ball-at-rest answer depends on cause.
- **Conditions:** Files already uploaded to that store.
- **Exceptions:** This is vendor RAG, not the Drive→Supabase path (`Fu6vOfzFmcw`). Do not flatten.
- **Action:** Know the two RAG paths exist; operate neither without Evens.
- **Confidence:** high as wiring.
- **Source:** `QrJhdTbK3TU` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Search is a toggle + policy (domains, context size), not a second agent. Citations are the prove. File search is a foreign store ID.

## D. Procedures
1. If using this node at all (on-tape): key in credential, not chat.
2. Toggle Responses; set context size; optionally allow-list domains.
3. Require cited URLs on web answers.
4. For files: create store in vendor console; paste ID array; ask a gold Q.
5. Hive: do not add OpenAI.

## E. Examples
- **Situation:** World Series winner. **Action:** Web search on, run. **Reasoning:** Needs live facts. **Outcome:** Dodgers 2025 + sites. **Lesson:** Cite sites. Implicit rule: “this year” is a live query — date the tape.
- **Situation:** Golf rest-move rule. **Action:** File search + store ID. **Reasoning:** Closed corpus. **Outcome:** Depends on cause. **Lesson:** Store ID is the corpus.

## F. Decision Rules
- If web → citations + optional domain list.
- If files → store ID array, not “whatever is in Drive.”
- Refuse: OpenAI as hive; quote Series or “easiest” as FACT.

## G. Contrarian
You do not need Tavily/Perplexity (`rXpHzWXjHrw`) if you accept OpenAI built-ins — two incompatible stacks on adjacent shorts. Keep both; do not flatten to one “Nate search tool.”

## H. Assumptions
Dodgers 2025 is true-on-tape only. Golf file is in the store. Code interpreter mentioned, not demoed.
**Desk dissent:** none yet. Disagreement with Tavily-path shorts stored in G.

## I. Questions
- What does the filter field do?
- Code interpreter example?

## J. Connections
- **SYSTEM SYNTHESIS:** `irg-2IfAjpo` Gemini file search. `Fu6vOfzFmcw` Drive→Supabase. `info-gain-cite`. Do not merge RAG paths.

## K. Future-Use
Domain allow-list + cite-sites as unassigned web-tool policy.

## Steal / Operate-never

### Machine: toggle-search-allowlist-cite
- **Epistemic:** SOURCE
- **Workflow / loop:** enable search tool → set context + optional domains → ask → require citations → (files) bind a store ID → gold Q
- **Questions / signals:** Are sources listed? Which store ID? Did we mix Drive RAG with this?
- **Qualify / frame / objections:** “Easiest” → still a vendor store and a key.
- **Procedure:** D.
- **Example that proves it:** Series + citations; golf rest-move from file store.
- **Why it works:** Policy (domains/size) + a bound corpus.
- **Conditions / exceptions:** OpenAI Responses on-tape. Other tapes use other search tools.
- **Operate-never payload:** OpenAI as hive; quote Series as FACT; new ICP.
- **Hive run:** `info-gain-cite` · `golden-test-loop`
- **Source:** `QrJhdTbK3TU` @ UNKNOWN

**Operate-never**
- OpenAI keys in hive. New `icp_id`. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
Keep OpenAI-built-in vs Tavily vs Drive-Supabase as three unlabeled-as-one paths. No stack add.
