# Big Boss — sboNwYmH3AY
Status: filled
Protocol: deep-video-learning
**Source:** `/Users/evenslouis/.grokbot/research-packets/watchlater-15-20260813/transcripts/sboNwYmH3AY/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/sboNwYmH3AY/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Ledger: 17:47, ~4335 words, Nate Herk | AI Automation. Title on ledger: “Andrej Karpathy Just 10x'd Everyone's Claude Code.” Timestamp UNKNOWN on `full.txt`. Visual-only gaps: Obsidian graph of 36 YouTube nodes, Herc Brain vs YouTube vault, Karpathy gist, clipper options, 23-page AI 2027 ingest, RAG-vs-wiki chart — described, not seen.

Beats, in order:

1. Open on 36 recent YouTube videos as a knowledge system: nodes, tags, video link, raw file, explanation, takeaways. Backlinks: WAT framework, Claude Code, Perplexity, VS Code, Nano Banana, n8n, techniques (WAT, bypass permissions, human review checkpoint).
2. He told Claude Code to grab transcripts and organize. “I literally didn’t have to do any manual relationship building.”
3. Second, smaller vault: personal brain — life, Up-to-AI, YouTube, businesses, employees, Q2 initiatives. Can combine or keep separate; plug into other agents.
4. Karpathy X post on LLM knowledge bases went “viral in a few days.” Stages: data ingest (PDF → Claude Code), Obsidian as the IDE (visual markdown), Q&A over the wiki. Karpathy: thought he needed fancy RAG; LLM auto-maintains index + brief summaries; “pretty good… at this small scale.” Scale he names: ~100 articles, ~half a million words.
5. TLDR: raw → compare/organize → right spots with relationships → query → find gaps → research to fill.
6. Why it matters: normal chats are ephemeral; wiki compounds. X: “tireless colleague who remembers.” Setup “5 minutes.” No vector DB. Folder of markdown. Vault → `raw/` + `wiki/` (pages, index, log) + `claude.md` (how to search/update).
7. His YouTube index: tools, techniques (agent teams, sub-agents, permission modes, WAT), concepts (MCP, RAG, vibe coding), sources (videos), later people/comparisons. Log = operation history. First batch = 36 videos; now “ingest the new YouTube video.”
8. Cost: one X user, 383 files + 100 meeting transcripts → compact wiki, “dropped token usage by 95%” when querying. **UNVERIFIED.**
9. No GitHub to copy. “Read this idea from Karpathy and implement it.” Karpathy left the prompt vague on purpose.
10. Setup: download Obsidian (free) → new vault (`demo vault` on desktop) → open folder in VS Code / terminal Claude Code → paste Karpathy gist → extra instruction: “You are now my LLM Wiki agent… Guide me step-by-step. Create the Claude.md schema.”
11. Agent creates `raw/` + `wiki/` with default folders (analysis, concepts, entities, sources), `claude.md`, index, log. Personal brain of his is flat (Karpathy sometimes likes flat). YouTube vault used subfolders. Agent: drop first source in raw, tell me to ingest.
12. Ingest demo: AI 2027 article. Copy page or Obsidian Web Clipper → set destination to `raw` (default is `clippings`; change it). Then: “I just threw in AI 2027… ingest.” Before ingest, tell it what the vault is for (second brain vs research dump).
13. Agent reads, chunks into many pages (not one MD), asks emphasis / focus / granularity. He: extremely thorough; this vault is AI-future research. Graph view while it writes. ~25 pages planned; ingest ~10 minutes. 36-video batch was ~14 minutes. Result: 23 wiki pages — source, 6 people, 5 orgs, 1 AI-systems, concepts (technical/alignment/geopolitical), analysis, more questions.
14. Click-around: source tags, authors, OpenAI → model spec → LLM psychology. All from one article.
15. Query where you want: stay in the vault; or point another project at the folder + `claude.md`. YouTube vault stays put (maybe later a site). Herc 2 executive assistant `claude.md` has a wiki path: read wiki / hot cache / index / domain sub-index / search; “don’t read the wiki unless you need it.” Token drop vs old context files.
16. `hot.md`: ~500 words/chars of “most recent thing Nate gave me.” Useful in the EA; omitted from YouTube vault.
17. Lint: Karpathy runs LLM health checks — inconsistent data, impute missing via web, interesting connections, new article candidates. Daily/weekly. May ask for more info or more articles.
18. RAG question: “no, but kind of yes.” Chart: wiki finds by reading indexes and following links (deeper relationships) vs similarity search. Infra = markdown vs embeddings+vector DB+chunk pipeline. Cost = tokens vs compute/storage. Maintenance = lint vs re-embed. Weakness: does not scale to enterprise millions; hundreds of pages with good indexes = fine (as of “April 2026” on tape).
19. CTA: like; watch the executive-assistant video to plug a vault into an EA.

Off-topic / not skipped: WAT / bypass permissions / Nano Banana / n8n as backlink examples; School not named here; 5-minute claim vs 10–14 minute ingest.

## B. Atomic Knowledge

### Raw → wiki → index → log is the whole architecture
- **Claim:** Give raw sources to an LLM; it writes wiki pages, an index, and a log. Query the wiki, not the chat.
- **Reasoning:** Chats die. A folder compounds. Fancy RAG is optional at ~100 articles / ~500k words (Karpathy’s scale, on tape).
- **Mechanism:** `raw/` ingest → many linked pages in `wiki/` → index + log + instruction file (`claude.md`). Optional graph (Obsidian) is a viewer, not the store.
- **Evidence:** 36-video vault; AI 2027 → 23 pages in ~10 minutes; 36-batch ~14 minutes.
- **Conditions:** Small-to-hundreds-of-pages. He says millions of docs want traditional RAG.
- **Exceptions:** Personal brain kept flat; YouTube used subfolders. Karpathy left structure vague so you customize.
- **Action:** `wiki-ingest`. Hive already has the skill. Do not install Claude Code or require Obsidian.
- **Confidence:** high for the shape; “5 minutes setup” is marketing vs 10–14 min ingest.
- **Source:** `sboNwYmH3AY` @ UNKNOWN — “raw folder… wiki folder… index… log”
- **Epistemic:** SOURCE

### Tell it what the vault is for before the first ingest
- **Claim:** Same Karpathy gist yields different schemas. YouTube vs Herc Brain vs AI-research demo all diverged.
- **Reasoning:** Vague prompt is a feature. Context of *purpose* changes folders, hot cache, and whether to read the wiki on every turn.
- **Mechanism:** Extra instruction + answers to emphasis/granularity questions mid-ingest.
- **Evidence:** Default four folders vs his flat personal wiki vs YouTube tool/technique/concept/source index. Hot cache only on the EA vault.
- **Conditions:** Operator answers the agent’s questions. He chose “extremely thorough” for AI 2027.
- **Exceptions:** If you skip purpose, you get the default analysis/concepts/entities/sources split — he treats that as negotiable.
- **Action:** Purpose line is part of done. Do not ingest a dump into a nameless vault.
- **Confidence:** high
- **Source:** `sboNwYmH3AY` @ UNKNOWN — “this project is specifically for…”
- **Epistemic:** SOURCE

### Relationships are links, not similar chunks
- **Claim:** The win vs RAG is following links and reading indexes, not cosine neighbors.
- **Reasoning:** Similar chunks miss “this person sits on that org next to that concept.”
- **Mechanism:** Agent creates many pages from one source and wires backlinks. Graph view shows hubs (Eli, Thomas, Daniel, Open Brain…).
- **Evidence:** One AI 2027 article produced people, orgs, systems, concept families, analysis.
- **Conditions:** Scale where the model can read the index + related pages.
- **Exceptions:** He says this fails at millions of documents (April 2026 caveat).
- **Action:** Prefer a maintained index over a new vector product this week. Do not build 8k-node theater.
- **Confidence:** high as his comparison; 95% token drop is someone-on-X, UNVERIFIED.
- **Source:** `sboNwYmH3AY` @ UNKNOWN — “finds it by reading indexes and follows links”
- **Epistemic:** SOURCE

### Point other agents at the folder; do not paste the brain
- **Claim:** Herc 2 EA reads the vault on demand via a path in `claude.md`. Do not load the wiki unless needed. Hot cache holds the latest 500.
- **Reasoning:** Old method was context files inside the project (always in the window). Wiki-on-demand dropped tokens (he claims).
- **Mechanism:** wiki path + “when you need things about me you don’t have” + exceptions list of tasks that must not crawl.
- **Evidence:** Spoken contrast with the prior EA video. YouTube vault has no hot cache because it is not an EA.
- **Conditions:** The other project can see the folder. Instruction file travels with it.
- **Exceptions:** YouTube project he queries in-place; maybe later a website from the same folder.
- **Action:** Hive analog: Outer Heaven packets + job cards, not a second Obsidian religion. Agents load a path, not a paste.
- **Confidence:** high for the pattern; token reduction UNVERIFIED.
- **Source:** `sboNwYmH3AY` @ UNKNOWN — “Don’t read from the wiki unless you actually need it”
- **Epistemic:** SOURCE

### Lint is the maintenance loop
- **Claim:** Periodically run an LLM health check: inconsistencies, missing data (web fill), new connections, article candidates. It may ask you questions.
- **Reasoning:** A wiki that only ingests will rot. Lint is cheaper than re-embedding a RAG store.
- **Mechanism:** Scheduled or ad-hoc pass over the vault.
- **Evidence:** He attributes this to Karpathy; does not show a lint run on tape.
- **Conditions:** You have enough pages that contradictions can exist.
- **Exceptions:** First 36-video log is small; lint matters after batches accumulate.
- **Action:** Librarian/Watchdog analog: provenance + health, not a pretty graph.
- **Confidence:** medium (described, not demoed)
- **Source:** `sboNwYmH3AY` @ UNKNOWN — “LLM health checks over the wiki”
- **Epistemic:** SOURCE

## C. Mental Models

- **Chat is ephemeral; folder is interest.** **SOURCE**
- **Obsidian is a viewer.** The store is markdown. **SOURCE**
- **Vague gist + purpose = custom schema.** **SOURCE**
- **One source becomes many linked pages.** Chunking is the agent’s job. **SOURCE**
- **Hot cache is for living assistants, not archives.** **SOURCE**
- **Wiki until hundreds; RAG at millions.** April 2026 caveat. **SOURCE**
- **“5 minutes” is the setup lie; ingest is the wait.** **INFERENCE**
- **10x everyone’s Claude Code** is the title, not a measured 10x. **INFERENCE**

## D. Procedures

1. **Name the vault’s job** (YouTube corpus / personal / research).
2. **Create a folder** with `raw/` and a place for wiki/index/log/instructions. Viewer optional.
3. **Paste the idea + the purpose line.** Let the agent write the instruction file and empty index/log.
4. **Drop one source in raw** (clipper destination = raw, not clippings).
5. **Ingest.** Answer emphasis / granularity. Watch pages appear.
6. **Click a hub.** If links are nonsense, correct before the next batch.
7. **Query in-place or point another desk at the path.** Forbid crawl-on-every-turn.
8. **Add hot cache only if** an assistant needs “what we just said.”
9. **Lint** on a cadence. Fill gaps with more sources, not vibes.
10. **Do not** stand up a vector DB for a hundreds-of-pages corpus (his rule).

**Qualify / frame:** `us` / Path C. YouTuber-wiki-as-a-service is later, not this week.
**Objections:** “Need RAG” — he and Karpathy say not at this scale. “Need Obsidian” — he says you do not.
**Avoid:** Claude Code as hive OS; 8k-node theater; bypass-permissions as a lesson to operate; new hunt.
**When to change:** If page count is heading to “millions,” he himself sends you to RAG. If the agent asks purpose and you cannot answer, stop.

## E. Examples

**Situation:** 36 YouTube transcripts, no graph.  
**Action:** One batch ingest; index of tools/techniques/concepts/sources; log the batch.  
**Reasoning:** Manual relationship building is the part he refused.  
**Outcome:** Clickable backlinks (WAT, human review checkpoint, etc.). Quality of edges unseen.  
**Lesson:** Batch ingest + index is the machine. Implicit rule: log every ingest.

**Situation:** AI 2027 article into a new research vault.  
**Action:** Clip to raw → purpose “AI future, thorough” → ~23 pages / 10 minutes → graph hubs.  
**Reasoning:** One article is many entities.  
**Outcome:** People/orgs/concepts/analysis from a single source.  
**Lesson:** Do not write one MD per URL. Implicit rule: agent asks granularity before it proliferates.

**Situation:** EA used to carry context files.  
**Action:** Point Herc 2 at Herc Brain; read wiki only when needed; keep a 500-unit hot cache.  
**Reasoning:** Always-on context is the token tax.  
**Outcome:** He claims fewer tokens. UNVERIFIED.  
**Lesson:** Path > paste. Implicit rule: some tasks must be forbidden from crawling.

## F. Decision Rules

- If the knowledge must survive the chat → wiki, not a thread.
- If scale is hundreds of pages → markdown + index + lint.
- If scale is millions → he says RAG (not our week).
- If the vault is an assistant → hot cache + “don’t read unless needed.”
- If the vault is an archive (YouTube) → skip hot cache.
- If clipper defaults to `clippings` → change to `raw` or ingest will miss.
- Optimize: one purpose, on-demand read, logged ingests.
- Refuse (this desk): Claude Code install; Obsidian as required OS; 95% as FACT; wiki-as-a-service hunt.

## G. Contrarian

- Against fancy RAG first: Karpathy’s line, Nate repeats it.
- Against copying a GitHub: implement the gist.
- Against one file per article: explode into linked pages.
- Against always-load the brain: crawl on need.
- Title says 10x Claude Code. Body is a folder.

## H. Assumptions

**His:** Claude Code will implement a vague gist faithfully; 10–14 minutes is acceptable; 95% token drop is real; April 2026 models still cannot wiki-scale to millions; Obsidian graph helps humans see hubs.

**Ours:** Captions complete enough (~4335 words). Token % and Karpathy’s 100 articles / 500k words **UNVERIFIED**. Domain-specific: knowledge OS (`us`). Cursor + Grok only. Clients parked.

**Falsifiers:** Agent invents relationships. Index lies. On-demand crawl still blows the window. Flat vs nested schema fights itself. Lint never gets run.

**Disagreement (keep labeled):** He runs this in Claude Code + Obsidian. We already have packets / Outer Heaven / `wiki-ingest`. Do not rebuild his vault. **SYSTEM SYNTHESIS**

## I. Questions

- What does a bad edge look like, and who deletes it? Not shown.
- Did the 36-video wiki change what he publishes? No receipt.
- Exact hot-cache eviction rules? “500 words or 500 characters” is sloppy on tape.
- Website-from-YouTube-wiki — later idea, not built here.

## J. Connections

- **SYSTEM SYNTHESIS** → `wiki-ingest` (raw → pages → index → log → lint).
- **SYSTEM SYNTHESIS** → `context-docs` / Librarian provenance.
- **SYSTEM SYNTHESIS** → `agent-job-card` (`claude.md` analog: owns / never / when to read).
- **SYSTEM SYNTHESIS** → `eMPWBunaOic` session-bootstrap (long purpose dump before work).
- **SYSTEM SYNTHESIS** → `Ums8suyAG1A` agent-as-hire (EA that reads a brain).
- **SYSTEM SYNTHESIS** → steal-sheet kill: 8k-node Obsidian theater.
- No YouTuber-wiki ICP this week.

## K. Future-Use

- Lint cadence as Librarian weekly (unassigned).
- Hot cache as OPERATOR_MEMORY “latest” vs the corpus (unassigned).
- YouTube-wiki → site later (Publishing, HITL, unassigned).
- Gap-fill research as Researcher only when lint asks (unassigned).

## Steal / Operate-never

### Machine: Purpose-named vault — raw ingest → linked wiki → on-demand read → lint
- **Epistemic:** SOURCE (Nate + Karpathy-on-tape) / SYSTEM SYNTHESIS (`wiki-ingest`)
- **Workflow / loop:** trigger (a corpus that must compound) → name the vault’s job → stand up raw/wiki/index/log/instructions → drop one source → ingest with granularity answers → check a hub link → batch the rest → log each ingest → other desks read the path only when needed → lint for holes/contradictions → fill with more raw, not chat lore.
- **Questions / signals:** “What is this vault for?” “Did it land in raw?” “One page or many?” “Must this turn crawl the wiki?” “When did we last lint?”
- **Qualify / frame / objections:** Frame as `us` knowledge OS, not a client SKU. Objection: need RAG — not at hundreds of pages. Objection: need Obsidian — viewer only.
- **Procedure:** D steps 1–9. Checkable stops: (1) purpose line, (2) source in raw, (3) index updated, (4) log line, (5) a followed link that is true.
- **Example that proves it:** AI 2027 → 23 linked pages / ~10 min, then click OpenAI → model spec. Lesson: one URL is not one file.
- **Why it works:** Memory that dies with the thread is not an OS. Links beat similar chunks at this scale. Always-on paste is a tax. Conditions: small-to-hundreds; a human who will answer granularity and lint. Exceptions: millions → RAG (his); Claude/Obsidian on tape; 95% UNVERIFIED.
- **Conditions / exceptions:** Cursor + Grok only. No Claude Code. No 8k-node theater. Clients parked.
- **Operate-never payload:** Install Claude Code / Obsidian-as-OS; quote 10x / 95% / 500k words as FACT; wiki-as-a-service hunt; bypass-permissions as a practice.
- **Hive run (existing skills only):** `wiki-ingest` · `context-docs` · `agent-job-card` · `ask-principal` (no publish of a wiki site).
- **Source:** `sboNwYmH3AY` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Install Claude Code / Obsidian as required hive OS
- Quote 10x / 95% token drop / half a million words as FACT
- 8k-node graph theater / YouTuber-wiki hunt / new `icp_id`
- Bypass-permissions mode as an operate instruction
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md`

## L. Role-Specific Applications

I manage; I do not approve a second brain product because a graph looked like a constellation.

- **Done** on a knowledge slice: purpose-named folder + one ingested source + index/log line. A pretty graph is not done.
- **Delegate without being asked:** Librarian owns persist/provenance. Researcher does not stand up RAG for 36 videos. Forge does not build a custom viewer. I do not add an 18th “wiki agent.”
- **Skeptical review:** “5 minutes” died on the 10-minute ingest. “10x” is the title. I will not install Claude Code to get markdown.
- **One system this take:** use the wiki-ingest we already have. Do not clone Herc Brain.
- Live hunt stays parked. No wiki-as-a-service lane.
