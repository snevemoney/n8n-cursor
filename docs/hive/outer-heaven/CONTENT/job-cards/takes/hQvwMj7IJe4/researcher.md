# Researcher — hQvwMj7IJe4
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/hQvwMj7IJe4/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/hQvwMj7IJe4/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Caption-only (`full.txt`, ~3719 words). Title: Fable 5 + Karpathy’s LLM Wiki is basically cheating. Visual/click **UNKNOWN** (Obsidian graph, HTML resource, 2026 journey). Timestamp **UNKNOWN**. Beats: (1) YouTube videos ingested into an LLM wiki; relations drawn **by the agent**, not by him. Open a video note → summary/takeaways/tools/techniques → follow GitHub → Vercel → Claude Code. “5 minutes” setup claim. Impressive part is **what Fable does after** the data, not the ingest. (2) One emotional prompt: messy blob → beginner-clickable HTML of how tools/techniques connect. Opus 4.8 “doesn’t understand” that emotion as well; same backend DB, Opus took ~a day, felt overwhelming — he didn’t ship it. Fable version simpler (search tools/techniques/videos; right-rail sources). (3) Multiple wikis in AI OS: YouTube transcripts (nested: comparisons/concepts/sources/techniques/tools) vs **Herc brain** meetings (often **flat** — easier to search). Before this video: “story of the last 6 months” one-shot — photo, logo, AIS branding, subs, **highest revenue month blurred**, n8n→Claude-Code pivot, views/revenue/churn/conversion, funnel map. Point: more data + **routing**. Free AIOS course Skool. (4) Origin: Karpathy “LLM knowledge bases” + Obsidian front end. Install Obsidian; new vault (he usually drops vaults **inside** Herc 2). Open vault in VS Code/Claude. Fable promo to **July 7** then credits; Thor tweet + blog: plan to return to subscription — dated UNVERIFIED. Copy **entire Karpathy gist**; screenshot; “you are my LLM wiki agent… implement this exact idea… CLAUDE.md schema, index, log, folder conventions, first ingest; every interaction follows the schema.” Fable overkill for ingest — **Opus for ingest, Fable after** is “probably a better call.” (5) Structure: `raw/` (you drop) → agent splits into wiki pages; `index/` TOC; `log/` batch history; wiki pages + backlinks. Structure **differs by corpus** (YouTube nested vs meetings flat). Agent uses index/log/backlinks to crawl without wasting tokens. (6) Demo ingest: Fable/Mythos **system card PDF** into raw + OpenAI GPT-5.6 Soul **URL**. ~**10–12 min**, **20** wiki pages, cross-linked. Worth-it connection: both mention frontier cyber; OpenAI bench vs **Mythos Preview / April predecessor**, different harnesses — **numbers don’t line up**. Entities: Fable, Mythos, Opus 4.8, GPT-5.6, labs. (7) After structure: add sources, **read as a human**, fix folders/rules if a batch is ugly. Markdown = portable (Hermes/Codex on-tape). Second-brain levels video CTA. Do **not** flatten vs `i4Q8wHZNPBU` (anti-Obsidian-OS) or `brB-hSiV2iU` (wiki as Anthropic clue). Revenue/subs UNVERIFIED. No new `icp_id`.

## B. Atomic Knowledge

### Raw → wiki + index + log + schema
- **Claim:** Drop sources in `raw/`; agent ingests to wiki pages with backlinks; index is TOC; log is the ingest history; CLAUDE.md is the router/schema. Karpathy gist is the spec he pastes wholesale.
- **Reasoning:** Data is only useful if the agent knows how to find it.
- **Mechanism:** Incremental maintain; crawl index/log/links instead of dumping the corpus.
- **Evidence:** “everything in this wiki, it’s just a markdown file… with routing.”
- **Conditions:** Obsidian as viewer, Claude as agent. “5 minutes” is setup, not a filled wiki.
- **Exceptions:** Structure is corpus-specific (flat vs nested). Serop anti-OS (`i4Q8wHZNPBU`).
- **Action:** Steal the four-folder + schema. Hive: `wiki-ingest` / `context-docs`. No Obsidian-as-religion.
- **Confidence:** high as SOP.
- **Source:** `hQvwMj7IJe4` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** Opus UI he rejected
- **Speech ≠ behavior:** none.

### Ingest cheap, reason expensive; emotional “beginner” is a spec
- **Claim:** Don’t use Fable to ingest. Use it after the wiki exists. “Beginner, not overwhelming” is a spec Opus missed in a day and Fable hit in one prompt — same data.
- **Reasoning:** Context is king; the model’s taste/emotion-following differs.
- **Mechanism:** Same DB, two UIs; he ships the simpler.
- **Evidence:** “you probably don’t need Fable… better call… Opus… ingest.”
- **Conditions:** July 7 Fable window. Dated.
- **Exceptions:** `vcU85OrwuV0` Fable 5–15%. Same family.
- **Action:** Steal ingest-vs-reason model split + emotional-as-spec. No Fable spend.
- **Confidence:** high as his split.
- **Source:** `hQvwMj7IJe4` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** Opus day-long UI
- **Speech ≠ behavior:** none.

### Cross-source ingest surfaces mismatches you’d miss separately
- **Claim:** Two sources → 20 pages; the win was a **relation**: Soul vs Mythos Preview / different harnesses, so benches don’t line up.
- **Reasoning:** Wiki > two summaries because it can flag incommensurable numbers.
- **Mechanism:** Entities + topics + backlinks.
- **Evidence:** “the connection that made this worth having as a wiki instead of two separate summaries.”
- **Conditions:** 10–12 min, 20 pages UNVERIFIED.
- **Exceptions:** Batch ingest can organize badly — he says read and fix rules.
- **Action:** Steal “ingest pairs that mention each other.” `info-gain-cite`.
- **Confidence:** high as the lesson he names.
- **Source:** `hQvwMj7IJe4` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** unobserved
- **Speech ≠ behavior:** none.

