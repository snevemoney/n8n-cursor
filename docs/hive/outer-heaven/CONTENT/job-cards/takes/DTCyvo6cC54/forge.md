# Forge — DTCyvo6cC54
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/DTCyvo6cC54/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/DTCyvo6cC54/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate Herk **five levels of an AI second brain**. Job: save notes/meetings/ClickUp so **you and the agent can find it again**. Reverse-engineer from the future question (hoop before ball). Levels: (1) exact-word + `claude.md`/`agents.md` as **router** + folders; (2) topic pull / LLM Wiki + `memory.md` + auto-memory; (3) semantic/vector; (4) relationship graph; (5) always-on (Gbrain + Hermes). He sits **level 2** — no pain big enough to climb. Whole project need not be one level. Obsidian is a view, not the brain; he rarely opens it. Vector ≠ magic: March 5 meeting summary fails if you only retrieve 5 chunks; “highest sales week” can miss week 14/19. Wiki links ≠ graph (see-also vs endorsed-by). Grill Me (Matt Pocock, customized) to get knowledge *out of the head*. Edit insert: data to Anthropic is not private — local/OSS if client data. Context (evergreen OTAs/decisions) vs connections (Slack/email — don’t ingest; route out). Team problem is adoption, not Drive vs Notion. Caption-only. Claude / Codex / Hermes / Gbrain / Pinecone / Skool on-tape.

## B. Atomic Knowledge

### Lowest level that kills the pain; files are harness-agnostic
- **Claim:** Five is not best. If there’s no pain, don’t invent architecture. Same markdown works in Claude, Codex, Hermes — it’s folders.
- **Reasoning:** Climbing without pain creates more system than need.
- **Mechanism:** L1 exact find; L2 topic/wiki; L3 meaning search; L4 chain X→A; L5 autonomous ingest. Mix per folder.
- **Evidence:** Herc 2 lives at L2. LightRAG demo is his real graph (blurred) — he still doesn’t run it daily.
- **Conditions:** His work is project/content-heavy, not a fat CRM.
- **Exceptions:** Fat CRM/clients might justify L4.
- **Action:** Steal pain-gated levels + router md. Do not install Obsidian/Gbrain/Hermes/Pinecone as hive.
- **Confidence:** high.
- **Source:** `DTCyvo6cC54` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** none
- **Speech ≠ behavior:** opens with sexy graph visuals, then says he lives at L2 and barely opens Obsidian

### Router first; recall shape decides ingest shape
- **Claim:** `claude.md` is not only role — it is **where things live**. Agent will not search the whole repo (and you wouldn’t want the tokens). Duplicate as `agents.md` for Codex; point Codex at `memory.md`.
- **Reasoning:** Basketball: design the ball for the hoop. “Summarize March 5” wants a whole markdown; “what is rule 17 of 1000” wants a vector snippet.
- **Mechanism:** L1: context / decisions (append) / projects. L2: + wiki + references + memory. L3: one unit (e.g. YT transcripts) vectorized, rest still md. L4: entities + relations after Grill Me fills the hole.
- **Evidence:** Keyword “feedback” vs smart-lookup “feedback”; sales-table miss; wiki drill WAT → claude.md.
- **Conditions:** Auto-memory is Claude-specific — route it for other harnesses.
- **Exceptions:** Hybrid + rerank exist; he still says vector is not magic.
- **Action:** Steal recall-first ingest. Do not vector the whole hive. Do not send client data to Anthropic.
- **Confidence:** high.
- **Source:** `DTCyvo6cC54` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** none
- **Speech ≠ behavior:** none

### Evergreen in; noisy out; you control ingest
- **Claim:** Second brain = context + connections (from his 4 C’s). Ingest what you’ll still want in a year. Slack/email/customer chatter is noise — give the brain a **path** to ClickUp, don’t dump the stream. L5 always-on scares him (too much context).
- **Reasoning:** Retrieval failure is often empty/nuance-poor files, not a bad graph. Team sync fails on process owners, not the tool.
- **Mechanism:** Vague Q → OTA file → wiki/meetings → live ClickUp. Grill Me until it knows everything.
- **Evidence:** Q1/Q2 OTA folders; “John last week OTA 7” cascade.
- **Conditions:** He is comfortable sending business data to Anthropic; viewers may not be.
- **Exceptions:** Local/OSS if client-private.
- **Action:** Steal evergreen-vs-route-out. Do not auto-ingest Slack. Do not install Gbrain.
- **Confidence:** high.
- **Source:** `DTCyvo6cC54` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** none
- **Speech ≠ behavior:** none

## C. Mental Models
Moat is data/IP, but only if recall works. Sexy graphs sell the video; boring markdown runs the business. Wiki backlinks feel like a graph and aren’t. You are the ingest gate. Team = change management.

