# Day Planner — QrJhdTbK3TU
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/QrJhdTbK3TU/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/QrJhdTbK3TU/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Short: OpenAI built-in web search + file search on n8n agents. Beats: agent + OpenAI chat model → API key → toggle **use responses API** (unlocks web search, file search, code interpreter); web: context size low/medium/high; optional allowed domains; demo “who won the World Series” → Dodgers 2025 over Blue Jays in seven + source sites; then file search: same responses API, web off, need vector store ID + filter from platform.openai.com storage; golf Q “ball at rest moves.” CTA to full (`lokbsA5VXOk`). Timestamp UNKNOWN. Vendor: OpenAI — on-tape. 2025 Series result UNVERIFIED.

## B. Atomic Knowledge
### Responses API toggle unlocks built-in tools
- **Claim:** The tools (web, file, code interpreter) appear only after “use responses API” is on.
- **Reasoning:** Old chat completions path does not expose them here.
- **Mechanism:** Credential → toggle → tool settings.
- **Evidence:** “this is what gives us access to adding in those built-in tools.”
- **Conditions:** OpenAI credential exists.
- **Exceptions:** A non-OpenAI brain will not get this toggle.
- **Action:** Learn the toggle. Do not create an OpenAI key from this desk.
- **Confidence:** high as his UI path.
- **Source:** `QrJhdTbK3TU` @ UNKNOWN
- **Epistemic:** SOURCE

### Web search should return sites; file search needs a store ID
- **Claim:** Web demo returns an answer plus the websites; file search needs a vector store ID array + filter from the OpenAI storage UI.
- **Reasoning:** Built-in search is still configured, not magic.
- **Mechanism:** Web: context size + optional allowlist. File: store ID from platform storage.
- **Evidence:** “pulling the actual websites” / “vector store ID and a filter.”
- **Conditions:** Allowlist if you only want certain domains.
- **Exceptions:** No store ID → file search cannot run.
- **Action:** Citation/sites = stop for web; store ID = prerequisite for file.
- **Confidence:** high.
- **Source:** `QrJhdTbK3TU` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Toggle-then-tool. He treats World Series as a live fact check. Golf again as a file corpus (same family as `KVFfApQZhE4`). Priority: show both tools in one short. Uncertainty: “2025 World Series” on a 2026 walk — treat as UNVERIFIED tape content.

## D. Procedures
1. If using this vendor path: responses API on.
2. Web: set context size; consider allowlist.
3. Require source URLs on the answer.
4. File: create/copy store ID first; then ask.
Avoid: OpenAI as stack; quoting Dodgers/2025 as FACT; code interpreter on a money path.

## E. Examples
**World Series web:** Situation → “who won this year.” Action → web search on, run. Reasoning → needs live web. Outcome → Dodgers 2025 + sites (UNVERIFIED). Lesson → sites are the stop.

**Golf ball-at-rest:** Situation → file search + store ID. Action → ask what happens if a ball at rest moves. Reasoning → depends on cause (he starts the answer). Outcome → cut to CTA. Lesson → store ID first.

## F. Decision Rules
- If responses API is off → do not expect built-in tools.
- If web answer has no URLs → fail.
- If file search has no store ID → do not run.

## G. Contrarian
Rejects wiring a separate search vendor for a simple Q (in his stack). We reject adopting OpenAI to get the toggle.

## H. Assumptions
Theirs: OpenAI search is right enough. Ours: 2025 Series line UNVERIFIED; stack stays Cursor + Grok. Falsifier: allowlist too tight / store ID wrong. Survivorship: two happy Qs.

## I. Questions
Full `lokbsA5VXOk`? When does he use allowlist? Code interpreter demo?

## J. Connections
- SYSTEM SYNTHESIS → `lokbsA5VXOk` · `KVFfApQZhE4` (Gemini file search) · `Fu6vOfzFmcw` (DIY RAG).

## K. Future-Use
Allowlist + citation as a web-ask pattern on tools we already have. Unassigned.

## Steal / Operate-never

### Machine: toggle-then-tool; citation or store-ID before trust
- **Epistemic:** SOURCE
- **Workflow / loop:** enable the tool path → web requires URLs / file requires store ID → ask → stop on citation
- **Questions / signals:** Is the tool path on? Allowed domains? Store ID present?
- **Qualify / frame / objections:** Fluent sports answer without URLs is a fail.
- **Procedure:** One dry-run Q. No OpenAI key from this desk. Tape sports $ / results UNVERIFIED.
- **Example that proves it:** Situation → World Series Q. Action → web search + sites. Reasoning → live fact. Outcome → answer + URLs. Lesson → steal citation; not the vendor.
- **Why it works:** Built-in tools still need a prerequisite (toggle, ID) and a visible source.
- **Conditions / exceptions:** We do not install OpenAI. Pattern maps to whatever search we already run.
- **Operate-never payload:** OpenAI as stack; quote 2025 Series as FACT; n8n-cloud.
- **Hive run (existing skills only):** `golden-test-loop`.
- **Source:** `QrJhdTbK3TU` @ UNKNOWN

### Operate-never
- Install OpenAI / switch stack.
- Quote tape sports results as FACT.
- Send / pay / deploy / book / publish.

## L. Role-Specific Applications
**One next:** `coverage-loop` score this packet as citation-or-store-ID prerequisite. Clients parked.