### Human-readable is a requirement, not a nice-to-have
- **Claim:** You should be able to click the chain yourself. If a batch’s folders feel wrong, change ingest rules. Flat can beat nested for search.
- **Reasoning:** AI-only maze fails both of you.
- **Mechanism:** Meetings wiki stayed flat on purpose.
- **Evidence:** “make it make sense. Not only to the AI, but… to you.”
- **Conditions:** Multiple vaults inside one OS (his Herc 2).
- **Exceptions:** Anti-OS tape. Hermes/Codex portability is on-tape, not hive stack.
- **Action:** Steal human-walk + per-corpus rules. No AIOS course install.
- **Confidence:** high as rule.
- **Source:** `hQvwMj7IJe4` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** unobserved
- **Speech ≠ behavior:** none.

## C. Mental Models
Wiki is routing over markdown, not a vendor. Fable is the after-brain. Emotion is a UI spec. Relations beat isolated summaries. One OS, many wikis, different shapes. Blurred revenue is still a flex — UNVERIFIED. Portable md = anti-lock-in (he says) while selling an OS (tension with `i4Q8wHZNPBU`).

## D. Procedures
1. Vault (Obsidian optional as viewer).
2. Paste Karpathy gist + “implement schema, index, log, conventions.”
3. Drop files/URLs in `raw/` or “read this URL and ingest.”
4. Check index + log + a human walk of backlinks.
5. If folders are wrong → change rules, don’t only regenerate UI.
6. Ingest on a cheap model; heavy reason after.
7. Pair sources that might cite each other.
8. Hive: `wiki-ingest`; no Skool AIOS; no Fable; no new ICP.

## E. Examples
- **Situation:** YouTube corpus. **Action:** Nested wiki + graph. **Outcome:** Click GitHub→Vercel→Claude. **Lesson:** Agent-drawn relations.
- **Situation:** Same data, Opus vs Fable UI. **Action:** Emotional beginner spec. **Outcome:** He ships Fable HTML, bins Opus day. **Lesson:** Spec + model taste.
- **Situation:** System card + Soul article. **Action:** Dual ingest. **Outcome:** 20 pages + harness-mismatch flag. **Lesson:** Wiki earns its keep on the join.

## F. Decision Rules
- IF ingesting → cheaper model.
- IF asking for a human interface → write the emotion/beginner constraint.
- IF two sources share entities → ingest together.
- IF you can’t walk it → fix rules.
- IF meetings vs videos → allow different folder laws.
- Refuse: quote revenue/subs as FACT; Claude/Obsidian lock-in; new ICP; Hermes install.

## G. Contrarian
The magic isn’t Fable ingest (he says don’t). Flat can beat taxonomy. Markdown portability vs “build your AIOS” CTA. Serop would reject the OS frame.

## H. Assumptions
5 min, 10–12 min, 20 pages, July 7, blurred $ = **UNVERIFIED**. Caption-only graph.
**Desk dissent:** Learn wiki shape. Do not stand up Herc-2. Keep `i4Q8wHZNPBU` unflattened.

## I. Questions
- Gist URL version?
- Second-brain “levels” tape id?
- Did he ever flatten the YouTube wiki after it nested too hard?

## J. Connections
- **SYSTEM SYNTHESIS:** `brB-hSiV2iU` (why wiki) · `i4Q8wHZNPBU` (anti-OS) · `c0kaKxM2pHg` (Nate OS) · `J_jswzXhYJA` / `ONmaDdOBGig` (Soul). Skills: `wiki-ingest` · `context-docs` · `info-gain-cite`.

## K. Future-Use
Four-folder schema. Ingest-cheap / reason-dear. Pair-ingest for mismatches. Human-walk test. Per-corpus flat vs nest.

## Steal / Operate-never

### Machine: raw-wiki-index-log
- **Epistemic:** SOURCE
- **Workflow / loop:** gist/schema → raw drop → ingest (cheap model) → index/log/backlinks → human walk → fix rules → reason (dear model) on the wiki, not the blob
- **Questions / signals:** Can I click it? Did two sources disagree on a bench? Flat or nested for this corpus?
- **Qualify / frame / objections:** 5 minutes is empty vault, not a brain. Fable is after, not during.
- **Procedure:** D.
- **Example that proves it:** Soul vs Mythos harness mismatch; Opus UI rejected; 6-month story one-shot ($, UNVERIFIED).
- **Why it works:** Routing + relations beat a pile of transcripts; human-walk keeps it honest.
- **Conditions / exceptions:** Anti-OS tape. $ / times UNVERIFIED.
- **Operate-never payload:** Skool AIOS; Fable spend; quote revenue as FACT; new ICP; Hermes; treat Obsidian as required.
- **Hive run (existing skills only):** `wiki-ingest` · `context-docs` · `info-gain-cite`
- **Source:** `hQvwMj7IJe4` @ UNKNOWN

**Operate-never**
- Install his AIOS. Quote tape $ as FACT. New `icp_id`. Send / pay / deploy.

## L. Role-Specific Applications
This is the how-to sibling of `brB-hSiV2iU`. Store raw/wiki/index/log. Do not merge with Serop’s anti-OS into one “second brain” verdict.
