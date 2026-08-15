# Big Boss — hQvwMj7IJe4
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/hQvwMj7IJe4/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/hQvwMj7IJe4/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Long (PACKET: 14:35, 3719 words, captions `en-orig` json3). Timestamp UNKNOWN on `full.txt` (no VTT in the take). Visual-only gaps: Obsidian graph of YouTube videos, Fable HTML “beginner” site vs the Opus-all-day site, 6-month story (subscriber/revenue/churn — revenue **blurred**), Karpathy gist, raw/wiki/index/log after two-source ingest (20 pages).

Beats, in order:

1. Cold open: YouTube videos ingested into an LLM wiki. Relations connect them. He did not wire the concepts; he told Claude Code to grab videos and ingest. Graph grows.
2. Open a node (Nano Banana two websites): summary, takeaways, tools, techniques; follow GitHub → Vercel → Claude Code backlinks.
3. Thesis: impressive part is not that Fable ingested — it is what Fable does **after** the data exists. “Data is king, context is king.”
4. One prompt: turn the messy transcript blob into something a beginner can click without overwhelm. Fable returns HTML: ideas → routines → deterministic vs agentic → n8n / Claude Code. He likes this more than the graph.
5. Contrast: **same backend database**, Opus 4.8 for “almost a full day,” back and forth — he would not share it; felt overwhelming/confusing. Fable understood an *emotional* brief (“beginner… wouldn’t overwhelm”).
6. Click a concept: right rail shows source videos, text, links. Small example.
7. He runs **several** wikis in the AIOS: YouTube transcripts; **Herk brain** = meeting recordings (internal/external) so concepts evolve; used when scripting community/LinkedIn/email.
8. Pre-tape ask: “tell me a story about the past 6 months” / visual journey of 2026. One shot: his photo, logo, AIS-like dark/blue branding, subscriber gain, **highest revenue month (blurred)**, pivot from n8n-only content to Claude Code content, views/revenue after pivot, churn, conversion, a second “thinking” photo, full business funnel. Point: more data, **routed right**.
9. CTA: free AIOS course in Skool.
10. Origin: Karpathy tweet/gist — LLMs build personal knowledge bases; index sources; Obsidian as front end.
11. Setup: install Obsidian → new vault (he usually puts vaults **inside** Herk2, split by topic; demo vault on Desktop) → open vault in VS Code/terminal → Claude. Aside: Fable on subscription only until July 7, then credits; Thor tweet + blog: they plan to bring it back. **Dated / UNVERIFIED.**
12. Copy **entire** Karpathy gist + screenshot. Prompt: you are my LLM wiki agent; implement this exact idea; guide step by step; create claude.md schema with full rules; index, log, folder conventions; first ingest example; every interaction follows the schema.
13. Fable is **overkill for ingest**; use Opus to ingest and for future docs; Fable for what you do *after*. He still demos Fable.
14. Structure **follows the data**: YouTube wiki grew comparisons/concepts/sources/techniques/tools. Herk brain stayed **flat** (meetings in one layer) — sometimes flat is better for search. Pattern: `raw/` (you drop) → agent reads → wiki pages (1 source → 5–10 pages) → `index` (TOC) → `log` → markdown pages. Agent incrementally maintains via index, log, backlinks.
15. Fresh vault: ingest of the gist itself; wiki plans concepts/entities/sources.
16. Two-source demo: Fable 5 / Mythos 5 **system card PDF** dropped in `raw/`; OpenAI GPT-5.6 Soul **URL**. Prompt: read + ingest both. ~**10–12 minutes** → **20** cross-linked pages. The wiki-only win: sources reference each other at “Frontier Model Cybersecurity.” OpenAI bench’d Soul against **Mythos Preview**, not Mythos 5; different harnesses — numbers do not line up. Easy to miss if you read them separately.
17. Graph: OpenAI node, government-coordinated releases, layered/competitive-use safeguards; entities (Fable, Mythos, Preview, Opus 4.8, GPT-5.6, Anthropic, OpenAI); log of setup + two ingests.
18. Lesson: routing rules so agents crawl efficiently. `claude.md` as router across projects/business context. After structure exists, add sources, **check** after batch ingest, change folders/rules if it does not make sense **to you and the AI**. Different wikis, different rules (meetings vs proposals).
19. Portability: it is markdown + routing. Not locked to Claude — Hermes, Codex, “whatever.” Sibling “levels of a second brain” video. Like.

Off-topic / not skipped: n8n→Claude content pivot; blurred revenue; Obsidian install wizard; July 7 Fable cliff.

