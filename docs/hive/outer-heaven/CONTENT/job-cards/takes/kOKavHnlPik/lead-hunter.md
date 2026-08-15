# Lead Hunter — kOKavHnlPik
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/kOKavHnlPik/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/kOKavHnlPik/LEARNED.md`
**ICP:** parked unless Evens named one.
**Tape:** Once You Know This, Building RAG Agents Becomes Easy in n8n
**Walk:** full.txt entire. Role did not filter A–K. Hunt skipped. No clients. No new `icp_id`. No `HUNT_LOG`. No Normand.

## A. Source Map
- ‘Agent wrong’ → he asks: what questions, what must it look at. Four methods: filters, SQL, full context, vector. People jump to vectors. Chunk RAG loses doc/URL/timestamp unless metadata; ‘summarize the video’ only sees hit chunks. Tabular: ‘highest sales week’ / AOV from one chunk misses weeks 4/14/19 (15583 demo UNVERIFIED). Filter+calc: Bluetooth speakers on Sep 16 = 5 (product filter + date + calculator). Beginner rule: if a human would filter a sheet, filter. Tell the agent valid enums. School template. SQL still needs column names + examples.
- **Gaps:** Captions only in full.txt; visual UI / audio demos not fully described. Timestamps UNKNOWN unless a quote locus is marked. CTA “play button / full breakdown” is capture, not a second source.

## B. Atomic Knowledge
### Match retrieval to the question; vectors lose the table
- **Claim:** Start from the questions and what must be in view; if a human would filter a sheet, do not chunk it — a vector ‘highest week’ answer can be locally true and globally false.
- **Reasoning:** Chunks are cheap/fast and context-blind. Enums in the prompt make filters work.
- **Mechanism:** Classify Q → filter/SQL/full/vector. Gold-question the number. Do not hunt RAG buyers. Do not quote 15583 as FACT.
- **Evidence:** SOURCE: ‘they immediately run straight to a vector database.’ ‘week four we actually had higher sales.’ ‘if a human would use filters in a spreadsheet, then use filters.’ School CTA.
- **Conditions:** You have a question type, not a client.
- **Exceptions:** n8n-on-tape. Demo rows UNVERIFIED.
- **Action:** Steal question→method + enum-in-prompt. Do not hunt. Do not trust chunk math.
- **Confidence:** high
- **Source:** `kOKavHnlPik` @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
- SOURCE: End goal and question types first.
- SOURCE: Summarize-whole-doc is a full-context job.
- SOURCE: Calculator after filters, not inside the chunk.

## D. Procedures
- Ask what Qs and what must be visible. If tabular extrema/averages, forbid chunk-only. Put valid product/date enums in the prompt.

## E. Examples
- Situation: Bluetooth on Sep 16. Action: name filter + date filter + calc. Reasoning: human-in-sheet. Outcome: 5. Lesson: steal filter+calc; park vector-first.

## F. Decision Rules
- If the Q is max/avg over a table, do not vector.
- If enums are missing, filters hallucinate.
- If CTA is School, capture only.

## G. Contrarian
- Rejects vector-first as the default RAG.

## H. Assumptions
- Row counts / 15583 / 5 UNVERIFIED.

## I. Questions
- When does he still pick vectors? Excerpt promises four methods, middle thins.

## J. Connections
- SYSTEM SYNTHESIS: `QCjMBOEhpLE` table+calc. `QojPKL96Dx4` cite. `ZwQ8rJhVCr4` filter/SQL vs vector.

## K. Future-Use
- Unassigned: question-type → retrieval-method card.

## Steal / Operate-never

### Machine: Question type picks the retrieval
- **Epistemic:** SYSTEM SYNTHESIS
- **Workflow / loop:** Wrong-answer complaint → what Qs / what view? → filter|SQL|full|vector → gold-check the number → checkable stop = no hunt.
- **Questions / signals:** Would a human filter a sheet? Did we give enums?
- **Qualify / frame / objections:** Frame: not all RAG is vectors. Objection: ‘easy RAG so we hunt’ → never.
- **Procedure:** Do not join School. Do not quote 15583 as FACT.
- **Example that proves it:** Situation: highest-week chunk miss vs Bluetooth 5. Action: filters+calc. Reasoning: human sheet. Outcome: right 5, wrong max-if-chunked. Lesson: steal method-pick.
- **Why it works:** From B: chunk max can be locally true.
- **Conditions / exceptions:** Small tables. Exception: do not invent a fourth method as a new skill file.
- **Operate-never payload:** Hunt RAG buyers. Quote demo $ as FACT. Vector a sales table.
- **Hive run (existing skills only):** `golden-test-loop`. No n8n-cloud.
- **Source:** `kOKavHnlPik` @ UNKNOWN


### Operate-never
- New `icp_id`, named client, `HUNT_LOG` row, or unpark Normand. Learning ≠ hunt.
- Auto-dial, OTP / Instagram farms, fake identity, mass-DM, betting, OFM.
- MUST-score a raw 50. Send / pay / deploy / book / publish without HITL.
- Quote on-tape $ / student counts / job-loss % as FACT. Tape money stays UNVERIFIED.
- Install on-tape vendors (Vapi, Claude Code, Codex, ChatGPT, Gemini, Hostinger, School, n8n-cloud). Stack stays Cursor + Grok.
- Auto-write a new `SKILL.md`. Merge `LESSONS-FROM-TAPE.md`. Grok Bot / `sendPrompt`.
- Hunt RAG buyers. Join School. Quote 15583 as FACT. Vector-first on tables.

## L. Role-Specific Applications
- Hunt is skipped this walk. Do not open a 50, a named URL, or a Path A from this tape.
- Keep A–K global. Do not hide the stolen machine in L.
- Steal question→method. Do not hunt. Gold-check numbers. No new icp_id.
- Hard step stays HITL: this desk drafts; Evens sends.