## D. Procedures
1. Do not install Claude, Codex, Hermes, Gbrain, Obsidian, Pinecone, LightRAG as hive defaults.
2. Do not send Skool. Do not dump client data to a vendor LLM.
3. Ask: can I find it? can the agent? If yes, stop climbing.
4. Write the future question first; choose md / wiki / vector / graph per folder.
5. Router file: who + where-things-live. Copy to `agents.md` if a second harness.
6. Decision log appends. Don’t re-explain.
7. If 30+ notes forgotten → wiki ingest. If routing whiffs on known notes → semantic. If you need endorsed-by chains → graph. If offline multi-agent sync → L5 (he doesn’t).
8. Grill before you blame retrieval.
9. Evergreen in; live systems stay linked, not ingested.
10. Personal OS first; team later.

## E. Examples
**Situation:** Find the ranking-features HTML deck without AI.  
**Action:** projects → YouTube → May 30 folder → deck.  
**Reasoning:** Drill-downs he understands.  
**Outcome:** Human and agent can follow the same path.  
**Lesson:** Routing that a human can walk is routing an agent can walk.

**Situation:** “Summarize March 5 meeting” on chunks.  
**Action:** Vector pulls similar-to-query slices.  
**Reasoning:** Summary needs the whole tape.  
**Outcome:** Incomplete even on “right” chunks.  
**Lesson:** Use-case decides store. Whole-file md for summaries.

**Situation:** Highest-sales week.  
**Action:** Retrieve a gray chunk; week 6 looks max.  
**Reasoning:** Chunk ≠ table.  
**Outcome:** Misses week 14/19.  
**Lesson:** Aggregates need full context.

**Situation:** Herc 2 wiki vs LightRAG.  
**Action:** Lives on wiki; graph is a demo.  
**Reasoning:** No CRM-shaped pain.  
**Outcome:** See-also is enough.  
**Lesson:** Don’t buy L4 for the thumbnail.

## F. Decision Rules
- IF no pain → stay.
- IF agent asks for info that already lives in the repo → fix the router, don’t paste again.
- IF question needs a whole artifact → markdown, not chunks.
- IF question needs one needle in a haystack → vector.
- IF question is “how is X related to A” → graph (maybe).
- IF data dies next week → don’t ingest; give a fetch path.
- IF client-private → not a hosted Claude brain.
- IF team isn’t updating docs → that’s the problem, not GitHub vs Notion.

## G. Contrarian
Field sells knowledge graphs and always-on brains. He runs L2 and calls Obsidian optional eye candy. Field blames retrieval; he blames empty heads/folders. Field wants one architecture; he mixes levels per folder.

## H. Assumptions
Claude-centric filenames. Grill Me / Gbrain / LightRAG on-tape only. Privacy insert is real. Falsifier: hive already has a graph that earns its keep. Clients parked.

## I. Questions
Which hive folders are L1 vs L2 today? What is evergreen vs route-out in Outer Heaven? Do we ever need L3 for transcripts only?

## J. Connections
SYSTEM SYNTHESIS: `Ek1NBfnnTH0` claude.md router + context poison. `0WDkwMxj13s` Four C’s. `ZRb7D6R64hM` project-first. Hive already has packets/takes — don’t invent LightRAG. Cursor + Grok.

## K. Future-Use
Pain-gated levels. Router md. Recall-shaped ingest. Evergreen vs fetch. Grill before graph. No Gbrain.

## Steal / Operate-never

### Machine: future-question → lowest level → router md; evergreen in, live systems linked
- **Epistemic:** SOURCE
- **Workflow / loop:** name the recall question → pick L1–L4 per folder → write where-things-live → ingest only year-durable facts → on miss, cascade file→wiki→live tool
- **Questions / signals:** Can we find it twice? Is this pain or thumbnail-envy? Whole artifact or needle? Dies next week?
- **Qualify / frame / objections:** Wiki ≠ graph. Vector ≠ magic. L5 can add damage.
- **Procedure:** No vendor brain install. No client dump to Anthropic. No Skool. No team-OS until personal OS works.
- **Example that proves it:** Herc 2 at L2; March 5 chunk-fail; sales-week miss; Grill Me for empty graphs.
- **Why it works:** Routing + honest store beat a prettier map.
- **Conditions / exceptions:** CRM-heavy orgs may need L4. Privacy may force local.
- **Operate-never payload:** Obsidian/Gbrain/Hermes/Pinecone/LightRAG as hive; Claude as the only brain; auto-ingest Slack; Skool.
- **Hive run:** none. Cursor + Grok.
- **Source:** `DTCyvo6cC54` @ UNKNOWN

### Operate-never
- Do not install Claude, Codex, Hermes, Gbrain, Obsidian, Pinecone, LightRAG as hive.
- Do not send client data to a hosted LLM.
- Do not climb to a graph because the thumbnail was pretty.
- Do not send Skool.
- Clients parked.

## L. Role-Specific Applications
Forge already sits near L2 (packets + takes + router skills). Steal **pain-gate**, **recall-first store**, **evergreen vs fetch**. Do not stand up LightRAG or Gbrain. Do not merge LESSONS. Cursor + Grok.