## B. Atomic Knowledge

### Ingest is cheap; routing and after-use are the product
- **Claim:** The flex is not “Fable ate my YouTube.” It is what a model can do once relations and a schema exist — beginner HTML, a 6-month story, a missed cross-lab caveat.
- **Reasoning:** Same DB + Opus all day = unshareable UI. Same DB + an emotional brief on Fable = he ships the HTML. Data without routing is a blob.
- **Mechanism:** raw → wiki + index + log + backlinks; `claude.md` schema as router.
- **Evidence:** 20 pages / 10–12 min; cybersecurity cross-link; 6-month one-shot (revenue blurred).
- **Conditions:** Sources actually land in `raw/`. Schema says how to ingest.
- **Exceptions:** Fable overkill for ingest — he says use a cheaper model there (`XTBWVVcF3Pk`).
- **Action:** `wiki-ingest` already. Do not install Obsidian/Claude to get markdown + an index.
- **Confidence:** high
- **Source:** `hQvwMj7IJe4` @ UNKNOWN — “what Fable can do once you’ve given it the power of all of this data”
- **Epistemic:** SOURCE

### Structure follows the corpus; flat can beat deep
- **Claim:** YouTube wiki grew typed folders. Meeting wiki stayed flat. Deep trees can make search worse.
- **Reasoning:** The agent must crawl. Your eyes must also follow the chain. If a batch ingest organizes badly, change the rules.
- **Mechanism:** Separate wikis by topic (vaults inside the OS). Check after each batch.
- **Evidence:** Side-by-side folder talk. “Make it make sense… not only to the AI, but… to you.”
- **Conditions:** Enough volume for types to appear. Early meeting wiki “didn’t want to organize yet.”
- **Exceptions:** Later sweeps might fold meetings. He allows that.
- **Action:** Do not copy his YouTube taxonomy onto job-cards. Let Outer Heaven structure follow *our* packets.
- **Confidence:** high
- **Source:** `hQvwMj7IJe4` @ UNKNOWN — “sometimes keeping this flat is actually better”
- **Epistemic:** SOURCE

### The wiki earn is the cross-source miss
- **Claim:** Two separate summaries would hide that OpenAI compared to Mythos **Preview** with a different harness. The wiki page is where that lives.
- **Reasoning:** Relations are the point of a wiki vs a folder of notes.
- **Mechanism:** Ingest PDF + URL under one schema; agent writes the connecting page.
- **Evidence:** Spoken “easy to miss reading them separately.” 20 pages from two sources.
- **Conditions:** Sources actually cite each other (or the same entity).
- **Exceptions:** If the agent invents a relation, the check-after-batch is the brake.
- **Action:** Researcher/Librarian: after a batch, open the connecting page and sanity-check. `golden-test-loop`.
- **Confidence:** high for the example; medium that the agent is always right
- **Source:** `hQvwMj7IJe4` @ UNKNOWN — “the two sources reference each other, and Frontier Model Cybersecurity is where that lives”
- **Epistemic:** SOURCE

### Markdown + schema is the lock-out of the vendor
- **Claim:** Pages are markdown. You can point another agent at the same files. Obsidian is a front end Karpathy used, not the moat.
- **Reasoning:** He is a Claude YouTuber and still says this. Matches `XTBWVVcF3Pk` / `brB-hSiV2iU` / Serop (`i4Q8wHZNPBU`) from the other side.
- **Mechanism:** Gist → schema → folders. Graph view is optional (he prefers the beginner HTML).
- **Evidence:** Hermes/Codex line. Obsidian install is a how-to, not the thesis.
- **Conditions:** Schema is followed “every interaction.”
- **Exceptions:** He still demos Fable and Skool AIOS.
- **Action:** Outer Heaven already is the wiki. Do not add Obsidian theater.
- **Confidence:** high
- **Source:** `hQvwMj7IJe4` @ UNKNOWN — “everything in this wiki, it’s just a markdown file… with routing”
- **Epistemic:** SOURCE

### Emotional / audience brief is a taste job, not an ingest job
- **Claim:** “Beginner, not overwhelming, click through” is what Opus-all-day missed and Fable one-shotted — on the **same data**.
- **Reasoning:** Taste sits after the wiki exists. Paying frontier rates to *ingest* is the leak.
- **Mechanism:** One prompt on top of the routed blob.
- **Evidence:** Two UIs, one DB. 6-month story branding “feels like AIS.”
- **Conditions:** The wiki is already there. Brief names the audience fear (overwhelm).
- **Exceptions:** He may be attributing taste to the model when the prompt also changed. **INFERENCE.**
- **Action:** Creative gets the audience brief; ingest stays cheap. No Fable install.
- **Confidence:** medium (same-DB contrast is SOURCE; cause is mixed)
- **Source:** `hQvwMj7IJe4` @ UNKNOWN — “I was able to prompt it in an emotional way”
- **Epistemic:** SOURCE (contrast) / INFERENCE (Fable-as-cause)

## C. Mental Models

- **Context is king only if routed.** **SOURCE**
- **Check the batch; do not trust the first taxonomy.** **SOURCE**
- **One corpus, one wiki; do not mash meetings into YouTube folders.** **SOURCE**
- **Front end is disposable; markdown is not.** **SOURCE**
- **The missed comparison is the receipt.** **SOURCE**
- **Blurred revenue is a magnet, not a number.** **INFERENCE**
- **5-minute setup is a title; 10–12 min was two sources.** **INFERENCE**

## D. Procedures

1. **Copy a schema** (gist / our wiki rules). Every later ingest follows it.
2. **Drop raw** (file or URL). Do not pre-wire relations.
3. **Ingest with a cheap model** unless the after-job is taste.
4. **Require index + log + backlinks** so the next ingest is incremental.
5. **Open the connecting pages.** If the organization is wrong, change rules *before* the next batch.
6. **Split wikis by topic** when crawl/search suffers.
7. **After-use** (story, beginner UI) is a separate prompt on the routed data.

**Qualify / frame:** Wiki-demo tape. Obsidian / Claude / Fable / Skool stay on tape. Revenue blurred = do not quote.
**Objections:** “We need Obsidian to have a second brain” — he ends on markdown. “Fable ingested it” — he says Fable is overkill for ingest.
**Avoid:** graph-animate theater; quote subscribers/revenue; AIOS course as spec.
**When to change:** if you cannot follow the chain with your own eyes, the wiki failed *you*, not only the agent.

## E. Examples

**Situation:** Messy YouTube-transcript graph.  
**Action:** One emotional prompt → beginner HTML with click paths.  
**Reasoning:** Audience fear is overwhelm, not missing nodes.  
**Outcome:** He prefers it to the graph; Opus-all-day version unshared.  
**Lesson:** After-use is a taste brief on the same data. Implicit rule: graph ≠ insight.

**Situation:** System-card PDF + OpenAI Soul URL.  
**Action:** Drop PDF in raw; paste URL; ingest both under the schema.  
**Reasoning:** Cross-links are the earn.  
**Outcome:** 20 pages; Preview-vs-5 + harness mismatch flagged.  
**Lesson:** Wiki beats two summaries when sources talk about each other. Implicit rule: check that page; do not assume the agent is right.

**Situation:** Meetings vs YouTube.  
**Action:** Separate vaults; allow flat vs typed.  
**Reasoning:** Search and sense-making differ by corpus.  
**Outcome:** Herk brain flat; YouTube folded.  
**Lesson:** Do not clone a taxonomy. Implicit rule: structure follows data.

## F. Decision Rules

- If the job is ingest → cheap model + schema.
- If the job is audience/taste → separate prompt after routing exists.
- If two sources might cite each other → require a connecting page and a human check.
- If a batch looks wrong → change rules before adding more.
- If the front end is a graph animation → prefer a readable index.
- Optimize: findable relations, not node count.
- Refuse: Obsidian/Claude as OS; quote blurred $; new hunt.

## G. Contrarian

- Against “Fable ate my library” as the demo.
- Against one deep folder tree for every corpus.
- Against vector-only / raw-search as enough (`brB-hSiV2iU`).
- Against vendor lock because the files are markdown.
- Field assumes Obsidian graph = second brain. He shows HTML and flat meetings.

## H. Assumptions

**His:** Karpathy gist is a complete spec; 10–12 min / 20 pages is typical; Fable taste > Opus on the same DB; multi-wiki OS is the destination; Skool course converts.

**Ours:** Captions complete enough (3719 words). Times, page counts, subscriber/revenue/churn **UNVERIFIED** (revenue explicitly blurred). Domain-specific: his YouTube/meeting corpus. July 7 window dated.

**Falsifiers:** Connecting page is a hallucination. Flat wiki becomes unsearchable at his meeting volume. Beginner HTML still overwhelms (he is the only user).

**Disagreement (keep labeled):** Hive will not operate Obsidian + Claude wiki. The **schema + raw/wiki/index/log + check-the-batch + markdown portability** machine is still stolen — and already named `wiki-ingest`. **SYSTEM SYNTHESIS**

## I. Questions

- Who checks the cybersecurity connecting page besides him?
- How many videos are in the YouTube wiki? (Not counted.)
- What did the Opus UI actually look like? (Visual-only.)
- Sibling “levels of a second brain” id? Do not invent.

## J. Connections

- **SYSTEM SYNTHESIS** → `wiki-ingest` (raw → pages → index → log → lint).
- **SYSTEM SYNTHESIS** → `brB-hSiV2iU` (wiki as wrapper/moat).
- **SYSTEM SYNTHESIS** → `XTBWVVcF3Pk` / `dYrrEKXtttk` (Fable after, not for every ingest; Mythos card is a source).
- **SYSTEM SYNTHESIS** → `i4Q8wHZNPBU` (folder not graph — Serop from the kill-theater side).
- **SYSTEM SYNTHESIS** → `ZwQ8rJhVCr4` (order/relations vs chunk retrieval).
- **SYSTEM SYNTHESIS** → `golden-test-loop` (check the connecting page).
- Do not quote the 6-month funnel as our GTM.

## K. Future-Use

- Per-corpus wiki rules (meetings vs takes) as Librarian work (unassigned).
- Emotional-brief-after-ingest as Creative (unassigned; no publish).
- Harness-mismatch note as a Watchdog “do not line up the benches” card (unassigned).
- July-7 / restore language as dated-window (`dYrrEKXtttk`) (unassigned).

## Steal / Operate-never

### Machine: Schema + raw/wiki/index/log → check the batch → cheap ingest, expensive after-use
- **Epistemic:** SOURCE (demo) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** trigger (new corpus or two sources that might cite each other) → install/follow a schema (not a graph) → drop raw → ingest incremental (index+log) → open connecting pages and the folder shape → fix rules if you cannot follow the chain → only then run a taste/story prompt → files stay markdown so the vendor can leave → human ships nothing automatically (HITL).
- **Questions / signals:** “Did we write the log?” “Can I follow this with my eyes?” “Is this the Preview or the 5?” “Is Fable doing ingest or after-use?”
- **Qualify / frame / objections:** Wiki demo, not an Obsidian SKU. “5 minutes” / Fable 5 + Karpathy is the magnet. Objection: we need the graph — he prefers the beginner HTML.
- **Procedure:** D steps 1–7. Checkable stops: (1) schema exists, (2) raw/wiki/index/log, (3) connecting page human-checked, (4) ingest not billed as the frontier job, (5) $ blurred/UNVERIFIED.
- **Example that proves it:** PDF + URL → 20 pages → Preview-vs-5 harness miss. Lesson: the wiki earn is the relation two summaries drop.
- **Why it works:** Agents need a crawl map; humans need a chain that makes sense. Conditions: sources in raw; a schema that is actually followed. Exceptions: Fable taste may be prompt+edit; relations can be wrong; Obsidian is optional front end.
- **Conditions / exceptions:** Cursor + Grok only. Obsidian / Claude / Fable / Skool stay on tape. Clients parked. Tape $ / stats UNVERIFIED.
- **Operate-never payload:** Obsidian+Claude OS; quote revenue/subs; AIOS course; new hunt; graph theater.
- **Hive run (existing skills only):** `wiki-ingest` · `context-docs` · `golden-test-loop` · `slice-build` (one corpus) · `ask-principal` (publish of any HTML) · `XTBWVVcF3Pk` routing for ingest vs after-use.
- **Source:** `hQvwMj7IJe4` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Obsidian + Claude / Fable as hive OS · Skool AIOS course
- Quote blurred revenue · subscribers · churn · 10–12 min as FACT
- Graph-animate theater · new `icp_id` / unpark Normand
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md`

## L. Role-Specific Applications

I manage; I do not open a second-brain shop.

- **Done** on a wiki slice: schema + index/log + a human-checked connecting page. “Fable ingested YouTube” is not done. Graph animate is not done.
- **Delegate without being asked:** Librarian owns persist-and-provenance. Researcher checks the relation page. Forge lints structure-follows-data. Creative may take the beginner-brief *after* ingest. Publishing does not ship the HTML. Money Desk does not un-blur his revenue.
- **Skeptical review:** Outer Heaven already is markdown + routing. I will not add Obsidian because Karpathy’s gist used it as a front end.
- **One system this take:** one corpus wiki with a check-after-batch. Not a 6-month brand film.
- Live hunt stays parked.
